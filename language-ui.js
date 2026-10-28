window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=21';
  s.async = true;
  document.head.appendChild(s);

  var s2 = document.createElement('script');
  s2.src = 'mushaf/ayah-actions.js?v=4';
  s2.async = true;
  document.head.appendChild(s2);

  var s3 = document.createElement('script');
  s3.src = 'zikr-enhance.js?v=4';
  s3.async = true;
  document.head.appendChild(s3);

  var s4 = document.createElement('script');
  s4.src = 'zikr-streak.js?v=3';
  s4.async = true;
  document.head.appendChild(s4);

  var s5 = document.createElement('script');
  s5.src = 'tasbih.js?v=3';
  s5.async = true;
  document.head.appendChild(s5);

  var st = document.createElement('style');
  st.textContent = [
    '.phone:has(#reader.active) .appbar,',
    '.phone:has(#reader.active) .readerhead,',
    '.phone:has(#reader.active) .readerbar,',
    '.phone:has(#reader.active) #reader > .card,',
    '.phone:has(#reader.active) .bottom { display: none !important; }',
    '.phone:has(#reader.active) .main {',
    '  height: 100% !important;',
    '  padding-top: calc(8px + env(safe-area-inset-top)) !important;',
    '  padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;',
    '}',
  ].join('\n');
  document.head.appendChild(st);

  var m = document.getElementById('mushaf');
  if (m) {
    var sx = 0, sy = 0, t0 = 0;
    m.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      sx = t.clientX; sy = t.clientY; t0 = Date.now();
    }, { passive: true, capture: true });
    m.addEventListener('touchend', function (e) {
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy) && Date.now() - t0 < 800) {
        e.stopPropagation();
        e.preventDefault();
        if (typeof changePage === 'function') changePage(dx > 0 ? 1 : -1);
      }
    }, { passive: false, capture: true });
  }
})();
