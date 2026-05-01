from pydantic import BaseModel


class PhraseCreate(BaseModel):
    exam_type: str
    structure_name: str
    section_name: str
    phrase_type: str
    original_text: str
    canonical_text: str
