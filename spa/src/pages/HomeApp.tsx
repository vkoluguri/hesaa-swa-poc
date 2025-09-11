import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { default as Content } from "./HomeContent"; // move previous page body to a new file (below)

// This file renders the frame (Header + Footer) and full-width layout
export default function HomeApp() {
  return (
    <div className="min-h-dvh bg-white">
      <Header />
      <main className="mx-auto w-full max-w-site px-4 py-6">
        <Content />
      </main>
      <Footer />
    </div>
  );
}
