"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs mb-1 text-[color:var(--muted)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] px-3 py-2 text-sm placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}


