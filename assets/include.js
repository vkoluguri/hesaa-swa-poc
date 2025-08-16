// Simple HTML include: <div data-include="/partials/header.html"></div>
(async () => {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all([...slots].map(async el => {
    try{
      const url = el.getAttribute('data-include');
      const res = await fetch(url, {cache:'no-store'});
      el.innerHTML = await res.text();
    }catch(e){ el.innerHTML = '<!-- include failed -->'; }
  }));

  // Mark active nav link based on current path
  const path = location.pathname.replace(/\/+$/,'') || '/';
  document.querySelectorAll('[data-active]').forEach(a=>{
    const href = a.getAttribute('href');
    if ((href === '/' && path === '/') || (href !== '/' && path.startsWith(href)))
      a.setAttribute('aria-current','page');
  });
})();
