/* hifz-page.js v1 — لەبەرکردن لەسەر لاپەڕەی موسحەف (a separate section, next to the surah-based memorisation)
   The real Madinah mushaf page is shown with the surah header, the bismillah and the ayah numbers, but every word is hidden.
   The user recites a whole ayah from memory; the app listens (Web Speech API, Arabic), checks it and, if it is right, writes the ayah on the page. A wrong ayah is not written. */
(function () {
  if (window.__hifzPageV1) return;
  window.__hifzPageV1 = true;

  var LS_KEY = 'hifz_page_v1';
  var BISM = '';
  /* [name, share of wrong letters allowed in an ayah, maximum wrong letters in one ayah, minimum allowed] */
  var LEVELS = [['ئاسان', 0.15, 6, 1], ['ناوەند', 0.08, 2, 1], ['سەخت', 0.04, 1, 0]];
  var TEXT = {};
  var rec = null, restartT = null, frame = null, loadId = 0;

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toAr(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.charAt(+d); }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function SL() { try { return surahs || []; } catch (e) { return []; } }
  function sname(n) { var x = SL()[n - 1]; return x ? x[0] : ('سورەت ' + n); }

  function loadPrefs() {
    var d = { page: 1, sura: 1, level: 1, hist: [] };
    try { var j = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); for (var k in j) if (k in d) d[k] = j[k]; } catch (e) {}
    if (!Array.isArray(d.hist)) d.hist = [];
    return d;
  }
  function savePrefs() { try { localStorage.setItem(LS_KEY, JSON.stringify(P)); } catch (e) {} }
  var P = loadPrefs();

  /* ---------- Arabic matching ---------- */
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
  /* alef and hamza are dropped on both sides: the speech engine and the Uthmani text spell them differently */
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

  /* ---------- Quran text ---------- */
  function cnt(n) { var x = SL()[n - 1]; return x ? (+x[2] || 0) : 0; }
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
  function stripBism(t) {
    var w = String(t).split(/\s+/);
    if (w.length > 4 && nstr(w.slice(0, 4).join(' ')) === BISM) return w.slice(4).join(' ');
    return t;
  }
  /* the words of one ayah, as written in the Uthmani text (stop signs that stand alone are not words) */
  function tokens(s, a) {
    var t = TEXT[s] && TEXT[s][a - 1];
    if (!t) return [];
    if (a === 1 && s !== 1 && s !== 9) t = stripBism(t);
    return t.split(/\s+/).filter(function (x) { return nstr(x).length > 0; });
  }

  /* ---------- state ---------- */
  function freshState() {
    return {
      view: 'home', page: P.page, startPage: P.page, items: [], wi: 0,
      ready: false, loading: false, listening: false,
      ok: 0, bad: 0, hint: 0, said: '', msg: '', kind: '', err: '', q: '',
      sWi0: 0, used: 0, carry: '', carryDead: false, pageDoneT: null
    };
  }
  var S = freshState();

  /* ---------- aligning the spoken letters with the next expected words ---------- */
  /* One edit-distance pass gives, for every ayah end, the cheapest way the spoken text can end there.
     An ayah is accepted only when it is complete and has just a few wrong letters. */
  function align(st, from, f, cap, mn) {
    var items = S.items, n = items.length, bounds = [], E = '', k, i, j;
    for (k = from; k < n && E.length < 360; k++) { E += items[k].exp; bounds.push(E.length); }
    var nb = bounds.length;
    if (!nb) return { k: 0, used: 0, left: st.length };
    var N = E.length, m = Math.min(st.length, N + 14), bestD = [], bestI = [];
    for (k = 0; k < nb; k++) { bestD.push(1e9); bestI.push(0); }
    var prev = new Array(N + 1), cur = new Array(N + 1);
    for (j = 0; j <= N; j++) prev[j] = j;
    for (k = 0; k < nb; k++) if (prev[bounds[k]] < bestD[k]) { bestD[k] = prev[bounds[k]]; bestI[k] = 0; }
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      var c = st.charCodeAt(i - 1);
      for (j = 1; j <= N; j++) {
        var a = prev[j] + 1, b = cur[j - 1] + 1, d = prev[j - 1] + (c === E.charCodeAt(j - 1) ? 0 : 1);
        cur[j] = a < b ? (a < d ? a : d) : (b < d ? b : d);
      }
      for (k = 0; k < nb; k++) if (cur[bounds[k]] < bestD[k]) { bestD[k] = cur[bounds[k]]; bestI[k] = i; }
      var t = prev; prev = cur; cur = t;
    }
    var acc = 0, prevD = 0, used = 0;
    for (k = 0; k < nb; k++) {
      var len = items[from + k].exp.length, tail = st.length - bestI[k], extra = tail > 0 && tail < 3 ? tail : 0;
      var inc = Math.max(0, bestD[k] + extra - prevD), allow = Math.min(cap, Math.max(mn, Math.floor(len * f)));
      if (len === 0 || inc <= allow) { acc++; prevD = bestD[k]; used = Math.max(used, bestI[k]); } else break;
    }
    return { k: acc, used: used, left: st.length - used };
  }
  /* the bismillah may be recited before the first ayah of a surah; the page already shows it */
  function runAlign(st, from) {
    var off = 0, it = S.items[from], f = LEVELS[P.level][1], cap = LEVELS[P.level][2], mn = LEVELS[P.level][3];
    if (it && it.bsm && st.length >= BISM.length - 3 && sim(st.slice(0, BISM.length), BISM) >= 0.8) off = Math.min(BISM.length, st.length);
    var r = align(st.slice(off), from, f, cap, mn);
    r.used += off;
    return r;
  }

  /* ---------- the mushaf page (iframe of mushaf/view.html, Madinah mushaf) ---------- */
  function frameCss(doc) {
    var s = doc.createElement('style');
    s.textContent = '.ayah.hz{visibility:hidden}' +
      '.ayah.hz.er{visibility:visible;color:transparent;background:#f3c1ba;border-radius:5px}' +
      '.ayah.rv{animation:hpIn .45s ease-out}' +
      '.ayah.hp{box-shadow:inset 0 -3px 0 #c0392b}' +
      '@keyframes hpIn{from{opacity:0}to{opacity:1}}' +
      '@media(prefers-reduced-motion:reduce){.ayah.rv{animation:none}}';
    doc.head.appendChild(s);
  }
  function groupsOf(doc) {
    var groups = [], map = {};
    [].slice.call(doc.querySelectorAll('.line .ayah')).forEach(function (sp) {
      var key = sp.getAttribute('data-sura') + ':' + sp.getAttribute('data-ayah'), g = map[key];
      if (!g) { g = map[key] = { sura: +sp.getAttribute('data-sura'), ayah: +sp.getAttribute('data-ayah'), spans: [], key: key }; groups.push(g); }
      g.spans.push(sp);
    });
    return groups;
  }
  /* one item per ayah; its words are the spans of the page, the last span of a complete ayah is its number (left visible) */
  function buildItems(groups) {
    var items = [];
    groups.forEach(function (g, gi) {
      var toks = tokens(g.sura, g.ayah), nsp = g.spans.length, nw = toks.length, hide;
      if (nw && nsp === nw + 1) hide = g.spans.slice(0, nw);
      else if (nw && gi === 0 && groups.length > 1 && nsp >= 2 && nsp < nw + 1) hide = g.spans.slice(0, nsp - 1);
      else if (nw && gi === groups.length - 1 && groups.length > 1 && nsp < nw) hide = g.spans.slice();
      else hide = nsp >= 2 ? g.spans.slice(0, nsp - 1) : g.spans.slice();
      items.push({ spans: hide, exp: nstr(toks.join(' ')), key: g.key, sura: g.sura, ayah: g.ayah, bsm: g.ayah === 1 && g.sura !== 1 && g.sura !== 9 });
    });
    return items;
  }
  function hideAll() { S.items.forEach(function (it) { it.spans.forEach(function (sp) { sp.classList.remove('rv', 'hp', 'er'); sp.classList.add('hz'); }); }); }
  function show(it, help) { it.spans.forEach(function (sp) { sp.classList.remove('hz', 'er'); sp.classList.add('rv'); if (help) sp.classList.add('hp'); }); }

  function loadPage(p) {
    S.page = clamp(+p || 1, 1, 604);
    S.items = []; S.wi = 0; S.ready = false; S.loading = true; S.err = ''; S.msg = ''; S.kind = ''; S.said = '';
    killRec();
    var id = ++loadId, pg = $('hpPg');
    if (pg) pg.textContent = toAr(S.page);
    if (frame) { frame.style.visibility = 'hidden'; frame.src = 'mushaf/view.html?m=q&p=' + S.page; }
    paintFoot();
    return id;
  }
  function onReady() {
    var id = loadId, doc;
    try { doc = frame.contentDocument; } catch (e) { doc = null; }
    if (!doc) { S.loading = false; S.err = 'لاپەڕەکە نەکرایەوە.'; paintFoot(); return; }
    frameCss(doc);
    var groups = groupsOf(doc), seen = {}, suras = [];
    groups.forEach(function (g) { if (!seen[g.sura]) { seen[g.sura] = 1; suras.push(g.sura); } });
    Promise.all(suras.map(ensureSura)).then(function (oks) {
      if (id !== loadId || S.view !== 'run') return;
      S.loading = false;
      if (oks.some(function (x) { return !x; })) { S.err = 'دەقی قورئان بار نەبوو. ئینتەرنێت بپشکنە و دووبارە هەوڵ بدە.'; paintFoot(); return; }
      S.items = buildItems(groups);
      hideAll();
      S.wi = 0; S.ready = true;
      doc.addEventListener('click', function (ev) { var el = ev.target; while (el && !(el.classList && el.classList.contains('ayah'))) el = el.parentNode; if (el) setStart(el); }, false);
      frame.style.visibility = 'visible';
      paintFoot();
      if (S.listening) openRec();
    });
  }
  window.addEventListener('message', function (e) {
    if (!frame || e.source !== frame.contentWindow) return;
    if (e.data && e.data.ready) onReady();
  });

  /* tapping a word on the page chooses where the recitation starts; what is before it is shown */
  function setStart(el) {
    if (!S.ready) return;
    if (S.listening) { S.msg = 'بۆ گۆڕینی شوێنی دەستپێکردن، سەرەتا مایکرۆفۆن بوەستێنە.'; S.kind = 'info'; paintFoot(); return; }
    var idx = -1, i;
    for (i = 0; i < S.items.length && idx < 0; i++) if (S.items[i].spans.indexOf(el) >= 0) idx = i;
    if (idx < 0) {
      var key = el.getAttribute('data-sura') + ':' + el.getAttribute('data-ayah');
      for (i = 0; i < S.items.length && idx < 0; i++) if (S.items[i].key === key) idx = i;
    }
    if (idx < 0) return;
    var key2 = S.items[idx].key;
    while (idx > 0 && S.items[idx - 1].key === key2) idx--;
    hideAll();
    for (i = 0; i < idx; i++) show(S.items[i], false);
    S.wi = idx; S.msg = 'دەستپێک لە ئایەتی ' + toAr(S.items[idx].ayah); S.kind = 'info';
    paintFoot();
  }

  function nextInView() {
    var it = S.items[S.wi], sp = it && it.spans[0];
    if (!sp || !frame) return;
    try {
      var r = sp.getBoundingClientRect(), h = frame.contentDocument.documentElement.clientHeight;
      if (r.top < h * 0.15 || r.bottom > h * 0.8) sp.scrollIntoView({ block: 'center', behavior: 'smooth' });
    } catch (e) {}
  }

  /* ---------- recitation ---------- */
  function engine() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }
  function startListen() {
    if (!engine()) { S.err = 'ئەم وێبگەڕە پشتگیری ناسینەوەی دەنگ ناکات. Chrome لەسەر ئەندرۆید یان کۆمپیوتەر بەکاربهێنە.'; paintFoot(); return; }
    S.err = ''; S.listening = true; paintFoot();
    if (S.ready) openRec();
  }
  function killRec() {
    clearTimeout(restartT);
    if (rec) { var r = rec; rec = null; try { r.abort(); } catch (e) {} }
  }
  function stopListen() { S.listening = false; killRec(); }
  function openRec() {
    var R = engine(), r;
    if (!R) return;
    killRec();
    if (S.carryDead) { S.carry = ''; S.carryDead = false; }
    S.sWi0 = S.wi; S.used = 0;
    try { r = new R(); } catch (e) { S.listening = false; S.err = 'نەتوانرا مایکرۆفۆن بکرێتەوە.'; paintFoot(); return; }
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
      if (c === 'not-allowed' || c === 'service-not-allowed') { stopListen(); S.err = 'مۆڵەتی مایکرۆفۆن نەدراوە. لە ڕێکخستنی وێبگەڕ مۆڵەت بدە.'; paintFoot(); }
      else if (c === 'audio-capture') { stopListen(); S.err = 'مایکرۆفۆن نەدۆزرایەوە.'; paintFoot(); }
      else if (c === 'network') { stopListen(); S.err = 'ناسینەوەی دەنگ پێویستی بە ئینتەرنێت هەیە.'; paintFoot(); }
    };
    r.onend = function () {
      if (rec !== r) return;
      clearTimeout(restartT);
      restartT = setTimeout(function () { if (S.listening && S.ready && S.view === 'run') openRec(); }, 120);
    };
    try { r.start(); } catch (e2) { S.listening = false; S.err = 'نەتوانرا مایکرۆفۆن بکرێتەوە.'; paintFoot(); }
  }

  function onSpeech(alts, fin) {
    if (!S.listening || !S.ready || !S.items.length || S.wi >= S.items.length) return;
    var best = null, bestSt = '', i, st, r;
    for (i = 0; i < alts.length; i++) {
      st = S.carry + nstr(alts[i]);
      r = fin ? runAlign(st, S.sWi0) : runAlign(st.slice(S.used), S.wi);
      if (!best || r.k > best.k || (r.k === best.k && r.left < best.left)) { best = r; bestSt = st; }
    }
    S.said = String(alts[0]).trim();
    var already = S.wi - S.sWi0, add = fin ? best.k - already : best.k;
    if (add > 0) {
      accept(add);
      if (!fin) S.used += best.used;
    }
    /* no verdict while the person is still speaking */
    if (!fin) { if (add > 0) paintFoot(); else paintSaid(); return; }
    S.carry = ''; S.carryDead = false;
    if (S.wi >= S.items.length || best.k < already) { paintFoot(); return; }
    var left = bestSt.slice(best.used);
    if (left.length < 3) { paintFoot(); return; }
    var exp = S.items[S.wi].exp;
    /* a pause in the middle of an ayah: keep what was said and wait for the rest */
    if (left.length < 0.8 * exp.length && sim(left, exp.slice(0, left.length)) >= 0.9) { S.carry = left; S.msg = 'درێژە بدە…'; S.kind = 'info'; paintFoot(); return; }
    wrong();
  }
  function accept(k) {
    for (var i = 0; i < k && S.wi < S.items.length; i++) { show(S.items[S.wi], false); S.ok++; S.wi++; }
    S.carryDead = true; S.msg = '✓ ڕاستە'; S.kind = 'ok';
    if (S.wi >= S.items.length) pageDone(); else nextInView();
  }
  /* the ayah was not right: it is not written, only its place on the page flashes */
  function wrong() {
    var it = S.items[S.wi];
    if (!it) return;
    S.bad++;
    it.spans.forEach(function (sp) { sp.classList.add('er'); });
    setTimeout(function () { it.spans.forEach(function (sp) { sp.classList.remove('er'); }); }, 1800);
    S.msg = '✗ هەڵەیە، ئایەتی ' + toAr(it.ayah) + ' نەنووسرایەوە. دووبارە بیخوێنەوە.'; S.kind = 'bad';
    try { if (navigator.vibrate) navigator.vibrate(80); } catch (e) {}
    paintFoot();
  }
  function pageDone() {
    S.msg = '✓ لاپەڕە تەواو بوو'; S.kind = 'ok';
    paintFoot();
    if (S.page >= 604) { stopListen(); paintFoot(); return; }
    clearTimeout(S.pageDoneT);
    S.pageDoneT = setTimeout(function () { if (S.view === 'run') loadPage(S.page + 1); }, 900);
  }

  /* help: the first words of the ayah, or the whole ayah; shown with a red line so it does not count as remembered */
  function help(all) {
    if (!S.ready || S.wi >= S.items.length) return;
    var it = S.items[S.wi];
    S.hint++;
    S.carry = ''; S.carryDead = false;
    if (!all) {
      it.spans.slice(0, 2).forEach(function (sp) { sp.classList.remove('hz', 'er'); sp.classList.add('rv', 'hp'); });
      paintFoot();
      return;
    }
    show(it, true); S.wi++;
    S.msg = ''; S.kind = '';
    if (S.wi >= S.items.length) pageDone(); else { nextInView(); paintFoot(); }
    if (S.listening) openRec();
  }

  /* ---------- UI ---------- */
  function injectCss() {
    if ($('hifzPageCss')) return;
    var s = document.createElement('style');
    s.id = 'hifzPageCss';
    s.textContent = [
      'body:has(#hifzPageView.active) .top{display:none!important}',
      '.phone:has(#hifzPageView.active) .status,.phone:has(#hifzPageView.active) .appbar,.phone:has(#hifzPageView.active) .bottom{display:none!important}',
      '.phone:has(#hifzPageView.active) .main{height:100%!important;padding:0!important;background:#f3f1ea}',
      '#hifzPageView{display:none!important}',
      '#hifzPageView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;box-sizing:border-box}',
      '#hifzPageView .hp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;padding-top:calc(10px + env(safe-area-inset-top));background:linear-gradient(145deg,#17364f,#24597a);color:#fff;flex-shrink:0}',
      '#hifzPageView .hp-head h2{margin:0;font-size:16px;font-weight:800}',
      '#hifzPageView .hp-head small{display:block;font-size:11px;opacity:.85;margin-top:2px}',
      '#hifzPageView .hp-btn{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:8px 11px;font:inherit;font-size:12px;cursor:pointer}',
      '#hifzPageView .hp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px calc(20px + env(safe-area-inset-bottom))}',
      '#hifzPageView .hp-card{background:#fff;border:1px solid #d9e0e6;border-radius:14px;padding:13px 14px;margin-bottom:11px}',
      '#hifzPageView .hp-card h3{margin:0 0 8px;font-size:14px;color:#17364f}',
      '#hifzPageView label{display:block;font-size:12px;color:#5b6b76;margin:9px 0 4px;font-weight:700}',
      '#hifzPageView select,#hifzPageView input[type=number]{width:100%;box-sizing:border-box;border:1px solid #cdd7de;border-radius:10px;padding:10px;font:inherit;font-size:15px;background:#fff}',
      '#hifzPageView .hp-row{display:flex;gap:8px}',
      '#hifzPageView .hp-row>div{flex:1}',
      '#hifzPageView .hp-chips{display:flex;gap:6px}',
      '#hifzPageView .hp-chip{flex:1;border:1px solid #cdd7de;background:#fff;border-radius:10px;padding:9px 4px;font:inherit;font-size:13px;cursor:pointer;color:#17364f}',
      '#hifzPageView .hp-chip.on{background:#24597a;color:#fff;border-color:#24597a}',
      '#hifzPageView .hp-go{width:100%;border:0;border-radius:13px;padding:14px;margin-top:12px;font:inherit;font-size:16px;font-weight:800;background:#24597a;color:#fff;cursor:pointer}',
      '#hifzPageView .hp-note{font-size:12px;line-height:1.9;color:#5b6b76}',
      '#hifzPageView .hp-hist{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid #eef1f3;font-size:13px;color:#2a3a45}',
      '#hifzPageView .hp-frame{flex:1;min-height:0;width:100%;border:0;background:#fffdf5}',
      '#hifzPageView .hp-foot{flex-shrink:0;background:#f3f1ea;border-top:1px solid #d9d2b8;padding:6px 12px calc(8px + env(safe-area-inset-bottom))}',
      '#hifzPageView .hp-said{min-height:18px;font-size:13px;color:#5b6b76;direction:rtl;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '#hifzPageView .hp-msg{min-height:20px;font-size:13px;font-weight:700;text-align:center;color:#24597a}',
      '#hifzPageView .hp-msg.bad,#hifzPageView .hp-msg.err{color:#b5483a}',
      '#hifzPageView .hp-msg.ok{color:#2e8b68}',
      '#hifzPageView .hp-msg.err{font-weight:600;line-height:1.7}',
      '#hifzPageView .hp-ctl{display:flex;align-items:center;justify-content:center;gap:18px;margin:2px 0}',
      '#hifzPageView .hp-sm{width:56px;height:46px;border:1px solid #cdd7de;background:#fff;border-radius:12px;font-size:18px;line-height:1.1;cursor:pointer;color:#17364f}',
      '#hifzPageView .hp-sm small{display:block;font-size:10px;color:#5b6b76}',
      '#hifzPageView .hp-mic{width:68px;height:68px;border:0;border-radius:50%;background:#24597a;color:#fff;font-size:28px;cursor:pointer;box-shadow:0 5px 14px #24597a55}',
      '#hifzPageView .hp-mic.on{background:#c0392b;animation:hpPulse 1.4s infinite}',
      '@keyframes hpPulse{0%{box-shadow:0 0 0 0 #c0392b88}70%{box-shadow:0 0 0 16px #c0392b00}100%{box-shadow:0 0 0 0 #c0392b00}}',
      '@media(prefers-reduced-motion:reduce){#hifzPageView .hp-mic.on{animation:none}}',
      '#hifzPageView .hp-stats{display:flex;justify-content:space-around;font-size:12px;color:#2a3a45;margin-top:2px}',
      '#hifzPageView .hp-tools{display:flex;gap:8px;margin-bottom:10px;align-items:center}',
      '#hifzPageView .hp-tools .hp-in{flex:1;min-width:0;width:auto;border:1px solid #cdd7de;border-radius:10px;padding:10px;font:inherit;font-size:15px;background:#fff;box-sizing:border-box}',
      '#hifzPageView .hp-tools .hp-pgin{flex:0 0 84px;width:84px}',
      '#hifzPageView .hp-gobtn{flex:0 0 auto;padding:10px 14px}',
      '#hifzPageView .hp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}',
      '#hifzPageView .hp-sura{display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid #d9e0e6;background:#fff;border-radius:14px;padding:12px 6px;font:inherit;cursor:pointer;color:#17364f}',
      '#hifzPageView .hp-sura b{font-size:12px;color:#6f5720}',
      '#hifzPageView .hp-sura span{font-size:21px;font-weight:800;font-family:"Amiri","Noto Naskh Arabic",serif}',
      '#hifzPageView .hp-sura small{font-size:11px;color:#5b6b76}',
      '#hifzPageView .hp-lvs{display:flex;gap:6px;justify-content:center;margin-bottom:4px}',
      '#hifzPageView .hp-lvl{border:1px solid #cdd7de;background:#fff;border-radius:14px;padding:4px 14px;font:inherit;font-size:12px;cursor:pointer;color:#17364f}',
      '#hifzPageView .hp-lvl.on{background:#24597a;color:#fff;border-color:#24597a}',
      '.section-choice.hifzpage-choice{border-color:#c6d5e3;background:linear-gradient(135deg,#fff,#edf3f9)}',
      '.section-choice.hifzpage-choice .choice-icon{background:#d6e3f0;color:#24597a}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('hifzPageView');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'hifzPageView'; v.className = 'view';
    main.appendChild(v);
    v.addEventListener('click', onClick);
    v.addEventListener('input', function (e) { if (e.target && e.target.id === 'hpQ') { S.q = e.target.value; paintGrid(); } });
    return v;
  }

  function homeHtml() {
    var hist = P.hist.length ? P.hist.map(function (h) {
      return '<div class="hp-hist"><span>لاپەڕە ' + toAr(h.p1) + (h.p2 !== h.p1 ? '–' + toAr(h.p2) : '') + '</span><span>✓' + toAr(h.ok) + ' ✗' + toAr(h.bad) + ' 💡' + toAr(h.hint) + '</span><span>' + new Date(h.t).toLocaleDateString() + '</span></div>';
    }).join('') : '<div class="hp-note">هێشتا هیچ پشکنینێکت نەکردووە.</div>';
    return '<div class="hp-head"><div><h2>لەبەرکردن لەسەر لاپەڕە</h2><small>سورەتێک هەڵبژێرە، یەکسەر لاپەڕەکەی دەکرێتەوە</small></div><button type="button" class="hp-btn" data-act="exit">بەشەکان</button></div>' +
      '<div class="hp-body">' +
      '<div class="hp-tools"><input id="hpQ" class="hp-in" type="search" placeholder="گەڕان بە ناو یان ژمارە…" value="' + esc(S.q || '') + '">' +
      '<input id="hpPage" class="hp-in hp-pgin" type="number" min="1" max="604" inputmode="numeric" placeholder="لاپەڕە">' +
      '<button type="button" class="hp-chip on hp-gobtn" data-act="page">بڕۆ</button></div>' +
      '<div class="hp-grid" id="hpGrid"></div>' +
      '<div class="hp-card"><h3>پشکنینە پێشووەکان</h3>' + hist + '</div></div>';
  }
  function paintGrid() {
    var g = $('hpGrid');
    if (!g) return;
    var q = nstr(S.q || ''), qn = parseInt(S.q, 10), sl = SL(), o = '', n;
    for (n = 1; n <= sl.length; n++) {
      if (S.q) { if (qn) { if (n !== qn) continue; } else if (nstr(sl[n - 1][0]).indexOf(q) < 0) continue; }
      o += '<button type="button" class="hp-sura" data-act="open" data-n="' + n + '"><b>' + toAr(n) + '</b><span>' + esc(sl[n - 1][0]) + '</span><small>' + toAr(sl[n - 1][2]) + ' ئایەت · لاپەڕە ' + toAr(sl[n - 1][3]) + '</small></button>';
    }
    g.innerHTML = o || '<div class="hp-note">هیچ نەدۆزرایەوە.</div>';
  }

  function runHtml() {
    return '<div class="hp-head"><div><h2>لاپەڕەی <span id="hpPg">' + toAr(S.page) + '</span></h2></div>' +
      '<div style="display:flex;gap:6px"><button type="button" class="hp-btn" data-act="np" aria-label="پێشتر">›</button><button type="button" class="hp-btn" data-act="pp" aria-label="دواتر">‹</button>' +
      '<button type="button" class="hp-btn" data-act="home">گەڕانەوە</button></div></div>' +
      '<iframe id="hpFrame" class="hp-frame" title="موسحەف" style="visibility:hidden"></iframe>' +
      '<div class="hp-foot" id="hpFoot"></div>';
  }

  function paintFoot() {
    var f = $('hpFoot');
    if (!f) return;
    var msg = S.err || (S.loading ? 'لاپەڕە بار دەکرێت…' : S.msg), kind = S.err ? 'err' : S.kind;
    var lv = LEVELS.map(function (l, k) { return '<button type="button" class="hp-lvl' + (k === P.level ? ' on' : '') + '" data-lv="' + k + '">' + l[0] + '</button>'; }).join('');
    f.innerHTML = '<div class="hp-lvs">' + lv + '</div><div class="hp-said" id="hpSaid">' + esc(S.said) + '</div>' +
      '<div class="hp-msg ' + esc(kind) + '">' + esc(msg) + '</div>' +
      '<div class="hp-ctl"><button type="button" class="hp-sm" data-act="hint">💡<small>ئاماژە</small></button>' +
      '<button type="button" class="hp-mic' + (S.listening ? ' on' : '') + '" data-act="mic" aria-label="مایکرۆفۆن">' + (S.listening ? '■' : '🎤') + '</button>' +
      '<button type="button" class="hp-sm" data-act="reveal">👁<small>ئایەتەکە</small></button></div>' +
      '<div class="hp-stats"><span>✓ ' + toAr(S.ok) + '</span><span>✗ ' + toAr(S.bad) + '</span><span>💡 ' + toAr(S.hint) + '</span></div>';
  }
  function paintSaid() { var e = $('hpSaid'); if (e) e.textContent = S.said; }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    v.innerHTML = S.view === 'run' ? runHtml() : homeHtml();
    frame = S.view === 'run' ? $('hpFrame') : null;
    if (S.view !== 'run') paintGrid();
  }

  /* ---------- events ---------- */
  function beginAt(pg) {
    P.page = clamp(+pg || 1, 1, 604); savePrefs();
    S = freshState();
    S.view = 'run'; S.page = P.page; S.startPage = P.page;
    render();
    loadPage(P.page);
  }
  function openSura(n) {
    var x = SL()[n - 1];
    P.sura = n;
    beginAt(x ? +x[3] : 1);
  }
  function saveHistory() {
    if (S.ok + S.bad + S.hint === 0) return;
    P.hist.unshift({ t: Date.now(), p1: S.startPage, p2: S.page, ok: S.ok, bad: S.bad, hint: S.hint });
    P.hist = P.hist.slice(0, 12);
    savePrefs();
  }
  function toHome() {
    stopListen(); clearTimeout(S.pageDoneT); loadId++;
    saveHistory();
    var q = S.q;
    S = freshState();
    S.q = q;
    render();
  }
  function onClick(e) {
    var el = e.target.closest ? e.target.closest('[data-act],[data-lv]') : null;
    if (!el) return;
    var lv = el.getAttribute('data-lv');
    if (lv !== null) { P.level = +lv; savePrefs(); if (S.view === 'run') paintFoot(); return; }
    var act = el.getAttribute('data-act');
    if (act === 'exit') { leave(); return; }
    if (act === 'home') { toHome(); return; }
    if (act === 'open') { openSura(+el.getAttribute('data-n')); return; }
    if (act === 'page') { var pn = parseInt(($('hpPage') || {}).value, 10); if (pn >= 1 && pn <= 604) beginAt(pn); return; }
    if (S.view !== 'run') return;
    if (act === 'mic') { if (S.listening) { stopListen(); paintFoot(); } else startListen(); return; }
    if (act === 'hint') { help(false); return; }
    if (act === 'reveal') { help(true); return; }
    if (act === 'np') { clearTimeout(S.pageDoneT); loadPage(S.page - 1); return; }
    if (act === 'pp') { clearTimeout(S.pageDoneT); loadPage(S.page + 1); return; }
  }
  function leave() {
    if (S.view === 'run') toHome(); else stopListen();
    var v = $('hifzPageView');
    if (v) v.classList.remove('active');
    if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
  }

  window.enterHifzPage = function () {
    injectCss();
    if (!ensureView()) return;
    S = freshState();
    if (typeof showView === 'function') showView('hifzPageView', 'لەبەرکردن لەسەر لاپەڕە');
    render();
  };

  /* ---------- start-screen card (right after the zikr card) ---------- */
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (box.querySelector('.hifzpage-choice')) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice hifzpage-choice';
    b.innerHTML = '<span class="choice-icon">🎙</span><span class="choice-copy"><b>لەبەرکردن لەسەر لاپەڕە</b><small>لاپەڕەی موسحەف بێ ئایەت، بە دەنگ پڕی بکەرەوە</small></span><span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterHifzPage(); };
    var z = box.querySelector('.hifz-choice') || box.querySelector('.zikr-choice');
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
    window.__HIFZ_TEST = {
      nstr: nstr, sim: sim, align: align, runAlign: runAlign, onSpeech: onSpeech, buildItems: buildItems, tokens: tokens,
      S: function () { return S; }, setS: function (x) { S = x; }, freshState: freshState, TEXT: TEXT, P: P, setLevel: function (l) { P.level = l; }
    };
  }
})();
