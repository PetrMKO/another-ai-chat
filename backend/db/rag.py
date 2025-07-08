import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from configuration.database import Base
from sqlalchemy.orm import relationship


class Rag(Base):
    __tablename__ = "rag"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = Column(String(100), nullable=False)

    users = relationship("User", back_populates="rag")