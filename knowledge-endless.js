/* knowledge-endless.js v1 — endless, data-verified Quran questions (≈25,000 unique) generated from ai/quran.json.
   API: KnEndless.ready() -> Promise<bool>; KnEndless.batch(n, seenSet) -> [question objects compatible with knowledge.js] */
(function () {
  'use strict';
  var SURAH = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
  var D = '٠١٢٣٤٥٦٧٨٩';
  function num(n) { return String(n).replace(/\d/g, function (d) { return D[d]; }); }
  var data = null, loading = null, bySurah = {}, count = {}, uniq = {};
  function norm(s) { return String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[آأإٱ]/g, 'ا').replace(/\s+/g, ' ').trim(); }
  function ready() {
    if (data) return Promise.resolve(true);
    if (loading) return loading;
    loading = fetch('ai/quran.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      var v = j.v || j, seen = {};
      v.forEach(function (r) { var k = norm(r[2]); seen[k] = (seen[k] || 0) + 1; });
      v.forEach(function (r) {
        (bySurah[r[0]] = bySurah[r[0]] || [])[r[1]] = r[2];
        count[r[0]] = Math.max(count[r[0]] || 0, r[1]);
        uniq[r[0] + ':' + r[1]] = seen[norm(r[2])] === 1 && norm(r[2]).length >= 22;
      });
      if (v.length < 6000) throw 0;
      data = v; return true;
    }).catch(function () { loading = null; return false; });
    return loading;
  }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function opts(correct, wrongs, why, extra) {
    var all = shuf([correct].concat(wrongs)), ids = ['a', 'b', 'c', 'd'], ch = all.map(function (t, i) { return { id: ids[i], t: t }; });
    var ok = ch.filter(function (c) { return c.t === correct; })[0].id;
    var q = { path: 'endless', diff: 'gentle', choices: ch, ok: ok, why: why, near: '', src: 'قورئانی پیرۆز' };
    for (var k in extra) q[k] = extra[k]; return q;
  }
  function nearNums(n, lo, hi) {
    var c = [n + 1, n - 1, n + 2, n - 2, n + 3, n - 3, n + 5, n - 5, n + 10].filter(function (x) { return x >= lo && x <= hi && x !== n; });
    return shuf(c).slice(0, 3);
  }
  function surahsExcept(ex, n, ex2) { var r = []; while (r.length < n) { var s = 1 + rnd(114); if (s !== ex && s !== ex2 && r.indexOf(s) < 0) r.push(s); } return r; }
  function ref(s, a) { return SURAH[s - 1] + ' ' + num(s) + ':' + num(a); }
  var TYPES = ['A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'F'];
  function make(t) {
    var s, a, q;
    if (t === 'B') { s = 1 + rnd(114); var c = count[s]; q = opts(num(c), nearNums(c, 3, 300).map(num), 'سورەتی ' + SURAH[s - 1] + ' ' + num(c) + ' ئایەتی هەیە.', { id: 'g:B:' + s, q: 'سورەتی «' + SURAH[s - 1] + '» چەند ئایەتی هەیە؟', ar: '', ref: 'سورەتی ' + SURAH[s - 1], diff: 'steady' }); return q; }
    if (t === 'C') { s = 1 + rnd(114); return opts(num(s), nearNums(s, 1, 114).map(num), 'سورەتی ' + SURAH[s - 1] + ' ژمارە ' + num(s) + 'ە لە مەسحەفدا.', { id: 'g:C:' + s, q: 'سورەتی «' + SURAH[s - 1] + '» ژمارەی چەندە لە ڕیزبەندیی مەسحەفدا؟', ar: '', ref: 'سورەتی ' + SURAH[s - 1] }); }
    if (t === 'D') { s = 1 + rnd(113); return opts(SURAH[s], surahsExcept(s + 1, 3, s).map(function (x) { return SURAH[x - 1]; }), 'دوای سورەتی ' + SURAH[s - 1] + ' سورەتی ' + SURAH[s] + ' دێت.', { id: 'g:D:' + s, q: 'دوای سورەتی «' + SURAH[s - 1] + '» کام سورەت دێت؟', ar: '', ref: 'سورەتی ' + SURAH[s - 1] }); }
    for (var tries = 0; tries < 60; tries++) {
      s = 1 + rnd(114); a = 1 + rnd(count[s]);
      if (!uniq[s + ':' + a]) continue;
      var txt = bySurah[s][a];
      if (t === 'A') return opts(SURAH[s - 1], surahsExcept(s, 3).map(function (x) { return SURAH[x - 1]; }), 'ئەم ئایەتە لە سورەتی ' + SURAH[s - 1] + 'یە، ئایەتی ' + num(a) + '.', { id: 'g:A:' + s + ':' + a, q: 'ئەم ئایەتە لە کام سورەتە؟', ar: txt, ref: '؟', diff: 'gentle' });
      if (t === 'E') { if (count[s] < 8) continue; var w = nearNums(a, 1, count[s]); if (w.length < 3) continue; return opts(num(a), w.map(num), 'ئەم ئایەتە ئایەتی ' + num(a) + 'ە لە سورەتی ' + SURAH[s - 1] + '.', { id: 'g:E:' + s + ':' + a, q: 'ئەم ئایەتە ژمارەی چەندە لە سورەتی «' + SURAH[s - 1] + '»؟', ar: txt, ref: '؟', diff: 'deep' }); }
      if (t === 'F') {
        var nx = bySurah[s][a + 1]; if (!nx || !uniq[s + ':' + (a + 1)] || count[s] < 6) continue;
        var pool = []; for (var k = 1; k <= count[s]; k++) if (k !== a + 1 && k !== a && bySurah[s][k] && uniq[s + ':' + k]) pool.push(k);
        if (pool.length < 3) continue;
        var wr = shuf(pool).slice(0, 3).map(function (k2) { return bySurah[s][k2]; });
        return opts(nx, wr, 'ئایەتی دوای ئایەتی ' + num(a) + ' لە سورەتی ' + SURAH[s - 1] + ' ئایەتی ' + num(a + 1) + 'ە.', { id: 'g:F:' + s + ':' + a, q: 'ئایەتی دوای ئەم ئایەتە کامەیە؟ (' + SURAH[s - 1] + ')', ar: txt, ref: '؟', diff: 'deep' });
      }
    }
    return null;
  }
  function batch(n, seen) {
    var out = [], guard = 0, mine = {}; seen = seen || {};
    while (out.length < n && guard++ < n * 40) {
      var q = make(TYPES[rnd(TYPES.length)]);
      if (!q || seen[q.id] || mine[q.id]) continue;
      mine[q.id] = 1; q.path = 'endless'; out.push(q);
    }
    return out;
  }
  window.KnEndless = { ready: ready, batch: batch, total: function () { return 114 * 3 + 6236 * 3; } };
})();
