from typing import Any
from sqlmodel import SQLModel, Field


class ExamTemplate(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    exam_type: str = Field(index=True, unique=True)
    title: str
    content: dict[str, Any]
