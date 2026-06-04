import type { ModelPricing, WorkloadProfile } from "./types";

export interface CostInputs {
  workload: WorkloadProfile;
  durationMonths: number;
  pricing: ModelPricing;
}

export interface CostBreakdown {
  total_requests: number;
  input_tokens: number;
  output_tokens: number;
  reasoning_tokens: number;
  cached_tokens: number;
  input_cost: number;
  output_cost: number;
  reasoning_cost: number;
  cache_cost: number;
  total_project_cost: number;
  monthly_cost: number;
  cost_per_user: number;
  cost_per_request: number;
}

export function calculateCost({ workload, durationMonths, pricing }: CostInputs): CostBreakdown {
  const months = Math.max(durationMonths, 0);
  const total_requests =
    workload.active_users * workload.requests_per_user_per_day * 30 * months;

  const input_tokens = total_requests * workload.avg_input_tokens;
  const output_tokens = total_requests * workload.avg_output_tokens;
  const reasoning_tokens = total_requests * workload.avg_reasoning_tokens;
  const cached_tokens = total_requests * workload.avg_cached_tokens;

  const input_cost = (input_tokens / 1_000_000) * (pricing.prompt ?? 0);
  const output_cost = (output_tokens / 1_000_000) * (pricing.completion ?? 0);
  const reasoning_cost = (reasoning_tokens / 1_000_000) * (pricing.completion ?? 0);
  const cache_cost = (cached_tokens / 1_000_000) * (pricing.input_cache_read ?? 0);

  const total_project_cost = input_cost + output_cost + reasoning_cost + cache_cost;

  return {
    total_requests,
    input_tokens,
    output_tokens,
    reasoning_tokens,
    cached_tokens,
    input_cost,
    output_cost,
    reasoning_cost,
    cache_cost,
    total_project_cost,
    monthly_cost: months > 0 ? total_project_cost / months : 0,
    cost_per_user: workload.active_users > 0 ? total_project_cost / workload.active_users : 0,
    cost_per_request: total_requests > 0 ? total_project_cost / total_requests : 0,
  };
}

export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
