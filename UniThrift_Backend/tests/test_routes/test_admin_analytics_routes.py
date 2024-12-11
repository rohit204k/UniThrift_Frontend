from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient

from app.server.routes.admin import router
from app.server.static.enums import Role

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
@patch('app.server.services.admin.core_service.query_read', new_callable=AsyncMock)
@patch('app.server.routes.admin.JWTAuthUser.__call__', new_callable=Mock)
async def test_most_listed_items_success(mock_jwt_auth_user, mock_query_read):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]

    mock_query_read.side_effect = [[{'_id': 'Item 1', 'count': 50}, {'_id': 'Item 2', 'count': 16}, {'_id': 'Item 3', 'count': 15}, {'_id': 'Item 4', 'count': 15}, {'_id': 'Item 5', 'count': 14}]]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/admin/most_listed_items', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'


@pytest.mark.asyncio
@patch('app.server.services.admin.core_service.query_read', new_callable=AsyncMock)
@patch('app.server.routes.admin.JWTAuthUser.__call__', new_callable=Mock)
async def test_most_inquired_items_success(mock_jwt_auth_user, mock_query_read):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]

    mock_query_read.side_effect = [[{'_id': 'Item 1', 'count': 50}, {'_id': 'Item 2', 'count': 16}, {'_id': 'Item 3', 'count': 15}, {'_id': 'Item 4', 'count': 15}, {'_id': 'Item 5', 'count': 14}]]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/admin/most_inquired_items', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'


@pytest.mark.asyncio
@patch('app.server.services.admin.core_service.query_read', new_callable=AsyncMock)
@patch('app.server.routes.admin.JWTAuthUser.__call__', new_callable=Mock)
async def test_total_revenue_success(mock_jwt_auth_user, mock_query_read):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]

    mock_query_read.side_effect = [
        {'year': 2024, 'month': 7, 'revenue': 45},
        {'year': 2024, 'month': 8, 'revenue': 15},
        {'year': 2024, 'month': 9, 'revenue': 212},
        {'year': 2024, 'month': 10, 'revenue': 550},
        {'year': 2024, 'month': 11, 'revenue': 50},
        {'year': 2024, 'month': 12, 'revenue': 100},
    ]

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/admin/total_revenue', headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
