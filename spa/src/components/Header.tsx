import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";

/* ===================== NAV DATA ===================== */
type NavLeaf = { label: string; href: string; target?: "_blank" };
type NavNode = { label: string; href?: string; children?: NavLeaf[] };

const NAV: NavNode[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    children: [
      { label: "HESAA Mission and History", href: "/Pages/aboutus.aspx" },
      { label: "HESAA Board", href: "/Pages/HESAABoardInfo.aspx" },
      { label: "Executive Staff", href: "/Pages/ExecBios.aspx" },
      { label: "Advisory Committees", href: "/Pages/Committees.aspx" },
      { label: "TAG Study Commission", href: "/Pages/tagstudycommission.aspx" },
      { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { label: "Investor Relations", href: "/Pages/InvestorRelations.aspx" },
      { label: "Public Information", href: "/Pages/PublicInformation.aspx" },
      { label: "World Trade Center Scholarship Board", href: "/Pages/wtcboardmeetings.aspx" },
      { label: "Employer Resources", href: "/Pages/EmployerResources.aspx" },
    ],
  },
  {
    label: "Students",
    children: [
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
      { label: "Log into your NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
      { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
      { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
      { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
      { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { label: "Affordable Care Act", href: "https://nj.gov/governor/getcoverednj/", target: "_blank" },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },
  {
    label: "Parents/Guardians",
    children: [
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
      { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
      { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
      { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
      { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
      { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { label: "NJBEST College Savings Plan", href: "/pages/NJBESTHome.aspx", target: "_blank" },
      { label: "Affordable Care Act", href: "https://nj.gov/governor/getcoverednj/", target: "_blank" },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },
  {
    label: "School Counselors",
    children: [
      { label: "NJBEST College Savings Plan", href: "/pages/NJBESTHome.aspx", target: "_blank" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Real Money 101", href: "/Pages/RealMoneyRegistrationIntro.aspx" },
      { label: "Financial Aid Sessions", href: "/Pages/HighSchoolFinancialAid.aspx" },
      { label: "School Counselor Workshops", href: "/Pages/CounselorsRegistration.aspx" },
      { label: "Going to College in NJ", href: "/Pages/GTCINJ.aspx", target: "_blank" },
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },
  {
    label: "Financial Aid Administrators",
    children: [
      { label: "E-Administrator Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeFinAidAdmin.jsp", target: "_blank" },
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
      { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
      { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { label: "HESAA University", href: "/Pages/HESAAUHome.aspx" },
      { label: "Real Money 101", href: "/Pages/RealMoneyRegistrationIntro.aspx" },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },
  {
    label: "Public Notices",
    children: [
      { label: "Enabling Legislation and Regulations", href: "/Pages/StatutesRegulations.aspx" },
      { label: "Procurements", href: "/Pages/Procurements.aspx" },
      { label: "Rulemaking", href: "/Pages/NoticeofRulemaking.aspx" },
      { label: "OPRA", href: "/Pages/OpenPublicRecordsAct.aspx" },
      { label: "Public Information", href: "/Pages/PublicInformation.aspx" },
    ],
  },
  { label: "Login", href: "/Pages/LoginOptions.aspx" },
];

/* ===================== PALETTE HELPERS ===================== */
const brand = {
  bg: "bg-slate-50",
  bar: "bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70",
  line: "border-b border-slate-200",
  link:
    "text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
};

/* ===================== HEADER ===================== */
export default function Header() {
  const [open, setOpen] = useState(false); // mobile menu
  const [translateOpen, setTranslateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Google Translate: define callback + inject script once
  useEffect(() => {
    // callback Google calls after its script loads
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

    // inject the script if not present
    const id = "google-translate-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  // Close translate when clicking outside
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
    <header className={`w-full sticky top-0 z-40 ${brand.bar} ${brand.line}`}>
      {/* Top NJ links row (right aligned, hidden on mobile) */}
      <div className="max-w-[120rem] mx-auto px-4">
        <div className="hidden md:flex items-center justify-end gap-6 py-2 text-sm text-blue-700">
          {/* NJ Crest (decorative) */}
          <img
            src="/assets/NULogo_small.gif"
            alt=""
            aria-hidden="true"
            className="h-6 w-auto opacity-80"
          />
          <div className="font-medium">
            <a href="https://nj.gov/governor/" className={brand.link}>
              Governor Philip D. Murphy
            </a>{" "}
            •{" "}
            <a href="https://nj.gov/governor/" className={brand.link}>
              Lt. Governor Tahesha L. Way
            </a>
          </div>

          <nav aria-label="NJ links" className="flex items-center gap-4">
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
            <div ref={dropdownRef} className="relative">
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

              {/* Dropdown (z-50 to float over menu) */}
              <div
                id="translate-dropdown"
                className={`absolute right-0 mt-2 w-[380px] rounded-md border border-slate-200 bg-white p-3 shadow-lg z-50 ${
                  translateOpen ? "block" : "hidden"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Select Language
                  </span>
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
            <label className="relative ml-4">
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search..."
                className="w-56 rounded-full border border-slate-300 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
              />
              <Search
                className="absolute left-2.5 top-1.5 size-4 text-slate-400"
                aria-hidden="true"
              />
            </label>
          </nav>
        </div>
      </div>

      {/* Main nav bar */}
      <div className={`w-full ${brand.bg} ${brand.line}`}>
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            {/* Left: Logo (always visible) */}
            <a href="/" className="shrink-0">
              <img
                src="/assets/HESAALogo.png"
                alt="Higher Education Student Assistance Authority"
                className="h-10 w-auto"
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
              className="hidden md:flex items-stretch gap-2 ml-4"
            >
              {NAV.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>

          {/* Mobile panel: nav + translate + search (gov links hidden) */}
          <div className={`md:hidden ${open ? "block" : "hidden"}`}>
            <div className="border-t border-slate-200 py-3 space-y-2">
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
                  <Search
                    className="absolute left-2.5 top-2.5 size-4 text-slate-400"
                    aria-hidden="true"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ===================== DESKTOP NAV ITEM ===================== */
function NavItem({ item }: { item: NavNode }) {
  const hasChildren = !!item.children?.length;
  return (
    <div className="relative group">
      <a
        href={item.href || "#"}
        className="px-4 py-2 rounded-md text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded="false"
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && <ChevronDown className="inline size-4 ml-1" aria-hidden="true" />}
      </a>

      {hasChildren && (
        <div
          className="absolute left-0 top-[calc(100%+2px)] hidden group-hover:block"
          role="menu"
        >
          <ul className="min-w-[22rem] rounded-md border border-slate-200 bg-white p-2 shadow-xl">
            {item.children!.map((c) => (
              <li key={c.label} className="relative">
                <a
                  href={c.href}
                  target={c.target}
                  className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[.95rem] text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  role="menuitem"
                >
                  <span>{c.label}</span>
                  {/* subtle chevron for items users expect to be “deeper” */}
                  {/(NJFAMS|Forms|Login|Deadlines|Dreamers)/i.test(c.label) && (
                    <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ===================== MOBILE NAV ITEM ===================== */
function MobileItem({ item }: { item: NavNode }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;
  return (
    <div className="px-1">
      <button
        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-100"
        onClick={() =>
          hasChildren ? setOpen((v) => !v) : (window.location.href = item.href || "#")
        }
        aria-expanded={open}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        )}
      </button>

      {hasChildren && open && (
        <ul className="ml-2 mt-1 space-y-1">
          {item.children!.map((c) => (
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
      )}
    </div>
  );
}
