
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

  /* =======================================================
     Requests app (table + form)
     ======================================================= */
  (function RequestsApp(){
    const table    = document.getElementById('requestsTable');
    if (!table) return; // only run on the page that has the table

    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search'); // on-page filter
    const topBox   = document.getElementById('q');      // header search
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg'); // “Submitting…”
    const alertBox = document.getElementById('alert');

    let DATA = [];

    const sanitize = window.DOMPurify
      ? html => window.DOMPurify.sanitize(html || '',
          {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
           ALLOWED_ATTR:['href','style','target']})
      : html => String(html||'').replace(/<[^>]+>/g,'');

    const fmtDate = d => d ? new Date(d).toLocaleDateString() : '';
    const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

    /* ---------- Attachment normalization ---------- */
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

    /* ---------- Table render ---------- */
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
          : (x.HasAttachments && x.Id ? `<a href="#" class="link" data-load-atts="${x.Id}">View</a>` : '—');

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

      // lazy load links
      document.querySelectorAll('[data-load-atts]').forEach(a=>{
        if (once(a,'atts')) return;
        a.addEventListener('click', e=>{
          e.preventDefault();
          const id = a.getAttribute('data-load-atts');
          loadAttachmentsForRow(id, a);
        });
      });
    }
    window.filterRequestsTable = render; // for header search

    /* ---------- Robust attachment enrichment ---------- */
    async function tryJson(url){
      try{
        const r = await fetch(url);
        if(!r.ok) return null;
        return await r.json().catch(()=>null);
      }catch{ return null; }
    }
    function extractFiles(obj){
      if (!obj) return [];
      if (Array.isArray(obj)) return obj;
      if (Array.isArray(obj.items)) return obj.items;
      if (obj.AttachmentFiles) return obj.AttachmentFiles;
      if (obj.Attachments) return obj.Attachments;
      if (obj.File || obj.Files) return [].concat(obj.File||[], obj.Files||[]);
      return [];
    }
    function mapFiles(arr){
      return arr.map(a=>({
        name: a.FileName || a.Name || a.name || 'file',
        url:  a.ServerRelativeUrl || a.Url || a.url || ''
      })).filter(x=>x.name);
    }

    async function loadAttachmentsForRow(id, anchorEl){
      if (!id) return;
      anchorEl.textContent = 'Loading…';

      // Try several endpoints; first one that yields files wins
      const urls = [
        `/api/requests/${encodeURIComponent(id)}/attachments`,
        `/api/requests/${encodeURIComponent(id)}?expand=attachments`,
        `/api/requests/${encodeURIComponent(id)}`,
        `/api/requests/${encodeURIComponent(id)}/files`
      ];

      let files = [];
      for (const u of urls){
        const j = await tryJson(u);
        const raw = extractFiles(j);
        const mapped = mapFiles(raw);
        if (mapped.length){
          files = mapped;
          console.debug('[attachments] using', u, mapped);
          break;
        }
      }

      if (files.length){
        anchorEl.outerHTML = files.map(f => f.url
          ? `<a href="${f.url}" target="_blank" rel="noopener">${f.name}</a>`
          : `<span>${f.name}</span>`
        ).join('<br>');
      }else{
        anchorEl.outerHTML = '—';
      }
    }

    async function enrichMissingAttachments(items){
      const targets = items.filter(x => getAttachments(x).length === 0 && (x.HasAttachments || x.Id)).slice(0, 20);
      for (const x of targets){
        const dummy = document.createElement('a');
        dummy.setAttribute('data-load-atts', x.Id);
        await loadAttachmentsForRow(x.Id, dummy);
        if (dummy.outerHTML !== '—'){
          // crude parse to push into row (not strictly needed; UI already shows via lazy link)
          // we rely on on-demand links for clarity
        }
      }
    }

    /* ---------- Load data ---------- */
    async function loadData(){
      rowsEl.innerHTML = `<tr><td colspan="9" class="kpi">Loading…</td></tr>`;
      try{
        const res = await fetch('/api/requests');
        let payload;
        try{ payload = await res.json(); }catch{ payload = { ok:false, error: `HTTP ${res.status} ${res.statusText}` }; }
        if(!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
        if(!payload.ok) throw new Error(payload.error || 'Unknown API error');

        DATA = Array.isArray(payload.items) ? payload.items : [];

        // Hydrate attachments if server doesn't expand them
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

    /* ---------- Submit (always multipart) ---------- */
    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      if (formMsg) formMsg.textContent = 'Submitting…';
      alertBox && (alertBox.className = 'notice sr-only');

      try{
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

        // Always multipart to avoid servers that ignore JSON+file mixes
        const fd = new FormData();
        fd.append('Title',              title);
        fd.append('RequestDescription', desc);
        fd.append('RequestType',        type);
        fd.append('Priority',           pri);
        fd.append('RequestEndDate',     endDate);

        const files = (fileEl && fileEl.files) ? Array.from(fileEl.files) : [];
        if (files.length){
          // primary expected name
          const primaryName = (fileEl.getAttribute('name') || 'Attachment');
          files.forEach(f => fd.append(primaryName, f, f.name));
          // compatibility aliases (some backends expect other keys)
          files.forEach(f => fd.append('Attachments', f, f.name));
          files.forEach(f => fd.append('files[]', f, f.name));
          files.forEach(f => fd.append('file', f, f.name));
        }

        // DO NOT set Content-Type header; let the browser set multipart boundary
        const res  = await fetch('/api/requests', { method:'POST', body: fd });
        const json = await res.json().catch(()=>({ok:false,error:`HTTP ${res.status} ${res.statusText}`}));
        if(!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);

        if (formMsg) formMsg.textContent = '';
        showNotice('Request successfully created.', 'success');
        form.reset();
        await loadData();
      }catch(err){
        if (formMsg) formMsg.textContent = '';
        console.error('Submit error:', err);
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

