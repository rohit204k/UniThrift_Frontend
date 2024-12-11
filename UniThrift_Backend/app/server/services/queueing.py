from typing import Any

from fastapi import HTTPException, status

import app.server.database.core_data as core_service
from app.server.models.queueing import MarkInterestedRequest, MarkSaleCompleteRequest, TransactionCreateDB
from app.server.static import localization
from app.server.static.collections import Collections
from app.server.static.enums import ListingStatus, SaleStatus


async def mark_interested(params: MarkInterestedRequest, user_data: dict[str, any]) -> dict[str, Any]:
    """Create a listing for an item

    Args:
        params (ListingCreateRequest): Listing Details
        user_data (dict[str, any]): User token data

    Raises:
        HTTPException: Item category not found

    Returns:
        dict[str, Any]: Success message.
    """
    interaction_data = params.dict()
    is_seller = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'seller_id': user_data['user_id']})
    if is_seller:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_UNAUTHORIZED_INTEREST)
    existing_interaction = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'buyer_id': user_data['user_id'], 'listing_id': params.listing_id})
    if existing_interaction:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_INTEREST_DUPLICATE)
    is_item_sold = await core_service.read_one(Collections.LISTINGS, data_filter={'listing_id': params.listing_id, 'status': ListingStatus.SOLD})
    if is_item_sold:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_ITEM_SOLD)
    interaction_data['status'] = SaleStatus.INTERESTED
    interaction_data['buyer_id'] = user_data.get('user_id')
    interaction_data = TransactionCreateDB(**interaction_data).dict(exclude_none=True)
    await core_service.create_one(Collections.TRANSACTIONS, data=interaction_data)
    return {'message': 'Seller has been notified about your interest in the item'}


async def get_interested_listings(user_data: dict[str, Any], page: int, page_size: int) -> list[dict[str, Any]]:
    """Get a paginated list of Listings that the buyer is interested in.

    Args:
        user_data (dict[str, Any]): User token data
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.

    Returns:
        dict[str, Any]: _description_
    """
    interested_listings = await core_service.read_many(
        collection_name=Collections.TRANSACTIONS, data_filter={'buyer_id': user_data['user_id'], 'status': {'$in': [SaleStatus.INTERESTED, SaleStatus.SHARE_DETAILS]}}, page=page, page_size=page_size
    )
    for listing in interested_listings:
        listing_details = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing['listing_id']})
        listing['title'] = listing_details['title']
        listing['seller_id'] = listing_details['seller_id']
        listing['price'] = listing_details['price']
    return interested_listings


async def mark_sale_complete(params: MarkSaleCompleteRequest, user_data: dict[str, any]) -> dict[str, Any]:
    """Mark a sale as complete and update all user status who are interested in the listing.

    Args:
        params (MarkSaleCompleteRequest): Listing Details
        user_data (dict[str, any]): User token data

    Returns:
        dict[str, Any]: Success message.
    """
    is_seller = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'seller_id': user_data['user_id']})
    if not is_seller:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_UNAUTHORIZED_SALE)

    is_item_sold = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'status': ListingStatus.SOLD})
    if is_item_sold:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_ITEM_SOLD)

    transaction_data = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': params.buyer_id, 'status': SaleStatus.SHARE_DETAILS})
    if not transaction_data:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_INTEREST_NOT_FOUND)
    sale_update = {'status': ListingStatus.SOLD, 'buyer_id': params.buyer_id}
    interest_sale_update = {'status': SaleStatus.SOLD}
    interest_reject_update = {'status': SaleStatus.REJECTED}
    async with await core_service.get_session() as session:
        async with session.start_transaction():
            await core_service.update_one(Collections.LISTINGS, data_filter={'_id': params.listing_id}, update={'$set': sale_update}, upsert=False, session=session)
            await core_service.update_one(
                Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': params.buyer_id}, update={'$set': interest_sale_update}, upsert=False, session=session
            )
            await core_service.update_many(
                Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': {'$ne': params.buyer_id}}, update={'$set': interest_reject_update}, upsert=False, session=session
            )
    return {'message': 'Sale completed successfully'}


