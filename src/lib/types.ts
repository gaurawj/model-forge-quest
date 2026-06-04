// API types — adjust if backend payload differs.

export type QuestionType = "single_choice" | "multi_choice" | "descriptive";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Questionnaire {
  sections: QuestionSection[];
}

export type AnswerValue = string | string[] | undefined;
export type Answers = Record<string, AnswerValue>;

export interface ModelPricing {
  prompt: number;
  completion: number;
  input_cache_read?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  context_window?: number;
  capabilities?: string[];
  pricing?: ModelPricing;
  description?: string;
  supports_vision?: boolean;
  supports_tool_calling?: boolean;
  supports_reasoning?: boolean;
}

export interface WorkloadProfile {
  active_users: number;
  requests_per_user_per_day: number;
  avg_input_tokens: number;
  avg_output_tokens: number;
  avg_reasoning_tokens: number;
  avg_cached_tokens: number;
  cache_eligible: boolean;
  batch_eligible: boolean;
  min_context_window?: number;
  recommended_context_window?: number;
  complexity?: string;
  latency_requirement?: string;
  project_duration_months?: number;
}

export interface ArchitectureRole {
  role: string;
  recommended_model_id?: string;
  budget_model_id?: string;
  premium_model_id?: string;
  reason?: string;
}

export interface Architecture {
  pattern?: string;
  hosting_strategy?: string;
  framework?: string;
  framework_constraints?: string[];
  roles?: ArchitectureRole[];
  notes?: string;
}

export type RecommendationCategory = "recommended" | "budget" | "premium";

export interface SingleModelRecommendation {
  category: RecommendationCategory;
  model_id: string;
  reason?: string;
}

export interface PricingInformation {
  model_id: string;
  pricing: ModelPricing;
}

export type OptimisationImpact = "high" | "medium" | "low" | string;

export interface OptimisationTip {
  impact: OptimisationImpact;
  title: string;
  description: string;
}

export interface QuestionnaireSummary {
  project_name?: string;
  project_duration_months?: number;
  [k: string]: unknown;
}

export interface RecommendationOutput {
  questionnaire_summary: QuestionnaireSummary;
  workload_profile: WorkloadProfile;
  architecture: Architecture;
  single_model_recommendations: SingleModelRecommendation[];
  pricing_information: PricingInformation[];
  optimisation_tips: OptimisationTip[];
  confidence: number;
}
