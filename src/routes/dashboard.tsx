import { createFileRoute, Link } from "@tanstack/react-router";
import { useRecommendationStore } from "@/stores/recommendation";
import { useApiConfigStore } from "@/stores/apiConfig";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { ControlsPanel } from "@/components/dashboard/ControlsPanel";
import { SdlcTab } from "@/components/dashboard/tabs/SdlcTab";
import { FinanceTab } from "@/components/dashboard/tabs/FinanceTab";
import { ModelsTab } from "@/components/dashboard/tabs/ModelsTab";
import { CompareTab } from "@/components/dashboard/tabs/CompareTab";
import { OptimizationTab } from "@/components/dashboard/tabs/OptimizationTab";
import { ApiConfig } from "@/components/ApiConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, Inbox, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Recommendation Dashboard — AI Model Recommender" },
      { name: "description", content: "Architecture, model picks, and project cost modeling." },
    ],
  }),
  component: DashboardScreen,
});

function EmptyDashboardState() {
  const status = useApiConfigStore((s) => s.status);
  const apiDown = status !== "connected";
  return (
    <Card className="border-border bg-card p-10">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
          {apiDown ? (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          ) : (
            <Inbox className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          {apiDown ? "API not connected yet" : "No recommendation generated"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {apiDown
            ? "Configure the API endpoint above, then submit the questionnaire to populate the dashboard."
            : "Fill out the questionnaire and submit it to generate model recommendations and cost estimates."}
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Go to questionnaire
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function DashboardScreen() {
  const recommendation = useRecommendationStore((s) => s.recommendation);

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
          <div className="flex items-center gap-2">
            <ApiConfig />
            <Button asChild size="sm" variant="ghost">
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                New questionnaire
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-6">
        {!recommendation ? (
          <EmptyDashboardState />
        ) : (
          <>
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
                <TabsContent value="models"><ModelsTab /></TabsContent>
                <TabsContent value="compare"><CompareTab /></TabsContent>
                <TabsContent value="optimization"><OptimizationTab /></TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

