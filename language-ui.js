window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  // Load working madani-ayah from last known-good commit (local file was accidentally truncated)
  var s = document.createElement('script');
  s.src =
    'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@4efc8d7c215643cc45521ec9845d51ee544890c0/madani-ayah.js';
  s.async = true;
  document.head.appendChild(s);

  /* Immersive reading: only the Madinah page is visible.
     Tap empty area of the page to toggle chrome (appbar, nav, bars). */
  var style = document.createElement('style');
  style.textContent = [
    '#reader > .card { display: none !important; }',

    'html.immersive-mushaf .appbar,',
    'html.immersive-mushaf .bottom,',
    'html.immersive-mushaf .readerhead,',
    'html.immersive-mushaf .readerbar,',
    'html.immersive-mushaf #madaniPlayer {',
    '  display: none !important;',
    '}',

    'html.immersive-mushaf .phone {',
    '  height: 100vh !important;',
    '  max-height: 100vh !important;',
    '}',
    'html.immersive-mushaf .content {',
    '  top: 0 !important;',
    '  bottom: 0 !important;',
    '  padding: 0 !important;',
    '  overflow: hidden !important;',
    '}',
    'html.immersive-mushaf #reader {',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '  height: 100% !important;',
    '}',
    'html.immersive-mushaf .mushaf {',
    '  min-height: 100vh !important;',
    '  height: 100vh !important;',
    '  max-height: 100vh !important;',
    '  border-radius: 0 !important;',
    '  padding: 0 !important;',
    '  background: #fff !important;',
    '  box-shadow: none !important;',
    '}',
    'html.immersive-mushaf .mushaf img,',
    'html.immersive-mushaf #pageImg {',
    '  max-height: 100vh !important;',
    '  width: 100% !important;',
    '  height: auto !important;',
    '  object-fit: contain !important;',
    '  box-shadow: none !important;',
    '}',
    'html.immersive-mushaf #madaniWrap { min-height: 100vh; }',

    '#immersiveHint {',
    '  display: none; position: fixed; top: 8px; left: 50%; transform: translateX(-50%);',
    '  z-index: 50; background: rgba(23,63,53,0.72); color: #fff; font-size: 11px;',
    '  padding: 4px 12px; border-radius: 999px; pointer-events: none; opacity: 0; transition: opacity .3s;',
    '}',
    'html.immersive-mushaf #immersiveHint.show { display: block; opacity: 1; }',
  ].join('\n');
  document.head.appendChild(style);

  var immersive = false;
  var hintTimer = null;
  var lastToggle = 0;

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function showHintBriefly() {
    var h = document.getElementById('immersiveHint');
    if (!h) {
      h = document.createElement('div');
      h.id = 'immersiveHint';
      h.textContent = 'پەنجە بدە بۆ پیشاندانی مێنو';
      document.body.appendChild(h);
    }
    h.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      h.classList.remove('show');
    }, 1800);
  }

  function setImmersive(on) {
    immersive = !!on;
    document.documentElement.classList.toggle('immersive-mushaf', immersive);
    try {
      localStorage.setItem('immersive_mushaf', immersive ? '1' : '0');
    } catch (e) {}
    if (immersive) showHintBriefly();
  }

  function toggleImmersive() {
    if (!isReaderActive()) return;
    setImmersive(!immersive);
  }

  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__immersiveHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(function () {
        if (isReaderActive()) setImmersive(true);
      }, 60);
      return ret;
    };
    window.openPage.__immersiveHooked = true;
  }

  function onPointer(e) {
    if (!isReaderActive()) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (
      t.closest(
        '.appbar, .bottom, .readerhead, .readerbar, #madaniPlayer, button, select, input, a, .modal, .sheet'
      )
    )
      return;

    // Only toggle on empty page area (image / overlay root), not when ayah was hit.
    // Madani creates no child nodes for hit-testing except highlight .ma-hl (pointer-events:none).
    // Overlay is one div; clicks always target overlay or img.
    var isPage =
      t.id === 'pageImg' ||
      t.id === 'madaniOverlay' ||
      t.id === 'madaniWrap' ||
      (t.classList && t.classList.contains('mushaf'));
    if (!isPage) return;

    var now = Date.now();
    if (now - lastToggle < 400) return;
    lastToggle = now;

    // If audio started within this gesture, skip toggle (ayah play).
    var playBefore = window.__madaniLastPlayTs || 0;
    setTimeout(function () {
      var playAfter = window.__madaniLastPlayTs || 0;
      if (playAfter > playBefore) return;
      // Also skip if highlight just appeared (ayah tap without audio yet)
      toggleImmersive();
    }, 50);
  }

  // Patch playAyah after madani loads to set timestamp
  function patchMadaniPlay() {
    if (!window.__madaniAyahInstalled) return false;
    // wrap by intercepting Audio play is heavy; instead observe overlay clicks
    var ov = document.getElementById('madaniOverlay');
    if (!ov || ov.__stampBound) return !!ov;
    ov.__stampBound = true;
    ov.addEventListener(
      'click',
      function () {
        window.__madaniLastPlayTs = Date.now();
      },
      true
    );
    return true;
  }

  function boot() {
    hookOpenPage();
    document.addEventListener('pointerup', onPointer, true);
    patchMadaniPlay();
    if (isReaderActive()) {
      var pref = true;
      try {
        if (localStorage.getItem('immersive_mushaf') === '0') pref = false;
      } catch (e) {}
      setImmersive(pref);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 80);
      setTimeout(boot, 600);
      setTimeout(boot, 1500);
    });
  } else {
    setTimeout(boot, 80);
    setTimeout(boot, 600);
    setTimeout(boot, 1500);
  }
  var tries = 0;
  var t = setInterval(function () {
    hookOpenPage();
    patchMadaniPlay();
    if (++tries > 30) clearInterval(t);
  }, 200);
})();
