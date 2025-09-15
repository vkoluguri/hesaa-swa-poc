import React from "react";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="w-full bg-[#fafafa] border-t border-slate-200">
      <div className="max-w-[120rem] mx-auto px-4 py-8">
        {/* 4 columns, centered (not stretched) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">HESAA</h3>
            <ul className="space-y-2 text-slate-700">
              <li><a href="/Pages/aboutus.aspx" className="hover:underline">About Us</a></li>
              <li><a href="/Pages/HESAABoardInfo.aspx" className="hover:underline">HESAA Board</a></li>
              <li><a href="/Pages/ExecBios.aspx" className="hover:underline">Executive Staff</a></li>
              <li><a href="/Pages/PublicInformation.aspx" className="hover:underline">Public Information</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Grants & Scholarships</h3>
            <ul className="space-y-2 text-slate-700">
              <li><a href="/Pages/financialaidhub.aspx" className="hover:underline">Apply for State Aid</a></li>
              <li><a href="/Pages/NJGrantsHome.aspx" className="hover:underline">NJGrants Home</a></li>
              <li><a href="/Pages/gsg.aspx" className="hover:underline">Garden State Guarantee</a></li>
              <li><a href="/Pages/StateApplicationDeadlines.aspx" className="hover:underline">Deadlines</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">NJCLASS</h3>
            <ul className="space-y-2 text-slate-700">
              <li><a href="/Pages/NJCLASSHome.aspx" className="hover:underline">NJCLASS Home</a></li>
              <li><a href="/Pages/NJCLASSForms.aspx" className="hover:underline">Forms</a></li>
              <li><a href="/Documents/NJCLASSComparisonChart.pdf" target="_blank" className="hover:underline">Comparison Chart</a></li>
              <li><a href="https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp" target="_blank" className="hover:underline">Login</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Us</h3>
            <ul className="space-y-2 text-slate-700">
              <li><a href="/Pages/ContactUs.aspx" className="hover:underline">Contact HESAA</a></li>
              <li><a href="/Pages/HESAAPublications.aspx" className="hover:underline">Publications</a></li>
              <li><a href="/Pages/OpenPublicRecordsAct.aspx" className="hover:underline">OPRA</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom row: OPRA left, social + copyright right */}
        <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src="/assets/OPRA.jpg" alt="OPRA" className="h-10 w-auto rounded-sm border border-slate-200" />
            <a href="/Pages/OpenPublicRecordsAct.aspx" className="text-slate-700 hover:underline">Open Public Records Act</a>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* subtle filled social badges */}
            <a aria-label="Facebook" href="#" className="inline-flex items-center justify-center size-9 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">
              f
            </a>
            <a aria-label="X/Twitter" href="#" className="inline-flex items-center justify-center size-9 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">
              x
            </a>
            <a aria-label="YouTube" href="#" className="inline-flex items-center justify-center size-9 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">
              ▶
            </a>

            <div className="text-sm text-slate-600 ml-2">
              © {year} HESAA. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
