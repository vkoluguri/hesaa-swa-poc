import React from "react";

/**
 * Footer
 * - Centered, compact 4-column layout (like the header is centered within a full-width bar)
 * - Background matches the main menu bar color (#dbe5f9); change once here if your header color changes
 * - Solid SVG social icons (Facebook, YouTube, X, LinkedIn)
 * - Correct links per legacy footer
 * - ARIA/keyboard accessible
 */

const year = new Date().getFullYear();

const BG = "#dbe5f9"; // <- same color your main menu row uses

export default function Footer() {
  return (
    <footer
      className="w-full border-t"
      style={{ backgroundColor: BG, borderColor: "rgba(30,41,59,.1)" }}
      aria-labelledby="site-footer-heading"
    >
      {/* narrower, centered container to keep columns close like header */}
      <div className="mx-auto max-w-[80rem] px-4 py-10 md:py-12">
        <h2 id="site-footer-heading" className="sr-only">
          Site footer
        </h2>

        {/* 4 columns */}
        <nav
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          aria-label="Footer"
        >
          {/* HESAA */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">HESAA</h3>
            <ul className="space-y-2 text-slate-800">
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/Careers.aspx">Careers</a>
              </li>
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/PrivacyPolicy.aspx">Privacy Policy</a>
              </li>
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/TermsAndConditions.aspx">Website T &amp; C</a>
              </li>
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/SiteMap.aspx">Sitemap</a>
              </li>
            </ul>
          </div>

          {/* Grants & Scholarships */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Grants &amp; Scholarships
            </h3>
            <ul className="space-y-2 text-slate-800">
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="https://njfams.hesaa.org" target="_blank" rel="noreferrer">
                  NJFAMS Account
                </a>
              </li>
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/StateApplicationDeadlines.aspx">
                  Application Deadlines
                </a>
              </li>
            </ul>
          </div>

          {/* NJCLASS */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">NJCLASS</h3>
            <ul className="space-y-2 text-slate-800">
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/NJCLASSApplyNow.aspx">
                  Apply Now
                </a>
              </li>
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp"
                   target="_blank" rel="noreferrer">
                  Login
                </a>
              </li>
              <li>
                <a className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                   href="/Pages/NJCLASSPayment.aspx">
                  Make a Payment
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              CONTACT US
            </h3>
            <div className="flex items-center gap-4" aria-label="Social media">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/HESAA"
                target="_blank"
                rel="noreferrer"
                aria-label="HESAA on Facebook"
                className="group inline-flex items-center justify-center"
              >
                <svg
                  className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M22 12.07C22 6.48 17.52 2 11.93 2C6.34 2 1.86 6.48 1.86 12.07c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12.1h2.4v-2.3c0-2.37 1.41-3.68 3.57-3.68 1.03 0 2.11.18 2.11.18v2.32h-1.19c-1.17 0-1.53.73-1.53 1.48v1.99h2.6l-.42 2.89h-2.18v7.03C18.34 21.23 22 17.08 22 12.07Z"
                  />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@HESAA"
                target="_blank"
                rel="noreferrer"
                aria-label="HESAA on YouTube"
                className="group inline-flex items-center justify-center"
              >
                <svg
                  className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M23.5 6.2s-.23-1.64-.95-2.36c-.9-.95-1.91-.95-2.37-1C16.83 2.5 12 2.5 12 2.5h-.01s-4.83 0-8.18.34c-.46.05-1.47.05-2.37 1-.72.72-.95 2.36-.95 2.36S0 8.2 0 10.2v1.6c0 2 .24 4 0 6 0 0 .23 1.64.95 2.36.9.95 2.09.92 2.62 1.02 1.9.19 8.43.32 8.43.32s4.84 0 8.19-.34c.46-.05 1.47-.05 2.37-1 .72-.72.95-2.36.95-2.36s.5-2 .5-4v-1.6c0-2-.5-4-.5-4Zm-14 9.05v-7.5l6.25 3.75L9.5 15.25Z"
                  />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="https://twitter.com/hessanj"
                target="_blank"
                rel="noreferrer"
                aria-label="HESAA on X"
                className="group inline-flex items-center justify-center"
              >
                <svg
                  className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M20.29 3H17.8l-4.3 5.22L9.4 3H3.86l6.05 9.32L3.71 21h2.49l4.9-5.94L14.6 21h5.54l-6.05-9.44L20.29 3Z"
                  />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/higher-education-student-assistance-authority"
                target="_blank"
                rel="noreferrer"
                aria-label="HESAA on LinkedIn"
                className="group inline-flex items-center justify-center"
              >
                <svg
                  className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.49 8.13h4.02V23H.49V8.13ZM8.29 8.13H12V10h.05c.51-.97 1.77-1.99 3.64-1.99 3.89 0 4.61 2.56 4.61 5.88V23h-4.02v-6.6c0-1.58-.03-3.61-2.2-3.61-2.2 0-2.54 1.72-2.54 3.5V23H8.29V8.13Z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </nav>

        {/* bottom row */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-700">
            © {year} Higher Education Student Assistance Authority
          </div>

          <a
            href="/Pages/OpenPublicRecordsAct.aspx"
            className="inline-flex items-center gap-2 text-sm text-slate-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            <img
              src="/assets/OPRA.jpg"
              alt="OPRA - Open Public Records Act"
              className="h-8 w-auto rounded-sm border border-slate-300"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
