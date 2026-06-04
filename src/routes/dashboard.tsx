import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRecommendationStore } from "@/stores/recommendation";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { ControlsPanel } from "@/components/dashboard/ControlsPanel";
import { SdlcTab } from "@/components/dashboard/tabs/SdlcTab";
import { FinanceTab } from "@/components/dashboard/tabs/FinanceTab";
import { PlaceholderTab } from "@/components/dashboard/tabs/Placeholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Recommendation Dashboard — AI Model Recommender" },
      { name: "description", content: "Architecture, model picks, and project cost modeling." },
    ],
  }),
  component: DashboardScreen,
});

function DashboardScreen() {
  const recommendation = useRecommendationStore((s) => s.recommendation);
  const navigate = useNavigate();

  useEffect(() => {
    if (!recommendation) navigate({ to: "/" });
  }, [recommendation, navigate]);

  if (!recommendation) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">AI Recommender</div>
              <div className="text-[11px] text-muted-foreground">Recommendation dashboard</div>
            </div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              New questionnaire
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-6">
        <SummaryBar />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          <ControlsPanel />

          <Tabs defaultValue="sdlc" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="sdlc">SDLC</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="sdlc"><SdlcTab /></TabsContent>
            <TabsContent value="finance"><FinanceTab /></TabsContent>
            <TabsContent value="models"><PlaceholderTab title="Model Explorer" /></TabsContent>
            <TabsContent value="compare"><PlaceholderTab title="Compare Models" /></TabsContent>
            <TabsContent value="optimization"><PlaceholderTab title="Optimization Suggestions" /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
