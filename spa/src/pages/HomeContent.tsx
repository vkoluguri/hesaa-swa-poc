import React from "react";
import { ExternalLink, Newspaper, Calendar } from "lucide-react";

/** Make prop optional & default to true for non-home pages */
type HomeContentProps = {
  showBreadcrumb?: boolean;
};

const spotlightCards = [
  {
    img: "/assets/NJCLASSSpotlight.jpg",
    alt: "NJCLASS Academic Year 2025–2026 Options Now Available",
    href: "/Pages/NJCLASSHome.aspx",
  },
  {
    img: "/assets/SPOTLIGHTTall-Fill-It-Out.jpg",
    alt: "Complete your 2025–2026 Financial Aid Application today!",
    href: "/Pages/financialaidhub.aspx",
  },
];

const quickLinks = [
  { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
  { label: "NJ Grants and Scholarships", href: "/Pages/NJGrantsHome.aspx" },
  { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
  { label: "NJBEST", href: "/pages/NJBESTHome.aspx", target: "_blank" as const },
  { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
  { label: "Employer Resources", href: "/Pages/EmployerResources.aspx" },
];

const news = [
  { date: "Aug 14, 2025", title: "RFP Depository Banking Services", href: "#" },
  { date: "Jul 18, 2025", title: "HESAA Board Meeting Notice", href: "#" },
  { date: "Jul 16, 2025", title: "WTC Scholarship Fund Board Meeting", href: "#" },
  { date: "Jun 14, 2025", title: "NJBEST 529 & Financial Aid in NJ", href: "#" },
];

const events = [
  { month: "Sep", day: "15", title: "FA Application Deadline for Renewal Students", href: "#" },
  { month: "Oct", day: "02", title: "School Counselor Workshop", href: "#" },
  { month: "Oct", day: "20", title: "Financial Aid Session — Newark", href: "#" },
];

export default function HomeContent({ showBreadcrumb = true }: HomeContentProps) {
  return (
    <div className="w-full">
      {/* Breadcrumb (hidden on home when prop=false) */}
      {showBreadcrumb && (
        <nav aria-label="Breadcrumb" className="max-w-[120rem] mx-auto px-4 mb-4">
          <ol className="flex items-center gap-2 text-sm text-slate-600">
            <li><a className="hover:underline" href="/">Home</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-900 font-medium">Page</li>
          </ol>
        </nav>
      )}

      {/* Carousel (full-width edge-to-edge container) */}
      <section className="w-full">
        <div className="max-w-[120rem] mx-auto px-0 md:px-4">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow ring-1 ring-slate-200">
            {/* your existing carousel component/markup lives here;
                keeping placeholder to avoid changing behavior */}
            <img
              src="/assets/BackToSchool_NJBEST.jpg"
              alt="Carousel slide"
              className="block w-full h-[260px] md:h-[420px] object-cover"
            />
            {/* arrows & dots are already wired in your CSS/JS bundle */}
          </div>
        </div>
      </section>

      {/* Spacer between sections */}
      <div className="h-8 md:h-10" />

      {/* Spotlight + Quick Links (60/40 on lg+) */}
      <section className="max-w-[120rem] mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left (2) + Middle (1) = 3 of 5 (≈60%) */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl md:text-3xl font-serif text-slate-900 text-center mb-4">
              HESAA Spotlight
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {spotlightCards.map((c) => (
                <article
                  key={c.alt}
                  className="rounded-xl shadow-lg ring-1 ring-slate-200 bg-white overflow-hidden"
                >
                  <img
                    src={c.img}
                    alt={c.alt}
                    className="w-full aspect-[16/11] object-cover"
                  />
                  <div className="p-4">
                    <a
                      href={c.href}
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      Learn more <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Right column (≈40%): Quick Links */}
          <aside className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-serif text-slate-900 text-center mb-4">
              Quick Links
            </h2>

            <div className="grid sm:grid-cols-1 gap-3">
              {quickLinks.map((q) => (
                <a
                  key={q.label}
                  href={q.href}
                  target={q.target}
                  className="flex items-center justify-between rounded-xl bg-white ring-1 ring-slate-200 px-4 py-3 shadow hover:shadow-md transition-shadow"
                >
                  <span className="font-medium">{q.label}</span>
                  <ExternalLink className="size-4 text-slate-500" aria-hidden="true" />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-10 md:h-12" />

      {/* News + Events with soft background */}
      <section className="w-full bg-slate-50/70 py-10">
        <div className="max-w-[120rem] mx-auto px-4 grid lg:grid-cols-2 gap-8">
          {/* News */}
          <div>
            <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-serif text-slate-900 mb-4">
              <Newspaper className="size-6 md:size-7" aria-hidden="true" />
              Recent News
            </h2>
            <ul className="space-y-3">
              {news.map((n) => (
                <li key={n.title} className="rounded-xl bg-white ring-1 ring-slate-200 px-4 py-3 shadow">
                  <div className="text-xs text-slate-500 mb-1">{n.date}</div>
                  <a href={n.href} className="font-medium text-slate-900 hover:underline">
                    {n.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-serif text-slate-900 mb-4">
              <Calendar className="size-6 md:size-7" aria-hidden="true" />
              Events
            </h2>
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.title} className="rounded-xl bg-white ring-1 ring-slate-200 px-4 py-3 shadow flex items-center gap-4">
                  <div className="shrink-0 rounded-lg bg-blue-800 text-white w-14 text-center py-2 leading-tight">
                    <div className="text-base font-bold">{e.month}</div>
                    <div className="text-lg font-extrabold -mt-0.5">{e.day}</div>
                  </div>
                  <a href={e.href} className="font-medium text-slate-900 hover:underline">
                    {e.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
