import { useConsultations } from "@/hooks/use-consultations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR, enUS, es, type Locale } from "date-fns/locale";
import { Activity, Calendar, Clock, BrainCircuit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const DATE_LOCALES: Record<Lang, Locale> = { pt: ptBR, en: enUS, es: es };

export default function History() {
  const { auth } = useAuth();
  const { lang } = useLanguage();
  const { data, isLoading, error } = useConsultations(auth.doctorName || "demo_doctor");

  const dateLocale = DATE_LOCALES[lang];

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Failed to load history.</p>
      </div>
    );
  }

  const consultations = data?.consultations || [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-300" data-testid="page-history">
      <div>
        <h1 className="text-3xl font-bold">{t("history", "title", lang)}</h1>
        <p className="text-muted-foreground mt-1">{t("history", "subtitle", lang)}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden border-border/50">
              <CardHeader className="pb-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-5">
                <Skeleton className="h-16 w-full mb-3" />
                <Skeleton className="h-5 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-border/50">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{t("history", "noHistory", lang)}</h3>
          <p className="text-muted-foreground mt-2 text-sm">{t("history", "noHistoryDesc", lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {consultations.map(consultation => {
            const date = consultation.createdAt ? new Date(consultation.createdAt) : new Date();
            let topHypothesis = t("history", "noHypotheses", lang);
            let topProb = "baixa";
            if (consultation.hypotheses && Array.isArray(consultation.hypotheses) && consultation.hypotheses.length > 0) {
              topHypothesis = (consultation.hypotheses as any[])[0].condition;
              topProb = (consultation.hypotheses as any[])[0].probability;
            }

            return (
              <Card
                key={consultation.id}
                className="hover-elevate cursor-pointer border-border/50 shadow-sm overflow-hidden group hover:border-primary/30 transition-all"
                data-testid={`card-consultation-${consultation.id}`}
              >
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 relative">
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="text-xs font-mono">#{consultation.id}</Badge>
                  </div>
                  <CardTitle className="text-base flex items-center gap-2 pr-8">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    {consultation.doctorSpecialty}
                  </CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(date, "dd MMM yyyy", { locale: dateLocale })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(date, "HH:mm")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {t("history", "notesLabel", lang)}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {consultation.doctorNotes || consultation.transcription || t("history", "noNotes", lang)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t("history", "topHypothesis", lang)}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{topHypothesis}</span>
                      <Badge className={`text-xs font-bold px-2 py-0.5 shrink-0 ${
                        topProb === "alta" || topProb === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        topProb === "media" || topProb === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {topProb?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-2">
        {t("history", "disclaimer", lang)}
      </p>
    </div>
  );
}
