import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI, { toFile } from "openai";

// ══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════

const REAL_API = process.env.REAL_API_URL || "https://deltascan-api-pxtie6c4zq-uc.a.run.app";
const GOOGLE_TOKEN = process.env.VERTEX_TOKEN || process.env.GOOGLE_API_KEY || "";
const GCP_PROJECT = process.env.GCP_PROJECT || "supernova-2026";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PRICE_GOLD = process.env.STRIPE_PRICE_GOLD || "";
const STRIPE_PRICE_DIAMOND = process.env.STRIPE_PRICE_DIAMOND || "";

const MAX_AUDIO_BASE64_LENGTH = 20_000_000; // ~15MB decoded
const MAX_IMAGE_BASE64_LENGTH = 15_000_000; // ~11MB decoded

// ── OpenAI Client (primary provider) ──────────────────────────────
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "";
const OPENAI_BASE = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
  baseURL: OPENAI_BASE,
});

// ── DeepSeek Client (fallback for clinical analysis) ──────────────
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";
const deepseek = DEEPSEEK_KEY ? new OpenAI({
  apiKey: DEEPSEEK_KEY,
  baseURL: "https://api.deepseek.com/v1",
}) : null;

// ── Perplexity Client (fallback for patient education) ────────────
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY || "";
const perplexity = PERPLEXITY_KEY ? new OpenAI({
  apiKey: PERPLEXITY_KEY,
  baseURL: "https://api.perplexity.ai",
}) : null;

// ── Grok/xAI Client (fallback) ───────────────────────────────────
const XAI_KEY = process.env.XAI_API_KEY || "";
const grok = XAI_KEY ? new OpenAI({
  apiKey: XAI_KEY,
  baseURL: "https://api.x.ai/v1",
}) : null;

// ── Stripe ────────────────────────────────────────────────────────
import Stripe from "stripe";
const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET, { apiVersion: "2025-01-27.acacia" as any }) : null;

// ══════════════════════════════════════════════════════════════════
// AI PIPELINE FUNCTIONS
// ══════════════════════════════════════════════════════════════════

type AIProvider = "openai" | "deepseek" | "perplexity" | "grok";

interface PipelineLog {
  step: string;
  provider: AIProvider;
  status: "success" | "error" | "skipped";
  durationMs: number;
  error?: string;
}

/**
 * Pipeline 1: STT — Voice Transcription
 * Primary: Vertex Health (Google Speech-to-Text Medical) | Fallback: OpenAI Whisper
 */
async function pipelineWhisperSTT(audioBase64: string): Promise<{ text: string; log: PipelineLog }> {
  const start = Date.now();
  const audioRaw = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;
  const audioMime = audioBase64.startsWith("data:") ? audioBase64.split(";")[0].split(":")[1] : "audio/webm";
  const ext = audioMime.split("/")[1]?.replace("mpeg", "mp3") || "webm";

  // ── Try Vertex Health (Google Speech-to-Text Medical) ──────────────
  if (GOOGLE_TOKEN) {
    try {
      const encoding = audioMime.includes("webm") ? "WEBM_OPUS" :
                       audioMime.includes("ogg") ? "OGG_OPUS" :
                       audioMime.includes("mp4") ? "MP4" : "LINEAR16";
      const resp = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GOOGLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding,
            sampleRateHertz: 16000,
            languageCode: "pt-BR",
            alternativeLanguageCodes: ["en-US", "es-ES"],
            enableAutomaticPunctuation: true,
            model: "medical_dictation",
            useEnhanced: true,
          },
          audio: { content: audioRaw },
        }),
      });
      if (resp.ok) {
        const data = await resp.json() as any;
        const transcript = (data.results || []).map((r: any) => r.alternatives?.[0]?.transcript || "").join(" ").trim();
        if (transcript) {
          console.log("[Pipeline 1 - Vertex Health STT] OK: length =", transcript.length);
          return { text: transcript, log: { step: "whisper_stt", provider: "openai", status: "success", durationMs: Date.now() - start } };
        }
      } else {
        const errText = await resp.text();
        console.warn("[Pipeline 1 - Vertex Health STT] Failed:", resp.status, errText.slice(0, 150));
      }
    } catch (e: any) {
      console.warn("[Pipeline 1 - Vertex Health STT] Error:", e.message);
    }
  }

  // ── Fallback: OpenAI Whisper ──────────────────────────────────────
  if (OPENAI_KEY) {
    try {
      const audioBuffer = Buffer.from(audioRaw, "base64");
      const file = await toFile(audioBuffer, `audio.${ext}`, { type: audioMime });
      const resp = await openai.audio.transcriptions.create({ file, model: "whisper-1", language: "pt" });
      console.log("[Pipeline 1 - Whisper STT] OK: length =", resp.text.length);
      return { text: resp.text, log: { step: "whisper_stt", provider: "openai", status: "success", durationMs: Date.now() - start } };
    } catch (e: any) {
      console.error("[Pipeline 1 - Whisper STT] Error:", e.message);
    }
  }

  return { text: "", log: { step: "whisper_stt", provider: "openai", status: "error", durationMs: Date.now() - start, error: "All STT providers failed" } };
}

