import os
import sys
import secrets
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

_IS_PROD = os.getenv("ENVIRONMENT", "development").lower() == "production"


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
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # ── SECRET_KEY ───────────────────────────────────────────────────
        if not self.SECRET_KEY:
            if _IS_PROD:
                print("FATAL: SECRET_KEY env var is required in production.", file=sys.stderr)
                sys.exit(1)
            import warnings
            self.SECRET_KEY = secrets.token_urlsafe(32)
            warnings.warn("SECRET_KEY auto-generated — resets every restart! Set it in env vars.")

        # ── ENCRYPTION_KEY ───────────────────────────────────────────────
        if not self.ENCRYPTION_KEY:
            if _IS_PROD:
                print("FATAL: ENCRYPTION_KEY env var is required in production.", file=sys.stderr)
                sys.exit(1)
            import warnings
            self.ENCRYPTION_KEY = secrets.token_hex(16)  # exactly 32 hex chars
            warnings.warn("ENCRYPTION_KEY auto-generated — encrypted data unreadable after restart!")

        # Normalise to exactly 32 chars for Fernet key derivation
        if len(self.ENCRYPTION_KEY) != 32:
            import warnings
            self.ENCRYPTION_KEY = (self.ENCRYPTION_KEY + "0" * 32)[:32]
            warnings.warn("ENCRYPTION_KEY was not 32 characters — padded/truncated. Fix your env var!")


settings = Settings()
