import React from "react";

const year = new Date().getFullYear();

// Match site rail (comfortable width)
const CONTAINER = "max-w-[85rem] mx-auto px-4";

// Dark brand color (same as main nav)
const FOOTER_BG = "#0d132d";

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
    <footer aria-labelledby="footer-title" className="w-full" role="contentinfo" style={{ backgroundColor: FOOTER_BG }}>
      <h2 className="sr-only" id="footer-title">Site footer</h2>

      {/* Put this once near the top of the footer, inside <footer> */}
<p id="ft-ext-note" className="sr-only">
  Social media links open in a new browser tab.
</p>

      {/* Top: four columns (reduced vertical space on desktop) */}
      <div className={`${CONTAINER} py-8 md:py-7 lg:py-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 justify-items-start text-white">
          {/* Column 1 */}
          <nav aria-labelledby="ft-hesaa">
            <h2 id="ft-hesaa" className="text-[16px] font-semibold mb-3 text-white">
              HESAA
            </h2>
            <ul className="space-y-1 text-[14px] leading-6">
              <li>
                <a
                  href="/Pages/Careers.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/Pages/PrivacyPolicy.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/Pages/WebsiteTerms.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Website T&nbsp;&amp;&nbsp;C
                </a>
              </li>
              <li>
                <a
                  href="/Pages/SiteMap.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 2 */}
          <nav aria-labelledby="ft-grants">
            <h2 id="ft-grants" className="text-[16px] font-semibold mb-3 text-white">
              Grants &amp; Scholarships
            </h2>
            <ul className="space-y-1 text-[14px] leading-6">
              <li>
                <a
                  href="https://njfams.hesaa.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                  aria-label="NJFAMS Account (opens in a new tab)"
                >
                  NJFAMS Account
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="/Pages/StateApplicationDeadlines.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Application Deadlines
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 3 */}
          <nav aria-labelledby="ft-njclass">
            <h2 id="ft-njclass" className="text-[16px] font-semibold mb-3 text-white">
              NJCLASS
            </h2>
            <ul className="space-y-1 text-[14px] leading-6">
              <li>
                <a
                  href="/Pages/NJCLASSHome.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Apply Now
                </a>
              </li>
              <li>
                <a
                  href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                  aria-label="NJCLASS Login (opens in a new tab)"
                >
                  Login
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a
                  href="/Pages/NJCLASSMakePayment.aspx"
                  className="rounded underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  Make a Payment
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 4: Contact / Social */}
          <section aria-labelledby="ft-contact">
            <h2 id="ft-contact" className="text-[16px] font-semibold mb-3 text-white">
              Contact Us
            </h2>
            <ul className="flex items-center gap-5">
              <li>
                <a
                  href="#"
                  target="_blank"
                  aria-label="Follow HESAA on Facebook (opens in a new tab)"
                   aria-describedby="ft-ext-note"
                  className="text-white hover:text-blue-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  <IconFacebook className="h-7 w-7" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  aria-label="Follow HESAA on Youtube (opens in a new tab)"
                  aria-describedby="ft-ext-note"
                  className="text-white hover:text-blue-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  <IconYouTube className="h-7 w-7" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  aria-label="Follow HESAA on X (opens in a new tab)"
                  aria-describedby="ft-ext-note"
                  className="text-white hover:text-blue-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                >
                  <IconX className="h-7 w-7" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  aria-label="Follow HESAA on LinkendIn (opens in a new tab)"
                  aria-describedby="ft-ext-note"
                  className="text-white hover:text-blue-200 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
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
        <hr className="border-white/20" aria-hidden="true" />
      </div>

      {/* Bottom row (reduced height) */}
      <div className={`${CONTAINER} py-5 md:py-4`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-1 gap-4">
          {/* OPRA badge (left) */}
          <a
            href="/Pages/OpenPublicRecordsAct.aspx"
            className="block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white text-[14px] sm:text-[15px] leading-snug sm:leading-6 break-words whitespace-normal max-w-full">
            © {year} Higher Education Student Assistance Authority
          </p>

          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full border border-white/30
                      px-3 py-1.5 text-[14px] text-white/90 hover:bg-white/10
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">↑</span>
            Back to top
          </a>
        </div>


        </div>
      </div>
    </footer>
  );
}
