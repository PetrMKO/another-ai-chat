import uuid
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from configuration.database import Base
from sqlalchemy.orm import relationship


class Config(Base):
    __tablename__ = "configs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type_id = Column(UUID(as_uuid=True), ForeignKey("config_types.id"), nullable=False)
    url = Column(String(255), nullable=False)
    api_key = Column(String(255))
    llm_name = Column(String(255))

    # Обратная связь с владельцем
    owner = relationship(
        "User",
        back_populates="configs",
        foreign_keys=[user_id]
    )

    type = relationship("ConfigType", foreign_keys=[type_id])

    __table_args__ = (
        UniqueConstraint('user_id', 'type_id', name='user_id, type_id'),
    )