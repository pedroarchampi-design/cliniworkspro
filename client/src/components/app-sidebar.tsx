import { Link, useLocation } from "wouter";
import { ActivitySquare, Clock, Settings, Stethoscope, BarChart3, Sparkles, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { t, tNested } from "@/lib/i18n";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-500/20 text-slate-400 border-slate-500/20",
  gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  diamond: "bg-primary/20 text-primary border-primary/20",
};

const PIPELINE_LABELS: Record<string, Record<string, string>> = {
  whisper_stt: { pt: "Voz para Texto", en: "Voice to Text", es: "Voz a Texto" },
  clinical_analysis: { pt: "Analise Clinica", en: "Clinical Analysis", es: "Analisis Clinico" },
  image_analysis: { pt: "Analise de Imagem", en: "Image Analysis", es: "Analisis de Imagen" },
  patient_education: { pt: "Ed. Paciente", en: "Patient Ed.", es: "Ed. Paciente" },
};

export function AppSidebar() {
  const [location] = useLocation();
  const { auth, logout } = useAuth();
  const { lang } = useLanguage();

  const { data: aiStatus } = useQuery<{
    anyAI: boolean;
    providers: Record<string, boolean>;
    pipelines: Record<string, { available: boolean }>;
  }>({
    queryKey: ["/api/ai-status"],
    refetchInterval: 60000,
  });

  const navItems = [
    { titleKey: "newConsultation" as const, href: "/dashboard", icon: ActivitySquare },
    { titleKey: "history" as const, href: "/history", icon: Clock },
    { titleKey: "settings" as const, href: "/settings", icon: Settings },
  ];

  const usagePct = Math.min(100, (auth.usageCount / auth.usageLimit) * 100);
  const planLabel = tNested("sidebar", "planLabel", auth.plan, lang);

  const activePipelines = aiStatus?.pipelines
    ? Object.values(aiStatus.pipelines).filter(p => p.available).length
    : 0;
  const totalPipelines = 4;

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 pt-6">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-primary/15 p-2 rounded-xl">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">DeltaScan</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AI Clinical Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const active = location === item.href;
                const label = t("sidebar", item.titleKey, lang);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`rounded-xl mb-0.5 transition-all ${
                        active
                          ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                          : "hover:bg-sidebar-accent text-sidebar-foreground"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5"
                        data-testid={`nav-${item.titleKey.toLowerCase()}`}
                      >
                        <item.icon className={`w-4 h-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        <span className="text-sm">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pipeline Status */}
        {aiStatus && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
              {t("sidebar", "pipelinesTitle", lang)}
            </SidebarGroupLabel>
            <div className="px-3 py-3 bg-sidebar-accent/50 rounded-xl border border-sidebar-border/50 mx-1 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t("sidebar", "pipelineStatus", lang)}</span>
                <span className={`font-bold ${activePipelines === totalPipelines ? "text-emerald-400" : activePipelines > 0 ? "text-yellow-400" : "text-destructive"}`}>
                  {activePipelines}/{totalPipelines} {t("sidebar", "pipelineActive", lang)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {["whisper_stt", "clinical_analysis", "image_analysis", "patient_education"].map((key) => {
                  const available = aiStatus.pipelines?.[key]?.available;
                  const label = PIPELINE_LABELS[key]?.[lang] || key;
                  return (
                    <div
                      key={key}
                      className={`h-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                      title={`${label}: ${available ? "ativo" : "inativo"}`}
                    />
                  );
                })}
              </div>
            </div>
          </SidebarGroup>
        )}

        {/* Usage meter */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
            {t("settings", "usage", lang)}
          </SidebarGroupLabel>
          <div className="px-3 py-3 bg-sidebar-accent/50 rounded-xl border border-sidebar-border/50 mx-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <BarChart3 className="w-3 h-3" /> {t("sidebar", "analyses", lang)}
              </span>
              <span className="font-bold text-foreground" data-testid="text-sidebar-usage">
                {auth.usageCount}/{auth.usageLimit === 999 ? "\u221e" : auth.usageLimit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-sidebar-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${auth.usageLimit === 999 ? 20 : usagePct}%` }}
              />
            </div>
          </div>
        </SidebarGroup>

        {/* Upgrade CTA */}
        {auth.plan === "free" && (
          <SidebarGroup className="mt-2 px-1">
            <Link href="/upgrade">
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-3 cursor-pointer hover:from-primary/30 hover:to-accent/30 transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-foreground">Fazer Upgrade</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Desbloqueie consultas ilimitadas e analise de imagens
                </p>
              </div>
            </Link>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-1">
          <div className="bg-primary/10 w-9 h-9 rounded-xl flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {auth.doctorName?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{auth.doctorName || "Doctor"}</p>
            <Badge className={`text-xs px-1.5 py-0 border mt-0.5 ${PLAN_COLORS[auth.plan] || PLAN_COLORS.free}`}>
              {planLabel}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={logout}
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
