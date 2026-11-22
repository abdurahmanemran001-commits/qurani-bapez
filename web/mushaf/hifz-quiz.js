/* hifz-quiz.js v2 — پرسیار و وەڵام: pick a surah (+ question count & seconds); each ayah is read aloud, then a smooth countdown ring and 4 shuffled choices.
 * "missing word" questions stop the recitation right before the hidden word so it is never read out. */
(function () {
  if (window.hifzQuiz) return;
  var D = function () { return window.__hifzData; };
  var T = {
    ckb: { title: 'پرسیار و وەڵام', pick: 'سورەتێک هەڵبژێرە', q: 'پرسیار', next: 'ئایەتی دواتر کامەیە؟', num: 'ئەم ئایەتە ژمارەی چەندە؟', miss: 'وشەی ون کامەیە؟', hear: 'گوێ بگرە…', replay: 'دووبارە', ok: 'ڕاستە!', bad: 'هەڵەیە', late: 'کات تەواو بوو', score: 'ئەنجام', again: 'دووبارە', close: 'داخستن', streak: 'زنجیرە', noaudio: 'دەنگ بەردەست نییە (ئینتەرنێت)', fin: 'ماشاءاللە!', fail: 'سورەتەکە بار نەبوو', cnt: 'ژمارەی پرسیار', sec: 'کات بۆ هەر پرسیارێک (چرکە)', all: 'هەموو', acc: 'ڕێژەی دروست', avg: 'تێکڕای کات', review: 'پێداچوونەوە بە هەڵەکان', other: 'سورەتی تر', sc: 'چرکە', stars: 'پلەکەت', perfect: 'بێ هەڵە!', good: 'زۆر باشە', keep: 'بەردەوام بە', lastW: 'وشەی ون لە ئایەتەکەدا بوو' },
    en: { title: 'Quiz', pick: 'Choose a surah', q: 'Question', next: 'Which ayah comes next?', num: 'What is this ayah\'s number?', miss: 'Which word is missing?', hear: 'Listen…', replay: 'Replay', ok: 'Correct!', bad: 'Wrong', late: 'Time is up', score: 'Score', again: 'Again', close: 'Close', streak: 'Streak', noaudio: 'Audio unavailable (internet)', fin: 'Mashallah!', fail: 'Could not load the surah', cnt: 'Number of questions', sec: 'Seconds per question', all: 'All', acc: 'Accuracy', avg: 'Avg. time', review: 'Review mistakes', other: 'Other surah', sc: 's', stars: 'Your rating', perfect: 'Perfect!', good: 'Great job', keep: 'Keep going', lastW: 'The missing word was in the ayah' },
    ar: { title: 'أسئلة واختيارات', pick: 'اختر سورة', q: 'سؤال', next: 'ما الآية التالية؟', num: 'ما رقم هذه الآية؟', miss: 'ما الكلمة الناقصة؟', hear: 'استمع…', replay: 'إعادة', ok: 'صحيح!', bad: 'خطأ', late: 'انتهى الوقت', score: 'النتيجة', again: 'إعادة', close: 'إغلاق', streak: 'التتالي', noaudio: 'الصوت غير متاح (إنترنت)', fin: 'ما شاء الله!', fail: 'تعذّر تحميل السورة', cnt: 'عدد الأسئلة', sec: 'الثواني لكل سؤال', all: 'الكل', acc: 'الدقة', avg: 'متوسط الوقت', review: 'مراجعة الأخطاء', other: 'سورة أخرى', sc: 'ث', stars: 'تقييمك', perfect: 'ممتاز!', good: 'أحسنت', keep: 'واصل', lastW: 'الكلمة الناقصة كانت في الآية' }
  };
  var Q = null, raf = 0, au = null, CFG = { cnt: 10, sec: 20 }, snd = null;
  try { var _c = JSON.parse(localStorage.getItem('hifz_quiz_cfg') || '{}'); if (_c.cnt >= 0) CFG.cnt = _c.cnt; if (_c.sec > 0) CFG.sec = _c.sec; } catch (e) {}
  function saveCfg() { try { localStorage.setItem('hifz_quiz_cfg', JSON.stringify(CFG)); } catch (e) {} }
  function L() { var l = D().lang(); return T[l] || T.en; }
  function $(i) { return document.getElementById(i); }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad(n, w) { return ('000' + n).slice(-w); }
  function reciter() { try { var r = JSON.parse(localStorage.getItem('hifz_read_v1') || '{}').rec; if (r && /^[\w\-.]+$/.test(r)) return r; } catch (e) {} return 'Alafasy_128kbps'; }
  /* tiny sound effects (Web Audio, no files) */
  function beep(good) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; snd = snd || new AC(); if (snd.state === 'suspended') snd.resume();
      var now = snd.currentTime;
      (good ? [659.25, 880] : [220, 165]).forEach(function (f, i) { var o = snd.createOscillator(), g = snd.createGain(); o.type = good ? 'sine' : 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, now + i * .12); g.gain.linearRampToValueAtTime(.13, now + i * .12 + .01); g.gain.exponentialRampToValueAtTime(.001, now + i * .12 + .5); o.connect(g); g.connect(snd.destination); o.start(now + i * .12); o.stop(now + i * .12 + .6); });
    } catch (e) {}
  }
  function css() {
    if ($('hqCss')) return;
    var s = document.createElement('style'); s.id = 'hqCss';
    s.textContent =
      '#hqView{position:fixed;inset:0;z-index:120;overflow:auto;color:#f6f0de;background:radial-gradient(120% 70% at 50% -10%,#14614a 0,#0b3a2d 45%,#06201a 100%);padding:14px 14px 44px;font-family:inherit}#hqView[hidden]{display:none}' +
      '#hqView .w{max-width:560px;margin:0 auto}.hq-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px}' +
      '.hq-b{border:1px solid rgba(230,196,111,.35);background:rgba(255,255,255,.07);color:#f6f0de;border-radius:14px;padding:9px 14px;font:inherit;font-size:14px;cursor:pointer;backdrop-filter:blur(6px)}.hq-b.gold{background:linear-gradient(135deg,#e6c46f,#b8924a);color:#2a1d05;border:0;font-weight:700}' +
      '.hq-pill{display:inline-flex;align-items:center;gap:6px;border-radius:30px;padding:7px 13px;background:rgba(255,255,255,.08);border:1px solid rgba(230,196,111,.22);font-size:14px}' +
      '.hq-h{color:#e6c46f;text-align:center;margin:8px 0 14px;font-size:24px}.hq-sub{text-align:center;color:#cfc8b2;margin:-6px 0 14px;font-size:14px}' +
      '.hq-set{background:rgba(255,255,255,.05);border:1px solid rgba(230,196,111,.2);border-radius:18px;padding:12px;margin-bottom:12px}.hq-set b{display:block;font-size:13px;color:#e6c46f;margin-bottom:8px}.hq-row{display:flex;gap:8px;flex-wrap:wrap}' +
      '.hq-ch{border:1px solid rgba(230,196,111,.3);background:rgba(255,255,255,.05);color:#f6f0de;border-radius:30px;padding:7px 16px;font:inherit;cursor:pointer}.hq-ch.on{background:linear-gradient(135deg,#e6c46f,#b8924a);color:#2a1d05;border:0;font-weight:700}' +
      '.hq-in{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(230,196,111,.28);border-radius:16px;color:#f6f0de;padding:11px 14px;font:inherit;margin-bottom:12px}' +
      '.hq-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:9px}.hq-c{border:1px solid rgba(230,196,111,.26);background:rgba(255,255,255,.06);color:#f6f0de;border-radius:16px;padding:12px 8px;font:inherit;cursor:pointer;text-align:center;transition:transform .15s}.hq-c:active{transform:scale(.97)}.hq-c small{display:block;color:#cfc8b2;margin-top:3px;font-size:12px}' +
      '.hq-prog{display:flex;gap:3px;margin:2px 0 12px}.hq-prog i{flex:1;height:5px;border-radius:5px;background:rgba(255,255,255,.14)}.hq-prog i.ok{background:#4ad489}.hq-prog i.no{background:#f06a6a}.hq-prog i.cur{background:#e6c46f}' +
      '.hq-ringw{position:relative;width:92px;height:92px;margin:2px auto 10px}.hq-ringw svg{width:100%;height:100%;transform:rotate(-90deg)}.hq-ringw .bg{stroke:rgba(255,255,255,.12)}.hq-ringw .fg{stroke:#e6c46f;stroke-linecap:round;transition:stroke .3s}.hq-ringw.low .fg{stroke:#ff6b6b}.hq-ringw.low{animation:hqPulse .9s infinite}' +
      '.hq-ringw .n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:30px;font-weight:800;line-height:1}.hq-ringw .n small{font-size:11px;font-weight:400;color:#cfc8b2}' +
      '@keyframes hqPulse{50%{transform:scale(1.06)}}@keyframes hqIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes hqShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}' +
      '.hq-q{display:flex;justify-content:center;margin:4px 0 10px}.hq-q span{background:rgba(230,196,111,.14);color:#e6c46f;border:1px solid rgba(230,196,111,.35);border-radius:30px;padding:6px 16px;font-weight:700;font-size:14px}' +
      '.hq-ay{position:relative;direction:rtl;text-align:center;font-family:Amiri,"Noto Naskh Arabic",serif;font-size:27px;line-height:2.1;border:1.5px solid rgba(230,196,111,.4);border-radius:22px;padding:18px 14px;margin:8px 0 6px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));box-shadow:0 8px 24px rgba(0,0,0,.25),inset 0 0 0 4px rgba(6,32,26,.5);animation:hqIn .35s}' +
      '.hq-r{text-align:center;min-height:24px;margin:8px 0;font-weight:700}.hq-r.ok{color:#5be39a}.hq-r.no{color:#ff8a8a}' +
      '.hq-o{display:flex;align-items:center;gap:12px;width:100%;margin:9px 0;border:1.5px solid rgba(230,196,111,.3);background:rgba(255,255,255,.07);color:#f6f0de;border-radius:18px;padding:12px 14px;font-family:Amiri,"Noto Naskh Arabic",serif;font-size:22px;cursor:pointer;transition:transform .12s,background .2s;animation:hqIn .35s backwards}.hq-o:active{transform:scale(.985)}.hq-o:disabled{opacity:.55;cursor:default}' +
      '.hq-o .l{flex:none;width:32px;height:32px;border-radius:10px;background:rgba(230,196,111,.18);color:#e6c46f;display:flex;align-items:center;justify-content:center;font:700 15px system-ui}.hq-o .t{flex:1;direction:rtl;text-align:center;line-height:1.6}' +
      '.hq-o.ok{background:rgba(74,212,137,.22);border-color:#4ad489;opacity:1}.hq-o.ok .l{background:#4ad489;color:#06201a}.hq-o.no{background:rgba(240,106,106,.2);border-color:#f06a6a;opacity:1;animation:hqShake .35s}.hq-o.no .l{background:#f06a6a;color:#2a0808}' +
      '.hq-st{display:flex;gap:10px;margin:14px 0}.hq-st div{flex:1;text-align:center;border:1px solid rgba(230,196,111,.26);background:rgba(255,255,255,.06);border-radius:16px;padding:12px 4px;font-size:12px;color:#cfc8b2}.hq-st b{display:block;font-size:22px;color:#f6f0de;margin-bottom:2px}' +
      '.hq-big{position:relative;width:150px;height:150px;margin:6px auto}.hq-big svg{width:100%;height:100%;transform:rotate(-90deg)}.hq-big .n{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:36px;font-weight:800}.hq-stars{text-align:center;font-size:30px;letter-spacing:6px;margin:4px 0 8px}';
    document.head.appendChild(s);
  }
  function view() {
    var v = $('hqView'); if (v) return v;
    v = document.createElement('div'); v.id = 'hqView'; v.hidden = true;
    v.setAttribute('data-no-translate', '1'); v.setAttribute('data-keep-ar', '1');
    document.body.appendChild(v); v.addEventListener('click', click); return v;
  }
  function stopAll() { cancelAnimationFrame(raf); raf = 0; try { if (au) { au.onended = au.ontimeupdate = au.onerror = null; au.pause(); au = null; } } catch (e) {} }
  function close() { stopAll(); view().hidden = true; }
  function chips(key, vals, labels) { return '<div class="hq-row">' + vals.map(function (v, i) { return '<button type="button" class="hq-ch' + (CFG[key] === v ? ' on' : '') + '" data-act="cfg" data-k="' + key + '" data-v="' + v + '">' + labels[i] + '</button>'; }).join('') + '</div>'; }
  function pickScreen() {
    stopAll();
    var d = D(), t = L(), v = view(), o = '', n;
    v.dir = d.rtl() ? 'rtl' : 'ltr'; v.hidden = false;
    for (n = 1; n <= 114; n++) o += '<button type="button" class="hq-c" data-act="sura" data-n="' + n + '" data-nm="' + d.esc(d.nw(d.sname(n))) + '">' + d.esc(d.sname(n)) + '<small>' + d.num(n) + ' · ' + d.num(d.cnt(n)) + '</small></button>';
    v.innerHTML = '<div class="w"><div class="hq-top"><button type="button" class="hq-b" data-act="close">‹ ' + t.close + '</button></div><h2 class="hq-h">❓ ' + t.title + '</h2>' +
      '<div class="hq-set"><b>' + t.cnt + '</b>' + chips('cnt', [5, 10, 20, 0], [d.num(5), d.num(10), d.num(20), t.all]) + '</div>' +
      '<div class="hq-set"><b>' + t.sec + '</b>' + chips('sec', [10, 15, 20, 30], [d.num(10), d.num(15), d.num(20), d.num(30)]) + '</div>' +
      '<p class="hq-sub">' + t.pick + '</p><input id="hqS" class="hq-in" type="search" placeholder="🔎"><div class="hq-list" id="hqL">' + o + '</div></div>';
    $('hqS').addEventListener('input', function () {
      var q = d.nw(this.value), k = parseInt(this.value, 10), val = this.value;
      Array.prototype.forEach.call(document.querySelectorAll('#hqL .hq-c'), function (b) { b.style.display = (!val || (k ? +b.getAttribute('data-n') === k : b.getAttribute('data-nm').indexOf(q) >= 0)) ? '' : 'none'; });
    });
  }
  var FILL = ['الله', 'الذين', 'قال', 'ربك', 'يوم', 'الارض', 'عليهم', 'كانوا', 'الناس', 'السماء', 'الحق', 'نفس'];
  function build(n) {
    var d = D(), tx = d.TEXT[n], c = d.cnt(n), qs = [], a, i;
    var pool = {};
    tx.forEach(function (t) { String(t).split(/\s+/).forEach(function (w) { var k = d.nw(w); if (k && k.length > 2) pool[k] = w; }); });
    var poolK = Object.keys(pool);
    for (a = 1; a <= c; a++) {
      var kinds = ['num', 'miss'];
      if (c >= 5 && a < c) kinds.push('next');
      var kind = kinds[Math.floor(Math.random() * kinds.length)], text = tx[a - 1], q = { a: a, kind: kind, text: text };
      if (kind === 'num') {
        var set = {}; set[a] = 1; var tries = 0;
        while (Object.keys(set).length < Math.min(4, c) && tries++ < 50) set[1 + Math.floor(Math.random() * c)] = 1;
        var x = c + 1; while (Object.keys(set).length < 4) set[x++] = 1;
        q.opts = shuf(Object.keys(set).map(function (k) { return { v: d.num(k), ok: +k === a }; }));
      } else if (kind === 'miss') {
        var ws = String(text).split(/\s+/), idx = [];
        ws.forEach(function (w, k) { if (d.nw(w).length > 2) idx.push(k); });
        if (!idx.length) idx = ws.map(function (w, k) { return k; });
        var bi = idx[Math.floor(Math.random() * idx.length)], right = ws[bi], rk = d.nw(right);
        var ds = shuf(poolK.filter(function (k) { return k !== rk; })).slice(0, 3).map(function (k) { return pool[k]; });
        var f = 0; while (ds.length < 3) { var w2 = FILL[f++ % FILL.length]; if (d.nw(w2) !== rk && ds.indexOf(w2) < 0) ds.push(w2); if (f > 40) break; }
        q.bi = bi; q.blank = ws.map(function (w, k) { return k === bi ? '＿＿＿' : w; }).join(' ');
        q.opts = shuf([{ v: right, ok: true }].concat(ds.map(function (w) { return { v: w, ok: false }; })));
      } else {
        var right2 = tx[a], others = shuf(tx.map(function (t, k) { return k; }).filter(function (k) { return k !== a && k !== a - 1; })).slice(0, 3);
        q.opts = shuf([{ v: right2, ok: true }].concat(others.map(function (k) { return { v: tx[k], ok: false }; })));
      }
      qs.push(q);
    }
    return shuf(qs);
  }
  function startQuiz(n) {
    var d = D(), v = view();
    v.innerHTML = '<div class="hq-h">…</div>';
    d.ensureSura(n).then(function (ok) {
      if (!ok) { v.innerHTML = '<div class="w"><div class="hq-top"><button type="button" class="hq-b" data-act="pick">‹</button></div><p class="hq-h">' + L().fail + '</p></div>'; return; }
      var qs = build(n); if (CFG.cnt > 0) qs = qs.slice(0, CFG.cnt);
      Q = { n: n, qs: qs, i: 0, score: 0, streak: 0, best: 0, wrong: [], res: [], times: [], done: false };
      ask();
    });
  }
  /* recitation: for "missing word" questions it stops just before the hidden word (never read aloud) */
  function play(q, cb) {
    var called = false; function fin(ok) { if (called) return; called = true; cb(ok); }
    try {
      if (au) { au.onended = au.ontimeupdate = au.onerror = null; au.pause(); }
      var a = au = document.createElement('audio'); a.preload = 'auto';
      a.src = 'https://everyayah.com/data/' + reciter() + '/' + pad(Q.n, 3) + pad(q.a, 3) + '.mp3';
      var cut = null;
      if (q.kind === 'miss' && q.bi != null) {
        if (q.bi === 0) { return fin(true); }
        var lens = String(q.text).split(/\s+/).map(function (w) { return Math.max(2, w.replace(/[ً-ٰٟۖ-ۭ]/g, '').length); }), tot = lens.reduce(function (x, y) { return x + y; }, 0), pre = 0, i;
        for (i = 0; i < q.bi; i++) pre += lens[i];
        cut = pre / tot;
      }
      a.ontimeupdate = function () {
        if (cut == null || !a.duration || !isFinite(a.duration)) return;
        var stopAt = 0.12 + cut * (a.duration - 0.4) - 0.28;
        if (a.currentTime >= stopAt) { a.ontimeupdate = null; a.pause(); fin(true); }
      };
      a.onended = function () { fin(true); };
      a.onerror = function () { fin(false); };
      var p = a.play(); if (p && p.catch) p.catch(function () { fin(false); });
    } catch (e) { fin(false); }
  }
  function ringSvg() { return '<svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="44" fill="none" stroke-width="8"/><circle class="fg" id="hqFg" cx="50" cy="50" r="44" fill="none" stroke-width="8" stroke-dasharray="276.46" stroke-dashoffset="0"/></svg>'; }
  function ask() {
    var d = D(), t = L(), v = view(), q = Q.qs[Q.i]; if (!q) return end();
    q.locked = false; stopAll();
    var title = q.kind === 'num' ? t.num : q.kind === 'miss' ? t.miss : t.next;
    var shown = q.kind === 'miss' ? q.blank : q.kind === 'next' ? q.text : '🔊';
    var prog = Q.qs.map(function (x, k) { return '<i class="' + (Q.res[k] === 1 ? 'ok' : Q.res[k] === 0 ? 'no' : k === Q.i ? 'cur' : '') + '"></i>'; }).join('');
    var LET = ['١', '٢', '٣', '٤'];
    v.innerHTML = '<div class="w"><div class="hq-top"><button type="button" class="hq-b" data-act="pick">‹ ' + d.esc(d.sname(Q.n)) + '</button><span class="hq-pill">⭐ ' + d.num(Q.score) + (Q.streak > 1 ? ' · 🔥 ' + d.num(Q.streak) : '') + '</span></div>' +
      '<div class="hq-prog">' + prog + '</div><div class="hq-ringw" id="hqRing">' + ringSvg() + '<div class="n"><span id="hqN">' + d.num(CFG.sec) + '</span><small>' + t.sc + '</small></div></div>' +
      '<div class="hq-q"><span>' + t.q + ' ' + d.num(Q.i + 1) + ' / ' + d.num(Q.qs.length) + ' · ' + title + '</span></div><div class="hq-ay" id="hqA">' + d.esc(shown) + '</div><div class="hq-r" id="hqR">' + t.hear + '</div>' +
      '<div style="text-align:center;margin-bottom:6px"><button type="button" class="hq-b" data-act="replay">🔊 ' + t.replay + '</button></div>' +
      q.opts.map(function (o, k) { return '<button type="button" class="hq-o" data-act="opt" data-k="' + k + '" style="animation-delay:' + (k * 60) + 'ms" disabled><span class="l">' + LET[k] + '</span><span class="t">' + d.esc(o.v) + '</span></button>'; }).join('') + '</div>';
    var began = false;
    function go(okAudio) {
      if (began || Q.qs[Q.i] !== q) return; began = true;
      var r = $('hqR'); if (r) r.textContent = okAudio ? '' : t.noaudio;
      Array.prototype.forEach.call(document.querySelectorAll('.hq-o'), function (b) { b.disabled = false; });
      var ms = CFG.sec * 1000, t0 = performance.now(); q.t0 = t0; cancelAnimationFrame(raf);
      (function tickf(now) {
        if (Q.qs[Q.i] !== q || q.locked) return;
        var e = now - t0, left = Math.max(0, ms - e), fg = $('hqFg'), nn = $('hqN'), rw = $('hqRing');
        if (fg) fg.setAttribute('stroke-dashoffset', String(276.46 * (1 - left / ms)));
        if (nn) nn.textContent = d.num(Math.ceil(left / 1000));
        if (rw) rw.classList.toggle('low', left <= 5000);
        if (left <= 0) return answer(-1);
        raf = requestAnimationFrame(tickf);
      })(t0);
    }
    play(q, go);
  }
  function answer(k) {
    var d = D(), t = L(), q = Q.qs[Q.i]; if (!q || q.locked) return; q.locked = true; cancelAnimationFrame(raf);
    var took = q.t0 ? (performance.now() - q.t0) / 1000 : CFG.sec; Q.times.push(Math.min(took, CFG.sec));
    try { if (au) au.pause(); } catch (e) {}
    var right = q.opts.findIndex(function (o) { return o.ok; }), good = k === right;
    Array.prototype.forEach.call(document.querySelectorAll('.hq-o'), function (b, i) { b.disabled = true; if (i === right) b.classList.add('ok'); else if (i === k) b.classList.add('no'); });
    var r = $('hqR'); if (r) { r.className = 'hq-r ' + (good ? 'ok' : 'no'); r.textContent = good ? t.ok : (k < 0 ? t.late : t.bad); }
    var full = $('hqA'); if (full && q.kind !== 'next') full.textContent = q.text + ' ﴿' + d.num(q.a) + '﴾';
    if (good) { Q.score++; Q.streak++; Q.best = Math.max(Q.best, Q.streak); } else { Q.streak = 0; Q.wrong.push(q); }
    Q.res[Q.i] = good ? 1 : 0; beep(good);
    try { if (navigator.vibrate && !good) navigator.vibrate(70); } catch (e) {}
    setTimeout(function () { if (!Q || Q.qs[Q.i] !== q) return; Q.i++; ask(); }, good ? 1200 : 2400);
  }
  function end() {
    stopAll();
    var d = D(), t = L(), v = view(), tot = Q.qs.length, pc = tot ? Math.round(Q.score / tot * 100) : 0, st = pc >= 90 ? 3 : pc >= 65 ? 2 : pc >= 35 ? 1 : 0;
    var avg = Q.times.length ? Q.times.reduce(function (a, b) { return a + b; }, 0) / Q.times.length : 0, C = 2 * Math.PI * 44;
    v.innerHTML = '<div class="w"><div class="hq-top"><button type="button" class="hq-b" data-act="pick">‹</button></div><h2 class="hq-h">🌙 ' + (pc === 100 ? t.perfect : t.fin) + '</h2>' +
      '<div class="hq-big"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="8"/><circle cx="50" cy="50" r="44" fill="none" stroke="#e6c46f" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pc / 100)).toFixed(1) + '"/></svg><div class="n">' + d.num(pc) + '%</div></div>' +
      '<div class="hq-stars">' + [1, 2, 3].map(function (i) { return i <= st ? '⭐' : '☆'; }).join('') + '</div>' +
      '<div class="hq-st"><div><b>' + d.num(Q.score) + '/' + d.num(tot) + '</b>' + t.score + '</div><div><b>' + d.num(Q.best) + '</b>' + t.streak + '</div><div><b>' + d.num(Math.round(avg)) + t.sc + '</b>' + t.avg + '</div></div>' +
      '<div class="hq-row" style="justify-content:center;margin-bottom:14px"><button type="button" class="hq-b gold" data-act="sura" data-n="' + Q.n + '">↻ ' + t.again + '</button><button type="button" class="hq-b" data-act="pick">' + t.other + '</button></div>' +
      (Q.wrong.length ? '<h3 class="hq-h" style="font-size:16px">' + t.review + '</h3>' : '') +
      Q.wrong.map(function (q) { return '<div class="hq-ay" style="font-size:21px;padding:12px">' + d.esc(q.text) + ' ﴿' + d.num(q.a) + '﴾</div>'; }).join('') + '</div>';
  }
  function click(e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
    if (a === 'close') return close();
    if (a === 'pick') return pickScreen();
    if (a === 'cfg') { CFG[b.getAttribute('data-k')] = +b.getAttribute('data-v'); saveCfg(); return pickScreen(); }
    if (a === 'sura') return startQuiz(+b.getAttribute('data-n'));
    if (a === 'opt') return answer(+b.getAttribute('data-k'));
    if (a === 'replay') { var q = Q && Q.qs[Q.i]; if (q && !q.locked) play(q, function () {}); }
  }
  window.hifzQuiz = function () { css(); view(); pickScreen(); };
})();
