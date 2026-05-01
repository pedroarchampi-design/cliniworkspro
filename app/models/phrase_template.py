from typing import Any
from sqlmodel import SQLModel, Field


class PhraseTemplate(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    exam_type: str = Field(index=True)
    structure_name: str = Field(index=True)
    section_name: str
    phrase_type: str
    original_text: str
    canonical_text: str
    keywords: list[str] = Field(default_factory=list)
    synonyms: list[str] = Field(default_factory=list)
    variables_schema: dict[str, Any] = Field(default_factory=dict)
    laterality_required: bool = False
    measurement_required: bool = False
    severity: str | None = None
    source: str = "any_report"
    active: bool = True
