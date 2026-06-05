import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

export const GlassCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.015]",
        "backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_8px_30px_-12px_rgba(0,0,0,0.6)]",
        className,
      )}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";
