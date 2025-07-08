import uuid
from typing import Optional

from fastapi import APIRouter, Depends

from dto import UserInfo, UpdateUserSettings, User
from configuration.deps import get_user_service
from service import UserService

router = APIRouter(prefix="/user", tags=["User methods"])


@router.post("/register", response_model=UserInfo)
async def register_user(user_service: UserService = Depends(get_user_service)) -> UserInfo:
    return await user_service.register_user()


@router.get("/{user_id}", response_model=Optional[UserInfo])
async def get_user_info(user_id: uuid.UUID, user_service: UserService = Depends(get_user_service)):
    user_data = await user_service.get_user_info(user_id)
    return user_data

@router.put("/updateSettings/{user_id}", response_model=User)
async def get_user_info(user_id: uuid.UUID, user_settings: UpdateUserSettings, user_service: UserService = Depends(get_user_service)):
    user_data = await user_service.update_user_info(user_id, user_settings)
    return user_data