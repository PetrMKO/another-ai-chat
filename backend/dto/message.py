import uuid
from pydantic import BaseModel
from datetime import datetime



class GenerateMessage(BaseModel):
    role: str
    content: str

class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class GenerateResponse(BaseModel):
    userMessage: MessageResponse
    assistantMessage: MessageResponse

class Message(BaseModel):
    id: uuid.UUID
    chat_id: uuid.UUID
    role_id: uuid.UUID
    content: str
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

