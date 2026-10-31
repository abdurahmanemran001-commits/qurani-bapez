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

  var s6 = document.createElement('script');
  s6.src = 'ruqyah.js?v=5';
  s6.async = true;
  document.head.appendChild(s6);

  var sr = document.createElement('script');
  sr.src = 'ruqyah-reciters.js?v=7';
  sr.async = true;
  document.head.appendChild(sr);

  var sy = document.createElement('script');
  sy.src = 'ruqyah-youtube.js?v=1';
  sy.async = true;
  document.head.appendChild(sy);

  function loadScript(src) {
    return new Promise(function (resolve) {
      var el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = resolve;
      el.onerror = resolve;
      document.head.appendChild(el);
    });
  }

  loadScript('ai-config.js?v=2')
    .then(function () { return loadScript('ai-rag.js?v=2'); })
    .then(function () { return loadScript('ai-shari-rag.js?v=8'); })
    .then(function () { return loadScript('ai-shari-kb.js?v=5'); })
    .then(function () { return loadScript('ai-shari-kb-p2.js?v=1'); })
    .then(function () { return loadScript('ai-shari-kb-p3.js?v=1'); })
    .then(function () { return loadScript('ai-shari-kb-p4.js?v=1'); })
    .then(function () { return loadScript('ai-shari.js?v=13'); })
    .then(function () { return loadScript('hadith.js?v=6'); })
    .then(function () { return loadScript('hadith-ai.js?v=1'); })
    .then(function () { return loadScript('seerah.js?v=1'); });

  var sp = document.createElement('script');
  sp.src = 'salah-places-data.js?v=1';
  sp.onload = function () {
    var s7 = document.createElement('script');
    s7.src = 'salah.js?v=8';
    s7.onload = function () {
      var s8 = document.createElement('script');
      s8.src = 'salah-settings.js?v=2';
      s8.async = true;
      document.head.appendChild(s8);
    };
    s7.async = true;
    document.head.appendChild(s7);
  };
  sp.onerror = function () {
    var s7 = document.createElement('script');
    s7.src = 'salah.js?v=8';
    s7.onload = function () {
      var s8 = document.createElement('script');
      s8.src = 'salah-settings.js?v=2';
      document.head.appendChild(s8);
    };
    document.head.appendChild(s7);
  };
  document.head.appendChild(sp);

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
})();
