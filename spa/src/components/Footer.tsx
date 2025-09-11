import React from "react";
import { Facebook, Youtube, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-100 text-gray-800 border-top">
      <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <section>
          <h3 className="text-lg font-semibold mb-3">HESAA</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-blue-700" href="#">Careers</a></li>
            <li><a className="hover:text-blue-700" href="#">Privacy Policy</a></li>
            <li><a className="hover:text-blue-700" href="#">Website T &amp; C</a></li>
            <li><a className="hover:text-blue-700" href="#">Sitemap</a></li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Grants &amp; Scholarships</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-blue-700" href="#">NJFAMS Account</a></li>
            <li><a className="hover:text-blue-700" href="#">Application Deadlines</a></li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">NJCLASS</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-blue-700" href="#">Apply Now</a></li>
            <li><a className="hover:text-blue-700" href="#">Login</a></li>
            <li><a className="hover:text-blue-700" href="#">Make a Payment</a></li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <div className="flex items-center gap-3 mb-4">
            <a aria-label="Facebook" href="#"><Facebook /></a>
            <a aria-label="YouTube" href="#"><Youtube /></a>
            <a aria-label="X/Twitter" href="#"><Twitter /></a>
            <a aria-label="LinkedIn" href="#"><Linkedin /></a>
          </div>
          <img src="/assets/OPRA.jpg" alt="OPRA" className="h-8 w-auto" />
        </section>
      </div>

      <div className="border-t text-center py-4 text-sm">
        © {year} Higher Education Student Assistance Authority
      </div>
    </footer>
  );
}
