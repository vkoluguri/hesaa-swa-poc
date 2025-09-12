import React from "react";
import {
  Facebook,
  Youtube,
  Linkedin,
  X as TwitterX, // lucide's X icon
  ExternalLink,
} from "lucide-react";

/**
 * Footer
 * - Centered 4-column layout (mobile stacks)
 * - Light background distinct from page sections
 * - Auto-updating year
 * - Accessible labels + focus styles
 */

const linkCls =
  "text-blue-700 hover:text-blue-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-100 border-t border-slate-200">
      {/* Top: link columns (centered rail) */}
      <div className="max-w-[80rem] mx-auto px-4 py-10">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-slate-800"
          role="navigation"
          aria-label="Footer"
        >
          <Section title="HESAA">
            <FooterLink href="/Pages/Careers.aspx">Careers</FooterLink>
            <FooterLink href="/Pages/PrivacyPolicy.aspx">Privacy Policy</FooterLink>
            <FooterLink href="/Pages/WebsiteTermsConditions.aspx">Website T &amp; C</FooterLink>
            <FooterLink href="/Pages/Sitemap.aspx">Sitemap</FooterLink>
          </Section>

          <Section title="Grants & Scholarships">
            <FooterLink href="/Pages/NJFAMSInfo.aspx">NJFAMS Account</FooterLink>
            <FooterLink href="/Pages/StateApplicationDeadlines.aspx">
              Application Deadlines
            </FooterLink>
          </Section>

          <Section title="NJCLASS">
            <FooterLink href="/Pages/NJCLASSApplyNow.aspx">Apply Now</FooterLink>
            <FooterLink href="/Pages/NJCLASSLogin.aspx">Login</FooterLink>
            <FooterLink href="/Pages/MakeAPayment.aspx">Make a Payment</FooterLink>
          </Section>

          <Section title="Contact Us">
            <ul className="flex items-center gap-4 pt-1" aria-label="Social media">
              <SocialIcon
                href="https://www.facebook.com/HESAA"
                label="Facebook"
                Icon={Facebook}
              />
              <SocialIcon
                href="https://www.youtube.com/user/hesaatube"
                label="YouTube"
                Icon={Youtube}
              />
              <SocialIcon
                href="https://twitter.com/NJCLASS"
                label="X (formerly Twitter)"
                Icon={TwitterX}
              />
              <SocialIcon
                href="https://www.linkedin.com/company/hesaa"
                label="LinkedIn"
                Icon={Linkedin}
              />
            </ul>
          </Section>
        </div>
      </div>

      {/* Bottom bar: OPRA badge (left) + copyright (right), still centered rail */}
      <div className="border-t border-slate-200">
        <div className="max-w-[80rem] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <a
            href="/Pages/OpenPublicRecordsAct.aspx"
            className="inline-flex items-center gap-2"
          >
            <img
              src="/assets/OPRA.jpg"
              alt="OPRA (Open Public Records Act)"
              className="h-8 w-auto rounded-sm"
            />
            <span className="sr-only">Open Public Records Act</span>
          </a>

          <p className="text-sm text-slate-600">
            © {year} Higher Education Student Assistance Authority
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- helpers ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={slugId(title)}>
      <h3
        id={slugId(title)}
        className="text-lg font-semibold tracking-tight text-slate-900 mb-3"
      >
        {title}
      </h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const isExternal = /^https?:\/\//i.test(href);
  return (
    <li>
      <a
        href={href}
        className={`${linkCls} inline-flex items-center gap-1`}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <span>{children}</span>
        {isExternal && (
          <ExternalLink
            className="size-3.5 align-middle text-slate-400"
            aria-hidden="true"
          />
        )}
      </a>
    </li>
  );
}

function SocialIcon({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Icon className="size-5 text-slate-700" />
      </a>
    </li>
  );
}

function slugId(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
