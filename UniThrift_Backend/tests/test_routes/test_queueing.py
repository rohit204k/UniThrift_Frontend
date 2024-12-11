from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient

from app.server.routes.queueing import router
from app.server.static.collections import Collections
from app.server.static.enums import ListingStatus, Role, SaleStatus

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.queueing.core_service.create_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_success(mock_jwt_auth_user, mock_create_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None, None, None]
    request_payload = {'listing_id': 'listing123', 'comments': 'Comments'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'buyer_id': 'user123', 'listing_id': 'listing123'}
    read_one_payload3 = {'listing_id': 'listing123', 'status': ListingStatus.SOLD}
    create_one_payload = {'listing_id': 'listing123', 'comments': 'Comments', 'status': SaleStatus.INTERESTED, 'buyer_id': 'user123'}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/mark_interested', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload3)
    mock_create_one.assert_any_call(Collections.TRANSACTIONS, data=create_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_failure1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, None]
    request_payload = {'listing_id': 'listing123', 'comments': 'Comments'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/mark_interested', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Seller not allowed to mark interest'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_failure2(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None, {'_id': 'listing123', 'seller_id': 'user123'}, None]
    request_payload = {'listing_id': 'listing123', 'comments': 'Comments'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'buyer_id': 'user123', 'listing_id': 'listing123'}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/mark_interested', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'User already added to the interested list'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload2)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_failure3(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None, None, {'_id': 'listing123', 'seller_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'comments': 'Comments'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'buyer_id': 'user123', 'listing_id': 'listing123'}
    read_one_payload3 = {'listing_id': 'listing123', 'status': ListingStatus.SOLD}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/mark_interested', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Item already sold'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload3)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.queueing.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.services.queueing.core_service.update_many', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
@patch('app.server.services.admin.core_service.get_session', new_callable=AsyncMock)
async def test_queueing_mark_sale_complete_success(mock_get_session, mock_jwt_auth_user, mock_update_many, mock_update_one, mock_read_one):
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    mock_get_session.return_value = mock_session

    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    read_one_payload3 = {'listing_id': 'listing123', 'buyer_id': 'buyer123', 'status': SaleStatus.SHARE_DETAILS}
    update_one_payload1 = {'status': ListingStatus.SOLD, 'buyer_id': 'buyer123'}
    update_one_payload2 = {'status': SaleStatus.SOLD}
    update_many_payload = {'status': SaleStatus.REJECTED}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/queueing/mark_sale_complete', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload3)
    mock_update_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123'}, update={'$set': update_one_payload1}, upsert=False, session=mock_session)
    mock_update_one.assert_any_call(
        Collections.TRANSACTIONS, data_filter={'listing_id': 'listing123', 'buyer_id': 'buyer123'}, update={'$set': update_one_payload2}, upsert=False, session=mock_session
    )
    mock_update_many.assert_any_call(
        Collections.TRANSACTIONS, data_filter={'listing_id': 'listing123', 'buyer_id': {'$ne': 'buyer123'}}, update={'$set': update_many_payload}, upsert=False, session=mock_session
    )


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_mark_sale_complete_failure1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None, None, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/queueing/mark_sale_complete', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'User is not authorized to mark sale as complete'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_mark_sale_complete_failure2(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, {'_id': 'listing123', 'seller_id': 'user123'}, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/queueing/mark_sale_complete', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Item already sold'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_mark_sale_complete_failure3(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, None]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    read_one_payload3 = {'listing_id': 'listing123', 'buyer_id': 'buyer123', 'status': SaleStatus.SHARE_DETAILS}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/queueing/mark_sale_complete', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Interest not found'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload3)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.queueing.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
@patch('app.server.services.admin.core_service.get_session', new_callable=AsyncMock)
async def test_queueing_share_contact_success(mock_get_session, mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    mock_get_session.return_value = mock_session

    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    read_one_payload3 = {'listing_id': 'listing123', 'buyer_id': 'buyer123', 'status': SaleStatus.INTERESTED}
    update_one_payload1 = {'status': ListingStatus.ON_HOLD}
    update_one_payload2 = {'status': SaleStatus.SHARE_DETAILS}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/share_contact', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload3)
    mock_update_one.assert_any_call(Collections.LISTINGS, data_filter={'_id': 'listing123'}, update={'$set': update_one_payload1}, upsert=False, session=mock_session)
    mock_update_one.assert_any_call(
        Collections.TRANSACTIONS, data_filter={'listing_id': 'listing123', 'buyer_id': 'buyer123'}, update={'$set': update_one_payload2}, upsert=False, session=mock_session
    )


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_share_contact_failure1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None, None, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/share_contact', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'User is not authorized to mark sale as complete'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_share_contact_failure2(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, {'_id': 'listing123', 'seller_id': 'user123'}, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/share_contact', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Item already sold'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_share_contact_failure3(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, None]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    read_one_payload3 = {'listing_id': 'listing123', 'buyer_id': 'buyer123', 'status': SaleStatus.INTERESTED}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/share_contact', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Interest not found'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload3)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.queueing.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_reject_interest_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    read_one_payload3 = {'listing_id': 'listing123', 'buyer_id': 'buyer123', 'status': SaleStatus.INTERESTED}
    update_one_payload = {'status': SaleStatus.REJECTED}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/reject_interest', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload3)
    mock_update_one.assert_any_call(Collections.TRANSACTIONS, data_filter={'listing_id': 'listing123', 'buyer_id': 'buyer123'}, update={'$set': update_one_payload}, upsert=False)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_reject_interest_failure1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [None, None, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/reject_interest', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'User is not authorized to mark sale as complete'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_reject_interest_failure2(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, {'_id': 'listing123', 'seller_id': 'user123'}, {'listing_id': 'listing123', 'buyer_id': 'user123'}]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/reject_interest', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Item already sold'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)


@pytest.mark.asyncio
@patch('app.server.services.queueing.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.queueing.JWTAuthUser.__call__', new_callable=AsyncMock)
async def test_queueing_reject_interest_failure3(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.ADMIN}]
    mock_read_one.side_effect = [{'_id': 'listing123', 'seller_id': 'user123'}, None, None]
    request_payload = {'listing_id': 'listing123', 'buyer_id': 'buyer123'}
    read_one_payload1 = {'_id': 'listing123', 'seller_id': 'user123'}
    read_one_payload2 = {'_id': 'listing123', 'status': ListingStatus.SOLD}
    read_one_payload3 = {'listing_id': 'listing123', 'buyer_id': 'buyer123', 'status': SaleStatus.INTERESTED}
    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/queueing/reject_interest', json=request_payload, headers={'Authorization': 'Bearer token'})
        print(response.json())
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json().get('detail') == 'Interest not found'
    print(mock_read_one.mock_calls)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload1)
    mock_read_one.assert_any_call(Collections.LISTINGS, data_filter=read_one_payload2)
    mock_read_one.assert_any_call(Collections.TRANSACTIONS, data_filter=read_one_payload3)
