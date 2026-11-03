/* companions-quiz.js v1 — Companions quiz: rounds of 10, timer, red/green feedback, points, streak, stars, review. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SK = 'cq_state_v1', ROUND = 10, TIME = 20;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function load() { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(SK, JSON.stringify(st)); } catch (e) {} }
  var st = load(); st.seen = st.seen || {}; st.best = st.best || 0; st.total = st.total || 0; st.right = st.right || 0; st.rounds = st.rounds || 0;
  var bank = null;
  function getBank() {
    if (bank) return bank; var seen = {};
    bank = (window.__CQ_BANK || []).map(function (r) { return { id: hash(r[1]), l: r[0], q: r[1], a: r[2], w: r[3], e: r[4] }; })
      .filter(function (q) { if (seen[q.id]) return false; seen[q.id] = 1; return true; });
    return bank;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var R = null, timer = null;
  function pick(level) {
    var all = getBank().filter(function (q) { return !level || q.l === level; });
    var fresh = all.filter(function (q) { return !st.seen[q.id]; });
    if (fresh.length < ROUND) { // reset seen for this pool
      all.forEach(function (q) { delete st.seen[q.id]; }); fresh = all;
    }
    return shuffle(fresh).slice(0, ROUND);
  }
  function startRound(level) {
    var qs = pick(level); if (!qs.length) return;
    R = { level: level, qs: qs, i: 0, score: 0, streak: 0, bestStreak: 0, right: 0, wrong: [], done: false, answered: false, t: TIME };
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
    if (ok) { R.streak++; R.bestStreak = Math.max(R.bestStreak, R.streak); R.right++; st.right++; var gain = 10 + Math.round(R.t / 2) + Math.min(R.streak - 1, 5) * 2; R.gain = gain; R.score += gain; }
    else { R.streak = 0; R.gain = 0; R.wrong.push(q); try { if (navigator.vibrate) navigator.vibrate(120); } catch (e) {} }
    save(); render();
  }
  function next() {
    if (R.i + 1 >= R.qs.length) { R.done = true; st.rounds++; st.best = Math.max(st.best, R.score); save(); render(); return; }
    R.i++; R.answered = false; render();
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
      var acc = st.total ? Math.round(st.right / st.total * 100) : 0;
      h += '<div class="hero"><div class="big">🎯</div><p>پرسیاری هەڵبژاردن لەسەر ژیانی هاوەڵان. هەر خولێک ١٠ پرسیارە، ٢٠ چرکە بۆ هەر یەکێک. وەڵامی ڕاست <b>سەوز</b> دەبێت و خاڵ و زنجیرە زیاد دەکات؛ ڕاست نەبێت <b>سور</b> دەبێت و ڕاستەکە نیشان دەدرێت.</p></div>' +
        '<div class="stats"><div><b>' + st.best + '</b>باشترین خاڵ</div><div><b>' + acc + '%</b>ڕاستی</div><div><b>' + st.rounds + '</b>خول</div><div><b>' + n + '</b>پرسیار</div></div>' +
        '<button class="lv go" data-l="0">🎲 تێکەڵ <small>هەموو ئاستەکان</small></button>' +
        '<button class="lv" data-l="1">🟢 ئاسان <small>ناوی گەورە هاوەڵان و ناونیشانەکان</small></button>' +
        '<button class="lv" data-l="2">🟡 مامناوەند <small>ڕووداو و تایبەتمەندییەکان</small></button>' +
        '<button class="lv" data-l="3">🔴 قورس <small>وردەکاری و فەرموودە</small></button>';
    } else if (R.done) {
      var stars = R.right >= 9 ? 3 : R.right >= 7 ? 2 : R.right >= 4 ? 1 : 0;
      h += '<div class="hero"><div class="stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div><div class="big">' + R.score + ' خاڵ</div><p>' + R.right + ' لە ' + R.qs.length + ' ڕاست · درێژترین زنجیرە ' + R.bestStreak + '</p></div>';
      if (R.wrong.length) { h += '<h3 style="margin:6px 0 8px;font-size:15px">پرسیارە هەڵەکان</h3>'; R.wrong.forEach(function (q) { h += '<div class="rv">' + esc(q.q) + '<br><b>✓ ' + esc(q.a) + '</b><br><small>' + esc(q.e) + '</small></div>'; }); }
      h += '<button class="lv go" data-l="' + R.level + '" style="margin-top:8px">🔁 خولێکی تر</button><button class="lv" data-a="menu">ئاستەکان</button>';
    } else {
      var q = R.qs[R.i]; if (!R.cur || R.curI !== R.i) { R.cur = shuffle([q.a].concat(q.w)); R.curI = R.i; }
      h += '<div class="meta"><span>پرسیار ' + (R.i + 1) + '/' + R.qs.length + '</span><span class="st">' + (R.streak > 1 ? '🔥 ' + R.streak + ' ' : '') + '⭐ ' + R.score + '</span><span id="cqSec">' + Math.ceil(R.t) + '</span></div>' +
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
    var b = e.target.closest ? e.target.closest('[data-a],[data-l],[data-o]') : null; if (!b) return;
    if (b.hasAttribute('data-o')) return answer(+b.getAttribute('data-o'));
    if (b.hasAttribute('data-l')) return startRound(+b.getAttribute('data-l'));
    var a = b.getAttribute('data-a');
    if (a === 'next') next();
    else if (a === 'menu') { R = null; render(); }
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
