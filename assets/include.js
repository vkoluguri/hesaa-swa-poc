// /assets/include.js
(function () {
  async function inject(el) {
    const url = el.getAttribute('data-include');
    if (!url) return;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Include failed: ${url} (${res.status})`);
    const html = await res.text();
    // Replace the placeholder node with the fetched markup
    el.outerHTML = html;
  }

  async function runIncludes() {
    const nodes = Array.from(document.querySelectorAll('[data-include]'));
    await Promise.all(nodes.map(inject));
    // IMPORTANT: tell the page we're done
    window.dispatchEvent(new CustomEvent('includes:loaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runIncludes);
  } else {
    runIncludes();
  }
})();
window.addEventListener('includes:loaded', () => {
  const topSearch = document.getElementById('topSearch');
  const topSearchBtn = document.getElementById('topSearchBtn');
  const pageSearch = document.getElementById('search');
  if (!topSearch || !pageSearch) return;

  const sync = v => { pageSearch.value = v; pageSearch.dispatchEvent(new Event('input', {bubbles:true})); }
  topSearch.addEventListener('input', e => sync(e.target.value));
  topSearchBtn?.addEventListener('click', () => sync(topSearch.value));
});
