import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import HomeApp from "./pages/HomeApp";

const root = createRoot(document.getElementById("root")!);
root.render(<HomeApp />);
