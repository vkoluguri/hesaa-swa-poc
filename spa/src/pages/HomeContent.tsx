import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, CalendarDays, Newspaper } from "lucide-react";

/* =========================
   Hero carousel (native image height, responsive)
   ========================= */

type Slide = { src: string; alt: string; href?: string };
const SLIDES: Slide[] = [
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants & Scholarships" },
  { src: "/assets/call_center_banner.jpg", alt: "Customer Care phone number" },
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "NJBEST back-to-school" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Email alerts" },
];

function usePreloaded(srcs: string[]) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all(
      srcs.map(
        (s) =>
          new Promise<void>((res) => {
            const im = new Image();
            im.onload = () => res();
            im.onerror = () => res();
            im.src = s;
          })
      )
    ).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [srcs]);
  return ready;
}

function useAccurateTimer(run: boolean, stepMs: number, onTick: () => void) {
  const nextAt = useRef<number | null>(null);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const loop = (t: number) => {
      if (nextAt.current == null) nextAt.current = t + stepMs;
      if (t >= nextAt.current) {
        onTick();
        nextAt.current = t + stepMs;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onVis = () => (nextAt.current = null);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      nextAt.current = null;
    };
  }, [run, stepMs, onTick]);
}

function Carousel() {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const ready = usePreloaded(useMemo(() => SLIDES.map((s) => s.src), []));
  const advance = () => setIdx((p) => (p + 1) % SLIDES.length);

  useAccurateTimer(ready && !hover, 7000, advance);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setIdx((p) => (p + 1) % SLIDES.length);
    if (e.key === "ArrowLeft") setIdx((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      className="w-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={onKey}
    >
      {/* Container has NO forced height. Track determines height via natural image size. */}
      <div className="relative w-full overflow-hidden bg-slate-100">
        {/* Track: flex row we translate; each slide is width:100% */}
        <div
          className="flex transition-transform duration-700 will-change-transform"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {SLIDES.map((s) => {
            const Img = (
              <img
                src={s.src}
                alt={s.alt}
                className="block w-full h-auto select-none"
                draggable={false}
              />
            );
            return (
              <div key={s.src} className="w-full shrink-0" role="group" aria-roledescription="slide">
                {s.href ? (
                  <a
                    href={s.href}
                    className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40"
                  >
                    {Img}
                  </a>
                ) : (
                  Img
                )}
              </div>
            );
          })}
        </div>

        {/* Plain arrows (no box/padding), bigger, nudged inward; hidden on mobile */}
        <button
          aria-label="Previous slide"
          onClick={() => setIdx((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
          className="hidden md:block absolute left-5 top-1/2 -translate-y-1/2 z-10 text-white text-6xl leading-none select-none"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}
        >
          &lt;
        </button>
        <button
          aria-label="Next slide"
          onClick={() => setIdx((p) => (p + 1) % SLIDES.length)}
          className="hidden md:block absolute right-5 top-1/2 -translate-y-1/2 z-10 text-white text-6xl leading-none select-none"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}
        >
          &gt;
        </button>

        {/* Dots slightly lifted from bottom */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2"
          role="tablist"
          aria-label="Slide navigation"
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Go to slide ${i + 1}`}
              tabIndex={i === idx ? 0 : -1}
              onClick={() => setIdx(i)}
              className={`h-3 w-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                i === idx ? "bg-white shadow ring-1 ring-black/20" : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   Spotlight (native proportions, no zoom)
   ========================= */
function SpotlightCard({ img, alt, href }: { img: string; alt: string; href: string }) {
  return (
    <article className="rounded-xl bg-white shadow hover:shadow-md transition">
      {/* Native height: no object-cover; just width:100% & height:auto */}
      <img src={img} alt={alt} className="block w-full h-auto" />
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

const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-600" },
  { label: "NJ Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-700" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-800" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-700" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-700" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-800" },
];

export default function HomeContent({ showBreadcrumb = false }: { showBreadcrumb?: boolean }) {
  return (
    <main className="w-full">
      {showBreadcrumb ? (
        <div className="max-w-[120rem] mx-auto px-4 text-sm text-slate-500 mt-2" aria-label="Breadcrumb">
          Home
        </div>
      ) : null}

      {/* Carousel (native image height) */}
      <Carousel />

      {/* Spotlight + Quick Links */}
      <section aria-labelledby="spotlight-title" className="max-w-[120rem] mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2
              id="spotlight-title"
              className="text-2xl md:text-3xl font-semibold text-amber-800 text-center mb-4"
            >
              HESAA Spotlight
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <SpotlightCard
                img="/assets/NJCLASSSpotlight.jpg"
                alt="NJCLASS spotlight"
                href="/Pages/NJCLASSHome.aspx"
              />
              <SpotlightCard
                img="/assets/SPOTLIGHTTall-Fill-It-Out.jpg"
                alt="Complete your financial aid application"
                href="/Pages/financialaidhub.aspx"
              />
            </div>
          </div>

          <aside className="lg:col-span-1" aria-labelledby="quick-links-title">
            <h2 id="quick-links-title" className="text-2xl md:text-3xl font-semibold text-amber-800 text-center mb-4">
              Quick Links
            </h2>
            <ul className="grid sm:grid-cols-1 gap-3" role="list">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href={q.href}
                    className={`group ${q.color} text-white w-full inline-flex items-center justify-between rounded-lg px-4 py-3 shadow hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`}
                  >
                    <span className="font-semibold text-base md:text-[22px] leading-tight">{q.label}</span>
                    <ExternalLink
                      className="size-4 opacity-90 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* News + Events */}
      <section className="mt-12 py-10 bg-slate-50/80" aria-labelledby="news-and-events">
        <h2 id="news-and-events" className="sr-only">
          News and Events
        </h2>
        <div className="max-w-[120rem] mx-auto px-4 grid lg:grid-cols-2 gap-8">
          <div aria-labelledby="recent-news-title">
            <h3
              id="recent-news-title"
              className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-semibold text-amber-800 mb-4"
            >
              <Newspaper className="size-7 md:size-8" aria-hidden="true" /> Recent News
            </h3>
            <ul className="space-y-3" role="list">
              {[
                { date: "Aug 14, 2025", title: "RFP Depository Banking Services", href: "#" },
                { date: "Jul 18, 2025", title: "HESAA Board Meeting Notice", href: "#" },
                { date: "Jul 16, 2025", title: "WTC Scholarship Fund Board Meeting", href: "#" },
                { date: "Jun 14, 2025", title: "NJBEST 529 & Financial Aid in NJ", href: "#" },
              ].map((n) => {
                const [mon, day] = n.date.replace(",", "").split(" ");
                return (
                  <li key={n.title}>
                    <a
                      href={n.href}
                      className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
                        <div className="text-[18px] font-bold">{mon}</div>
                        <div className="text-[18px] opacity-90">{day}</div>
                      </div>
                      <div className="font-medium text-slate-900 text-base md:text-[18px] leading-snug">
                        {n.title}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div aria-labelledby="events-title">
            <h3
              id="events-title"
              className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-semibold text-amber-800 mb-4"
            >
              <CalendarDays className="size-7 md:size-8" aria-hidden="true" /> Events
            </h3>
            <ul className="space-y-3" role="list">
              {[
                { m: "Sep", d: "15", title: "FA Application Deadline for Renewal Students", href: "#" },
                { m: "Oct", d: "02", title: "School Counselor Workshop", href: "#" },
                { m: "Oct", d: "20", title: "Financial Aid Session — Newark", href: "#" },
              ].map((e) => (
                <li key={e.title}>
                  <a
                    href={e.href}
                    className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
                      <div className="text-[18px] font-bold">{e.m}</div>
                      <div className="text-[18px] opacity-90">{e.d}</div>
                    </div>
                    <div className="font-medium text-slate-900 text-base md:text-[18px] leading-snug">
                      {e.title}
                    </div>
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
