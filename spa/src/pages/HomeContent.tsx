import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, CalendarDays, Newspaper } from "lucide-react";

/* =========================================================
   SLIDES (use your own files/alt text; href is optional)
   ========================================================= */
type Slide = { src: string; alt: string; href?: string };
const SLIDES: Slide[] = [
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants & Scholarships" },
  { src: "/assets/call_center_banner.jpg", alt: "Call Center" },
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "NJBEST" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Email Alerts" },
];

/* =========================================================
   UTIL
   ========================================================= */
const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

/* =========================================================
   CAROUSEL (seamless loop, stable height, autoplay 7s, no tab pause)
   ========================================================= */
function Carousel() {
  // extended track so we can loop without jumping: [last, ...real, first]
  const extended = useMemo<Slide[]>(() => {
    if (!SLIDES.length) return [];
    return [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
  }, []);
  const n = SLIDES.length;

  const [idx, setIdx] = useState(1);       // current index in extended
  const [anim, setAnim] = useState(true);  // CSS transition on/off
  const tickRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // go helpers
  const go = (delta: number) => setIdx((p) => p + delta);
  const goToReal = (real0: number) => setIdx(real0 + 1);

  // autoplay every 7s — intentionally NO visibility pause (keeps moving when tab isn’t active)
  const clear = () => { if (tickRef.current) window.clearInterval(tickRef.current); tickRef.current = null; };
  const start = () => {
    clear();
    if (n > 1) tickRef.current = window.setInterval(() => go(1), 7000);
  };
  useEffect(() => { start(); return clear; }, [n]);

  // seamless wrap: when we hit clone, jump without animation
  const onTransitionEnd = () => {
    if (idx === 0) { setAnim(false); setIdx(n); }         // jumped left beyond first real
    else if (idx === n + 1) { setAnim(false); setIdx(1); } // jumped right beyond last real
  };
  useEffect(() => {
    if (!anim) {
      const id = window.setTimeout(() => setAnim(true), 20);
      return () => window.clearTimeout(id);
    }
  }, [anim]);

  // optional pause on hover (desktop)
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (hover) clear(); else start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover]);

  // stable height: aspect ratio ensures no “white flash”
  const aspect = "aspect-[16/9] md:aspect-[21/9]";

  return (
    <section
      aria-label="Promotions"
      className="w-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div ref={rootRef} className={cx("relative w-full overflow-hidden bg-black/5", aspect)}>
        {/* track */}
        <div
          className={cx("flex h-full w-full", anim && "transition-transform duration-700")}
          style={{ transform: `translateX(-${idx * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((s, k) => (
            <div key={`${s.src}-${k}`} className="w-full h-full shrink-0">
              {s.href ? (
                <a href={s.href} className="block w-full h-full">
                  <img loading="lazy" src={s.src} alt={s.alt} className="block w-full h-full object-cover" />
                </a>
              ) : (
                <img loading="lazy" src={s.src} alt={s.alt} className="block w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>

        {/* arrows (desktop only), larger and slightly inset */}
        {n > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="hidden md:flex items-center justify-center
                         absolute left-6 top-1/2 -translate-y-1/2 z-10
                         h-12 w-12 text-white/95 text-3xl leading-none
                         hover:text-white drop-shadow"
            >
              ‹
            </button>
            <button
              aria-label="Next slide"
              onClick={() => go(1)}
              className="hidden md:flex items-center justify-center
                         absolute right-6 top-1/2 -translate-y-1/2 z-10
                         h-12 w-12 text-white/95 text-3xl leading-none
                         hover:text-white drop-shadow"
            >
              ›
            </button>
          </>
        )}

        {/* dots (lifted from bottom) */}
        {n > 1 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex gap-2">
            {SLIDES.map((_, realIdx) => {
              const active =
                idx === realIdx + 1 ||
                (idx === 0 && realIdx === n - 1) ||
                (idx === n + 1 && realIdx === 0);
              return (
                <button
                  key={realIdx}
                  aria-label={`Go to slide ${realIdx + 1}`}
                  onClick={() => goToReal(realIdx)}
                  className={cx(
                    "h-3 w-3 rounded-full",
                    active ? "bg-white shadow ring-1 ring-black/10" : "bg-white/60 hover:bg-white"
                  )}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   SPOTLIGHT CARD (simple, responsive, no awkward zoom)
   ========================================================= */
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

/* =========================================================
   QUICK LINKS (bigger font on desktop only)
   ========================================================= */
const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-600" },
  { label: "NJ Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-700" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-800" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-700" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-700" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-800" },
];

/* =========================================================
   HOME CONTENT (export)
   ========================================================= */
export default function HomeContent({ showBreadcrumb = false }: { showBreadcrumb?: boolean }) {
  return (
    <main className="w-full">
      {showBreadcrumb ? (
        <div className="max-w-[120rem] mx-auto px-4 text-sm text-slate-500 mt-2">Home</div>
      ) : null}

      {/* full width carousel */}
      <Carousel />

      <div className="h-6" />

      {/* Spotlight + Quick Links */}
      <section aria-labelledby="spotlight-title" className="max-w-[120rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2
              id="spotlight-title"
              className="text-2xl md:text-3xl font-semibold text-[#7a4b00] text-center mb-4"
            >
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
            <h2 className="text-2xl md:text-3xl font-semibold text-[#7a4b00] text-center mb-4">Quick Links</h2>
            <ul className="grid sm:grid-cols-1 gap-3">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href={q.href}
                    className={cx(
                      "group", q.color,
                      "text-white w-full inline-flex items-center justify-between rounded-lg px-4 py-3 shadow hover:brightness-110",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600",
                      "text-[16px] md:text-[22px]" // bigger on desktop only
                    )}
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
            <h3 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold text-[#7a4b00] mb-4">
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
                        <div className="text-[18px] font-bold">{mon}</div>
                        <div className="text-[18px] opacity-90">{day}</div>
                      </div>
                      <div className="font-medium text-slate-900 text-[16px] md:text-[18px]">{n.title}</div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-2xl md:text-3xl font-semibold text-[#7a4b00] mb-4">
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
                    <div className="font-medium text-slate-900 text-[16px] md:text-[18px]">{e.title}</div>
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
