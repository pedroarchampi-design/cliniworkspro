from sqlmodel import SQLModel, Field


class Patient(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    full_name: str
    document_id: str | None = None
