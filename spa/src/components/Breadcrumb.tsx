import React from "react";

/**
 * Show breadcrumb on non-home pages.
 * Use page title (not URL) — pass `title` from the page/shell.
 */
export default function Breadcrumb({ title, isHome = false }: { title: string; isHome?: boolean }) {
  if (isHome) return null;
  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="max-w-[120rem] mx-auto px-4">
        <nav aria-label="Breadcrumb" className="py-2 text-sm">
          <ol className="flex items-center gap-2 text-slate-600">
            <li>
              <a href="/" className="text-blue-700 hover:text-blue-900">
                Home
              </a>
            </li>
            <li aria-hidden>›</li>
            <li className="text-slate-900">{title}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
