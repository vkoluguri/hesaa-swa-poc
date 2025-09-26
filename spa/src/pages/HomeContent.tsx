import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  CalendarDays,
  Newspaper,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================
   Shared container (80rem) to match Footer
   ========================= */
const CONTAINER = "max-w-[120rem] mx-auto px-4";
// Neutral beige card (AA friendly with slate/dark text)
const CARD_BG = "bg-[#f8f4ec]";            // ≈ Tailwind warm “paper”
const CARD_BORDER = "border border-[#e8dfcf]";

// Section backdrop for contrast (cool, subtle; AA with headings)
const SECTION_CONTRAST_BG = "bg-[#eff4ff]"; // soft blue-gray (~blue-50)

// Headings color that passes on both backgrounds
const HEAD_COLOR = "text-amber-800";       // already in use & AA on both
const BODY_TEXT = "text-slate-900";        // 7:1+ on CARD_BG and on SECTION_CONTRAST_BG
// put this near the top of the file (outside the component)
const MONTH_TO_NUM: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/* =========================
   Slides
   ========================= */
type Slide = { src: string; alt: string; href?: string };
const SLIDES: Slide[] = [
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Learn about New Jersey Grants and Scholarships" },
  { src: "/assets/call_center_banner.jpg", alt: "Call our Customer Care team for financial aid help" },
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "NJBEST 529, back to school savings" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Get email alerts from HESAA" },
];

/* =========================
   Helpers
   ========================= */
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

// keep timer cadence across tab visibility changes
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

/* =========================
   ADA-friendly Carousel
   ========================= */
function Carousel() {
  const base = SLIDES;
  const slides = useMemo(() => {
    if (base.length === 0) return [];
    return [base[base.length - 1], ...base, base[0]];
  }, [base]);

  const ready = usePreloaded(useMemo(() => base.map((s) => s.src), [base]));
  const [idx, setIdx] = useState(1);
  const [transitioning, setTransitioning] = useState(true);

  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false); // gate announcements

  const autoRun = ready && !userPaused && !hovering && !focusWithin;
  useAccurateTimer(autoRun, 7000, () => setIdx((p) => p + 1));

  const trackRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const onEnd = () => {
      if (idx === slides.length - 1) {
        setTransitioning(false);
        setIdx(1);
      }
      if (idx === 0) {
        setTransitioning(false);
        setIdx(slides.length - 2);
      }
    };
    t.addEventListener("transitionend", onEnd);
    return () => t.removeEventListener("transitionend", onEnd);
  }, [idx, slides.length]);

  useEffect(() => {
    if (!transitioning) {
      const id = requestAnimationFrame(() => setTransitioning(true));
      return () => cancelAnimationFrame(id);
    }
  }, [transitioning]);

  // Announce slide changes only while the carousel has focus inside it
  useEffect(() => {
    if (!liveRef.current || !focusWithin) return;
    const realCount = SLIDES.length;
    const realIndex = idx === 0 ? realCount : idx === slides.length - 1 ? 1 : idx;
    liveRef.current.textContent = `Slide ${realIndex} of ${realCount}`;
  }, [idx, slides.length, focusWithin]);

  const percent = idx * 100;

  const currentRealIndex =
    idx === 0 ? SLIDES.length - 1 : idx === slides.length - 1 ? 0 : idx - 1;

  return (
    <section
      /* Keep this simple: no roledescription, no key handlers at the section */
      aria-label="Promotional banners"
      className="w-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
      }}
    >
      <p id="carousel-instructions" className="sr-only">
        Carousel: use the previous and next buttons to navigate. Use the Play or Pause button to
        control auto-advance.
      </p>

      <div className="relative w-full overflow-hidden bg-slate-100" aria-describedby="carousel-instructions">
        {/* Track */}
        <div
          ref={trackRef}
          className={`flex will-change-transform ${transitioning ? "transition-transform duration-700" : ""}`}
          style={{ transform: `translateX(-${percent}%)` }}
        >
          {slides.map((s, i) => {
            let srIndex = i;
            if (i === 0) srIndex = SLIDES.length;
            else if (i === slides.length - 1) srIndex = 1;

            return (
              <div
                key={`${s.src}-${i}`}
                id={`carousel-slide-${srIndex}`}     // referenced by the dots’ aria-controls
                className="w-full shrink-0"
                /* Remove role/roledescription to avoid forcing focus mode */
                aria-label={`Slide ${srIndex} of ${SLIDES.length}`}
              >
                {s.href ? (
                  <a href={s.href} className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40">
                    <img src={s.src} alt={s.alt} className="block w-full h-auto select-none" draggable={false} />
                  </a>
                ) : (
                  <img src={s.src} alt={s.alt} className="block w-full h-auto select-none" draggable={false} />
                )}
              </div>
            );
          })}
        </div>

        {/* Live region (always polite; we only write to it while focusWithin=true) */}
        <div ref={liveRef} className="sr-only" aria-atomic="true" aria-live="polite" />

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-pressed={userPaused}
            className="flex items-center gap-2 rounded-full bg-black/55 text-white px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            <span>{userPaused ? "Play" : "Pause"}</span>
          </button>

          {/* Dots (tabs not needed; simple buttons are clearer for SRs) */}
          <div className="hidden md:flex gap-2" aria-label="Carousel slide navigation">
            {SLIDES.map((_, realI) => {
              const selected = realI === currentRealIndex;
              return (
                <button
                  key={realI}
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Go to slide ${realI + 1} of ${SLIDES.length}`}
                  onClick={() => setIdx(realI + 1)}
                  className={`h-3 w-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    selected ? "bg-white shadow ring-1 ring-black/20" : "bg-white/70 hover:bg-white"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Arrows: handle keys only on the buttons themselves (no global keydown) */}
        <button
          aria-label="Previous slide"
          onClick={() => setIdx((p) => p - 1)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); setIdx((p) => p - 1); }
            if (e.key === "ArrowRight") { e.preventDefault(); setIdx((p) => p + 1); }
          }}
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-full
                     h-10 w-10 lg:h-16 lg:w-16 bg-black/55 hover:bg-black/65 text-white backdrop-blur-[1px] shadow
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 lg:h-12 lg:w-12">
            <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <span className="sr-only">Previous</span>
        </button>

        <button
          aria-label="Next slide"
          onClick={() => setIdx((p) => p + 1)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); setIdx((p) => p + 1); }
            if (e.key === "ArrowLeft")  { e.preventDefault(); setIdx((p) => p - 1); }
          }}
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-full
                     h-10 w-10 lg:h-16 lg:w-16 bg-black/55 hover:bg-black/65 text-white backdrop-blur-[1px] shadow
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 lg:h-12 lg:w-12">
            <path fill="currentColor" d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
          <span className="sr-only">Next</span>
        </button>
      </div>
    </section>
  );
}



