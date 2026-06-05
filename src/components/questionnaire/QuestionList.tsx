import type { Questionnaire } from "@/lib/types";
import { useApiConfigStore } from "@/stores/apiConfig";
import { CircleDot, AlertCircle, ListChecks } from "lucide-react";

interface Props {
  questionnaire?: Questionnaire;
  answers: Record<string, unknown>;
  isLoading?: boolean;
  isError?: boolean;
  onJump?: (id: string) => void;
}

function shortLabel(label: string, max = 48) {
  const clean = label.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

function isAnswered(v: unknown) {
  if (v == null || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

export function QuestionList({ questionnaire, answers, isLoading, isError, onJump }: Props) {
  const status = useApiConfigStore((s) => s.status);
  const sections = questionnaire?.sections ?? [];
  const allQuestions = sections.flatMap((s) =>
    (s.questions ?? []).map((q) => ({ ...q, sectionTitle: s.title })),
  ) ?? [];
  const answeredCount = allQuestions.filter((q) => isAnswered(answers[q.id])).length;

  return (
    <aside className="sticky top-6 h-fit rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Questionnaire
            </div>
            <div className="text-sm font-semibold text-foreground">All questions</div>
          </div>
        </div>
        {allQuestions.length > 0 && (
          <div className="rounded-md border border-border bg-background px-2 py-1 text-[11px] tabular-nums text-muted-foreground">
            {answeredCount}/{allQuestions.length}
          </div>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-3">
        {isLoading && (
          <div className="space-y-2 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-7 animate-pulse rounded-md bg-muted/40" />
            ))}
          </div>
        )}

        {!isLoading && (isError || !questionnaire) && (
          <div className="space-y-2 p-2 text-xs">
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-amber-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <div className="font-medium">
                  {status === "connected" ? "No questions available" : "API not connected yet"}
                </div>
                <div className="mt-0.5 text-muted-foreground">
                  {status === "connected"
                    ? "The backend returned no questionnaire payload."
                    : "Configure the API endpoint above to load questions."}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && sections.length > 0 && (
          <ul className="space-y-4 p-1">
            {sections.map((section, sIdx) => (
              <li key={section.id}>
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {sIdx + 1}. {section.title}
                </div>
                <ul className="space-y-0.5">
                  {(section.questions ?? []).map((q, qIdx) => {
                    const answered = isAnswered(answers[q.id]);
                    return (
                      <li key={q.id}>
                        <button
                          type="button"
                          onClick={() => onJump?.(q.id)}
                          className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <CircleDot
                            className={`h-3 w-3 shrink-0 ${
                              answered ? "text-emerald-400" : "text-muted-foreground/40"
                            }`}
                          />
                          <span className="w-5 shrink-0 tabular-nums text-[10px] text-muted-foreground/60">
                            {qIdx + 1}.
                          </span>
                          <span className="truncate group-hover:text-foreground">
                            {shortLabel(q.label)}
                          </span>
                          {q.required && (
                            <span className="ml-auto text-[10px] text-destructive/70">*</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
