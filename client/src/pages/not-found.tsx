import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="bg-destructive/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">404</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Página não encontrada. Verifique a URL ou volte ao dashboard.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/dashboard")}
            className="mt-4 medical-gradient text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
