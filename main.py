# ============================================================
# DeltaScan — Single File for Replit
# Backend (FastAPI + LangGraph) + Frontend (HTML embedded)
# Env vars needed in Replit Secrets:
# OPENAI_API_KEY, GOOGLE_APPLICATION_CREDENTIALS_JSON,
# STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FIREBASE_CREDENTIALS_JSON
# ============================================================

import os, json, base64, asyncio
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn

# ── Configurar credenciais Google via env var (Replit Secrets) ──

_gcp_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if _gcp_creds:
    with open("/tmp/gcp_creds.json", "w") as f:
        f.write(_gcp_creds)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/tmp/gcp_creds.json"

_firebase_creds = os.environ.get("FIREBASE_CREDENTIALS_JSON")
if _firebase_creds:
    with open("/tmp/firebase_creds.json", "w") as f:
        f.write(_firebase_creds)

# ── Imports condicionais (falham graciosamente se lib ausente) ──

try:
    import openai
    OPENAI_OK = True
except ImportError:
    OPENAI_OK = False

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
    VERTEX_OK = True
except ImportError:
    VERTEX_OK = False

try:
    from google.cloud import firestore
    DB = firestore.Client(project=os.environ.get("GCP_PROJECT", "deltarc"))
    FIRESTORE_OK = True
except Exception:
    FIRESTORE_OK = False
    DB = None

try:
    import firebase_admin
    from firebase_admin import credentials as fb_creds, auth as fb_auth
    if _firebase_creds:
        cred = fb_creds.Certificate("/tmp/firebase_creds.json")
        firebase_admin.initialize_app(cred)
    FIREBASE_OK = True
except Exception:
    FIREBASE_OK = False

try:
    import stripe
    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
    STRIPE_OK = True
except ImportError:
    STRIPE_OK = False

try:
    from langgraph.graph import StateGraph, END
    from typing import TypedDict
    LANGGRAPH_OK = True
except ImportError:
    LANGGRAPH_OK = False

# ════════════════════════════════════════════════════════════════
# PIPELINE LANGGRAPH
# ════════════════════════════════════════════════════════════════

