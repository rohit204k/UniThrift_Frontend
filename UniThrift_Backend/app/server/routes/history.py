from typing import Any

from fastapi import APIRouter, Depends

from app.server.services import history
from app.server.static.enums import Role
from app.server.utils.token_util import JWTAuthUser

router = APIRouter()


@router.get('/history/get_sold_listings', summary='Get list of all the listings posted and completed by me')
async def get_sold_listings(page: int = 1, page_size: int = 10, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await history.get_sold_listings(user_data, page, page_size)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/history/get_purchased_listings', summary='Get list of all the listing items bought by me')
async def get_my_sold_listings(page: int = 1, page_size: int = 10, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await history.get_purchased_listings(user_data, page, page_size)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/history/get_listing_details/{listing_id}', summary='Get details of listing based on id')
async def get_listing_details(listing_id: str, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await history.get_listing_details(listing_id, user_data)
    return {'data': data, 'status': 'SUCCESS'}
