import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css"; // keeps dev DX; final CSS is emitted by your build:css step
import HomeApp from "./pages/HomeApp";

const root = createRoot(document.getElementById("root")!);
root.render(<HomeApp />);
