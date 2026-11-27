/* home-cover.js v1 — Quran Al-Karim cover banner on the start screen (replaces the plain welcome text). */
(function () {
  if (window.__homeCoverV1) return; window.__homeCoverV1 = true;
  var st = document.createElement('style');
  st.textContent = '#home .tabs{display:flex!important;flex-wrap:nowrap!important;gap:4px;overflow-x:auto;scrollbar-width:none;position:sticky;top:-12px;z-index:3;padding:8px 2px;margin:0 -2px 8px;background:rgba(244,247,245,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}#home .tabs::-webkit-scrollbar{display:none}#home .tabs .tab{flex:1 1 auto;white-space:nowrap;padding:9px 5px;font-size:11.5px;line-height:1.3;border-radius:12px;text-align:center}#home .surah{min-height:58px}#startScreen .hc-h{grid-column:1/-1;margin:10px 4px 0;font-weight:800;font-size:13px;color:#2f6b4f}.phone .main{height:100%;padding-top:calc(12px + env(safe-area-inset-top,0px));padding-bottom:calc(18px + env(safe-area-inset-bottom,0px))}#startScreen .hc-cover{margin-top:2px}#startScreen .welcome,#startScreen .welcome-note{display:none!important}#startScreen .hc-cover{position:relative;margin:0 0 14px;border-radius:24px;overflow:hidden;background:#0f5a3a;box-shadow:0 10px 26px rgba(10,60,40,.28);aspect-ratio:1/.74}#startScreen .hc-cover img{width:100%;height:100%;object-fit:cover;object-position:50% 34%;display:block}#startScreen .hc-cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(8,50,34,.55));pointer-events:none}';
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
  var n = 0, iv = setInterval(function () { put(); arrange(); if (++n > 30) clearInterval(iv); }, 300);
  document.addEventListener('DOMContentLoaded', put);
})();
