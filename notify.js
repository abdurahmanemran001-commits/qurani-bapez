/* notify.js v1 — daily notifications (hadith / ayah / fasting reminders) for the app.
 * App (Capacitor): schedules the next 30 days as LOCAL notifications (no internet, works when the app is closed).
 * Website: only shows the settings + a preview of upcoming messages. State: localStorage "notify_v1". */
(function () {
  if (window.__notifyV1) return;
  window.__notifyV1 = true;
  var KEY = 'notify_v1', DAYS = 30;
  var TITLES = { mt: 'ڕۆژووی دووشەممە و پێنجشەممە', mteve: 'سبەی ڕۆژووی سوننەتە', fri: 'جومعە موبارەک', shaban: 'مانگی شەعبان', ramadan: 'ڕەمەزانی پیرۆز', r10: 'دە شەوەکەی کۆتایی ڕەمەزان', lq: 'شەوی قەدر', shawwal: 'شەش ڕۆژی شەووال', eid: 'جەژنتان پیرۆز', dh: 'دە ڕۆژی زیلحیجە', arafa: 'ڕۆژی عەرەفە', tash: 'ڕۆژەکانی تەشریق', muh: 'مانگی موحەڕەم', ashura: 'ڕۆژی عاشوڕا', white: 'ڕۆژە سپییەکان', q: 'ئایەتی ئەمڕۆ', qv: 'فەزڵی قورئان', h: 'فەرمودەی ئەمڕۆ', dua: 'دوعا و زیکر' };
  var EID_FITR = [0, 1, 2, 3, 7], EID_ADHA = [2, 3, 4, 5, 6];
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- settings ---------- */
  function load() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    return { on: !!o.on, time: /^\d\d:\d\d$/.test(o.time) ? o.time : '08:00', eve: o.eve !== false };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var S = load();

  /* ---------- Hijri date + message picker ---------- */
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }); } catch (e) {}
  function hijri(d) {
    if (!fmt) return { d: 0, m: 0, y: 0 };
    var o = { d: 0, m: 0, y: 0 };
    fmt.formatToParts(d).forEach(function (p) { if (p.type === 'day') o.d = +p.value; else if (p.type === 'month') o.m = +p.value; else if (p.type === 'year') o.y = +p.value; });
    return o;
  }
  function dayNum(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function weekNo(d) { return Math.floor((dayNum(d) + 4) / 7); } // weeks start Monday

  function pick(pool, i) {
    var a = (window.__NOTIFY || {})[pool];
    if (!a || !a.length) return null;
    return a[((i % a.length) + a.length) % a.length];
  }
  /* returns {cat, item} for a calendar date; eve=true gives the Sunday/Wednesday evening reminder */
  function messageFor(d, eve) {
    var dow = d.getDay(), H = hijri(d), dn = dayNum(d), wk = weekNo(d), cat, idx;
    if (eve) return { cat: 'mteve', item: pick('mteve', wk * 2 + (dow === 3 ? 1 : 0)) };
    var m = H.m, hd = H.d;
    if (m === 10 && hd === 1) { var f = EID_FITR[H.y % EID_FITR.length]; return { cat: 'eid', item: pick('eid', f) }; }
    if (m === 12 && hd === 10) { var a2 = EID_ADHA[H.y % EID_ADHA.length]; return { cat: 'eid', item: pick('eid', a2) }; }
    if (m === 12 && hd === 9) return { cat: 'arafa', item: pick('arafa', H.y) };
    if (m === 12 && hd >= 11 && hd <= 13) return { cat: 'tash', item: pick('tash', hd - 11) };
    if (m === 12 && hd >= 1 && hd <= 8) return { cat: 'dh', item: pick('dh', hd - 1) };
    if (m === 1 && (hd === 9 || hd === 10)) return { cat: 'ashura', item: pick('ashura', (hd - 9) * 2 + (H.y % 2)) };
    if (m === 9) {
      if (hd >= 21) {
        if (hd % 2 === 1) return { cat: 'lq', item: pick('lq', (hd - 21) / 2) };
        return { cat: 'r10', item: pick('r10', hd - 21) };
      }
      return { cat: 'ramadan', item: pick('ramadan', hd - 1) };
    }
    var week = null;
    if (dow === 1 || dow === 4) week = { cat: 'mt', item: pick('mt', wk * 2 + (dow === 4 ? 1 : 0)) };
    else if (dow === 5) week = { cat: 'fri', item: pick('fri', wk) };
    if (week) return week;
    if (hd >= 13 && hd <= 15) return { cat: 'white', item: pick('white', (hd - 13) + m) };
    if (m === 10 && hd >= 2 && hd <= 29) return { cat: 'shawwal', item: pick('shawwal', hd - 2) };
    if (m === 8 && dn % 3 !== 0) return { cat: 'shaban', item: pick('shaban', hd - 1) };
    if (m === 1 && dn % 3 !== 0) return { cat: 'muh', item: pick('muh', hd - 1) };
    var rot = ['q', 'h', 'qv', 'h', 'dua', 'q'];
    cat = rot[dn % rot.length];
    idx = Math.floor(dn / rot.length) * 2 + (dn % rot.length > 2 ? 1 : 0);
    return { cat: cat, item: pick(cat, idx) };
  }
  function bodyOf(it) {
    var t = (it.ar ? it.ar + '\n' : '') + it.ku + (it.src ? '\n— ' + it.src : '');
    return t.length > 900 ? t.slice(0, 897) + '…' : t;
  }
  function at(d, hhmm) { var p = hhmm.split(':'); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1], 0, 0); }

  function plan() {
    var out = [], now = new Date(), i, d, mm;
    for (i = 0; i < DAYS; i++) {
      d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      mm = messageFor(d, false);
      if (mm.item) out.push({ id: 1000 + i, when: at(d, S.time), cat: mm.cat, item: mm.item });
      if (S.eve && (d.getDay() === 0 || d.getDay() === 3)) {
        var ev = messageFor(d, true);
        if (ev.item) out.push({ id: 2000 + i, when: at(d, '19:30'), cat: 'mteve', item: ev.item });
      }
    }
    return out.filter(function (x) { return x.when.getTime() > now.getTime() + 30000; });
  }

  /* ---------- native scheduling ---------- */
  function plugin() { var c = window.Capacitor; return c && c.Plugins && c.Plugins.LocalNotifications ? c.Plugins.LocalNotifications : null; }
  function isApp() { return !!plugin(); }
  function clearAll(LN) {
    return LN.getPending().then(function (r) {
      var n = (r && r.notifications) || [];
      return n.length ? LN.cancel({ notifications: n.map(function (x) { return { id: x.id }; }) }) : null;
    });
  }
  function schedule() {
    var LN = plugin();
    if (!LN) return Promise.resolve(false);
    return clearAll(LN).then(function () {
      if (!S.on) return true;
      return LN.requestPermissions().then(function (p) {
        if (!p || p.display !== 'granted') return false;
        var mk = LN.createChannel ? LN.createChannel({ id: 'daily', name: 'فەرمودە و ئایەتی ڕۆژانە', importance: 4, visibility: 1 }).catch(function () {}) : Promise.resolve();
        return mk.then(function () {
          var list = plan().map(function (x) {
            return { id: x.id, title: TITLES[x.cat] || 'قورئانی کوردی', body: bodyOf(x.item), largeBody: bodyOf(x.item), summaryText: TITLES[x.cat], schedule: { at: x.when, allowWhileIdle: true }, channelId: 'daily' };
          });
          return list.length ? LN.schedule({ notifications: list }).then(function () { return true; }) : true;
        });
      });
    }).catch(function () { return false; });
  }
  function testNow() {
    var LN = plugin(), m = messageFor(new Date(), false);
    if (LN) {
      return LN.requestPermissions().then(function (p) {
        if (!p || p.display !== 'granted') return 'denied';
        var go = LN.createChannel ? LN.createChannel({ id: 'daily', name: 'فەرمودە و ئایەتی ڕۆژانە', importance: 4, visibility: 1 }).catch(function () {}) : Promise.resolve();
        return go.then(function () {
          return LN.schedule({ notifications: [{ id: 999, title: TITLES[m.cat], body: bodyOf(m.item), largeBody: bodyOf(m.item), schedule: { at: new Date(Date.now() + 4000), allowWhileIdle: true }, channelId: 'daily' }] });
        }).then(function () { return 'sent'; });
      }).catch(function () { return 'error'; });
    }
    if (window.Notification) {
      var go2 = Notification.permission === 'granted' ? Promise.resolve('granted') : Notification.requestPermission();
      return Promise.resolve(go2).then(function (p) {
        if (p !== 'granted') return 'denied';
        try { new Notification(TITLES[m.cat], { body: bodyOf(m.item) }); return 'sent'; } catch (e) { return 'error'; }
      });
    }
    return Promise.resolve('unsupported');
  }

  /* ---------- UI ---------- */
  function css() {
    if ($('ntfCss')) return;
    var s = document.createElement('style'); s.id = 'ntfCss';
    s.textContent = '.phone:has(#notify.active) .appbar,.phone:has(#notify.active) .bottom,.phone:has(#notify.active) .status{display:none!important}' +
      '#notify{direction:rtl;padding:0 0 28px;background:#faf6ea;min-height:100%}' +
      '#notify .nt-top{display:flex;align-items:center;gap:10px;padding:14px;background:#12513f;color:#fff;position:sticky;top:0;z-index:2}' +
      '#notify .nt-top button{background:rgba(255,255,255,.16);border:0;color:#fff;border-radius:10px;padding:8px 12px;font:inherit;font-size:15px}' +
      '#notify .nt-top b{font-size:18px}' +
      '#notify .nt-box{margin:14px;background:#fff;border:1px solid #e3dcc4;border-radius:16px;padding:14px;font-size:15px;line-height:1.9;color:#1f2d2a}' +
      '#notify .nt-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0}' +
      '#notify .nt-sw{width:50px;height:28px;border-radius:14px;background:#cfc8b0;border:0;position:relative;flex:none}' +
      '#notify .nt-sw::after{content:"";position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.2s}' +
      '#notify .nt-sw.on{background:#12513f}#notify .nt-sw.on::after{right:25px}' +
      '#notify input[type=time]{font:inherit;font-size:16px;padding:6px 8px;border:1px solid #cdbf93;border-radius:10px;background:#fffdf4}' +
      '#notify .nt-btn{display:block;width:100%;margin-top:8px;padding:12px;border:0;border-radius:12px;background:#12513f;color:#fff;font:inherit;font-size:16px}' +
      '#notify .nt-note{font-size:13px;color:#6b6a58;line-height:1.8}' +
      '#notify .nt-h{margin:18px 14px 6px;font-weight:700;color:#12513f}' +
      '#notify .nt-prev{margin:0 14px 10px;background:#fff;border:1px solid #e3dcc4;border-radius:14px;padding:12px;font-size:14px;line-height:1.9}' +
      '#notify .nt-prev small{display:block;color:#a07a1c;font-weight:700}' +
      '#notify .nt-prev .ar{font-family:"Amiri","Scheherazade New",serif;font-size:19px;color:#12513f}' +
      '#notify .nt-prev em{display:block;color:#6b6a58;font-style:normal;font-size:12px}';
    document.head.appendChild(s);
  }
  var DOW = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'];
  function total() { var n = 0, L = window.__NOTIFY || {}; for (var k in L) n += L[k].length; return n; }
  function ensureView() {
    if ($('notify')) return $('notify');
    var z = $('zikr'); if (!z || !z.parentNode) return null;
    var v = document.createElement('section'); v.id = 'notify'; v.className = 'view';
    z.parentNode.appendChild(v);
    v.addEventListener('click', onClick);
    v.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'ntTime' && /^\d\d:\d\d$/.test(e.target.value)) { S.time = e.target.value; save(S); apply(); }
    });
    return v;
  }
  function render() {
    var v = $('notify'); if (!v) return;
    var now = new Date(), prev = '', i, d, m, n = 0;
    for (i = 0; i < 14 && n < 10; i++) {
      d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      m = messageFor(d, false);
      if (!m.item) continue;
      n++;
      prev += '<div class="nt-prev"><small>' + DOW[d.getDay()] + ' · ' + d.getDate() + '/' + (d.getMonth() + 1) + ' · ' + esc(TITLES[m.cat]) + '</small>' + (m.item.ar ? '<div class="ar">' + esc(m.item.ar) + '</div>' : '') + esc(m.item.ku) + (m.item.src ? '<em>— ' + esc(m.item.src) + '</em>' : '') + '</div>';
    }
    v.innerHTML = '<div class="nt-top"><button data-act="back">‹ گەڕانەوە</button><b>🔔 نۆتیفیکەیشنی ڕۆژانە</b></div>' +
      '<div class="nt-box"><div class="nt-row"><span>ناردنی فەرمودە و ئایەت بە شێوەی خۆکار</span><button class="nt-sw' + (S.on ? ' on' : '') + '" data-act="toggle" aria-label="چالاککردن"></button></div>' +
      '<div class="nt-row"><span>کاتی نۆتیفیکەیشن</span><input type="time" id="ntTime" value="' + S.time + '"></div>' +
      '<div class="nt-row"><span>بیرخستنەوەی ئێوارەی ڕۆژووی دووشەممە و پێنجشەممە</span><button class="nt-sw' + (S.eve ? ' on' : '') + '" data-act="eve" aria-label="ئێوارە"></button></div>' +
      '<button class="nt-btn" data-act="test">🔔 تاقیکردنەوە (٤ چرکە دواتر)</button>' +
      '<div class="nt-note" id="ntStatus">' + (isApp() ? 'ئەپەکە ٣٠ ڕۆژی داهاتوو خۆی ئامادە دەکات، بێ ئینتەرنێت و بێ کردنەوەی ئەپ. هەر جارێک ئەپەکە بکەیتەوە نوێ دەبێتەوە.' : 'ئەم بەشە لە ئەپی ئەندرۆید و ئایفۆندا ڕۆژانە خۆکارانە نۆتیفیکەیشن دەنێرێت. لێرەدا تەنها ڕێکخستن و پێشبینین دەبینیت.') + '<br>ژمارەی نامەکان: ' + total() + ' نامە — فەرمودەی دووشەممە/پێنجشەممە، هەینی، شەعبان، ڕەمەزان، دە شەوی کۆتایی، شەووال، جەژن، زیلحیجە، عەرەفە، موحەڕەم، ئایەت، فەرمودە و دوعا.</div></div>' +
      '<div class="nt-h">نامەکانی ڕۆژانی داهاتوو</div>' + prev;
  }
  function status(t) { var e = $('ntStatus'); if (e) e.textContent = t; }
  function apply() { if (isApp()) schedule().then(function (ok) { if (S.on && !ok) status('ڕێگەپێدانی نۆتیفیکەیشن نەدرا. لە ڕێکخستنەکانی مۆبایل ڕێگە بدە.'); }); }
  function onClick(e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
    var a = b.getAttribute('data-act');
    if (a === 'back') { if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); var bt = document.querySelector('.bottom'); if (bt) bt.classList.remove('hidden'); return; }
    if (a === 'toggle') { S.on = !S.on; save(S); b.classList.toggle('on', S.on); apply(); if (S.on && !isApp()) status('لە ئەپی مۆبایلدا نۆتیفیکەیشنەکان چالاک دەبن. ئەم بەشە لە وێبسایتدا تەنها پێشبینینە.'); }
    else if (a === 'eve') { S.eve = !S.eve; save(S); b.classList.toggle('on', S.eve); apply(); }
    else if (a === 'test') { testNow().then(function (r) { status(r === 'sent' ? 'نۆتیفیکەیشنی تاقیکردنەوە نێردرا.' : r === 'denied' ? 'ڕێگەپێدان نەدرا؛ لە ڕێکخستنەکانی مۆبایل/وێبگەڕ ڕێگە بدە.' : 'ئەم ئامێرە پشتگیری نۆتیفیکەیشن ناکات.'); }); }
  }
  window.enterNotify = function () {
    css();
    if (!ensureView()) return;
    if (typeof showView === 'function') showView('notify', 'نۆتیفیکەیشن');
    var bt = document.querySelector('.bottom'); if (bt) bt.classList.add('hidden');
    render();
    var m = $('notify').closest('.main'); if (m) m.scrollTop = 0;
  };
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box || box.querySelector('.notify-choice')) return !!box;
    var b = document.createElement('button');
    b.className = 'section-choice notify-choice'; b.type = 'button';
    b.onclick = function () { window.enterNotify(); };
    b.innerHTML = '<span class="choice-icon">🔔</span><span class="choice-copy"><b>نۆتیفیکەیشنی ڕۆژانە</b><small>فەرمودە، ئایەت و بیرخستنەوەی ڕۆژوو بەبێ کردنەوەی ئەپ</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b); return true;
  }
  function start() {
    css(); ensureView(); addCard();
    var n = 0, iv = setInterval(function () { addCard(); if (++n > 20) clearInterval(iv); }, 500);
    var box = document.querySelector('#startScreen .section-choices');
    if (box) new MutationObserver(function () { addCard(); }).observe(box, { childList: true });
    /* keep the 30-day window fresh: on launch and when the app returns to the foreground */
    if (S.on && isApp()) apply();
    document.addEventListener('visibilitychange', function () { if (!document.hidden && S.on && isApp()) apply(); });
  }
  window.__notifyPlan = function (n) { return plan().slice(0, n || 100); };
  window.__notifyMessageFor = messageFor;
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
