import React, { useState } from "react";
import { useTranslation } from "react-i18next";

/* =========================================================================
   Types
===========================================================================*/
type SubLink = { label: string; href: string; target?: string };
type NavNode =
  | { label: string; href: string; target?: string }                // leaf
  | { label: string; children: SubLink[] };                          // parent

/* =========================================================================
   NAV DATA (your full menu)
===========================================================================*/
const NAV_ITEMS: NavNode[] = [
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

/* =========================================================================
   Small helpers
===========================================================================*/
const NavLink: React.FC<React.PropsWithChildren<{ href?: string }>> = ({
  href = "#",
  children,
}) => (
  <a
    href={href}
    className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
  >
    {children}
  </a>
);

const MenuItem: React.FC<{ label: string; items?: SubLink[] }> = ({
  label,
  items = [],
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50">
        {label} <span aria-hidden>▾</span>
      </button>
      {open && items.length > 0 && (
        <div className="absolute left-0 mt-2 w-80 rounded-lg bg-white text-slate-800 shadow-xl ring-1 ring-black/5 z-30">
          <ul className="py-2">
            {items.map((it) => (
              <li key={it.label}>
                <a
                  href={it.href}
                  target={it.target}
                  rel={it.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="block px-4 py-2 text-sm hover:bg-slate-100"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   Header
===========================================================================*/
export default function Header() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");

  const changeLang = () => {
    i18n.changeLanguage(i18n.language === "en" ? "es" : "en");
  };

  return (
    <header className="sticky top-0 z-40 text-white">
      {/* NJ GOV LINKS BAR */}
      <div className="bg-slate-700/90">
        <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-end gap-3 text-sm">
          <img src="/assets/NJLogo_small.gif" alt="NJ" className="h-5 w-5" />
          <NavLink href="https://nj.gov">{t("gov.njHome")}</NavLink>
          <span aria-hidden>|</span>
          <NavLink href="#">{t("gov.services")}</NavLink>
          <span aria-hidden>|</span>
          <NavLink href="#">{t("gov.depts")}</NavLink>
          <span aria-hidden>|</span>
          {/* Translate toggle */}
          <button
            onClick={changeLang}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
          >
            {t("gov.translate")} ({i18n.language.toUpperCase()})
          </button>
          <span aria-hidden>|</span>
          <NavLink href="#">{t("gov.faqs")}</NavLink>

          {/* Search */}
          <form action="#" className="ml-3 flex items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("gov.searchPlaceholder")}
              className="h-8 rounded-md px-3 text-slate-900 placeholder:text-slate-500"
              aria-label="Site search"
            />
            <button
              type="submit"
              className="h-8 px-3 rounded-md bg-blue-500 hover:bg-blue-600"
            >
              {t("gov.search")}
            </button>
          </form>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className="bg-[#0e7236] shadow-md">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/HESAALogo.png" alt="HESAA" className="h-10 w-auto" />
          </a>

          {/* Menu */}
          <nav className="flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) =>
              "children" in item ? (
                <MenuItem key={item.label} label={item.label} items={item.children} />
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
