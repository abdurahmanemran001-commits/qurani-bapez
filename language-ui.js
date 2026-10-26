window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=15';
  s.async = true;
  document.head.appendChild(s);

  var style = document.createElement('style');
  style.id = 'immersive-mushaf-css';
  style.textContent = [
    '#reader > .card { display: none !important; }',

    /* Always hide green top bar while reading */',
    'html.in-reader .appbar,',
    'html.in-reader .status {',
    '  display: none !important; visibility: hidden !important; height: 0 !important;',
    '  overflow: hidden !important; pointer-events: none !important;',
    '}',

    /* Features hidden by default (toggle with tap) */',
    'html.in-reader.chrome-hidden .bottom,',
    'html.in-reader.chrome-hidden .readerhead,',
    'html.in-reader.chrome-hidden .readerbar {',
    '  display: none !important; visibility: hidden !important; height: 0 !important;',
    '  overflow: hidden !important; pointer-events: none !important;',
    '}',

    /* Player always visible */',
    'html.in-reader #madaniPlayer {',
    '  display: flex !important; visibility: visible !important;',
    '  pointer-events: auto !important; opacity: 1 !important;',
    '}',

    'html.in-reader .phone { height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; }',
    'html.in-reader .main { top: 0 !important; bottom: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }',
    'html.in-reader #reader.active { display: flex !important; flex-direction: column !important; height: 100% !important; padding: 0 !important; }',
    'html.in-reader .mushaf { flex: 1 1 auto !important; min-height: 0 !important; border-radius: 0 !important; padding: 0 !important; background: #fff !important; }',
    'html.in-reader.chrome-hidden .mushaf img, html.in-reader.chrome-hidden #pageImg {',
    '  width: 100% !important; max-height: calc(100vh - 70px) !important; object-fit: contain !important;',
    '}',
    'html.in-reader:not(.chrome-hidden) .mushaf img, html.in-reader:not(.chrome-hidden) #pageImg {',
    '  width: 100% !important; max-height: calc(100vh - 160px) !important; object-fit: contain !important;',
    '}',

    '#tapHint {',
    '  display: none; position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 9999;',
    '  background: rgba(23,63,53,0.8); color: #fff; font-size: 12px; padding: 6px 14px;',
    '  border-radius: 999px; pointer-events: none; opacity: 0; transition: opacity .25s;',
    '}',
    'html.in-reader.chrome-hidden #tapHint.show { display: block; opacity: 1; }',
  ].join('\n');
  document.head.appendChild(style);

  var chromeHidden = true;
  var lastToggle = 0;
  var hintTimer = null;

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function showHint(msg) {
    var h = document.getElementById('tapHint');
    if (!h) {
      h = document.createElement('div');
      h.id = 'tapHint';
      document.body.appendChild(h);
    }
    h.textContent = msg || 'پەنجە بدە → مێنو';
    h.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      h.classList.remove('show');
    }, 1500);
  }

  function setChromeHidden(hidden) {
    chromeHidden = !!hidden;
    document.documentElement.classList.toggle('chrome-hidden', chromeHidden);
    try {
      localStorage.setItem('mushaf_chrome_hidden', chromeHidden ? '1' : '0');
    } catch (e) {}

    // Direct style backup for bottom / readerhead / readerbar
    ['.bottom', '.readerhead', '.readerbar'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (chromeHidden && isReaderActive()) {
          el.style.setProperty('display', 'none', 'important');
        } else {
          el.style.removeProperty('display');
        }
      });
    });

    // Green appbar always off in reader
    ['.appbar', '.status'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (isReaderActive()) el.style.setProperty('display', 'none', 'important');
        else el.style.removeProperty('display');
      });
    });

    var pl = document.getElementById('madaniPlayer');
    if (pl && isReaderActive()) {
      pl.style.setProperty('display', 'flex', 'important');
      pl.style.setProperty('visibility', 'visible', 'important');
    }

    if (chromeHidden && isReaderActive()) showHint('پەنجە بدە → مێنو');
  }

  function toggleChrome() {
    if (!isReaderActive()) return;
    setChromeHidden(!chromeHidden);
  }

  function enterReader() {
    document.documentElement.classList.add('in-reader');
    var preferHidden = true;
    try {
      if (localStorage.getItem('mushaf_chrome_hidden') === '0') preferHidden = false;
    } catch (e) {}
    setChromeHidden(preferHidden);
  }

  function leaveReader() {
    document.documentElement.classList.remove('in-reader');
    document.documentElement.classList.remove('chrome-hidden');
    ['.appbar', '.status', '.bottom', '.readerhead', '.readerbar'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.removeProperty('display');
      });
    });
  }

  function applyView(id) {
    if (id === 'reader') enterReader();
    else leaveReader();
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      setTimeout(function () {
        applyView(id);
      }, 0);
      setTimeout(function () {
        applyView(id);
      }, 100);
      return ret;
    };
    window.showView.__quranHooked = true;
  }

  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__chromeHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(enterReader, 0);
      setTimeout(enterReader, 150);
      setTimeout(enterReader, 500);
      return ret;
    };
    window.openPage.__chromeHooked = true;
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

  /* Single tap on empty page area toggles features.
     If an ayah was hit (highlight appears), do NOT toggle. */
  function onPointer(e) {
    if (!isReaderActive()) return;
    if (!isPageTarget(e.target)) return;

    var now = Date.now();
    if (now - lastToggle < 300) return;

    var hlBefore = document.querySelectorAll('.ma-hl').length;
    var labelBefore = '';
    try {
      var lab = document.getElementById('madaniLabel');
      if (lab) labelBefore = lab.textContent || '';
    } catch (err) {}

    setTimeout(function () {
      var hlAfter = document.querySelectorAll('.ma-hl').length;
      var labelAfter = '';
      try {
        var lab2 = document.getElementById('madaniLabel');
        if (lab2) labelAfter = lab2.textContent || '';
      } catch (err2) {}

      // ayah was activated → leave features alone
      if (hlAfter > hlBefore || (labelAfter && labelAfter !== labelBefore && labelAfter !== '—')) {
        return;
      }

      lastToggle = Date.now();
      toggleChrome();
    }, 80);
  }

  function boot() {
    hookShowView();
    hookOpenPage();
    document.addEventListener('pointerup', onPointer, true);
    if (isReaderActive()) enterReader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 40);
      setTimeout(boot, 400);
      setTimeout(boot, 1200);
    });
  } else {
    setTimeout(boot, 40);
    setTimeout(boot, 400);
    setTimeout(boot, 1200);
  }
  var tries = 0;
  var t = setInterval(function () {
    hookShowView();
    hookOpenPage();
    if (isReaderActive() && !document.documentElement.classList.contains('in-reader')) {
      enterReader();
    }
    if (++tries > 50) clearInterval(t);
  }, 200);
})();
