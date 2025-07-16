# settings.py
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    REDIS_URL: str
    DATABASE_URL: str
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    IS_PROD: bool = Field(False, env="IS_PROD")

    # Pydantic V2 configuration using model_config
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

settings = Settings()