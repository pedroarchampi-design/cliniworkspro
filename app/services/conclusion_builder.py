def build_conclusion(validated_findings: list[str]) -> str:
    if not validated_findings:
        return "Sem alterações significativas."
    return " ".join(validated_findings)
