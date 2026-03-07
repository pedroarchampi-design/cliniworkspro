import { Shield, Zap, Check, BarChart3, Star, LogOut, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useCheckout } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { t, tArr, tNested } from "@/lib/i18n";

export default function Settings() {
  const { auth, logout, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const checkout = useCheckout();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const handleSubscribe = (plan: "gold" | "diamond") => {
    checkout.mutate({ plan, doctorId: auth.doctorName }, {
      onSuccess: () => {
        upgradePlan(plan);
        toast({
          title: t("settings", "planActivated", lang),
          description: t("settings", "planUpdated", lang),
        });
      }
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const usagePct = Math.min(100, (auth.usageCount / auth.usageLimit) * 100);

  const goldFeatures = tArr("settings", "goldFeatures", lang);
  const diamondFeatures = tArr("settings", "diamondFeatures", lang);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-300" data-testid="page-settings">
      <div>
        <h1 className="text-3xl font-bold">{t("settings", "title", lang)}</h1>
        <p className="text-muted-foreground mt-1">{t("settings", "subtitle", lang)}</p>
      </div>

      {/* Account */}
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            {t("settings", "account", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{auth.doctorName}</p>
              <p className="text-sm text-muted-foreground">{auth.doctorSpecialty}</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {tNested("settings", "plans", auth.plan, lang)} {t("settings", "activePlan", lang).replace(":", "")}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("settings", "signOut", lang)}
          </Button>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t("settings", "usage", lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t("settings", "analysesUsed", lang)}</span>
            <span className="font-bold" data-testid="text-usage-count">
              {auth.usageCount} / {auth.usageLimit === 999 ? "∞" : auth.usageLimit}
            </span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${auth.usageLimit === 999 ? 20 : usagePct}%` }}
              data-testid="bar-usage"
            />
          </div>
          {auth.plan === "free" && (
            <p className="text-xs text-muted-foreground">{t("settings", "freeLimit", lang)}</p>
          )}
        </CardContent>
      </Card>

      {/* Plans upgrade */}
      {auth.plan === "free" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t("settings", "upgradePlan", lang)}</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Gold */}
            <Card className="border-border/50 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg cursor-default">
              <CardHeader className="pb-4 pt-6 text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-14 h-14 flex items-center justify-center mb-3">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">{tNested("settings", "plans", "gold", lang)}</CardTitle>
                <p className="text-muted-foreground text-sm">{t("settings", "goldDesc", lang)}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$20</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {goldFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                <Button
                  onClick={() => handleSubscribe("gold")}
                  variant="outline"
                  className="w-full h-11 mt-4 border-primary/40 text-primary hover:bg-primary/10"
                  disabled={checkout.isPending}
                  data-testid="button-subscribe-gold"
                >
                  {t("settings", "upgradeToGold", lang)}
                </Button>
              </CardContent>
            </Card>

            {/* Diamond */}
            <Card className="border-primary shadow-lg shadow-primary/10 hover:-translate-y-1 transition-all hover:shadow-xl cursor-default relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-none px-3 py-0.5 text-xs font-bold shadow flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> {t("settings", "mostPopular", lang)}
                </Badge>
              </div>
              <CardHeader className="pb-4 pt-8 text-center">
                <div className="mx-auto bg-gradient-to-br from-teal-500 to-blue-500 p-3 rounded-2xl w-14 h-14 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/20">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl text-primary">{tNested("settings", "plans", "diamond", lang)}</CardTitle>
                <p className="text-muted-foreground text-sm">{t("settings", "diamondDesc", lang)}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">$50</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {diamondFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                <Button
                  onClick={() => handleSubscribe("diamond")}
                  className="w-full h-11 mt-4 medical-gradient text-white font-bold shadow-md hover:shadow-lg"
                  disabled={checkout.isPending}
                  data-testid="button-subscribe-diamond"
                >
                  {checkout.isPending ? t("settings", "processing", lang) : t("settings", "upgradeToDiamond", lang)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Active plan */}
      {auth.plan !== "free" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                {auth.plan === "diamond" ? <Zap className="w-5 h-5 text-primary" /> : <Shield className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="font-bold">{t("settings", "activePlan", lang)} {tNested("settings", "plans", auth.plan, lang)}</p>
                <p className="text-sm text-muted-foreground">
                  {auth.usageLimit === 999 ? t("settings", "unlimited", lang) : auth.usageLimit} {t("settings", "analysesPerMonth", lang)}
                </p>
              </div>
              <Badge className="ml-auto bg-primary text-primary-foreground">{t("settings", "activePlan", lang).replace(":", "")}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground pb-4">
        {t("settings", "disclaimer", lang)}
      </p>
    </div>
  );
}
