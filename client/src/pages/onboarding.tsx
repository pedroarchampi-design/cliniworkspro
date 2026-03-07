import { useState } from "react";
import { useLocation } from "wouter";
import { Check, Stethoscope, Heart, Eye, Users, Brain, Baby, Flower2, Smile, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { t, tNested, type Lang } from "@/lib/i18n";

const SPECIALTIES = [
  { id: "Obstetrics", icon: Baby, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { id: "Gynecology", icon: Flower2, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "Pediatrics", icon: Smile, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "Cardiology", icon: Heart, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "Sonography", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "General Practice", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "Neurology", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "Other", icon: Stethoscope, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
];

type PlanId = "free" | "gold" | "diamond";

const PLAN_PRICES: Record<PlanId, string> = { free: "$0", gold: "$20/mo", diamond: "$50/mo" };

const PLAN_ANALYSES: Record<PlanId, Record<Lang, string>> = {
  free:    { pt: "5 análises/mês", en: "5 analyses/month", es: "5 análisis/mes" },
  gold:    { pt: "100 análises/mês", en: "100 analyses/month", es: "100 análisis/mes" },
  diamond: { pt: "Ilimitado", en: "Unlimited", es: "Ilimitado" },
};

const PLAN_DESCS: Record<PlanId, Record<Lang, string>> = {
  free:    { pt: "Experimente o DeltaScan sem custo.", en: "Try DeltaScan at no cost.", es: "Pruebe DeltaScan sin costo." },
  gold:    { pt: "Para médicos independentes.", en: "For independent physicians.", es: "Para médicos independientes." },
  diamond: { pt: "Clínicas e uso intensivo.", en: "Clinics & intensive use.", es: "Clínicas y uso intensivo." },
};

const PLAN_LABELS: Record<PlanId, Record<Lang, string>> = {
  free:    { pt: "Grátis", en: "Free", es: "Gratis" },
  gold:    { pt: "Gold", en: "Gold", es: "Gold" },
  diamond: { pt: "Diamond", en: "Diamond", es: "Diamond" },
};

const PLAN_IDS: PlanId[] = ["free", "gold", "diamond"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { auth, completeOnboarding } = useAuth();
  const { lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("free");

  const handleFinish = () => {
    completeOnboarding(selectedSpecialty, selectedPlan);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-6 py-12" data-testid="page-onboarding">
      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= s ? "bg-teal-500 border-teal-500 text-slate-900" : "border-white/20 text-slate-500"}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className={`w-16 h-0.5 ${step > s ? "bg-teal-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-400 text-sm">
          {t("onboarding", "welcomePrefix", lang)}{" "}
          <span className="text-teal-400 font-semibold">{auth.doctorName}</span>
          {t("onboarding", "welcomeSuffix", lang)}
        </p>
      </div>

      <div className="w-full max-w-lg">
        {/* Step 1: Specialty */}
        {step === 1 && (
          <div className="space-y-6" data-testid="step-specialty">
            <div>
              <h2 className="text-2xl font-bold mb-1">{t("onboarding", "specialtyTitle", lang)}</h2>
              <p className="text-slate-400 text-sm">{t("onboarding", "specialtySubtitle", lang)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SPECIALTIES.map(({ id, icon: Icon, color, bg, border }) => (
                <button
                  key={id}
                  onClick={() => setSelectedSpecialty(id)}
                  className={`${bg} border ${selectedSpecialty === id ? "border-teal-500 ring-2 ring-teal-500/30" : border} rounded-2xl p-4 text-left transition-all hover:scale-105 relative`}
                  data-testid={`card-specialty-${id.toLowerCase().replace(/ /g, "-")}`}
                >
                  {selectedSpecialty === id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-slate-900" />
                    </div>
                  )}
                  <Icon className={`w-6 h-6 ${color} mb-2`} />
                  <p className="font-medium text-sm text-white">{tNested("onboarding", "specialties", id, lang)}</p>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedSpecialty}
              className="w-full h-12 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl"
              data-testid="button-next-step"
            >
              {t("onboarding", "next", lang)} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <div className="space-y-6" data-testid="step-plan">
            <div>
              <h2 className="text-2xl font-bold mb-1">{t("onboarding", "planTitle", lang)}</h2>
              <p className="text-slate-400 text-sm">{t("onboarding", "planSubtitle", lang)}</p>
            </div>
            <div className="space-y-3">
              {PLAN_IDS.map(id => (
                <button
                  key={id}
                  onClick={() => setSelectedPlan(id)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all ${
                    selectedPlan === id
                      ? "border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/30"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  } ${id === "diamond" ? "relative overflow-hidden" : ""}`}
                  data-testid={`card-plan-${id}`}
                >
                  {id === "diamond" && (
                    <div className="absolute top-0 right-0 bg-teal-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                      {t("settings", "mostPopular", lang)}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      {selectedPlan === id ? (
                        <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-slate-900" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                      )}
                      <span className="font-bold text-white">{PLAN_LABELS[id][lang]}</span>
                    </div>
                    <span className="text-teal-400 font-bold">{PLAN_PRICES[id]}</span>
                  </div>
                  <p className="text-slate-400 text-sm ml-8">
                    {PLAN_ANALYSES[id][lang]} — {PLAN_DESCS[id][lang]}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-12 border-white/10 text-slate-300 hover:bg-white/5 rounded-xl"
                data-testid="button-back-step"
              >
                {t("onboarding", "back", lang)}
              </Button>
              <Button
                onClick={handleFinish}
                className="flex-1 h-12 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl"
                data-testid="button-finish-onboarding"
              >
                {t("onboarding", "getStarted", lang)}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-600 text-center max-w-sm">
        {t("landing", "disclaimer", lang)}
      </p>
    </div>
  );
}
