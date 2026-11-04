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

  /* ---- Prophet-story questions (narrative path): ayah -> which prophet's story; ayah -> next ayah (within a story) ---- */
  var STORY = [
    ['ئادەم', [2,30,37], [20,116,122]],
    ['نوح', [71,2,28], [11,25,48], [7,59,64], [26,105,122], [37,75,79], [23,23,30], [29,14,15], [54,9,15], [21,76,77], [10,71,73]],
    ['هود', [11,50,60], [7,65,72], [26,123,140], [46,21,26]],
    ['سالح', [11,61,68], [7,73,79], [26,141,159], [27,45,53]],
    ['ئیبراهیم', [2,124,141], [6,74,83], [14,35,41], [19,41,50], [21,51,70], [26,69,89], [37,83,113], [29,16,27], [11,69,76], [15,51,60], [51,24,30]],
    ['لوط', [11,77,83], [7,80,84], [26,160,175], [27,54,58], [15,61,77], [29,28,35], [37,133,138], [21,74,75]],
    ['شوعەیب', [11,84,95], [7,85,93], [26,176,191], [29,36,37]],
    ['موسا', [20,9,98], [28,7,43], [26,10,68], [7,103,137], [10,75,92], [27,7,14], [18,60,82], [79,15,26], [40,23,46], [17,101,103], [43,46,56]],
    ['داود', [38,17,26], [34,10,11], [21,79,80]],
    ['سلێمان', [27,15,44], [38,30,40], [34,12,14], [21,81,82]],
    ['یوسف', [12,5,100]],
    ['ئەیوب', [38,41,44], [21,83,84]],
    ['یونس', [37,139,148], [21,87,88], [68,48,50]],
    ['زەکەریا', [19,2,11], [3,37,41], [21,89,90]],
    ['عیسا', [19,29,34], [3,45,55], [5,110,118], [43,57,65]],
    ['ئیلیاس', [37,123,132]]
  ];
  var NAMES = /نوح|هود|صالح|يوسف|ابراهيم|موسي|عيسي|لوط|شعيب|داود|سليمان|ايوب|زكريا|يونس|اسماعيل|ادريس|الياس|يحيي|هارون|يعقوب|اسحاق|ادم|مريم|فرعون|قارون|هامان|ذا النون|ذو النون|اسرايل|اسرائيل/;
  function normS(s) { return norm(s).replace(/ى/g, 'ي').replace(/ة/g, 'ه'); }
  var story = null;
  function buildStory() {
    if (story) return story; story = { list: [], next: [] };
    STORY.forEach(function (st) {
      for (var i = 1; i < st.length; i++) {
        var r = st[i], s = r[0];
        for (var a = r[1]; a <= r[2]; a++) {
          var t = bySurah[s] && bySurah[s][a]; if (!t || !uniq[s + ':' + a]) continue;
          if (NAMES.test(normS(t))) continue;
          var e = { p: st[0], s: s, a: a, t: t, lo: r[1], hi: r[2] };
          story.list.push(e);
          var nx = a < r[2] && bySurah[s][a + 1] && uniq[s + ':' + (a + 1)] ? bySurah[s][a + 1] : null;
          if (nx) story.next.push(e);
        }
      }
    });
    return story;
  }
  function prophets() { return STORY.map(function (x) { return x[0]; }); }
  function makeStory() {
    var S = buildStory(), kind = Math.random() < .6 ? 1 : 2, e;
    if (kind === 2 && S.next.length) {
      e = S.next[rnd(S.next.length)];
      var pool = []; for (var k = e.lo; k <= e.hi; k++) if (k !== e.a && k !== e.a + 1 && bySurah[e.s][k] && uniq[e.s + ':' + k]) pool.push(k);
      if (pool.length >= 3) {
        var wr = shuf(pool).slice(0, 3).map(function (k2) { return bySurah[e.s][k2]; });
        return opts(bySurah[e.s][e.a + 1], wr, 'ئەم ئایەتە لە چیرۆکی پێغەمبەر ' + e.p + 'یە (' + SURAH[e.s - 1] + ' ' + num(e.s) + ':' + num(e.a) + ')، و ئایەتی دواتر ' + num(e.a + 1) + 'ە.', { id: 'g:S2:' + e.s + ':' + e.a, q: 'ئایەتی دوای ئەم ئایەتە کامەیە؟ (چیرۆکی پێغەمبەر ' + e.p + ')', ar: e.t, ref: '؟', diff: 'deep', path: 'narrative' });
      }
    }
    e = S.list[rnd(S.list.length)];
    return opts(e.p, shuf(prophets().filter(function (x) { return x !== e.p; })).slice(0, 3), 'ئەم ئایەتە لە چیرۆکی پێغەمبەر ' + e.p + 'یە — ' + SURAH[e.s - 1] + ' ' + num(e.s) + ':' + num(e.a) + '.', { id: 'g:S1:' + e.s + ':' + e.a, q: 'ئەم ئایەتە لە چیرۆکی کام پێغەمبەردایە؟', ar: e.t, ref: '؟', diff: 'steady', path: 'narrative' });
  }
  function batch(n, seen, path) {
    var out = [], guard = 0, mine = {}; seen = seen || {};
    while (out.length < n && guard++ < n * 40) {
      var q = path === 'narrative' ? makeStory() : make(TYPES[rnd(TYPES.length)]);
      if (!q || seen[q.id] || mine[q.id]) continue;
      mine[q.id] = 1; q.path = path === 'narrative' ? 'narrative' : 'endless'; out.push(q);
    }
    return out;
  }
  window.KnEndless = { ready: ready, batch: batch, total: function () { return 114 * 3 + 6236 * 3; }, storyTotal: function () { var S = buildStory(); return S.list.length + S.next.length; } };
})();
