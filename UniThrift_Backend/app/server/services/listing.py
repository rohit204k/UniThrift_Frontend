from typing import Any, Optional

from fastapi import HTTPException, status

import app.server.database.core_data as core_service
from app.server.models.listing import ListingCreateDB, ListingCreateRequest, ListingImageRequest, ListingUpdateDB, ListingUpdateRequest
from app.server.static import localization
from app.server.static.collections import Collections
from app.server.static.enums import ListingStatus, Role
from app.server.utils.date_utils import get_current_timestamp
from app.server.vendor.aws.storage import generate_presigned_put, generate_presigned_url


async def create_listing(params: ListingCreateRequest, user_data: dict[str, any]) -> dict[str, Any]:
    """Create a listing for an item

    Args:
        params (ListingCreateRequest): Listing Details
        user_data (dict[str, any]): User token data

    Raises:
        HTTPException: Item category not found

    Returns:
        dict[str, Any]: Success message.
    """
    listing_data = params.dict()

    existing_item = await core_service.read_one(Collections.ITEMS, data_filter={'_id': params.item_id})
    if not existing_item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_ITEM_NOT_FOUND)

    listing_data['item_name'] = existing_item['item_name']
    listing_data.pop('item_id')
    listing_data['status'] = ListingStatus.NEW
    listing_data['seller_id'] = user_data.get('user_id')
    listing_data['images'] = []

    listing_data = ListingCreateDB(**listing_data).dict(exclude_none=True)
    listing_data = await core_service.create_one(Collections.LISTINGS, data=listing_data)

    return {'listing_id': listing_data.get('_id')}


async def get_all_listings(item_id: Optional[str], page: int, page_size: int) -> list[dict[str, Any]]:
    """
    Get a paginated list of Listings.

    Args:
        item_id (Optional[str]): Optional item id to filter the listings.
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.

    Returns:
        list[dict[str, Any]]: A list of dictionaries representing the Listings.

    Raises:
        None
    """
    # data_filter = {{"status": {"$in": [ListingStatus.ON_HOLD, ListingStatus.NEW]}}, 'is_deleted': False}
    data_filter = {'$and': [{'status': {'$in': [ListingStatus.ON_HOLD, ListingStatus.NEW]}}, {'status': {'$ne': ListingStatus.SOLD}}], 'is_deleted': False}
    if item_id:
        item_details = await core_service.read_one(Collections.ITEMS, data_filter={'_id': item_id, 'is_deleted': False})
        if not item_details:
            raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_ITEM_NOT_FOUND)

        data_filter['item_name'] = item_details['item_name']

    sort_filter = {'updated_at': -1}
    return await core_service.read_many(collection_name=Collections.LISTINGS, data_filter=data_filter, sort=sort_filter, page=page, page_size=page_size)


async def get_listing_by_id(listing_id: str) -> dict[str, Any]:
    """Get a listing by id

    Args:
        listing_id (str): Listing id
        user_data (dict[str, any]): User token data

    Raises:
        HTTPException: Listing not found

    Returns:
        dict[str, any]: Listing data
    """
    return await core_service.read_one(collection_name=Collections.LISTINGS, data_filter={'_id': listing_id, 'is_deleted': False})


async def get_listings_by_user(user_data: dict[str, Any], page: int, page_size: int) -> list[dict[str, Any]]:
    """Get all listing of a user

    Args:
        user_data (dict[str, Any]): User token data
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.

    Returns:
        dict[str, Any]: _description_
    """
    return await core_service.read_many(
        collection_name=Collections.LISTINGS, data_filter={'seller_id': user_data['user_id'], 'is_deleted': False}, sort={'updated_at': -1}, page=page, page_size=page_size
    )


async def update_listing(listing_id: str, params: ListingUpdateRequest, user_data: dict[str, Any]) -> dict[str, Any]:
    """Update details of a listing

    Args:
        listing_id (str): Listing id
        params (ListingUpdateRequest): Request body containing listing update details
        user_data (dict[str, Any]): Token data of user

    Raises:
        HTTPException: Listing not found
        HTTPException: Listing marked as sold

    Returns:
        dict[str, Any]: Success message
    """
    listing_data = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing_id, 'seller_id': user_data['user_id'], 'is_deleted': False})
    if not listing_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_LISTING_NOT_FOUND)

    if listing_data['status'] == ListingStatus.SOLD:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_LISTING_MARKED_SOLD)

    params = ListingUpdateDB(**params.dict(exclude_none=True))

    await core_service.update_one(Collections.LISTINGS, data_filter={'_id': listing_data.get('_id')}, update={'$set': params.dict(exclude_none=True)}, upsert=True)

    return {'message': 'Listing updated successfully'}


async def delete_listing(listing_id: str, user_data: dict[str, Any]) -> dict[str, Any]:
    """Soft delete a listing

    Args:
        listing_id (str): Listing id
        user_data (dict[str, Any]): Token data

    Raises:
        HTTPException: Listing not found
        HTTPException: Listing marked as sold

    Returns:
        dict[str, Any]: Success message
    """
    if user_data['user_type'] == Role.STUDENT:
        listing_data = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing_id, 'seller_id': user_data['user_id'], 'is_deleted': False})
    else:
        listing_data = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing_id, 'is_deleted': False})

    if not listing_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_LISTING_NOT_FOUND)

    if listing_data['status'] == ListingStatus.SOLD:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_LISTING_MARKED_SOLD)

    params = {'is_deleted': True}

    await core_service.update_one(Collections.LISTINGS, data_filter={'_id': listing_id}, update={'$set': params}, upsert=False)

    return {'message': 'Listing deleted successfully'}


async def generate_image_upload_url(params: ListingImageRequest, user_data: dict[str, Any]) -> dict[str, Any]:
    """Upload file to s3 bucket

    Args:
        filename (UploadFile): The file to be uploaded

    Returns:
        _type_: Success message
    """
    listing_data = await core_service.read_one(collection_name=Collections.LISTINGS, data_filter={'_id': params.listing_id, 'seller_id': user_data['user_id'], 'is_deleted': False})
    if not listing_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_LISTING_NOT_FOUND)

    if listing_data['status'] == ListingStatus.SOLD:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_LISTING_MARKED_SOLD)

    listing_images_list = listing_data['images']
    key = params.listing_id + '_' + user_data['user_id'] + '_' + str(get_current_timestamp()) + '.' + params.file_extension
    listing_images_list.append(key)

    params = ListingUpdateDB(**{'images': listing_images_list})

    async with await core_service.get_session() as session:
        async with session.start_transaction():
            params = ListingUpdateDB(**params.dict(exclude_none=True))

            await core_service.update_one(Collections.LISTINGS, data_filter={'_id': listing_data.get('_id')}, update={'$set': params.dict(exclude_none=True)}, upsert=True)

            presigned_put_url = await generate_presigned_put(key)

    data = {'url': presigned_put_url}

    return data


async def generate_image_get_url(key: str) -> dict[str, Any]:
    """Get presigned get url for given key

    Args:
        key (str): key of file

    Returns:
        dict[str, Any]: Success message
    """
    presigned_url = await generate_presigned_url(key)
    data = {'url': presigned_url}
    return data
