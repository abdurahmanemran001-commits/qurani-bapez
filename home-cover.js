/* home-cover.js v1 — Quran Al-Karim cover banner on the start screen (replaces the plain welcome text). */
(function () {
  if (window.__homeCoverV1) return; window.__homeCoverV1 = true;
  var st = document.createElement('style');
  st.textContent = '#startScreen .welcome,#startScreen .welcome-note{display:none!important}#startScreen .hc-cover{position:relative;margin:0 0 14px;border-radius:24px;overflow:hidden;background:#0f5a3a;box-shadow:0 10px 26px rgba(10,60,40,.28);aspect-ratio:1/.74}#startScreen .hc-cover img{width:100%;height:100%;object-fit:cover;object-position:50% 34%;display:block}#startScreen .hc-cover:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(8,50,34,.55));pointer-events:none}';
  document.head.appendChild(st);
  function put() {
    var s = document.getElementById('startScreen');
    if (!s || s.querySelector('.hc-cover')) return;
    var d = document.createElement('div'); d.className = 'hc-cover';
    var im = new Image(); im.src = 'cover.jpg?v=1'; im.alt = 'القرآن الكريم'; im.decoding = 'async'; im.draggable = false;
    d.appendChild(im);
    s.insertBefore(d, s.firstChild);
  }
  var n = 0, iv = setInterval(function () { put(); if (++n > 30) clearInterval(iv); }, 300);
  document.addEventListener('DOMContentLoaded', put);
})();
