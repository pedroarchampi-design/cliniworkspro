from pathlib import Path
import yaml

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates" / "any_report"


def list_exam_types() -> list[str]:
    return sorted(p.stem for p in TEMPLATE_DIR.glob("*.yaml"))


def load_template(exam_type: str) -> dict:
    path = TEMPLATE_DIR / f"{exam_type}.yaml"
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)
