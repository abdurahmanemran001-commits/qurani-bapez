/* Route mushaf page opens to the interactive reader (ayah-tap + audio) */
(function () {
  function go(p) {
    p = Math.max(1, Math.min(604, Number(p) || 1));
    try { localStorage.setItem('preview_page', String(p)); } catch (e) {}
    location.href = 'mushaf/?p=' + p;
  }
  window.openPage = go;
})();
