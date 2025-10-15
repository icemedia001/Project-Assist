import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "accent" | "neutral" | "success" | "warning";
};

export default function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  const tones: Record<string, string> = {
    accent: "bg-[var(--accent)] text-[var(--accent-contrast)]",
    neutral: "bg-[#1f2637] text-[color:var(--text)]",
    success: "bg-green-600/20 text-green-300",
    warning: "bg-yellow-600/20 text-yellow-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${tones[tone]} ${className}`} {...props} />
  );
}


