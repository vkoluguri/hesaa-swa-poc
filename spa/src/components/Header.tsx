import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Globe,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

/* =========================
   NAV DATA (supports sub-groups)
   ========================= */

type NavLeaf = { label: string; href: string; target?: "_blank" };
type NavGroup = { label: string; href?: string; children?: NavLeaf[] };
type NavNode = { label: string; href?: string; children?: (NavLeaf | NavGroup)[] };

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
      {
        label: "Grants & Scholarships",
        children: [
          { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { label: "Log into your NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      {
        label: "NJCLASS",
        children: [
          { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
          { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
          { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
        ],
      },
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
      {
        label: "Grants & Scholarships",
        children: [
          { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      {
        label: "NJCLASS",
        children: [
          { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
          { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
          { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
        ],
      },
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
      {
        label: "Grants & Scholarships",
        children: [{ label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" }],
      },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },
  {
    label: "Financial Aid Administrators",
    children: [
      { label: "E-Administrator Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeFinAidAdmin.jsp", target: "_blank" },
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      {
        label: "Grants & Scholarships",
        children: [
          { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },
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

/* === a11y/contrast + theme === */
const brand = {
  bar: "bg-[#fafafa]/95 backdrop-blur supports-[backdrop-filter]:bg-[#fafafa]/80",
  line: "border-b border-slate-200",
  link:
    "text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded",
};

/* =========
   Types for global (Translate)
   ========= */
// Install Google Translate widget (assign callback once)
useEffect(() => {
  if (!window.googleTranslateElementInit) {
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
  }
}, []);


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Init Google Translate widget
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

  // Close translate on outside click
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
      {/* TOP ROW: Logo left, NJ links + Translate + Search right */}
      <div className="max-w-[120rem] mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          {/* Left: HESAA logo */}
          <a href="/" className="inline-flex items-center gap-2" aria-label="HESAA Home">
            <img
              src="/assets/HESAALogo.png"
              alt="Higher Education Student Assistance Authority"
              className="h-10 w-auto"
            />
          </a>

          {/* Right: NJ links + Translate + Search (hide on small) */}
          <div className="hidden md:flex items-center gap-4">
            <img
              src="/assets/NJLogo_small.gif"
              alt=""
              aria-hidden="true"
              className="h-6 w-auto opacity-80"
            />
            <div className="text-sm">
              <a href="https://nj.gov/governor/" className={brand.link}>
                Governor Philip D. Murphy
              </a>{" "}
              •{" "}
              <a href="https://nj.gov/governor/" className={brand.link}>
                Lt. Governor Tahesha L. Way
              </a>
            </div>

            <a href="https://nj.gov" className={brand.link}>NJ Home</a>
            <a href="https://nj.gov/services/" className={brand.link}>Services A to Z</a>
            <a href="https://nj.gov/nj/deptserv/" className={brand.link}>Departments/Agencies</a>

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
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-[6px] text-slate-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Globe className="size-4" aria-hidden="true" />
                <span>Translate</span>
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>

              {/* Popover with disclaimer style */}
              <div
                id="translate-dropdown"
                className={`absolute right-0 mt-2 w-[420px] rounded-md border border-slate-200 bg-white p-3 shadow-xl z-50 ${
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
                <div className="mt-3 text-[12px] text-slate-600 leading-snug">
                  The State of NJ site may contain optional links, information, services and/or content from
                  other websites operated by third parties that are provided as a convenience, such as Google™
                  Translate. Google™ Translate is an online service for which the user pays nothing to obtain a
                  purported language translation. The user is on notice that neither the State of NJ site nor its
                  operators review any of the services, information and/or content from anything that may be
                  linked to the State of NJ site for any reason. To the extent Google™ Translate caches and
                  presents older versions of the State of NJ site content, that is beyond the control of the State
                  of NJ site and its operators who accept no responsibility or liability for the outdated
                  translation.
                </div>
              </div>
            </div>

            <a href="https://nj.gov/faqs" className={brand.link}>NJ Gov FAQs</a>

            <label className="relative ml-2">
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search..."
                className="w-60 rounded-full border border-slate-300 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
              />
              <Search className="absolute left-2.5 top-1.5 size-4 text-slate-400" aria-hidden="true" />
            </label>
          </div>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-panel"
            className="md:hidden inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Menu className="size-5" aria-hidden />
            <span className="text-sm">Menu</span>
          </button>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <div className={`w-full ${brand.line}`}>
        <div className="max-w-[120rem] mx-auto px-4">
          <nav aria-label="Primary" className="hidden md:flex items-stretch justify-center gap-2 py-3">
            {NAV.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>

        {/* MOBILE PANEL */}
        <div id="mobile-panel" className={`md:hidden ${menuOpen ? "block" : "hidden"}`}>
          <div className="px-4 pb-4 space-y-2">
            {/* Logo + divider */}
            <div className="pt-2 pb-3 flex items-center justify-between">
              <img src="/assets/HESAALogo.png" alt="HESAA" className="h-8 w-auto" />
              <span className="sr-only">HESAA</span>
            </div>
            <div className="border-t border-slate-200" />

            {NAV.map((item) => (
              <MobileItem key={item.label} item={item} />
            ))}

            <div className="mt-3 border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-2">
                  <Globe className="size-4" /> Translate
                </span>
                <button onClick={() => setTranslateOpen(true)} className="text-blue-700 hover:underline">
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

/* ============ Desktop Nav ============ */

function isGroup(node: NavLeaf | NavGroup): node is NavGroup {
  return (node as NavGroup).children !== undefined;
}

function NavItem({ item }: { item: NavNode }) {
  const hasChildren = !!item.children?.length;
  return (
    <div className="relative group">
      <a
        href={item.href || "#"}
        className="px-4 py-2 rounded-md text-slate-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded="false"
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && <ChevronDown className="inline size-4 ml-1" aria-hidden="true" />}
      </a>

      {hasChildren && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] hidden group-hover:block z-40">
          <ul className="min-w-[26rem] rounded-md border border-slate-200 bg-white p-2 shadow-2xl">
            {item.children!.map((child) =>
              isGroup(child) ? (
                <li key={child.label} className="relative">
                  {/* group row */}
                  <div className="flex items-center justify-between rounded-md px-3 py-2 bg-slate-50 text-slate-900 font-medium">
                    <span>{child.label}</span>
                    <ChevronRight className="size-4 text-slate-400" aria-hidden />
                  </div>
                  {/* inner list */}
                  <ul className="mt-1 ml-3 border-l border-slate-200 pl-3">
                    {child.children!.map((leaf) => (
                      <li key={leaf.label}>
                        <a
                          href={leaf.href}
                          target={leaf.target}
                          className="block rounded-md px-3 py-2 text-[.95rem] text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          {leaf.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <hr className="my-2 border-slate-200" />
                </li>
              ) : (
                <li key={child.label}>
                  <a
                    href={child.href}
                    target={child.target}
                    className="block rounded-md px-3 py-2 text-[.95rem] text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {child.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============ Mobile Nav ============ */

function MobileItem({ item }: { item: NavNode }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  return (
    <div className="px-1">
      <button
        className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left hover:bg-white"
        onClick={() => (hasChildren ? setOpen((v) => !v) : (window.location.href = item.href || "#"))}
        aria-expanded={open}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && (
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        )}
      </button>

      {hasChildren && open && (
        <ul className="ml-2 mt-1 space-y-1">
          {item.children!.map((child) =>
            isGroup(child) ? (
              <li key={child.label} className="bg-slate-50 rounded-md">
                <div className="px-3 py-2 font-medium">{child.label}</div>
                <ul className="ml-2 mb-2 border-l border-slate-200 pl-3">
                  {child.children!.map((leaf) => (
                    <li key={leaf.label}>
                      <a
                        href={leaf.href}
                        target={leaf.target}
                        className="block rounded-md px-3 py-2 text-[.95rem] text-slate-700 hover:bg-white"
                      >
                        {leaf.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={child.label}>
                <a
                  href={child.href}
                  target={child.target}
                  className="block rounded-md px-3 py-2 text-[.95rem] text-slate-700 hover:bg-white"
                >
                  {child.label}
                </a>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
