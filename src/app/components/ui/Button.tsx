"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";

  let styles = "";
  if (variant === "primary") {
    styles = "bg-[var(--accent)] text-[var(--accent-contrast)] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]";
  } else if (variant === "secondary") {
    styles = "bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] hover:bg-[#1b2233]";
  } else {
    styles = "bg-transparent text-[color:var(--text)] hover:bg-[#1b2233]";
  }

  return (
    <button className={`${base} ${sizes} ${styles} ${className}`} {...props} />
  );
}


