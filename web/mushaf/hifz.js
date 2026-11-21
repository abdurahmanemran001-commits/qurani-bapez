/* hifz.js v2 — لەبەرکردنی قورئان
   Pick a surah, then recite from memory. The ayat are shown only as numbers; every word is "written" the moment
   the microphone hears it (Web Speech API, Arabic, interim results = very fast). Wrong words are refused and a
   progressive hint is given. Progress is saved per ayah. An AI coach (worker /hifz-coach) explains the ayah and
   gives a memory tip. Texts follow the app language (ckb / en / ar; others use English). */
(function () {
  if (window.__hifzV2) return;
  window.__hifzV2 = true;

  var LS_KEY = 'hifz_v2';
  /* [name, similarity needed for a word] */
  var LEVELS = [0.5, 0.66, 0.86];
  var TEXT = {};
  var rec = null, restartT = null, flashT = {};

  var T = {
    ckb: { title: 'لەبەرکردنی قورئان', sub: 'بە دەنگ بخوێنەوە، وشەکان بە زیندوویی دەنووسرێنەوە', search: 'گەڕان بە ناو یان ژمارە…', all: 'هەموو', prog: 'لە ڕێگادا', done: 'تەواو', ay: 'ئایەت', mast: 'لەبەرکراو', cont: 'بەردەوام بە', lvl: ['ئاسان', 'ناوەند', 'سەخت'], level: 'ئاستی ڕەخنە', back: '‹ سورەتەکان', exit: 'بەشەکان', tap: 'مایک دابگرە و بخوێنە', listen: 'گوێم لێیە…', stop: 'ڕاگرتن', hint: 'ئاماژە', ai: '✨ AI', loading: 'بارکردن…', loadfail: 'دەقی قورئان بار نەبوو. ئینتەرنێت بپشکنە.', nomic: 'ئەم وێبگەڕە پشتگیری ناسینەوەی دەنگ ناکات. Chrome بەکاربهێنە.', denied: 'مۆڵەتی مایکرۆفۆن نەدراوە.', net: 'ناسینەوەی دەنگ ئینتەرنێت دەوێت.', wrong: 'هەڵەیە، دووبارە بیڵێ', fin: 'ماشاءاللە! سورەتەکەت تەواو کرد', clean: 'ئایەتی بێ هەڵە', fails: 'هەڵە', again: 'دووبارە', coachT: 'ڕاهێنەری AI', coachWait: 'AI بیر دەکاتەوە…', coachFail: 'AI ئێستا بەردەست نییە.', say: 'دەمیت', jump: 'لێرەوە دەست پێ بکە', mText: 'دەق', mTr: 'وەرگێڕان', mPage: 'موسحەف', trPick: 'وەرگێڕ هەڵبگرە', trLoad: 'وەرگێڕان بار دەکرێت…', trNone: 'وەرگێڕان بەردەست نییە (ئینتەرنێت)', trSearch: 'گەڕان لە وەرگێڕەکان…', hLetter: 'لەبەرکردنی حەرفی', hLetterS: 'سورەتێک هەڵبژێرە و وشە بە وشە بە دەنگ بینووسەوە', hPage: 'لەبەرکردنی لاپەڕەیی', hPageS: 'لاپەڕەی موسحەف بێ ئایەت، بە دەنگ پڕی بکەرەوە', hQuiz: 'پرسیار و وەڵام', hQuizS: 'ئایەت بە دەنگ، ٢٠ چرکە، ٤ هەڵبژاردن', pgm: '📖 لەبەرکردن لەسەر لاپەڕە', pgmS: 'لاپەڕەی موسحەف بێ ئایەت، بە دەنگ پڕی بکەرەوە', quiz: '❓ پرسیار و وەڵام', pg: 'لاپەڕە', pgGo: 'بڕۆ', pgPh: 'ژمارەی لاپەڕە (١–٦٠٤)', pgBad: 'لاپەڕە نەدۆزرایەوە. ئینتەرنێت بپشکنە.', note: 'ناسینەوەی دەنگ تەنها پیتەکان دەناسێتەوە، نەک فەتحە و زەمە.' },
    en: { title: 'Quran Memorisation', sub: 'Recite aloud — words appear live as you say them', search: 'Search by name or number…', all: 'All', prog: 'In progress', done: 'Mastered', ay: 'ayat', mast: 'memorised', cont: 'Continue', lvl: ['Easy', 'Medium', 'Strict'], level: 'Strictness', back: '‹ Surahs', exit: 'Sections', tap: 'Hold the mic and recite', listen: 'Listening…', stop: 'Stop', hint: 'Hint', ai: '✨ AI', loading: 'Loading…', loadfail: 'Could not load the Quran text. Check your internet.', nomic: 'This browser does not support voice recognition. Use Chrome.', denied: 'Microphone permission denied.', net: 'Voice recognition needs internet.', wrong: 'Wrong, say it again', fin: 'Mashallah! You finished the surah', clean: 'Clean ayat', fails: 'Mistakes', again: 'Again', coachT: 'AI coach', coachWait: 'AI is thinking…', coachFail: 'AI is not available right now.', say: 'Heard', jump: 'Start from here', mText: 'Text', mTr: 'Translation', mPage: 'Mushaf', trPick: 'Choose translator', trLoad: 'Loading translation…', trNone: 'Translation unavailable (internet)', trSearch: 'Search translators…', hLetter: 'Word-by-word memorisation', hLetterS: 'Pick a surah and write it by voice word by word', hPage: 'Page memorisation', hPageS: 'Mushaf page with hidden ayat — fill it by voice', hQuiz: 'Quiz', hQuizS: 'Ayah read aloud, 20s, 4 choices', pgm: '📖 Memorise on the page', pgmS: 'Mushaf page with hidden ayat — fill it by voice', quiz: '❓ Quiz', pg: 'Page', pgGo: 'Go', pgPh: 'Page number (1–604)', pgBad: 'Page not found. Check your internet.', note: 'Voice recognition hears letters, not short vowels (fatha, damma).' },
    ar: { title: 'حفظ القرآن', sub: 'اقرأ بصوتك — تظهر الكلمات مباشرةً أثناء القراءة', search: 'ابحث بالاسم أو الرقم…', all: 'الكل', prog: 'قيد الحفظ', done: 'متقن', ay: 'آية', mast: 'محفوظ', cont: 'تابع', lvl: ['سهل', 'متوسط', 'صارم'], level: 'درجة الصرامة', back: '‹ السور', exit: 'الأقسام', tap: 'اضغط على الميكروفون واقرأ', listen: 'أستمع…', stop: 'إيقاف', hint: 'تلميح', ai: '✨ ذكاء', loading: 'جارٍ التحميل…', loadfail: 'تعذّر تحميل نص القرآن. تحقق من الإنترنت.', nomic: 'هذا المتصفح لا يدعم التعرف على الصوت. استخدم Chrome.', denied: 'تم رفض إذن الميكروفون.', net: 'التعرف على الصوت يحتاج إلى إنترنت.', wrong: 'خطأ، أعد الكلمة', fin: 'ما شاء الله! أتممت السورة', clean: 'آيات بلا خطأ', fails: 'أخطاء', again: 'إعادة', coachT: 'المدرّب الذكي', coachWait: 'جارٍ التفكير…', coachFail: 'الذكاء الاصطناعي غير متاح الآن.', say: 'سمعتُ', jump: 'ابدأ من هنا', mText: 'نص', mTr: 'ترجمة', mPage: 'مصحف', trPick: 'اختر المترجم', trLoad: 'جارٍ تحميل الترجمة…', trNone: 'الترجمة غير متاحة (إنترنت)', trSearch: 'ابحث في المترجمين…', hLetter: 'الحفظ حرفياً', hLetterS: 'اختر سورة واكتبها بصوتك كلمة كلمة', hPage: 'الحفظ على الصفحة', hPageS: 'صفحة المصحف مخفية — املأها بصوتك', hQuiz: 'أسئلة واختيارات', hQuizS: 'آية بالصوت، ٢٠ ثانية، ٤ خيارات', pgm: '📖 الحفظ على الصفحة', pgmS: 'صفحة المصحف مخفية — املأها بصوتك', quiz: '❓ أسئلة واختيارات', pg: 'صفحة', pgGo: 'اذهب', pgPh: 'رقم الصفحة (١–٦٠٤)', pgBad: 'تعذّر إيجاد الصفحة. تحقق من الإنترنت.', note: 'التعرف على الصوت يميّز الحروف لا الحركات القصيرة (الفتحة والضمة).' }
  };
  function lang() { var l = window.appLang || 'ckb'; return l === 'bad' ? 'ckb' : l; }
  function L() { return T[lang()] || T.en; }
  function isRtlUi() { var l = lang(); return l === 'ckb' || l === 'ar' || l === 'fa' || l === 'ur'; }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toAr(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.charAt(+d); }); }
  function num(n) { return lang() === 'ckb' || lang() === 'ar' ? toAr(n) : String(n); }
  function SL() { try { return surahs || []; } catch (e) { return []; } }
  function cnt(n) { var x = SL()[n - 1]; return x ? (+x[2] || 0) : 0; }
  function sname(n) { var x = SL()[n - 1]; return x ? x[0] : ('' + n); }

  /* ---------- saved data ---------- */
  function loadPrefs() {
    var d = { mode: 'text', tr: '', show: 0, level: 1, last: 0, prog: {}, hist: [] };
    try { var j = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); for (var k in j) if (k in d) d[k] = j[k]; } catch (e) {}
    if (!d.prog || typeof d.prog !== 'object') d.prog = {};
    if (!Array.isArray(d.hist)) d.hist = [];
    return d;
  }
  var P = loadPrefs();
  /* Migrate obsolete Kurdish translator IDs to the verified bundled edition. */
  if (P.tr === 'kur-burhanmuhammad' || P.tr === 'ckb-muhammadsalehbamoki') { P.tr = ''; savePrefs(); }
  function savePrefs() { try { localStorage.setItem(LS_KEY, JSON.stringify(P)); } catch (e) {} }
  function masteredIn(n) { var o = P.prog[n] || {}, c = 0, k; for (k in o) if (o[k] > 0) c++; return c; }
  function totalMastered() { var t = 0, n; for (n = 1; n <= 114; n++) t += masteredIn(n); return t; }

  /* ---------- Arabic matching ---------- */
  function norm(s) {
    return String(s || '')
      .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
      .replace(/[آأإٱ]/g, 'ا')
      .replace(/ى/g, 'ي').replace(/ئ/g, 'ي').replace(/ؤ/g, 'و').replace(/ة/g, 'ه')
      .replace(/ک/g, 'ك').replace(/ی/g, 'ي')
      .replace(/[^ء-ي\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  /* alef + hamza are dropped on both sides (speech engines and the Uthmani text spell them differently) */
  function nw(s) { return norm(s).replace(/[ اء]/g, ''); }
  function lev(a, b) {
    var m = a.length, n = b.length, i, j;
    if (!m) return n; if (!n) return m;
    var p = new Array(n + 1);
    for (j = 0; j <= n; j++) p[j] = j;
    for (i = 1; i <= m; i++) {
      var prev = p[0]; p[0] = i;
      for (j = 1; j <= n; j++) { var tmp = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1)); prev = tmp; }
    }
    return p[n];
  }
  function sim(a, b) { var l = Math.max(a.length, b.length); return l ? 1 - lev(a, b) / l : 1; }
  /* word match: short words must be exact (a different short word is a different word) */
  /* sound-alike letters are folded together (speech engines confuse them a lot) */
  function pf(s) {
    return s.replace(/[\u0636\u0638\u0630\u0632]/g, '\u0632').replace(/[\u062B\u0633\u0635]/g, '\u0633').replace(/[\u062A\u0637]/g, '\u062A')
      .replace(/[\u062D\u0647]/g, '\u0647').replace(/[\u0642\u0643\u063A]/g, '\u0643').replace(/\u0639/g, '').replace(/(.)\1/g, '$1');
  }
  function wmatch(t, e) {
    if (!t || !e) return false;
    if (t === e) return true;
    var lv = P.level, th = LEVELS[lv], x = t, y = e;
    if (lv < 2) { x = pf(t); y = pf(e); if (x === y) return true; if (!x || !y) return false; }
    var d = Math.abs(x.length - y.length);
    if (lv === 2) { if (e.length <= 3) return false; return sim(x, y) >= th && d <= 1; }
    if (y.length <= 2) return false;
    if (y.length === 3) return lev(x, y) <= 1 && d <= 1;
    return sim(x, y) >= th && d <= 2;
  }

  /* ---------- Quran text ---------- */
  var corpusP = null;
  function loadCorpus() {
    if (corpusP) return corpusP;
    corpusP = fetch('ai/quran.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      ((j && j.v) || []).forEach(function (r) { var s = +r[0], a = +r[1]; if (s && a) (TEXT[s] = TEXT[s] || [])[a - 1] = String(r[2] || ''); });
    }).catch(function () {});
    return corpusP;
  }
  function suraReady(n) { var t = TEXT[n], c = cnt(n); if (!t || !c) return false; for (var i = 0; i < c; i++) if (!t[i]) return false; return true; }
  function ensureSura(n) {
    return loadCorpus().then(function () {
      if (suraReady(n)) return true;
      return fetch('https://api.alquran.cloud/v1/surah/' + n + '/quran-uthmani').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var a = j && j.data && j.data.ayahs; if (!a || !a.length) throw 0;
        TEXT[n] = a.map(function (x) { return String(x.text || ''); });
        return suraReady(n);
      }).catch(function () { return false; });
    });
  }
  var BISM_N = nw('بسم الله الرحمن الرحيم');
  var BISM_T = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
  function stripBism(t) {
    var w = String(t).split(/\s+/);
    if (w.length > 4 && nw(w.slice(0, 4).join(' ')) === BISM_N) return w.slice(4).join(' ');
    return t;
  }

  window.__hifzData = { TEXT: TEXT, ensureSura: ensureSura, sname: sname, cnt: cnt, L: L, lang: lang, nw: nw, esc: esc, num: num, leave: leave, rtl: isRtlUi, wmatch: wmatch, sim: sim, pf: pf, P: P, save: savePrefs, loadEds: loadEds, loadTr: loadTr, edInfo: edInfo, curEd: curEd, stripBism: stripBism, corpus: loadCorpus };

  /* ---------- session state ---------- */
  var S = { view: 'home', filter: 'all', q: '' };
  function newRun(n, from, to) {
    S = {
      view: 'run', sura: n, loading: true, err: '', words: [], starts: {}, count: cnt(n), from: from || 1, to: to || cnt(n), page: 0, pos: 0, base: 0, cur: 0,
      fails: {}, softs: {}, hint: {}, ayBad: {}, ayDone: {}, listening: false, finished: false, said: '', msg: '', t0: 0,
      filter: S.filter, q: S.q
    };
  }
  function buildWords() {
    var n = S.sura, a, i, parts, w;
    S.words = []; S.starts = {};
    for (a = S.from; a <= S.to; a++) {
      var t = TEXT[n][a - 1];
      if (a === 1 && n !== 1 && n !== 9) t = stripBism(t);
      parts = String(t).split(/\s+/).filter(Boolean);
      S.starts[a] = S.words.length;
      var first = S.words.length;
      for (i = 0; i < parts.length; i++) {
        w = nw(parts[i]);
        if (!w && S.words.length > first) { S.words[S.words.length - 1].disp += ' ' + parts[i]; continue; }
        S.words.push({ a: a, disp: parts[i], nw: w, given: n === 1 && a === 1 });
      }
    }
    /* Al-Fatiha: ayah 1 is the Bismillah itself — shown as a given, not tested */
    var p = 0;
    while (p < S.words.length && S.words[p].given) p++;
    S.pos = S.base = S.cur = p;
  }

  /* ---------- alignment of what was heard with the expected words ---------- */
  function align(tokens, base, fin) {
    var p = base, N = S.words.length, i = 0, wrong = -1, soft = [], lenient = P.level < 2;
    function W(k) { return k < N ? S.words[k].nw : ''; }
    while (i < tokens.length && p < N) {
      var t = tokens[i], e = W(p);
      if (!e) { p++; continue; }
      if (wmatch(t, e)) { p++; i++; continue; }
      /* the engine split one word into two tokens */
      if (i + 1 < tokens.length && wmatch(t + tokens[i + 1], e)) { p++; i += 2; continue; }
      /* the engine glued two words together */
      if (p + 1 < N && W(p + 1) && wmatch(t, e + W(p + 1))) { p += 2; i++; continue; }
      /* the engine wrote a partial last word (interim) */
      if (!fin && i === tokens.length - 1) break;
      if (lenient) {
        /* a spurious extra token: the next token is the word we expect */
        if (i + 1 < tokens.length && wmatch(tokens[i + 1], e)) { i++; continue; }
        /* the engine misheard this one word but the reciter went on correctly: keep the flow */
        if (i + 1 < tokens.length && p + 1 < N && wmatch(tokens[i + 1], W(p + 1))) { soft.push(p); p++; i++; continue; }
        /* last heard token is a near miss (>= 0.4) at the end of the phrase: accept softly */
        if (i === tokens.length - 1 && p < N && sim(pf(t), pf(e)) >= 0.4 && fin) { soft.push(p); p++; i++; continue; }
      }
      wrong = p; break;
    }
    return { p: p, wrong: wrong, soft: soft };
  }

  /* ---------- listening ---------- */
  function engine() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }
  setInterval(function () { if (S.listening) paintDock(); }, 1000);
  function startListen() {
    if (!engine()) { S.err = L().nomic; paintAll(); return; }
    if (S.finished) return;
    S.err = ''; S.listening = true; if (!S.t0) S.t0 = Date.now();
    paintDock(); openRec();
  }
  function stopListen() {
    S.listening = false; clearTimeout(restartT);
    try { if (rec) { var r = rec; rec = null; if (r.abort) r.abort(); else r.stop(); } } catch (e) {}
    paintDock();
  }
  function openRec() {
    var R = engine(), r; if (!R) return;
    S.base = S.pos; S.cur = S.pos;
    try { r = new R(); } catch (e) { S.listening = false; S.err = L().nomic; paintAll(); return; }
    rec = r;
    r.lang = 'ar-SA'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
    r.onresult = function (e) {
      if (rec !== r) return;
      var alts = [], j, i, K = 3, fin = false;
      for (j = 0; j < K; j++) {
        var tx = '';
        for (i = 0; i < e.results.length; i++) { var it = e.results[i]; if (j === 0 && i === e.results.length - 1) fin = !!it.isFinal; tx += ' ' + ((it[j] || it[0]).transcript || ''); }
        alts.push(tx);
      }
      onSpeech(alts, fin);
    };
    r.onerror = function (e) {
      if (rec !== r) return;
      var c = e && e.error;
      if (c === 'not-allowed' || c === 'service-not-allowed') { stopListen(); S.err = L().denied; paintAll(); }
      else if (c === 'audio-capture') { stopListen(); S.err = L().nomic; paintAll(); }
      else if (c === 'network') { stopListen(); S.err = L().net; paintAll(); }
    };
    r.onend = function () {
      if (rec !== r) return;
      if (S.listening && !S.finished) { clearTimeout(restartT); restartT = setTimeout(function () { if (S.listening && !S.finished) openRec(); }, 120); }
    };
    try { r.start(); } catch (e2) { S.listening = false; S.err = L().nomic; paintAll(); }
  }
  function onSpeech(alts, fin) {
    if (!S.listening || S.finished) return;
    var best = null, bestAlt = '', k, tok;
    for (k = 0; k < alts.length; k++) {
      tok = nw2(alts[k]);
      var r = align(tok, S.base, fin);
      if (!best || r.p > best.p || (r.p === best.p && r.wrong < 0 && best.wrong >= 0)) { best = r; bestAlt = alts[k]; }
    }
    S.said = String(bestAlt).trim().split(/\s+/).slice(-6).join(' ');
    best.soft.forEach(function (k) { S.softs[k] = true; });
    if (best.p > S.cur) { S.cur = best.p; advanceTo(S.cur); }
    if (fin) {
      if (best.wrong >= 0 && best.wrong === S.pos) registerWrong(best.wrong);
      /* the session is over for this phrase: the next one starts from the committed position */
      S.base = S.pos;
    }
    paintDock();
  }
  function nw2(s) { return norm(s).split(' ').map(function (w) { return w.replace(/[اء]/g, ''); }).filter(Boolean); }

  function advanceTo(p) {
    var from = S.pos, i, a;
    for (i = from; i < p && i < S.words.length; i++) {
      a = S.words[i].a;
      paintWord(i, 'ok'); if (S.softs[i]) { var se = $('hfW' + i); if (se) se.classList.add('soft'); }
      var nx = S.words[i + 1];
      if (!nx || nx.a !== a) completeAyah(a);
    }
    S.pos = p;
    S.msg = '';
    if (p >= S.words.length) return finish();
    paintCursor();
  }
  function completeAyah(a) {
    if (S.ayDone[a]) return;
    S.ayDone[a] = true;
    var clean = !S.ayBad[a];
    if (a === 1 && S.sura === 1) return;
    if (clean) { var o = P.prog[S.sura] = P.prog[S.sura] || {}; o[a] = Math.min(5, (o[a] || 0) + 1); savePrefs(); }
    var row = $('hfAy' + a); if (row) { row.classList.add('done'); if (!clean) row.classList.add('rough'); }
    updateBar();
  }
  function registerWrong(i) {
    var w = S.words[i], c = S.fails[i] = (S.fails[i] || 0) + 1;
    S.ayBad[w.a] = true;
    S.msg = L().wrong;
    if (c >= 2) S.hint[i] = Math.min(c - 1, 3);
    if (c >= 4) S.hint[i] = 99;
    var we = $('hfW' + i); if (we && P.show) we.classList.add('err');
    paintWord(i, 'bad');
    clearTimeout(flashT[i]); flashT[i] = setTimeout(function () { paintWord(i, null); }, 700);
    try { if (navigator.vibrate) navigator.vibrate(70); } catch (e) {}
  }
  function finish() {
    S.finished = true; stopListen();
    var clean = 0, a, bad = 0;
    for (a = Math.max(S.from, S.sura === 1 ? 2 : 1); a <= S.to; a++) { if (S.ayBad[a]) bad++; else clean++; }
    for (var k in S.fails) bad += 0;
    S.stat = { clean: clean, total: S.to - Math.max(S.from, S.sura === 1 ? 2 : 1) + 1, fails: Object.keys(S.fails).reduce(function (s, k) { return s + S.fails[k]; }, 0), secs: Math.round((Date.now() - (S.t0 || Date.now())) / 1000) };
    P.hist.unshift({ t: Date.now(), s: S.sura, c: clean, n: S.stat.total, f: S.stat.fails });
    P.hist = P.hist.slice(0, 30); P.last = S.sura; savePrefs();
    paintAll();
  }

  /* ---------- AI coach ---------- */
  function endpoint() {
    var e = '';
    try { e = localStorage.getItem('ai_endpoint') || ''; } catch (x) {}
    e = (e || window.AI_SHARI_ENDPOINT || 'https://qurani-ai-shari.abdurahmanemran03.workers.dev').trim().replace(/\/+$/, '');
    return /^https:\/\//.test(e) ? e : '';
  }
  var coachCache = {};
  function coach(a) {
    var sheet = $('hfCoach'); if (!sheet) return;
    var key = S.sura + ':' + a + ':' + lang(), words = S.words.filter(function (w, i) { return w.a === a; }).map(function (w) { return w.disp; }).join(' ');
    var miss = [];
    S.words.forEach(function (w, i) { if (w.a === a && S.fails[i]) miss.push(w.disp); });
    sheet.hidden = false;
    var body = sheet.querySelector('.hf-cbody');
    var cur = '<div class="hf-cayah" dir="rtl">' + esc(words) + ' <span>﴿' + toAr(a) + '﴾</span></div>';
    if (coachCache[key]) { body.innerHTML = cur + '<p>' + esc(coachCache[key]) + '</p>'; return; }
    body.innerHTML = cur + '<p class="hf-dim">' + esc(L().coachWait) + '</p>';
    var ep = endpoint(); if (!ep) { body.innerHTML = cur + '<p class="hf-dim">' + esc(L().coachFail) + '</p>'; return; }
    fetch(ep + '/hifz-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ayah: words, sura: sname(S.sura), n: a, lang: lang(), miss: miss }) })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !d.text) throw 0; return d.text; }); })
      .then(function (t) { coachCache[key] = t; if (!sheet.hidden) body.innerHTML = cur + '<p>' + esc(t) + '</p>'; })
      .catch(function () { if (!sheet.hidden) body.innerHTML = cur + '<p class="hf-dim">' + esc(L().coachFail) + '</p>'; });
  }

  /* ---------- translations (fawazahmed0/quran-api via jsDelivr: every translator, any language) ---------- */
  var TRB = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/';
  var EDS = null, TRC = {};
  var EDS0 = [['kur-muhammadsalehba', 'Muhammad Saleh Bamoki', 'Kurdish', 'rtl'], ['eng-abdullahyusufali', 'Abdullah Yusuf Ali', 'English', 'ltr'], ['ara-jalalayn', 'Tafsir Al-Jalalayn', 'Arabic', 'rtl']];
  function defEd() { var l = lang(); return l === 'ar' ? 'ara-jalalayn' : l === 'en' ? 'eng-abdullahyusufali' : 'kur-muhammadsalehba'; }
  function curEd() { return P.tr || defEd(); }
  function loadEds() {
    if (EDS) return Promise.resolve(EDS);
    try { var c = JSON.parse(localStorage.getItem('hifz_eds_v2') || 'null'); if (c && c.length > 10) EDS = c; } catch (e) {}
    if (EDS) return Promise.resolve(EDS);
    return fetch(TRB + 'editions.json').catch(function () { return fetch('https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions.json'); }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      EDS = Object.keys(j).map(function (k) { var e = j[k]; return [e.name || k.replace(/_/g, '-'), e.author || e.name || k, e.language || '', e.direction || 'ltr']; });
      try { localStorage.setItem('hifz_eds_v2', JSON.stringify(EDS)); } catch (e) {}
      return EDS;
    }).catch(function () { EDS = EDS0; return EDS; });
  }
  function edInfo(id) { var l = EDS || EDS0, i; for (i = 0; i < l.length; i++) if (l[i][0] === id) return l[i]; return [id, id, '', /^(ara|kur|ckb|fas|urd|pes)/.test(id) ? 'rtl' : 'ltr']; }
  function loadTr(ed, n) {
    var key = ed + ':' + n; if (TRC[key]) return Promise.resolve(TRC[key]);
    try { var c = JSON.parse(localStorage.getItem('hifz_tr_' + key) || 'null'); if (c) { TRC[key] = c; return Promise.resolve(c); } } catch (e) {}
    var u = 'editions/' + ed + '/' + n + '.json', bases = [TRB, 'https://fastly.jsdelivr.net/gh/fawazahmed0/quran-api@1/', 'https://raw.githubusercontent.com/fawazahmed0/quran-api/1/', 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/'];
    var tryB = function (i) { return fetch(bases[i] + u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function (e) { if (i + 1 < bases.length) return tryB(i + 1); throw e; }); };
    /* Kurdish Bamoki translation is already shipped with the web build; prefer it so it works even when a CDN is blocked. */
    var bundled = ed === 'kur-muhammadsalehba' ? fetch('ai/quran-ku.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      var all = j && j.v; if (!Array.isArray(all) || all.length < 6236) throw 0;
      var offset = 0, s; for (s = 1; s < n; s++) offset += cnt(s);
      var local = all.slice(offset, offset + cnt(n)).map(function (x) { return String(x || ''); });
      if (local.length !== cnt(n) || local.some(function (x) { return !x; })) throw 0;
      return local;
    }).catch(function () { return tryB(0).then(function (j) { return (j.chapter || []).map(function (x) { return String(x.text || ''); }); }); }) : tryB(0).then(function (j) { return (j.chapter || []).map(function (x) { return String(x.text || ''); }); });
    return bundled.then(function (a) {
      if (!a.length) throw 0; TRC[key] = a;
      try { localStorage.setItem('hifz_tr_' + key, JSON.stringify(a)); } catch (e) {}
      return a;
    });
  }
  function paintTr() {
    var v = $('hifzView'); if (!v || S.view !== 'run' || S.loading) return;
    var ed = curEd(), info = edInfo(ed), a, el;
    if (P.mode !== 'tr') { Array.prototype.forEach.call(v.querySelectorAll('.hf-tr'), function (e) { e.textContent = ''; e.style.display = 'none'; }); return; }
    var n = S.sura;
    for (a = S.from; a <= S.to; a++) { el = $('hfT' + a); if (el) { el.style.display = 'block'; el.textContent = L().trLoad; } }
    loadEds().then(function () { info = edInfo(ed); return loadTr(ed, n); }).then(function (arr) {
      if (S.sura !== n) return;
      var rtl = info[3] === 'rtl';
      for (a = S.from; a <= S.to; a++) { el = $('hfT' + a); if (el) { el.dir = rtl ? 'rtl' : 'ltr'; el.style.textAlign = rtl ? 'right' : 'left'; el.textContent = arr[a - 1] || ''; } }
    }).catch(function () { for (a = S.from; a <= S.to; a++) { el = $('hfT' + a); if (el) el.textContent = L().trNone; } });
  }
  function trSheet() {
    var sh = $('hfTrSheet'); if (!sh) return;
    sh.hidden = false;
    var box = sh.querySelector('.hf-cbody'), t = L();
    box.innerHTML = '<input id="hfTrQ" class="hf-in" style="width:100%;margin-bottom:8px" type="search" placeholder="' + esc(t.trSearch) + '"><div id="hfTrL"></div>';
    function list(q) {
      loadEds().then(function (l) {
        var cur = curEd(), groups = {}, ql = (q || '').toLowerCase(), pref = { Kurdish: 0, Arabic: 1, English: 2 };
        l.forEach(function (e) { if (ql && (e[1] + ' ' + e[2] + ' ' + e[0]).toLowerCase().indexOf(ql) < 0) return; (groups[e[2] || '—'] = groups[e[2] || '—'] || []).push(e); });
        var names = Object.keys(groups).sort(function (a, b) { return (pref[a] != null ? pref[a] : 9) - (pref[b] != null ? pref[b] : 9) || a.localeCompare(b); });
        $('hfTrL').innerHTML = names.map(function (g) { return '<div class="hf-dim" style="margin:10px 0 4px">' + esc(g) + '</div>' + groups[g].map(function (e) { return '<button type="button" class="hf-chip' + (e[0] === cur ? ' on' : '') + '" style="display:block;width:100%;text-align:start;margin:4px 0;border-radius:12px" data-act="trSet" data-e="' + esc(e[0]) + '">' + esc(e[1]) + '</button>'; }).join(''); }).join('');
      });
    }
    list(''); $('hfTrQ').addEventListener('input', function () { list(this.value); });
  }

  /* ---------- UI: css ---------- */
  function css() {
    if ($('hifzCss')) return;
    var s = document.createElement('style'); s.id = 'hifzCss';
    s.textContent = [
      '#hifzView{--bg1:#000;--bg2:#000;--gold:#e6c46f;--gold2:#b8924a;--ink:#f5efdd;--dim:rgba(245,239,221,.62);--glass:rgba(255,255,255,.055);--line:rgba(230,196,111,.26);color:var(--ink);min-height:100vh;padding:0 0 130px;background:#000;font-family:inherit}',
      'body:has(#hifzView.active) .bottom{display:none!important}',
      '#hifzView *{box-sizing:border-box}',
      '.hf-top{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 14px 4px}',
      '.hf-btn{border:1px solid var(--line);background:var(--glass);color:var(--ink);border-radius:12px;padding:8px 13px;font:inherit;font-size:13px}',
      '.hf-hero{margin:8px 14px 12px;padding:18px;border:1px solid var(--line);border-radius:22px;background:linear-gradient(135deg,rgba(230,196,111,.16),rgba(255,255,255,.03));display:flex;gap:16px;align-items:center}',
      '.hf-ring{width:84px;height:84px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(var(--gold) calc(var(--p)*1%),rgba(255,255,255,.1) 0)}',
      '.hf-ring b{width:66px;height:66px;border-radius:50%;background:var(--bg1);display:grid;place-items:center;font-size:17px;color:var(--gold)}',
      '.hf-hero h1{margin:0 0 4px;font-size:21px;color:var(--gold);line-height:1.4}.hf-hero p{margin:0;color:var(--dim);font-size:13px;line-height:1.7}',
      '.hf-tools{display:flex;gap:8px;padding:0 14px 8px;flex-wrap:wrap}',
      '.hf-in{flex:1;min-width:140px;background:var(--glass);border:1px solid var(--line);border-radius:14px;color:var(--ink);padding:10px 13px;font:inherit;font-size:14px;outline:0}',
      '.hf-chip{border:1px solid var(--line);background:transparent;color:var(--dim);border-radius:16px;padding:7px 13px;font:inherit;font-size:13px}.hf-chip.on{background:var(--gold);color:#2b2208;border-color:var(--gold);font-weight:700}',
      '.hf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:4px 14px}',
      '.hf-card{position:relative;text-align:center;border:1px solid var(--line);background:var(--glass);border-radius:18px;padding:16px 8px 12px;color:var(--ink);font:inherit;overflow:hidden;backdrop-filter:blur(3px)}',
      '.hf-card:active{transform:scale(.97)}',
      '.hf-star{width:46px;height:46px;position:relative;margin:0 auto 8px;display:grid;place-items:center;color:var(--gold);font-weight:700;font-size:15px}',
      '.hf-star:before,.hf-star:after{content:"";position:absolute;inset:6px;border:1.5px solid var(--gold);border-radius:4px}.hf-star:after{transform:rotate(45deg)}',
      '.hf-card h3{margin:0;font-size:20px;font-family:"Amiri","Scheherazade New","Noto Naskh Arabic",serif;color:var(--ink);font-weight:700}',
      '.hf-card small{display:block;color:var(--dim);font-size:12px;margin-top:2px}',
      '.hf-bar{height:5px;border-radius:5px;background:rgba(255,255,255,.1);margin-top:10px;overflow:hidden}.hf-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold2),var(--gold));border-radius:5px}',
      '.hf-card.full{border-color:var(--gold);background:linear-gradient(160deg,rgba(230,196,111,.22),rgba(255,255,255,.04))}',
      '.hf-cont{margin:0 14px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--gold);border-radius:16px;padding:12px 16px;background:rgba(230,196,111,.12);color:var(--ink);font:inherit;width:calc(100% - 28px)}',
      /* run */
      '.hf-ttl{text-align:center;padding:4px 14px 2px}.hf-ttl h2{margin:0;font-size:30px;color:var(--gold);font-family:"Amiri","Scheherazade New","Noto Naskh Arabic",serif;font-weight:700}.hf-ttl small{color:var(--dim)}',
      '.hf-prog{margin:8px 20px 6px;height:6px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden}.hf-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold2),var(--gold));transition:width .25s}',
      '.hf-bism{text-align:center;font-size:27px;color:var(--gold);margin:14px 14px 6px;font-family:"Amiri","Scheherazade New","Noto Naskh Arabic",serif;direction:rtl;line-height:2;text-shadow:0 0 18px rgba(230,196,111,.35)}',
      '.hf-page{margin:8px 12px;padding:6px 12px;border:1px solid var(--line);border-radius:22px;background:#050505}',
      '.hf-ay{display:flex;gap:10px;align-items:flex-start;padding:12px 4px;border-bottom:1px dashed rgba(230,196,111,.15);direction:rtl;cursor:pointer}',
      '.hf-ay:last-child{border-bottom:0}',
      '.hf-num{flex:none;width:34px;height:34px;display:grid;place-items:center;font-size:14px;color:var(--gold);position:relative;margin-top:4px}',
      '.hf-num:before,.hf-num:after{content:"";position:absolute;inset:5px;border:1.4px solid var(--gold);border-radius:3px}.hf-num:after{transform:rotate(45deg)}',
      '.hf-ay.done .hf-num{background:var(--gold);color:#2b2208;border-radius:50%}.hf-ay.done .hf-num:before,.hf-ay.done .hf-num:after{display:none}.hf-ay.rough .hf-num{background:#d99a4e}',
      '.hf-ws{flex:1;display:flex;flex-wrap:wrap;gap:4px 9px;font-size:27px;line-height:2.1;font-family:"Amiri","Scheherazade New","Noto Naskh Arabic",serif;direction:rtl}',
      '.hf-w{border-radius:9px;padding:0 5px;color:transparent;background:rgba(255,255,255,.075);transition:background .18s,color .18s,transform .18s;user-select:none;-webkit-user-select:none}',
      '.hf-w.ok{color:var(--ink);background:transparent;animation:hfPop .28s ease-out}.hf-w.ok.given{color:var(--gold)}',
      '.hf-w.soft{box-shadow:0 -2px 0 #d99a4e inset}.hf-modes{display:flex;gap:6px;justify-content:center;margin:6px 14px;flex-wrap:wrap}.hf-tr{margin:2px 4px 6px;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.06);color:var(--ink);font-size:15px;line-height:1.9;display:none}.hf-wc{flex:1;min-width:0}.hf-wc .hf-ws{flex:none}.hf-w.vis{color:var(--ink);background:transparent}.hf-w.err{color:#ff6b6b!important;text-decoration:underline dotted #ff6b6b 2px;text-underline-offset:8px}.hf-stat{display:flex;gap:8px;font-size:13px;color:var(--ink)}.hf-stat span{background:rgba(255,255,255,.09);border-radius:14px;padding:4px 11px;border:1px solid var(--line)}.hf-stat .bad{color:#ff8a8a}.hf-w.cur{background:rgba(230,196,111,.22);box-shadow:0 0 0 1.5px var(--gold) inset}',
      '.hf-w.bad{background:rgba(224,82,82,.35);animation:hfShake .35s}',
      '.hf-w .h{color:var(--gold)}',
      '.hf-w.rev{color:rgba(245,239,221,.45)}',
      '@keyframes hfPop{0%{transform:scale(.8);color:var(--gold)}60%{transform:scale(1.08)}100%{transform:scale(1)}}',
      '@keyframes hfShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}',
      '.hf-dock{position:fixed;left:0;right:0;bottom:0;z-index:50;padding:10px 14px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(180deg,transparent,rgba(0,0,0,.97) 28%);display:flex;flex-direction:column;align-items:center;gap:8px}',
      '.hf-said{min-height:22px;max-width:100%;font-size:14px;color:var(--dim);text-align:center;direction:rtl;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.hf-said.err{color:#ff9b9b}',
      '.hf-row{display:flex;align-items:center;gap:18px}',
      '.hf-mic{width:78px;height:78px;border-radius:50%;border:0;background:linear-gradient(145deg,var(--gold),var(--gold2));color:#2b2208;font-size:32px;display:grid;place-items:center;box-shadow:0 10px 28px rgba(230,196,111,.35);position:relative}',
      '.hf-mic.on{background:linear-gradient(145deg,#ff7a6b,#d9433a);color:#fff;box-shadow:0 0 0 0 rgba(255,100,90,.6);animation:hfPulse 1.4s infinite}',
      '@keyframes hfPulse{0%{box-shadow:0 0 0 0 rgba(255,100,90,.55)}100%{box-shadow:0 0 0 26px rgba(255,100,90,0)}}',
      '.hf-sm{width:50px;height:50px;border-radius:50%;border:1px solid var(--line);background:var(--glass);color:var(--ink);font:inherit;font-size:13px;display:grid;place-items:center}',
      '.hf-lv{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}',
      '.hf-sheet{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.55);display:flex;align-items:flex-end}.hf-sheet[hidden]{display:none}',
      '.hf-sbox{width:100%;max-height:80vh;overflow:auto;background:#0b0b0b;border-top:1px solid var(--gold);border-radius:24px 24px 0 0;padding:18px 18px 28px;color:var(--ink)}',
      '.hf-sbox h3{margin:0 0 10px;color:var(--gold)}.hf-cayah{font-size:24px;line-height:2;font-family:"Amiri","Scheherazade New","Noto Naskh Arabic",serif;color:var(--gold);margin-bottom:8px}.hf-cbody p{line-height:1.9;margin:6px 0;font-size:15px}.hf-dim{color:var(--dim)}',
      '.hf-fin{margin:16px 14px;padding:22px;border:1px solid var(--gold);border-radius:22px;text-align:center;background:linear-gradient(160deg,rgba(230,196,111,.2),rgba(255,255,255,.03))}',
      '.hf-fin h2{margin:0 0 12px;color:var(--gold)}.hf-stats{display:flex;gap:10px;justify-content:center;margin:12px 0}.hf-stats div{flex:1;border:1px solid var(--line);border-radius:14px;padding:10px 4px}.hf-stats b{display:block;font-size:22px;color:var(--gold)}.hf-stats span{font-size:12px;color:var(--dim)}',
      '.hf-hubs{display:grid;gap:12px;padding:6px 14px}.hf-hub{display:flex;align-items:center;gap:14px;text-align:start;border:1px solid var(--line);border-radius:20px;padding:18px 16px;background:linear-gradient(135deg,rgba(230,196,111,.14),rgba(255,255,255,.04));color:var(--ink);font:inherit}.hf-hub:active{transform:scale(.98)}.hf-hi{flex:none;width:54px;height:54px;border-radius:16px;display:grid;place-items:center;font-size:26px;color:#2b2208;background:linear-gradient(145deg,var(--gold),var(--gold2));font-family:Amiri,serif;font-weight:700}.hf-hub b{display:block;font-size:18px;color:var(--gold)}.hf-hub small{display:block;color:var(--dim);font-size:12.5px;margin-top:3px;line-height:1.6}.hf-hub i{margin-inline-start:auto;font-style:normal;color:var(--gold);font-size:22px}',
      '.hf-note{text-align:center;color:var(--dim);font-size:11.5px;padding:10px 24px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------- UI: views ---------- */
  function ensureView() {
    var main = document.querySelector('.main'); if (!main) return null;
    var v = $('hifzView'); if (v) return v;
    v = document.createElement('div'); v.id = 'hifzView'; v.className = 'view';
    v.setAttribute('data-no-translate', '1'); v.setAttribute('data-keep-ar', '1');
    main.appendChild(v);
    v.addEventListener('click', onClick);
    v.addEventListener('input', function (e) { if (e.target.id === 'hfQ') { S.q = e.target.value; paintGrid(); } });
    return v;
  }
  function render() {
    var v = ensureView(); if (!v) return;
    v.dir = isRtlUi() ? 'rtl' : 'ltr';
    v.innerHTML = S.view === 'run' ? runHtml() : S.view === 'hub' ? hubHtml() : homeHtml();
    if (S.view === 'home') paintGrid();
    else if (S.view === 'run' && !S.loading) { paintTr(); paintWords(); updateBar(); paintDock(); paintCursor(); }
  }
  function paintAll() { render(); }

  function hubHtml() {
    var t = L(), tot = totalMastered(), pct = Math.round(tot / 6236 * 100);
    function card(act, ic, ti, su) { return '<button type="button" class="hf-hub" data-act="' + act + '"><span class="hf-hi">' + ic + '</span><span><b>' + esc(ti) + '</b><small>' + esc(su) + '</small></span><i>‹</i></button>'; }
    return '<div class="hf-top"><button type="button" class="hf-btn" data-act="exit">‹ ' + esc(t.exit) + '</button></div>' +
      '<div class="hf-hero"><div class="hf-ring" style="--p:' + pct + '"><b>' + num(pct) + '%</b></div><div><h1>' + esc(t.title) + '</h1><p>' + esc(t.sub) + '</p><p style="margin-top:6px;color:var(--gold)">' + num(tot) + ' / ' + num(6236) + ' ' + esc(t.ay) + ' · ' + esc(t.mast) + '</p></div></div>' +
      '<div class="hf-hubs">' + card('pagemode', '📖', t.hPage, t.hPageS) + card('quiz', '❓', t.hQuiz, t.hQuizS) + '</div>';
  }
  function homeHtml() {
    var t = L(), tot = totalMastered(), pct = Math.round(tot / 6236 * 100);
    var cont = P.last ? '<button type="button" class="hf-cont" data-act="open" data-n="' + P.last + '"><span>' + esc(t.cont) + '</span><b style="font-family:Amiri,serif;font-size:20px;color:var(--gold)">' + esc(sname(P.last)) + '</b></button>' : '';
    return '<div class="hf-top"><button type="button" class="hf-btn" data-act="hub">‹ ' + esc(t.title) + '</button></div>' +
      '<div class="hf-hero"><div class="hf-ring" style="--p:' + pct + '"><b>' + num(pct) + '٪'.replace('٪', '%') + '</b></div><div><h1>' + esc(t.title) + '</h1><p>' + esc(t.sub) + '</p><p style="margin-top:6px;color:var(--gold)">' + num(tot) + ' / ' + num(6236) + ' ' + esc(t.ay) + ' · ' + esc(t.mast) + '</p></div></div>' + cont +
      '<div class="hf-tools"><input id="hfQ" class="hf-in" type="search" placeholder="' + esc(t.search) + '" value="' + esc(S.q || '') + '">' +
      ['all', 'prog', 'done'].map(function (f) { return '<button type="button" class="hf-chip' + (S.filter === f ? ' on' : '') + '" data-act="filter" data-f="' + f + '">' + esc(t[f]) + '</button>'; }).join('') + '</div>' +
      '<div class="hf-grid" id="hfGrid"></div><div class="hf-note">' + esc(t.note) + '</div>';
  }
  function paintGrid() {
    var g = $('hfGrid'); if (!g) return;
    var q = nw(S.q || ''), qn = parseInt(S.q, 10), o = '', n, c, m, full;
    for (n = 1; n <= 114; n++) {
      c = cnt(n); m = masteredIn(n); full = c && m >= c;
      if (S.filter === 'prog' && !(m > 0 && !full)) continue;
      if (S.filter === 'done' && !full) continue;
      if (S.q) { if (qn) { if (n !== qn) continue; } else if (nw(sname(n)).indexOf(q) < 0) continue; }
      o += '<button type="button" class="hf-card' + (full ? ' full' : '') + '" data-act="open" data-n="' + n + '"><div class="hf-star">' + num(n) + '</div><h3>' + esc(sname(n)) + '</h3><small>' + num(c) + ' ' + esc(L().ay) + '</small><div class="hf-bar"><i style="width:' + (c ? Math.round(m / c * 100) : 0) + '%"></i></div></button>';
    }
    g.innerHTML = o;
  }

  function runHtml() {
    var t = L(), n = S.sura;
    var head = '<div class="hf-top"><button type="button" class="hf-btn" data-act="home">' + esc(t.back) + '</button><div class="hf-lv" id="hfLv"></div></div>' +
      '<div class="hf-ttl"><h2>' + esc(sname(n)) + '</h2><small>' + (S.page ? esc(t.pg) + ' ' + num(S.page) + ' · ' : '') + num(S.to - S.from + 1) + ' ' + esc(t.ay) + '</small></div><div class="hf-prog"><i id="hfProg"></i></div><div class="hf-modes"><button type="button" class="hf-chip' + (P.mode !== 'tr' ? ' on' : '') + '" data-act="mode" data-m="text">' + esc(t.mText) + '</button><button type="button" class="hf-chip' + (P.mode === 'tr' ? ' on' : '') + '" data-act="mode" data-m="tr">' + esc(t.mTr) + '</button><button type="button" class="hf-chip" data-act="pagemode">' + esc(t.mPage) + '</button>' + (P.mode === 'tr' ? '<button type="button" class="hf-chip" data-act="trPick">⚙ ' + esc(edInfo(curEd())[1]) + '</button>' : '') + '</div>';
    if (S.loading) return head + '<div class="hf-note" style="padding:60px 24px">' + esc(t.loading) + '</div>';
    if (S.err && !S.words.length) return head + '<div class="hf-note" style="padding:60px 24px;color:#ff9b9b">' + esc(S.err) + '</div>';
    var rows = '', a, i;
    for (a = S.from; a <= S.to; a++) {
      var ws = '';
      for (i = S.starts[a]; i < (a < S.to ? S.starts[a + 1] : S.words.length); i++) {
        var w = S.words[i];
        ws += '<span class="hf-w' + (w.given ? ' ok given' : '') + (P.show ? ' vis' : '') + '" id="hfW' + i + '">' + esc(w.disp) + '</span>';
      }
      rows += '<div class="hf-ay' + (n === 1 && a === 1 ? ' done' : '') + '" id="hfAy' + a + '" data-act="jump" data-a="' + a + '"><span class="hf-num">' + num(a) + '</span><div class="hf-wc"><div class="hf-ws">' + ws + '</div><div class="hf-tr" id="hfT' + a + '"></div></div></div>';
    }
    var bism = (S.from === 1 && n !== 1 && n !== 9) ? '<div class="hf-bism">' + BISM_T + '</div>' : '';
    var fin = S.finished ? finHtml() : '';
    return head + bism + '<div class="hf-page">' + rows + '</div>' + fin +
      '<div class="hf-dock"><div class="hf-stat" id="hfStat"></div><div class="hf-said" id="hfSaid"></div><div class="hf-row">' +
      '<button type="button" class="hf-sm" id="hfEye" data-act="eye">' + (P.show ? '🙈' : '👁') + '</button><button type="button" class="hf-sm" data-act="hint">💡<br><span style="font-size:10px">' + esc(t.hint) + '</span></button>' +
      '<button type="button" class="hf-mic" id="hfMic" data-act="mic">🎙</button>' +
      '<button type="button" class="hf-sm" data-act="ai">' + esc(t.ai) + '</button></div></div>' +
      '<div class="hf-sheet" id="hfTrSheet" hidden data-act="closeTr"><div class="hf-sbox" data-stop="1"><h3>' + esc(t.trPick) + '</h3><div class="hf-cbody"></div></div></div>' +
      '<div class="hf-sheet" id="hfCoach" hidden data-act="closeCoach"><div class="hf-sbox" data-stop="1"><h3>' + esc(t.coachT) + '</h3><div class="hf-cbody"></div></div></div>';
  }
  function finHtml() {
    var st = S.stat || {}, t = L();
    return '<div class="hf-fin"><h2>🌙 ' + esc(t.fin) + '</h2><div class="hf-stats"><div><b>' + num(st.clean) + '/' + num(st.total) + '</b><span>' + esc(t.clean) + '</span></div><div><b>' + num(st.fails) + '</b><span>' + esc(t.fails) + '</span></div></div>' +
      '<button type="button" class="hf-btn" data-act="again">↻ ' + esc(t.again) + '</button></div>';
  }

  /* ---------- UI: incremental painting (fast path) ---------- */
  function paintWords() {
    S.words.forEach(function (w, i) {
      var el = $('hfW' + i); if (!el) return;
      if (i < S.pos) { el.classList.add('ok'); }
      else { el.classList.remove('ok'); paintHint(i, el); }
    });
    var a; for (a in S.ayDone) { var r = $('hfAy' + a); if (r) { r.classList.add('done'); if (S.ayBad[a]) r.classList.add('rough'); } }
  }
  function paintWord(i, state) {
    var el = $('hfW' + i); if (!el) return;
    el.classList.remove('bad');
    if (state === 'ok') { el.classList.add('ok'); el.classList.remove('cur'); el.innerHTML = esc(S.words[i].disp); }
    else if (state === 'bad') { void el.offsetWidth; el.classList.add('bad'); paintHint(i, el); }
    else paintHint(i, el);
  }
  function firstLetters(disp, k) {
    var out = '', n = 0, i, ch;
    for (i = 0; i < disp.length; i++) {
      ch = disp.charAt(i); out += ch;
      if (/[ء-يٱکی]/.test(ch)) { n++; if (n >= k) { while (i + 1 < disp.length && /[ؐ-ًؚ-ٰٟۖ-ۭ]/.test(disp.charAt(i + 1))) { i++; out += disp.charAt(i); } break; } }
    }
    return out;
  }
  function paintHint(i, el) {
    var h = S.hint[i], w = S.words[i]; if (!h || i < S.pos || w.given || P.show) return;
    if (h >= 99) { el.classList.add('rev'); el.innerHTML = esc(w.disp); return; }
    var pre = firstLetters(w.disp, h);
    el.innerHTML = '<i class="h" style="font-style:normal">' + esc(pre) + '</i>' + esc(w.disp.slice(pre.length));
  }
  function paintCursor() {
    var old = document.querySelector('#hifzView .hf-w.cur'); if (old) old.classList.remove('cur');
    var el = $('hfW' + S.pos); if (!el || S.finished) return;
    el.classList.add('cur');
    try { var r = el.getBoundingClientRect(); if (r.top < 120 || r.bottom > window.innerHeight - 190) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    updateBar();
  }
  function updateBar() {
    var b = $('hfProg'); if (!b || !S.words.length) return;
    b.style.width = Math.round(S.pos / S.words.length * 100) + '%';
  }
  function paintDock() {
    var m = $('hfMic'), s = $('hfSaid'), t = L(); if (!m) return;
    m.classList.toggle('on', S.listening); m.textContent = S.listening ? '⏹' : '🎙';
    if (s) { s.classList.toggle('err', !!(S.err || S.msg)); s.textContent = S.err || S.msg || (S.listening ? (S.said ? t.say + ': ' + S.said : t.listen) : t.tap); }
    var st = $('hfStat');
    if (st) {
      var k, wrongN = 0; for (k in S.fails) wrongN += S.fails[k];
      var att = S.pos - (S.sura === 1 && S.from === 1 ? 4 : 0) + wrongN, acc = att > 0 ? Math.max(0, Math.round((att - wrongN) / att * 100)) : 100;
      var sec = S.t0 ? Math.round((Date.now() - S.t0) / 1000) : 0, mm = ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + sec % 60).slice(-2);
      st.innerHTML = '<span class="bad">✗ ' + num(wrongN) + '</span><span>' + num(acc) + '%</span><span>' + (S.listening ? '🔴 ' : '') + mm + '</span>';
    }
    var lv = $('hfLv');
    if (lv) lv.innerHTML = t.lvl.map(function (n, k) { return '<button type="button" class="hf-chip' + (k === P.level ? ' on' : '') + '" data-act="lvl" data-k="' + k + '">' + esc(n) + '</button>'; }).join('');
  }

  /* ---------- events ---------- */
  function onClick(e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'closeCoach') { if (e.target.closest('[data-stop]')) return; $('hfCoach').hidden = true; return; }
    if (act === 'exit') return leave();
    if (act === 'hub') { stopListen(); S = { view: 'hub', filter: S.filter, q: S.q }; return render(); }
    if (act === 'letter') { S = { view: 'home', filter: S.filter, q: S.q }; return render(); }
    if (act === 'home') { stopListen(); S = { view: 'home', filter: S.filter, q: S.q }; return render(); }
    if (act === 'filter') { S.filter = b.getAttribute('data-f'); return render(); }
    if (act === 'pagemode') { if (window.enterHifzRead) window.enterHifzRead(); else if (window.enterHifzPage) window.enterHifzPage(); return; }
    if (act === 'quiz') { if (window.hifzQuiz) window.hifzQuiz(); return; }
    if (act === 'page') { var pn = parseInt(($('hfPg') || {}).value, 10); if (pn >= 1 && pn <= 604) openPage(pn); return; }
    if (act === 'open') return openSura(+b.getAttribute('data-n'));
    if (act === 'again') return S.page ? openPage(S.page) : openSura(S.sura);
    if (act === 'lvl') { P.level = +b.getAttribute('data-k'); savePrefs(); return paintDock(); }
    if (act === 'mic') return S.listening ? stopListen() : startListen();
    if (act === 'jump') {
      if (S.loading || S.finished) return;
      var a = +b.getAttribute('data-a'), np = S.starts[a];
      if (a === 1 && S.sura === 1) return;
      if (np == null || np === S.pos) return;
      var was = S.listening; if (was) stopListen();
      var i; for (i = 0; i < S.words.length; i++) { var el = $('hfW' + i); if (el) { if (i < np) el.classList.add('ok'); else { el.classList.remove('ok'); paintHint(i, el); } } }
      S.pos = S.cur = S.base = np; paintCursor(); if (was) startListen(); return;
    }
    if (act === 'mode') { P.mode = b.getAttribute('data-m'); savePrefs(); render(); return; }
    if (act === 'trPick') return trSheet();
    if (act === 'closeTr') { if (e.target.closest('[data-stop]')) return; $('hfTrSheet').hidden = true; return; }
    if (act === 'trSet') { P.tr = b.getAttribute('data-e'); savePrefs(); $('hfTrSheet').hidden = true; render(); return; }
    if (act === 'eye') {
      P.show = P.show ? 0 : 1; savePrefs();
      Array.prototype.forEach.call(document.querySelectorAll('#hifzView .hf-w'), function (el) { el.classList.toggle('vis', !!P.show); if (!P.show) el.classList.remove('err'); });
      b.textContent = P.show ? '🙈' : '👁'; return;
    }
    if (act === 'hint') {
      if (S.loading || S.finished) return;
      var i2 = S.pos; S.hint[i2] = Math.min((S.hint[i2] || 0) + 1, 3); S.ayBad[S.words[i2].a] = true;
      var el2 = $('hfW' + i2); if (el2) paintHint(i2, el2); return;
    }
    if (act === 'ai') {
      if (S.loading) return;
      var ai = S.finished ? S.to : (S.words[Math.min(S.pos, S.words.length - 1)] || { a: 1 }).a;
      return coach(ai);
    }
  }
  function openPage(pg) {
    stopListen(); newRun(1, 1, 1); S.page = pg; render();
    fetch('madani-bounds/' + ('000' + pg).slice(-3) + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var ks = Object.keys(d).map(function (k) { var q = k.split(':'); return { s: +q[0], a: +q[1] }; }).sort(function (x, y) { return x.s - y.s || x.a - y.a; });
      if (!ks.length) throw 0;
      var sn = ks[0].s, as = ks.filter(function (k) { return k.s === sn; }).map(function (k) { return k.a; });
      if (S.page !== pg) return;
      newRun(sn, as[0], as[as.length - 1]); S.page = pg; render();
      ensureSura(sn).then(function (ok) { if (S.page !== pg) return; S.loading = false; if (!ok) S.err = L().loadfail; else buildWords(); render(); });
    }).catch(function () { if (S.page !== pg) return; S.loading = false; S.err = L().pgBad; render(); });
  }
  function openSura(n) {
    stopListen(); newRun(n); render();
    ensureSura(n).then(function (ok) {
      if (S.sura !== n) return;
      S.loading = false;
      if (!ok) S.err = L().loadfail; else buildWords();
      render();
      if (ok) { P.last = n; savePrefs(); }
    });
  }
  function leave() {
    stopListen();
    var v = $('hifzView'); if (v) v.classList.remove('active');
    if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
  }

  window.enterHifz = function () {
    css();
    if (!ensureView()) return;
    S = { view: 'hub', filter: 'all', q: '' };
    if (typeof showView === 'function') showView('hifzView', L().title);
    render();
  };
  /* re-render when the app language changes */
  try {
    var _sl = window.setAppLanguage;
    if (typeof _sl === 'function' && !_sl.__hf) {
      window.setAppLanguage = function () { var r = _sl.apply(this, arguments); var v = $('hifzView'); if (v && v.classList.contains('active') && !S.listening) setTimeout(render, 60); return r; };
      window.setAppLanguage.__hf = true;
    }
  } catch (e) {}

  /* ---------- start-screen card ---------- */
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    var key = lang(), b = box.querySelector('.hifz-choice');
    if (!b) {
      b = document.createElement('button'); b.type = 'button'; b.className = 'section-choice hifz-choice';
      b.setAttribute('data-no-translate', '1'); b.setAttribute('data-keep-ar', '1');
      b.onclick = function () { window.enterHifz(); };
      var z = box.querySelector('.zikr-choice');
      if (z && z.nextSibling) box.insertBefore(b, z.nextSibling); else box.appendChild(b);
    }
    if (b.getAttribute('data-l') !== key) {
      b.setAttribute('data-l', key);
      var t = L();
      b.innerHTML = '<span class="choice-icon">🎙</span><span class="choice-copy"><b>' + esc(t.title) + '</b><small>' + esc(t.sub) + '</small></span><span class="choice-arrow">‹</span>';
    }
    return true;
  }
  function start() {
    css();
    var n = 0, iv = setInterval(function () { addCard(); if (++n > 25) clearInterval(iv); }, 300);
    setInterval(addCard, 3000);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  if (window.__HIFZ_TEST) {
    window.__HIFZ_TEST = { nw: nw, wmatch: wmatch, align: align, S: function () { return S; }, setS: function (x) { S = x; }, P: P };
  }
})();
