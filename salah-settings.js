/* salah-settings.js — appearance, method, adhan notifications, better qibla */
(function () {
  if (window.__salahSettings) return;
  window.__salahSettings = true;

  var KEY = 'salah_settings_v1';
  var cfg = {
    fontScale: 1, theme: 'green', iconSet: 'emoji',
    method: 3, school: 0,
    notifOn: false, adhanId: 'makkah',
    notifPrayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }
  };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  var THEMES = {
    green: { hero: '#176b4b', bg: '#f4faf7' },
    navy: { hero: '#1a365d', bg: '#eef2f7' },
    gold: { hero: '#8a6d3b', bg: '#faf6ef' },
    dark: { hero: '#111827', bg: '#0f172a' },
    teal: { hero: '#0f766e', bg: '#f0fdfa' }
  };
  var ICONS = {
    emoji: { Fajr: '🌅', Sunrise: '☀️', Dhuhr: '🕌', Asr: '🌤️', Maghrib: '🌇', Isha: '🌙' },
    arabic: { Fajr: 'فجر', Sunrise: 'شروق', Dhuhr: 'ظهر', Asr: 'عصر', Maghrib: 'مغرب', Isha: 'عشاء' },
    none: { Fajr: '', Sunrise: '', Dhuhr: '', Asr: '', Maghrib: '', Isha: '' }
  };
  var ADHANS = [
    { id: 'makkah', name: 'بانگی مەککە', url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3' },
    { id: 'madinah', name: 'بانگی مەدینە', url: 'https://cdn.aladhan.com/audio/adhans/a2.mp3' },
    { id: 'alaqsa', name: 'بانگی ئەقسا', url: 'https://cdn.aladhan.com/audio/adhans/a3.mp3' },
    { id: 'egypt', name: 'بانگی میسر', url: 'https://cdn.aladhan.com/audio/adhans/a4.mp3' },
    { id: 'soft', name: 'بانگی نەرم', url: 'https://cdn.aladhan.com/audio/adhans/a5.mp3' }
  ];
  var METHODS = [
    { id: 3, name: 'Muslim World League' },
    { id: 4, name: 'Umm Al-Qura' },
    { id: 5, name: 'Egyptian' },
    { id: 13, name: 'Diyanet' },
    { id: 2, name: 'ISNA' }
  ];

  var notifTimers = [];
  var adhanAudio = null;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {}
  }

  function applyTheme() {
    var th = THEMES[cfg.theme] || THEMES.green;
    var st = document.getElementById('salahThemeCss');
    if (!st) {
      st = document.createElement('style');
      st.id = 'salahThemeCss';
      document.head.appendChild(st);
    }
    var dark = cfg.theme === 'dark';
    st.textContent =
      '#salahView{background:' + th.bg + ' !important;font-size:' + (14 * cfg.fontScale) + 'px !important;color:' + (dark ? '#e2e8f0' : 'inherit') + '}' +
      '.salah-hero{background:' + th.hero + ' !important}' +
      '.salah-tabs button.on,.salah-loc button{background:' + th.hero + ' !important;border-color:' + th.hero + ' !important}' +
      '.salah-row .nm{font-size:' + (15 * cfg.fontScale) + 'px}' +
      '.salah-row .tm,.now-clock{font-size:' + (16 * cfg.fontScale) + 'px}';
  }

  function playAdhan() {
    try {
      if (adhanAudio) { adhanAudio.pause(); adhanAudio = null; }
      var a = ADHANS.find(function (x) { return x.id === cfg.adhanId; }) || ADHANS[0];
      adhanAudio = new Audio(a.url);
      adhanAudio.play().catch(function () {});
    } catch (e) {}
  }

  function clearNotifs() {
    notifTimers.forEach(function (t) { clearTimeout(t); });
    notifTimers = [];
  }

  async function enableNotif() {
    if (!('Notification' in window)) { alert('پشتگیری ناکرێت'); return false; }
    var p = Notification.permission;
    if (p !== 'granted') p = await Notification.requestPermission();
    if (p !== 'granted') { alert('ڕێگە بدە'); return false; }
    cfg.notifOn = true;
    save();
    return true;
  }

  function openSettingsPanel() {
    applyTheme();
    var body = document.getElementById('salahBody');
    if (!body) return;

    var methodOpts = METHODS.map(function (m) {
      return '<option value="' + m.id + '"' + (cfg.method == m.id ? ' selected' : '') + '>' + m.name + '</option>';
    }).join('');
    var themeOpts = Object.keys(THEMES).map(function (k) {
      var names = { green: 'سەوز', navy: 'شین', gold: 'زەڕین', dark: 'ڕەش', teal: 'کەنەری' };
      return '<option value="' + k + '"' + (cfg.theme === k ? ' selected' : '') + '>' + (names[k] || k) + '</option>';
    }).join('');
    var iconOpts = Object.keys(ICONS).map(function (k) {
      var names = { emoji: 'Emoji', arabic: 'عەرەبی', none: 'بێ ئایکۆن' };
      return '<option value="' + k + '"' + (cfg.iconSet === k ? ' selected' : '') + '>' + (names[k] || k) + '</option>';
    }).join('');
    var adhanOpts = ADHANS.map(function (a) {
      return '<option value="' + a.id + '"' + (cfg.adhanId === a.id ? ' selected' : '') + '>' + a.name + '</option>';
    }).join('');
    var prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    var labels = { Fajr: 'بەیانی', Dhuhr: 'نیوەڕۆ', Asr: 'عەسر', Maghrib: 'مەغریب', Isha: 'عیشا' };
    var checks = prayers.map(function (id) {
      var on = cfg.notifPrayers && cfg.notifPrayers[id];
      return '<label style="display:flex;gap:8px;margin:6px 0;align-items:center"><input type="checkbox" data-p="' + id + '"' + (on ? ' checked' : '') + '> ' + labels[id] + '</label>';
    }).join('');

    body.innerHTML =
      '<div class="salah-card"><h3 style="margin:0 0 10px">دەرکەوتن</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>قەبارەی نووسین</span><input type="range" id="ssFont" min="0.85" max="1.35" step="0.05" value="' + cfg.fontScale + '" style="width:50%"></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>باکگراوند</span><select id="ssTheme">' + themeOpts + '</select></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>ئایکۆن</span><select id="ssIcon">' + iconOpts + '</select></div></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">حیسابی کات</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>شێواز</span><select id="ssMethod">' + methodOpts + '</select></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>عەسر</span><select id="ssSchool"><option value="0"' + (cfg.school == 0 ? ' selected' : '') + '>شافعی</option><option value="1"' + (cfg.school == 1 ? ' selected' : '') + '>حەنەفی</option></select></div></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">نۆتیفیکەیشن و بانگ</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>ئاگاداری</span><button type="button" id="ssNotif" style="padding:8px 12px;border:0;border-radius:10px;background:#176b4b;color:#fff">' + (cfg.notifOn ? 'چالاکە ✓' : 'چالاک بکە') + '</button></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>بانگدەر</span><select id="ssAdhan">' + adhanOpts + '</select></div>' +
      '<div><b>نوێژەکان:</b>' + checks + '</div>' +
      '<button type="button" id="ssTest" style="width:100%;margin-top:10px;padding:10px;border:0;border-radius:10px;background:#444;color:#fff">▶ تاقیکردنەوەی بانگ</button></div>';

    document.getElementById('ssFont').oninput = function () { cfg.fontScale = +this.value; save(); applyTheme(); };
    document.getElementById('ssTheme').onchange = function () { cfg.theme = this.value; save(); applyTheme(); openSettingsPanel(); };
    document.getElementById('ssIcon').onchange = function () { cfg.iconSet = this.value; save(); };
    document.getElementById('ssMethod').onchange = function () {
      cfg.method = +this.value; save();
      try {
        localStorage.setItem('salah_v1', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('salah_v1') || '{}'), { method: cfg.method })));
      } catch (e) {}
      alert('دوای نوێکردنەوە (↻) کاتەکان بە شێوازی نوێ دێن.');
    };
    document.getElementById('ssSchool').onchange = function () { cfg.school = +this.value; save(); };
    document.getElementById('ssAdhan').onchange = function () { cfg.adhanId = this.value; save(); };
    document.getElementById('ssNotif').onclick = async function () {
      if (cfg.notifOn) { cfg.notifOn = false; save(); this.textContent = 'چالاک بکە'; clearNotifs(); }
      else if (await enableNotif()) this.textContent = 'چالاکە ✓';
    };
    document.getElementById('ssTest').onclick = function () { playAdhan(); };
    body.querySelectorAll('input[data-p]').forEach(function (cb) {
      cb.onchange = function () {
        if (!cfg.notifPrayers) cfg.notifPrayers = {};
        cfg.notifPrayers[cb.getAttribute('data-p')] = cb.checked;
        save();
      };
    });
  }

  function enhanceTabs() {
    var tabs = document.querySelector('.salah-tabs');
    if (!tabs || tabs.querySelector('[data-tab="settings"]')) return;
    tabs.style.gridTemplateColumns = 'repeat(4,1fr)';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-tab', 'settings');
    btn.textContent = 'ڕێکخستن';
    btn.onclick = function () {
      tabs.querySelectorAll('button').forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      openSettingsPanel();
    };
    tabs.appendChild(btn);
  }

  var origEnter = window.enterSalah;
  window.enterSalah = function () {
    if (typeof origEnter === 'function') origEnter();
    setTimeout(function () { enhanceTabs(); applyTheme(); }, 300);
    setTimeout(enhanceTabs, 1000);
  };

  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    if (typeof url === 'string' && url.indexOf('api.aladhan.com/v1/timings') >= 0) {
      try {
        var u = new URL(url);
        u.searchParams.set('method', String(cfg.method || 3));
        u.searchParams.set('school', String(cfg.school || 0));
        url = u.toString();
      } catch (e) {}
    }
    return _fetch.call(this, url, opts);
  };

  applyTheme();
  setInterval(enhanceTabs, 2000);
})();
