export type Lang = "pt" | "en" | "es";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export const T = {
  // ── Landing ──────────────────────────────────────────────────────────────────
  landing: {
    tagline: { pt: "Inteligência Clínica em Tempo Real", en: "Real-Time Clinical Intelligence", es: "Inteligencia Clínica en Tiempo Real" },
    subtitle: {
      pt: "Assistente clínico com IA para casos complexos, novos pacientes e decisões de alto risco. Desenvolvido por médico, para médicos.",
      en: "AI-powered clinical mentor for complex cases, new patients, and high-stakes decisions. Built for physicians, by a physician.",
      es: "Asistente clínico con IA para casos complejos, nuevos pacientes y decisiones de alto riesgo. Desarrollado por médicos, para médicos.",
    },
    signinGoogle: { pt: "Entrar com Google", en: "Sign In with Google", es: "Iniciar sesión con Google" },
    startFree: { pt: "Começar Gratuitamente", en: "Get Started Free", es: "Comenzar Gratis" },
    feature1Title: { pt: "Suporte à Decisão", en: "Decision Support", es: "Apoyo a la Decisión" },
    feature1Desc: {
      pt: "Hipóteses diagnósticas geradas por IA e planos de cuidado baseados em evidências a partir de consultas por voz.",
      en: "AI-generated diagnostic hypotheses and evidence-based care plans from voice consultations.",
      es: "Hipótesis diagnósticas generadas por IA y planes de atención basados en evidencia a partir de consultas de voz.",
    },
    feature2Title: { pt: "Proteção Legal", en: "Legal Protection", es: "Protección Legal" },
    feature2Desc: {
      pt: "Registros completos de consulta com trilhas de raciocínio de IA — seu julgamento clínico documentado.",
      en: "Full consultation records with AI reasoning trails — your documented clinical judgment.",
      es: "Registros completos de consulta con trazas de razonamiento de IA — su juicio clínico documentado.",
    },
    feature3Title: { pt: "Acessibilidade", en: "Affordability", es: "Asequibilidad" },
    feature3Desc: {
      pt: "A partir de $1 por análise. IA clínica acessível sem preços empresariais.",
      en: "As low as $1 per analysis. Accessible clinical AI without enterprise pricing.",
      es: "Desde $1 por análisis. IA clínica accesible sin precios empresariales.",
    },
    footer: {
      pt: "Desenvolvido por Pedro — Médico, Engenheiro, Pesquisador em Neurologia.",
      en: "Built by Pedro — Physician, Engineer, Neurology Researcher.",
      es: "Desarrollado por Pedro — Médico, Ingeniero, Investigador en Neurología.",
    },
    disclaimer: {
      pt: "Ferramenta educacional de apoio à decisão. O médico mantém a responsabilidade clínica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decisión. El médico mantiene la responsabilidad clínica.",
    },
    loginTitle: { pt: "Entrar no DeltaScan", en: "Sign In to DeltaScan", es: "Iniciar sesión en DeltaScan" },
    loginSubtitle: { pt: "Digite seu nome para continuar", en: "Enter your name to continue", es: "Ingrese su nombre para continuar" },
    loginPlaceholder: { pt: "Dr. Seu Nome", en: "Dr. Your Name", es: "Dr. Su Nombre" },
    loginContinue: { pt: "Continuar", en: "Continue", es: "Continuar" },
    loginNameRequired: { pt: "Digite seu nome", en: "Enter your name", es: "Ingrese su nombre" },
  },

  // ── Onboarding ────────────────────────────────────────────────────────────────
  onboarding: {
    welcomePrefix: { pt: "Bem-vindo(a),", en: "Welcome,", es: "Bienvenido(a)," },
    welcomeSuffix: {
      pt: "! Vamos configurar sua conta.",
      en: "! Let's set up your account.",
      es: "! Vamos configurar su cuenta.",
    },
    specialtyTitle: { pt: "Sua Especialidade", en: "Your Specialty", es: "Su Especialidad" },
    specialtySubtitle: {
      pt: "Selecione sua área principal de atuação.",
      en: "Select your primary area of practice.",
      es: "Seleccione su área principal de práctica.",
    },
    planTitle: { pt: "Escolha seu Plano", en: "Choose Your Plan", es: "Elija su Plan" },
    planSubtitle: { pt: "Comece grátis. Faça upgrade a qualquer hora.", en: "Start free. Upgrade anytime.", es: "Comience gratis. Actualice cuando quiera." },
    next: { pt: "Próximo", en: "Next", es: "Siguiente" },
    back: { pt: "Voltar", en: "Back", es: "Volver" },
    getStarted: { pt: "Começar", en: "Get Started", es: "Comenzar" },
    specialties: {
      Obstetrics: { pt: "Obstetrícia", en: "Obstetrics", es: "Obstetricia" },
      Gynecology: { pt: "Ginecologia", en: "Gynecology", es: "Ginecología" },
      Pediatrics: { pt: "Pediatria", en: "Pediatrics", es: "Pediatría" },
      Cardiology: { pt: "Cardiologia", en: "Cardiology", es: "Cardiología" },
      Sonography: { pt: "Ultrassonografia", en: "Sonography", es: "Ultrasonografía" },
      "General Practice": { pt: "Clínica Geral", en: "General Practice", es: "Medicina General" },
      Neurology: { pt: "Neurologia", en: "Neurology", es: "Neurología" },
      Other: { pt: "Outra / Múltiplas", en: "Other / Multiple", es: "Otra / Múltiples" },
      Dermatology: { pt: "Dermatologia", en: "Dermatology", es: "Dermatología" },
      Orthopedics: { pt: "Ortopedia", en: "Orthopedics", es: "Ortopedia" },
    },
    plans: {
      free: {
        label: { pt: "Grátis", en: "Free", es: "Gratis" },
        analyses: { pt: "5 análises/mês", en: "5 analyses/month", es: "5 análisis/mes" },
        desc: { pt: "Experimente o DeltaScan sem custo.", en: "Try DeltaScan at no cost.", es: "Pruebe DeltaScan sin costo." },
      },
      gold: {
        label: { pt: "Gold", en: "Gold", es: "Gold" },
        analyses: { pt: "100 análises/mês", en: "100 analyses/month", es: "100 análisis/mes" },
        desc: { pt: "Para médicos independentes.", en: "For independent physicians.", es: "Para médicos independientes." },
      },
      diamond: {
        label: { pt: "Diamond", en: "Diamond", es: "Diamond" },
        analyses: { pt: "Análises ilimitadas", en: "Unlimited analyses", es: "Análisis ilimitados" },
        desc: { pt: "Clínicas e uso intensivo.", en: "Clinics & intensive use.", es: "Clínicas y uso intensivo." },
      },
    },
  },

  // ── Sidebar ────────────────────────────────────────────────────────────────────
  sidebar: {
    newConsultation: { pt: "Nova Consulta", en: "New Consultation", es: "Nueva Consulta" },
    history: { pt: "Histórico", en: "History", es: "Historial" },
    settings: { pt: "Configurações", en: "Settings & Billing", es: "Configuración" },
    planLabel: {
      free: { pt: "Plano Grátis", en: "Free Plan", es: "Plan Gratis" },
      gold: { pt: "Plano Gold", en: "Gold Plan", es: "Plan Gold" },
      diamond: { pt: "Plano Diamond", en: "Diamond Plan", es: "Plan Diamond" },
    },
    usageOf: { pt: "de", en: "of", es: "de" },
    analyses: { pt: "análises usadas", en: "analyses used", es: "análisis usados" },
  },

  // ── Dashboard / New Consultation ───────────────────────────────────────────────
  dashboard: {
    pageTitle: { pt: "Nova Consulta", en: "New Consultation", es: "Nueva Consulta" },
    specialty: { pt: "Especialidade", en: "Specialty", es: "Especialidad" },
    voiceRecording: { pt: "Gravação de Voz", en: "Voice Recording", es: "Grabación de Voz" },
    recording: { pt: "Gravando...", en: "Recording...", es: "Grabando..." },
    audioCaptured: { pt: "Áudio capturado", en: "Audio captured", es: "Audio capturado" },
    recorded: { pt: "gravado", en: "recorded", es: "grabado" },
    examImage: { pt: "Exame / Imagem", en: "Exam / Image", es: "Examen / Imagen" },
    clickToUpload: { pt: "Clique para carregar", en: "Click to upload", es: "Haga clic para cargar" },
    uploadHint: { pt: "PNG, JPG, JPEG até 10MB", en: "PNG, JPG, JPEG up to 10MB", es: "PNG, JPG, JPEG hasta 10MB" },
    removeImage: { pt: "Remover", en: "Remove", es: "Eliminar" },
    clinicalNotes: { pt: "Notas Clínicas", en: "Clinical Notes", es: "Notas Clínicas" },
    notesPlaceholder: {
      pt: "Histórico do paciente, sintomas, observações...",
      en: "Patient history, symptoms, observations...",
      es: "Historial del paciente, síntomas, observaciones...",
    },
    analyzeBtn: { pt: "Gerar Análise de IA", en: "Generate AI Analysis", es: "Generar Análisis de IA" },
    analyzingBtn: { pt: "Analisando...", en: "Analyzing...", es: "Analizando..." },
    limitReached: { pt: "Limite Atingido — Fazer Upgrade", en: "Limit Reached — Upgrade", es: "Límite Alcanzado — Actualizar" },
    noInput: { pt: "Nenhuma entrada fornecida", en: "No input provided", es: "Sin entrada proporcionada" },
    noInputDesc: {
      pt: "Grave áudio, carregue uma imagem ou adicione notas.",
      en: "Record audio, upload an image, or add notes.",
      es: "Grabe audio, cargue una imagen o agregue notas.",
    },
    usageLimit: {
      pt: "Você atingiu seu limite mensal.",
      en: "You've reached your monthly limit.",
      es: "Ha alcanzado su límite mensual.",
    },
    upgradePlan: { pt: "Fazer upgrade do plano", en: "Upgrade your plan", es: "Actualice su plan" },
    analyzingTitle: { pt: "Analisando consulta...", en: "Analyzing consultation...", es: "Analizando consulta..." },
    analyzingDesc: {
      pt: "Os modelos de IA estão processando a anamnese, estruturando hipóteses e elaborando o plano de cuidado. Pode levar 10–20 segundos.",
      en: "AI models are processing the anamnesis, structuring hypotheses, and elaborating the care plan. This may take 10–20 seconds.",
      es: "Los modelos de IA están procesando la anamnesis, estructurando hipótesis y elaborando el plan de atención. Puede tardar 10–20 segundos.",
    },
    readyTitle: { pt: "Pronto para Análise", en: "Ready for Analysis", es: "Listo para Análisis" },
    readyDesc: {
      pt: "Grave uma consulta, carregue um exame ou adicione notas clínicas — depois clique em \"Gerar Análise de IA\".",
      en: "Record a consultation, upload an exam image, or add clinical notes — then click \"Generate AI Analysis\".",
      es: "Grabe una consulta, cargue una imagen de examen o agregue notas clínicas — luego haga clic en \"Generar Análisis de IA\".",
    },
    cap1: { pt: "Voz → Transcrição", en: "Voice → Transcription", es: "Voz → Transcripción" },
    cap2: { pt: "Imagem → Impressão", en: "Image → Impression", es: "Imagen → Impresión" },
    cap3: { pt: "Notas → Hipóteses", en: "Notes → Hypotheses", es: "Notas → Hipótesis" },
    tabOverview: { pt: "Visão Geral", en: "Overview", es: "Visión General" },
    tabPlan: { pt: "Plano de Cuidado", en: "Care Plan", es: "Plan de Cuidado" },
    tabEducation: { pt: "Ed. Paciente", en: "Patient Ed.", es: "Ed. Paciente" },
    transcription: { pt: "Transcrição / Resumo", en: "Transcription / Summary", es: "Transcripción / Resumen" },
    hypotheses: { pt: "Hipóteses Diagnósticas", en: "Diagnostic Hypotheses", es: "Hipótesis Diagnósticas" },
    imageImpression: { pt: "Impressão da Imagem", en: "Image Impression", es: "Impresión de la Imagen" },
    immediateActions: { pt: "Ações Imediatas", en: "Immediate Actions", es: "Acciones Inmediatas" },
    suggestedExams: { pt: "Exames Sugeridos", en: "Suggested Exams", es: "Exámenes Sugeridos" },
    prescription: { pt: "Prescrição", en: "Prescription", es: "Prescripción" },
    followUp: { pt: "Seguimento", en: "Follow-up", es: "Seguimiento" },
    simpleExplanation: { pt: "Explicação Simples", en: "Simple Explanation", es: "Explicación Simple" },
    dailyGuidelines: { pt: "Orientações Diárias", en: "Daily Guidelines", es: "Orientaciones Diarias" },
    alertSigns: { pt: "Sinais de Alerta", en: "Alert Signs", es: "Señales de Alerta" },
    faq: { pt: "Perguntas Frequentes", en: "FAQ", es: "Preguntas Frecuentes" },
    analysisComplete: { pt: "Análise Concluída", en: "Analysis Complete", es: "Análisis Completado" },
    resultsReady: { pt: "Resultados de IA prontos.", en: "AI results are ready.", es: "Resultados de IA listos." },
    noActions: { pt: "Nenhuma ação imediata registrada.", en: "No immediate actions recorded.", es: "No hay acciones inmediatas registradas." },
    noExams: { pt: "Nenhum exame solicitado.", en: "None requested.", es: "Ninguno solicitado." },
    noPrescription: { pt: "Sem prescrição.", en: "No prescription.", es: "Sin prescripción." },
    demoMode: { pt: "Modo demo — configure uma API key válida para análise de IA real", en: "Demo mode — configure a valid API key for real AI analysis", es: "Modo demo — configure una clave de API válida para análisis de IA real" },
    disclaimer: {
      pt: "Ferramenta educacional de apoio à decisão. O médico mantém a responsabilidade clínica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decisión. El médico mantiene la responsabilidad clínica.",
    },
    specialties: {
      "General Practice": { pt: "Clínica Geral", en: "General Practice", es: "Medicina General" },
      Cardiology: { pt: "Cardiologia", en: "Cardiology", es: "Cardiología" },
      Neurology: { pt: "Neurologia", en: "Neurology", es: "Neurología" },
      Obstetrics: { pt: "Obstetrícia", en: "Obstetrics", es: "Obstetricia" },
      Gynecology: { pt: "Ginecologia", en: "Gynecology", es: "Ginecología" },
      Pediatrics: { pt: "Pediatria", en: "Pediatrics", es: "Pediatría" },
      Sonography: { pt: "Ultrassonografia", en: "Sonography", es: "Ultrasonografía" },
      Dermatology: { pt: "Dermatologia", en: "Dermatology", es: "Dermatología" },
      Orthopedics: { pt: "Ortopedia", en: "Orthopedics", es: "Ortopedia" },
    },
  },

  // ── History ────────────────────────────────────────────────────────────────────
  history: {
    title: { pt: "Histórico de Consultas", en: "Consultation History", es: "Historial de Consultas" },
    subtitle: { pt: "Todas as análises e registros anteriores.", en: "All previous analyses and records.", es: "Todos los análisis y registros anteriores." },
    noHistory: { pt: "Nenhuma consulta ainda", en: "No consultations yet", es: "Sin consultas aún" },
    noHistoryDesc: {
      pt: "Inicie uma nova consulta para ver seu histórico aqui.",
      en: "Start a new consultation to see your history here.",
      es: "Inicie una nueva consulta para ver su historial aquí.",
    },
    notesLabel: { pt: "Notas / Transcrição", en: "Notes / Transcription", es: "Notas / Transcripción" },
    noNotes: { pt: "Sem notas registradas.", en: "No notes recorded.", es: "Sin notas registradas." },
    topHypothesis: { pt: "Hipótese Principal", en: "Top Hypothesis", es: "Hipótesis Principal" },
    noHypotheses: { pt: "Sem hipóteses", en: "No hypotheses", es: "Sin hipótesis" },
    disclaimer: {
      pt: "Ferramenta educacional de apoio à decisão. O médico mantém a responsabilidade clínica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decisión. El médico mantiene la responsabilidad clínica.",
    },
  },

  // ── Settings ────────────────────────────────────────────────────────────────────
  settings: {
    title: { pt: "Configurações e Faturamento", en: "Settings & Billing", es: "Configuración y Facturación" },
    subtitle: { pt: "Gerencie sua conta, uso e assinatura.", en: "Manage your account, usage and subscription.", es: "Administre su cuenta, uso y suscripción." },
    account: { pt: "Conta", en: "Account", es: "Cuenta" },
    signOut: { pt: "Sair", en: "Sign Out", es: "Cerrar sesión" },
    usage: { pt: "Uso Este Mês", en: "Usage This Month", es: "Uso Este Mes" },
    analysesUsed: { pt: "Análises usadas", en: "Analyses used", es: "Análisis usados" },
    unlimited: { pt: "Ilimitado", en: "Unlimited", es: "Ilimitado" },
    freeLimit: { pt: "O plano gratuito inclui 5 análises/mês. Faça upgrade para mais.", en: "Free plan includes 5 analyses/month. Upgrade to unlock more.", es: "El plan gratuito incluye 5 análisis/mes. Actualice para obtener más." },
    upgradePlan: { pt: "Faça Upgrade do Plano", en: "Upgrade Your Plan", es: "Actualice Su Plan" },
    activePlan: { pt: "Ativo:", en: "Active:", es: "Activo:" },
    analysesPerMonth: { pt: "análises/mês", en: "analyses/month", es: "análisis/mes" },
    goldDesc: { pt: "Para médicos independentes", en: "For independent physicians", es: "Para médicos independientes" },
    diamondDesc: { pt: "Clínicas e uso intensivo", en: "Clinics & intensive use", es: "Clínicas y uso intensivo" },
    upgradeToGold: { pt: "Upgrade para Gold", en: "Upgrade to Gold", es: "Actualizar a Gold" },
    upgradeToDiamond: { pt: "Upgrade para Diamond", en: "Upgrade to Diamond", es: "Actualizar a Diamond" },
    processing: { pt: "Processando...", en: "Processing...", es: "Procesando..." },
    mostPopular: { pt: "MAIS POPULAR", en: "MOST POPULAR", es: "MÁS POPULAR" },
    planActivated: { pt: "Plano ativado!", en: "Plan activated!", es: "¡Plan activado!" },
    planUpdated: { pt: "Seu plano foi atualizado com sucesso.", en: "Your plan has been updated successfully.", es: "Su plan ha sido actualizado exitosamente." },
    plans: {
      free: { pt: "Grátis", en: "Free", es: "Gratis" },
      gold: { pt: "Gold", en: "Gold", es: "Gold" },
      diamond: { pt: "Diamond", en: "Diamond", es: "Diamond" },
    },
    goldFeatures: {
      pt: ["100 análises/mês", "Análise de voz e texto", "Hipóteses diagnósticas", "Histórico completo"],
      en: ["100 analyses/month", "Voice & text analysis", "Diagnostic hypotheses", "Full history"],
      es: ["100 análisis/mes", "Análisis de voz y texto", "Hipótesis diagnósticas", "Historial completo"],
    },
    diamondFeatures: {
      pt: ["Análises ilimitadas", "Análise de imagem (Exames, Lesões)", "Materiais educativos para paciente", "Suporte prioritário 24/7"],
      en: ["Unlimited analyses", "Image analysis (Exams, Lesions)", "AI patient education materials", "Priority support 24/7"],
      es: ["Análisis ilimitados", "Análisis de imágenes (Exámenes, Lesiones)", "Materiales educativos para paciente", "Soporte prioritario 24/7"],
    },
    disclaimer: {
      pt: "Ferramenta educacional de apoio à decisão. O médico mantém a responsabilidade clínica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decisión. El médico mantiene la responsabilidad clínica.",
    },
  },
} as const;

export function t<S extends keyof typeof T>(section: S, key: keyof (typeof T)[S], lang: Lang): string {
  const entry = T[section][key] as Record<Lang, string> | undefined;
  if (!entry) return String(key);
  return entry[lang] ?? entry["en"] ?? String(key);
}

export function tArr<S extends keyof typeof T>(section: S, key: keyof (typeof T)[S], lang: Lang): string[] {
  const entry = T[section][key] as Record<Lang, string[]> | undefined;
  if (!entry) return [];
  return entry[lang] ?? entry["en"] ?? [];
}

export function tNested<S extends keyof typeof T>(
  section: S,
  key: keyof (typeof T)[S],
  subkey: string,
  lang: Lang
): string {
  const map = T[section][key] as Record<string, Record<Lang, string>> | undefined;
  if (!map || !map[subkey]) return subkey;
  return map[subkey][lang] ?? map[subkey]["en"] ?? subkey;
}
