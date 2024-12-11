from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.server.models.listing import ListingCreateRequest, ListingImageRequest, ListingUpdateRequest
from app.server.services import listing
from app.server.static.enums import Role
from app.server.utils.token_util import JWTAuthUser

router = APIRouter()


@router.post('/listing/create', summary='Create new listing')
async def create_listing(params: ListingCreateRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await listing.create_listing(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/listing/get_listings', summary='Gets all listings in paginated form')
async def get_all_listings(item_id: Optional[str] = None, page: int = 1, page_size: int = 10, _token=Depends(JWTAuthUser([Role.STUDENT, Role.ADMIN]))) -> dict[str, Any]:
    data = await listing.get_all_listings(item_id, page, page_size)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/listing/get_listing/{listing_id}', summary='Gets a listing by its id')
async def get_listing_by_id(listing_id: str, _token=Depends(JWTAuthUser([Role.STUDENT, Role.ADMIN]))) -> dict[str, Any]:
    data = await listing.get_listing_by_id(listing_id)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/listing/get_user_listings', summary='Gets all listings of a user')
async def get_listing_by_user(page: int = 1, page_size: int = 10, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await listing.get_listings_by_user(user_data, page, page_size)
    return {'data': data, 'status': 'SUCCESS'}


@router.put('/listing/update/{listing_id}', summary='Update a listing')
async def update_listing(listing_id: str, params: ListingUpdateRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await listing.update_listing(listing_id, params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.delete('/listing/delete/{listing_id}', summary='Delete a listing')
async def delete_listing(listing_id: str, user_data=Depends(JWTAuthUser([Role.STUDENT, Role.ADMIN]))) -> dict[str, Any]:
    data = await listing.delete_listing(listing_id, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/listing/image/generate_upload_url', summary='Generate a presigned url')
async def generate_image_upload_url(params: ListingImageRequest, user_data=Depends(JWTAuthUser([Role.STUDENT]))) -> dict[str, Any]:
    data = await listing.generate_image_upload_url(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/listing/image/generate_get_url', summary='Get a file from s3')
async def get_file(key: str, _token=Depends(JWTAuthUser([Role.STUDENT, Role.ADMIN]))) -> dict[str, Any]:
    data = await listing.generate_image_get_url(key)
    return {'data': data, 'status': 'SUCCESS'}
