from pydantic import BaseModel
from typing import Any


class ReportCreate(BaseModel):
    exam_type: str
    patient_name: str | None = None


class ReportUpdate(BaseModel):
    content: dict[str, Any]


class ApplySuggestionRequest(BaseModel):
    structure_name: str
    user_text: str
    laterality: str | None = None
    measurements: dict[str, Any] | None = None