/* =========================
   Spotlight (equal height, no letterbox)
   ========================= */
function SpotlightCard({
  img,
  alt,
  href,
  idx,
}: {
  img: string;
  alt: string;
  href: string;
  idx: number;
}) {
  return (
    <article
      className="h-full rounded-xl bg-[#fdfaf5] border border-slate-200 shadow hover:shadow-md transition focus-within:shadow-md"
      aria-labelledby={`spot-${idx}-title`}
      role="region"                       // identifies card as a landmark region
    >
      {/* Image area */}
      <div
        className="
          w-full overflow-hidden bg-[#fdfaf5] 
          h-[180px] sm:h-[220px] md:h-[300px] lg:h-[340px]
          flex items-center justify-center
        "
      >
        <img
          src={img}
          alt={alt}                        // meaningful description for SR
          decoding="async"
          loading="lazy"
          className="block w-full h-full object-contain lg:object-cover select-none -mt-px sm:mt-0"
          draggable={false}
        />
      </div>

      <div className="p-4">
        {/* Hidden label ties image + button together */}
        <span id={`spot-${idx}-title`} className="sr-only">
          {alt}
        </span>

        <a
          href={href}
          aria-describedby={`spot-${idx}-title`}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3.5 py-2.5 
                     text-[16px] md:text-[17px] text-white 
                     hover:bg-blue-700 focus-visible:outline-none 
                     focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Learn more
          <ArrowRight className="size-5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}


/* =========================
   Quick links + News/Events
   ========================= */
const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-700" }, // slightly darker for contrast
  { label: "NJ Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-800" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-900" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-800" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-800" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-900" },
];

export default function HomeContent({ showBreadcrumb = false }: { showBreadcrumb?: boolean }) {
  return (
    <main className="w-full text-[17px] md:text-[18px] lg:text-[19px]">
      <h1 id="page-title" className="sr-only">
        Higher Education Student Assistance Authority — Official Website
      </h1>
      {showBreadcrumb ? (
        <div className={`${CONTAINER} text-sm text-slate-500 mt-2`} aria-label="Breadcrumb">
          Home
        </div>
      ) : null}

      {/* Carousel */}
      <Carousel />

      {/* Spotlight + Quick Links */}
      <section aria-labelledby="spotlight-title" className={`${CONTAINER} mt-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
<h2 id="spotlight-title" className="text-3xl md:text-4xl font-semibold text-amber-800 text-center mb-4">HESAA Spotlight</h2>

            <ul className="grid sm:grid-cols-2 gap-6 list-none p-0 m-0" role="list">
              {[
                {
                  img: "/assets/NJCLASSSpotlight.jpg",
                  alt: "NJCLASS program spotlight",
                  href: "/Pages/NJCLASSHome.aspx",
                },
                {
                  img: "/assets/SPOTLIGHTTall-Fill-It-Out.jpg",
                  alt: "Complete your financial aid application",
                  href: "/Pages/financialaidhub.aspx",
                },
              ].map((item, i) => (
                <li key={item.img} className="m-0">
                  <SpotlightCard img={item.img} alt={item.alt} href={item.href} idx={i} />
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-1" aria-labelledby="quick-links-title">
<h2 id="quick-links-title" className="text-3xl md:text-4xl font-semibold text-amber-800 text-center mb-4">Quick Links</h2>
            <ul className="grid sm:grid-cols-1 gap-3" role="list">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href={q.href}
                    className={`group ${q.color} text-white w-full inline-flex items-center justify-between rounded-lg px-4 py-4 shadow hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`}
                  >
<span
  role="heading"
  aria-level={3}
  className="font-semibold text-[18px] md:text-[22px] leading-tight"
>
  {q.label}
</span>


                    <ExternalLink className="size-4 opacity-90 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

{/* News + Events */}
<section className="mt-12 py-10" aria-labelledby="news-and-events">
  <h2 id="news-and-events" className="sr-only">News and Events</h2>

  <div className={`${CONTAINER} grid lg:grid-cols-2 gap-8`}>

    {/* Recent News (own region) */}
    <section aria-labelledby="recent-news-title">
      <h3
        id="recent-news-title"
        className={`flex items-center justify-center gap-2 text-3xl md:text-4xl font-semibold ${HEAD_COLOR} mb-4`}
      >
        <Newspaper className="size-7 md:size-8" aria-hidden="true" />
        Recent News
      </h3>

      <ul className="space-y-3">
        {[
          { date: "Aug 14, 2025", title: "RFP Depository Banking Services", href: "#" }, // placeholder
          { date: "Jul 18, 2025", title: "HESAA Board Meeting Notice", href: "/Pages/HESAABoardInfo.aspx" },
          { date: "Jul 16, 2025", title: "WTC Scholarship Fund Board Meeting", href: "/Pages/wtcboardmeetings.aspx" },
          { date: "Jun 14, 2025", title: "NJBEST 529 & Financial Aid in NJ", href: "/pages/NJBESTHome.aspx" },
        ].map((n) => {
          const [mon, dayComma, year] = n.date.split(" ");
          const day = dayComma.replace(",", "");
          const iso = `${year}-${MONTH_TO_NUM[mon]}-${day.padStart(2, "0")}`;
          const isLive = n.href && n.href !== "#";

          const CardInner = (
            <>
              <div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
                <div className="text-[20px] font-bold">{mon}</div>
                <time className="text-[20px] opacity-90 block" dateTime={iso}>
                  {day}
                </time>
              </div>

              <div className="flex items-center gap-2 font-medium text-slate-900 text-[17px] md:text-[19px] leading-snug">
                <span>{n.title}</span>
                {!isLive && (
                  <span className="ml-2 inline-flex rounded-full bg-slate-200 text-slate-700 text-xs px-2 py-0.5">
                    Coming soon
                  </span>
                )}
              </div>
            </>
          );

          return (
            <li key={n.title}>
              {isLive ? (
                <a
                  href={n.href}
                  className={`flex items-center gap-4 rounded-xl ${CARD_BG} ${CARD_BORDER}
                              px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600`}
                >
                  {CardInner}
                </a>
              ) : (
                // Non-interactive placeholder; announced via virtual cursor, skipped by Tab (intended)
                <div
                  className={`flex items-center gap-4 rounded-xl ${CARD_BG} ${CARD_BORDER}
                              px-5 py-4 opacity-90`}
                  aria-label={`${n.title} (coming soon)`}
                >
                  {CardInner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>

    {/* Events (own region) */}
    <section aria-labelledby="events-title">
      <h3
        id="events-title"
        className={`flex items-center justify-center gap-2 text-3xl md:text-4xl font-semibold ${HEAD_COLOR} mb-4`}
      >
        <CalendarDays className="size-7 md:size-8" aria-hidden="true" />
        Events
      </h3>

      <ul className="space-y-3">
        {[
          { m: "Sep", d: "15", y: "2025", title: "FA Application Deadline for Renewal Students", href: "#" },
          { m: "Oct", d: "02", y: "2025", title: "School Counselor Workshop", href: "#" },
          { m: "Oct", d: "20", y: "2025", title: "Financial Aid Session — Newark", href: "#" },
        ].map((e) => {
          const iso = `${e.y}-${MONTH_TO_NUM[e.m]}-${e.d}`;
          return (
            <li key={e.title}>
              <a
                href={e.href}
                className={`flex items-center gap-4 rounded-xl ${CARD_BG} ${CARD_BORDER}
                            px-5 py-4 shadow hover:shadow-md hover:-translate-y-0.5 transition
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600`}
              >
                <div className="shrink-0 rounded-md bg-blue-700 text-white px-3 py-2 text-center leading-none">
                  <div className="text-[18px] font-bold">{e.m}</div>
                  <time className="text-[18px] opacity-90 block" dateTime={iso}>
                    {e.d}
                  </time>
                </div>

                <div className="font-medium text-slate-900 text-[17px] md:text-[19px] leading-snug">
                  {e.title}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>

  </div>
</section>


    </main>
  );
}
