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
    const toggleBtn  = document.querySelector('.search-toggle');
    const input      = document.querySelector('.search-box input[type="search"]');
    const btn        = document.querySelector('[data-search-btn]');
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
      if (urlQ) { input.value = urlQ; if (typeof window.filterRequestsTable==='function') window.filterRequestsTable(urlQ.toLowerCase()); }
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
    const API = {
      list: '/api/requests',
      attachList: id => `/api/requests/${id}/attachments`,
      attachListAlt: id => `/api/requests/attachments?id=${encodeURIComponent(id)}`
    };

    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search');
    const topBox   = document.getElementById('q');            // header search
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg');      // only used for "Submitting…"
    const alertBox = document.getElementById('alert');
    const table    = document.getElementById('requestsTable');

    if (!table) return; // Not on the home/requests page

    let DATA = [];

    const sanitize = window.DOMPurify
      ? html => window.DOMPurify.sanitize(html || '',
          {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
           ALLOWED_ATTR:['href','style','target']})
      : html => String(html||'').replace(/<[^>]+>/g,'');

    const fmtDate = d => d ? new Date(d).toLocaleDateString() : '';
    const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

    /* --- ATTACHMENTS: probe both common routes --- */
    async function fetchAttachmentsById(id){
      if (!id) return [];
      const candidates = [ API.attachList(id), API.attachListAlt(id) ];
      for (const url of candidates){
        try{
          const r = await fetch(url);
          if (!r.ok) continue;
          const j = await r.json();
          const list = Array.isArray(j) ? j : (Array.isArray(j.items) ? j.items : []);
          if (!list.length) continue;
          return list.map(a => ({
            name: a.FileName || a.name || 'file',
            url:  a.ServerRelativeUrl || a.Url || a.url || ''
          }));
        }catch{} // ignore and try next
      }
      return [];
    }

    async function uploadAttachmentById(id, file){
      // try POST /api/requests/{id}/attachments (multipart key: "file")
      const fd = new FormData();
      fd.append('file', file, file.name);

      let r = await fetch(API.attachList(id), { method:'POST', body: fd }).catch(()=>null);
      if (r && r.ok) return true;

      // try POST /api/requests/attachments?id={id}
      r = await fetch(API.attachListAlt(id), { method:'POST', body: fd }).catch(()=>null);
      if (r && r.ok) return true;

      // (optional) try PUT binary ?filename= (some backends do this)
      try{
        r = await fetch(`${API.attachList(id)}?filename=${encodeURIComponent(file.name)}`, {
          method:'PUT', headers:{'Content-Type': file.type || 'application/octet-stream'}, body: file
        });
        if (r.ok) return true;
      }catch{}

      return false; // none worked
    }

    function render(filter=''){
      const q = (filter||'').trim().toLowerCase();

      const out = DATA.filter(x => {
        if (!q) return true;
        return (
          (x.Title||'').toLowerCase().includes(q) ||
          (x.RequestType||'').toLowerCase().includes(q) ||
          (x.Priority||'').toLowerCase().includes(q) ||
          plain(x.RequestDescription||'').toLowerCase().includes(q)
        );
      });

      countEl && (countEl.textContent = out.length);

      rowsEl.innerHTML = out.map(x => {
        const has = x.Attachments === true || (Array.isArray(x.AttachmentFiles) && x.AttachmentFiles.length);
        // best-effort render using data we already have (no extra calls per row)
        let attCell = '—';
        if (Array.isArray(x.AttachmentFiles) && x.AttachmentFiles.length){
          attCell = x.AttachmentFiles.map(a => {
            const name = a.FileName || a.name || 'file';
            const url  = a.ServerRelativeUrl || a.Url || a.url || '';
            return url ? `<a href="${url}" target="_blank" rel="noopener">${name}</a>` : `<span>${name}</span>`;
          }).join('<br>');
        } else if (has){
          attCell = `<span class="badge">Has file</span>`;
        }

        return `
          <tr>
            <td>${x.Title || ''}</td>
            <td>${x.RequestType || ''}</td>
            <td>${x.Priority || ''}</td>
            <td>${fmtDate(x.RequestDate)}</td>
            <td>${x.RequestEndDate ? 'Yes':'No'}</td>
            <td>${fmtDate(x.Created)}</td>
            <td>${fmtDate(x.Modified)}</td>
            <td data-attcell data-id="${x.Id || x.ID || x.id || ''}">${attCell}</td>
            <td><details><summary>View</summary><div>${plain(x.RequestDescription)}</div></details></td>
          </tr>`;
      }).join('') || `<tr><td colspan="9" class="kpi">No results</td></tr>`;

      // Lazy‑enhance attachment cells for rows that only had "Has file"
      [...rowsEl.querySelectorAll('td[data-attcell]')].forEach(async td=>{
        if (!/Has file/.test(td.innerHTML)) return;
        const id = td.getAttribute('data-id');
        if (!id) return;
        const files = await fetchAttachmentsById(id);
        if (files.length){
          td.innerHTML = files.map(a=> a.url
            ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
            : `<span>${a.name}</span>`
          ).join('<br>');
        }
      });
    }

    // expose renderer so the header search can call it
    window.filterRequestsTable = render;

    async function loadData(){
      rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Loading…</td></tr>`;
      try{
        const res = await fetch(API.list);
        let payload;
        try{ payload = await res.json(); }catch{ payload = { ok:false, error: `HTTP ${res.status} ${res.statusText}` }; }
        if(!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
        if(!payload.ok) throw new Error(payload.error || 'Unknown API error');

        DATA = Array.isArray(payload.items) ? payload.items : [];
        const q = (pageBox && pageBox.value) || (topBox && topBox.value) || '';
        render(q);
      }catch(err){
        console.error('Requests API error:', err);
        rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Error loading requests: ${String(err.message || err)}</td></tr>`;
      }
    }

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

    /* ----- CREATE: JSON first, then try attachments routes ----- */
    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      if (formMsg) formMsg.textContent = 'Submitting…';
      alertBox && (alertBox.className = 'notice sr-only');

      try{
        const fd = new FormData(form);

        const title = fd.get('Title') || '';
        const type  = fd.get('RequestType') || '';
        const pri   = fd.get('Priority') || '';
        if(!title || !type || !pri){
          if (formMsg) formMsg.textContent = '';
          showNotice('Please fill Title, Type, and Priority.', 'error');
          return;
        }

        // normalize boolean to a literal "true"/"false" string
        fd.set('RequestEndDate', fd.get('RequestEndDate') ? 'true' : 'false');

        // create via JSON to avoid “Untitled” dupes
        const obj = Object.fromEntries(fd.entries());
        delete obj.Attachment; // never send file in JSON

        const createRes = await fetch(API.list, {
          method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj)
        });
        const created = await createRes.json().catch(()=>({ok:false}));
        if(!createRes.ok || !created.ok) throw new Error(created.error || `HTTP ${createRes.status}`);

        const newId = created.id || created.ID || created.Id;
        const file  = form.querySelector('#fFile')?.files?.[0] || null;

        // if there is a file, try to upload using the known attachment endpoints
        if (file && newId){
          const ok = await uploadAttachmentById(newId, file);
          if (!ok){
            console.warn('Attachment upload: no compatible endpoint found (skipped).');
          }
        }

        if (formMsg) formMsg.textContent = '';
        showNotice('Request successfully created.', 'success');
        form.reset();
        await loadData();
      }catch(err){
        if (formMsg) formMsg.textContent = '';
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
