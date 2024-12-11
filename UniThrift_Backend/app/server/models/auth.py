from pydantic import constr

from app.server.models.custom_types import EmailStr
from app.server.models.generic import BaseModel
from app.server.static.enums import VerificationType


class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=4, max_length=100, strip_whitespace=True)


class OtpRequest(BaseModel):
    email: EmailStr
    verification_type: VerificationType
    # phone: constr(min_length=1, max_length=30, strip_whitespace=True)


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=1, max_length=6, strip_whitespace=True)
    password: constr(min_length=4, max_length=100, strip_whitespace=True)
    verification_type: VerificationType


class OtpCreateDB(BaseModel):
    user_id: constr(min_length=1, max_length=30, strip_whitespace=True)
    otp: constr(min_length=1, max_length=6, strip_whitespace=True)
    is_used: bool = False
    used_for: VerificationType
    expiry: int
