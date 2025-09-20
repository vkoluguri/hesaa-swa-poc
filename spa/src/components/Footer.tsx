import React from "react";

const year = new Date().getFullYear();

// Match site rail (footer typically slightly narrower for comfort)
const CONTAINER = "max-w-[85rem] mx-auto px-4";

// ---- Solid, accessible social icons (currentColor) ----
function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M22 12.06C22 6.49 17.52 2 11.94 2 6.37 2 2 6.49 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.02H7.9v-2.92h2.54V9.43c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.22.2 2.22.2v2.44h-1.25c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.92h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"
      />
    </svg>
  );
}
function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M23.5 7.1a4 4 0 0 0-2.8-2.8C18.9 3.6 12 3.6 12 3.6s-6.9 0-8.7.7A4 4 0 0 0 .5 7.1C0 8.9 0 12 0 12s0 3.1.5 4.9a4 4 0 0 0 2.8 2.8c1.8.7 8.7.7 8.7.7s6.9 0 8.7-.7a4 4 0 0 0 2.8-2.8c.5-1.8.5-4.9.5-4.9s0-3.1-.5-4.9ZM9.6 15.6V8.4L15.9 12l-6.3 3.6Z"
      />
    </svg>
  );
}
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M18.3 2H21l-6.3 7.2L22 22h-6.8l-5.3-7-6 7H2.2l6.8-7.9L2 2h6.9l4.8 6.4L18.3 2Zm-2 18h2.1L7.8 4H5.6L16.3 20Z"
      />
    </svg>
  );
}
function IconLinkedIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55V14.8c0-1.34-.02-3.06-1.86-3.06-1.86 0-2.15 1.45-2.15 2.95v5.76H9.34V9h3.41v1.56h.05c.47-.9 1.62-1.86 3.33-1.86 3.56 0 4.22 2.34 4.22 5.39v6.36ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm-1.78 13.02h3.56V9H3.56v11.45Z"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#dbe5f9]" role="contentinfo">
      {/* Top: four columns */}
      <div className={`${CONTAINER} py-10`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-start">
          {/* Column 1 */}
          <nav aria-labelledby="ft-hesaa">
            <h2 id="ft-hesaa" className="text-[16px] font-semibold text-slate-900 mb-3">
              HESAA
            </h2>
            <ul className="space-y-1 text-[14px] leading-6 text-slate-800">
              <li>
                <a
                  href="/Pages/Careers.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/Pages/PrivacyPolicy.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/Pages/WebsiteTerms.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Website T&nbsp;&amp;&nbsp;C
                </a>
              </li>
              <li>
                <a
                  href="/Pages/SiteMap.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 2 */}
          <nav aria-labelledby="ft-grants">
            <h2 id="ft-grants" className="text-[16px] font-semibold text-slate-900 mb-3">
              Grants &amp; Scholarships
            </h2>
            <ul className="space-y-1 text-[14px] leading-6 text-slate-800">
              <li>
                <a
                  href="https://njfams.hesaa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                  aria-label="NJFAMS Account (opens in a new tab)"
                >
                  NJFAMS Account
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="/Pages/StateApplicationDeadlines.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Application Deadlines
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 3 */}
          <nav aria-labelledby="ft-njclass">
            <h2 id="ft-njclass" className="text-[16px] font-semibold text-slate-900 mb-3">
              NJCLASS
            </h2>
            <ul className="space-y-1 text-[14px] leading-6 text-slate-800">
              <li>
                <a
                  href="/Pages/NJCLASSHome.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Apply Now
                </a>
              </li>
              <li>
                <a
                  href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                  aria-label="NJCLASS Login (opens in a new tab)"
                >
                  Login
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="/Pages/NJCLASSMakePayment.aspx"
                  className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60 hover:underline"
                >
                  Make a Payment
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 4: Contact / Social */}
          <section aria-labelledby="ft-contact">
            <h2 id="ft-contact" className="text-[16px] font-semibold text-slate-900 mb-3">
              Contact Us
            </h2>
            <ul className="flex items-center gap-5">
              <li>
                <a
                  href="#"
                  aria-label="HESAA on Facebook"
                  className="text-slate-900 hover:text-blue-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60"
                >
                  <IconFacebook className="h-7 w-7" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="HESAA on YouTube"
                  className="text-slate-900 hover:text-blue-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60"
                >
                  <IconYouTube className="h-7 w-7" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="HESAA on X"
                  className="text-slate-900 hover:text-blue-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60"
                >
                  <IconX className="h-7 w-7" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="HESAA on LinkedIn"
                  className="text-slate-900 hover:text-blue-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60"
                >
                  <IconLinkedIn className="h-7 w-7" />
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Divider */}
      <div className={`${CONTAINER}`}>
        <hr className="border-slate-300" aria-hidden="true" />
      </div>

      {/* Bottom row (no overflow on small screens) */}
      <div className={`${CONTAINER} py-6`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-4">
          {/* OPRA badge (left) */}
          <a
            href="/Pages/OpenPublicRecordsAct.aspx"
            className="block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700/60"
          >
            <img
              src="/assets/OPRA.jpg"
              width={120}
              height={32}
              alt="OPRA — Open Public Records Act"
              className="h-8 w-auto"
            />
          </a>

          {/* Copyright (wraps gracefully) */}
          <p className="text-slate-800 text-[14px] sm:text-[15px] leading-snug sm:leading-6 break-words whitespace-normal max-w-full">
            © {year} Higher Education Student Assistance Authority
          </p>
        </div>
      </div>
    </footer>
  );
}
