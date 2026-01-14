"""Shared domain models for BI-RADS analysis and exam comparison."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from enum import Enum


class SuggestedSegment(str, Enum):
    """Suggested breast segment based on quadrant and clock position."""

    UPPER_OUTER = "upper_outer"
    UPPER_INNER = "upper_inner"
    LOWER_OUTER = "lower_outer"
    LOWER_INNER = "lower_inner"
    CENTRAL = "central"
    AXILLARY_TAIL = "axillary_tail"


@dataclass(frozen=True)
class JayVisionFrame:
    """Representation of a frame captured via Jay Vision integration."""

    frame_id: str
    captured_at: date
    source_uri: str


@dataclass(frozen=True)
class NoduleFeatures:
    """Structured features derived from imaging following BI-RADS terminology."""

    shape: str
    margin: str
    echo_pattern: str
    posterior_features: str
    calcifications: str | None
    size_mm: float
    clock_position: int
    distance_from_nipple_mm: float


@dataclass(frozen=True)
class BiradsAssessment:
    """Assessment returned to the user."""

    category: str
    rationale: str
    suggested_segment: SuggestedSegment


@dataclass(frozen=True)
class ExamRecord:
    """Summary of an imaging exam to compare against."""

    exam_date: date
    birads_category: str
    size_mm: float


@dataclass(frozen=True)
class ExamComparison:
    """Comparison summary between the current and prior exams."""

    current_exam: ExamRecord
    prior_exam: ExamRecord | None
    size_change_mm: float | None
    category_change: str
    summary: str
