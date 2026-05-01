def quality_check(report: dict) -> list[str]:
    warnings = []
    if not report.get("required_fields_ok", True):
        warnings.append("Campos obrigatórios pendentes")
    return warnings
