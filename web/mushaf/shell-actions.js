/* Reader extras for the mushaf shell (all modes): tap toggles the UI, hold an ayah -> toolbar (bookmark, share, tafsir, play), page tafsir, bookmarks. Built from ayah-actions.js. */
/* Reader extras. Loaded from language-ui.js (served as mushaf/ayah-actions.js).
   - Page fills the whole screen.
   - HOLD a finger on an ayah -> floating toolbar above it: bookmark, share, tafsir (half screen), play & continue.
   - Short tap anywhere     -> top buttons (back, tafsir of the page = full screen, bookmark page) + player (bottom); tap again to hide.
   - You can pick several tafsirs; they are shown one under the other. */
(function () {
  if (window.__shellActionsInstalled) return;
  window.__shellActionsInstalled = true;

  var T = {
    ckb: { bm1: 'نیشانکرا', bm0: 'نیشانەکە لابرا', copied: 'کۆپی کرا', fail: 'سەرکەوتوو نەبوو', tafsir: 'تەفسیر', loading: 'بارکردن...', na: 'ئەم تەفسیرە بۆ ئەم ئایەتە بەردەست نییە.', close: 'داخستن', done: 'تەواو', note: '', page: 'پەڕە', juz: 'جوز', surah: 'سورەت', max: 'زۆرترین ٦ تەفسیر' },
    bad: { bm1: 'نیشانکرا', bm0: 'نیشانەکە لابرا', copied: 'کۆپی کرا', fail: 'سەرکەوتوو نەبوو', tafsir: 'تەفسیر', loading: 'بارکردن...', na: 'ئەڤ تەفسیرە بۆ ڤی ئایەتی نینە.', close: 'داخستن', done: 'تەواو', note: 'تەفسیرا بادینی نینە؛ تەفسیرێن کوردی و عەرەبی دهێنە نیشاندان.', page: 'پەڕە', juz: 'جوز', surah: 'سورەت', max: 'زۆرترین ٦ تەفسیر' },
    ar: { bm1: 'تمت الإشارة', bm0: 'أُزيلت الإشارة', copied: 'تم النسخ', fail: 'تعذّر التنفيذ', tafsir: 'التفسير', loading: 'جارٍ التحميل...', na: 'هذا التفسير غير متوفر لهذه الآية.', close: 'إغلاق', done: 'تم', note: '', page: 'صفحة', juz: 'الجزء', surah: 'سورة', max: 'الحد الأقصى ٦ تفاسير' },
    en: { bm1: 'Bookmarked', bm0: 'Bookmark removed', copied: 'Copied', fail: 'Failed', tafsir: 'Tafsir', loading: 'Loading...', na: 'This tafsir is not available for this ayah.', close: 'Close', done: 'Done', note: '', page: 'Page', juz: 'Juz', surah: 'Surah', max: 'Up to 6 tafsirs' },
    tr: { bm1: 'İşaretlendi', bm0: 'İşaret kaldırıldı', copied: 'Kopyalandı', fail: 'Başarısız', tafsir: 'Tefsir', loading: 'Yükleniyor...', na: 'Bu tefsir bu ayet için mevcut değil.', close: 'Kapat', done: 'Tamam', note: '', page: 'Sayfa', juz: 'Cüz', surah: 'Sure', max: 'En fazla 6 tefsir' },
    fa: { bm1: 'نشانه‌گذاری شد', bm0: 'نشانه حذف شد', copied: 'کپی شد', fail: 'ناموفق', tafsir: 'تفسیر', loading: 'در حال بارگذاری...', na: 'این تفسیر برای این آیه موجود نیست.', close: 'بستن', done: 'تأیید', note: '', page: 'صفحه', juz: 'جزء', surah: 'سوره', max: 'حداکثر ۶ تفسیر' },
    ur: { bm1: 'نشان زد کیا گیا', bm0: 'نشان ہٹا دیا گیا', copied: 'کاپی ہو گیا', fail: 'ناکام', tafsir: 'تفسیر', loading: 'لوڈ ہو رہا ہے...', na: 'یہ تفسیر اس آیت کے لیے دستیاب نہیں۔', close: 'بند کریں', done: 'ہو گیا', note: '', page: 'صفحہ', juz: 'پارہ', surah: 'سورت', max: 'زیادہ سے زیادہ ۶ تفاسیر' },
    fr: { bm1: 'Ajouté aux signets', bm0: 'Signet retiré', copied: 'Copié', fail: 'Échec', tafsir: 'Tafsir', loading: 'Chargement…', na: 'Ce tafsir n’est pas disponible pour ce verset.', close: 'Fermer', done: 'OK', note: '', page: 'Page', juz: 'Juz', surah: 'Sourate', max: '6 tafsirs maximum' },
    ru: { bm1: 'Добавлено в закладки', bm0: 'Закладка удалена', copied: 'Скопировано', fail: 'Не удалось', tafsir: 'Тафсир', loading: 'Загрузка…', na: 'Этот тафсир недоступен для этого аята.', close: 'Закрыть', done: 'Готово', note: '', page: 'Страница', juz: 'Джуз', surah: 'Сура', max: 'Не более 6 тафсиров' },
    id: { bm1: 'Ditandai', bm0: 'Tanda dihapus', copied: 'Disalin', fail: 'Gagal', tafsir: 'Tafsir', loading: 'Memuat…', na: 'Tafsir ini tidak tersedia untuk ayat ini.', close: 'Tutup', done: 'Selesai', note: '', page: 'Halaman', juz: 'Juz', surah: 'Surah', max: 'Maksimal 6 tafsir' }
  };

  /* tafsir editions (spa5k/tafsir_api via jsDelivr, no API key): [slug, name] */
  var BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/';
  var ED = {
    ckb: [['kurd-tafsir-rebar', 'Rebar Kurdish Tafsir'], ['kurdish-mokhtasar', 'Kurdish Mokhtasar']],
    ar: [['ar-tafsir-muyassar', 'التفسير الميسر'], ['ar-tafsir-ibn-kathir', 'تفسير ابن كثير'], ['ar-tafsir-al-tabari', 'تفسير الطبري'], ['ar-tafseer-al-qurtubi', 'تفسير القرطبي'], ['ar-tafseer-al-saddi', 'تفسير السعدي'], ['ar-tafsir-al-baghawi', 'تفسير البغوي'], ['ar-tafsir-al-wasit', 'التفسير الوسيط'], ['ar-tafsir-al-jalalayn', 'تفسير الجلالين'], ['ar-tafsir-al-mukhtasar', 'المختصر في التفسير'], ['ar-tafseer-tahrir-al-tanwir', 'التحرير والتنوير'], ['tafsir-al-razi', 'تفسير الرازي'], ['tafsir-al-baydawi', 'تفسير البيضاوي'], ['tafsir-al-nasafi', 'تفسير النسفي'], ['al-kashshaf-al-zamakhshari', 'الكشاف للزمخشري'], ['al-muharrar-al-wajiz-ibn-atiyyah', 'المحرر الوجيز'], ['tafsir-ibn-uthaymeen', 'تفسير ابن عثيمين'], ['fath-al-qadir-al-shawkani', 'فتح القدير']],
    en: [['en-tafisr-ibn-kathir', 'Tafsir Ibn Kathir'], ['en-tafsir-maarif-ul-quran', "Ma'ariful Quran"], ['en-al-jalalayn', 'Al-Jalalayn'], ['en-tafsir-ibn-abbas', 'Tanwir al-Miqbas (Ibn Abbas)'], ['en-tafsir-al-mukhtasar', 'Al-Mukhtasar'], ['en-tazkirul-quran', 'Tazkirul Quran'], ['en-asbab-al-nuzul-by-al-wahidi', 'Asbab al-Nuzul (Al-Wahidi)']],
    tr: [['tr-tafsir-ibne-kathir', 'İbn Kesir Tefsiri'], ['turkish-mokhtasar', 'Muhtasar Tefsir'], ['turkish-tafsir-as-saadi-turkish', "Es-Sa'di Tefsiri"]],
    fa: [['persian-mokhtasar', 'تفسیر المختصر'], ['fr-tafsir-as-saadi', 'تفسیر سعدی']],
    ur: [['ur-tafseer-ibn-e-kaseer', 'تفسیر ابن کثیر'], ['ur-tafsir-bayan-ul-quran', 'بیان القرآن'], ['ur-tafsir-as-saadi-urdu', 'تفسیر السعدی'], ['ur-tazkirul-quran', 'تذکیر القرآن']],
    fr: [['french-mokhtasar', 'Al-Mukhtasar (français)']],
    ru: [['ru-tafsir-ibne-kahtir', 'Тафсир Ибн Касир'], ['ru-tafseer-al-saddi', 'Тафсир ас-Саади'], ['russian-mokhtasar', 'Аль-Мухтасар']],
    id: [['id-tafsir-as-saadi', "Tafsir As-Sa'di"], ['indonesian-mokhtasar', 'Al-Mukhtasar'], ['in-tafsir-jalalayn', 'Tafsir Jalalayn']]
  };
  var LN = { ckb: 'کوردی', ar: 'العربية', en: 'English', tr: 'Türkçe', fa: 'فارسی', ur: 'اردو', fr: 'Français', ru: 'Русский', id: 'Indonesia' };
  var RTL = { ckb: 1, ar: 1, fa: 1, ur: 1 };
  var SLUG = {}, NAME = {};
  Object.keys(ED).forEach(function (g) { ED[g].forEach(function (e) { SLUG[e[0]] = g; NAME[e[0]] = e[1]; }); });
  var JUZ_PAGE = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

  function lang() {
    var l = window.appLang;
    if (!l) { try { l = localStorage.getItem('app_language'); } catch (e) {} }
    return T[l] ? l : 'ckb';
  }
  function tr(k) { return T[lang()][k]; }
  function $(id) { return document.getElementById(id); }
  function curPage() { return (typeof page !== 'undefined' && page) || 1; }
  function readerActive() { return true; }

  /* ---------- styles ---------- */
  var st = document.createElement('style');
  st.textContent = [
    /* no blue selection / tap flash on the page */
    /* the page fills the whole screen */
    /* player at the bottom */
    /* top round buttons */
    /* floating toolbar */
    '#ayahBar{position:fixed;z-index:40;display:none;background:#2f6b45;border-radius:6px;box-shadow:0 6px 20px #0005;padding:4px;direction:ltr}',
    '#ayahBar.on{display:flex}',
    '#ayahBar button{width:54px;height:46px;border:0;background:transparent;display:grid;place-items:center;cursor:pointer;padding:0}',
    '#ayahBar button:active{background:rgba(255,255,255,.18)}',
    '#ayahBar svg{width:26px;height:26px}',
    '#ayahBar .ab-arrow{position:absolute;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent}',
    '#ayahBar.up .ab-arrow{bottom:-9px;border-top:9px solid #2f6b45}',
    '#ayahBar.down .ab-arrow{top:-9px;border-bottom:9px solid #2f6b45}',
    /* toast */
    '#ayahToast{position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:90;background:rgba(23,63,53,.92);color:#fff;border-radius:999px;padding:9px 18px;font-size:14px;display:none;max-width:90%;text-align:center}',
    /* tafsir cards (shared by the half-screen ayah panel and the full-screen page view) */
    '.tv-ay{padding:14px 14px 6px;border-bottom:1px solid #e3e6e4}',
    '.tv-lab{display:inline-block;min-width:46px;padding:14px 12px;background:#f0f0f0;color:#333;text-align:center;font-size:16px;direction:ltr;margin-bottom:6px}',
    '.tv-ar{font-family:"Amiri","Traditional Arabic","Scheherazade New",serif;font-size:27px;line-height:2.3;text-align:right;color:#111;direction:rtl;margin:8px 0 14px}',
    '.tv-tx{margin:0 0 14px}',
    '.tv-ed{font-size:12px;color:#176b4b;font-weight:bold;margin-bottom:3px}',
    '.tv-body{font-size:18px;line-height:2.1;color:#222;white-space:pre-wrap}',
    /* half-screen ayah tafsir */
    '#tafsirPanel{position:fixed;left:0;right:0;bottom:0;z-index:50;height:50vh;background:#fff;border-radius:18px 18px 0 0;box-shadow:0 -10px 30px #0004;display:none;flex-direction:column;max-width:640px;margin:0 auto}',
    '#tafsirPanel.on{display:flex}',
    '#tafsirPanel .tp-head{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#176b4b;color:#fff;border-radius:18px 18px 0 0}',
    '#tafsirPanel .tp-title{flex:1;font-weight:bold;font-size:16px}',
    '.tf-btn{border:0;border-radius:9px;padding:7px 12px;font:inherit;background:#e8f3ee;color:#173f35;cursor:pointer}',
    '#tafsirPanel .tp-note,#tafsirPage .tp-note{margin:6px 14px 0;color:#6d7975;font-size:12px}',
    '#tafsirPanel .tp-body{flex:1;overflow:auto;padding-bottom:calc(16px + env(safe-area-inset-bottom));-webkit-user-select:text;user-select:text}',
    /* full-screen page tafsir */
    '#tafsirPage{position:fixed;inset:0;z-index:55;background:#fff;display:none;flex-direction:column}',
    '#tafsirPage.on{display:flex}',
    '#tafsirPage .tv-head{display:flex;align-items:center;gap:4px;padding:calc(10px + env(safe-area-inset-top)) 8px 10px;background:#faf8f1;border-bottom:1px solid #ece8da}',
    '#tafsirPage .tv-head button{width:42px;height:42px;border:0;background:transparent;display:grid;place-items:center;cursor:pointer;padding:0;border-radius:50%;color:#222;font-size:22px}',
    '#tafsirPage .tv-head button:active{background:#0001}',
    '#tafsirPage .tv-head svg{width:24px;height:24px}',
    '#tafsirPage .tv-title{flex:1;min-width:0;line-height:1.5}',
    '#tafsirPage .tv-title b{display:block;font-size:17px;color:#222}',
    '#tafsirPage .tv-title span{font-size:14px;color:#444}',
    '#tafsirPage .tv-scroll{flex:1;overflow:auto;padding-bottom:calc(20px + env(safe-area-inset-bottom));-webkit-user-select:text;user-select:text}',
    '#tafsirPage .tv-msg{padding:24px;text-align:center;color:#6d7975}',
    /* tafsir picker (choose several) */
    '#tfPicker{position:fixed;inset:0;z-index:80;background:#0007;display:none;align-items:flex-end;justify-content:center}',
    '#tfPicker.on{display:flex}',
    '#tfPicker .pk-sheet{background:#fff;border-radius:18px 18px 0 0;width:100%;max-width:560px;max-height:80vh;display:flex;flex-direction:column}',
    '#tfPicker .pk-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #e3e6e4}',
    '#tfPicker .pk-head b{flex:1;font-size:16px;color:#173f35}',
    '#tfPicker .pk-list{overflow:auto;padding:4px 0 calc(10px + env(safe-area-inset-bottom))}',
    '#tfPicker .pk-grp{padding:10px 14px 4px;color:#176b4b;font-weight:bold;font-size:13px}',
    '#tfPicker .pk-row{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer}',
    '#tfPicker .pk-row input{width:20px;height:20px;accent-color:#176b4b;flex:0 0 auto}'
  ].join('\n');
  document.head.appendChild(st);

  /* ---------- helpers ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('ayahToast');
    if (!t) { t = document.createElement('div'); t.id = 'ayahToast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.style.display = 'none'; }, 2200);
  }

  function surahName(s) {
    try { if (typeof N !== 'undefined' && N[s - 1]) return N[s - 1]; } catch (e) {}
    return String(s);
  }
  function surahStart(s) {
    try { if (typeof N !== 'undefined' && N[s - 1]) return 1; } catch (e) {}
    return 1;
  }
  function juzOfPage(p) { var j = 1; for (var i = 0; i < JUZ_PAGE.length; i++) { if (JUZ_PAGE[i] <= p) j = i + 1; else break; } return j; }

  function clean(h) {
    if (!h) return '';
    try {
      var d = new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>|<\/p>|<\/div>|<\/h\d>/gi, '\n'), 'text/html');
      return (d.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
    } catch (e) { return ''; }
  }

  function getJSON(k) { try { var v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function setJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ayah bookmarks are stored as "sura:ayah:page" */
  function ayahBmIndex(l, s, a) {
    for (var i = 0; i < l.length; i++) { var p = String(l[i]).split(':'); if (+p[0] === s && +p[1] === a) return i; }
    return -1;
  }
  function bmHas(s, a) { return ayahBmIndex(getJSON('ayah_bookmarks'), s, a) >= 0; }
  function bmToggle(s, a) {
    var l = getJSON('ayah_bookmarks'), i = ayahBmIndex(l, s, a), on;
    if (i >= 0) { l.splice(i, 1); on = false; } else { l.push(s + ':' + a + ':' + curPage()); on = true; }
    setJSON('ayah_bookmarks', l);
    return on;
  }
  function pageBmHas(p) { return getJSON('page_bookmarks').indexOf(p) >= 0; }
  function pageBmToggle(p) {
    var l = getJSON('page_bookmarks'), i = l.indexOf(p), on;
    if (i >= 0) { l.splice(i, 1); on = false; } else { l.push(p); on = true; }
    setJSON('page_bookmarks', l);
    return on;
  }

  /* ---------- icons ---------- */
  var ICON = {
    bm0: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
    bm1: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
    bmd0: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="#222" stroke-width="2" stroke-linejoin="round"/></svg>',
    bmd1: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="#222" stroke="#222" stroke-width="2" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" fill="none"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- tafsir data ---------- */
  var tcache = {}, q = [], active = 0;
  function pump() { while (active < 8 && q.length) q.shift()(); }
  function pool(fn) {
    return new Promise(function (res) {
      q.push(function () { active++; fn().then(res, function () { res(''); }).then(function () { active--; pump(); }); });
      pump();
    });
  }
  function fetchTafsir(ed, s, a) {
    var k = ed + '|' + s + '|' + a;
    if (tcache[k]) return tcache[k];
    return (tcache[k] = pool(function () {
      return fetch(BASE + ed + '/' + s + '/' + a + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { return clean(j && j.text); });
    }));
  }

  function stripMarks(x) { return x.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, ''); }
  function stripBasmala(t, s, a) {
    if (a === 1 && s !== 1 && s !== 9) {
      var w = t.split(' ');
      if (w.length > 4 && stripMarks(w[0]).indexOf('بسم') === 0 && stripMarks(w[1]).indexOf('لله') >= 0) t = w.slice(4).join(' ');
    }
    return t;
  }
  function fetchAyahText(s, a) {
    return fetch('https://api.alquran.cloud/v1/ayah/' + s + ':' + a + '/quran-uthmani').then(function (r) {
      if (!r.ok) throw 0; return r.json();
    }).then(function (j) {
      var t = stripBasmala((j && j.data && j.data.text) || '', s, a);
      if (!t) throw 0;
      return t;
    });
  }

  /* ---------- chosen tafsirs (several allowed) ---------- */
  function groupsOrder() {
    var l = lang(), own = l === 'bad' ? 'ckb' : l, g = [own];
    if (own !== 'ar') g.push('ar');
    if (own !== 'en') g.push('en');
    Object.keys(ED).forEach(function (k) { if (g.indexOf(k) < 0) g.push(k); });
    return g;
  }
  function selected() {
    var l = getJSON('tafsir_selected').filter(function (x) { return SLUG[x]; });
    if (!l.length) { var own = groupsOrder()[0]; l = [ED[own][0][0]]; }
    return l;
  }

  var picker = null, pickerDone = null;
  function openPicker(onDone) {
    pickerDone = onDone;
    if (!picker) {
      picker = document.createElement('div');
      picker.id = 'tfPicker';
      picker.innerHTML = '<div class="pk-sheet"><div class="pk-head"><b id="pkT"></b><button type="button" class="tf-btn" id="pkOk"></button></div><div class="pk-list" id="pkList"></div></div>';
      document.body.appendChild(picker);
      $('pkOk').onclick = function () {
        var vals = [].slice.call(picker.querySelectorAll('input:checked')).map(function (i) { return i.value; });
        if (!vals.length) vals = [ED[groupsOrder()[0]][0][0]];
        setJSON('tafsir_selected', vals);
        picker.classList.remove('on');
        if (pickerDone) pickerDone();
      };
    }
    $('pkT').textContent = tr('tafsir');
    $('pkOk').textContent = tr('done');
    var sel = selected(), list = $('pkList');
    list.innerHTML = '';
    groupsOrder().forEach(function (c) {
      var h = document.createElement('div');
      h.className = 'pk-grp'; h.textContent = LN[c];
      list.appendChild(h);
      ED[c].forEach(function (e) {
        var row = document.createElement('label');
        row.className = 'pk-row';
        row.dir = RTL[c] ? 'rtl' : 'ltr';
        var cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = e[0]; cb.checked = sel.indexOf(e[0]) >= 0;
        cb.onchange = function () {
          if (cb.checked && picker.querySelectorAll('input:checked').length > 6) { cb.checked = false; toast(tr('max')); }
        };
        var sp = document.createElement('span');
        sp.textContent = e[1];
        row.appendChild(cb); row.appendChild(sp);
        list.appendChild(row);
      });
    });
    picker.classList.add('on');
  }

  /* one ayah: label, Arabic text, then every chosen tafsir under it */
  function ayahCard(s, a, text, eds) {
    var c = document.createElement('div');
    c.className = 'tv-ay';
    var lab = document.createElement('div');
    lab.className = 'tv-lab'; lab.textContent = s + ':' + a;
    c.appendChild(lab);
    if (text) {
      var ar = document.createElement('div');
      ar.className = 'tv-ar'; ar.textContent = text;
      c.appendChild(ar);
    }
    eds.forEach(function (ed) {
      var box = document.createElement('div');
      box.className = 'tv-tx';
      var h = document.createElement('div');
      h.className = 'tv-ed'; h.textContent = NAME[ed];
      var p = document.createElement('div');
      p.className = 'tv-body'; p.dir = RTL[SLUG[ed]] ? 'rtl' : 'ltr'; p.textContent = '…';
      box.appendChild(h); box.appendChild(p);
      c.appendChild(box);
      fetchTafsir(ed, s, a).then(function (t) { p.textContent = t || tr('na'); });
    });
    return c;
  }

  /* ---------- half-screen tafsir of ONE ayah ---------- */
  var panel = null, panelAyah = null;
  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'tafsirPanel';
    panel.innerHTML = '<div class="tp-head"><span class="tp-title" id="tpTitle"></span><button type="button" class="tf-btn" id="tpPick"></button><button type="button" class="tf-btn" id="tpX"></button></div><div class="tp-note" id="tpNote"></div><div class="tp-body" id="tpBody"></div>';
    document.body.appendChild(panel);
    $('tpX').onclick = function () { panel.classList.remove('on'); };
    $('tpPick').onclick = function () { openPicker(renderPanel); };
    return panel;
  }
  function renderPanel() {
    if (!panelAyah) return;
    var s = panelAyah.sura, a = panelAyah.ayah, body = $('tpBody'), eds = selected();
    $('tpTitle').textContent = tr('tafsir') + ' · ' + surahName(s) + ' : ' + a;
    $('tpPick').textContent = '▾ ' + eds.length;
    $('tpX').textContent = tr('close');
    $('tpNote').textContent = T[lang()].note || '';
    body.textContent = tr('loading');
    var mine = panelAyah;
    fetchAyahText(s, a).catch(function () { return ''; }).then(function (txt) {
      if (panelAyah !== mine) return;
      body.textContent = '';
      body.appendChild(ayahCard(s, a, txt, eds));
      body.scrollTop = 0;
    });
  }
  function openAyahTafsir(s, a) {
    buildPanel();
    panelAyah = { sura: s, ayah: a };
    panel.classList.add('on');
    renderPanel();
  }

  /* ---------- full-screen tafsir of the PAGE ---------- */
  var pv = null, pvPage = 1, pvSeq = 0, pvStart = 1;
  function buildPageView() {
    if (pv) return pv;
    pv = document.createElement('div');
    pv.id = 'tafsirPage';
    pv.innerHTML = '<div class="tv-head"><button type="button" id="tvBack">' + ICON.back + '</button><div class="tv-title"><b id="tvT1"></b><span id="tvT2"></span></div><button type="button" id="tvNext">‹</button><button type="button" id="tvPrev">›</button><button type="button" id="tvPick"></button><button type="button" id="tvBm"></button></div><div class="tp-note" id="tvNote"></div><div class="tv-scroll" id="tvScroll"></div>';
    document.body.appendChild(pv);
    $('tvBack').onclick = function () {
      pv.classList.remove('on'); pvSeq++;
      if (pvPage !== pvStart && typeof openPage === 'function') openPage(pvPage);
    };
    $('tvNext').onclick = function () { loadPageView(pvPage + 1); };
    $('tvPrev').onclick = function () { loadPageView(pvPage - 1); };
    $('tvPick').onclick = function () { openPicker(function () { loadPageView(pvPage); }); };
    $('tvBm').onclick = function () {
      var on = pageBmToggle(pvPage);
      $('tvBm').innerHTML = on ? ICON.bmd1 : ICON.bmd0;
      toast(on ? tr('bm1') : tr('bm0'));
    };
    return pv;
  }
  function loadPageView(p) {
    p = Math.max(1, Math.min(604, +p || 1));
    pvPage = p;
    var seq = ++pvSeq, scroll = $('tvScroll'), eds = selected();
    $('tvPick').innerHTML = '<span style="font-size:15px">▾' + eds.length + '</span>';
    $('tvBm').innerHTML = pageBmHas(p) ? ICON.bmd1 : ICON.bmd0;
    $('tvNote').textContent = T[lang()].note || '';
    $('tvT1').textContent = '…';
    $('tvT2').textContent = tr('page') + ' ' + p + ' , ' + tr('juz') + ' ' + juzOfPage(p);
    scroll.innerHTML = '<div class="tv-msg">' + tr('loading') + '</div>';
    fetch('https://api.alquran.cloud/v1/page/' + p + '/quran-uthmani').then(function (r) {
      if (!r.ok) throw 0; return r.json();
    }).then(function (j) {
      if (seq !== pvSeq) return;
      var list = (j && j.data && j.data.ayahs) || [];
      if (!list.length) throw 0;
      var f = list[0];
      $('tvT1').textContent = tr('surah') + ' ' + surahName(f.surah.number);
      $('tvT2').textContent = tr('page') + ' ' + p + ' , ' + tr('juz') + ' ' + (f.juz || juzOfPage(p));
      scroll.textContent = '';
      list.forEach(function (x) {
        var s = x.surah.number, a = x.numberInSurah;
        scroll.appendChild(ayahCard(s, a, stripBasmala(x.text || '', s, a), eds));
      });
      scroll.scrollTop = 0;
    }).catch(function () {
      if (seq === pvSeq) scroll.innerHTML = '<div class="tv-msg">' + tr('fail') + '</div>';
    });
  }
  function openPageTafsir() {
    buildPageView();
    pvStart = curPage();
    pv.classList.add('on');
    loadPageView(pvStart);
  }

  /* ---------- share ---------- */
  function shareAyah(s, a) {
    fetchAyahText(s, a).then(function (txt) {
      var msg = '﴿' + txt + '﴾\n[' + surahName(s) + ' : ' + a + ']';
      if (navigator.share) {
        return navigator.share({ text: msg }).catch(function (e) { if (e && e.name === 'AbortError') return; throw e; });
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(msg).then(function () { toast(tr('copied')); });
      }
      throw 0;
    }).catch(function () { toast(tr('fail')); });
  }

  /* ================= shell adaptation: full screen, tap toggles UI, hold opens the ayah toolbar ================= */
  window.openPage = function (p) { try { page = Math.max(1, Math.min(604, +p || 1)); show(); } catch (e) {} };
  var st2 = document.createElement('style');
  st2.textContent = [
    '#f{position:absolute;left:0;top:0;width:100%;height:100%;z-index:1}',
    'header{position:fixed;top:0;left:0;right:0;z-index:30;box-shadow:0 4px 16px #0004}',
    '#pl,#pl.on{display:none!important;position:fixed;bottom:0;left:0;right:0;z-index:30}',
    '#app.ui #pl{display:flex!important}',
    '#app:not(.ui) header{display:none}',
    '#ayahBar{position:fixed;z-index:40;display:none;background:#2f6b45;border-radius:6px;box-shadow:0 6px 20px #0005;padding:4px;direction:ltr}',
    '#ayahBar.on{display:flex}',
    '#ayahBar button{width:54px;height:46px;border:0;background:transparent;display:grid;place-items:center;cursor:pointer;padding:0}',
    '#ayahBar svg{width:26px;height:26px}',
    '#ayahBar .ab-arrow{position:absolute;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent}',
    '#ayahBar.up .ab-arrow{bottom:-9px;border-top:9px solid #2f6b45}',
    '#ayahBar.down .ab-arrow{top:-9px;border-bottom:9px solid #2f6b45}',
    '#hdTf,#hdBm{flex:0 0 auto;min-width:38px}'
  ].join('\n');
  document.head.appendChild(st2);

  var app = $('app'), fr = $('f'), bar = null, sel = null;
  function uiOn() { return app.classList.contains('ui'); }
  function setUI(on) { app.classList.toggle('ui', !!on); if (on) refreshBm(); }
  function refreshBm() { var b = $('hdBm'); if (b) b.textContent = pageBmHas(curPage()) ? '★' : '☆'; }

  var hd = document.querySelector('header');
  if (hd) {
    var b1 = document.createElement('button'); b1.id = 'hdTf'; b1.type = 'button'; b1.textContent = '📖';
    var b2 = document.createElement('button'); b2.id = 'hdBm'; b2.type = 'button';
    var home = $('home');
    if (home && home.nextSibling) { hd.insertBefore(b2, home.nextSibling); hd.insertBefore(b1, home.nextSibling); } else { hd.appendChild(b1); hd.appendChild(b2); }
    b1.onclick = function () { openPageTafsir(); };
    b2.onclick = function () { var on = pageBmToggle(curPage()); refreshBm(); toast(on ? tr('bm1') : tr('bm0')); };
    refreshBm();
  }

  function buildBar() {
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'ayahBar';
    bar.innerHTML = '<button type="button" id="abBm"></button><button type="button" id="abShare">' + ICON.share + '</button><button type="button" id="abTafsir">' + ICON.globe + '</button><button type="button" id="abPlay">' + ICON.play + '</button><div class="ab-arrow" id="abArrow"></div>';
    document.body.appendChild(bar);
    $('abBm').onclick = function () { if (!sel) return; var on = bmToggle(sel.sura, sel.ayah); $('abBm').innerHTML = on ? ICON.bm1 : ICON.bm0; toast(on ? tr('bm1') : tr('bm0')); };
    $('abShare').onclick = function () { if (sel) shareAyah(sel.sura, sel.ayah); };
    $('abTafsir').onclick = function () { if (sel) { var x = sel; closeBar(true); openAyahTafsir(x.sura, x.ayah); } };
    $('abPlay').onclick = function () { var x = sel; if (!x) return; closeBar(true); setCur(x.sura, x.ayah, true); setUI(true); };
    return bar;
  }
  function openBar(s, a, r) {
    buildBar(); sel = { sura: s, ayah: a };
    $('abBm').innerHTML = bmHas(s, a) ? ICON.bm1 : ICON.bm0;
    var o = fr.getBoundingClientRect();
    var top = o.top + (r ? r.t : 100), bottom = o.top + (r ? r.b : 120), cx = o.left + (r ? (r.l + r.r) / 2 : o.width / 2);
    bar.style.visibility = 'hidden'; bar.className = 'on up';
    setTimeout(function () {
      var w = bar.offsetWidth, h = bar.offsetHeight, gap = 12;
      var left = Math.max(8, Math.min(window.innerWidth - w - 8, cx - w / 2));
      var up = top - h - gap >= 8;
      bar.style.left = left + 'px'; bar.style.top = (up ? top - h - gap : bottom + gap) + 'px';
      bar.className = 'on ' + (up ? 'up' : 'down');
      $('abArrow').style.left = (Math.max(14, Math.min(w - 14, cx - left)) - 9) + 'px';
      bar.style.visibility = 'visible';
    }, 0);
  }
  function closeBar(keep) {
    if (bar) bar.className = '';
    sel = null;
    if (!keep) { try { fr.contentWindow.selectAyah(0); } catch (e) {} }
  }
  function overlaysOpen() { return !!document.querySelector('#tafsirPanel.on,#tafsirPage.on,#tfPicker.on'); }

  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.tap) {
      if (overlaysOpen()) return;
      if (bar && bar.classList.contains('on')) { closeBar(false); return; }
      setUI(!uiOn());
    }
    if (d.hold && !overlaysOpen()) openBar(d.hold[0], d.hold[1], d.rect);
    if (d.swipe || d.ready) { closeBar(false); refreshBm(); }
  });
  ['pg', 'next', 'prev'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', function () { setTimeout(refreshBm, 100); }); });

  /* player ▶ with nothing chosen yet: start from the first ayah of this page */
  var ppb = $('pp');
  if (ppb) ppb.addEventListener('click', function (e) {
    if (typeof cur !== 'undefined' && cur) return;
    try {
      var a = fr.contentDocument.querySelector('.ayah');
      if (a) { e.stopImmediatePropagation(); setCur(+a.dataset.sura, +a.dataset.ayah, true); }
    } catch (x) {}
  }, true);
})();
