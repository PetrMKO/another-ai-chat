import uuid
from pydantic import BaseModel
from typing import Optional

class UpdateUserSettings(BaseModel):
    system_msg: str
    msg_count: int

    model_config = {
        "from_attributes": True
    }


class User(BaseModel):
    id: uuid.UUID
    config_id: Optional[uuid.UUID]
    system_msg: str
    msg_count: int
    
    model_config = {
        "from_attributes": True
    }

