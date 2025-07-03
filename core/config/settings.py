# settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    REDIS_URL: str
    DATABASE_URL: str
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
