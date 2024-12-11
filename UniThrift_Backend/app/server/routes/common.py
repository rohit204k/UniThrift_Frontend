from typing import Any, Optional

from fastapi import APIRouter

from app.server.services import common

router = APIRouter()


@router.get('/common/get_universities', summary='Gets list of all Universities')
async def get_all_universities(page: int = 1, page_size: int = 10, search_query: Optional[str] = None) -> dict[str, Any]:
    data = await common.get_universities(page=page, page_size=page_size, search_query=search_query)
    return {'data': data, 'status': 'SUCCESS'}
