window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=19';
  s.async = true;
  document.head.appendChild(s);

  /* Reader only: hide the green top bar, the "فهرست / ڕەنگاوڕەنگ / 604" header and the bottom menu.
     The audio player (#madaniPlayer) and the page number bar are NOT touched. */
  var st = document.createElement('style');
  st.textContent = [
    '.phone:has(#reader.active) .appbar,',
    '.phone:has(#reader.active) .readerhead,',
    '.phone:has(#reader.active) .bottom { display: none !important; }',
    '.phone:has(#reader.active) .main {',
    '  height: 100% !important;',
    '  padding-top: calc(8px + env(safe-area-inset-top)) !important;',
    '  padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;',
    '}',
  ].join('\n');
  document.head.appendChild(st);
})();
