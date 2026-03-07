# ============================================================
# DeltaScan — FastAPI + LangGraph Backend
# Multi-provider AI pipelines: OpenAI, DeepSeek, Perplexity, Grok, Vertex
# ============================================================

import os, json, base64, asyncio, secrets, hashlib, time
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn

# ── Load .env if present ──
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Configure Google credentials via env var ──
_gcp_creds = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if _gcp_creds:
    with open("/tmp/gcp_creds.json", "w") as f:
        f.write(_gcp_creds)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/tmp/gcp_creds.json"

_firebase_creds = os.environ.get("FIREBASE_CREDENTIALS_JSON")
if _firebase_creds:
    with open("/tmp/firebase_creds.json", "w") as f:
        f.write(_firebase_creds)

# ── Conditional imports ──

try:
    import openai
    OPENAI_OK = bool(os.environ.get("OPENAI_API_KEY"))
except ImportError:
    OPENAI_OK = False

DEEPSEEK_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
PERPLEXITY_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
XAI_KEY = os.environ.get("XAI_API_KEY", "")

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
    VERTEX_OK = True
except ImportError:
    VERTEX_OK = False

try:
    from google.cloud import firestore
    DB = firestore.Client(project=os.environ.get("GCP_PROJECT", "mimiclo"))
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
    STRIPE_OK = bool(stripe.api_key)
except ImportError:
    STRIPE_OK = False

try:
    from langgraph.graph import StateGraph, END
    from typing import TypedDict
    LANGGRAPH_OK = True
except ImportError:
    LANGGRAPH_OK = False

# ════════════════════════════════════════════════════════════════
# MULTI-PROVIDER AI HELPERS
# ════════════════════════════════════════════════════════════════

