/* Ruqyah layout: separate sections (verses & duas / long audio / YouTube) and a settings gear in the header. */
(function () {
  if (window.__rqLayout) return; window.__rqLayout = 1;
  var SECS = [['cards', '📖 ئایەت و دوعاکان'], ['cont', '🎧 سەوتی تەواو'], ['yt', '📺 یوتیوب']];
  var cur = 'cards', busy = false, inited = false;
  var css = document.createElement('style');
  css.textContent = [
    '#rqSecBar{display:flex;gap:6px;margin:0 0 12px}',
    '#rqSecBar button{flex:1;border:1px solid #dce5e1;background:#fff;border-radius:12px;padding:10px 4px;font-size:13px;cursor:pointer;color:#18231f}',
    '#rqSecBar button.on{background:#e8f3ee;border-color:#b8d6c9;color:#176b4b;font-weight:bold}',
    '#rqGear{border:1px solid #dce5e1;background:#fff;border-radius:18px;padding:7px 11px;font-size:16px;cursor:pointer;margin-inline-end:6px}',
    '#rqSettingsBtn{display:none!important}',
    '#ruqyah[data-sec="cards"] #rqContPanel,#ruqyah[data-sec="cards"] #rqYtPanel{display:none!important}',
    '#ruqyah[data-sec="cont"] .rq-note,#ruqyah[data-sec="cont"] .rq-tabs,#ruqyah[data-sec="cont"] .rq-card,#ruqyah[data-sec="cont"] #rqReciterBar,#ruqyah[data-sec="cont"] #rqYtPanel,#ruqyah[data-sec="cont"] .rq-sizerow{display:none!important}',
    '#ruqyah[data-sec="yt"] .rq-note,#ruqyah[data-sec="yt"] .rq-tabs,#ruqyah[data-sec="yt"] .rq-card,#ruqyah[data-sec="yt"] #rqReciterBar,#ruqyah[data-sec="yt"] #rqContPanel,#ruqyah[data-sec="yt"] .rq-sizerow{display:none!important}'
  ].join('\n');
  document.head.appendChild(css);

  function apply() {
    var v = document.getElementById('ruqyah'); if (!v || busy) return;
    var head = v.querySelector('.rq-head'); if (!head) return;
    busy = true;
    try {
      v.setAttribute('data-sec', cur);
      var hs = v.querySelectorAll('.rq-head'); if (hs[1]) hs[1].classList.add('rq-sizerow');
      var bar = document.getElementById('rqSecBar');
      if (!bar) {
        bar = document.createElement('div'); bar.id = 'rqSecBar';
        bar.innerHTML = SECS.map(function (s) { return '<button type="button" data-rs="' + s[0] + '">' + s[1] + '</button>'; }).join('');
        bar.addEventListener('click', function (e) {
          var b = e.target.closest('[data-rs]'); if (!b) return;
          cur = b.getAttribute('data-rs'); apply();
          var m = v.closest('.main'); if (m) m.scrollTop = 0;
        });
        head.parentNode.insertBefore(bar, head.nextSibling);
      }
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-rs') === cur); });
      if (!document.getElementById('rqGear')) {
        var g = document.createElement('button'); g.type = 'button'; g.id = 'rqGear'; g.textContent = '⚙'; g.title = 'ڕێکخستن';
        g.onclick = function (e) { e.stopPropagation(); var b = document.getElementById('rqSettingsBtn'); if (b) b.click(); };
        var back = head.querySelector('.rq-back'); var box = document.createElement('div'); box.style.cssText = 'display:flex;align-items:center';
        if (back) { head.replaceChild(box, back); box.appendChild(g); box.appendChild(back); } else head.appendChild(g);
      }
      var sw = document.getElementById('rqSettingsWrap');
      if (sw && sw.previousSibling !== bar) bar.parentNode.insertBefore(sw, bar.nextSibling);
      if (!inited && sw) { inited = true; var p = document.getElementById('rqSettingsPanel'); if (p && p.classList.contains('open')) { var sb = document.getElementById('rqSettingsBtn'); if (sb) sb.click(); } }
    } finally { setTimeout(function () { busy = false; }, 0); }
  }
  var t = null;
  function sched() { clearTimeout(t); t = setTimeout(apply, 120); }
  function boot() {
    var v = document.getElementById('ruqyah');
    if (!v) return false;
    new MutationObserver(sched).observe(v, { childList: true });
    sched(); return true;
  }
  var n = 0, iv = setInterval(function () {
    var v = document.getElementById('ruqyah');
    if (v && !v.__rqL) { v.__rqL = 1; boot(); }
    if (++n > 120) clearInterval(iv);
  }, 500);
  document.addEventListener('click', function () { if (document.getElementById('ruqyah')) { inited = inited; sched(); } }, true);
})();
