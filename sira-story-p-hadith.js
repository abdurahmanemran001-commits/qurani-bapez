/* sira-story-p-hadith.js v1 — makes the Hadith section really follow the app language.
 * (The name matches the existing `sira-story-p*.js` glob in pages.yml, so it is copied to dist automatically.)
 *  1. Changing the app language while the Hadith screens are open re-renders them in the new language.
 *  2. A hadith that has no ready-made translation in the chosen language is translated automatically (no button),
 *     and the top results of "AI hadith search" are translated automatically. Results are cached by hadith.js / hadith-ai.js.
 *  3. The English fallback text is hidden unless the app language is English. */
(function () {
  'use strict';
  if (window.__hadithFollowV1) return;
  window.__hadithFollowV1 = true;

  var silentUntil = 0, doneD = {}, doneA = {}, timer = null;
  function $(id) { return document.getElementById(id); }
  function lang() {
    var l = '';
    try { l = localStorage.getItem('app_language') || ''; } catch (e) {}
    l = l || window.appLang || document.documentElement.lang || 'ckb';
    return l === 'ku' ? 'ckb' : l;
  }
  function active(id) { var v = $(id); return !!(v && v.classList.contains('active')); }

  var _alert = window.alert;
  window.alert = function (m) { if (Date.now() < silentUntil) return; return _alert.call(window, m); };

  function css() {
    var s = document.createElement('style');
    s.id = 'hadithFollowCss';
    s.textContent = [
      'html[lang=ckb] #hadithView .hd-en,html[lang=bad] #hadithView .hd-en{display:none!important}',
      'html:not([lang=en]) #hadithView .hd-en:has(.hd-label){display:none!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function tickHadith() {
    var v = $('hadithView'), b, meta, key, L = lang();
    if (!active('hadithView') || L === 'ar') return;
    b = v.querySelector('button[data-act="translateKu"]');
    if (!b) return;
    meta = v.querySelector('.hd-meta span');
    key = (meta ? meta.textContent : '') + '|' + L;
    if (doneD[key] && Date.now() - doneD[key] < 600000) return;
    doneD[key] = Date.now();
    silentUntil = Date.now() + 45000;
    b.click();
  }

  function tickAi() {
    var v = $('hadithAi'), cards, i, c, ar, key, b, L = lang();
    if (!active('hadithAi') || L === 'ar') return;
    cards = v.querySelectorAll('.ha-card');
    for (i = 0; i < cards.length && i < 3; i++) {
      c = cards[i];
      if (c.querySelector('.ha-tr')) continue;
      ar = c.querySelector('.ha-ar');
      key = (ar ? ar.textContent.slice(0, 60) : i) + '|' + L;
      if (doneA[key] && Date.now() - doneA[key] < 600000) continue;
      b = c.querySelector('[data-tr]');
      if (!b || b.disabled) return;
      doneA[key] = Date.now();
      silentUntil = Date.now() + 45000;
      b.click();
      return;
    }
  }

  function tick() { tickHadith(); tickAi(); }
  function schedule() {
    if (!active('hadithView') && !active('hadithAi')) return;
    clearTimeout(timer); timer = setTimeout(tick, 500);
  }

  window.addEventListener('app-language-changed', function () {
    setTimeout(function () {
      if (active('hadithAi') && typeof window.enterHadithAi === 'function') window.enterHadithAi();
      else if (active('hadithView') && typeof window.enterHadith === 'function') window.enterHadith();
    }, 80);
  });

  function start() {
    css();
    if (typeof MutationObserver !== 'undefined') new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
