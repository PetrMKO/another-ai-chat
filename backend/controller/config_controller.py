import uuid
from typing import List

from fastapi import APIRouter, Depends

from dto import Config, ConfigType, ConfigCreate, ConfigUpdate
from configuration.deps import get_config_service
from service import ConfigService

router = APIRouter(prefix="/config", tags=["User methods"])

@router.get("/getByUserId/{user_id}", response_model=List[Config])
async def get_user_info(user_id: uuid.UUID, config_service: ConfigService = Depends(get_config_service)):
    configs = await config_service.get_user_configs(user_id)
    return configs

@router.get("/getTypes", response_model=List[ConfigType])
async def get_config_types(config_service: ConfigService = Depends(get_config_service)):
    types = await config_service.get_config_types()
    return types

@router.post("/create", response_model=Config)
async def create_config(config: ConfigCreate, config_service: ConfigService = Depends(get_config_service)):
    return await config_service.create_config(
        user_id=config.user_id,
        type_id=config.type_id,
        url=config.url,
        api_key=config.api_key,
        llm_name=config.llm_name
    )

@router.put("/update/{config_id}", response_model=Config)
async def update_config(config_id: uuid.UUID, config: ConfigUpdate, config_service: ConfigService = Depends(get_config_service)):
    return await config_service.update_config(config_id, config)
