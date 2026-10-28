/* salah.js v3 — live countdown + fixed city search (Kurdish aliases, force refresh) */
(function () {
  if (window.__salahV3) return;
  window.__salahV3 = true;

  var KEY = 'salah_v1';
  var NAMES = [
    { id: 'Fajr', ku: 'بەیانی', ar: 'الفجر' },
    { id: 'Sunrise', ku: 'ڕۆژهەڵاتن', ar: 'الشروق' },
    { id: 'Dhuhr', ku: 'نیوەڕۆ', ar: 'الظهر' },
    { id: 'Asr', ku: 'عەسر', ar: 'العصر' },
    { id: 'Maghrib', ku: 'مەغریب', ar: 'المغرب' },
    { id: 'Isha', ku: 'عیشا', ar: 'العشاء' }
  ];

  /* Kurdish / Arabic / common spellings → English for geocoding */
  var CITY_ALIASES = {
    'سلێمانی': 'Sulaymaniyah', 'سليماني': 'Sulaymaniyah', 'سليمانية': 'Sulaymaniyah',
    'السليمانية': 'Sulaymaniyah', 'slemani': 'Sulaymaniyah', 'sulaymaniyah': 'Sulaymaniyah',
    'sulaimani': 'Sulaymaniyah', 'sulaimaniya': 'Sulaymaniyah',
    'هەولێر': 'Erbil', 'أربيل': 'Erbil', 'اربیل': 'Erbil', 'اربيل': 'Erbil',
    'هەولير': 'Erbil', 'hawler': 'Erbil', 'erbil': 'Erbil',
    'دهۆک': 'Duhok', 'دهوك': 'Duhok', 'دهوق': 'Duhok', 'duhok': 'Duhok', 'dahuk': 'Duhok',
    'کەرکوک': 'Kirkuk', 'كركوك': 'Kirkuk', 'kirkuk': 'Kirkuk',
    'بەغدا': 'Baghdad', 'بغداد': 'Baghdad', 'baghdad': 'Baghdad',
    'مووسڵ': 'Mosul', 'موصل': 'Mosul', 'mosul': 'Mosul',
    'بەسڕە': 'Basra', 'بصرە': 'Basra', 'البصرة': 'Basra', 'basra': 'Basra',
    'هەڵەبجە': 'Halabja', 'حلبجة': 'Halabja', 'halabja': 'Halabja',
    'زاخۆ': 'Zakho', 'زاخو': 'Zakho', 'zakho': 'Zakho',
    'کۆیە': 'Koya', 'كويه': 'Koya', 'ranya': 'Ranya', 'رانیە': 'Ranya', 'رانية': 'Ranya',
    'مەککە': 'Makkah', 'مكة': 'Makkah', 'مكه': 'Makkah', 'mecca': 'Makkah', 'makkah': 'Makkah',
    'مەدینە': 'Madinah', 'المدينة': 'Madinah', 'medina': 'Madinah', 'madinah': 'Madinah',
    'لەندەن': 'London', 'لندن': 'London', 'استانبول': 'Istanbul', 'ئەستەنبوڵ': 'Istanbul'
  };

  var S = { city: 'Erbil', country: 'Iraq', lat: 36.1911, lng: 44.0094, method: 3, tab: 'times' };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  var times = null;
  var tickTimer = null;
  var qiblaWatch = null;

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ city: S.city, country: S.country, lat: S.lat, lng: S.lng, method: S.method }));
    } catch (e) {}
  }

  function injectCss() {
    if (document.getElementById('salahCss')) return;
    var st = document.createElement('style');
    st.id = 'salahCss';
    st.textContent = [
      '.salah-choice{border-color:#b8c9e0;background:linear-gradient(135deg,#fff,#eef3fb)}',
      '.salah-choice .choice-icon{background:#dbe6f6;color:#2a4a7a}',
      '#salahView{padding:10px 12px 24px}',
      '.salah-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}',
      '.salah-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}',
      '.salah-tabs button{border:1px solid #dce5e1;background:#fff;border-radius:11px;padding:10px 6px;cursor:pointer;font-size:13px}',
      '.salah-tabs button.on{background:#176b4b;color:#fff;border-color:#176b4b;font-weight:bold}',
      '.salah-loc{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}',
      '.salah-loc input{flex:1;min-width:120px;border:1px solid #dce5e1;border-radius:11px;padding:10px;background:#fff}',
      '.salah-loc button{border:0;border-radius:11px;padding:10px 12px;background:#176b4b;color:#fff;cursor:pointer}',
      '.salah-hero{background:#176b4b;color:#fff;border-radius:22px;padding:22px 16px 18px;margin-bottom:14px;text-align:center}',
      '.salah-ring{width:168px;height:168px;margin:0 auto 8px;border-radius:50%;border:6px solid rgba(255,255,255,.35);border-top-color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box}',
      '.salah-hero .now-name{font-size:26px;font-weight:bold;margin:0 0 4px}',
      '.salah-hero .now-clock{font-size:32px;font-weight:bold;letter-spacing:1px;direction:ltr;font-variant-numeric:tabular-nums}',
      '.salah-hero .now-label{font-size:13px;opacity:.95;margin-top:4px}',
      '.salah-hero .now-loc{font-size:12px;opacity:.9;margin-top:10px;line-height:1.6}',
      '.salah-hero .now-since{font-size:13px;opacity:.95;margin-top:6px}',
      '.salah-list{display:grid;gap:0}',
      '.salah-row{display:flex;align-items:center;justify-content:space-between;padding:14px 6px;border-bottom:1px solid #eef2f1;cursor:pointer}',
      '.salah-row:last-child{border-bottom:0}',
      '.salah-row.current{background:#e8f3ee;margin:0 -6px;padding:14px 12px;border-radius:12px;border-bottom:0}',
      '.salah-row .nm{font-weight:bold;font-size:16px;color:#1a2a24}',
      '.salah-row .ar{color:#6d7975;font-size:12px;margin-top:2px}',
      '.salah-row .tm{font-size:16px;font-weight:bold;direction:ltr;color:#174f3b;font-variant-numeric:tabular-nums}',
      '.salah-row.past .nm,.salah-row.past .tm{color:#9aa39f}',
      '.salah-card{background:#fff;border:1px solid #dce5e1;border-radius:14px;padding:14px;margin-bottom:10px}',
      '.salah-card h3{margin:0 0 8px;font-size:16px;color:#174f3b}',
      '.salah-card .ar{font-family:serif;font-size:18px;line-height:1.9;text-align:right;margin:8px 0}',
      '.salah-card .ku{font-size:14px;line-height:1.8;color:#2c3f37}',
      '.salah-card .src{font-size:12px;color:#6d7975;margin-top:6px}',
      '.qibla-box{text-align:center;padding:16px}',
      '.qibla-compass{width:220px;height:220px;margin:12px auto;border-radius:50%;border:6px solid #176b4b;position:relative;background:radial-gradient(circle,#f9fbfa,#e8f3ee)}',
      '.qibla-needle{position:absolute;left:50%;top:50%;width:4px;height:90px;margin-left:-2px;margin-top:-90px;background:linear-gradient(#c0392b,#e74c3c);transform-origin:bottom center;border-radius:2px;transition:transform .15s linear}',
      '.qibla-kaaba{position:absolute;left:50%;top:12px;transform:translateX(-50%);font-size:22px}',
      '.qibla-deg{font-size:22px;font-weight:bold;direction:ltr;margin-top:8px}',
      '.qibla-hint{font-size:13px;color:#6d7975;line-height:1.7;margin-top:8px}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function parseHM(s) {
    var m = String(s || '').match(/(\d{1,2}):(\d{2})/);
    return m ? { h: +m[1], m: +m[2] } : null;
  }
  function toDate(hm) {
    if (!hm) return null;
    var d = new Date();
    d.setHours(hm.h, hm.m, 0, 0);
    return d;
  }
  function fmtHM(d) {
    if (!d) return '--:--';
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function fmtClock(ms) {
    if (ms < 0) ms = 0;
    var total = Math.floor(ms / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(h) + ':' + p(m) + ':' + p(s);
  }
  function fmtDurWords(ms) {
    if (ms < 0) ms = 0;
    var total = Math.floor(ms / 60000);
    var h = Math.floor(total / 60), m = total % 60;
    if (h > 0) return h + ' کاتژمێر و ' + m + ' خولەک';
    return m + ' خولەک';
  }

  function getTimeline() {
    if (!times) return null;
    var now = new Date();
    var list = NAMES.map(function (n) {
      var d = toDate(parseHM(times[n.id]));
      return { id: n.id, ku: n.ku, ar: n.ar, date: d, raw: times[n.id] };
    }).filter(function (x) { return x.date; });
    var current = null, next = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].date <= now) current = list[i];
      if (list[i].date > now && !next) next = list[i];
    }
    if (!next && list.length) {
      var fajr = list.find(function (x) { return x.id === 'Fajr'; });
      if (fajr) {
        next = Object.assign({}, fajr);
        next.date = new Date(fajr.date.getTime() + 86400000);
        next.tomorrow = true;
      }
    }
    if (!current && list.length) {
      var isha = list.find(function (x) { return x.id === 'Isha'; });
      if (isha) {
        current = Object.assign({}, isha);
        current.date = new Date(isha.date.getTime() - 86400000);
        current.yesterday = true;
      }
    }
    return { list: list, current: current, next: next, now: now };
  }

  async function fetchTimes() {
    var url = 'https://api.aladhan.com/v1/timings?latitude=' +
      encodeURIComponent(S.lat) + '&longitude=' + encodeURIComponent(S.lng) +
      '&method=' + encodeURIComponent(S.method || 3) +
      '&timezone=auto&_=' + Date.now();
    var r = await fetch(url);
    if (!r.ok) throw new Error('net');
    var j = await r.json();
    if (!j.data || !j.data.timings) throw new Error('empty');
    times = j.data.timings;
    return times;
  }

  function buildQueries(q) {
    var raw = String(q || '').trim();
    var lower = raw.toLowerCase();
    var list = [];
    function add(x) {
      if (!x) return;
      x = String(x).trim();
      if (!x) return;
      if (list.indexOf(x) < 0) list.push(x);
    }
    add(raw);
    add(CITY_ALIASES[raw]);
    add(CITY_ALIASES[lower]);
    // strip spaces
    add(CITY_ALIASES[raw.replace(/\s+/g, '')]);
    return list;
  }

  async function geocodeOne(name) {
    var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(name) + '&count=5&language=en&format=json';
    var r = await fetch(url);
    if (!r.ok) return null;
    var j = await r.json();
    if (!j.results || !j.results.length) return null;
    // Prefer Iraq / nearby if multiple
    var preferred = j.results.find(function (x) {
      return x.country_code === 'IQ' || x.country === 'Iraq';
    });
    return preferred || j.results[0];
  }

  async function searchCity(q) {
    q = (q || '').trim();
    if (!q) return null;

    var queries = buildQueries(q);
    var hit = null;
    var usedQuery = q;

    for (var i = 0; i < queries.length; i++) {
      try {
        hit = await geocodeOne(queries[i]);
        if (hit) {
          usedQuery = queries[i];
          break;
        }
      } catch (e) {}
    }

    // Fallback: Aladhan timingsByCity (works with English city names)
    if (!hit) {
      var cityName = CITY_ALIASES[q] || CITY_ALIASES[q.toLowerCase()] || q;
      var byCity =
        'https://api.aladhan.com/v1/timingsByCity?city=' +
        encodeURIComponent(cityName) +
        '&country=' +
        encodeURIComponent(S.country || 'Iraq') +
        '&method=' +
        encodeURIComponent(S.method || 3) +
        '&_=' +
        Date.now();
      var r2 = await fetch(byCity);
      if (!r2.ok) throw new Error('city-not-found');
      var j2 = await r2.json();
      if (!j2.data || !j2.data.timings) throw new Error('empty');
      times = j2.data.timings;
      S.city = cityName;
      // approximate meta if present
      try {
        if (j2.data.meta && j2.data.meta.latitude) {
          S.lat = +j2.data.meta.latitude;
          S.lng = +j2.data.meta.longitude;
        }
      } catch (e) {}
      save();
      return times;
    }

    // Apply geocode result — ALWAYS overwrite lat/lng
    S.lat = +hit.latitude;
    S.lng = +hit.longitude;
    S.city = hit.name || usedQuery || q;
    if (hit.country) S.country = hit.country;
    times = null; // force fresh fetch
    save();
    return await fetchTimes();
  }

  function useGPS() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error('no-geo'));
      navigator.geolocation.getCurrentPosition(function (pos) {
        S.lat = pos.coords.latitude;
        S.lng = pos.coords.longitude;
        S.city = 'شوێنی ئێستا';
        times = null;
        save();
        resolve();
      }, reject, { enableHighAccuracy: true, timeout: 12000 });
    });
  }

  function qiblaBearing(lat, lng) {
    var kLat = 21.4225 * Math.PI / 180, kLng = 39.8262 * Math.PI / 180;
    var φ1 = lat * Math.PI / 180, φ2 = kLat, Δλ = kLng - lng * Math.PI / 180;
    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  function renderTimes() {
    var box = document.getElementById('salahBody');
    if (!box) return;
    var tl = getTimeline();
    if (!tl) {
      box.innerHTML = '<div class="salah-card">کاتەکان بارنەبوون. شارێک بنووسە یان GPS.</div>';
      return;
    }
    var cur = tl.current, next = tl.next;
    var since = cur ? tl.now - cur.date : 0;
    var until = next ? next.date - tl.now : 0;
    var focusIsNext = !!next;
    var clock = focusIsNext ? fmtClock(until) : fmtClock(since);
    var focus = next || cur;

    var hero =
      '<div class="salah-hero">' +
      '<div class="salah-ring">' +
      '<div class="now-name">' + (focus ? focus.ku : '—') + '</div>' +
      '<div class="now-clock" id="salahLiveClock">' + clock + '</div>' +
      '<div class="now-label">' + (focusIsNext ? 'کاتی ماوە' : 'لە کاتی بانگەوە') + '</div>' +
      '</div>' +
      (cur
        ? '<div class="now-since" id="salahSinceLine">⏱ ' + fmtDurWords(since) + ' بانگی <b>' + cur.ku + '</b> دراوە</div>'
        : '') +
      (next && cur
        ? '<div class="now-since" id="salahUntilLine">⏳ ' + fmtClock(until) + ' ماوە بۆ بانگی <b>' + next.ku + '</b></div>'
        : '') +
      '<div class="now-loc" id="salahLocLine">📍 ' +
      (S.city || '') + (S.country ? ' · ' + S.country : '') +
      '<br dir="ltr">' + S.lat.toFixed(4) + ', ' + S.lng.toFixed(4) +
      '</div></div>';

    var rows = tl.list.map(function (x) {
      var isCur = cur && x.id === cur.id && !cur.yesterday;
      var past = x.date < tl.now && !isCur;
      return '<div class="salah-row' + (isCur ? ' current' : '') + (past ? ' past' : '') + '" data-id="' + x.id +
        '"><div><div class="nm">' + x.ku + (isCur ? ' · ئێستا' : '') + '</div><div class="ar">' + x.ar +
        '</div></div><div class="tm">' + fmtHM(x.date) + '</div></div>';
    }).join('');

    box.innerHTML = hero + '<div class="salah-list">' + rows + '</div>' +
      '<div class="muted" style="margin-top:10px;font-size:12px;text-align:center">پەنجە لەسەر کات = وردەکاری · ژمێریەر چرکەبەچرکە</div>';

    box.querySelectorAll('.salah-row').forEach(function (el) {
      el.onclick = function () {
        var item = tl.list.find(function (x) { return x.id === el.getAttribute('data-id'); });
        if (!item) return;
        var now = new Date();
        var msg;
        if (item.date <= now) {
          msg = item.ku + ' · ' + fmtHM(item.date) + '\n\n⏱ ' + fmtDurWords(now - item.date) + ' بانگی دراوە.';
          if (next) msg += '\n⏳ ' + fmtClock(next.date - now) + ' ماوە بۆ ' + next.ku + '.';
        } else {
          msg = item.ku + ' · ' + fmtHM(item.date) + '\n\n⏳ ' + fmtClock(item.date - now) + ' ماوە بۆ بانگ.';
        }
        alert(msg);
      };
    });
  }

  function tickLive() {
    if (S.tab !== 'times') return;
    var view = document.getElementById('salahView');
    if (!view || !view.classList.contains('active')) return;
    var tl = getTimeline();
    if (!tl) return;
    var cur = tl.current, next = tl.next;
    var since = cur ? tl.now - cur.date : 0;
    var until = next ? next.date - tl.now : 0;
    var clockEl = document.getElementById('salahLiveClock');
    var sinceEl = document.getElementById('salahSinceLine');
    var untilEl = document.getElementById('salahUntilLine');
    if (clockEl) {
      if (next) clockEl.textContent = fmtClock(until);
      else if (cur) clockEl.textContent = fmtClock(since);
    }
    if (sinceEl && cur) sinceEl.innerHTML = '⏱ ' + fmtDurWords(since) + ' بانگی <b>' + cur.ku + '</b> دراوە';
    if (untilEl && next && cur) untilEl.innerHTML = '⏳ ' + fmtClock(until) + ' ماوە بۆ بانگی <b>' + next.ku + '</b>';
    if (next && until <= 0) renderTimes();
  }

  function renderVirtues() {
    var box = document.getElementById('salahBody');
    if (!box) return;
    var items = [
      { t: 'نوێژ لە کاتی خۆیدا', ar: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا', ku: 'بەڕاستی نوێژ لەسەر باوەڕداران فەرزێکی کاتدارە.', src: 'سورەتی نساء · ٨٣' },
      { t: 'خۆشەویستترین کردار', ar: 'أَيُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ؟ قَالَ: الصَّلَاةُ عَلَى وَقْتِهَا', ku: 'خۆشەویستترین کردار لای خوا: نوێژ لە کاتی خۆیدا.', src: 'صحیحی بوخاری و موسلیم' },
      { t: 'نوێژی جەماعەت', ar: 'صَلَاةُ الْجَمَاعَةِ تَفْضُلُ صَلَاةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً', ku: 'نوێژی جەماعەت لە نوێژی تاکەکەسی بە ٢٧ پلە باشترە.', src: 'صحیحی بوخاری و موسلیم' },
      { t: 'ڕێگا بۆ مزگەوت', ar: 'مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ، أَعَدَّ اللَّهُ لَهُ نُزُلَهُ مِنَ الْجَنَّةِ', ku: 'هەر کەسێک بڕوات بۆ مزگەوت، خوا جێگەیەکی بۆ ئامادە دەکات لە بەهەشت.', src: 'صحیحی بوخاری و موسلیم' },
      { t: 'یەکەم پرسیار لە قیامەت', ar: 'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ', ku: 'یەکەم شت کە لە ڕۆژی قیامەت لێی دەپرسرێتەوە، نوێژە.', src: 'سنن أبي داود · الترمذي' },
      { t: 'پەیمانی نوێژ', ar: 'الْعَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ، فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ', ku: 'پەیمانی نێوان ئێمە و ئەوان نوێژە؛ هەر کەس جێی بهێڵێت بێباوەڕی کردووە.', src: 'سنن الترمذي' }
    ];
    box.innerHTML = '<div class="salah-card"><b>فەزڵی نوێژ و جەماعەت</b></div>' +
      items.map(function (it) {
        return '<div class="salah-card"><h3>' + it.t + '</h3><div class="ar">' + it.ar + '</div><div class="ku">' + it.ku +
          '</div><div class="src">' + it.src + '</div></div>';
      }).join('');
  }

  function stopQibla() {
    if (qiblaWatch) {
      window.removeEventListener('deviceorientation', qiblaWatch, true);
      qiblaWatch = null;
    }
  }

  function renderQibla() {
    var box = document.getElementById('salahBody');
    if (!box) return;
    stopQibla();
    var bearing = qiblaBearing(S.lat, S.lng);
    box.innerHTML = '<div class="salah-card qibla-box"><b>قیبلەنما</b><div class="qibla-hint">ئاڕاستەی کەعبە: <b dir="ltr">' +
      bearing.toFixed(1) + '°</b><br>📍 ' + (S.city || '') + '</div><div class="qibla-compass"><div class="qibla-kaaba">🕋</div><div class="qibla-needle" id="qiblaNeedle"></div></div>' +
      '<div class="qibla-deg" id="qiblaDeg">' + bearing.toFixed(0) + '°</div>' +
      '<button class="primary" style="width:100%;margin-top:12px" id="qiblaCalib">چالاککردنی قیبلەنما</button></div>';
    var needle = document.getElementById('qiblaNeedle');
    var degEl = document.getElementById('qiblaDeg');
    function onOrient(e) {
      var heading = null;
      if (typeof e.webkitCompassHeading === 'number') heading = e.webkitCompassHeading;
      else if (typeof e.alpha === 'number') heading = 360 - e.alpha;
      if (heading == null) return;
      if (needle) needle.style.transform = 'rotate(' + (bearing - heading) + 'deg)';
      if (degEl) degEl.textContent = ((heading + 360) % 360).toFixed(0) + '° · قیبلە ' + bearing.toFixed(0) + '°';
    }
    document.getElementById('qiblaCalib').onclick = async function () {
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          var p = await DeviceOrientationEvent.requestPermission();
          if (p !== 'granted') { alert('ڕێگە نەدرا.'); return; }
        }
      } catch (e) {}
      stopQibla();
      qiblaWatch = onOrient;
      window.addEventListener('deviceorientation', onOrient, true);
    };
  }

  function setTab(tab) {
    S.tab = tab;
    document.querySelectorAll('.salah-tabs button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-tab') === tab);
    });
    if (tab === 'times') renderTimes();
    else if (tab === 'virtues') { stopQibla(); renderVirtues(); }
    else if (tab === 'qibla') renderQibla();
  }

  function startTick() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(tickLive, 1000);
  }

  function ensureView() {
    injectCss();
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = document.getElementById('salahView');
    if (v) return v;
    v = document.createElement('section');
    v.id = 'salahView';
    v.className = 'view';
    v.innerHTML = '<div class="salah-head"><button class="tab" type="button" id="salahBack">‹ سەرەتا</button><b>نویژەکانم</b>' +
      '<button class="tab" type="button" id="salahRefresh">↻</button></div>' +
      '<div class="salah-loc"><input id="salahCity" placeholder="سلێمانی، هەولێر، London..." />' +
      '<button type="button" id="salahSearch">گەڕان</button><button type="button" id="salahGps">📍</button></div>' +
      '<div class="salah-tabs"><button type="button" data-tab="times" class="on">کاتەکان</button>' +
      '<button type="button" data-tab="virtues">فەزڵ و حەدیس</button><button type="button" data-tab="qibla">قیبلەنما</button></div>' +
      '<div id="salahBody"><div class="card muted">بارکردن...</div></div>';
    main.appendChild(v);

    document.getElementById('salahBack').onclick = function () {
      stopQibla();
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
    };
    document.getElementById('salahRefresh').onclick = async function () {
      times = null;
      await loadAndShow();
    };
    document.getElementById('salahSearch').onclick = async function () {
      var q = (document.getElementById('salahCity').value || '').trim();
      if (!q) return;
      var body = document.getElementById('salahBody');
      if (body) body.innerHTML = '<div class="salah-card">گەڕان بۆ «' + q + '» و نوێکردنەوەی کاتەکان...</div>';
      try {
        await searchCity(q);
        document.getElementById('salahCity').value = S.city || q;
        setTab('times');
        startTick();
      } catch (e) {
        alert('نەتوانرا شوێن بدۆزرێتەوە. نموونە: سلێمانی، هەولێر، Sulaymaniyah، London');
        if (body) body.innerHTML = '<div class="salah-card">گەڕان سەرکەوتوو نەبوو. دووبارە هەوڵ بدە.</div>';
      }
    };
    document.getElementById('salahCity').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('salahSearch').click();
    });
    document.getElementById('salahGps').onclick = async function () {
      var body = document.getElementById('salahBody');
      if (body) body.innerHTML = '<div class="salah-card">GPS...</div>';
      try {
        await useGPS();
        await fetchTimes();
        document.getElementById('salahCity').value = S.city;
        setTab('times');
        startTick();
      } catch (e) {
        alert('GPS بەردەست نییە.');
      }
    };
    document.querySelectorAll('.salah-tabs button').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });
    return v;
  }

  async function loadAndShow() {
    ensureView();
    if (typeof showView === 'function') showView('salahView', 'نویژەکانم');
    try {
      var bottom = document.querySelector('.bottom');
      if (bottom) bottom.classList.add('hidden');
    } catch (e) {}
    var cityInput = document.getElementById('salahCity');
    if (cityInput) cityInput.value = S.city || '';
    try {
      if (!times) await fetchTimes();
    } catch (e) {
      try {
        if (S.city) await searchCity(S.city);
      } catch (e2) {
        var body = document.getElementById('salahBody');
        if (body) body.innerHTML = '<div class="salah-card">شار بنووسە (سلێمانی / هەولێر / London) یان GPS.</div>';
        return;
      }
    }
    setTab(S.tab || 'times');
    startTick();
  }

  window.enterSalah = function () { loadAndShow(); };

  function injectStartCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box || box.querySelector('.salah-choice')) return;
    var b = document.createElement('button');
    b.className = 'section-choice salah-choice';
    b.type = 'button';
    b.onclick = function () { window.enterSalah(); };
    b.innerHTML = '<span class="choice-icon">🕌</span><span class="choice-copy"><b>نویژەکانم</b><small>کاتی نوێژ · قیبلە · فەزڵ و حەدیس</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b);
  }

  function patchShowView() {
    var orig = window.showView;
    if (typeof orig !== 'function' || orig.__salah3) return;
    window.showView = function (id, title) {
      var ret = orig.apply(this, arguments);
      try {
        var bottom = document.querySelector('.bottom');
        if (bottom && (id === 'salahView' || id === 'startScreen' || id === 'zikr' || id === 'detail')) bottom.classList.add('hidden');
      } catch (e) {}
      if (id !== 'salahView') stopQibla();
      return ret;
    };
    window.showView.__salah3 = true;
  }

  function boot() {
    injectCss();
    injectStartCard();
    patchShowView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 40); setTimeout(boot, 400); setTimeout(boot, 1200);
    });
  } else {
    setTimeout(boot, 40); setTimeout(boot, 400); setTimeout(boot, 1200);
  }
  var tries = 0;
  var t = setInterval(function () { boot(); if (++tries > 40) clearInterval(t); }, 300);
})();
