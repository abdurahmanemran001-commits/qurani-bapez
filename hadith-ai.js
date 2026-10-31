/* hadith-ai.js v1 — "AI hadith search": ask in any language, get matching hadiths (Arabic text, source, grade)
 * and translate each one on demand. Standalone; uses AiRag (offline corpus) + the Worker (/expand, /translate). */
(function () {
  if (window.__hadithAiV1) return;
  window.__hadithAiV1 = true;
  var $ = function (id) { return document.getElementById(id); };
  var CK = 'hdai_tr_v1';
  var LANGS = [['ku', 'کوردی'], ['en', 'English'], ['tr', 'Türkçe'], ['fa', 'فارسی'], ['ur', 'اردو'], ['fr', 'Français'], ['de', 'Deutsch'], ['id', 'Indonesia'], ['ru', 'Русский'], ['es', 'Español'], ['ar', 'العربية (سادە)']];
  var results = [], lastQ = '', busy = false;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ep() { try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
  function cache() { try { return JSON.parse(localStorage.getItem(CK) || '{}') || {}; } catch (e) { return {}; } }
  function saveCache(k, v) { try { var c = cache(), ks = Object.keys(c); if (ks.length > 300) delete c[ks[0]]; c[k] = v; localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} }

  function post(path, body, ms) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
    return fetch(ep() + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (d) { clearTimeout(t); if (!r.ok && !d.error) d.error = 'http'; return d; }); })
      .catch(function (e) { clearTimeout(t); throw e; });
  }

  function css() {
    if ($('hdAiCss')) return;
    var s = document.createElement('style'); s.id = 'hdAiCss';
    s.textContent = [
      'body:has(#hadithAi.active) .top{display:none!important}',
      '.phone:has(#hadithAi.active) .status,.phone:has(#hadithAi.active) .appbar,.phone:has(#hadithAi.active) .bottom{display:none!important}',
      '.phone:has(#hadithAi.active) .main{height:100%!important;padding:0!important;background:#f7f4ef}',
      '#hadithAi{display:none!important}',
      '#hadithAi.active{display:flex!important;flex-direction:column;height:100%;box-sizing:border-box}',
      '#hadithAi .ha-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#176b4b,#0f4d36);color:#fff}',
      '#hadithAi .ha-head h2{margin:0;font-size:17px}',
      '#hadithAi .ha-head small{display:block;font-size:11px;opacity:.9;margin-top:2px}',
      '#hadithAi .ha-back{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#hadithAi .ha-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#hadithAi .ha-box{display:flex;gap:8px;padding:10px 14px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #e4d5ad}',
      '#hadithAi textarea{flex:1;border:1px solid #e4d5ad;border-radius:12px;padding:10px;font:inherit;font-size:14px;resize:none;min-height:42px;max-height:110px;box-sizing:border-box}',
      '#hadithAi .ha-go{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:0 16px;font-size:14px;cursor:pointer}',
      '#hadithAi .ha-go[disabled]{opacity:.55}',
      '#hadithAi .ha-card{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:12px 14px;margin-bottom:10px}',
      '#hadithAi .ha-src{font-size:12px;color:#8a6a24;font-weight:700;margin-bottom:6px}',
      '#hadithAi .ha-ar{font-size:17px;line-height:2;color:#2b2415;direction:rtl;text-align:right;font-family:"Amiri","Scheherazade New","Traditional Arabic",serif}',
      '#hadithAi .ha-tr{margin-top:8px;padding:9px 11px;background:#f1f8f3;border-radius:10px;font-size:14px;line-height:1.9;color:#173f35}',
      '#hadithAi .ha-act{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center}',
      '#hadithAi .ha-act button,#hadithAi .ha-act select{border:1px solid #d8c68f;background:#fbf5e7;color:#5a4a1c;border-radius:10px;padding:6px 10px;font-size:12px;cursor:pointer;font-family:inherit}',
      '#hadithAi .ha-msg{padding:14px;text-align:center;color:#6b5a2a;font-size:13px;line-height:1.9;white-space:pre-wrap}',
      '#hdAiEntry{background:linear-gradient(135deg,#176b4b,#0f4d36)!important;color:#fff!important;border:0!important}',
      '#hdAiEntry b,#hdAiEntry small{color:#fff!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main'); if (!main) return null;
    var v = $('hadithAi'); if (v) return v;
    v = document.createElement('div'); v.id = 'hadithAi'; v.className = 'view'; main.appendChild(v);
    return v;
  }

  function langOpts() { return LANGS.map(function (l) { return '<option value="' + l[0] + '">' + l[1] + '</option>'; }).join(''); }

  function draw(msg) {
    var b = $('haBody'); if (!b) return;
    if (msg) { b.innerHTML = '<div class="ha-msg">' + esc(msg) + '</div>'; return; }
    if (!results.length) { b.innerHTML = '<div class="ha-msg">پرسیار یان بابەتێک بنووسە بە هەر زمانێک (کوردی، عەرەبی، English، Türkçe، فارسی...) و حەدیسە پەیوەندیدارەکان دەدۆزمەوە.\n\nنموونە: «فەزڵی ڕاستگۆیی»، «حدیث عن بر الوالدین»، «hadith about patience»</div>'; return; }
    b.innerHTML = '<div class="ha-msg" style="padding:0 0 10px">' + results.length + ' حەدیس دۆزرایەوە</div>' + results.map(function (d, i) {
      var tr = cache()[d.id + '|' + (d._lang || '')];
      return '<div class="ha-card" data-i="' + i + '"><div class="ha-src">' + esc(window.AiRag.label(d)) + '</div>' +
        '<div class="ha-ar">' + esc(d.ar) + '</div>' +
        (d._tr ? '<div class="ha-tr">' + esc(d._tr) + '</div>' : '') +
        '<div class="ha-act"><select data-sel="' + i + '">' + langOpts() + '</select>' +
        '<button type="button" data-tr="' + i + '">وەرگێڕان</button>' +
        '<button type="button" data-cp="' + i + '">کۆپی</button>' +
        '<button type="button" data-sh="' + i + '">شەیر</button></div></div>';
    }).join('');
    results.forEach(function (d, i) { var s = b.querySelector('[data-sel="' + i + '"]'); if (s && d._lang) s.value = d._lang; });
  }

  function search() {
    if (busy) return;
    var inp = $('haQ'); var q = (inp.value || '').trim(); if (!q) return;
    busy = true; lastQ = q; $('haGo').disabled = true; results = [];
    draw('… گەڕان بەدوای حەدیسەکاندا');
    var kwP = ep() ? post('/expand', { q: q }, 20000).catch(function () { return null; }) : Promise.resolve(null);
    kwP.then(function (ex) {
      if (ex && ex.refusal) { draw(ex.refusal); return; }
      if (ex && ex.error === 'rate') { draw(ex.message); return; }
      var kws = (ex && ex.keywords) || [];
      kws = kws.concat([q]);
      return window.AiRag.load(function (p) { draw('… بارکردنی حەدیسەکان ' + Math.round(p * 100) + '٪'); }).then(function () {
        var hits = window.AiRag.search(kws, { kQ: 1, kH: 15 });
        results = hits.hadith;
        if (!results.length) draw('هیچ حەدیسێکی پەیوەندیدار نەدۆزرایەوە. بە وشەی جیاواز یان بە عەرەبی تاقی بکەرەوە.');
        else draw();
      });
    }).catch(function () { draw('هەڵەیەک ڕوویدا. ئینتەرنێتەکەت بپشکنە و دووبارە هەوڵ بدەرەوە.'); })
      .then(function () { busy = false; var g = $('haGo'); if (g) g.disabled = false; });
  }

  function translate(i) {
    var d = results[i]; if (!d) return;
    var sel = document.querySelector('#hadithAi [data-sel="' + i + '"]'); var lang = sel ? sel.value : 'ku';
    var key = d.id + '|' + lang, c = cache()[key];
    if (c) { d._tr = c; d._lang = lang; draw(); return; }
    if (!ep()) { alert('خزمەتگوزاریی وەرگێڕان ئامادە نییە'); return; }
    var btn = document.querySelector('#hadithAi [data-tr="' + i + '"]'); if (btn) { btn.disabled = true; btn.textContent = '…'; }
    post('/translate', { ar: d.ar, lang: lang }, 40000).then(function (r) {
      if (!r.ku && !r.text) throw new Error(r.message || 'هەڵە');
      d._tr = r.text || r.ku; d._lang = lang; saveCache(key, d._tr); draw();
    }).catch(function (e) {
      alert('وەرگێڕان سەرنەکەوت: ' + (e && e.name === 'AbortError' ? 'کات تەواو بوو' : (e.message || e)));
      draw();
    });
  }

  function text(d) { return d.ar + (d._tr ? '\n\n' + d._tr : '') + '\n\n— ' + window.AiRag.label(d); }

  function onClick(e) {
    var v = $('hadithAi'); if (!v || !v.contains(e.target)) return;
    var t = e.target.closest('[data-act],[data-tr],[data-cp],[data-sh]'); if (!t) return;
    if (t.getAttribute('data-act') === 'back') { if (typeof window.enterHadith === 'function') window.enterHadith(); return; }
    if (t.getAttribute('data-act') === 'go') { search(); return; }
    var i;
    if ((i = t.getAttribute('data-tr')) !== null) return translate(Number(i));
    if ((i = t.getAttribute('data-cp')) !== null) { var tx = text(results[Number(i)]); if (navigator.clipboard) navigator.clipboard.writeText(tx).then(function () { t.textContent = '✓'; setTimeout(function () { t.textContent = 'کۆپی'; }, 1200); }); return; }
    if ((i = t.getAttribute('data-sh')) !== null) { var tx2 = text(results[Number(i)]); if (navigator.share) navigator.share({ text: tx2 }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(tx2); return; }
  }

  function enter() {
    css(); var v = ensureView(); if (!v) return;
    v.innerHTML = '<div class="ha-head"><div><h2>🔎 گەڕانی زیرەکی حەدیس</h2><small>بە هەر زمانێک بنووسە · عەرەبی + وەرگێڕان</small></div><button type="button" class="ha-back" data-act="back">‹ حەدیس</button></div>' +
      '<div class="ha-body" id="haBody"></div>' +
      '<div class="ha-box"><textarea id="haQ" rows="1" placeholder="بابەت یان پرسیار بنووسە..."></textarea><button type="button" class="ha-go" id="haGo" data-act="go">بگەڕێ</button></div>';
    $('haQ').value = lastQ;
    $('haQ').onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); search(); } };
    draw();
    if (typeof window.showView === 'function') window.showView('hadithAi', 'گەڕانی حەدیس');
    else if (typeof showView === 'function') showView('hadithAi', 'گەڕانی حەدیس');
    try { window.AiRag && window.AiRag.load().catch(function () {}); } catch (e) {}
  }
  window.enterHadithAi = enter;

  /* entry card on the hadith home screen (hadith.js re-renders, so re-inject) */
  function inject() {
    var body = document.querySelector('#hadithView.active .hd-body');
    if (!body || body.querySelector('#hdAiEntry') || !body.querySelector('.hd-search')) return;
    var c = document.createElement('div');
    c.className = 'hd-card'; c.id = 'hdAiEntry';
    c.innerHTML = '<b>🔎 گەڕانی زیرەکی حەدیس (AI)</b><small>بە هەر زمانێک بپرسە، حەدیسەکان بدۆزەرەوە و وەریبگێڕە</small>';
    c.onclick = enter;
    var s = body.querySelector('.hd-search'); s.parentNode.insertBefore(c, s.nextSibling);
  }
  document.addEventListener('click', onClick);
  function start() { css(); new MutationObserver(function () { inject(); }).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
