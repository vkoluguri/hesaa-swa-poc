import React, { useEffect, useRef, useState } from "react";

/** Top-level menu with accessible submenus (keyboard + touch + mouse) */
type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string; target?: string }[];
};

const menu: MenuItem[] = [
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
      { label: "Enabling Legislation and Regulations", href: "/Pages/StatutesRegulations.aspx" },
      { label: "Procurements", href: "/Pages/Procurements.aspx" },
      { label: "Rulemaking", href: "/Pages/NoticeofRulemaking.aspx" },
      { label: "OPRA", href: "/Pages/OpenPublicRecordsAct.aspx" },
      { label: "Public Information", href: "/Pages/PublicInformation.aspx" }
    ]
  },
  { label: "Login", href: "/Pages/LoginOptions.aspx" }
];

const NJLinks = () => (
  <div className="hidden md:flex items-center gap-4">
    <img src="/assets/NJLogo_small.gif" alt="State of New Jersey" className="h-8 w-auto" />
    <nav aria-label="State links" className="text-sm text-gray-600">
      <a className="hover:text-nav" href="https://nj.gov" target="_blank" rel="noreferrer">NJ Home</a>
      <span className="mx-2">|</span>
      <a className="hover:text-nav" href="https://nj.gov/nj/services/" target="_blank" rel="noreferrer">Services A to Z</a>
      <span className="mx-2">|</span>
      <a className="hover:text-nav" href="https://nj.gov/nj/deptserv/" target="_blank" rel="noreferrer">Departments/Agencies</a>
      <span className="mx-2">|</span>
      <a className="hover:text-nav" href="https://translate.google.com" target="_blank" rel="noreferrer">Translate</a>
      <span className="mx-2">|</span>
      <a className="hover:text-nav" href="https://nj.gov/faqs/" target="_blank" rel="noreferrer">NJ Gov FAQs</a>
    </nav>
  </div>
);

export default function Header() {
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="mx-auto flex max-w-site items-center justify-between gap-4 px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          <img src="/assets/HESAALogo.png" alt="HESAA" className="h-10 w-auto" />
        </a>

        <NJLinks />

        <button
          className="md:hidden rounded border px-3 py-2 text-gray-700"
          aria-expanded={mobile}
          aria-controls="mobile-nav"
          onClick={() => setMobile(v => !v)}
        >
          Menu
        </button>
      </div>

      {/* Desktop nav */}
      <div ref={navRef} className="hidden md:block">
        <nav aria-label="Primary" className="mx-auto max-w-site px-2">
          <ul className="flex gap-4">
            {menu.map((m, i) => {
              const has = !!m.children?.length;
              return (
                <li key={m.label} className="relative py-2">
                  {has ? (
                    <button
                      className="nav-link px-3 py-2 rounded-md hover:bg-gray-50"
                      aria-haspopup="true"
                      aria-expanded={open === i}
                      onClick={() => setOpen(open === i ? null : i)}
                      onMouseEnter={() => setOpen(i)}
                      onFocus={() => setOpen(i)}
                    >
                      {m.label}
                    </button>
                  ) : (
                    <a className="nav-link px-3 py-2 rounded-md hover:bg-gray-50" href={m.href}>{m.label}</a>
                  )}

                  {has && open === i && (
                    <div
                      className="absolute left-0 mt-2 w-[320px] rounded-lg border border-gray-200 bg-white p-2 shadow-soft"
                      onMouseLeave={() => setOpen(null)}
                    >
                      <ul>
                        {m.children!.map(c => (
                          <li key={c.label}>
                            <a
                              className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              href={c.href}
                              target={c.target}
                              rel={c.target === "_blank" ? "noreferrer" : undefined}
                            >
                              {c.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile nav */}
      <div id="mobile-nav" className={`md:hidden ${mobile ? "block" : "hidden"} border-t border-gray-200`}>
        <nav aria-label="Primary mobile" className="px-4 py-3">
          <ul className="space-y-2">
            {menu.map((m) => (
              <li key={m.label}>
                {!m.children?.length ? (
                  <a className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50" href={m.href}>{m.label}</a>
                ) : (
                  <details className="group">
                    <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50">
                      {m.label}
                    </summary>
                    <ul className="mt-1 space-y-1 pl-4">
                      {m.children!.map(c => (
                        <li key={c.label}>
                          <a className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                             href={c.href} target={c.target} rel={c.target === "_blank" ? "noreferrer" : undefined}>
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
