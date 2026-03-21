"""BI-RADS assessment utilities powered by Jay Vision outputs."""

from __future__ import annotations

from dataclasses import dataclass

from .models import BiradsAssessment, JayVisionFrame, NoduleFeatures, SuggestedSegment


@dataclass(frozen=True)
class JayVisionPayload:
    """Normalized payload from Jay Vision for downstream analysis."""

    frame: JayVisionFrame
    features: NoduleFeatures


def analyze_nodule_image(payload: JayVisionPayload) -> BiradsAssessment:
    """Return a BI-RADS suggestion based on the extracted features.

    This function expects that the mobile camera integration has already
    provided a Jay Vision payload containing the extracted features. The
    output includes a suggested segment to display to the user.
    """

    features = payload.features
    suspicion_score = _score_features(features)
    category = _category_from_score(suspicion_score)
    segment = _segment_from_location(features.clock_position)
    rationale = (
        "Avaliação baseada nos critérios BI-RADS fornecidos. "
        f"Pontuação de suspeição: {suspicion_score}."
    )

    return BiradsAssessment(category=category, rationale=rationale, suggested_segment=segment)


def _score_features(features: NoduleFeatures) -> int:
    """Assign a suspicion score using simplified BI-RADS heuristics."""

    score = 0
    if features.shape.lower() in {"irregular", "lobulated"}:
        score += 2
    if features.margin.lower() in {"spiculated", "microlobulated", "indistinct"}:
        score += 3
    if features.echo_pattern.lower() in {"hypoechoic", "complex"}:
        score += 1
    if features.posterior_features.lower() in {"shadowing", "attenuation"}:
        score += 1
    if features.calcifications and features.calcifications.lower() not in {"none", "absent"}:
        score += 1
    if features.size_mm >= 20:
        score += 1
    return score


def _category_from_score(score: int) -> str:
    """Map a score into a BI-RADS category suggestion."""

    if score <= 1:
        return "BI-RADS 2"
    if score <= 3:
        return "BI-RADS 3"
    if score <= 5:
        return "BI-RADS 4"
    return "BI-RADS 5"


def _segment_from_location(clock_position: int) -> SuggestedSegment:
    """Suggest a segment based on clock position input."""

    if clock_position in {10, 11, 12, 1, 2}:
        return SuggestedSegment.UPPER_OUTER
    if clock_position in {3, 4}:
        return SuggestedSegment.LOWER_OUTER
    if clock_position in {5, 6, 7}:
        return SuggestedSegment.LOWER_INNER
    if clock_position in {8, 9}:
        return SuggestedSegment.UPPER_INNER
    return SuggestedSegment.CENTRAL
