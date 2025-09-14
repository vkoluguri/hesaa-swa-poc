import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeContent from "./HomeContent";

export default function HomeApp() {
  return (
    <>
      <Header />
      {/* small gap so page content/breadcrumb never crowds the nav */}
      <main className="mt-4 md:mt-6">
        {/* Home page: no breadcrumb */}
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
