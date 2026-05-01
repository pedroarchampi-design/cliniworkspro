from typing import Any
from sqlmodel import SQLModel, Field


class Report(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    exam_type: str
    patient_name: str | None = None
    status: str = "draft"
    content: dict[str, Any] = Field(default_factory=dict)
    validated: bool = False
