/* Reading statistics + streak. Same localStorage key in the home reader and the mushaf shell. */
(function () {
  if (window.__stats) return;
  var K = 'read_stats', LAST = Date.now(), ACT = 120000, MIN_DAY = 60;
  function load() { try { return JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) {} }
  function key(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  ['touchstart', 'click', 'scroll', 'keydown', 'message'].forEach(function (e) { window.addEventListener(e, function () { LAST = Date.now(); }, { passive: true, capture: true }); });

  function inShell() { try { return typeof page === 'number' && typeof S !== 'undefined'; } catch (e) { return false; } }
  function reading() {
    if (document.visibilityState !== 'visible') return false;
    if (Date.now() - LAST > ACT) return false;
    if (inShell()) return true;
    var r = document.getElementById('reader'); return !!(r && r.classList.contains('active'));
  }
  function curPage() { try { return inShell() ? page : (typeof currentPage === 'number' ? currentPage : 0); } catch (e) { return 0; } }
  var lastP = 0;
  setInterval(function () {
    if (!reading()) return;
    var o = load(), k = key(), d = o[k] || (o[k] = { s: 0, p: [] });
    d.s += 5;
    var p = curPage();
    if (p && p !== lastP) { lastP = p; if (d.p.indexOf(p) < 0) d.p.push(p); }
    save(o);
  }, 5000);

  function streak(o) {
    var n = 0, d = new Date();
    function ok(x) { var e = o[key(x)]; return e && (e.s >= MIN_DAY); }
    if (!ok(d)) d.setDate(d.getDate() - 1); // today not finished yet doesn't break the chain
    while (ok(d)) { n++; d.setDate(d.getDate() - 1); }
    var best = 0, run = 0, ks = Object.keys(o).sort(), prev = null;
    ks.forEach(function (k) {
      if (!(o[k].s >= MIN_DAY)) return;
      var t = new Date(k + 'T00:00:00');
      run = (prev && Math.round((t - prev) / 864e5) === 1) ? run + 1 : 1; prev = t; if (run > best) best = run;
    });
    return { cur: n, best: Math.max(best, n) };
  }
  function html() {
    var o = load(), t = o[key()] || { s: 0, p: [] }, sk = streak(o), days = [], i, wk = 0, wp = 0, mx = 1;
    var names = ['یەک', 'دوو', 'سێ', 'چوار', 'پێنج', 'هەینی', 'شەممە'];
    for (i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); var e = o[key(d)] || { s: 0, p: [] }; days.push({ s: e.s, l: names[d.getDay() === 0 ? 0 : d.getDay()] || '', t: i === 0 }); wk += e.s; wp += e.p.length; if (e.s > mx) mx = e.s; }
    var mins = function (s) { return Math.floor(s / 60); };
    var cell = function (v, l) { return '<div style="flex:1;text-align:center;background:#e8f3ee;border-radius:11px;padding:9px 4px"><b style="font-size:19px;color:#176b4b">' + v + '</b><div style="font-size:12px;color:#6d7975">' + l + '</div></div>'; };
    var bars = days.map(function (x) { return '<div style="flex:1;text-align:center"><div style="height:60px;display:flex;align-items:flex-end;justify-content:center"><div style="width:70%;min-height:3px;height:' + Math.round(x.s / mx * 100) + '%;background:' + (x.t ? '#b48a3c' : '#176b4b') + ';border-radius:4px"></div></div><small style="font-size:11px;color:#6d7975">' + mins(x.s) + '</small></div>'; }).join('');
    return '<div class="khc"><h3>📊 ئاماری خوێندنەوە</h3>'
      + '<div style="display:flex;gap:7px;margin-bottom:8px">' + cell('🔥 ' + sk.cur, 'زنجیرەی ڕۆژ') + cell(sk.best, 'باشترین زنجیرە') + '</div>'
      + '<div style="font-weight:bold;margin:6px 0 4px">ئەمڕۆ</div><div style="display:flex;gap:7px">' + cell(mins(t.s), 'خولەک') + cell(t.p.length, 'پەڕە') + cell('≈' + Math.round(t.p.length * 10.3), 'ئایەت') + '</div>'
      + '<div style="font-weight:bold;margin:10px 0 4px">ئەم هەفتەیە (٧ ڕۆژ)</div><div style="display:flex;gap:7px">' + cell(mins(wk), 'خولەک') + cell(wp, 'پەڕە') + cell('≈' + Math.round(wp * 10.3), 'ئایەت') + '</div>'
      + '<div style="display:flex;gap:4px;margin-top:10px">' + bars + '</div><small style="color:#6d7975">ڕۆژێک بۆ زنجیرە دەژمێردرێت کە لانیکەم ١ خولەک بخوێنیتەوە. ژمارەی ئایەت نزیکەیییە.</small></div>';
  }
  window.__stats = { html: html };
})();
