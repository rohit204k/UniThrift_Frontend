import secrets
import string
from typing import Optional

from fastapi import HTTPException, status

from app.server.static import localization
from app.server.utils import crypto_utils


def generate_random_password(length):
    # Combine all alphanumeric characters (letters and digits)
    characters = string.ascii_letters + string.digits

    return ''.join(secrets.choice(characters) for _ in range(length))


def generate_random_otp(length):
    characters = string.digits

    return ''.join(secrets.choice(characters) for _ in range(length))


def check_password(password: Optional[str], password_hash: Optional[str]):
    # password = crypto_utils.sha1(password)
    password_received = crypto_utils.sha256(password)
    if password_received != password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=localization.EXCEPTION_PASSWORD_INVALID)
    return True
