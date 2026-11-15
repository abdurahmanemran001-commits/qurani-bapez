/* salah-notify.js v1 — ئاگاداری بانگ: ٧ ڕۆژ پێشوەخت (ئەپ: LocalNotifications، سایت: Notification + بانگ ئەگەر پەڕەکە کراوە بێت) */
(function () {
  if (window.__salahNotify) return;
  var CK = 'salah_settings_v1', BASE = 5000, DAYS = 7;
  var N = {
    ckb: { Fajr: 'بەیانی', Dhuhr: 'نیوەڕۆ', Asr: 'عەسر', Maghrib: 'مەغریب', Isha: 'عیشا', t: 'کاتی بانگی {p}', b: 'کاتی نوێژی {p} هات', ch: 'بانگی نوێژ', denied: 'ڕێگەی ئاگاداری نەدرا. لە ڕێکخستنەکانی مۆبایل ڕێگە بدە.', nosup: 'ئەم براوزەرە ئاگاداری پشتگیری ناکات.', test: 'تاقیکردنەوەی ئاگاداری', sent: 'تا ٥ چرکە دیکە ئاگاداری دێت' },
    en: { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha', t: 'Time for {p} adhan', b: 'It is time for {p} prayer', ch: 'Prayer call', denied: 'Notification permission denied. Allow it in phone settings.', nosup: 'This browser does not support notifications.', test: 'Test notification', sent: 'A notification will arrive in 5 seconds' },
    ar: { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء', t: 'حان وقت أذان {p}', b: 'حان وقت صلاة {p}', ch: 'أذان الصلاة', denied: 'تم رفض إذن الإشعارات. اسمح به من إعدادات الهاتف.', nosup: 'هذا المتصفح لا يدعم الإشعارات.', test: 'تجربة الإشعار', sent: 'سيصل إشعار خلال ٥ ثوانٍ' }
  };
  var IDS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  function T() { var l = window.appLang || 'ckb'; return N[l] || (l === 'bad' ? N.ckb : N.en); }
  function cfg() { try { return JSON.parse(localStorage.getItem(CK) || '{}'); } catch (e) { return {}; } }
  function core() { return window.__salahCore; }
  function LN() { var c = window.Capacitor; return c && c.Plugins && c.Plugins.LocalNotifications ? c.Plugins.LocalNotifications : null; }
  var plan = [], fired = {}, busy = false, lastSig = '';
  try { fired = JSON.parse(sessionStorage.getItem('sn_fired') || '{}'); } catch (e) {}
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ڕۆژانی داهاتوو: [{id, at:Date}] */
  async function buildPlan() {
    var C = core(); if (!C) return [];
    var S = C.S, c = cfg(), iraq = C.inIraq(S.lat, S.lng), off = iraq ? C.getOffsets() : {}, out = [], now = Date.now();
    var jobs = [];
    for (var d = 0; d < DAYS; d++) jobs.push(d);
    var res = await Promise.all(jobs.map(async function (d) {
      try {
        var pn = C.placeNow(); pn.setDate(pn.getDate() + d);
        var dd = pad(pn.getDate()) + '-' + pad(pn.getMonth() + 1) + '-' + pn.getFullYear();
        var url = 'https://api.aladhan.com/v1/timings/' + dd + '?latitude=' + encodeURIComponent(S.lat) + '&longitude=' + encodeURIComponent(S.lng) + '&method=' + (c.method || 3) + '&school=' + (c.school || 0);
        var r = await fetch(url); var j = await r.json();
        if (j.data && j.data.meta && j.data.meta.timezone && !S.tz) S.tz = j.data.meta.timezone;
        return { d: d, t: j.data.timings, day: pn };
      } catch (e) { return null; }
    }));
    res.forEach(function (x) {
      if (!x) return;
      IDS.forEach(function (id) {
        if (c.notifPrayers && c.notifPrayers[id] === false) return;
        var hm = C.parseHM(C.addMinutes(x.t[id], off[id] || 0)); if (!hm) return;
        var wall = new Date(x.day.getTime()); wall.setHours(hm.h, hm.m, 0, 0);
        var at = new Date(Date.now() + (wall.getTime() - C.placeNow().getTime()));
        if (at.getTime() > now - 60000) out.push({ id: id, at: at });
      });
    });
    out.sort(function (a, b) { return a.at - b.at; });
    return out;
  }
  function msgs(id) { var t = T(), p = t[id]; var city = (core() && core().S.city) || ''; return { title: t.t.replace('{p}', p), body: t.b.replace('{p}', p) + (city ? ' — ' + city : '') }; }

  async function ensureChannel(l) {
    if (!l.createChannel) return;
    try { await l.createChannel({ id: 'adhan', name: T().ch, importance: 5, visibility: 1, sound: 'adhan.mp3', vibration: true }); } catch (e) {}
  }
  async function scheduleNative(l) {
    try {
      var pend = await l.getPending(); var mine = ((pend && pend.notifications) || []).filter(function (x) { return x.id >= BASE && x.id < BASE + 1000; });
      if (mine.length) await l.cancel({ notifications: mine.map(function (x) { return { id: x.id }; }) });
      if (!cfg().notifOn) return;
      var p = await l.requestPermissions(); if (!p || p.display !== 'granted') return;
      await ensureChannel(l);
      var list = plan.filter(function (x) { return x.at.getTime() > Date.now() + 5000; }).slice(0, 35).map(function (x, i) {
        var m = msgs(x.id); return { id: BASE + i, title: m.title, body: m.body, largeBody: m.body, schedule: { at: x.at, allowWhileIdle: true }, channelId: 'adhan', sound: 'adhan.mp3' };
      });
      if (list.length) await l.schedule({ notifications: list });
    } catch (e) {}
  }
  async function refresh(force) {
    if (busy) return; var c = cfg(), C = core(); if (!C) return;
    var sig = JSON.stringify([c.notifOn, c.notifPrayers, c.offsets, c.method, c.school, C.S.lat, C.S.lng, window.appLang]);
    if (!force && sig === lastSig && plan.length) return;
    busy = true;
    try {
      if (!c.notifOn) { plan = []; var l0 = LN(); if (l0) await scheduleNative(l0); lastSig = sig; return; }
      var p = await buildPlan(); if (p.length) plan = p; lastSig = sig;
      var l = LN(); if (l) await scheduleNative(l);
    } finally { busy = false; }
  }
  async function enable() {
    var l = LN();
    if (l) {
      var p = await l.requestPermissions();
      if (!p || p.display !== 'granted') { alert(T().denied); return false; }
    } else {
      if (!('Notification' in window)) { alert(T().nosup); return false; }
      var r = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (r !== 'granted') { alert(T().denied); return false; }
    }
    var c = cfg(); c.notifOn = true; try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {}
    refresh(true); return true;
  }
  function disable() { var c = cfg(); c.notifOn = false; try { localStorage.setItem(CK, JSON.stringify(c)); } catch (e) {} refresh(true); }
  function webNotify(m) {
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification(m.title, { body: m.body, icon: 'icon.svg', tag: 'salah-' + m.title }); } catch (e) {}
  }
  async function test() {
    var l = LN(), m = msgs('Dhuhr');
    if (l) {
      var p = await l.requestPermissions(); if (!p || p.display !== 'granted') { alert(T().denied); return; }
      await ensureChannel(l);
      await l.schedule({ notifications: [{ id: BASE + 999, title: m.title, body: m.body, schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true }, channelId: 'adhan', sound: 'adhan.mp3' }] });
    } else {
      if (!('Notification' in window)) { alert(T().nosup); return; }
      var r = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (r !== 'granted') { alert(T().denied); return; }
      setTimeout(function () { webNotify(m); if (window.__salahPlayAdhan) window.__salahPlayAdhan(); }, 5000);
    }
    alert(T().sent);
  }
  /* پەڕە کراوەیە: لە کاتی بانگ، بانگ + ئاگاداری */
  function tick() {
    var c = cfg(); if (!c.notifOn || !plan.length) return; var now = Date.now();
    plan.forEach(function (x) {
      var k = x.id + x.at.getTime(), dt = now - x.at.getTime();
      if (dt >= 0 && dt < 60000 && !fired[k]) {
        fired[k] = 1; try { sessionStorage.setItem('sn_fired', JSON.stringify(fired)); } catch (e) {}
        if (!LN()) webNotify(msgs(x.id));
        if (c.adhanPlay !== false && window.__salahPlayAdhan) window.__salahPlayAdhan();
      }
    });
  }
  window.__salahNotify = { enable: enable, disable: disable, test: test, refresh: refresh, plan: function () { return plan; }, T: T };
  setInterval(tick, 1000);
  setInterval(function () { refresh(false); }, 5000);
  setInterval(function () { refresh(true); }, 6 * 3600 * 1000);
  setTimeout(function () { refresh(true); }, 2500);
})();
