import { useState } from "react";
import { useLocation } from "wouter";
import { Brain, Shield, DollarSign, Stethoscope, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, setGlobalLang } from "@/hooks/use-language";
import { LANGUAGES, t, type Lang } from "@/lib/i18n";
import { SiGoogle } from "react-icons/si";

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

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col" data-testid="page-landing">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500/20 p-2 rounded-xl">
            <Stethoscope className="w-5 h-5 text-teal-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">DeltaScan</span>
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
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <div className="mb-8 relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-teal-500/30 mx-auto">
            <Stethoscope className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-teal-500/20 blur-xl -z-10" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
          Delta<span className="text-teal-400">Scan</span>
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
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-base h-14 px-8 rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-teal-400/40 transition-all hover:-translate-y-0.5"
          data-testid="button-cta"
        >
          <SiGoogle className="w-5 h-5 mr-2" />
          {t("landing", "signinGoogle", lang)}
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 max-w-4xl w-full">
          {features.map(({ icon: Icon, titleKey, descKey, color, bg, border }) => (
            <div
              key={titleKey}
              className={`${bg} border ${border} rounded-2xl p-6 text-left hover:scale-105 transition-transform`}
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
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-6 border-t border-white/5">
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
              className="w-full h-12 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl"
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
