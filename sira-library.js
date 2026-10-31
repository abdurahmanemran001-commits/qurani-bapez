/* sira-library.js v1 — full text of Ibn Hisham's al-Sira al-Nabawiyya (1598 pages) with table of contents,
 * Arabic search, page reader, and on-demand translation (Kurdish + other languages) via the Worker. */
(function () {
  if (window.__siraLibV1) return;
  window.__siraLibV1 = true;
  var $ = function (id) { return document.getElementById(id); };
  var POS = 'sira_pos_v1', TRK = 'sira_tr_v1', SZ = 'sira_size_v1';
  var LANGS = [['ku', 'کوردی'], ['en', 'English'], ['tr', 'Türkçe'], ['fa', 'فارسی'], ['ur', 'اردو'], ['fr', 'Français'], ['de', 'Deutsch'], ['id', 'Indonesia'], ['ru', 'Русский'], ['es', 'Español'], ['ar', 'العربية (سادە)']];
  var KEY = { 233: 'ژنهێنانی پێغەمبەر بە خەدیجە', 305: 'ئیسلامبوونی خەدیجە و یەکەم باوەڕهێنەران', 324: 'ئاشکراکردنی بانگەواز', 413: 'ئیسلامبوونی عومەر', 469: 'ئیسراء و میعراج', 506: 'بەیعەتی عەقەبەی یەکەم', 556: 'کۆچی پێغەمبەر بۆ مەدینە', 880: 'غەزای ئوحود', 1045: 'غەزای خەندەق', 1150: 'ڕێککەوتنی حودەیبیە و بەیعەتی ڕیزوان', 1224: 'غەزای موئتە', 1397: 'غەزای تەبووک', 1589: 'کۆچی دوایی پێغەمبەر ﷺ' };
  var data = null, loading = null, toc = null, norm = null;
  var st = { tab: 'toc', page: 0, tr: null, lang: 'ku', q: '', hits: [], size: 18 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ep() { try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
  function nz(s) { return String(s).replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي'); }

  function load() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch('sira/ibn-hisham.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (d) {
      data = d.pages; buildToc(); return data;
    }).catch(function (e) { loading = null; throw e; });
    return loading;
  }

  var HEAD = /^(غزوة|ذكر|إسلام|اسلام|بيعة|هجرة|سرية|أمر|حديث|بعث|وفاة|فتح|مباداة|يوم|خبر|قصة|بناء|صلح|حصار|أول|مقتل|إسلام|وفد|وفود|مرض|سبب|تأليف|خروج|استعداد|عمرة|حجة|سقيفة)\s/;
  function buildToc() {
    toc = [];
    data.forEach(function (p, i) {
      if (KEY[i]) { toc.push({ i: i, ku: KEY[i], ar: p[2].split(' ').slice(0, 8).join(' '), key: true }); return; }
      var t = p[2];
      if (HEAD.test(t) && t.length > 60) toc.push({ i: i, ar: t.split(' ').slice(0, 7).join(' ') });
    });
    norm = null;
  }

  function css() {
    if ($('siraCss')) return;
    var s = document.createElement('style'); s.id = 'siraCss';
    s.textContent = [
      'body:has(#siraLib.active) .top{display:none!important}',
      '.phone:has(#siraLib.active) .status,.phone:has(#siraLib.active) .appbar,.phone:has(#siraLib.active) .bottom{display:none!important}',
      '.phone:has(#siraLib.active) .main{height:100%!important;padding:0!important;background:#f7f4ef}',
      '#siraLib{display:none!important}',
      '#siraLib.active{display:flex!important;flex-direction:column;height:100%;box-sizing:border-box}',
      '#siraLib .sl-head{padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#6b3f1d,#4a2a12);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px}',
      '#siraLib .sl-head h2{margin:0;font-size:17px}#siraLib .sl-head small{display:block;font-size:11px;opacity:.9;margin-top:2px}',
      '#siraLib .sl-b{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#siraLib .sl-tabs{display:flex;background:#fff;border-bottom:1px solid #e4d5ad}',
      '#siraLib .sl-tabs button{flex:1;border:0;background:none;padding:11px 4px;font:inherit;font-size:13px;color:#7a6a3a;cursor:pointer;border-bottom:3px solid transparent}',
      '#siraLib .sl-tabs button.on{color:#4a2a12;font-weight:800;border-bottom-color:#b48a3c}',
      '#siraLib .sl-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#siraLib input[type=search],#siraLib input[type=number]{width:100%;box-sizing:border-box;padding:10px;border:1px solid #e4d5ad;border-radius:12px;font:inherit;font-size:14px;margin-bottom:10px}',
      '#siraLib .sl-item{background:#fff;border:1px solid #e4d5ad;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer}',
      '#siraLib .sl-item b{display:block;font-size:14px;color:#3d2a14}',
      '#siraLib .sl-item small{color:#8a6a24;font-size:11px}',
      '#siraLib .sl-item.key{border-color:#b48a3c;background:#fbf5e7}',
      '#siraLib .sl-ar{direction:rtl;text-align:right;line-height:2.1;color:#2b2415;font-family:"Amiri","Scheherazade New","Traditional Arabic",serif;background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:14px}',
      '#siraLib .sl-tr{margin-top:10px;padding:12px;background:#f1f8f3;border-radius:12px;line-height:2;color:#173f35;font-size:15px;white-space:pre-wrap}',
      '#siraLib .sl-nav{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}',
      '#siraLib .sl-nav button,#siraLib .sl-nav select{border:1px solid #d8c68f;background:#fbf5e7;color:#5a4a1c;border-radius:10px;padding:8px 11px;font:inherit;font-size:13px;cursor:pointer}',
      '#siraLib .sl-nav .pri{background:#176b4b;color:#fff;border-color:#176b4b}',
      '#siraLib .sl-msg{padding:16px;text-align:center;color:#6b5a2a;font-size:13px;line-height:1.9}',
      '#siraLib mark{background:#ffe9a8;padding:0 1px}',
      '#siraEntry{grid-column:1/-1;background:linear-gradient(135deg,#6b3f1d,#4a2a12)!important;color:#fff!important;border:0!important}#siraEntry b,#siraEntry small{color:#fff!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main'); if (!main) return null;
    var v = $('siraLib'); if (v) return v;
    v = document.createElement('div'); v.id = 'siraLib'; v.className = 'view'; main.appendChild(v); return v;
  }

  function chrome(sub) {
    return '<div class="sl-head"><div><h2>📜 سیرەی ئیبن هیشام — تەواو</h2><small>' + esc(sub) + '</small></div>' +
      '<button type="button" class="sl-b" data-a="back">‹ سیرە</button></div>' +
      '<div class="sl-tabs"><button data-a="tab" data-t="toc"' + (st.tab === 'toc' ? ' class="on"' : '') + '>فەهرەست</button>' +
      '<button data-a="tab" data-t="search"' + (st.tab === 'search' ? ' class="on"' : '') + '>گەڕان</button>' +
      '<button data-a="tab" data-t="read"' + (st.tab === 'read' ? ' class="on"' : '') + '>خوێندنەوە</button></div>';
  }

  function render() {
    var v = ensureView(); if (!v) return;
    var sub = data ? data.length + ' لاپەڕە · دەقی تەواوی عەرەبی + وەرگێڕان' : '… بارکردن';
    var body = '';
    if (!data) body = '<div class="sl-msg">… بارکردنی کتێبەکە (یەکەم جار نزیکەی ٢ MB)</div>';
    else if (st.tab === 'toc') body = renderToc();
    else if (st.tab === 'search') body = renderSearch();
    else body = renderRead();
    var keep = v.querySelector('.sl-body'), top = keep ? keep.scrollTop : 0, qv = $('slQ') ? $('slQ').value : null, hadFocus = document.activeElement && document.activeElement.id === 'slQ';
    v.innerHTML = chrome(sub) + '<div class="sl-body" id="slBody">' + body + '</div>';
    if ($('slQ') && qv != null) { $('slQ').value = qv; if (hadFocus) $('slQ').focus(); }
    if (st.keepScroll) { $('slBody').scrollTop = top; }
  }

  function renderToc() {
    var last = jget(POS, 0);
    var f = $('slQ') ? $('slQ').value.trim() : (st.tf || '');
    var list = toc;
    if (f) { var nf = nz(f); list = toc.filter(function (t) { return nz((t.ku || '') + ' ' + t.ar).indexOf(nf) >= 0; }); }
    var h = '<input type="search" id="slQ" data-a="tocf" placeholder="گەڕان لە فەهرەست (عەرەبی یان کوردی)..." value="' + esc(f) + '">';
    if (!f && last > 0) h += '<div class="sl-item key" data-a="open" data-i="' + last + '"><b>↩ بەردەوامبوون لە خوێندنەوە</b><small>لاپەڕەی ' + (last + 1) + '</small></div>';
    h += '<div class="sl-item" data-a="open" data-i="0"><b>دەستپێکی کتێب</b><small>لاپەڕەی ١</small></div>';
    list.forEach(function (t) {
      h += '<div class="sl-item' + (t.key ? ' key' : '') + '" data-a="open" data-i="' + t.i + '"><b>' + esc(t.ku || t.ar) + '</b><small>' + (t.ku ? esc(t.ar) + ' · ' : '') + 'لاپەڕەی ' + (t.i + 1) + '</small></div>';
    });
    if (!list.length) h += '<div class="sl-msg">هیچ نەدۆزرایەوە.</div>';
    return h;
  }

  function renderSearch() {
    var h = '<input type="search" id="slQ" data-a="sq" placeholder="وشە یان ناو بنووسە بە عەرەبی (مثلاً: بيعة العقبة)" value="' + esc(st.q) + '">' +
      '<div class="sl-nav"><button class="pri" data-a="dosearch">بگەڕێ</button></div>';
    if (st.searched) {
      h += '<div class="sl-msg" style="padding:6px">' + st.hits.length + (st.hits.length >= 60 ? '+' : '') + ' ئەنجام</div>';
      st.hits.forEach(function (x) {
        h += '<div class="sl-item" data-a="open" data-i="' + x.i + '"><small>لاپەڕەی ' + (x.i + 1) + '</small><div style="direction:rtl;text-align:right;font-size:14px;line-height:1.9">' + x.snip + '</div></div>';
      });
    } else h += '<div class="sl-msg">گەڕان لەناو هەموو ' + data.length + ' لاپەڕەی کتێبەکە دەکرێت. بۆ گەڕانی کوردی/English لە «گەڕانی زیرەکی حەدیس» یان ئەی ئای شەرعی بەکاربهێنە.</div>';
    return h;
  }

  function doSearch() {
    var q = ($('slQ').value || '').trim(); st.q = q; st.searched = true; st.hits = [];
    if (!q) { render(); return; }
    if (!norm) norm = data.map(function (p) { return nz(p[2]); });
    var parts = nz(q).split(/\s+/).filter(Boolean);
    for (var i = 0; i < norm.length && st.hits.length < 60; i++) {
      var ok = true; for (var k = 0; k < parts.length; k++) if (norm[i].indexOf(parts[k]) < 0) { ok = false; break; }
      if (!ok) continue;
      var raw = data[i][2], j = norm[i].indexOf(parts[0]);
      var a = Math.max(0, j - 60), snip = esc(raw.slice(a, j + 140));
      st.hits.push({ i: i, snip: (a > 0 ? '… ' : '') + snip + ' …' });
    }
    render();
  }

  function trKey(i, lang) { return i + '|' + lang; }
  function renderRead() {
    var i = st.page, p = data[i];
    var tr = st.trShow || (jget(TRK, {})[trKey(i, st.lang)]);
    var opts = LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === st.lang ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('');
    var title = KEY[i] ? '<div style="font-weight:800;color:#4a2a12;margin-bottom:8px">' + esc(KEY[i]) + '</div>' : '';
    return title + '<div class="sl-nav"><button data-a="prev"' + (i <= 0 ? ' disabled' : '') + '>‹ پێشوو</button>' +
      '<span style="font-size:12px;color:#7a6a3a">لاپەڕە ' + (i + 1) + ' / ' + data.length + ' · بەرگی ' + p[0] + '</span>' +
      '<button data-a="next"' + (i >= data.length - 1 ? ' disabled' : '') + '>دواتر ›</button>' +
      '<button data-a="fs" data-d="2">A+</button><button data-a="fs" data-d="-2">A−</button></div>' +
      '<div class="sl-ar" style="font-size:' + st.size + 'px">' + esc(p[2]) + '</div>' +
      '<div class="sl-nav"><select data-a="lang">' + opts + '</select><button class="pri" data-a="tr">وەرگێڕان</button>' +
      '<button data-a="cp">کۆپی</button><button data-a="goto">بڕۆ بۆ لاپەڕە…</button></div>' +
      (st.trBusy ? '<div class="sl-tr">… وەرگێڕان</div>' : (tr ? '<div class="sl-tr">' + esc(tr) + '</div>' : '')) +
      '<div class="sl-msg" style="font-size:11px">وەرگێڕانەکە بە AI ە و لەوانەیە هەڵەی تێدا بێت؛ بۆ دڵنیابوون سەرچاوە عەرەبییەکە بخوێنەوە.</div>';
  }

  function open(i) {
    st.page = Math.max(0, Math.min(data.length - 1, i)); st.tab = 'read'; st.trShow = null; st.trBusy = false;
    jset(POS, st.page); render(); var b = $('slBody'); if (b) b.scrollTop = 0;
  }

  function translate() {
    var i = st.page, lang = st.lang, c = jget(TRK, {}), k = trKey(i, lang);
    if (c[k]) { st.trShow = c[k]; render(); return; }
    if (!ep()) { alert('خزمەتگوزاریی وەرگێڕان ئامادە نییە'); return; }
    st.trBusy = true; render();
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: data[i][2], lang: lang, kind: 'sira' }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !(d.text || d.ku)) throw new Error(d.message || 'HTTP ' + r.status); return d.text || d.ku; }); })
      .then(function (txt) {
        clearTimeout(t); var cc = jget(TRK, {}), ks = Object.keys(cc); if (ks.length > 150) delete cc[ks[0]]; cc[k] = txt; jset(TRK, cc);
        if (st.page === i && st.lang === lang) st.trShow = txt; st.trBusy = false; render();
      }).catch(function (e) { clearTimeout(t); st.trBusy = false; render(); alert('وەرگێڕان سەرنەکەوت: ' + (e && e.name === 'AbortError' ? 'کات تەواو بوو' : (e.message || e))); });
  }

  function onClick(e) {
    var v = $('siraLib'); if (!v || !v.contains(e.target)) return;
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a');
    if (a === 'back') { if (typeof window.enterSeerah === 'function') window.enterSeerah(); return; }
    if (a === 'tab') { st.tab = t.getAttribute('data-t'); st.trShow = null; render(); return; }
    if (a === 'open') return open(Number(t.getAttribute('data-i')));
    if (a === 'prev') return open(st.page - 1);
    if (a === 'next') return open(st.page + 1);
    if (a === 'fs') { st.size = Math.max(14, Math.min(32, st.size + Number(t.getAttribute('data-d')))); jset(SZ, st.size); st.keepScroll = true; render(); st.keepScroll = false; return; }
    if (a === 'tr') return translate();
    if (a === 'cp') { var tx = data[st.page][2] + (st.trShow ? '\n\n' + st.trShow : ''); if (navigator.clipboard) navigator.clipboard.writeText(tx).then(function () { t.textContent = '✓'; }); return; }
    if (a === 'goto') { var n = parseInt(prompt('ژمارەی لاپەڕە (١ تا ' + data.length + ')'), 10); if (n >= 1 && n <= data.length) open(n - 1); return; }
    if (a === 'dosearch') return doSearch();
  }
  function onChange(e) {
    var t = e.target; if (!$('siraLib') || !$('siraLib').contains(t)) return;
    if (t.getAttribute('data-a') === 'lang') { st.lang = t.value; st.trShow = null; render(); }
  }
  function onInput(e) {
    var t = e.target; if (!$('siraLib') || !$('siraLib').contains(t)) return;
    if (t.getAttribute('data-a') === 'tocf') { st.tf = t.value; var b = $('slBody'); var pos = t.selectionStart; render(); var q = $('slQ'); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (x) {} } }
  }
  function onKey(e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'slQ' && e.target.getAttribute('data-a') === 'sq') { e.preventDefault(); doSearch(); }
  }

  function enter() {
    css(); if (!ensureView()) return; st.size = jget(SZ, 18);
    var last = jget(POS, 0);
    if (typeof window.showView === 'function') window.showView('siraLib', 'سیرەی ئیبن هیشام'); else if (typeof showView === 'function') showView('siraLib', 'سیرەی ئیبن هیشام');
    render();
    load().then(function () { st.tab = last > 0 ? 'toc' : 'toc'; render(); }).catch(function () {
      var b = $('slBody'); if (b) b.innerHTML = '<div class="sl-msg">بارنەبوو. ئینتەرنێتەکەت بپشکنە و دووبارە بکەرەوە.</div>';
    });
  }
  window.enterSiraLibrary = enter;

  function inject() {
    var g = document.querySelector('#seerahView .sr-home-grid');
    if (!g || g.querySelector('#siraEntry')) return;
    var d = document.createElement('div'); d.className = 'sr-home-tile'; d.id = 'siraEntry';
    d.innerHTML = '<span>📜</span><b>سیرەی تەواو (ئیبن هیشام)</b><small>١٥٩٨ لاپەڕە · وەرگێڕان</small>';
    d.onclick = enter; g.insertBefore(d, g.firstChild);
  }
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKey);
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
