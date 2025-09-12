import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Search } from "lucide-react";

/* ---------- Google Translate (script + init) ---------- */
function useGoogleTranslate() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Avoid duplicate loads
    if ((window as any).__gt_loaded) return;

    (window as any).googleTranslateElementInit = function () {
      // Create the widget in our container
      // vertical layout gives us a nice compact list
      // @ts-ignore
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.VERTICAL,
          autoDisplay: false,
        },
        "google_translate_element"
      );
      (window as any).__gt_loaded = true;
      setLoaded(true);

      // Remove "Powered by Google" text nodes
      const observer = new MutationObserver(() => {
        const el = document.querySelector("#google_translate_element .goog-te-gadget");
        if (!el) return;
        [...el.childNodes].forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE) n.parentNode?.removeChild(n);
        });
      });
      observer.observe(document.getElementById("google_translate_element")!, {
        childList: true,
        subtree: true,
      });
    };

    const s = document.createElement("script");
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = () => setLoaded(false);
    document.head.appendChild(s);
  }, []);

  return loaded;
}

/* ---------- Menu data ---------- */

type MenuItem = { label: string; href?: string; target?: "_blank"; children?: MenuItem[] };
const NAV: MenuItem[] = [
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
      { label: "WTC Scholarship Board", href: "/Pages/wtcboardmeetings.aspx" },
      { label: "Employer Resources", href: "/Pages/EmployerResources.aspx" }
    ]
  },
  {
    label: "Students",
    children: [
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "8 Steps to Apply", href: "/Documents/8_steps_howToApply.pdf", target: "_blank" },
      { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
      { label: "Log into your NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
      { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
      { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
      { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
      { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { label: "Affordable Care Act", href: "https://nj.gov/governor/getcoverednj/", target: "_blank" },
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" }
    ]
  },
  {
    label: "Parents/Guardians",
    children: [
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "8 Steps to Apply", href: "/Documents/8_steps_howToApply.pdf", target: "_blank" },
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
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" }
    ]
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
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" }
    ]
  },
  {
    label: "Financial Aid Administrators",
    children: [
      { label: "E-Administrator Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeFinAidAdmin.jsp", target: "_blank" },
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      { label: "Grants & Scholarships", href: "/Pages/NJGrantsHome.aspx" },
      { label: "8 Steps to Apply", href: "/Documents/8_steps_howToApply.pdf", target: "_blank" },
      { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
      { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
      { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { label: "HESAA University", href: "/Pages/HESAAUHome.aspx" },
      { label: "Real Money 101", href: "/Pages/RealMoneyRegistrationIntro.aspx" },
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" }
    ]
  },
  {
    label: "Public Notices",
    children: [
      { label: "Enabling Legislation & Regulations", href: "/Pages/StatutesRegulations.aspx" },
      { label: "Procurements", href: "/Pages/Procurements.aspx" },
      { label: "Rulemaking", href: "/Pages/NoticeofRulemaking.aspx" },
      { label: "OPRA", href: "/Pages/OpenPublicRecordsAct.aspx" },
      { label: "Public Information", href: "/Pages/PublicInformation.aspx" }
    ]
  },
  { label: "Login", href: "/Pages/LoginOptions.aspx" },
];

/* ---------- Components ---------- */

function GovTopBar() {
  const loaded = useGoogleTranslate();
  const [open, setOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-2 flex items-center gap-3">
        {/* logo left */}
        <a href="/" className="flex items-center gap-2">
          <img src="/assets/HESAALogo.png" alt="HESAA" className="h-8 w-auto" />
        </a>

        {/* centered gov leaders (matches old site tone) */}
        <div className="mx-auto text-xs sm:text-sm text-[var(--muted)]">
          <span className="font-medium text-[var(--ink)]">Governor Philip D. Murphy</span>
          <span className="mx-1">•</span>
          <span className="font-medium text-[var(--ink)]">Lt. Governor Tahesha L. Way</span>
        </div>

        {/* right: NJ links + translate + search */}
        <nav className="hidden lg:flex items-center gap-4 text-sm">
          <a href="https://nj.gov" className="hover:text-[var(--brand)]">NJ Home</a>
          <a href="https://nj.gov/nj/services/" className="hover:text-[var(--brand)]">Services A to Z</a>
          <a href="https://nj.gov/nj/departments/" className="hover:text-[var(--brand)]">Departments/Agencies</a>

          {/* Translate */}
          <div className="relative" ref={ddRef}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
              aria-haspopup="true" aria-expanded={open}
            >
              <Globe size={16} /> <span>Translate</span> <ChevronDown size={16} />
            </button>
            <div
              id="translateDropdown"
              className={`absolute right-0 mt-2 w-[380px] max-h-[520px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl ${open ? "block" : "hidden"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">Select Language</span>
                <button className="text-xs px-2 py-1 rounded hover:bg-slate-100" onClick={() => setOpen(false)}>CLOSE</button>
              </div>
              <div id="google_translate_element" className="p-3 text-sm"></div>
            </div>
          </div>

          {/* Search */}
          <form action="/search" className="relative">
            <input
              className="w-64 rounded-full border border-slate-300 pl-9 pr-3 py-1.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-2)]"
              placeholder="Search…" name="q" />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </form>
        </nav>
      </div>
    </div>
  );
}

function NavBar() {
  // small delay so the submenu doesn't disappear while moving the cursor
  const timers = useRef<Record<number, any>>({});

  return (
    <div className="w-full bg-[#eef3ff] border-b border-slate-200">
      <div className="mx-auto w-full max-w-[1400px] px-4">
        <ul className="flex items-stretch gap-2">
          {NAV.map((item, idx) => {
            const hasKids = !!item.children?.length;
            return (
              <li key={idx} className="relative"
                  onMouseEnter={() => {
                    clearTimeout(timers.current[idx]);
                    const el = document.getElementById(`menu-${idx}`);
                    if (el) el.classList.remove("hidden");
                  }}
                  onMouseLeave={() => {
                    timers.current[idx] = setTimeout(() => {
                      const el = document.getElementById(`menu-${idx}`);
                      if (el) el.classList.add("hidden");
                    }, 120);
                  }}>
                <a
                  href={item.href ?? "#"}
                  target={item.target}
                  className={`px-4 py-3 inline-flex items-center gap-1 font-medium text-[var(--ink)] hover:text-[var(--brand)] ${item.label==="Home" || item.label==="Login" ? "font-semibold" : ""}`}
                >
                  {item.label} {hasKids && <ChevronDown size={16} className="text-slate-500" />}
                </a>

                {/* submenu */}
                {hasKids && (
                  <div id={`menu-${idx}`} className="hidden absolute left-0 top-full z-30 min-w-[320px] rounded-md border border-slate-200 bg-white shadow-xl">
                    <div className="grid grid-cols-1 gap-0 py-2">
                      {item.children!.map((c, i) => (
                        <a key={i}
                           href={c.href}
                           target={c.target}
                           className="px-4 py-2 text-sm hover:bg-slate-50"
                        >
                          {c.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function Header() {
  // hidden emergency ribbon; toggle with JS when needed
  const [showAlert] = useState(false);

  return (
    <header className="w-full">
      <GovTopBar />

      {showAlert && (
        <div className="w-full bg-amber-50 border-y border-amber-200">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-2 text-amber-900">
            <strong className="mr-2">Important:</strong> Emergency or temporary message goes here.
          </div>
        </div>
      )}

      <NavBar />
    </header>
  );
}
