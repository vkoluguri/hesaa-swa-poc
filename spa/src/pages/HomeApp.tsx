import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeContent from "./HomeContent";
import "../styles/tailwind.css";

export default function HomeApp() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
