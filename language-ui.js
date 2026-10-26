window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=17';
  s.async = true;
  document.head.appendChild(s);

  var style = document.createElement('style');
  style.id = 'immersive-mushaf-css';
  style.textContent = [
    '#reader > .card { display: none !important; }',
    'html.in-reader .phone { height: 100vh !important; height: 100dvh !important; max-height: none !important; border-radius: 0 !important; }',
    'html.in-reader .main { top: 0 !important; bottom: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }',
    'html.in-reader #reader.active { display: flex !important; flex-direction: column !important; height: 100% !important; padding: 0 !important; }',
    'html.in-reader .mushaf { flex: 1 1 auto !important; min-height: 0 !important; border-radius: 0 !important; padding: 0 !important; background: #fff !important; }',
    'html.in-reader .mushaf img, html.in-reader #pageImg { width: 100% !important; height: 100% !important; max-height: 100% !important; object-fit: contain !important; }',
    'html.in-reader .appbar, html.in-reader .status, html.in-reader .bottom,',
    'html.in-reader .readerhead, html.in-reader .readerbar, html.in-reader #madaniPlayer {',
    '  display: none !important; visibility: hidden !important; pointer-events: none !important;',
    '}',
    'html.in-reader.show-reader-controls .appbar {',
    '  display: flex !important; visibility: visible !important; pointer-events: auto !important;',
    '  position: absolute !important; top: 0; left: 0; right: 0; z-index: 30;',
    '}',
    'html.in-reader.show-reader-controls .readerhead {',
    '  display: flex !important; visibility: visible !important; pointer-events: auto !important;',
    '  position: absolute !important; top: 66px; left: 8px; right: 8px; z-index: 29;',
    '  margin: 0; padding: 7px; border-radius: 12px; background: rgba(249,251,250,.96);',
    '  box-shadow: 0 2px 12px rgba(0,0,0,.12);',
    '}',
    'html.in-reader.show-reader-controls #madaniPlayer {',
    '  display: flex !important; visibility: visible !important; pointer-events: auto !important;',
    '  position: absolute !important; left: 12px; right: 12px; bottom: 132px; z-index: 30; margin: 0 !important;',
    '}',
    'html.in-reader.show-reader-controls .readerbar {',
    '  display: grid !important; visibility: visible !important; pointer-events: auto !important;',
    '  position: absolute !important; left: 14px; right: 14px; bottom: 79px; z-index: 30; margin: 0;',
    '  padding: 7px; border-radius: 12px; background: rgba(249,251,250,.96);',
    '  box-shadow: 0 2px 12px rgba(0,0,0,.12);',
    '}',
    'html.in-reader.show-reader-controls .bottom {',
    '  display: grid !important; visibility: visible !important; pointer-events: auto !important;',
    '  position: absolute !important; bottom: 0; left: 0; right: 0; z-index: 30;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  var wasReader = false;

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function applyReaderChrome() {
    var on = isReaderActive();
    var root = document.documentElement;
    if (on && !wasReader) root.classList.remove('show-reader-controls');
    root.classList.toggle('in-reader', on);
    if (!on) root.classList.remove('show-reader-controls');
    wasReader = on;
  }

  function toggleReaderControls() {
    if (!isReaderActive()) return;
    document.documentElement.classList.toggle('show-reader-controls');
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(applyReaderChrome, 0);
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
      return ret;
    };
    window.openPage.__chromeHooked = true;
  }

  var lastTapToggle = 0;
  function onReaderTap(event) {
    if (!isReaderActive()) return;
    var mushaf = document.getElementById('mushaf');
    if (!mushaf || !mushaf.contains(event.target)) return;
    var now = Date.now();
    if (now - lastTapToggle < 100) return;
    lastTapToggle = now;
    toggleReaderControls();
  }

  // Capture taps before the ayah-audio layer, without cancelling its own handlers.
  document.addEventListener('pointerup', onReaderTap, true);
  document.addEventListener('click', onReaderTap, true);

  function boot() {
    hookShowView();
    hookOpenPage();
    applyReaderChrome();
    var reader = document.getElementById('reader');
    if (reader && !reader.__immersiveWatch) {
      reader.__immersiveWatch = true;
      new MutationObserver(applyReaderChrome).observe(reader, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  var tries = 0;
  var timer = setInterval(function () {
    boot();
    if (++tries > 25) clearInterval(timer);
  }, 200);
})();
