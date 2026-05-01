from pydantic import BaseModel
from typing import Any


class ExamTemplateResponse(BaseModel):
    exam_type: str
    title: str
    sections: list[dict[str, Any]]