def _openai_client(provider="openai"):
    """Create OpenAI-compatible client for different providers."""
    if provider == "deepseek" and DEEPSEEK_KEY:
        return openai.OpenAI(api_key=DEEPSEEK_KEY, base_url="https://api.deepseek.com/v1")
    elif provider == "perplexity" and PERPLEXITY_KEY:
        return openai.OpenAI(api_key=PERPLEXITY_KEY, base_url="https://api.perplexity.ai")
    elif provider == "grok" and XAI_KEY:
        return openai.OpenAI(api_key=XAI_KEY, base_url="https://api.x.ai/v1")
    else:
        return openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def _chat_with_fallback(prompt: str, providers_config: list) -> str:
    """Try multiple providers in order until one succeeds."""
    for cfg in providers_config:
        try:
            client = _openai_client(cfg["provider"])
            resp = client.chat.completions.create(
                model=cfg["model"],
                messages=[{"role": "user", "content": prompt}],
                temperature=cfg.get("temperature", 0.2),
                max_tokens=cfg.get("max_tokens", 4096),
            )
            text = resp.choices[0].message.content
            if text:
                return text
        except Exception as e:
            print(f"[{cfg['provider']}] Failed: {e}")
            continue
    return ""


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

    # ── Agent 1: Whisper STT ──
    def agent_transcription(state: dict) -> dict:
        audio_bytes = state.get("audio_bytes")
        if not audio_bytes:
            return {**state, "transcription": state.get("doctor_notes", "")}
        if not OPENAI_OK:
            return {**state, "transcription": state.get("doctor_notes", "[Whisper não disponível]")}
        import io
        client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        buf = io.BytesIO(audio_bytes)
        buf.name = "audio.webm"
        resp = client.audio.transcriptions.create(model="whisper-1", file=buf, language="pt")
        return {**state, "transcription": resp.text}

    # ── Agent 2: Clinical Analysis (multi-provider) ──
    def agent_clinical(state: dict) -> dict:
        transcription = state.get("transcription", "")
        specialty = state.get("doctor_specialty", "Clínica Geral")
        notes = state.get("doctor_notes", "")

        prompt = f"""Você é assistente clínico para médicos de {specialty}.

Com base na transcrição/notas abaixo, gere hipóteses diagnósticas e plano de cuidado.
IMPORTANTE: Use sempre "hipótese diagnóstica", nunca "diagnóstico".

Transcrição: {transcription}
{f"Notas adicionais: {notes}" if notes else ""}

Responda APENAS em JSON:
{{
  "hypotheses": [{{"rank":1,"condition":"nome","reasoning":"justificativa detalhada","probability":"alta/média/baixa","icd10":"código"}}],
  "care_plan": {{"immediate_actions":[],"exams":[],"prescription":"texto","follow_up":"orientação"}}
}}"""

        providers = []
        if OPENAI_OK:
            providers.append({"provider": "openai", "model": "gpt-4o"})
        if DEEPSEEK_KEY:
            providers.append({"provider": "deepseek", "model": "deepseek-chat"})
        if XAI_KEY:
            providers.append({"provider": "grok", "model": "grok-2-latest"})
        if VERTEX_OK:
            # Use Vertex separately
            try:
                vertexai.init(project=os.environ.get("GCP_PROJECT", "mimiclo"), location="us-central1")
                model = GenerativeModel("gemini-1.5-pro")
                resp = model.generate_content(prompt)
                result = json.loads(resp.text.strip().replace("```json", "").replace("```", ""))
                return {**state, "hypotheses": result.get("hypotheses", []), "care_plan": result.get("care_plan", {})}
            except Exception as e:
                print(f"[Vertex] Clinical failed: {e}")

        if providers:
            raw = _chat_with_fallback(prompt, providers)
            if raw:
                try:
                    result = json.loads(raw.strip().replace("```json", "").replace("```", ""))
                    return {**state, "hypotheses": result.get("hypotheses", []), "care_plan": result.get("care_plan", {})}
                except Exception:
                    pass

        return {
            **state,
            "hypotheses": [{"rank": 1, "condition": "Análise indisponível", "reasoning": "Nenhum provedor de IA respondeu", "probability": "baixa"}],
            "care_plan": {"immediate_actions": [], "exams": [], "prescription": "", "follow_up": ""},
        }

    # ── Agent 3: Image Analysis (multi-provider) ──
    def agent_image(state: dict) -> dict:
        image_bytes = state.get("image_bytes")
        if not image_bytes:
            return {**state, "image_impression": None}

        specialty = state.get("doctor_specialty", "Medicina Geral")
        img_b64 = base64.b64encode(image_bytes).decode()

        # Try OpenAI Vision
        if OPENAI_OK:
            try:
                client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
                resp = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": f"Analise esta imagem médica para um {specialty}. Descreva achados em linguagem técnica. IMPRESSÃO, não diagnóstico."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}", "detail": "high"}},
                        ],
                    }],
                    max_tokens=2048,
                )
                return {**state, "image_impression": resp.choices[0].message.content, "image_base64": img_b64}
            except Exception as e:
                print(f"[OpenAI Vision] Failed: {e}")

        # Try Grok Vision
        if XAI_KEY:
            try:
                client = _openai_client("grok")
                resp = client.chat.completions.create(
                    model="grok-2-vision-1212",
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": f"Analise esta imagem médica para um {specialty}. IMPRESSÃO técnica."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
                        ],
                    }],
                    max_tokens=2048,
                )
                return {**state, "image_impression": resp.choices[0].message.content, "image_base64": img_b64}
            except Exception as e:
                print(f"[Grok Vision] Failed: {e}")

        # Try Vertex
        if VERTEX_OK:
            try:
                vertexai.init(project=os.environ.get("GCP_PROJECT", "mimiclo"), location="us-central1")
                model = GenerativeModel("gemini-1.5-pro-vision")
                resp = model.generate_content([
                    Part.from_data(data=image_bytes, mime_type="image/jpeg"),
                    f"Analise esta imagem médica para um {specialty}. IMPRESSÃO técnica.",
                ])
                return {**state, "image_impression": resp.text, "image_base64": img_b64}
            except Exception as e:
                print(f"[Vertex Vision] Failed: {e}")

        return {**state, "image_impression": "Análise de imagem não disponível.", "image_base64": img_b64}

    # ── Agent 4: Patient Education (multi-provider) ──
    def agent_patient(state: dict) -> dict:
        hypotheses = state.get("hypotheses", [])
        care_plan = state.get("care_plan", {})
        top = hypotheses[0]["condition"] if hypotheses else "condição avaliada"

        prompt = f"""Você é comunicador médico especialista em educação do paciente.

Sobre: {top}. Plano: {json.dumps(care_plan, ensure_ascii=False)[:500]}

Gere material educativo em linguagem simples para o paciente.
Responda APENAS em JSON:
{{
  "simple_explanation":"texto",
  "daily_guidelines":["item"],
  "alert_signs":["sinal"],
  "faq":[{{"question":"q","answer":"a"}}]
}}"""

        providers = []
        if OPENAI_OK:
            providers.append({"provider": "openai", "model": "gpt-4o", "temperature": 0.4})
        if PERPLEXITY_KEY:
            providers.append({"provider": "perplexity", "model": "sonar", "temperature": 0.4})
        if DEEPSEEK_KEY:
            providers.append({"provider": "deepseek", "model": "deepseek-chat", "temperature": 0.4})

        raw = _chat_with_fallback(prompt, providers) if providers else ""
        if raw:
            try:
                result = json.loads(raw.strip().replace("```json", "").replace("```", ""))
                return {**state, "patient_materials": result}
            except Exception:
                pass

        return {
            **state,
            "patient_materials": {
                "simple_explanation": "Material educativo não disponível.",
                "daily_guidelines": [],
                "alert_signs": [],
                "faq": [],
            },
        }

    # ── Compile the graph ──
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

