/* sira-story.js v2 — "ژیاننامەی تەواوی پێغەمبەر ﷺ": a continuous, long, chronological biography split into parts.
 * Content lives in sira-story-pN.js files that push {id,ku,intro,chapters:[{id,ku,body}]} onto window.__SIRA_STORY.
 * The text is written in Kurdish. In any other app language the interface, titles and every chapter are translated on demand
 * (chunked + cached) through the shared module window.__siL defined in sira-library.js.
 * The second part of this file adds "Download for offline" cards (hadith translations + the translated biography) for the
 * language that is selected in the app. */
(function () {
  if (window.__siraStoryV2) return;
  window.__siraStoryV2 = true;
  var S = window.__siL;
  if (!S) return;
  var $ = function (id) { return document.getElementById(id); };
  var POS = 'sira_story_pos_v1', SZ = 'sira_story_sz_v1';
  var PARTS_W = { en: 'parts', ar: 'أقسام', tr: 'bölüm', fa: 'بخش', ur: 'حصے', fr: 'parties', ru: 'частей', id: 'bagian' };
  var PLAN = [
    ['p1', 'یەکەم: جەزیرەی عەرەب و مەککە پێش ئیسلام'],
    ['p2', 'دووەم: نەسەب، لەدایکبوون و منداڵی'],
    ['p3', 'سێیەم: گەنجی و ژنهێنان بە خەدیجە'],
    ['p4', 'چوارەم: وەحی و بانگەوازی نهێنی'],
    ['p5', 'پێنجەم: بانگەوازی ئاشکرا و ئازاردانی موسڵمانان'],
    ['p6', 'شەشەم: ساڵی خەم، تائیف، ئیسراء و عەقەبە'],
    ['p7', 'حەوتەم: کۆچ بۆ مەدینە'],
    ['p8', 'هەشتەم: دامەزراندنی کۆمەڵگای مەدینە'],
    ['p9', 'نۆیەم: بەدر، ئوحود و خەندەق'],
    ['p10', 'دەیەم: حودەیبیە تا فەتحی مەککە'],
    ['p11', 'یازدەیەم: حونەین، تەبووک و وەفدەکان'],
    ['p12', 'دوازدەیەم: حەججەتولوداع و کۆچی دوایی'],
    ['p13', 'سێزدەیەم: ئەخلاق و شەمائلی پێغەمبەر ﷺ']
  ];
  window.__SIRA_PLAN = PLAN;
  var st = { view: 'home', part: null, ch: 0, size: 19, trKey: '', trText: '', trBusy: false, trErr: '', trProg: null, introKey: '', intro: '' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function parts() { var seen = {}; return (window.__SIRA_STORY || []).filter(function (p) { if (seen[p.id]) return false; seen[p.id] = 1; return true; }); }
  function getPart(id) { return parts().filter(function (p) { return p.id === id; })[0]; }
  function words(s) { return String(s || '').split(/\s+/).length; }
  /* title in the app language (Kurdish source until its translation arrives) */
  function nm(ku) { return S.isKu() ? ku : (S.tl(ku) || ku); }
  function active() { var v = $('siraStory'); return v && v.classList.contains('active'); }

  function css() {
    if ($('siraStoryCss')) return;
    var s = document.createElement('style'); s.id = 'siraStoryCss';
    s.textContent = [
      'body:has(#siraStory.active) .top{display:none!important}',
      '.phone:has(#siraStory.active) .status,.phone:has(#siraStory.active) .appbar,.phone:has(#siraStory.active) .bottom{display:none!important}',
      '.phone:has(#siraStory.active) .main{height:100%!important;padding:0!important;background:#f7f4ef}',
      '#siraStory{display:none!important}',
      '#siraStory.active{display:flex!important;flex-direction:column;height:100%;box-sizing:border-box}',
      '#siraStory .ss-head{padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#176b4b,#0f4d36);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px}',
      '#siraStory .ss-head h2{margin:0;font-size:17px}#siraStory .ss-head small{display:block;font-size:11px;opacity:.9;margin-top:2px}',
      '#siraStory .ss-b{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#siraStory .ss-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#siraStory .ss-item{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:12px 14px;margin-bottom:9px;cursor:pointer;text-align:start}',
      '#siraStory .ss-item b{display:block;font-size:15px;color:#173f35}',
      '#siraStory .ss-item small{color:#8a6a24;font-size:12px}',
      '#siraStory .ss-item.soon{opacity:.55;cursor:default}',
      '#siraStory .ss-text{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:16px;line-height:2.2;color:#2b2415;text-align:start}',
      '#siraStory .ss-text p{margin:0 0 14px}',
      '#siraStory .ss-text h3{margin:18px 0 8px;color:#176b4b;font-size:1.05em}',
      '#siraStory .ss-st{font-size:12px;color:#8a6a24;margin:6px 0 12px}',
      '#siraStory .ss-nav{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0}',
      '#siraStory .ss-nav button{border:1px solid #d8c68f;background:#fbf5e7;color:#5a4a1c;border-radius:10px;padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}',
      '#siraStory .ss-nav .pri{background:#176b4b;color:#fff;border-color:#176b4b}',
      '#siraStory .ss-note{font-size:11px;color:#8a7a4a;text-align:center;line-height:1.8;margin-top:10px}',
      '#siraStoryEntry{background:linear-gradient(135deg,#176b4b,#0f4d36)!important;color:#fff!important;border:0!important}#siraStoryEntry b,#siraStoryEntry small{color:#fff!important}'
    ].join('');
    document.head.appendChild(s);
  }
  function ensureView() {
    var main = document.querySelector('.main'); if (!main) return null;
    var v = $('siraStory'); if (v) return v;
    v = document.createElement('div'); v.id = 'siraStory'; v.className = 'view'; main.appendChild(v); return v;
  }

  function body(txt) {
    return String(txt).split(/\n\s*\n/).map(function (p) {
      p = p.trim(); if (!p) return '';
      if (p.indexOf('## ') === 0) return '<h3>' + esc(p.slice(3)) + '</h3>';
      return '<p>' + esc(p) + '</p>';
    }).join('');
  }

  /* the text area of the reading view (repainted while a translation streams in) */
  function paintText() {
    var box = $('ssText'); if (!box) return;
    var pr = getPart(st.part); if (!pr) return;
    var c = pr.chapters[st.ch];
    var h = '<h3 style="margin-top:0;font-size:1.15em">' + esc(nm(c.ku)) + '</h3>';
    if (S.isKu()) { box.innerHTML = h + body(c.body); return; }
    if (st.trText) h += body(st.trText);
    if (st.trBusy) h += '<div class="ss-st">' + esc(st.trProg ? S.U('tprog', { i: st.trProg[0], n: st.trProg[1] }) : S.U('tring')) + '</div>';
    else if (st.trErr) h += '<div class="ss-st">' + esc(S.U('trfail') + st.trErr) + '</div><div class="ss-nav"><button data-a="retry">' + esc(S.U('retry')) + '</button></div>';
    else if (st.trText) h += '<div class="ss-st">' + esc(S.U('ainote')) + '</div>';
    box.innerHTML = h;
  }

  function startTr() {
    if (S.isKu()) return;
    var pr = getPart(st.part); if (!pr) return;
    var c = pr.chapters[st.ch], id = 's:' + pr.id + ':' + st.ch, key = id + '|' + S.lang();
    st.trKey = key; st.trText = ''; st.trBusy = true; st.trErr = ''; st.trProg = null;
    paintText();
    S.trText(c.body, id, {
      progress: function (t, i, n) { if (st.trKey !== key) return; st.trText = t; st.trProg = [i, n]; paintText(); },
      cancelled: function () { return st.trKey !== key; }
    }).then(function (t) {
      if (st.trKey !== key) return; st.trText = t; st.trBusy = false; paintText();
    }, function (e) {
      if (st.trKey !== key || (e && e.message === 'cancelled')) return; st.trBusy = false; st.trErr = (e && e.message) || ''; paintText();
    });
  }

  /* translate the part introduction once per language */
  function startIntro(pt) {
    if (S.isKu() || !pt || !pt.intro) return;
    var key = pt.id + '|' + S.lang();
    if (st.introKey === key) return;
    st.introKey = key; st.intro = '';
    S.trText(pt.intro, 'i:' + pt.id, { cancelled: function () { return st.introKey !== key; } }).then(function (t) {
      if (st.introKey !== key) return; st.intro = t; if (active() && st.view === 'part') render();
    }, function () {});
  }

  function ensureTitles() {
    if (S.isKu()) return;
    var lines = [];
    PLAN.forEach(function (pl) { lines.push(pl[1]); });
    parts().forEach(function (p) { lines.push(p.ku); p.chapters.forEach(function (c) { lines.push(c.ku); }); });
    S.trLines(lines).then(function (ch) { if (ch && active()) { var b = $('ssBody'), top = b ? b.scrollTop : 0; render(); if ($('ssBody')) $('ssBody').scrollTop = top; } });
  }

  function render() {
    var v = ensureView(); if (!v) return;
    v.setAttribute('dir', S.rtl() ? 'rtl' : 'ltr');
    var title = S.U('ss_t'), sub = '', b = '';
    if (st.view === 'home') {
      var total = 0, chs = 0;
      parts().forEach(function (p) { chs += p.chapters.length; p.chapters.forEach(function (c) { total += words(c.body); }); });
      sub = S.U('ss_sub', { c: chs, w: total, p: parts().length, n: PLAN.length });
      var pos = jget(POS, null);
      if (pos && getPart(pos.p) && getPart(pos.p).chapters[pos.c]) b += '<div class="ss-item" style="border-color:#176b4b" data-a="open" data-p="' + pos.p + '" data-c="' + pos.c + '"><b>' + esc(S.U('ss_cont')) + '</b><small>' + esc(nm(getPart(pos.p).chapters[pos.c].ku)) + '</small></div>';
      PLAN.forEach(function (pl) {
        var p = getPart(pl[0]);
        b += p ? '<div class="ss-item" data-a="part" data-p="' + pl[0] + '"><b>' + esc(nm(pl[1])) + '</b><small>' + esc(S.U('ss_info', { c: p.chapters.length, w: p.chapters.reduce(function (a, c) { return a + words(c.body); }, 0) })) + '</small></div>'
          : '<div class="ss-item soon"><b>' + esc(nm(pl[1])) + '</b><small>' + esc(S.U('ss_soon')) + '</small></div>';
      });
      b += '<div class="ss-note">' + esc(S.U('ss_note')) + '</div>';
    } else if (st.view === 'part') {
      var pt = getPart(st.part); sub = nm(pt.ku);
      var intro = S.isKu() ? pt.intro : (st.intro || '');
      b += (intro ? '<div class="ss-text"><p>' + esc(intro) + '</p></div><div style="height:10px"></div>' : (pt.intro && !S.isKu() ? '<div class="ss-text"><p>' + esc(S.U('tring')) + '</p></div><div style="height:10px"></div>' : ''));
      pt.chapters.forEach(function (c, i) { b += '<div class="ss-item" data-a="open" data-p="' + pt.id + '" data-c="' + i + '"><b>' + (i + 1) + '. ' + esc(nm(c.ku)) + '</b><small>' + esc(S.U('ss_words', { w: words(c.body) })) + '</small></div>'; });
    } else {
      var pr = getPart(st.part); sub = nm(pr.ku) + ' · ' + (st.ch + 1) + '/' + pr.chapters.length;
      b += '<div class="ss-nav"><button data-a="prev"' + (st.ch <= 0 ? ' disabled' : '') + '>' + esc(S.U('sl_prev')) + '</button><button data-a="next"' + (st.ch >= pr.chapters.length - 1 ? ' disabled' : '') + '>' + esc(S.U('sl_next')) + '</button><button data-a="fs" data-d="2">A+</button><button data-a="fs" data-d="-2">A−</button></div>' +
        '<div class="ss-text" id="ssText" style="font-size:' + st.size + 'px"></div>' +
        '<div class="ss-nav">' + (st.ch < pr.chapters.length - 1 ? '<button class="pri" data-a="next">' + esc(S.U('ss_nextch')) + '</button>' : '<button class="pri" data-a="part" data-p="' + pr.id + '">' + esc(S.U('ss_topart')) + '</button>') + '</div>';
    }
    v.innerHTML = '<div class="ss-head"><div><h2>📖 ' + esc(title) + '</h2><small>' + esc(sub) + '</small></div><button type="button" class="ss-b" data-a="back">' + esc(st.view === 'home' ? S.U('back') : S.U('backs')) + '</button></div><div class="ss-body" id="ssBody">' + b + '</div>';
    if (st.view === 'read') paintText();
    if (st.view === 'part') startIntro(getPart(st.part));
  }

  function openCh(p, c) {
    var pt = getPart(p); if (!pt) return;
    st.view = 'read'; st.part = p; st.ch = Math.max(0, Math.min(pt.chapters.length - 1, c));
    jset(POS, { p: p, c: st.ch }); render(); var bd = $('ssBody'); if (bd) bd.scrollTop = 0;
    startTr();
  }
  function onClick(e) {
    var v = $('siraStory'); if (!v || !v.contains(e.target)) return;
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a');
    if (a === 'back') {
      st.trKey = '';
      if (st.view === 'read') { st.view = 'part'; render(); }
      else if (st.view === 'part') { st.view = 'home'; render(); }
      else if (typeof window.enterSeerah === 'function') window.enterSeerah();
      return;
    }
    if (a === 'part') { st.trKey = ''; st.view = 'part'; st.part = t.getAttribute('data-p'); render(); return; }
    if (a === 'open') return openCh(t.getAttribute('data-p'), Number(t.getAttribute('data-c')));
    if (a === 'prev') return openCh(st.part, st.ch - 1);
    if (a === 'next') return openCh(st.part, st.ch + 1);
    if (a === 'retry') return startTr();
    if (a === 'fs') { st.size = Math.max(15, Math.min(32, st.size + Number(t.getAttribute('data-d')))); jset(SZ, st.size); var bd = $('ssBody'), top = bd ? bd.scrollTop : 0; render(); if ($('ssBody')) $('ssBody').scrollTop = top; }
  }
  function enter() {
    css(); if (!ensureView()) return; st.size = jget(SZ, 19); st.view = 'home'; st.trKey = ''; st.introKey = '';
    if (typeof window.showView === 'function') window.showView('siraStory', S.U('ss_tt')); else if (typeof showView === 'function') showView('siraStory', S.U('ss_tt'));
    render(); ensureTitles();
  }
  window.enterSiraStory = enter;

  /* tile on the Seerah home grid; its text follows the app language */
  function inject() {
    var g = document.querySelector('#seerahView .sr-home-grid');
    if (!g) return;
    var d = g.querySelector('#siraStoryEntry');
    if (!d) { d = document.createElement('div'); d.className = 'sr-home-tile'; d.id = 'siraStoryEntry'; d.onclick = enter; g.insertBefore(d, g.firstChild); }
    var L = S.lang();
    if (d.getAttribute('data-l') !== L) {
      d.setAttribute('data-l', L);
      d.innerHTML = '<span>📖</span><b>' + esc(S.isKu() ? 'ژیاننامەی پێغەمبەر ﷺ' : S.U('ss_tt')) + '</b><small>' + (S.isKu() ? '١٣ بەش · بە درێژی' : PLAN.length + ' ' + esc(PARTS_W[L] || 'parts')) + '</small>';
    }
  }
  document.addEventListener('click', onClick);
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();

/* ===================== offline download cards, for the selected language ===================== */
(function () {
  if (window.__offV1) return;
  window.__offV1 = true;
  var S = window.__siL;
  if (!S) return;

  var OFF = {};
  OFF.ckb = {
    t: `داگرتن بۆ ئۆفلاین`, hs: `وەرگێڕانە مرۆڤییەکانی حەدیس ({l}) — قەبارەی گەورە، وای‌فای بەکاربهێنە`, ss: `ژیاننامە و ناونیشانەکان بە {l}، بۆ خوێندنەوە بێ ئینتەرنێت`,
    run: `… داگرتن {i} / {n}`, done: `✓ بۆ ئۆفلاین ئامادەیە`, stop: `ڕاگرتن`,
    limit: `ڕاگیرا (سنووری ڕۆژانە یان کێشەی تۆڕ). دووبارە کرتە بکە بۆ بەردەوامبوون.`, fail: `داگرتن سەرنەکەوت — ئینتەرنێتەکەت بپشکنە و دووبارە کرتە بکە.`
  };
  OFF.bad = OFF.ckb;
  OFF.en = {
    t: `Download for offline`, hs: `Hadith translations ({l}) — large download, use Wi-Fi`, ss: `The biography and its titles in {l}, for reading without internet`,
    run: `… Downloading {i} / {n}`, done: `✓ Available offline`, stop: `Stop`,
    limit: `Stopped (daily limit or network problem). Tap again to continue.`, fail: `Download failed — check your internet and tap again.`
  };
  OFF.ar = {
    t: `تحميل للاستخدام دون إنترنت`, hs: `ترجمات الحديث ({l}) — حجم كبير، استخدم الواي فاي`, ss: `السيرة وعناوينها بـ{l} للقراءة دون إنترنت`,
    run: `… جارٍ التحميل {i} / {n}`, done: `✓ متاح دون إنترنت`, stop: `إيقاف`,
    limit: `توقّف (بلوغ الحد اليومي أو مشكلة في الشبكة). اضغط مجددًا للمتابعة.`, fail: `فشل التحميل — تحقق من الإنترنت واضغط مجددًا.`
  };
  OFF.tr = {
    t: `Çevrimdışı için indir`, hs: `Hadis çevirileri ({l}) — büyük indirme, Wi-Fi kullanın`, ss: `Hayat hikâyesi ve başlıkları {l} dilinde, internetsiz okumak için`,
    run: `… İndiriliyor {i} / {n}`, done: `✓ Çevrimdışı kullanılabilir`, stop: `Durdur`,
    limit: `Durdu (günlük sınır veya ağ sorunu). Devam etmek için tekrar dokunun.`, fail: `İndirme başarısız — internetinizi kontrol edip tekrar dokunun.`
  };
  OFF.fa = {
    t: `دانلود برای استفاده آفلاین`, hs: `ترجمه‌های حدیث ({l}) — حجم زیاد، از وای‌فای استفاده کنید`, ss: `زندگی‌نامه و عنوان‌ها به {l} برای مطالعه بدون اینترنت`,
    run: `… در حال دانلود {i} / {n}`, done: `✓ آفلاین در دسترس است`, stop: `توقف`,
    limit: `متوقف شد (محدودیت روزانه یا مشکل شبکه). برای ادامه دوباره بزنید.`, fail: `دانلود ناموفق بود — اینترنت را بررسی کنید و دوباره بزنید.`
  };
  OFF.ur = {
    t: `آف لائن کے لیے ڈاؤن لوڈ`, hs: `احادیث کے تراجم ({l}) — بڑا ڈاؤن لوڈ، وائی فائی استعمال کریں`, ss: `سیرت اور اس کے عنوانات {l} میں، بغیر انٹرنیٹ پڑھنے کے لیے`,
    run: `… ڈاؤن لوڈ {i} / {n}`, done: `✓ آف لائن دستیاب`, stop: `روکیں`,
    limit: `رک گیا (روزانہ حد یا نیٹ ورک مسئلہ)۔ جاری رکھنے کے لیے دوبارہ دبائیں۔`, fail: `ڈاؤن لوڈ ناکام — انٹرنیٹ چیک کریں اور دوبارہ دبائیں۔`
  };
  OFF.fr = {
    t: `Télécharger pour le hors ligne`, hs: `Traductions des hadiths ({l}) — gros téléchargement, utilisez le Wi-Fi`, ss: `La biographie et ses titres en {l}, pour lire sans internet`,
    run: `… Téléchargement {i} / {n}`, done: `✓ Disponible hors ligne`, stop: `Arrêter`,
    limit: `Arrêté (limite quotidienne ou problème réseau). Touchez à nouveau pour continuer.`, fail: `Échec du téléchargement — vérifiez votre connexion et touchez à nouveau.`
  };
  OFF.ru = {
    t: `Скачать для офлайн`, hs: `Переводы хадисов ({l}) — большой объём, используйте Wi-Fi`, ss: `Жизнеописание и заголовки ({l}) для чтения без интернета`,
    run: `… Загрузка {i} / {n}`, done: `✓ Доступно офлайн`, stop: `Остановить`,
    limit: `Остановлено (дневной лимит или проблема сети). Нажмите снова, чтобы продолжить.`, fail: `Не удалось скачать — проверьте интернет и нажмите снова.`
  };
  OFF.id = {
    t: `Unduh untuk offline`, hs: `Terjemahan hadis ({l}) — unduhan besar, gunakan Wi-Fi`, ss: `Biografi dan judulnya dalam {l}, untuk dibaca tanpa internet`,
    run: `… Mengunduh {i} / {n}`, done: `✓ Tersedia offline`, stop: `Hentikan`,
    limit: `Berhenti (batas harian atau masalah jaringan). Ketuk lagi untuk melanjutkan.`, fail: `Unduhan gagal — periksa internet Anda dan ketuk lagi.`
  };
  var LN = { ckb: 'کوردی', bad: 'کوردی', ar: 'العربية', en: 'English', tr: 'Türkçe', fa: 'فارسی', ur: 'اردو', fr: 'Français', ru: 'Русский', id: 'Indonesia' };
  function T(k, o) {
    var v = (OFF[S.lang()] || OFF.en)[k]; if (v == null) v = OFF.en[k];
    return o ? String(v).replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }) : v;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function flag(kind, L) { try { return localStorage.getItem('off_' + kind + '_' + L) === '1'; } catch (e) { return false; } }
  function setFlag(kind, L) { try { localStorage.setItem('off_' + kind + '_' + L, '1'); } catch (e) {} }
  function clrFlag(kind, L) { try { localStorage.removeItem('off_' + kind + '_' + L); } catch (e) {} }

  /* ---- hadith editions (hadith-api): kept in the Cache API so they work without internet ---- */
  var CN = 'hadith-ed-v1', BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/';
  var BOOKS = ['nawawi', 'bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah'];
  var ED = { tr: 'tur', ur: 'urd', fr: 'fra', id: 'ind', ru: 'rus' };
  var EDB = {
    tur: 'abudawud,bukhari,ibnmajah,malik,muslim,nasai,nawawi,tirmidhi',
    urd: 'abudawud,bukhari,ibnmajah,malik,muslim,nasai,tirmidhi',
    fra: 'abudawud,bukhari,dehlawi,ibnmajah,malik,muslim,nasai,nawawi,qudsi',
    ind: 'abudawud,bukhari,ibnmajah,malik,muslim,nasai,tirmidhi',
    rus: 'abudawud,bukhari,muslim'
  };
  function edUrl(name) { return BASE + name + '.min.json'; }
  function hList(L) {
    var l = BOOKS.map(function (b) { return 'eng-' + b; }), p = ED[L];
    if (p) BOOKS.forEach(function (b) { if (EDB[p].split(',').indexOf(b) >= 0) l.push(p + '-' + b); });
    return l;
  }
  var origFetch = window.fetch ? window.fetch.bind(window) : null;
  if (origFetch && window.caches) {
    /* cache-first for the hadith editions (the smaller .min.json is used for the same data) */
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var m = url.match(/hadith-api@1\/editions\/([a-z]{3}-[a-z]+)(?:\.min)?\.json$/);
      if (!m) return origFetch(input, init);
      var u = edUrl(m[1]);
      return caches.open(CN).then(function (c) {
        return c.match(u).then(function (hit) {
          if (hit) return hit;
          return origFetch(u).then(function (r) { if (r && r.ok) { try { c.put(u, r.clone()); } catch (e) {} } return r; });
        });
      }).catch(function () { return origFetch(input, init); });
    };
  }

  var jobs = { h: { run: false, stop: false, i: 0, n: 0, msg: '' }, s: { run: false, stop: false, i: 0, n: 0, msg: '' } };

  function hJob() {
    var J = jobs.h, L = S.lang();
    if (J.run) { J.stop = true; return; }
    if (!origFetch || !window.caches) { J.msg = 'fail'; paint(); return; }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    var list = hList(L), i = 0;
    J.run = true; J.stop = false; J.i = 0; J.n = list.length; J.msg = ''; clrFlag('h', L); paint();
    caches.open(CN).then(function (c) {
      (function next() {
        if (J.stop) { J.run = false; J.msg = 'limit'; paint(); return; }
        if (i >= list.length) { J.run = false; setFlag('h', L); paint(); return; }
        var u = edUrl(list[i]);
        c.match(u).then(function (hit) {
          if (hit) return;
          return origFetch(u).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return c.put(u, r); });
        }).then(function () { i++; J.i = i; paint(); next(); }, function () { J.run = false; J.msg = 'fail'; paint(); });
      })();
    }, function () { J.run = false; J.msg = 'fail'; paint(); });
  }

  /* ---- the translated biography: titles + every chapter, resumable (everything is cached piece by piece) ---- */
  function parts() { var seen = {}; return (window.__SIRA_STORY || []).filter(function (p) { if (seen[p.id]) return false; seen[p.id] = 1; return true; }); }
  function sJob() {
    var J = jobs.s, L = S.lang();
    if (J.run) { J.stop = true; return; }
    if (S.isKu()) return;
    var items = [], lines = [];
    (window.__SIRA_PLAN || []).forEach(function (pl) { lines.push(pl[1]); });
    parts().forEach(function (p) {
      lines.push(p.ku);
      if (p.intro) items.push({ t: p.intro, id: 'i:' + p.id });
      p.chapters.forEach(function (c, ci) { lines.push(c.ku); items.push({ t: c.body, id: 's:' + p.id + ':' + ci }); });
    });
    var i = 0;
    J.run = true; J.stop = false; J.i = 0; J.n = items.length; J.msg = ''; clrFlag('s', L); paint();
    function end(msg) { J.run = false; J.msg = msg; paint(); }
    S.trLines(lines).then(function () {}, function () {}).then(function () {
      (function next() {
        if (J.stop) return end('limit');
        if (i >= items.length) { J.run = false; setFlag('s', L); paint(); return; }
        S.trText(items[i].t, items[i].id, { cancelled: function () { return J.stop; } }).then(function () {
          i++; J.i = i; paint(); next();
        }, function (e) { end(e && e.message === 'cancelled' ? 'limit' : 'limit'); });
      })();
    });
  }

  /* ---- the cards ---- */
  function cardHTML(kind) {
    var J = jobs[kind], L = S.lang(), done = flag(kind, L);
    var l = kind === 'h' ? (ED[L] ? LN[L] : LN.en) : LN[L];
    var h = '<b>⬇ ' + esc(T('t')) + '</b><small>' + esc(T(kind === 'h' ? 'hs' : 'ss', { l: l })) + '</small>';
    if (J.run) {
      var pct = J.n ? Math.round(100 * J.i / J.n) : 0;
      h += '<div style="height:5px;background:#e4d5ad;border-radius:3px;margin-top:8px"><div style="height:5px;width:' + pct + '%;background:#176b4b;border-radius:3px"></div></div>' +
        '<small style="display:block;margin-top:4px">' + esc(T('run', { i: J.i, n: J.n })) + ' · ' + esc(T('stop')) + '</small>';
    } else if (J.msg) h += '<small style="display:block;margin-top:6px;color:#a33">' + esc(T(J.msg)) + '</small>';
    else if (done) h += '<small style="display:block;margin-top:6px;color:#176b4b">' + esc(T('done')) + '</small>';
    return h;
  }
  function paint() {
    var a = document.getElementById('offH'), b = document.getElementById('offS');
    if (a) a.innerHTML = cardHTML('h');
    if (b) b.innerHTML = cardHTML('s');
  }
  function inject() {
    var L = S.lang();
    var hb = document.querySelector('#hadithView.active .hd-body');
    if (hb && hb.querySelector('.hd-chips') && !document.getElementById('offH') && L !== 'ar') {
      var d = document.createElement('div'); d.id = 'offH'; d.className = 'hd-card'; d.setAttribute('data-off', 'h'); d.innerHTML = cardHTML('h');
      var bm = hb.querySelector('.hd-card[data-act="bm"]');
      if (bm) hb.insertBefore(d, bm); else hb.appendChild(d);
    }
    var sb = document.querySelector('#siraStory.active #ssBody');
    if (sb && sb.querySelector('.ss-note') && !document.getElementById('offS') && !S.isKu()) {
      var e = document.createElement('div'); e.id = 'offS'; e.className = 'ss-item'; e.setAttribute('data-off', 's'); e.innerHTML = cardHTML('s');
      sb.insertBefore(e, sb.querySelector('.ss-note'));
    }
  }
  document.addEventListener('click', function (ev) {
    var c = ev.target.closest ? ev.target.closest('[data-off]') : null; if (!c) return;
    if (c.getAttribute('data-off') === 'h') hJob(); else sJob();
  });
  function start() { new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
