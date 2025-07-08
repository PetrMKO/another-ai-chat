import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from configuration.database import Base

class MessageRole(Base):
    __tablename__ = "message_roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
