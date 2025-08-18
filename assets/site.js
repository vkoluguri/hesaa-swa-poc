<script>
/* /assets/site.js */
(function () {
  function setYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('#yr').forEach(el => el.textContent = year);
  }

  function initNav(){
    const btn = document.querySelector('[data-nav-toggle]');
    const nav = document.getElementById('siteNav');
    if (!btn || !nav || btn.dataset.jsbound === '1') return;  // ← guard

    function toggle(open){
      const willOpen = open ?? nav.getAttribute('data-open') !== 'true';
      nav.setAttribute('data-open', String(willOpen));
      btn.setAttribute('aria-expanded', String(willOpen));
    }

    btn.addEventListener('click', () => toggle());
    nav.addEventListener('click', e => { if (e.target.closest('a')) toggle(false); });
    btn.dataset.jsbound = '1'; // ← mark as bound
  }

  function initMobileSearchToggle() {
    const toggleBtn = document.querySelector('.search-toggle');
    const container = document.querySelector('.search-container');
    if (!toggleBtn || !container || toggleBtn.dataset.jsbound === '1') return; // ← guard

    toggleBtn.addEventListener('click', () => {
      container.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target) && e.target !== toggleBtn) {
        container.classList.remove('open');
      }
    });

    toggleBtn.dataset.jsbound = '1'; // ← mark as bound
  }

  function buildBreadcrumbs(){
    if (location.pathname === '/' || document.querySelector('.breadcrumbs')) return;

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

  function init(){
    setYear();
    initNav();
    buildBreadcrumbs();
    initMobileSearchToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('includes:loaded', init);
})();
</script>
