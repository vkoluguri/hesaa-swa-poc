import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";

const TOP_ACTIVE_BG = "bg-[#357ae8]";   // the solid highlight you liked
const TOP_ACTIVE_TEXT = "text-white";
const TOP_HOVER_BG = "hover:bg-[#cfe0ff]";
const TOP_HOVER_TEXT = "hover:text-blue-900";

/* =========================
   NAV DATA (yours)
   ========================= */

type NavLeaf = { label: string; href: string; target?: "_blank" };
type NavGroup = { label: string; href?: string; children?: NavLeaf[] };
type NavNode = { label: string; href?: string; children?: (NavLeaf | NavGroup)[] };

function isGroup(node: NavLeaf | NavGroup): node is NavGroup {
  return (node as NavGroup).children !== undefined;
}

const NAV: NavNode[] = [
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
      {
        label: "Grants & Scholarships",
        children: [
          { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { label: "Log into your NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },
      {
        label: "NJCLASS Family Loans",
        children: [
          { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
          { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
          { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
        ],
      },
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
      {
        label: "Grants & Scholarships",
        children: [
          { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },
      {
        label: "NJCLASS Family Loans",
        children: [
          { label: "Loan Comparison Chart", href: "/Documents/NJCLASSComparisonChart.pdf", target: "_blank" },
          { label: "NJCLASS Forms", href: "/Pages/NJCLASSForms.aspx" },
          { label: "NJCLASS Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeNJCLASS.jsp", target: "_blank" },
        ],
      },
      { label: "Loan Redemption Programs", href: "/Pages/LoanRedemptionPrograms.aspx" },
      { label: "NJBEST College Savings Plan", href: "/pages/NJBESTHome.aspx", target: "_blank" },
      { label: "Affordable Care Act", href: "https://nj.gov/governor/getcoverednj/", target: "_blank" },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
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
      {
        label: "Grants & Scholarships",
        children: [{ label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" }],
      },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
    ],
  },

  {
    label: "Financial Aid Administrators",
    children: [
      { label: "E-Administrator Login", href: "https://www.hesaa.org/CustAuth/jsp/loggedin/WelcomeFinAidAdmin.jsp", target: "_blank" },
      { label: "Apply for State Aid", href: "/Pages/financialaidhub.aspx" },
      { label: "Garden State Guarantee", href: "/Pages/gsg.aspx" },
      {
        label: "Grants & Scholarships",
        children: [
          { label: "NJ Dreamers", href: "/Pages/NJAlternativeApplication.aspx" },
          { label: "Log into NJFAMS", href: "https://njfams.hesaa.org", target: "_blank" },
          { label: "Deadlines for Grants & Scholarships", href: "/Pages/StateApplicationDeadlines.aspx" },
        ],
      },
      { label: "NJCLASS Family Loans", href: "/Pages/NJCLASSHome.aspx" },
      { label: "HESAA University", href: "/Pages/HESAAUHome.aspx" },
      { label: "Real Money 101", href: "/Pages/RealMoneyRegistrationIntro.aspx" },
      { label: "Publications (English/Spanish)", href: "/Pages/HESAAPublications.aspx" },
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

/* ----------------------------------------------------------------
   Persistent banner (Option B: /assets/banner.json)
------------------------------------------------------------------*/
function useBanner() {
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"warning" | "info" | "success" | "danger">("info");

  useEffect(() => {
    let pollId: number | null = null;
    let startId: number | null = null;
    let endId: number | null = null;
    const isDev = (import.meta as any)?.env?.DEV;

    function clearAll() {
      if (pollId) window.clearInterval(pollId);
      if (startId) window.clearTimeout(startId);
      if (endId) window.clearTimeout(endId);
      pollId = startId = endId = null;
    }

    const pad = (n: number) => String(n).padStart(2, "0");

    function easternOffsetISO(year: number, month: number, day: number): string {
      const utcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const tzName = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        timeZoneName: "short",
      }).format(utcNoon);
      const isEDT = /EDT|GMT-4/i.test(tzName);
      return isEDT ? "-04:00" : "-05:00";
    }

    function parseDateFlexible(raw?: string): Date | null {
      if (!raw) return null;
      const s = raw.trim();

      if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
        const d = new Date(s);
        return isNaN(+d) ? null : d;
      }

      const m = s.match(
        /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?(?:\s*(EST|EDT))?$/i
      );
      if (!m) return null;

      const [, mmS, ddS, yyyyS, hhS, minS, ampmS, tzS] = m;
      const mm = Number(mmS), dd = Number(ddS), yyyy = Number(yyyyS);

      let hh = 0, minute = 0;
      if (hhS && minS) {
        hh = Number(hhS) % 12;
        minute = Number(minS);
        if ((ampmS || "").toUpperCase() === "PM") hh += 12;
      }

      let offset = easternOffsetISO(yyyy, mm, dd);
      if ((tzS || "").toUpperCase() === "EST") offset = "-05:00";
      if ((tzS || "").toUpperCase() === "EDT") offset = "-04:00";

      const iso = `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${pad(minute)}:00${offset}`;
      const d = new Date(iso);
      return isNaN(+d) ? null : d;
    }

    function applyFromSource(source: any) {
      const message = (source?.message || "").trim();
      const toneIn = (source?.tone || "info") as "warning" | "info" | "success" | "danger";
      const startAt = parseDateFlexible(source?.start_at);
      const endAt = parseDateFlexible(source?.end_at);

      const now = new Date();
      const showNow = !!message && (!startAt || now >= startAt) && (!endAt || now < endAt);

      if (isDev) console.debug("[banner]", { now, startAt, endAt, showNow, message, toneIn });

      if (showNow) {
        setMsg(message);
        setTone(toneIn);
      } else {
        setMsg(null);
      }

      if (startAt && now < startAt) {
        startId = window.setTimeout(() => applyFromSource(source), startAt.getTime() - now.getTime());
      }
      if (endAt && now < endAt) {
        endId = window.setTimeout(() => setMsg(null), endAt.getTime() - now.getTime());
      }
    }

    async function load() {
      clearAll();
      try {
        const r = await fetch("/assets/banner.json", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j && j.message && String(j.message).trim()) {
            applyFromSource(j);
          } else {
            setMsg(null);
          }
        } else {
          if (isDev) console.warn("[banner] fetch not ok:", r.status);
          setMsg(null);
        }
      } catch (e) {
        if (isDev) console.warn("[banner] fetch error:", e);
        setMsg(null);
      }
    }

    load();
    pollId = window.setInterval(load, 5 * 60 * 1000);
    return () => clearAll();
  }, []);

  const toneClass =
    tone === "warning"
      ? "bg-yellow-100 text-yellow-900 border-yellow-300"
      : tone === "success"
      ? "bg-green-100 text-green-900 border-green-300"
      : tone === "danger"
      ? "bg-red-100 text-red-900 border-red-300"
      : "bg-blue-100 text-blue-900 border-blue-300";

  return { msg, toneClass };
}

function SiteBanner() {
  const { msg, toneClass } = useBanner();
  if (!msg) return null;
  return <div className={`w-full border ${toneClass} text-center text-lg py-2`}>{msg}</div>;
}

/* ---------------- Translate popover (shared for desktop+mobile) --------------- */
// Singleton loader so we only add the script once
let gteReady: Promise<void> | null = null;
function ensureGoogleTranslate(): Promise<void> {
  if (gteReady) return gteReady;
  gteReady = new Promise<void>((resolve) => {
    // If already on page, resolve immediately
    const g = (window as any).google;
    if (g?.translate?.TranslateElement) return resolve();

    // Create cb that resolves when Google calls it
    (window as any).googleTranslateElementInit = () => {
      const g2 = (window as any).google;
      if (g2?.translate?.TranslateElement) resolve();
    };

    // Inject script once
    if (!document.querySelector<HTMLScriptElement>("#gt-script")) {
      const s = document.createElement("script");
      s.id = "gt-script";
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.defer = true;
      document.body.appendChild(s);
    }
  });
  return gteReady;
}

function TranslatePopover({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const poweredSlotRef = useRef<HTMLSpanElement>(null);

  // Position under the trigger, responsive width
  const style = React.useMemo(() => {
    const a = anchorRef.current;
    if (!a) return {};
    const r = a.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const width = Math.min(vw * 0.92, 460);
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, vw - width - 8));
    return { width: `${width}px`, left, top: r.bottom + 8 } as React.CSSProperties;
  }, [open, anchorRef]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Mount (and re-mount) the widget every time the popover opens
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let retries = 0;
    let retryId: number | null = null;
    let mo: MutationObserver | null = null;

    const mount = () => {
      if (cancelled) return;
      const g = (window as any).google;
      if (!g?.translate?.TranslateElement) {
        // Try again shortly (Google script still initializing)
        if (retries++ < 12) retryId = window.setTimeout(mount, 250);
        return;
      }

      // Clear old widget & mount fresh
      const host = document.getElementById("gt-container");
      if (host) host.innerHTML = "";

      // eslint-disable-next-line no-new
      new g.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: g.translate.TranslateElement.InlineLayout.VERTICAL,
          autoDisplay: false,
        },
        "gt-container"
      );

      // Observe until the <select> appears, then style + move brand
      mo = new MutationObserver(() => {
        const sel = document.querySelector<HTMLSelectElement>("#gt-container select.goog-te-combo");
        if (sel) {
          // Force visible styling (works even if site CSS loads late)
          sel.style.display = "block";
          sel.style.width = "100%";
          sel.style.border = "1px solid rgb(203 213 225)";
          sel.style.borderRadius = "6px";
          sel.style.padding = "8px";
          sel.style.fontSize = "14px";
          sel.style.color = "rgb(30 41 59)";
          sel.style.background = "#fff";

          const brand = document.querySelector(".goog-logo-link") as HTMLElement | null;
          if (brand && poweredSlotRef.current) poweredSlotRef.current.innerHTML = brand.outerHTML;

          mo?.disconnect();
          mo = null;
        }
      });
      if (host) mo.observe(host, { subtree: true, childList: true });
    };

    ensureGoogleTranslate().then(mount);

    return () => {
      cancelled = true;
      if (retryId) window.clearTimeout(retryId);
      mo?.disconnect();
    };
  }, [open]);

  return (
    <div
      id="translate-pop"
      role="dialog"
      aria-modal="true"
      className={`fixed z-[100] rounded-md border border-slate-300 bg-white shadow-xl ${open ? "block" : "hidden"}`}
      style={style}
    >
      {/* Close bar */}
      <button
        type="button"
        onClick={onClose}
        className="w-full bg-[#f4f4f4] border-0 text-[14px] py-1.5 cursor-pointer text-center hover:bg-[#ececec] focus:outline-none focus:ring-2 focus:ring-blue-600"
        aria-label="Close language selection"
      >
        CLOSE
      </button>

      <div className="p-3 space-y-3">
        {/* Small placeholder so the box never looks empty while loading */}
        <div id="gt-container" className="gt-popover min-h-[40px]">
          <div className="text-[12px] text-slate-500" aria-live="polite">Loading languages…</div>
        </div>

        <div className="flex items-center justify-end">
          <span ref={poweredSlotRef} id="gt-powered-slot" className="text-[11px] text-slate-500" />
        </div>

        <div className="text-[12px] text-slate-700 leading-snug">
          The State of NJ site may contain optional links, information, services and/or content from other websites
          operated by third parties that are provided as a convenience, such as Google™ Translate. Google™ Translate is
          an online service for which the user pays nothing to obtain a purported language translation. The user is on
          notice that neither the State of NJ site nor its operators review any of the services, information and/or
          content from anything that may be linked to the State of NJ site for any reason. To the extent Google™
          Translate caches and presents older versions of the State of NJ site content, that is beyond the control of
          the State of NJ site and its operators who accept no responsibility or liability for the outdated translation.
          Any third party link to the State of NJ site can be used at the user's sole risk. The user is further on
          notice that the State of NJ site and its operators expressly and fully disavow and disclaim any responsibility
          or liability in respect of any cause, claim, consequential or direct damage or loss, however described, arising
          from the use of Google™ Translate or any other service, content or information linked to the State of NJ site.
          The State of NJ site is provided 'AS-IS' with no warranties, express or implied, and its use confers no
          privileges or rights. Links to third party services, information and/or content is in no way an affiliation,
          endorsement, support or approval of the third party.
        </div>
      </div>
    </div>
  );
}


/* ---------------- Active top item helper ---------------- */
function useActiveTopLabel() {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const top = NAV.find((n) =>
      n.href
        ? path.startsWith(n.href.toLowerCase())
        : n.children?.some((c) => !("children" in c) && path.startsWith(((c as NavLeaf).href || "").toLowerCase()))
    );
    setActive(top?.label || null);
  }, []);
  return active;
}

/* ---------------- Desktop nav item (hover intent + brighter hover) ---------------- */
function NavItem({ item }: { item: NavNode }) {
  const hasChildren = !!item.children?.length;
  const [open, setOpen] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const activeTop = useActiveTopLabel();
  const isActive = activeTop === item.label;

  function armOpen(delay = 120) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), delay);
  }
  function armClose(delay = 180) {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), delay);
  }

  return (
    <li className="relative" onMouseEnter={() => armOpen(120)} onMouseLeave={() => armClose(200)}>
      <a
        href={item.href || "#"}
        className={[
          "px-4 py-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
          // default look
          `${TOP_HOVER_BG} ${TOP_HOVER_TEXT} text-slate-900`,
          // if it's a parent AND open/active: solid highlight
          hasChildren && (open || isActive) ? `${TOP_ACTIVE_BG} ${TOP_ACTIVE_TEXT}` : "",
          // if it's an active leaf (no children), also highlight
          !hasChildren && isActive ? `${TOP_ACTIVE_BG} ${TOP_ACTIVE_TEXT}` : ""
        ].join(" ")}
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={[
              "inline size-4 ml-1 transition-colors",
              open || isActive ? "text-white" : "text-slate-500"
            ].join(" ")}
            aria-hidden
          />
        )}
      </a>

      {hasChildren && open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-40">
          <ul
            className="min-w-[26rem] rounded-md border border-slate-200 bg-white p-2 shadow-2xl nav-dropdown"
            onMouseEnter={() => armOpen(0)}
            onMouseLeave={() => armClose(160)}
          >
            {item.children!.map((child) =>
              isGroup(child) ? (
                <li key={child.label} className="relative group">
                  {/* not bold now */}
                  <div className="group-header flex items-center justify-between rounded-md px-3 py-2 hover:bg-[#e3ecff] text-slate-900 text-[16px] font-normal">
                    <span>{child.label}</span>
                    <ChevronRight className="size-4 text-slate-400" aria-hidden />
                  </div>

                  {/* level-2 flyout — butt edges so the cursor never crosses a gap */}
                  <ul
                    className="absolute top-0 left-[calc(100%-1px)] min-w-[20rem] rounded-md border border-slate-200 bg-white p-2 shadow-2xl hidden group-hover:block"
                    onMouseEnter={() => armOpen(0)}
                    onMouseLeave={() => armClose(160)}
                  >
                    {child.children!.map((leaf) => (
                      <li key={leaf.label}>
                        <a
                          href={leaf.href}
                          target={leaf.target}
                          className="block rounded-md px-3 py-2 text-[16px] text-slate-900 hover:bg-[#e3ecff] hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          {leaf.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={child.label}>
                  <a
                    href={child.href}
                    target={child.target}
                    className="block rounded-md px-3 py-2 text-[16px] text-slate-900 hover:bg-[#dbe5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {child.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </li>
  );
}

/* ---------------- Mobile item (accordion; closed by default) ---------------- */
function MobileItem({ item }: { item: NavNode }) {
  const [open, setOpen] = useState<boolean>(false);
  const hasChildren = !!item.children?.length;

   // match active section like desktop
  const activeTop = useActiveTopLabel();
  const isActive = activeTop === item.label;

  return (
    <div className="px-1">
      <button
        className={[
          "w-full flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
          open || isActive ? `${TOP_ACTIVE_BG} ${TOP_ACTIVE_TEXT}` : "text-slate-900"
        ].join(" ")}
        onClick={() => (hasChildren ? setOpen((v) => !v) : (window.location.href = item.href || "#"))}
        aria-expanded={open}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="font-medium">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""} ${
              open || isActive ? "text-white" : "text-slate-500"
            }`}
            aria-hidden
          />
        )}
      </button>

      {/* Only render second level when open */}
      {hasChildren && open && (
        <ul className="ml-2 mt-1 space-y-1">
          {item.children!.map((child) =>
            isGroup(child) ? (
<li key={child.label} className="rounded-md bg-[#eef3ff]">
  <button
    className="w-full flex items-center justify-between px-3 py-2 text-[16px]"
    onClick={(e) => {
      e.preventDefault();
      const next = (e.currentTarget as HTMLButtonElement).nextElementSibling as HTMLElement | null;
      if (next) next.classList.toggle("hidden");
      e.currentTarget.querySelector("svg")?.classList.toggle("rotate-180");
    }}
    aria-expanded={false}
  >
    <span>{child.label}</span>
    <ChevronDown className="size-4 transition-transform" />
  </button>

  {/* REMOVE the border-left here */}
  <ul className="mb-2 pl-0 pt-1 hidden">
    {child.children!.map((leaf) => (
      <li key={leaf.label}>
        <a
          href={leaf.href}
          target={leaf.target}
          className="block rounded-md px-3 py-2 text-[16px] text-slate-900 hover:bg-[#e3ecff] hover:text-blue-900 hover:border-l-2 hover:border-blue-600"
        >
          {leaf.label}
        </a>
      </li>
    ))}
  </ul>
</li>

            ) : (
              <li key={child.label}>
                <a
                  href={child.href}
                  target={child.target}
                  className="block rounded-md px-3 py-2 text-[16px] text-slate-900 hover:bg-[#dbe5f9] ont-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {child.label}
                </a>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

/* ---------- helper: which anchor (desktop/mobile) to use ---------- */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

/* =========================
   Header (export)
   ========================= */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const desktopTranslateBtnRef = useRef<HTMLButtonElement>(null);
  const mobileTranslateBtnRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  // Close translate on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const pop = document.getElementById("translate-pop");
      const t = e.target as Node;
      const wasInside =
        (pop && pop.contains(t)) ||
        desktopTranslateBtnRef.current?.contains(t) ||
        mobileTranslateBtnRef.current?.contains(t);
      if (!wasInside) setTranslateOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="w-full">
      {/* VERY TOP: persistent banner */}
      <SiteBanner />

      {/* Logo + right-links */}
      <div className="bg-white">
        <div className="max-w-[120rem] mx-auto px-4 py-1 flex items-start justify-between">
          {/* HESAA logo */}
          <a href="/" aria-label="HESAA Home" className="pt-1">
            <img
              src="/assets/logo.gif"
              alt="Higher Education Student Assistance Authority"
              width={254}
              height={112}
              className="h-[84px] w-auto md:h-[96px] lg:h-[112px]"
            />
          </a>

          {/* Right block */}
          <div className="hidden md:grid grid-cols-[34px_auto] grid-rows-2 gap-x-3 items-start text-[13px] leading-5 mt-[2px] text-right">
            {/* NJ seal 34x34 spanning rows 1-2 */}
            <img
              src="/assets/NJLogo_small.gif"
              alt="State of New Jersey"
              className="row-span-2 h-[34px] w-[34px] object-contain justify-self-start"
            />

            {/* Row 1 */}
            <div className="font-semibold text-blue-700">
              Governor Philip D. Murphy <span className="mx-1 text-slate-500">•</span> Lt. Governor Tahesha L. Way
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center justify-end gap-x-2 text-blue-700">
              <a className="hover:underline" href="https://www.nj.gov/">
                NJ Home
              </a>
              <span className="text-slate-400">|</span>
              <a className="hover:underline" href="https://nj.gov/services/">
                Services A to Z
              </a>
              <span className="text-slate-400">|</span>
              <a className="hover:underline" href="https://nj.gov/nj/deptserv/">
                Departments/Agencies
              </a>
              <span className="text-slate-400">|</span>
              <a className="hover:underline" href="https://www.nj.gov/faqs/">
                NJ Gov FAQs
              </a>
            </div>

            {/* Tools row */}
            <div className="col-span-2 mt-1 flex items-center justify-end gap-3">
              <button
                ref={desktopTranslateBtnRef}
                type="button"
                aria-expanded={translateOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setTranslateOpen((v) => !v);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-[6px] text-slate-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Globe className="size-4" />
                Translate
                <ChevronDown className="size-4" />
              </button>

              <label className="relative">
                <span className="sr-only">Search</span>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-60 rounded-full border border-slate-300 py-1.5 pl-9 pr-3 text-[13px] placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
                />
                <Search className="absolute left-2.5 top-1.5 size-4 text-slate-400" aria-hidden="true" />
              </label>
            </div>
          </div>

          {/* Mobile hamburger (label under) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-panel"
            className="md:hidden inline-flex flex-col items-center justify-center rounded-lg px-3 py-2 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Menu className="size-6" aria-hidden />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Main nav row */}
      <div className="w-full border-t border-slate-200 mt-3" style={{ backgroundColor: "#dbe5f9" }}>
        <div className="max-w-[120rem] mx-auto px-4">
          <nav aria-label="Primary" className="hidden md:flex items-stretch justify-center gap-2 py-3">
            <ul className="flex items-center gap-2 text-[18px] font-medium">
              {NAV.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </ul>
          </nav>
        </div>

        {/* Mobile panel */}
        <div id="mobile-panel" className={`md:hidden ${menuOpen ? "block" : "hidden"}`}>
          <div className="px-4 pb-4 space-y-2">
            <div className="pt-3 pb-2 flex items-center gap-2">
              <button
                ref={mobileTranslateBtnRef}
                onClick={() => setTranslateOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-black/25 px-3 py-2 text-slate-900 bg-white/80"
              >
                <Globe className="size-4" />
                Translate
              </button>
              <label className="relative flex-1">
                <span className="sr-only">Search</span>
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-full border border-black/25 py-2 pl-9 pr-3 text-[13px] placeholder:text-black/50 text-slate-900 bg-white/80"
                />
                <Search className="absolute left-2.5 top-2.5 size-4 text-black/40" aria-hidden="true" />
              </label>
            </div>

            <div className="border-t border-slate-200" />

            {NAV.map((item) => (
              <MobileItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Shared translate popover (centered under whichever button is active) */}
      <TranslatePopover
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        anchorRef={useIsMobile() ? mobileTranslateBtnRef : desktopTranslateBtnRef}
      />
    </header>
  );
}
