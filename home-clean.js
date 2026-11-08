/* Home screen cleanup + bookmarks split into two sections (page bookmarks / ayah bookmarks) */
(function () {
  if (window.__homeClean) return; window.__homeClean = true;
  var st = document.createElement('style');
  st.textContent = [
    '.hero,#surahSearch,#navReader,#navSettings{display:none!important}',
    '.bm-sub{display:flex;gap:8px;margin:0 0 10px}',
    '.bm-sub button{flex:1;padding:10px 6px;border:1px solid #cfe0d6;border-radius:12px;background:#fff;font:inherit;font-weight:700;color:#1d6b4d;cursor:pointer}',
    '.bm-sub button.on{background:#1d6b4d;color:#fff;border-color:#1d6b4d}',
    '.bm-row{display:flex;align-items:center;gap:6px}',
    '.bm-row .surah{flex:1;margin:0}',
    '.bm-del{flex:0 0 auto;width:38px;height:38px;border:0;border-radius:50%;background:#fbeaea;color:#c0392b;font-size:20px;cursor:pointer}'
  ].join('\n');
  document.head.appendChild(st);

  var sub = 'ayah';
  try { sub = localStorage.getItem('bm_sub2') || 'ayah'; } catch (e) {}
  function get(k) { try { var v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc2(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pages() {
    var o = [], seen = {};
    get('page_bookmarks').concat(get('preview_bookmarks')).forEach(function (p) { p = +p; if (p >= 1 && p <= 604 && !seen[p]) { seen[p] = 1; o.push(p); } });
    return o.sort(function (a, b) { return a - b; });
  }
  function sname(s) { try { return surahs[s - 1][0]; } catch (e) { return 'سورەت ' + s; } }

  function renderBm() {
    var box = document.getElementById('surahList'); if (!box) return;
    var h = '<div class="bm-sub"><button type="button" data-s="ayah" class="' + (sub === 'ayah' ? 'on' : '') + '">نیشانەکردنی ئایەت</button><button type="button" data-s="page" class="' + (sub === 'page' ? 'on' : '') + '">نیشانەکردنی لاپەڕە</button></div>';
    if (sub === 'page') {
      var p = pages();
      h += p.length ? p.map(function (n) {
        return '<div class="bm-row"><div class="surah" onclick="openPage(' + n + ')"><span class="num">' + n + '</span><div class="name"><b>پەڕەی ' + n + '</b></div><span class="arrow">‹</span></div><button class="bm-del" type="button" data-p="' + n + '">×</button></div>';
      }).join('') : '<div class="card muted">هیچ لاپەڕەیەک نیشان نەکراوە. لە موسحەفدا نیشانەی ☆ لێبدە.</div>';
    } else {
      var l = get('ayah_bookmarks');
      h += l.length ? l.map(function (x, i) {
        var q = String(x).split(':'), s = +q[0], a = +q[1], pg = +q[2] || 1;
        return '<div class="bm-row"><div class="surah" onclick="openPage(' + pg + ')"><span class="num">' + a + '</span><div class="name"><b>' + esc2(sname(s)) + ' : ' + a + '</b><small>پەڕە ' + pg + '</small></div><span class="arrow">‹</span></div><button class="bm-del" type="button" data-a="' + i + '">×</button></div>';
      }).join('') : '<div class="card muted">هیچ ئایەتێک نیشان نەکراوە. پەنجە لەسەر ئایەتێک ڕابگرە و نیشانە هەڵبژێرە.</div>';
    }
    box.innerHTML = h;
    Array.prototype.forEach.call(box.querySelectorAll('.bm-sub button'), function (b) {
      b.onclick = function () { sub = b.getAttribute('data-s'); try { localStorage.setItem('bm_sub2', sub); } catch (e) {} renderBm(); };
    });
    Array.prototype.forEach.call(box.querySelectorAll('.bm-del'), function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        if (b.hasAttribute('data-p')) { var n = +b.getAttribute('data-p'); set('page_bookmarks', get('page_bookmarks').filter(function (x) { return +x !== n; })); set('preview_bookmarks', get('preview_bookmarks').filter(function (x) { return +x !== n; })); }
        else { var l2 = get('ayah_bookmarks'); l2.splice(+b.getAttribute('data-a'), 1); set('ayah_bookmarks', l2); }
        renderBm();
      };
    });
  }

  function hook() {
    if (typeof window.renderSurahs !== 'function') return setTimeout(hook, 100);
    var orig = window.renderSurahs;
    window.renderSurahs = function () {
      if (typeof homeTab !== 'undefined' && homeTab === 'bookmark') return renderBm();
      return orig.apply(this, arguments);
    };
    if (typeof homeTab !== 'undefined' && homeTab === 'bookmark') renderBm();
    /* whatever else writes into the list while the bookmarks tab is open, keep our two sections */
    var list = document.getElementById('surahList');
    if (list) new MutationObserver(function () {
      if (typeof homeTab !== 'undefined' && homeTab === 'bookmark' && !list.querySelector('.bm-sub')) renderBm();
    }).observe(list, { childList: true });
    var tb = document.getElementById('tabBookmark');
    if (tb) tb.addEventListener('click', function () { setTimeout(function () { if (!list.querySelector('.bm-sub')) renderBm(); }, 0); });
  }
  hook();
})();
