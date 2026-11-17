/* hifz.js v1 — لەبەرکردنی قورئان
   The user recites from memory. The app listens (Web Speech API, Arabic), compares what was said
   with the real ayah text and "writes" an ayah on the page only when it is correct. */
(function () {
  if (window.__hifzV1) return;
  window.__hifzV1 = true;

  var LS_KEY = 'hifz_v1';
  var BISM = ''; /* set below, after nstr exists */
  /* [name, minimum similarity, maximum wrong letters allowed in one ayah] */
  var LEVELS = [['ئاسان', 0.8, 8], ['ناوەند', 0.85, 4], ['سەخت', 0.92, 2]];
  var TEXT = {};
  var rec = null, restartT = null;

  /* ---------- small helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toAr(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.charAt(+d); }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function SL() { try { return surahs || []; } catch (e) { return []; } }
  function cnt(n) { var x = SL()[n - 1]; return x ? (+x[2] || 0) : 0; }
  function sname(n) { var x = SL()[n - 1]; return x ? x[0] : ('سورەت ' + n); }

  /* ---------- saved settings + history ---------- */
  function loadPrefs() {
    var d = { sura: 1, from: 1, to: 7, level: 1, hist: [] };
    try { var j = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); for (var k in j) if (k in d) d[k] = j[k]; } catch (e) {}
    if (!Array.isArray(d.hist)) d.hist = [];
    return d;
  }
  function savePrefs() { try { localStorage.setItem(LS_KEY, JSON.stringify(P)); } catch (e) {} }
  var P = loadPrefs();

  /* ---------- Arabic matching ---------- */
  /* strips tashkeel, Quranic marks, tatweel; unifies letter variants the speech engine writes differently */
  function norm(s) {
    return String(s || '')
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
      .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
      .replace(/\u0649/g, '\u064A')
      .replace(/\u0626/g, '\u064A')
      .replace(/\u0624/g, '\u0648')
      .replace(/\u0629/g, '\u0647')
      .replace(/\u06A9/g, '\u0643').replace(/\u06CC/g, '\u064A')
      .replace(/[^\u0621-\u064A\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  /* alef and hamza are dropped on both sides: the speech engine and the Uthmani text spell them differently (مالك / مَـٰلِكِ, الرحمن / ٱلرَّحْمَـٰنِ) */
  function nstr(s) { return norm(s).replace(/[ \u0627\u0621]/g, ''); }
  BISM = nstr('بسم الله الرحمن الرحيم');
  function lev(a, b) {
    var m = a.length, n = b.length, i, j;
    if (!m) return n;
    if (!n) return m;
    var p = new Array(n + 1);
    for (j = 0; j <= n; j++) p[j] = j;
    for (i = 1; i <= m; i++) {
      var prev = p[0]; p[0] = i;
      for (j = 1; j <= n; j++) {
        var tmp = p[j];
        p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
        prev = tmp;
      }
    }
    return p[n];
  }
  function sim(a, b) { var L = Math.max(a.length, b.length); return L ? 1 - lev(a, b) / L : 1; }

  /* best length (around the expected length) of the spoken text, starting at pos, that matches the ayah */
  function bestWindow(st, pos, exp, d, avail) {
    var m = exp.length, lo = Math.max(1, m - d), hi = Math.min(avail, m + d);
    var step = Math.max(1, Math.floor(d / 5)), best = { s: -1, len: lo, e: m }, L, s, a, b;
    for (L = lo; L <= hi; L += step) { s = sim(st.substr(pos, L), exp); if (s > best.s) best = { s: s, len: L }; }
    if (step > 1) {
      a = Math.max(lo, best.len - step); b = Math.min(hi, best.len + step);
      for (L = a; L <= b; L++) { s = sim(st.substr(pos, L), exp); if (s > best.s) best = { s: s, len: L }; }
    }
    best.e = lev(st.substr(pos, best.len), exp);
    return best;
  }

  /* how many consecutive ayahs, starting at ayah idx, are contained in the spoken stream (from pos) */
  function matchFrom(stream, pos, idx, th, cap) {
    var n = 0, last = 0;
    if (idx === 1 && S.sura !== 1 && S.sura !== 9 && pos === 0 && stream.length >= BISM.length - 3) {
      if (sim(stream.slice(0, BISM.length), BISM) >= 0.8) pos += Math.min(BISM.length, stream.length);
    }
    while (idx + n <= S.to) {
      var exp = S.exp[idx + n], m = exp.length, d = Math.max(2, Math.ceil(m * 0.12)), avail = stream.length - pos;
      if (avail < m - d) break;
      var bw = bestWindow(stream, pos, exp, d, avail);
      last = bw.s;
      if (bw.s >= th && bw.e <= (cap == null ? 99 : cap)) { pos += bw.len; n++; } else break;
    }
    return { n: n, pos: pos, last: last };
  }

  /* ---------- Quran text ---------- */
  var corpusP = null;
  function loadCorpus() {
    if (corpusP) return corpusP;
    corpusP = fetch('ai/quran.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      ((j && j.v) || []).forEach(function (r) {
        var s = +r[0], a = +r[1];
        if (s && a) (TEXT[s] = TEXT[s] || [])[a - 1] = String(r[2] || '');
      });
    }).catch(function () {});
    return corpusP;
  }
  function suraReady(n) {
    var t = TEXT[n], c = cnt(n);
    if (!t || !c) return false;
    for (var i = 0; i < c; i++) if (!t[i]) return false;
    return true;
  }
  function ensureSura(n) {
    return loadCorpus().then(function () {
      if (suraReady(n)) return true;
      return fetch('https://api.alquran.cloud/v1/surah/' + n + '/quran-uthmani').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var a = j && j.data && j.data.ayahs;
        if (!a || !a.length) throw 0;
        TEXT[n] = a.map(function (x) { return String(x.text || ''); });
        return suraReady(n);
      }).catch(function () { return false; });
    });
  }
  /* some editions put the bismillah inside ayah 1 of every surah; the user does not have to recite it there */
  function stripBism(t) {
    var w = String(t).split(/\s+/);
    if (w.length > 4 && nstr(w.slice(0, 4).join(' ')) === BISM) return w.slice(4).join(' ');
    return t;
  }

  /* ---------- state ---------- */
  function freshState() {
    return {
      view: 'home', sura: P.sura, from: P.from, to: P.to, idx: 1,
      ayat: {}, exp: {}, done: {}, clean: {}, skip: {}, tries: {},
      ok: 0, bad: 0, hint: 0, hintOn: false, reveal: false,
      listening: false, finished: false, loading: false,
      said: '', msg: '', kind: '', err: '', last: 0,
      carry0: '', carryDead: false, pos: 0, sess: '', sIdx0: 1, judged: false
    };
  }
  var S = freshState();

  function begin() {
    var n = clamp(+($('hfSura') || {}).value || P.sura, 1, 114), c = cnt(n);
    var from = clamp(+($('hfFrom') || {}).value || 1, 1, c);
    var to = clamp(+($('hfTo') || {}).value || c, from, c);
    P.sura = n; P.from = from; P.to = to; savePrefs();
    S = freshState();
    S.view = 'run'; S.sura = n; S.from = from; S.to = to; S.idx = from; S.sIdx0 = from; S.loading = true;
    render();
    ensureSura(n).then(function (ok) {
      S.loading = false;
      if (!ok) { S.err = 'دەقی قورئان بار نەبوو. ئینتەرنێت بپشکنە و دووبارە هەوڵ بدە.'; render(); return; }
      for (var a = from; a <= to; a++) {
        var t = TEXT[n][a - 1];
        if (a === 1 && n !== 1 && n !== 9) t = stripBism(t);
        S.ayat[a] = t; S.exp[a] = nstr(t);
      }
      render();
    });
  }

  /* ---------- listening ---------- */
  function engine() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }
  function startListen() {
    if (!engine()) { S.err = 'ئەم وێبگەڕە پشتگیری ناسینەوەی دەنگ ناکات. Chrome لەسەر ئەندرۆید یان کۆمپیوتەر بەکاربهێنە.'; render(); return; }
    S.err = ''; S.listening = true; render(); openRec();
  }
  function stopListen() {
    S.listening = false;
    clearTimeout(restartT);
    try { if (rec) { var r = rec; rec = null; if (r.abort) r.abort(); else r.stop(); } } catch (e) {}
  }
  function openRec() {
    var R = engine(), r;
    if (!R) return;
    if (S.carryDead) { S.carry0 = ''; S.carryDead = false; }
    S.pos = 0; S.sess = ''; S.judged = false; S.sIdx0 = S.idx;
    try { r = new R(); } catch (e) { S.listening = false; S.err = 'نەتوانرا مایکرۆفۆن بکرێتەوە.'; render(); return; }
    rec = r;
    r.lang = 'ar-SA'; r.continuous = false; r.interimResults = true; r.maxAlternatives = 3;
    r.onresult = function (e) {
      if (rec !== r) return;
      var last = e.results[e.results.length - 1], fin = !!last.isFinal, alts = [], j, i, K = Math.min(3, last.length || 1);
      for (j = 0; j < K; j++) {
        var t = '';
        for (i = 0; i < e.results.length; i++) { var it = e.results[i]; t += ' ' + ((it[j] || it[0]).transcript || ''); }
        alts.push(t);
      }
      onSpeech(alts, fin);
    };
    r.onerror = function (e) {
      if (rec !== r) return;
      var c = e && e.error;
      if (c === 'not-allowed' || c === 'service-not-allowed') { stopListen(); S.err = 'مۆڵەتی مایکرۆفۆن نەدراوە. لە ڕێکخستنی وێبگەڕ مۆڵەت بدە.'; render(); }
      else if (c === 'audio-capture') { stopListen(); S.err = 'مایکرۆفۆن نەدۆزرایەوە.'; render(); }
      else if (c === 'network') { stopListen(); S.err = 'ناسینەوەی دەنگ پێویستی بە ئینتەرنێت هەیە.'; render(); }
    };
    r.onend = function () {
      if (rec !== r) return;
      if (S.listening && !S.finished) {
        if (!S.judged && S.sess) { judgeLeft(); render(); }
        clearTimeout(restartT);
        restartT = setTimeout(function () { if (S.listening && !S.finished) openRec(); }, 200);
      }
    };
    try { r.start(); } catch (e2) { S.listening = false; S.err = 'نەتوانرا مایکرۆفۆن بکرێتەوە.'; render(); }
  }

  function onSpeech(alts, fin) {
    if (!S.listening || S.finished) return;
    var bestR = null, bestS = '', bestAlt = '', i, st, r;
    for (i = 0; i < alts.length; i++) {
      st = S.carry0 + nstr(alts[i]);
      r = fin ? matchFrom(st, 0, S.sIdx0, LEVELS[P.level][1], LEVELS[P.level][2]) : matchFrom(st, S.pos, S.idx, LEVELS[P.level][1], LEVELS[P.level][2]);
      if (!bestR || r.n > bestR.n || (r.n === bestR.n && r.last > bestR.last)) { bestR = r; bestS = st; bestAlt = alts[i]; }
    }
    S.said = String(bestAlt).trim(); S.sess = bestS; S.last = bestR.last;
    if (!fin) {
      if (bestR.n > 0) { S.pos = bestR.pos; accept(bestR.n); render(); }
      else paintSaid();
      return;
    }
    var already = S.idx - S.sIdx0;
    if (bestR.n > already) accept(bestR.n - already);
    S.judged = true; S.pos = bestR.pos;
    if (!S.finished) judge(bestS.slice(bestR.pos), bestR.n >= already, bestR.n > 0 || already > 0);
    render();
  }

  function accept(n) {
    for (var k = 0; k < n && S.idx <= S.to; k++) {
      S.done[S.idx] = true;
      if (S.clean[S.idx] !== false) S.clean[S.idx] = true;
      S.ok++; S.idx++;
    }
    S.hintOn = false; S.reveal = false; S.carryDead = true; S.msg = ''; S.kind = '';
    if (S.idx > S.to) finish();
  }

  function judgeLeft() { judge(S.sess.slice(S.pos), true, S.idx > S.sIdx0); S.judged = true; }

  /* leftover speech that did not complete the expected ayah: keep as a pause, or mark as a mistake */
  function judge(left, consistent, hadAccept) {
    S.carry0 = ''; S.carryDead = false;
    if (S.idx > S.to || left.length < 4) return;
    if (hadAccept && !consistent) return;
    var exp = S.exp[S.idx], m = exp.length;
    var pre = sim(left, exp.slice(0, left.length));
    if (left.length < 0.9 * m && pre >= LEVELS[P.level][1] - 0.06) { S.carry0 = left; S.msg = 'درێژە بدە…'; S.kind = 'info'; return; }
    wrong();
  }
  function wrong() {
    S.bad++; S.tries[S.idx] = (S.tries[S.idx] || 0) + 1; S.clean[S.idx] = false;
    S.msg = '✗ هەڵەیە، ئایەتی ' + toAr(S.idx) + ' نەنووسرایەوە. دووبارە بیخوێنەوە.' + (S.tries[S.idx] >= 3 ? ' دەتوانیت ئاماژە بەکاربهێنیت.' : '');
    S.kind = 'bad';
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) {}
  }

  function finish() {
    var total = S.to - S.from + 1, c = 0;
    for (var a = S.from; a <= S.to; a++) if (S.clean[a] === true && S.done[a]) c++;
    S.finished = true; S.clean_n = c;
    stopListen();
    P.hist.unshift({ t: Date.now(), s: S.sura, f: S.from, to: S.to, n: total, c: c });
    P.hist = P.hist.slice(0, 15);
    savePrefs();
  }

  /* ---------- UI ---------- */
  function injectCss() {
    if ($('hifzCss')) return;
    var s = document.createElement('style');
    s.id = 'hifzCss';
    s.textContent = [
      'body:has(#hifzView.active) .top{display:none!important}',
      '.phone:has(#hifzView.active) .status,.phone:has(#hifzView.active) .appbar,.phone:has(#hifzView.active) .bottom{display:none!important}',
      '.phone:has(#hifzView.active) .main{height:100%!important;padding:0!important;background:#f3f1ea}',
      '#hifzView{display:none!important}',
      '#hifzView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;box-sizing:border-box}',
      '#hifzView .hf-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#17364f,#24597a);color:#fff;flex-shrink:0}',
      '#hifzView .hf-head h2{margin:0;font-size:17px;font-weight:800}',
      '#hifzView .hf-head small{display:block;font-size:11px;opacity:.85;margin-top:2px}',
      '#hifzView .hf-btn{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:8px 11px;font:inherit;font-size:12px;cursor:pointer}',
      '#hifzView .hf-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px calc(20px + env(safe-area-inset-bottom))}',
      '#hifzView .hf-card{background:#fff;border:1px solid #d9e0e6;border-radius:14px;padding:13px 14px;margin-bottom:11px}',
      '#hifzView .hf-card h3{margin:0 0 8px;font-size:14px;color:#17364f}',
      '#hifzView label{display:block;font-size:12px;color:#5b6b76;margin:9px 0 4px;font-weight:700}',
      '#hifzView select,#hifzView input[type=number]{width:100%;box-sizing:border-box;border:1px solid #cdd7de;border-radius:10px;padding:10px;font:inherit;font-size:15px;background:#fff}',
      '#hifzView .hf-row{display:flex;gap:8px}',
      '#hifzView .hf-row>div{flex:1}',
      '#hifzView .hf-chips{display:flex;gap:6px;flex-wrap:wrap}',
      '#hifzView .hf-chip{flex:1;border:1px solid #cdd7de;background:#fff;border-radius:10px;padding:9px 4px;font:inherit;font-size:13px;cursor:pointer;color:#17364f}',
      '#hifzView .hf-chip.on{background:#24597a;color:#fff;border-color:#24597a}',
      '#hifzView .hf-go{width:100%;border:0;border-radius:13px;padding:14px;margin-top:12px;font:inherit;font-size:16px;font-weight:800;background:#24597a;color:#fff;cursor:pointer}',
      '#hifzView .hf-note{font-size:12px;line-height:1.9;color:#5b6b76}',
      '#hifzView .hf-hist{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid #eef1f3;font-size:13px;color:#2a3a45}',
      '#hifzView .hf-bar{height:8px;background:#dfe7ec;border-radius:5px;overflow:hidden;margin:8px 0 2px}',
      '#hifzView .hf-bar i{display:block;height:100%;background:#2e8b68;transition:width .35s}',
      '#hifzView .hf-page{background:#fffdf5;border:1px solid #e4d8b4;border-radius:14px;padding:16px 14px;min-height:200px;direction:rtl;text-align:justify;font-family:"Amiri","Noto Naskh Arabic","Scheherazade New",serif;font-size:26px;line-height:2.25;color:#16322a}',
      '#hifzView .hf-a{display:inline}',
      '#hifzView .hf-a.new{animation:hfIn .6s ease-out}',
      '@keyframes hfIn{from{opacity:0;color:#2e8b68}to{opacity:1}}',
      '#hifzView .hf-n{display:inline-block;min-width:1.5em;height:1.5em;line-height:1.5em;text-align:center;border:1px solid #b99a4b;border-radius:50%;font-size:.55em;color:#6f5720;margin:0 .25em;font-family:serif;vertical-align:middle}',
      '#hifzView .hf-n0{border-style:dashed;color:#8a8a8a;border-color:#b5b5b5}',
      '#hifzView .hf-dots{color:#b5b5b5;letter-spacing:.35em}',
      '#hifzView .hf-hint{color:#9a7b2f}',
      '#hifzView .hf-rev{color:#b5483a;opacity:.8}',
      '#hifzView .hf-skip{color:#b5483a}',
      '#hifzView .hf-said{min-height:22px;margin:10px 2px 0;font-size:14px;color:#5b6b76;direction:rtl;text-align:center}',
      '#hifzView .hf-msg{min-height:22px;margin:6px 2px;font-size:14px;font-weight:700;text-align:center}',
      '#hifzView .hf-msg.bad{color:#b5483a}',
      '#hifzView .hf-msg.info{color:#24597a}',
      '#hifzView .hf-msg.err{color:#b5483a;font-weight:600;line-height:1.8}',
      '#hifzView .hf-mic{display:block;margin:6px auto 4px;width:78px;height:78px;border:0;border-radius:50%;background:#24597a;color:#fff;font-size:32px;cursor:pointer;box-shadow:0 6px 18px #24597a55}',
      '#hifzView .hf-mic.on{background:#c0392b;box-shadow:0 0 0 0 #c0392b88;animation:hfPulse 1.4s infinite}',
      '@keyframes hfPulse{0%{box-shadow:0 0 0 0 #c0392b88}70%{box-shadow:0 0 0 18px #c0392b00}100%{box-shadow:0 0 0 0 #c0392b00}}',
      '@media(prefers-reduced-motion:reduce){#hifzView .hf-mic.on{animation:none}#hifzView .hf-a.new{animation:none}}',
      '#hifzView .hf-mlabel{text-align:center;font-size:12px;color:#5b6b76;margin-bottom:10px}',
      '#hifzView .hf-tools{display:flex;gap:6px;margin-bottom:10px}',
      '#hifzView .hf-tools button{flex:1;border:1px solid #cdd7de;background:#fff;border-radius:10px;padding:9px 2px;font:inherit;font-size:12px;cursor:pointer;color:#17364f}',
      '#hifzView .hf-stats{display:flex;justify-content:space-around;font-size:13px;color:#2a3a45}',
      '#hifzView .hf-big{font-size:42px;font-weight:800;text-align:center;color:#24597a;margin:6px 0}',
      '.section-choice.hifz-choice{border-color:#c6d5e3;background:linear-gradient(135deg,#fff,#edf3f9)}',
      '.section-choice.hifz-choice .choice-icon{background:#d6e3f0;color:#24597a}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('hifzView');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'hifzView'; v.className = 'view';
    main.appendChild(v);
    v.addEventListener('click', onClick);
    v.addEventListener('change', onChange);
    return v;
  }

  function head(title, sub, back) {
    return '<div class="hf-head"><div><h2>' + esc(title) + '</h2>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div><div style="display:flex;gap:6px">' +
      (back ? '<button type="button" class="hf-btn" data-act="home">‹ گەڕانەوە</button>' : '') +
      '<button type="button" class="hf-btn" data-act="exit">بەشەکان</button></div></div>';
  }

  function homeHtml() {
    var sl = SL(), c = cnt(P.sura) || 7, i, o = '';
    for (i = 0; i < sl.length; i++) o += '<option value="' + (i + 1) + '"' + (i + 1 === P.sura ? ' selected' : '') + '>' + toAr(i + 1) + '. ' + esc(sl[i][0]) + ' (' + toAr(sl[i][2]) + ')</option>';
    var lv = LEVELS.map(function (l, k) { return '<button type="button" class="hf-chip' + (k === P.level ? ' on' : '') + '" data-lv="' + k + '">' + l[0] + '</button>'; }).join('');
    var hist = P.hist.length ? P.hist.map(function (h) {
      var pct = h.n ? Math.round(100 * h.c / h.n) : 0;
      return '<div class="hf-hist"><span>' + esc(sname(h.s)) + ' · ' + toAr(h.f) + '–' + toAr(h.to) + '</span><b>' + toAr(pct) + '٪</b><span>' + new Date(h.t).toLocaleDateString() + '</span></div>';
    }).join('') : '<div class="hf-note">هێشتا هیچ پشکنینێکت نەکردووە.</div>';
    return head('لەبەرکردنی قورئان', 'بخوێنەوە، ئەپەکە گوێ دەگرێت', false) +
      '<div class="hf-body">' +
      '<div class="hf-card"><h3>چی بخوێنیتەوە؟</h3><label for="hfSura">سورەت</label><select id="hfSura">' + o + '</select>' +
      '<div class="hf-row"><div><label for="hfFrom">لە ئایەتی</label><input id="hfFrom" type="number" min="1" max="' + c + '" value="' + clamp(P.from, 1, c) + '"></div>' +
      '<div><label for="hfTo">تا ئایەتی</label><input id="hfTo" type="number" min="1" max="' + c + '" value="' + clamp(P.to, 1, c) + '"></div></div>' +
      '<label>وردبینی</label><div class="hf-chips">' + lv + '</div>' +
      '<button type="button" class="hf-go" data-act="start">🎤 دەستپێکردن</button></div>' +
      '<div class="hf-card"><h3>چۆن کار دەکات</h3><div class="hf-note">مایکرۆفۆن بکەرەوە و ئایەتەکان بە لەبەر بخوێنەوە. ئەگەر ئایەتەکە ڕاست بوو لەسەر لاپەڕەکە دەنووسرێتەوە؛ ئەگەر هەڵە بوو نانووسرێتەوە و دەتوانیت دووبارە هەوڵ بدەیت. ئینتەرنێت و مۆڵەتی مایکرۆفۆن پێویستە.</div></div>' +
      '<div class="hf-card"><h3>پشکنینە پێشووەکان</h3>' + hist + '</div></div>';
  }

  function pageHtml() {
    var h = '', a, newest = S.idx - 1;
    for (a = S.from; a <= S.to; a++) {
      if (S.done[a]) h += '<span class="hf-a' + (a === newest && S.ok ? ' new' : '') + '">' + esc(S.ayat[a]) + ' <span class="hf-n">' + toAr(a) + '</span></span> ';
      else if (S.skip[a]) h += '<span class="hf-skip">••• <span class="hf-n">' + toAr(a) + '</span></span> ';
    }
    if (!S.finished && S.ayat[S.idx]) {
      var t = S.ayat[S.idx], cur;
      if (S.reveal) cur = '<span class="hf-rev">' + esc(t) + '</span>';
      else if (S.hintOn) cur = '<span class="hf-hint">' + esc(t.split(/\s+/).slice(0, 2).join(' ')) + ' …</span>';
      else cur = '<span class="hf-dots">• • •</span>';
      h += '<span>' + cur + ' <span class="hf-n hf-n0">' + toAr(S.idx) + '</span></span>';
    }
    return '<div class="hf-page" data-no-translate="1" data-keep-ar="1">' + h + '</div>';
  }

  function runHtml() {
    var total = S.to - S.from + 1, doneN = S.idx - S.from, pct = Math.round(100 * doneN / total);
    var t = head(sname(S.sura), 'ئایەتی ' + toAr(S.from) + ' تا ' + toAr(S.to), true);
    if (S.loading) return t + '<div class="hf-body"><div class="hf-card hf-note">دەقی قورئان بار دەکرێت…</div></div>';
    if (!S.ayat[S.from]) return t + '<div class="hf-body"><div class="hf-card"><div class="hf-msg err">' + esc(S.err || 'هەڵەیەک ڕوویدا.') + '</div><button type="button" class="hf-go" data-act="home">گەڕانەوە</button></div></div>';
    if (S.finished) return t + '<div class="hf-body">' + doneHtml(total) + pageHtml() + '</div>';
    return t + '<div class="hf-body">' +
      '<div class="hf-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="hf-note" style="text-align:center;margin-bottom:8px">ئایەتی ' + toAr(Math.min(S.idx, S.to)) + ' · ' + toAr(doneN) + ' لە ' + toAr(total) + '</div>' +
      pageHtml() +
      '<div class="hf-said" id="hfSaid">' + esc(S.said) + '</div>' +
      '<div class="hf-msg ' + esc(S.err ? 'err' : S.kind) + '" id="hfMsg">' + esc(S.err || S.msg) + '</div>' +
      '<button type="button" class="hf-mic' + (S.listening ? ' on' : '') + '" data-act="mic" aria-label="مایکرۆفۆن">' + (S.listening ? '■' : '🎤') + '</button>' +
      '<div class="hf-mlabel">' + (S.listening ? 'گوێم لێتە… ئایەتی ' + toAr(S.idx) + ' بخوێنەوە' : 'کرتە بکە و دەستپێبکە') + '</div>' +
      '<div class="hf-tools"><button type="button" data-act="hint">💡 ئاماژە</button><button type="button" data-act="reveal">👁 ئایەتەکە ببینە</button><button type="button" data-act="skip">⏭ تێپەڕاندن</button></div>' +
      '<div class="hf-stats"><span>✓ ' + toAr(S.ok) + '</span><span>✗ ' + toAr(S.bad) + '</span><span>💡 ' + toAr(S.hint) + '</span></div></div>';
  }

  function doneHtml(total) {
    var c = S.clean_n || 0, pct = total ? Math.round(100 * c / total) : 0, weak = [], a;
    for (a = S.from; a <= S.to; a++) if (S.clean[a] !== true || !S.done[a]) weak.push(toAr(a));
    return '<div class="hf-card"><h3>پشکنین تەواو بوو</h3><div class="hf-big">' + toAr(pct) + '٪</div>' +
      '<div class="hf-note" style="text-align:center">' + toAr(c) + ' ئایەت لە ' + toAr(total) + ' بێ هەڵە و بێ ئاماژە خوێندرانەوە.</div>' +
      (weak.length ? '<div class="hf-note" style="text-align:center;margin-top:6px">ئایەتەکانی پێویست بە دووبارەکردنەوە: ' + weak.join('، ') + '</div>' : '') +
      '<div class="hf-row" style="margin-top:10px"><div><button type="button" class="hf-go" style="margin-top:0" data-act="again">دووبارە</button></div><div><button type="button" class="hf-go" style="margin-top:0;background:#fff;color:#24597a;border:1px solid #24597a" data-act="home">سورەتی تر</button></div></div></div>';
  }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    v.innerHTML = S.view === 'run' ? runHtml() : homeHtml();
  }
  function paintSaid() { var e = $('hfSaid'); if (e) e.textContent = S.said; }

  /* ---------- events ---------- */
  function onChange(e) {
    var t = e.target;
    if (t && t.id === 'hfSura') {
      var n = +t.value, c = cnt(n);
      P.sura = n; P.from = 1; P.to = c; savePrefs(); render();
    }
  }
  function onClick(e) {
    var el = e.target.closest ? e.target.closest('[data-act],[data-lv]') : null;
    if (!el) return;
    var lv = el.getAttribute('data-lv');
    if (lv !== null) { var fi = $('hfFrom'), ti = $('hfTo'); if (fi && +fi.value) P.from = +fi.value; if (ti && +ti.value) P.to = +ti.value; P.level = +lv; savePrefs(); render(); return; }
    var act = el.getAttribute('data-act');
    if (act === 'exit') { leave(); return; }
    if (act === 'home') { stopListen(); S = freshState(); render(); return; }
    if (act === 'start') { begin(); return; }
    if (act === 'again') { stopListen(); begin2(); return; }
    if (act === 'mic') { if (S.listening) { stopListen(); render(); } else startListen(); return; }
    if (S.view !== 'run' || S.finished || !S.ayat[S.idx]) return;
    if (act === 'hint') { if (!S.hintOn && !S.reveal) { S.hintOn = true; S.hint++; S.clean[S.idx] = false; } render(); return; }
    if (act === 'reveal') { if (!S.reveal) { S.reveal = true; S.hint++; S.clean[S.idx] = false; } render(); return; }
    if (act === 'skip') {
      S.skip[S.idx] = true; S.clean[S.idx] = false; S.idx++; S.carry0 = ''; S.hintOn = false; S.reveal = false; S.msg = ''; S.kind = '';
      if (S.idx > S.to) finish();
      else S.sIdx0 = S.idx;
      render(); return;
    }
  }
  function begin2() {
    var n = P.sura, from = P.from, to = P.to;
    S = freshState();
    var fake = { sura: n, from: from, to: to };
    S.view = 'run'; S.sura = fake.sura; S.from = fake.from; S.to = fake.to; S.idx = fake.from; S.sIdx0 = fake.from; S.loading = true;
    render();
    ensureSura(n).then(function (ok) {
      S.loading = false;
      if (!ok) { S.err = 'دەقی قورئان بار نەبوو. ئینتەرنێت بپشکنە و دووبارە هەوڵ بدە.'; render(); return; }
      for (var a = from; a <= to; a++) {
        var t = TEXT[n][a - 1];
        if (a === 1 && n !== 1 && n !== 9) t = stripBism(t);
        S.ayat[a] = t; S.exp[a] = nstr(t);
      }
      render();
    });
  }
  function leave() {
    stopListen();
    var v = $('hifzView');
    if (v) v.classList.remove('active');
    if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
  }

  window.enterHifz = function () {
    injectCss();
    if (!ensureView()) return;
    S = freshState();
    if (typeof showView === 'function') showView('hifzView', 'لەبەرکردنی قورئان');
    render();
  };

  /* ---------- start-screen card (right after the zikr card) ---------- */
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (box.querySelector('.hifz-choice')) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice hifz-choice';
    b.innerHTML = '<span class="choice-icon">🎙</span><span class="choice-copy"><b>لەبەرکردنی قورئان</b><small>بە دەنگ بخوێنەوە، ئایەتی ڕاست لەسەر قورئانەکە دەنووسرێتەوە</small></span><span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterHifz(); };
    var z = box.querySelector('.zikr-choice');
    if (z && z.nextSibling) box.insertBefore(b, z.nextSibling);
    else box.appendChild(b);
    return true;
  }
  function start() {
    injectCss();
    var n = 0, iv = setInterval(function () { addCard(); if (++n > 25) clearInterval(iv); }, 300);
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);

  if (window.__HIFZ_TEST) {
    window.__HIFZ_TEST = { norm: norm, nstr: nstr, sim: sim, matchFrom: matchFrom, stripBism: stripBism, onSpeech: onSpeech, freshState: freshState, S: function () { return S; }, setS: function (x) { S = x; }, BISM: BISM };
  }
})();
