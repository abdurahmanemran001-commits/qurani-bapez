/* salah.js v1 — نویژەکانم: times worldwide, countdown, virtues, qibla */
(function () {
  if (window.__salahV1) return;
  window.__salahV1 = true;

  var KEY = 'salah_v1';
  var NAMES = [
    { id: 'Fajr', ku: 'بەیانی', ar: 'الفجر' },
    { id: 'Sunrise', ku: 'خۆرهەڵاتن', ar: 'الشروق' },
    { id: 'Dhuhr', ku: 'نیوەڕۆ', ar: 'الظهر' },
    { id: 'Asr', ku: 'عەصر', ar: 'العصر' },
    { id: 'Maghrib', ku: 'مەغریب', ar: 'المغرب' },
    { id: 'Isha', ku: 'عیشا', ar: 'العشاء' }
  ];

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
      '.salah-hero{background:linear-gradient(145deg,#0d4b37,#176b4b 55%,#2a8f68);color:#fff;border-radius:18px;padding:16px;margin-bottom:12px;text-align:center}',
      '.salah-hero .now-name{font-size:22px;font-weight:bold;margin:4px 0}',
      '.salah-hero .now-time{font-size:34px;font-weight:bold;letter-spacing:1px;direction:ltr}',
      '.salah-hero .now-meta{font-size:13px;opacity:.95;margin-top:8px;line-height:1.7}',
      '.salah-list{display:grid;gap:8px}',
      '.salah-row{display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:14px;background:#fff;border:1px solid #dce5e1;cursor:pointer}',
      '.salah-row.current{background:linear-gradient(135deg,#e8f3ee,#d4ebe0);border-color:#a8cbbd}',
      '.salah-row .nm{font-weight:bold;font-size:16px}',
      '.salah-row .ar{color:#6d7975;font-size:12px;margin-top:2px}',
      '.salah-row .tm{font-size:18px;font-weight:bold;direction:ltr;color:#174f3b}',
      '.salah-row.past .tm{color:#9aa39f}',
      '.salah-card{background:#fff;border:1px solid #dce5e1;border-radius:14px;padding:14px;margin-bottom:10px}',
      '.salah-card h3{margin:0 0 8px;font-size:16px;color:#174f3b}',
      '.salah-card .ar{font-family:serif;font-size:18px;line-height:1.9;text-align:right;margin:8px 0}',
      '.salah-card .ku{font-size:14px;line-height:1.8;color:#2c3f37}',
      '.salah-card .src{font-size:12px;color:#6d7975;margin-top:6px}',
      '.qibla-box{text-align:center;padding:16px}',
      '.qibla-compass{width:220px;height:220px;margin:12px auto;border-radius:50%;border:6px solid #176b4b;position:relative;background:radial-gradient(circle,#f9fbfa,#e8f3ee)}',
      '.qibla-needle{position:absolute;left:50%;top:50%;width:4px;height:90px;margin-left:-2px;margin-top:-90px;background:linear-gradient(#c0392b,#e74c3c);transform-origin:bottom center;border-radius:2px;transition:transform .2s linear}',
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
  function fmtDur(ms) {
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
    var url = 'https://api.aladhan.com/v1/timings?latitude=' + S.lat + '&longitude=' + S.lng + '&method=' + (S.method || 3);
    var r = await fetch(url);
    if (!r.ok) throw new Error('net');
    var j = await r.json();
    times = (j.data && j.data.timings) || null;
    return times;
  }

  async function searchCity(q) {
    q = (q || '').trim();
    if (!q) return null;
    try {
      var g = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=1&language=en&format=json');
      if (g.ok) {
        var gj = await g.json();
        if (gj.results && gj.results[0]) {
          S.lat = gj.results[0].latitude;
          S.lng = gj.results[0].longitude;
          S.city = gj.results[0].name || q;
          if (gj.results[0].country) S.country = gj.results[0].country;
        } else S.city = q;
      } else S.city = q;
    } catch (e) { S.city = q; }
    save();
    return fetchTimes();
  }

  function useGPS() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error('no-geo'));
      navigator.geolocation.getCurrentPosition(function (pos) {
        S.lat = pos.coords.latitude;
        S.lng = pos.coords.longitude;
        S.city = 'شوێنی ئێستا';
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
    var hero = '<div class="salah-hero"><div style="opacity:.9;font-size:13px">' + (S.city || '') +
      (S.country ? ' · ' + S.country : '') + '</div><div class="now-name">' + (cur ? cur.ku : '—') +
      '</div><div class="now-time">' + (cur ? fmtHM(cur.date) : '--:--') + '</div><div class="now-meta">' +
      (cur ? '⏱ ' + fmtDur(since) + ' لە کاتی بانگی <b>' + cur.ku + '</b>ەوە<br>' : '') +
      (next ? '⏳ ' + fmtDur(until) + ' ماوە بۆ بانگی <b>' + next.ku + '</b>' + (next.tomorrow ? ' (سبەینێ)' : '') : '') +
      '</div></div>';
    var rows = tl.list.map(function (x) {
      var isCur = cur && x.id === cur.id && !cur.yesterday;
      var past = x.date < tl.now && !isCur;
      return '<div class="salah-row' + (isCur ? ' current' : '') + (past ? ' past' : '') + '" data-id="' + x.id +
        '"><div><div class="nm">' + x.ku + (isCur ? ' · ئێستا' : '') + '</div><div class="ar">' + x.ar +
        '</div></div><div class="tm">' + fmtHM(x.date) + '</div></div>';
    }).join('');
    box.innerHTML = hero + '<div class="salah-list">' + rows + '</div><div class="muted" style="margin-top:10px;font-size:12px;text-align:center">پەنجە لەسەر هەر کاتێک = وردەکاری</div>';
    box.querySelectorAll('.salah-row').forEach(function (el) {
      el.onclick = function () {
        var item = tl.list.find(function (x) { return x.id === el.getAttribute('data-id'); });
        if (!item) return;
        var msg;
        if (item.date <= tl.now) {
          msg = item.ku + '\n\n⏱ ' + fmtDur(tl.now - item.date) + ' لە کاتی بانگەوە تێپەڕیوە.';
          if (next) msg += '\n⏳ ' + fmtDur(next.date - tl.now) + ' ماوە بۆ ' + next.ku + '.';
        } else msg = item.ku + '\n\n⏳ ' + fmtDur(item.date - tl.now) + ' ماوە بۆ بانگی ئەم نوێژە.';
        alert(msg);
      };
    });
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
    box.innerHTML = '<div class="salah-card"><b>فەزڵی نوێژ و جەماعەت</b><p class="ku">کورتەیەک لە قورئان و حەدیسی سەحیح.</p></div>' +
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
      bearing.toFixed(1) + '°</b></div><div class="qibla-compass"><div class="qibla-kaaba">🕋</div><div class="qibla-needle" id="qiblaNeedle"></div></div>' +
      '<div class="qibla-deg" id="qiblaDeg">' + bearing.toFixed(0) + '°</div>' +
      '<div class="qibla-hint">مۆبایل ڕاست ڕابگرە. GPS + حیسابی قیبلە + قەمارە.</div>' +
      '<button class="primary" style="width:100%;margin-top:12px" id="qiblaCalib">چالاککردنی قیبلەنما</button></div>' +
      '<div class="salah-card"><h3>چۆن؟</h3><div class="ku">١) شار یان GPS<br>٢) چالاککردن و ڕێگەدان<br>٣) بسووڕێنە تا دەرزی بەرەو 🕋 بێت</div></div>';
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
      alert('قیبلەنما چالاک بوو.');
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
      '<div class="salah-loc"><input id="salahCity" placeholder="ناوی شار (هەموو جیهان)..." />' +
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
    document.getElementById('salahRefresh').onclick = function () { loadAndShow(); };
    document.getElementById('salahSearch').onclick = async function () {
      var q = (document.getElementById('salahCity').value || '').trim();
      if (!q) return;
      try { await searchCity(q); setTab(S.tab || 'times'); }
      catch (e) { alert('نەتوانرا کاتەکان بهێنرێن.'); }
    };
    document.getElementById('salahCity').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('salahSearch').click();
    });
    document.getElementById('salahGps').onclick = async function () {
      try {
        await useGPS();
        await fetchTimes();
        document.getElementById('salahCity').value = S.city;
        setTab(S.tab || 'times');
      } catch (e) { alert('GPS بەردەست نییە.'); }
    };
    document.querySelectorAll('.salah-tabs button').forEach(function (b) {
      b.onclick = function () { setTab(b.getAttribute('data-tab')); };
    });
    return v;
  }

  async function loadAndShow() {
    ensureView();
    if (typeof showView === 'function') showView('salahView', 'نویژەکانم');
    try { var bottom = document.querySelector('.bottom'); if (bottom) bottom.classList.add('hidden'); } catch (e) {}
    var cityInput = document.getElementById('salahCity');
    if (cityInput) cityInput.value = S.city || '';
    try {
      if (!times) await fetchTimes();
    } catch (e) {
      try { if (S.city) await searchCity(S.city); }
      catch (e2) {
        var body = document.getElementById('salahBody');
        if (body) body.innerHTML = '<div class="salah-card">شارێک بنووسە (Mecca, London, Erbil) یان GPS.</div>';
        return;
      }
    }
    setTab(S.tab || 'times');
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(function () {
      if (S.tab === 'times' && document.getElementById('salahView') && document.getElementById('salahView').classList.contains('active')) renderTimes();
    }, 30000);
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
    if (typeof orig !== 'function' || orig.__salah) return;
    window.showView = function (id, title) {
      var ret = orig.apply(this, arguments);
      try {
        var bottom = document.querySelector('.bottom');
        if (bottom && (id === 'salahView' || id === 'startScreen' || id === 'zikr' || id === 'detail')) bottom.classList.add('hidden');
      } catch (e) {}
      if (id !== 'salahView') stopQibla();
      return ret;
    };
    window.showView.__salah = true;
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
