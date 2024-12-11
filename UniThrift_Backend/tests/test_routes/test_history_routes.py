from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient

from app.server.routes.history import router
from app.server.static import localization
from app.server.static.collections import Collections
from app.server.static.enums import ListingStatus, Role

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
@patch('app.server.services.history.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.history.JWTAuthUser.__call__', new_callable=Mock)
async def test_history_listing_details_success(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'seller_user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [
        {'_id': 'listing123', 'seller_id': 'seller_user123', 'buyer_id': 'buyer_user123'},
        {'_id': 'seller_user123', 'first_name': 'John', 'last_name': 'Doe'},
        {'_id': 'buyer_user123', 'first_name': 'Daisy', 'last_name': 'Doe'},
        {'_id': 'transaction123', 'comments': 'Comments'},
    ]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/history/get_listing_details/listing123', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123', 'status': ListingStatus.SOLD})
    mock_read_one.assert_any_call(Collections.USERS, data_filter={'_id': 'seller_user123'})
    mock_read_one.assert_any_call(Collections.USERS, data_filter={'_id': 'buyer_user123'})
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter={'listing_id': 'listing123', 'buyer_id': 'buyer_user123'})


@pytest.mark.asyncio
@patch('app.server.services.history.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.history.JWTAuthUser.__call__', new_callable=Mock)
async def test_history_listing_details_fail_2(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'seller_user123', 'buyer_id': 'buyer_user123'}]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/history/get_listing_details/listing123', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == localization.EXCEPTION_FORBIDDEN_ACCESS

    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123', 'status': ListingStatus.SOLD})
