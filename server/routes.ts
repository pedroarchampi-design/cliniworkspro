import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI, { toFile } from "openai";

const REAL_API = process.env.REAL_API_URL || "https://deltascan-api-pxtie6c4zq-uc.a.run.app";
const GOOGLE_TOKEN = process.env.GOOGLE_API_KEY || "";

// FIX: Max base64 payload sizes (in characters ≈ 75% of decoded bytes)
const MAX_AUDIO_BASE64_LENGTH = 20_000_000; // ~15MB decoded
const MAX_IMAGE_BASE64_LENGTH = 15_000_000; // ~11MB decoded

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function realApiGet(path: string) {
  const resp = await fetch(`${REAL_API}${path}`, {
    headers: { Authorization: `Bearer ${GOOGLE_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`Real API error ${resp.status}`);
  return resp.json();
}

async function runClinicalAnalysis(prompt: string): Promise<string> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4096,
  });
  const text = resp.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from AI");
  return text;
}

async function runImageAnalysis(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "high" } },
      ],
    }],
    temperature: 0.2,
    max_tokens: 2048,
  });
  const text = resp.choices[0]?.message?.content;
  if (!text) throw new Error("Empty vision response from AI");
  return text;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Health / Status ─────────────────────────────────────────────────────────
  app.get("/api/status", async (_req, res) => {
    try {
      const health = await fetch(`${REAL_API}/health`).then(r => r.json());
      res.json({ local: "ok", cloudRun: health });
    } catch {
      res.json({ local: "ok", cloudRun: "unreachable" });
    }
  });

  // ── AI Key Status ────────────────────────────────────────────────────────────
  app.get("/api/ai-status", async (_req, res) => {
    const hasIntegration = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);
    res.json({
      openai: hasIntegration,
      whisper: hasIntegration,
      imageAnalysis: hasIntegration,
      anyAI: hasIntegration,
      provider: hasIntegration ? "replit-ai-integrations" : "none",
    });
  });

  // ── Patients (proxied from real Cloud Run API) ───────────────────────────────
  app.get("/api/patients", async (_req, res) => {
    try {
      const patients = await realApiGet("/api/patients");
      res.json(patients);
    } catch {
      res.json([]);
    }
  });

  // ── Pipelines list (proxied from real Cloud Run API) ────────────────────────
  app.get("/api/pipelines", async (_req, res) => {
    try {
      const pipelines = await realApiGet("/pipelines");
      res.json(pipelines);
    } catch {
      res.json({ pipelines: [] });
    }
  });

  // ── Consultations: list ──────────────────────────────────────────────────────
  app.get(api.consultations.list.path, async (req, res) => {
    const doctorId = req.query.doctorId as string || "demo_doctor";
    const items = await storage.getConsultationsByDoctor(doctorId);
    res.json({ consultations: items });
  });

  // ── Consultations: create (full AI pipeline) ─────────────────────────────────
  app.post(api.consultations.create.path, async (req, res) => {
    try {
      const input = api.consultations.create.input.parse(req.body);

      // FIX: Validate base64 payload sizes
      if (input.audioBase64 && input.audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
        return res.status(400).json({ message: "Audio file too large. Maximum ~15MB.", field: "audioBase64" });
      }
      if (input.imageBase64 && input.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
        return res.status(400).json({ message: "Image file too large. Maximum ~11MB.", field: "imageBase64" });
      }

      let transcription = "";
      let hypotheses: any[] = [];
      let carePlan: any = {};
      let patientMaterials: any = {};
      let imageImpression: string | null = null;

      // ── 1. Voice Transcription (Whisper via Replit AI) ────────────────────
      if (input.audioBase64) {
        try {
          const audioRaw = input.audioBase64.includes(",")
            ? input.audioBase64.split(",")[1]
            : input.audioBase64;
          const audioMime = input.audioBase64.startsWith("data:")
            ? input.audioBase64.split(";")[0].split(":")[1]
            : "audio/webm";
          const ext = audioMime.split("/")[1]?.replace("mpeg", "mp3") || "webm";

          const audioBuffer = Buffer.from(audioRaw, "base64");
          const file = await toFile(audioBuffer, `audio.${ext}`, { type: audioMime });

          const whisperResp = await openai.audio.transcriptions.create({
            file,
            model: "gpt-4o-mini-transcribe",
            language: "pt",
          });
          transcription = whisperResp.text;
          console.log("[Whisper] OK: transcription length =", transcription.length);
        } catch (e: any) {
          console.error("[Whisper] Error:", e.message);
          transcription = input.doctorNotes || "";
        }
      } else {
        transcription = input.doctorNotes || "";
      }

      // ── 2. Clinical Analysis (GPT-4o via Replit AI) ───────────────────────
      try {
        const consultationContext = [
          transcription && `TRANSCRIÇÃO / NOTAS DA CONSULTA:\n${transcription}`,
          input.doctorSpecialty && `ESPECIALIDADE DO MÉDICO: ${input.doctorSpecialty}`,
        ].filter(Boolean).join("\n\n");

        const clinicalPrompt = `Você é um assistente clínico de alta precisão especializado em ${input.doctorSpecialty || "Medicina Geral"}.

Com base nos dados da consulta abaixo, gere uma análise clínica estruturada e detalhada.
IMPORTANTE: Sempre use "hipótese diagnóstica", nunca "diagnóstico definitivo".

${consultationContext}

Responda APENAS em JSON válido (sem markdown, sem texto extra):
{
  "hypotheses": [
    {
      "rank": 1,
      "condition": "nome da condição clínica",
      "reasoning": "raciocínio clínico detalhado com base nos dados apresentados — mínimo 3 frases",
      "probability": "alta",
      "icd10": "código CID-10"
    }
  ],
  "care_plan": {
    "immediate_actions": ["ação imediata 1", "ação imediata 2"],
    "exams": ["exame 1", "exame 2"],
    "prescription": "orientação de prescrição detalhada",
    "follow_up": "orientação de retorno e seguimento"
  }
}`;

        const clinicalRaw = await runClinicalAnalysis(clinicalPrompt);
        const cleanJson = clinicalRaw.replace(/```json|```/g, "").trim();
        const clinicalData = JSON.parse(cleanJson);
        hypotheses = clinicalData.hypotheses || [];
        carePlan = clinicalData.care_plan || {};
        console.log("[GPT-4o] Clinical analysis OK:", hypotheses.length, "hypotheses");

        // ── 3. Patient Education Materials ────────────────────────────────
        const topCondition = hypotheses[0]?.condition || "condição avaliada";
        const patientPrompt = `Você é um educador médico especialista em comunicação com pacientes.

Condição principal: ${topCondition}
Especialidade: ${input.doctorSpecialty}
Plano de cuidado resumido: ${JSON.stringify(carePlan).slice(0, 500)}

Gere material educativo em linguagem MUITO simples, acolhedora e clara para um paciente sem formação médica.
Responda APENAS em JSON válido:
{
  "simple_explanation": "explicação clara e humana do que está acontecendo (2-3 frases)",
  "daily_guidelines": ["orientação prática 1", "orientação prática 2", "orientação prática 3"],
  "alert_signs": ["sinal de alerta grave 1 — quando buscar emergência", "sinal de alerta 2"],
  "faq": [
    {"question": "pergunta frequente do paciente", "answer": "resposta clara e acolhedora"}
  ]
}`;

        const patientRaw = await runClinicalAnalysis(patientPrompt);
        const cleanPatient = patientRaw.replace(/```json|```/g, "").trim();
        patientMaterials = JSON.parse(cleanPatient);
        console.log("[GPT-4o] Patient materials OK");

      } catch (e: any) {
        console.error("[GPT-4o] Clinical analysis error:", e.message);
        hypotheses = [{
          rank: 1,
          condition: "Erro na análise",
          reasoning: `Não foi possível processar: ${e.message}`,
          probability: "baixa",
          icd10: "",
        }];
      }

      // ── 4. Image Analysis (GPT-4o Vision via Replit AI) ───────────────────
      if (input.imageBase64) {
        try {
          const imageRaw = input.imageBase64.includes(",")
            ? input.imageBase64.split(",")[1]
            : input.imageBase64;
          const imageMime = input.imageBase64.startsWith("data:")
            ? input.imageBase64.split(";")[0].split(":")[1]
            : "image/jpeg";

          const visionPrompt = `Você é um especialista em radiologia e medicina de imagem com 20 anos de experiência clínica.

Analise esta imagem médica com máximo rigor técnico para auxiliar o médico especialista em ${input.doctorSpecialty || "Medicina Geral"}.

Estruture sua análise em:
1. IDENTIFICAÇÃO: Tipo de exame de imagem e qualidade técnica
2. ACHADOS NORMAIS: Estruturas anatômicas dentro dos limites normais
3. ACHADOS ANORMAIS: Alterações, áreas suspeitas ou patológicas identificadas
4. CARACTERÍSTICAS TÉCNICAS: Ecogenicidade, dimensões estimadas, margens, densidade, etc.
5. CORRELAÇÃO CLÍNICA: Possível correlação com o quadro clínico
6. RECOMENDAÇÕES: Exames complementares ou seguimento sugerido

IMPORTANTE: Esta é uma impressão técnica para o médico, NÃO um diagnóstico final para o paciente.`;

          imageImpression = await runImageAnalysis(imageRaw, imageMime, visionPrompt);
          console.log("[GPT-4o Vision] Image analysis OK");
        } catch (e: any) {
          console.error("[GPT-4o Vision] Error:", e.message);
          imageImpression = `Análise de imagem não disponível: ${e.message}`;
        }
      }

      const newConsultation = await storage.createConsultation({
        doctorId: input.doctorId || "demo_doctor",
        patientId: input.patientId,
        doctorSpecialty: input.doctorSpecialty,
        doctorNotes: input.doctorNotes,
        transcription,
        hypotheses,
        carePlan,
        patientMaterials,
        imageImpression,
      });

      res.status(201).json({ status: "saved", consultationId: newConsultation.id, data: newConsultation });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("Route error:", err);
      throw err;
    }
  });

  // ── Consultations: get by ID ─────────────────────────────────────────────────
  app.get(api.consultations.get.path, async (req, res) => {
    const consultation = await storage.getConsultation(Number(req.params.id));
    if (!consultation) return res.status(404).json({ message: "Not found" });
    res.json(consultation);
  });

  // ── Subscription checkout ────────────────────────────────────────────────────
  app.post(api.subscription.checkout.path, async (req, res) => {
    try {
      const input = api.subscription.checkout.input.parse(req.body);
      try {
        const checkoutResp = await fetch(`${REAL_API}/api/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${GOOGLE_TOKEN}` },
          body: JSON.stringify({ user_id: input.doctorId, email: `${input.doctorId}@deltascan.app` }),
        });
        if (checkoutResp.ok) {
          const data = await checkoutResp.json() as any;
          if (data.url) return res.json({ checkout_url: data.url });
        }
      } catch {}
      // FIX: Return a clearer demo fallback instead of fake Stripe URL
      res.json({ checkout_url: `/settings?plan=${input.plan}&demo=true` });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  return httpServer;
}
