/* companions-ai.js v1 — "Ask about the Companions" AI: long, sourced answers about any companion of the Prophet ﷺ.
 * Evidence: the app's companions library + 13-part biography + Quran/hadith corpus, via Worker /expand + /sahaba-ask. */
(function () {
  if (window.__companionsAiV1) return;
  window.__companionsAiV1 = true;
  var HKEY = 'sahaba_ai_hist_v1';
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
  var OFF = 'ئەم بەشە تەنها لەسەر هاوەڵانی پێغەمبەر ﷺ وەڵام دەداتەوە (پیاو و ژن): ژیان، ئیسلامهێنان، کارەکان، فەزڵ و کۆچی دوایی. ناوی هاوەڵێک بنووسە. بۆ پرسی شەرعی بەشی «ئەی ئای شەرعی» بەکاربهێنە.';
  var NOTF = 'وەڵامێکی متمانەپێکراو بۆ ئەم پرسیارە نەدۆزرایەوە. ناوەکە ڕوونتر بنووسە (بۆ نموونە ناوی تەواو) یان لە زانایەک بپرسە.';

  function norm(s) { return String(s || '').replace(/[ً-ٰٟۖ-ۭ‌‍]/g, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/ھ/g, 'ه').replace(/[ةۀ]/g, 'ە').replace(/[أإآٱ]/g, 'ا').toLowerCase(); }
  function toks(s) { return (norm(s).match(/[؀-ۿa-z0-9]{2,}/g) || []).map(function (w) { return w.slice(0, 6); }); }
  function searchCompanions(terms, k) {
    var data = window.__COMPANIONS_DATA || { chapters: [] }, q = {}, out = [];
    terms.forEach(function (t) { toks(t).forEach(function (x) { q[x] = (q[x] || 0) + 1; }); });
    data.chapters.forEach(function (c) {
      var name = {}, body = {};
      toks(c.ku + ' ' + c.ar).forEach(function (t) { name[t] = 1; });
      toks(String(c.ku_body || '').slice(0, 800)).forEach(function (t) { body[t] = (body[t] || 0) + 1; });
      var sc = 0;
      Object.keys(q).forEach(function (t) { if (name[t]) sc += 6; else if (body[t]) sc += 0.6; });
      if (sc > 2) out.push([c, sc]);
    });
    out.sort(function (a, b) { return b[1] - a[1]; });
    var top = out.length ? out[0][1] : 0;
    return out.filter(function (x) { return x[1] >= top * 0.55; }).slice(0, k).map(function (x) { return x[0]; });
  }
  function byId(id) {
    var key = id.slice(2), cs = (window.__COMPANIONS_DATA || { chapters: [] }).chapters;
    for (var i = 0; i < cs.length; i++) if (cs[i].id === key) return cs[i];
    return null;
  }

  function ask(q, status) {
    status = status || function () {};
    if (!endpoint()) return Promise.resolve({ text: NET, kind: 'error', sources: [] });
    status('… شیکردنەوەی پرسیار');
    return post('/expand', { q: q }, 20000).then(function (ex) {
      if (ex.error) return { text: ex.message || NET, kind: 'error', sources: [] };
      if (ex.refusal && ex.category !== 'general') return { text: OFF, kind: 'off', sources: [] };
      var kws = ex.keywords || [], ku = ex.ku || [];
      status('… گەڕان لە سەرچاوەکان');
      var terms = [q].concat(ku, ku, kws);
      var comps = searchCompanions(terms, 4);
      var story = window.__siraAiSearch ? window.__siraAiSearch([q].concat(ku, ku), 6) : [];
      var prom = window.AiRag ? window.AiRag.load(function () {}).catch(function () {}) : Promise.resolve();
      return prom.then(function () {
        var hits = (window.AiRag && kws.length) ? window.AiRag.search(kws, { kQ: 2, kH: 9 }) : { quran: [], hadith: [] };
        var passages = comps.map(function (c) { return { id: 'c:' + c.id, text: '[کتێبخانەی هاوەڵان · ' + c.ku + ' · ' + c.ar + '] ' + c.ku_body }; });
        story.forEach(function (d) { passages.push({ id: d.id, text: '[ژیاننامە · ' + d.part + ' · ' + d.ch + '] ' + d.text }); });
        hits.quran.concat(hits.hadith).forEach(function (d) {
          passages.push({ id: d.id, text: d.kind === 'quran' ? d.ar + ' — ' + String(d.tafsir || '').slice(0, 500) : '[' + window.AiRag.label(d) + '] ' + String(d.ar).slice(0, 900) });
        });
        status('… نووسینی وەڵامی درێژ (ئەمە کەمێک کات دەبات)');
        return post('/sahaba-ask', { q: q, token: ex.token, passages: passages }, 110000).then(function (an) {
          if (an.error) return { text: (an.message || NET) + (an.detail ? '\n\n[' + an.detail + ']' : ''), kind: 'error', sources: [] };
          if (an.offtopic) return { text: OFF, kind: 'off', sources: [] };
          if (!an.answerable) return { text: NOTF, kind: 'notfound', sources: [] };
          var src = (an.cites || []).map(function (id) {
            var c = id.charAt(0), r;
            if (c === 'c') { r = byId(id); return r ? { label: 'کتێبخانەی هاوەڵان · ' + r.ku, ar: '', ku: String(r.ku_body || '').slice(0, 300) + '…' } : null; }
            if (c === 's') { r = window.__siraAiDoc && window.__siraAiDoc(id); return r ? { label: 'ژیاننامە · ' + r.part + ' · ' + r.ch, ar: '', ku: r.text.slice(0, 320) + (r.text.length > 320 ? '…' : '') } : null; }
            r = window.AiRag && window.AiRag.get(id); return r ? { label: window.AiRag.label(r), ar: r.ar, ku: '' } : null;
          }).filter(Boolean);
          return { text: (an.general ? 'بەشێک لەم وەڵامە لە سەرچاوە مێژووییە کلاسیکییەکانەوەیە (ئیبن سەعد، ئیبن حەجەر، زەهەبی…) و ڕاستەوخۆ لە دەقەکانی ئەپەکە نییە؛ بۆ وردەکاری گرنگ پشتڕاستی بکەرەوە.\n\n' : '') + an.answer, kind: 'answer', sources: src };
        });
      });
    }).catch(function () { return { text: NET, kind: 'error', sources: [] }; });
  }

  var msgs = [], busy = false;
  try { msgs = JSON.parse(localStorage.getItem(HKEY) || '[]') || []; } catch (e) {}
  function saveH() { try { localStorage.setItem(HKEY, JSON.stringify(msgs.slice(-12))); } catch (e) {} }
  function css() {
    if ($('cpaiCss')) return;
    var s = document.createElement('style'); s.id = 'cpaiCss';
    s.textContent = '.phone:has(#companionsAi.active) .appbar,.phone:has(#companionsAi.active) .bottom,.phone:has(#companionsAi.active) .status{display:none!important}' +
      '#companionsAi{direction:rtl;background:#f1f5ef;min-height:100%;display:flex;flex-direction:column}' +
      '#companionsAi .ca-top{display:flex;align-items:center;gap:10px;padding:14px;background:#2f5d46;color:#fff;position:sticky;top:0;z-index:3}' +
      '#companionsAi .ca-top button{background:rgba(255,255,255,.16);border:0;color:#fff;border-radius:10px;padding:8px 12px;font:inherit;font-size:15px}#companionsAi .ca-top b{font-size:17px}' +
      '#companionsAi .ca-body{flex:1;padding:12px 12px 90px}' +
      '#companionsAi .ca-hi{background:#fff;border:1px solid #d5e0d3;border-radius:14px;padding:12px;font-size:14px;line-height:1.9;color:#2a2a22;margin-bottom:10px}' +
      '#companionsAi .ca-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}#companionsAi .ca-chip{background:#fff;border:1px solid #bdd0bb;border-radius:16px;padding:6px 11px;font:inherit;font-size:13px;color:#2f5d46}' +
      '#companionsAi .ca-m{margin-bottom:10px;padding:11px 13px;border-radius:14px;font-size:15px;line-height:2;white-space:pre-wrap;word-wrap:break-word}' +
      '#companionsAi .ca-m.u{background:#2f5d46;color:#fff;margin-left:30px}#companionsAi .ca-m.a{background:#fff;border:1px solid #d5e0d3;color:#1f2a24}#companionsAi .ca-m.e{background:#fff3e0;border:1px solid #f0cf9b;color:#6b4a12}' +
      '#companionsAi .ca-src{margin-top:8px;border-top:1px dashed #bdd0bb;padding-top:6px;font-size:13px;white-space:normal}#companionsAi .ca-src b{display:block;color:#8a6a24;font-size:12px;margin-top:6px}' +
      '#companionsAi .ca-src .ar{font-family:"Amiri","Scheherazade New",serif;font-size:17px;line-height:2;color:#2f5d46}#companionsAi .ca-src .ku{color:#4a4a3e;line-height:1.8}' +
      '#companionsAi .ca-bar{position:sticky;bottom:0;display:flex;gap:8px;padding:10px;background:#f1f5ef;border-top:1px solid #d5e0d3}' +
      '#companionsAi textarea{flex:1;font:inherit;font-size:15px;border:1px solid #bdd0bb;border-radius:12px;padding:9px 11px;resize:none;height:46px;background:#fff;color:#1f2a24}' +
      '#companionsAi .ca-send{background:#2f5d46;color:#fff;border:0;border-radius:12px;padding:0 18px;font:inherit;font-size:15px}#companionsAi .ca-send[disabled]{opacity:.5}' +
      '#cpAiEntry{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;margin-bottom:12px;padding:13px 14px;border:0;border-radius:14px;background:linear-gradient(135deg,#2f5d46,#1f4132);color:#fff;font:inherit;text-align:right;cursor:pointer}' +
      '#cpAiEntry span{font-size:24px}#cpAiEntry b{display:block;font-size:15px}#cpAiEntry small{display:block;font-size:12px;opacity:.9;margin-top:2px}';
    document.head.appendChild(s);
  }
  var CHIPS = ['ئەبوبەکر سدیق کێ بوو؟', 'ژیانی عومەری کوڕی خەتتاب', 'خالیدی کوڕی وەلید', 'عائیشەی دایکی ئیمانداران', 'بیلاڵی کوڕی ڕەباح', 'ئەبوهورەیرە', 'سەلمانی فارسی', 'خەدیجەی کچی خوەیلید'];
  function ensureView() {
    if ($('companionsAi')) return $('companionsAi');
    var z = $('zikr'); if (!z || !z.parentNode) return null;
    var v = document.createElement('section'); v.id = 'companionsAi'; v.className = 'view'; z.parentNode.appendChild(v);
    v.addEventListener('click', onClick);
    return v;
  }
  function render() {
    var v = $('companionsAi'); if (!v) return;
    var h = '<div class="ca-top"><button data-a="back">‹ گەڕانەوە</button><b>🤖 پرسیار لە هاوەڵان</b>' + (msgs.length ? '<button data-a="clear" style="margin-right:auto">پاککردنەوە</button>' : '') + '</div><div class="ca-body">';
    if (!msgs.length) {
      h += '<div class="ca-hi">ناوی هەر <b>هاوەڵێکی پێغەمبەر ﷺ</b> (پیاو یان ژن) بنووسە و وەڵامێکی درێژ وەردەگریت: ڕەچەڵەک، ئیسلامهێنان، کارە گرنگەکان لەگەڵ پێغەمبەر ﷺ، فەزڵ و فەرمودە ڕاستەکان، ژیانی دوای پێغەمبەر ﷺ و کۆچی دوایی. سەرچاوە و ئاستی متمانەی هەر شتێک نیشان دەدرێت. وەڵامەکە کەمێک کات دەبات چونکە درێژە.</div><div class="ca-chips">' +
        CHIPS.map(function (c) { return '<button class="ca-chip" data-q="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    }
    msgs.forEach(function (m) {
      if (m.r === 'u') { h += '<div class="ca-m u">' + esc(m.t) + '</div>'; return; }
      h += '<div class="ca-m ' + (m.k === 'answer' ? 'a' : 'e') + '">' + esc(m.t);
      if (m.s && m.s.length) h += '<div class="ca-src"><b>سەرچاوەکان</b>' + m.s.map(function (s) { return '<b>' + esc(s.label) + '</b>' + (s.ar ? '<div class="ar">' + esc(s.ar) + '</div>' : '') + (s.ku ? '<div class="ku">' + esc(s.ku) + '</div>' : ''); }).join('') + '</div>';
      h += '</div>';
    });
    if (busy) h += '<div class="ca-m e" id="caStatus">…</div>';
    h += '</div><div class="ca-bar"><textarea id="caQ" placeholder="ناوی هاوەڵ یان پرسیارەکەت بنووسە…"></textarea><button class="ca-send" data-a="send"' + (busy ? ' disabled' : '') + '>ناردن</button></div>';
    var keep = $('caQ') ? $('caQ').value : '';
    v.innerHTML = h; if ($('caQ')) $('caQ').value = keep;
    var m2 = v.closest('.main'); if (m2) m2.scrollTop = busy || !msgs.length ? m2.scrollHeight : m2.scrollTop;
  }
  function send(text) {
    text = String(text || '').trim().slice(0, 400);
    if (!text || busy) return;
    msgs.push({ r: 'u', t: text }); busy = true; if ($('caQ')) $('caQ').value = ''; render();
    ask(text, function (st) { var e = $('caStatus'); if (e) e.textContent = st; }).then(function (r) {
      msgs.push({ r: 'a', t: r.text, k: r.kind, s: r.sources }); busy = false; saveH(); render();
      var m2 = $('companionsAi') && $('companionsAi').closest('.main'); if (m2) { var last = $('companionsAi').querySelectorAll('.ca-m'); if (last.length) { try { last[last.length - 1].scrollIntoView({ block: 'start' }); } catch (e) {} } }
    });
  }
  function onClick(e) {
    var b = e.target.closest ? e.target.closest('[data-a],[data-q]') : null; if (!b) return;
    if (b.getAttribute('data-q')) return send(b.getAttribute('data-q'));
    var a = b.getAttribute('data-a');
    if (a === 'back') { if (typeof window.showView === 'function') window.showView('companionsView', 'سیرەی هاوەڵان'); var bt = document.querySelector('.bottom'); if (bt) bt.classList.remove('hidden'); if (window.enterCompanions) window.enterCompanions(); }
    else if (a === 'send') send($('caQ') && $('caQ').value);
    else if (a === 'clear') { msgs = []; saveH(); render(); }
  }
  window.enterCompanionsAi = function () {
    css(); if (!ensureView()) return;
    if (typeof window.showView === 'function') window.showView('companionsAi', 'پرسیار لە هاوەڵان');
    var bt = document.querySelector('.bottom'); if (bt) bt.classList.add('hidden');
    render();
  };
  window.__companionsAiSearch = searchCompanions;
  function inject() {
    var body = document.querySelector('#companionsView .cp-body');
    if (!body || body.querySelector('#cpAiEntry') || !body.querySelector('.cp-search')) return;
    css();
    var b = document.createElement('button'); b.type = 'button'; b.id = 'cpAiEntry';
    b.innerHTML = '<span>🤖</span><div><b>پرسیار لە هاوەڵان (AI)</b><small>ناوی هەر هاوەڵێک بنووسە، وەڵامی درێژ بە سەرچاوەوە</small></div>';
    b.onclick = window.enterCompanionsAi; body.insertBefore(b, body.firstChild);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && e.target && e.target.id === 'caQ') { e.preventDefault(); send(e.target.value); } });
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
