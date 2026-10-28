/* salah-settings.js — appearance, method, adhan, minute offsets */
(function () {
  if (window.__salahSettings) return;
  window.__salahSettings = true;

  var KEY = 'salah_settings_v1';
  var cfg = {
    fontScale: 1, theme: 'green', iconSet: 'emoji',
    method: 3, school: 0,
    notifOn: false, adhanId: 'makkah',
    notifPrayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    offsets: { Fajr: 0, Sunrise: 0, Dhuhr: 10, Asr: 0, Maghrib: 3, Isha: 0 }
  };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.assign(cfg, saved);
    if (!cfg.offsets) cfg.offsets = { Fajr: 0, Sunrise: 0, Dhuhr: 10, Asr: 0, Maghrib: 3, Isha: 0 };
    else {
      var defO = { Fajr: 0, Sunrise: 0, Dhuhr: 10, Asr: 0, Maghrib: 3, Isha: 0 };
      Object.keys(defO).forEach(function (k) {
        if (typeof cfg.offsets[k] !== 'number') cfg.offsets[k] = defO[k];
      });
    }
  } catch (e) {}

  var THEMES = {
    green: { hero: '#176b4b', bg: '#f4faf7' },
    navy: { hero: '#1a365d', bg: '#eef2f7' },
    gold: { hero: '#8a6d3b', bg: '#faf6ef' },
    dark: { hero: '#111827', bg: '#0f172a' },
    teal: { hero: '#0f766e', bg: '#f0fdfa' }
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

  var adhanAudio = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }

  function applyTheme() {
    var th = THEMES[cfg.theme] || THEMES.green;
    var st = document.getElementById('salahThemeCss');
    if (!st) { st = document.createElement('style'); st.id = 'salahThemeCss'; document.head.appendChild(st); }
    var dark = cfg.theme === 'dark';
    st.textContent =
      '#salahView{background:' + th.bg + ' !important;font-size:' + (14 * cfg.fontScale) + 'px !important;color:' + (dark ? '#e2e8f0' : 'inherit') + '}' +
      '.salah-hero{background:' + th.hero + ' !important}' +
      '.salah-tabs button.on,.salah-loc button{background:' + th.hero + ' !important;border-color:' + th.hero + ' !important}';
  }

  function playAdhan() {
    try {
      if (adhanAudio) { adhanAudio.pause(); adhanAudio = null; }
      var a = ADHANS.find(function (x) { return x.id === cfg.adhanId; }) || ADHANS[0];
      adhanAudio = new Audio(a.url);
      adhanAudio.play().catch(function () {});
    } catch (e) {}
  }

  async function enableNotif() {
    if (!('Notification' in window)) { alert('پشتگیری ناکرێت'); return false; }
    var p = Notification.permission;
    if (p !== 'granted') p = await Notification.requestPermission();
    if (p !== 'granted') { alert('ڕێگە بدە'); return false; }
    cfg.notifOn = true; save(); return true;
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
    var adhanOpts = ADHANS.map(function (a) {
      return '<option value="' + a.id + '"' + (cfg.adhanId === a.id ? ' selected' : '') + '>' + a.name + '</option>';
    }).join('');
    var labels = { Fajr: 'بەیانی', Dhuhr: 'نیوەڕۆ', Asr: 'عەسر', Maghrib: 'مەغریب', Isha: 'عیشا' };
    var checks = ['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(function (id) {
      var on = cfg.notifPrayers && cfg.notifPrayers[id];
      return '<label style="display:flex;gap:8px;margin:6px 0;align-items:center"><input type="checkbox" data-p="' + id + '"' + (on ? ' checked' : '') + '> ' + labels[id] + '</label>';
    }).join('');
    var offRows = ['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(function (id) {
      var v = (cfg.offsets && typeof cfg.offsets[id] === 'number') ? cfg.offsets[id] : 0;
      return '<div style="display:flex;justify-content:space-between;margin:6px 0;align-items:center"><span>' + labels[id] + '</span><span dir="ltr"><input type="number" data-off="' + id + '" value="' + v + '" min="-30" max="30" step="1" style="width:64px;padding:6px;border:1px solid #ccc;border-radius:8px"> خولەک</span></div>';
    }).join('');

    body.innerHTML =
      '<div class="salah-card"><h3 style="margin:0 0 10px">دەرکەوتن</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>قەبارەی نووسین</span><input type="range" id="ssFont" min="0.85" max="1.35" step="0.05" value="' + cfg.fontScale + '" style="width:50%"></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>باکگراوند</span><select id="ssTheme">' + themeOpts + '</select></div></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">حیسابی کات</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>شێواز</span><select id="ssMethod">' + methodOpts + '</select></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>عەسر</span><select id="ssSchool"><option value="0"' + (cfg.school == 0 ? ' selected' : '') + '>شافعی</option><option value="1"' + (cfg.school == 1 ? ' selected' : '') + '>حەنەفی</option></select></div></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">ڕێکخستنی خولەک</h3>' +
      '<p style="font-size:12px;opacity:.8;margin:0 0 8px">ئەگەر کاتەکان زوو/درەنگ بن، لێرە ڕێکیان بخە. پێشگریمان: نیوەڕۆ +١٠.</p>' +
      offRows +
      '<button type="button" id="ssOffSave" style="width:100%;margin-top:10px;padding:10px;border:0;border-radius:10px;background:#176b4b;color:#fff">پاشەکەوت و نوێکردنەوەی کات</button></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">نۆتیفیکەیشن و بانگ</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>ئاگاداری</span><button type="button" id="ssNotif" style="padding:8px 12px;border:0;border-radius:10px;background:#176b4b;color:#fff">' + (cfg.notifOn ? 'چالاکە ✓' : 'چالاک بکە') + '</button></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>بانگدەر</span><select id="ssAdhan">' + adhanOpts + '</select></div>' +
      '<div><b>نوێژەکان:</b>' + checks + '</div>' +
      '<button type="button" id="ssTest" style="width:100%;margin-top:10px;padding:10px;border:0;border-radius:10px;background:#444;color:#fff">▶ تاقیکردنەوەی بانگ</button></div>';

    document.getElementById('ssFont').oninput = function () { cfg.fontScale = +this.value; save(); applyTheme(); };
    document.getElementById('ssTheme').onchange = function () { cfg.theme = this.value; save(); applyTheme(); openSettingsPanel(); };
    document.getElementById('ssMethod').onchange = function () {
      cfg.method = +this.value; save();
      try { localStorage.setItem('salah_v1', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('salah_v1') || '{}'), { method: cfg.method }))); } catch (e) {}
      alert('دوای ↻ کاتەکان نوێ دەبنەوە.');
    };
    document.getElementById('ssSchool').onchange = function () { cfg.school = +this.value; save(); };
    document.getElementById('ssOffSave').onclick = function () {
      if (!cfg.offsets) cfg.offsets = {};
      body.querySelectorAll('input[data-off]').forEach(function (inp) {
        cfg.offsets[inp.getAttribute('data-off')] = parseInt(inp.value, 10) || 0;
      });
      save();
      alert('پاشەکەوت کرا. دوگمەی ↻ دابگرە.');
    };
    document.getElementById('ssAdhan').onchange = function () { cfg.adhanId = this.value; save(); };
    document.getElementById('ssNotif').onclick = async function () {
      if (cfg.notifOn) { cfg.notifOn = false; save(); this.textContent = 'چالاک بکە'; }
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
