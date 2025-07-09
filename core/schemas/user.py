# user.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, description="Username must be at least 3 characters")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    email: Optional[EmailStr] = Field(None, description="Email address, optional")
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit PIN")

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
    username: str = Field(..., min_length=3, description="Username must be at least 3 characters")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")

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