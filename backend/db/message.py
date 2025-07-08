import uuid
from sqlalchemy import Column, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from configuration.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.id"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("message_roles.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    chat = relationship("Chat", back_populates="messages")
    role = relationship("MessageRole")