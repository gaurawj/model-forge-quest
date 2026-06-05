## The current Lovable plan is close, but the **SDLC Plan tab structure needs to be redesigned completely** to match your wireframe intent.

### Key Changes Required

#### Current Plan (Remove)

- Expandable table with columns Stage | Recommended | Budget | Premium
- Rows expand into 3 side-by-side model cards

#### New Requirement (Implement)

Create an **accordion-style SDLC execution view**.

Structure:


| Stage | Recommended Model | Budget Model | Premium Model |
| ----- | ----------------- | ------------ | ------------- |


Then for each stage:

```
┌─────────────────────────────────────────────────────────────┐
│ REQUIREMENTS                                      ▼         │
├─────────────────────────────────────────────────────────────┤
│ Recommended : GPT-5                                     │
│ Budget      : GPT-4o Mini                               │
│ Premium     : Claude Opus                               │
├─────────────────────────────────────────────────────────────┤
│ AI Thinking Process                                     │
│ 1. Parse business problem statement                     │
│ 2. Identify stakeholders                                │
│ 3. Extract functional requirements                      │
│ ...                                                     │
│ 10. Create requirement specification                    │
├─────────────────────────────────────────────────────────────┤
│ Cost Breakdown                                          │
│                                                        │
│ [Recommended Card] [Budget Card] [Premium Card]        │
│                                                        │
│ Input Tokens                                            │
│ Output Tokens                                           │
│ Estimated Cost                                          │
│ Confidence Score                                        │
└─────────────────────────────────────────────────────────────┘

```

When clicking the stage header:

```
REQUIREMENTS ▼

```

expand/collapse the entire section.

Repeat the same structure sequentially for:

1. Requirements
2. Architecture
3. Development
4. Code Review
5. Testing
6. Documentation
7. Deployment
8. Maintenance

---

# Updated Lovable Implementation Plan

## Scope

Two screens receive updates while preserving all existing APIs, pricing calculations, recommendation engines, and backend integrations.

---

# Screen 1 — Questionnaire

### QuestionRenderer.tsx

Update question controls:

- single_choice → shadcn Select dropdown
- multi_choice (≤ 6 options) → MultiSelect Combobox with checkbox options
- descriptive → TextArea (unchanged)

Retain:

- Current page layout
- Right-side QuestionList navigation
- Existing validation logic

---

# Screen 2 — Nexus AI SDLC Advisor

## Header

Replace current dashboard header.

### Left Section

- Brain Icon
- Title:
  - Nexus AI SDLC Advisor
- Subtitle:
  - Strategic AI Toolchain Intelligence Platform

### Right Section

Badges:

- Environment
- AI Powered
- Enterprise Edition

Keep:

- ApiConfig component

---

## Remove

- SummaryBar
- ModelsTab
- OptimizationTab

---

# Dashboard Tabs

## 1. SDLC Plan (Primary Tab)

### Layout

Top sticky column header:

| Stage | Recommended Model | Budget Model | Premium Model |

---

### Stage Accordion Sections

Create reusable:

```
<SdlcStageAccordion />

```

Each accordion represents one SDLC stage.

Stages:

- Requirements
- Architecture
- Development
- Code Review
- Testing
- Documentation
- Deployment
- Maintenance

---

### Accordion Header

Display:

| Stage Name | Recommended Model | Budget Model | Premium Model |

Example:

| Requirements | GPT-5 | GPT-4o Mini | Claude Opus |

Header click:

- Expand/Collapse stage details
- Smooth animation

---

### Expanded Content

#### Section A — AI Thinking Steps

Show numbered execution steps.

Use provided stage-specific thinking workflows. (given at the last)

---

### Section B - Cost Breakdown

Three side-by-side cards:

#### Recommended

- Model Name
- Input Tokens
- Output Tokens
- Cost
- Confidence Score

#### Budget

- Model Name
- Input Tokens
- Output Tokens
- Cost
- Confidence Score

#### Premium

- Model Name
- Input Tokens
- Output Tokens
- Cost
- Confidence Score

Reuse existing pricing engine.

---

### Data Mapping

Create:

```
src/lib/sdlcStages.ts

```

Contains:

```ts
{
  stage,
  aiThinkingSteps,
  outputs
}

```

for all 8 SDLC stages.

Model names continue coming from:

```ts
architecture.roles

```

Pricing continues coming from:

```ts
existing token calculator

```

---

## 2. Financial Analysis

Keep current enhancement plan.

Widgets:

