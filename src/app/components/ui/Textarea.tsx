"use client";

import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ label, error, className = "", id, rows = 3, ...props }: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs mb-1 text-[color:var(--muted)]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full resize-none rounded-md bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] px-3 py-2 text-sm placeholder-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}


