/* Khatma: personal plan (N days, daily portion) + group (split juz between people via share links). No backend: progress is stored on each device. */
(function () {
  if (window.__khatma) return; window.__khatma = 1;
  var LP = 'khatma_p', LG = 'khatma_g';
  function jget(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dayDiff(iso) { var a = new Date(iso + 'T00:00:00'); return Math.round((today() - a) / 864e5); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function jStart(j) { return j <= 1 ? 1 : 2 + (j - 1) * 20; }
  function jEnd(j) { return j >= 30 ? 604 : jStart(j + 1) - 1; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function openAt(p) { if (typeof openPage === 'function') openPage(p); }
  window.__khOpen = openAt;

  var css = document.createElement('style');
  css.textContent = '#khP{display:none;margin:4px 0 16px}.khc{background:#fff;border:1px solid #dce5e1;border-radius:13px;padding:14px;margin-bottom:10px}.khc h3{margin:0 0 8px;color:#176b4b}.khb{border:0;border-radius:10px;padding:10px 14px;font-weight:bold;cursor:pointer;background:#176b4b;color:#fff}.khb.s{background:#e8f3ee;color:#176b4b}.khb.d{background:#fbe9e7;color:#a33}.khbar{height:9px;background:#e8f3ee;border-radius:5px;overflow:hidden;margin:8px 0}.khbar i{display:block;height:100%;background:#b48a3c}.khr{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center}#khP input,#khP select{padding:9px;border:1px solid #dce5e1;border-radius:9px;font-size:15px;max-width:100%}.khm{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #eef2f1}';
  document.head.appendChild(css);

  function personalHTML() {
    var p = jget(LP, null);
    if (!p) return '<div class="khc"><h3>📖 خەتمەی تایبەت</h3><div>خەتمەیەک دروست بکە و ئەپەکە ڕۆژانە بەشێکت دەداتێ.</div><div class="khr"><label>ماوە (ڕۆژ): <input id="khDays" type="number" min="3" max="365" value="30" style="width:80px"></label><button class="khb" id="khStart">دەستپێکردن</button></div></div>';
    var days = p.days, i = Math.max(0, Math.min(days - 1, dayDiff(p.start))), a = Math.floor(i * 604 / days) + 1, b = Math.floor((i + 1) * 604 / days);
    var done = p.done || {}, n = 0, k; for (k in done) n++;
    var late = 0; for (k = 0; k < i; k++) if (!done[k]) late++;
    var over = dayDiff(p.start) >= days;
    return '<div class="khc"><h3>📖 خەتمەی تایبەت</h3><div>ڕۆژی <b>' + (i + 1) + '</b> لە ' + days + (over ? ' (ماوەکە تەواو بوو)' : '') + '</div>'
      + '<div style="margin:6px 0">بەشی ئەمڕۆ: پەڕە <b>' + a + '</b> تا <b>' + b + '</b> (' + (b - a + 1) + ' پەڕە)</div>'
      + '<div class="khbar"><i style="width:' + Math.round(n / days * 100) + '%"></i></div><small>' + n + ' ڕۆژ تەواو کراوە لە ' + days + (late ? ' • ' + late + ' ڕۆژ دواکەوتوویت' : '') + '</small>'
      + '<div class="khr"><button class="khb" id="khRead" data-p="' + a + '">بخوێنەوە</button><button class="khb s" id="khDone">' + (done[i] ? '✓ ئەمڕۆ تەواو کراوە' : 'ئەمڕۆم تەواو کرد') + '</button><button class="khb d" id="khReset">سڕینەوە</button></div></div>';
  }
  function groupHTML() {
    var g = jget(LG, []), h = '';
    g.forEach(function (x, idx) {
      var j1 = Math.floor(x.i * 30 / x.n) + 1, j2 = Math.floor((x.i + 1) * 30 / x.n);
      h += '<div class="khc"><h3>👥 ' + esc(x.name) + '</h3><div>بەشی تۆ: جوزی <b>' + j1 + (j2 > j1 ? ' تا ' + j2 : '') + '</b> (پەڕە ' + jStart(j1) + ' - ' + jEnd(j2) + ') • ' + x.n + ' کەس</div>'
        + '<div class="khr"><button class="khb" data-gr="' + jStart(j1) + '">بخوێنەوە</button><button class="khb s" data-gd="' + idx + '">' + (x.done ? '✓ تەواو کراوە' : 'بەشەکەم تەواو کرد') + '</button><button class="khb d" data-gx="' + idx + '">لابردن</button></div></div>';
    });
    h += '<div class="khc"><h3>👨‍👩‍👧 خەتمەی بە کۆمەڵ</h3><div>ناو و ژمارەی کەسەکان دیاری بکە؛ بۆ هەر کەسێک بەستەرێک دەنێریت و بەشی خۆی (جوز) پێ دەدرێت.</div>'
      + '<div class="khr"><input id="khName" placeholder="ناوی خەتمە" style="flex:1"><label>کەس: <input id="khN" type="number" min="2" max="30" value="5" style="width:70px"></label><button class="khb" id="khMake">دروستکردن</button></div><div id="khLinks"></div>'
      + '<small style="display:block;margin-top:8px;color:#6d7975">تێبینی: پێشکەوتنی هەر کەسێک لەسەر مۆبایلی خۆی دەمێنێتەوە و بۆ ئەوانی تر نانێردرێت.</small></div>';
    return h;
  }
  function render() {
    var P = document.getElementById('khP'); if (!P) return;
    P.innerHTML = (window.__stats ? window.__stats.html() : '') + personalHTML() + groupHTML(); bind(P);
  }
  function bind(P) {
    var q = function (s) { return P.querySelector(s); };
    if (q('#khStart')) q('#khStart').onclick = function () { var d = Math.max(3, Math.min(365, +q('#khDays').value || 30)); jset(LP, { start: iso(today()), days: d, done: {} }); render(); };
    if (q('#khRead')) q('#khRead').onclick = function () { openAt(+this.getAttribute('data-p')); };
    if (q('#khDone')) q('#khDone').onclick = function () { var p = jget(LP, null), i = Math.max(0, Math.min(p.days - 1, dayDiff(p.start))); p.done = p.done || {}; if (p.done[i]) delete p.done[i]; else p.done[i] = 1; jset(LP, p); render(); };
    if (q('#khReset')) q('#khReset').onclick = function () { if (confirm('خەتمەکە بسڕدرێتەوە؟')) { try { localStorage.removeItem(LP); } catch (e) {} render(); } };
    Array.prototype.forEach.call(P.querySelectorAll('[data-gr]'), function (b) { b.onclick = function () { openAt(+b.getAttribute('data-gr')); }; });
    Array.prototype.forEach.call(P.querySelectorAll('[data-gd]'), function (b) { b.onclick = function () { var g = jget(LG, []), x = g[+b.getAttribute('data-gd')]; x.done = !x.done; jset(LG, g); render(); }; });
    Array.prototype.forEach.call(P.querySelectorAll('[data-gx]'), function (b) { b.onclick = function () { var g = jget(LG, []); g.splice(+b.getAttribute('data-gx'), 1); jset(LG, g); render(); }; });
    if (q('#khMake')) q('#khMake').onclick = function () {
      var name = (q('#khName').value || '').trim() || 'خەتمەی کۆمەڵ', n = Math.max(2, Math.min(30, +q('#khN').value || 5)), base = location.origin + location.pathname, h = '';
      for (var i = 0; i < n; i++) {
        var j1 = Math.floor(i * 30 / n) + 1, j2 = Math.floor((i + 1) * 30 / n), url = base + '?kh=' + encodeURIComponent(name) + '&n=' + n + '&i=' + i;
        var txt = 'بەشداربە لە ' + name + ' — بەشی تۆ: جوزی ' + j1 + (j2 > j1 ? ' تا ' + j2 : '') + '\n' + url;
        h += '<div class="khm"><span style="flex:1">کەسی ' + (i + 1) + ': جوزی ' + j1 + (j2 > j1 ? '–' + j2 : '') + '</span>'
          + (i === 0 ? '<button class="khb s" data-me="' + i + '">بەشی خۆم</button>' : '')
          + '<button class="khb s" data-sh="' + encodeURIComponent(txt) + '">ناردن</button></div>';
      }
      var L = q('#khLinks'); L.innerHTML = h;
      Array.prototype.forEach.call(L.querySelectorAll('[data-sh]'), function (b) { b.onclick = function () { var t = decodeURIComponent(b.getAttribute('data-sh')); if (navigator.share) navigator.share({ text: t }).catch(function () {}); else window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank'); }; });
      var me = L.querySelector('[data-me]'); if (me) me.onclick = function () { addGroup(name, n, 0); render(); };
    };
  }
  function addGroup(name, n, i) { var g = jget(LG, []); for (var k = 0; k < g.length; k++) if (g[k].name === name && g[k].n === n && g[k].i === i) return; g.push({ name: name, n: n, i: i }); jset(LG, g); }

  function show(on) {
    var P = document.getElementById('khP'), L = document.getElementById('surahList'), t = document.getElementById('tabKh');
    if (!P) return;
    P.style.display = on ? 'block' : 'none'; if (L) L.style.display = on ? 'none' : '';
    if (t) t.classList.toggle('on', on);
    if (on) { ['tabSurah', 'tabJuz', 'tabBookmark'].forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.remove('on'); }); render(); }
  }
  function install() {
    var tabs = document.querySelector('.tabs'); if (!tabs || document.getElementById('tabKh')) return !!document.getElementById('tabKh');
    tabs.style.gridTemplateColumns = 'repeat(4,1fr)';
    var b = document.createElement('button'); b.id = 'tabKh'; b.className = 'tab'; b.textContent = 'خەتمە و ئامار'; b.onclick = function () { show(true); };
    tabs.appendChild(b);
    var P = document.createElement('div'); P.id = 'khP'; tabs.parentNode.insertBefore(P, tabs.nextSibling);
    var o = window.setHomeTab;
    if (typeof o === 'function') window.setHomeTab = function () { show(false); return o.apply(this, arguments); };
    return true;
  }
  var qs = new URLSearchParams(location.search), inc = null;
  if (qs.get('kh') && qs.get('n') && qs.get('i') != null) { inc = { name: qs.get('kh'), n: Math.max(2, Math.min(30, +qs.get('n') || 2)), i: Math.max(0, +qs.get('i') || 0) }; if (inc.i >= inc.n) inc = null; }
  var tries = 0, iv = setInterval(function () {
    if (install() || ++tries > 40) {
      clearInterval(iv);
      if (inc) { addGroup(inc.name, inc.n, inc.i); try { history.replaceState(null, '', location.pathname); } catch (e) {} show(true); }
    }
  }, 300);
})();
