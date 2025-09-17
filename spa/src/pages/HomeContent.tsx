import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, CalendarDays, Newspaper, Pause, Play } from "lucide-react";

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

// high-precision timer that keeps cadence across tab visibility changes
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
   ADA-friendly seamless Carousel (one direction)
   ========================= */

function Carousel() {
  const base = SLIDES;
  const slides = useMemo(() => {
    if (base.length === 0) return [];
    return [base[base.length - 1], ...base, base[0]]; // [last, ...base, first]
  }, [base]);

  const ready = usePreloaded(useMemo(() => base.map((s) => s.src), [base]));
  const [idx, setIdx] = useState(1); // point at first real slide
  const [transitioning, setTransitioning] = useState(true);

  // motion controls
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const autoRun = ready && !userPaused && !hovering && !focusWithin;
  const step = () => setIdx((p) => p + 1);
  useAccurateTimer(autoRun, 7000, step);

  const trackRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // keep loop seamless
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

  // Announce slide changes succinctly for SR users
  useEffect(() => {
    if (!liveRef.current) return;
    const realCount = SLIDES.length;
    const realIndex = idx === 0 ? realCount : idx === slides.length - 1 ? 1 : idx; // 1..N index space
    const human = `${realIndex} of ${realCount}`;
    liveRef.current.textContent = `Slide ${human}`;
  }, [idx, slides.length]);

  const percent = idx * 100;

  const onKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        setIdx((p) => p + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        setIdx((p) => p - 1);
        break;
      case "Home":
        e.preventDefault();
        setIdx(1);
        break;
      case "End":
        e.preventDefault();
        setIdx(slides.length - 2);
        break;
    }
  };

  const onFocusCapture = (e: React.FocusEvent) => {
    if (carouselRef.current && carouselRef.current.contains(e.target as Node)) {
      setFocusWithin(true);
    }
  };
  const onBlurCapture = (e: React.FocusEvent) => {
    // when focus leaves carousel entirely
    if (carouselRef.current && !carouselRef.current.contains(e.relatedTarget as Node)) {
      setFocusWithin(false);
    }
  };

  const currentRealIndex =
    idx === 0 ? SLIDES.length - 1 : idx === slides.length - 1 ? 0 : idx - 1;

  return (
    <section
      ref={carouselRef}
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      className="w-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onKeyDown={onKey}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      {/* Instructions for screen readers */}
      <p id="carousel-instructions" className="sr-only">
        Carousel: use the previous and next buttons or Left and Right arrow keys to navigate.
        Use the Play or Pause button to control auto-advance. Press Home to go to the first slide and End for the last.
      </p>

      <div className="relative w-full overflow-hidden bg-slate-100" aria-describedby="carousel-instructions">
        {/* Track */}
        <div
          ref={trackRef}
          className={`flex will-change-transform ${transitioning ? "transition-transform duration-700" : ""}`}
          style={{ transform: `translateX(-${percent}%)` }}
        >
          {slides.map((s, i) => {
            // map to 1..N for SR label
            let srIndex = i;
            if (i === 0) srIndex = SLIDES.length; // cloned last
            else if (i === slides.length - 1) srIndex = 1; // cloned first
            else srIndex = i;

            return (
              <div
                key={`${s.src}-${i}`}
                className="w-full shrink-0"
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${srIndex} of ${SLIDES.length}`}
              >
                {s.href ? (
                  <a
                    href={s.href}
                    className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/40"
                  >
                    <img src={s.src} alt={s.alt} className="block w-full h-auto select-none" draggable={false} />
                  </a>
                ) : (
                  <img src={s.src} alt={s.alt} className="block w-full h-auto select-none" draggable={false} />
                )}
              </div>
            );
          })}
        </div>

        {/* Live region for concise updates */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />

        {/* Controls bar: Play/Pause + arrows + dots (dots hidden on mobile) */}
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-4">
          {/* Play/Pause button satisfies WCAG pause requirement */}
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-pressed={userPaused}
            className="flex items-center gap-2 rounded-full bg-black/55 text-white px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {userPaused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            <span>{userPaused ? "Play" : "Pause"}</span>
          </button>

          {/* Dots (desktop only) */}
          <div
            className="hidden md:flex gap-2"
            role="tablist"
            aria-label="Slide navigation"
          >
            {SLIDES.map((_, realI) => (
              <button
                key={realI}
                role="tab"
                aria-selected={realI === currentRealIndex}
                aria-label={`Go to slide ${realI + 1}`}
                tabIndex={realI === currentRealIndex ? 0 : -1}
                onClick={() => setIdx(realI + 1)}
                className={`h-3 w-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  realI === currentRealIndex ? "bg-white shadow ring-1 ring-black/20" : "bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Arrows: small on mobile, large on desktop; plain glyphs, no box */}
        <button
          aria-label="Previous slide"
          onClick={() => setIdx((p) => p - 1)}
          className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 text-white text-3xl md:text-6xl leading-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}
        >
          &lt;
        </button>
        <button
          aria-label="Next slide"
          onClick={() => setIdx((p) => p + 1)}
          className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 text-white text-3xl md:text-6xl leading-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,.6)" }}
        >
          &gt;
        </button>
      </div>
    </section>
  );
}

/* =========================
   Spotlight (equal height, no crop/zoom)
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
    <article className="h-full rounded-xl bg-white shadow hover:shadow-md transition focus-within:shadow-md" aria-labelledby={`spot-${idx}-title`}>
      {/* Fixed responsive media area for equal heights */}
      <div
        className="
          w-full overflow-hidden bg-white
          h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px]
          flex items-center justify-center
        "
      >
        <img
          src={img}
          alt={alt}
          decoding="async"
          loading="lazy"
          className="max-h-full w-auto h-auto object-contain"
        />
      </div>

      <div className="p-4">
        {/* Hidden label that names the card for AT */}
        <span id={`spot-${idx}-title`} className="sr-only">
          {alt}
        </span>

        <a
          href={href}
          aria-describedby={`spot-${idx}-title`}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Learn more <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

/* =========================
   Quick links + News/Events
   ========================= */

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

      {/* Carousel */}
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
                    <ExternalLink className="size-4 opacity-90 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
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
