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
      return ret;
    };
    window.openPage.__chromeHooked = true;
  }

  function boot() {
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
