from typing import Any, Optional

from fastapi import APIRouter, Depends

from app.server.models.item_categories import ItemCreateRequest, ItemUpdateRequest
from app.server.services import item_categories
from app.server.static.enums import Role
from app.server.utils.token_util import JWTAuthUser

router = APIRouter()


@router.get('/item_categories/get_items', summary='Gets list of all items')
async def get_all_items(search_query: Optional[str] = None, page: int = 1, page_size: int = 10) -> dict[str, Any]:
    data = await item_categories.get_items(page=page, page_size=page_size, search_query=search_query)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/item_categories/get_item_details/{item_id}', summary='Gets item details')
async def get_item_details(item_id: str) -> dict[str, Any]:
    data = await item_categories.get_item_details(item_id)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/item_categories/add_new_item', summary='Add new item')
async def add_item(params: ItemCreateRequest, _token=Depends(JWTAuthUser([Role.ADMIN]))) -> dict[str, Any]:
    data = await item_categories.add_item(params)
    return {'data': data, 'status': 'SUCCESS'}


@router.put('/item_categories/update_item_details/{item_id}', summary='Update Item description')
async def update_item(item_id: str, params: ItemUpdateRequest, _token=Depends(JWTAuthUser([Role.ADMIN]))) -> dict[str, Any]:
    data = await item_categories.update_item_details(item_id, params)
    return {'data': data, 'status': 'SUCCESS'}


@router.delete('/item_categories/delete_item/{item_id}', summary='Deletes the item')
async def delete_item(item_id: str, _token=Depends(JWTAuthUser([Role.ADMIN]))) -> dict[str, Any]:
    data = await item_categories.delete_item(item_id)
    return {'data': data, 'status': 'SUCCESS'}
