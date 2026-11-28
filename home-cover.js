/* home-cover.js v1 — Quran Al-Karim cover banner on the start screen (replaces the plain welcome text). */
(function () {
  if (window.__homeCoverV1) return; window.__homeCoverV1 = true;
  var st = document.createElement('style');
  st.textContent = '#tbSheet .tbBox{padding-bottom:calc(26px + env(safe-area-inset-bottom,0px))!important;box-shadow:0 -10px 40px rgba(0,0,0,.25)}#tbSheet h3{position:sticky;top:-14px;background:#fff;padding:6px 0 8px;z-index:2;font-weight:800}#tbSheet .tbChip{min-height:40px}#startScreen .hc-ios{display:flex;flex-direction:column;gap:6px;margin:0 0 12px;padding:12px 14px;border-radius:16px;background:#fff8e1;border:1px solid #f0d98a;color:#4a3b0c;font-size:13px;line-height:1.7}#startScreen .hc-ios b{font-size:14px}#startScreen .hc-ios button{align-self:flex-start;border:0;border-radius:10px;background:#176b4b;color:#fff;padding:7px 18px;font:inherit}#zikr .zikr-item .muted,#zikr .zikr-item small{color:rgba(255,255,255,.72)!important}.phone:has(#zikr.active) .main,.phone:has(#detail.active) .main{height:100%!important}#home .tabs{display:flex!important;flex-wrap:nowrap!important;gap:4px;overflow-x:auto;scrollbar-width:none;position:sticky;top:-12px;z-index:3;padding:8px 2px;margin:0 -2px 8px;background:rgba(244,247,245,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}#home .tabs::-webkit-scrollbar{display:none}#home .tabs .tab{flex:1 1 auto;white-space:nowrap;padding:9px 5px;font-size:11.5px;line-height:1.3;border-radius:12px;text-align:center}#home .surah{min-height:58px}#startScreen .hc-h{grid-column:1/-1;margin:10px 4px 0;font-weight:800;font-size:13px;color:#2f6b4f}.phone .main{height:100%;padding-top:calc(12px + env(safe-area-inset-top,0px));padding-bottom:calc(18px + env(safe-area-inset-bottom,0px))}#startScreen .hc-cover{margin-top:2px}#startScreen .welcome,#startScreen .welcome-note{display:none!important}#startScreen .hc-cover{position:relative;margin:0 0 14px;border-radius:24px;overflow:hidden;background:#0f5a3a;box-shadow:0 10px 26px rgba(10,60,40,.28);aspect-ratio:1/.74}#startScreen .hc-cover img{width:100%;height:100%;object-fit:cover;object-position:50% 34%;display:block}#startScreen .hc-cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(8,50,34,.55));pointer-events:none}';
  document.head.appendChild(st);
  function put() {
    var s = document.getElementById('startScreen');
    if (!s || s.querySelector('.hc-cover')) return;
    var d = document.createElement('div'); d.className = 'hc-cover';
    var im = new Image(); im.src = 'cover.jpg?v=1'; im.alt = 'القرآن الكريم'; im.decoding = 'async'; im.draggable = false;
    d.appendChild(im);
    s.insertBefore(d, s.firstChild);
  }
  var G = [
    ['w', { ckb: 'قورئان و عیبادەت', en: 'Quran & worship', ar: 'القرآن والعبادة' }, ['quran-choice', 'salah-choice', 'zikr-choice', 'tasbih-choice', 'ruqyah-choice']],
    ['k', { ckb: 'زانست و فێربوون', en: 'Knowledge & learning', ar: 'العلم والتعلّم' }, ['hadith-choice', 'seerah-choice', 'companions-choice', 'knowledge-choice', 'scholars-choice', 'ai-shari-choice']],
    ['m', { ckb: 'زیاتر', en: 'More', ar: 'المزيد' }, ['notify-choice', 'donate-choice', 'share-choice']]
  ];
  function lg() { var l = ''; try { l = window.appLang || localStorage.getItem('app_language') || ''; } catch (e) {} return (l === 'ku' || l === 'bad' || !l) ? 'ckb' : l; }
  var busy = false, mo = null;
  function arrange() {
    var box = document.querySelector('#startScreen .section-choices'); if (!box || busy) return;
    busy = true; if (mo) mo.disconnect();
    var all = [].slice.call(box.children).filter(function (x) { return x.classList.contains('section-choice'); }), used = [];
    function find(c) { for (var i = 0; i < all.length; i++) if (all[i].classList.contains(c)) return all[i]; }
    G.forEach(function (g) {
      var h = box.querySelector('.hc-h-' + g[0]);
      if (!h) { h = document.createElement('div'); h.className = 'hc-h hc-h-' + g[0]; }
      h.textContent = g[1][lg()] || g[1].en; box.appendChild(h);
      g[2].forEach(function (c) { var b = find(c); if (b) { box.appendChild(b); used.push(b); } });
      if (g[0] === 'm') all.forEach(function (b) { if (used.indexOf(b) < 0) { box.appendChild(b); used.push(b); } });
    });
    busy = false; watch(box);
  }
  function watch(box) { if (!window.MutationObserver) return; mo = mo || new MutationObserver(function () { setTimeout(arrange, 50); }); mo.observe(box, { childList: true }); }
  var IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var T = { ckb: ['ئەپەکە دابمەزرێنە لەسەر ئایفۆن', 'لە Safari دوگمەی هاوبەشکردن (□↑) دابگرە، پاشان «Add to Home Screen» هەڵبژێرە.', 'باشە'], en: ['Install the app on your iPhone', 'In Safari tap Share (□↑), then choose "Add to Home Screen".', 'OK'], ar: ['ثبّت التطبيق على الآيفون', 'في Safari اضغط مشاركة (□↑) ثم «إضافة إلى الشاشة الرئيسية».', 'حسناً'] };
  function iosHint() {
    var s = document.getElementById('startScreen');
    if (!IOS || navigator.standalone || !s || s.querySelector('.hc-ios')) return;
    try { if (localStorage.getItem('ios_hint_v1')) return; } catch (e) {}
    var t = T[lg()] || T.en, d = document.createElement('div'); d.className = 'hc-ios';
    d.innerHTML = '<b>📲 ' + t[0] + '</b><span>' + t[1] + '</span><button type="button">' + t[2] + '</button>';
    d.querySelector('button').onclick = function () { try { localStorage.setItem('ios_hint_v1', '1'); } catch (e) {} d.remove(); };
    s.insertBefore(d, s.firstChild);
  }
  var SOON = { ckb: 'بەم زووانە بەردەست دەبێت 🌙', en: 'Coming soon 🌙', ar: 'قريباً بإذن الله 🌙', tr: 'Çok yakında 🌙', fa: 'به‌زودی 🌙', ur: 'جلد آ رہا ہے 🌙', fr: 'Bientôt disponible 🌙', ru: 'Скоро будет доступно 🌙', id: 'Segera hadir 🌙' };
  var BADGE = { ckb: 'بەم زووانە', en: 'Soon', ar: 'قريباً', tr: 'Yakında', fa: 'به‌زودی', ur: 'جلد', fr: 'Bientôt', ru: 'Скоро', id: 'Segera' };
  function toast(msg) {
    var t = document.getElementById('hcToast');
    if (!t) { t = document.createElement('div'); t.id = 'hcToast'; t.style.cssText = 'position:fixed;left:50%;bottom:calc(30px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:99999;background:rgba(20,40,30,.94);color:#fff;padding:12px 22px;border-radius:14px;font-size:14.5px;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:86%;text-align:center;transition:opacity .25s'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(t._h); t._h = setTimeout(function () { t.style.opacity = '0'; }, 2400);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.scholars-choice'); if (!b) return;
    e.stopPropagation(); e.preventDefault(); toast(SOON[lg()] || SOON.en);
  }, true);
  function badge() {
    var b = document.querySelector('#startScreen .scholars-choice'); if (!b) return;
    b.style.opacity = '.62';
    var x = b.querySelector('.hc-soon'); if (!x) { x = document.createElement('i'); x.className = 'hc-soon'; x.style.cssText = 'position:absolute;top:8px;left:8px;font-style:normal;font-size:10.5px;background:#c6a15b;color:#fff;border-radius:8px;padding:2px 8px'; b.style.position = 'relative'; b.appendChild(x); }
    x.textContent = BADGE[lg()] || BADGE.en;
  }
  var n = 0, iv = setInterval(function () { put(); arrange(); iosHint(); badge(); if (++n > 30) clearInterval(iv); }, 300);
  document.addEventListener('DOMContentLoaded', put);
})();
