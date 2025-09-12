import React from "react";

type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full border-b border-slate-200 bg-white">
      <ol className="max-w-[120rem] mx-auto px-4 py-2 flex flex-wrap items-center gap-2 text-sm">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
            {c.href ? (
              <a href={c.href} className="text-blue-700 hover:text-blue-900 underline-offset-2 hover:underline">
                {c.label}
              </a>
            ) : (
              <span className="text-slate-700 font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
