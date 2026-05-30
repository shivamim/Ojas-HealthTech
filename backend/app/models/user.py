import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="COORDINATOR")  # SUPER_ADMIN, HOSPITAL_ADMIN, COORDINATOR, DOCTOR
    hospital_id = Column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=True)
    is_active = Column(String, default="true")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = relationship("Hospital", back_populates="users")
