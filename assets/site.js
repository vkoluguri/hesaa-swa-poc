<script>
/* /assets/site.js */
(function () {
  function setYear(){
    document.querySelectorAll('#yr').forEach(el=>{
      if(!el.textContent) el.textContent = new Date().getFullYear();
    });
  }

  function initNav(){
    const btn = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('siteNav');
    if (!btn || !nav) return;

    function toggle(open){
      const willOpen = open ?? nav.getAttribute('data-open') !== 'true';
      nav.setAttribute('data-open', String(willOpen));
      btn.setAttribute('aria-expanded', String(willOpen));
    }

    btn.addEventListener('click', () => toggle());
    // Close menu after clicking a link (mobile)
    nav.addEventListener('click', e => { if (e.target.closest('a')) toggle(false); });
  }
  function initMobileSearchToggle() {
  const toggleBtn = document.querySelector('.search-toggle');
  const container = document.querySelector('.search-container');

  if (toggleBtn && container) {
    toggleBtn.addEventListener('click', () => {
      container.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        container.classList.remove('open');
      }
    });
  }
}


  function buildBreadcrumbs(){
    if (location.pathname === '/' || document.querySelector('.breadcrumbs')) return;

    const headerWrap = document.querySelector('.site-header .wrap');
    if (!headerWrap) return;

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

    const nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    nav.setAttribute('aria-label','Breadcrumb');
    nav.innerHTML = `<ol><li><a href="/">Home</a></li>${parts.length ? '<li>/</li>' : ''}${parts.join('<li>/</li>')}</ol>`;

    // Insert right after the header bar
    headerWrap.insertAdjacentElement('afterend', nav);
  }

function init(){
  setYear();
  initNav();
  buildBreadcrumbs();
  initMobileSearchToggle(); // ← add this
}


  // Run on DOM ready and after includes are injected
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('includes:loaded', init);
})();
</script>
