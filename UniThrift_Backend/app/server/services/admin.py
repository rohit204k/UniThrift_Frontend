import asyncio
from datetime import timedelta
from typing import Any, Optional

from fastapi import HTTPException, status

import app.server.database.core_data as core_service
from app.server.models.auth import EmailLoginRequest, OtpCreateDB, OtpRequest, VerificationType, VerifyOtpRequest
from app.server.models.password import PasswordCreateDB
from app.server.models.users import AdminUpdateDB, AdminUpdateRequest, AdminUserCreateDB, AdminUserCreateRequest
from app.server.static import constants, localization
from app.server.static.collections import Collections
from app.server.static.enums import Role, TokenType
from app.server.utils import crypto_utils, date_utils, password_utils, template_util, token_util
from app.server.vendor.twilio import email as email_service


async def create_user(params: AdminUserCreateRequest) -> dict[str, Any]:
    """
    Creates a new admin user.

    Args:
        params (UserCreateRequest): Request body containing User user data.

    Returns:
        dict[str, Any]: Dictionary containing the user data.

    Raises:
        HTTPException: If user with the same email already exists.
        HTTPException: If user with the same University ID already exists.
    """
    user_data = params.dict()

    existing_email = await core_service.read_one(Collections.USERS, data_filter={'email': params.email, 'is_deleted': False})
    if existing_email:
        raise HTTPException(status.HTTP_409_CONFLICT, localization.EXCEPTION_EMAIL_EXISTS)

    existing_university_id = await core_service.read_one(Collections.USERS, data_filter={'university_id': params.university_id, 'is_deleted': False})
    if existing_university_id:
        raise HTTPException(status.HTTP_409_CONFLICT, localization.EXCEPTION_UNIVERSITY_ID_EXISTS)

    user_data['user_type'] = Role.ADMIN
    user_data['is_verified'] = False
    password = user_data.pop('password')
    # password = crypto_utils.sha1(password)
    encrypted_password = crypto_utils.sha256(password)
    # Running transactions in mongo. Transactions require cluster setup.
    # If any db operation within the content of a transaction fails, the entire transaction is rolled back.
    async with await core_service.get_session() as session:
        async with session.start_transaction():
            user_data = AdminUserCreateDB(**user_data).dict(exclude_none=True)
            create_user_res = await core_service.update_one(Collections.USERS, data_filter={'email': params.email}, update={'$set': user_data}, upsert=True, session=session)

            password_data = {'user_id': create_user_res['_id'], 'password': encrypted_password}
            password_data = PasswordCreateDB(**password_data)
            password_data = password_data.dict(exclude_none=True)
            await core_service.update_one(Collections.PASSWORD, data_filter={'user_id': create_user_res['_id']}, update={'$set': password_data}, upsert=True, session=session)

    return {'message': 'Admin user created successfully'}


async def login(params: EmailLoginRequest) -> dict[str, Any]:
    """
    Authenticates a user by email and password.

    Args:
        params (EmailLoginRequest): An instance containing the email and password of the user.

    Returns:
        dict: A dictionary containing a JWT token and user information if authentication is successful.

    Raises:
        HTTPException 404: If the user does not exist.
        HTTPException 425: If the user does not have a password or a valid temporary password.
        HTTPException 401: If the user is inactive(deleted).
    """

    existing_user = await core_service.read_one(Collections.USERS, data_filter={'email': params.email, 'is_deleted': False})

    if not existing_user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)

    if existing_user['user_type'] != Role.ADMIN:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, localization.EXCEPTION_UNAUTHORIZED_ACCESS)

    # is_verified_user = await core_service.read_one(Collections.USERS, data_filter={'email': params.email, 'is_verified': False})
    if not existing_user.get('is_verified'):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, localization.EXCEPTION_USER_NOT_VERIFIED)

    existing_password = await core_service.read_one(Collections.PASSWORD, data_filter={'user_id': existing_user['_id']})

    if not existing_password:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)

    password_utils.check_password(params.password, existing_password['password'])
    token_payload = {'user_id': existing_user['_id'], 'user_type': existing_user['user_type']}
    token_data = await create_login_token(token_payload)
    asyncio.create_task(core_service.update_one(Collections.USERS, data_filter={'_id': existing_user['_id']}, update={'$set': {'last_login': date_utils.get_current_timestamp()}}))
    return {**token_data, 'user_id': existing_user['_id'], 'user_type': existing_user['user_type']}


