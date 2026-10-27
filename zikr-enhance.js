/* zikr-enhance.js v4 — bookmarks beside settings, search, notifications */
(function () {
  if (window.__zikrEnhanceV4) return;
  window.__zikrEnhanceV4 = true;

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
      '.dhikr-toolbar-right{display:flex!important;align-items:center;gap:8px;flex-direction:row}',
      '.dhikr-toolbar{display:flex!important;align-items:center;justify-content:space-between!important}',
      '[data-zikr-marks]{position:relative;color:#b48a3c!important;font-size:20px!important;flex:0 0 auto}',
      '[data-zikr-marks]::after{content:attr(data-n);position:absolute;top:-4px;left:-4px;background:#b48a3c;color:#fff;font-size:10px;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px}',
      '[data-zikr-marks][data-n="0"]::after{display:none}',
      '.zchap-mark{border:0;background:transparent;font-size:22px;cursor:pointer;color:#71857a;padding:0 6px;line-height:1}',
      '.zchap-mark.on{color:#b48a3c}',
      '.zchap-mark-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:10px 12px;border-radius:12px;background:#fbf5e7;border:1px solid #e4d5ad}',
      '.zreset{width:52px;height:52px;border:0;border-radius:50%;background:#6b7c74;color:#fff;font-size:22px;cursor:pointer;flex:0 0 auto}',
      '#zikrSearchWrap{margin:10px 0 0}',
      '#zikrSearch{width:100%;border:1px solid #dce5e1;border-radius:12px;padding:11px 14px;background:#fff;outline:none;font-size:14px}',
      '.zikr-notif-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border:1px solid #dce5e1;border-radius:12px;background:#fff;margin-top:8px}',
      '.zikr-notif-row b{display:block;font-size:14px}',
      '.zikr-notif-row small{display:block;color:#6d7975;font-size:12px;margin-top:3px}',
      '.zikr-switch{position:relative;width:48px;height:28px;flex:0 0 48px}',
      '.zikr-switch input{opacity:0;width:0;height:0}',
      '.zikr-switch span{position:absolute;inset:0;background:#c5cec9;border-radius:28px;cursor:pointer;transition:.2s}',
      '.zikr-switch span:before{content:"";position:absolute;width:22px;height:22px;right:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}',
      '.zikr-switch input:checked+span{background:#176b4b}',
      '.zikr-switch input:checked+span:before{transform:translateX(-20px)}'
    ].join('');
    document.head.appendChild(st);
  }

  function ensureToolbarIcons() {
    injectCss();
    document.querySelectorAll('.dhikr-toolbar').forEach(function (bar, idx) {
      var right = bar.querySelector('.dhikr-toolbar-right');
      if (!right) {
        right = document.createElement('div');
        right.className = 'dhikr-toolbar-right';
        bar.querySelectorAll('.dhikr-settings-icon').forEach(function (g) {
          if (!g.getAttribute('data-zikr-marks')) right.appendChild(g);
        });
        bar.appendChild(right);
      }
      var existing = right.querySelector('[data-zikr-marks]');
      if (existing) {
        existing.setAttribute('data-n', String(marksCount()));
        return;
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dhikr-settings-icon';
      btn.title = 'نیشانکراوەکان';
      btn.setAttribute('data-zikr-marks', '1');
      btn.setAttribute('data-n', String(marksCount()));
      btn.textContent = '★';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        zikrShowChapMarks();
      };
      var gear = right.querySelector('.dhikr-settings-icon:not([data-zikr-marks])');
      if (gear) right.insertBefore(btn, gear);
      else right.appendChild(btn);
    });
  }

  function refreshMarkButtons() {
    document.querySelectorAll('[data-zikr-marks]').forEach(function (b) {
      b.setAttribute('data-n', String(marksCount()));
    });
  }

  window.zikrToggleChap = function (c, h, btn) {
    var name = '', count = 0;
    try {
      var ch = window.azkar[c].chapters[h];
      name = (typeof pick === 'function' ? pick(ch, window.zlang || 'ckb') : null) || ch.ckb || ch.ar || '';
      count = (ch.items && ch.items.length) || 0;
    } catch (e) {}
    var on = toggleChapMark(c, h, name, count);
    if (btn) {
      btn.textContent = on ? '★' : '☆';
      btn.classList.toggle('on', on);
    }
    return on;
  };

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
      list.innerHTML = '<div class="card muted">هیچ بەشێک نیشان نەکراوە.</div>';
      return;
    }
    list.innerHTML = marks.map(function (m) {
      var name = m.name || '', n = m.count || 0;
      try {
        var ch = data[m.c].chapters[m.h];
        if (ch) {
          name = (typeof pick === 'function' ? pick(ch, window.zlang || 'ckb') : null) || ch.ckb || ch.ar || name;
          n = (ch.items && ch.items.length) || n;
        }
      } catch (e) {}
      return '<div class="zikr-item" style="display:flex;align-items:center;gap:8px"><div style="flex:1;cursor:pointer" onclick="openChapter(' +
        m.c + ',' + m.h + ')"><b>' + (typeof esc === 'function' ? esc(name) : name) + '</b><div class="muted">' +
        n + ' زیکر</div></div><button type="button" class="zchap-mark on" onclick="event.stopPropagation();zikrToggleChap(' +
        m.c + ',' + m.h + ',this);setTimeout(zikrShowChapMarks,40)">★</button></div>';
    }).join('');
  };

  function ensureSearch() {
    var zikr = document.getElementById('zikr');
    var list = document.getElementById('zikrList');
    if (!zikr || !list || document.getElementById('zikrSearchWrap')) return;
    var wrap = document.createElement('div');
    wrap.id = 'zikrSearchWrap';
    wrap.innerHTML = '<input id="zikrSearch" type="search" placeholder="گەڕان لە زیکرەکان..." autocomplete="off">';
    var lang = document.getElementById('langBtn');
    if (lang && lang.parentNode === zikr) lang.insertAdjacentElement('afterend', wrap);
    else list.parentNode.insertBefore(wrap, list);
    var input = wrap.querySelector('#zikrSearch');
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { applySearch(input.value); }, 180);
    });
  }

  async function applySearch(q) {
    q = (q || '').trim().toLowerCase();
    var box = document.getElementById('zikrList');
    if (!box) return;
    if (!q) {
      if (typeof zcat === 'number' && zcat >= 0 && typeof openCategory === 'function') openCategory(zcat);
      else if (typeof showCategories === 'function') showCategories();
      return;
    }
    var data = typeof ensureAzkar === 'function' ? await ensureAzkar() : window.azkar;
    if (!data) return;
    var hits = [];
    data.forEach(function (cat, ci) {
      (cat.chapters || []).forEach(function (ch, hi) {
        var names = [cat.ar, cat.ckb, cat.bad, ch.ar, ch.ckb, ch.bad]
          .concat((ch.items || []).map(function (it) { return (it.ar || '') + ' ' + (it.ckb || '') + ' ' + (it.bad || ''); }))
          .join(' ').toLowerCase();
        if (names.indexOf(q) >= 0) {
          var title = (typeof pick === 'function' ? pick(ch, window.zlang || 'ckb') : null) || ch.ckb || ch.ar || '';
          var catTitle = (typeof pick === 'function' ? pick(cat, window.zlang || 'ckb') : null) || cat.ckb || cat.ar || '';
          hits.push({ c: ci, h: hi, title: title, cat: catTitle, n: (ch.items && ch.items.length) || 0 });
        }
      });
    });
    if (!hits.length) {
      box.innerHTML = '<div class="card muted">هیچ ئەنجامێک نەدۆزرایەوە.</div>';
      return;
    }
    box.innerHTML = hits.slice(0, 80).map(function (h) {
      return '<div class="zikr-item" style="display:flex;align-items:center;gap:8px"><div style="flex:1;cursor:pointer" onclick="openChapter(' +
        h.c + ',' + h.h + ')"><b>' + (typeof esc === 'function' ? esc(h.title) : h.title) + '</b><div class="muted">' +
        (typeof esc === 'function' ? esc(h.cat) : h.cat) + ' · ' + h.n + ' زیکر</div></div><button type="button" class="zchap-mark' +
        (isChapMarked(h.c, h.h) ? ' on' : '') + '" onclick="event.stopPropagation();zikrToggleChap(' + h.c + ',' + h.h +
        ',this)">' + (isChapMarked(h.c, h.h) ? '★' : '☆') + '</button></div>';
    }).join('');
  }

  var NOTIF_DEFAULTS = { master: true, morning: true, evening: true, sleep: true, morningTime: '06:30', eveningTime: '17:45', sleepTime: '21:30' };
  var notifTimers = [];
  function loadNotifPrefs() {
    try { return Object.assign({}, NOTIF_DEFAULTS, JSON.parse(localStorage.getItem('zikr_notif_prefs') || '{}')); }
    catch (e) { return Object.assign({}, NOTIF_DEFAULTS); }
  }
  function saveNotifPrefs(p) {
    try { localStorage.setItem('zikr_notif_prefs', JSON.stringify(p)); } catch (e) {}
  }
  function msUntilTime(hhmm) {
    var parts = String(hhmm || '06:30').split(':');
    var h = +parts[0] || 0, m = +parts[1] || 0;
    var now = new Date();
    var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  }
  function showLocalNotif(title, body, tag) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      var n = new Notification(title, { body: body, tag: tag || 'zikr', lang: 'ku', dir: 'rtl', icon: 'icon.svg' });
      n.onclick = function () {
        window.focus();
        try { if (typeof enterDhikr === 'function') enterDhikr(); } catch (e) {}
        n.close();
      };
    } catch (e) {
      try {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg) reg.showNotification(title, { body: body, tag: tag || 'zikr', icon: 'icon.svg' });
        });
      } catch (e2) {}
    }
  }
  function clearNotifTimers() {
    notifTimers.forEach(function (id) { clearTimeout(id); });
    notifTimers = [];
  }
  function scheduleOne(key, title, body, hhmm) {
    var delay = msUntilTime(hhmm);
    var id = setTimeout(function () {
      showLocalNotif(title, body, 'zikr-' + key);
      scheduleOne(key, title, body, hhmm);
    }, Math.min(delay, 2147483647));
    notifTimers.push(id);
  }
  function rescheduleNotifications() {
    clearNotifTimers();
    var p = loadNotifPrefs();
    if (!p.master) return;
    if (p.morning) scheduleOne('morning', 'زیکری بەیانیان', 'کاتی ویردی بەیانیانە.', p.morningTime);
    if (p.evening) scheduleOne('evening', 'زیکری ئێواران', 'پێش مەغریب — ویردی ئێواران.', p.eveningTime);
    if (p.sleep) scheduleOne('sleep', 'زیکری خەوتن', 'پێش خەوتن — ویردی خەوتن.', p.sleepTime);
  }
  async function ensureNotifPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try { return (await Notification.requestPermission()) === 'granted'; } catch (e) { return false; }
  }
  function switchHtml(id, checked) {
    return '<label class="zikr-switch"><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span></span></label>';
  }
  function injectNotifSettings() {
    var modal = document.getElementById('dhikrSettingsModal');
    if (!modal) return;
    var sheet = modal.querySelector('.sheet');
    if (!sheet || sheet.querySelector('#zikrNotifBlock')) return;
    var p = loadNotifPrefs();
    var block = document.createElement('div');
    block.id = 'zikrNotifBlock';
    block.innerHTML =
      '<hr style="border:0;border-top:1px solid #dce5e1;margin:16px 0">' +
      '<label style="font-weight:bold;display:block;margin-bottom:6px">🔔 ئاگادارکردنەوەی زیکر</label>' +
      '<p class="muted" style="margin:0 0 8px;font-size:12px">دەتوانیت هەریەکەیان بکوژێنیتەوە یان هەڵبگریت.</p>' +
      '<div class="zikr-notif-row"><div><b>هەموو ئاگادارکردنەوەکان</b><small>کوژاندنەوەی گشتی</small></div>' + switchHtml('znMaster', p.master) + '</div>' +
      '<div class="zikr-notif-row"><div><b>زیکری بەیانیان</b><small>کات: ' + p.morningTime + '</small></div>' + switchHtml('znMorning', p.morning) + '</div>' +
      '<div class="zikr-notif-row"><div><b>زیکری ئێواران (پێش مەغریب)</b><small>کات: ' + p.eveningTime + '</small></div>' + switchHtml('znEvening', p.evening) + '</div>' +
      '<div class="zikr-notif-row"><div><b>زیکری خەوتن</b><small>کات: ' + p.sleepTime + '</small></div>' + switchHtml('znSleep', p.sleep) + '</div>' +
      '<button type="button" class="primary" id="znTestBtn" style="width:100%;margin-top:10px">تاقیکردنەوەی ئاگادارکردنەوە</button>';
    var lastBtn = sheet.querySelector('button.primary:last-of-type');
    if (lastBtn) sheet.insertBefore(block, lastBtn);
    else sheet.appendChild(block);
    ['znMaster', 'znMorning', 'znEvening', 'znSleep'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.__bound) return;
      el.__bound = true;
      el.addEventListener('change', async function () {
        var p2 = loadNotifPrefs();
        p2.master = !!(document.getElementById('znMaster') || {}).checked;
        p2.morning = !!(document.getElementById('znMorning') || {}).checked;
        p2.evening = !!(document.getElementById('znEvening') || {}).checked;
        p2.sleep = !!(document.getElementById('znSleep') || {}).checked;
        saveNotifPrefs(p2);
        if (p2.master && (p2.morning || p2.evening || p2.sleep)) {
          var ok = await ensureNotifPermission();
          if (!ok) alert('تکایە ڕێگە بە ئاگادارکردنەوە بدە لە ڕێکخستنی وێبگەڕ.');
        }
        rescheduleNotifications();
      });
    });
    var test = document.getElementById('znTestBtn');
    if (test && !test.__bound) {
      test.__bound = true;
      test.onclick = async function () {
        var ok = await ensureNotifPermission();
        if (!ok) { alert('ڕێگە بە ئاگادارکردنەوە نەدرا.'); return; }
        showLocalNotif('زیکرەکانم', 'ئاگادارکردنەوە کار دەکات ✓', 'zikr-test');
      };
    }
  }

  function enhanceCategoryList() {
    var box = document.getElementById('zikrList');
    if (!box) return;
    box.querySelectorAll('.zikr-item').forEach(function (el) {
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
      bar.innerHTML = '<span style="font-size:14px;color:#5a4a2a">نیشانەکردنی <b>هەموو</b> ئەم بەشە</span><button type="button" class="zchap-mark' +
        (on ? ' on' : '') + '" style="font-size:28px">' + (on ? '★' : '☆') + '</button>';
      bar.querySelector('button').onclick = function () { zikrToggleChap(i, j, bar.querySelector('button')); };
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
    patch('openChapter', '__ze4', function (args) {
      enhanceChapterView(args[0], args[1]);
      ensureToolbarIcons();
    });
    patch('openCategory', '__ze4', function () {
      enhanceCategoryList();
      ensureToolbarIcons();
      ensureSearch();
    });
    patch('showCategories', '__ze4', function () {
      ensureToolbarIcons();
      ensureSearch();
    });
    patch('showZikr', '__ze4', function () {
      ensureToolbarIcons();
      ensureSearch();
    });
    patch('openDhikrSettings', '__ze4', function () {
      injectNotifSettings();
    });
    ensureToolbarIcons();
    ensureSearch();
    enhanceCategoryList();
    injectNotifSettings();
    rescheduleNotifications();
  }

  function start() {
    boot();
    if (!window.__zikrMO4) {
      try {
        window.__zikrMO4 = new MutationObserver(function () {
          ensureToolbarIcons();
          ensureSearch();
          enhanceCategoryList();
        });
        window.__zikrMO4.observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 30);
      setTimeout(start, 400);
    });
  } else {
    setTimeout(start, 30);
    setTimeout(start, 400);
  }
  var tries = 0;
  var t = setInterval(function () {
    boot();
    if (++tries > 40) clearInterval(t);
  }, 250);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) rescheduleNotifications();
  });
})();
