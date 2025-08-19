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
    const rowsEl   = document.getElementById('rows');
    const countEl  = document.getElementById('resultCount');
    const pageBox  = document.getElementById('search');
    const topBox   = document.getElementById('q');
    const form     = document.getElementById('reqForm');
    const formMsg  = document.getElementById('formMsg');      // only shows “Submitting…”
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

    const normaliseAttachments = x => {
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

    async function fetchItemAttachments(id){
      try{
        let r = await fetch(`/api/requests/${encodeURIComponent(id)}/attachments`);
        if (r.status === 404 || r.status === 405 || r.status === 501){
          r = await fetch(`/api/requests/attachments?id=${encodeURIComponent(id)}`);
        }
        if (!r.ok) return [];
        const j = await r.json().catch(()=>({}));
        const files = (j && (j.files || j.items || j.data)) || j || [];
        return Array.isArray(files) ? files.map(a => ({
          name: a.FileName || a.name || 'file',
          url:  a.ServerRelativeUrl || a.Url || a.url || ''
        })) : [];
      }catch{ return []; }
    }

    function render(filter=''){
      const q = (filter||'').trim().toLowerCase();

      const out = DATA.filter(x => {
        const title = (x.Title || x.RequestTitle || '').toLowerCase();
        const type  = (x.RequestType || '').toLowerCase();
        const pri   = (x.Priority || '').toLowerCase();
        const desc  = plain(x.RequestDescription || x.Description || '').toLowerCase();
        const atts  = normaliseAttachments(x);
        if (!q) return true;
        return title.includes(q) || type.includes(q) || pri.includes(q) || desc.includes(q) ||
               atts.some(a => (a.name||'').toLowerCase().includes(q));
      });

      countEl && (countEl.textContent = out.length);

      rowsEl.innerHTML = out.map(x => {
        const atts = normaliseAttachments(x);
        const attCell = atts.length
          ? atts.map(a => a.url
              ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
              : `<span>${a.name}</span>`).join('<br>')
          : (x.Attachments ? '…' : '—');

        return `
          <tr data-id="${x.Id || x.ID || x.id || ''}">
            <td>${x.Title || x.RequestTitle || ''}</td>
            <td>${x.RequestType || ''}</td>
            <td>${x.Priority || ''}</td>
            <td>${fmtDate(x.RequestDate)}</td>
            <td>${x.RequestEndDate ? 'Yes':'No'}</td>
            <td>${fmtDate(x.Created)}</td>
            <td>${fmtDate(x.Modified)}</td>
            <td class="att-cell">${attCell}</td>
            <td><details><summary>View</summary><div>${plain(x.RequestDescription || x.Description)}</div></details></td>
          </tr>`;
      }).join('') || `<tr><td colspan="9" class="kpi">No results</td></tr>`;

      const needs = Array.from(rowsEl.querySelectorAll('tr')).filter(tr=>{
        const id = tr.getAttribute('data-id');
        const row = DATA.find(r => (r.Id||r.ID||r.id) == id);
        return row && row.Attachments && normaliseAttachments(row).length === 0;
      });

      if (needs.length){
        needs.forEach(async tr=>{
          const id = tr.getAttribute('data-id');
          const cell = tr.querySelector('.att-cell');
          const files = await fetchItemAttachments(id);
          cell.innerHTML = files.length
            ? files.map(a => a.url
                ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
                : `<span>${a.name}</span>`).join('<br>')
            : '—';
        });
      }
    }

    window.filterRequestsTable = render;

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

    // --- CREATE ITEM: try JSON+upload, fall back to single multipart ---
    form && form.addEventListener('submit', async e=>{
      e.preventDefault();
      formMsg && (formMsg.textContent = 'Submitting…');
      alertBox && (alertBox.className = 'notice sr-only');

      try{
        const fd = new FormData(form);
        const fileInput = form.querySelector('#fFile');
        const file = fileInput && fileInput.files && fileInput.files[0];

        const payload = {
          Title: (fd.get('Title') || fd.get('RequestTitle') || '').trim(),
          RequestTitle: (fd.get('RequestTitle') || '').trim(),
          RequestDescription: fd.get('RequestDescription') || fd.get('Description') || '',
          RequestType: fd.get('RequestType') || '',
          Priority: fd.get('Priority') || '',
          RequestDate: fd.get('RequestDate') || '',
          RequestEndDate: !!fd.get('RequestEndDate')
        };
        if (!payload.Title && payload.RequestTitle) payload.Title = payload.RequestTitle;

        if (!payload.Title || !payload.RequestType || !payload.Priority){
          formMsg && (formMsg.textContent = '');
          showNotice('Please fill Title, Type, and Priority.', 'error');
          return;
        }

        // Path A: create JSON, then upload attachment
        let createdId = null;
        let pathAWorked = false;
        try{
          const createRes = await fetch('/api/requests', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(payload)
          });
          const createJson = await createRes.json().catch(()=>({ok:false,error:`HTTP ${createRes.status} ${createRes.statusText}`}));
          if(!createRes.ok || !createJson.ok) throw new Error(createJson.error || `HTTP ${createRes.status}`);

          createdId = createJson.id || createJson.Id || createJson.itemId || (createJson.item && (createJson.item.Id||createJson.item.id));

          if (file && createdId){
            const upFd = new FormData();
            upFd.append('file', file, file.name);
            let upRes = await fetch(`/api/requests/${encodeURIComponent(createdId)}/attachments`, { method:'POST', body: upFd });

            if (upRes.status === 404 || upRes.status === 405 || upRes.status === 501){
              upRes = await fetch(`/api/requests/attachments?id=${encodeURIComponent(createdId)}`, { method:'POST', body: upFd });
            }
            if (!upRes.ok){
              const t = await upRes.text().catch(()=>(''));
              throw new Error(`Attachment upload failed: ${t || upRes.status}`);
            }
          }
          pathAWorked = true;
        }catch(errA){
          // Only fall back if the problem is "endpoint not supported / not found"
          if (!(String(errA).includes('404') || String(errA).includes('405') || String(errA).includes('501'))){
            // real error, surface it
            throw errA;
          }
        }

        // Path B: single multipart (fields + file)
        if (!pathAWorked){
          const mfd = new FormData();
          // append fields explicitly so Title never goes missing
          mfd.append('Title', payload.Title);
          mfd.append('RequestTitle', payload.RequestTitle || payload.Title);
          mfd.append('RequestDescription', payload.RequestDescription);
          mfd.append('RequestType', payload.RequestType);
          mfd.append('Priority', payload.Priority);
          if (payload.RequestDate) mfd.append('RequestDate', payload.RequestDate);
          mfd.append('RequestEndDate', payload.RequestEndDate ? 'true' : 'false');
          if (file){
            // add under both keys to satisfy various server expectations
            mfd.append('Attachment', file, file.name);
            mfd.append('file', file, file.name);
          }
          const mres = await fetch('/api/requests', { method:'POST', body: mfd });
          const mjson = await mres.json().catch(()=>({ok:false,error:`HTTP ${mres.status} ${mres.statusText}`}));
          if(!mres.ok || !mjson.ok) throw new Error(mjson.error || `HTTP ${mres.status}`);
        }

        formMsg && (formMsg.textContent = '');
        showNotice('Request successfully created.', 'success');
        form.reset();
        await loadData();
      }catch(err){
        formMsg && (formMsg.textContent = '');
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
