from typing import List, Optional
from pydantic import BaseModel
from dto import Chat, Config, User

class UserInfo(BaseModel):
    chats: List[Chat]
    config: Optional[Config]
    user: User
    model_config = {
        "from_attributes": True
    }