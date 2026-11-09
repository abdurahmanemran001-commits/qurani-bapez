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
    try { window.__bmChanged && window.__bmChanged(); } catch (e) {}
    return on;
  }
  function pageBmHas(p) { return getJSON('page_bookmarks').indexOf(p) >= 0; }
  function pageBmToggle(p) {
    var l = getJSON('page_bookmarks'), i = l.indexOf(p), on;
    if (i >= 0) { l.splice(i, 1); on = false; } else { l.push(p); on = true; }
    setJSON('page_bookmarks', l);
    try { window.__bmChanged && window.__bmChanged(); } catch (e) {}
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
    '#hdTf,#hdBm{flex:0 0 auto;min-width:38px}',
    '#hdBm svg{width:22px;height:22px;display:block;margin:auto}',
    'header>button:not(#home):not(#hdTf):not(#hdBm),header>#pg,header>#sura{display:none!important}',
    '#hdInfo{flex:1;text-align:center;color:#fff;font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:rtl}',
    '#sura,#lib{position:fixed;z-index:32;left:8px;margin:0;max-width:46vw;box-shadow:0 4px 14px #0003}',
    '#lib{top:62px}',
    '#sura{top:108px;width:46vw;min-width:0}',
    'header{flex-wrap:nowrap}'
  ].join('\n');
  document.head.appendChild(st2);

  var app = $('app'), fr = $('f'), bar = null, sel = null;
  function uiOn() { return app.classList.contains('ui'); }
  function setUI(on) { app.classList.toggle('ui', !!on); if (on) refreshBm(); }
  function refreshBm() { var b = $('hdBm'); if (b) b.innerHTML = pageBmHas(curPage()) ? ICON.bmd1 : ICON.bmd0; }

  var hd = document.querySelector('header');
  if (hd) {
    var b1 = document.createElement('button'); b1.id = 'hdTf'; b1.type = 'button'; b1.textContent = '📖';
    var b2 = document.createElement('button'); b2.id = 'hdBm'; b2.type = 'button';
    var home = $('home');
    if (home && home.nextSibling) { hd.insertBefore(b2, home.nextSibling); hd.insertBefore(b1, home.nextSibling); } else { hd.appendChild(b1); hd.appendChild(b2); }
    b1.onclick = function () { openPageTafsir(); };
    b2.onclick = function () { var on = pageBmToggle(curPage()); refreshBm(); toast(on ? tr('bm1') : tr('bm0')); };
    var inf = document.createElement('div'); inf.id = 'hdInfo'; hd.appendChild(inf);
    var lastP = 0;
    function info() {
      var p = curPage(); if (p === lastP && inf.textContent) return; lastP = p;
      var nm = '';
      try { if (typeof S !== 'undefined' && S && typeof N !== 'undefined') { var i = 0; for (var k = 0; k < S.length; k++) if (S[k] <= p) i = k; nm = N[i]; } } catch (e) {}
      inf.textContent = (nm ? nm + ' · ' : '') + 'پەڕەی ' + p;
    }
    setInterval(info, 300); info();
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
  function openBar(s, a, r, srcF) {
    buildBar(); sel = { sura: s, ayah: a };
    $('abBm').innerHTML = bmHas(s, a) ? ICON.bm1 : ICON.bm0;
    var o = (srcF || fr).getBoundingClientRect();
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
    if (d.hold && !overlaysOpen()) {
      var sf = null; if (typeof cs !== 'undefined' && cs) Array.prototype.forEach.call(cs.children, function (x) { if (x.contentWindow === e.source) sf = x; });
      asStop(); openBar(d.hold[0], d.hold[1], d.rect, sf);
    }
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
  /* ayah tint refresh + page-bookmark ribbon (different look from ayah bookmarks) */
  var rb = document.createElement('div'); rb.id = 'pgRibbon';
  rb.style.cssText = 'position:fixed;top:0;right:14px;width:22px;height:38px;background:#c0392b;z-index:25;display:none;clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%);pointer-events:none';
  document.body.appendChild(rb);
  var _rf = refreshBm;
  refreshBm = function () { _rf(); rb.style.display = pageBmHas(curPage()) ? 'block' : 'none'; };
  window.__bmChanged = function () { try { fr.contentWindow.applyBm(); } catch (e) {} refreshBm(); };
  refreshBm();
  /* ================= continuous reading + auto-scroll: hold the button and the pages glide down; speed adjustable ================= */
  var ASP = [12, 25, 45, 70, 105, 150, 220], asLv = 2, asRun = false, asLatch = false, asT0 = 0, asLast = 0, asAcc = 0, asRaf = 0, cs = null, csLast = 0;
  try { var q0 = parseInt(localStorage.getItem('as_speed'), 10); if (q0 >= 0 && q0 < ASP.length) asLv = q0; } catch (e) {}
  var asCss = document.createElement('style');
  asCss.textContent = '#csWrap{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2;overflow-y:auto;overflow-x:hidden;background:#fffdf5;-webkit-overflow-scrolling:touch}#csWrap iframe{display:block;width:100%;border:0;border-bottom:2px solid #e3d8b8}' +
    '#asBox{position:fixed;right:8px;bottom:8px;z-index:31;display:none;flex-direction:row;gap:5px;align-items:center;touch-action:none;background:rgba(0,0,0,.35);padding:4px 6px;border-radius:26px}#app.ui ~ #asBox{display:flex}' +
    '#asBox button{width:34px;height:34px;border:0;border-radius:50%;background:rgba(27,107,75,.95);color:#fff;font-size:17px;font-weight:700;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none;padding:0}' +
    '#asGo{width:44px!important;height:44px!important;font-size:22px!important;background:#ffd54f!important;color:#173f35!important}#asGo.on{background:#e67e22!important;color:#fff!important}#asExit{display:none;background:rgba(120,30,30,.9)!important}#asBox.cs #asExit{display:block}' +
    '#asLv{color:#fff;font-size:11px;min-width:26px;text-align:center}';
  document.head.appendChild(asCss);
  var asBox = document.createElement('div'); asBox.id = 'asBox';
  asBox.innerHTML = '<button type="button" id="asExit" aria-label="exit">✕</button><button type="button" id="asDn">－</button><span id="asLv"></span><button type="button" id="asUp">＋</button><button type="button" id="asGo" aria-label="auto scroll">⬇</button>';
  document.body.appendChild(asBox);
  function asLabel() { $('asLv').textContent = (asLv + 1) + '/' + ASP.length; try { localStorage.setItem('as_speed', String(asLv)); } catch (e) {} }
  asLabel();
  setInterval(function () { var pl = $('pl'), h = pl && getComputedStyle(pl).display !== 'none' ? pl.offsetHeight : 0; asBox.style.bottom = (h + 8) + 'px'; }, 400);

  function csUrl(p) { var bp = baseFor(mode); return 'view.html?m=' + mode + '&p=' + p + (bp ? '&b=' + encodeURIComponent(bp) : ''); }
  function csAdd() { var n = csLast + 1; if (n > 604) return false; csLast = n; var fx = document.createElement('iframe'); fx.dataset.p = n; fx.style.height = Math.round(window.innerWidth * 1.62) + 'px'; fx.src = csUrl(n); cs.appendChild(fx); return true; }
  function csEnter() {
    if (cs) return true;
    if (baseFor(mode) === null) return false;
    cs = document.createElement('div'); cs.id = 'csWrap'; document.body.appendChild(cs);
    csLast = page - 1; for (var i = 0; i < 3; i++) csAdd();
    cs.addEventListener('scroll', csScroll, { passive: true });
    window.__csMode = true; asBox.classList.add('cs'); closeBar(false);
    return true;
  }
  function csScroll() {
    var mid = cs.scrollTop + cs.clientHeight / 2, ifr = cs.children, cur2 = page;
    for (var i = 0; i < ifr.length; i++) { var t = ifr[i].offsetTop; if (t <= mid && mid < t + ifr[i].offsetHeight) { cur2 = +ifr[i].dataset.p; break; } }
    if (cur2 !== page) { page = cur2; try { sv('p', page); } catch (e) {} refreshBm(); }
    if (cs.scrollTop + cs.clientHeight * 2.2 > cs.scrollHeight) csAdd();
  }
  function csExit() { asStop(); if (!cs) return; cs.remove(); cs = null; window.__csMode = false; asBox.classList.remove('cs'); show(); }
  $('asExit').onclick = csExit;

  function asTick(t) {
    if (!asRun || !cs) return;
    var dt = Math.min(0.05, (t - asLast) / 1000); asLast = t;
    asAcc += ASP[asLv] * dt; var step = Math.floor(asAcc);
    if (step > 0) {
      asAcc -= step; var before = cs.scrollTop; cs.scrollTop = before + step;
      if (cs.scrollTop === before && !csAdd()) { asStop(); return; }
    }
    asRaf = requestAnimationFrame(asTick);
  }
  function asStart() { if (asRun) return; if (!csEnter()) return; asRun = true; asAcc = 0; asLast = performance.now(); $('asGo').classList.add('on'); asRaf = requestAnimationFrame(asTick); }
  function asStop() { asRun = false; asLatch = false; cancelAnimationFrame(asRaf); var g = $('asGo'); if (g) { g.classList.remove('on'); g.textContent = '⬇'; } }
  var goB = $('asGo');
  goB.addEventListener('pointerdown', function (e) { e.preventDefault(); try { goB.setPointerCapture(e.pointerId); } catch (x) {} if (asLatch) { asStop(); asT0 = -1; return; } asT0 = Date.now(); asStart(); });
  goB.addEventListener('pointerup', function () { if (asT0 < 0) { asT0 = 0; return; } if (!asRun) return; if (Date.now() - asT0 < 250) { asLatch = true; goB.textContent = '⏸'; } else if (!asLatch) asStop(); });
  goB.addEventListener('pointercancel', function () { if (!asLatch) asStop(); });
  goB.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  $('asUp').onclick = function () { asLv = Math.min(ASP.length - 1, asLv + 1); asLabel(); };
  $('asDn').onclick = function () { asLv = Math.max(0, asLv - 1); asLabel(); };
  /* ================= repeat (each ayah N times / range of ayahs) for every reciter type ================= */
  var REP = { mode: 'off', count: 3, gap: 0, n: 0, from: null, to: null }, repTimer = 0, repBusy = false;
  try { var rc0 = JSON.parse(localStorage.getItem('rep_cfg') || '{}'); if (rc0.count != null) REP.count = rc0.count; if (rc0.gap != null) REP.gap = rc0.gap; } catch (e) {}
  function repSave() { try { localStorage.setItem('rep_cfg', JSON.stringify({ count: REP.count, gap: REP.gap })); } catch (e) {} }
  var repBtn = document.createElement('button'); repBtn.id = 'prp'; repBtn.type = 'button'; repBtn.textContent = '🔁';
  var plx = $('px'); if (plx && plx.parentNode) plx.parentNode.insertBefore(repBtn, plx);
  function repLabel() { repBtn.textContent = REP.mode === 'off' ? '🔁' : '🔁' + (REP.count ? '×' + REP.count : '∞'); }
  function repeatTarget(sura, ayah) {
    if (REP.mode === 'off') return null;
    var inf = REP.count === 0;
    if (REP.mode === 'ayah') { if (inf || REP.n < REP.count - 1) { REP.n++; return ayah; } REP.n = 0; return null; }
    if (REP.mode === 'range' && REP.from && REP.to && REP.from.s === sura && ayah === REP.to.a) {
      if (inf || REP.n < REP.count - 1) { REP.n++; return REP.from.a; }
      REP.n = 0; return 'stop';
    }
    return null;
  }
  function qIdx() { return (mode === 'k' && typeof QM !== 'undefined' && QM) ? (cq || h2q(cur[0], cur[1])) : cur[1]; }
  function repEntries() {
    try {
      if (typeof isG === 'function' && isG() && TT[mode] && TT[mode][cur[0]]) return TT[mode][cur[0]].map(function (x) { return { a: x[0], st: x[1], en: x[2] }; });
      if (typeof isGaplessRec === 'function' && isGaplessRec() && window.__aySegs) { var l = window.__aySegs(cur[0], au.duration); return l ? l.map(function (x) { return { a: x[0], st: x[1] * 1000, en: x[2] * 1000 }; }) : null; }
    } catch (e) {}
    return null;
  }
  function repGo(fn) { repBusy = true; clearTimeout(repTimer); if (REP.gap > 0) { try { au.pause(); } catch (e) {} repTimer = setTimeout(function () { fn(); repBusy = false; }, REP.gap * 1000); } else { fn(); setTimeout(function () { repBusy = false; }, 250); } }
  function repSeekTo(list, t) {
    for (var i = 0; i < list.length; i++) if (list[i].a === t) { var ms = list[i].st; repGo(function () { au.currentTime = ms / 1000; var pr = au.play(); if (pr && pr.catch) pr.catch(function () {}); }); return true; }
    return false;
  }
  /* gapless: jump back just before the next ayah begins */
  setInterval(function () {
    if (REP.mode === 'off' || repBusy || !playing || !cur) return;
    var list = repEntries(); if (!list) return;
    var qi = qIdx(), e = null; for (var i = 0; i < list.length; i++) if (list[i].a === qi) { e = list[i]; break; }
    if (!e) return;
    var ms = au.currentTime * 1000;
    if (ms >= e.en - 90 && ms < e.en + 500) {
      var t = repeatTarget(cur[0], (mode === 'k' && typeof QM !== 'undefined' && QM) ? cur[1] : qi);
      if (t === 'stop') { au.pause(); bad(); repBusy = true; setTimeout(function () { repBusy = false; }, 300); return; }
      if (typeof t === 'number') repSeekTo(list, (mode === 'k' && typeof QM !== 'undefined' && QM) ? qi : t);
    }
  }, 60);
  /* ayah-by-ayah files and the end of a gapless file */
  var prevEnded = au.onended;
  au.onended = function () {
    if (REP.mode !== 'off' && cur) {
      var s0 = cur[0], a0 = cur[1], t = repeatTarget(s0, a0), list = repEntries();
      if (t === 'stop') { bad(); return; }
      if (typeof t === 'number') {
        if (list) { if (repSeekTo(list, (mode === 'k' && typeof QM !== 'undefined' && QM) ? qIdx() : t)) return; }
        else { repGo(function () { if (t === a0) { au.currentTime = 0; var pr = au.play(); if (pr && pr.catch) pr.catch(function () {}); } else setCur(s0, t, true); }); return; }
      }
    }
    if (typeof prevEnded === 'function') return prevEnded.apply(this, arguments);
  };
  [pa, pn].forEach(function (b) { if (b) b.addEventListener('click', function () { REP.n = 0; }, true); });

  function openRepeat() {
    if (!cur) { toast('...'); return; }
    var ov = $('repSheet'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'repSheet';
    ov.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:99990;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center';
    var cs0 = { sura: cur[0], ayah: cur[1] }, maxA = CC(cs0.sura) || 7, kMode = mode === 'k';
    var toDef = REP.to && REP.to.s === cs0.sura ? REP.to.a : Math.min(maxA, cs0.ayah + 4);
    function chip(id, on, txt) { return '<span data-i="' + id + '" style="display:inline-block;padding:9px 13px;margin:3px;border-radius:12px;border:1px solid #cfe0d6;cursor:pointer;' + (on ? 'background:#1b6b4b;color:#fff' : 'background:#fff;color:#173f35') + '">' + txt + '</span>'; }
    var h = '<div style="width:100%;max-width:560px;background:#fff;color:#1b1b1b;border-radius:18px 18px 0 0;padding:14px 14px 22px;direction:rtl;max-height:85vh;overflow:auto;font-family:inherit">';
    h += '<b style="font-size:18px">دووبارەکردنەوە</b><div style="color:#666;font-size:13px;margin:4px 0 8px">ئایەتی ئێستا: ' + cs0.sura + ' : ' + cs0.ayah + '</div>';
    h += '<div>' + chip('m:off', REP.mode === 'off', 'کوژاوە') + chip('m:ayah', REP.mode === 'ayah', 'هەر ئایەتێک چەند جار') + (kMode ? '' : chip('m:range', REP.mode === 'range', 'دووبارەکردنەوەی چەند ئایەت')) + '</div>';
    h += '<div id="repRange" style="margin:8px 0;display:' + (REP.mode === 'range' ? 'block' : 'none') + '">لە ئایەتی <b>' + cs0.ayah + '</b> تا ئایەتی <input id="repTo" type="number" min="' + cs0.ayah + '" max="' + maxA + '" value="' + toDef + '" style="width:70px;padding:6px;border-radius:8px;border:1px solid #cfd8d3;font:inherit"> (لە ' + maxA + ')</div>';
    h += '<div style="margin-top:8px;font-weight:700">ژمارەی دووبارەکردنەوە</div><div>' + [2, 3, 5, 7, 10, 0].map(function (n) { return chip('c:' + n, REP.count === n, n ? n + '×' : '∞ بێکۆتا'); }).join('') + '</div>';
    h += '<div style="margin-top:8px;font-weight:700">وەستان لە نێوان دووبارەکان</div><div>' + [0, 1, 2, 3, 5].map(function (n) { return chip('g:' + n, REP.gap === n, n ? n + ' چرکە' : 'بێ وەستان'); }).join('') + '</div>';
    h += '<div style="margin-top:14px;text-align:center"><span id="repOk" style="display:inline-block;padding:11px 30px;border-radius:12px;background:#1b6b4b;color:#fff;font-weight:700;cursor:pointer">باشە</span></div></div>';
    ov.innerHTML = h; document.body.appendChild(ov);
    var m2 = REP.mode, c2 = REP.count, g2 = REP.gap;
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { ov.remove(); return; }
      var t = e.target.closest && e.target.closest('[data-i]');
      if (t) {
        var k = t.getAttribute('data-i').split(':');
        if (k[0] === 'm') m2 = k[1]; else if (k[0] === 'c') c2 = +k[1]; else g2 = +k[1];
        Array.prototype.forEach.call(ov.querySelectorAll('[data-i]'), function (x) {
          var q = x.getAttribute('data-i').split(':'), on = (q[0] === 'm' && q[1] === m2) || (q[0] === 'c' && +q[1] === c2) || (q[0] === 'g' && +q[1] === g2);
          x.style.background = on ? '#1b6b4b' : '#fff'; x.style.color = on ? '#fff' : '#173f35';
        });
        ov.querySelector('#repRange').style.display = m2 === 'range' ? 'block' : 'none';
        return;
      }
      if (e.target.id === 'repOk') {
        REP.mode = m2; REP.count = c2; REP.gap = g2; REP.n = 0; repSave(); clearTimeout(repTimer); repBusy = false;
        if (m2 === 'range') { var to = Math.max(cs0.ayah, Math.min(maxA, +ov.querySelector('#repTo').value || cs0.ayah)); REP.from = { s: cs0.sura, a: cs0.ayah }; REP.to = { s: cs0.sura, a: to }; }
        else { REP.from = null; REP.to = null; }
        repLabel(); ov.remove();
      }
    });
  }
  repBtn.onclick = openRepeat;
})();
