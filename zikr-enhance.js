/* zikr-enhance.js v3 — chapter bookmarks + reset; robust DOM inject */
(function () {
  if (window.__zikrEnhanceV3) return;
  window.__zikrEnhanceV3 = true;

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
  function marksCount() { return loadMarks().length; }
  function toggleChapMark(c, h, name, count) {
    var k = chapKey(c, h);
    var all = loadMarks();
    var i = all.findIndex(function (m) { return m.key === k; });
    if (i >= 0) all.splice(i, 1);
    else all.unshift({ key: k, c: c, h: h, name: name || '', count: count || 0, t: Date.now() });
    saveMarks(all);
    refreshMarkButtons();
    return i < 0;
  }

  function injectCss() {
    if (document.getElementById('zikrMarksCss')) return;
    var st = document.createElement('style');
    st.id = 'zikrMarksCss';
    st.textContent = [
      '#zikrMarksBtn,#zikrMarksBtn2{position:relative;color:#b48a3c!important;font-size:20px!important}',
      '#zikrMarksBtn::after,#zikrMarksBtn2::after{content:attr(data-n);position:absolute;top:-4px;left:-4px;',
      '  background:#b48a3c;color:#fff;font-size:10px;min-width:16px;height:16px;border-radius:8px;',
      '  display:flex;align-items:center;justify-content:center;padding:0 3px}',
      '#zikrMarksBtn[data-n="0"]::after,#zikrMarksBtn2[data-n="0"]::after{display:none}',
      '.zchap-mark{border:0;background:transparent;font-size:22px;cursor:pointer;color:#71857a;padding:0 6px;line-height:1}',
      '.zchap-mark.on{color:#b48a3c}',
      '.zchap-mark-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;',
      '  margin:0 0 12px;padding:10px 12px;border-radius:12px;background:#fbf5e7;border:1px solid #e4d5ad}',
      '.zreset{width:52px;height:52px;border:0;border-radius:50%;background:#6b7c74;color:#fff;font-size:22px;cursor:pointer;flex:0 0 auto}'
    ].join('');
    document.head.appendChild(st);
  }

  function makeMarksBtn(id) {
    var btn = document.createElement('button');
    btn.id = id;
    btn.type = 'button';
    btn.className = 'dhikr-settings-icon';
    btn.title = 'نیشانکراوەکان';
    btn.setAttribute('aria-label', 'نیشانکراوەکان');
    btn.textContent = '★';
    btn.setAttribute('data-n', String(marksCount()));
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      zikrShowChapMarks();
    };
    return btn;
  }

  function ensureToolbarIcons() {
    injectCss();
    var bars = document.querySelectorAll('.dhikr-toolbar');
    bars.forEach(function (bar, idx) {
      var id = idx === 0 ? 'zikrMarksBtn' : 'zikrMarksBtn2';
      var existing = bar.querySelector('[data-zikr-marks]');
      if (existing) {
        existing.setAttribute('data-n', String(marksCount()));
        return;
      }
      var btn = makeMarksBtn(id);
      btn.setAttribute('data-zikr-marks', '1');
      var gear = bar.querySelector('.dhikr-settings-icon');
      if (gear) bar.insertBefore(btn, gear);
      else bar.appendChild(btn);
    });
  }

  function refreshMarkButtons() {
    document.querySelectorAll('[data-zikr-marks]').forEach(function (b) {
      b.setAttribute('data-n', String(marksCount()));
    });
  }

  window.zikrShowChapMarks = async function () {
    ensureToolbarIcons();
    var data = typeof ensureAzkar === 'function' ? await ensureAzkar() : window.azkar;
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
      list.innerHTML = '<div class="card muted">هیچ بەشێک نیشان نەکراوە.<br>لە لیست یان ناو بەش (وەک ویردی بەیانیان) دوگمەی ★ دابگرە بۆ نیشانەکردنی <b>هەمووی</b>.</div>';
      ensureToolbarIcons();
      return;
    }
    list.innerHTML = marks.map(function (m) {
      var name = m.name || '';
      var n = m.count || 0;
      try {
        var ch = data[m.c].chapters[m.h];
        if (ch) {
          name = (typeof pick === 'function' ? pick(ch, window.zlang || 'ckb') : null) || ch.ckb || ch.ar || name;
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
    ensureToolbarIcons();
  };

  window.zikrToggleChap = function (c, h, btn) {
    var name = '', count = 0;
    try {
      var data = window.azkar;
      var ch = data[c].chapters[h];
      name = (typeof pick === 'function' ? pick(ch, window.zlang || 'ckb') : null) || ch.ckb || ch.ar || '';
      count = (ch.items && ch.items.length) || 0;
    } catch (e) {}
    var on = toggleChapMark(c, h, name, count);
    if (btn) {
      btn.textContent = on ? '★' : '☆';
      btn.classList.toggle('on', on);
      btn.title = on ? 'لابردنی نیشانە' : 'نیشانەکردنی هەموو ئەم بەشە';
    }
    return on;
  };

  function enhanceCategoryList() {
    var box = document.getElementById('zikrList');
    if (!box) return;
    var items = box.querySelectorAll('.zikr-item');
    items.forEach(function (el) {
      if (el.querySelector('.zchap-mark')) return;
      var onclk = el.getAttribute('onclick') || '';
      var m = onclk.match(/openChapter\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (!m) return;
      var c = +m[1], h = +m[2];
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '8px';
      var inner = document.createElement('div');
      inner.style.flex = '1';
      inner.style.cursor = 'pointer';
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.removeAttribute('onclick');
      inner.onclick = function () { openChapter(c, h); };
      el.appendChild(inner);
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

  function enhanceChapterView(i, j) {
    var list = document.getElementById('detailList');
    if (!list) return;
    if (!list.querySelector('.zchap-mark-bar') && i != null && j != null && i >= 0 && j >= 0) {
      var bar = document.createElement('div');
      bar.className = 'zchap-mark-bar';
      var on = isChapMarked(i, j);
      bar.innerHTML =
        '<span style="font-size:14px;color:#5a4a2a">نیشانەکردنی <b>هەموو</b> ئەم بەشە</span>' +
        '<button type="button" class="zchap-mark' + (on ? ' on' : '') + '" style="font-size:28px">' +
        (on ? '★' : '☆') + '</button>';
      var starBtn = bar.querySelector('button');
      starBtn.onclick = function () { zikrToggleChap(i, j, starBtn); };
      list.insertBefore(bar, list.firstChild);
    }
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

  function patch(name, flag, after) {
    var fn = window[name];
    if (typeof fn !== 'function' || fn[flag]) return;
    window[name] = function () {
      var args = arguments;
      var ret = fn.apply(this, args);
      Promise.resolve(ret).then(function () {
        setTimeout(function () { after(args); }, 0);
        setTimeout(function () { after(args); }, 120);
      });
      return ret;
    };
    window[name][flag] = true;
  }

  function boot() {
    if (typeof window.ensureAzkar === 'function' && !window.ensureAzkar.__ze3) {
      var o = window.ensureAzkar;
      window.ensureAzkar = async function () {
        var data = await o.apply(this, arguments);
        fillBadini(data);
        return data;
      };
      window.ensureAzkar.__ze3 = true;
    }
    patch('openChapter', '__ze3', function (args) {
      enhanceChapterView(args[0], args[1]);
      ensureToolbarIcons();
    });
    patch('openCategory', '__ze3', function () {
      enhanceCategoryList();
      ensureToolbarIcons();
    });
    patch('showCategories', '__ze3', function () {
      ensureToolbarIcons();
    });
    patch('showZikr', '__ze3', function () {
      ensureToolbarIcons();
    });
    ensureToolbarIcons();
    enhanceCategoryList();
    if (typeof zcat === 'number' && typeof zchap === 'number' && zchap >= 0) {
      enhanceChapterView(zcat, zchap);
    }
  }

  function watch() {
    if (window.__zikrMO) return;
    try {
      window.__zikrMO = new MutationObserver(function () {
        ensureToolbarIcons();
        enhanceCategoryList();
        if (typeof zcat === 'number' && typeof zchap === 'number' && zchap >= 0) {
          enhanceChapterView(zcat, zchap);
        } else {
          var list = document.getElementById('detailList');
          if (list && list.querySelector('.counter')) enhanceChapterView(-1, -1);
        }
      });
      window.__zikrMO.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  function start() {
    boot();
    watch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 30);
      setTimeout(start, 300);
      setTimeout(start, 1000);
    });
  } else {
    setTimeout(start, 30);
    setTimeout(start, 300);
    setTimeout(start, 1000);
  }
  var tries = 0;
  var t = setInterval(function () {
    boot();
    if (++tries > 50) clearInterval(t);
  }, 200);
})();
