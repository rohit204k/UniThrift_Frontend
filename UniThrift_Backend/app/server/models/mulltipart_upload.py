from pydantic import constr

from app.server.models.generic import BaseModel


class InitiateUpload(BaseModel):
    course_id: constr(min_length=24, max_length=24)
    file_name: str


class GenerateMultipartPresigned(BaseModel):
    upload_id: str
    part_number: int


class CaptureEtag(BaseModel):
    upload_id: str
    part_number: int
    etag: str


class CompleteMultipartUpload(BaseModel):
    upload_id: str
