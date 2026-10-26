window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src =
    'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@4efc8d7c215643cc45521ec9845d51ee544890c0/madani-ayah.js';
  s.async = true;
  document.head.appendChild(s);

  var style = document.createElement('style');
  style.id = 'immersive-mushaf-css';
  style.textContent = [
    '#reader > .card { display: none !important; }',

    /* Full-screen mushaf: hide ALL chrome */',
    'html.immersive-mushaf .appbar,',
    'html.immersive-mushaf .status,',
    'html.immersive-mushaf .bottom,',
    'html.immersive-mushaf .readerhead,',
    'html.immersive-mushaf .readerbar,',
    'html.immersive-mushaf #madaniPlayer {',
    '  display: none !important;',
    '  visibility: hidden !important;',
    '  height: 0 !important;',
    '  min-height: 0 !important;',
    '  overflow: hidden !important;',
    '  pointer-events: none !important;',
    '}',

    'html.immersive-mushaf .phone {',
    '  height: 100vh !important;',
    '  max-height: 100vh !important;',
    '  border-radius: 0 !important;',
    '}',
    'html.immersive-mushaf .main {',
    '  top: 0 !important;',
    '  bottom: 0 !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '  height: 100% !important;',
    '  overflow: hidden !important;',
    '}',
    'html.immersive-mushaf #reader.active {',
    '  display: block !important;',
    '  height: 100% !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '}',
    'html.immersive-mushaf .mushaf {',
    '  min-height: 100vh !important;',
    '  height: 100vh !important;',
    '  max-height: 100vh !important;',
    '  border-radius: 0 !important;',
    '  padding: 0 !important;',
    '  margin: 0 !important;',
    '  background: #fff !important;',
    '  box-shadow: none !important;',
    '}',
    'html.immersive-mushaf .mushaf img,',
    'html.immersive-mushaf #pageImg {',
    '  max-height: 100vh !important;',
    '  width: 100% !important;',
    '  object-fit: contain !important;',
    '  box-shadow: none !important;',
    '}',

    '#immersiveHint {',
    '  display: none; position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 9999;',
    '  background: rgba(23,63,53,0.8); color: #fff; font-size: 12px; padding: 6px 14px;',
    '  border-radius: 999px; pointer-events: none; opacity: 0; transition: opacity .25s;',
    '}',
    'html.immersive-mushaf #immersiveHint.show { display: block; opacity: 1; }',
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
    h.textContent = msg || 'دووجار پەنجە → مێنو';
    h.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      h.classList.remove('show');
    }, 1800);
  }

  function hideChromeDirect(on) {
    var sels = ['.appbar', '.status', '.bottom', '.readerhead', '.readerbar', '#madaniPlayer'];
    sels.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (on) {
          el.setAttribute('data-imm-hide', '1');
          el.style.setProperty('display', 'none', 'important');
        } else if (el.getAttribute('data-imm-hide') === '1') {
          el.style.removeProperty('display');
          el.removeAttribute('data-imm-hide');
        }
      });
    });
  }

  function setImmersive(on) {
    immersive = !!on;
    document.documentElement.classList.toggle('immersive-mushaf', immersive);
    hideChromeDirect(immersive);
    try {
      localStorage.setItem('immersive_mushaf', immersive ? '1' : '0');
    } catch (e) {}
    if (immersive) showHint('دووجار پەنجە → مێنو');
  }

  function hookShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__quranHooked) return;
    window.showView = function (id) {
      var ret = orig.apply(this, arguments);
      try {
        if (id === 'reader') {
          document.documentElement.classList.add('in-reader');
          setTimeout(function () {
            setImmersive(true);
          }, 30);
        } else {
          document.documentElement.classList.remove('in-reader');
          setImmersive(false);
        }
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
      }, 50);
      setTimeout(function () {
        if (isReaderActive()) setImmersive(true);
      }, 300);
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

  function onPointer(e) {
    if (!isReaderActive()) return;
    if (!isPageTarget(e.target)) return;
    var now = Date.now();
    if (now - lastTap < 350) tapCount += 1;
    else tapCount = 1;
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
    if (isReaderActive()) {
      document.documentElement.classList.add('in-reader');
      setImmersive(true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50);
      setTimeout(boot, 400);
      setTimeout(boot, 1200);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 400);
    setTimeout(boot, 1200);
  }
  var tries = 0;
  var t = setInterval(function () {
    hookShowView();
    hookOpenPage();
    if (isReaderActive() && !document.documentElement.classList.contains('immersive-mushaf')) {
      setImmersive(true);
    }
    if (++tries > 50) clearInterval(t);
  }, 200);
})();
