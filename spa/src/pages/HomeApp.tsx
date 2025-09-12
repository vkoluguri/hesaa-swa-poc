import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeContent from "./HomeContent";

export default function HomeApp() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
