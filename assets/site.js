<script>
  (function(){
    function setYear(){
      document.querySelectorAll('#yr').forEach(el=>{
        if(!el.textContent) el.textContent = new Date().getFullYear();
      });
    }
    document.addEventListener('DOMContentLoaded', setYear);
    window.addEventListener('includes:loaded', setYear);
  })();
</script>
