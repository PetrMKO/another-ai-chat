import uuid
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db import Config, ConfigType, User
from dto import Config as ConfigDTO, ConfigType as ConfigTypeDTO, ConfigUpdate

class ConfigService:
    def __init__(self, db: AsyncSession):
        self.__db = db

    async def get_config_types(self) -> List[ConfigTypeDTO]:
        result = await self.__db.execute(select(ConfigType))
        types = result.scalars().all()
        return [ConfigTypeDTO.model_validate(type_) for type_ in types]

    async def get_user_configs(self, user_id: uuid.UUID) -> List[ConfigDTO]:
        result = await self.__db.execute(
            select(Config)
            .where(Config.user_id == user_id)
        )
        configs = result.scalars().all()
        
        if not configs:
            return []
            
        return [ConfigDTO.model_validate(config) for config in configs]


    async def update_last_used_config(self, config_id: uuid.UUID, user_id: uuid.UUID) -> None:
        # Находим конфиг и проверяем, что он принадлежит пользователю
        result = await self.__db.execute(
            select(Config).where(
                (Config.id == config_id) & 
                (Config.user_id == user_id)
            )
        )
        config = result.scalar_one_or_none()
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found or doesn't belong to user")
        
        # Находим пользователя
        result = await self.__db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Обновляем config_id у пользователя
        user.config_id = config_id
        await self.__db.commit()

    async def update_config(
        self,
        config_id: uuid.UUID,
        config_update: ConfigUpdate
    ) -> ConfigDTO:
        result = await self.__db.execute(
            select(Config).where(Config.id == config_id)
        )
        config = result.scalar_one_or_none()
        
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
            
        # Обновляем только переданные поля
        for field, value in config_update.model_dump(exclude_unset=True).items():
            setattr(config, field, value)
            
        await self.__db.commit()
        await self.__db.refresh(config)
        
        # Обновляем последний использованный конфиг
        await self.update_last_used_config(config.id, config.user_id)
        
        return ConfigDTO.model_validate(config)

    async def create_config(
        self,
        user_id: uuid.UUID,
        type_id: uuid.UUID,
        url: Optional[str] = None,
        api_key: Optional[str] = None,
        llm_name: Optional[str] = None
    ) -> ConfigDTO:
        result = await self.__db.execute(
            select(ConfigType)
            .where(ConfigType.id == type_id)
        )
        config_type = result.scalar_one_or_none()
        
        if not config_type:
            raise HTTPException(status_code=404, detail="Configuration type not found")

        if config_type.name == "x5_copilot":
            new_config = Config(
                user_id=user_id,
                type_id=type_id,
                url='https://api-copilot.x5.ru/openai-proxy/v1',
                api_key=api_key,
                llm_name=llm_name
            )
        
        elif config_type.name == "vsegpt":
            new_config = Config(
                user_id=user_id,
                type_id=type_id,
                url="https://api.vsegpt.ru/v1",
                api_key=api_key,
                llm_name=llm_name
            )
        elif config_type.name == "own":
            new_config = Config(
                user_id=user_id,
                type_id=type_id,
                url=url,
                api_key=api_key,
                llm_name=llm_name
            )
        else:
            raise HTTPException(status_code=404, detail="Configuration type not found") 

        self.__db.add(new_config)
        await self.__db.commit()
        await self.__db.refresh(new_config)
        
        # Обновляем последний использованный конфиг
        await self.update_last_used_config(new_config.id, user_id)
        
        return ConfigDTO.model_validate(new_config)