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
    'html.immersive-mushaf .appbar, html.immersive-mushaf .bottom,',
    'html.immersive-mushaf .readerhead, html.immersive-mushaf .readerbar,',
    'html.immersive-mushaf #madaniPlayer { display: none !important; }',
    'html.immersive-mushaf .phone { height: 100vh !important; max-height: 100vh !important; }',
    'html.immersive-mushaf .content { top: 0 !important; bottom: 0 !important; padding: 0 !important; overflow: hidden !important; }',
    'html.immersive-mushaf #reader { padding: 0 !important; margin: 0 !important; height: 100% !important; }',
    'html.immersive-mushaf .mushaf {',
    '  min-height: 100vh !important; height: 100vh !important; max-height: 100vh !important;',
    '  border-radius: 0 !important; padding: 0 !important; background: #fff !important; box-shadow: none !important;',
    '}',
    'html.immersive-mushaf .mushaf img, html.immersive-mushaf #pageImg {',
    '  max-height: 100vh !important; width: 100% !important; object-fit: contain !important; box-shadow: none !important;',
    '}',
    '#immersiveHint {',
    '  display: none; position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 50;',
    '  background: rgba(23,63,53,0.75); color: #fff; font-size: 12px; padding: 5px 14px;',
    '  border-radius: 999px; pointer-events: none; opacity: 0; transition: opacity .25s;',
    '}',
    'html.immersive-mushaf #immersiveHint.show { display: block; opacity: 1; }',

    /* Quran sections: no search and no language switcher at all */
    'html.quran-view .appbar button[onclick="showSearch()"],',
    'html.quran-view .appbar button[onclick="openLanguagePicker()"],',
    'html.quran-view #surahSearch { display: none !important; }',

    /* Reader: fixed page, nothing scrolls or bounces, size is computed to fit the screen */
    'html.in-reader, html.in-reader body { overflow: hidden !important; overscroll-behavior: none; }',
    'html.in-reader .main { overflow: hidden !important; padding: 6px !important; }',
    'html.in-reader #reader.active { display: flex !important; flex-direction: column; height: 100%; gap: 6px; }',
    'html.in-reader #reader .readerhead, html.in-reader #reader .readerbar, html.in-reader #madaniPlayer { flex: 0 0 auto; margin: 0 !important; }',
    'html.in-reader #reader .mushaf {',
    '  flex: 1 1 auto; min-height: 0 !important; height: auto !important; max-height: none !important;',
    '  padding: 0 !important; display: flex; align-items: center; justify-content: center; overflow: hidden;',
    '}',
    'html.in-reader #pageImg, html.in-reader .mushaf img { max-height: none !important; }',
    'html.immersive-mushaf.in-reader .main { height: 100% !important; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom) !important; }',
    'html.immersive-mushaf.in-reader #reader.active { gap: 0; }',
  ].join('\n');
  document.head.appendChild(style);

  var immersive = false;
  var hintTimer = null;
  var lastTap = 0;
  var tapCount = 0;

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function showHint(msg) {
    var h = document.getElementById('immersiveHint');
    if (!h) {
      h = document.createElement('div');
      h.id = 'immersiveHint';
      document.body.appendChild(h);
    }
    h.textContent = msg || 'دوو جار پەنجە بدە → مێنو';
    h.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      h.classList.remove('show');
    }, 1600);
  }

  /* Page size: as large as fits, same aspect ratio as the page image (the ayah overlay relies on it). */
  function fitReader() {
    try {
      var root = document.documentElement;
      if (!root.classList.contains('in-reader')) return;
      var m = document.getElementById('mushaf');
      var w = document.getElementById('madaniWrap');
      var img = document.getElementById('pageImg');
      if (!m || !w || !img) return;
      var aw = m.clientWidth, ah = m.clientHeight;
      if (!aw || !ah) return;
      var W = Math.floor(Math.min(aw, (ah * 1260) / 2038));
      w.style.width = W + 'px';
      w.style.margin = '0 auto';
      var ov = document.getElementById('madaniOverlay');
      var h = img.offsetHeight;
      if (ov && h) ov.style.height = h + 'px';
    } catch (e) {}
  }

  function fitSoon() {
    fitReader();
    setTimeout(fitReader, 100);
    setTimeout(fitReader, 450);
    setTimeout(fitReader, 1000);
  }

  function setImmersive(on) {
    immersive = !!on;
    document.documentElement.classList.toggle('immersive-mushaf', immersive);
    window.__madaniBlockPlay = false; /* tapping an ayah must always play it */
    try {
      localStorage.setItem('immersive_mushaf', immersive ? '1' : '0');
    } catch (e) {}
    if (immersive) showHint('دوو جار پەنجە بدە → مێنو');
    fitSoon();
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      try {
        var root = document.documentElement;
        root.classList.toggle('quran-view', id === 'home' || id === 'reader');
        root.classList.toggle('in-reader', id === 'reader');
        if (id === 'reader') fitSoon();
      } catch (e) {}
      return ret;
    };
    window.showView.__quranHooked = true;
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

  function isPageTarget(t) {
    if (!t || !t.closest) return false;
    if (
      t.closest(
        '.appbar, .bottom, .readerhead, .readerbar, #madaniPlayer, button, select, input, a, .modal, .sheet'
      )
    )
      return false;
    return !!(
      t.id === 'pageImg' ||
      t.id === 'madaniOverlay' ||
      t.id === 'madaniWrap' ||
      (t.classList && t.classList.contains('mushaf')) ||
      t.closest('#madaniWrap') ||
      t.closest('.mushaf')
    );
  }

  /* One tap on an ayah plays it. Two quick taps show / hide the menu. */
  function onPointer(e) {
    if (!isReaderActive()) return;
    if (!isPageTarget(e.target)) return;

    var now = Date.now();
    if (now - lastTap < 350) {
      tapCount += 1;
    } else {
      tapCount = 1;
    }
    lastTap = now;

    if (tapCount >= 2) {
      tapCount = 0;
      setImmersive(!immersive);
    }
  }

  function boot() {
    hookShowView();
    hookOpenPage();
    document.addEventListener('pointerup', onPointer, true);
    var m = document.getElementById('mushaf');
    if (m && window.ResizeObserver && !m.__fitObserved) {
      m.__fitObserved = true;
      new ResizeObserver(fitReader).observe(m);
    }
    window.addEventListener('resize', fitSoon);
    window.addEventListener('orientationchange', fitSoon);
    if (isReaderActive()) {
      var pref = true;
      try {
        if (localStorage.getItem('immersive_mushaf') === '0') pref = false;
      } catch (e) {}
      document.documentElement.classList.add('quran-view', 'in-reader');
      setImmersive(pref);
    }
  }

  var booted = false;
  function bootOnce() {
    if (booted) return;
    booted = true;
    boot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(bootOnce, 80);
    });
  } else {
    setTimeout(bootOnce, 80);
  }
  var tries = 0;
  var t = setInterval(function () {
    hookShowView();
    hookOpenPage();
    if (++tries > 40) clearInterval(t);
  }, 200);
})();
