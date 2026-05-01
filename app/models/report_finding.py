from sqlmodel import SQLModel, Field


class ReportFinding(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    report_id: int = Field(index=True)
    structure_name: str
    user_text: str
    suggested_text: str | None = None
    confidence_score: float | None = None
    accepted: bool = False
