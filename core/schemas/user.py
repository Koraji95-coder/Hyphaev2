# core/schemas/user.py
from pydantic import BaseModel, Field, EmailStr
from typing  import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, description="Username must be at least 3 characters")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    email:    Optional[EmailStr] = Field(None, description="Email address, optional")
    pin:      str = Field(..., min_length=4, max_length=4, description="4-digit PIN")
    avatar: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "user1",
                    "password": "securepass123",
                    "email": "user@example.com",
                    "pin": "1234"
                }
            ]
        }
    }

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "username": "user1",
                    "password": "securepass123"
                }
            ]
        }
    }

class UserRead(BaseModel):
    id:             int
    username:       str
    email:          Optional[EmailStr]
    pending_email:  Optional[EmailStr] = None
    verified:       bool
    is_active:      bool
    created_at:     datetime
    avatar:         Optional[str] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id":             1,
                "username":       "alice",
                "email":          "alice@example.com",
                "pending_email":  None,
                "verified":       True,
                "is_active":      True,
                "created_at":     "2025-07-14T20:00:00Z"
            }
        }
    }

class UserUpdate(BaseModel):
    username:      Optional[str]     = Field(None, min_length=3)
    email:         Optional[EmailStr]
    pending_email: Optional[EmailStr]
    is_active:     Optional[bool]
    avatar: Optional[str] = None

    model_config = {
        "from_attributes": True
    }