/**
 * Pipeline 2: Clinical Analysis — Hypotheses + Care Plan
 * Primary: OpenAI GPT-4o | Fallback: DeepSeek | Fallback: Grok
 */
async function pipelineClinicalAnalysis(
  transcription: string,
  specialty: string,
  notes?: string
): Promise<{ hypotheses: any[]; carePlan: any; log: PipelineLog }> {
  const start = Date.now();

  const consultationContext = [
    transcription && `TRANSCRIÇÃO / NOTAS DA CONSULTA:\n${transcription}`,
    notes && `NOTAS ADICIONAIS DO MÉDICO:\n${notes}`,
    specialty && `ESPECIALIDADE DO MÉDICO: ${specialty}`,
  ].filter(Boolean).join("\n\n");

  const clinicalPrompt = `Você é um assistente clínico de alta precisão especializado em ${specialty || "Medicina Geral"}.

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

  // Try providers in order: OpenAI → DeepSeek → Grok
  const providers: { name: AIProvider; client: OpenAI; model: string }[] = [
    { name: "openai", client: openai, model: "gpt-4o" },
    ...(deepseek ? [{ name: "deepseek" as AIProvider, client: deepseek, model: "deepseek-chat" }] : []),
    ...(grok ? [{ name: "grok" as AIProvider, client: grok, model: "grok-2-latest" }] : []),
  ];

  for (const { name, client, model } of providers) {
    try {
      const resp = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: clinicalPrompt }],
        temperature: 0.2,
        max_tokens: 4096,
      });

      const raw = resp.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty response");

      const cleanJson = raw.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);

      console.log(`[Pipeline 2 - Clinical Analysis] OK via ${name}:`, data.hypotheses?.length, "hypotheses");
      return {
        hypotheses: data.hypotheses || [],
        carePlan: data.care_plan || {},
        log: { step: "clinical_analysis", provider: name, status: "success", durationMs: Date.now() - start },
      };
    } catch (e: any) {
      console.warn(`[Pipeline 2 - Clinical Analysis] ${name} failed:`, e.message);
      continue;
    }
  }

  // All providers failed
  return {
    hypotheses: [{ rank: 1, condition: "Análise indisponível", reasoning: "Nenhum provedor de IA respondeu. Verifique as chaves de API.", probability: "baixa", icd10: "" }],
    carePlan: { immediate_actions: [], exams: [], prescription: "", follow_up: "" },
    log: { step: "clinical_analysis", provider: "openai", status: "error", durationMs: Date.now() - start, error: "All providers failed" },
  };
}

/**
 * Pipeline 3: Image Analysis
 * Primary: Vertex Vision (Gemini 1.5 Pro) | Fallback: GPT-4o Vision | Fallback: Grok Vision
 */
async function pipelineImageAnalysis(
  imageBase64: string,
  specialty: string
): Promise<{ impression: string; log: PipelineLog }> {
  const start = Date.now();

  const imageRaw = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const imageMime = imageBase64.startsWith("data:") ? imageBase64.split(";")[0].split(":")[1] : "image/jpeg";

  const visionPrompt = `Você é um especialista em radiologia e medicina de imagem com 20 anos de experiência clínica.

Analise esta imagem médica com máximo rigor técnico para auxiliar o médico especialista em ${specialty || "Medicina Geral"}.

Estruture sua análise em:
1. IDENTIFICAÇÃO: Tipo de exame de imagem e qualidade técnica
2. ACHADOS NORMAIS: Estruturas anatômicas dentro dos limites normais
3. ACHADOS ANORMAIS: Alterações, áreas suspeitas ou patológicas identificadas
4. CARACTERÍSTICAS TÉCNICAS: Ecogenicidade, dimensões estimadas, margens, densidade, etc.
5. CORRELAÇÃO CLÍNICA: Possível correlação com o quadro clínico
6. RECOMENDAÇÕES: Exames complementares ou seguimento sugerido

IMPORTANTE: Esta é uma impressão técnica para o médico, NÃO um diagnóstico final para o paciente.`;

  // ── Try Vertex Vision (Gemini 1.5 Pro) ──────────────────────────────
  if (GOOGLE_TOKEN) {
    try {
      const resp = await fetch(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT}/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${GOOGLE_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [
              { text: visionPrompt },
              { inlineData: { mimeType: imageMime, data: imageRaw } },
            ]}],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        }
      );
      if (resp.ok) {
        const data = await resp.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log("[Pipeline 3 - Vertex Vision] OK");
          return { impression: text, log: { step: "image_analysis", provider: "openai", status: "success", durationMs: Date.now() - start } };
        }
      } else {
        const errText = await resp.text();
        console.warn("[Pipeline 3 - Vertex Vision] Failed:", resp.status, errText.slice(0, 150));
      }
    } catch (e: any) {
      console.warn("[Pipeline 3 - Vertex Vision] Error:", e.message);
    }
  }

  // ── Fallback: OpenAI GPT-4o Vision + Grok Vision ─────────────────
  const providers: { name: AIProvider; client: OpenAI; model: string }[] = [
    { name: "openai", client: openai, model: "gpt-4o" },
    ...(grok ? [{ name: "grok" as AIProvider, client: grok, model: "grok-2-vision-1212" }] : []),
  ];

  for (const { name, client, model } of providers) {
    try {
      const resp = await client.chat.completions.create({
        model,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            { type: "image_url", image_url: { url: `data:${imageMime};base64,${imageRaw}`, detail: "high" } },
          ],
        }],
        temperature: 0.2,
        max_tokens: 2048,
      });
      const text = resp.choices[0]?.message?.content;
      if (!text) throw new Error("Empty vision response");
      console.log(`[Pipeline 3 - Image Analysis] OK via ${name}`);
      return { impression: text, log: { step: "image_analysis", provider: name, status: "success", durationMs: Date.now() - start } };
    } catch (e: any) {
      console.warn(`[Pipeline 3 - Image Analysis] ${name} failed:`, e.message);
    }
  }

  return {
    impression: "Análise de imagem não disponível. Configure VERTEX_TOKEN, OPENAI_API_KEY ou XAI_API_KEY.",
    log: { step: "image_analysis", provider: "openai", status: "error", durationMs: Date.now() - start, error: "All providers failed" },
  };
}

/**
 * Pipeline 4: Patient Education Materials
 * Primary: OpenAI GPT-4o | Fallback: Perplexity | Fallback: DeepSeek
 */
async function pipelinePatientEducation(
  topCondition: string,
  specialty: string,
  carePlan: any
): Promise<{ materials: any; log: PipelineLog }> {
  const start = Date.now();

  const patientPrompt = `Você é um educador médico especialista em comunicação com pacientes.

Condição principal: ${topCondition}
Especialidade: ${specialty}
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

  const providers: { name: AIProvider; client: OpenAI; model: string }[] = [
    { name: "openai", client: openai, model: "gpt-4o" },
    ...(perplexity ? [{ name: "perplexity" as AIProvider, client: perplexity, model: "sonar" }] : []),
    ...(deepseek ? [{ name: "deepseek" as AIProvider, client: deepseek, model: "deepseek-chat" }] : []),
    ...(grok ? [{ name: "grok" as AIProvider, client: grok, model: "grok-2-latest" }] : []),
  ];

  for (const { name, client, model } of providers) {
    try {
      const resp = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: patientPrompt }],
        temperature: 0.4,
        max_tokens: 2048,
      });

      const raw = resp.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty response");

      const cleanJson = raw.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);

      console.log(`[Pipeline 4 - Patient Education] OK via ${name}`);
      return {
        materials: data,
        log: { step: "patient_education", provider: name, status: "success", durationMs: Date.now() - start },
      };
    } catch (e: any) {
      console.warn(`[Pipeline 4 - Patient Education] ${name} failed:`, e.message);
      continue;
    }
  }

  return {
    materials: {
      simple_explanation: "Material educativo não disponível no momento.",
      daily_guidelines: [],
      alert_signs: [],
      faq: [],
    },
    log: { step: "patient_education", provider: "openai", status: "error", durationMs: Date.now() - start, error: "All providers failed" },
  };
}

