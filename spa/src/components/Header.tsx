import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Globe, ChevronDown, ChevronRight, X } from "lucide-react";

/** ──────────────────────────────────────────────
 *  Types (nav)
 *  ───────────────────────────────────────────── */
type NavLeaf = { label: string; href: string; target?: "_blank" };
type NavGroup = { label: string; children: NavLeaf[] };
type NavNode = { label: string; href?: string; children?: (NavLeaf | NavGroup)[] };

/** ──────────────────────────────────────────────
 *  Manageable Emergency / Maintenance banner
 *  - If you set window.HESAA_BANNER = {message, tone}
 *    it will appear until closed.
 *  - tone: "info" | "warning" | "danger"
 *  ───────────────────────────────────────────── */
function EmergencyBanner() {
  const [banner, setBanner] = useState<null | { message: string; tone?: "info" | "warning" | "danger" }>(
    () => (window as any).HESAA_BANNER ?? null
  );
  if (!banner || !banner.message?.trim()) return null;

  const colors =
    banner.tone === "danger"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : banner.tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-blue-50 border-blue-200 text-blue-800";

  return (
    <div role="status" aria-live="polite" className={`w-full border-b ${colors}`}>
      <div className="max-w-[120rem] mx-auto px-4 py-2 flex items-start gap-3">
        <strong className="mt-0.5">Notice:</strong>
        <div className="flex-1 text-sm leading-snug">{banner.message}</div>
        <button
          aria-label="Dismiss notice"
          className="shrink-0 rounded p-1 hover:bg-white/60"
          onClick={() => setBanner(null)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** ──────────────────────────────────────────────
 *  Google Translate popover
 *  - one safe global callback
 *  - dropdown visible, then disclaimer
 *  ───────────────────────────────────────────── */
function TranslateButton() {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // One-time global callback expected by the loader
  useEffect(() => {
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google?.translate) {
          // eslint-disable-next-line no-new
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              layout: (window as any).google.translate.TranslateElement.InlineLayout.VERTICAL,
              autoDisplay: false,
            },
            "gt-widget"
          );
        }
      };
    }
  }, []);

  // Outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-[6px] text-slate-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Globe className="size-4" aria-hidden="true" /> Translate <ChevronDown className="size-4" />
      </button>

      <div
        className={`absolute right-0 mt-2 w-[420px] rounded-md border border-slate-200 bg-white shadow-xl z-50 ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between px-3 pt-3">
          <span className="text-sm font-medium text-slate-700">Close</span>
          <button className="text-sm text-blue-700 hover:underline" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <div className="px-3 pt-2">
          {/* The dropdown will render here */}
          <div id="gt-widget" className="mb-3" />
          <div className="text-[12px] text-slate-600 leading-snug mb-3">
            The State of NJ site may contain optional links, information, services and/or content from other websites
            operated by third parties that are provided as a convenience, such as Google™ Translate. Google™ Translate
            is an online service for which the user pays nothing to obtain a purported language translation. The user is
            on notice that neither the State of NJ site nor its operators review any of the services, information and/or
            content from anything that may be linked to the State of NJ site for any reason. To the extent Google™
            Translate caches and presents older versions of the State of NJ site content, that is beyond the control of
            the State of NJ site and its operators who accept no responsibility or liability for the outdated
            translation.
          </div>
        </div>
      </div>
    </div>
  );
}

/** ──────────────────────────────────────────────
 *  Navigation data
 *  - NJCLASS sub-group under “NJCLASS Family Loans” (no duplicate level)
 *  ───────────────────────────────────────────── */
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
          {
            label: "NJCLASS Login",
            href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp",
            target: "_blank",
          },
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
          {
            label: "NJCLASS Login",
            href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp",
            target: "_blank",
          },
        ],
      },
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
      {
        label: "E-Administrator Login",
        href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeFinAidAdmin.jsp",
        target: "_blank",
      },
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

/** ──────────────────────────────────────────────
 *  Styles
 *  ───────────────────────────────────────────── */
const brand = {
  bar: "bg-[#fafafacc]", // menu row only
  line: "border-b border-slate-200",
  link: "text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded",
};

/** Helpers */
function isGroup(node: NavLeaf | NavGroup): node is NavGroup {
  return (node as NavGroup).children !== undefined;
}

/** Desktop nav */
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
                  <div className="flex items-center justify-between rounded-md px-3 py-2 bg-slate-50 text-slate-900 font-medium">
                    <span>{child.label}</span>
                    <ChevronRight className="size-4 text-slate-400" aria-hidden />
                  </div>

                  {/* Fly-out panel to the right */}
                  <ul className="absolute left-full top-0 ml-2 min-w-[20rem] rounded-md border border-slate-200 bg-white p-2 shadow-2xl hidden group-hover:block">
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

/** Mobile nav */
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
        {hasChildren && <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />}
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

/** ──────────────────────────────────────────────
 *  Header (two rows, not sticky)
 *  ───────────────────────────────────────────── */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile panel open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="w-full">
      <EmergencyBanner />

      {/* Top row: logo left, NJ links + search right (white background) */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-[120rem] mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Logo — exact asset + size */}
            <a href="/" className="inline-flex items-center" aria-label="HESAA Home">
              <img
                src="/assets/logo.gif"
                alt="Higher Education Student Assistance Authority"
                width={254}
                height={112}
                className="w-[254px] h-[112px]"
              />
            </a>

            {/* Right: NJ links & search (stack like old site) */}
            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-slate-800">
                <img src="/assets/NJLogo_small.gif" alt="" className="h-6 w-auto opacity-80" />
                <a href="https://nj.gov/governor/" className="font-semibold text-blue-700 hover:text-blue-900">
                  Governor Philip D. Murphy
                </a>
                <span className="mx-1">•</span>
                <a href="https://nj.gov/governor/" className="font-semibold text-blue-700 hover:text-blue-900">
                  Lt. Governor Tahesha L. Way
                </a>
              </div>

              <div className="flex items-center gap-4">
                <a href="https://nj.gov" className={brand.link}>
                  NJ Home
                </a>
                <a href="https://nj.gov/services/" className={brand.link}>
                  Services A to Z
                </a>
                <a href="https://nj.gov/nj/deptserv/" className={brand.link}>
                  Departments/Agencies
                </a>

                <TranslateButton />

                <a href="https://nj.gov/faqs" className={brand.link}>
                  NJ Gov FAQs
                </a>

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
      </div>

      {/* Menu row */}
      <div className={`w-full ${brand.line} ${brand.bar}`}>
        <div className="max-w-[120rem] mx-auto px-4">
          <nav aria-label="Primary" className="hidden md:flex items-stretch justify-center gap-2 py-3">
            {NAV.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>

        {/* MOBILE PANEL (fixed overlay; background doesn’t scroll) */}
        <div
          id="mobile-panel"
          className={`md:hidden fixed inset-0 z-50 bg-white overflow-auto transition-opacity ${
            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="max-w-[120rem] mx-auto px-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <img src="/assets/logo.gif" alt="HESAA" className="h-10 w-auto" />
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="py-2">
              {NAV.map((item) => (
                <MobileItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
