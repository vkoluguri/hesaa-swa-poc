import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types: allow sections (group headings) and links in any submenu     */
/* ------------------------------------------------------------------ */

type NavLeaf = {
  type: "link";
  label: string;
  href: string;
  target?: "_blank";
};

type NavSection = {
  type: "section";
  label: string;             // visual group heading (not clickable)
  children: NavLeaf[];       // links inside this group
};

type NavNode = {
  label: string;             // top-level button text
  href?: string;             // optional when it has children
  children?: Array<NavLeaf | NavSection>;
};

/* ------------------------------------------------------------------ */
/* Menu data (now supports sections)     */
/* ------------------------------------------------------------------ */

const NAV: NavNode[] = [
  { label: "Home", href: "/" },

  {
    label: "About Us",
    children: [
      { type: "link", label: "HESAA Mission and History", href: "/Pages/aboutus.aspx" },
      { type: "link", label: "HESAA Board", href: "/Pages/HESAABoardInfo.aspx" },
      { type: "link", label: "Executive Staff", href: "/Pages/ExecBios.aspx" },
      { type: "link", label: "Advisory Committees", href: "/Pages/Committees.aspx" },
      { type: "link", label: "TAG Study Commission", href: "/Pages/tagstudycommission.aspx" },
      { type: "link", label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { type: "link", label: "Investor Relations", href: "/Pages/InvestorRelations.aspx" },
      { type: "link", label: "Public Information", href: "/Pages/PublicInformation.aspx" },
      { type: "link", label: "World Trade Center Scholarship Board", href: "/Pages/wtcboardmeetings.aspx" },
      { type: "link", label: "Employer Resources", href: "/Pages/EmployerResources.aspx" },
    ],
  },

  {
    label: "Students",
    children: [
      { type: "link", label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { type: "link", label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },

      // --- Sub menu group like “Grants & Scholarships” example ---
      {
        type: "section",
        label: "Grants & Scholarships",
        children: [
          { type: "link", label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { type: "link", label: "Log into your NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { type: "link", label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },

      { type: "link", label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },

      {
        type: "section",
        label: "NJCLASS",
        children: [
          { type: "link", label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
          { type: "link", label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
          { type: "link", label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
        ],
      },

      { type: "link", label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { type: "link", label: "Affordable Care Act", href: "https://nj.gov/governor/getcoverednj/", target: "_blank" },
      { type: "link", label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },

  {
    label: "Parents/Guardians",
    children: [
      { type: "link", label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { type: "link", label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },

      {
        type: "section",
        label: "Grants & Scholarships",
        children: [
          { type: "link", label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { type: "link", label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { type: "link", label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },

      { type: "link", label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },

      {
        type: "section",
        label: "NJCLASS",
        children: [
          { type: "link", label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
          { type: "link", label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
          { type: "link", label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
        ],
      },

      { type: "link", label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { type: "link", label: "NJBEST College Savings Plan", href: "/pages/NJBESTHome.aspx", target: "_blank" },
      { type: "link", label: "Affordable Care Act", href: "https://nj.gov/governor/getcoverednj/", target: "_blank" },
      { type: "link", label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },

  {
    label: "School Counselors",
    children: [
      { type: "link", label: "NJBEST College Savings Plan", href: "/pages/NJBESTHome.aspx", target: "_blank" },
      { type: "link", label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { type: "link", label: "Real Money 101", href: "/Pages/RealMoneyRegistrationIntro.aspx" },
      { type: "link", label: "Financial Aid Sessions", href: "/Pages/HighSchoolFinancialAid.aspx" },
      { type: "link", label: "School Counselor Workshops", href: "/Pages/CounselorsRegistration.aspx" },
      { type: "link", label: "Going to College in NJ", href: "/Pages/GTCINJ.aspx", target: "_blank" },
      { type: "link", label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },

      {
        type: "section",
        label: "Grants & Scholarships",
        children: [
          { type: "link", label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },

      { type: "link", label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },

  {
    label: "Financial Aid Administrators",
    children: [
      { type: "link", label: "E-Administrator Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeFinAidAdmin.jsp", target: "_blank" },
      { type: "link", label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { type: "link", label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },

      {
        type: "section",
        label: "Grants & Scholarships",
        children: [
          { type: "link", label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { type: "link", label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { type: "link", label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },

      { type: "link", label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { type: "link", label: "HESAA University", href: "/Pages/HESAAUHome.aspx" },
      { type: "link", label: "Real Money 101", href: "/Pages/RealMoneyRegistrationIntro.aspx" },
      { type: "link", label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },

  {
    label: "Public Notices",
    children: [
      { type: "link", label: "Enabling Legislation and Regulations", href: "/Pages/StatutesRegulations.aspx" },
      { type: "link", label: "Procurements", href: "/Pages/Procurements.aspx" },
      { type: "link", label: "Rulemaking", href: "/Pages/NoticeofRulemaking.aspx" },
      { type: "link", label: "OPRA", href: "/Pages/OpenPublicRecordsAct.aspx" },
      { type: "link", label: "Public Information", href: "/Pages/PublicInformation.aspx" },
    ],
  },

  { label: "Login", href: "/Pages/LoginOptions.aspx" },
];

/* ------------------------------------------------------------------ */
/* a11y/contrast helpers                                               */
/* ------------------------------------------------------------------ */
const brand = {
  bar: "bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70",
  thin: "border-b border-slate-200",
  link:
    "text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm",
};

/* ================================================================== */
/* Header                                                              */
/* ================================================================== */

export default function Header() {
  const [open, setOpen] = useState(false); // mobile menu
  const [translateOpen, setTranslateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create global callback consumed by the script tag in index.html
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout: window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            autoDisplay: false,
          },
          "gt-container"
        );
      }
    };
  }, []);

  // Close Translate dropdown on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTranslateOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className={`w-full sticky top-0 z-40 ${brand.bar} ${brand.thin}`}>
      {/* ===== Top NJ links row ===== */}
      <div className="max-w-[120rem] mx-auto px-4">
        <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-center gap-4 py-2 text-sm">
          {/* Left: Crest (hide gracefully if not found) */}
          <img
            src="/assets/NULogo_small.gif"
            alt=""
            aria-hidden="true"
            className="h-7 w-auto"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />

          {/* Center: Governor / Lt. Governor */}
          <div className="text-center">
            <a href="https://nj.gov/governor/" className={brand.link}>
              Governor Philip D. Murphy
            </a>{" "}
            •{" "}
            <a href="https://nj.gov/governor/" className={brand.link}>
              Lt. Governor Tahesha L. Way
            </a>
          </div>

          {/* Right: NJ links + Translate + Search */}
          <nav aria-label="NJ links" className="flex items-center gap-4 justify-end">
            <a href="https://nj.gov" className={brand.link}>
              NJ Home
            </a>
            <a href="https://nj.gov/services/" className={brand.link}>
              Services A to Z
            </a>
            <a href="https://nj.gov/nj/deptserv/" className={brand.link}>
              Departments/Agencies
            </a>

            {/* Translate trigger */}
            <div ref={dropdownRef} className="relative z-50">
              <button
                type="button"
                aria-expanded={translateOpen}
                aria-controls="translate-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setTranslateOpen((v) => !v);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-[6px] text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Globe className="size-4" aria-hidden="true" />
                <span>Translate</span>
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>

              <div
                id="translate-dropdown"
                className={`absolute right-0 mt-2 w-[380px] rounded-md border border-slate-200 bg-white p-3 shadow-lg ${
                  translateOpen ? "block" : "hidden"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Select Language</span>
                  <button
                    className="text-sm text-blue-700 hover:underline"
                    onClick={() => setTranslateOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div id="gt-container" className="max-h-[420px] overflow-auto"></div>
              </div>
            </div>

            <a href="https://nj.gov/faqs" className={brand.link}>
              NJ Gov FAQs
            </a>

            {/* Search (desktop) */}
            <label className="relative ml-2">
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search..."
                className="w-60 rounded-full border border-slate-300 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
              />
              <Search className="absolute left-2.5 top-1.5 size-4 text-slate-400" aria-hidden="true" />
            </label>
          </nav>
        </div>
      </div>

      {/* ===== Main nav bar ===== */}
      <div className={`w-full bg-slate-50 ${brand.thin}`}>
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            {/* Left: HESAA logo (left/top), keeps menu centered */}
            <a href="/" className="shrink-0">
              <img
                src="/assets/HESAALogo.png"
                alt="Higher Education Student Assistance Authority"
                className="h-12 w-auto"
              />
            </a>

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="primary-nav"
              className="ml-auto md:hidden inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Menu className="size-5" aria-hidden="true" />
              <span className="text-sm">Menu</span>
            </button>

            {/* Primary nav (desktop) */}
            <nav
              id="primary-nav"
              aria-label="Primary"
              className="hidden md:flex items-stretch gap-2 mx-auto"
            >
              {NAV.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>

          {/* small gap under the menu so breadcrumb/content breathe */}
          <div className="h-3" aria-hidden="true" />
        </div>

        {/* Mobile panel: nav + translate + search */}
        <div className={`md:hidden ${open ? "block" : "hidden"} border-t border-slate-200`}>
          <div className="px-4 py-3 space-y-2">
            {NAV.map((item) => (
              <MobileItem key={item.label} item={item} />
            ))}

            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="size-4" /> Translate
                </span>
                <button
                  onClick={() => setTranslateOpen(true)}
                  className="text-blue-700 hover:underline"
                >
                  Open
                </button>
              </div>
              <label className="relative mt-3 block">
                <span className="sr-only">Search</span>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" aria-hidden="true" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ================================================================== */
/* Desktop nav item w/ hover dropdown and sectioned submenu            */
/* ================================================================== */

function NavItem({ item }: { item: NavNode }) {
  const hasChildren = !!item.children?.length;

  return (
    <div className="relative group">
      <a
        href={item.href || "#"}
        className="px-4 py-2 rounded-md text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={false}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && <ChevronDown className="inline size-4 ml-1" aria-hidden="true" />}
      </a>

      {hasChildren && (
        <>
          {/* hover “bridge” so moving from button to panel doesn’t close it */}
          <div className="absolute left-0 right-0 top-full h-2 hidden group-hover:block" aria-hidden="true" />
          <div
            className="absolute left-0 top-[calc(100%+8px)] hidden group-hover:block z-40"
            role="menu"
          >
            <ul className="min-w-[24rem] rounded-md border border-slate-200 bg-white p-2 shadow-xl">
              {item.children!.map((entry, idx) =>
                entry.type === "section" ? (
                  <li key={`sec-${idx}`} role="presentation" className="pt-1">
                    <div className="px-3 py-1.5 text-[0.95rem] font-semibold text-slate-700 bg-slate-50 rounded">
                      {entry.label}
                    </div>
                    <ul className="mt-1 mb-2">
                      {entry.children.map((c) => (
                        <li key={c.label}>
                          <a
                            href={c.href}
                            target={c.target}
                            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[.95rem] text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            role="menuitem"
                          >
                            <span>{c.label}</span>
                            <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                    {idx !== item.children!.length - 1 && <hr className="my-1 border-slate-200" />}
                  </li>
                ) : (
                  <li key={entry.label}>
                    <a
                      href={entry.href}
                      target={entry.target}
                      className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[.95rem] text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      role="menuitem"
                    >
                      <span>{entry.label}</span>
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================== */
/* Mobile accordion item (sections render as headings + links)         */
/* ================================================================== */

function MobileItem({ item }: { item: NavNode }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  return (
    <div className="px-1">
      <button
        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-100"
        onClick={() => (hasChildren ? setOpen((v) => !v) : (window.location.href = item.href || "#"))}
        aria-expanded={open}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && (
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        )}
      </button>

      {hasChildren && open && (
        <div className="ml-2 mt-1 space-y-1">
          {item.children!.map((entry, idx) =>
            entry.type === "section" ? (
              <div key={`m-sec-${idx}`} className="mt-1">
                <div className="px-3 py-1.5 text-[0.95rem] font-semibold text-slate-700 bg-slate-50 rounded">
                  {entry.label}
                </div>
                <ul className="mt-1">
                  {entry.children.map((c) => (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        target={c.target}
                        className="block rounded-md px-3 py-2 text-[.95rem] text-slate-700 hover:bg-slate-100"
                      >
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <a
                key={entry.label}
                href={entry.href}
                target={entry.target}
                className="block rounded-md px-3 py-2 text-[.95rem] text-slate-700 hover:bg-slate-100"
              >
                {entry.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
}
