/* SRS memorisation helper (SM-2 style spaced repetition) on ayah cards. Data stays on the device. */
(function () {
  if (window.__srs) return; window.__srs = 1;
  var LS = 'srs_cards', corpus = null, loading = false, sess = null;
  function jget() { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { return {}; } }
  function jset(o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function todayS() { return iso(new Date()); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sname(i) { try { return surahs[i - 1][0]; } catch (e) { return 'سووڕەت ' + i; } }
  function scount(i) { try { return surahs[i - 1][2]; } catch (e) { return 286; } }
  function loadCorpus(cb) {
    if (corpus) return cb();
    if (loading) return setTimeout(function () { loadCorpus(cb); }, 300);
    loading = true;
    fetch('ai/quran.json').then(function (r) { return r.json(); }).then(function (j) { var m = {}; ((j && j.v) || []).forEach(function (r) { m[r[0] + ':' + r[1]] = r[2]; }); corpus = m; cb(); })
      .catch(function () { corpus = {}; cb(); });
  }
  /* next interval (days) for each grade, from card state */
  function nextState(c, g) {
    var e = c.e || 2.5, i = c.i || 0, n = c.n || 0, l = c.l || 0;
    if (g === 0) { n = 0; i = 0; e = Math.max(1.3, e - 0.2); l++; }
    else if (g === 1) { i = Math.max(1, Math.round(Math.max(i, 1) * 1.2)); e = Math.max(1.3, e - 0.15); n++; }
    else if (g === 2) { i = n === 0 ? 1 : n === 1 ? 3 : Math.round(i * e); n++; }
    else { i = n === 0 ? 3 : n === 1 ? 6 : Math.round(i * e * 1.3); e = e + 0.15; n++; }
    return { e: e, i: i, n: n, l: l, d: addDays(i) };
  }
  function dueList(o) {
    var t = todayS(), a = [];
    Object.keys(o).forEach(function (k) { var c = o[k]; if (c.d <= t) a.push(k); });
    /* smart order: most overdue first, then cards that were forgotten more often, then weakest ease */
    a.sort(function (x, y) { var cx = o[x], cy = o[y]; if (cx.d !== cy.d) return cx.d < cy.d ? -1 : 1; if ((cy.l || 0) !== (cx.l || 0)) return (cy.l || 0) - (cx.l || 0); return (cx.e || 2.5) - (cy.e || 2.5); });
    return a;
  }
  var css = document.createElement('style');
  css.textContent = '#srsP{display:none;margin:4px 0 16px}.sc{background:#fff;border:1px solid #dce5e1;border-radius:13px;padding:14px;margin-bottom:10px}.sc h3{margin:0 0 8px;color:#176b4b}.sb{border:0;border-radius:10px;padding:10px 14px;font-weight:bold;cursor:pointer;background:#176b4b;color:#fff}.sb.s{background:#e8f3ee;color:#176b4b}.sb.d{background:#fbe9e7;color:#a33}.sr{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center}#srsP select,#srsP input{padding:9px;border:1px solid #dce5e1;border-radius:9px;font-size:15px}.sq{font-size:24px;line-height:2;text-align:center;direction:rtl;font-family:"Amiri","Traditional Arabic",serif}.sg{flex:1;min-width:70px;padding:10px 4px;border:0;border-radius:10px;color:#fff;font-weight:bold;cursor:pointer}';
  document.head.appendChild(css);

  function render() {
    var P = document.getElementById('srsP'); if (!P) return;
    var o = jget(), keys = Object.keys(o), due = dueList(o), mature = keys.filter(function (k) { return (o[k].i || 0) >= 21; }).length;
    var h = '<div class="sc"><h3>🧠 لەبەرکردنی زانستی (دووبارەکردنەوەی دابەشکراو)</h3>'
      + '<div style="display:flex;gap:7px;text-align:center"><div style="flex:1;background:#e8f3ee;border-radius:11px;padding:9px"><b style="font-size:20px;color:#176b4b">' + due.length + '</b><div style="font-size:12px;color:#6d7975">ئەمڕۆ بۆ پێداچوونەوە</div></div><div style="flex:1;background:#e8f3ee;border-radius:11px;padding:9px"><b style="font-size:20px;color:#176b4b">' + keys.length + '</b><div style="font-size:12px;color:#6d7975">کۆی ئایەتەکان</div></div><div style="flex:1;background:#e8f3ee;border-radius:11px;padding:9px"><b style="font-size:20px;color:#b48a3c">' + mature + '</b><div style="font-size:12px;color:#6d7975">چەسپاو</div></div></div>'
      + '<div class="sr"><button class="sb" id="srsGo"' + (due.length ? '' : ' disabled style="opacity:.5"') + '>دەستپێکردنی پێداچوونەوە (' + due.length + ')</button></div>'
      + '<small style="display:block;margin-top:8px;color:#6d7975">ئەپەکە ئەو ئایەتانە پێشتر نیشان دەدات کە زیاتر لەبیرت دەچن (زۆرترین دواکەوتن و هەڵە). لە هەر ئایەتێک پێت دەڵێت دەستپێکی ئایەتی پێشوو، تۆ بەردەوامی بخوێنەوە، پاشان وەڵامەکە ببینە و نمرە بدە.</small></div>';
    h += '<div class="sc"><h3>➕ زیادکردنی ئایەت بۆ لەبەرکردن</h3><div class="sr"><select id="srsS" style="flex:1">';
    for (var i = 1; i <= 114; i++) h += '<option value="' + i + '">' + i + '. ' + esc(sname(i)) + '</option>';
    h += '</select></div><div class="sr"><label>لە ئایەتی <input id="srsA" type="number" min="1" value="1" style="width:70px"></label><label>تا <input id="srsB" type="number" min="1" value="7" style="width:70px"></label><button class="sb" id="srsAdd">زیادکردن</button></div></div>';
    var g = {}; keys.forEach(function (k) { var s = +k.split(':')[0]; g[s] = (g[s] || 0) + 1; });
    var gs = Object.keys(g).sort(function (a, b) { return a - b; });
    if (gs.length) {
      h += '<div class="sc"><h3>ئەوانەی لەبەرت دەکەیت</h3>';
      gs.forEach(function (s) { h += '<div class="sr" style="border-top:1px solid #eef2f1;margin:0;padding:8px 0"><span style="flex:1">' + esc(sname(+s)) + ' — ' + g[s] + ' ئایەت</span><button class="sb d" data-rm="' + s + '">لابردن</button></div>'; });
      h += '</div>';
    }
    P.innerHTML = h; bind(P);
  }
  function bind(P) {
    var q = function (s) { return P.querySelector(s); };
    q('#srsS').onchange = function () { q('#srsB').value = Math.min(scount(+this.value), 7); q('#srsA').value = 1; };
    q('#srsAdd').onclick = function () {
      var s = +q('#srsS').value, a = Math.max(1, +q('#srsA').value || 1), b = Math.min(scount(s), +q('#srsB').value || a), o = jget(), t = todayS(), n = 0;
      for (var i = a; i <= b; i++) { var k = s + ':' + i; if (!o[k]) { o[k] = { e: 2.5, i: 0, n: 0, l: 0, d: t }; n++; } }
      jset(o); render();
    };
    Array.prototype.forEach.call(P.querySelectorAll('[data-rm]'), function (b) { b.onclick = function () { var s = b.getAttribute('data-rm'), o = jget(); Object.keys(o).forEach(function (k) { if (k.split(':')[0] === s) delete o[k]; }); jset(o); render(); }; });
    var go = q('#srsGo'); if (go && !go.disabled) go.onclick = function () { loadCorpus(function () { sess = { list: dueList(jget()), pos: 0, again: 0 }; card(); }); };
  }
  function card() {
    var P = document.getElementById('srsP'), o = jget();
    if (!sess || sess.pos >= sess.list.length) {
      P.innerHTML = '<div class="sc" style="text-align:center"><h3>✅ پێداچوونەوەی ئەمڕۆ تەواو بوو</h3><div>بەڕێز، ئەمڕۆ ' + (sess ? sess.list.length : 0) + ' ئایەتت پێداچووەوە.</div><div class="sr" style="justify-content:center"><button class="sb" id="srsBack">گەڕانەوە</button></div></div>';
      P.querySelector('#srsBack').onclick = function () { sess = null; render(); }; return;
    }
    var k = sess.list[sess.pos], p = k.split(':'), s = +p[0], a = +p[1], c = o[k];
    var prev = a > 1 ? corpus[s + ':' + (a - 1)] : '';
    P.innerHTML = '<div class="sc"><div style="display:flex;justify-content:space-between;color:#6d7975;font-size:13px"><span>' + (sess.pos + 1) + ' / ' + sess.list.length + '</span><span>' + esc(sname(s)) + ' · ئایەتی ' + a + '</span></div>'
      + '<div style="margin:10px 0;color:#6d7975;font-size:14px">' + (a > 1 ? 'ئایەتی پێشوو:' : 'دەستپێکی سووڕەت — ئایەتی یەکەم:') + '</div>'
      + '<div class="sq">' + (prev ? esc(prev) : '﴿ ... ﴾') + '</div>'
      + '<div style="margin:10px 0;text-align:center;font-weight:bold">ئایەتی ' + a + ' بخوێنەوە لە بیرەوە</div>'
      + '<div id="srsAns" style="display:none"><div class="sq" style="background:#f7f3e8;border-radius:11px;padding:8px">' + esc(corpus[k] || '(دەق بەردەست نییە)') + '</div>'
      + '<div style="margin:10px 0;text-align:center">چۆن بوو؟</div><div class="sr">'
      + [['0', 'لەبیرم نەبوو', '#a33'], ['1', 'قورس بوو', '#b48a3c'], ['2', 'باش', '#176b4b'], ['3', 'ئاسان', '#2a6fb0']].map(function (x) { var st = nextState(c, +x[0]); return '<button class="sg" data-g="' + x[0] + '" style="background:' + x[2] + '">' + x[1] + '<br><small style="font-weight:normal">' + (st.i ? st.i + ' ڕۆژ' : 'ئەمڕۆ') + '</small></button>'; }).join('') + '</div></div>'
      + '<div class="sr" style="justify-content:center"><button class="sb" id="srsShow">پیشاندانی وەڵام</button><button class="sb s" id="srsQuit">وەستان</button></div></div>';
    P.querySelector('#srsShow').onclick = function () { P.querySelector('#srsAns').style.display = 'block'; this.style.display = 'none'; };
    P.querySelector('#srsQuit').onclick = function () { sess = null; render(); };
    Array.prototype.forEach.call(P.querySelectorAll('[data-g]'), function (b) {
      b.onclick = function () {
        var g = +b.getAttribute('data-g'), o2 = jget(), st = nextState(o2[k], g); o2[k] = st; jset(o2);
        if (g === 0 && sess.list.indexOf(k, sess.pos + 1) < 0) sess.list.push(k); /* forgotten: see it again at the end of this session */
        sess.pos++; card();
      };
    });
  }
  function show(on) {
    var P = document.getElementById('srsP'), L = document.getElementById('surahList'), t = document.getElementById('tabSrs'), K = document.getElementById('khP');
    if (!P) return;
    P.style.display = on ? 'block' : 'none';
    if (on) { if (K) K.style.display = 'none'; if (L) L.style.display = 'none'; var tk = document.getElementById('tabKh'); if (tk) tk.classList.remove('on'); ['tabSurah', 'tabJuz', 'tabBookmark'].forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.remove('on'); }); sess = null; render(); }
    if (t) t.classList.toggle('on', on);
  }
  function install() {
    var tabs = document.querySelector('.tabs'); if (!tabs) return false;
    if (document.getElementById('tabSrs')) return true;
    tabs.style.gridTemplateColumns = 'repeat(3,1fr)';
    var b = document.createElement('button'); b.id = 'tabSrs'; b.className = 'tab'; b.textContent = 'لەبەرکردن'; b.onclick = function () { show(true); };
    tabs.appendChild(b);
    var P = document.createElement('div'); P.id = 'srsP'; tabs.parentNode.insertBefore(P, tabs.nextSibling);
    var o = window.setHomeTab;
    if (typeof o === 'function') window.setHomeTab = function () { show(false); return o.apply(this, arguments); };
    var tk = document.getElementById('tabKh'); if (tk) tk.addEventListener('click', function () { show(false); var K = document.getElementById('khP'); if (K) K.style.display = 'block'; var L = document.getElementById('surahList'); if (L) L.style.display = 'none'; }, true);
    return true;
  }
  var n = 0, iv = setInterval(function () { if (install() && document.getElementById('tabKh') || ++n > 40) clearInterval(iv); }, 300);
})();
