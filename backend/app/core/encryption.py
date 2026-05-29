from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
from app.core.config import settings

kdf = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=settings.ENCRYPTION_SALT.encode(),
    iterations=480000,
)
KEY = base64.urlsafe_b64encode(kdf.derive(settings.ENCRYPTION_KEY.encode()))
fernet = Fernet(KEY)

def encrypt_field(plaintext: str) -> str:
    if not plaintext:
        return ""
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_field(ciphertext: str) -> str:
    if not ciphertext:
        return ""
    return fernet.decrypt(ciphertext.encode()).decode()
