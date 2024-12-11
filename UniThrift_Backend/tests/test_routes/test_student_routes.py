from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from fastapi import FastAPI, status
from httpx import AsyncClient

from app.server.routes.student import router
from app.server.static import localization
from app.server.static.collections import Collections
from app.server.static.enums import Role, VerificationType

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.get_session', new_callable=AsyncMock)
async def test_student_create_success(mock_get_session, mock_update_one, mock_read_one):
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    mock_get_session.return_value = mock_session

    mock_read_one.side_effect = [None, None, None]

    mock_update_one.side_effect = [{'_id': 'user123', 'email': 'test@example.com'}, None]

    request_payload = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'test@example.com',
        'university': 'Test University',
        'university_id': 'uni123',
        'phone': '1234567890',
        'address': '123 Test Street',
        'password': 'password123',
    }

    update_one_payload = {
        'first_name': request_payload['first_name'],
        'last_name': request_payload['last_name'],
        'email': request_payload['email'],
        'university': request_payload['university'],
        'university_id': request_payload['university_id'],
        'phone': request_payload['phone'],
        'address': request_payload['address'],
        'user_type': Role.STUDENT,
        'is_verified': False,
    }

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/create', json=request_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter={'email': 'test@example.com', 'is_deleted': False})
    mock_read_one.assert_any_call(Collections.USERS, data_filter={'phone': request_payload['phone'], 'is_deleted': False})
    mock_read_one.assert_any_call(Collections.USERS, data_filter={'university_id': request_payload['university_id'], 'is_deleted': False})

    mock_update_one.assert_any_call(Collections.USERS, data_filter={'email': request_payload['email']}, update={'$set': update_one_payload}, upsert=True, session=mock_session)

    assert mock_update_one.call_count == 2
    assert mock_get_session.call_count == 1


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
async def test_student_create_fail_1(mock_read_one):
    mock_read_one.side_effect = [{'_id': 'user123', 'email': 'test@example.com', 'address': '123 Test Street', 'first_name': 'John', 'last_name': 'Doe'}]

    request_payload = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'test@example.com',
        'university': 'Test University',
        'university_id': 'uni123',
        'phone': '1234567890',
        'address': '123 Test Street',
        'password': 'password123',
    }

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/create', json=request_payload)

    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json().get('detail') == localization.EXCEPTION_EMAIL_EXISTS

    mock_read_one.assert_any_call(Collections.USERS, data_filter={'email': 'test@example.com', 'is_deleted': False})


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.create_login_token', new_callable=AsyncMock)
@patch('app.server.services.student.password_utils.check_password', new_callable=Mock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
async def test_student_login_success(mock_update_one, mock_check_password, mock_create_login_token, mock_read_one):
    mock_read_one.side_effect = [{'_id': 'user123', 'is_verified': True, 'user_type': Role.STUDENT}, {'_id': 'id123', 'user_id': 'user123', 'password': 'hashed_password'}]

    mock_create_login_token.side_effect = [{'access_token': 'access_token', 'access_token_expiry': 1000, 'refresh_token': 'refresh_token'}]

    mock_check_password.side_effect = [True]

    mock_update_one.side_effect = [None]

    request_payload = {'email': 'test@example.com', 'password': 'password123'}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/login', json=request_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    assert mock_read_one.call_count == 2
    assert mock_check_password.call_count == 1
    assert mock_create_login_token.call_count == 1
    assert mock_update_one.call_count == 1


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
async def test_student_login_fail_1(mock_read_one):
    mock_read_one.side_effect = [None]

    request_payload = {'email': 'test@example.com', 'password': 'password123'}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/login', json=request_payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_USER_NOT_FOUND

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.create_login_token', new_callable=AsyncMock)
async def test_student_login_fail_2(mock_create_login_token, mock_read_one):
    mock_read_one.side_effect = [{'_id': 'user123', 'is_verified': True, 'user_type': Role.STUDENT}, {'_id': 'id123', 'user_id': 'user123', 'password': 'hashed_password'}]

    mock_create_login_token.side_effect = [{'access_token': 'access_token', 'access_token_expiry': 1000, 'refresh_token': 'refresh_token'}]

    request_payload = {'email': 'test@example.com', 'password': 'password123'}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/login', json=request_payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json().get('detail') == localization.EXCEPTION_PASSWORD_INVALID

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
async def test_student_send_otp_fail_1(mock_read_one):
    mock_read_one.side_effect = [None]

    request_payload = {'email': 'test@example.com', 'verification_type': 'AUTHENTICATION'}

    read_one_payload = {'email': 'test@example.com', 'user_type': Role.STUDENT}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/send_otp', json=request_payload)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_USER_NOT_FOUND

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.services.student.template_util.get_template', new_callable=AsyncMock)
@patch('app.server.services.student.email_service.send_email', new_callable=AsyncMock)
async def test_student_send_otp_fail_2(mock_send_email, mock_get_template, mock_update_one, mock_read_one):
    mock_read_one.side_effect = [{'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'}]

    mock_update_one.side_effect = [None]

    mock_get_template.side_effect = [None]

    mock_send_email.side_effect = [None]

    request_payload = {'email': 'test@example.com', 'verification_type': VerificationType.AUTHENTICATION}

    read_one_payload = {'email': 'test@example.com', 'user_type': Role.STUDENT}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/send_otp', json=request_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    assert mock_update_one.call_count == 1
    assert mock_get_template.call_count == 1
    assert mock_send_email.call_count == 1


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.get_session', new_callable=AsyncMock)
async def test_student_verify_otp_success(mock_get_session, mock_update_one, mock_read_one):
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    mock_get_session.return_value = mock_session

    mock_read_one.side_effect = [
        {'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'},
        {'_id': 'id123', 'expiry': 10**20, 'user_id': 'user123', 'otp': '123456', 'is_used': False, 'used_for': VerificationType.AUTHENTICATION},
    ]

    mock_update_one.side_effect = [None, None]

    request_payload = {'email': 'test@example.com', 'otp': '123456', 'password': 'password123', 'verification_type': VerificationType.AUTHENTICATION}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    otp_read_one_payload = {'user_id': 'user123', 'used_for': VerificationType.AUTHENTICATION}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/verify_otp', json=request_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    mock_read_one.assert_any_call(Collections.OTP, data_filter=otp_read_one_payload)

    mock_update_one.assert_any_call(Collections.USERS, data_filter={'_id': 'user123'}, update={'$set': {'is_verified': True}}, upsert=True, session=mock_session)

    mock_update_one.assert_any_call(Collections.OTP, data_filter={'user_id': 'user123'}, update={'$set': {'is_used': True}}, upsert=True, session=mock_session)

    assert mock_update_one.call_count == 2


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.get_session', new_callable=AsyncMock)
async def test_student_verify_otp_authentication_success(mock_get_session, mock_update_one, mock_read_one):
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    mock_get_session.return_value = mock_session

    mock_read_one.side_effect = [
        {'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'},
        {'_id': 'id123', 'expiry': 10**20, 'user_id': 'user123', 'otp': '123456', 'is_used': False, 'used_for': VerificationType.AUTHENTICATION},
    ]

    mock_update_one.side_effect = [None, None]

    request_payload = {'email': 'test@example.com', 'otp': '123456', 'password': 'password123', 'verification_type': VerificationType.AUTHENTICATION}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    otp_read_one_payload = {'user_id': 'user123', 'used_for': VerificationType.AUTHENTICATION}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/verify_otp', json=request_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    mock_read_one.assert_any_call(Collections.OTP, data_filter=otp_read_one_payload)

    mock_update_one.assert_any_call(Collections.USERS, data_filter={'_id': 'user123'}, update={'$set': {'is_verified': True}}, upsert=True, session=mock_session)

    mock_update_one.assert_any_call(Collections.OTP, data_filter={'user_id': 'user123'}, update={'$set': {'is_used': True}}, upsert=True, session=mock_session)

    assert mock_update_one.call_count == 2


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.get_session', new_callable=AsyncMock)
async def test_student_verify_otp_forgot_password_success(mock_get_session, mock_update_one, mock_read_one):
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.__aexit__.return_value = None
    mock_get_session.return_value = mock_session

    mock_read_one.side_effect = [
        {'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'},
        {'_id': 'id123', 'expiry': 10**20, 'user_id': 'user123', 'otp': '123456', 'is_used': False, 'used_for': VerificationType.AUTHENTICATION},
    ]

    mock_update_one.side_effect = [None, None]

    request_payload = {'email': 'test@example.com', 'otp': '123456', 'password': 'password123', 'verification_type': VerificationType.FORGOT_PASSWORD}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    otp_read_one_payload = {'user_id': 'user123', 'used_for': VerificationType.FORGOT_PASSWORD}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/verify_otp', json=request_payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    mock_read_one.assert_any_call(Collections.OTP, data_filter=otp_read_one_payload)

    mock_update_one.assert_any_call(Collections.OTP, data_filter={'user_id': 'user123'}, update={'$set': {'is_used': True}}, upsert=True, session=mock_session)

    assert mock_update_one.call_count == 2


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
async def test_student_verify_otp_fail_1(mock_read_one):
    mock_read_one.side_effect = [
        {'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'},
        {'_id': 'id123', 'expiry': 10**20, 'user_id': 'user123', 'otp': '12345', 'is_used': False, 'used_for': VerificationType.AUTHENTICATION},
    ]

    request_payload = {'email': 'test@example.com', 'otp': '123456', 'password': 'password123', 'verification_type': VerificationType.FORGOT_PASSWORD}

    read_one_payload = {'email': 'test@example.com', 'is_deleted': False}

    otp_read_one_payload = {'user_id': 'user123', 'used_for': VerificationType.FORGOT_PASSWORD}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.post('/student/verify_otp', json=request_payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json().get('detail') == localization.EXCEPTION_OTP_INVALID

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    mock_read_one.assert_any_call(Collections.OTP, data_filter=otp_read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.services.student.core_service.update_one', new_callable=AsyncMock)
@patch('app.server.routes.student.JWTAuthUser.__call__', new_callable=Mock)
async def test_student_update_success(mock_jwt_auth_user, mock_update_one, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [{'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'}]

    request_payload = {'first_name': 'JOHN'}

    read_one_payload = {'_id': 'user123', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/student/update', json=request_payload, headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)

    mock_update_one.assert_any_call(Collections.USERS, data_filter={'_id': 'user123'}, update={'$set': request_payload}, upsert=True)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.student.JWTAuthUser.__call__', new_callable=Mock)
async def test_student_update_fail_1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [None]

    request_payload = {'first_name': 'JOHN'}

    read_one_payload = {'_id': 'user123', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.put('/student/update', json=request_payload, headers={'Authorization': 'Bearer token'})

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_USER_NOT_FOUND

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.student.JWTAuthUser.__call__', new_callable=Mock)
async def test_student_get_success(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [{'_id': 'user123', 'email': 'test@example.com', 'first_name': 'John', 'last_name': 'Doe'}]

    read_one_payload = {'_id': 'user123', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/student/get_student', headers={'Authorization': 'Bearer token'})
    assert response.status_code == status.HTTP_200_OK
    assert response.json().get('status') == 'SUCCESS'
    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)


@pytest.mark.asyncio
@patch('app.server.services.student.core_service.read_one', new_callable=AsyncMock)
@patch('app.server.routes.student.JWTAuthUser.__call__', new_callable=Mock)
async def test_student_get_fail_1(mock_jwt_auth_user, mock_read_one):
    mock_jwt_auth_user.side_effect = [{'user_id': 'user123', 'user_type': Role.STUDENT}]

    mock_read_one.side_effect = [None]

    read_one_payload = {'_id': 'user123', 'is_deleted': False}

    async with AsyncClient(app=app, base_url='http://testserver') as client:
        response = await client.get('/student/get_student', headers={'Authorization': 'Bearer token'})
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json().get('detail') == localization.EXCEPTION_USER_NOT_FOUND

    mock_read_one.assert_any_call(Collections.USERS, data_filter=read_one_payload)
