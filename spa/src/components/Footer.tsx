import React from "react";
import { Facebook, Youtube, Twitter, Linkedin } from "lucide-react";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-[#fafafa] border-t border-slate-200 mt-12">
      <div className="max-w-[120rem] mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-800">
          <div>
            <h4 className="font-semibold mb-3">HESAA</h4>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="/Pages/Careers.aspx">Careers</a></li>
              <li><a className="hover:underline" href="/Pages/PrivacyPolicy.aspx">Privacy Policy</a></li>
              <li><a className="hover:underline" href="/Pages/WebsiteTermsAndConditions.aspx">Website T & C</a></li>
              <li><a className="hover:underline" href="/Pages/SiteMap.aspx">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Grants & Scholarships</h4>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="/Pages/NJFAMSHome.aspx">NJFAMS Account</a></li>
              <li><a className="hover:underline" href="/Pages/StateApplicationDeadlines.aspx">Application Deadlines</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">NJCLASS</h4>
            <ul className="space-y-2">
              <li><a className="hover:underline" href="/Pages/NJCLASSApplyNow.aspx">Apply Now</a></li>
              <li><a className="hover:underline" href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp">Login</a></li>
              <li><a className="hover:underline" href="/Pages/NJCLASSPayment.aspx">Make a Payment</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact Us</h4>
            <div className="flex items-center gap-3">
              <Social href="https://facebook.com" icon={<Facebook className="size-4" />} label="Facebook" />
              <Social href="https://youtube.com" icon={<Youtube className="size-4" />} label="YouTube" />
              <Social href="https://twitter.com" icon={<Twitter className="size-4" />} label="X" />
              <Social href="https://linkedin.com" icon={<Linkedin className="size-4" />} label="LinkedIn" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-8 flex items-center justify-between">
          <img src="/assets/OPRA.jpg" alt="OPRA" className="h-8 w-auto" />
          <div className="text-sm text-slate-600">© {year} Higher Education Student Assistance Authority</div>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 size-9"
    >
      {icon}
    </a>
  );
}
