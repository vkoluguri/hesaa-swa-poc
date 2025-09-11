import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const slides = [
  "/assets/BackToSchool_NJBEST.jpg",
  "/assets/call_center_banner.jpg",
  "/assets/emailAlert_webBanner.jpg",
  "/assets/Grants-Scholarships-Banner2.jpg",
  "/assets/NJCLASSRatesBanner.jpg",
];

const QuickLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} className="block px-4 py-3 rounded-md bg-white/70 hover:bg-white shadow-sm ring-1 ring-slate-200 text-center font-semibold">
    {children}
  </a>
);

export default function HomeContent() {
  const { t } = useTranslation();
  const [showAlert] = useState(false);           // flip true to show emergency bar
  const [idx, setIdx] = useState(0);

  const img = useMemo(() => slides[idx % slides.length], [idx]);

  return (
    <div className="w-full">
      {/* Emergency banner (hidden by default) */}
      {showAlert && (
        <div className="bg-red-600 text-white text-center py-2" role="status" aria-live="polite">
          <span className="font-semibold">🚨 {t("home.emergency")}</span>
        </div>
      )}

      {/* Headline + CTA */}
      <section className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
        <div>
          <h1 className="text-3xl/md font-bold tracking-tight text-slate-900">{t("home.headline")}</h1>
          <p className="mt-3 text-slate-600">{t("home.subhead")}</p>

          <div className="mt-5 flex gap-3">
            <a href="#" className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              {t("home.apply")}
            </a>
            <a href="#" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {t("home.explore")}
            </a>
          </div>

          {/* Spotlight as 2 cards under the headline (your sketch) */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <img src="/assets/NJCLASSRatesBanner.jpg" alt="NJCLASS Rates" className="w-full h-44 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">Academic Year 2025–2026</h3>
                <p className="text-sm text-slate-600">Options now available.</p>
                <a href="#" className="mt-3 inline-block rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-800">Learn more</a>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <img src="/assets/Grants-Scholarships-Banner2.jpg" alt="Grants and Scholarships" className="w-full h-44 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">Grants & Scholarships</h3>
                <p className="text-sm text-slate-600">Complete your financial aid application.</p>
                <a href="#" className="mt-3 inline-block rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-800">Learn more</a>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel with only arrows */}
        <div className="relative">
          <div className="rounded-xl overflow-hidden ring-1 ring-slate-200 shadow-sm">
            <img src={img} alt="Featured" className="w-full h-56 md:h-64 object-cover" />
          </div>
          <button
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow p-2"
            onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow p-2"
            onClick={() => setIdx((i) => (i + 1) % slides.length)}
          >
            ›
          </button>
        </div>
      </section>

      {/* Quick links -> 3 cards with grouped items */}
      <section className="py-10 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-2xl font-bold text-center text-slate-900">{t("home.quickLinks")}</h2>
        <div className="mx-auto mt-6 max-w-6xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
            <h3 className="font-semibold mb-3">Aid Programs</h3>
            <div className="space-y-2">
              <QuickLink href="#">Apply for State Aid</QuickLink>
              <QuickLink href="#">Grants & Scholarships</QuickLink>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
            <h3 className="font-semibold mb-3">Loans</h3>
            <div className="space-y-2">
              <QuickLink href="#">NJCLASS Family Loans</QuickLink>
              <QuickLink href="#">NJBEST</QuickLink>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-5">
            <h3 className="font-semibold mb-3">Resources</h3>
            <div className="space-y-2">
              <QuickLink href="#">Loan Redemption Programs</QuickLink>
              <QuickLink href="#">Employer Resources</QuickLink>
            </div>
          </div>
        </div>
      </section>

      {/* News + Events */}
      <section className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <i className="fa-solid fa-newspaper text-blue-600 text-xl" aria-hidden></i>
            <h2 className="text-xl font-bold">{t("home.news")}</h2>
          </div>
          <ul className="divide-y divide-slate-200 bg-white rounded-xl ring-1 ring-slate-200 shadow-sm">
            {[
              { title: "RFP Financial Advisor", date: "28 Aug 2025" },
              { title: "Depository Banking Services", date: "18 Aug 2025" },
              { title: "HESAA Board Meeting Notice", date: "18 Jul 2025" },
              { title: "WTC Scholarship Fund Board Meeting", date: "16 Jul 2025" },
              { title: "NJBEST 529 & Financial Aid in NJ", date: "14 Jun 2025" },
            ].map((n) => (
              <li key={n.title} className="flex items-center gap-3 px-4 py-3">
                <i className="fa-regular fa-circle-dot text-slate-400" aria-hidden></i>
                <a href="#" className="font-medium text-blue-700 hover:underline">{n.title}</a>
                <span className="ml-auto text-sm text-slate-500">{n.date}</span>
              </li>
            ))}
          </ul>
          <a href="#" className="mt-3 inline-block text-blue-700 hover:underline">more news…</a>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <i className="fa-solid fa-calendar-days text-rose-600 text-xl" aria-hidden></i>
            <h2 className="text-xl font-bold">{t("home.events")}</h2>
          </div>
          <ul className="divide-y divide-slate-200 bg-white rounded-xl ring-1 ring-slate-200 shadow-sm">
            {[
              { title: "Workshop: Financial Aid 101", date: "Oct 12" },
              { title: "Virtual: NJCLASS Q&A", date: "Oct 19" },
              { title: "In-person: College Planning Night", date: "Nov 4" },
            ].map((e) => (
              <li key={e.title} className="flex items-center gap-3 px-4 py-3">
                <i className="fa-solid fa-bell text-rose-400" aria-hidden></i>
                <div className="font-medium">{e.title}</div>
                <span className="ml-auto text-sm text-slate-500">{e.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
