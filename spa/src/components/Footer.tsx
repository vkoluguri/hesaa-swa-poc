import React from "react";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="w-full bg-[#eef3ff] border-t border-slate-200 mt-10">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 grid gap-10 md:grid-cols-4">
        <div>
          <h4 className="text-xl font-semibold mb-3">HESAA</h4>
          <ul className="space-y-2 text-[15px]">
            <li><a className="hover:text-[var(--brand)]" href="/Pages/Employment.aspx">Careers</a></li>
            <li><a className="hover:text-[var(--brand)]" href="/Pages/PrivacyPolicy.aspx">Privacy Policy</a></li>
            <li><a className="hover:text-[var(--brand)]" href="/Pages/Terms.aspx">Website T &amp; C</a></li>
            <li><a className="hover:text-[var(--brand)]" href="/Pages/SiteMap.aspx">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-3">Grants &amp; Scholarships</h4>
          <ul className="space-y-2 text-[15px]">
            <li><a className="hover:text-[var(--brand)]" href="/Pages/NJFAMSHome.aspx">NJFAMS Account</a></li>
            <li><a className="hover:text-[var(--brand)]" href="/Pages/StateApplicationDeadlines.aspx">Application Deadlines</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-3">NJCLASS</h4>
          <ul className="space-y-2 text-[15px]">
            <li><a className="hover:text-[var(--brand)]" href="/Pages/NJCLASSHome.aspx">Apply Now</a></li>
            <li><a className="hover:text-[var(--brand)]" href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp">Login</a></li>
            <li><a className="hover:text-[var(--brand)]" href="https://www.hesaa.org/CustAuth/jsp/loggedin/MakeAPayment.jsp">Make a Payment</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-semibold mb-3">Contact Us</h4>
          <div className="flex items-center gap-4 text-[var(--brand)]">
            <a href="#" aria-label="Facebook"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/></svg></a>
            <a href="#" aria-label="YouTube"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.7 15.5v-7l6 3.5-6 3.5z"/></svg></a>
            <a href="#" aria-label="X/Twitter"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.2 8.2L23 22h-6.8l-5.3-7-6 7H2.8L10.5 13 2 2h6.9l4.8 6.4L18.9 2z"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8h4v13H3zm7 0h3.8v1.8h.1a4.1 4.1 0 013.7-2c4 0 4.7 2.7 4.7 6.2V21h-4v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z"/></svg></a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">© {year} Higher Education Student Assistance Authority</div>
          <img src="/assets/OPRA.jpg" alt="OPRA" className="h-8 w-auto" />
        </div>
      </div>
    </footer>
  );
}
