import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gradient-to-b from-[#d6ecf7] to-[#63a8cc]/40">
      <div className="mx-auto grid max-w-site gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="mb-2 font-semibold">HESAA</h3>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline" href="/Pages/Careers.aspx">Careers</a></li>
            <li><a className="hover:underline" href="/Pages/PrivacyPolicy.aspx">Privacy Policy</a></li>
            <li><a className="hover:underline" href="/Pages/TermsAndConditions.aspx">Website T &amp; C</a></li>
            <li><a className="hover:underline" href="/Pages/Sitemap.aspx">Sitemap</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Grants &amp; Scholarships</h3>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline" href="/Pages/NJFAMSHome.aspx">NJFAMS Account</a></li>
            <li><a className="hover:underline" href="/Pages/StateApplicationDeadlines.aspx">Application Deadlines</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-semibold">NJCLASS</h3>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline" href="/Pages/NJCLASSHome.aspx">Apply Now</a></li>
            <li><a className="hover:underline" href="/Pages/NJCLASSLogin.aspx">Login</a></li>
            <li><a className="hover:underline" href="/Pages/NJCLASSPayment.aspx">Make a Payment</a></li>
          </ul>
        </div>

        <div className="flex items-start gap-4">
          <img src="/assets/OPRA.jpg" alt="OPRA" className="h-10 w-auto" />
          <p className="text-sm text-gray-600">
            © 2025 Higher Education Student Assistance Authority
          </p>
        </div>
      </div>
    </footer>
  );
}