# ── Auth helpers ──

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
        return payload.split(":")[0]
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


# ── Routes ──

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "services": {
            "firestore": FIRESTORE_OK,
            "openai": OPENAI_OK,
            "vertex": VERTEX_OK,
            "firebase": FIREBASE_OK,
            "stripe": STRIPE_OK,
            "langgraph": LANGGRAPH_OK,
            "deepseek": bool(DEEPSEEK_KEY),
            "perplexity": bool(PERPLEXITY_KEY),
            "grok": bool(XAI_KEY),
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
        "name": name, "crm": crm, "specialty": specialty, "email": email,
        "free_consultations_used": 0, "subscription_active": False, "plan": "free",
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
        return {
            "token": token,
            "doctor": {"id": uid, "name": "Dr. Demo", "crm": "00000-SP", "specialty": "Clínica Geral",
                        "email": email, "free_consultations_used": 0, "subscription_active": False, "plan": "free"},
        }


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
    doctor_id: str = "demo_doctor",
):
    # Check free limit
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
                "audio_bytes": audio_bytes, "image_bytes": image_bytes,
                "doctor_id": doctor_id, "doctor_specialty": doctor_specialty,
                "doctor_notes": doctor_notes, "patient_id": None,
            },
        )
    else:
        # Fallback without LangGraph — use direct multi-provider calls
        transcription = doctor_notes or ""
        if OPENAI_OK and audio_bytes:
            import io
            client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            buf = io.BytesIO(audio_bytes)
            buf.name = "audio.webm"
            try:
                resp = client.audio.transcriptions.create(model="whisper-1", file=buf, language="pt")
                transcription = resp.text
            except Exception as e:
                print(f"[Whisper direct] Failed: {e}")

        clinical_prompt = f"Analise clínica para {doctor_specialty}. Transcrição: {transcription}. Responda em JSON com hypotheses e care_plan."
        providers = []
        if OPENAI_OK:
            providers.append({"provider": "openai", "model": "gpt-4o"})
        if DEEPSEEK_KEY:
            providers.append({"provider": "deepseek", "model": "deepseek-chat"})
        if XAI_KEY:
            providers.append({"provider": "grok", "model": "grok-2-latest"})

        raw = _chat_with_fallback(clinical_prompt, providers) if providers else ""
        try:
            clinical = json.loads(raw.strip().replace("```json", "").replace("```", ""))
        except Exception:
            clinical = {"hypotheses": [{"rank": 1, "condition": "Demo", "reasoning": "Modo demo", "probability": "média"}],
                        "care_plan": {"immediate_actions": [], "exams": [], "prescription": "", "follow_up": ""}}

        result = {
            "transcription": transcription,
            "hypotheses": clinical.get("hypotheses", []),
            "care_plan": clinical.get("care_plan", {}),
            "image_impression": None,
            "patient_materials": {"simple_explanation": "Material demo.", "daily_guidelines": [], "alert_signs": [], "faq": []},
        }

    consultation_id = "demo_" + secrets.token_hex(8)
    if FIRESTORE_OK:
        ref = DB.collection("consultations").add({
            "doctor_id": doctor_id, "doctor_specialty": doctor_specialty, "doctor_notes": doctor_notes,
            "transcription": result.get("transcription"), "hypotheses": result.get("hypotheses"),
            "care_plan": result.get("care_plan"), "image_impression": result.get("image_impression"),
            "patient_materials": result.get("patient_materials"), "created_at": datetime.utcnow(),
        })
        consultation_id = ref[1].id
        DB.collection("doctors").document(doctor_id).update({"free_consultations_used": firestore.Increment(1)})

    return {
        "consultation_id": consultation_id,
        "transcription": result.get("transcription"),
        "hypotheses": result.get("hypotheses"),
        "care_plan": result.get("care_plan"),
        "image_impression": result.get("image_impression"),
        "patient_materials": result.get("patient_materials"),
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