// ══════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════

async function realApiGet(path: string) {
  const resp = await fetch(`${REAL_API}${path}`, {
    headers: { Authorization: `Bearer ${GOOGLE_TOKEN}` },
  });
  if (!resp.ok) throw new Error(`Real API error ${resp.status}`);
  return resp.json();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Health / Status ─────────────────────────────────────────────
  app.get("/api/status", async (_req, res) => {
    try {
      const health = await fetch(`${REAL_API}/health`).then(r => r.json());
      res.json({ local: "ok", cloudRun: health });
    } catch {
      res.json({ local: "ok", cloudRun: "unreachable" });
    }
  });

  // ── AI Key Status (detailed pipeline status) ────────────────────
  app.get("/api/ai-status", async (_req, res) => {
    const hasOpenAI = !!OPENAI_KEY;
    const hasDeepSeek = !!DEEPSEEK_KEY;
    const hasPerplexity = !!PERPLEXITY_KEY;
    const hasGrok = !!XAI_KEY;
    const hasGoogle = !!GOOGLE_TOKEN;

    res.json({
      openai: hasOpenAI,
      whisper: hasOpenAI,
      imageAnalysis: hasOpenAI || hasGrok,
      anyAI: hasOpenAI || hasDeepSeek || hasPerplexity || hasGrok,
      providers: {
        openai: hasOpenAI,
        deepseek: hasDeepSeek,
        perplexity: hasPerplexity,
        grok: hasGrok,
        google: hasGoogle,
      },
      pipelines: {
        whisper_stt: { available: hasOpenAI, provider: "openai" },
        clinical_analysis: { available: hasOpenAI || hasDeepSeek || hasGrok, providers: [hasOpenAI && "openai", hasDeepSeek && "deepseek", hasGrok && "grok"].filter(Boolean) },
        image_analysis: { available: hasOpenAI || hasGrok, providers: [hasOpenAI && "openai", hasGrok && "grok"].filter(Boolean) },
        patient_education: { available: hasOpenAI || hasPerplexity || hasDeepSeek || hasGrok, providers: [hasOpenAI && "openai", hasPerplexity && "perplexity", hasDeepSeek && "deepseek", hasGrok && "grok"].filter(Boolean) },
      },
    });
  });

  // ── Patients (proxied from real Cloud Run API) ──────────────────
  app.get("/api/patients", async (_req, res) => {
    try {
      const patients = await realApiGet("/api/patients");
      res.json(patients);
    } catch {
      res.json([]);
    }
  });

  // ── Pipelines list (proxied from real Cloud Run API) ────────────
  app.get("/api/pipelines", async (_req, res) => {
    try {
      const pipelines = await realApiGet("/pipelines");
      res.json(pipelines);
    } catch {
      res.json({
        pipelines: [
          { id: 1, name: "Whisper STT", description: "Transcrição de voz para texto", status: OPENAI_KEY ? "active" : "inactive" },
          { id: 2, name: "Clinical Analysis", description: "Análise clínica com hipóteses diagnósticas", status: (OPENAI_KEY || DEEPSEEK_KEY || XAI_KEY) ? "active" : "inactive" },
          { id: 3, name: "Image Analysis", description: "Análise de imagens médicas (GPT-4o Vision)", status: (OPENAI_KEY || XAI_KEY) ? "active" : "inactive" },
          { id: 4, name: "Patient Education", description: "Materiais educativos para o paciente", status: (OPENAI_KEY || PERPLEXITY_KEY || DEEPSEEK_KEY) ? "active" : "inactive" },
        ],
      });
    }
  });

  // ── Consultations: list ─────────────────────────────────────────
  app.get(api.consultations.list.path, async (req, res) => {
    const doctorId = req.query.doctorId as string || "demo_doctor";
    const items = await storage.getConsultationsByDoctor(doctorId);
    res.json({ consultations: items });
  });

  // ── Consultations: create (full AI pipeline) ────────────────────
  app.post(api.consultations.create.path, async (req, res) => {
    try {
      const input = api.consultations.create.input.parse(req.body);
      const pipelineLogs: PipelineLog[] = [];

      // Validate payload sizes
      if (input.audioBase64 && input.audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
        return res.status(400).json({ message: "Arquivo de áudio muito grande. Máximo ~15MB.", field: "audioBase64" });
      }
      if (input.imageBase64 && input.imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
        return res.status(400).json({ message: "Arquivo de imagem muito grande. Máximo ~11MB.", field: "imageBase64" });
      }

      let transcription = "";
      let hypotheses: any[] = [];
      let carePlan: any = {};
      let patientMaterials: any = {};
      let imageImpression: string | null = null;

      // ── Pipeline 1: Whisper STT ──────────────────────────────────
      if (input.audioBase64) {
        const whisperResult = await pipelineWhisperSTT(input.audioBase64);
        transcription = whisperResult.text || input.doctorNotes || "";
        pipelineLogs.push(whisperResult.log);
      } else {
        transcription = input.doctorNotes || "";
        pipelineLogs.push({ step: "whisper_stt", provider: "openai", status: "skipped", durationMs: 0 });
      }

      // ── Pipeline 2: Clinical Analysis ────────────────────────────
      if (transcription || input.doctorNotes) {
        const clinicalResult = await pipelineClinicalAnalysis(
          transcription,
          input.doctorSpecialty,
          input.doctorNotes
        );
        hypotheses = clinicalResult.hypotheses;
        carePlan = clinicalResult.carePlan;
        pipelineLogs.push(clinicalResult.log);

        // ── Pipeline 4: Patient Education ──────────────────────────
        const topCondition = hypotheses[0]?.condition || "condição avaliada";
        const educationResult = await pipelinePatientEducation(
          topCondition,
          input.doctorSpecialty,
          carePlan
        );
        patientMaterials = educationResult.materials;
        pipelineLogs.push(educationResult.log);
      } else {
        pipelineLogs.push({ step: "clinical_analysis", provider: "openai", status: "skipped", durationMs: 0 });
        pipelineLogs.push({ step: "patient_education", provider: "openai", status: "skipped", durationMs: 0 });
      }

      // ── Pipeline 3: Image Analysis ───────────────────────────────
      if (input.imageBase64) {
        const imageResult = await pipelineImageAnalysis(input.imageBase64, input.doctorSpecialty);
        imageImpression = imageResult.impression;
        pipelineLogs.push(imageResult.log);
      } else {
        pipelineLogs.push({ step: "image_analysis", provider: "openai", status: "skipped", durationMs: 0 });
      }

      // ── Save to storage ──────────────────────────────────────────
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

      // Log pipeline summary (LGPD safe — no medical data)
      const totalMs = pipelineLogs.reduce((sum, l) => sum + l.durationMs, 0);
      console.log(`[Consultation ${newConsultation.id}] Pipeline complete in ${totalMs}ms:`,
        pipelineLogs.map(l => `${l.step}=${l.status}(${l.provider},${l.durationMs}ms)`).join(" | ")
      );

      res.status(201).json({
        status: "saved",
        consultationId: newConsultation.id,
        data: newConsultation,
        pipeline: pipelineLogs,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("Route error:", err);
      throw err;
    }
  });

  // ── Consultations: get by ID ────────────────────────────────────
  app.get(api.consultations.get.path, async (req, res) => {
    const consultation = await storage.getConsultation(Number(req.params.id));
    if (!consultation) return res.status(404).json({ message: "Not found" });
    res.json(consultation);
  });

  // ── Subscription checkout (Stripe real) ───────────────────────────
  app.post(api.subscription.checkout.path, async (req, res) => {
    try {
      const input = api.subscription.checkout.input.parse(req.body);

      // Use real Stripe if configured
      if (stripe) {
        const PRICE_IDS: Record<string, string> = {
          gold: STRIPE_PRICE_GOLD || "price_gold",
          diamond: STRIPE_PRICE_DIAMOND || "price_diamond",
        };
        const priceId = PRICE_IDS[input.plan];
        if (priceId && priceId !== "price_gold" && priceId !== "price_diamond") {
          try {
            const session = await stripe.checkout.sessions.create({
              mode: "subscription",
              payment_method_types: ["card"],
              line_items: [{ price: priceId, quantity: 1 }],
              success_url: `${req.headers.origin || "https://deltascan.app"}/settings?success=true&plan=${input.plan}`,
              cancel_url: `${req.headers.origin || "https://deltascan.app"}/upgrade?canceled=true`,
              metadata: { doctorId: input.doctorId || "", plan: input.plan },
              allow_promotion_codes: true,
            });
            return res.json({ checkout_url: session.url });
          } catch (stripeErr: any) {
            console.error("[Stripe] Checkout error:", stripeErr.message);
          }
        }
      }

      // Fallback: try Cloud Run API
      try {
        const checkoutResp = await fetch(`${REAL_API}/api/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${GOOGLE_TOKEN}` },
          body: JSON.stringify({ user_id: input.doctorId, plan: input.plan, email: `${input.doctorId}@deltascan.app` }),
        });
        if (checkoutResp.ok) {
          const data = await checkoutResp.json() as any;
          if (data.url || data.checkout_url) return res.json({ checkout_url: data.url || data.checkout_url });
        }
      } catch {}

      res.json({ checkout_url: `/settings?plan=${input.plan}&demo=true` });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // ── AI Status (updated with Vertex) ────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "DeltaScan API", version: "2.0.0", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
