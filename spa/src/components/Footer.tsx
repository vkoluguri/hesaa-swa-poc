import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="w-full border-t border-slate-200 bg-slate-50"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="max-w-[120rem] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">HESAA</h3>
          <ul className="space-y-2">
            <li><a className="text-blue-700 hover:underline" href="/Pages/Careers.aspx">Careers</a></li>
            <li><a className="text-blue-700 hover:underline" href="/Pages/PrivacyPolicy.aspx">Privacy Policy</a></li>
            <li><a className="text-blue-700 hover:underline" href="/Pages/WebsiteTC.aspx">Website T &amp; C</a></li>
            <li><a className="text-blue-700 hover:underline" href="/Pages/Sitemap.aspx">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Grants &amp; Scholarships</h3>
          <ul className="space-y-2">
            <li><a className="text-blue-700 hover:underline" href="/Pages/NJFAMSHome.aspx">NJFAMS Account</a></li>
            <li><a className="text-blue-700 hover:underline" href="/Pages/StateApplicationDeadlines.aspx">Application Deadlines</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">NJCLASS</h3>
          <ul className="space-y-2">
            <li><a className="text-blue-700 hover:underline" href="/Pages/NJCLASSHome.aspx">Apply Now</a></li>
            <li><a className="text-blue-700 hover:underline" href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp">Login</a></li>
            <li><a className="text-blue-700 hover:underline" href="/Pages/NJCLASSPayment.aspx">Make a Payment</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <div className="flex items-center gap-4 text-blue-700">
            <a aria-label="Facebook" href="#" className="hover:underline">f</a>
            <a aria-label="YouTube" href="#" className="hover:underline">▶</a>
            <a aria-label="X" href="#" className="hover:underline">𝕏</a>
            <a aria-label="LinkedIn" href="#" className="hover:underline">in</a>
          </div>
        </div>
      </div>

      {/* bottom row: OPRA + copyright on the right */}
      <div className="border-t border-slate-200">
        <div className="max-w-[120rem] mx-auto px-4 py-4 flex items-center justify-end gap-4">
          <img src="/assets/OPRA.jpg" alt="OPRA - Open Public Records Act" className="h-8 w-auto" />
          <div className="text-sm text-slate-600">
            © {year} Higher Education Student Assistance Authority
          </div>
        </div>
      </div>
    </footer>
  );
}
