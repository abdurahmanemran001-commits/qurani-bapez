/* share-app.js v1 — «هاوبەشکردنی ئەپ» لەسەر شاشەی سەرەکی (share sheet یان کۆپیکردنی لینک) */
(function () {
  if (window.__shareApp) return;
  window.__shareApp = true;
  var URL = 'https://abdurahmanemran001-commits.github.io/qurani-bapez/install.html';
  var X = {
    ckb: { t: 'هاوبەشکردنی ئەپ', s: 'لینکی داگرتن بنێرە بۆ هاوڕێکانت', msg: 'ئەپی قورئانی کوردی: قورئان، کاتی نوێژ، بانگ و سیرە. داگرتن:', ok: 'لینکەکە کۆپی کرا' },
    en: { t: 'Share the app', s: 'Send the download link to your friends', msg: 'Kurdish Quran app: Quran, prayer times, adhan and seerah. Download:', ok: 'Link copied' },
    ar: { t: 'مشاركة التطبيق', s: 'أرسل رابط التحميل لأصدقائك', msg: 'تطبيق القرآن الكردي: القرآن ومواقيت الصلاة والأذان والسيرة. التحميل:', ok: 'تم نسخ الرابط' }
  };
  function T() { var l = window.appLang || 'ckb'; return X[l] || (l === 'bad' ? X.ckb : X.en); }
  function share() {
    var t = T();
    if (navigator.share) { navigator.share({ title: t.t, text: t.msg, url: URL }).catch(function () {}); return; }
    var txt = t.msg + ' ' + URL;
    try { navigator.clipboard.writeText(txt).then(function () { alert(t.ok); }); } catch (e) { prompt(t.t, txt); }
  }
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    var t = T(), b = box.querySelector('.share-choice');
    if (!b) {
      b = document.createElement('button'); b.className = 'section-choice share-choice'; b.type = 'button'; b.onclick = share;
      b.setAttribute('data-no-translate', '1'); b.setAttribute('data-keep-ar', '1');
      box.appendChild(b);
    }
    var key = window.appLang || 'ckb';
    if (b.getAttribute('data-l') !== key) {
      b.setAttribute('data-l', key);
      b.innerHTML = '<span class="choice-icon">📤</span><span class="choice-copy"><b>' + t.t + '</b><small>' + t.s + '</small></span><span class="choice-arrow">‹</span>';
    }
    return true;
  }
  function start() {
    addCard();
    var n = 0, iv = setInterval(function () { addCard(); if (++n > 20) clearInterval(iv); }, 500);
    var box = document.querySelector('#startScreen .section-choices');
    if (box) new MutationObserver(function () { addCard(); }).observe(box, { childList: true });
    setInterval(addCard, 3000);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
