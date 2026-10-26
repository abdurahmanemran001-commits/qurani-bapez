window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=10';
  s.async = true;
  document.head.appendChild(s);

  /* Immersive reading: only the Madinah page is visible.
     Tap empty area / page margin to toggle chrome (appbar, nav, bars). */
  var style = document.createElement('style');
  style.textContent = [
    '/* always hide the old status card under the page */',
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
    'html.immersive-mushaf #madaniWrap {',
    '  min-height: 100vh;',
    '}',

    '/* tiny hint when chrome is hidden */',
    '#immersiveHint {',
    '  display: none;',
    '  position: fixed;',
    '  top: 8px;',
    '  left: 50%;',
    '  transform: translateX(-50%);',
    '  z-index: 50;',
    '  background: rgba(23,63,53,0.72);',
    '  color: #fff;',
    '  font-size: 11px;',
    '  padding: 4px 12px;',
    '  border-radius: 999px;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transition: opacity .3s;',
    '}',
    'html.immersive-mushaf #immersiveHint.show {',
    '  display: block;',
    '  opacity: 1;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  var immersive = false;
  var hintTimer = null;

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

  // Enter immersive when opening a page (reader view)
  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__immersiveHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      // slight delay so view switch completes
      setTimeout(function () {
        if (isReaderActive()) setImmersive(true);
      }, 60);
      return ret;
    };
    window.openPage.__immersiveHooked = true;
  }

  // Tap empty area toggles chrome. Do NOT steal taps on ayah overlay / controls.
  function onDocTap(e) {
    if (!isReaderActive()) return;
    var t = e.target;
    if (!t || !t.closest) return;
    // ignore UI controls when chrome is visible
    if (
      t.closest(
        '.appbar, .bottom, .readerhead, .readerbar, #madaniPlayer, button, select, input, a, .modal, .sheet'
      )
    )
      return;
    // if tap landed on an ayah hit-box, madani-ayah handles play — don't toggle
    if (t.closest('#madaniOverlay') && t !== document.getElementById('madaniOverlay')) {
      // clicked a child of overlay (ayah region) — leave for audio
      return;
    }
    // clicked the page image / empty overlay / white margin → toggle
    if (
      t.id === 'pageImg' ||
      t.id === 'madaniOverlay' ||
      t.id === 'madaniWrap' ||
      t.closest('.mushaf') ||
      t.id === 'reader'
    ) {
      // small delay so madani click handler can run first if it was an ayah
      setTimeout(function () {
        // if madani just started play, label changes — still allow toggle on empty
        toggleImmersive();
      }, 10);
    }
  }

  // Use pointerup so it works on mobile; avoid double-fire with click
  var lastToggle = 0;
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
    // ayah hit boxes have class ma-hit or are children with dataset — madani uses overlay only
    // Detect ayah by checking if point hits a highlighted area after madani runs is hard;
    // instead: only toggle when target is the overlay root or the image itself (not a child hit)
    var isEmpty =
      t.id === 'pageImg' ||
      t.id === 'madaniOverlay' ||
      t.id === 'madaniWrap' ||
      (t.classList && t.classList.contains('mushaf'));
    if (!isEmpty) return;
    var now = Date.now();
    if (now - lastToggle < 350) return;
    lastToggle = now;
    // Delay: if madani playAyah fires, it means ayah was hit — skip toggle
    var playBefore = window.__madaniLastPlayTs || 0;
    setTimeout(function () {
      var playAfter = window.__madaniLastPlayTs || 0;
      if (playAfter > playBefore) return; // ayah was activated
      toggleImmersive();
    }, 40);
  }

  function boot() {
    hookOpenPage();
    document.addEventListener('pointerup', onPointer, true);
    // if already on reader (refresh), restore preference or default immersive
    if (isReaderActive()) {
      var pref = true;
      try {
        var v = localStorage.getItem('immersive_mushaf');
        if (v === '0') pref = false;
      } catch (e) {}
      setImmersive(pref);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 80);
      setTimeout(boot, 500);
    });
  } else {
    setTimeout(boot, 80);
    setTimeout(boot, 500);
  }
  var tries = 0;
  var t = setInterval(function () {
    hookOpenPage();
    if (++tries > 20) clearInterval(t);
  }, 250);
})();
