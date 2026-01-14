"""Exam comparison helpers."""

from __future__ import annotations

from .models import ExamComparison, ExamRecord


def compare_exams(current_exam: ExamRecord, prior_exam: ExamRecord | None) -> ExamComparison:
    """Compare current exam to the most recent prior exam."""

    if prior_exam is None:
        return ExamComparison(
            current_exam=current_exam,
            prior_exam=None,
            size_change_mm=None,
            category_change="initial",
            summary="Sem exame anterior para comparação.",
        )

    size_change = current_exam.size_mm - prior_exam.size_mm
    category_change = _describe_category_change(current_exam.birads_category, prior_exam.birads_category)
    summary = (
        "Comparação com exame anterior: "
        f"variação de tamanho {size_change:+.1f} mm, "
        f"mudança de categoria {category_change}."
    )

    return ExamComparison(
        current_exam=current_exam,
        prior_exam=prior_exam,
        size_change_mm=size_change,
        category_change=category_change,
        summary=summary,
    )


def _describe_category_change(current: str, prior: str) -> str:
    if current == prior:
        return "sem alteração"
    return f"{prior} → {current}"
