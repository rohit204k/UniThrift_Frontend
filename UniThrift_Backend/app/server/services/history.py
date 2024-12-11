from typing import Any

from fastapi import HTTPException, status

import app.server.database.core_data as core_service
from app.server.static import localization
from app.server.static.collections import Collections
from app.server.static.enums import ListingStatus


async def get_sold_listings(user_data: dict[str, Any], page: int, page_size: int) -> list[dict[str, Any]]:
    """Get a paginated list of Listings that the buyer is interested in.
    Args:
        user_data (dict[str, Any]): User token data
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.
    Returns:
        dict[str, Any]: _description_
    """
    return await core_service.read_many(collection_name=Collections.LISTINGS, data_filter={'seller_id': user_data['user_id'], 'status': ListingStatus.SOLD}, page=page, page_size=page_size)


async def get_purchased_listings(user_data: dict[str, Any], page: int, page_size: int) -> list[dict[str, Any]]:
    """Get a paginated list of Listings that the buyer is interested in.
    Args:
        user_data (dict[str, Any]): User token data
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.
    Returns:
        dict[str, Any]: _description_
    """
    return await core_service.read_many(collection_name=Collections.LISTINGS, data_filter={'buyer_id': user_data['user_id'], 'status': ListingStatus.SOLD}, page=page, page_size=page_size)


async def get_listing_details(listing_id: str, user_data: dict[str, Any]) -> dict[str, Any]:
    """Get a paginated list of Listings that the buyer is interested in.
    Args:
        user_data (dict[str, Any]): User token data
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.
    Returns:
        dict[str, Any]: _description_
    """
    listing_details = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing_id, 'status': ListingStatus.SOLD})
    if not listing_details:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_LISTING_NOT_FOUND)
    if user_data['user_id'] != listing_details['seller_id'] and user_data['user_id'] != listing_details['buyer_id']:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_FORBIDDEN_ACCESS)
    seller_data = await core_service.read_one(Collections.USERS, data_filter={'_id': listing_details['seller_id']})
    buyer_data = await core_service.read_one(Collections.USERS, data_filter={'_id': listing_details['buyer_id']})
    transaction_data = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'listing_id': listing_id, 'buyer_id': listing_details['buyer_id']})
    if not seller_data or not buyer_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)
    seller_first_name = seller_data.get('first_name', '').strip() or 'N/A'
    seller_last_name = seller_data.get('last_name', '').strip() or 'N/A'
    buyer_first_name = buyer_data.get('first_name', '').strip() or 'N/A'
    buyer_last_name = buyer_data.get('last_name', '').strip() or 'N/A'
    buyer_comments = transaction_data.get('comments', '').strip() or 'No comments provided'
    listing_details['seller_name'] = f'{seller_first_name} {seller_last_name}'
    listing_details['buyer_name'] = f'{buyer_first_name} {buyer_last_name}'
    listing_details['buyer_comments'] = buyer_comments
    return listing_details
