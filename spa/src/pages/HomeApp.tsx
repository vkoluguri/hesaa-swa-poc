// Frame only (Header + Footer + container)
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeContent from "./HomeContent";

export default function HomeApp() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <Header />
      <main id="main-content" className="flex-1 w-full">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
