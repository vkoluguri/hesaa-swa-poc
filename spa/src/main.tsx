import React from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";

// Mount into #hesaa-homepage-root (defined in index.html)
const rootEl = document.getElementById("hesaa-homepage-root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Header />
    </React.StrictMode>
  );
}
