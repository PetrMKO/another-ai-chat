import uuid
from sqlalchemy import Column, ForeignKey, String, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from configuration.database import Base
from sqlalchemy.orm import relationship, foreign


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    system_msg = Column(Text, nullable=False)
    msg_count = Column(Integer, nullable=False)
    rag_id = Column(UUID(as_uuid=True), ForeignKey("rag.id"), nullable=True)
    config_id = Column(UUID(as_uuid=True), ForeignKey("configs.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    active_config = relationship(
        "Config",
        uselist=False,
        foreign_keys=[config_id]
    )

    configs = relationship(
        "Config",
        back_populates="owner",
        foreign_keys="[Config.user_id]"
    )

    chats = relationship("Chat", back_populates="user")
    
    rag = relationship("Rag", back_populates="users", uselist=False)