async def create_login_token(token_payload: dict[str, Any]) -> dict[str, Any]:
    """
    Creates a login token and stores it in the database.

    Args:
        token_payload (dict[str, Any]): A dictionary containing the payload for the JWT token.

    Returns:
        dict[str, Any]: A dictionary containing the access and refresh tokens.
    """
    access_token, access_token_expiry = token_util.create_jwt_token(token_payload, timedelta(days=1), token_type=TokenType.BEARER)
    refresh_token, _ = token_util.create_jwt_token(token_payload, timedelta(days=30), token_type=TokenType.REFRESH)
    await core_service.create_one(Collections.ACCESS_TOKENS, {**token_payload, 'access_token': access_token, 'refresh_token': refresh_token})
    return {'access_token': access_token, 'access_token_expiry': access_token_expiry, 'refresh_token': refresh_token}


async def refresh_access_token(token: str):
    """
    Refreshes the access token for a user.

    Args:
        token (str): The JWT refresh token.

    Raises:
        HTTPException: If the token is invalid or does not exist in the database.

    Returns:
        dict: A dictionary containing the new access token and its expiry time.
    """
    refresh_token_payload = token_util.verify_jwt_token(token, remove_reserved_claims=True)
    if refresh_token_payload['token_type'] != TokenType.REFRESH:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=localization.EXCEPTION_REFRESH_TOKEN_INVALID)
    existing_refresh_token = await core_service.read_one(Collections.ACCESS_TOKENS, data_filter={'user_id': refresh_token_payload['user_id'], 'refresh_token': token})
    if not existing_refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=localization.EXCEPTION_REFRESH_TOKEN_INVALID)
    access_token, access_token_expiry = token_util.create_jwt_token(refresh_token_payload, timedelta(days=1))
    del refresh_token_payload['token_type']
    await core_service.create_one(Collections.ACCESS_TOKENS, {**refresh_token_payload, 'access_token': access_token, 'refresh_token': token})
    return {'access_token': access_token, 'access_token_expiry': access_token_expiry}


async def send_otp(params: OtpRequest):
    """
    Sends an email to the user with a randomly generated OTP.

    Args:
      email: An email address as a string of the user requesting a new password.

    Returns:
      A dictionary containing user_id of the user.

    Raises:
      HTTPException: If the user is not found in the database.
    """
    existing_user = await core_service.read_one(Collections.USERS, data_filter={'email': params.email, 'user_type': Role.ADMIN, 'is_deleted': False})
    if not existing_user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)

    otp = password_utils.generate_random_otp(6)

    otp_data = {'user_id': existing_user['_id'], 'otp': otp, 'is_used': False, 'used_for': params.verification_type, 'expiry': date_utils.get_timestamp(expires_delta=timedelta(hours=1))}

    otp_data = OtpCreateDB(**otp_data)
    otp_data = otp_data.dict(exclude_none=True)
    await core_service.update_one(Collections.OTP, data_filter={'user_id': existing_user['_id']}, update={'$set': otp_data}, upsert=True)

    # send email with default password and unique id
    if params.verification_type == VerificationType.AUTHENTICATION:
        template_path = constants.VERIFICATION_TEMPLATE_PATH
        email_header = constants.VERIFICATION_MAIL_HEADER
    else:
        template_path = constants.FORGOT_PASSWORD_TEMPLATE_PATH
        email_header = constants.FORGOT_PASSWORD_MAIL_HEADER

    template = await template_util.get_template(template_path, user_name=f'{existing_user["first_name"]} {existing_user["last_name"]}', otp=otp)

    await email_service.send_email([params.email], email_header, template, is_html=True)

    return {'message': 'Mail sent successfully'}


