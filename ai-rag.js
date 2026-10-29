/* ai-rag.js v1 — offline retrieval over trusted Islamic texts (Quran + Jalalayn, Bukhari, Muslim, Nawawi 40, Qudsi 40).
 * Browser + Node compatible. The corpus ("ai/*.json") is built by tools/build_ai_corpus.py at deploy time.
 * API: AiRag.load(onProgress) -> Promise ; AiRag.search(keywords, {kQ,kH}) -> hits ; AiRag.get(id) ; AiRag.kurdish(id) -> Promise<string> */
(function (root) {
  'use strict';
  var BASE = 'ai/';
  var PACKS = [['bukhari', 'صحيح البخاري'], ['muslim', 'صحيح مسلم'], ['nawawi', 'الأربعون النووية'], ['qudsi', 'الأحاديث القدسية']];
  var SURAH = ['الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'];

  var STOP = { 'من': 1, 'في': 1, 'على': 1, 'عن': 1, 'الى': 1, 'إلى': 1, 'ما': 1, 'هل': 1, 'ان': 1, 'أن': 1, 'إن': 1, 'لا': 1, 'هو': 1, 'هي': 1, 'ذلك': 1, 'هذا': 1, 'هذه': 1, 'كان': 1, 'قال': 1, 'ثم': 1, 'او': 1, 'أو': 1, 'قد': 1, 'له': 1, 'به': 1, 'لم': 1, 'يا': 1, 'كل': 1, 'مع': 1, 'بن': 1, 'عليه': 1, 'الله': 1, 'رسول': 1, 'صلى': 1, 'وسلم': 1, 'حدثنا': 1, 'اخبرنا': 1, 'عنه': 1, 'عنها': 1, 'رضي': 1, 'عنهما': 1, 'ابي': 1, 'عبد': 1, 'قالت': 1, 'سمعت': 1, 'النبي': 1, 'فقال': 1, 'الذي': 1, 'التي': 1, 'ما': 1 };

  function norm(s) {
    return String(s || '')
      .replace(/[ً-ٰٟـۖ-ۭٓ-ٕ]/g, '')
      .replace(/[آأإٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^ء-ي\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function stem(w) {
    if (w.length > 4) w = w.replace(/^(وال|بال|لل|فال|كال)/, '');
    if (w.length > 3) w = w.replace(/^ال/, '');
    if (w.length > 4) w = w.replace(/(ات|ون|ين|ان|ها|هم|كم|نا)$/, '');
    return w;
  }
  function tokens(s) {
    var out = [], parts = norm(s).split(' ');
    for (var i = 0; i < parts.length; i++) {
      var w = parts[i];
      if (w.length < 2 || STOP[w]) continue;
      w = stem(w);
      if (w.length >= 2) out.push(w);
    }
    return out;
  }

  var docs = [];            // {id, kind, label, text, extra}
  var index = null;         // term -> [[docIdx, tf], ...]
  var dl = [], avg = 0, loaded = null;
  var quranKu = null;

  function addDoc(d, textForIndex) {
    var t = tokens(textForIndex), tf = {}, i;
    for (i = 0; i < t.length; i++) tf[t[i]] = (tf[t[i]] || 0) + 1;
    var idx = docs.length;
    docs.push(d); dl.push(t.length);
    for (var k in tf) { (index[k] || (index[k] = [])).push([idx, tf[k]]); }
  }

  function getJSON(url) {
    if (typeof fetch === 'function' && typeof process === 'undefined') {
      return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url); return r.json(); });
    }
    return Promise.resolve(JSON.parse(require('fs').readFileSync((root.AI_RAG_DIR || '') + url.replace(/^ai\//, ''), 'utf8')));
  }

  function load(onProgress) {
    if (loaded) return loaded;
    var total = 1 + PACKS.length, done = 0;
    function tick() { done++; if (onProgress) try { onProgress(done / total); } catch (e) {} }
    index = {};
    loaded = getJSON(BASE + 'quran.json').then(function (q) {
      var v = q.v;
      for (var i = 0; i < v.length; i++) {
        addDoc({ id: 'q:' + v[i][0] + ':' + v[i][1], kind: 'quran', s: v[i][0], a: v[i][1], ar: v[i][2], tafsir: v[i][3] }, v[i][2] + ' ' + v[i][3]);
      }
      tick();
      return PACKS.reduce(function (p, pk) {
        return p.then(function () {
          return getJSON(BASE + pk[0] + '.json').then(function (d) {
            for (var j = 0; j < d.h.length; j++) {
              addDoc({ id: 'h:' + pk[0] + ':' + d.h[j][0], kind: 'hadith', book: pk[0], label: d.n, n: d.h[j][0], ar: d.h[j][1] }, d.h[j][1]);
            }
            tick();
          });
        });
      }, Promise.resolve());
    }).then(function () {
      var s = 0; for (var i = 0; i < dl.length; i++) s += dl[i];
      avg = s / Math.max(1, dl.length);
      return true;
    });
    return loaded;
  }

  /* BM25. keywords: array of Arabic strings (phrases allowed). Returns {quran:[...], hadith:[...]} */
  function search(keywords, opt) {
    opt = opt || {};
    var kQ = opt.kQ || 6, kH = opt.kH || 8;
    var qt = {}, i, j;
    (keywords || []).forEach(function (kw) { tokens(kw).forEach(function (t) { qt[t] = (qt[t] || 0) + 1; }); });
    var scores = {}, N = docs.length, k1 = 1.4, b = .75;
    for (var t in qt) {
      var post = index[t]; if (!post) continue;
      var idf = Math.log(1 + (N - post.length + .5) / (post.length + .5));
      for (j = 0; j < post.length; j++) {
        var di = post[j][0], f = post[j][1];
        scores[di] = (scores[di] || 0) + idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl[di] / avg)) * (1 + .15 * (qt[t] - 1));
      }
    }
    var arr = Object.keys(scores).map(function (d) { return [Number(d), scores[d]]; }).sort(function (x, y) { return y[1] - x[1]; });
    var out = { quran: [], hadith: [] };
    for (i = 0; i < arr.length && (out.quran.length < kQ || out.hadith.length < kH); i++) {
      var d = docs[arr[i][0]], bucket = d.kind === 'quran' ? out.quran : out.hadith;
      if (bucket.length < (d.kind === 'quran' ? kQ : kH)) bucket.push(Object.assign({ score: arr[i][1] }, d));
    }
    return out;
  }

  var byId = null;
  function get(id) {
    if (!byId) { byId = {}; for (var i = 0; i < docs.length; i++) byId[docs[i].id] = docs[i]; }
    return byId[id] || null;
  }
  function kurdish(id) {
    var m = /^q:(\d+):(\d+)$/.exec(id); if (!m) return Promise.resolve('');
    var d = get(id); if (!d) return Promise.resolve('');
    var p = quranKu ? Promise.resolve(quranKu) : getJSON(BASE + 'quran-ku.json').then(function (j) { quranKu = j.v; return quranKu; });
    return p.then(function (ku) { return ku[docs.findIndex ? docs.findIndex(function (x) { return x.id === id; }) : 0] || ''; });
  }
  function label(d) {
    if (!d) return '';
    if (d.kind === 'quran') return 'سورة ' + SURAH[d.s - 1] + ' ﴿' + d.a + '﴾';
    return d.label + ' (' + d.n + ')';
  }

  var API = { load: load, search: search, get: get, kurdish: kurdish, label: label, norm: norm, tokens: tokens, size: function () { return docs.length; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.AiRag = API;
})(typeof window !== 'undefined' ? window : globalThis);
