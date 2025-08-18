/*! simple includes loader */
(function(){
  async function inject(el){
    const src = el.getAttribute('data-include');
    if(!src) return;
    try{
      const res = await fetch(src, {cache:'no-cache'});
      const html = await res.text();
      el.outerHTML = html;
    }catch(e){
      console.error('Include failed:', src, e);
    }
  }
  async function run(){
    const nodes = Array.from(document.querySelectorAll('[data-include]'));
    for(const el of nodes){ await inject(el); }
    window.dispatchEvent(new CustomEvent('includes:loaded'));
  }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', run); }
  else{ run(); }
})();
