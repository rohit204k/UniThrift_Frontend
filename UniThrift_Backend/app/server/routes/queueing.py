from typing import Any

from fastapi import APIRouter, Depends

from app.server.models.queueing import ApproveInterestRequest, MarkInterestedRequest, MarkSaleCompleteRequest
from app.server.services import queueing
from app.server.static.enums import Role
from app.server.utils.token_util import JWTAuthUser

router = APIRouter()


@router.post('/queueing/mark_interested', summary='Mark a listing as interested by a user')
async def mark_interested(params: MarkInterestedRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await queueing.mark_interested(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/queueing/get_interested_listings', summary='Get all the listings that the user is interested in')
async def get_interested_listings(page: int = 1, page_size: int = 10, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await queueing.get_interested_listings(user_data, page, page_size)
    return {'data': data, 'status': 'SUCCESS'}


@router.put('/queueing/mark_sale_complete', summary='Mark a sale as complete and update all user status who are interested in the listing')
async def mark_sale_complete(params: MarkSaleCompleteRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await queueing.mark_sale_complete(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/queueing/share_contact', summary='Share contact of seller with buyer')
async def share_contact(params: ApproveInterestRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await queueing.share_contact(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/queueing/reject_interest', summary='Reject a buyer' 's interest in the listing')
async def reject_interest(params: MarkSaleCompleteRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await queueing.reject_interest(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/queueing/get_listing_interactions/{listing_id}', summary='Get all the users who are interested in a listing or seller details in case of buyer')
async def get_listing_interactions(listing_id: str, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await queueing.get_listing_interactions(listing_id, user_data)
    return {'data': data, 'status': 'SUCCESS'}
