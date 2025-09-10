import React, { useEffect, useId, useRef, useState } from "react";

/** Five carousel slides from /assets (you already placed them) */
const slides = [
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "Back to School - NJBEST" },
  { src: "/assets/call_center_banner.jpg",  alt: "Call Center information" },
  { src: "/assets/emailAlert_webBanner.jpg",alt: "Email alert banner" },
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants & Scholarships" },
  { src: "/assets/NJCLASSRatesBanner.jpg", alt: "NJCLASS Rates" }
];

function Carousel() {
  const [idx, setIdx] = useState(0);
  const labelId = useId();
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = `Slide ${idx + 1} of ${slides.length}`;
  }, [idx]);

  const go = (n: number) => setIdx(p => (p + n + slides.length) % slides.length);

  return (
    <section aria-labelledby={labelId} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <h2 id={labelId} className="sr-only">Featured announcements</h2>

      <div className="relative">
        <button
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md border border-gray-300 bg-white/90 px-2 py-1 text-gray-700 hover:bg-white"
        >
          ‹
        </button>

        <img src={slides[idx].src} alt={slides[idx].alt} className="block w-full" />

        <button
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-gray-300 bg-white/90 px-2 py-1 text-gray-700 hover:bg-white"
        >
          ›
        </button>
      </div>

      <div ref={liveRef} aria-live="polite" className="px-4 pb-3 pt-2 text-sm text-gray-600">
        Slide {idx + 1} of {slides.length}
      </div>
    </section>
  );
}

function Spotlight() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <img src="/assets/NJCLASSRatesBanner.jpg" alt="NJCLASS Academic Year 2025–2026 options" className="w-full" />
        <div className="p-4">
          <p className="mb-2 text-gray-700">Academic Year 2025–2026 options now available.</p>
          <a className="inline-block rounded-md bg-[#0e7236] px-4 py-2 font-semibold text-white hover:bg-[#0c5d2c]" href="/programs/njclass">Learn more</a>
        </div>
      </article>

      <article className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <img src="/assets/Grants-Scholarships-Banner2.jpg" alt="Complete your 2025–2026 financial aid application" className="w-full" />
        <div className="p-4">
          <p className="mb-2 text-gray-700">Complete your 2025–2026 financial aid application today.</p>
          <a className="inline-block rounded-md bg-[#0e7236] px-4 py-2 font-semibold text-white hover:bg-[#0c5d2c]" href="/apply">Learn more</a>
        </div>
      </article>
    </section>
  );
}

function QuickLinks() {
  const items = [
    { text: "Apply for State Aid", href: "/apply" },
    { text: "NJ Grants and Scholarships", href: "/grants" },
    { text: "NJCLASS Family Loans", href: "/programs/njclass" },
    { text: "NJBEST", href: "/njbest" },
    { text: "Loan Redemption Programs", href: "/programs/lrp" },
    { text: "Employer Resources", href: "/employers" }
  ];
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="px-4 pt-4 text-lg font-semibold">Quick Links</h2>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        {items.map(i => (
          <a key={i.text} href={i.href}
             className="rounded-md bg-[#0e7236] px-4 py-2 text-center font-semibold text-white hover:bg-[#0c5d2c]">
            {i.text}
          </a>
        ))}
      </div>
    </section>
  );
}

function News() {
  const news = [
    { t:'RFP Financial Advisor', d:'28 Aug 2025', h:'/news/financial-advisor' },
    { t:'RFP Depository Banking Services', d:'18 Aug 2025', h:'/news/depository-banking' },
    { t:'HESAA Board Meeting Notice', d:'18 Jul 2025', h:'/news/board-meeting' },
    { t:'WTC Scholarship Fund Board Meeting', d:'16 Jul 2025', h:'/news/wtc-board' },
    { t:'NJBEST 529 & Financial Aid in NJ', d:'14 Jun 2025', h:'/news/adubato' }
  ];
  return (
    <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="px-4 pt-4 text-lg font-semibold">Recent News</h2>
      <ul className="divide-y p-4">
        {news.map(n => (
          <li key={n.t} className="flex items-start justify-between py-2">
            <a className="font-medium hover:underline" href={n.h}>{n.t}</a>
            <span className="ml-4 shrink-0 text-sm text-gray-500">{n.d}</span>
          </li>
        ))}
      </ul>
      <div className="px-4 pb-4 text-right">
        <a className="text-sm text-[#0b5e87] hover:text-[#0a4e70]" href="/news">more news…</a>
      </div>
    </section>
  );
}

export default function HomeApp() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-6">
      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="mb-2 text-2xl font-bold">
            New Jersey financial aid, loans, and college planning — all in one place.
          </h1>
          <p className="mb-4 text-lg text-gray-700">
            Apply for state aid, explore scholarships, compare loan options, and register for workshops.
          </p>
          <div className="flex gap-3">
            <a className="rounded-md bg-[#0e7236] px-4 py-2 font-semibold text-white hover:bg-[#0c5d2c]" href="/apply">
              Apply for State Aid
            </a>
            <a className="rounded-md border border-[#0e7236] px-4 py-2 font-semibold text-[#0e7236] hover:bg-green-50" href="/programs/njclass">
              Explore NJCLASS
            </a>
          </div>
        </div>
        <div className="lg:col-span-2"><Carousel/></div>
      </section>

      {/* Spotlight + Quick Links + News */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <Spotlight/>
          <QuickLinks/>
        </div>
        <News/>
      </div>
    </div>
  );
}
