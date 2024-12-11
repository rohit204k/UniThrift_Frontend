from typing import Any, Optional

import pydantic
from bson import ObjectId
from fastapi import HTTPException, status

import app.server.database.core_data as core_service
from app.server.models.item_categories import ItemCreateDB, ItemCreateRequest, ItemUpdateDB, ItemUpdateRequest
from app.server.static import localization
from app.server.static.collections import Collections

pydantic.json.ENCODERS_BY_TYPE[ObjectId] = str


async def get_items(page: int, page_size: int, search_query: Optional[str]) -> list[dict[str, Any]]:
    """
    Get a paginated list of students.
    Args:
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.
        search_query (Optional[str]): A query string to filter the students by name.

    Returns:
        list[dict[str, Any]]: A list of dictionaries representing the students.
    Raises:
        None
    """
    data_filter = {'is_deleted': False}

    if search_query:
        data_filter['item_name'] = {'$regex': search_query, '$options': 'i'}

    pipeline: list[dict[str, Any]] = [{'$match': data_filter}, {'$sort': {'name': 1}}]
    # aggregate_query: list[dict[str, Any]] = [{'$match': base_filter}, {'$sort': {'name': 1}}]

    # aggregate_query: list[dict[str, Any]] = [{'$match': {'name': {'$regex': search_query, '$options': 'i'}}}, {'$sort': {'name': 1}}] if search_query else [{'$sort': {'name': 1}}]

    return await core_service.query_read(collection_name=Collections.ITEMS, aggregate=pipeline, page=page, page_size=page_size, paging_data=True)


async def get_item_details(item_data: str) -> dict[str, Any]:
    """Get student details
    Args:
        user_data (dict[str, Any]): Token data of the student
    Returns:
        dict[str, Any]: A dictionary object with student details
    """
    return await core_service.read_one(collection_name=Collections.ITEMS, data_filter={'_id': item_data})


async def add_item(params: ItemCreateRequest) -> dict[str, Any]:
    """Add new item
    Args:
        params (dict[str, Any]): Item details
    Returns:
        dict[str, Any]: A dictionary object with item details
    """
    params.item_name = params.item_name.title()
    item_data = params.dict()

    existing_item = await core_service.read_one(Collections.ITEMS, data_filter={'item_name': params.item_name, 'is_deleted': False})
    if existing_item:
        raise HTTPException(status.HTTP_409_CONFLICT, localization.EXCEPTION_EXISTING_ITEM)
    item_data = ItemCreateDB(**item_data).dict(exclude_none=True)
    await core_service.update_one(Collections.ITEMS, data_filter={'item_name': params.item_name}, update={'$set': item_data}, upsert=True)
    return {'message': 'Item created successfully'}


async def update_item_details(item_id: str, params: ItemUpdateRequest) -> dict[str, Any]:
    """Update item details
    Args:
        item_data (dict[str, Any]): Item details
    Returns:
        dict[str, Any]: A dictionary object with updated item details
    """
    # item_data = item_data.dict()
    # item_data = ItemUpdateDB(**item_data)
    # await core_service.update_one(Collections.ITEMS, data_filter={'item_id': item_data.item_id}, update={'$set': item_data}, upsert=True)
    # return {'message': 'Item updated successfully'}
    item_data = await core_service.read_one(collection_name=Collections.ITEMS, data_filter={'_id': item_id, 'is_deleted': False})
    if not item_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_ITEM_NOT_FOUND)
    params = ItemUpdateDB(**params.dict(exclude_none=True))
    await core_service.update_one(Collections.ITEMS, data_filter={'_id': item_data.get('_id')}, update={'$set': params.dict(exclude_none=True)}, upsert=True)

    return {'message': 'Item updated successfully'}


async def delete_item(item_id: str) -> dict[str, Any]:
    """Delete item
    Args:
        item_data (dict[str, Any]): Item ID
    Returns:
        dict[str, Any]: Success message
    """
    # await core_service.update_one(Collections.ITEMS, data_filter={'item_id': item_id}, update={'$set': {'is_deleted': True}}, upsert=True)
    # return {'message': 'Item deleted successfully'}
    params = {'is_deleted': True}
    item_data = await core_service.read_one(collection_name=Collections.ITEMS, data_filter={'_id': item_id, 'is_deleted': False})
    if not item_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_ITEM_NOT_FOUND)
    await core_service.update_one(Collections.ITEMS, data_filter={'_id': item_id}, update={'$set': params}, upsert=False)
    return {'message': 'Item deleted successfully'}
