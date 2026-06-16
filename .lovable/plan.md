## Goal
Adapt the app to the new `/api/v1/recommend` schema (v2.0) and update SDLC Plan UI so each stage row shows its tier model IDs (header no longer shows aggregate model pills).

## 1. Type remap (`src/lib/types.ts`)
Match new API exactly:

- `SingleModelRecommendation`: add `why?: string`, `tradeoffs?: string` (keep `reason` as alias-fallback).
- New `StageRecommendation` type:
  ```ts
  { stage_name: string;
    models: { recommended_model_id?: string; budget_model_id?: string; premium_model_id?: string;
              recommended_why?: string; budget_why?: string; premium_why?: string;
              key_capability?: string; tradeoffs?: string };
    rationale?: string; }
  ```
- `Architecture`: rename `framework` → `agent_framework_recommendation`; `notes` becomes `string[]`; keep `roles` (now usually empty).
- `OptimisationTip`: rename `description` → `detail` (keep both readable).
- `Confidence` object: `{ score: 'high'|'medium'|'low'|string; reason?: string; assumptions?: string[] }`. `RecommendationOutput.confidence` becomes this object.
- `RecommendationOutput`: add `schema_version?`, `generated_at?`, `input_hash?`, `stage_recommendations: StageRecommendation[]`. Make `pricing_information` optional (no longer returned — pricing now sourced from `/api/v1/models`).
- `WorkloadProfile`: already has the fields; ensure `min_context_window` / `recommended_context_window` / `project_duration_months` stay optional.

## 2. Recommendation store (`src/stores/recommendation.ts`)
- `draftFromRecommendation`: unchanged logic, but read from new `workload_profile` (fields already match).
- Auto-hydrate `modelConfig` (already implemented) keeps working.

## 3. SDLC mapping (`src/lib/sdlcMapping.ts`)
- Switch from fuzzy `architecture.roles` matching to direct `stage_recommendations` lookup by `stage_name` (case-insensitive match against `SDLC_STAGES[].name`).
- Fallback chain per tier: `stage_recommendations[stage].models.{tier}_model_id` → `single_model_recommendations[tier].model_id`.
- Pricing source: `models` catalog (`useModelsStore`) — drop `rec.pricing_information` dependency (use it only if present, else fall back to catalog).
- `confidence` numeric usage: derive numeric from `rec.confidence.score` (high=0.9, medium=0.7, low=0.5; default 0.8) where currently a number was expected.

## 4. SDLC Plan UI

### Header (`src/components/dashboard/tabs/SdlcPlanTab.tsx`)
- Remove the model-name pills (`topModel(...)` chip) from the header row. Keep just the tier label + icon: Recommended / Budget / Premium.
- Remove `topModel` helper.

### Stage row (`src/components/dashboard/sdlc/SdlcStageAccordion.tsx`)
- In the collapsed header row, replace the three empty `<span />` placeholders under the Recommended / Budget / Premium columns with a small pill showing that stage's `pick.modelName` (fallback `pick.modelId`), colored by tier (matches existing `TIER_TEXT` / `TIER_META` palette).
- Cost-breakdown card content (Input/Output/Cached tokens, Total Requests, Duration, Projected Cost) stays unchanged.

## 5. Other readers (minimal touch)
- `RecommendationSummary.tsx`: use `r.why ?? r.reason`.
- `FinancialTab.tsx` / `ComparePlansTab.tsx`: pricing lookup falls back to `useModelsStore` catalog when `pricing_information` is absent. Display rationale uses `why` first.
- `RiskPanel.tsx`: replace `rec.confidence` numeric usage with the new score→number mapping helper.

## Out of scope
- No changes to Model Configuration sidebar, Model Explorer table, or cost formulas.
- No visual redesign of cost-breakdown cards.

Confirm and I'll implement in one batch.
