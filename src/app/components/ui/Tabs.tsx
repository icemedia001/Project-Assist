"use client";

import React, { useState } from "react";

type Tab = { id: string; label: string };

type TabsProps = {
  tabs: Tab[];
  value?: string;
  onChange?: (id: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.id);
  const active = value ?? internal;

  const setActive = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-lg bg-[color:var(--surface)] border border-[color:var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              active === t.id
                ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "text-[color:var(--text)] hover:bg-[#1b2233]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}


