window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=18';
  s.async = true;
  document.head.appendChild(s);

  var style = document.createElement('style');
  style.id = 'immersive-mushaf-css';
  style.textContent = [
    '#reader > .card { display: none !important; }',

    /* Hide ONLY the red-circled chrome while reading */',
    'html.in-reader .appbar,',
    'html.in-reader .status,',
    'html.in-reader .bottom,',
    'html.in-reader .readerhead,',
    'html.in-reader .readerbar {',
    '  display: none !important;',
    '  visibility: hidden !important;',
    '  height: 0 !important;',
    '  max-height: 0 !important;',
    '  margin: 0 !important;',
    '  padding: 0 !important;',
    '  overflow: hidden !important;',
    '  opacity: 0 !important;',
    '  pointer-events: none !important;',
    '}',

    /* Audio player ALWAYS visible */',
    'html.in-reader #madaniPlayer {',
    '  display: flex !important;',
    '  visibility: visible !important;',
    '  opacity: 1 !important;',
    '  pointer-events: auto !important;',
    '  height: auto !important;',
    '  max-height: none !important;',
    '}',

    'html.in-reader .phone { height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; }',
    'html.in-reader .main { top: 0 !important; bottom: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }',
    'html.in-reader #reader.active { display: flex !important; flex-direction: column !important; height: 100% !important; padding: 0 !important; }',
    'html.in-reader .mushaf { flex: 1 1 auto !important; min-height: 0 !important; border-radius: 0 !important; padding: 0 !important; background: #fff !important; }',
    'html.in-reader .mushaf img, html.in-reader #pageImg { width: 100% !important; max-height: calc(100vh - 90px) !important; object-fit: contain !important; }',
  ].join('\n');
  document.head.appendChild(style);

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function hideChrome() {
    var on = isReaderActive();
    document.documentElement.classList.toggle('in-reader', on);

    // Direct force-hide (beats any other CSS)
    var kill = ['.appbar', '.status', '.bottom', '.readerhead', '.readerbar'];
    kill.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (on) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('height', '0', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
        } else {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          el.style.removeProperty('height');
          el.style.removeProperty('opacity');
          el.style.removeProperty('pointer-events');
        }
      });
    });

    var pl = document.getElementById('madaniPlayer');
    if (pl) {
      if (on) {
        pl.style.setProperty('display', 'flex', 'important');
        pl.style.setProperty('visibility', 'visible', 'important');
        pl.style.setProperty('opacity', '1', 'important');
        pl.style.setProperty('pointer-events', 'auto', 'important');
      } else {
        pl.style.removeProperty('display');
        pl.style.removeProperty('visibility');
        pl.style.removeProperty('opacity');
        pl.style.removeProperty('pointer-events');
      }
    }
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      setTimeout(hideChrome, 0);
      setTimeout(hideChrome, 80);
      setTimeout(hideChrome, 300);
      return ret;
    };
    window.showView.__quranHooked = true;
  }

  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__chromeHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(hideChrome, 0);
      setTimeout(hideChrome, 80);
      setTimeout(hideChrome, 300);
      setTimeout(hideChrome, 700);
      return ret;
    };
    window.openPage.__chromeHooked = true;
  }

  function boot() {
    hookShowView();
    hookOpenPage();
    hideChrome();
    var reader = document.getElementById('reader');
    if (reader && !reader.__immersiveWatch) {
      reader.__immersiveWatch = true;
      new MutationObserver(hideChrome).observe(reader, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 30);
      setTimeout(boot, 300);
      setTimeout(boot, 1000);
    });
  } else {
    setTimeout(boot, 30);
    setTimeout(boot, 300);
    setTimeout(boot, 1000);
  }

  var tries = 0;
  var t = setInterval(function () {
    boot();
    if (isReaderActive()) hideChrome();
    if (++tries > 40) clearInterval(t);
  }, 200);
})();
