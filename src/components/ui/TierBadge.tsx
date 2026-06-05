import { cn } from "@/lib/utils";
import type { RecommendationCategory } from "@/lib/types";

const STYLES: Record<RecommendationCategory, string> = {
  recommended:
    "bg-[color:var(--tier-recommended-bg)] text-[color:var(--tier-recommended-fg)] border-[color:var(--tier-recommended-border)]",
  budget:
    "bg-[color:var(--tier-budget-bg)] text-[color:var(--tier-budget-fg)] border-[color:var(--tier-budget-border)]",
  premium:
    "bg-[color:var(--tier-premium-bg)] text-[color:var(--tier-premium-fg)] border-[color:var(--tier-premium-border)]",
};

const LABELS: Record<RecommendationCategory, string> = {
  recommended: "Recommended",
  budget: "Budget",
  premium: "Premium",
};

export function TierBadge({
  tier,
  className,
  children,
}: {
  tier: RecommendationCategory;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        STYLES[tier],
        className,
      )}
    >
      {children ?? LABELS[tier]}
    </span>
  );
}

export const TIER_ACCENT: Record<RecommendationCategory, string> = {
  recommended:
    "border-[color:var(--tier-recommended-border)] bg-[color:var(--tier-recommended-bg)]",
  budget:
    "border-[color:var(--tier-budget-border)] bg-[color:var(--tier-budget-bg)]",
  premium:
    "border-[color:var(--tier-premium-border)] bg-[color:var(--tier-premium-bg)]",
};

export const TIER_RING: Record<RecommendationCategory, string> = {
  recommended: "ring-1 ring-[color:var(--tier-recommended-border)]",
  budget: "ring-1 ring-[color:var(--tier-budget-border)]",
  premium: "ring-1 ring-[color:var(--tier-premium-border)]",
};
