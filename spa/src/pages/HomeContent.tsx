import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink, CalendarDays, Newspaper } from "lucide-react";

/** ====== Carousel (full width, arrows + dots, responsive) ====== */
type Slide = { src: string; alt: string; href?: string };
const SLIDES: Slide[] = [
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants & Scholarships" },
  { src: "/assets/call_center_banner.jpg", alt: "Call Center" },
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "NJBEST" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Email Alerts" },
];

function useInterval(cb: () => void, delay: number | null) {
  const saved = useRef(cb);
  useEffect(() => void (saved.current = cb), [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function Carousel() {
  const [i, setI] = useState(0);
  const go = (n: number) => setI((p) => (p + n + SLIDES.length) % SLIDES.length);

  // 7s autoplay
  useInterval(() => go(1), 7000);

  return (
    <section aria-label="Promotions" className="w-full">
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {SLIDES.map((s) => (
            <div key={s.src} className="w-full shrink-0">
              <a href={s.href || "#"} className="block">
                {/* Aspect ratio ensures responsive, non-awkward crops:
                   mobile: 4/3, md: 16/9, lg+: 21/9 */}
                <div className="w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9]">
                  <img
                    src={s.src}
                    alt={s.alt}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* arrows — no padding around glyph, larger, closer to edges */}
        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 grid place-content-center w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow"
        >
          <span className="leading-none text-3xl select-none">‹</span>
        </button>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 grid place-content-center w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow"
        >
          <span className="leading-none text-3xl select-none">›</span>
        </button>

        {/* dots */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2.5 w-2.5 rounded-full ${
                i === idx ? "bg-white shadow ring-1 ring-black/10" : "bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** ====== Quick Links (keep your exact URLs, just styled) ====== */
const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx", color: "bg-slate-600" },
  { label: "NJ Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx", color: "bg-red-700" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx", color: "bg-cyan-800" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", color: "bg-cyan-700" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx", color: "bg-red-700" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx", color: "bg-emerald-800" },
];

// warm heading color to reuse
const warmHeading = "text-amber-700";

export default function HomeContent({ showBreadcrumb = false }: { showBreadcrumb?: boolean }) {
  return (
    <main className="w-full">
      {showBreadcrumb ? (
        <div className="max-w-[120rem] mx-auto px-4 text-sm text-slate-500 mt-2">Home</div>
      ) : null}

      {/* Full-width carousel */}
      <Carousel />

      <div className="h-6" />

      {/* Spotlight + Quick Links (2/3 + 1/3) */}
      <section aria-labelledby="spotlight-title" className="max-w-[120rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2
              id="spotlight-title"
              className={`text-3xl md:text-[2rem] font-semibold ${warmHeading} text-center mb-4`}
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
            <h2 className={`text-3xl md:text-[2rem] font-semibold ${warmHeading} text-center mb-4`}>
              Quick Links
            </h2>
            <ul className="grid sm:grid-cols-1 gap-3">
              {quickLinks.map((q) => (
                <li key={q.label}>
                  <a
                    href={q.href}
                    className={`group ${q.color} text-white w-full inline-flex items-center justify-between rounded-lg px-5 py-3.5 text-[16px] shadow hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600`}
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
            <h3 className={`flex items-center gap-2 text-3xl md:text-[2rem] font-semibold ${warmHeading} mb-4`}>
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
                        <div className="text-base font-bold">{mon}</div>
                        <div className="text-xs opacity-90">{day}</div>
                      </div>
                      <div className="font-medium text-slate-900 text-[16px]">{n.title}</div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className={`flex items-center gap-2 text-3xl md:text-[2rem] font-semibold ${warmHeading} mb-4`}>
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
                      <div className="text-base font-bold">{e.m}</div>
                      <div className="text-xs opacity-90">{e.d}</div>
                    </div>
                    <div className="font-medium text-slate-900 text-[16px]">{e.title}</div>
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
      {/* fixed aspect ratio to avoid “tall/awkward zoom” */}
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
