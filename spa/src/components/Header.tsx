import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";


/* =========================
   NAV DATA (unchanged)
   ========================= */

type NavLeaf = { label: string; href: string; target?: "_blank" };
type NavGroup = { label: string; href?: string; children?: NavLeaf[] };
type NavNode = { label: string; href?: string; children?: (NavLeaf | NavGroup)[] };

function isGroup(node: NavLeaf | NavGroup): node is NavGroup {
  return (node as NavGroup).children !== undefined;
}

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
      {
        label: "NJCLASS Family Loans",
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
      {
        label: "NJCLASS Family Loans",
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

/* ------------ Site banner (top-most) ------------ */
function SiteBanner() {
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"warning" | "info" | "success" | "danger">("info");

  // read on load
  useEffect(() => {
    if (window.HESAA_BANNER?.message) {
      setMsg(window.HESAA_BANNER.message);
      setTone(window.HESAA_BANNER.tone || "info");
    }
  }, []);

  // allow runtime console update: window.setHESAA_BANNER("text","warning")
  useEffect(() => {
    const h = (e: any) => {
      const d = e.detail || {};
      setMsg(d.message || null);
      setTone(d.tone || "info");
    };
    window.addEventListener("hesaa:banner", h);
    window.setHESAA_BANNER = (message: string, tone?: "warning" | "info" | "success" | "danger") =>
      window.dispatchEvent(new CustomEvent("hesaa:banner", { detail: { message, tone } }));
    return () => window.removeEventListener("hesaa:banner", h);
  }, []);

  if (!msg) return null;

  const toneClass =
    tone === "warning"
      ? "bg-yellow-100 text-yellow-900 border-yellow-300"
      : tone === "success"
      ? "bg-green-100 text-green-900 border-green-300"
      : tone === "danger"
      ? "bg-red-100 text-red-900 border-red-300"
      : "bg-blue-100 text-blue-900 border-blue-300";

  return <div className={`w-full border ${toneClass} text-center text-sm py-2`}>{msg}</div>;
}

/* ------------ Translate popover ------------ */
function TranslatePopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      id="translate-pop"
      className={`absolute right-0 mt-2 w-[460px] rounded-md border border-slate-300 bg-white shadow-xl z-50 ${
        open ? "block" : "hidden"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
        <span className="text-sm font-medium text-slate-800">Select Language</span>
        <button onClick={onClose} className="text-lg leading-none px-2 py-1 rounded hover:bg-slate-100" aria-label="Close">
          ×
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* bordered translate dropdown */}
        <div id="gt-container" className="gt-popover" />

        {/* powered by google on right */}
        <div className="flex items-center justify-end">
          <span id="gt-powered-slot" className="text-[11px] text-slate-500" />
        </div>

        {/* full disclaimer */}
        <div className="text-[12px] text-slate-700 leading-snug">
          The State of NJ site may contain optional links, information, services and/or content from other websites
          operated by third parties that are provided as a convenience, such as Google™ Translate. Google™ Translate is
          an online service for which the user pays nothing to obtain a purported language translation. The user is on
          notice that neither the State of NJ site nor its operators review any of the services, information and/or
          content from anything that may be linked to the State of NJ site for any reason. To the extent Google™
          Translate caches and presents older versions of the State of NJ site content, that is beyond the control of
          the State of NJ site and its operators who accept no responsibility or liability for the outdated translation.
          Any third party link to the State of NJ site can be used at the user's sole risk. The user is further on
          notice that the State of NJ site and its operators expressly and fully disavow and disclaim any responsibility
          or liability in respect of any cause, claim, consequential or direct damage or loss, however described, arising
          from the use of Google™ Translate or any other service, content or information linked to the State of NJ site.
          The State of NJ site is provided 'AS-IS' with no warranties, express or implied, and its use confers no
          privileges or rights. Links to third party services, information and/or content is in no way an affiliation,
          endorsement, support or approval of the third party.
        </div>
      </div>
    </div>
  );
}

/* ------------ Desktop nav item with hover-intent + right-flyout level 2 ------------ */
function NavItem({ item }: { item: NavNode }) {
  const hasChildren = !!item.children?.length;
  const [open, setOpen] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  function armOpen(delay = 120) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), delay);
  }
  function armClose(delay = 200) {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), delay);
  }

  return (
    <li className="relative" onMouseEnter={() => armOpen(120)} onMouseLeave={() => armClose(200)}>
      <a
        href={item.href || "#"}
        className="px-4 py-2 rounded-md text-slate-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!(e.currentTarget.parentElement?.contains(document.activeElement))) setOpen(false);
        }}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && <ChevronDown className="inline size-4 ml-1" aria-hidden="true" />}
      </a>

      {hasChildren && open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-40">
          <ul
            className="min-w-[26rem] rounded-md border border-slate-200 bg-white p-2 shadow-2xl"
            onMouseEnter={() => armOpen(0)}
            onMouseLeave={() => armClose(160)}
          >
            {item.children!.map((child) =>
              isGroup(child) ? (
                <li key={child.label} className="relative group">
                  <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-slate-50 text-slate-900 font-medium">
                    <span>{child.label}</span>
                    <ChevronRight className="size-4 text-slate-400" aria-hidden />
                  </div>

                  {/* LEVEL-2 FLYOUT */}
                  <ul className="absolute top-0 left-[calc(100%+4px)] min-w-[20rem] rounded-md border border-slate-200 bg-white p-2 shadow-2xl hidden group-hover:block">
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
    </li>
  );
}

/* ------------ Mobile item (accordion) ------------ */
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

/* =========================
   Header (export)
   ========================= */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const translateWrapRef = useRef<HTMLDivElement>(null);

  // Install Google Translate + move branding
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
          setTimeout(() => {
            const brand = document.querySelector(".goog-logo-link");
            const slot = document.getElementById("gt-powered-slot");
            if (brand && slot) slot.innerHTML = (brand as HTMLElement).outerHTML;
          }, 50);
        }
      };
    }
  }, []);

  // Outside click to close translate
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (translateWrapRef.current && !translateWrapRef.current.contains(e.target as Node)) {
        setTranslateOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="w-full">
      {/* VERY TOP: emergency banner */}
      <SiteBanner />

      {/* Logo + right-links */}
      <div className="bg-white">
        <div className="max-w-[120rem] mx-auto px-4 py-2 flex items-center justify-between">
          {/* HESAA logo */}
          <a href="/" aria-label="HESAA Home">
            <img
              src="/assets/logo.gif"
              alt="Higher Education Student Assistance Authority"
              width={254}
              height={112}
              className="h-[84px] w-auto md:h-[96px] lg:h-[112px]"
            />
          </a>

          {/* Right block: NJ seal spans rows 1 & 2; links tighter; tools below */}
          <div className="hidden md:grid grid-cols-[24px_auto] grid-rows-2 gap-x-3 items-center text-[13px] leading-5">
            {/* NJ seal spanning two rows */}
            <img src="/assets/NJLogo_small.gif" alt="State of New Jersey" className="row-span-2 h-[36px] w-[24px] object-contain" />

            {/* Row 1 */}
            <div className="font-semibold text-blue-700">
              Governor Philip D. Murphy <span className="mx-1 text-slate-500">•</span> Lt. Governor Tahesha L. Way
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center gap-x-2 text-blue-700">
              <a className="hover:underline" href="https://www.nj.gov/">NJ Home</a>
              <span className="text-slate-400">|</span>
              <a className="hover:underline" href="https://nj.gov/services/">Services A to Z</a>
              <span className="text-slate-400">|</span>
              <a className="hover:underline" href="https://nj.gov/nj/deptserv/">Departments/Agencies</a>
              <span className="text-slate-400">|</span>
              <a className="hover:underline" href="https://www.nj.gov/faqs/">NJ Gov FAQs</a>
            </div>

            {/* Row 3: tools (translate + search) across full width */}
            <div className="col-span-2 mt-1 flex items-center justify-end gap-3">
              <div ref={translateWrapRef} className="relative">
                <button
                  type="button"
                  aria-expanded={translateOpen}
                  aria-controls="translate-pop"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTranslateOpen((v) => !v);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-[6px] text-slate-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Globe className="size-4" />
                  Translate
                  <ChevronDown className="size-4" />
                </button>
                <TranslatePopover open={translateOpen} onClose={() => setTranslateOpen(false)} />
              </div>

              <label className="relative">
                <span className="sr-only">Search</span>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-60 rounded-full border border-slate-300 py-1.5 pl-9 pr-3 text-[13px] placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <Search className="absolute left-2.5 top-1.5 size-4 text-slate-400" aria-hidden="true" />
              </label>
            </div>
          </div>

          {/* Mobile hamburger: label UNDER icon */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-panel"
            className="md:hidden inline-flex flex-col items-center justify-center rounded-lg px-3 py-2 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Menu className="size-6" aria-hidden />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Main nav row */}
      <div className="w-full border-t border-slate-200" style={{ backgroundColor: "#fafafacc" }}>
        <div className="max-w-[120rem] mx-auto px-4">
          <nav aria-label="Primary" className="hidden md:flex items-stretch justify-center gap-2 py-3">
            <ul className="flex items-center gap-2">
              {NAV.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile panel (NO logo image; includes Translate + Search) */}
        <div id="mobile-panel" className={`md:hidden ${menuOpen ? "block" : "hidden"}`}>
          <div className="px-4 pb-4 space-y-2">
            <div className="pt-3 pb-2 flex items-center gap-2">
              <button
                onClick={() => setTranslateOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-slate-800"
              >
                <Globe className="size-4" />
                Translate
              </button>
              <label className="relative flex-1">
                <span className="sr-only">Search</span>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-full border border-slate-300 py-2 pl-9 pr-3 text-[13px] placeholder:text-slate-400"
                />
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" aria-hidden="true" />
              </label>
            </div>

            {translateOpen && (
              <div className="relative mt-2" id="translate-pop">
                <div className="rounded-md border border-slate-300 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-800">Select Language</span>
                    <button onClick={() => setTranslateOpen(false)} className="text-lg leading-none px-2 py-1 rounded hover:bg-slate-100" aria-label="Close">×</button>
                  </div>
                  <div className="p-3 space-y-3">
                    <div id="gt-container" className="gt-popover" />
                    <div className="flex items-center justify-end"><span id="gt-powered-slot" className="text-[11px] text-slate-500" /></div>
                    <div className="text-[12px] text-slate-700 leading-snug">
                      The State of NJ site may contain optional links, information, services and/or content from other websites operated by third parties that are provided as a convenience, such as Google™ Translate. Google™ Translate is an online service for which the user pays nothing to obtain a purported language translation. The user is on notice that neither the State of NJ site nor its operators review any of the services, information and/or content from anything that may be linked to the State of NJ site for any reason. To the extent Google™ Translate caches and presents older versions of the State of NJ site content, that is beyond the control of the State of NJ site and its operators who accept no responsibility or liability for the outdated translation. Any third party link to the State of NJ site can be used at the user's sole risk. The user is further on notice that the State of NJ site and its operators expressly and fully disavow and disclaim any responsibility or liability in respect of any cause, claim, consequential or direct damage or loss, however described, arising from the use of Google™ Translate or any other service, content or information linked to the State of NJ site. The State of NJ site is provided 'AS-IS' with no warranties, express or implied, and its use confers no privileges or rights. Links to third party services, information and/or content is in no way an affiliation, endorsement, support or approval of the third party.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200" />

            {NAV.map((item) => (
              <MobileItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
