<!-- /assets/site.js -->
<script>
/* site behavior */
(function(){
  /* ---------- Utilities ---------- */
  const once = (el, key) => {
    if (!el || el.dataset[key] === '1') return true;
    el.dataset[key] = '1';
    return false;
  };
  const qs  = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  function ensureFavicon(){
    const have = document.querySelector('link[rel~="icon"]');
    if (!have){
      const link = document.createElement('link');
      link.rel  = 'icon';
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
    // fill any #yr spans
    document.querySelectorAll('#yr').forEach(el => { if (el.textContent !== year) el.textContent = year; });
    // fallback: if no #yr found, patch footer text once
    const ft = document.querySelector('.ft-copy');
    if (ft && !/20\d{2}/.test(ft.textContent)) ft.innerHTML = `© <span id="yr">${year}</span> HESAA. All rights reserved.`;
  }

  const isHome = () => {
    const p = location.pathname.replace(/\/+$/,'') || '/';
    return p === '/' || /\/index\.html?$/i.test(p);
  };

  /* ---------- Nav (hamburger / sheet) ---------- */
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

  /* ---------- Header Search ---------- */
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

      filterRequestsTable(q);
      container.classList.remove('open');
      toggleBtn.blur();
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
  // Assign hero images (IDs must be on <img> tags in index.html)
  setApiImg('heroHeaderImg', 'Hero.png');
  setApiImg('slide1', 'Slide1.png');
  setApiImg('slide2', 'Slide2.png');
  setApiImg('slide3', 'Slide3.png');

  /* =======================================================
     Requests app (table + form)
     ======================================================= */
  (function RequestsApp(){
    const table    = document.getElementById('requestsTable');
    if (!table) return; // Not on the home/requests page

    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search'); // on-page filter
    const topBox   = document.getElementById('q');      // header search
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg');
    const alertBox = document.getElementById('alert');

    let DATA = [];

    const sanitize = window.DOMPurify
      ? html => window.DOMPurify.sanitize(html || '',
          {ALLOWED_TAGS:['b','i','em','strong','u','span','div','p','ul','ol','li','br','a'],
           ALLOWED_ATTR:['href','style','target']})
      : html => String(html||'').replace(/<[^>]+>/g,'');

    const fmt = d => d ? new Date(d).toLocaleDateString() : '';
    const plain = html => (sanitize ? sanitize(html) : String(html||'').replace(/<[^>]+>/g,''));

    // normalize attachments from various API shapes
    const getAttachments = x => {
      if (Array.isArray(x?.AttachmentFiles)) {
        return x.AttachmentFiles.map(a => ({
          name: a.FileName || a.name || 'file',
          url:  a.ServerRelativeUrl || a.Url || a.url || ''
        }));
      }
      if (Array.isArray(x?.Attachments)) {
        return x.Attachments.map(a => ({
          name: a.FileName || a.name || 'file',
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
        let attCell = '—';

        if (atts.length){
          attCell = atts.map(a => a.url
            ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
            : `<span>${a.name}</span>`
          ).join('<br>');
        } else if (x.HasAttachments && x.Id){
          // lazy-load when clicked
          attCell = `<a href="#" class="link" data-load-atts="${x.Id}">View</a>`;
        }

        return `
          <tr>
            <td>${x.Title ?? ''}</td>
            <td>${x.RequestType ?? ''}</td>
            <td>${x.Priority ?? ''}</td>
            <td>${fmt(x.RequestDate)}</td>
            <td>${x.RequestEndDate ? 'Yes':'No'}</td>
            <td>${fmt(x.Created)}</td>
            <td>${fmt(x.Modified)}</td>
            <td>${attCell}</td>
            <td><details><summary>View</summary><div>${plain(x.RequestDescription)}</div></details></td>
          </tr>`;
      }).join('') || `<tr><td colspan="9" class="kpi">No results</td></tr>`;

      // Attach lazy-load handlers (only once per render)
      qsa('[data-load-atts]').forEach(a=>{
        if (once(a,'atts')) return;
        a.addEventListener('click', async (e)=>{
          e.preventDefault();
          const id = a.getAttribute('data-load-atts');
          try{
            a.textContent = 'Loading…';
            const res = await fetch(`/api/requests/${encodeURIComponent(id)}/attachments`);
            const json = await res.json();
            if (Array.isArray(json?.items) && json.items.length){
              a.outerHTML = json.items.map(f => f.url
                ? `<a href="${f.url}" target="_blank" rel="noopener">${f.name||'file'}</a>`
                : `<span>${f.name||'file'}</span>`
              ).join('<br>');
            }else{
              a.outerHTML = '—';
            }
          }catch{
            a.outerHTML = '—';
          }
        });
      });
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
    const debounce = (fn, ms=200)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
    const debouncedSync = debounce(sync, 180);

    pageBox && pageBox.addEventListener('input', e => debouncedSync(e.target.value));
    topBox  && topBox.addEventListener('input',  e => debouncedSync(e.target.value));

    const topBtn = document.querySelector('[data-search-btn]');
    topBtn && topBtn.addEventListener('click', ()=> sync((topBox && topBox.value) || ''));

    // notices
    function showNotice(text,type){
      alertBox.textContent = text;
      alertBox.className = `notice ${type}`;
      setTimeout(()=>{ alertBox.className = 'notice sr-only'; alertBox.textContent=''; }, 5000);
    }

    // Build a clean multipart body so text fields never get lost when a file is present
    function buildMultipartFromForm(form){
      const f = new FormData();
      // text fields (normalize + trim)
      f.append('Title', (qs('#fTitle', form)?.value || '').trim());
      f.append('RequestDescription', qs('#fDesc', form)?.value || '');
      f.append('RequestType', qs('#fType', form)?.value || '');
      f.append('Priority', qs('#fPri', form)?.value || '');
      f.append('RequestEndDate', qs('#fEnd', form)?.checked ? 'true' : 'false');

      // file(s)
      const fileInput = qs('#fFile', form);
      if (fileInput && fileInput.files && fileInput.files.length){
        // append all files; backend may accept "Attachment" or "Attachments[]"
        Array.from(fileInput.files).forEach((file,i)=>{
          f.append('Attachment', file, file.name);
        });
      }
      return f;
    }

    // create form POST -> /api/requests
    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      formMsg.textContent = 'Submitting…';
      alertBox.className = 'notice sr-only';

      // basic required checks
      const title = (qs('#fTitle', form)?.value || '').trim();
      const type  = (qs('#fType',  form)?.value || '').trim();
      const prio  = (qs('#fPri',   form)?.value || '').trim();
      if(!title || !type || !prio){
        formMsg.textContent = '';
        showNotice('Please fill Title, Type, and Priority.', 'error');
        return;
      }

      try{
        // Build controlled FormData (prevents "Untitled" when files are present)
        const body = buildMultipartFromForm(form);
        const hasFile = body.getAll('Attachment').length > 0;

        const res  = await fetch('/api/requests', {
          method:'POST',
          body // multipart when files, still fine when none
        });

        const json = await res.json().catch(()=>({ok:false,error:`HTTP ${res.status} ${res.statusText}`}));
        if(!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);

        formMsg.textContent = '';
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
    setYear();              // copyright
    initNav();              // hamburger sheet
    initSearch();           // header search
    buildBreadcrumbs();     // breadcrumbs
    ensureFavicon();        // favicon
    highlightCurrentNav();  // active nav
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('includes:loaded', init);
})();
</script>
