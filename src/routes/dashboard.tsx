import { createFileRoute, Link } from "@tanstack/react-router";
import { useRecommendationStore } from "@/stores/recommendation";
import { useApiConfigStore } from "@/stores/apiConfig";
import { DashboardHeader } from "@/components/dashboard/Header";
import { ProjectConfigSidebar } from "@/components/dashboard/ProjectConfigSidebar";
import { RecommendationSummary } from "@/components/dashboard/widgets/RecommendationSummary";
import { RiskPanel } from "@/components/dashboard/widgets/RiskPanel";
import { SdlcPlanTab } from "@/components/dashboard/tabs/SdlcPlanTab";
import { FinancialTab } from "@/components/dashboard/tabs/FinancialTab";
import { ComparePlansTab } from "@/components/dashboard/tabs/ComparePlansTab";
import { VendorQuadrantTab } from "@/components/dashboard/tabs/VendorQuadrantTab";
import { ModelExplorerTab } from "@/components/dashboard/tabs/ModelExplorerTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Nexus AI SDLC Advisor — Toolchain Intelligence" },
      {
        name: "description",
        content:
          "Executive dashboard comparing Recommended, Budget, and Premium AI toolchains across the SDLC.",
      },
    ],
  }),
  component: DashboardScreen,
});

function EmptyState() {
  const status = useApiConfigStore((s) => s.status);
  const apiDown = status !== "connected";
  return (
    <GlassCard className="p-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-background">
          {apiDown ? (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          ) : (
            <Inbox className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <h2 className="mt-4 text-base font-semibold">
          {apiDown ? "API not connected yet" : "No analysis generated"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {apiDown
            ? "Configure the API endpoint above, then submit the questionnaire to populate the advisor."
            : "Complete the questionnaire and submit it to generate the SDLC toolchain plan."}
        </p>
        <Button asChild size="sm" className="mt-5">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Go to questionnaire
          </Link>
        </Button>
      </div>
    </GlassCard>
  );
}

function DashboardScreen() {
  const recommendation = useRecommendationStore((s) => s.recommendation);

  return (
    <div className="min-h-screen bg-background">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-3xl" />
        <div className="absolute right-0 top-40 h-[600px] w-[600px] rounded-full bg-purple-500/[0.06] blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>

      <DashboardHeader />

      <div className="flex w-full">
        <main className="flex-1 min-w-0 space-y-5 px-6 py-6">
          {!recommendation ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <RecommendationSummary />
                <RiskPanel />
              </div>

              <Tabs defaultValue="sdlc" className="space-y-4">
                <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1 h-10">
                  <TabsTrigger value="sdlc" className="data-[state=active]:bg-white/[0.06]">
                    SDLC Plan
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="data-[state=active]:bg-white/[0.06]">
                    Financial Analysis
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="data-[state=active]:bg-white/[0.06]">
                    Compare Plans
                  </TabsTrigger>
                  <TabsTrigger value="quadrant" className="data-[state=active]:bg-white/[0.06]">
                    Vendor Quadrant
                  </TabsTrigger>
                  <TabsTrigger value="models" className="data-[state=active]:bg-white/[0.06]">
                    Model Explorer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sdlc"><SdlcPlanTab /></TabsContent>
                <TabsContent value="financial"><FinancialTab /></TabsContent>
                <TabsContent value="compare"><ComparePlansTab /></TabsContent>
                <TabsContent value="quadrant"><VendorQuadrantTab /></TabsContent>
                <TabsContent value="models"><ModelExplorerTab /></TabsContent>
              </Tabs>
            </>
          )}
        </main>

        <ProjectConfigSidebar />
      </div>
    </div>
  );
}
