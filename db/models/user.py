#db/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    pending_email = Column(String(100), unique=True, index=True,  nullable=True)
    hashed_password = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(128), nullable=True)
    refresh_token = Column(String(128), nullable=True)
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    pin_hash = Column(String(128), nullable=True)
    pin_verified = Column(Boolean, default=False)
    avatar = Column(String(300), nullable=True)