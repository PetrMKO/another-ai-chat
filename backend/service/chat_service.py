import uuid

from utils.logger import logger

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from db import Chat, Message, MessageRole, User, Config, ConfigType
from dto import MessageResponse, GenerateMessage, Config as ConfigDTO, Message as MessageDTO, GenerateResponse
from typing import List, Dict
from fastapi import HTTPException
from openai import OpenAI
from configuration.database import qdrant
from settings import COLLECTION_NAME, TOP_K, RAG_CONTEXT_ADDITION

from datetime import datetime, timezone

class ChatService:

    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_chat_messages(self, chat_id) -> List[MessageResponse]:
        result = await self.__db.execute(
            select(Message.id,
            Message.content,
            Message.created_at,
            MessageRole.name.label('role'))
            .join(MessageRole, Message.role_id == MessageRole.id)
            .filter(Message.chat_id == chat_id)
            .order_by(Message.created_at.asc())
        )

        messages = result.mappings().all()
        return [MessageResponse.model_validate(message) for message in messages]

    async def create_chat(self, user_id: uuid.UUID) -> Chat:
        new_chat = Chat(user_id=user_id)
        self.__db.add(new_chat)
        await self.__db.commit()
        await self.__db.refresh(new_chat)

        return new_chat

    async def get_message_from_service(self, chat_id: uuid.UUID, message_content: str) -> GenerateMessage:
        # Получаем user_id из чата
        user_id_result = await self.__db.execute(
            select(Chat.user_id)
            .filter(Chat.id == chat_id)
        )

        user_id = user_id_result.scalar_one_or_none()
        if not user_id:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Получаем информацию о пользователе
        user_result = await self.__db.execute(
            select(User)
            .filter(User.id == user_id)
        )

        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.config_id:
            raise HTTPException(status_code=404, detail="User does not have an active config")

        roles = await self.__get_roles_dict()

        system_role_id = roles['system']

        if not system_role_id:
            raise HTTPException(status_code=404, detail="System role not found")

        system_message = GenerateMessage(role='system', content=user.system_msg)

        config_result = await self.__db.execute(
            select(Config)
            .filter(Config.id == user.config_id)
        )
        config = config_result.scalar_one_or_none()

        if not config:
            raise HTTPException(status_code=404, detail="Config not found")

        # Получаем тип конфигурации
        config_type_result = await self.__db.execute(
            select(ConfigType.name)
            .join(Config, Config.type_id == ConfigType.id)
            .filter(Config.id == user.config_id)
        )

        config_type_name = config_type_result.scalar_one_or_none()

        client = OpenAI(
            api_key=config.api_key,
            base_url=config.url,
        )

        logger.info(f'Config url: {config.url}, model: {config.llm_name}')

        if config_type_name == 'vsegpt' and user.rag_id is not None:
            system_message.content += RAG_CONTEXT_ADDITION
            system_message.content += await self.get_rag_context(rag_id=user.rag_id, text=message_content, openai_client=client)

        context_messages = [system_message]

        # Последние сообщения
        last_messages_result = await self.__db.execute(
            select(Message.content, MessageRole.name.label('role'))
            .join(MessageRole, Message.role_id == MessageRole.id)
            .where(Message.chat_id == chat_id)  # если фильтруешь по чату
            .order_by(Message.created_at.desc())  # сортировка от новых к старым
            .limit(user.msg_count)
        )

        last_messages = reversed(last_messages_result.mappings().all())

        # Формируем контекст сообщений
        context_messages.extend([
            GenerateMessage(role= msg['role'], content=msg['content'])
            for msg in last_messages
        ])

        logger.info(f'Total messages: {context_messages}')

        response_big = client.chat.completions.create(
            model=config.llm_name,
            messages=context_messages,
        )

        response = response_big.choices[0].message

        return GenerateMessage(content=response.content, role=response.role)

    async def __get_roles_dict(self) -> Dict[str, uuid.UUID]:
        role_result = await self.__db.execute(
            select(MessageRole.name, MessageRole.id))

        rows = role_result.mappings().all()
        return {row["name"]: row["id"] for row in rows}


    async def add_new_message(self, chat_id: uuid.UUID, message: GenerateMessage) -> MessageDTO:
        roles_dict = await self.__get_roles_dict()

        new_message = Message(
            chat_id=chat_id,
            role_id=roles_dict[message.role],
            content=message.content,
        )

        self.__db.add(new_message)
        await self.__db.commit()
        await self.__db.refresh(new_message)

        return MessageDTO.model_validate(new_message)

    async def message_dto_to_message_response(self, dto: MessageDTO) -> MessageResponse:
        roles_dict = await self.__get_roles_dict()

        reversed_roles_dict = {value: key for key, value in roles_dict.items()}

        if not reversed_roles_dict[dto.role_id]:
            raise HTTPException(status_code=404, detail="Role not found")

        return MessageResponse(
            id=dto.id,
            role=reversed_roles_dict[dto.role_id],
            content=dto.content,
            created_at=dto.created_at,
        )

    async def generate(self, chat_id: uuid.UUID, message: GenerateMessage) -> GenerateResponse:
        user_message = await self.add_new_message(chat_id, message)

        assistant_response = await self.get_message_from_service(chat_id, message.content)

        assistant_message = await self.add_new_message(chat_id, assistant_response)

        return GenerateResponse(
            userMessage = await self.message_dto_to_message_response(user_message),
            assistantMessage = await self.message_dto_to_message_response(assistant_message)
        )

    async def get_rag_context(self, rag_id: uuid.UUID, text: str, openai_client: OpenAI):
        try:
            embedding_response = openai_client.embeddings.create(
                input=[text],
                model="text-embedding-3-small"
            )
            query_vector = embedding_response.data[0].embedding

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Embedding failed: {e}")

        rag_filter = Filter(
                must=[
                    FieldCondition(
                        key="rag_id",
                        match=MatchValue(value=str(rag_id)),
                    )
                ]
            )

        search_result = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            limit=TOP_K,
            with_payload=True,
            query_filter=rag_filter
        )

        return '\n--\n'.join([hit.payload["text"] for hit in search_result])