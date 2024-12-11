from app.server.models.custom_types import EmailStr
from app.server.models.generic import BaseModel


class PasswordCreateDB(BaseModel):
    user_id: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
