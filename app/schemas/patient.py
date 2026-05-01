from pydantic import BaseModel


class PatientCreate(BaseModel):
    full_name: str
    document_id: str | None = None
