import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from db import User, Chat, Config
from dto import UserInfo, User as UserDTO, UpdateUserSettings, Chat as ChatDTO
from constants import default_system_msg, default_msg_count


class UserService:
    def __init__(self, db: AsyncSession):
        self.__db = db

    async def register_user(self) -> UserInfo:
        new_user = User(
            system_msg=default_system_msg,
            msg_count=default_msg_count
        )

        self.__db.add(new_user)
        await self.__db.commit()
        await self.__db.refresh(new_user)

        user_info = UserInfo(
            chats=[],
            config=None,
            user=UserDTO.model_validate(new_user)
        )

        return user_info

    async def get_user_info(self, user_id: uuid.UUID) -> UserInfo:
        result = await self.__db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Получаем чаты
        chats_result = await self.__db.execute(select(Chat).filter(Chat.user_id == user_id))
        chats = chats_result.scalars().all()

        selected_config = None
        if user.config_id:
            configs_result = await self.__db.execute(
                select(Config)
                .where(Config.id == user.config_id)
                .options(joinedload(Config.type))
            )
            selected_config = configs_result.scalar_one_or_none()

            
        user_info = UserInfo(
            chats=[ChatDTO.model_validate(chat) for chat in chats],
            config=selected_config,
            user=UserDTO.model_validate(user)
        )

        return user_info

    async def update_user_info(self, user_id: uuid.UUID, user_update_info: UpdateUserSettings):
        result = await self.__db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for field, value in user_update_info.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        await self.__db.commit()
        await self.__db.refresh(user)

        return UserDTO.model_validate(user)