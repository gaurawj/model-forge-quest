# Dashboard Layout Refactor Plan (Updated)

## Objective

Simplify the SDLC dashboard experience by:

- Removing the AI Recommendation Score widget.
- Keeping only Recommendation Summary and Risk Assessment at the top.
- Moving Project Configuration into a permanent right-side sidebar.
- Reducing SDLC table clutter by removing repeated model names and tier labels from every stage row.
- Displaying model selections once in the SDLC header section.
- Using stage rows purely as navigation/drill-down elements.
- Preserving detailed model, token, cost, and confidence information inside expanded stage panels.

---

# 1. Top Dashboard Widgets

## Remove

Delete:

```text
src/components/dashboard/widgets/RecommendationGauge.tsx

```

## Dashboard Header Area

Replace current 3-card layout with a 2-card layout.

### Layout

```text
┌────────────────────────────────────┬────────────────────────────────────┐
│ Recommendation Summary             │ Risk Assessment                    │
└────────────────────────────────────┴────────────────────────────────────┘

```

### Recommendation Summary

Display:

- Recommended Strategy
- Selected AI Toolchain
- Key recommendation rationale
- Cost vs capability summary

### Risk Assessment

Display:

- Cost Risk
- Vendor Lock-in Risk
- Compliance Risk
- Scalability Risk

---

# 2. Main Dashboard Layout

Move Project Configuration out of the main content flow.

## New Layout

```text
┌──────────────────────────────────────────┬──────────────────────────┐
│                                          │                          │
│ Main Dashboard Content                   │ Project Configuration    │
│                                          │                          │
│ Tabs                                     │ Sticky Sidebar           │
│ SDLC                                     │                          │
│ Financial                                │                          │
│ Compare                                  │                          │
│ Quadrant                                 │                          │
│                                          │                          │
└──────────────────────────────────────────┴──────────────────────────┘

```

## Structure

### Left Panel

Contains:

- Recommendation Summary
- Risk Assessment
- Tabs
- Tab Content

### Right Panel

Contains:

- Full Project Configuration

Width:

```text
340px

```

Behavior:

```text
sticky top-[64px]
h-screen
overflow-y-auto
shrink-0

```

Always visible.

No collapse functionality.

---

# 3. Project Configuration Sidebar

## Create

```text
src/components/dashboard/ProjectConfigSidebar.tsx

```

## Move Existing Controls

Move all controls from ProjectConfigCard into sidebar.

### Sections

#### Use Case

- Use Case Dropdown

#### Project Characteristics

- Complexity Slider
- Codebase Size Slider
- Project Duration Slider

#### Description

- Project Description Textarea

#### Compliance

- SOC2
- HIPAA
- On-Premise
- Zero Data Retention

#### Model Strategy

- Best Per Stage
- Claude Only
- GPT Only
- Gemini Only
- Self Hosted

#### Actions

Vertical stack:

```text
Analyze Toolchain
Save Scenario
Export Report
Share

```

---

# 4. SDLC Tab Structure

## Simplify Accordion Rows

### Current

Rows contain:

```text
Stage
Recommended Label
Budget Label
Premium Label

```

### New

Rows contain:

```text
Stage Only

```

Example:

```text
▶ Requirements
▶ Architecture
▶ Development
▶ Testing
▶ Deployment

```

No model names.

No costs.

No tier labels.

No repeated information.

---

# 5. SDLC Header Redesign

The model selection is displayed once.

## Header Layout

```text
┌────────────────────────────────────────────────────┐
│ Stage      Recommended     Budget      Premium     │
│            Claude Sonnet   Gemini      Claude Opus │
└────────────────────────────────────────────────────┘

```

### Purpose

Provide context for:

- Recommended model
- Budget model
- Premium model

without repeating the same information on every row.

---

# 6. Header Alignment

Update SDLC header grid to match accordion rows.

Use identical layout:

```text
grid-cols-[1.2fr_1fr_1fr_1fr_auto]

```

Apply:

```text
px-5

```

Add:

```text
border-b

```

for alignment and visual consistency.

---

# 7. Expanded Stage View

Expanded stage remains the primary detail area.

Example:

```text
▼ Requirements

```

Displays:

## AI Thinking Workflow

```text
1. Parse business problem
2. Identify stakeholders
3. Extract requirements
4. Detect conflicts
5. Generate user stories
6. Create acceptance criteria
7. Build specification

```

## Recommended Card

Display:

- Model Name
- Input Tokens
- Output Tokens
- Cost
- Confidence
- Benefits

## Budget Card

Display:

- Model Name
- Input Tokens
- Output Tokens
- Cost
- Confidence
- Benefits

## Premium Card

Display:

- Model Name
- Input Tokens
- Output Tokens
- Cost
- Confidence
- Benefits

### Layout

```text
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Recommended    │ │ Budget         │ │ Premium        │
└────────────────┘ └────────────────┘ └────────────────┘

```

---

# 8. SDLC User Experience

### Overview Level

User sees:

```text
Requirements
Architecture
Development
Code Review
Testing
Documentation
Deployment
Maintenance

```

### Drill-Down Level

Click stage:

```text
Requirements
├─ AI Thinking Workflow
├─ Recommended Analysis
├─ Budget Analysis
└─ Premium Analysis

```

This reduces visual noise while preserving detailed analysis.

---

# 9. Files To Modify

## Edit

```text
src/routes/dashboard.tsx
src/components/dashboard/sdlc/SdlcStageAccordion.tsx
src/components/dashboard/tabs/SdlcPlanTab.tsx
src/components/dashboard/ProjectConfigCard.tsx

```

## Create

```text
src/components/dashboard/ProjectConfigSidebar.tsx

```

## Delete

```text
src/components/dashboard/widgets/RecommendationGauge.tsx

```

---

# Out of Scope

No changes to:

```text
Questionnaire screen
Financial Analysis tab
Compare Plans tab
Vendor Quadrant tab
Backend calculations
Cost estimation logic
Analyze Toolchain behavior
API integrations

```

&nbsp;