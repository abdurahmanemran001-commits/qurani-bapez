document.write('<script src="lang-extra.js?v=3"><\/script><script src="lang-tt.js?v=4"><\/script><script src="lang-ui-more.js?v=8"><\/script><script src="ruqyah-i18n.js?v=4"><\/script><script src="ruqyah-i18n2.js?v=1"><\/script><script src="ai-i18n.js?v=1"><\/script><script src="lang-shell.js?v=1"><\/script>');
/* :has() polyfill — old Android WebViews (Chrome < 105) ignore every ".phone:has(#view.active) ..." rule, so section
 * screens keep the app bar / bottom bar and look broken. Rewrites those rules to ".pf-<id>" classes and keeps the classes in sync. */
(function () {
  try { if (window.CSS && CSS.supports && CSS.supports('selector(:has(*))')) return; } catch (e) {}
  var watch = {}, RE = /:has\(\s*#([\w-]+)\.active((?:\[[^\]]*\])*)\s*\)/g;
  function cls(id, attrs) { return 'pf-' + id + (attrs ? '_' + attrs.replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '') : ''); }
  function fix(el) {
    var t = el.textContent; if (!t || t.indexOf(':has(') < 0) return;
    var out = t.replace(RE, function (m, id, attrs) {
      var list = []; (attrs || '').replace(/\[\s*([\w-]+)\s*=\s*"([^"]*)"\s*\]/g, function (x, k, v) { list.push([k, v]); });
      var c = cls(id, list.map(function (p) { return p[0] + '_' + p[1]; }).join('_')); watch[c] = { id: id, attrs: list };
      return '.' + c;
    });
    if (out !== t) el.textContent = out;
  }
  var pend = false;
  function sync() {
    pend = false;
    var host = [document.body, document.querySelector('.phone')];
    for (var c in watch) {
      var w = watch[c], e = document.getElementById(w.id), on = !!(e && e.classList.contains('active'));
      if (on) for (var i = 0; i < w.attrs.length; i++) if (e.getAttribute(w.attrs[i][0]) !== w.attrs[i][1]) on = false;
      for (var j = 0; j < host.length; j++) if (host[j]) host[j].classList.toggle(c, on);
    }
  }
  function later() { if (!pend) { pend = true; (window.requestAnimationFrame || setTimeout)(sync); } }
  function scan() { var s = document.querySelectorAll('style'); for (var i = 0; i < s.length; i++) fix(s[i]); later(); }
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], n = m.target;
      if (m.type === 'attributes') continue;
      if (n.nodeType === 1 && n.tagName === 'STYLE') fix(n);
      else if (n.parentNode && n.parentNode.tagName === 'STYLE') fix(n.parentNode);
      for (var k = 0; k < m.addedNodes.length; k++) { var a = m.addedNodes[k]; if (a.tagName === 'STYLE') fix(a); }
    }
    later();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  new MutationObserver(later).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class', 'data-bg', 'data-theme'] });
  document.addEventListener('DOMContentLoaded', scan); scan();
})();
window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function () {
  var s = document.createElement('script');
  s.src = 'madani-ayah.js?v=28';
  s.async = true;
  document.head.appendChild(s);

  var sT = document.createElement('script');
  sT.src = 'topbar.js?v=7';
  sT.async = true;
  document.head.appendChild(sT);

  var s0 = document.createElement('script');
  s0.src = 'home-clean.js?v=4';
  s0.async = true;
  document.head.appendChild(s0);

  var s2 = document.createElement('script');
  s2.src = 'mushaf/ayah-actions.js?v=9';
  s2.async = true;
  document.head.appendChild(s2);

  var sD = document.createElement('script');
  sD.src = 'mushaf/audio-dl.js?v=1';
  sD.async = true;
  document.head.appendChild(sD);

  var sS = document.createElement('script');
  sS.src = 'mushaf/stats.js?v=1';
  sS.async = true;
  document.head.appendChild(sS);

  var sR = document.createElement('script');
  sR.src = 'srs.js?v=1';
  sR.async = true;
  document.head.appendChild(sR);

  var sK = document.createElement('script');
  sK.src = 'khatma.js?v=3';
  sK.async = true;
  document.head.appendChild(sK);

  var s3 = document.createElement('script');
  s3.src = 'zikr-enhance.js?v=4';
  s3.async = true;
  document.head.appendChild(s3);

  var s4 = document.createElement('script');
  s4.src = 'zikr-streak.js?v=3';
  s4.async = true;
  document.head.appendChild(s4);

  var s5 = document.createElement('script');
  s5.src = 'tasbih.js?v=6';
  s5.async = true;
  document.head.appendChild(s5);

  var s6 = document.createElement('script');
  s6.src = 'ruqyah.js?v=7';
  s6.async = true;
  document.head.appendChild(s6);

  var sr = document.createElement('script');
  sr.src = 'ruqyah-reciters.js?v=8';
  sr.async = true;
  document.head.appendChild(sr);

  var sy = document.createElement('script');
  sy.src = 'ruqyah-youtube.js?v=2';
  sy.async = true;
  document.head.appendChild(sy);

  var sL = document.createElement('script');
  sL.src = 'ruqyah-layout.js?v=1';
  sL.async = true;
  document.head.appendChild(sL);

  var BUILD = '__BUILD__'; // replaced with the commit id by the Pages workflow so every deploy bypasses cached scripts
  function loadScript(src) {
    return new Promise(function (resolve) {
      var el = document.createElement('script');
      if (BUILD.indexOf('__') < 0) src += (src.indexOf('?') < 0 ? '?' : '&') + 'b=' + BUILD;
      el.src = src;
      el.async = true;
      el.onload = resolve;
      el.onerror = resolve;
      document.head.appendChild(el);
    });
  }

  loadScript('ai-config.js?v=2')
    .then(function () { return loadScript('ai-rag.js?v=2'); })
    .then(function () { return loadScript('ai-shari-rag.js?v=10'); })
    .then(function () { return loadScript('ai-shari-kb.js?v=5'); })
    .then(function () { return loadScript('ai-shari-kb-p2.js?v=1'); })
    .then(function () { return loadScript('ai-shari-kb-p3.js?v=1'); })
    .then(function () { return loadScript('ai-shari-kb-p4.js?v=1'); })
    .then(function () { return loadScript('ai-shari-kb-i18n.js?v=1'); })
    .then(function () { return loadScript('ai-shari.js?v=16'); })
    .then(function () { return loadScript('hadith.js?v=6'); })
    .then(function () { return loadScript('hadith-ai.js?v=1'); })
    .then(function () { return loadScript('seerah-data.js?v=5'); })
    .then(function () { return loadScript('seerah-data-p2.js?v=2'); })
    .then(function () { return loadScript('seerah-data-p3.js?v=1'); })
    .then(function () { return loadScript('seerah.js?v=10'); })
    .then(function () { return loadScript('seerah-i18n.js?v=3'); })
    .then(function () { return loadScript('companions-data.js?v=3'); })
    .then(function () { return loadScript('companions-data-p2.js?v=1'); })
    .then(function () { return loadScript('companions.js?v=3'); })
    .then(function () { return loadScript('companions-i18n.js?v=1'); })
    .then(function () { return loadScript('knowledge-data.js?v=1'); })
    .then(function () { return loadScript('knowledge-data-prophets.js?v=1'); })
    .then(function () { return loadScript('knowledge-data-more.js?v=1'); })
    .then(function () { return loadScript('knowledge-endless.js?v=2'); })
    .then(function () { return loadScript('knowledge.js?v=8'); })
    .then(function () { return loadScript('scholars-firebase-config.js?v=1'); })
    .then(function () { return loadScript('scholars.js?v=4'); })
    .then(function () { return loadScript('sira-library.js?v=2'); })
    .then(function () { return loadScript('sira-story-p1.js?v=1'); })
    .then(function () { return loadScript('sira-story-p2.js?v=1'); })
    .then(function () { return loadScript('sira-story-p3.js?v=2'); })
    .then(function () { return loadScript('sira-story-p4.js?v=1'); })
    .then(function () { return loadScript('sira-story-p5.js?v=1'); })
    .then(function () { return loadScript('sira-story-p6.js?v=1'); })
    .then(function () { return loadScript('sira-story-p7.js?v=1'); })
    .then(function () { return loadScript('sira-story-p8.js?v=1'); })
    .then(function () { return loadScript('sira-story-p9.js?v=1'); })
    .then(function () { return loadScript('sira-story-p10.js?v=1'); })
    .then(function () { return loadScript('sira-story-p11.js?v=1'); })
    .then(function () { return loadScript('sira-story-p12.js?v=1'); })
    .then(function () { return loadScript('sira-story-p13.js?v=1'); })
    .then(function () { return loadScript('sira-ai.js?v=3'); })
    .then(function () { return loadScript('companions-ai-i18n.js?v=1'); })
    .then(function () { return loadScript('companions-ai.js?v=3'); })
    .then(function () { return loadScript('companions-quiz-data.js?v=1'); })
    .then(function () { return loadScript('companions-quiz-facts.js?v=1'); })
    .then(function () { return loadScript('companions-quiz.js?v=4'); })
    .then(function () { return loadScript('sira-story.js?v=3'); })
    .then(function () { return loadScript('notify-content.js?v=1'); })
    .then(function () { return loadScript('notify-content2.js?v=1'); })
    .then(function () { return loadScript('notify.js?v=2'); })
    .then(function () { return loadScript('lang-fix-leaks.js?v=1'); })
    .then(function () { return loadScript('share-app.js?v=1'); })
    .then(function () { return loadScript('mushaf/hifz.js?v=15'); })
    .then(function () { return loadScript('mushaf/hifz-quiz.js?v=2'); })
    .then(function () { return loadScript('mushaf/hifz-page.js?v=2'); })
    .then(function () { return loadScript('mushaf/hifz-asr.js?v=3'); })
    .then(function () { return loadScript('mushaf/hifz-live.js?v=1'); })
    .then(function () { return loadScript('mushaf/hifz-read.js?v=25'); });

  var sp = document.createElement('script');
  sp.src = 'salah-places-data.js?v=1';
  sp.onload = function () {
    var s7 = document.createElement('script');
    s7.src = 'salah.js?v=23';
    s7.onload = function () {
      var s8 = document.createElement('script');
      s8.src = 'salah-settings.js?v=5';
      s8.async = true;
      s8.onload = function () { var s9 = document.createElement('script'); s9.src = 'salah-themes.js?v=2'; document.head.appendChild(s9); };
      document.head.appendChild(s8);
    };
    s7.async = true;
    document.head.appendChild(s7);
  };
  sp.onerror = function () {
    var s7 = document.createElement('script');
    s7.src = 'salah.js?v=23';
    s7.onload = function () {
      var s8 = document.createElement('script');
      s8.src = 'salah-settings.js?v=5';
      s8.onload = function () { var s9 = document.createElement('script'); s9.src = 'salah-themes.js?v=2'; document.head.appendChild(s9); };
      document.head.appendChild(s8);
    };
    document.head.appendChild(s7);
  };
  document.head.appendChild(sp);

  var hcv = document.createElement('script');
  hcv.src = 'home-cover.js?v=9';
  hcv.async = true;
  document.head.appendChild(hcv);

  var dn = document.createElement('script');
  dn.src = 'donate.js?v=1';
  dn.async = true;
  document.head.appendChild(dn);

  var st = document.createElement('style');
  st.textContent = [
    '#startScreen .section-choices{display:grid!important;grid-template-columns:1fr 1fr;gap:10px}',
    '#startScreen .section-choices>*:not(.section-choice){grid-column:1/-1}',
    '#startScreen .section-choices>.section-choice{display:flex!important;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;min-height:128px;padding:14px 8px;margin:0!important;width:auto!important;min-width:0}',
    '#startScreen .section-choices>.section-choice .choice-copy{width:100%;min-width:0;text-align:center}',
    '#startScreen .section-choices>.section-choice .choice-copy b{display:block;font-size:14.5px;line-height:1.35}',
    '#startScreen .section-choices>.section-choice .choice-copy small{display:block;font-size:11.5px;line-height:1.4;margin-top:3px;opacity:.8;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '#startScreen .section-choices>.section-choice .choice-arrow{display:none!important}',
    '.phone:has(#reader.active) .appbar,',
    '.phone:has(#reader.active) .readerhead,',
    '.phone:has(#reader.active) .readerbar,',
    '.phone:has(#reader.active) #reader > .card,',
    '.phone:has(#reader.active) .bottom { display: none !important; }',
    '.phone:has(#reader.active) .main {',
    '  height: 100% !important;',
    '  padding-top: calc(8px + env(safe-area-inset-top)) !important;',
    '  padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;',
    '}',
  ].join('\n');
  document.head.appendChild(st);
})();

/* offline: once per launch, ask the service worker to download every app file in the background */
(function () {
  try {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    window.addEventListener('load', function () {
      setTimeout(function () {
        navigator.serviceWorker.ready.then(function (r) { if (r && r.active) r.active.postMessage('precache'); }).catch(function () {});
      }, 6000);
    });
  } catch (e) {}
})();
