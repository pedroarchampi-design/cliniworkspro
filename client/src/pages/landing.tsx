import { useState } from "react";
import { useLocation } from "wouter";
import { Brain, Shield, DollarSign, Stethoscope, Globe, ChevronDown, Mic, Image, FileText, Sparkles, Activity, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, setGlobalLang } from "@/hooks/use-language";
import { LANGUAGES, t, type Lang } from "@/lib/i18n";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { lang, setLang } = useLanguage();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLangChange = (code: Lang) => {
    setLang(code);
    setShowLangMenu(false);
  };

  const handleSignIn = () => {
    if (!doctorName.trim()) {
      toast({ title: t("landing", "loginNameRequired", lang), variant: "destructive" });
      return;
    }
    login(doctorName.trim());
    setShowLoginDialog(false);
    setLocation("/onboarding");
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  const features = [
    { icon: Brain, titleKey: "feature1Title" as const, descKey: "feature1Desc" as const, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    { icon: Shield, titleKey: "feature2Title" as const, descKey: "feature2Desc" as const, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { icon: DollarSign, titleKey: "feature3Title" as const, descKey: "feature3Desc" as const, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  const pipelines = [
    { icon: Mic, label: t("landing", "pipeline1", lang), desc: t("landing", "pipeline1Desc", lang), color: "from-teal-500 to-teal-600" },
    { icon: Brain, label: t("landing", "pipeline2", lang), desc: t("landing", "pipeline2Desc", lang), color: "from-blue-500 to-blue-600" },
    { icon: Image, label: t("landing", "pipeline3", lang), desc: t("landing", "pipeline3Desc", lang), color: "from-purple-500 to-purple-600" },
    { icon: FileText, label: t("landing", "pipeline4", lang), desc: t("landing", "pipeline4Desc", lang), color: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col" data-testid="page-landing">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/3 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <nav className="relative flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500/20 p-2 rounded-xl">
            <Stethoscope className="w-5 h-5 text-teal-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">DeltaScan</span>
          <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full font-medium ml-1">v2.0</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
            data-testid="button-language"
          >
            <Globe className="w-4 h-4" />
            <span>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-teal-500/20 hover:text-white transition-colors flex items-center gap-2 ${lang === l.code ? "bg-teal-500/10 text-teal-300" : ""}`}
                  data-testid={`button-lang-${l.code}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-20">
        <div className="mb-8 relative">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-teal-500/30 mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
            <Stethoscope className="w-14 h-14 text-white" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-teal-500/20 blur-2xl -z-10 animate-pulse" />
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3" /> AI
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
          Delta<span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">Scan</span>
        </h1>
        <p className="text-xl md:text-2xl text-teal-300 font-medium mb-3">
          {t("landing", "tagline", lang)}
        </p>
        <p className="text-slate-400 max-w-xl text-base md:text-lg mb-10 leading-relaxed">
          {t("landing", "subtitle", lang)}
        </p>

        <Button
          size="lg"
          onClick={() => setShowLoginDialog(true)}
          className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-900 font-bold text-base h-14 px-10 rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-teal-400/40 transition-all hover:-translate-y-1 hover:scale-105"
          data-testid="button-cta"
        >
          {t("landing", "startFree", lang)}
        </Button>

        {/* 4 AI Pipelines showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 max-w-3xl w-full">
          {pipelines.map(({ icon: Icon, label, desc, color }, i) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/8 hover:border-white/20 transition-all hover:-translate-y-1 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`bg-gradient-to-br ${color} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{label}</h4>
              <p className="text-[10px] text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 max-w-4xl w-full">
          {features.map(({ icon: Icon, titleKey, descKey, color, bg, border }) => (
            <div
              key={titleKey}
              className={`${bg} border ${border} rounded-2xl p-6 text-left hover:scale-105 transition-transform duration-300`}
              data-testid={`card-feature-${titleKey}`}
            >
              <div className={`${bg} border ${border} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{t("landing", titleKey, lang)}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t("landing", descKey, lang)}</p>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-16 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-teal-500" /> LGPD / HIPAA</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-500" /> DeltaScan AI Engine</span>
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-purple-500" /> Multi-Pipeline Architecture</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative text-center py-8 px-6 border-t border-white/5">
        <p className="text-slate-500 text-sm">{t("landing", "footer", lang)}</p>
        <p className="text-slate-600 text-xs mt-1">{t("landing", "disclaimer", lang)}</p>
      </footer>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t("landing", "loginTitle", lang)}</DialogTitle>
            <p className="text-slate-400 text-sm">{t("landing", "loginSubtitle", lang)}</p>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder={t("landing", "loginPlaceholder", lang)}
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSignIn()}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl"
              data-testid="input-doctor-name"
              autoFocus
            />
            <Button
              onClick={handleSignIn}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-900 font-bold rounded-xl"
              data-testid="button-login-continue"
            >
              {t("landing", "loginContinue", lang)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
