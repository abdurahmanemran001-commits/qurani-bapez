/* New top bar (replaces the green header + bottom nav): Home, Mushaf, Qira'at, Search, Settings (size / font / colour / background / language) */
(function () {
  if (window.__topbar) return; window.__topbar = true;
  var ls = { get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  function $(i) { return document.getElementById(i); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- preferences ---------- */
  var FONTS = { '': 'پێشوو', 'Amiri': 'Amiri', 'Noto Naskh Arabic': 'Noto Naskh', 'Scheherazade New': 'Scheherazade', 'Vazirmatn': 'Vazirmatn', 'Tahoma': 'Tahoma' };
  var BGS = [['', 'ئاسایی', '', ''], ['#fff8e7', 'کرێم', '#fff8e7', '#2b2b2b'], ['#eef6f0', 'سەوزی کاڵ', '#eef6f0', '#1d2d24'], ['#eceff1', 'خۆڵەمێشی', '#eceff1', '#222'], ['#1e2a26', 'تاریک', '#1e2a26', '#e9efe9'], ['#000000', 'ڕەش', '#000', '#e6e6e6']];
  var COLORS = ['', '#1d6b4d', '#173d70', '#6b321e', '#4a2c6b', '#111111'];
  var P = { size: 100, font: '', color: '', bg: '' };
  try { var sv = JSON.parse(ls.get('ui_prefs', '{}')); for (var k in sv) if (k in P) P[k] = sv[k]; } catch (e) {}
  var fontLink = null;
  function applyPrefs() {
    var css = '';
    css += '.phone .main{zoom:' + (P.size / 100) + '}';
    if (P.font) css += '.phone .main,.phone .main *:not(.choice-icon):not(.num):not(.arrow){font-family:"' + P.font + '",system-ui,sans-serif!important}';
    var bg = BGS.filter(function (b) { return b[0] === P.bg; })[0];
    if (P.bg) css += '.phone,.phone .main,.phone .view{background:' + P.bg + '!important}.phone .surah,.phone .card,.phone .section-choice,.phone .tab:not(.on){background:' + (P.bg === '#000000' || P.bg === '#1e2a26' ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.7)') + '!important}';
    var txt = P.color || (bg && bg[3]) || '';
    if (txt) css += '.phone .main,.phone .main b,.phone .main h2,.phone .main h3,.phone .main small,.phone .main p{color:' + txt + '!important}';
    var st = $('tbPrefs'); if (!st) { st = document.createElement('style'); st.id = 'tbPrefs'; document.head.appendChild(st); }
    st.textContent = css;
    if (P.font && ['Tahoma', ''].indexOf(P.font) < 0) {
      if (!fontLink) { fontLink = document.createElement('link'); fontLink.rel = 'stylesheet'; document.head.appendChild(fontLink); }
      fontLink.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(P.font).replace(/%20/g, '+') + '&display=swap';
    }
  }
  function savePrefs() { ls.set('ui_prefs', JSON.stringify(P)); applyPrefs(); }
  applyPrefs();

  /* ---------- styles ---------- */
  var st = document.createElement('style');
  st.textContent = [
    '.appbar,.bottom,.status{display:none!important}',
    '#tb{position:sticky;top:0;z-index:50;display:flex;gap:4px;padding:8px 6px;background:#1b6b4b;box-shadow:0 2px 10px #0003}',
    '#tb button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;border:0;background:transparent;color:#fff;font:inherit;font-size:11px;padding:6px 0;border-radius:10px;cursor:pointer}',
    '#tb button span{font-size:20px;line-height:1}',
    '#tb button.on,#tb button:active{background:rgba(255,255,255,.18)}',
    '#tbSheet{position:fixed;inset:0;z-index:9000;display:none;background:rgba(0,0,0,.45);align-items:flex-end;justify-content:center}',
    '#tbSheet.on{display:flex}',
    '#tbSheet .tbBox{width:100%;max-width:560px;max-height:88vh;overflow:auto;background:#fff;color:#1b1b1b;border-radius:18px 18px 0 0;padding:14px 14px 22px;direction:rtl;font-family:inherit}',
    '#tbSheet h3{margin:0 0 10px;font-size:18px}',
    '#tbSheet .tbX{float:left;border:0;background:#eee;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}',
    '#tbSheet .tbRow{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 14px}',
    '#tbSheet .tbChip{padding:9px 13px;border:1px solid #cfe0d6;border-radius:12px;background:#fff;cursor:pointer;font:inherit}',
    '#tbSheet .tbChip.on{background:#1b6b4b;color:#fff;border-color:#1b6b4b}',
    '#tbSheet .tbSw{width:36px;height:36px;border-radius:50%;border:2px solid #cfd8d3;cursor:pointer}',
    '#tbSheet .tbSw.on{outline:3px solid #1b6b4b}',
    '#tbSheet input[type=search]{width:100%;box-sizing:border-box;padding:12px;border:1px solid #cfd8d3;border-radius:12px;font:inherit;font-size:16px;margin-bottom:8px}',
    '#tbSheet .tbRes{padding:10px 6px;border-bottom:1px solid #eee;cursor:pointer}',
    '#tbSheet .tbRes b{display:block}',
    '#tbSheet .tbRes small{color:#666}',
    '#tbSheet label{display:block;font-weight:700;margin:8px 0 4px}',
    '#tbSheet input[type=range]{width:100%}'
  ].join('\n');
  document.head.appendChild(st);

  /* ---------- bar ---------- */
  var phone = document.querySelector('.phone');
  var bar = document.createElement('div'); bar.id = 'tb';
  bar.innerHTML = [['tbHome', '⌂', 'سەرەتا'], ['tbMus', '📖', 'موسحەف'], ['tbQ', '🕌', 'قیرائات'], ['tbS', '🔍', 'گەڕان'], ['tbSet', '⚙', 'ڕێکخستن']].map(function (x) { return '<button type="button" id="' + x[0] + '"><span>' + x[1] + '</span>' + x[2] + '</button>'; }).join('');
  if (phone) phone.insertBefore(bar, phone.firstChild);
  /* the bar belongs to the Quran section only: visible on the surah list only; hidden on the start screen, in the dhikr section and inside the mushaf reader */
  function syncBar() {
    var on = ['home'].some(function (id) { var v = $(id); return v && v.classList.contains('active'); });
    bar.style.display = on ? 'flex' : 'none';
    if (!on) { var sh = $('tbSheet'); if (sh) sh.classList.remove('on'); }
  }
  var mainEl = document.querySelector('.main');
  if (mainEl && window.MutationObserver) new MutationObserver(syncBar).observe(mainEl, { attributes: true, attributeFilter: ['class'], subtree: true });
  syncBar();

  var sheet = document.createElement('div'); sheet.id = 'tbSheet';
  sheet.innerHTML = '<div class="tbBox" id="tbBox"></div>';
  document.body.appendChild(sheet);
  sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
  function close() { sheet.classList.remove('on'); }
  function open(html) { $('tbBox').innerHTML = '<button class="tbX" type="button" id="tbClose">×</button>' + html; sheet.classList.add('on'); $('tbClose').onclick = close; }

  $('tbHome').onclick = function () { close(); if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); window.scrollTo(0, 0); };
  $('tbMus').onclick = function () { close(); if (typeof openPage === 'function') openPage(typeof currentPage !== 'undefined' ? currentPage : 1); };

  /* ---------- qira'at ---------- */
  var QIRA = [['q', 'حەفس — موسحەفی مەدینە (ڕەنگاوڕەنگ)'], ['t', 'حەفس — تەجوید'], ['w', 'وەرش عن نافع'], ['k', 'قالون عن نافع'], ['s', 'شوعبە عن عاصم'], ['d', 'دووری عن أبي عمرو'], ['u', 'سووسی عن أبي عمرو'], ['b', 'قونبول عن ابن كثير'], ['z', 'بەززی عن ابن كثير']];
  $('tbQ').onclick = function () {
    open('<h3>هەڵبژاردنی قیرائەت</h3><div>' + QIRA.map(function (q) { return '<div class="tbRes" data-m="' + q[0] + '"><b>' + q[1] + '</b></div>'; }).join('') + '</div>');
    Array.prototype.forEach.call($('tbBox').querySelectorAll('[data-m]'), function (el) { el.onclick = function () { ls.set('m', el.getAttribute('data-m')); location.href = 'mushaf/?m=' + el.getAttribute('data-m'); }; });
  };

  /* ---------- search ---------- */
  var corpus = null, corpusLoading = false;
  function norm(s) { return String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').toLowerCase(); }
  function surahList() { try { return surahs; } catch (e) { return []; } }
  function pageOf(s, a) {
    var L = surahList(), cur = L[s - 1]; if (!cur) return 1;
    var st = +cur[3] || 1, nx = L[s] ? (+L[s][3] || st) : 604, n = +cur[2] || 1;
    return Math.max(1, Math.min(604, st + Math.floor(((a - 1) / n) * Math.max(0, nx - st + (L[s] ? 0 : 1)))));
  }
  function go(p) { close(); if (typeof openPage === 'function') openPage(p); }
  function doSearch(q) {
    var out = $('tbOut'); q = (q || '').trim(); if (!out) return;
    if (!q) { out.innerHTML = '<div class="tbRes"><small>ناوی سورەت، ژمارەی پەڕە (p12)، 2:255 یان دەقی عەرەبی بنووسە.</small></div>'; return; }
    var h = [], m;
    if ((m = q.match(/^(\d{1,3})\s*[:\/\-]\s*(\d{1,3})$/))) { var s = +m[1], a = +m[2]; if (s >= 1 && s <= 114) h.push('<div class="tbRes" data-p="' + pageOf(s, a) + '"><b>' + esc(surahList()[s - 1] ? surahList()[s - 1][0] : s) + ' : ' + a + '</b><small>پەڕەی ~' + pageOf(s, a) + '</small></div>'); }
    else if ((m = q.match(/^(?:p|page|پەڕە|لاپەڕە)?\s*(\d{1,3})$/i)) && +m[1] >= 1 && +m[1] <= 604 && /^[a-z؀-ۿ]/i.test(q)) h.push('<div class="tbRes" data-p="' + (+m[1]) + '"><b>پەڕەی ' + (+m[1]) + '</b></div>');
    var nq = norm(q);
    surahList().forEach(function (x) { if (h.length < 12 && (norm(x[0]).indexOf(nq) >= 0 || String(x[1]) === q)) h.push('<div class="tbRes" data-p="' + x[3] + '"><b>' + esc(x[0]) + '</b><small>سورەتی ' + x[1] + ' · ' + x[2] + ' ئایەت · پەڕە ' + x[3] + '</small></div>'); });
    if (nq.length >= 3) {
      if (!corpus) {
        if (!corpusLoading) { corpusLoading = true; fetch('ai/quran.json').then(function (r) { return r.json(); }).then(function (j) { corpus = (j && j.v) || []; doSearch($('tbQ2') ? $('tbQ2').value : q); }).catch(function () { corpus = []; }); }
        h.push('<div class="tbRes"><small>… گەڕان لە دەقی قورئان</small></div>');
      } else {
        var c = 0;
        for (var i = 0; i < corpus.length && c < 40; i++) {
          var r = corpus[i]; if (norm(r[2]).indexOf(nq) >= 0) { c++; var p = pageOf(r[0], r[1]); h.push('<div class="tbRes" data-p="' + p + '"><b style="font-family:inherit">' + esc(r[2]) + '</b><small>' + esc(surahList()[r[0] - 1] ? surahList()[r[0] - 1][0] : r[0]) + ' : ' + r[1] + ' · پەڕەی ~' + p + '</small></div>'); }
        }
      }
    }
    out.innerHTML = h.join('') || '<div class="tbRes"><small>هیچ شتێک نەدۆزرایەوە.</small></div>';
    Array.prototype.forEach.call(out.querySelectorAll('[data-p]'), function (el) { el.onclick = function () { go(+el.getAttribute('data-p')); }; });
  }
  $('tbS').onclick = function () {
    open('<h3>گەڕان</h3><input type="search" id="tbQ2" placeholder="سورەت، 2:255، پەڕە، یان دەقی عەرەبی…" autocomplete="off"><div id="tbOut"></div>');
    var inp = $('tbQ2'); inp.oninput = function () { doSearch(inp.value); }; doSearch(''); setTimeout(function () { inp.focus(); }, 50);
  };

  /* ---------- settings ---------- */
  function chips(arr, cur, attr) { return arr.map(function (x) { return '<span class="tbChip' + (x[0] === cur ? ' on' : '') + '" data-' + attr + '="' + esc(x[0]) + '">' + esc(x[1]) + '</span>'; }).join(''); }
  function renderSettings() {
    open('<h3>ڕێکخستنەکان</h3>' +
      '<label>قەبارەی نووسین: <span id="tbSzV">' + P.size + '%</span></label><input type="range" id="tbSz" min="80" max="150" step="5" value="' + P.size + '">' +
      '<label>فۆنت</label><div class="tbRow">' + chips(Object.keys(FONTS).map(function (k) { return [k, FONTS[k]]; }), P.font, 'f') + '</div>' +
      '<label>ڕەنگی نووسین</label><div class="tbRow">' + COLORS.map(function (c) { return '<span class="tbSw' + (c === P.color ? ' on' : '') + '" data-c="' + c + '" style="background:' + (c || 'linear-gradient(135deg,#fff 50%,#999 50%)') + '"></span>'; }).join('') + '</div>' +
      '<label>باگراوند</label><div class="tbRow">' + chips(BGS.map(function (b) { return [b[0], b[1]]; }), P.bg, 'b') + '</div>' +
      '<label>زمان</label><div class="tbRow"><span class="tbChip" id="tbLang">🌐 هەڵبژاردنی زمان</span></div>' +
      (typeof openDhikrSettings === 'function' ? '<label>زیکرەکان</label><div class="tbRow"><span class="tbChip" id="tbDh">☀ ڕێکخستنی زیکر و باگراوندی ئیسلامی</span></div>' : '') +
      '<div class="tbRow"><span class="tbChip" id="tbReset">گەڕاندنەوەی ئاسایی</span></div>');
    var box = $('tbBox');
    $('tbSz').oninput = function () { P.size = +this.value; $('tbSzV').textContent = P.size + '%'; savePrefs(); };
    Array.prototype.forEach.call(box.querySelectorAll('[data-f]'), function (el) { el.onclick = function () { P.font = el.getAttribute('data-f'); savePrefs(); renderSettings(); }; });
    Array.prototype.forEach.call(box.querySelectorAll('[data-c]'), function (el) { el.onclick = function () { P.color = el.getAttribute('data-c'); savePrefs(); renderSettings(); }; });
    Array.prototype.forEach.call(box.querySelectorAll('[data-b]'), function (el) { el.onclick = function () { P.bg = el.getAttribute('data-b'); P.color = ''; savePrefs(); renderSettings(); }; });
    $('tbLang').onclick = function () { close(); if (typeof openLanguagePicker === 'function') openLanguagePicker(); };
    if ($('tbDh')) $('tbDh').onclick = function () { close(); openDhikrSettings(); };
    $('tbReset').onclick = function () { P = { size: 100, font: '', color: '', bg: '' }; savePrefs(); renderSettings(); };
  }
  $('tbSet').onclick = renderSettings;
})();
