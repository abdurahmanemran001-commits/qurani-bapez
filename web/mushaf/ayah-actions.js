/* Ayah toolbar for the reader. Loaded from language-ui.js (served as mushaf/ayah-actions.js).
   Tap an ayah   -> floating toolbar above it: bookmark, share, tafsir, play & continue.
   Tap elsewhere -> show / hide the reciter player (bottom); if the toolbar is open it just closes. */
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

  /* ---------- styles ---------- */
  var st = document.createElement('style');
  st.textContent = [
    /* no blue selection / tap flash on the page */
    '#mushaf,#mushaf *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}',
    '#mushaf ::selection,#mushaf::selection{background:transparent}',
    '#mushaf{touch-action:manipulation}',
    /* player at the bottom */
    '#madaniPlayer{position:fixed!important;top:auto!important;bottom:calc(10px + env(safe-area-inset-bottom));left:8px;right:8px;z-index:35;margin:0!important;box-shadow:0 8px 24px #0005}',
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
    '#tafsirPanel .tp-body{flex:1;overflow:auto;padding:12px 14px calc(16px + env(safe-area-inset-bottom));white-space:pre-wrap;line-height:2;font-size:17px;color:#18231f;-webkit-user-select:text;user-select:text}'
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

  function clean(h) {
    if (!h) return '';
    try {
      var d = new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>|<\/p>|<\/div>|<\/h\d>/gi, '\n'), 'text/html');
      return (d.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
    } catch (e) { return ''; }
  }

  function bmKey(s, a) { return s + ':' + a; }
  function bmList() { try { return JSON.parse(localStorage.getItem('ayah_bookmarks') || '[]'); } catch (e) { return []; } }
  function bmHas(s, a) { return bmList().indexOf(bmKey(s, a)) >= 0; }
  function bmToggle(s, a) {
    var l = bmList(), k = bmKey(s, a), i = l.indexOf(k), on;
    if (i >= 0) { l.splice(i, 1); on = false; } else { l.push(k); on = true; }
    try { localStorage.setItem('ayah_bookmarks', JSON.stringify(l)); } catch (e) {}
    return on;
  }

  /* ---------- toolbar ---------- */
  var ICON = {
    bm0: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
    bm1: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.7l7.4-4.4M8.3 13.3l7.4 4.4" fill="none"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg>'
  };

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
    var top = 1e9, bottom = -1e9, cx = 0;
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.top < top) { top = r.top; cx = (r.left + r.right) / 2; }
      if (r.bottom > bottom) bottom = r.bottom;
    }
    return { top: top, bottom: bottom, cx: cx };
  }

  function placeBar() {
    var a = anchorRect(); if (!a || !bar) return;
    var w = bar.offsetWidth, h = bar.offsetHeight, gap = 12;
    var left = Math.max(8, Math.min(window.innerWidth - w - 8, a.cx - w / 2));
    var up = a.top - h - gap >= 8;
    var top = up ? a.top - h - gap : a.bottom + gap;
    bar.style.left = left + 'px';
    bar.style.top = top + 'px';
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

  /* ---------- tafsir ---------- */
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
    var ed = $('tpSel').value, body = $('tpBody'), seq = ++tafSeq;
    body.dir = RTL[SLUG[ed]] ? 'rtl' : 'ltr';
    body.textContent = tr('loading');
    fetch(BASE + ed + '/' + tafAyah.sura + '/' + tafAyah.ayah + '.json').then(function (r) {
      if (!r.ok) throw 0; return r.json();
    }).then(function (j) {
      if (seq !== tafSeq) return;
      body.textContent = clean(j && j.text) || tr('na');
      body.scrollTop = 0;
    }).catch(function () { if (seq === tafSeq) body.textContent = tr('na'); });
  }

  function openTafsir(s, a) {
    buildPanel();
    tafAyah = { sura: s, ayah: a };
    $('tpTitle').textContent = tr('tafsir') + ' · ' + surahName(s) + ' : ' + a;
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
    try { window.__madani.togglePlayer(); } catch (e) {}
  }
  window.__onBlankTap = blankTap;

  /* taps on the page area outside the ayah overlay (margins) behave like a blank tap */
  var m = $('mushaf');
  if (m) {
    m.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('#madaniOverlay')) return;
      blankTap();
    });
  }

  /* page changed: close the toolbar */
  var img = $('pageImg');
  if (img && window.MutationObserver) {
    new MutationObserver(function () { if (barOpen()) closeBar(false); }).observe(img, { attributes: true, attributeFilter: ['src'] });
  }
  window.addEventListener('resize', function () { if (barOpen() && sel) placeBar(); });
})();
