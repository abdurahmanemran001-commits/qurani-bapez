window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  function loadMadani() {
    if (document.getElementById('madani-ayah-script')) return;
    var s = document.createElement('script');
    s.id = 'madani-ayah-script';
    s.src = 'madani-ayah.js?v=16';
    s.async = false;
    s.onload = function () {
      // Force attach after script is ready
      setTimeout(forceMadaniPage, 100);
      setTimeout(forceMadaniPage, 600);
      setTimeout(forceMadaniPage, 1500);
    };
    document.head.appendChild(s);
  }

  function forceMadaniPage() {
    try {
      var reader = document.getElementById('reader');
      if (!reader || !reader.classList.contains('active')) return;
      var p = 1;
      try {
        p = +localStorage.getItem('preview_page') || 1;
      } catch (e) {}
      var input = document.getElementById('pageInput');
      if (input && input.value) p = +input.value || p;
      // Re-trigger openPage so madani hooks run
      if (typeof window.openPage === 'function') {
        var img = document.getElementById('pageImg');
        // Only call show path if madani installed
        if (window.__madaniAyahInstalled && img) {
          // dispatch a synthetic path by toggling src if needed
          var src = img.src || '';
          if (src) {
            img.src = src.split('?')[0] + '?t=' + Date.now();
          }
        }
      }
    } catch (e) {}
  }

  loadMadani();

  var style = document.createElement('style');
  style.id = 'immersive-mushaf-css';
  style.textContent = [
    '#reader > .card { display: none !important; }',
    'html.in-reader .appbar, html.in-reader .status, html.in-reader .bottom,',
    'html.in-reader .readerhead, html.in-reader .readerbar {',
    '  display: none !important; visibility: hidden !important; height: 0 !important;',
    '  overflow: hidden !important; pointer-events: none !important;',
    '}',
    'html.in-reader #madaniPlayer {',
    '  display: flex !important; visibility: visible !important;',
    '  pointer-events: auto !important; opacity: 1 !important;',
    '}',
    'html.in-reader .phone { height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; }',
    'html.in-reader .main { top: 0 !important; bottom: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }',
    'html.in-reader #reader.active { display: flex !important; flex-direction: column !important; height: 100% !important; padding: 0 !important; }',
    'html.in-reader .mushaf { flex: 1 1 auto !important; min-height: 0 !important; border-radius: 0 !important; padding: 0 !important; background: #fff !important; }',
    'html.in-reader .mushaf img, html.in-reader #pageImg { width: 100% !important; max-height: calc(100vh - 80px) !important; object-fit: contain !important; }',
  ].join('\n');
  document.head.appendChild(style);

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function applyReaderChrome() {
    var on = isReaderActive();
    document.documentElement.classList.toggle('in-reader', on);
    ['.appbar', '.status', '.bottom', '.readerhead', '.readerbar'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (on) el.style.setProperty('display', 'none', 'important');
        else el.style.removeProperty('display');
      });
    });
    var pl = document.getElementById('madaniPlayer');
    if (pl && on) {
      pl.style.setProperty('display', 'flex', 'important');
      pl.style.setProperty('visibility', 'visible', 'important');
    }
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      setTimeout(applyReaderChrome, 0);
      setTimeout(applyReaderChrome, 100);
      if (id === 'reader') {
        setTimeout(forceMadaniPage, 200);
        setTimeout(forceMadaniPage, 800);
      }
      return ret;
    };
    window.showView.__quranHooked = true;
  }

  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__chromeHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(applyReaderChrome, 0);
      setTimeout(applyReaderChrome, 120);
      setTimeout(applyReaderChrome, 500);
      setTimeout(forceMadaniPage, 300);
      setTimeout(forceMadaniPage, 900);
      return ret;
    };
    window.openPage.__chromeHooked = true;
  }

  function boot() {
    loadMadani();
    hookShowView();
    hookOpenPage();
    applyReaderChrome();
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
    if (isReaderActive()) applyReaderChrome();
    if (++tries > 50) clearInterval(t);
  }, 200);
})();
