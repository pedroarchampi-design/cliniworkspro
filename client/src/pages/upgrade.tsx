import { Shield, Zap, Check, Star } from "lucide-react";
import { useCheckout } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Upgrade() {
  const checkout = useCheckout();

  const handleSubscribe = (plan: string) => {
    checkout.mutate({ plan, doctorId: "demo_doctor" }, {
      onSuccess: (data) => {
        window.location.href = data.checkout_url;
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Eleve sua Prática Clínica
        </h1>
        <p className="text-xl text-muted-foreground">
          Escolha o plano ideal para automatizar sua rotina, ganhar tempo e encantar seus pacientes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* GOLD PLAN */}
        <Card className="relative border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Gold</CardTitle>
            <CardDescription className="text-base mt-2">Para profissionais independentes</CardDescription>
            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">$20</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4">
              {['Até 100 consultas por mês', 'Análise de voz e texto', 'Hipóteses diagnósticas com IA', 'Histórico completo'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6 pb-8">
            <Button 
              className="w-full h-12 text-lg" 
              variant="outline"
              onClick={() => handleSubscribe('gold')}
              disabled={checkout.isPending}
            >
              Assinar Gold
            </Button>
          </CardFooter>
        </Card>

        {/* DIAMOND PLAN */}
        <Card className="relative border-primary shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none px-4 py-1 text-sm font-bold shadow-lg flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" /> MAIS POPULAR
            </Badge>
          </div>
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Diamond</CardTitle>
            <CardDescription className="text-base mt-2">Clínicas e uso intensivo</CardDescription>
            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">$50</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4">
              {['Consultas Ilimitadas', 'Análise de imagens (Exames/Lesões)', 'Materiais educativos gerados por IA', 'Suporte prioritário 24/7'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="pt-6 pb-8">
            <Button 
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-blue-600 shadow-lg hover:shadow-xl hover:from-primary hover:to-primary text-white" 
              onClick={() => handleSubscribe('diamond')}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? "Processando..." : "Assinar Diamond"}
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
