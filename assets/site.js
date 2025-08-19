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

    // overlay once
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

  /* ======================================================
     Requests app (API-backed) — robust attachment handling
     ====================================================== */
  (function RequestsApp(){
    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search');
    const topBox   = document.getElementById('q');            // header search
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg');      // only for “Submitting…”
    const alertBox = document.getElementById('alert');
    const table    = document.getElementById('requestsTable');

    if (!table) return;

    const API = {
      list: '/api/requests',
      uploadA: id => `/api/requests/${encodeURIComponent(id)}/attachments`,
      uploadB: id => `/api/requests/attachments?id=${encodeURIComponent(id)}`
    };

    let DATA = [];
    let ATTACH_ENDPOINT = null; // '%ID%' template if discovered, else null or '' to disable

    const sanitize = window.DOMPurify
      ? html => window.DOMPurify.sanitize(html || '',
          {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
           ALLOWED_ATTR:['href','style','target']})
      : html => String(html||'').replace(/<[^>]+>/g,'');

    const fmtDate = d => d ? new Date(d).toLocaleDateString() : '';
    const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

    /* --------- attachments discovery (avoid 404 spam) --------- */
    async function detectAttachmentEndpoint(sampleId){
      const probes = [
        API.uploadA(sampleId),                 // /api/requests/{id}/attachments
        API.uploadB(sampleId)                  // /api/requests/attachments?id={id}
      ];
      for (const url of probes){
        try{
          const r = await fetch(url, { method:'GET' });
          if (r.ok){
            // cache a templated version to reuse
            return url.replace(String(sampleId), '%ID%');
          }
        }catch{ /* ignore */ }
      }
      return ''; // disable fetching if nothing works
    }

    async function fetchAttachmentsById(id){
      if (!ATTACH_ENDPOINT) return [];
      const url = ATTACH_ENDPOINT.replace('%ID%', encodeURIComponent(id));
      try{
        const r = await fetch(url);
        if (!r.ok) return [];
        const j = await r.json().catch(()=> ({}));
        const list =
          Array.isArray(j)     ? j :
          Array.isArray(j.items) ? j.items :
          Array.isArray(j.value) ? j.value : [];
        return list.map(a=>({
          name: a.FileName || a.name || 'file',
          url:  a.ServerRelativeUrl || a.Url || a.url || ''
        }));
      }catch{
        return [];
      }
    }

    function render(filter=''){
      const q = (filter||'').trim().toLowerCase();

      const getAttachments = x => {
        if (Array.isArray(x?.AttachmentFiles)) {
          return x.AttachmentFiles.map(a => ({
            name: a.FileName || a.name || 'file',
            url:  a.ServerRelativeUrl || a.Url || a.url || ''
          }));
        }
        if (Array.isArray(x?.AttachmentsArray)) {
          return x.AttachmentsArray.map(a => ({
            name: a.FileName || a.name || 'file',
            url:  a.Url || a.url || ''
          }));
        }
        return [];
      };

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

        // discover attachment endpoint once using a row that claims it has attachments
        const sample = DATA.find(x => (x.Attachments === true) || (Array.isArray(x.AttachmentFiles) && x.AttachmentFiles.length));
        if (sample && (sample.Id || sample.ID) && ATTACH_ENDPOINT === null){
          ATTACH_ENDPOINT = await detectAttachmentEndpoint(sample.Id || sample.ID);
        } else if (ATTACH_ENDPOINT === null){
          ATTACH_ENDPOINT = ''; // mark as probed/disabled
        }

        // if we have an endpoint, fetch attachments for rows that claim to have them but no list yet
        if (ATTACH_ENDPOINT){
          const targets = DATA.filter(x => (x.Attachments === true) && !Array.isArray(x.AttachmentFiles));
          // limit concurrency to avoid bursts
          const queue = targets.slice(0, 20); // hard cap to keep it light
          for (const item of queue){
            const id = item.Id || item.ID;
            if (!id) continue;
            const files = await fetchAttachmentsById(id);
            if (files.length) item.AttachmentFiles = files;
          }
        }

        const q = (pageBox && pageBox.value) || (topBox && topBox.value) || '';
        render(q);
      }catch(err){
        console.error('Requests API error:', err);
        rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Error loading requests: ${String(err.message || err)}</td></tr>`;
      }
    }

    // sync header search <-> page search (debounced)
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

    // banner
    function showNotice(text,type){
      if(!alertBox) return;
      alertBox.textContent = text;
      alertBox.className = `notice ${type}`;   // expects .notice.success / .notice.error in CSS
      setTimeout(()=>{ alertBox.className = 'notice sr-only'; alertBox.textContent=''; }, 5000);
    }

    // upload helper (best-effort: tries both shapes)
    async function uploadAttachment(id, file){
      const candidates = [ API.uploadA(id), API.uploadB(id) ];
      for (const url of candidates){
        try{
          const fd = new FormData();
          fd.append('file', file, file.name);
          fd.append('name', file.name);
          // some backends also accept this key; include both
          fd.append('Attachment', file, file.name);
          const r = await fetch(url, { method:'POST', body: fd });
          if (r.ok) return true;
        }catch{ /* try next */ }
      }
      return false;
    }

    // create form: JSON first, then (optionally) upload file
    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      if (formMsg) formMsg.textContent = 'Submitting…';
      alertBox && (alertBox.className = 'notice sr-only');

      try{
        const fd = new FormData(form);
        const fileInput = form.querySelector('#fFile');
        const file = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0] : null;

        // client-side requireds
        if(!fd.get('Title') || !fd.get('RequestType') || !fd.get('Priority')){
          if (formMsg) formMsg.textContent = '';
          showNotice('Please fill Title, Type, and Priority.', 'error');
          return;
        }

        // normalize boolean
        if (fd.get('RequestEndDate')) fd.set('RequestEndDate','true'); else fd.set('RequestEndDate','false');

        // ALWAYS create the item via JSON (ensures Title doesn’t become "Untitled")
        const body = Object.fromEntries(fd.entries());
        // remove file from JSON payload if browser put it in
        delete body.Attachment;

        const createRes = await fetch(API.list, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(body)
        });
        const createJson = await createRes.json().catch(()=>({ok:false}));
        if(!createRes.ok || !createJson.ok) throw new Error(createJson.error || `HTTP ${createRes.status}`);

        // grab the new item id from a few possible shapes
        const newId = createJson.id || createJson.Id || createJson.item?.Id || createJson.item?.ID;
        // if there’s a file, upload it in a second call (best effort)
        if (file && newId){
          await uploadAttachment(newId, file);
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