async def share_contact(params: MarkSaleCompleteRequest, user_data: dict[str, any]) -> dict[str, Any]:
    """Mark a sale as complete and update all user status who are interested in the listing.

    Args:
        params (MarkSaleCompleteRequest): Listing Details
        user_data (dict[str, any]): User token data

    Returns:
        dict[str, Any]: Success message.
    """
    is_seller = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'seller_id': user_data['user_id']})
    if not is_seller:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_UNAUTHORIZED_SALE)

    is_item_sold = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'status': ListingStatus.SOLD})
    if is_item_sold:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_ITEM_SOLD)

    transaction_data = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': params.buyer_id, 'status': SaleStatus.INTERESTED})
    if not transaction_data:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_INTEREST_NOT_FOUND)

    sale_update = {'status': ListingStatus.ON_HOLD}
    interest_sale_update = {'status': SaleStatus.SHARE_DETAILS}
    async with await core_service.get_session() as session:
        async with session.start_transaction():
            await core_service.update_one(Collections.LISTINGS, data_filter={'_id': params.listing_id}, update={'$set': sale_update}, upsert=False, session=session)
            await core_service.update_one(
                Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': params.buyer_id}, update={'$set': interest_sale_update}, upsert=False, session=session
            )
    return {'message': 'Your contact details have been shared with the buyer'}


async def reject_interest(params: MarkSaleCompleteRequest, user_data: dict[str, any]) -> dict[str, Any]:
    """Mark a sale as complete and update all user status who are interested in the listing.

    Args:
        params (MarkSaleCompleteRequest): Listing Details
        user_data (dict[str, any]): User token data

    Returns:
        dict[str, Any]: Success message.
    """
    is_seller = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'seller_id': user_data['user_id']})
    if not is_seller:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_UNAUTHORIZED_SALE)

    is_item_sold = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': params.listing_id, 'status': ListingStatus.SOLD})
    if is_item_sold:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_ITEM_SOLD)

    transaction_data = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': params.buyer_id, 'status': SaleStatus.INTERESTED})
    if not transaction_data:
        raise HTTPException(status.HTTP_403_FORBIDDEN, localization.EXCEPTION_INTEREST_NOT_FOUND)

    interest_sale_update = {'status': SaleStatus.REJECTED}
    await core_service.update_one(Collections.TRANSACTIONS, data_filter={'listing_id': params.listing_id, 'buyer_id': params.buyer_id}, update={'$set': interest_sale_update}, upsert=False)

    return {'message': 'Interest rejected successfully'}


async def get_listing_interactions(listing_id: str, user_data: dict[str, Any]) -> dict[str, Any]:
    """Get all interactions between buyer and seller related to a listing.

    Args:
        user_data (dict[str, Any]): User token data
        listing_id (str): The listing id to retrieve interactions
    Returns:
        dict[str, Any]: All interested buyers and their details in case of seller.
                        Status updates from seller in case of buyer
    """
    result = {}
    is_seller = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing_id, 'seller_id': user_data['user_id']})
    is_buyer = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'listing_id': listing_id, 'buyer_id': user_data['user_id']})
    if is_seller:
        result = await core_service.read_many(Collections.TRANSACTIONS, data_filter={'listing_id': listing_id})
        for user in result:
            user_details = await core_service.read_one(Collections.USERS, data_filter={'_id': user['buyer_id']})
            user['buyer_name'] = user_details['first_name'] + ' ' + user_details['last_name']
    elif is_buyer:
        result = await core_service.read_one(Collections.TRANSACTIONS, data_filter={'listing_id': listing_id, 'buyer_id': user_data['user_id']})
        if result['status'] == SaleStatus.SHARE_DETAILS:
            listing_details = await core_service.read_one(Collections.LISTINGS, data_filter={'_id': listing_id})
            seller_details = await core_service.read_one(Collections.USERS, data_filter={'_id': listing_details['seller_id']})
            result['seller_name'] = seller_details['first_name'] + ' ' + seller_details['last_name']
            result['seller_email'] = seller_details['email']
            result['seller_phone'] = seller_details['phone']
    return result
