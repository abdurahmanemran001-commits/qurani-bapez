/* Reader extras. Loaded from language-ui.js (served as mushaf/ayah-actions.js).
   - Page fills the whole screen.
   - Tap an ayah   -> floating toolbar above it: bookmark, share, tafsir, play & continue.
   - Tap elsewhere -> top buttons (back, tafsir of the whole surah, bookmark this page) + player at the bottom;
                      tap again to hide them. If the toolbar is open the tap just closes it. */
(function () {
  if (window.__ayahActionsInstalled) return;
  window.__ayahActionsInstalled = true;

  var T = {
    ckb: { bm1: 'نیشانکرا', bm0: 'نیشانەکە لابرا', copied: 'کۆپی کرا', fail: 'سەرکەوتوو نەبوو', tafsir: 'تەفسیر', loading: 'بارکردن...', na: 'ئەم تەفسیرە بۆ ئەم ئایەتە بەردەست نییە.', close: 'داخستن', note: '' },
    bad: { bm1: 'نیشانکرا', bm0: 'نیشانەکە لابرا', copied: 'کۆپی کرا', fail: 'سەرکەوتوو نەبوو', tafsir: 'تەفسیر', loading: 'بارکردن...', na: 'ئەڤ تەفسیرە بۆ ڤی ئایەتی نینە.', close: 'داخستن', note: 'تەفسیرا بادینی نینە؛ تەفسیرێن کوردی و عەرەبی دهێنە نیشاندان.' },
    ar: { bm1: 'تمت الإشارة', bm0: 'أُزيلت الإشارة', copied: 'تم النسخ', fail: 'تعذّر التنفيذ', tafsir: 'التفسير', loading: 'جارٍ التحميل...', na: 'هذا التفسير غير متوفر لهذه الآية.', close: 'إغلاق', note: '' },
    en: { bm1: 'Bookmarked', bm0: 'Bookmark removed', copied: 'Copied', fail: 'Failed', tafsir: 'Tafsir', loading: 'Loading...', na: 'This tafsir is not available for this ayah.', close: 'Close', note: '' },
    tr: { bm1: 'İşaretlendi', bm0: 'İşaret kaldırıldı', copied: 'Kopyalandı', fail: 'Başarısız', tafsir: 'Tefsir', loading: 'Yükleniyor...', na: 'Bu tefsir bu ayet için mevcut değil.', close: 'Kapat', note: '' },
    fa: { bm1: 'نشانه‌گذاری شد', bm0: 'نشانه حذف شد', copied: 'کپی شد', fail: 'ناموفق', tafsir: 'تفسیر', loading: 'در حال بارگذاری...', na: 'این تفسیر برای این آیه موجود نیست.', close: 'بستن', note: '' },
    ur: { bm1: 'نشان زد کیا گیا', bm0: 'نشان ہٹا دیا گیا', copied: 'کاپی ہو گیا', fail: 'ناکام', tafsir: 'تفسیر', loading: 'لوڈ ہو رہا ہے...', na: 'یہ تفسیر اس آیت کے لیے دستیاب نہیں۔', close: 'بند کریں', note: '' },
    fr: { bm1: 'Ajouté aux signets', bm0: 'Signet retiré', copied: 'Copié', fail: 'Échec', tafsir: 'Tafsir', loading: 'Chargement…', na: 'Ce tafsir n’est pas disponible pour ce verset.', close: 'Fermer', note: '' },
    ru: { bm1: 'Добавлено в закладки', bm0: 'Закладка удалена', copied: 'Скопировано', fail: 'Не удалось', tafsir: 'Тафсир', loading: 'Загрузка…', na: 'Этот тафсир недоступен для этого аята.', close: 'Закрыть', note: '' },
    id: { bm1: 'Ditandai', bm0: 'Tanda dihapus', copied: 'Disalin', fail: 'Gagal', tafsir: 'Tafsir', loading: 'Memuat…', na: 'Tafsir ini tidak tersedia untuk ayat ini.', close: 'Tutup', note: '' }
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
  var SLUG = {};
  Object.keys(ED).forEach(function (g) { ED[g].forEach(function (e) { SLUG[e[0]] = g; }); });

  function lang() {
    var l = window.appLang;
    if (!l) { try { l = localStorage.getItem('app_language'); } catch (e) {} }
    return T[l] ? l : 'ckb';
  }
  function tr(k) { return T[lang()][k]; }
  function $(id) { return document.getElementById(id); }
  function curPage() { return (typeof currentPage !== 'undefined' && currentPage) || 1; }
  function readerActive() { var r = $('reader'); return !!(r && r.classList.contains('active')); }

  /* ---------- styles ---------- */
  var st = document.createElement('style');
  st.textContent = [
    /* no blue selection / tap flash on the page */
    '#mushaf,#mushaf *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}',
    '#mushaf ::selection,#mushaf::selection{background:transparent}',
    '#mushaf{touch-action:manipulation}',
    /* the page fills the whole screen */
    '.phone:has(#reader.active){background:#fff}',
    '.phone:has(#reader.active) .main{padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)!important;overflow:hidden!important;height:100%!important}',
    '.phone:has(#reader.active) #reader{height:100%}',
    '.phone:has(#reader.active) .mushaf{height:100%!important;min-height:0!important;padding:0!important;border-radius:0!important;background:#fff!important}',
    '.phone:has(#reader.active) .mushaf img{box-shadow:none!important;max-height:none!important}',
    /* player at the bottom */
    '#madaniPlayer{position:fixed!important;top:auto!important;bottom:calc(10px + env(safe-area-inset-bottom));left:8px;right:8px;z-index:35;margin:0!important;box-shadow:0 8px 24px #0005}',
    'body:not(:has(#reader.active)) #madaniPlayer,body:not(:has(#reader.active)) #readerTop,body:not(:has(#reader.active)) #ayahBar{display:none!important}',
    /* top round buttons */
    '#readerTop{position:fixed;top:calc(10px + env(safe-area-inset-top));left:0;right:0;z-index:36;display:none;justify-content:center;gap:16px;pointer-events:none}',
    '#readerTop.on{display:flex}',
    '#readerTop button{pointer-events:auto;width:48px;height:48px;border-radius:50%;border:0;background:#176b4b;display:grid;place-items:center;box-shadow:0 4px 14px #0005;cursor:pointer;padding:0}',
    '#readerTop button:active{transform:scale(.94)}',
    '#readerTop svg{width:24px;height:24px}',
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
    '#ayahToast{position:fixed;left:50%;bottom:calc(80px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;background:rgba(23,63,53,.92);color:#fff;border-radius:999px;padding:9px 18px;font-size:14px;display:none;max-width:90%;text-align:center}',
    /* tafsir panel */
    '#tafsirPanel{position:fixed;left:0;right:0;bottom:0;z-index:50;height:72vh;background:#fffdf5;border-radius:18px 18px 0 0;box-shadow:0 -10px 30px #0004;display:none;flex-direction:column;max-width:640px;margin:0 auto}',
    '#tafsirPanel.on{display:flex}',
    '#tafsirPanel .tp-head{display:flex;align-items:center;gap:8px;padding:12px;background:#176b4b;color:#fff;border-radius:18px 18px 0 0}',
    '#tafsirPanel .tp-title{flex:1;font-weight:bold;font-size:16px}',
    '#tafsirPanel .tp-x{border:0;border-radius:9px;padding:6px 12px;font:inherit;background:#e8f3ee;color:#173f35;cursor:pointer}',
    '#tafsirPanel select{margin:10px 12px 0;padding:10px;border:1px solid #dce5e1;border-radius:11px;background:#fff;font:inherit;color:#173f35}',
    '#tafsirPanel .tp-note{margin:6px 14px 0;color:#6d7975;font-size:12px}',
    '#tafsirPanel .tp-body{flex:1;overflow:auto;padding:12px 14px calc(16px + env(safe-area-inset-bottom));white-space:pre-wrap;line-height:2;font-size:17px;color:#18231f;-webkit-user-select:text;user-select:text}',
    '#tafsirPanel .tp-ay{margin:0 0 14px;padding-bottom:12px;border-bottom:1px solid #e8ece9}'
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
    try { if (typeof surahs !== 'undefined' && surahs[s - 1]) return surahs[s - 1][0]; } catch (e) {}
    return String(s);
  }
  function surahStart(s) {
    try { if (typeof surahs !== 'undefined' && surahs[s - 1]) return surahs[s - 1][3]; } catch (e) {}
    return 1;
  }

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

  /* ---------- page fills the screen ---------- */
  function fit() {
    try {
      var m = $('mushaf'), w = $('madaniWrap');
      if (!m || !w || !readerActive()) return;
      var aw = m.clientWidth, ah = m.clientHeight;
      if (!aw || !ah) return;
      var W = Math.floor(Math.min(aw, (ah * 1260) / 2038));
      w.style.width = W + 'px';
      w.style.margin = '0 auto';
      var ov = $('madaniOverlay'), img = $('pageImg');
      if (ov && img && img.offsetHeight) ov.style.height = img.offsetHeight + 'px';
    } catch (e) {}
  }
  function fitSoon() { fit(); setTimeout(fit, 150); setTimeout(fit, 500); setTimeout(fit, 1200); }

  /* ---------- icons ---------- */
  var ICON = {
    bm0: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
    bm1: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" fill="none"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>'
  };

  /* ---------- top round buttons ---------- */
  var top = null;
  function buildTop() {
    if (top) return top;
    top = document.createElement('div');
    top.id = 'readerTop';
    top.innerHTML = '<button type="button" id="rtBack">' + ICON.list + '</button><button type="button" id="rtTafsir">' + ICON.book + '</button><button type="button" id="rtBm"></button>';
    document.body.appendChild(top);
    $('rtBack').onclick = function () {
      showTop(false);
      try { window.__madani.pause(); window.__madani.togglePlayer(false); } catch (e) {}
      if (typeof goHome === 'function') goHome(); else history.back();
    };
    $('rtTafsir').onclick = function () {
      var s = 1;
      try { s = window.__madani.surahOfPage(curPage()); } catch (e) {}
      openTafsir(s, 0);
    };
    $('rtBm').onclick = function () {
      var on = pageBmToggle(curPage());
      $('rtBm').innerHTML = on ? ICON.bm1 : ICON.bm0;
      toast(on ? tr('bm1') : tr('bm0'));
    };
    return top;
  }
  function showTop(on) {
    buildTop();
    if (on && !readerActive()) on = false;
    if (on) $('rtBm').innerHTML = pageBmHas(curPage()) ? ICON.bm1 : ICON.bm0;
    top.className = on ? 'on' : '';
  }

  /* ---------- ayah toolbar ---------- */
  var bar = null, sel = null;

  function buildBar() {
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'ayahBar';
    bar.innerHTML = '<button type="button" id="abBm"></button><button type="button" id="abShare">' + ICON.share + '</button><button type="button" id="abTafsir">' + ICON.globe + '</button><button type="button" id="abPlay">' + ICON.play + '</button><div class="ab-arrow" id="abArrow"></div>';
    document.body.appendChild(bar);
    $('abBm').onclick = function () {
      if (!sel) return;
      var on = bmToggle(sel.sura, sel.ayah);
      $('abBm').innerHTML = on ? ICON.bm1 : ICON.bm0;
      toast(on ? tr('bm1') : tr('bm0'));
    };
    $('abShare').onclick = function () { if (sel) shareAyah(sel.sura, sel.ayah); };
    $('abTafsir').onclick = function () { if (sel) { var x = sel; closeBar(true); openTafsir(x.sura, x.ayah); } };
    $('abPlay').onclick = function () {
      var x = sel; if (!x) return;
      window.__madaniContinue = true;
      closeBar(true);
      window.__madani.play(x.sura, x.ayah);
      window.__madani.togglePlayer(true);
    };
    return bar;
  }

  function anchorRect() {
    var els = document.querySelectorAll('#madaniOverlay .ma-hl');
    if (!els.length) return null;
    var tp = 1e9, bottom = -1e9, cx = 0;
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.top < tp) { tp = r.top; cx = (r.left + r.right) / 2; }
      if (r.bottom > bottom) bottom = r.bottom;
    }
    return { top: tp, bottom: bottom, cx: cx };
  }

  function placeBar() {
    var a = anchorRect(); if (!a || !bar) return;
    var w = bar.offsetWidth, h = bar.offsetHeight, gap = 12;
    var left = Math.max(8, Math.min(window.innerWidth - w - 8, a.cx - w / 2));
    var up = a.top - h - gap >= 8;
    var tp = up ? a.top - h - gap : a.bottom + gap;
    bar.style.left = left + 'px';
    bar.style.top = tp + 'px';
    bar.className = 'on ' + (up ? 'up' : 'down');
    var ax = Math.max(14, Math.min(w - 14, a.cx - left)) - 9;
    $('abArrow').style.left = ax + 'px';
  }

  function openFor(s, a) {
    buildBar();
    sel = { sura: s, ayah: a };
    try { window.__madani.mark(s, a); } catch (e) {}
    $('abBm').innerHTML = bmHas(s, a) ? ICON.bm1 : ICON.bm0;
    bar.style.visibility = 'hidden';
    bar.className = 'on up';
    setTimeout(function () { placeBar(); bar.style.visibility = 'visible'; }, 0);
  }

  function closeBar(keepMark) {
    if (bar) { bar.className = ''; }
    sel = null;
    if (!keepMark) { try { window.__madani.clearMark(); } catch (e) {} }
  }

  function barOpen() { return !!(bar && bar.classList.contains('on')); }

  /* ---------- share ---------- */
  function stripMarks(x) { return x.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, ''); }

  function fetchAyahText(s, a) {
    return fetch('https://api.alquran.cloud/v1/ayah/' + s + ':' + a + '/quran-uthmani').then(function (r) {
      if (!r.ok) throw 0; return r.json();
    }).then(function (j) {
      var t = (j && j.data && j.data.text) || '';
      if (a === 1 && s !== 1 && s !== 9) {
        var w = t.split(' ');
        if (w.length > 4 && stripMarks(w[0]).indexOf('بسم') === 0 && stripMarks(w[1]).indexOf('لله') >= 0) t = w.slice(4).join(' ');
      }
      if (!t) throw 0;
      return t;
    });
  }

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

  /* ---------- tafsir (one ayah, or the whole surah when ayah is 0) ---------- */
  var panel = null, tafSeq = 0, tafAyah = null;

  function groups() {
    var l = lang(), own = l === 'bad' ? 'ckb' : l, g = [own];
    if (own !== 'ar') g.push('ar');
    if (own !== 'en') g.push('en');
    return g;
  }

  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'tafsirPanel';
    panel.innerHTML = '<div class="tp-head"><span class="tp-title" id="tpTitle"></span><button type="button" class="tp-x" id="tpX"></button></div><select id="tpSel"></select><div class="tp-note" id="tpNote"></div><div class="tp-body" id="tpBody"></div>';
    document.body.appendChild(panel);
    $('tpX').onclick = function () { panel.classList.remove('on'); tafSeq++; };
    $('tpSel').onchange = function () { try { localStorage.setItem('tafsir_edition', $('tpSel').value); } catch (e) {} loadTafsir(); };
    return panel;
  }

  function fillEditions() {
    var s = $('tpSel'), cur = s.value, saved = null;
    try { saved = localStorage.getItem('tafsir_edition'); } catch (e) {}
    s.innerHTML = '';
    groups().forEach(function (c) {
      var og = document.createElement('optgroup');
      og.label = LN[c];
      (ED[c] || []).forEach(function (e) {
        var o = document.createElement('option');
        o.value = e[0]; o.textContent = e[1];
        og.appendChild(o);
      });
      s.appendChild(og);
    });
    var want = cur || saved;
    if (want && SLUG[want] && s.querySelector('option[value="' + want + '"]')) s.value = want;
  }

  function loadTafsir() {
    if (!tafAyah) return;
    var ed = $('tpSel').value, body = $('tpBody'), seq = ++tafSeq, one = tafAyah.ayah > 0;
    body.dir = RTL[SLUG[ed]] ? 'rtl' : 'ltr';
    body.textContent = tr('loading');
    fetch(BASE + ed + '/' + tafAyah.sura + (one ? '/' + tafAyah.ayah : '') + '.json').then(function (r) {
      if (!r.ok) throw 0; return r.json();
    }).then(function (j) {
      if (seq !== tafSeq) return;
      if (one) { body.textContent = clean(j && j.text) || tr('na'); body.scrollTop = 0; return; }
      var arr = Array.isArray(j) ? j : ((j && (j.ayahs || j.tafsir)) || []);
      body.textContent = '';
      var any = false;
      arr.forEach(function (x, i) {
        var t = clean(x && x.text);
        if (!t) return;
        any = true;
        var d = document.createElement('div');
        d.className = 'tp-ay';
        var b = document.createElement('b');
        b.textContent = ((x && (x.ayah || x.number)) || i + 1) + ' · ';
        d.appendChild(b);
        d.appendChild(document.createTextNode(t));
        body.appendChild(d);
      });
      if (!any) body.textContent = tr('na');
      body.scrollTop = 0;
    }).catch(function () { if (seq === tafSeq) body.textContent = tr('na'); });
  }

  function openTafsir(s, a) {
    buildPanel();
    tafAyah = { sura: s, ayah: a || 0 };
    $('tpTitle').textContent = tr('tafsir') + ' · ' + surahName(s) + (a ? ' : ' + a : '');
    $('tpX').textContent = tr('close');
    $('tpNote').textContent = T[lang()].note || '';
    fillEditions();
    panel.classList.add('on');
    loadTafsir();
  }

  /* ---------- tap hooks used by madani-ayah.js ---------- */
  window.__onAyahTap = function (s, a) {
    if (panel && panel.classList.contains('on')) return;
    openFor(s, a);
  };

  function blankTap() {
    if (panel && panel.classList.contains('on')) return;
    if (barOpen()) { closeBar(false); return; }
    var on = false;
    try { on = window.__madani.togglePlayer(); } catch (e) {}
    showTop(on);
  }
  window.__onBlankTap = blankTap;

  /* taps on the page area outside the ayah overlay (margins) behave like a blank tap */
  var m = $('mushaf');
  if (m) {
    m.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('#madaniOverlay')) return;
      blankTap();
    });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(m);
  }

  /* page changed: close the toolbar, refit */
  var img = $('pageImg');
  if (img) {
    if (window.MutationObserver) {
      new MutationObserver(function () {
        if (barOpen()) closeBar(false);
        var tp = $('readerTop');
        if (tp && tp.classList.contains('on')) $('rtBm').innerHTML = pageBmHas(curPage()) ? ICON.bm1 : ICON.bm0;
        fitSoon();
      }).observe(img, { attributes: true, attributeFilter: ['src'] });
    }
    img.addEventListener('load', fitSoon);
  }
  window.addEventListener('resize', function () { if (barOpen() && sel) placeBar(); fitSoon(); });
  window.addEventListener('orientationchange', fitSoon);
  fitSoon();

  /* ---------- "نیشانکراوەکان" tab: explicit page + ayah bookmarks ---------- */
  function escH(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bmRow(title, sub, page) {
    return '<div class="surah" onclick="openPage(' + (+page || 1) + ')"><span class="num">★</span><div class="name"><b>' + escH(title) + '</b><small>' + escH(sub) + '</small></div><span class="arrow">‹</span></div>';
  }
  function hookBookmarkTab() {
    var o = window.renderSurahs;
    if (typeof o !== 'function' || o.__bmHooked) return;
    window.renderSurahs = function () {
      var ret = o.apply(this, arguments);
      try {
        if (typeof homeTab !== 'undefined' && homeTab === 'bookmark') {
          var html = '';
          getJSON('page_bookmarks').forEach(function (p) { html += bmRow('پەڕەی ' + p, 'پەڕە ' + p, p); });
          getJSON('ayah_bookmarks').forEach(function (k) {
            var x = String(k).split(':'), s = +x[0], a = +x[1], p = +x[2] || surahStart(s);
            html += bmRow(surahName(s) + ' : ' + a, 'پەڕە ' + p, p);
          });
          $('surahList').innerHTML = html || '<div class="card muted">هیچ نیشانکراوێک نییە.</div>';
        }
      } catch (e) {}
      return ret;
    };
    window.renderSurahs.__bmHooked = true;
  }
  hookBookmarkTab();
  var tries = 0, ti = setInterval(function () { hookBookmarkTab(); if (++tries > 20) clearInterval(ti); }, 250);
})();