async def verify_otp(params: VerifyOtpRequest):
    """Verify the OTP sent to the user email id provided in forgot password method.

    Args:
        params (VerifyOtpRequest): Request body containing the OTP and new password details.

    Raises:
        HTTPException: 404 NOT FOUND is user is not present.
        HTTPException: 404 NOT FOUND is OTP is not found for the user.
        HTTPException: 401 UNAUTHORIZED if the OTP is expired.
        HTTPException: 401 UNAUTHORIZED if the otp does not match.

    Returns:
        A dictionary containing success message.
    """
    user_data = params.dict()

    existing_user = await core_service.read_one(Collections.USERS, data_filter={'email': params.email})
    if not existing_user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)

    existing_otp = await core_service.read_one(Collections.OTP, data_filter={'user_id': existing_user['_id']})
    if not existing_otp:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_OTP_NOT_FOUND)

    if existing_otp['expiry'] < date_utils.get_current_timestamp():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, localization.EXCEPTION_OTP_EXPIRED)

    if user_data['otp'] != existing_otp['otp'] or existing_otp['is_used']:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, localization.EXCEPTION_OTP_INVALID)

    if user_data['verification_type'] == VerificationType.FORGOT_PASSWORD:
        password = user_data['password']
        # password = crypto_utils.sha1(password)
        encrypted_password = crypto_utils.sha256(password)
        password_data = {'user_id': existing_user['_id'], 'password': encrypted_password}
        password_data = PasswordCreateDB(**password_data)
        password_data = password_data.dict(exclude_none=True)
        await core_service.update_one(Collections.PASSWORD, data_filter={'user_id': password_data['user_id']}, update={'$set': password_data}, upsert=True)

        # return {'message': 'Password updated successfully'}

    else:
        async with await core_service.get_session() as session:
            async with session.start_transaction():
                await core_service.update_one(Collections.USERS, data_filter={'_id': existing_user['_id']}, update={'$set': {'is_verified': True}}, upsert=True, session=session)

                await core_service.update_one(Collections.OTP, data_filter={'user_id': existing_user['_id']}, update={'$set': {'is_used': True}}, upsert=True, session=session)

    return {'message': 'User verified successfully'}


async def get_users_paginated(page: int, page_size: int, search_query: Optional[str]) -> list[dict[str, Any]]:
    """
    Get a paginated list of users.

    Args:
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.
        search_query (Optional[str]): A query string to filter the users by name.

    Returns:
        list[dict[str, Any]]: A list of dictionaries representing the users.

    Raises:
        None
    """
    aggregate_query: list[dict[str, Any]] = [{'$match': {'name': {'$regex': search_query, '$options': 'i'}}}, {'$sort': {'name': 1}}] if search_query else [{'$sort': {'name': 1}}]

    return await core_service.query_read(collection_name=Collections.USERS, aggregate=aggregate_query, page=page, page_size=page_size, paging_data=True)


async def get_an_user(user_id: str) -> dict[str, Any]:
    """
    Get an user by ID.

    Args:
        user_id (str): The ID of the user to retrieve.

    Returns:
        dict[str, Any]: A dictionary containing the user information.

    Raises:
        None
    """
    return await core_service.read_one(collection_name=Collections.USERS, data_filter={'_id': user_id, 'is_deleted': False})


async def admin_update(params: AdminUpdateRequest, user_data) -> dict[str, Any]:
    """Update student information

    Args:
        params (UserUpdateRequest): Request body containing user update information.
        user (_type_): _description_

    Raises:
        HTTPException: 404 NOT FOUND student not found.

    Returns:
        dict[str, Any]: A dictionary object with success message.
    """

    params = params.dict()

    existing_user = await core_service.read_one(Collections.USERS, data_filter={'_id': user_data.get('user_id')})
    if not existing_user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)

    params = AdminUpdateDB(**params)

    # await core_service.update_one(Collections.USERS, data_filter={'email': params.email}, update={'$set': user_data}, upsert=True)
    await core_service.update_one(Collections.USERS, data_filter={'_id': user_data.get('user_id')}, update={'$set': params.dict(exclude_none=True)}, upsert=True)

    return {'message': 'User updated successfully'}


