/* ai-rag.js v2 — offline retrieval over trusted Islamic texts (Quran + Jalalayn, Bukhari, Muslim, Nawawi 40, Qudsi 40, Sunan).
 * Browser + Node compatible. The corpus ("ai/*.json") is built by tools/build_ai_corpus.py at deploy time.
 * API: AiRag.load(onProgress) -> Promise (core ready) ; AiRag.loadAll() -> Promise (everything ready) ;
 *      AiRag.search(keywords, {kQ,kH}) -> hits ; AiRag.get(id) ; AiRag.kurdish(id) -> Promise<string>
 *
 * v2 changes (same search results, much faster, and it no longer breaks for the whole session after one bad download):
 *  - words are stemmed once and remembered (the same ~100k words repeat millions of times)
 *  - the next file downloads while the current one is being indexed
 *  - load() is ready after the Quran + the four main hadith books; the four Sunan books are indexed in the background
 *  - a failed download is retried, and a file that still fails is skipped instead of failing every later question
 *  - indexing is done in small slices so the screen never freezes */
(function (root) {
  'use strict';
  var BASE = 'ai/';
  var PACKS = [['bukhari', 'صحيح البخاري'], ['muslim', 'صحيح مسلم'], ['nawawi', 'الأربعون النووية'], ['qudsi', 'الأحاديث القدسية'], ['abudawud', 'سنن أبي داود'], ['tirmidhi', 'جامع الترمذي'], ['nasai', 'سنن النسائي'], ['ibnmajah', 'سنن ابن ماجه']];
  var CORE = 4;   /* the first four packs are needed before the first answer; the rest follow in the background */
  var SURAH = ['الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم', 'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة', 'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'];

  var STOP = { 'من': 1, 'في': 1, 'على': 1, 'عن': 1, 'الى': 1, 'إلى': 1, 'ما': 1, 'هل': 1, 'ان': 1, 'أن': 1, 'إن': 1, 'لا': 1, 'هو': 1, 'هي': 1, 'ذلك': 1, 'هذا': 1, 'هذه': 1, 'كان': 1, 'قال': 1, 'ثم': 1, 'او': 1, 'أو': 1, 'قد': 1, 'له': 1, 'به': 1, 'لم': 1, 'يا': 1, 'كل': 1, 'مع': 1, 'بن': 1, 'عليه': 1, 'الله': 1, 'رسول': 1, 'صلى': 1, 'وسلم': 1, 'حدثنا': 1, 'اخبرنا': 1, 'عنه': 1, 'عنها': 1, 'رضي': 1, 'عنهما': 1, 'ابي': 1, 'عبد': 1, 'قالت': 1, 'سمعت': 1, 'النبي': 1, 'فقال': 1, 'الذي': 1, 'التي': 1 };

  function norm(s) {
    return String(s || '')
      .replace(/[\u064B-\u0670\u065F\u0640\u06D6-\u06ED\u0653-\u0655]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
      .replace(/\u0649/g, '\u064A')
      .replace(/\u0629/g, '\u0647')
      .replace(/[^\u0621-\u064A\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function stem(w) {
    if (w.length > 4) w = w.replace(/^(وال|بال|لل|فال|كال)/, '');
    if (w.length > 3) w = w.replace(/^ال/, '');
    if (w.length > 4) w = w.replace(/(ات|ون|ين|ان|ها|هم|كم|نا)$/, '');
    return w;
  }
  var stemCache = Object.create(null);
  function stemC(w) {
    var r = stemCache[w];
    if (r === undefined) { r = stem(w); stemCache[w] = r; }
    return r;
  }
  function tokens(s) {
    var out = [], parts = norm(s).split(' ');
    for (var i = 0; i < parts.length; i++) {
      var w = parts[i];
      if (w.length < 2 || STOP[w] === 1) continue;
      w = stemC(w);
      if (w.length >= 2) out.push(w);
    }
    return out;
  }

  var docs = [];            // {id, kind, label, text, extra}
  var index = null;         // term -> [[docIdx, tf], ...]
  var dl = [], sumDl = 0;
  var loadedCore = null, loadedAll = null;
  var quranKu = null, byId = null;
  var missing = [];         // files that could not be downloaded even after retries

  function addDoc(d, textForIndex) {
    var t = tokens(textForIndex), tf = Object.create(null), i;
    for (i = 0; i < t.length; i++) tf[t[i]] = (tf[t[i]] || 0) + 1;
    var idx = docs.length;
    docs.push(d); dl.push(t.length); sumDl += t.length;
    if (byId) byId[d.id] = d;
    for (var k in tf) { (index[k] || (index[k] = [])).push([idx, tf[k]]); }
  }

  function getJSONOnce(url) {
    if (typeof fetch === 'function' && typeof process === 'undefined') {
      return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url); return r.json(); });
    }
    try { return Promise.resolve(JSON.parse(require('fs').readFileSync((root.AI_RAG_DIR || '') + url.replace(/^ai\//, ''), 'utf8'))); }
    catch (e) { return Promise.reject(e); }
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  /* a download that fails is tried again (twice) before giving up */
  function getJSON(url) {
    return getJSONOnce(url).catch(function () { return wait(600).then(function () { return getJSONOnce(url); }); })
      .catch(function () { return wait(1500).then(function () { return getJSONOnce(url); }); });
  }

  /* put rows into the index a slice at a time, so the screen stays alive */
  function indexRows(n, addRow) {
    return new Promise(function (resolve) {
      var j = 0;
      (function step() {
        var end = Math.min(n, j + 1500);
        for (; j < end; j++) addRow(j);
        if (j < n) setTimeout(step, 0); else resolve();
      })();
    });
  }
  function indexQuran(q) {
    var v = q.v;
    return indexRows(v.length, function (i) {
      addDoc({ id: 'q:' + v[i][0] + ':' + v[i][1], kind: 'quran', s: v[i][0], a: v[i][1], ar: v[i][2], tafsir: v[i][3] }, v[i][2] + ' ' + v[i][3]);
    });
  }
  function indexPack(pk, d) {
    var h = d.h;
    return indexRows(h.length, function (j) {
      addDoc({ id: 'h:' + pk[0] + ':' + h[j][0], kind: 'hadith', book: pk[0], label: d.n, n: h[j][0], ar: h[j][1], grade: h[j][2] || '' }, h[j][1]);
    });
  }
  /* the next file is already downloading while the current one is being indexed (only two files are in memory at once) */
  function fetchPack(pk) {
    return getJSON(BASE + pk[0] + '.json').catch(function () { missing.push(pk[0]); return null; });
  }
  function runPacks(list, first, onEach) {
    var p = Promise.resolve(), pre = list.length ? (first || fetchPack(list[0])) : null;
    list.forEach(function (pk, i) {
      p = p.then(function () {
        var cur = pre;
        pre = i + 1 < list.length ? fetchPack(list[i + 1]) : null;
        return cur.then(function (d) { return d && d.h ? indexPack(pk, d) : null; }).then(function () { if (onEach) onEach(); });
      });
    });
    return p;
  }

  function load(onProgress) {
    if (loadedCore) return loadedCore;
    var total = 1 + CORE, done = 0;
    function tick() { done++; if (onProgress) try { onProgress(Math.min(1, done / total)); } catch (e) {} }
    index = index || {};
    var core = PACKS.slice(0, CORE), rest = PACKS.slice(CORE);
    var firstPack = fetchPack(core[0]);   /* starts at once, in parallel with the Quran file */
    loadedCore = getJSON(BASE + 'quran.json').then(indexQuran).then(function () {
      tick();
      return runPacks(core, firstPack, tick);
    }).then(function () {
      /* the Sunan books follow in the background; search simply uses whatever is indexed so far */
      var retry = core.filter(function (pk) { return missing.indexOf(pk[0]) >= 0; });   /* a main book that failed is tried again too */
      missing = missing.filter(function (n) { return !retry.some(function (pk) { return pk[0] === n; }); });
      loadedAll = runPacks(retry.concat(rest)).then(function () { return true; }, function () { return true; });
      return true;
    }).catch(function (e) {
      /* the Quran file could not be downloaded: do NOT remember the failure, the next question tries again */
      loadedCore = null; loadedAll = null; docs = []; dl = []; sumDl = 0; index = null; byId = null;
      throw e;
    });
    return loadedCore;
  }
  function loadAll() { return load().then(function () { return loadedAll || true; }); }

  /* BM25. keywords: array of Arabic strings (phrases allowed). Returns {quran:[...], hadith:[...]} */
  function search(keywords, opt) {
    opt = opt || {};
    var kQ = opt.kQ || 6, kH = opt.kH || 8;
    var out = { quran: [], hadith: [] };
    if (!index || !docs.length) return out;
    var qt = Object.create(null), i, j;
    (keywords || []).forEach(function (kw) { tokens(kw).forEach(function (t) { qt[t] = (qt[t] || 0) + 1; }); });
    var scores = {}, N = docs.length, k1 = 1.4, b = .75, avg = sumDl / Math.max(1, N);
    for (var t in qt) {
      var post = index[t]; if (!post) continue;
      var idf = Math.log(1 + (N - post.length + .5) / (post.length + .5));
      for (j = 0; j < post.length; j++) {
        var di = post[j][0], f = post[j][1];
        scores[di] = (scores[di] || 0) + idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl[di] / avg)) * (1 + .15 * (qt[t] - 1));
      }
    }
    var arr = Object.keys(scores).map(function (d) { return [Number(d), scores[d]]; }).sort(function (x, y) { return y[1] - x[1]; });
    for (i = 0; i < arr.length && (out.quran.length < kQ || out.hadith.length < kH); i++) {
      var d = docs[arr[i][0]], bucket = d.kind === 'quran' ? out.quran : out.hadith;
      if (bucket.length < (d.kind === 'quran' ? kQ : kH)) bucket.push(Object.assign({ score: arr[i][1] }, d));
    }
    return out;
  }

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
    return d.label + ' (' + d.n + ')' + (d.grade ? ' — ' + d.grade : '');
  }

  var API = { load: load, loadAll: loadAll, search: search, get: get, kurdish: kurdish, label: label, norm: norm, tokens: tokens, size: function () { return docs.length; }, missing: function () { return missing.slice(); } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.AiRag = API;
})(typeof window !== 'undefined' ? window : globalThis);