if LANGGRAPH_OK:
    class DeltaScanState(TypedDict):
        audio_bytes: Optional[bytes]
        image_bytes: Optional[bytes]
        doctor_id: str
        doctor_specialty: str
        patient_id: Optional[str]
        doctor_notes: Optional[str]
        transcription: Optional[str]
        hypotheses: Optional[List[dict]]
        care_plan: Optional[dict]
        image_impression: Optional[str]
        image_base64: Optional[str]
        patient_materials: Optional[dict]
        error: Optional[str]

    # ── Agente 1: Transcrição Whisper ──
    def agent_transcription(state: dict) -> dict:
        audio_bytes = state.get("audio_bytes")
        if not audio_bytes or not OPENAI_OK:
            return {**state, "transcription": "[transcrição simulada para teste]"}
        import io
        client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        buf = io.BytesIO(audio_bytes)
        buf.name = "audio.webm"
        resp = client.audio.transcriptions.create(model="whisper-1", file=buf, language="pt")
        return {**state, "transcription": resp.text}

    # ── Agente 2: Hipóteses Clínicas (Gemini/Vertex) ──
    def agent_clinical(state: dict) -> dict:
        transcription = state.get("transcription", "")
        specialty = state.get("doctor_specialty", "Clínica Geral")
        if not transcription or not VERTEX_OK:
            return {
                **state,
                "hypotheses": [{"rank": 1, "condition": "Hipótese simulada", "reasoning": "Modo demo", "probability": "alta"}],
                "care_plan": {"immediate_actions": ["Ação demo"], "exams": [], "prescription": "Prescrição demo", "follow_up": "7 dias"},
            }
        vertexai.init(project=os.environ.get("GCP_PROJECT", "deltarc"), location="us-central1")
        model = GenerativeModel("gemini-1.5-pro")
        prompt = f"""Você é assistente clínico para médicos de {specialty}.

Com base na transcrição abaixo, gere hipóteses diagnósticas e plano de cuidado.
IMPORTANTE: Use sempre "hipótese diagnóstica", nunca "diagnóstico".

Transcrição: {transcription}

Responda APENAS em JSON:
{{
  "hypotheses": [{{"rank":1,"condition":"nome","reasoning":"justificativa","probability":"alta/média/baixa"}}],
  "care_plan": {{"immediate_actions":[],"exams":[],"prescription":"texto","follow_up":"orientação"}}
}}"""
        resp = model.generate_content(prompt)
        try:
            result = json.loads(resp.text.strip().replace("```json", "").replace("```", ""))
        except Exception:
            result = {"hypotheses": [], "care_plan": {"prescription": resp.text}}
        return {**state, "hypotheses": result.get("hypotheses", []), "care_plan": result.get("care_plan", {})}

    # ── Agente 3: Comparação de Imagens ──
    def agent_image(state: dict) -> dict:
        image_bytes = state.get("image_bytes")
        if not image_bytes or not VERTEX_OK:
            return {**state, "image_impression": None}
        vertexai.init(project=os.environ.get("GCP_PROJECT", "deltarc"), location="us-central1")
        model = GenerativeModel("gemini-1.5-pro-vision")
        resp = model.generate_content([
            Part.from_data(data=image_bytes, mime_type="image/jpeg"),
            "Analise esta imagem médica. Descreva achados relevantes em linguagem técnica. Isso é uma IMPRESSÃO, não um diagnóstico.",
        ])
        img_b64 = base64.b64encode(image_bytes).decode()
        return {**state, "image_impression": resp.text, "image_base64": img_b64}

    # ── Agente 4: Materiais para o Paciente ──
    def agent_patient(state: dict) -> dict:
        hypotheses = state.get("hypotheses", [])
        care_plan = state.get("care_plan", {})
        if not VERTEX_OK:
            return {
                **state,
                "patient_materials": {
                    "simple_explanation": "Explicação simulada para o paciente.",
                    "daily_guidelines": ["Repouso", "Hidratação"],
                    "alert_signs": ["Febre alta", "Piora dos sintomas"],
                    "faq": [{"question": "Quando devo retornar?", "answer": "Em 7 dias ou antes se piorar."}],
                },
            }
        vertexai.init(project=os.environ.get("GCP_PROJECT", "deltarc"), location="us-central1")
        model = GenerativeModel("gemini-1.5-pro")
        top = hypotheses[0]["condition"] if hypotheses else "condição avaliada"
        prompt = f"""Você é comunicador médico especialista em educação do paciente.

Sobre: {top}. Plano: {json.dumps(care_plan, ensure_ascii=False)}

Gere material educativo em linguagem simples para o paciente.
Responda APENAS em JSON:
{{
  "simple_explanation":"texto",
  "daily_guidelines":["item"],
  "alert_signs":["sinal"],
  "faq":[{{"question":"q","answer":"a"}}]
}}"""
        resp = model.generate_content(prompt)
        try:
            result = json.loads(resp.text.strip().replace("```json", "").replace("```", ""))
        except Exception:
            result = {"simple_explanation": resp.text, "daily_guidelines": [], "alert_signs": [], "faq": []}
        return {**state, "patient_materials": result}

    # ── Compilar o grafo ──
    def build_pipeline():
        g = StateGraph(DeltaScanState)
        g.add_node("transcription", agent_transcription)
        g.add_node("clinical", agent_clinical)
        g.add_node("image", agent_image)
        g.add_node("patient", agent_patient)
        g.set_entry_point("transcription")
        g.add_edge("transcription", "clinical")
        g.add_edge("transcription", "image")
        g.add_edge("clinical", "patient")
        g.add_edge("image", "patient")
        g.add_edge("patient", END)
        return g.compile()

    PIPELINE = build_pipeline()
else:
    PIPELINE = None


# ════════════════════════════════════════════════════════════════
# FASTAPI APP
# ════════════════════════════════════════════════════════════════

