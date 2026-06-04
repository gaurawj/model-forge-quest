import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Answers, Questionnaire } from "@/lib/types";
import { QuestionRenderer } from "@/components/questionnaire/QuestionRenderer";
import { QuestionList } from "@/components/questionnaire/QuestionList";
import { SubmitOverlay } from "@/components/questionnaire/SubmitOverlay";
import { useApiConfigStore } from "@/stores/apiConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecommendationStore } from "@/stores/recommendation";
import { ApiConfig } from "@/components/ApiConfig";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Model Recommendation & Cost Estimation" },
      { name: "description", content: "Get tailored AI model recommendations, architecture, and project cost estimates." },
    ],
  }),
  component: QuestionnaireScreen,
});

function QuestionnaireScreen() {
  const navigate = useNavigate();
  const setRecommendation = useRecommendationStore((s) => s.setRecommendation);
  const [answers, setAnswers] = useState<Answers>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const q = useQuery<Questionnaire>({
    queryKey: ["questionnaire"],
    queryFn: api.getQuestionnaire,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (a: Answers) => api.postRecommend(a),
    onSuccess: (data) => {
      setRecommendation(data);
      navigate({ to: "/dashboard" });
    },
  });

  const handleSubmit = () => {
    setValidationError(null);
    const missing: string[] = [];
    q.data?.sections.forEach((s) =>
      s.questions.forEach((qq) => {
        if (!qq.required) return;
        const v = answers[qq.id];
        if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) {
          missing.push(qq.label);
        }
      }),
    );
    if (missing.length) {
      setValidationError(`Please answer: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`);
      return;
    }
    mutation.mutate(answers);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              AI Recommender
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Step 1 of 2 — Questionnaire</span>
            <ApiConfig />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tell us about your project</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer a few questions and we'll recommend models, architecture, and project cost.
            </p>
          </div>

          {q.isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-card" />
              ))}
            </div>
          )}

          {q.isError && (
            <Card className="border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium">API not connected yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {(q.error as Error)?.message ?? "Could not reach the recommendation backend."}
                    {" "}Configure the API endpoint in the header, then retry to load the questionnaire.
                  </div>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => q.refetch()}>
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!q.isLoading && !q.isError && !q.data && (
            <Card className="border-border bg-card p-10 text-center">
              <div className="mx-auto max-w-sm">
                <div className="text-sm font-medium text-foreground">No questions available</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  The backend returned an empty questionnaire.
                </div>
              </div>
            </Card>
          )}

          {q.data?.sections.map((section) => (
            <Card key={section.id} className="border-border bg-card p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
                {section.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
              <div className="space-y-6">
                {section.questions.map((question) => (
                  <div key={question.id} id={`q-${question.id}`} className="scroll-mt-24">
                    <QuestionRenderer
                      question={question}
                      value={answers[question.id]}
                      onChange={(v) => setAnswers((a) => ({ ...a, [question.id]: v }))}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {q.data && (
            <div className="flex flex-col items-end gap-2">
              {validationError && (
                <div className="text-xs text-destructive">{validationError}</div>
              )}
              {mutation.isError && (
                <div className="text-xs text-destructive">
                  {(mutation.error as Error)?.message ?? "Request failed"}
                </div>
              )}
              <Button onClick={handleSubmit} disabled={mutation.isPending} size="lg">
                Generate recommendations
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        <QuestionList
          questionnaire={q.data}
          answers={answers}
          isLoading={q.isLoading}
          isError={q.isError}
          onJump={(id) => {
            const el = document.getElementById(`q-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </main>

      <SubmitOverlay open={mutation.isPending} />

    </div>
  );
}
