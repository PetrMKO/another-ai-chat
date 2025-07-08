from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from configuration.database import SessionLocal
from service.chat_service import ChatService
from service.rag_service import RagService
from service.user_service import UserService
from service.config_service import ConfigService

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session

async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)

async def get_config_service(db: AsyncSession = Depends(get_db)) -> ConfigService:
    return ConfigService(db)

async def get_chat_service(db: AsyncSession = Depends(get_db)) -> ChatService:
    return ChatService(db)

async def get_rag_service(db: AsyncSession = Depends(get_db)) -> RagService:
    return RagService(db)
