import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Newspaper, ExternalLink } from "lucide-react";

function Carousel() {
  const slides = useMemo(
    () => [
      "/assets/BackToSchool_NJBEST.jpg",
      "/assets/Grants-Scholarships-Banner2.jpg",
      "/assets/NJCLASSRatesBanner.jpg",
      "/assets/call_center_banner.jpg",
      "/assets/emailAlert_webBanner.jpg",
    ],
    []
  );
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="relative w-full">
      <img src={slides[i]} alt="" className="w-full h-[280px] sm:h-[360px] object-cover" />
      {/* arrows */}
      <button
        aria-label="Prev"
        onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
      >
        <ArrowLeft />
      </button>
      <button
        aria-label="Next"
        onClick={() => setI((p) => (p + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
      >
        <ArrowRight />
      </button>
      {/* dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2">
        {slides.map((_, idx) => (
          <span key={idx} className={`h-2 w-2 rounded-full ${idx === i ? "bg-[var(--brand)]" : "bg-white/70"}`} />
        ))}
      </div>
    </div>
  );
}

function SpotlightCard(props: { img: string; title: string; href: string }) {
  return (
    <a href={props.href} className="block rounded-xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition">
      <img src={props.img} alt="" className="w-full aspect-[4/3] object-cover rounded-t-xl" />
      <div className="p-4">
        <div className="text-sm font-medium text-[var(--brand)]">Learn more</div>
        <div className="text-slate-600 text-sm">{props.title}</div>
      </div>
    </a>
  );
}

const QUICK_LINKS = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-600" },
  { label: "NJ Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-700" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-700" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-800" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-700" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-700" },
];

const NEWS = [
  { date: "Aug 14, 2025", title: "RFP Depository Banking Services", href: "#" },
  { date: "Jul 18, 2025", title: "HESAA Board Meeting Notice", href: "#" },
  { date: "Jul 16, 2025", title: "WTC Scholarship Fund Board Meeting", href: "#" },
  { date: "Jun 14, 2025", title: "NJBEST 529 & Financial Aid in NJ", href: "#" },
];

const EVENTS = [
  { date: "Sep 15", title: "FA Application Deadline for Renewal Students", href: "#" },
  { date: "Oct 02", title: "School Counselor Workshop", href: "#" },
  { date: "Oct 20", title: "Financial Aid Session — Newark", href: "#" },
];

export default function HomeContent() {
  return (
    <div className="w-full">
      {/* Carousel */}
      <Carousel />

      {/* Spotlight + Quick Links row (60/40 on xl) */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-8">
        <div className="grid gap-6 xl:grid-cols-5">
          {/* Left 60% = col-span-3 */}
          <div className="xl:col-span-3">
            <h2 className="font-display text-3xl text-[var(--brand)] mb-4 text-center xl:text-left">HESAA Spotlight</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <SpotlightCard
                img="/assets/NJCLASSSpotlight.jpg"
                title="Academic Year 2025–2026 Options Now Available."
                href="#"
              />
              <SpotlightCard
                img="/assets/SPOTLIGHTTall-Fill-It-Out.jpg"
                title="Complete your 2025–2026 Financial Aid application today."
                href="#"
              />
            </div>
          </div>

          {/* Right 40% Quick Links */}
          <div className="xl:col-span-2">
            <h2 className="font-display text-3xl text-[var(--brand)] mb-4 text-center xl:text-left">Quick Links</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-3">
              {QUICK_LINKS.map((q) => (
                <a
                  key={q.label}
                  href={q.href}
                  className={`rounded-lg px-4 py-3 text-white text-lg font-semibold shadow-sm hover:shadow ${q.color} hover:opacity-95 flex items-center justify-between`}
                >
                  <span>{q.label}</span>
                  <ExternalLink size={18} className="opacity-80" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News & Events with soft background */}
      <section className="w-full bg-[var(--soft)] py-10">
        <div className="mx-auto w-full max-w-[1400px] px-4 grid gap-8 lg:grid-cols-2">
          {/* News */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="text-[var(--brand)]" />
              <h3 className="font-display text-2xl">Recent News</h3>
            </div>

            <div className="space-y-3">
              {NEWS.map((n, idx) => (
                <a key={idx} href={n.href}
                   className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:shadow">
                  <div className="text-xs text-slate-500 mb-1">{n.date}</div>
                  <div className="font-medium text-[var(--ink)] hover:text-[var(--brand)]">{n.title}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Events */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="text-[var(--brand)]" />
              <h3 className="font-display text-2xl">Events</h3>
            </div>

            <div className="space-y-3">
              {EVENTS.map((e, idx) => (
                <a key={idx} href={e.href}
                   className="group grid grid-cols-[64px_1fr] gap-4 items-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:shadow">
                  <div className="rounded-md bg-[var(--brand)] text-white text-center py-2">
                    <div className="text-xl font-bold leading-5">{e.date.split(" ")[0]}</div>
                    <div className="text-[10px] uppercase tracking-wide">{e.date.split(" ")[1]}</div>
                  </div>
                  <div className="font-medium text-[var(--ink)] group-hover:text-[var(--brand)]">{e.title}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