async def get_users(page: int, page_size: int, search_query: Optional[str]) -> list[dict[str, Any]]:
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
    aggregate_query: list[dict[str, Any]] = [{'$match': {'name': {'$regex': search_query, '$options': 'i'}}}, {'$sort': {'name': 1}}] if search_query else [{'$sort': {'name': 1}}]

    return await core_service.query_read(collection_name=Collections.USERS, aggregate=aggregate_query, page=page, page_size=page_size, paging_data=True)


async def get_user(user_data: dict[str, Any]) -> dict[str, Any]:
    """Get student details

    Args:
        user_data (dict[str, Any]): Token data of the student

    Returns:
        dict[str, Any]: A dictionary object with student details
    """
    return await core_service.read_one(collection_name=Collections.USERS, data_filter={'_id': user_data.get('user_id'), 'is_deleted': False})


async def get_most_listed_items() -> dict[str, Any]:
    """
    Retrieve the top 5 most listed items.

    This function aggregates and sorts the listings by item name to find
    the top 5 most frequently listed items.

    Returns:
        list[dict[str, Any]]: A list of dictionaries containing item names
        and their respective listing counts.

    Raises:
        None
    """
    aggregate_query: list[dict[str, Any]] = [
        {'$group': {'_id': '$item_name', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 5},
        {'$project': {'_id': 0, 'item_name': '$_id', 'count': 1}},
    ]
    return await core_service.query_read(collection_name=Collections.LISTINGS, aggregate=aggregate_query, paging_data=False)


async def get_most_inquired_items() -> dict[str, Any]:
    """
    Retrieve the top 5 most inquired items.

    This function aggregates and sorts the inquiries by item name to find
    the top 5 most frequently inquired items.

    Returns:
        list[dict[str, Any]]: A list of dictionaries containing item names
        and their respective inquiry counts.

    Raises:
        None
    """
    aggregate_query: list[dict[str, Any]] = [
        {'$group': {'_id': '$listing_id', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 5},
        {'$lookup': {'from': 'listings', 'localField': '_id', 'foreignField': '_id', 'as': 'listing_details'}},
        {'$unwind': '$listing_details'},
        {'$project': {'_id': 0, 'item_name': '$listing_details.item_name', 'count': 1}},
        {'$group': {'_id': '$item_name', 'count': {'$sum': '$count'}}},
        {'$sort': {'count': -1}},
    ]

    return await core_service.query_read(collection_name=Collections.TRANSACTIONS, aggregate=aggregate_query, paging_data=False)


async def get_total_revenue() -> dict[str, Any]:
    """
    Retrieve the total revenue generated by all sold listings.

    This function aggregates all sold transactions, looks up the listing prices,
    and sums them up to get the total revenue.

    Returns:
        dict[str, Any]: A dictionary containing the total revenue.

    Raises:
        None
    """
    aggregate_query: list[dict[str, Any]] = [
        {'$match': {'status': 'SOLD'}},
        {'$group': {'_id': {'year': {'$year': {'$toDate': '$updated_at'}}, 'month': {'$month': {'$toDate': '$updated_at'}}}, 'total_price': {'$sum': '$price'}}},
        {'$addFields': {'year': '$_id.year', 'month': '$_id.month', 'revenue': '$total_price'}},
        {'$project': {'_id': 0, 'year': 1, 'month': 1, 'revenue': 1}},
        {'$sort': {'year': 1, 'month': 1}},
    ]

    return await core_service.query_read(collection_name=Collections.LISTINGS, aggregate=aggregate_query, paging_data=False)


async def get_admin(user_data: dict[str, Any]) -> dict[str, Any]:
    """Get student details

    Args:
        user_data (dict[str, Any]): Token data of the student

    Returns:
        dict[str, Any]: A dictionary object with student details
    """
    user_data = await core_service.read_one(collection_name=Collections.USERS, data_filter={'_id': user_data.get('user_id'), 'is_deleted': False})
    if not user_data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, localization.EXCEPTION_USER_NOT_FOUND)

    return user_data
