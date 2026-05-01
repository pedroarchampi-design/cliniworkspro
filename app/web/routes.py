from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..services.template_loader import list_exam_types, load_template
from ..models.phrase_template import PhraseTemplate
from ..models.report import Report
from ..schemas.phrase_template import PhraseCreate
from ..schemas.report import ReportCreate, ReportUpdate, ApplySuggestionRequest
from ..services.phrase_matcher import match_phrase
from ..services.pdf_builder import build_printable_html

router = APIRouter()

@router.get('/health')
def health():
    return {'status': 'ok'}

@router.get('/exams')
def exams():
    return {'items': list_exam_types()}

@router.get('/exams/{exam_type}/template')
def exam_template(exam_type: str):
    return load_template(exam_type)

@router.get('/phrases')
def phrases(session: Session = Depends(get_session)):
    return session.exec(select(PhraseTemplate)).all()

@router.post('/phrases')
def create_phrase(payload: PhraseCreate, session: Session = Depends(get_session)):
    row = PhraseTemplate(**payload.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    return row

@router.post('/phrases/match')
def phrases_match(req: ApplySuggestionRequest, exam_type: str, session: Session = Depends(get_session)):
    return match_phrase(session, exam_type, req.structure_name, req.user_text, req.laterality, req.measurements)

@router.post('/reports')
def create_report(payload: ReportCreate, session: Session = Depends(get_session)):
    report = Report(exam_type=payload.exam_type, patient_name=payload.patient_name, content=load_template(payload.exam_type))
    session.add(report); session.commit(); session.refresh(report)
    return report

@router.get('/reports/{id}')
def get_report(id: int, session: Session = Depends(get_session)):
    report = session.get(Report, id)
    if not report: raise HTTPException(404)
    return report

@router.put('/reports/{id}')
def update_report(id: int, payload: ReportUpdate, session: Session = Depends(get_session)):
    report = session.get(Report, id)
    if not report: raise HTTPException(404)
    report.content = payload.content
    session.add(report); session.commit(); session.refresh(report)
    return report

@router.post('/reports/{id}/apply-suggestion')
def apply_suggestion(id: int, req: ApplySuggestionRequest, session: Session = Depends(get_session)):
    report = session.get(Report, id)
    result = match_phrase(session, report.exam_type, req.structure_name, req.user_text, req.laterality, req.measurements)
    return result

@router.post('/reports/{id}/validate')
def validate_report(id: int, session: Session = Depends(get_session)):
    report = session.get(Report, id); report.validated = True; session.add(report); session.commit(); return {'validated': True}

@router.post('/reports/{id}/build')
def build_report(id: int, session: Session = Depends(get_session)):
    return session.get(Report, id)

@router.post('/reports/{id}/preview')
def preview_report(id: int, session: Session = Depends(get_session)):
    report = session.get(Report, id)
    return {'html': build_printable_html(report.content)}

@router.post('/reports/{id}/pdf')
def pdf_report(id: int, session: Session = Depends(get_session)):
    report = session.get(Report, id)
    return {'pdf_status': 'ready', 'html': build_printable_html(report.content)}

@router.post('/similarity/match')
def similarity_match(req: ApplySuggestionRequest, exam_type: str, session: Session = Depends(get_session)):
    return match_phrase(session, exam_type, req.structure_name, req.user_text, req.laterality, req.measurements)
