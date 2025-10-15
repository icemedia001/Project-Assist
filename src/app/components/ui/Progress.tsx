import React from "react";

type ProgressProps = {
  value: number; // 0 - 100
  className?: string;
};

export default function Progress({ value, className = "" }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full h-2 bg-[#1f2637] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-[var(--accent)] transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}


