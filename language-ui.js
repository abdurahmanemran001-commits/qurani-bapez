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

    /* Always hide green appbar while reading */',
    'html.in-reader .appbar,',
    'html.in-reader .status {',
    '  display: none !important; visibility: hidden !important; height: 0 !important;',
    '  overflow: hidden !important; pointer-events: none !important;',
    '}',

    /* Features hidden: bottom nav, page controls, player */',
    'html.in-reader.chrome-hidden .bottom,',
    'html.in-reader.chrome-hidden .readerhead,',
    'html.in-reader.chrome-hidden .readerbar,',
    'html.in-reader.chrome-hidden #madaniPlayer {',
    '  display: none !important; visibility: hidden !important; height: 0 !important;',
    '  overflow: hidden !important; pointer-events: none !important; margin: 0 !important; padding: 0 !important;',
    '}',

    /* Features visible: show player */',
    'html.in-reader:not(.chrome-hidden) #madaniPlayer {',
    '  display: flex !important; visibility: visible !important;',
    '  pointer-events: auto !important; opacity: 1 !important;',
    '}',

    'html.in-reader .phone { height: 100vh !important; max-height: 100vh !important; border-radius: 0 !important; }',
    'html.in-reader .main { top: 0 !important; bottom: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }',
    'html.in-reader #reader.active { display: flex !important; flex-direction: column !important; height: 100% !important; padding: 0 !important; }',
    'html.in-reader .mushaf { flex: 1 1 auto !important; min-height: 0 !important; border-radius: 0 !important; padding: 0 !important; background: #fff !important; }',
    'html.in-reader.chrome-hidden .mushaf img, html.in-reader.chrome-hidden #pageImg {',
    '  width: 100% !important; max-height: 100vh !important; object-fit: contain !important;',
    '}',
    'html.in-reader:not(.chrome-hidden) .mushaf img, html.in-reader:not(.chrome-hidden) #pageImg {',
    '  width: 100% !important; max-height: calc(100vh - 150px) !important; object-fit: contain !important;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  var chromeHidden = true;
  var lastToggleAt = 0;

  function isReaderActive() {
    var r = document.getElementById('reader');
    return !!(r && r.classList.contains('active'));
  }

  function setChromeHidden(hidden) {
    chromeHidden = !!hidden;
    document.documentElement.classList.toggle('chrome-hidden', chromeHidden);

    var hideList = ['.bottom', '.readerhead', '.readerbar', '#madaniPlayer'];
    hideList.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (chromeHidden && isReaderActive()) {
          el.style.setProperty('display', 'none', 'important');
        } else if (isReaderActive() && sel === '#madaniPlayer') {
          el.style.setProperty('display', 'flex', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
        } else if (isReaderActive()) {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
        } else {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
        }
      });
    });

    // green bar always off in reader
    ['.appbar', '.status'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (isReaderActive()) el.style.setProperty('display', 'none', 'important');
        else el.style.removeProperty('display');
      });
    });
  }

  function enterReader() {
    document.documentElement.classList.add('in-reader');
    setChromeHidden(true); // start immersive like the other app
  }

  function leaveReader() {
    document.documentElement.classList.remove('in-reader', 'chrome-hidden');
    ['.appbar', '.status', '.bottom', '.readerhead', '.readerbar', '#madaniPlayer'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.removeProperty('display');
        el.style.removeProperty('visibility');
      });
    });
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      setTimeout(function () {
        if (id === 'reader') enterReader();
        else leaveReader();
      }, 0);
      setTimeout(function () {
        if (id === 'reader') enterReader();
        else leaveReader();
      }, 120);
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

  function isControl(t) {
    if (!t || !t.closest) return true;
    return !!t.closest(
      '.appbar, .bottom, .readerhead, .readerbar, #madaniPlayer, button, select, input, a, .modal, .sheet'
    );
  }

  function isPageArea(t) {
    if (!t || !t.closest) return false;
    if (isControl(t)) return false;
    return !!(
      t.id === 'pageImg' ||
      t.id === 'madaniOverlay' ||
      t.id === 'madaniWrap' ||
      (t.classList && t.classList.contains('mushaf')) ||
      t.closest('#madaniWrap') ||
      t.closest('.mushaf') ||
      t.closest('#reader')
    );
  }

  /*
   * Like the other app:
   * - tap empty area → toggle features
   * - tap ayah → play (madani handles it); if chrome was hidden we still show features
   *   so the player is available, but we never HIDE chrome on an ayah tap
   */
  function onPointerUp(e) {
    if (!isReaderActive()) return;
    if (!isPageArea(e.target)) return;

    var now = Date.now();
    if (now - lastToggleAt < 280) return;

    var hlBefore = document.querySelectorAll('.ma-hl').length;

    setTimeout(function () {
      var hlAfter = document.querySelectorAll('.ma-hl').length;
      var wasAyah = hlAfter > hlBefore;

      if (chromeHidden) {
        // any tap while hidden → show features (ayah still plays via madani)
        lastToggleAt = Date.now();
        setChromeHidden(false);
        return;
      }

      // chrome visible: only hide if this was NOT an ayah tap
      if (wasAyah) return;

      lastToggleAt = Date.now();
      setChromeHidden(true);
    }, 90);
  }

  function boot() {
    hookShowView();
    hookOpenPage();
    document.addEventListener('pointerup', onPointerUp, false);
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
    if (++tries > 40) clearInterval(t);
  }, 250);
})();
