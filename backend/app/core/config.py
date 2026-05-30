import os
import secrets
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/ojas")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")
    ENCRYPTION_SALT: str = os.getenv("ENCRYPTION_SALT", "ojas-salt-2026")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    WHATSAPP_API_KEY: str = os.getenv("WHATSAPP_API_KEY", "")
    WHATSAPP_API_URL: str = os.getenv("WHATSAPP_API_URL", "https://waba.360dialog.io/v1/messages")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Auto-generate SECRET_KEY for dev (NOT production)
        if not self.SECRET_KEY:
            import warnings
            self.SECRET_KEY = secrets.token_urlsafe(32)
            warnings.warn("SECRET_KEY auto-generated. Set a fixed key in production!")
        
        if len(self.SECRET_KEY) < 32:
            import warnings
            warnings.warn("SECRET_KEY is too short. Use a strong 32+ character key in production.")
        
        # ENCRYPTION_KEY must be exactly 32 chars
        if not self.ENCRYPTION_KEY:
            import warnings
            self.ENCRYPTION_KEY = secrets.token_hex(16)  # 32 hex chars
            warnings.warn("ENCRYPTION_KEY auto-generated. Set a fixed 32-char key in production!")
        
        if len(self.ENCRYPTION_KEY) != 32:
            import warnings
            # Pad or truncate to 32 chars
            self.ENCRYPTION_KEY = (self.ENCRYPTION_KEY + "0" * 32)[:32]
            warnings.warn("ENCRYPTION_KEY must be exactly 32 characters. Adjusted for dev.")

settings = Settings()
