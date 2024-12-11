import httpx
from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder

from app.server.config import config


class RestClient:
    def __init__(self, base_url: str = '', timeout: httpx.Timeout = None) -> None:
        self.client = httpx.AsyncClient()
        self.client.base_url = base_url
        self.client.timeout = timeout

    @classmethod
    def init(cls, base_url='', timeout=httpx.Timeout(240.0, connect=10.0)):
        return cls(base_url, timeout)

    async def post(self, end_point: str, params=None, body=None, headers=None):
        try:
            response = await self.client.post(end_point, params=params, json=jsonable_encoder(body), headers=headers)
            response = response.json()
            return response
        except httpx.ConnectError as error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f'{error.request.url.port} service unavailable') from error
        except Exception as error:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)) from error

    async def get(self, end_point: str, params=None, headers=None):
        try:
            response = await self.client.get(end_point, params=params, headers=headers)
            response = response.json()
            return response
        except httpx.ConnectError as error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f'{error.request.url.port} service unavailable') from error
        except Exception as error:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)) from error

    async def patch(self, end_point: str, params=None, body=None, headers=None):
        try:
            response = await self.client.patch(end_point, params=params, json=jsonable_encoder(body), headers=headers)
            response = response.json()
            return response
        except httpx.ConnectError as error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f'{error.request.url.port} service unavailable') from error
        except Exception as error:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)) from error

    async def put(self, end_point: str, params=None, body=None, headers=None):
        try:
            response = await self.client.put(end_point, params=params, json=jsonable_encoder(body), headers=headers)
            response = response.json()
            return response
        except httpx.ConnectError as error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f'{error.request.url.port} service unavailable') from error
        except Exception as error:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)) from error

    async def delete(self, end_point: str, params=None, body=None, headers=None):
        try:
            response = await self.client.request('DELETE', end_point, params=params, json=jsonable_encoder(body), headers=headers)
            response = response.json()
            return response
        except httpx.ConnectError as error:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f'{error.request.url.port} service unavailable') from error
        except Exception as error:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error)) from error


auth_client = RestClient(base_url=config.AUTH_SERVICE_BASE_URL)
