/* site behavior */
(function(){
  /* ---------- Utilities ---------- */
  const once = (el, key) => {
    if (!el || el.dataset[key] === '1') return true;
    el.dataset[key] = '1';
    return false;
  };

  function setYear(){
    const year = new Date().getFullYear();
    document.querySelectorAll('#yr').forEach(el => el.textContent = year);
  }

  function isHome(){
    const p = location.pathname.replace(/\/+$/,'') || '/';
    return p === '/' || /\/index\.html?$/i.test(p);
  }

  /* ---------- Nav (hamburger) ---------- */
  function initNav(){
    const btn = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('siteNav');
    if (!btn || !nav || once(btn,'jsbound')) return;

    function toggle(open){
      const willOpen = open ?? nav.getAttribute('data-open') !== 'true';
      nav.setAttribute('data-open', String(willOpen));
      btn.setAttribute('aria-expanded', String(willOpen));
    }
    btn.addEventListener('click', () => toggle());
    nav.addEventListener('click', e => { if (e.target.closest('a')) toggle(false); });
  }

  /* ---------- Search (filters Requests table) ---------- */
  function initSearch(){
    const container = document.querySelector('.search-container');
    const toggleBtn  = document.querySelector('.search-toggle');
    const input      = document.querySelector('.search-box input[type="search"]');
    const btn        = document.querySelector('[data-search-btn]');
    if (!container || !toggleBtn || !input || !btn || once(btn,'jsbound')) return;

    // Toggle popover on mobile
    toggleBtn.addEventListener('click', () => {
      container.classList.toggle('open');
      if (container.classList.contains('open')) input.focus();
    });
    document.addEventListener('click', (e)=>{
      if (!container.contains(e.target) && e.target !== toggleBtn){
        container.classList.remove('open');
      }
    });

    function performSearch(){
      const q = (input.value || '').trim().toLowerCase();
      // If Requests table is on page, filter rows. Else redirect to home with ?q=
      const table = document.querySelector('#requestsTable');
      if (!table){
        const url = new URL('/', location.origin);
        if (q) url.searchParams.set('q', q);
        location.href = url.toString();
        return;
      }
      filterRequestsTable(q);
    }

    btn.addEventListener('click', performSearch);
    input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') performSearch(); });

    // If query param present on home, filter on load
    if (isHome()){
      const urlQ = new URLSearchParams(location.search).get('q') || '';
      if (urlQ) { input.value = urlQ; filterRequestsTable(urlQ.toLowerCase()); }
    }
  }

  /* ---------- Breadcrumbs ---------- */
  function buildBreadcrumbs(){
    if (isHome() || document.querySelector('.breadcrumbs')) return;
    const container = document.getElementById('breadcrumb-container');
    if (!container) return;

    const segs = location.pathname.replace(/\/+/g,'/').split('/').filter(Boolean);
    let path = '';
    const parts = segs.map((seg, i) => {
      path += '/' + seg;
      const label = decodeURIComponent(seg).replace(/[-_]/g,' ').replace(/\b\w/g, c => c.toUpperCase());
      const isLast = i === segs.length - 1;
      return isLast
        ? `<li aria-current="page">${label}</li>`
        : `<li><a href="${path}">${label}</a></li>`;
    });

    container.innerHTML = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          ${parts.join('<li>/</li>')}
        </ol>
      </nav>`;
  }

  /* ---------- Requests app (PoC) ---------- */
  const STORAGE_KEY = 'hesaa_poc_requests';

  function loadRequests(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveRequests(rows){ localStorage.setItem(STORAGE_KEY, JSON.stringify(rows||[])); }

  function renderRequests(rows){
    const tbody = document.querySelector('#requestsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = rows.map((r,i)=>`
      <tr>
        <td>${r.id}</td>
        <td>${r.title}</td>
        <td>${r.description}</td>
        <td>${r.requestDate || ''}</td>
        <td><span class="badge ${r.priority||''}">${r.priority||''}</span></td>
        <td>${r.attachmentName || ''}</td>
      </tr>
    `).join('');
  }

  function filterRequestsTable(q){
    const all = loadRequests();
    const qn = (q||'').toLowerCase();
    const filtered = !qn ? all : all.filter(r =>
      [r.title, r.description, r.priority, r.requestDate, r.attachmentName]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(qn))
    );
    renderRequests(filtered);
  }

  function initRequestsApp(){
    const form = document.getElementById('requestForm');
    const table = document.getElementById('requestsTable');
    if (!form || !table || once(form,'jsbound')) return;

    // Render existing
    renderRequests(loadRequests());

    // Submit
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const title = (fd.get('RequestTitle')||'').trim();
      const description = (fd.get('RequestDescription')||'').trim();
      const requestDate = fd.get('RequestDate') || '';
      const priority = fd.get('Priority') || '';
      const file = form.querySelector('input[type="file"]')?.files?.[0];
      const attachmentName = file ? file.name : '';

      if (!title || !description || !priority || !requestDate){
        alert('Please complete all required fields.');
        return;
      }

      const rows = loadRequests();
      const id = rows.length ? Math.max(...rows.map(r=>r.id))+1 : 1;
      rows.unshift({ id, title, description, requestDate, priority, attachmentName });
      saveRequests(rows);
      form.reset();
      renderRequests(rows);
    });
  }

  /* ---------- Init ---------- */
  function init(){
    setYear();
    initNav();
    initSearch();
    buildBreadcrumbs();
    initRequestsApp();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('includes:loaded', init);
})();
// ---- Image helpers (served by your SWA API /api/media/:file) ----
function setApiImg(id, file) {
  const el = document.getElementById(id);
  if (el) el.src = `/api/media/${encodeURIComponent(file)}`;
}

// Assign images to carousel
setApiImg('heroHeaderImg', 'Hero.png');
setApiImg('slide1', 'Slide1.png');
setApiImg('slide2', 'Slide2.png');
setApiImg('slide3', 'Slide3.png');

