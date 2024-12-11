from typing import Optional

from pydantic import constr

from app.server.models.generic import BaseModel


class ItemCreateRequest(BaseModel):
    item_name: constr(min_length=1, max_length=150, strip_whitespace=True)
    item_description: constr(min_length=1, max_length=150, strip_whitespace=True)


class ItemCreateDB(BaseModel):
    item_name: str
    item_description: Optional[str] = ''
    is_deleted: bool = False


class ItemUpdateRequest(BaseModel):
    item_name: constr(min_length=1, max_length=150, strip_whitespace=True)
    item_description: constr(min_length=1, max_length=150, strip_whitespace=True)


class ItemUpdateDB(BaseModel):
    item_name: str
    item_description: Optional[str] = ''
    is_deleted: bool = False
