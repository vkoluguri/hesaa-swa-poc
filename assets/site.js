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

 /* ---------- Image helpers (SWA -> SharePoint) ---------- */
function setApiImg(id, file) {
  const el = document.getElementById(id);
  if (el) el.src = `/api/media/${encodeURIComponent(file)}`;
}
// Assign hero images (IDs must be on <img> tags in index.html)
setApiImg('heroHeaderImg', 'Hero.png');
setApiImg('slide1', 'Slide1.png');
setApiImg('slide2', 'Slide2.png');
setApiImg('slide3', 'Slide3.png');

/* ---------- Requests app (API-backed) ---------- */
(function RequestsApp(){
  const rowsEl   = document.getElementById('rows');
  const countEl  = document.getElementById('resultCount');
  const pageBox  = document.getElementById('search');
  const topBox   = document.getElementById('q');            // header search
  const form     = document.getElementById('reqForm');
  const formMsg  = document.getElementById('formMsg');
  const alertBox = document.getElementById('alert');
  const table    = document.getElementById('requestsTable');

  if (!table) return; // Not on the home/requests page

  let DATA = [];

  const sanitize = window.DOMPurify
    ? html => window.DOMPurify.sanitize(html || '',
        {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
         ALLOWED_ATTR:['href','style','target']})
    : html => String(html||'').replace(/<[^>]+>/g,'');

  const fmt = d => d ? new Date(d).toLocaleDateString() : '';

  function render(filter=''){
    const q = filter.trim().toLowerCase();
    const out = DATA.filter(x =>
      !q ||
      (x.Title||'').toLowerCase().includes(q) ||
      sanitize(x.RequestDescription||'').toLowerCase().includes(q) ||
      (x.RequestType||'').toLowerCase().includes(q) ||
      (x.Priority||'').toLowerCase().includes(q)
    );

    countEl && (countEl.textContent = out.length);
    rowsEl.innerHTML = out.map(x => `
      <tr>
        <td>${x.Title ?? ''}</td>
        <td>${x.RequestType ?? ''}</td>
        <td>${x.Priority ?? ''}</td>
        <td>${fmt(x.RequestDate)}</td>
        <td>${x.RequestEndDate ? 'Yes':'No'}</td>
        <td>${fmt(x.Created)}</td>
        <td>${fmt(x.Modified)}</td>
        <td><details><summary>View</summary><div>${sanitize(x.RequestDescription)}</div></details></td>
      </tr>
    `).join('') || `<tr><td colspan="8" class="kpi">No results</td></tr>`;
  }

  async function loadData(){
    rowsEl.innerHTML = `<tr><td colspan="8" class="kpi">Loading…</td></tr>`;
    try{
      const res = await fetch('/api/requests');
      let payload;
      try{ payload = await res.json(); }catch{ payload = { ok:false, error: `HTTP ${res.status} ${res.statusText}` }; }
      if(!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      if(!payload.ok) throw new Error(payload.error || 'Unknown API error');

      DATA = Array.isArray(payload.items) ? payload.items : [];
      const q = (pageBox && pageBox.value) || (topBox && topBox.value) || '';
      render(q);
    }catch(err){
      console.error('Requests API error:', err);
      rowsEl.innerHTML = `<tr><td colspan="8" class="kpi">Error loading requests: ${String(err.message || err)}</td></tr>`;
    }
  }

  // sync header search <-> page search
  const sync = (v) => {
    if (pageBox && pageBox.value !== v) pageBox.value = v;
    if (topBox  && topBox.value  !== v) topBox.value  = v;
    render(v);
  };

  // debounce for input
  function debounce(fn, ms=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
  const debouncedSync = debounce(sync, 180);

  pageBox && pageBox.addEventListener('input', e => debouncedSync(e.target.value));
  topBox  && topBox.addEventListener('input',  e => debouncedSync(e.target.value));

  // also wire header search button (if present)
  const topBtn = document.querySelector('[data-search-btn]');
  topBtn && topBtn.addEventListener('click', ()=> sync((topBox && topBox.value) || ''));

  // create form POST -> /api/requests
  function showNotice(text,type){
    alertBox.textContent = text;
    alertBox.className = `notice ${type}`;
    setTimeout(()=>{ alertBox.className = 'notice sr-only'; alertBox.textContent=''; }, 5000);
  }

  form && form.addEventListener('submit', async e=>{
    e.preventDefault();
    formMsg.textContent = 'Submitting…';
    alertBox.className = 'notice sr-only';
    try{
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      // required fields basic check
      if(!data.Title || !data.Priority || !data.RequestType){
        formMsg.textContent = '';
        showNotice('Please fill Title, Type, and Priority.', 'error');
        return;
      }
      data.RequestEndDate = !!fd.get('RequestEndDate');

      const res = await fetch('/api/requests', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(()=>({ok:false,error:`HTTP ${res.status} ${res.statusText}`}));
      if(!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);

      formMsg.textContent = 'Created!';
      showNotice('Request successfully created.', 'success');
      form.reset();
      await loadData();
    }catch(err){
      formMsg.textContent = '';
      showNotice('Failed: ' + String(err.message || err), 'error');
    }
  });

  // initial load
  loadData();
})();


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


