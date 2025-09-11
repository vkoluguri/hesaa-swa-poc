import React from "react";
import ReactDOM from "react-dom/client";
import HomeApp from "./pages/HomeApp";
import "./styles/tailwind.css"; // ✅ Tailwind included here once

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HomeApp />
  </React.StrictMode>
);
