from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient

from app.server.routes.listing import router
from app.server.static import localization
from app.server.static.collections import Collections
from app.server.static.enums import ListingStatus, Role

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
@patch('app.server.services.listing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.listing.core_service.create_one', new_callable=AsyncMock)
@patch('app.server.routes.listing.JWTAuthUser.__call__', new_callable=Mock)
async def test_listing_create_success(mock_jwt_auth_user, mock_create_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [{'_id': 'item123', 'item_name': 'Item 1'}]

    mock_create_one.side_effect = [{'_id': 'listing123'}]

    request_payload = {'title': 'Listing 1', 'item_id': 'item123', 'description': 'Description 1', 'price': 100}

    create_one_payload = {'title': 'Listing 1', 'item_name': 'Item 1', 'description': 'Description 1', 'price': 100, 'images': [], 'status': ListingStatus.NEW, 'seller_id': 'user123'}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/listing/create', json=request_payload, headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.ITEMS, data_filter={'_id': 'item123'})

    mock_create_one.assert_any_call(Collections.LISTINGS, data=create_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.listing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.listing.JWTAuthUser.__call__', new_callable=Mock)
async def test_listing_create_fail_1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [None]

    request_payload = {'title': 'Listing 1', 'item_id': 'item123', 'description': 'Description 1', 'price': 100}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/listing/create', json=request_payload, headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_ITEM_NOT_FOUND

    mock_read_one.assert_any_call(Collections.ITEMS, data_filter={'_id': 'item123'})


@pytest.mark.asyncio
@patch('app.server.services.listing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.listing.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.listing.JWTAuthUser.__call__', new_callable=Mock)
async def test_listing_update_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [{'_id': 'listing123', 'status': ListingStatus.NEW}]

    mock_update_one.side_effect = [None]

    request_payload = {'title': 'Listing 1'}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/listing/update/listing123', json=request_payload, headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123', 'seller_id': 'user123', 'is_deleted': False})

    mock_update_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123'}, update={'$set': request_payload}, upsert=True)


@pytest.mark.asyncio
@patch('app.server.services.listing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.listing.JWTAuthUser.__call__', new_callable=Mock)
async def test_listing_update_fail_1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [None]

    request_payload = {'title': 'Listing 1'}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/listing/update/listing123', json=request_payload, headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_LISTING_NOT_FOUND

    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123', 'seller_id': 'user123', 'is_deleted': False})


@pytest.mark.asyncio
@patch('app.server.services.listing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.listing.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.listing.JWTAuthUser.__call__', new_callable=Mock)
async def test_listing_delete_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [{'_id': 'listing123', 'status': ListingStatus.NEW}]

    mock_update_one.side_effect = [None]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.delete('/listing/delete/listing123', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123', 'seller_id': 'user123', 'is_deleted': False})
    mock_update_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123'}, update={'$set': {'is_deleted': True}}, upsert=False)


@pytest.mark.asyncio
@patch('app.server.services.listing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.listing.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.listing.JWTAuthUser.__call__', new_callable=Mock)
async def test_listing_delete_fail_1(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [None]

    mock_update_one.side_effect = [None]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.delete('/listing/delete/listing123', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_LISTING_NOT_FOUND

    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123', 'seller_id': 'user123', 'is_deleted': False})
