## Stage 1 Scope

Ship a working end-to-end slice against your local API (`http://localhost:8000`, overridable via `VITE_API_BASE_URL`). Models tab, Compare tab, and Optimization tab come in Stage 2 (placeholders shown in the tab strip).

## Architecture

- **Stack**: React + TS + Tailwind + shadcn (already in template), TanStack Router/Query (already in template), Zustand for editable controller state, Recharts for charts.
- **API client**: thin `fetch` wrapper reading `import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"`. All calls go browser → your API directly (CORS must be enabled on your backend).
- **Global state (Zustand)**:
  - `modelsStore` — catalog from `/api/v1/models`, loaded once on app mount.
  - `recommendationStore` — last `RecommendationOutput` + editable `workloadDraft` (controller values).
- **TanStack Query** owns server fetches (`questionnaire`, `models`, `recommend` mutation). Zustand owns the user-editable workload draft so dashboard math recalculates instantly without refetching.

## Routes

```text
src/routes/
  __root.tsx          // dark theme shell, loads /api/v1/models on mount
  index.tsx           // Questionnaire screen
  dashboard.tsx       // Recommendation dashboard
```

Submitting the questionnaire runs the `/api/v1/recommend` mutation, stores the response, then `navigate({ to: "/dashboard" })`. Visiting `/dashboard` without a stored recommendation redirects back to `/`.

## Screen 1 — Questionnaire (`/`)

- Loader prefetches `GET /api/v1/questionnaire` via TanStack Query.
- Dynamic renderer handles `single_choice`, `multi_choice`, `descriptive`. Sections rendered as collapsible cards; questions stacked inside.
- Layout: left scroll column (questionnaire), right sticky info panel listing the five deliverables with subtle icons.
- Local form state keyed by `question_id`; basic required-field validation before submit.
- Submit → `POST /api/v1/recommend` with `{ answers: { [question_id]: value } }`.
- **Overlay**: full-screen backdrop blocks pointer events, centered circular progress (indeterminate animated ring), rotating status messages on a 1.5s interval through the six phases. Stays mounted until mutation resolves.

## Screen 2 — Dashboard (`/dashboard`)

### Top summary bar
Six KPI cards from `questionnaire_summary`, `workload_profile`, resolved `single_model_recommendations` (mapped by `model_id` into `pricing_information`/catalog), and `confidence`.

### Left controls panel (30%, sticky)
Editable inputs bound to `workloadDraft`:
- Number inputs: project duration, active_users, requests_per_user_per_day, avg_input/output/reasoning/cached tokens
- Switches: cache_eligible, batch_eligible
- Read-only: min/recommended context window, complexity badge, latency badge

Every change updates Zustand → all derived numbers recompute via `useMemo` selectors.

### Right workspace — Tabs

1. **SDLC** — pattern, hosting strategy, framework + constraints, roles table (Role / Recommended / Budget / Premium / Reason) from `architecture.roles`, notes below.
2. **Finance** — KPI cards (Project Cost, Monthly Cost, Cost/User, Cost/Request) + Recharts: cost breakdown donut (Input/Output/Reasoning/Cache) + duration cost trend line. Uses the formulas below with the **Recommended** model's `pricing_information` entry by default; a small model selector lets you switch which of the three (recommended/budget/premium) drives the math.
3. **Models** — placeholder "Coming next" empty state.
4. **Compare** — placeholder.
5. **Optimization** — placeholder.

### Cost math (client-side, pure function)

```text
total_requests   = active_users * rpu_per_day * 30 * duration_months
input_tokens     = total_requests * avg_input_tokens
output_tokens    = total_requests * avg_output_tokens
reasoning_tokens = total_requests * avg_reasoning_tokens
cached_tokens    = total_requests * avg_cached_tokens

input_cost     = input_tokens     / 1e6 * pricing.prompt
output_cost    = output_tokens    / 1e6 * pricing.completion
reasoning_cost = reasoning_tokens / 1e6 * pricing.completion
cache_cost     = cached_tokens    / 1e6 * pricing.input_cache_read

total_project_cost = sum(above)
monthly_cost       = total_project_cost / duration_months
cost_per_user      = total_project_cost / active_users
cost_per_request   = total_project_cost / total_requests
```

Lives in `src/lib/cost.ts`, fully unit-pure for reuse in Stage 2.

## Design (Vercel/Linear dark)

- Background `#0a0a0a`, surface `#111111`, border `#1f1f1f`, foreground `#e5e5e5`, muted `#a1a1aa`, accent `#3b82f6`.
- Tokens defined in `src/styles.css` under `:root` + `@theme inline` (oklch).
- Tight 4px radius, hairline borders, mono numerals (`tabular-nums`) for KPIs, subtle 150ms transitions, skeletons during loads.

## Files to create

```text
src/lib/api.ts                      // fetch wrapper + env base URL
src/lib/types.ts                    // Questionnaire, Model, RecommendationOutput
src/lib/cost.ts                     // pure cost calculator
src/stores/models.ts                // Zustand: model catalog
src/stores/recommendation.ts        // Zustand: recommendation + workloadDraft
src/routes/index.tsx                // Questionnaire (replaces placeholder)
src/routes/dashboard.tsx            // Dashboard
src/components/questionnaire/*      // QuestionRenderer, InfoPanel, SubmitOverlay
src/components/dashboard/SummaryBar.tsx
src/components/dashboard/ControlsPanel.tsx
src/components/dashboard/tabs/SdlcTab.tsx
src/components/dashboard/tabs/FinanceTab.tsx
src/components/dashboard/tabs/Placeholder.tsx
src/styles.css                      // dark token overrides
```

## Open assumption (flag if wrong)
I'll assume the `RecommendationOutput` shape matches the field names you listed (`questionnaire_summary`, `workload_profile`, `architecture.roles`, `single_model_recommendations[{category, model_id}]`, `pricing_information[{model_id, pricing:{prompt, completion, input_cache_read}}]`, `optimisation_tips`, `confidence`). If your real payload differs, share one sample response and I'll adapt the types in one pass.

Ready to build Stage 1 on approval.