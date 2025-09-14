(globalThis as any).process ||= { env: { NODE_ENV: "production" } };
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css"; // keeps dev DX; final CSS is emitted by build:css step
import HomeApp from "./pages/HomeApp";

const root = createRoot(document.getElementById("root")!);
root.render(<HomeApp />);
