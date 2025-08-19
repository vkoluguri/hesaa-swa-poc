/* site behavior */
(function(){
  /* ---------- Utilities ---------- */
  const once = (el, key) => {
    if (!el || el.dataset[key] === '1') return true;
    el.dataset[key] = '1';
    return false;
  };

  function ensureFavicon(){
    const have = document.querySelector('link[rel~="icon"]');
    if (!have){
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = '/assets/HESAAFAVICON.ico';
      document.head.appendChild(link);
    }
  }

  function highlightCurrentNav(){
    const here = (location.pathname.replace(/\/+$/,'') || '/')
                  .split('/').pop().toLowerCase() || 'index.html';

    document.querySelectorAll('.main-nav a').forEach(a=>{
      const href = (a.getAttribute('href')||'').split('/').pop().toLowerCase();
      const isHome = (here==='/' || here==='' || here==='index.html');
      const match =
        (isHome && (!href || href==='/' || href==='index.html')) ||
        (!!href && href === here);

      if (match) a.setAttribute('aria-current','page');
      else       a.removeAttribute('aria-current');
    });
  }

  function setYear(){
    const year = String(new Date().getFullYear());
    document.querySelectorAll('#yr').forEach(el => { if (el.textContent !== year) el.textContent = year; });
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
    if (!btn || !nav) return;

    let overlay = document.getElementById('navOverlay');
    if (!overlay){
      overlay = document.createElement('div');
      overlay.id = 'navOverlay';
      document.body.appendChild(overlay);
    }

    const closeBtn = nav.querySelector('[data-nav-close]');

    function setOpen(open){
      const willOpen = !!open;
      nav.setAttribute('data-open', String(willOpen));
      overlay.setAttribute('data-open', String(willOpen));
      btn.setAttribute('aria-expanded', String(willOpen));
      document.documentElement.classList.toggle('no-scroll', willOpen);
    }
    function toggle(){ setOpen(nav.getAttribute('data-open') !== 'true'); }

    btn.addEventListener('click', toggle);
    closeBtn && closeBtn.addEventListener('click', ()=>setOpen(false));
    overlay.addEventListener('click', ()=>setOpen(false));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e=>{ if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') setOpen(false); });
  }

  /* ---------- Search (filters Requests table) ---------- */
  function initSearch(){
    const container = document.querySelector('.search-container');
    const toggleBtn = document.querySelector('.search-toggle');
    const input     = document.querySelector('.search-box input[type="search"]');
    const btn       = document.querySelector('[data-search-btn]');
    if (!container || !toggleBtn || !input || !btn || once(btn,'jsbound')) return;

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
      const table = document.querySelector('#requestsTable');

      if (!table){
        const url = new URL('/', location.origin);
        if (q) url.searchParams.set('q', q);
        location.href = url.toString();
        return;
      }

      if (typeof window.filterRequestsTable === 'function'){
        window.filterRequestsTable(q);
      }
      container.classList.remove('open');
      toggleBtn.blur();
    }

    btn.addEventListener('click', performSearch);
    input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') performSearch(); });

    if (isHome()){
      const urlQ = new URLSearchParams(location.search).get('q') || '';
      if (urlQ && typeof window.filterRequestsTable==='function') {
        input.value = urlQ; window.filterRequestsTable(urlQ.toLowerCase());
      }
    }
  }

  /* ---------- Breadcrumbs ---------- */
  function buildBreadcrumbs(){
    const path = (location.pathname || '/').replace(/\/+$/,'') || '/';
    if (path === '/' || /\/index\.html?$/i.test(path)) return;

    const host = document.getElementById('breadcrumb-container');
    if (!host) return;

    const segs = path.split('/').filter(Boolean);
    const prettify = s => decodeURIComponent(s.replace(/\.[^.\/]+$/,''))
                          .replace(/[-_]/g,' ')
                          .replace(/\b\w/g,c=>c.toUpperCase());

    let acc = '';
    const parts = segs.map((seg, i)=>{
      acc += '/' + seg;
      const last = i === segs.length-1;
      return last
        ? `<span aria-current="page">${prettify(seg)}</span>`
        : `<a href="${acc}">${prettify(seg)}</a>`;
    });

    host.innerHTML = `
      <div class="wrap">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <span class="bc-home"><a href="/">Home</a></span>
          <span class="bc-sep">/</span>
          ${parts.join(`<span class="bc-sep">/</span>`)}
        </nav>
      </div>`;
  }

  /* ---------- Image helpers (SWA -> SharePoint) ---------- */
  function setApiImg(id, file) {
    const el = document.getElementById(id);
    if (el) el.src = `/api/media/${encodeURIComponent(file)}`;
  }
  setApiImg('heroHeaderImg', 'Hero.png');
  setApiImg('slide1', 'Slide1.png');
  setApiImg('slide2', 'Slide2.png');
  setApiImg('slide3', 'Slide3.png');

  /* ---------- Requests app (API-backed) ---------- */
  (function RequestsApp(){
    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search');
    const topBox   = document.getElementById('q');
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg');      // status “Submitting…”
    const alertBox = document.getElementById('alert');
    const table    = document.getElementById('requestsTable');

    if (!table) return;

    let DATA = [];

    const sanitize = window.DOMPurify
      ? html => window.DOMPurify.sanitize(html || '',
          {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
           ALLOWED_ATTR:['href','style','target']})
      : html => String(html||'').replace(/<[^>]+>/g,'');

    const fmtDate = d => d ? new Date(d).toLocaleDateString() : '';
    const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

    /** normalize attachments from various API shapes */
    const getAttachments = x => {
      if (Array.isArray(x?.AttachmentFiles)) {
        return x.AttachmentFiles.map(a => ({
          name: a.FileName || a.Name || a.name || 'file',
          url:  a.ServerRelativeUrl || a.Url || a.url || ''
        }));
      }
      if (Array.isArray(x?.Attachments)) {
        return x.Attachments.map(a => ({
          name: a.FileName || a.Name || a.name || 'file',
          url:  a.Url || a.url || ''
        }));
      }
      if (x?.AttachmentName || x?.AttachmentUrl) {
        return [{ name: x.AttachmentName || 'file', url: x.AttachmentUrl || '' }];
      }
      return [];
    };

    function render(filter=''){
      const q = (filter||'').trim().toLowerCase();

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
            <td>${x.Title || ''}</td>
            <td>${x.RequestType || ''}</td>
            <td>${x.Priority || ''}</td>
            <td>${fmtDate(x.RequestDate)}</td>
            <td>${x.RequestEndDate ? 'Yes':'No'}</td>
            <td>${fmtDate(x.Created)}</td>
            <td>${fmtDate(x.Modified)}</td>
            <td>${attCell}</td>
            <td><details><summary>View</summary><div>${plain(x.RequestDescription)}</div></details></td>
          </tr>`;
      }).join('') || `<tr><td colspan="9" class="kpi">No results</td></tr>`;
    }

    /** Make the renderer callable from header search */
    window.filterRequestsTable = render;

    /** Optional enrichment: fetch attachments for items that came without them */
    async function enrichMissingAttachments(items){
      // Take the first 20 rows (avoid spamming the API)
      const targets = items.filter(x => getAttachments(x).length === 0 && x.Id).slice(0,20);
      if (!targets.length) return;

      await Promise.allSettled(targets.map(async x=>{
        try{
          const r = await fetch(`/api/requests/${encodeURIComponent(x.Id)}/attachments`);
          if (!r.ok) return;
          const j = await r.json().catch(()=>null);
          if (!j) return;
          // accepted shapes: { items:[{FileName,Url}] } or array
          const arr = Array.isArray(j) ? j
                   : Array.isArray(j.items) ? j.items
                   : [];
          if (arr.length){
            x.AttachmentFiles = arr.map(a=>({
              FileName: a.FileName || a.name,
              Url: a.Url || a.url || a.ServerRelativeUrl
            }));
          }
        }catch(_){/* ignore */}
      }));
    }

    async function loadData(){
      rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Loading…</td></tr>`;
      try{
        const res = await fetch('/api/requests');
        let payload;
        try{ payload = await res.json(); }catch{ payload = { ok:false, error: `HTTP ${res.status} ${res.statusText}` }; }
        if(!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
        if(!payload.ok) throw new Error(payload.error || 'Unknown API error');

        DATA = Array.isArray(payload.items) ? payload.items : [];

        // Try to hydrate attachments if they weren't expanded
        await enrichMissingAttachments(DATA);

        const q = (pageBox && pageBox.value) || (topBox && topBox.value) || '';
        render(q);
      }catch(err){
        console.error('Requests API error:', err);
        rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Error loading requests: ${String(err.message || err)}</td></tr>`;
      }
    }

    // sync header search <-> page search
    const sync = (v) => {
      if (pageBox && pageBox.value !== v) pageBox.value = v;
      if (topBox  && topBox.value  !== v) topBox.value  = v;
      render(v);
    };

    function debounce(fn, ms=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
    const debouncedSync = debounce(sync, 180);

    pageBox && pageBox.addEventListener('input', e => debouncedSync(e.target.value));
    topBox  && topBox.addEventListener('input',  e => debouncedSync(e.target.value));

    const topBtn = document.querySelector('[data-search-btn]');
    topBtn && topBtn.addEventListener('click', ()=> sync((topBox && topBox.value) || ''));

    function showNotice(text,type){
      if(!alertBox) return;
      alertBox.textContent = text;
      alertBox.className = `notice ${type}`;
      setTimeout(()=>{ alertBox.className = 'notice sr-only'; alertBox.textContent=''; }, 5000);
    }

    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      if (formMsg) formMsg.textContent = 'Submitting…';
      alertBox && (alertBox.className = 'notice sr-only');

      try{
        // Read all fields explicitly (prevents “Untitled” when multipart)
        const title   = form.querySelector('#fTitle')?.value?.trim() || '';
        const desc    = form.querySelector('#fDesc')?.value || '';
        const type    = form.querySelector('#fType')?.value || '';
        const pri     = form.querySelector('#fPri')?.value || '';
        const endDate = form.querySelector('#fEnd')?.checked ? 'true' : 'false';
        const fileEl  = form.querySelector('#fFile');
        if(!title || !type || !pri){
          if (formMsg) formMsg.textContent = '';
          showNotice('Please fill Title, Type, and Priority.', 'error');
          return;
        }

        let res, json;

        if (fileEl && fileEl.files && fileEl.files.length){
          // IMPORTANT: use a fresh FormData and append every field + the file
          const fd = new FormData();
          fd.append('Title',              title);
          fd.append('RequestDescription', desc);
          fd.append('RequestType',        type);
          fd.append('Priority',           pri);
          fd.append('RequestEndDate',     endDate);
          // enforce a predictable server field name
          const fieldName = fileEl.getAttribute('name') || 'Attachment';
          fd.append(fieldName, fileEl.files[0]);

          res  = await fetch('/api/requests', { method:'POST', body: fd });
        }else{
          const obj = { Title:title, RequestDescription:desc, RequestType:type, Priority:pri, RequestEndDate:endDate };
          res  = await fetch('/api/requests', {
            method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj)
          });
        }

        json = await res.json().catch(()=>({ok:false,error:`HTTP ${res.status} ${res.statusText}`}));
        if(!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);

        if (formMsg) formMsg.textContent = '';
        showNotice('Request successfully created.', 'success');
        form.reset();

        // optimistic fix-up: if API returns row sans attachments/title,
        // enrich when we reload
        await loadData();
      }catch(err){
        if (formMsg) formMsg.textContent = '';
        showNotice('Failed: ' + String(err.message || err), 'error');
      }
    });

    loadData();
  })();

  /* ---------- Init ---------- */
  function init(){
    setYear();
    initNav();
    initSearch();
    buildBreadcrumbs();
    ensureFavicon();
    highlightCurrentNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('includes:loaded', init);
})();
