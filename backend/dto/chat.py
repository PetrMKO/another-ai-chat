import uuid
from pydantic import BaseModel
from datetime import datetime

class Chat(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

