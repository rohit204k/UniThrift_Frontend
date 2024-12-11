from typing import Any, Optional

import pydantic
from bson import ObjectId

import app.server.database.core_data as core_service
from app.server.static.collections import Collections

pydantic.json.ENCODERS_BY_TYPE[ObjectId] = str


async def get_universities(page: int, page_size: int, search_query: Optional[str]) -> list[dict[str, Any]]:
    """
    Get a paginated list of universities.

    Args:
        page (int): The page number to retrieve.
        page_size (int): The number of items to retrieve per page.
        search_query (Optional[str]): A query string to filter the students by name.

    Returns:
        list[dict[str, Any]]: A list of dictionaries representing the universities.

    Raises:
        None
    """
    aggregate_query: list[dict[str, Any]] = [{'$match': {'name': {'$regex': search_query, '$options': 'i'}}}, {'$sort': {'name': 1}}] if search_query else [{'$sort': {'name': 1}}]
    return await core_service.query_read(collection_name=Collections.UNIVERSITIES, aggregate=aggregate_query, page=page, page_size=page_size, paging_data=True)
