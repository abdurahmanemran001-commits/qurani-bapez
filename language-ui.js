window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src =
    'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@4efc8d7c215643cc45521ec9845d51ee544890c0/madani-ayah.js';
  s.async = true;
  document.head.appendChild(s);

  var style = document.createElement('style');
  style.id = 'immersive-mushaf-css';
  /* Always when reading mushaf: hide green top bar, bottom nav, page title row, page number bar.
     NEVER hide the audio player (#madaniPlayer). */
  style.textContent = [
    '#reader > .card { display: none !important; }',

    'html.in-reader .appbar,',
    'html.in-reader .status,',
    'html.in-reader .bottom,',
    'html.in-reader .readerhead,',
    'html.in-reader .readerbar {',
    '  display: none !important;',
    '  visibility: hidden !important;',
    '  height: 0 !important;',
    '  min-height: 0 !important;',
    '  max-height: 0 !important;',
    '  overflow: hidden !important;',
    '  pointer-events: none !important;',
    '  margin: 0 !important;',
    '  padding: 0 !important;',
    '  border: 0 !important;',
    '}',

    /* Keep player always visible and usable */',
    'html.in-reader #madaniPlayer {',
    '  display: flex !important;',
    '  visibility: visible !important;',
    '  pointer-events: auto !important;',
    '  height: auto !important;',
    '  max-height: none !important;',
    '  opacity: 1 !important;',
    '}',

    'html.in-reader .phone {',
    '  height: 100vh !important;',
    '  max-height: 100vh !important;',
    '  border-radius: 0 !important;',
    '}',
    'html.in-reader .main {',
    '  top: 0 !important;',
    '  bottom: 0 !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '  height: 100% !important;',
    '  overflow: hidden !important;',
    '}',
    'html.in-reader #reader.active {',
    '  display: flex !important;',
    '  flex-direction: column !important;',
    '  height: 100% !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '}',
    'html.in-reader .mushaf {',
    '  flex: 1 1 auto !important;',
    '  min-height: 0 !important;',
    '  border-radius: 0 !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '  background: #fff !important;',
    '  box-shadow: none !important;',
    '}',
    'html.in-reader .mushaf img,',
    'html.in-reader #pageImg {',
    '  width: 100% !important;',
    '  max-height: calc(100vh - 70px) !important;',
    '  object-fit: contain !important;',
    '  box-shadow: none !important;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function applyReaderChrome() {
    var on = isReaderActive();
    document.documentElement.classList.toggle('in-reader', on);

    /* Direct style backup so cache/old CSS cannot keep the green bar */
    var hideSels = ['.appbar', '.status', '.bottom', '.readerhead', '.readerbar'];
    hideSels.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (on) {
          el.style.setProperty('display', 'none', 'important');
        } else {
          el.style.removeProperty('display');
        }
      });
    });

    /* Force player visible while reading */
    var pl = document.getElementById('madaniPlayer');
    if (pl) {
      if (on) {
        pl.style.setProperty('display', 'flex', 'important');
        pl.style.setProperty('visibility', 'visible', 'important');
        pl.style.removeProperty('height');
        pl.style.removeProperty('opacity');
      }
    }
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      setTimeout(applyReaderChrome, 0);
      setTimeout(applyReaderChrome, 50);
      setTimeout(applyReaderChrome, 200);
      return ret;
    };
    window.showView.__quranHooked = true;
  }

  function hookOpenPage() {
    var orig = window.openPage;
    if (typeof orig !== 'function' || orig.__immersiveHooked) return;
    window.openPage = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(applyReaderChrome, 0);
      setTimeout(applyReaderChrome, 50);
      setTimeout(applyReaderChrome, 300);
      return ret;
    };
    window.openPage.__immersiveHooked = true;
  }

  function boot() {
    hookShowView();
    hookOpenPage();
    applyReaderChrome();
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
    hookShowView();
    hookOpenPage();
    if (isReaderActive()) applyReaderChrome();
    if (++tries > 60) clearInterval(t);
  }, 200);
})();
