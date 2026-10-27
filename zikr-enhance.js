/* zikr-enhance.js v2 — chapter bookmarks next to settings + Badini + reset */
(function () {
  if (window.__zikrEnhanceV2) return;
  window.__zikrEnhanceV2 = true;

  /* ---------- Badini fill when missing ---------- */
  var WORD_MAP = [
    [/\bخوایە\b/g, 'يا خودێ'], [/\bخوا\b/g, 'خودێ'],
    [/\bپەروەردگارمان\b/g, 'خودايێ مە'], [/\bپەروەردگار\b/g, 'خودايێ'],
    [/\bمن\b/g, 'ئەز'], [/\bئێمە\b/g, 'ئەم'],
    [/\bبۆ ئەوەی\b/g, 'داكو'], [/\bلەگەڵ\b/g, 'دگەل'], [/\bلە\b/g, 'ژ'],
    [/\bداوای\b/g, 'داخوازا'], [/\bدەکەم\b/g, 'دکەم'], [/\bدەکات\b/g, 'دکەت'],
    [/\bپەنا دەگرم بە تۆ\b/g, 'ئەز خۆ ب تە دپارێزم'],
    [/\bبەهەشت\b/g, 'بەحەشتێ'], [/\bئاگر\b/g, 'ئاگری'],
    [/\bستایش\b/g, 'سوپاس'], [/\bپاک و بێگەردی\b/g, 'پاکی و پاقژی'],
    [/\bیارمەتیم بدە\b/g, 'هاریکاریا من بکە'], [/\bڕێنماییم بکە\b/g, 'من ڕاستەڕێ بکە'],
    [/\bساغم بکە\b/g, 'من سلامەت بکە'], [/\bبەڕاستی\b/g, 'ب ڕاستی'],
    [/\bزۆر\b/g, 'زێدە'], [/\bپاشان\b/g, 'پاشی'], [/\bدوای\b/g, 'پشتی'],
    [/\bسوپاست بکەم\b/g, 'شوکرا تە بکەم'], [/\bیادت بکەم\b/g, 'زکرێ تە بکەم']
  ];
  function toBadini(ckb) {
    if (!ckb) return '';
    var s = String(ckb);
    WORD_MAP.forEach(function (p) { s = s.replace(p[0], p[1]); });
    return s.replace(/ڵ/g, 'ل');
  }
  function fillBadini(data) {
    if (!Array.isArray(data)) return;
    data.forEach(function (cat) {
      if (!(cat.bad && String(cat.bad).trim()) && cat.ckb) cat.bad = toBadini(cat.ckb);
      (cat.chapters || []).forEach(function (ch) {
        if (!(ch.bad && String(ch.bad).trim()) && ch.ckb) ch.bad = toBadini(ch.ckb);
        (ch.items || []).forEach(function (it) {
          if (!(it.bad && String(it.bad).trim()) && it.ckb) it.bad = toBadini(it.ckb);
        });
      });
    });
  }

  /* ---------- Chapter-level bookmarks ---------- */
  function loadMarks() {
    try { return JSON.parse(localStorage.getItem('zikr_chap_marks') || '[]'); } catch (e) { return []; }
  }
  function saveMarks(a) {
    try { localStorage.setItem('zikr_chap_marks', JSON.stringify(a)); } catch (e) {}
  }
  function chapKey(c, h) { return c + ':' + h; }
  function isChapMarked(c, h) {
    var k = chapKey(c, h);
    return loadMarks().some(function (m) { return m.key === k; });
  }
  function toggleChapMark(c, h, name, count) {
    var k = chapKey(c, h);
    var all = loadMarks();
    var i = all.findIndex(function (m) { return m.key === k; });
    if (i >= 0) all.splice(i, 1);
    else all.unshift({ key: k, c: c, h: h, name: name || '', count: count || 0, t: Date.now() });
    saveMarks(all);
    return i < 0;
  }
  function marksCount() { return loadMarks().length; }

  /* ---------- Toolbar icon next to settings ---------- */
  function ensureToolbarIcon() {
    var bar = document.querySelector('.dhikr-toolbar');
    if (!bar) return;
    var old = document.getElementById('zikrMarksBtn');
    if (old) {
      old.textContent = '★';
      old.setAttribute('data-n', String(marksCount()));
      return;
    }
    var btn = document.createElement('button');
    btn.id = 'zikrMarksBtn';
    btn.type = 'button';
    btn.className = 'dhikr-settings-icon';
    btn.title = 'نیشانکراوەکان';
    btn.setAttribute('aria-label', 'نیشانکراوەکان');
    btn.textContent = '★';
    btn.style.cssText = 'color:#b48a3c;font-size:20px;margin-left:6px';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      zikrShowChapMarks();
    };
    // put before settings gear if present
    var gear = bar.querySelector('.dhikr-settings-icon');
    if (gear) bar.insertBefore(btn, gear);
    else bar.appendChild(btn);

    if (!document.getElementById('zikrMarksCss')) {
      var st = document.createElement('style');
      st.id = 'zikrMarksCss';
      st.textContent = [
        '#zikrMarksBtn{position:relative}',
        '#zikrMarksBtn::after{content:attr(data-n);position:absolute;top:-4px;left:-4px;',
        '  background:#b48a3c;color:#fff;font-size:10px;min-width:16px;height:16px;border-radius:8px;',
        '  display:flex;align-items:center;justify-content:center;padding:0 3px}',
        '#zikrMarksBtn[data-n="0"]::after{display:none}',
        '.zchap-mark{border:0;background:transparent;font-size:22px;cursor:pointer;color:#71857a;padding:0 6px;line-height:1}',
        '.zchap-mark.on{color:#b48a3c}',
        '.zchap-mark-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;',
        '  margin:0 0 12px;padding:10px 12px;border-radius:12px;background:#fbf5e7;border:1px solid #e4d5ad}',
        '.zreset{width:52px;height:52px;border:0;border-radius:50%;background:#6b7c74;color:#fff;font-size:22px;cursor:pointer}'
      ].join('');
      document.head.appendChild(st);
    }
    btn.setAttribute('data-n', String(marksCount()));
  }

  window.zikrShowChapMarks = async function () {
    ensureToolbarIcon();
    var data = typeof ensureAzkar === 'function' ? await ensureAzkar() : null;
    if (!data) return;
    var marks = loadMarks();
    if (typeof showView === 'function') showView('detail', 'زیکرەکانم');
    var titleEl = document.getElementById('detailTitle');
    var countEl = document.getElementById('zikrCount');
    if (titleEl) titleEl.textContent = '★ نیشانکراوەکان';
    if (countEl) countEl.textContent = marks.length + ' بەش';
    var list = document.getElementById('detailList');
    if (!list) return;
    if (!marks.length) {
      list.innerHTML = '<div class="card muted">هیچ بەشێک نیشان نەکراوە.<br>لەناو بەشێک (وەک ویردی بەیانیان) دوگمەی ★ دابگرە بۆ نیشانەکردنی هەمووی.</div>';
      return;
    }
    list.innerHTML = marks.map(function (m) {
      var name = m.name || '';
      var n = m.count || 0;
      try {
        var ch = data[m.c].chapters[m.h];
        if (ch) {
          name = (typeof pick === 'function' ? pick(ch, typeof zlang !== 'undefined' ? zlang : 'ckb') : null) || ch.ckb || ch.ar || name;
          n = (ch.items && ch.items.length) || n;
        }
      } catch (e) {}
      return (
        '<div class="zikr-item" style="display:flex;align-items:center;gap:8px">' +
        '<div style="flex:1;cursor:pointer" onclick="openChapter(' + m.c + ',' + m.h + ')">' +
        '<b>' + (typeof esc === 'function' ? esc(name) : name) + '</b>' +
        '<div class="muted">' + n + ' زیکر · کلیک = کردنەوە</div></div>' +
        '<button type="button" class="zchap-mark on" title="لابردنی نیشانە" ' +
        'onclick="event.stopPropagation();zikrToggleChap(' + m.c + ',' + m.h + ',this);setTimeout(zikrShowChapMarks,40)">★</button>' +
        '</div>'
      );
    }).join('');
  };

  window.zikrToggleChap = function (c, h, btn) {
    var name = '', count = 0;
    try {
      var data = window.azkar;
      var ch = data[c].chapters[h];
      name = (typeof pick === 'function' ? pick(ch, typeof zlang !== 'undefined' ? zlang : 'ckb') : null) || ch.ckb || ch.ar || '';
      count = (ch.items && ch.items.length) || 0;
    } catch (e) {}
    var on = toggleChapMark(c, h, name, count);
    if (btn) {
      btn.textContent = on ? '★' : '☆';
      btn.classList.toggle('on', on);
      btn.title = on ? 'لابردنی نیشانە' : 'نیشانەکردنی هەموو ئەم بەشە';
    }
    ensureToolbarIcon();
    return on;
  };

  /* ---------- Enhance chapter list rows with ★ ---------- */
  function enhanceCategoryList(catIndex) {
    var box = document.getElementById('zikrList');
    if (!box || catIndex < 0) return;
    var items = box.querySelectorAll('.zikr-item');
    items.forEach(function (el, j) {
      if (el.querySelector('.zchap-mark')) return;
      // skip if this is not a chapter row (no openChapter in onclick of children)
      var onclk = el.getAttribute('onclick') || '';
      if (onclk.indexOf('openChapter') < 0 && onclk.indexOf('openCategory') >= 0) return;
      // wrap content
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '8px';
      var inner = document.createElement('div');
      inner.style.flex = '1';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
      // extract chapter index from onclick on el
      var m = onclk.match(/openChapter\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      var c = catIndex, h = j;
      if (m) { c = +m[1]; h = +m[2]; }
      else {
        // onclick might be on el still
        el.setAttribute('onclick', '');
        inner.setAttribute('onclick', onclk);
        inner.style.cursor = 'pointer';
      }
      if (m) {
        el.removeAttribute('onclick');
        inner.style.cursor = 'pointer';
        inner.onclick = function () { openChapter(c, h); };
      }
      var star = document.createElement('button');
      star.type = 'button';
      star.className = 'zchap-mark' + (isChapMarked(c, h) ? ' on' : '');
      star.textContent = isChapMarked(c, h) ? '★' : '☆';
      star.title = 'نیشانەکردنی هەموو ئەم بەشە';
      star.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        zikrToggleChap(c, h, star);
      };
      el.appendChild(star);
    });
  }

  /* ---------- Inside chapter: big mark-all bar + reset on counters ---------- */
  function enhanceChapterView(i, j) {
    var list = document.getElementById('detailList');
    if (!list) return;

    // chapter mark bar at top
    if (!list.querySelector('.zchap-mark-bar')) {
      var bar = document.createElement('div');
      bar.className = 'zchap-mark-bar';
      var on = isChapMarked(i, j);
      bar.innerHTML =
        '<span style="font-size:14px;color:#5a4a2a">نیشانەکردنی <b>هەموو</b> ئەم بەشە</span>' +
        '<button type="button" class="zchap-mark' + (on ? ' on' : '') + '" style="font-size:28px" ' +
        'title="نیشانەکردنی هەموو ئەم بەشە">' + (on ? '★' : '☆') + '</button>';
      var starBtn = bar.querySelector('button');
      starBtn.onclick = function () { zikrToggleChap(i, j, starBtn); };
      list.insertBefore(bar, list.firstChild);
    }

    // reset buttons next to counters
    list.querySelectorAll('.card .counter').forEach(function (counter) {
      if (counter.querySelector('.zreset')) return;
      var tickBtn = counter.querySelector('button[data-target]');
      if (!tickBtn) return;
      var reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'zreset';
      reset.title = 'ڕیستاری ژماردن';
      reset.textContent = '↺';
      reset.onclick = function (e) {
        e.stopPropagation();
        tickBtn.dataset.current = '0';
        tickBtn.style.background = '';
        var target = Math.max(1, Number(tickBtn.dataset.target) || 1);
        tickBtn.textContent = typeof znum === 'function' ? znum(0) + ' / ' + znum(target) : '0 / ' + target;
      };
      if (tickBtn.nextSibling) counter.insertBefore(reset, tickBtn.nextSibling);
      else counter.appendChild(reset);
    });
  }

  /* ---------- Hooks ---------- */
  function patchEnsureAzkar() {
    if (typeof window.ensureAzkar !== 'function' || window.ensureAzkar.__ze) return;
    var orig = window.ensureAzkar;
    window.ensureAzkar = async function () {
      var data = await orig.apply(this, arguments);
      fillBadini(data);
      return data;
    };
    window.ensureAzkar.__ze = true;
  }

  function patchOpenChapter() {
    if (typeof window.openChapter !== 'function' || window.openChapter.__ze) return;
    var orig = window.openChapter;
    window.openChapter = async function (i, j) {
      var ret = await orig.apply(this, arguments);
      setTimeout(function () { enhanceChapterView(i, j); ensureToolbarIcon(); }, 0);
      setTimeout(function () { enhanceChapterView(i, j); }, 100);
      return ret;
    };
    window.openChapter.__ze = true;
  }

  function patchOpenCategory() {
    if (typeof window.openCategory !== 'function' || window.openCategory.__ze) return;
    var orig = window.openCategory;
    window.openCategory = async function (i) {
      var ret = await orig.apply(this, arguments);
      setTimeout(function () { enhanceCategoryList(i); ensureToolbarIcon(); }, 40);
      setTimeout(function () { enhanceCategoryList(i); }, 150);
      return ret;
    };
    window.openCategory.__ze = true;
  }

  function patchShowCategories() {
    if (typeof window.showCategories !== 'function' || window.showCategories.__ze) return;
    var orig = window.showCategories;
    window.showCategories = async function () {
      var ret = await orig.apply(this, arguments);
      setTimeout(ensureToolbarIcon, 40);
      return ret;
    };
    window.showCategories.__ze = true;
  }

  function patchShowZikr() {
    if (typeof window.showZikr !== 'function' || window.showZikr.__ze) return;
    var orig = window.showZikr;
    window.showZikr = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(ensureToolbarIcon, 50);
      setTimeout(ensureToolbarIcon, 300);
      return ret;
    };
    window.showZikr.__ze = true;
  }

  function boot() {
    patchEnsureAzkar();
    patchOpenChapter();
    patchOpenCategory();
    patchShowCategories();
    patchShowZikr();
    ensureToolbarIcon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 40); setTimeout(boot, 400); setTimeout(boot, 1200);
    });
  } else {
    setTimeout(boot, 40); setTimeout(boot, 400); setTimeout(boot, 1200);
  }
  var tries = 0;
  var t = setInterval(function () { boot(); if (++tries > 40) clearInterval(t); }, 250);
})();
