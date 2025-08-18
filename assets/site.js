/* site behavior */
(function(){
  /* ---------- Utilities ---------- */
  const once = (el, key) => {
    if (!el || el.dataset[key] === '1') return true;
    el.dataset[key] = '1';
    return false;
  };

function setYear(){
  const year = String(new Date().getFullYear());
  // fill any #yr spans
  document.querySelectorAll('#yr').forEach(el => { if (el.textContent !== year) el.textContent = year; });
  // fallback: if no #yr found, patch footer text once
  const ft = document.querySelector('.ft-copy');
  if (ft && !/20\d{2}/.test(ft.textContent)) ft.innerHTML = `© <span id="yr">${year}</span> HESAA. All rights reserved.`;
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
  // no crumbs on home
  const pathClean = (location.pathname || '/').replace(/\/+$/,'') || '/';
  if (pathClean === '/' || /\/index\.html?$/i.test(pathClean)) return;

  const container = document.getElementById('breadcrumb-container');
  if (!container) return;

  // helper: title-case + strip .html/.htm
  const prettify = seg => {
    const noExt = seg.replace(/\.[^.\/]+$/,''); // remove extension
    const spaced = decodeURIComponent(noExt).replace(/[-_]/g,' ');
    return spaced.replace(/\b\w/g, c => c.toUpperCase());
  };

  const homeSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 3.2 2.8 11a1 1 0 0 0-.3.7V21a1 1 0 0 0 1 1h6v-6h5v6h6a1 1 0 0 0 1-1v-9.3a1 1 0 0 0-.3-.7L12 3.2z"/>
    </svg>`;

  const segs = pathClean.split('/').filter(Boolean);
  let path = '';
  const parts = segs.map((seg, i) => {
    path += '/' + seg;
    const label = prettify(seg);
    const isLast = i === segs.length - 1;
    return isLast
      ? `<li aria-current="page">${label}</li>`
      : `<li><a href="${path}">${label}</a></li>`;
  });

  container.innerHTML = `
    <div class="wrap">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/" aria-label="Home">${homeSvg}</a></li>
          ${parts.join('<li>/</li>')}
        </ol>
      </nav>
    </div>`;
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
  const q = (filter||'').trim().toLowerCase();

  // normalize attachments from various API shapes
  const getAttachments = x => {
    if (Array.isArray(x?.AttachmentFiles)) {
      return x.AttachmentFiles.map(a => ({
        name: a.FileName || a.name || 'file',
        url:  a.ServerRelativeUrl || a.Url || a.url || ''
      }));
    }
    if (Array.isArray(x?.Attachments)) {         // some APIs use this name
      return x.Attachments.map(a => ({
        name: a.FileName || a.name || 'file',
        url:  a.Url || a.url || ''
      }));
    }
    if (x?.AttachmentName || x?.AttachmentUrl) { // single file shape
      return [{ name: x.AttachmentName || 'file', url: x.AttachmentUrl || '' }];
    }
    return [];
  };

  const fmt = d => d ? new Date(d).toLocaleDateString() : '';
  const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

  const out = DATA.filter(x => {
    if (!q) return true;
    const atts = getAttachments(x);
    return (
      (x.Title||'').toLowerCase().includes(q) ||
      (x.RequestType||'').toLowerCase().includes(q) ||
      (x.Priority||'').toLowerCase().includes(q) ||
      plain(x.RequestDescription||'').toLowerCase().includes(q) ||
      atts.some(a => (a.name||'').toLowerCase().includes(q))
    );
  });

  countEl && (countEl.textContent = out.length);

  rowsEl.innerHTML = out.map(x => {
    const atts = getAttachments(x);
    const attCell = atts.length
      ? atts.map(a => a.url
          ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
          : `<span>${a.name}</span>`
        ).join('<br>')
      : '—';

    return `
      <tr>
        <td>${x.Title ?? ''}</td>
        <td>${x.RequestType ?? ''}</td>
        <td>${x.Priority ?? ''}</td>
        <td>${fmt(x.RequestDate)}</td>
        <td>${x.RequestEndDate ? 'Yes':'No'}</td>
        <td>${fmt(x.Created)}</td>
        <td>${fmt(x.Modified)}</td>
        <td>${attCell}</td>                                <!-- attachments -->
        <td><details><summary>View</summary><div>${plain(x.RequestDescription)}</div></details></td>
      </tr>`;
  }).join('') || `<tr><td colspan="9" class="kpi">No results</td></tr>`;
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
    const hasFile = (form.querySelector('#fFile')?.files?.length || 0) > 0;

    // basic client-side requireds
    if(!fd.get('Title') || !fd.get('RequestType') || !fd.get('Priority')){
      formMsg.textContent = '';
      showNotice('Please fill Title, Type, and Priority.', 'error');
      return;
    }

    // normalize boolean
    if (fd.get('RequestEndDate')) fd.set('RequestEndDate','true'); else fd.set('RequestEndDate','false');

    let res, json;
    if (hasFile){
      // send multipart for SharePoint attachment support via your API
      res  = await fetch('/api/requests', { method:'POST', body: fd });
    }else{
      const obj = Object.fromEntries(fd.entries());
      res  = await fetch('/api/requests', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj)
      });
    }
    json = await res.json().catch(()=>({ok:false,error:`HTTP ${res.status} ${res.statusText}`}));
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
  setYear();            // copyright
  initNav();            // hamburger
  initSearch();         // <-- correct function name
  buildBreadcrumbs();   // breadcrumbs
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
window.addEventListener('includes:loaded', init);

})();


