from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient

from app.server.routes.item_categories import router
from app.server.static.collections import Collections
from app.server.static.enums import Role

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
@patch('app.server.services.item_categories.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.item_categories.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.item_categories.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_item_create_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None]
    request_payload = {'item_name': 'New Item', 'item_description': 'Sample description'}
    read_one_payload = {'item_name': 'New Item', 'is_deleted': False}
    update_one_payload = {'item_name': 'New Item', 'item_description': 'Sample description', 'is_deleted': False}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/item_categories/add_new_item', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    mock_read_one.assert_any_call(Collections.ITEMS, data_filter=read_one_payload)
    mock_update_one.assert_any_call(Collections.ITEMS, data_filter={'item_name': 'New Item'}, update={'$set': update_one_payload}, upsert=True)


@pytest.mark.asyncio
@patch('app.server.services.item_categories.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.item_categories.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_item_create_failure(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'item_name': 'New Item', 'is_deleted': False}]
    request_payload = {'item_name': 'New Item', 'item_description': 'Sample description'}
    read_one_payload = {'item_name': 'New Item', 'is_deleted': False}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/item_categories/add_new_item', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json().get('detail') == 'Item already exists'
    mock_read_one.assert_any_call(Collections.ITEMS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.item_categories.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.item_categories.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.item_categories.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_item_update_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    # Mock JWTAuthUser to simulate admin user
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'item123', 'item_name': 'New Item', 'is_deleted': False}]

    request_payload = {'item_name': 'New Item', 'item_description': 'Sample description'}

    read_one_payload = {'_id': 'item123', 'is_deleted': False}
    update_one_payload = {'item_name': 'New Item', 'item_description': 'Sample description', 'is_deleted': False}

    item_id = 'item123'
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put(f'/item_categories/update_item_details/{item_id}', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    mock_read_one.assert_any_call(collection_name=Collections.ITEMS, data_filter=read_one_payload)
    mock_update_one.assert_any_call(Collections.ITEMS, data_filter={'_id': 'item123'}, update={'$set': update_one_payload}, upsert=True)


@pytest.mark.asyncio
@patch('app.server.services.item_categories.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.item_categories.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_item_update_failure(mock_jwt_auth_user, mock_read_one):
    # Mock JWTAuthUser to simulate admin user
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None]
    request_payload = {'item_name': 'New Item', 'item_description': 'Sample description'}
    read_one_payload = {'_id': 'item123', 'is_deleted': False}
    item_id = 'item123'
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put(f'/item_categories/update_item_details/{item_id}', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == 'Item not found'
    mock_read_one.assert_any_call(collection_name=Collections.ITEMS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.item_categories.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.item_categories.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.item_categories.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_item_delete_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'item123', 'item_name': 'New Item', 'is_deleted': False}]
    read_one_payload = {'_id': 'item123', 'is_deleted': False}
    update_one_payload = {'is_deleted': True}
    item_id = 'item123'
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.delete(f'/item_categories/delete_item/{item_id}', headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    mock_read_one.assert_any_call(collection_name=Collections.ITEMS, data_filter=read_one_payload)
    mock_update_one.assert_any_call(Collections.ITEMS, data_filter={'_id': 'item123'}, update={'$set': update_one_payload}, upsert=False)


@pytest.mark.asyncio
@patch('app.server.services.item_categories.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.item_categories.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_item_delete_failure(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None]
    read_one_payload = {'_id': 'item123', 'is_deleted': False}
    item_id = 'item123'
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.delete(f'/item_categories/delete_item/{item_id}', headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == 'Item not found'
    mock_read_one.assert_any_call(collection_name=Collections.ITEMS, data_filter=read_one_payload)
