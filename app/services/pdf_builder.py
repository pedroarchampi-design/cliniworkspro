def build_printable_html(report: dict) -> str:
    return f"<html><body><h1>{report.get('title','Laudo')}</h1><pre>{report}</pre></body></html>"
