/* zikr-streak.js v1 — daily activity + streak card for the zikr section, and share buttons.
 * Standalone: it only reads/wraps globals of the page (tick, zcat, zchap, azkar) and stores
 * everything in localStorage ("zikr_activity_v1"). */
(function () {
  if (window.__zikrStreakV1) return;
  window.__zikrStreakV1 = true;

  var KEY = 'zikr_activity_v1';
  var MORNING = 'ویردەکانی بەیانیان', EVENING = 'ویردەکانی ئێواران', SLEEP = 'ویردەکانی خەوتن';

  /* ---------- storage ---------- */
  function load() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function save(o) {
    try {
      var keys = Object.keys(o).sort();
      while (keys.length > 400) delete o[keys.shift()];
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) {}
  }
  function dayKey(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); }

  /* ---------- stats ---------- */
  function run(data, test) {
    // consecutive days ending today (or yesterday if today has nothing yet)
    var i = test(data[daysAgo(0)]) ? 0 : 1, n = 0;
    while (test(data[daysAgo(i)])) { n++; i++; if (i > 400) break; }
    return n;
  }
  function best(data, test) {
    var keys = Object.keys(data).sort(), bestN = 0, cur = 0, prev = null;
    keys.forEach(function (k) {
      if (!test(data[k])) { cur = 0; prev = null; return; }
      var d = new Date(k + 'T00:00:00');
      if (prev) { var p = new Date(prev + 'T00:00:00'); p.setDate(p.getDate() + 1); cur = dayKey(p) === k ? cur + 1 : 1; }
      else cur = 1;
      prev = k; if (cur > bestN) bestN = cur;
    });
    return bestN;
  }
  var any = function (r) { return !!(r && r.n > 0); };
  var both = function (r) { return !!(r && r.m && r.e); };

  function num(n) { return (typeof znum === 'function') ? znum(n) : String(n); }

  /* ---------- recording ---------- */
  function currentChapterName() {
    try {
      var ch = azkar[zcat].chapters[zchap];
      return String(ch.ckb || ch.ar || '').trim();
    } catch (e) { return ''; }
  }

  function record(btn) {
    var data = load(), k = dayKey();
    var r = data[k] || (data[k] = { n: 0, m: 0, e: 0, s: 0 });
    r.n++;
    btn.dataset.counted = '1';
    var name = currentChapterName();
    var list = document.getElementById('detailList');
    var all = list ? list.querySelectorAll('.counter button[data-target]') : [];
    var done = all.length > 0;
    all.forEach(function (b) { if (!b.dataset.counted) done = false; });
    if (done) {
      if (name === MORNING) r.m = 1;
      else if (name === EVENING) r.e = 1;
      else if (name === SLEEP) r.s = 1;
      toast('✓ ' + name + ' تەواو بوو');
    }
    save(data);
  }

  function wrapTick() {
    if (typeof window.tick !== 'function' || window.tick.__streak) return;
    var orig = window.tick;
    var wrapped = function (b) {
      var r = orig.apply(this, arguments);
      try {
        var target = Math.max(1, Number(b.dataset.target) || 1);
        if ((Number(b.dataset.current) || 0) >= target && !b.dataset.counted) record(b);
      } catch (e) {}
      return r;
    };
    wrapped.__streak = true;
    window.tick = wrapped;
  }

  /* ---------- UI ---------- */
  function css() {
    if (document.getElementById('zikrStreakCss')) return;
    var s = document.createElement('style');
    s.id = 'zikrStreakCss';
    s.textContent = [
      '#zStreak{margin:0 0 12px;padding:14px;border-radius:16px;background:linear-gradient(135deg,#176b4b,#0f4d36);color:#fff}',
      '#zStreak .zs-top{display:flex;justify-content:space-between;align-items:center;gap:10px}',
      '#zStreak .zs-fire{font-size:30px;line-height:1}',
      '#zStreak .zs-big{font-size:26px;font-weight:bold}',
      '#zStreak .zs-sub{font-size:12px;opacity:.85;margin-top:2px}',
      '#zStreak .zs-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}',
      '#zStreak .zs-chip{padding:5px 10px;border-radius:14px;background:rgba(255,255,255,.16);font-size:12px}',
      '#zStreak .zs-chip.on{background:#b48a3c}',
      '#zikrSearchWrap{display:none}',
      '#zikrSearchWrap.zopen{display:block}',
      '.dhikr-settings-icon.zsearch-tb{font-size:19px!important}',
      '#zToast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#173f35;color:#fff;padding:10px 16px;border-radius:20px;font-size:13px;z-index:99999;max-width:85%;text-align:center}'
    ].join('');
    document.head.appendChild(s);
  }

  function toast(msg) {
    var t = document.getElementById('zToast');
    if (!t) { t = document.createElement('div'); t.id = 'zToast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.style.display = 'none'; }, 2600);
  }

  function renderCard() {
    var box = document.getElementById('zikrList');
    if (!box || typeof zcat === 'undefined' || zcat !== -1) return;
    if (!box.firstElementChild || box.querySelector('#zStreak')) return;
    if (!box.querySelector('.zikr-item')) return; // categories not rendered yet
    var data = load(), today = data[dayKey()] || { n: 0, m: 0, e: 0, s: 0 };
    var s1 = run(data, any), s2 = run(data, both), b1 = best(data, any);
    var d = document.createElement('div');
    d.id = 'zStreak';
    d.innerHTML =
      '<div class="zs-top"><div><div class="zs-big">' + num(s1) + ' ڕۆژ</div><div class="zs-sub">بەردەوامیی خوێندنەوەی زیکر</div></div><div class="zs-fire">' + (s1 > 0 ? '🔥' : '🌱') + '</div></div>' +
      '<div class="zs-sub" style="margin-top:8px">ئەمڕۆ ' + num(today.n) + ' زیکر خوێندرایەوە' +
      (s2 > 0 ? ' · بەیانی+ئێوارە ' + num(s2) + ' ڕۆژ بەردەوام' : '') +
      (b1 > s1 ? ' · باشترین ' + num(b1) + ' ڕۆژ' : '') + '</div>' +
      '<div class="zs-chips"><span class="zs-chip' + (today.m ? ' on' : '') + '">' + (today.m ? '✓' : '○') + ' بەیانیان</span>' +
      '<span class="zs-chip' + (today.e ? ' on' : '') + '">' + (today.e ? '✓' : '○') + ' ئێواران</span>' +
      '<span class="zs-chip' + (today.s ? ' on' : '') + '">' + (today.s ? '✓' : '○') + ' خەوتن</span></div>';
    box.insertBefore(d, box.firstChild);
  }

  /* ---------- sharing ---------- */
  function siteUrl() {
    try { return location.origin + location.pathname.replace(/index\.html$/, ''); } catch (e) { return location.href; }
  }
  function share(title, text) {
    var url = siteUrl();
    var full = text + '\n\n' + url;
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
      return;
    }
    var done = function () { toast('کۆپی کرا، ئێستا دەتوانیت بینێریت'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(done, function () { prompt('کۆپی بکە:', full); });
    else prompt('کۆپی بکە:', full);
  }
  function toggleSearch() {
    var w = document.getElementById('zikrSearchWrap');
    if (!w) return;
    var open = w.classList.toggle('zopen');
    var i = document.getElementById('zikrSearch');
    if (open && i) { try { i.scrollIntoView({ block: 'center' }); } catch (e) {} i.focus(); }
  }
  function shareCard(card) {
    var ar = card.querySelector('.zikr-text'), tr = card.querySelector('.zikr-tr'), ref = card.querySelector('.zikr-ref');
    var parts = [];
    if (ar) parts.push(ar.textContent.trim());
    if (tr) parts.push(tr.textContent.trim());
    if (ref) parts.push('— ' + ref.textContent.trim());
    share('زیکر', parts.join('\n\n'));
  }

  function addShareButtons() {
    document.querySelectorAll('.dhikr-toolbar').forEach(function (bar) {
      var old = bar.querySelector('.zshare-tb'); if (old) old.remove();
      if (bar.querySelector('.zsearch-tb')) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dhikr-settings-icon zsearch-tb';
      b.title = 'گەڕان';
      b.setAttribute('aria-label', 'Search');
      b.textContent = '🔍';
      b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); toggleSearch(); };
      var right = bar.querySelector('.dhikr-toolbar-right') || bar;
      var gear = right.querySelector('.dhikr-settings-icon:not([data-zikr-marks]):not(.zsearch-tb)');
      if (gear) right.insertBefore(b, gear); else right.appendChild(b);
    });
    var list = document.getElementById('detailList');
    if (list) list.querySelectorAll('.card').forEach(function (card) {
      if (card.querySelector('.zshare') || !card.querySelector('.zikr-text')) return;
      var row = card.querySelector('.counter') || card;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zplay zshare';
      b.title = 'شەیرکردنی ئەم زیکرە';
      b.textContent = '↗ شەیر';
      b.onclick = function (e) { e.stopPropagation(); shareCard(card); };
      row.appendChild(b);
    });
  }

  /* ---------- wiring ---------- */
  var busy = false;
  function refresh() {
    if (busy) return;
    busy = true;
    try { css(); wrapTick(); addShareButtons(); renderCard(); } catch (e) {}
    busy = false;
  }
  var timer = 0;
  function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 60); }

  function start() {
    refresh();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  window.zikrStreak = { stats: function () { var d = load(); return { streak: run(d, any), both: run(d, both), best: best(d, any), today: d[dayKey()] || null }; } };
})();
