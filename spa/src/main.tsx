import React from "react";
import { createRoot } from "react-dom/client";
import HomeApp from "./pages/HomeApp";

/** Mounts the homepage React app into #home-root if present */
function mount(selector: string = "#home-root") {
  const el = document.querySelector(selector);
  if (!el) return;
  const root = createRoot(el as HTMLElement);
  root.render(<HomeApp />);
}

// Expose a manual mount if you ever need it
// @ts-ignore
window.HESAA = { ...(window.HESAA || {}), mountHome: mount };

// Auto-mount on DOM ready
if (document.readyState !== "loading") mount();
else document.addEventListener("DOMContentLoaded", () => mount());
