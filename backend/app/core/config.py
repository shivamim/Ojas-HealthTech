import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ojas.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "a" * 32)
    ENCRYPTION_SALT: str = os.getenv("ENCRYPTION_SALT", "ojas-salt-2026")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    WHATSAPP_API_KEY: str = os.getenv("WHATSAPP_API_KEY", "")
    WHATSAPP_API_URL: str = os.getenv("WHATSAPP_API_URL", "https://waba.360dialog.io/v1/messages")

settings = Settings()
