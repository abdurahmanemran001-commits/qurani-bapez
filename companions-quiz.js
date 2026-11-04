/* companions-quiz.js v1 — Companions quiz: rounds of 10, timer, red/green feedback, points, streak, stars, review. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SK = 'cq_state_v1', ROUND = 10, TIME = 15;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function load() { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(SK, JSON.stringify(st)); } catch (e) {} }
  var st = load(); st.seen = st.seen || {}; st.best = st.best || 0; st.total = st.total || 0; st.right = st.right || 0; st.rounds = st.rounds || 0;
  var bank = null;
  function getBank() {
    if (bank) return bank; var seen = {};
    bank = (window.__CQ_BANK || []).map(function (r) { return { id: hash(r[1] + '|' + r[2]), l: r[0], q: r[1], a: r[2], w: r[3], e: r[4], c: r[5] || 'گشتی' }; })
      .filter(function (q) { if (seen[q.id]) return false; seen[q.id] = 1; return true; });
    return bank;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var R = null, timer = null;
  var SEL = { level: 0, cat: '', mode: 'round' };
  function pick(level, cat, n) {
    var all = getBank().filter(function (q) { return (!level || q.l === level) && (!cat || q.c === cat); });
    var fresh = all.filter(function (q) { return !st.seen[q.id]; });
    if (fresh.length < Math.min(n, all.length)) { all.forEach(function (q) { delete st.seen[q.id]; }); fresh = all; }
    return shuffle(fresh).slice(0, n);
  }
  function startRound() {
    var surv = SEL.mode === 'surv', qs = pick(SEL.level, SEL.cat, surv ? 200 : ROUND); if (!qs.length) return;
    R = { level: SEL.level, cat: SEL.cat, surv: surv, lives: 3, qs: qs, i: 0, score: 0, streak: 0, bestStreak: 0, right: 0, wrong: [], done: false, answered: false, t: TIME };
    render();
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function startTimer() {
    stopTimer(); R.t = TIME; R.t0 = Date.now();
    timer = setInterval(function () {
      if (!R || R.answered) return stopTimer();
      R.t = Math.max(0, TIME - (Date.now() - R.t0) / 1000);
      var b = $('cqBar'), n = $('cqSec'); if (b) { b.style.width = (R.t / TIME * 100) + '%'; b.className = R.t < 6 ? 'low' : ''; } if (n) n.textContent = Math.ceil(R.t);
      if (R.t <= 0) answer(-1);
    }, 100);
  }
  function answer(idx) {
    if (!R || R.answered) return; stopTimer(); R.answered = true;
    var q = R.qs[R.i], ok = idx >= 0 && R.cur[idx] === q.a; R.sel = idx; R.ok = ok;
    st.seen[q.id] = 1; st.total++;
    if (ok) { R.streak++; R.bestStreak = Math.max(R.bestStreak, R.streak); R.right++; st.right++; var gain = 10 + Math.round(R.t / 2) + Math.min(R.streak - 1, 5) * 2; R.gain = gain; R.score += gain; celebrate(R.streak); }
    else { R.streak = 0; R.gain = 0; R.wrong.push(q); if (R.surv) R.lives--; buzz(); try { if (navigator.vibrate) navigator.vibrate(120); } catch (e) {} }
    save(); render();
  }
  function next() {
    if (R.i + 1 >= R.qs.length || (R.surv && R.lives <= 0)) { R.done = true; st.rounds++; st.best = Math.max(st.best, R.score); save(); render(); return; }
    R.i++; R.answered = false; render();
  }

  var AC = null;
  function tone(f, t0, d, type, vol) { if (st.mute) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(vol || .18, AC.currentTime + t0); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + t0 + d); o.connect(g); g.connect(AC.destination); o.start(AC.currentTime + t0); o.stop(AC.currentTime + t0 + d + .02); } catch (e) {} }
  function buzz() { tone(180, 0, .22, 'sawtooth', .12); tone(130, .12, .28, 'sawtooth', .12); }
  var PRAISE = ['ئافەرین! 🎉', 'زۆر باشە! 🌟', 'ماشاڵڵا! ✨', 'نایابە! 👏', 'تەواو ڕاستە! 🎊', 'ئەستێرەیت! ⭐', 'بەهێزی! 💪'];
  function confetti(n) {
    var c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99';
    var W = c.width = window.innerWidth, H = c.height = window.innerHeight; document.body.appendChild(c); var x = c.getContext('2d');
    var cols = ['#2f9e5f', '#f4b400', '#e8453c', '#3b82f6', '#a855f7', '#ff7ab6', '#22c1c3'], ps = [];
    for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + (Math.random() - .5) * 2.2, sp = 7 + Math.random() * 9; ps.push({ x: W / 2, y: H * .55, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4 + Math.random() * 5, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, sh: Math.random() < .5 }); }
    var f = 0; (function loop() {
      x.clearRect(0, 0, W, H); f++;
      ps.forEach(function (p) { p.vy += .32; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.rot += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.globalAlpha = Math.max(0, 1 - f / 85); x.fillStyle = p.c; if (p.sh) { x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); } else { x.beginPath(); x.arc(0, 0, p.r / 1.6, 0, 6.3); x.fill(); } x.restore(); });
      if (f < 90) requestAnimationFrame(loop); else if (c.parentNode) c.parentNode.removeChild(c);
    })();
  }
  function celebrate(streak) {
    var big = streak === 3 || streak === 5 || streak >= 7 && streak % 5 === 0;
    confetti(big ? 150 : 70);
    [523, 659, 784].concat(big ? [1047, 1319] : []).forEach(function (f, i) { tone(f, i * .09, .28, 'triangle', .2); });
    var d = document.createElement('div'); d.className = 'cqcheer';
    d.innerHTML = big ? '🔥 ' + streak + ' ڕاستی لەسەر یەک!' : PRAISE[Math.floor(Math.random() * PRAISE.length)];
    document.body.appendChild(d); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1400);
    var v = $('cqView'); if (v) { v.classList.add('flashok'); setTimeout(function () { v.classList.remove('flashok'); }, 500); }
  }
  function css() {
    if ($('cqCss')) return; var s = document.createElement('style'); s.id = 'cqCss';
    s.textContent = '.phone:has(#cqView.active) .appbar,.phone:has(#cqView.active) .bottom,.phone:has(#cqView.active) .status{display:none!important}' +
      '#cqView{direction:rtl;background:#f1f5ef;min-height:100%;display:flex;flex-direction:column;color:#1f2a24}' +
      '#cqView .top{display:flex;align-items:center;gap:10px;padding:14px;background:#2f5d46;color:#fff;position:sticky;top:0;z-index:3}' +
      '#cqView .top button{background:rgba(255,255,255,.16);border:0;color:#fff;border-radius:10px;padding:8px 12px;font:inherit;font-size:15px}#cqView .top b{font-size:17px}' +
      '#cqView .bd{flex:1;padding:14px 14px 40px}' +
      '#cqView .hero{background:linear-gradient(135deg,#2f5d46,#1f4132);color:#fff;border-radius:18px;padding:18px;text-align:center;margin-bottom:14px}#cqView .hero .big{font-size:40px}#cqView .hero p{margin:6px 0 0;font-size:14px;opacity:.92;line-height:1.8}' +
      '#cqView .stats{display:flex;gap:8px;margin-bottom:14px}#cqView .stats div{flex:1;background:#fff;border:1px solid #d5e0d3;border-radius:12px;padding:9px 4px;text-align:center;font-size:12px;color:#5b6b60}#cqView .stats b{display:block;font-size:20px;color:#2f5d46}' +
      '#cqView .lv{display:block;width:100%;box-sizing:border-box;margin-bottom:10px;padding:15px;border:0;border-radius:14px;background:#fff;border:1px solid #d5e0d3;font:inherit;font-size:16px;text-align:right;color:#1f2a24}#cqView .lv small{display:block;color:#6b7a70;font-size:12px;margin-top:3px}' +
      '#cqView .lv.go{background:#2f5d46;color:#fff;border-color:#2f5d46}#cqView .lv.go small{color:#d7e6da}' +
      '#cqView .meta{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#4a5a50;margin-bottom:8px}#cqView .meta .st{color:#c47f00;font-weight:700}' +
      '#cqView .tm{height:8px;background:#dfe8dc;border-radius:6px;overflow:hidden;margin-bottom:12px}#cqView .tm #cqBar{height:100%;width:100%;background:#2f9e5f;transition:width .1s linear}#cqView .tm #cqBar.low{background:#d6453d}' +
      '#cqView .q{background:#fff;border:1px solid #d5e0d3;border-radius:16px;padding:16px;font-size:18px;line-height:2;margin-bottom:12px;font-weight:600}' +
      '#cqView .op{display:block;width:100%;box-sizing:border-box;margin-bottom:9px;padding:14px;border:2px solid #cfdccb;border-radius:14px;background:#fff;font:inherit;font-size:16px;text-align:right;color:#1f2a24}' +
      '#cqView .op.ok{background:#e3f6e9;border-color:#2f9e5f;color:#14532d}#cqView .op.no{background:#fde4e2;border-color:#d6453d;color:#7f1d1d;animation:cqs .35s}#cqView .op.dim{opacity:.55}' +
      '@keyframes cqs{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}' +
      '.cqcheer{position:fixed;top:24%;left:50%;transform:translateX(-50%);z-index:100;background:linear-gradient(135deg,#2f9e5f,#1b7a45);color:#fff;font:800 24px/1.5 inherit;font-family:inherit;padding:12px 26px;border-radius:40px;box-shadow:0 10px 30px rgba(31,122,69,.5);animation:cqch 1.4s forwards;white-space:nowrap;direction:rtl}@keyframes cqch{0%{opacity:0;transform:translate(-50%,20px) scale(.6)}15%{opacity:1;transform:translate(-50%,0) scale(1.12)}25%{transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-30px)}}' +
      '#cqView.flashok{animation:cqfl .5s}@keyframes cqfl{0%{background:#bff0cf}100%{background:#f1f5ef}}' +
      '#cqView .chips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}#cqView .chip{border:1.5px solid #bdd0bb;background:#fff;border-radius:18px;padding:7px 13px;font:inherit;font-size:13px;color:#2f5d46}#cqView .chip.on{background:#2f5d46;color:#fff;border-color:#2f5d46}#cqView .sec{font-size:13px;color:#5b6b60;margin:10px 0 6px;font-weight:700}' +
      '#cqView .dots{display:flex;gap:4px;margin-bottom:10px}#cqView .dots i{flex:1;height:6px;border-radius:4px;background:#dfe8dc}#cqView .dots i.d{background:#2f9e5f}#cqView .dots i.x{background:#d6453d}#cqView .dots i.c{background:#f4b400}' +
      '#cqView .pop{position:fixed;top:30%;left:50%;transform:translateX(-50%);font-size:32px;font-weight:800;color:#2f9e5f;animation:cqp .9s forwards;pointer-events:none;z-index:9}@keyframes cqp{0%{opacity:0;transform:translate(-50%,10px)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50px)}}' +
      '#cqView .ex{border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.9;margin-bottom:12px}#cqView .ex.ok{background:#e3f6e9;color:#14532d}#cqView .ex.no{background:#fde4e2;color:#7f1d1d}#cqView .ex small{display:block;margin-top:5px;opacity:.85}' +
      '#cqView .nx{width:100%;padding:14px;border:0;border-radius:14px;background:#2f5d46;color:#fff;font:inherit;font-size:16px}' +
      '#cqView .stars{font-size:38px;text-align:center;letter-spacing:6px;margin:6px 0}#cqView .rv{background:#fff;border:1px solid #f0c9c6;border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:14px;line-height:1.8}#cqView .rv b{color:#14532d}' +
      '#cqEntry{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;margin-bottom:12px;padding:13px 14px;border:0;border-radius:14px;background:linear-gradient(135deg,#b7791f,#7a4d0b);color:#fff;font:inherit;text-align:right;cursor:pointer}#cqEntry span{font-size:24px}#cqEntry b{display:block;font-size:15px}#cqEntry small{display:block;font-size:12px;opacity:.92;margin-top:2px}';
    document.head.appendChild(s);
  }
  function render() {
    var v = $('cqView'); if (!v) return; var h = '<div class="top"><button data-a="back">‹ گەڕانەوە</button><b>🏆 پێشبڕکێی هاوەڵان</b></div><div class="bd">';
    var n = getBank().length;
    if (!R) {
      var acc = st.total ? Math.round(st.right / st.total * 100) : 0, xp = st.right * 10, rank = xp >= 3000 ? '👑 عالیم' : xp >= 1200 ? '🥇 زانا' : xp >= 400 ? '🥈 خوێندکار' : '🥉 تازەکار';
      var cats = ['', 'ڕەچەڵەک', 'شوێن و کات', 'ناونیشان', 'گشتی'], cn = { '': 'هەموو' };
      h += '<div class="hero"><div class="big">🏆</div><p><b>' + rank + '</b> · ' + xp + ' XP<br>' + n + ' پرسیار لەسەر ژیانی هاوەڵان</p></div>' +
        '<div class="stats"><div><b>' + st.best + '</b>باشترین خاڵ</div><div><b>' + acc + '%</b>ڕاستی</div><div><b>' + st.rounds + '</b>خول</div></div>' +
        '<div class="sec">بابەت</div><div class="chips">' + cats.map(function (c) { return '<button class="chip' + (SEL.cat === c ? ' on' : '') + '" data-c="' + c + '">' + (c || 'هەموو') + '</button>'; }).join('') + '</div>' +
        '<div class="sec">ئاست</div><div class="chips">' + [[0, '🎲 تێکەڵ'], [1, '🟢 ئاسان'], [2, '🟡 مامناوەند'], [3, '🔴 قورس']].map(function (x) { return '<button class="chip' + (SEL.level === x[0] ? ' on' : '') + '" data-lv="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<button class="lv go" data-m="round">▶️ دەستپێکردن <small>١٠ پرسیار، ١٥ چرکە بۆ هەر یەکێک</small></button>' +
        '<button class="lv" data-m="surv">❤️❤️❤️ بێ کۆتایی <small>تا سێ هەڵە دەکەیت بەردەوام بە</small></button>' +
        '<button class="lv" data-a="mute" style="text-align:center;font-size:14px">' + (st.mute ? '🔇 دەنگ: کوژاوە' : '🔊 دەنگ: کراوە') + '</button>';
    } else if (R.done) {
      var stars = R.surv ? (R.right >= 25 ? 3 : R.right >= 12 ? 2 : R.right >= 5 ? 1 : 0) : (R.right >= 9 ? 3 : R.right >= 7 ? 2 : R.right >= 4 ? 1 : 0);
      h += '<div class="hero"><div class="stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div><div class="big">' + R.score + ' خاڵ</div><p>' + R.right + ' ڕاست لە ' + (R.i + 1) + ' پرسیار · درێژترین زنجیرە ' + R.bestStreak + '</p></div>';
      if (R.wrong.length) { h += '<h3 style="margin:6px 0 8px;font-size:15px">پرسیارە هەڵەکان</h3>'; R.wrong.forEach(function (q) { h += '<div class="rv">' + esc(q.q) + '<br><b>✓ ' + esc(q.a) + '</b><br><small>' + esc(q.e) + '</small></div>'; }); }
      h += '<button class="lv go" data-m="' + (R.surv ? 'surv' : 'round') + '" style="margin-top:8px">🔁 خولێکی تر</button><button class="lv" data-a="menu">ئاستەکان</button>';
    } else {
      var q = R.qs[R.i]; if (!R.cur || R.curI !== R.i) { R.cur = shuffle([q.a].concat(q.w)); R.curI = R.i; }
      h += (R.surv ? '' : '<div class="dots">' + R.qs.map(function (_, k) { return '<i class="' + (k < R.i || (k === R.i && R.answered) ? ((R.wrong.indexOf(R.qs[k]) >= 0) ? 'x' : 'd') : k === R.i ? 'c' : '') + '"></i>'; }).join('') + '</div>') + '<div class="meta"><span>' + (R.surv ? '❤️'.repeat(Math.max(0, R.lives)) + '🖤'.repeat(3 - Math.max(0, R.lives)) : 'پرسیار ' + (R.i + 1) + '/' + R.qs.length) + '</span><span class="st">' + (R.streak > 1 ? '🔥 ' + R.streak + ' ' : '') + '⭐ ' + R.score + '</span><span id="cqSec">' + Math.ceil(R.t) + '</span></div>' +
        '<div class="tm"><div id="cqBar" style="width:' + (R.t / TIME * 100) + '%"></div></div><div class="q">' + esc(q.q) + '</div>';
      R.cur.forEach(function (o, i) {
        var c = 'op'; if (R.answered) { if (o === q.a) c += ' ok'; else if (i === R.sel) c += ' no'; else c += ' dim'; }
        h += '<button class="' + c + '" data-o="' + i + '"' + (R.answered ? ' disabled' : '') + '>' + (R.answered && o === q.a ? '✓ ' : R.answered && i === R.sel ? '✗ ' : '') + esc(o) + '</button>';
      });
      if (R.answered) {
        h += '<div class="ex ' + (R.ok ? 'ok' : 'no') + '"><b>' + (R.sel === -1 ? '⏰ کاتەکە تەواو بوو' : R.ok ? '✅ ڕاستە! +' + R.gain + ' خاڵ' : '❌ هەڵەیە') + '</b><small>' + esc(q.e) + '</small></div>' +
          '<button class="nx" data-a="next">' + (R.i + 1 >= R.qs.length ? 'ئەنجام 🏁' : 'دواتر ‹') + '</button>';
        if (R.ok) h += '<div class="pop">+' + R.gain + '</div>';
      }
    }
    v.innerHTML = h + '</div>';
    if (R && !R.done && !R.answered) startTimer();
    var m = v.closest('.main'); if (m) m.scrollTop = 0;
  }
  function onClick(e) {
    var b = e.target.closest ? e.target.closest('[data-a],[data-m],[data-c],[data-lv],[data-o]') : null; if (!b) return;
    if (b.hasAttribute('data-o')) return answer(+b.getAttribute('data-o'));
    if (b.hasAttribute('data-c')) { SEL.cat = b.getAttribute('data-c'); return render(); }
    if (b.hasAttribute('data-lv')) { SEL.level = +b.getAttribute('data-lv'); return render(); }
    if (b.hasAttribute('data-m')) { SEL.mode = b.getAttribute('data-m'); return startRound(); }
    var a = b.getAttribute('data-a');
    if (a === 'next') next();
    else if (a === 'menu') { R = null; render(); }
    else if (a === 'mute') { st.mute = !st.mute; save(); render(); }
    else if (a === 'back') {
      stopTimer(); if (R && !R.done) R = null;
      if (typeof window.showView === 'function') window.showView('companionsView', 'سیرەی هاوەڵان');
      var bt = document.querySelector('.bottom'); if (bt) bt.classList.remove('hidden');
      if (window.enterCompanions) window.enterCompanions();
    }
  }
  window.enterCompanionsQuiz = function () {
    css(); var z = $('zikr'); if (!z || !z.parentNode) return;
    if (!$('cqView')) { var v = document.createElement('section'); v.id = 'cqView'; v.className = 'view'; z.parentNode.appendChild(v); v.addEventListener('click', onClick); }
    if (typeof window.showView === 'function') window.showView('cqView', 'پێشبڕکێی هاوەڵان');
    var bt = document.querySelector('.bottom'); if (bt) bt.classList.add('hidden');
    R = null; render();
  };
  function inject() {
    var body = document.querySelector('#companionsView .cp-body');
    if (!body || body.querySelector('#cqEntry') || !body.querySelector('.cp-search')) return;
    css(); var b = document.createElement('button'); b.type = 'button'; b.id = 'cqEntry';
    b.innerHTML = '<span>🏆</span><div><b>پرسیار و وەڵام (پێشبڕکێ)</b><small>هەڵبژاردن، خاڵ، زنجیرە و کاتژمێر</small></div>';
    b.onclick = window.enterCompanionsQuiz;
    var ai = body.querySelector('#cpAiEntry'); if (ai && ai.nextSibling) body.insertBefore(b, ai.nextSibling); else body.insertBefore(b, body.firstChild);
  }
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  window.__cqBank = getBank;
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
