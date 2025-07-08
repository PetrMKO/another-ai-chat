import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from configuration.database import Base

class ConfigType(Base):
    __tablename__ = "config_types"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
