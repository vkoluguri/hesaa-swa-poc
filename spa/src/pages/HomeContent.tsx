import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Newspaper, Calendar } from "lucide-react";

// palette for sections (consistent across cards)
const tone = {
  sectionBg: "bg-slate-50",
  card: "bg-white shadow-md hover:shadow-lg transition-shadow",
  badge: "bg-blue-900 text-white",
  link: "text-blue-700 hover:text-blue-900 hover:underline",
};

// simple breadcrumb (visible to screen readers & sighted users)
function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="w-full border-b border-slate-200">
      <ol className="max-w-[120rem] mx-auto px-4 flex items-center gap-2 py-2 text-sm">
        <li>
          <a href="/" className="text-blue-700 hover:underline">
            Home
          </a>
        </li>
        <li aria-hidden="true" className="text-slate-400">
          /
        </li>
        <li className="text-slate-500">Welcome</li>
      </ol>
    </nav>
  );
}

/* ---------- Carousel ---------- */
const slides = [
  { src: "/assets/BackToSchool_NJBEST.jpg", alt: "Back to school NJBEST banner", href: "/pages/NJBESTHome.aspx" },
  { src: "/assets/Grants-Scholarships-Banner2.jpg", alt: "Grants and scholarships banner", href: "/Pages/NJGrantsHome.aspx" },
  { src: "/assets/NJCLASSRatesBanner.jpg", alt: "NJCLASS rates banner", href: "/Pages/NJCLASSHome.aspx" },
  { src: "/assets/call_center_banner.jpg", alt: "Customer care contact banner", href: "/Pages/PublicInformation.aspx" },
  { src: "/assets/emailAlert_webBanner.jpg", alt: "Email alert web banner", href: "/Pages/PublicInformation.aspx" },
];

function Carousel() {
  const [idx, setIdx] = useState(0);
  const total = slides.length;
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [total]);

  const go = (n: number) => setIdx((i) => (i + n + total) % total);

  return (
    <section aria-label="Featured" className="relative w-full">
      <div className="relative max-w-[120rem] mx-auto px-4">
        <a
          className="block rounded-xl overflow-hidden border border-slate-200"
          href={slides[idx].href}
        >
          <img
            src={slides[idx].src}
            alt={slides[idx].alt}
            className="w-full h-auto object-cover"
          />
        </a>

        {/* arrows */}
        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border bg-white/90 shadow p-2 hover:bg-white"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border bg-white/90 shadow p-2 hover:bg-white"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* dots */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${
                i === idx ? "bg-blue-700" : "bg-white border border-slate-300"
              }`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Spotlight & Quick Links ---------- */
const spotlight = [
  {
    img: "/assets/NJCLASSSpotlight.jpg",
    alt: "NJCLASS spotlight",
    href: "/Pages/NJCLASSHome.aspx",
    cta: "Learn more",
  },
  {
    img: "/assets/SPOTLIGHTTall-Fill-It-Out.jpg", // correct name
    alt: "Complete your 2025-2026 financial aid application",
    href: "/Pages/financialaidhub.aspx",
    cta: "Learn more",
  },
];

const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
  { label: "NJ Grants and Scholarships", href: "/Pages/NJGrantsHome.aspx" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx" },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx" },
];

function SpotlightAndQuick() {
  return (
    <section aria-labelledby="spotlight-heading" className="py-10">
      <div className="max-w-[120rem] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* left: 2 spotlight cards (span 3 cols on lg) */}
          <div className="lg:col-span-3">
            <h2
              id="spotlight-heading"
              className="text-center text-3xl font-semibold tracking-tight text-slate-900 mb-6"
            >
              HESAA Spotlight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spotlight.map((s) => (
                <article key={s.img} className={`rounded-xl ${tone.card}`}>
                  <img
                    src={s.img}
                    alt={s.alt}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-4">
                    {/* you asked: remove extra description; keep button only */}
                    <a
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      href={s.href}
                    >
                      {s.cta}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* right: quick links tiles (span 2 cols on lg) */}
          <div className="lg:col-span-2">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900 mb-6">
              Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((q) => (
                <a
                  key={q.label}
                  href={q.href}
                  className="group rounded-xl px-4 py-3 bg-white shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 inline-flex items-center justify-between text-[1.05rem] font-medium"
                >
                  <span className="group-hover:text-blue-800">{q.label}</span>
                  <ExternalLink
                    className="size-4 text-slate-400 group-hover:text-blue-700"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- News & Events ---------- */
type NewsItem = { title: string; date: string; href: string };
type EventItem = { title: string; date: string; href: string };

const news: NewsItem[] = [
  {
    title: "RFP Depository Banking Services",
    date: "Aug 14, 2025",
    href: "#",
  },
  {
    title: "HESAA Board Meeting Notice",
    date: "Jul 18, 2025",
    href: "#",
  },
  {
    title: "WTC Scholarship Fund Board Meeting",
    date: "Jul 16, 2025",
    href: "#",
  },
  {
    title: "NJBEST 529 & Financial Aid in NJ",
    date: "Jun 14, 2025",
    href: "#",
  },
];

const events: EventItem[] = [
  { title: "FA Application Deadline for Renewal Students", date: "Sep 15", href: "#" },
  { title: "School Counselor Workshop", date: "Oct 02", href: "#" },
  { title: "Financial Aid Session — Newark", date: "Oct 20", href: "#" },
];

function DateBadge({ date }: { date: string }) {
  // Expect "Sep 15" or "Aug 14, 2025" formats; render month small, day large
  const [month, day] = useMemo(() => {
    // try to parse gently
    const p = date.replace(",", "").split(" ");
    if (p.length >= 2) return [p[0].slice(0, 3), p[1]];
    return ["", date];
  }, [date]);

  return (
    <div className={`rounded-md px-3 py-2 text-center ${tone.badge}`}>
      <div className="text-2xl font-extrabold leading-none">{day}</div>
      <div className="text-[10px] tracking-wide uppercase opacity-90">{month}</div>
    </div>
  );
}

function NewsEvents() {
  return (
    <section className={`${tone.sectionBg} py-12`} aria-label="News and events">
      <div className="max-w-[120rem] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* News */}
        <div>
          <h2 className="mb-6 flex items-center gap-2 justify-center text-3xl font-semibold text-slate-900">
            <Newspaper className="size-6" aria-hidden="true" />
            Recent News
          </h2>
          <ul className="space-y-4">
            {news.map((n) => (
              <li key={n.title} className={`rounded-xl ${tone.card} p-3`}>
                <div className="flex items-center gap-3">
                  <DateBadge date={n.date} />
                  <a className={`text-lg font-medium ${tone.link}`} href={n.href}>
                    {n.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Events */}
        <div>
          <h2 className="mb-6 flex items-center gap-2 justify-center text-3xl font-semibold text-slate-900">
            <Calendar className="size-6" aria-hidden="true" />
            Events
          </h2>
          <ul className="space-y-4">
            {events.map((e) => (
              <li key={e.title} className={`rounded-xl ${tone.card} p-3`}>
                <div className="flex items-center gap-3">
                  <DateBadge date={e.date} />
                  <a className={`text-lg font-medium ${tone.link}`} href={e.href}>
                    {e.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function HomeContent() {
  return (
    <>
      <Breadcrumb />
      <Carousel />
      <SpotlightAndQuick />
      <NewsEvents />
    </>
  );
}
