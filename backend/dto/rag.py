import uuid

from pydantic import BaseModel

class Rag(BaseModel):
    id: uuid.UUID
    file_name: str
    model_config = {
        "from_attributes": True
    }