import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink, CalendarDays, Newspaper } from "lucide-react";

/* ===================== Carousel ===================== */

type Slide = { src: string; alt: string; href?: string };
const SLIDES: Slide[] = [
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants & Scholarships" },
  { src: "/assets/call_center_banner.jpg", alt: "Call Center" },
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "NJBEST" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Email Alerts" },
];

/** stable interval hook */
function useInterval(cb: () => void, delay: number | null) {
  const saved = useRef(cb);
  useEffect(() => void (saved.current = cb), [cb]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Infinite carousel via head/tail clones:
 * [CLONE(last), ...slides, CLONE(first)]
 * index starts at 1; on transition end we snap without transition when we hit a clone.
 */
function Carousel() {
  const clones = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
  const [i, setI] = useState(1); // visible index in clones
  const [anim, setAnim] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = (delta: number) => {
    setI((p) => p + delta);
    setAnim(true);
  };

  // auto every 7s
  useInterval(() => go(1), 7000);

  // snap on transition end
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onEnd = () => {
      if (i === 0) {
        setAnim(false);
        setI(SLIDES.length);
      } else if (i === SLIDES.length + 1) {
        setAnim(false);
        setI(1);
      }
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [i]);

  useEffect(() => {
    if (!anim) {
      // re-enable transition on the next frame
      const id = requestAnimationFrame(() => setAnim(true));
      return () => cancelAnimationFrame(id);
    }
  }, [anim]);

  // width percentage based on clones array
  const pct = (100 * i).toFixed(3);

  return (
    <section aria-label="Promotions" className="w-full">
      <div className="relative w-full overflow-hidden">
        <div
          ref={containerRef}
          className={`flex ${anim ? "transition-transform duration-700" : ""}`}
          style={{ transform: `translateX(-${pct}%)` }}
        >
          {clones.map((s, idx) => (
            <div key={`${s.src}-${idx}`} className="w-full shrink-0">
              {s.href ? (
                <a href={s.href} className="block">
                  <img
                    src={s.src}
                    alt={s.alt}
                    /* Keep aspect, no crop */
                    className="w-full h-[50vw] max-h-[560px] md:h-[28rem] object-contain bg-white"
                  />
                </a>
              ) : (
                <img
                  src={s.src}
                  alt={s.alt}
                  className="w-full h-[50vw] max-h-[560px] md:h-[28rem] object-contain bg-white"
                />
              )}
            </div>
          ))}
        </div>

        {/* desktop arrows only; large, no circle/padding background */}
<button
  aria-label="Previous slide"
  onClick={() => go(-1)}
  className="hidden sm:flex items-center justify-center
             absolute left-6 top-1/2 -translate-y-1/2 z-10
             text-white/90 hover:text-white
             text-[44px] md:text-[56px] leading-none"
>
  ‹
</button>

<button
  aria-label="Next slide"
  onClick={() => go(1)}
  className="hidden sm:flex items-center justify-center
             absolute right-6 top-1/2 -translate-y-1/2 z-10
             text-white/90 hover:text-white
             text-[44px] md:text-[56px] leading-none"
>
  ›
</button>

        {/* dots */}
<div className="absolute left-1/2 -translate-x-1/2 bottom-5 md:bottom-6 flex gap-2">
  {SLIDES.map((_, idx) => (
    <button
      key={idx}
      aria-label={`Go to slide ${idx + 1}`}
      onClick={() => setI(idx)}
      className={`h-2.5 w-2.5 rounded-full ${
        i === idx ? "bg-white shadow ring-1 ring-black/10" : "bg-white/70 hover:bg-white"
      }`}
    />
  ))}
</div>
      </div>
    </section>
  );
}

/* ===================== Quick Links ===================== */

const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-600" },
  { label: "NJ Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-700" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-800" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-700" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-700" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-800" },
];

const warmHeading = "text-[#b35c00]"; // warm orange-brown

export default function HomeContent({ showBreadcrumb = false }: { showBreadcrumb?: boolean }) {
  return (
    <main className="w-full">
      {showBreadcrumb ? (
        <div className="max-w-[120rem] mx-auto px-4 text-sm text-slate-500 mt-2">Home</div>
      ) : null}

      {/* HERO */}
      <Carousel />

      <div className="h-6" />

      {/* Spotlight + Quick Links */}
      <section aria-labelledby="spotlight-title" className="max-w-[120rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 id="spotlight-title" className={`text-2xl md:text-3xl font-semibold ${warmHeading} text-center mb-4`}>
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
            <h2 className={`text-2xl md:text-3xl font-semibold ${warmHeading} text-center mb-4`}>Quick Links</h2>
            <ul className="grid sm:grid-cols-1 gap-3">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href={q.href}
                    className={`group ${q.color} text-white w-full inline-flex items-center justify-between rounded-lg px-5 py-3 md:py-4 shadow hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`}
                  >
                    {/* normal on mobile, ~22px on desktop */}
                    <span className="font-semibold text-[16px] md:text-[22px] leading-tight">{q.label}</span>
                    <ExternalLink className="size-4 md:size-5 opacity-90 group-hover:translate-x-0.5 transition-transform" />
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
            <h3 className={`flex items-center gap-2 text-2xl md:text-3xl font-semibold ${warmHeading} mb-4`}>
              <Newspaper className="size-6" /> Recent News
            </h3>
            <ul className="space-y-3">
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
                      className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition"
                    >
<div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
  <div className="text-[18px] font-bold">{mon}</div>   {/* was text-base */}
  <div className="text-[18px] opacity-90">{day}</div> {/* was text-xs */}
</div>

                      <div className="font-medium text-[16px] md:text-[18px] text-slate-900">{n.title}</div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className={`flex items-center gap-2 text-2xl md:text-3xl font-semibold ${warmHeading} mb-4`}>
              <CalendarDays className="size-6" /> Events
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
  <div className="text-[18px] font-bold">{e.m}</div>
  <div className="text-[18px] opacity-90">{e.d}</div>
</div>

                    <div className="font-medium text-[16px] md:text-[18px] text-slate-900">{e.title}</div>
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

/* -------- Spotlight Card -------- */
function SpotlightCard({ img, alt, href }: { img: string; alt: string; href: string }) {
  return (
    <article className="rounded-xl bg-white shadow hover:shadow-md transition">
      {/* fixed aspect; use object-contain for clean, non-zoomed render */}
      <div className="w-full aspect-[16/9] overflow-hidden bg-white">
        <img src={img} alt={alt} className="w-full h-full object-contain" />
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