### KPI Cards

For:

- Recommended
- Budget
- Premium

Metrics:

- Monthly Cost
- Annual Cost
- 3-Year TCO
- ROI Score

### Charts

- 3-Year Cost Projection
- Monthly Cost Breakdown
- ROI vs Cost Scatter

---

## 3. Compare Plans

Three vertical comparison columns:

- Recommended
- Budget
- Premium

Comparison rows:

- Cost
- Quality
- Accuracy
- Development Speed
- Architecture Quality
- Testing Coverage
- Security
- Documentation

Add:

- Radar Chart
- Pros/Cons
- Final Recommendation Banner

---

## 4. Vendor Quadrant

Gartner-style matrix.

Axes:

- X = Cost Efficiency
- Y = Capability

Quadrants:

- Leaders
- Challengers
- Visionaries
- Niche Players

Filters:

- Recommended
- Budget
- Premium
- All

Bubble Size:

- Number of SDLC stages won

---

# Additional Dashboard Widgets

Place above tabs.

### AI Recommendation Score

Circular Gauge

Metrics:

- Confidence
- Recommendation Strength

---

### Recommendation Summary

Three sections:

#### Recommended

Why it was selected

#### Budget

Cost-optimized rationale

#### Premium

Highest-capability rationale

---

### Risk Assessment

Dimensions:

- Cost Risk
- Vendor Lock-in
- Compliance Risk
- Scalability Risk

Display severity bars.

---

# Design System

## Theme

Retain dark mode.

### Add CSS Tokens

```css
--tier-recommended
--tier-budget
--tier-premium

--tier-recommended-gradient
--tier-budget-gradient
--tier-premium-gradient

--glass-bg
--glass-border

```

---

### Reusable Components

```tsx
<GlassCard />
<TierBadge />
<KpiCard />
<SdlcStageAccordion />
<StageModelCell />
<ThinkingProcessList />
<CostBreakdownCard />

```

---

# Files

## New

```text
src/components/dashboard/Header.tsx
src/components/dashboard/ProjectConfigCard.tsx

src/components/dashboard/widgets/
  RecommendationGauge.tsx
  RiskPanel.tsx
  RecommendationSummary.tsx

src/components/dashboard/tabs/
  SdlcPlanTab.tsx
  FinancialTab.tsx
  ComparePlansTab.tsx
  VendorQuadrantTab.tsx

src/components/dashboard/sdlc/
  SdlcStageAccordion.tsx
  ThinkingProcessList.tsx
  CostBreakdownCard.tsx

src/components/ui/
  GlassCard.tsx
  TierBadge.tsx

src/lib/sdlcStages.ts
src/stores/projectConfig.ts

```

---

## Edit

```text
src/components/questionnaire/QuestionRenderer.tsx
src/routes/dashboard.tsx
src/styles.css

```

---

## Delete

```text
SummaryBar.tsx
ModelsTab.tsx
OptimizationTab.tsx
Old SdlcTab.tsx
Old FinanceTab.tsx
Old CompareTab.tsx

```

---

## Out of Scope

- CSV Export (stub only)
- PDF Export (stub only)
- Share Scenario
- Save Scenario
- Backend persistence
- Mobile optimization (desktop-first)
    
  **Stage wise ai thinking steps-**   
  Requirement:Legacy system audit & inventory,Migration scope definition,Dependency ,mapping,Risk assessment matrix,Stakeholder sign-off docs  
    
  Architecture:Target architecture design (HLD/LLD),Microservices decomposition plan,Data migration strategy,API gateway design,Strangler fig pattern mapping  
    
  development:Service scaffolding & boilerplate**,**Database schema migration scripts,API endpoint implementation,Legacy adapter/wrapper code,Feature parity validation  
    
  code review:Breaking change detection,Backward compatibility checks,Security vulnerability scan,Code quality & lint enforcement**,**Dependency audit  
    
  Testing: Regression test suites,Integration tests (old ↔ new),Load & performance benchmarks,Data migration validation tests,Rollback scenario testing  
    
  Documentation:Migration runbooks,Architecture decision records (ADRs),API changelog & versioning docs,Rollback procedures,Team onboarding guides  
    
  Deployment:Blue-green deployment setup**,**Feature flag configuration,Database migration CI/CD,Canary release pipelines,Monitoring & alerting setup  
    
  Maintanance:Legacy system decommission plan,Performance monitoring dashboards**,**Incident response playbooks,Technical debt tracking,Post-migration optimization  


Shall I proceed?