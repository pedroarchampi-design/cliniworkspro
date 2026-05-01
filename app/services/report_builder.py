def build_report_payload(template: dict, findings: dict) -> dict:
    payload = template.copy()
    payload["findings"] = findings
    return payload
