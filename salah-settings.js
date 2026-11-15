/* salah-settings.js v2 — appearance, method, minute offsets, several adhan sounds and REAL prayer-time notifications.
 * App (Capacitor): schedules local notifications for the next 14 days (works with the app closed, no internet needed after
 * scheduling). Every adhan gets its own notification channel whose sound is the bundled recording (res/raw/adhan_<id>.mp3,
 * downloaded by mobile/after-sync.mjs); adhans.json lists the ones that really exist. Website: alerts only while the page is open. */
(function () {
  if (window.__salahSettings) return;
  window.__salahSettings = true;

  var KEY = 'salah_settings_v1';
  var cfg = {
    fontScale: 1, theme: 'green', iconSet: 'emoji',
    method: 3, school: 0,
    notifOn: false, adhanId: 'makkah', fajrAdhanId: '',
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
    // v2 (2026-11): Kurdistan Awqaf-style defaults, fitted to the published Kalak table (Shafi'i, Fajr 16.5°, Isha 16°)
    if (cfg.awqafV !== 1) {
      cfg.awqafV = 1; cfg.method = 99; cfg.school = 0;
      cfg.offsets = { Fajr: 0, Sunrise: 1, Dhuhr: 8, Asr: 0, Maghrib: 4, Isha: 0 };
      localStorage.setItem(KEY, JSON.stringify(cfg));
      try { localStorage.setItem('salah_v1', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('salah_v1') || '{}'), { method: 99 }))); } catch (e) {}
    }
  } catch (e) {}

  var THEMES = {
    green: { hero: '#176b4b', bg: '#f4faf7' },
    navy: { hero: '#1a365d', bg: '#eef2f7' },
    gold: { hero: '#8a6d3b', bg: '#faf6ef' },
    dark: { hero: '#111827', bg: '#0f172a' },
    teal: { hero: '#0f766e', bg: '#f0fdfa' }
  };
  /* remote copies (used for preview on the website and as the fallback); the app also bundles them, see adhans.json */
  var ADHANS = [
    { id: 'makkah', name: 'بانگی مەککە', url: 'https://cdn.aladhan.com/audio/adhans/a1.mp3' },
    { id: 'madinah', name: 'بانگی مەدینە', url: 'https://cdn.aladhan.com/audio/adhans/a2.mp3' },
    { id: 'alaqsa', name: 'بانگی ئەقسا', url: 'https://cdn.aladhan.com/audio/adhans/a3.mp3' },
    { id: 'egypt', name: 'بانگی میسر', url: 'https://cdn.aladhan.com/audio/adhans/a4.mp3' },
    { id: 'soft', name: 'بانگی نەرم', url: 'https://cdn.aladhan.com/audio/adhans/a5.mp3' }
  ];
  var bundled = null; /* ids of the recordings that exist inside the app (null = unknown / website) */
  var METHODS = [
    { id: 99, name: 'ئەوقافی کوردستان (شافیعی)' },
    { id: 3, name: 'Muslim World League' },
    { id: 4, name: 'Umm Al-Qura' },
    { id: 5, name: 'Egyptian' },
    { id: 13, name: 'Diyanet' },
    { id: 2, name: 'ISNA' }
  ];
  var PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  /* ---------- texts for the notification part ---------- */
  var AST = {};
  AST.ckb = { a_fajr: `بانگی نوێژی بەیانی`, same: `هەمان بانگی سەرەکی`, a_stop: `⏹ ڕاگرتنی بانگ`, a_tn: `🔔 تاقیکردنەوەی نۆتیفیکەیشن (٥ چرکە دواتر)`, st_on: `✓ {n} ئاگاداری ئامادەکرا تا {d}. بێ ئینتەرنێت و بەبێ کردنەوەی ئەپ دێن.`, st_off: `نۆتیفیکەیشنی بانگ ناچالاکە.`, st_deny: `ڕێگەپێدانی نۆتیفیکەیشن نەدرا. لە ڕێکخستنەکانی مۆبایل ڕێگە بدە.`, st_web: `لە وێبسایت تەنها کاتێک ئاگاداری دەنێرێت کە ئەم لاپەڕەیە کراوە بێت. بۆ بانگی خۆکار ئەپەکە بەکاربهێنە.`, st_err: `ئاگاداریەکان ئامادە نەکران. ئینتەرنێتەکەت بپشکنە (کاتەکان پێویستیان پێیەتی) و دووبارە هەوڵ بدەرەوە.`, st_batt: `ئەگەر ئاگاداریەکان نەهاتن: لە ڕێکخستنی مۆبایل، بەکارهێنانی باتری بۆ ئەم ئەپە بکە بە «بێ سنوور» و ڕێگە بە «Alarms & reminders» بدە.`, n_title: `کاتی نوێژی {p}`, test_body: `ئەمە تاقیکردنەوەی بانگە.`, sent: `نۆتیفیکەیشنی تاقیکردنەوە نێردرا (٥ چرکە دواتر).`, ch: `بانگ`, adhanN: `بانگی {n}`, pn: [`بەیانی`, `نیوەڕۆ`, `عەسر`, `مەغریب`, `عیشا`] };
  AST.bad = AST.ckb;
  AST.en = { a_fajr: `Fajr adhan`, same: `Same as the main adhan`, a_stop: `⏹ Stop adhan`, a_tn: `🔔 Test notification (in 5 seconds)`, st_on: `✓ {n} alerts scheduled until {d}. They arrive without internet and with the app closed.`, st_off: `Adhan notifications are off.`, st_deny: `Notification permission was not granted. Allow it in the phone settings.`, st_web: `On the website alerts only appear while this page is open. Use the app for automatic adhan.`, st_err: `Could not schedule the alerts. Check your internet (the times are needed) and try again.`, st_batt: `If alerts do not arrive: in the phone settings set battery usage for this app to “Unrestricted” and allow “Alarms & reminders”.`, n_title: `Time for {p} prayer`, test_body: `This is a test of the adhan.`, sent: `Test notification sent (in 5 seconds).`, ch: `Adhan`, adhanN: `Adhan {n}`, pn: [`Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha`] };
  AST.ar = { a_fajr: `أذان الفجر`, same: `نفس الأذان الرئيسي`, a_stop: `⏹ إيقاف الأذان`, a_tn: `🔔 تجربة الإشعار (بعد 5 ثوانٍ)`, st_on: `✓ تمت جدولة {n} تنبيهًا حتى {d}. تصل دون إنترنت والتطبيق مغلق.`, st_off: `إشعارات الأذان متوقفة.`, st_deny: `لم يتم منح إذن الإشعارات. اسمح به من إعدادات الهاتف.`, st_web: `في الموقع تظهر التنبيهات فقط أثناء فتح هذه الصفحة. استخدم التطبيق للأذان التلقائي.`, st_err: `تعذّرت جدولة التنبيهات. تحقق من الإنترنت (المواقيت مطلوبة) وحاول مرة أخرى.`, st_batt: `إذا لم تصل التنبيهات: من إعدادات الهاتف اجعل استخدام البطارية لهذا التطبيق «غير مقيّد» واسمح بـ«المنبهات والتذكيرات».`, n_title: `حان وقت صلاة {p}`, test_body: `هذه تجربة للأذان.`, sent: `تم إرسال إشعار تجريبي (بعد 5 ثوانٍ).`, ch: `الأذان`, adhanN: `أذان {n}`, pn: [`الفجر`, `الظهر`, `العصر`, `المغرب`, `العشاء`] };
  AST.tr = { a_fajr: `Sabah ezanı`, same: `Ana ezanla aynı`, a_stop: `⏹ Ezanı durdur`, a_tn: `🔔 Bildirimi dene (5 saniye sonra)`, st_on: `✓ {n} uyarı {d} tarihine kadar planlandı. İnternetsiz ve uygulama kapalıyken gelir.`, st_off: `Ezan bildirimleri kapalı.`, st_deny: `Bildirim izni verilmedi. Telefon ayarlarından izin verin.`, st_web: `Web sitesinde uyarılar yalnızca bu sayfa açıkken görünür. Otomatik ezan için uygulamayı kullanın.`, st_err: `Uyarılar planlanamadı. İnternetinizi kontrol edin (vakitler gerekli) ve tekrar deneyin.`, st_batt: `Uyarılar gelmezse: telefon ayarlarında bu uygulamanın pil kullanımını “Kısıtlanmamış” yapın ve “Alarmlar ve hatırlatıcılar”a izin verin.`, n_title: `{p} namazı vakti`, test_body: `Bu bir ezan denemesidir.`, sent: `Deneme bildirimi gönderildi (5 saniye sonra).`, ch: `Ezan`, adhanN: `Ezan {n}`, pn: [`Sabah`, `Öğle`, `İkindi`, `Akşam`, `Yatsı`] };
  AST.fa = { a_fajr: `اذان صبح`, same: `همان اذان اصلی`, a_stop: `⏹ توقف اذان`, a_tn: `🔔 آزمایش اعلان (۵ ثانیه بعد)`, st_on: `✓ {n} هشدار تا {d} زمان‌بندی شد. بدون اینترنت و با برنامه بسته می‌رسند.`, st_off: `اعلان‌های اذان خاموش است.`, st_deny: `اجازه اعلان داده نشد. از تنظیمات گوشی اجازه دهید.`, st_web: `در وب‌سایت هشدارها فقط هنگام باز بودن این صفحه نمایش داده می‌شوند. برای اذان خودکار از برنامه استفاده کنید.`, st_err: `زمان‌بندی هشدارها انجام نشد. اینترنت را بررسی کنید (اوقات لازم است) و دوباره تلاش کنید.`, st_batt: `اگر هشدارها نرسیدند: در تنظیمات گوشی مصرف باتری این برنامه را «نامحدود» کنید و «هشدارها و یادآورها» را مجاز کنید.`, n_title: `وقت نماز {p}`, test_body: `این آزمایش اذان است.`, sent: `اعلان آزمایشی ارسال شد (۵ ثانیه بعد).`, ch: `اذان`, adhanN: `اذان {n}`, pn: [`صبح`, `ظهر`, `عصر`, `مغرب`, `عشاء`] };
  AST.ur = { a_fajr: `فجر کی اذان`, same: `وہی مرکزی اذان`, a_stop: `⏹ اذان روکیں`, a_tn: `🔔 اطلاع کی آزمائش (5 سیکنڈ بعد)`, st_on: `✓ {n} الرٹس {d} تک شیڈول ہو گئے۔ یہ انٹرنیٹ کے بغیر اور ایپ بند ہونے پر بھی آتے ہیں۔`, st_off: `اذان کی اطلاعات بند ہیں۔`, st_deny: `اطلاعات کی اجازت نہیں ملی۔ فون کی سیٹنگز میں اجازت دیں۔`, st_web: `ویب سائٹ پر الرٹ صرف اس صفحے کے کھلے ہونے پر نظر آتے ہیں۔ خودکار اذان کے لیے ایپ استعمال کریں۔`, st_err: `الرٹس شیڈول نہیں ہو سکے۔ انٹرنیٹ چیک کریں (اوقات درکار ہیں) اور دوبارہ کوشش کریں۔`, st_batt: `اگر الرٹ نہ آئیں: فون کی سیٹنگز میں اس ایپ کی بیٹری کا استعمال «غیر محدود» کریں اور «Alarms & reminders» کی اجازت دیں۔`, n_title: `{p} کی نماز کا وقت`, test_body: `یہ اذان کی آزمائش ہے۔`, sent: `آزمائشی اطلاع بھیج دی گئی (5 سیکنڈ بعد)۔`, ch: `اذان`, adhanN: `اذان {n}`, pn: [`فجر`, `ظہر`, `عصر`, `مغرب`, `عشاء`] };
  AST.fr = { a_fajr: `Adhan du Fajr`, same: `Identique à l'adhan principal`, a_stop: `⏹ Arrêter l'adhan`, a_tn: `🔔 Tester la notification (dans 5 secondes)`, st_on: `✓ {n} alertes programmées jusqu'au {d}. Elles arrivent sans internet et application fermée.`, st_off: `Les notifications d'adhan sont désactivées.`, st_deny: `L'autorisation de notification n'a pas été accordée. Autorisez-la dans les réglages du téléphone.`, st_web: `Sur le site, les alertes n'apparaissent que si cette page est ouverte. Utilisez l'application pour l'adhan automatique.`, st_err: `Impossible de programmer les alertes. Vérifiez votre connexion (les horaires sont nécessaires) et réessayez.`, st_batt: `Si les alertes n'arrivent pas : dans les réglages du téléphone, mettez l'utilisation de la batterie de cette application sur « Sans restriction » et autorisez « Alarmes et rappels ».`, n_title: `Heure de la prière de {p}`, test_body: `Ceci est un test de l'adhan.`, sent: `Notification de test envoyée (dans 5 secondes).`, ch: `Adhan`, adhanN: `Adhan {n}`, pn: [`Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha`] };
  AST.ru = { a_fajr: `Азан фаджра`, same: `Как основной азан`, a_stop: `⏹ Остановить азан`, a_tn: `🔔 Проверить уведомление (через 5 секунд)`, st_on: `✓ Запланировано уведомлений: {n} до {d}. Они приходят без интернета и при закрытом приложении.`, st_off: `Уведомления об азане выключены.`, st_deny: `Разрешение на уведомления не предоставлено. Разрешите в настройках телефона.`, st_web: `На сайте оповещения появляются только пока эта страница открыта. Для автоматического азана используйте приложение.`, st_err: `Не удалось запланировать оповещения. Проверьте интернет (нужны времена намаза) и повторите.`, st_batt: `Если оповещения не приходят: в настройках телефона установите для приложения «Без ограничений» по батарее и разрешите «Будильники и напоминания».`, n_title: `Время намаза {p}`, test_body: `Это проверка азана.`, sent: `Тестовое уведомление отправлено (через 5 секунд).`, ch: `Азан`, adhanN: `Азан {n}`, pn: [`Фаджр`, `Зухр`, `Аср`, `Магриб`, `Иша`] };
  AST.id = { a_fajr: `Adzan Subuh`, same: `Sama dengan adzan utama`, a_stop: `⏹ Hentikan adzan`, a_tn: `🔔 Uji notifikasi (5 detik lagi)`, st_on: `✓ {n} pengingat dijadwalkan sampai {d}. Muncul tanpa internet dan saat aplikasi ditutup.`, st_off: `Notifikasi adzan nonaktif.`, st_deny: `Izin notifikasi tidak diberikan. Izinkan di pengaturan ponsel.`, st_web: `Di situs web pengingat hanya muncul saat halaman ini terbuka. Gunakan aplikasi untuk adzan otomatis.`, st_err: `Pengingat gagal dijadwalkan. Periksa internet (waktu salat diperlukan) lalu coba lagi.`, st_batt: `Jika pengingat tidak muncul: di pengaturan ponsel atur penggunaan baterai aplikasi ini ke “Tanpa batasan” dan izinkan “Alarm & pengingat”.`, n_title: `Waktu salat {p}`, test_body: `Ini adalah uji adzan.`, sent: `Notifikasi uji dikirim (5 detik lagi).`, ch: `Adzan`, adhanN: `Adzan {n}`, pn: [`Subuh`, `Zuhur`, `Asar`, `Magrib`, `Isya`] };
  function lang() { var l = window.appLang || ''; try { if (!l) l = localStorage.getItem('app_language') || ''; } catch (e) {} l = l || 'ckb'; return AST[l] ? l : 'en'; }
  function AS(k, o) {
    var v = (AST[lang()] || AST.en)[k]; if (v == null) v = AST.en[k];
    return (o && typeof v === 'string') ? v.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }) : v;
  }
  function PN(k) { return AS('pn')[PRAYERS.indexOf(k)] || k; }

  var adhanAudio = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  // The global text observer intentionally skips OPTION elements, so translate
  // select labels here using the same per-language dictionary.
  function ST(source) {
    try {
      var dict = window.LANG_TT && window.LANG_TT[window.appLang];
      return dict && dict[source] ? dict[source] : source;
    } catch (e) { return source; }
  }

  /* ---------- adhan recordings ---------- */
  function loadManifest() {
    try {
      fetch('adhans.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (a) {
        if (!Array.isArray(a) || !a.length) return;
        bundled = a.map(function (x) { return x.id; });
        a.forEach(function (x) {
          if (!ADHANS.some(function (y) { return y.id === x.id; })) ADHANS.push({ id: x.id, name: '', num: String(x.id).replace(/\D/g, '') });
        });
      }).catch(function () {});
    } catch (e) {}
  }
  function hasSound(id) { return !!bundled && bundled.indexOf(id) >= 0; }
  function adhanList() { return bundled ? ADHANS.filter(function (a) { return hasSound(a.id); }) : ADHANS.filter(function (a) { return a.url; }); }
  function anm(a) { return a.name ? ST(a.name) : AS('adhanN', { n: a.num || '' }); }
  function adhanSrc(id) {
    if (hasSound(id)) return 'adhan/' + id + '.mp3';
    var a = ADHANS.find(function (x) { return x.id === id; });
    return a && a.url ? a.url : null;
  }
  function stopAdhan() { if (adhanAudio) { try { adhanAudio.pause(); } catch (e) {} adhanAudio = null; } }
  function playAdhan(id) {
    try {
      stopAdhan();
      var src = adhanSrc(id || cfg.adhanId) || (ADHANS[0] && ADHANS[0].url);
      if (!src) return;
      adhanAudio = new Audio(src);
      adhanAudio.onended = function () { adhanAudio = null; var b = document.getElementById('ssTest'); if (b) b.textContent = '▶ ' + ST('تاقیکردنەوەی بانگ'); };
      adhanAudio.play().catch(function () {});
    } catch (e) {}
  }
  function adhanFor(prayer) { return (prayer === 'Fajr' && cfg.fajrAdhanId) ? cfg.fajrAdhanId : cfg.adhanId; }

  /* ---------- prayer times for the next days (aladhan calendar API, cached) ---------- */
  function inIraq(lat, lng) { return lat >= 28.9 && lat <= 37.5 && lng >= 38.7 && lng <= 48.8; }
  function place() {
    var s = jget('salah_v1', {});
    return { lat: +s.lat || 36.1911, lng: +s.lng || 44.0094, city: s.city || '' };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function parseHM(s) { var m = String(s || '').match(/(\d{1,2}):(\d{2})/); return m ? { h: +m[1], m: +m[2] } : null; }
  function addMin(hm, mins) { var t = hm.h * 60 + hm.m + (mins || 0); t = ((t % 1440) + 1440) % 1440; return { h: Math.floor(t / 60), m: t % 60 }; }
  function zoned(y, mo, d, h, mi, tz) {
    if (!tz) return new Date(y, mo - 1, d, h, mi, 0);
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      var off = function (t) {
        var p = {}; f.formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; });
        var hh = +p.hour; if (hh === 24) hh = 0;
        return Date.UTC(+p.year, +p.month - 1, +p.day, hh, +p.minute, +p.second) - t;
      };
      var guess = Date.UTC(y, mo - 1, d, h, mi, 0), o = off(guess), t = guess - o, o2 = off(t);
      if (o2 !== o) t = guess - o2;
      return new Date(t);
    } catch (e) { return new Date(y, mo - 1, d, h, mi, 0); }
  }
  async function calMonth(pl, y, mo) {
    var school = +cfg.school || 0, m = +cfg.method || 3, extra = '';
    if (m === 99) { if (inIraq(pl.lat, pl.lng)) extra = '&methodSettings=' + encodeURIComponent('16.5,null,16'); else m = 3; }
    var key = [pl.lat.toFixed(3), pl.lng.toFixed(3), m, school, y + '-' + mo].join('|');
    var cache = jget('salah_cal_v1', {});
    try {
      var r = await fetch('https://api.aladhan.com/v1/calendar/' + y + '/' + mo + '?latitude=' + encodeURIComponent(pl.lat) + '&longitude=' + encodeURIComponent(pl.lng) + '&method=' + m + '&school=' + school + extra);
      if (!r.ok) throw new Error('net');
      var j = await r.json();
      if (!j.data || !j.data.length) throw new Error('empty');
      var days = j.data.map(function (x) {
        var t = {}; PRAYERS.forEach(function (k) { t[k] = x.timings[k]; });
        return { d: x.date.gregorian.date, t: t, tz: x.meta && x.meta.timezone };
      });
      cache[key] = days;
      var ks = Object.keys(cache); while (ks.length > 6) delete cache[ks.shift()];
      jset('salah_cal_v1', cache);
      return days;
    } catch (e) { return cache[key] || null; }
  }
  async function buildPlan(N) {
    var pl = place(), now = new Date(), out = [], need = {}, dates = [], i;
    for (i = 0; i < N; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      dates.push(d); need[d.getFullYear() + '-' + (d.getMonth() + 1)] = [d.getFullYear(), d.getMonth() + 1];
    }
    var idx = {};
    for (var k in need) {
      var days = await calMonth(pl, need[k][0], need[k][1]);
      if (days) days.forEach(function (x) { idx[x.d] = x; });
    }
    var iraq = inIraq(pl.lat, pl.lng), off = cfg.offsets || {};
    dates.forEach(function (d, di) {
      var day = idx[pad(d.getDate()) + '-' + pad(d.getMonth() + 1) + '-' + d.getFullYear()];
      if (!day) return;
      PRAYERS.forEach(function (p, pi) {
        if (cfg.notifPrayers && cfg.notifPrayers[p] === false) return;
        var hm = parseHM(day.t[p]); if (!hm) return;
        hm = addMin(hm, iraq ? (off[p] || 0) : 0);
        var when = zoned(d.getFullYear(), d.getMonth() + 1, d.getDate(), hm.h, hm.m, day.tz || '');
        if (when.getTime() > now.getTime() + 15000) out.push({ id: 3000 + di * 10 + pi, when: when, prayer: p, hm: pad(hm.h) + ':' + pad(hm.m), city: pl.city });
      });
    });
    return out;
  }

  /* ---------- native scheduling ---------- */
  function LN() {
    var c = window.Capacitor;
    if (!c || !c.Plugins || !c.Plugins.LocalNotifications) return null;
    try { if (c.isNativePlatform && !c.isNativePlatform()) return null; } catch (e) {}
    return c.Plugins.LocalNotifications;
  }
  function channelOf(id) { return hasSound(id) ? 'adhan_' + id : 'adhan_default'; }
  function ensureChannel(id) {
    var ln = LN(); if (!ln || !ln.createChannel) return Promise.resolve();
    var snd = hasSound(id), a = ADHANS.find(function (x) { return x.id === id; });
    var o = { id: channelOf(id), name: AS('ch') + (snd && a ? ' — ' + anm(a) : ''), description: AS('ch'), importance: 5, visibility: 1, vibration: true, lights: true };
    if (snd) o.sound = 'adhan_' + id + '.mp3';
    return Promise.resolve(ln.createChannel(o)).catch(function () {});
  }
  async function cancelAll(ln) {
    try {
      var p = await ln.getPending();
      var old = ((p && p.notifications) || []).filter(function (n) { return n.id >= 3000 && n.id < 4000; }).map(function (n) { return { id: n.id }; });
      if (old.length) await ln.cancel({ notifications: old });
    } catch (e) {}
  }
  function setStatus(t) { var e = document.getElementById('ssNtfStatus'); if (e) e.textContent = t; }
  async function scheduleNative() {
    var ln = LN();
    if (!ln) return { ok: false, reason: 'web' };
    var perm = await ln.requestPermissions();
    if (!perm || perm.display !== 'granted') return { ok: false, reason: 'deny' };
    try {
      if (ln.checkExactNotificationSetting) {
        var ex = await ln.checkExactNotificationSetting();
        if (ex && ex.exact_alarm && ex.exact_alarm !== 'granted' && !cfg.exactAsked) {
          cfg.exactAsked = true; save();
          if (ln.changeExactNotificationSetting) ln.changeExactNotificationSetting();
        }
      }
    } catch (e) {}
    var plan = await buildPlan(14);
    if (!plan.length) return { ok: false, reason: 'err' };
    var used = {}; plan.forEach(function (x) { used[adhanFor(x.prayer)] = 1; });
    await Promise.all(Object.keys(used).map(ensureChannel));
    await cancelAll(ln);
    var list = plan.map(function (x) {
      var id = adhanFor(x.prayer), snd = hasSound(id);
      var body = (x.city ? x.city + ' · ' : '') + x.hm;
      var n = { id: x.id, title: AS('n_title', { p: PN(x.prayer) }), body: body, largeBody: body, schedule: { at: x.when, allowWhileIdle: true }, channelId: channelOf(id), autoCancel: true };
      if (snd) n.sound = 'adhan_' + id + '.mp3';
      return n;
    });
    await ln.schedule({ notifications: list });
    var last = plan[plan.length - 1].when;
    return { ok: true, n: list.length, until: pad(last.getDate()) + '/' + pad(last.getMonth() + 1) };
  }
  function signature() {
    var pl = place(), d = new Date();
    return JSON.stringify([pl.lat.toFixed(3), pl.lng.toFixed(3), cfg.method, cfg.school, cfg.offsets, cfg.notifPrayers, cfg.adhanId, cfg.fajrAdhanId, lang(), d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(), bundled ? bundled.length : 0]);
  }
  function msgOf(r) {
    if (r.ok) return AS('st_on', { n: r.n, d: r.until });
    return AS(r.reason === 'deny' ? 'st_deny' : r.reason === 'web' ? 'st_web' : 'st_err');
  }
  var busy = false, lastFail = 0;
  async function ensure(force) {
    var ln = LN();
    if (!ln) return;
    if (busy) return;
    if (!cfg.notifOn) {
      if (force) { busy = true; try { await cancelAll(ln); } catch (e) {} busy = false; localStorage.removeItem('salah_ntf_sig'); setStatus(AS('st_off')); }
      return;
    }
    var sig = signature();
    if (!force && localStorage.getItem('salah_ntf_sig') === sig) return;
    if (!force && Date.now() - lastFail < 300000) return;
    busy = true;
    try {
      var r = await scheduleNative();
      if (r.ok) { localStorage.setItem('salah_ntf_sig', sig); } else lastFail = Date.now();
      setStatus(msgOf(r));
    } catch (e) { lastFail = Date.now(); setStatus(AS('st_err')); }
    busy = false;
  }

  /* website: alerts while the page is open */
  var webBusy = false;
  async function webCheck() {
    if (LN() || !cfg.notifOn || !window.Notification || Notification.permission !== 'granted' || webBusy) return;
    webBusy = true;
    try {
      var plan = await buildPlan(1), now = Date.now(), fired = jget('salah_web_fired', {});
      plan = plan.concat([]);
      var pl = place(), n = new Date(), iraq = inIraq(pl.lat, pl.lng);
      var days = await calMonth(pl, n.getFullYear(), n.getMonth() + 1), key = pad(n.getDate()) + '-' + pad(n.getMonth() + 1) + '-' + n.getFullYear();
      var day = days && days.filter(function (x) { return x.d === key; })[0];
      if (day) PRAYERS.forEach(function (p) {
        if (cfg.notifPrayers && cfg.notifPrayers[p] === false) return;
        var hm = parseHM(day.t[p]); if (!hm) return;
        hm = addMin(hm, iraq ? ((cfg.offsets || {})[p] || 0) : 0);
        var when = zoned(n.getFullYear(), n.getMonth() + 1, n.getDate(), hm.h, hm.m, day.tz || '').getTime(), fk = key + '|' + p;
        if (now >= when && now - when < 90000 && !fired[fk]) {
          fired[fk] = 1; jset('salah_web_fired', fired);
          try { new Notification(AS('n_title', { p: PN(p) }), { body: (pl.city ? pl.city + ' · ' : '') + pad(hm.h) + ':' + pad(hm.m) }); } catch (e) {}
          playAdhan(adhanFor(p));
        }
      });
    } catch (e) {}
    webBusy = false;
  }

  async function testNotif() {
    var ln = LN(), id = cfg.adhanId;
    if (ln) {
      var p = await ln.requestPermissions();
      if (!p || p.display !== 'granted') return 'deny';
      await ensureChannel(id);
      var n = { id: 3998, title: AS('n_title', { p: PN('Dhuhr') }), body: AS('test_body'), schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true }, channelId: channelOf(id), autoCancel: true };
      if (hasSound(id)) n.sound = 'adhan_' + id + '.mp3';
      await ln.schedule({ notifications: [n] });
      return 'sent';
    }
    if (window.Notification) {
      var perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (perm !== 'granted') return 'deny';
      try { new Notification(AS('n_title', { p: PN('Dhuhr') }), { body: AS('test_body') }); } catch (e) {}
      playAdhan(id);
      return 'sent';
    }
    return 'web';
  }

  async function enableNotif() {
    if (LN()) { cfg.notifOn = true; save(); await ensure(true); return true; }
    if (!('Notification' in window)) { setStatus(AS('st_web')); return false; }
    var p = Notification.permission;
    if (p !== 'granted') p = await Notification.requestPermission();
    if (p !== 'granted') { setStatus(AS('st_deny')); return false; }
    cfg.notifOn = true; save(); setStatus(AS('st_web')); return true;
  }

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

  function openSettingsPanel() {
    applyTheme();
    var body = document.getElementById('salahBody');
    if (!body) return;

    var methodOpts = METHODS.map(function (m) {
      return '<option value="' + m.id + '"' + (cfg.method == m.id ? ' selected' : '') + '>' + ST(m.name) + '</option>';
    }).join('');
    var themeOpts = Object.keys(THEMES).map(function (k) {
      var names = { green: 'سەوز', navy: 'شین', gold: 'زەڕین', dark: 'ڕەش', teal: 'کەنەری' };
      return '<option value="' + k + '"' + (cfg.theme === k ? ' selected' : '') + '>' + ST(names[k] || k) + '</option>';
    }).join('');
    var list = adhanList();
    var adhanOpts = list.map(function (a) {
      return '<option value="' + a.id + '"' + (cfg.adhanId === a.id ? ' selected' : '') + '>' + anm(a) + '</option>';
    }).join('');
    var fajrOpts = '<option value=""' + (!cfg.fajrAdhanId ? ' selected' : '') + '>' + AS('same') + '</option>' + list.map(function (a) {
      return '<option value="' + a.id + '"' + (cfg.fajrAdhanId === a.id ? ' selected' : '') + '>' + anm(a) + '</option>';
    }).join('');
    var labels = { Fajr: 'بەیانی', Dhuhr: 'نیوەڕۆ', Asr: 'عەسر', Maghrib: 'مەغریب', Isha: 'عیشا' };
    var checks = PRAYERS.map(function (id) {
      var on = cfg.notifPrayers && cfg.notifPrayers[id];
      return '<label style="display:flex;gap:8px;margin:6px 0;align-items:center"><input type="checkbox" data-p="' + id + '"' + (on ? ' checked' : '') + '> ' + labels[id] + '</label>';
    }).join('');
    var offRows = PRAYERS.map(function (id) {
      var v = (cfg.offsets && typeof cfg.offsets[id] === 'number') ? cfg.offsets[id] : 0;
      return '<div style="display:flex;justify-content:space-between;margin:6px 0;align-items:center"><span>' + labels[id] + '</span><span dir="ltr"><input type="number" data-off="' + id + '" value="' + v + '" min="-30" max="30" step="1" style="width:64px;padding:6px;border:1px solid #ccc;border-radius:8px"> خولەک</span></div>';
    }).join('');

    body.innerHTML =
      '<div class="salah-card"><h3 style="margin:0 0 10px">دەرکەوتن</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>قەبارەی نووسین</span><input type="range" id="ssFont" min="0.85" max="1.35" step="0.05" value="' + cfg.fontScale + '" style="width:50%"></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>باکگراوند</span><select id="ssTheme">' + themeOpts + '</select></div></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">حیسابی کات</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>شێواز</span><select id="ssMethod">' + methodOpts + '</select></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>عەسر</span><select id="ssSchool"><option value="0"' + (cfg.school == 0 ? ' selected' : '') + '> ' + ST('شافعی') + '</option><option value="1"' + (cfg.school == 1 ? ' selected' : '') + '>' + ST('حەنەفی') + '</option></select></div></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">ڕێکخستنی خولەک</h3>' +
      '<p style="font-size:12px;opacity:.8;margin:0 0 8px">ئەگەر کاتەکان زوو/درەنگ بن، لێرە ڕێکیان بخە. پێشگریمان: نیوەڕۆ +١٠.</p>' +
      offRows +
      '<button type="button" id="ssOffSave" style="width:100%;margin-top:10px;padding:10px;border:0;border-radius:10px;background:#176b4b;color:#fff">پاشەکەوت و نوێکردنەوەی کات</button></div>' +
      '<div class="salah-card"><h3 style="margin:0 0 10px">نۆتیفیکەیشن و بانگ</h3>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>ئاگاداری</span><button type="button" id="ssNotif" style="padding:8px 12px;border:0;border-radius:10px;background:#176b4b;color:#fff">' + (cfg.notifOn ? 'چالاکە ✓' : 'چالاک بکە') + '</button></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>بانگدەر</span><select id="ssAdhan">' + adhanOpts + '</select></div>' +
      '<div style="display:flex;justify-content:space-between;margin:8px 0;align-items:center"><span>' + AS('a_fajr') + '</span><select id="ssFajrAdhan">' + fajrOpts + '</select></div>' +
      '<div><b>نوێژەکان:</b>' + checks + '</div>' +
      '<div id="ssNtfStatus" style="font-size:12.5px;line-height:1.8;margin:8px 0;color:#176b4b">' + AS(cfg.notifOn ? (LN() ? 'st_on' : 'st_web') : 'st_off', { n: '…', d: '…' }) + '</div>' +
      '<button type="button" id="ssTest" style="width:100%;margin-top:6px;padding:10px;border:0;border-radius:10px;background:#444;color:#fff">▶ ' + ST('تاقیکردنەوەی بانگ') + '</button>' +
      '<button type="button" id="ssTestNtf" style="width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#176b4b;color:#fff">' + AS('a_tn') + '</button>' +
      '<p style="font-size:12px;opacity:.8;margin:10px 0 0;line-height:1.8">' + AS('st_batt') + '</p></div>';

    document.getElementById('ssFont').oninput = function () { cfg.fontScale = +this.value; save(); applyTheme(); };
    document.getElementById('ssTheme').onchange = function () { cfg.theme = this.value; save(); applyTheme(); openSettingsPanel(); };
    document.getElementById('ssMethod').onchange = function () {
      cfg.method = +this.value; save();
      try { localStorage.setItem('salah_v1', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('salah_v1') || '{}'), { method: cfg.method }))); } catch (e) {}
      ensure(true);
      alert('دوای ↻ کاتەکان نوێ دەبنەوە.');
    };
    document.getElementById('ssSchool').onchange = function () { cfg.school = +this.value; save(); ensure(true); };
    document.getElementById('ssOffSave').onclick = function () {
      if (!cfg.offsets) cfg.offsets = {};
      body.querySelectorAll('input[data-off]').forEach(function (inp) {
        cfg.offsets[inp.getAttribute('data-off')] = parseInt(inp.value, 10) || 0;
      });
      save(); ensure(true);
      alert('پاشەکەوت کرا. دوگمەی ↻ دابگرە.');
    };
    document.getElementById('ssAdhan').onchange = function () { cfg.adhanId = this.value; save(); stopAdhan(); ensure(true); };
    document.getElementById('ssFajrAdhan').onchange = function () { cfg.fajrAdhanId = this.value; save(); ensure(true); };
    document.getElementById('ssNotif').onclick = async function () {
      if (cfg.notifOn) { cfg.notifOn = false; save(); this.textContent = 'چالاک بکە'; await ensure(true); setStatus(AS('st_off')); }
      else { setStatus('…'); if (await enableNotif()) this.textContent = 'چالاکە ✓'; }
    };
    document.getElementById('ssTest').onclick = function () {
      if (adhanAudio) { stopAdhan(); this.textContent = '▶ ' + ST('تاقیکردنەوەی بانگ'); }
      else { playAdhan(cfg.adhanId); this.textContent = AS('a_stop'); }
    };
    document.getElementById('ssTestNtf').onclick = function () {
      testNotif().then(function (r) { setStatus(r === 'sent' ? AS('sent') : r === 'deny' ? AS('st_deny') : AS('st_web')); }).catch(function () { setStatus(AS('st_err')); });
    };
    body.querySelectorAll('input[data-p]').forEach(function (cb) {
      cb.onchange = function () {
        if (!cfg.notifPrayers) cfg.notifPrayers = {};
        cfg.notifPrayers[cb.getAttribute('data-p')] = cb.checked;
        save(); ensure(true);
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
    var _l = window.appLang || 'ckb';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg><span>' + (_l === 'ar' ? 'الإعدادات' : (_l === 'ckb' || _l === 'bad') ? 'ڕێکخستن' : 'Settings') + '</span>';
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
    /* the place may have changed while the Prayer screen was open */
    setTimeout(function () { ensure(false); }, 4000);
  };

  var _fetch = window.fetch;
  window.fetch = function (url, opts) {
    if (typeof url === 'string' && url.indexOf('api.aladhan.com/v1/timings') >= 0) {
      try {
        var u = new URL(url);
        var m = cfg.method || 3;
        if (m == 99) {
          var la = +u.searchParams.get('latitude'), lo = +u.searchParams.get('longitude');
          if (la >= 28.9 && la <= 37.5 && lo >= 38.7 && lo <= 48.8) u.searchParams.set('methodSettings', '16.5,null,16'); else m = 3;
        }
        u.searchParams.set('method', String(m));
        u.searchParams.set('school', String(cfg.school || 0));
        url = u.toString();
      } catch (e) {}
    }
    return _fetch.call(this, url, opts);
  };

  loadManifest();
  applyTheme();
  setInterval(enhanceTabs, 2000);
  /* keep the 14-day window fresh: shortly after launch, when the app returns to the foreground, and when something relevant changed */
  setTimeout(function () { ensure(false); }, 3500);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) ensure(false); });
  setInterval(function () { ensure(false); webCheck(); }, 30000);
})();
