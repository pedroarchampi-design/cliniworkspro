import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

// Pages
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import NewConsultation from "@/pages/new-consultation";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Force dark mode globally
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!auth.isLoggedIn) {
      setLocation("/");
    } else if (!auth.onboardingDone && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [auth.isLoggedIn, auth.onboardingDone, location, setLocation]);

  if (!auth.isLoggedIn || !auth.onboardingDone) return null;
  return <>{children}</>;
}

function AppShell() {
  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="flex items-center gap-3 p-3 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10 lg:hidden">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <span className="font-bold text-foreground tracking-tight">DeltaScan</span>
          </header>
          <main className="flex-1 overflow-y-auto w-full">
            <Switch>
              <Route path="/dashboard" component={NewConsultation} />
              <Route path="/history" component={History} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route>
        <AuthGuard>
          <AppShell />
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
