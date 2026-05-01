from sqlmodel import Session, select
from ..models.phrase_template import PhraseTemplate
from ..schemas.similarity import MatchResult
from ..similarity.lexical_matcher import lexical_score
from ..similarity.semantic_matcher import semantic_score
from ..similarity.ranker import rank_score


def match_phrase(session: Session, exam_type: str, structure_name: str, user_text: str, laterality: str | None = None, measurements: dict | None = None) -> MatchResult:
    phrases = session.exec(
        select(PhraseTemplate).where(
            PhraseTemplate.exam_type == exam_type,
            PhraseTemplate.structure_name == structure_name,
            PhraseTemplate.active == True,
        )
    ).all()
    if not phrases:
        return MatchResult(best_phrase_id=None, suggested_text=user_text, confidence_score=0.0, match_reason="no_phrase_found", alternatives=[], required_edits=["manual_review"], warning_flags=["low_confidence"])

    scored = []
    for p in phrases:
        lx = lexical_score(user_text, p.canonical_text)
        sm = semantic_score(user_text, p.canonical_text)
        scored.append((rank_score(lx, sm), p))
    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best = scored[0]
    flags = []
    reason = "high_match" if best_score >= 0.85 else "probable_match" if best_score >= 0.65 else "low_confidence"
    if best_score < 0.65:
        flags.append("low_confidence")

    return MatchResult(
        best_phrase_id=best.id,
        suggested_text=best.canonical_text,
        confidence_score=best_score,
        match_reason=reason,
        alternatives=[item[1].canonical_text for item in scored[1:4]],
        required_edits=[] if best_score >= 0.85 else ["manual_review"],
        warning_flags=flags,
    )
