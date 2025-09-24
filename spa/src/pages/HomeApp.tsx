import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeContent from "./HomeContent";

export default function HomeApp() {
  return (
    <>
      {/* Skip link for keyboard users (only visible on focus) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-white focus:text-blue-700 focus:ring-2 focus:ring-blue-600 focus:px-3 focus:py-2 rounded"
      >
        Skip to main content
      </a>

      <Header />

      {/* small gap so page content/breadcrumb never crowds the nav */}
      <main
        id="main"
        tabIndex={-1}                 // ← enables focus landing from the skip link
        aria-labelledby="page-title"   // ← points to the page H1 (see below)
        className="mt-4 md:mt-6"
      >
        <HomeContent showBreadcrumb={false} />
      </main>

      <Footer />
    </>
  );
}
