import uuid
from pydantic import BaseModel

class MessageRole(BaseModel):
    id: uuid.UUID
    name: str
    
    model_config = {
        "from_attributes": True
    }
