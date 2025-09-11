import React, { useEffect, useState } from "react";
import { Newspaper, Calendar } from "lucide-react";

const slides = [
  "/assets/BackToSchool_NJBEST.jpg",
  "/assets/call_center_banner.jpg",
  "/assets/emailAlert_webBanner.jpg",
  "/assets/Grants-Scholarships-Banner2.jpg",
];

export default function HomeContent() {
  const [current, setCurrent] = useState(0);

  // auto-rotate every 5s
  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full">
      {/* CAROUSEL - full width */}
      <section className="relative w-full h-72 sm:h-80 md:h-[380px] overflow-hidden">
        {slides.map((src, i) => (
          <img
            key={src}
            src={src}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            alt=""
          />
        ))}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Spotlight (2) + Quick Links (1) */}
      <section className="max-w-[1400px] mx-auto px-6 py-10 grid gap-6 md:grid-cols-3">
        {[
          { img: "/assets/NJCLASSSpotlight.jpg", alt: "NJCLASS Spotlight", href: "#" },
          { img: "/assets/SPOTLIGHTall-Fill-It-Out.jpg", alt: "Fill it out", href: "#" },
        ].map((c) => (
          <article
            key={c.alt}
            className="rounded-lg border bg-white shadow-sm overflow-hidden"
          >
            <img src={c.img} alt={c.alt} className="w-full h-52 object-cover" />
            <div className="p-4">
              <a
                href={c.href}
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Learn more
              </a>
            </div>
          </article>
        ))}

        <article className="rounded-lg border bg-white shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            {[
              ["Apply for State Aid", "#", "bg-slate-600"],
              ["NJ Grants & Scholarships", "#", "bg-red-700"],
              ["NJCLASS Family Loans", "#", "bg-cyan-700"],
              ["NJBEST", "#", "bg-cyan-800"],
              ["Loan Redemption Programs", "#", "bg-red-700"],
              ["Employer Resources", "#", "bg-teal-700"],
            ].map(([label, href, color]) => (
              <li key={label}>
                <a
                  href={href}
                  className={`block ${color} text-white rounded px-4 py-2 hover:brightness-110`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* News + Events */}
      <section className="max-w-[1400px] mx-auto px-6 pb-12 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold mb-3">
            <Newspaper /> Recent News
          </h3>
          <ul className="divide-y rounded border bg-white">
            {[
              ["RFP Depository Banking Services", "Aug 14, 2025"],
              ["HESAA Board Meeting Notice", "Jul 18, 2025"],
              ["WTC Scholarship Fund Board Meeting", "Jul 16, 2025"],
              ["NJBEST 529 & Financial Aid in NJ", "Jun 14, 2025"],
            ].map(([title, date]) => (
              <li key={title} className="p-4 hover:bg-gray-50">
                <a className="text-blue-700 hover:underline" href="#">
                  {title}
                </a>
                <div className="text-xs text-gray-500">{date}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold mb-3">
            <Calendar /> Events
          </h3>
          <ul className="divide-y rounded border bg-white">
            {[
              ["Financial Aid Webinar", "Sep 20, 2025"],
              ["College Planning Workshop", "Oct 5, 2025"],
              ["Scholarship Info Session", "Nov 12, 2025"],
            ].map(([title, date]) => (
              <li key={title} className="p-4">
                <div className="font-medium">{title}</div>
                <div className="text-xs text-gray-500">{date}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
