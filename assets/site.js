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

  /* ---------- Search ---------- */
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
    input.addEventListener('keydown', e=>{ if(e.key === 'Enter') performSearch(); });

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
      return (i === segs.length-1)
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

  /* ---------- Image helpers ---------- */
  function setApiImg(id, file) {
    const el = document.getElementById(id);
    if (el) el.src = `/api/media/${encodeURIComponent(file)}`;
  }
  setApiImg('heroHeaderImg', 'Hero.png');
  setApiImg('slide1', 'Slide1.png');
  setApiImg('slide2', 'Slide2.png');
  setApiImg('slide3', 'Slide3.png');

  /* ======================================================
     Requests app (create first, then best‑effort attachment)
     ====================================================== */
  (function RequestsApp(){
    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search');
    const topBox   = document.getElementById('q');
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg');      // only “Submitting…”
    const alertBox = document.getElementById('alert');
    const table    = document.getElementById('requestsTable');
    if (!table) return;

    const API = {
      list: '/api/requests',
      // candidates for upload & get
      upA: id => `/api/requests/${encodeURIComponent(id)}/attachments`,
      upAName: (id, name) => `/api/requests/${encodeURIComponent(id)}/attachments/${encodeURIComponent(name)}`,
      upAQuery: (id, name) => `/api/requests/${encodeURIComponent(id)}/attachments?filename=${encodeURIComponent(name)}`,
      upB: id => `/api/requests/attachments?id=${encodeURIComponent(id)}`,
      getA: id => `/api/requests/${encodeURIComponent(id)}/attachments`,
      getB: id => `/api/requests/attachments?id=${encodeURIComponent(id)}`
    };

    let DATA = [];
    const sanitize = window.DOMPurify
      ? html => window.DOMPurify.sanitize(html || '',
          {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
           ALLOWED_ATTR:['href','style','target']})
      : html => String(html||'').replace(/<[^>]+>/g,'');

    const fmtDate = d => d ? new Date(d).toLocaleDateString() : '';
    const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

    async function tryGetAttachments(id){
      const paths = [API.getA(id), API.getB(id)];
      for (const url of paths){
        try{
          const r = await fetch(url);
          if (!r.ok) continue;
          const j = await r.json().catch(()=> ({}));
          const list =
            Array.isArray(j) ? j :
            Array.isArray(j.items) ? j.items :
            Array.isArray(j.value) ? j.value : [];
          if (list.length){
            return list.map(a=>({
              name: a.FileName || a.name || 'file',
              url:  a.ServerRelativeUrl || a.Url || a.url || ''
            }));
          }
        }catch{ /* ignore */ }
      }
      return [];
    }

    function render(filter=''){
      const q = (filter||'').trim().toLowerCase();

      const getInlineAttachments = x => {
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
        const atts = getInlineAttachments(x);
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
        const atts = getInlineAttachments(x);
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
        const payload = await res.json().catch(()=>({ok:false}));
        if(!res.ok || !payload.ok) throw new Error(payload.error || `HTTP ${res.status}`);

        DATA = Array.isArray(payload.items) ? payload.items : [];

        // For items that *claim* attachments but don't include them inline, fetch once.
        const targets = DATA.filter(x => x.Attachments === true && !Array.isArray(x.AttachmentFiles));
        for (const item of targets){
          const id = item.Id || item.ID;
          if (!id) continue;
          const files = await tryGetAttachments(id);
          if (files.length) item.AttachmentFiles = files;
        }

        const q = (pageBox && pageBox.value) || (topBox && topBox.value) || '';
        render(q);
      }catch(err){
        console.error('Requests API error:', err);
        rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Error loading requests: ${String(err.message || err)}</td></tr>`;
      }
    }

    // keep header/page search in sync
    const sync = (v) => {
      if (pageBox && pageBox.value !== v) pageBox.value = v;
      if (topBox  && topBox.value  !== v) topBox.value  = v;
      render(v);
    };
    function debounce(fn, ms=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
    const debouncedSync = debounce(sync, 180);
    pageBox && pageBox.addEventListener('input', e => debouncedSync(e.target.value));
    topBox  && topBox.addEventListener('input',  e => debouncedSync(e.target.value));
    document.querySelector('[data-search-btn]')?.addEventListener('click', ()=> sync((topBox && topBox.value) || ''));

    // banner
    function showNotice(text,type){
      if(!alertBox) return;
      alertBox.textContent = text;
      alertBox.className = `notice ${type}`;   // .notice.success / .notice.error
      setTimeout(()=>{ alertBox.className = 'notice sr-only'; alertBox.textContent=''; }, 5000);
    }

    // try several upload styles so anonymous wrappers work
    async function uploadAttachment(id, file){
      const name = file.name || 'upload.bin';

      // 1) POST multipart -> /{id}/attachments
      try{
        const fd = new FormData();
        fd.append('file', file, name);
        fd.append('name', name);
        fd.append('Attachment', file, name); // some wrappers expect this key
        const r = await fetch(API.upA(id), { method:'POST', body: fd });
        if (r.ok) return true;
      }catch{}

      // 2) POST multipart -> /attachments?id={id}
      try{
        const fd = new FormData();
        fd.append('file', file, name);
        fd.append('name', name);
        const r = await fetch(API.upB(id), { method:'POST', body: fd });
        if (r.ok) return true;
      }catch{}

      // 3) PUT binary -> /{id}/attachments?filename={name}
      try{
        const r = await fetch(API.upAQuery(id, name), {
          method:'PUT',
          body: file,
          headers: { 'X-File-Name': encodeURIComponent(name) }
        });
        if (r.ok) return true;
      }catch{}

      // 4) POST binary -> /{id}/attachments/{name}
      try{
        const r = await fetch(API.upAName(id, name), {
          method:'POST',
          body: file,
          headers: { 'Content-Type': file.type || 'application/octet-stream' }
        });
        if (r.ok) return true;
      }catch{}

      return false;
    }

    // create -> optional upload -> reload
    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      if (formMsg) formMsg.textContent = 'Submitting…';
      alertBox && (alertBox.className = 'notice sr-only');

      try{
        const fd = new FormData(form);
        const file = form.querySelector('#fFile')?.files?.[0] || null;

        if(!fd.get('Title') || !fd.get('RequestType') || !fd.get('Priority')){
          if (formMsg) formMsg.textContent = '';
          showNotice('Please fill Title, Type, and Priority.', 'error');
          return;
        }

        // normalize boolean
        fd.set('RequestEndDate', fd.get('RequestEndDate') ? 'true' : 'false');

        // JSON create only (prevents “Untitled”)
        const body = Object.fromEntries(fd.entries());
        delete body.Attachment; // never send file in JSON
        const createRes = await fetch(API.list, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(body)
        });
        const createJson = await createRes.json().catch(()=>({ok:false}));
        if(!createRes.ok || !createJson.ok) throw new Error(createJson.error || `HTTP ${createRes.status}`);

        const newId = createJson.id || createJson.Id || createJson.item?.Id || createJson.item?.ID;

        if (file && newId){
          await uploadAttachment(newId, file); // best-effort; silent if backend forbids anonymous upload
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
