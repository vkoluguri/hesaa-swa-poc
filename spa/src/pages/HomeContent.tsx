import React, { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, CalendarDays, Newspaper } from "lucide-react";

/* Simple full-width carousel with arrows + dots */
const slides = [
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants & Scholarships" },
  { src: "/assets/call_center_banner.jpg", alt: "Call Center" },
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "NJBEST" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Email Alerts" },
];

const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-600" },
  { label: "NJ Grants and Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-700" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-800" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-700" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-700" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-800" },
];

export default function HomeContent() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="w-full">
      {/* Carousel full width */}
      <section aria-label="Promotions" className="w-full">
        <div className="relative w-full">
          <img
            key={slides[idx].src}
            src={slides[idx].src}
            alt={slides[idx].alt}
            className="w-full h-[44vw] max-h-[520px] min-h-[220px] object-cover"
          />
          {/* Arrows */}
          <button
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-300 bg-white/90 p-2 shadow hover:bg-white"
            onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-300 bg-white/90 p-2 shadow hover:bg-white"
            onClick={() => setIdx((idx + 1) % slides.length)}
          >
            ›
          </button>
          {/* Dots */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === idx ? "bg-blue-600" : "bg-white/80 border border-slate-300"}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gap between menu/breadcrumb and content */}
      <div className="h-6" />

      {/* Spotlight + Quick Links (60/40) */}
      <section aria-labelledby="spotlight-title" className="max-w-[120rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 id="spotlight-title" className="text-3xl font-medium text-slate-900 text-center mb-4">
              HESAA Spotlight
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <SpotlightCard
                img="/assets/NJCLASSSpotlight.jpg"
                alt="NJCLASS Spotlight"
                href="/Pages/NJCLASSHome.aspx"
              />
              <SpotlightCard
                img="/assets/SPOTLIGHTTall-Fill-It-Out.jpg"
                alt="Complete your Financial Aid Application"
                href="/Pages/financialaidhub.aspx"
              />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <h2 className="text-3xl font-medium text-slate-900 text-center mb-4">Quick Links</h2>
            <ul className="grid sm:grid-cols-1 gap-3">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href={q.href}
                    className={`group ${q.color} text-white w-full inline-flex items-center justify-between rounded-lg px-4 py-3 shadow hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`}
                  >
                    <span className="font-semibold">{q.label}</span>
                    <ExternalLink className="size-4 opacity-90 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* News + Events */}
      <section className="mt-12 py-10 bg-slate-50/80">
        <div className="max-w-[120rem] mx-auto px-4 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-medium text-slate-900 mb-4">
              <Newspaper /> Recent News
            </h3>
            <ul className="space-y-3">
              {[
                { date: "Aug 14, 2025", title: "RFP Depository Banking Services", href: "#" },
                { date: "Jul 18, 2025", title: "HESAA Board Meeting Notice", href: "#" },
                { date: "Jul 16, 2025", title: "WTC Scholarship Fund Board Meeting", href: "#" },
                { date: "Jun 14, 2025", title: "NJBEST 529 & Financial Aid in NJ", href: "#" },
              ].map((n) => (
                <li key={n.title}>
                  <a
                    href={n.href}
                    className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
                      <div className="text-base font-bold">{n.date.split(" ")[1].replace(",", "")}</div>
                      <div className="text-xs opacity-90">{n.date.split(" ")[0]}</div>
                    </div>
                    <div className="font-medium text-slate-900">{n.title}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-2xl font-medium text-slate-900 mb-4">
              <CalendarDays /> Events
            </h3>
            <ul className="space-y-3">
              {[
                { m: "Sep", d: "15", title: "FA Application Deadline for Renewal Students", href: "#" },
                { m: "Oct", d: "02", title: "School Counselor Workshop", href: "#" },
                { m: "Oct", d: "20", title: "Financial Aid Session — Newark", href: "#" },
              ].map((e) => (
                <li key={e.title}>
                  <a
                    href={e.href}
                    className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
                      <div className="text-base font-bold">{e.m}</div>
                      <div className="text-xs opacity-90">{e.d}</div>
                    </div>
                    <div className="font-medium text-slate-900">{e.title}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function SpotlightCard({ img, alt, href }: { img: string; alt: string; href: string }) {
  return (
    <article className="rounded-xl bg-white shadow hover:shadow-md transition">
      <div className="w-full aspect-[16/9] overflow-hidden">
        <img src={img} alt={alt} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <a
          href={href}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Learn more <ArrowRight className="size-4" />
        </a>
      </div>
    </article>
  );
}
