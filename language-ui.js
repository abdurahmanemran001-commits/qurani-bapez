window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src =
    'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@4efc8d7c215643cc45521ec9845d51ee544890c0/madani-ayah.js';
  s.async = true;
  document.head.appendChild(s);

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

    'html.immersive-mushaf .phone { height: 100vh !important; max-height: 100vh !important; }',
    'html.immersive-mushaf .content { top: 0 !important; bottom: 0 !important; padding: 0 !important; overflow: hidden !important; }',
    'html.immersive-mushaf #reader { padding: 0 !important; margin: 0 !important; height: 100% !important; }',
    'html.immersive-mushaf .mushaf {',
    '  min-height: 100vh !important; height: 100vh !important; max-height: 100vh !important;',
    '  border-radius: 0 !important; padding: 0 !important; background: #fff !important; box-shadow: none !important;',
    '}',
    'html.immersive-mushaf .mushaf img, html.immersive-mushaf #pageImg {',
    '  max-height: 100vh !important; width: 100% !important; height: auto !important;',
    '  object-fit: contain !important; box-shadow: none !important;',
    '}',
    'html.immersive-mushaf #madaniWrap { min-height: 100vh; }',

    '#immersiveHint {',
    '  display: none; position: fixed; top: 10px; left: 50%; transform: translateX(-50%);',
    '  z-index: 50; background: rgba(23,63,53,0.75); color: #fff; font-size: 12px;',
    '  padding: 5px 14px; border-radius: 999px; pointer-events: none; opacity: 0; transition: opacity .25s;',
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
      h.textContent = 'پەنجە بدە → مێنو';
      document.body.appendChild(h);
    }
    h.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      h.classList.remove('show');
    }, 1600);
  }

  function setImmersive(on) {
    immersive = !!on;
    document.documentElement.classList.toggle('immersive-mushaf', immersive);
    // Block ayah play while chrome is hidden (tap = show UI only)
    window.__madaniBlockPlay = immersive;
    try {
      localStorage.setItem('immersive_mushaf', immersive ? '1' : '0');
    } catch (e) {}
    if (immersive) showHintBriefly();
  }

  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__immersiveHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(function () {
        if (isReaderActive()) setImmersive(true);
      }, 80);
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

    var isPage =
      t.id === 'pageImg' ||
      t.id === 'madaniOverlay' ||
      t.id === 'madaniWrap' ||
      (t.classList && t.classList.contains('mushaf')) ||
      t.closest('#madaniWrap') ||
      t.closest('.mushaf');
    if (!isPage) return;

    var now = Date.now();
    if (now - lastToggle < 350) return;
    lastToggle = now;

    if (immersive) {
      // First tap while immersive: show all chrome
      setImmersive(false);
      return;
    }
    // Chrome is visible: only hide if this was not an ayah play gesture.
    // Wait briefly; if madani starts audio, don't hide.
    var hadAudio = !!(window.Audio && document.querySelector('audio'));
    setTimeout(function () {
      // hide on empty-ish taps when chrome is showing
      setImmersive(true);
    }, 60);
  }

  // Intercept madani play when blocked
  function patchBlockPlay() {
    var ov = document.getElementById('madaniOverlay');
    if (!ov || ov.__blockBound) return !!ov;
    ov.__blockBound = true;
    ov.addEventListener(
      'click',
      function (e) {
        if (window.__madaniBlockPlay) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      },
      true
    );
    ov.addEventListener(
      'touchend',
      function (e) {
        if (window.__madaniBlockPlay) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      },
      true
    );
    return true;
  }

  function boot() {
    hookOpenPage();
    document.addEventListener('pointerup', onPointer, true);
    patchBlockPlay();
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
    patchBlockPlay();
    if (++tries > 40) clearInterval(t);
  }, 200);
})();
