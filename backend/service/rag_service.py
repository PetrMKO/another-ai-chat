import uuid
from utils.logger import logger
from fastapi import File, UploadFile
from openai import OpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from db import User, Config, ConfigType, Rag
from fastapi import HTTPException
from settings import CHUNK_SIZE, CHUNK_OVERLAP
from configuration.database import qdrant
from qdrant_client.models import PointStruct
from qdrant_client.http.models import Filter, FieldCondition, MatchValue, FilterSelector
from dto import Rag as RagDTO
from typing import Optional

from settings import COLLECTION_NAME

def create_overlapping_chunks(text: str, chunk_size: int, overlap: int) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(text):
            break
        start += chunk_size - overlap
    return chunks


class RagService:
    def __init__(self, db: AsyncSession):
        self.__db = db

    async def upload_file(self, user_id: uuid.UUID, file: UploadFile = File(...)) -> RagDTO:
        try:
            logger.info(f"Starting file upload for user {user_id}")
            
            # Проверяем пользователя
            user_result = await self.__db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if not file.filename.endswith(".txt"):
                raise HTTPException(status_code=400, detail="Only .txt files are allowed.")

            logger.info(f"Reading file {file.filename}")
            contents = await file.read()
            text = contents.decode("utf-8")

            chunks = create_overlapping_chunks(text, CHUNK_SIZE, CHUNK_OVERLAP)
            logger.info(f"Created {len(chunks)} chunks from the file")

            configs_result = await self.__db.execute(
                select(Config)
                .join(ConfigType, Config.type_id == ConfigType.id)
                .where(
                    Config.user_id == user_id,
                    ConfigType.name == 'vsegpt'
                )
            )

            vsegpt_config = configs_result.scalar_one_or_none()
            if not vsegpt_config:
                raise HTTPException(status_code=404, detail="vsegpt config not found")

            logger.info("Creating OpenAI client")
            openai_client = OpenAI(
                api_key=vsegpt_config.api_key,
                base_url=vsegpt_config.url,
            )

            logger.info("Generating embeddings")
            try:
                response = openai_client.embeddings.create(
                    input=chunks,
                    model="text-embedding-3-small"
                )
                embeddings = [e.embedding for e in response.data]
                logger.info(f"Generated {len(embeddings)} embeddings")
            except Exception as e:
                logger.error(f"Embedding generation failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

            # Создаем новый RAG объект
            new_rag = Rag(file_name=file.filename)
            self.__db.add(new_rag)
            await self.__db.commit()
            await self.__db.refresh(new_rag)
            logger.info(f"Created new RAG record with ID {new_rag.id}")

            # Создаем точки для Qdrant
            points = [
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={"text": chunk, "user_id": str(user_id), "rag_id": str(new_rag.id)}
                )
                for chunk, embedding in zip(chunks, embeddings)
            ]

            logger.info(f"Upserting {len(points)} points to Qdrant")
            try:
                qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
            except Exception as e:
                logger.error(f"Qdrant upsert failed: {str(e)}")
                # Откатываем создание RAG записи
                await self.__db.rollback()
                await self.delete_file(new_rag.id)
                raise HTTPException(status_code=500, detail=f"Failed to store vectors: {str(e)}")

            # Удаляем старый RAG, если есть
            if user.rag_id:
                logger.info(f"Deleting old RAG with ID {user.rag_id}")
                await self.delete_file(user.rag_id)

            # Обновляем ссылку на RAG у пользователя
            user.rag_id = new_rag.id
            await self.__db.commit()
            logger.info("File upload completed successfully")
            return RagDTO.model_validate(new_rag)

        except Exception as e:
            logger.error(f"Unexpected error during file upload: {str(e)}")
            await self.__db.rollback()
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    async def delete_file(self, rag_id) -> None:
        try:
            logger.info(f"Deleting RAG with ID {rag_id}")
            await self.__db.execute(delete(Rag).where(Rag.id == rag_id))
            await self.__db.commit()

            filter_condition = Filter(
                must=[
                    FieldCondition(
                        key="rag_id",
                        match=MatchValue(value=str(rag_id)),
                    )
                ]
            )

            qdrant.delete(
                collection_name=COLLECTION_NAME,
                points_selector=FilterSelector(
                    filter=filter_condition
                )
            )
            logger.info(f"Successfully deleted RAG {rag_id} and its vectors")
        except Exception as e:
            logger.error(f"Error deleting RAG {rag_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

    async def get_file_by_user_id(self, user_id: uuid.UUID) -> Optional[RagDTO]:
        user_result = await self.__db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.rag_id:
            return None

        rag_result = await self.__db.execute(select(Rag).where(Rag.id == user.rag_id))
        rag = rag_result.scalar_one_or_none()

        return RagDTO.model_validate(rag)

