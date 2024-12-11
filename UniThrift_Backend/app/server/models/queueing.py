from typing import Optional

from app.server.models.generic import BaseModel
from app.server.static.enums import ListingStatus, SaleStatus


class MarkInterestedRequest(BaseModel):
    listing_id: str
    comments: Optional[str] = ''


class TransactionCreateDB(BaseModel):
    listing_id: str
    buyer_id: str
    status: SaleStatus
    comments: Optional[str] = ''


class MarkSaleCompleteRequest(BaseModel):
    listing_id: str
    buyer_id: str


class ApproveInterestRequest(BaseModel):
    listing_id: str
    buyer_id: str


class TransactionsUpdateDB(BaseModel):
    status: SaleStatus


class SaleCompleteUpdateDB(BaseModel):
    status: ListingStatus.SOLD
    buyer_id: str


class RejectUpdateDB(BaseModel):
    status: SaleStatus.REJECTED
