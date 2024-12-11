from typing import Any

from fastapi import APIRouter, Depends

from app.server.models.auth import EmailLoginRequest, OtpRequest, VerifyOtpRequest
from app.server.models.users import AdminUpdateRequest, AdminUserCreateRequest
from app.server.services import admin
from app.server.static.enums import Role
from app.server.utils.token_util import JWTAuthUser

router = APIRouter()


@router.post('/admin/create', summary='Creates new admin accounts')
async def admin_create(params: AdminUserCreateRequest) -> dict[str, Any]:
    data = await admin.create_user(params)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/admin/login', summary='Email based login')
async def admin_login(params: EmailLoginRequest) -> dict[str, Any]:
    data = await admin.login(params)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/admin/send_otp', summary='Send otp to admin email id')
async def send_otp(params: OtpRequest) -> dict[str, Any]:
    data = await admin.send_otp(params)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/admin/verify_otp', summary='Verify otp sent to email id for verification or password reset flow')
async def verify_otp(params: VerifyOtpRequest) -> dict[str, Any]:
    data = await admin.verify_otp(params)
    return {'data': data, 'status': 'SUCCESS'}


@router.post('/admin/refresh', summary='Creates new access token for session maintenance')
# async def refresh_access_token(refresh_token: str = Body(..., embed=True)) -> dict[str, Any]:
async def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    data = await admin.refresh_access_token(refresh_token)
    return {'data': data, 'status': 'SUCCESS'}


@router.put('/admin/update', summary='Update admin profile')
async def admin_update(params: AdminUpdateRequest, user_data=Depends(JWTAuthUser(['ADMIN']))) -> dict[str, Any]:
    data = await admin.admin_update(params, user_data)
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/admin/most_listed_items', summary='Get most listed items')
async def get_most_listed_items(_token=Depends(JWTAuthUser(['ADMIN']))) -> dict[str, Any]:
    data = await admin.get_most_listed_items()
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/admin/most_inquired_items', summary='Get most items buyers are most interested in')
async def get_most_inquired_items(_token=Depends(JWTAuthUser(['ADMIN']))) -> dict[str, Any]:
    data = await admin.get_most_inquired_items()
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/admin/total_revenue', summary='Get total revenue')
async def get_total_revenue(_token=Depends(JWTAuthUser(['ADMIN']))) -> dict[str, Any]:
    data = await admin.get_total_revenue()
    return {'data': data, 'status': 'SUCCESS'}


@router.get('/admin/get_admin', summary='Get admin data')
async def get_admin(user_data=Depends(JWTAuthUser([Role.ADMIN]))) -> dict[str, Any]:
    data = await admin.get_admin(user_data)
    return {'data': data, 'status': 'SUCCESS'}