app = FastAPI(title="DeltaScan", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Auth helpers ─────────────────────────────────────────────

import secrets, hashlib, time


def make_token(doctor_id: str) -> str:
    payload = f"{doctor_id}:{time.time()}:{secrets.token_hex(16)}"
    return base64.b64encode(payload.encode()).decode()


def verify_token(authorization: str = Header(default=None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Token ausente")
    try:
        token = authorization.replace("Bearer ", "")
        if FIREBASE_OK:
            decoded = fb_auth.verify_id_token(token)
            return decoded["uid"]
        payload = base64.b64decode(token.encode()).decode()
        doctor_id = payload.split(":")[0]
        return doctor_id
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


# ── Rotas ────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "DeltaScan",
        "version": "2.0.0",
        "services": {
            "firestore": FIRESTORE_OK,
            "openai": OPENAI_OK,
            "vertex": VERTEX_OK,
            "firebase": FIREBASE_OK,
            "stripe": STRIPE_OK,
            "langgraph": LANGGRAPH_OK,
        },
    }


@app.post("/api/auth/register")
async def register(
    name: str = Form(...),
    crm: str = Form(...),
    specialty: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
):
    if FIREBASE_OK and FIRESTORE_OK:
        try:
            user = fb_auth.create_user(email=email, password=password, display_name=name)
            uid = user.uid
            token = await _create_custom_token(uid)
        except Exception as e:
            raise HTTPException(400, str(e))
    else:
        uid = hashlib.md5(email.encode()).hexdigest()
        token = make_token(uid)

    doctor_data = {
        "name": name,
        "crm": crm,
        "specialty": specialty,
        "email": email,
        "free_consultations_used": 0,
        "subscription_active": False,
        "plan": "free",
        "created_at": datetime.utcnow(),
    }
    if FIRESTORE_OK:
        DB.collection("doctors").document(uid).set(doctor_data)
    doctor_data["id"] = uid
    return {"token": token, "doctor": doctor_data}


@app.post("/api/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    if FIREBASE_OK and FIRESTORE_OK:
        import httpx

        api_key = os.environ.get("FIREBASE_API_KEY", "")
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}",
                json={"email": email, "password": password, "returnSecureToken": True},
            )
            if r.status_code != 200:
                raise HTTPException(401, "Email ou senha incorretos")
            id_token = r.json().get("idToken")
            uid = r.json().get("localId")
            doc = DB.collection("doctors").document(uid).get()
            doctor_data = doc.to_dict() if doc.exists else {}
            doctor_data["id"] = uid
            return {"token": id_token, "doctor": doctor_data}
    else:
        uid = hashlib.md5(email.encode()).hexdigest()
        token = make_token(uid)
        doctor_data = {
            "id": uid,
            "name": "Dr. Demo",
            "crm": "00000-SP",
            "specialty": "Clínica Geral",
            "email": email,
            "free_consultations_used": 0,
            "subscription_active": False,
            "plan": "free",
        }
        return {"token": token, "doctor": doctor_data}


@app.post("/api/auth/forgot-password")
async def forgot_password(email: str = Form(...)):
    if FIREBASE_OK:
        try:
            fb_auth.generate_password_reset_link(email)
        except Exception:
            pass
    return {"status": "ok"}


@app.post("/api/consultation/process")
async def process_consultation(
    audio: UploadFile = File(...),
    doctor_specialty: str = Form(default="Clínica Geral"),
    doctor_notes: Optional[str] = Form(default=None),
    image: Optional[UploadFile] = File(default=None),
    doctor_id: str = None,
):
    if not doctor_id:
        doctor_id = "demo_doctor"

    # Verificar limite gratuito
    if FIRESTORE_OK:
        doc = DB.collection("doctors").document(doctor_id).get()
        if doc.exists:
            d = doc.to_dict()
            used = d.get("free_consultations_used", 0)
            active = d.get("subscription_active", False)
            if used >= 7 and not active:
                raise HTTPException(402, "Limite de consultas gratuitas atingido. Faça upgrade.")

    audio_bytes = await audio.read()
    image_bytes = await image.read() if image else None

    if PIPELINE:
        result = await asyncio.to_thread(
            PIPELINE.invoke,
            {
                "audio_bytes": audio_bytes,
                "image_bytes": image_bytes,
                "doctor_id": doctor_id,
                "doctor_specialty": doctor_specialty,
                "doctor_notes": doctor_notes,
                "patient_id": None,
            },
        )
    else:
        result = {
            "transcription": "[Pipeline não disponível - modo demo]",
            "hypotheses": [{"rank": 1, "condition": "Hipótese Demo", "reasoning": "Modo demonstração", "probability": "média"}],
            "care_plan": {"immediate_actions": ["Demo"], "exams": [], "prescription": "Demo", "follow_up": "7 dias"},
            "image_impression": None,
            "patient_materials": {
                "simple_explanation": "Explicação demo para o paciente.",
                "daily_guidelines": ["Repouso", "Hidratação adequada"],
                "alert_signs": ["Piora dos sintomas", "Febre alta"],
                "faq": [{"question": "Quando devo retornar?", "answer": "Em 7 dias."}],
            },
        }

    consultation_id = "demo_" + secrets.token_hex(8)
    if FIRESTORE_OK:
        ref = DB.collection("consultations").add(
            {
                "doctor_id": doctor_id,
                "doctor_specialty": doctor_specialty,
                "doctor_notes": doctor_notes,
                "transcription": result.get("transcription"),
                "hypotheses": result.get("hypotheses"),
                "care_plan": result.get("care_plan"),
                "image_impression": result.get("image_impression"),
                "patient_materials": result.get("patient_materials"),
                "created_at": datetime.utcnow(),
            }
        )
        consultation_id = ref[1].id
        DB.collection("doctors").document(doctor_id).update({"free_consultations_used": firestore.Increment(1)})

    return {
        "consultation_id": consultation_id,
        "transcription": result.get("transcription"),
        "hypotheses": result.get("hypotheses"),
        "care_plan": result.get("care_plan"),
        "image_impression": result.get("image_impression"),
        "patient_materials": result.get("patient_materials"),
        "free_consultations_remaining": None,
    }


@app.patch("/api/consultation/{consultation_id}/notes")
async def save_notes(consultation_id: str, notes: str = Form(...)):
    if FIRESTORE_OK:
        DB.collection("consultations").document(consultation_id).update(
            {"doctor_notes": notes, "updated_at": datetime.utcnow()}
        )
    return {"status": "saved"}


@app.get("/api/consultations")
async def get_consultations(doctor_id: str = "demo_doctor"):
    if not FIRESTORE_OK:
        return {"consultations": []}
    docs = (
        DB.collection("consultations")
        .where("doctor_id", "==", doctor_id)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(20)
        .stream()
    )
    items = []
    for d in docs:
        data = d.to_dict()
        data["id"] = d.id
        data.pop("transcription", None)
        data.pop("image_base64", None)
        items.append(data)
    return {"consultations": items}


@app.get("/api/patients")
async def get_patients(doctor_id: str = "demo_doctor"):
    if not FIRESTORE_OK:
        return []
    docs = DB.collection("patients").where("doctor_id", "==", doctor_id).limit(50).stream()
    return [{"id": d.id, **d.to_dict()} for d in docs]


@app.post("/api/subscription/checkout")
async def checkout(plan: str = "gold", doctor_id: str = "demo"):
    if not STRIPE_OK:
        return {"checkout_url": f"/settings?plan={plan}&demo=true"}
    prices = {
        "gold": os.environ.get("STRIPE_PRICE_GOLD", ""),
        "diamond": os.environ.get("STRIPE_PRICE_DIAMOND", ""),
    }
    if not prices.get(plan):
        raise HTTPException(400, "Configure STRIPE_PRICE_GOLD e STRIPE_PRICE_DIAMOND")
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": prices[plan], "quantity": 1}],
        mode="subscription",
        success_url=f"{os.environ.get('APP_URL', 'http://localhost:8080')}/?upgraded=1",
        cancel_url=f"{os.environ.get('APP_URL', 'http://localhost:8080')}/",
        metadata={"doctor_id": doctor_id, "plan": plan},
    )
    return {"checkout_url": session.url}


async def _create_custom_token(uid: str) -> str:
    if FIREBASE_OK:
        token = fb_auth.create_custom_token(uid)
        return token.decode() if isinstance(token, bytes) else token
    return make_token(uid)


# ════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
