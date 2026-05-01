from pydantic import BaseModel


class MatchResult(BaseModel):
    best_phrase_id: int | None
    suggested_text: str
    confidence_score: float
    match_reason: str
    alternatives: list[str] = []
    required_edits: list[str] = []
    warning_flags: list[str] = []
