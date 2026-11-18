/* hifz-quiz.js — پرسیار و وەڵام: pick a surah; every ayah is read aloud, then 20s to answer a 4-choice question (shuffled). */
(function () {
  if (window.hifzQuiz) return;
  var D = function () { return window.__hifzData; };
  var T = {
    ckb: { title: 'پرسیار و وەڵام', pick: 'سورەتێک هەڵبژێرە', start: 'دەستپێبکە', q: 'پرسیار', next: 'ئایەتی دواتر کامەیە؟', num: 'ئەم ئایەتە ژمارەی چەندە؟', miss: 'وشەی ون کامەیە؟', hear: 'گوێ بگرە…', replay: '🔊 دووبارە', ok: 'ڕاستە! ✓', bad: 'هەڵەیە ✗', late: 'کات تەواو بوو', ans: 'وەڵامی ڕاست', score: 'ئەنجام', again: '↻ دووبارە', close: 'داخستن', streak: 'زنجیرە', noaudio: 'دەنگ بەردەست نییە (ئینتەرنێت)', fin: 'ماشاءاللە!', ay: 'ئایەت', fail: 'سورەتەکە بار نەبوو' },
    en: { title: 'Quiz', pick: 'Choose a surah', start: 'Start', q: 'Question', next: 'Which ayah comes next?', num: 'What is this ayah\'s number?', miss: 'Which word is missing?', hear: 'Listen…', replay: '🔊 Replay', ok: 'Correct! ✓', bad: 'Wrong ✗', late: 'Time is up', ans: 'Correct answer', score: 'Score', again: '↻ Again', close: 'Close', streak: 'Streak', noaudio: 'Audio unavailable (internet)', fin: 'Mashallah!', ay: 'ayat', fail: 'Could not load the surah' },
    ar: { title: 'أسئلة واختيارات', pick: 'اختر سورة', start: 'ابدأ', q: 'سؤال', next: 'ما الآية التالية؟', num: 'ما رقم هذه الآية؟', miss: 'ما الكلمة الناقصة؟', hear: 'استمع…', replay: '🔊 إعادة', ok: 'صحيح! ✓', bad: 'خطأ ✗', late: 'انتهى الوقت', ans: 'الإجابة الصحيحة', score: 'النتيجة', again: '↻ إعادة', close: 'إغلاق', streak: 'التتالي', noaudio: 'الصوت غير متاح (إنترنت)', fin: 'ما شاء الله!', ay: 'آية', fail: 'تعذّر تحميل السورة' }
  };
  var Q = null, tm = null, au = null, SEC = 20;
  function L() { var l = D().lang(); return T[l] || T.en; }
  function $(i) { return document.getElementById(i); }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad(n, w) { return ('000' + n).slice(-w); }
  function css() {
    if ($('hqCss')) return;
    var s = document.createElement('style'); s.id = 'hqCss';
    s.textContent = '#hqView{position:fixed;inset:0;z-index:120;overflow:auto;color:#f5efdd;background:linear-gradient(180deg,#0c3a2d,#06201a);padding:14px 14px 40px;font-family:inherit}#hqView[hidden]{display:none}' +
      '.hq-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px}.hq-b{border:1px solid rgba(230,196,111,.3);background:rgba(255,255,255,.06);color:#f5efdd;border-radius:12px;padding:8px 13px;font:inherit;font-size:13px}' +
      '.hq-h{color:#e6c46f;text-align:center;margin:6px 0 12px}.hq-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.hq-c{border:1px solid rgba(230,196,111,.26);background:rgba(255,255,255,.055);color:#f5efdd;border-radius:14px;padding:12px 6px;font:inherit;font-family:Amiri,"Noto Naskh Arabic",serif;font-size:19px}.hq-c small{display:block;font-size:11px;opacity:.6;font-family:inherit}' +
      '.hq-in{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(230,196,111,.26);border-radius:14px;color:#f5efdd;padding:10px 13px;font:inherit;margin-bottom:10px}' +
      '.hq-tm{height:8px;border-radius:8px;background:rgba(255,255,255,.12);overflow:hidden;margin:8px 0}.hq-tm i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#b8924a,#e6c46f);transition:width 1s linear}.hq-tm i.low{background:#e05252}' +
      '.hq-q{text-align:center;font-weight:700;color:#e6c46f;margin:10px 0}.hq-ay{direction:rtl;text-align:center;font-family:Amiri,"Noto Naskh Arabic",serif;font-size:26px;line-height:2.1;border:1px solid rgba(230,196,111,.26);border-radius:18px;padding:12px;background:rgba(0,0,0,.2);margin-bottom:10px}' +
      '.hq-o{display:block;width:100%;text-align:center;direction:rtl;margin:8px 0;border:1px solid rgba(230,196,111,.3);background:rgba(255,255,255,.06);color:#f5efdd;border-radius:14px;padding:12px;font-family:Amiri,"Noto Naskh Arabic",serif;font-size:21px;line-height:1.9}.hq-o.ok{background:rgba(60,170,100,.45);border-color:#5fd18a}.hq-o.no{background:rgba(224,82,82,.4);border-color:#e05252}.hq-o[disabled]{opacity:1}' +
      '.hq-r{text-align:center;margin:10px 0;font-weight:700}.hq-st{display:flex;gap:10px;justify-content:center;margin:14px 0}.hq-st div{flex:1;border:1px solid rgba(230,196,111,.26);border-radius:14px;padding:12px 4px;text-align:center}.hq-st b{display:block;font-size:22px;color:#e6c46f}';
    document.head.appendChild(s);
  }
  function view() {
    var v = $('hqView'); if (v) return v;
    v = document.createElement('div'); v.id = 'hqView'; v.hidden = true;
    v.setAttribute('data-no-translate', '1'); v.setAttribute('data-keep-ar', '1');
    document.body.appendChild(v); v.addEventListener('click', click); return v;
  }
  function stopAll() { clearInterval(tm); try { if (au) { au.pause(); au = null; } } catch (e) {} }
  function close() { stopAll(); view().hidden = true; }
  function pickScreen() {
    var d = D(), t = L(), v = view(), o = '', n;
    v.dir = d.rtl() ? 'rtl' : 'ltr'; v.hidden = false;
    for (n = 1; n <= 114; n++) o += '<button type="button" class="hq-c" data-act="sura" data-n="' + n + '" data-nm="' + d.esc(d.nw(d.sname(n))) + '">' + d.esc(d.sname(n)) + '<small>' + d.num(n) + ' · ' + d.num(d.cnt(n)) + '</small></button>';
    v.innerHTML = '<div class="hq-top"><button type="button" class="hq-b" data-act="close">‹ ' + t.close + '</button></div><h2 class="hq-h">❓ ' + t.title + '</h2><input id="hqS" class="hq-in" type="search" placeholder="' + t.pick + '…"><div class="hq-list" id="hqL">' + o + '</div>';
    $('hqS').addEventListener('input', function () {
      var q = d.nw(this.value), k = parseInt(this.value, 10);
      Array.prototype.forEach.call(document.querySelectorAll('#hqL .hq-c'), function (b) { b.style.display = (!this.value || (k ? +b.getAttribute('data-n') === k : b.getAttribute('data-nm').indexOf(q) >= 0)) ? '' : 'none'; }.bind(this));
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
        q.blank = ws.map(function (w, k) { return k === bi ? '＿＿＿' : w; }).join(' ');
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
      if (!ok) { v.innerHTML = '<div class="hq-top"><button type="button" class="hq-b" data-act="pick">‹</button></div><p class="hq-h">' + L().fail + '</p>'; return; }
      Q = { n: n, qs: build(n), i: 0, score: 0, streak: 0, best: 0, wrong: [], done: false };
      ask();
    });
  }
  function play(q, cb) {
    try {
      if (au) au.pause();
      var n = Q.n;
      au = new Audio('https://everyayah.com/data/Alafasy_128kbps/' + pad(n, 3) + pad(q.a, 3) + '.mp3');
      au.onended = function () { cb(true); };
      au.onerror = function () { cb(false); };
      var p = au.play(); if (p && p.catch) p.catch(function () { cb(false); });
    } catch (e) { cb(false); }
  }
  function ask() {
    var d = D(), t = L(), v = view(), q = Q.qs[Q.i]; if (!q) return end();
    q.locked = false;
    var title = q.kind === 'num' ? t.num : q.kind === 'miss' ? t.miss : t.next;
    var shown = q.kind === 'miss' ? q.blank : q.kind === 'next' ? q.text : '🔊';
    v.innerHTML = '<div class="hq-top"><button type="button" class="hq-b" data-act="pick">‹ ' + d.esc(d.sname(Q.n)) + '</button><span>' + t.q + ' ' + d.num(Q.i + 1) + '/' + d.num(Q.qs.length) + ' · ' + t.score + ' ' + d.num(Q.score) + (Q.streak > 1 ? ' · 🔥' + d.num(Q.streak) : '') + '</span></div>' +
      '<div class="hq-tm"><i id="hqT"></i></div><div class="hq-q">' + title + '</div><div class="hq-ay" id="hqA">' + d.esc(shown) + '</div><div class="hq-r" id="hqR">' + t.hear + '</div><div style="text-align:center"><button type="button" class="hq-b" data-act="replay">' + t.replay + '</button></div>' +
      q.opts.map(function (o, k) { return '<button type="button" class="hq-o" data-act="opt" data-k="' + k + '" disabled>' + d.esc(o.v) + '</button>'; }).join('');
    /* ayah is read aloud first; the 20 seconds start when the reading ends */
    var began = false;
    function go(okAudio) {
      if (began || Q.qs[Q.i] !== q) return; began = true;
      if (!okAudio) { var r = $('hqR'); if (r) r.textContent = t.noaudio; } else { var r2 = $('hqR'); if (r2) r2.textContent = ''; }
      Array.prototype.forEach.call(document.querySelectorAll('.hq-o'), function (b) { b.disabled = false; });
      var left = SEC, bar = $('hqT'); clearInterval(tm);
      if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width 1s linear'; }
      tm = setInterval(function () {
        left--; var b = $('hqT'); if (b) { b.style.width = (left / SEC * 100) + '%'; if (left <= 5) b.className = 'low'; }
        if (left <= 0) { clearInterval(tm); answer(-1); }
      }, 1000);
    }
    play(q, go);
  }
  function answer(k) {
    var d = D(), t = L(), q = Q.qs[Q.i]; if (!q || q.locked) return; q.locked = true; clearInterval(tm);
    try { if (au) au.pause(); } catch (e) {}
    var right = q.opts.findIndex(function (o) { return o.ok; }), good = k === right;
    Array.prototype.forEach.call(document.querySelectorAll('.hq-o'), function (b, i) { b.disabled = true; if (i === right) b.classList.add('ok'); else if (i === k) b.classList.add('no'); });
    var r = $('hqR'); if (r) r.innerHTML = (good ? t.ok : (k < 0 ? t.late : t.bad)) + (good ? '' : '');
    var full = $('hqA'); if (full && q.kind !== 'next') full.textContent = q.text + ' ﴿' + d.num(q.a) + '﴾';
    if (good) { Q.score++; Q.streak++; Q.best = Math.max(Q.best, Q.streak); } else { Q.streak = 0; Q.wrong.push(q); }
    try { if (navigator.vibrate && !good) navigator.vibrate(70); } catch (e) {}
    setTimeout(function () { Q.i++; ask(); }, good ? 1100 : 2200);
  }
  function end() {
    var d = D(), t = L(), v = view();
    v.innerHTML = '<div class="hq-top"><button type="button" class="hq-b" data-act="pick">‹</button></div><h2 class="hq-h">🌙 ' + t.fin + '</h2><div class="hq-st"><div><b>' + d.num(Q.score) + '/' + d.num(Q.qs.length) + '</b>' + t.score + '</div><div><b>' + d.num(Q.best) + '</b>' + t.streak + '</div></div><div style="text-align:center"><button type="button" class="hq-b" data-act="sura" data-n="' + Q.n + '">' + t.again + '</button></div>' +
      Q.wrong.map(function (q) { return '<div class="hq-ay" style="font-size:20px">' + d.esc(q.text) + ' ﴿' + d.num(q.a) + '﴾</div>'; }).join('');
  }
  function click(e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
    if (a === 'close') return close();
    if (a === 'pick') { stopAll(); return pickScreen(); }
    if (a === 'sura') return startQuiz(+b.getAttribute('data-n'));
    if (a === 'opt') return answer(+b.getAttribute('data-k'));
    if (a === 'replay') { var q = Q && Q.qs[Q.i]; if (q) play(q, function () {}); }
  }
  window.hifzQuiz = function () { css(); view(); pickScreen(); };
})();
