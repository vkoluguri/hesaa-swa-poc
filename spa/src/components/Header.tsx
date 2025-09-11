import React, { useEffect, useRef, useState } from "react";
import { Globe, Search } from "lucide-react";
import { mountGoogleTranslate } from "../utils/googleTranslate";

// Simple menu model
type Item = { label: string; href?: string; target?: "_blank" };
type Menu = { label: string; children?: Item[]; href?: string };

const MENUS: Menu[] = [
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
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
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
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" },
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
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" },
    ],
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
      { label: "Publications (Eng/Span)", href: "/Pages/HESAAPublications.aspx" },
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

export default function Header() {
  const [open, setOpen] = useState<number | null>(null);
  const [showTranslate, setShowTranslate] = useState(false);
  const translateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTranslate) mountGoogleTranslate();
  }, [showTranslate]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!translateRef.current) return;
      if (!translateRef.current.contains(e.target as Node)) setShowTranslate(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="w-full text-gray-900">
      {/* Gov strip */}
      <div className="flex items-center justify-between px-6 py-2 bg-white border-b">
        <div className="flex items-center gap-3">
          <img src="/assets/NJLogo_small.gif" alt="NJ Seal" className="h-6 w-6" />
          <nav className="hidden md:flex gap-4 text-sm">
            <span className="text-gray-700">Governor Philip D. Murphy</span>
            <span className="text-gray-700">•</span>
            <span className="text-gray-700">Lt. Governor Tahesha L. Way</span>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <a className="hover:text-blue-700 text-blue-600" href="https://nj.gov" target="_blank" rel="noreferrer">NJ Home</a>
          <a className="hover:text-blue-700 text-blue-600" href="https://nj.gov/nj/services/" target="_blank" rel="noreferrer">Services A to Z</a>
          <a className="hover:text-blue-700 text-blue-600" href="https://nj.gov/nj/deptserv/" target="_blank" rel="noreferrer">Departments/Agencies</a>

          {/* Translate CTA */}
          <div className="relative" ref={translateRef}>
            <button
              onClick={() => setShowTranslate((s) => !s)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-100"
              aria-haspopup="true"
              aria-expanded={showTranslate}
              title="Translate this page"
            >
              <Globe size={16} /> <span>Translate</span>
            </button>
            {showTranslate && (
              <div
                id="gt-container"
                className="absolute right-0 z-30 mt-2 w-56 rounded-md border bg-white p-2 shadow-lg"
              />
            )}
          </div>

          <a className="hover:text-blue-700 text-blue-600" href="https://nj.gov/faqs/" target="_blank" rel="noreferrer">NJ Gov FAQs</a>

          {/* Search */}
          <label className="flex items-center gap-1 border rounded px-2 py-1">
            <Search size={16} />
            <input
              className="outline-none text-sm"
              placeholder="Search..."
              aria-label="Search"
              type="search"
            />
          </label>
        </div>
      </div>

      {/* Emergency / temporary banner (toggle display via JS when needed) */}
      <div id="emergency-banner" className="hidden bg-red-600 text-white text-center py-2">
        Important notice goes here…
      </div>

      {/* Main nav */}
      <div className="sticky top-0 z-20 bg-gray-100/90 backdrop-blur">
        <div className="max-w-[1400px] mx-auto flex items-center px-6 py-3">
          <a href="/" className="mr-6 shrink-0">
            <img src="/assets/HESAALogo.png" className="h-9 w-auto" alt="HESAA" />
          </a>

          <ul className="flex flex-wrap gap-4 font-medium">
            {MENUS.map((m, idx) => (
              <li
                key={m.label}
                className="relative"
                onMouseEnter={() => setOpen(idx)}
                onMouseLeave={() => setOpen((o) => (o === idx ? null : o))}
              >
                {m.href ? (
                  <a
                    className="px-3 py-2 rounded hover:bg-white hover:shadow-sm transition"
                    href={m.href}
                  >
                    {m.label}
                  </a>
                ) : (
                  <button
                    className="px-3 py-2 rounded hover:bg-white hover:shadow-sm transition"
                    aria-haspopup="true"
                    aria-expanded={open === idx}
                  >
                    {m.label}
                  </button>
                )}

                {/* Dropdown */}
                {m.children && (
                  <div
                    className={`absolute left-0 mt-2 w-[320px] rounded-lg border bg-white p-2 shadow-xl transition ${
                      open === idx
                        ? "pointer-events-auto opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 -translate-y-1"
                    }`}
                  >
                    <ul className="max-h-[60vh] overflow-auto">
                      {m.children.map((c) => (
                        <li key={c.label}>
                          <a
                            className="flex items-start justify-between gap-2 rounded px-3 py-2 hover:bg-gray-50"
                            href={c.href}
                            target={c.target}
                          >
                            <span className="text-left">{c.label}</span>
                            <span className="text-gray-300">›</span>
                          </a>
                          <hr className="border-gray-100" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
