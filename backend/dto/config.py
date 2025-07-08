import uuid
from pydantic import BaseModel
from typing import Optional, List

class ConfigCreate(BaseModel):
    user_id: uuid.UUID
    type_id: uuid.UUID
    url: Optional[str] = None
    api_key: Optional[str] = None
    llm_name: Optional[str] = None

class ConfigUpdate(BaseModel):
    url: Optional[str] = None
    api_key: Optional[str] = None
    llm_name: Optional[str] = None

class Config(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    type_id: uuid.UUID
    url: str
    api_key: Optional[str] = None
    llm_name: Optional[str] = None
    
    model_config = {
        "from_attributes": True
    }