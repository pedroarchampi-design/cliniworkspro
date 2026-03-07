import { useState, useRef } from "react";
import { Mic, Square, Upload, X, CheckCircle2, AlertCircle, FileText, Activity, BrainCircuit, Zap, Check, FlaskConical } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useCreateConsultation } from "@/hooks/use-consultations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { t, tNested } from "@/lib/i18n";

const SPECIALTIES = [
  "General Practice", "Cardiology", "Neurology", "Obstetrics",
  "Pediatrics", "Sonography", "Dermatology", "Orthopedics"
];

export default function NewConsultation() {
  const { toast } = useToast();
  const { auth, incrementUsage } = useAuth();
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [specialty, setSpecialty] = useState<string>(auth.doctorSpecialty || "General Practice");
  const [notes, setNotes] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { isRecording, recordingTime, audioBase64, startRecording, stopRecording, clearAudio } = useAudioRecorder();
  const createConsultation = useCreateConsultation();
  const { data: aiStatus } = useQuery<{ openai: boolean; anyAI: boolean; whisper: boolean; imageAnalysis: boolean }>({
    queryKey: ["/api/ai-status"],
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!audioBase64 && !notes && !imageBase64) {
      toast({ title: t("dashboard", "noInput", lang), description: t("dashboard", "noInputDesc", lang), variant: "destructive" });
      return;
    }
    if (auth.usageCount >= auth.usageLimit) {
      toast({ title: t("dashboard", "usageLimit", lang), description: t("dashboard", "upgradePlan", lang), variant: "destructive" });
      return;
    }
    createConsultation.mutate({
      doctorId: auth.doctorName || "demo_doctor",
      doctorSpecialty: specialty,
      doctorNotes: notes,
      audioBase64: audioBase64 || undefined,
      imageBase64: imageBase64 || undefined,
    }, {
      onSuccess: () => {
        incrementUsage();
        toast({ title: t("dashboard", "analysisComplete", lang), description: t("dashboard", "resultsReady", lang) });
        setActiveTab("overview");
      }
    });
  };

  const result = createConsultation.data?.data;
  const usageLeft = auth.usageLimit - auth.usageCount;
  const isAtLimit = auth.usageCount >= auth.usageLimit;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300" data-testid="page-dashboard">

      {/* Usage warning */}
      {usageLeft <= 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {t("dashboard", "usageLimit", lang)}{" "}
            <a href="/settings" className="underline">{t("dashboard", "upgradePlan", lang)}</a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                {t("dashboard", "pageTitle", lang)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">

              {/* Specialty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboard", "specialty", lang)}
                </label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="h-11 rounded-xl" data-testid="select-specialty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map(s => (
                      <SelectItem key={s} value={s}>
                        {tNested("dashboard", "specialties", s, lang) || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Recording */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  {t("dashboard", "voiceRecording", lang)}
                </label>
                {!audioBase64 ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isAtLimit}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl disabled:opacity-40
                        ${isRecording
                          ? "bg-destructive hover:bg-destructive/90 text-white scale-105"
                          : "medical-gradient text-white hover:scale-105 hover:-translate-y-1"
                        }`}
                      data-testid="button-record"
                    >
                      {isRecording && <span className="record-pulse" />}
                      {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-9 h-9" />}
                    </button>
                    <div className="font-mono text-2xl font-bold tracking-tighter text-foreground">
                      {recordingTime}
                    </div>
                    {isRecording && (
                      <p className="text-sm text-destructive font-medium animate-pulse">
                        {t("dashboard", "recording", lang)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-1.5 rounded-full text-primary-foreground">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t("dashboard", "audioCaptured", lang)}</p>
                        <p className="text-xs text-muted-foreground">{recordingTime} {t("dashboard", "recorded", lang)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearAudio} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboard", "examImage", lang)}
                </label>
                {!imageBase64 ? (
                  <div
                    onClick={() => !isAtLimit && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-border rounded-xl p-6 text-center transition-colors ${isAtLimit ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-muted/40 hover:border-primary/40"}`}
                    data-testid="zone-image-upload"
                  >
                    <Upload className="w-7 h-7 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">{t("dashboard", "clickToUpload", lang)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard", "uploadHint", lang)}</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border group">
                    <img src={imageBase64} alt="Uploaded exam" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="sm" onClick={() => setImageBase64(null)}>
                        {t("dashboard", "removeImage", lang)}
                      </Button>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("dashboard", "clinicalNotes", lang)}
                </label>
                <Textarea
                  placeholder={t("dashboard", "notesPlaceholder", lang)}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-[90px] rounded-xl resize-none"
                  disabled={isAtLimit}
                  data-testid="textarea-notes"
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleSubmit}
                disabled={createConsultation.isPending || isRecording || isAtLimit}
                className="w-full h-12 text-base font-bold rounded-xl medical-gradient text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                data-testid="button-analyze"
              >
                {createConsultation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" /> {t("dashboard", "analyzingBtn", lang)}
                  </span>
                ) : isAtLimit ? t("dashboard", "limitReached", lang) : t("dashboard", "analyzeBtn", lang)}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-7">
          {createConsultation.isPending ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border/50 shadow-sm">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("dashboard", "analyzingTitle", lang)}</h3>
              <p className="text-muted-foreground text-center max-w-sm text-sm">
                {t("dashboard", "analyzingDesc", lang)}
              </p>
            </div>
          ) : !result ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-card/50 rounded-2xl border-2 border-dashed border-border/40">
              <div className="bg-primary/10 p-4 rounded-2xl mb-4">
                <BrainCircuit className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{t("dashboard", "readyTitle", lang)}</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {t("dashboard", "readyDesc", lang)}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
                {[t("dashboard", "cap1", lang), t("dashboard", "cap2", lang), t("dashboard", "cap3", lang)].map(cap => (
                  <div key={cap} className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-primary font-medium leading-tight">{cap}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card className="shadow-lg border-border/50 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              {!aiStatus?.anyAI && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs font-medium">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  {t("dashboard", "demoMode", lang)}
                </div>
              )}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-muted/30 border-b border-border/50 p-2">
                  <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-background/50 rounded-xl">
                    {[
                      { value: "overview", labelKey: "tabOverview" as const },
                      { value: "plan", labelKey: "tabPlan" as const },
                      { value: "education", labelKey: "tabEducation" as const },
                    ].map(({ value, labelKey }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-sm"
                        data-testid={`tab-${value}`}
                      >
                        {t("dashboard", labelKey, lang)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="p-5">
                  {/* Overview */}
                  <TabsContent value="overview" className="mt-0 space-y-5">
                    {result.transcription && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" /> {t("dashboard", "transcription", lang)}
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed p-4 bg-muted/40 rounded-xl">
                          {result.transcription}
                        </p>
                      </div>
                    )}

                    {!!(result.hypotheses && Array.isArray(result.hypotheses) && result.hypotheses.length > 0) && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-primary" /> {t("dashboard", "hypotheses", lang)}
                        </h3>
                        <div className="space-y-3">
                          {(result.hypotheses as any[]).map((hyp: any, i: number) => (
                            <div key={i} className="bg-card border border-border p-4 rounded-xl hover:border-primary/30 transition-colors" data-testid={`card-hypothesis-${i}`}>
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="font-bold text-base">{hyp.condition}</h4>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {hyp.icd10 && <span className="text-xs text-muted-foreground font-mono">{hyp.icd10}</span>}
                                  <Badge className={`text-xs font-bold px-2 py-0.5 ${
                                    hyp.probability === "alta" || hyp.probability === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                    hyp.probability === "media" || hyp.probability === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}>
                                    {hyp.probability?.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{hyp.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.imageImpression && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          {t("dashboard", "imageImpression", lang)}
                        </h3>
                        <p className="text-sm text-foreground/80 p-4 bg-primary/5 rounded-xl border border-primary/10 whitespace-pre-wrap">
                          {result.imageImpression}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Care Plan */}
                  <TabsContent value="plan" className="mt-0 space-y-5">
                    {!!(result.carePlan && typeof result.carePlan === "object") && (
                      <>
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {t("dashboard", "immediateActions", lang)}
                          </h3>
                          <ul className="space-y-2">
                            {Array.isArray((result.carePlan as any).immediate_actions) ?
                              ((result.carePlan as any).immediate_actions as string[]).map((action, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg">
                                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span className="text-sm">{action}</span>
                                </li>
                              )) : <p className="text-sm text-muted-foreground p-3 border rounded-lg">{t("dashboard", "noActions", lang)}</p>
                            }
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {t("dashboard", "suggestedExams", lang)}
                          </h3>
                          <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm leading-relaxed">
                            {Array.isArray((result.carePlan as any).exams)
                              ? (result.carePlan as any).exams.join(", ") || t("dashboard", "noExams", lang)
                              : (result.carePlan as any).exams || t("dashboard", "noExams", lang)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {t("dashboard", "prescription", lang)}
                          </h3>
                          <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {(result.carePlan as any).prescription || t("dashboard", "noPrescription", lang)}
                          </div>
                        </div>
                        {(result.carePlan as any).follow_up && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                              {t("dashboard", "followUp", lang)}
                            </h3>
                            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-sm">
                              {(result.carePlan as any).follow_up}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  {/* Patient Education */}
                  <TabsContent value="education" className="mt-0 space-y-5">
                    {!!(result.patientMaterials && typeof result.patientMaterials === "object") && (
                      <>
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {t("dashboard", "simpleExplanation", lang)}
                          </h3>
                          <p className="text-sm text-foreground/80 leading-relaxed p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            {(result.patientMaterials as any).simple_explanation}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                              {t("dashboard", "dailyGuidelines", lang)}
                            </h3>
                            <ul className="space-y-1.5">
                              {Array.isArray((result.patientMaterials as any).daily_guidelines) &&
                                ((result.patientMaterials as any).daily_guidelines as string[]).map((g, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    {g}
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-destructive">
                              {t("dashboard", "alertSigns", lang)}
                            </h3>
                            <ul className="space-y-1.5">
                              {Array.isArray((result.patientMaterials as any).alert_signs) &&
                                ((result.patientMaterials as any).alert_signs as string[]).map((g, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                    {g}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                        {Array.isArray((result.patientMaterials as any).faq) && (result.patientMaterials as any).faq.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                              {t("dashboard", "faq", lang)}
                            </h3>
                            <div className="space-y-2">
                              {(result.patientMaterials as any).faq.map((item: any, i: number) => (
                                <div key={i} className="p-3 bg-muted/30 rounded-xl border border-border">
                                  <p className="text-sm font-semibold mb-1">{item.question}</p>
                                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        {t("dashboard", "disclaimer", lang)}
      </p>
    </div>
  );
}
