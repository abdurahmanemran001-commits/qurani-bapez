/* sira-ai.js v1 — "Ask the Seerah" AI: answers only about the Prophet's biography, with evidence from the app's own
 * 13-part biography (sources labelled), Quran + hadith corpus, via the Worker /expand + /sira-ask. */
(function () {
  if (window.__siraAiV1) return;
  window.__siraAiV1 = true;
  var HKEY = 'sira_ai_hist_v1';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function endpoint() {
    var e = '';
    try { e = localStorage.getItem('ai_endpoint') || ''; } catch (x) {}
    e = (e || window.AI_SHARI_ENDPOINT || '').trim().replace(/\/+$/, '');
    return /^https:\/\//.test(e) ? e : '';
  }
  function post(path, body, ms) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, ms || 25000) : null;
    return fetch(endpoint() + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      .finally(function () { if (t) clearTimeout(t); });
  }
  var NET = 'سێرڤەری AI وەڵامی نەدا (کات تەواو بوو یان ئینتەرنێت). دووبارە هەوڵ بدەرەوە.';
  var OFF = 'ئەم بەشە تەنها لەسەر سیرە و ژیاننامەی پێغەمبەر ﷺ وەڵام دەداتەوە. پرسیارێک بنووسە دەربارەی ژیان، غەزاکان، خێزان، هاوەڵان یان ڕووداوەکانی سەردەمی پێغەمبەر ﷺ. بۆ پرسی شەرعی بەشی «ئەی ئای شەرعی» بەکاربهێنە.';
  var NOTF = 'لە سەرچاوەکانی ئەپەکەدا وەڵامێکی متمانەپێکراو بۆ ئەم پرسیارە نەدۆزرایەوە. پرسیارەکە جۆرێکی تر بنووسەوە، یان لە زانایەک بپرسە.';

  /* ---------- local index over the 13-part biography ---------- */
  var idx = null;
  function norm(s) { return String(s || '').replace(/[ً-ٰٟۖ-ۭ‌‍]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/ھ/g, 'ه').replace(/[ةۀ]/g, 'ە').toLowerCase(); }
  function toks(s) { var m = norm(s).match(/[؀-ۿa-z0-9]{2,}/g) || []; return m.map(function (w) { return w.slice(0, 6); }); }
  function build() {
    if (idx) return idx;
    var docs = [], df = {}, seen = {};
    (window.__SIRA_STORY || []).forEach(function (part) {
      if (seen[part.id]) return; seen[part.id] = 1;
      (part.chapters || []).forEach(function (ch, ci) {
        String(ch.body || '').split(/\n\s*\n/).forEach(function (para, pi) {
          para = para.trim(); if (para.length < 40) return;
          var tk = toks(ch.ku + ' ' + ch.ku + ' ' + ch.ku + ' ' + part.ku + ' ' + para), tf = {};
          tk.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
          Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
          docs.push({ id: 's:' + part.id + ':' + ci + ':' + pi, part: part.ku, ch: ch.ku, text: para, tf: tf, len: tk.length });
        });
      });
    });
    var avg = docs.reduce(function (a, d) { return a + d.len; }, 0) / (docs.length || 1);
    idx = { docs: docs, df: df, avg: avg, byId: {} };
    docs.forEach(function (d) { idx.byId[d.id] = d; });
    return idx;
  }
  function search(terms, k) {
    var I = build(), q = {}, out = [];
    terms.forEach(function (t) { toks(t).forEach(function (x) { q[x] = (q[x] || 0) + 1; }); });
    var N = I.docs.length || 1;
    I.docs.forEach(function (d) {
      var sc = 0;
      Object.keys(q).forEach(function (t) {
        var f = d.tf[t]; if (!f) return;
        var idf = Math.log(1 + (N - I.df[t] + 0.5) / (I.df[t] + 0.5));
        sc += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.len / I.avg));
      });
      if (sc > 0) out.push([d, sc]);
    });
    out.sort(function (a, b) { return b[1] - a[1]; });
    return out.slice(0, k).map(function (x) { return x[0]; });
  }

  /* ---------- ask ---------- */
  function ask(q, status) {
    status = status || function () {};
    if (!endpoint()) return Promise.resolve({ text: NET, kind: 'error', sources: [] });
    status('… شیکردنەوەی پرسیار');
    return post('/expand', { q: q }, 20000).then(function (ex) {
      if (ex.error) return { text: ex.message || NET, kind: 'error', sources: [] };
      if (ex.refusal && ex.category !== 'general') return { text: OFF, kind: 'off', sources: [] };
      var kws = ex.keywords || [], ku = ex.ku || [];
      status('… گەڕان لە ژیاننامەکە و سەرچاوەکان');
      var story = search([q].concat(ku, ku), 8);
      var prom = window.AiRag ? window.AiRag.load(function () {}).catch(function () {}) : Promise.resolve();
      return prom.then(function () {
        var hits = (window.AiRag && kws.length) ? window.AiRag.search(kws, { kQ: 3, kH: 7 }) : { quran: [], hadith: [] };
        var passages = story.map(function (d) { return { id: d.id, text: '[ژیاننامە · ' + d.part + ' · ' + d.ch + '] ' + d.text }; });
        hits.quran.concat(hits.hadith).forEach(function (d) {
          passages.push({ id: d.id, text: d.kind === 'quran' ? d.ar + ' — ' + String(d.tafsir || '').slice(0, 500) : '[' + window.AiRag.label(d) + '] ' + String(d.ar).slice(0, 900) });
        });
        status('… نووسینی وەڵام');
        return post('/sira-ask', { q: q, token: ex.token, passages: passages }, 70000).then(function (an) {
          if (an.error) return { text: (an.message || NET) + (an.detail ? '\n\n[' + an.detail + ']' : ''), kind: 'error', sources: [] };
          if (an.offtopic) return { text: OFF, kind: 'off', sources: [] };
          if (!an.answerable) return { text: NOTF, kind: 'notfound', sources: [] };
          var src = (an.cites || []).map(function (id) {
            if (id.charAt(0) === 's') { var d = build().byId[id]; return d ? { label: 'ژیاننامە · ' + d.part + ' · ' + d.ch, ar: '', ku: d.text.slice(0, 380) + (d.text.length > 380 ? '…' : '') } : null; }
            var r = window.AiRag && window.AiRag.get(id); return r ? { label: window.AiRag.label(r), ar: r.ar, ku: '' } : null;
          }).filter(Boolean);
          return { text: (an.general ? 'بەشێک لەم وەڵامە لە زانیاریی گشتیی سیرەیە و ڕاستەوخۆ لە دەقە دیاریکراوەکانی ئەپەکە نییە.\n\n' : '') + an.answer, kind: 'answer', sources: src };
        });
      });
    }).catch(function () { return { text: NET, kind: 'error', sources: [] }; });
  }

  /* ---------- UI ---------- */
  var msgs = [], busy = false;
  try { msgs = JSON.parse(localStorage.getItem(HKEY) || '[]') || []; } catch (e) {}
  function saveH() { try { localStorage.setItem(HKEY, JSON.stringify(msgs.slice(-20))); } catch (e) {} }
  function css() {
    if ($('saiCss')) return;
    var s = document.createElement('style'); s.id = 'saiCss';
    s.textContent = '.phone:has(#siraAi.active) .appbar,.phone:has(#siraAi.active) .bottom,.phone:has(#siraAi.active) .status{display:none!important}' +
      '#siraAi{direction:rtl;background:#f5f1e6;min-height:100%;display:flex;flex-direction:column}' +
      '#siraAi .sa-top{display:flex;align-items:center;gap:10px;padding:14px;background:#173b66;color:#fff;position:sticky;top:0;z-index:3}' +
      '#siraAi .sa-top button{background:rgba(255,255,255,.16);border:0;color:#fff;border-radius:10px;padding:8px 12px;font:inherit;font-size:15px}#siraAi .sa-top b{font-size:17px}' +
      '#siraAi .sa-body{flex:1;padding:12px 12px 90px}' +
      '#siraAi .sa-hi{background:#fff;border:1px solid #e0d8bf;border-radius:14px;padding:12px;font-size:14px;line-height:1.9;color:#2a2a22;margin-bottom:10px}' +
      '#siraAi .sa-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}#siraAi .sa-chip{background:#fff;border:1px solid #cfc6a4;border-radius:16px;padding:6px 11px;font:inherit;font-size:13px;color:#173b66}' +
      '#siraAi .sa-m{margin-bottom:10px;padding:11px 13px;border-radius:14px;font-size:15px;line-height:2;white-space:pre-wrap;word-wrap:break-word}' +
      '#siraAi .sa-m.u{background:#173b66;color:#fff;margin-left:30px}#siraAi .sa-m.a{background:#fff;border:1px solid #e0d8bf;color:#1f2a24;margin-right:4px}#siraAi .sa-m.e{background:#fff3e0;border:1px solid #f0cf9b;color:#6b4a12}' +
      '#siraAi .sa-src{margin-top:8px;border-top:1px dashed #cfc6a4;padding-top:6px;font-size:13px;white-space:normal}#siraAi .sa-src b{display:block;color:#8a6a24;font-size:12px;margin-top:6px}' +
      '#siraAi .sa-src .ar{font-family:"Amiri","Scheherazade New",serif;font-size:17px;line-height:2;color:#173b66}#siraAi .sa-src .ku{color:#4a4a3e;line-height:1.8}' +
      '#siraAi .sa-bar{position:sticky;bottom:0;display:flex;gap:8px;padding:10px;background:#f5f1e6;border-top:1px solid #e0d8bf}' +
      '#siraAi textarea{flex:1;font:inherit;font-size:15px;border:1px solid #cfc6a4;border-radius:12px;padding:9px 11px;resize:none;height:46px;background:#fff;color:#1f2a24}' +
      '#siraAi .sa-send{background:#173b66;color:#fff;border:0;border-radius:12px;padding:0 18px;font:inherit;font-size:15px}#siraAi .sa-send[disabled]{opacity:.5}' +
      '#seerahView .sr-home-grid{grid-template-columns:repeat(4,1fr)!important;gap:6px!important}#seerahView .sr-home-grid .sr-home-tile{padding:10px 3px!important}#seerahView .sr-home-grid .sr-home-tile b{font-size:11.5px!important}#seerahView .sr-home-grid .sr-home-tile small{font-size:10px!important}#seerahView .sr-home-grid .sr-home-tile span{font-size:20px}' +
      '#siraAiEntry{background:linear-gradient(135deg,#173b66,#0f2744)!important;color:#fff!important;border:0!important}#siraAiEntry b,#siraAiEntry small{color:#fff!important}';
    document.head.appendChild(s);
  }
  var CHIPS = ['بەدر چۆن ڕوویدا؟', 'خەدیجە کەی مرد؟', 'کۆچ بۆ مەدینە چۆن بوو؟', 'لە ئوحود چی ڕوویدا؟', 'پەیمانی حودەیبیە چی بوو؟', 'ئەخلاقی پێغەمبەر ﷺ چۆن بوو؟'];
  function ensureView() {
    if ($('siraAi')) return $('siraAi');
    var z = $('zikr'); if (!z || !z.parentNode) return null;
    var v = document.createElement('section'); v.id = 'siraAi'; v.className = 'view'; z.parentNode.appendChild(v);
    v.addEventListener('click', onClick);
    return v;
  }
  function render() {
    var v = $('siraAi'); if (!v) return;
    var h = '<div class="sa-top"><button data-a="back">‹ گەڕانەوە</button><b>🤖 پرسیار لە سیرە</b>' + (msgs.length ? '<button data-a="clear" style="margin-right:auto">پاککردنەوە</button>' : '') + '</div><div class="sa-body">';
    if (!msgs.length) {
      h += '<div class="sa-hi">لێرە هەر پرسیارێک دەربارەی <b>سیرە و ژیاننامەی پێغەمبەر ﷺ</b> بپرسە: لەدایکبوون، وەحی، کۆچ، غەزاکان، خێزان، هاوەڵان و ئەخلاقی. وەڵامەکان لە ژیاننامەی ئەپەکە، قورئان، فەرمودە و مێژوو دەهێنرێن، و سەرچاوە و ئاستی متمانەیان نیشان دەدرێت. پرسی شەرعی لێرە نییە.</div><div class="sa-chips">' +
        CHIPS.map(function (c) { return '<button class="sa-chip" data-q="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    }
    msgs.forEach(function (m) {
      if (m.r === 'u') { h += '<div class="sa-m u">' + esc(m.t) + '</div>'; return; }
      h += '<div class="sa-m ' + (m.k === 'answer' ? 'a' : 'e') + '">' + esc(m.t);
      if (m.s && m.s.length) {
        h += '<div class="sa-src"><b>سەرچاوەکان</b>' + m.s.map(function (s) { return '<b>' + esc(s.label) + '</b>' + (s.ar ? '<div class="ar">' + esc(s.ar) + '</div>' : '') + (s.ku ? '<div class="ku">' + esc(s.ku) + '</div>' : ''); }).join('') + '</div>';
      }
      h += '</div>';
    });
    if (busy) h += '<div class="sa-m e" id="saStatus">…</div>';
    h += '</div><div class="sa-bar"><textarea id="saQ" placeholder="پرسیارەکەت بنووسە…"></textarea><button class="sa-send" data-a="send"' + (busy ? ' disabled' : '') + '>ناردن</button></div>';
    var keep = $('saQ') ? $('saQ').value : '';
    v.innerHTML = h; if ($('saQ')) $('saQ').value = keep;
    var m2 = v.closest('.main'); if (m2) m2.scrollTop = m2.scrollHeight;
  }
  function send(text) {
    text = String(text || '').trim().slice(0, 400);
    if (!text || busy) return;
    msgs.push({ r: 'u', t: text }); busy = true; if ($('saQ')) $('saQ').value = ''; render();
    ask(text, function (st) { var e = $('saStatus'); if (e) e.textContent = st; }).then(function (r) {
      msgs.push({ r: 'a', t: r.text, k: r.kind, s: r.sources }); busy = false; saveH(); render();
    });
  }
  function onClick(e) {
    var b = e.target.closest ? e.target.closest('[data-a],[data-q]') : null; if (!b) return;
    if (b.getAttribute('data-q')) return send(b.getAttribute('data-q'));
    var a = b.getAttribute('data-a');
    if (a === 'back') { if (typeof window.showView === 'function') window.showView('seerahView', 'سیرەی پێغەمبەر'); var bt = document.querySelector('.bottom'); if (bt) bt.classList.remove('hidden'); }
    else if (a === 'send') send($('saQ') && $('saQ').value);
    else if (a === 'clear') { msgs = []; saveH(); render(); }
  }
  window.enterSiraAi = function () {
    css(); if (!ensureView()) return;
    if (typeof window.showView === 'function') window.showView('siraAi', 'پرسیار لە سیرە');
    var bt = document.querySelector('.bottom'); if (bt) bt.classList.add('hidden');
    render();
  };
  window.__siraAiSearch = search;
  window.__siraAiDoc = function (id) { return build().byId[id]; };
  function inject() {
    var g = document.querySelector('#seerahView .sr-home-grid');
    if (!g || g.querySelector('#siraAiEntry')) return;
    css();
    var d = document.createElement('div'); d.className = 'sr-home-tile'; d.id = 'siraAiEntry';
    d.innerHTML = '<span>🤖</span><b>پرسیار لە سیرە</b><small>AI</small>';
    d.onclick = window.enterSiraAi; g.appendChild(d);
  }
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && e.target && e.target.id === 'saQ') { e.preventDefault(); send(e.target.value); } });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
