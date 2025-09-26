import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";

/* =========================
   Dark palette / tokens
   ========================= */
const NAV_ROW_BG = "bg-[#0d132d]";
const TOP_TEXT_BASE = "text-white";
const TOP_HOVER_BG = "hover:bg-[#182244]";
const TOP_ACTIVE_BG = "bg-[#0b5fad]";
const TOP_ACTIVE_TEXT = "text-white";
const RING_OFFSET_ON_BAR = "focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]";

const SUBMENU_BG = "bg-white";
const SUBMENU_BORDER = "border border-slate-200";
const SUBMENU_ITEM_TEXT = "text-slate-900";
const SUBMENU_ITEM_HOVER_BG = "hover:bg-[#e6efff]";
const SUBMENU_ITEM_HOVER_TX = "hover:text-blue-900";
const SUBMENU_ITEM_FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

// Mobile panel palette
const MOBILE_PANEL_BG = "bg-[#0d132d] text-white";

const CURR_PATH =
  typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";

/* uid */
function useUID(prefix: string) {
  const [id] = React.useState(
    () => `${prefix}-${Math.random().toString(36).slice(2, 8)}`
  );
  return id;
}

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
   Persistent banner
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
      const utcNoon = new Date(Date.UTC(year, month - 1, day, 12));
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
      const m = s.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?(?:\s*(EST|EDT))?$/i);
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
      const iso = `${yyyy}-${pad(mm)}-${pad(dd)}T${String(hh).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00${offset}`;
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

      setMsg(showNow ? message : null);
      setTone(toneIn);

      if (startAt && now < startAt) {
        window.setTimeout(() => applyFromSource(source), startAt.getTime() - now.getTime());
      }
      if (endAt && now < endAt) {
        window.setTimeout(() => setMsg(null), endAt.getTime() - now.getTime());
      }
    }

    async function load() {
      clearAll();
      try {
        const r = await fetch("/assets/banner.json", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j && j.message && String(j.message).trim()) applyFromSource(j);
          else setMsg(null);
        } else setMsg(null);
      } catch {
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
  return (
    <div className={`w-full border ${toneClass} text-center text-lg py-2`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}

/* ---------------- Translate popover (shared for desktop+mobile) --------------- */
let gteReady: Promise<void> | null = null;
function ensureGoogleTranslate(): Promise<void> {
  if (gteReady) return gteReady;
  gteReady = new Promise<void>((resolve) => {
    const g = (window as any).google;
    if (g?.translate?.TranslateElement) return resolve();
    (window as any).googleTranslateElementInit = () => {
      const g2 = (window as any).google;
      if (g2?.translate?.TranslateElement) resolve();
    };
    if (!document.querySelector<HTMLScriptElement>("#gt-script")) {
      const s = document.createElement("script");
      s.id = "gt-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
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
  const popRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    lastTrigger.current = (anchorRef.current as HTMLElement) || null;
    const firstFocusable =
      popRef.current?.querySelector<HTMLElement>(
        "button, [href], select, input, textarea, [tabindex]:not([tabindex='-1'])"
      ) || null;
    const id = requestAnimationFrame(() => firstFocusable?.focus());
    return () => {
      cancelAnimationFrame(id);
      lastTrigger.current?.focus();
    };
  }, [open, anchorRef]);

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
        if (retries++ < 12) retryId = window.setTimeout(mount, 250);
        return;
      }
      const host = document.getElementById("gt-container");
      if (host) host.innerHTML = "";
      // eslint-disable-next-line no-new
      new g.translate.TranslateElement(
        { pageLanguage: "en", layout: g.translate.TranslateElement.InlineLayout.VERTICAL, autoDisplay: false },
        "gt-container"
      );
      mo = new MutationObserver(() => {
        const sel = document.querySelector<HTMLSelectElement>("#gt-container select.goog-te-combo");
        if (sel) {
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
      ref={popRef}
      id="translate-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="translate-pop-title"
      className={`fixed z-[100] rounded-md border border-slate-300 bg-white shadow-xl ${open ? "block" : "hidden"}`}
      style={style}
    >
      <h2 id="translate-pop-title" className="sr-only">Language selection</h2>

      <button
        type="button"
        onClick={onClose}
        className="w-full bg-[#f4f4f4] border-0 text-[14px] py-1.5 cursor-pointer text-center hover:bg-[#ececec] focus:outline-none focus:ring-2 focus:ring-blue-600"
        aria-label="Close language selection"
      >
        CLOSE
      </button>

      <div className="p-3 space-y-3">
        <div id="gt-container" className="gt-popover min-h-[40px]">
          <div className="text-[12px] text-slate-500" aria-live="polite">Loading languages…</div>
        </div>
        <div className="flex items-center justify-end">
          <span ref={poweredSlotRef} id="gt-powered-slot" className="text-[11px] text-slate-500" />
        </div>
        <div className="text-[12px] text-slate-700 leading-snug">
          The State of NJ site may contain optional links, information, services and/or content from other websites operated by third parties that are provided as a convenience, such as Google™ Translate. Google™ Translate is an online service for which the user pays nothing to obtain a purported language translation. The user is on notice that neither the State of NJ site nor its operators review any of the services, information and/or content from anything that may be linked to the State of NJ site for any reason. To the extent Google™ Translate caches and presents older versions of the State of NJ site content, that is beyond the control of the State of NJ site and its operators who accept no responsibility or liability for the outdated translation. Any third party link to the State of NJ site can be used at the user's sole risk. The user is further on notice that the State of NJ site and its operators expressly and fully disavow and disclaim any responsibility or liability in respect of any cause, claim, consequential or direct damage or loss, however described, arising from the use of Google™ Translate or any other service, content or information linked to the State of NJ site. The State of NJ site is provided 'AS-IS' with no warranties, express or implied, and its use confers no privileges or rights. Links to third party services, information and/or content is in no way an affiliation, endorsement, support or approval of the third party.
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

/* ---------------- Desktop nav item (fixed keyboard focus) ---------------- */
function NavItem({ item }: { item: NavNode }) {
  const hasChildren = !!item.children?.length;

  const [open, setOpen] = useState(false);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const submenuId = useUID(`submenu-${item.label.replace(/\s+/g, "-").toLowerCase()}`);

  const activeTop = useActiveTopLabel();
  const isActive = activeTop === item.label;

  function armOpen(delay = 120) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), delay);
  }
  function armClose(delay = 250) {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), delay);
  }

  const onBlurWithin = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const current = e.currentTarget as HTMLElement;
    const moveHoriz = (dir: -1 | 1) => {
      const menubar = current.closest("[role='menubar']");
      if (!menubar) return;
      const all = Array.from(menubar.querySelectorAll<HTMLElement>("[role='menuitem']"));
      const i = all.indexOf(current);
      const next = all[(i + dir + all.length) % all.length];
      next?.focus();
    };

    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => {
          const first = document.querySelector<HTMLElement>(`#${submenuId} a, #${submenuId} button`);
          first?.focus();
        });
        break;
      case "ArrowUp":
        if (hasChildren && open) {
          e.preventDefault();
          const items = Array.from(document.querySelectorAll<HTMLElement>(`#${submenuId} a, #${submenuId} button`));
          items[items.length - 1]?.focus();
        }
        break;
      case "ArrowRight":
        e.preventDefault(); moveHoriz(1); break;
      case "ArrowLeft":
        e.preventDefault(); moveHoriz(-1); break;
      case "Escape":
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  return (
    <li
      ref={rootRef}
      role="none"
      className="relative"
      onMouseEnter={() => armOpen(120)}
      onMouseLeave={() => armClose(200)}
      onBlur={onBlurWithin}
    >
      {hasChildren ? (
        <button
          ref={triggerRef}
          type="button"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={submenuId}
          onFocus={() => armOpen(0)}
          onKeyDown={onKeyDown}
          className={[
            "px-3 xl:px-4 py-2 rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            RING_OFFSET_ON_BAR,
            "whitespace-nowrap lg:text-[16px] xl:text-[18px]",
            "font-semibold",
            TOP_TEXT_BASE,
            TOP_HOVER_BG,
            (open || isActive) ? `${TOP_ACTIVE_BG} ${TOP_ACTIVE_TEXT}` : ""
          ].join(" ")}
          style={{ fontWeight: 600 }}
        >
          <span className="font-semibold" style={{ fontWeight: 600 }}>{item.label}</span>
          <ChevronDown
            className={`inline size-4 ml-1 transition-colors ${open || isActive ? "text-white" : "text-white/80"}`}
            aria-hidden
          />
        </button>
      ) : (
        <a
          role="menuitem"
          href={item.href || "#"}
          className={[
            "px-3 xl:px-4 py-2 rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            RING_OFFSET_ON_BAR,
            "whitespace-nowrap lg:text-[16px] xl:text-[18px]",
            "font-semibold",
            TOP_TEXT_BASE,
            TOP_HOVER_BG,
            isActive ? `${TOP_ACTIVE_BG} ${TOP_ACTIVE_TEXT}` : ""
          ].join(" ")}
          style={{ fontWeight: 600 }}
          aria-current={isActive ? "page" : undefined}
        >
          <span className="font-semibold" style={{ fontWeight: 600 }}>{item.label}</span>
        </a>
      )}

      {hasChildren && open && (
        <ul
          id={submenuId}
          role="menu"
          aria-label={`${item.label} submenu`}
          className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[26rem] rounded-md ${SUBMENU_BORDER} ${SUBMENU_BG} p-2 shadow-2xl z-40 nav-dropdown`}
          onFocus={() => setOpen(true)}
          onBlur={onBlurWithin}
          onMouseEnter={() => armOpen(0)}
          onMouseLeave={() => armClose(200)}
          onKeyDown={(e) => {
            const list = e.currentTarget as HTMLElement;
            const items = Array.from(
              list.querySelectorAll<HTMLElement>('a[role="menuitem"],button[role="menuitem"]')
            );
            const active = document.activeElement as HTMLElement | null;
            const i = active ? items.indexOf(active) : -1;

            const focusAt = (idx: number) => items[idx]?.focus();

            switch (e.key) {
              case "ArrowDown":
                e.preventDefault();
                focusAt(i < 0 ? 0 : (i + 1) % items.length);
                break;
              case "ArrowUp":
                e.preventDefault();
                focusAt(i < 0 ? items.length - 1 : (i - 1 + items.length) % items.length);
                break;
              case "Home":
                e.preventDefault();
                focusAt(0);
                break;
              case "End":
                e.preventDefault();
                focusAt(items.length - 1);
                break;
              case "Escape":
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                break;
              case "ArrowLeft": {
                e.preventDefault();
                const menubar = list.closest('[role="menubar"]');
                if (!menubar) return;
                const tops = Array.from(menubar.querySelectorAll<HTMLElement>('[role="menuitem"]'));
                const currentTop = triggerRef.current;
                const ti = currentTop ? tops.indexOf(currentTop) : -1;
                const prev = tops[(ti - 1 + tops.length) % tops.length];
                setOpen(false);
                prev?.focus();
                break;
              }
              case "ArrowRight": {
                e.preventDefault();
                const menubar = list.closest('[role="menubar"]');
                if (!menubar) return;
                const tops = Array.from(menubar.querySelectorAll<HTMLElement>('[role="menuitem"]'));
                const currentTop = triggerRef.current;
                const ti = currentTop ? tops.indexOf(currentTop) : -1;
                const next = tops[(ti + 1) % tops.length];
                setOpen(false);
                next?.focus();
                break;
              }
            }
          }}
        >
          <div className="pointer-events-auto absolute -top-2 left-0 right-0 h-2" />
          {item.children!.map((child) =>
            isGroup(child) ? (
              <li key={child.label} role="none" className="relative group">
                <button
                  type="button"
                  className={[
                    "group-header w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-[16px]",
                    SUBMENU_ITEM_TEXT,
                    SUBMENU_ITEM_HOVER_BG,
                    SUBMENU_ITEM_HOVER_TX,
                    SUBMENU_ITEM_FOCUS
                  ].join(" ")}
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded="false"
                  tabIndex={-1}
                 onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();

                    // find this item's submenu, then its first focusable menuitem
                    const parent = (e.currentTarget as HTMLElement).parentElement as HTMLElement | null;
                    const submenu = parent?.querySelector('ul[role="menu"]') as HTMLElement | null;
                    const first = submenu?.querySelector<HTMLElement>('[role="menuitem"]');

                    first?.focus();
                  }

                  if (e.key === "ArrowLeft") {
                    e.preventDefault();

                    // Return focus to the parent trigger (button or link)
                    const parent = (e.currentTarget as HTMLElement).parentElement as HTMLElement | null;
                    const trigger =
                      parent?.querySelector<HTMLElement>('button[role="menuitem"], a[role="menuitem"]') ??
                      (e.currentTarget as HTMLElement).closest<HTMLElement>('button[role="menuitem"], a[role="menuitem"]');

                    trigger?.focus();
                  }

                }}
                >
                  <span className="flex-1">{child.label}</span>
                  <ChevronRight className="ml-2 size-4 shrink-0 text-slate-400 group-hover:text-blue-700" aria-hidden="true" />
                </button>

                <ul
                  role="menu"
                  aria-label={`${child.label} submenu`}
                  className={`absolute top-0 left-full min-w-[20rem] rounded-md ${SUBMENU_BORDER} ${SUBMENU_BG} p-2 shadow-2xl hidden group-hover:block group-focus-within:block`}
                  onFocus={() => setOpen(true)}
                >
                  <div className="pointer-events-auto absolute -left-2 top-0 h-full w-2" />
                  {child.children!.map((leaf) => (
                    <li key={leaf.label} role="none">
                      <a
                        role="menuitem"
                        href={leaf.href}
                        target={leaf.target}
                        rel={leaf.target === "_blank" ? "noopener noreferrer" : undefined}
                        aria-label={leaf.target === "_blank" ? `${leaf.label} (opens in a new tab)` : undefined}
                        aria-current={
                          CURR_PATH && (leaf.href || "").toLowerCase() &&
                          CURR_PATH.startsWith((leaf.href || "").toLowerCase())
                            ? "page" : undefined
                        }
                        className={[
                          "block rounded-md px-3 py-2 text-[16px]",
                          SUBMENU_ITEM_TEXT,
                          SUBMENU_ITEM_HOVER_BG,
                          SUBMENU_ITEM_HOVER_TX,
                          SUBMENU_ITEM_FOCUS
                        ].join(" ")}
                        tabIndex={-1}
                      >
                        {leaf.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={child.label} role="none">
                <a
                  role="menuitem"
                  href={child.href}
                  target={child.target}
                  rel={child.target === "_blank" ? "noopener noreferrer" : undefined}
                  aria-label={child.target === "_blank" ? `${child.label} (opens in a new tab)` : undefined}
                  aria-current={
                    CURR_PATH && (child.href || "").toLowerCase() &&
                    CURR_PATH.startsWith((child.href || "").toLowerCase())
                      ? "page" : undefined
                  }
                  className={[
                    "block rounded-md px-3 py-2 text-[16px]",
                    SUBMENU_ITEM_TEXT,
                    SUBMENU_ITEM_HOVER_BG,
                    SUBMENU_ITEM_HOVER_TX,
                    SUBMENU_ITEM_FOCUS
                  ].join(" ")}
                  tabIndex={-1}
                >
                  {child.label}
                </a>
              </li>
            )
          )}
        </ul>
      )}
    </li>
  );
}

/* ---------------- Mobile group + item ---------------- */
function MobileGroup({ group }: { group: NavGroup }) {
  const [gOpen, setGOpen] = useState(false);
  const panelId = useUID(`m-sub-${group.label.replace(/\s+/g, "-").toLowerCase()}`);

  return (
    <li className="rounded-md" role="none">
      <button
        className={[
          "w-full flex items-center justify-between px-3 py-2 text-[16px] rounded-md",
          "text-white/95 hover:bg-white/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
        ].join(" ")}
        onClick={(e) => { e.preventDefault(); setGOpen(v => !v); }}
        aria-expanded={gOpen}
        aria-controls={panelId}
        aria-haspopup="true"
      >
        <span>{group.label}</span>
        <ChevronDown className={`size-4 transition-transform ${gOpen ? "rotate-180" : ""} text-white/80`} aria-hidden />
      </button>

      <ul id={panelId} role="menu" className={`mt-1 rounded-md bg-[#111b39] ${gOpen ? "block" : "hidden"}`}>
        {group.children!.map((leaf) => (
          <li key={leaf.label} role="none">
            <a
              role="menuitem"
              href={leaf.href}
              target={leaf.target}
              rel={leaf.target === "_blank" ? "noopener noreferrer" : undefined}
              aria-label={leaf.target === "_blank" ? `${leaf.label} (opens in a new tab)` : undefined}
              aria-current={
                CURR_PATH && (leaf.href || "").toLowerCase() &&
                CURR_PATH.startsWith((leaf.href || "").toLowerCase())
                  ? "page" : undefined
              }
              className={[
                "block rounded-md px-3 py-2 text-[16px]",
                "text-white/95 hover:bg-white/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[#111b39]"
              ].join(" ")}
            >
              {leaf.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

function MobileItem({ item }: { item: NavNode }) {
  const [open, setOpen] = useState<boolean>(false);
  const hasChildren = !!item.children?.length;
  const activeTop = useActiveTopLabel();
  const isActive = activeTop === item.label;

  if (!hasChildren) {
    // SEO: use a real link when there's no submenu
    return (
      <div className="px-1" role="none">
        <a
          href={item.href || "#"}
          className={[
            "w-full block rounded-md px-3 py-2 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]",
            isActive ? "bg-[#0b5fad] text-white" : "text-white/95 hover:bg-white/10"
          ].join(" ")}
          aria-current={isActive ? "page" : undefined}
          role="menuitem"
        >
          <span className="font-medium">{item.label}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="px-1" role="none">
      <button
        className={[
          "w-full flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]",
          open || isActive ? "bg-[#0b5fad] text-white" : "text-white/95 hover:bg-white/10"
        ].join(" ")}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        role="menuitem"
        aria-current={isActive ? "page" : undefined}
      >
        <span className="font-medium">{item.label}</span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""} ${open || isActive ? "text-white" : "text-white/80"}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="ml-2 mt-1 space-y-1" role="menu" aria-label={`${item.label} submenu`}>
          {item.children!.map((child) =>
            isGroup(child) ? (
              <MobileGroup key={child.label} group={child} />
            ) : (
              <li key={child.label} role="none">
                <a
                  role="menuitem"
                  href={child.href}
                  target={child.target}
                  rel={child.target === "_blank" ? "noopener noreferrer" : undefined}
                  aria-label={child.target === "_blank" ? `${child.label} (opens in a new tab)` : undefined}
                  aria-current={
                    CURR_PATH && (child.href || "").toLowerCase() &&
                    CURR_PATH.startsWith((child.href || "").toLowerCase())
                      ? "page" : undefined
                  }
                  className={[
                    "block rounded-md px-3 py-2 text-[16px]",
                    "text-white/95 hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d132d]"
                  ].join(" ")}
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
    <header id="top" className="w-full">
      {/* A11y: skip link to main landmark */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-blue-700 focus:px-3 focus:py-2 focus:rounded-md">
        Skip to main content
      </a>

      <SiteBanner />

      {/* Logo + right-links */}
      <div className="bg-white">
        <div className="max-w-[120rem] mx-auto px-4 py-1 flex items-start justify-between">
          <a href="/" aria-label="HESAA Home" className="pt-1">
            <img
              src="/assets/logo.gif"
              alt="Higher Education Student Assistance Authority"
              width={254}
              height={112}
              className="h-[84px] w-auto md:h-[96px] lg:h-[112px]"
            />
          </a>

          {/* Right block (DESKTOP) */}
          <div className="hidden md:grid grid-cols-[34px_auto] grid-rows-2 gap-x-3 items-start text-[13px] leading-5 mt-[2px] text-right">
            <img
              src="/assets/NJLogo_small.gif"
              alt="State of New Jersey"
              width={34}
              height={34}
              decoding="async"
              className="row-span-2 h-[34px] w-[34px] object-contain justify-self-start"
            />

            {/* Row 1 */}
            <div className="font-semibold text-blue-700">
              <a
                href="https://nj.gov/governor/"
                className="hover:underline"
                rel="noopener noreferrer"
                aria-label="New Jersey Governor, Philip D. Murphy — official website"
              >
                Governor Philip D. Murphy
              </a>
              <span className="mx-1 text-slate-500" aria-hidden>•</span>
              <a
                href="https://nj.gov/governor/admin/lt/"
                className="hover:underline"
                rel="noopener noreferrer"
                aria-label="New Jersey Lieutenant Governor, Tahesha L. Way — official website"
              >
                Lt. Governor Tahesha L. Way
              </a>
            </div>

            {/* Row 2 */}
            <nav
              aria-label="State of New Jersey resources"
              className="flex flex-wrap items-center justify-end gap-x-2 text-blue-700"
            >
              <a className="hover:underline" href="https://www.nj.gov/">NJ Home</a>
              <span className="text-slate-400" aria-hidden>|</span>
              <a className="hover:underline" href="https://nj.gov/services/">Services A to Z</a>
              <span className="text-slate-400" aria-hidden>|</span>
              <a className="hover:underline" href="https://nj.gov/nj/deptserv/">Departments/Agencies</a>
              <span className="text-slate-400" aria-hidden>|</span>
              <a className="hover:underline" href="https://www.nj.gov/faqs/">NJ Gov FAQs</a>
            </nav>

            {/* Desktop tools */}
            <div className="col-span-2 mt-1 flex items-center justify-end gap-3">
              <button
                ref={desktopTranslateBtnRef}
                type="button"
                aria-expanded={translateOpen}
                aria-haspopup="dialog"
                onClick={(e) => {
                  e.stopPropagation();
                  setTranslateOpen((v) => !v);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-[6px] text-slate-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Globe className="size-4" aria-hidden />
                <span>Translate</span>
                <ChevronDown className="size-4" aria-hidden />
              </button>

        <form role="search" aria-label="Site search" action="/search" method="get" className="relative">
          <label htmlFor="site-search" className="sr-only">
            Search the site
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search..."
            autoComplete="off"
            inputMode="search"
            className="w-60 rounded-full border border-slate-300 py-1.5 pl-9 pr-9 text-[13px] 
                      placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
          />
          <svg
            aria-hidden="true"
            className="absolute left-2.5 top-1.5 size-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <button type="submit" className="sr-only">Submit search</button>
        </form>


            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-panel"
            aria-label={menuOpen ? "Close main menu" : "Open main menu"}
            className="lg:hidden inline-flex flex-col items-center justify-center rounded-lg px-3 py-2 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Menu className="size-6" aria-hidden />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Main nav row */}
      <div className={`w-full border-t border-slate-200 mt-3 ${NAV_ROW_BG}`}>
        <div className="max-w-[120rem] mx-auto px-4">
          <nav aria-label="Primary" className="hidden lg:flex items-stretch justify-center gap-2 py-2">
            <ul role="menubar" className="flex items-center gap-2 text-[18px] font-medium">
              {NAV.map((item) => <NavItem key={item.label} item={item} />)}
            </ul>
          </nav>
        </div>

        {/* Mobile panel */}
        <div id="mobile-panel" className={`lg:hidden ${menuOpen ? "block" : "hidden"} ${MOBILE_PANEL_BG}`}>
          <div className="px-4 pb-4 space-y-2">
            {/* Mobile pills */}
            <div className="pt-3 pb-2 flex items-center gap-2">
              <button
                ref={mobileTranslateBtnRef}
                onClick={() => setTranslateOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={translateOpen}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-slate-900 bg-white/90 shadow ring-1 ring-white/10 border border-white/10"
              >
                <Globe className="size-4" aria-hidden />
                <span>Translate</span>
              </button>

        <form
          role="search"
          aria-label="Site search"
          action="/search"
          method="get"
          className="relative flex-1"
        >
          <label className="sr-only" htmlFor="m-site-search">Search the site</label>
          <input
            id="m-site-search"
            name="q"
            type="search"
            placeholder="Search..."
            autoComplete="off"            // ← fixed (was "search")
            enterKeyHint="search"
            className="w-full rounded-full py-2 pl-9 pr-9 text-[16px] leading-6 placeholder:text-black/60 text-slate-900 bg-white/90 shadow ring-1 ring-white/10 border border-white/10"
          />
          <Search className="absolute left-2.5 top-2.5 size-4 text-black/40" aria-hidden="true" />

          {/* Hidden submit so Enter still works, but it cannot receive focus */}
          <input type="submit" hidden tabIndex={-1} aria-hidden="true" />
        </form>

            </div>

            <div className="border-t border-slate-200/30" />
            <ul role="menu" aria-label="Primary mobile">
              {NAV.map((item) => (
                <li key={item.label} role="none">
                  <MobileItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Shared translate popover */}
      <TranslatePopover
        open={translateOpen}
        onClose={() => setTranslateOpen(false)}
        anchorRef={isMobile ? mobileTranslateBtnRef : desktopTranslateBtnRef}
      />
    </header>
  );
}
