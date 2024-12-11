from typing import Optional

from pydantic import conint, constr

from app.server.models.generic import BaseModel
from app.server.static.enums import FileType, ListingStatus


class ListingCreateRequest(BaseModel):
    title: constr(min_length=1, max_length=250, strip_whitespace=True)
    item_id: constr(min_length=1, max_length=150, strip_whitespace=True)
    description: constr(min_length=1, max_length=450, strip_whitespace=True)
    price: conint(ge=0)


class ListingCreateDB(BaseModel):
    title: str
    item_name: str
    description: str
    price: int
    images: list[str]
    status: ListingStatus
    seller_id: str


class ListingUpdateRequest(BaseModel):
    title: Optional[constr(min_length=1, max_length=250, strip_whitespace=True)]
    description: Optional[constr(min_length=1, max_length=450, strip_whitespace=True)]
    price: Optional[conint(ge=0)]
    status: Optional[ListingStatus]
    images: Optional[list[str]]


class ListingUpdateDB(BaseModel):
    title: Optional[str]
    description: Optional[str]
    price: Optional[int]
    status: Optional[ListingStatus]
    images: Optional[list[str]]


class ListingImageRequest(BaseModel):
    listing_id: constr(min_length=1, max_length=250, strip_whitespace=True)
    file_extension: FileType
