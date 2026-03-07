export type Lang = "pt" | "en" | "es";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "pt", label: "Portugues", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "en", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", label: "Espanol", flag: "\u{1F1EA}\u{1F1F8}" },
];

export const T = {
  // ── Landing ──────────────────────────────────────────────────────────────────
  landing: {
    tagline: { pt: "Inteligencia Clinica em Tempo Real", en: "Real-Time Clinical Intelligence", es: "Inteligencia Clinica en Tiempo Real" },
    subtitle: {
      pt: "Assistente clinico com IA para casos complexos, novos pacientes e decisoes de alto risco. Desenvolvido por medico, para medicos.",
      en: "AI-powered clinical mentor for complex cases, new patients, and high-stakes decisions. Built for physicians, by a physician.",
      es: "Asistente clinico con IA para casos complejos, nuevos pacientes y decisiones de alto riesgo. Desarrollado por medicos, para medicos.",
    },
    startFree: { pt: "Comecar Gratuitamente", en: "Get Started Free", es: "Comenzar Gratis" },
    feature1Title: { pt: "Suporte a Decisao", en: "Decision Support", es: "Apoyo a la Decision" },
    feature1Desc: {
      pt: "Hipoteses diagnosticas geradas por IA e planos de cuidado baseados em evidencias a partir de consultas por voz.",
      en: "AI-generated diagnostic hypotheses and evidence-based care plans from voice consultations.",
      es: "Hipotesis diagnosticas generadas por IA y planes de atencion basados en evidencia a partir de consultas de voz.",
    },
    feature2Title: { pt: "Protecao Legal", en: "Legal Protection", es: "Proteccion Legal" },
    feature2Desc: {
      pt: "Registros completos de consulta com trilhas de raciocinio de IA \u2014 seu julgamento clinico documentado.",
      en: "Full consultation records with AI reasoning trails \u2014 your documented clinical judgment.",
      es: "Registros completos de consulta con trazas de razonamiento de IA \u2014 su juicio clinico documentado.",
    },
    feature3Title: { pt: "Acessibilidade", en: "Affordability", es: "Asequibilidad" },
    feature3Desc: {
      pt: "A partir de $1 por analise. IA clinica acessivel sem precos empresariais.",
      en: "As low as $1 per analysis. Accessible clinical AI without enterprise pricing.",
      es: "Desde $1 por analisis. IA clinica accesible sin precios empresariales.",
    },
    pipeline1: { pt: "Voz para Texto", en: "Voice to Text", es: "Voz a Texto" },
    pipeline1Desc: { pt: "Transcricao inteligente", en: "Smart transcription", es: "Transcripcion inteligente" },
    pipeline2: { pt: "Analise Clinica", en: "Clinical Analysis", es: "Analisis Clinico" },
    pipeline2Desc: { pt: "Hipoteses diagnosticas", en: "Diagnostic hypotheses", es: "Hipotesis diagnosticas" },
    pipeline3: { pt: "Analise de Imagem", en: "Image Analysis", es: "Analisis de Imagen" },
    pipeline3Desc: { pt: "Exames e lesoes", en: "Exams & lesions", es: "Examenes y lesiones" },
    pipeline4: { pt: "Ed. Paciente", en: "Patient Education", es: "Ed. Paciente" },
    pipeline4Desc: { pt: "Material educativo", en: "Educational materials", es: "Material educativo" },
    footer: {
      pt: "Desenvolvido por Pedro \u2014 Medico, Engenheiro, Pesquisador em Neurologia.",
      en: "Built by Pedro \u2014 Physician, Engineer, Neurology Researcher.",
      es: "Desarrollado por Pedro \u2014 Medico, Ingeniero, Investigador en Neurologia.",
    },
    disclaimer: {
      pt: "Ferramenta educacional de apoio a decisao. O medico mantem a responsabilidade clinica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decision. El medico mantiene la responsabilidad clinica.",
    },
    loginTitle: { pt: "Entrar no DeltaScan", en: "Sign In to DeltaScan", es: "Iniciar sesion en DeltaScan" },
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
      pt: "Selecione sua area principal de atuacao.",
      en: "Select your primary area of practice.",
      es: "Seleccione su area principal de practica.",
    },
    planTitle: { pt: "Escolha seu Plano", en: "Choose Your Plan", es: "Elija su Plan" },
    planSubtitle: { pt: "Comece gratis. Faca upgrade a qualquer hora.", en: "Start free. Upgrade anytime.", es: "Comience gratis. Actualice cuando quiera." },
    next: { pt: "Proximo", en: "Next", es: "Siguiente" },
    back: { pt: "Voltar", en: "Back", es: "Volver" },
    getStarted: { pt: "Comecar", en: "Get Started", es: "Comenzar" },
    specialties: {
      Obstetrics: { pt: "Obstetricia", en: "Obstetrics", es: "Obstetricia" },
      Gynecology: { pt: "Ginecologia", en: "Gynecology", es: "Ginecologia" },
      Emergency: { pt: "Emergencia", en: "Emergency Medicine", es: "Medicina de Emergencia" },
      Pediatrics: { pt: "Pediatria", en: "Pediatrics", es: "Pediatria" },
      Cardiology: { pt: "Cardiologia", en: "Cardiology", es: "Cardiologia" },
      Sonography: { pt: "Ultrassonografia", en: "Sonography", es: "Ultrasonografia" },
      "General Practice": { pt: "Clinica Geral", en: "General Practice", es: "Medicina General" },
      Neurology: { pt: "Neurologia", en: "Neurology", es: "Neurologia" },
      Dermatology: { pt: "Dermatologia", en: "Dermatology", es: "Dermatologia" },
      Orthopedics: { pt: "Ortopedia", en: "Orthopedics", es: "Ortopedia" },
      Other: { pt: "Outra / Multiplas", en: "Other / Multiple", es: "Otra / Multiples" },
    },
    plans: {
      free: {
        label: { pt: "Gratis", en: "Free", es: "Gratis" },
        analyses: { pt: "5 analises/mes", en: "5 analyses/month", es: "5 analisis/mes" },
        desc: { pt: "Experimente o DeltaScan sem custo.", en: "Try DeltaScan at no cost.", es: "Pruebe DeltaScan sin costo." },
      },
      gold: {
        label: { pt: "Gold", en: "Gold", es: "Gold" },
        analyses: { pt: "100 analises/mes", en: "100 analyses/month", es: "100 analisis/mes" },
        desc: { pt: "Para medicos independentes.", en: "For independent physicians.", es: "Para medicos independientes." },
      },
      diamond: {
        label: { pt: "Diamond", en: "Diamond", es: "Diamond" },
        analyses: { pt: "Analises ilimitadas", en: "Unlimited analyses", es: "Analisis ilimitados" },
        desc: { pt: "Clinicas e uso intensivo.", en: "Clinics & intensive use.", es: "Clinicas y uso intensivo." },
      },
    },
  },

  // ── Sidebar ────────────────────────────────────────────────────────────────────
  sidebar: {
    newConsultation: { pt: "Nova Consulta", en: "New Consultation", es: "Nueva Consulta" },
    history: { pt: "Historico", en: "History", es: "Historial" },
    settings: { pt: "Configuracoes", en: "Settings & Billing", es: "Configuracion" },
    planLabel: {
      free: { pt: "Plano Gratis", en: "Free Plan", es: "Plan Gratis" },
      gold: { pt: "Plano Gold", en: "Gold Plan", es: "Plan Gold" },
      diamond: { pt: "Plano Diamond", en: "Diamond Plan", es: "Plan Diamond" },
    },
    usageOf: { pt: "de", en: "of", es: "de" },
    analyses: { pt: "analises usadas", en: "analyses used", es: "analisis usados" },
    pipelinesTitle: { pt: "Pipelines de IA", en: "AI Pipelines", es: "Pipelines de IA" },
    pipelineStatus: { pt: "Status", en: "Status", es: "Estado" },
    pipelineActive: { pt: "ativos", en: "active", es: "activos" },
  },

  // ── Dashboard / New Consultation ───────────────────────────────────────────────
  dashboard: {
    pageTitle: { pt: "Nova Consulta", en: "New Consultation", es: "Nueva Consulta" },
    specialty: { pt: "Especialidade", en: "Specialty", es: "Especialidad" },
    voiceRecording: { pt: "Gravacao de Voz", en: "Voice Recording", es: "Grabacion de Voz" },
    recording: { pt: "Gravando...", en: "Recording...", es: "Grabando..." },
    audioCaptured: { pt: "Audio capturado", en: "Audio captured", es: "Audio capturado" },
    recorded: { pt: "gravado", en: "recorded", es: "grabado" },
    examImage: { pt: "Exame / Imagem", en: "Exam / Image", es: "Examen / Imagen" },
    clickToUpload: { pt: "Clique para carregar", en: "Click to upload", es: "Haga clic para cargar" },
    uploadHint: { pt: "PNG, JPG, JPEG ate 10MB", en: "PNG, JPG, JPEG up to 10MB", es: "PNG, JPG, JPEG hasta 10MB" },
    removeImage: { pt: "Remover", en: "Remove", es: "Eliminar" },
    clinicalNotes: { pt: "Notas Clinicas", en: "Clinical Notes", es: "Notas Clinicas" },
    notesPlaceholder: {
      pt: "Historico do paciente, sintomas, observacoes...",
      en: "Patient history, symptoms, observations...",
      es: "Historial del paciente, sintomas, observaciones...",
    },
    analyzeBtn: { pt: "Gerar Analise de IA", en: "Generate AI Analysis", es: "Generar Analisis de IA" },
    analyzingBtn: { pt: "Analisando...", en: "Analyzing...", es: "Analizando..." },
    limitReached: { pt: "Limite Atingido \u2014 Fazer Upgrade", en: "Limit Reached \u2014 Upgrade", es: "Limite Alcanzado \u2014 Actualizar" },
    noInput: { pt: "Nenhuma entrada fornecida", en: "No input provided", es: "Sin entrada proporcionada" },
    noInputDesc: {
      pt: "Grave audio, carregue uma imagem ou adicione notas.",
      en: "Record audio, upload an image, or add notes.",
      es: "Grabe audio, cargue una imagen o agregue notas.",
    },
    usageLimit: {
      pt: "Voce atingiu seu limite mensal.",
      en: "You've reached your monthly limit.",
      es: "Ha alcanzado su limite mensual.",
    },
    upgradePlan: { pt: "Fazer upgrade do plano", en: "Upgrade your plan", es: "Actualice su plan" },
    analyzingTitle: { pt: "Analisando consulta...", en: "Analyzing consultation...", es: "Analizando consulta..." },
    analyzingDesc: {
      pt: "O DeltaScan AI esta processando a anamnese, estruturando hipoteses e elaborando o plano de cuidado. Pode levar 10\u201320 segundos.",
      en: "DeltaScan AI is processing the anamnesis, structuring hypotheses, and elaborating the care plan. This may take 10\u201320 seconds.",
      es: "DeltaScan AI esta procesando la anamnesis, estructurando hipotesis y elaborando el plan de atencion. Puede tardar 10\u201320 segundos.",
    },
    readyTitle: { pt: "Pronto para Analise", en: "Ready for Analysis", es: "Listo para Analisis" },
    readyDesc: {
      pt: "Grave uma consulta, carregue um exame ou adicione notas clinicas \u2014 depois clique em \"Gerar Analise de IA\".",
      en: "Record a consultation, upload an exam image, or add clinical notes \u2014 then click \"Generate AI Analysis\".",
      es: "Grabe una consulta, cargue una imagen de examen o agregue notas clinicas \u2014 luego haga clic en \"Generar Analisis de IA\".",
    },
    cap1: { pt: "Voz \u2192 Transcricao", en: "Voice \u2192 Transcription", es: "Voz \u2192 Transcripcion" },
    cap2: { pt: "Imagem \u2192 Impressao", en: "Image \u2192 Impression", es: "Imagen \u2192 Impresion" },
    cap3: { pt: "Notas \u2192 Hipoteses", en: "Notes \u2192 Hypotheses", es: "Notas \u2192 Hipotesis" },
    tabOverview: { pt: "Visao Geral", en: "Overview", es: "Vision General" },
    tabPlan: { pt: "Plano de Cuidado", en: "Care Plan", es: "Plan de Cuidado" },
    tabEducation: { pt: "Ed. Paciente", en: "Patient Ed.", es: "Ed. Paciente" },
    transcription: { pt: "Transcricao / Resumo", en: "Transcription / Summary", es: "Transcripcion / Resumen" },
    hypotheses: { pt: "Hipoteses Diagnosticas", en: "Diagnostic Hypotheses", es: "Hipotesis Diagnosticas" },
    imageImpression: { pt: "Impressao da Imagem", en: "Image Impression", es: "Impresion de la Imagen" },
    immediateActions: { pt: "Acoes Imediatas", en: "Immediate Actions", es: "Acciones Inmediatas" },
    suggestedExams: { pt: "Exames Sugeridos", en: "Suggested Exams", es: "Examenes Sugeridos" },
    prescription: { pt: "Prescricao", en: "Prescription", es: "Prescripcion" },
    followUp: { pt: "Seguimento", en: "Follow-up", es: "Seguimiento" },
    simpleExplanation: { pt: "Explicacao Simples", en: "Simple Explanation", es: "Explicacion Simple" },
    dailyGuidelines: { pt: "Orientacoes Diarias", en: "Daily Guidelines", es: "Orientaciones Diarias" },
    alertSigns: { pt: "Sinais de Alerta", en: "Alert Signs", es: "Senales de Alerta" },
    faq: { pt: "Perguntas Frequentes", en: "FAQ", es: "Preguntas Frecuentes" },
    analysisComplete: { pt: "Analise Concluida", en: "Analysis Complete", es: "Analisis Completado" },
    resultsReady: { pt: "Resultados de IA prontos.", en: "AI results are ready.", es: "Resultados de IA listos." },
    noActions: { pt: "Nenhuma acao imediata registrada.", en: "No immediate actions recorded.", es: "No hay acciones inmediatas registradas." },
    noExams: { pt: "Nenhum exame solicitado.", en: "None requested.", es: "Ninguno solicitado." },
    noPrescription: { pt: "Sem prescricao.", en: "No prescription.", es: "Sin prescripcion." },
    demoMode: { pt: "Modo demo \u2014 configure uma API key valida para analise de IA real", en: "Demo mode \u2014 configure a valid API key for real AI analysis", es: "Modo demo \u2014 configure una API key valida para analisis de IA real" },
    exportPdf: { pt: "Exportar PDF", en: "Export PDF", es: "Exportar PDF" },
    shareReport: { pt: "Compartilhar", en: "Share", es: "Compartir" },
    disclaimer: {
      pt: "Ferramenta educacional de apoio a decisao. O medico mantem a responsabilidade clinica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decision. El medico mantiene la responsabilidad clinica.",
    },
    specialties: {
      "General Practice": { pt: "Clinica Geral", en: "General Practice", es: "Medicina General" },
      Cardiology: { pt: "Cardiologia", en: "Cardiology", es: "Cardiologia" },
      Neurology: { pt: "Neurologia", en: "Neurology", es: "Neurologia" },
      Obstetrics: { pt: "Obstetricia", en: "Obstetrics", es: "Obstetricia" },
      Gynecology: { pt: "Ginecologia", en: "Gynecology", es: "Ginecologia" },
      Emergency: { pt: "Emergencia", en: "Emergency Medicine", es: "Medicina de Emergencia" },
      Pediatrics: { pt: "Pediatria", en: "Pediatrics", es: "Pediatria" },
      Sonography: { pt: "Ultrassonografia", en: "Sonography", es: "Ultrasonografia" },
      Dermatology: { pt: "Dermatologia", en: "Dermatology", es: "Dermatologia" },
      Orthopedics: { pt: "Ortopedia", en: "Orthopedics", es: "Ortopedia" },
    },
  },

  // ── History ────────────────────────────────────────────────────────────────────
  history: {
    title: { pt: "Historico de Consultas", en: "Consultation History", es: "Historial de Consultas" },
    subtitle: { pt: "Todas as analises e registros anteriores.", en: "All previous analyses and records.", es: "Todos los analisis y registros anteriores." },
    noHistory: { pt: "Nenhuma consulta ainda", en: "No consultations yet", es: "Sin consultas aun" },
    noHistoryDesc: {
      pt: "Inicie uma nova consulta para ver seu historico aqui.",
      en: "Start a new consultation to see your history here.",
      es: "Inicie una nueva consulta para ver su historial aqui.",
    },
    notesLabel: { pt: "Notas / Transcricao", en: "Notes / Transcription", es: "Notas / Transcripcion" },
    noNotes: { pt: "Sem notas registradas.", en: "No notes recorded.", es: "Sin notas registradas." },
    topHypothesis: { pt: "Hipotese Principal", en: "Top Hypothesis", es: "Hipotesis Principal" },
    noHypotheses: { pt: "Sem hipoteses", en: "No hypotheses", es: "Sin hipotesis" },
    disclaimer: {
      pt: "Ferramenta educacional de apoio a decisao. O medico mantem a responsabilidade clinica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decision. El medico mantiene la responsabilidad clinica.",
    },
  },

  // ── Settings ────────────────────────────────────────────────────────────────────
  settings: {
    title: { pt: "Configuracoes e Faturamento", en: "Settings & Billing", es: "Configuracion y Facturacion" },
    subtitle: { pt: "Gerencie sua conta, uso e assinatura.", en: "Manage your account, usage and subscription.", es: "Administre su cuenta, uso y suscripcion." },
    account: { pt: "Conta", en: "Account", es: "Cuenta" },
    signOut: { pt: "Sair", en: "Sign Out", es: "Cerrar sesion" },
    usage: { pt: "Uso Este Mes", en: "Usage This Month", es: "Uso Este Mes" },
    analysesUsed: { pt: "Analises usadas", en: "Analyses used", es: "Analisis usados" },
    unlimited: { pt: "Ilimitado", en: "Unlimited", es: "Ilimitado" },
    freeLimit: { pt: "O plano gratuito inclui 5 analises/mes. Faca upgrade para mais.", en: "Free plan includes 5 analyses/month. Upgrade to unlock more.", es: "El plan gratuito incluye 5 analisis/mes. Actualice para obtener mas." },
    upgradePlan: { pt: "Faca Upgrade do Plano", en: "Upgrade Your Plan", es: "Actualice Su Plan" },
    activePlan: { pt: "Ativo:", en: "Active:", es: "Activo:" },
    analysesPerMonth: { pt: "analises/mes", en: "analyses/month", es: "analisis/mes" },
    goldDesc: { pt: "Para medicos independentes", en: "For independent physicians", es: "Para medicos independientes" },
    diamondDesc: { pt: "Clinicas e uso intensivo", en: "Clinics & intensive use", es: "Clinicas y uso intensivo" },
    upgradeToGold: { pt: "Upgrade para Gold", en: "Upgrade to Gold", es: "Actualizar a Gold" },
    upgradeToDiamond: { pt: "Upgrade para Diamond", en: "Upgrade to Diamond", es: "Actualizar a Diamond" },
    processing: { pt: "Processando...", en: "Processing...", es: "Procesando..." },
    mostPopular: { pt: "MAIS POPULAR", en: "MOST POPULAR", es: "MAS POPULAR" },
    planActivated: { pt: "Plano ativado!", en: "Plan activated!", es: "Plan activado!" },
    planUpdated: { pt: "Seu plano foi atualizado com sucesso.", en: "Your plan has been updated successfully.", es: "Su plan ha sido actualizado exitosamente." },
    plans: {
      free: { pt: "Gratis", en: "Free", es: "Gratis" },
      gold: { pt: "Gold", en: "Gold", es: "Gold" },
      diamond: { pt: "Diamond", en: "Diamond", es: "Diamond" },
    },
    goldFeatures: {
      pt: ["100 analises/mes", "Analise de voz e texto", "Hipoteses diagnosticas", "Historico completo"],
      en: ["100 analyses/month", "Voice & text analysis", "Diagnostic hypotheses", "Full history"],
      es: ["100 analisis/mes", "Analisis de voz y texto", "Hipotesis diagnosticas", "Historial completo"],
    },
    diamondFeatures: {
      pt: ["Analises ilimitadas", "Analise de imagem (Exames, Lesoes)", "Materiais educativos para paciente", "Suporte prioritario 24/7"],
      en: ["Unlimited analyses", "Image analysis (Exams, Lesions)", "AI patient education materials", "Priority support 24/7"],
      es: ["Analisis ilimitados", "Analisis de imagenes (Examenes, Lesiones)", "Materiales educativos para paciente", "Soporte prioritario 24/7"],
    },
    disclaimer: {
      pt: "Ferramenta educacional de apoio a decisao. O medico mantem a responsabilidade clinica.",
      en: "Educational decision support tool. Physician retains clinical accountability.",
      es: "Herramienta educativa de apoyo a la decision. El medico mantiene la responsabilidad clinica.",
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
