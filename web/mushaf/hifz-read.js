/* hifz-read.js — خوێندنەوە و لەبەرکردن لەسەر لاپەڕەی موسحەف (word by word, live).
   Real Madinah page in an iframe (mushaf/view.html). Words are followed by voice: current word is boxed, correct words
   turn green, mistakes turn red with a dotted line. "Hidden ayat" mode hides what has not been recited yet.
   Three views: mushaf page / Quran text / translation (any translator). */
(function () {
  if (window.__hifzRead) return; window.__hifzRead = true;
  var D = function () { return window.__hifzData; };
  var T = {
    ckb: { marks:'نیشانکراوەکان',mkPages:'لاپەڕەکان',mkAyahs:'ئایەتەکان',mkPage:'لاپەڕە',mkAyah:'ئایەت',mkNoP:'هێشتا لاپەڕەیەک نیشان نەکراوە.',mkNoA:'هێشتا ئایەتێک نیشان نەکراوە. ئایەتێک ڕابگرە و «نیشان» هەڵبژێرە.',hcol:'ڕەنگی هایلایت', recPick:'دەنگخوێن', rec:'گوێگرتن لە خوێندنەوە',recErr:'دەنگەکە نەهات — ئینتەرنێت بپشکنە', fmt:'ڕێکخستنی موسحەف',rmode:'شێوازی خوێندنەوە',mushafSub:'موسحەفی تەجویدی بە ڕەنگ',textSub:'دەقی قورئان بە قەبارەی گۆڕاو',trSub:'وەرگێڕان و نووسینی لاتینی',mtype:'جۆری موسحەف و خەت',madinah:'موسحەفی مەدینە',mmad:'موسحەفی تەجویدی',fontAr:'قەبارەی نووسین — قورئانی عەرەبی',fontTr:'قەبارەی نووسین — وەرگێڕان',tlOn:'نووسینی لاتینی (تەرانسلیتەرەیشن)',trOn:'نیشاندانی وەرگێڕان',trOf:'وەرگێڕان',back2:'گەڕانەوە', title: 'خوێندنەوە و لەبەرکردن', page: 'لاپەڕە', hidOn: 'ئایەتە شاراوەکان: چالاک', hidOff: 'ئایەتە شاراوەکان: ناچالاک', mist: 'هەڵە', acc: 'ڕاستی', view: 'شێوازی بینین', mushaf: 'موسحەف', text: 'دەقی قورئان', tr: 'وەرگێڕان', font: 'قەبارەی نووسین', trPick: 'وەرگێڕ', loadErr: 'لاپەڕەکە یان دەقەکە بار نەبوو. ئینتەرنێت بپشکنە.', nomic: 'ئەم وێبگەڕە پشتگیری ناسینەوەی دەنگ ناکات. Chrome بەکاربهێنە.', denied: 'مۆڵەتی مایکرۆفۆن نەدراوە.', net: 'ناسینەوەی دەنگ ئینتەرنێت دەوێت.', done: 'لاپەڕە تەواو بوو ✓', close: 'داخستن', hintW: 'وشەی دواتر', hintA: 'ئایەتەکە پیشان بدە', back: 'گەڕانەوە', trLoad: 'وەرگێڕان بار دەکرێت…', trNone: 'وەرگێڕان نەهات', search: 'گەڕان…', tap: 'مایک دابگرە و بخوێنە', taj: 'ڕەنگی تەجوید', gap: 'ڕێژەی نێوان دێڕەکان', aya: 'ئایەت', aListen: 'گوێ بگرە', aTr: 'وەرگێڕان', aTaf: 'تەفسیر', aBm: 'نیشانەی ئایەت زیاد بکە', aBmOff: 'نیشانەی ئایەت لابە', aSim: 'ئایەتە لێکچووەکان', aNoSim: 'ئایەتی لێکچوو نییە', aCopy: 'کۆپی', aShare: 'بڵاوکردنەوە', aFrom: 'لێرەوە دەست پێ بکە', aCopied: 'کۆپی کرا ✓', aTafNo: 'تەفسیر بەردەست نییە', aLoad: 'چاوەڕێ بکە…', asr: 'ناسینەوەی وردتر (مۆدێلی قورئان، ~٤٠MB)', asrOn: 'ناسینەوەی وردتر: چالاک', asrOff: 'ناسینەوەی وردتر: ناچالاک', asrLoad: 'مۆدێل دادەبەزێت', asrErr: 'مۆدێل دانەبەزی. ئینتەرنێت بپشکنە.', asrHint: 'یەکجار دادەبەزێت و دواتر بێ ئینتەرنێت کار دەکات.' },
    en: { marks:'Bookmarks',mkPages:'Pages',mkAyahs:'Ayahs',mkPage:'Page',mkAyah:'Ayah',mkNoP:'No pages bookmarked yet.',mkNoA:'No ayahs bookmarked yet. Hold an ayah and choose Bookmark.',hcol:'Highlight colour', recPick:'Reciter', rec:'Listen to recitation',recErr:'Audio unavailable — check internet', fmt:'Mushaf format',rmode:'Reading mode',mushafSub:'Colour-coded Tajweed Mushaf',textSub:'Resizable Quran text',trSub:'Translation & transliteration',mtype:'Mushaf type & font',madinah:'Madani Mushaf',mmad:'Tajweed Mushaf',fontAr:'Font size — Arabic Quran',fontTr:'Font size — translation',tlOn:'Transliteration',trOn:'Show translation',trOf:'Translation',back2:'Back', title: 'Read & memorise', page: 'Page', hidOn: 'Hidden ayat: on', hidOff: 'Hidden ayat: off', mist: 'Mistakes', acc: 'Accuracy', view: 'View', mushaf: 'Mushaf', text: 'Quran text', tr: 'Translation', font: 'Font size', trPick: 'Translator', loadErr: 'Could not load the page or text. Check your internet.', nomic: 'This browser has no voice recognition. Use Chrome.', denied: 'Microphone permission denied.', net: 'Voice recognition needs internet.', done: 'Page complete ✓', close: 'Close', hintW: 'Next word', hintA: 'Show the ayah', back: 'Back', trLoad: 'Loading translation…', trNone: 'Translation unavailable', search: 'Search…', tap: 'Tap the mic and recite', taj: 'Tajweed colours', gap: 'Line spacing', aya: 'Ayah', aListen: 'Listen', aTr: 'Translation', aTaf: 'Tafsir', aBm: 'Add bookmark', aBmOff: 'Remove bookmark', aSim: 'Similar ayat', aNoSim: 'No similar ayat', aCopy: 'Copy', aShare: 'Share', aFrom: 'Start from here', aCopied: 'Copied ✓', aTafNo: 'Tafsir unavailable', aLoad: 'Loading…', asr: 'High-accuracy mic (Quran model, ~40MB)', asrOn: 'High-accuracy mic: on', asrOff: 'High-accuracy mic: off', asrLoad: 'Downloading model', asrErr: 'Model download failed. Check your internet.', asrHint: 'Downloads once, then works offline.' },
    ar: { marks:'المحفوظات',mkPages:'الصفحات',mkAyahs:'الآيات',mkPage:'صفحة',mkAyah:'آية',mkNoP:'لا توجد صفحات محفوظة بعد.',mkNoA:'لا توجد آيات محفوظة بعد. اضغط مطولاً على آية واختر حفظ.',hcol:'لون التظليل', recPick:'القارئ', rec:'الاستماع للتلاوة',recErr:'تعذر تشغيل الصوت — تحقق من الإنترنت', fmt:'تنسيق المصحف',rmode:'وضع القراءة',mushafSub:'مصحف التجويد الملوّن',textSub:'نص قرآني بحجم قابل للتعديل',trSub:'ترجمة ونقل صوتي بالحروف اللاتينية',mtype:'تنسيق المصحف وخطه',madinah:'مصحف المدينة',mmad:'مصحف التجويد',fontAr:'حجم الخط — قرآن عربي',fontTr:'حجم الخط — ترجمة',tlOn:'نقل صوتي بالحروف اللاتينية',trOn:'عرض الترجمة',trOf:'الترجمة',back2:'رجوع', title: 'القراءة والحفظ', page: 'صفحة', hidOn: 'الآيات المخفية: مفعل', hidOff: 'الآيات المخفية: غير مفعل', mist: 'أخطاء', acc: 'الدقة', view: 'العرض', mushaf: 'مصحف', text: 'نص قرآني', tr: 'ترجمة', font: 'حجم الخط', trPick: 'المترجم', loadErr: 'تعذّر تحميل الصفحة أو النص. تحقق من الإنترنت.', nomic: 'المتصفح لا يدعم التعرف على الصوت. استخدم Chrome.', denied: 'تم رفض إذن الميكروفون.', net: 'التعرف على الصوت يحتاج إلى إنترنت.', done: 'اكتملت الصفحة ✓', close: 'إغلاق', hintW: 'الكلمة التالية', hintA: 'إظهار الآية', back: 'رجوع', trLoad: 'جارٍ تحميل الترجمة…', trNone: 'الترجمة غير متاحة', search: 'بحث…', tap: 'اضغط على الميكروفون واقرأ', taj: 'ألوان التجويد', gap: 'تباعد الأسطر', aya: 'الآية', aListen: 'استمع', aTr: 'ترجمة', aTaf: 'تفسير', aBm: 'أضف إشارة مرجعية', aBmOff: 'احذف الإشارة المرجعية', aSim: 'المتشابهات', aNoSim: 'لا توجد آيات متشابهة', aCopy: 'نسخ', aShare: 'شارك', aFrom: 'ابدأ من هنا', aCopied: 'تم النسخ ✓', aTafNo: 'التفسير غير متاح', aLoad: 'جارٍ التحميل…', asr: 'ميكروفون عالي الدقة (نموذج القرآن ~٤٠MB)', asrOn: 'الميكروفون عالي الدقة: مفعل', asrOff: 'الميكروفون عالي الدقة: غير مفعل', asrLoad: 'جارٍ تنزيل النموذج', asrErr: 'فشل تنزيل النموذج. تحقق من الإنترنت.', asrHint: 'يُنزَّل مرة واحدة ثم يعمل دون إنترنت.' }
  };
  function L() { var l = D().lang(); return T[l] || T.en; }
  function $(i) { return document.getElementById(i); }
  var esc = function (x) { return D().esc(x); }, num = function (n) { return D().num(n); };
  var R = null, rec = null, restartT = null, frame = null, loadId = 0, tick = null, toastT = null;
  var K = 'hifz_read_v1', Q = { hide: 1, mode: 'mushaf', font: 30, page: 1, asr: 0, hc: 0, rec: 'Alafasy_128kbps', taj: 0, qcfv: 0, tjt: 1, gap: 2.3, tl: 0, trOn: 1, tfont: 18 };
  var BM_KEY = 'hifz_read_page_bookmarks_v1', pageMarks = [], startPages = null, homeQuery = '', marksFromHome = false;
  try { pageMarks = JSON.parse(localStorage.getItem(BM_KEY) || '[]'); if (!Array.isArray(pageMarks)) pageMarks = []; } catch (e) { pageMarks = []; }
  function savePageMarks() { try { localStorage.setItem(BM_KEY, JSON.stringify(pageMarks)); } catch (e) {} }
  function pageMarked(p) { return pageMarks.indexOf(+p) >= 0; }
  function togglePageMark(p) { p = +p; var i = pageMarks.indexOf(p); if (i >= 0) pageMarks.splice(i, 1); else pageMarks.push(p); pageMarks.sort(function(a,b){return a-b;}); savePageMarks(); paintPageMark(); }
  function loadStarts() { if (startPages) return Promise.resolve(startPages); return fetch('starts.json').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(a){startPages=a;return a;}).catch(function(){startPages=[1];return startPages;}); }
  try { var j = JSON.parse(localStorage.getItem(K) || '{}'); for (var k in j) if (k in Q) Q[k] = j[k]; if (!j.qcfv) { Q.taj = 0; Q.qcfv = 1; saveQ(); } } catch (e) {}
  function saveQ() { try { localStorage.setItem(K, JSON.stringify(Q)); } catch (e) {} }

  var CSS_WORDS = '.hz,.hz *{color:transparent!important;border-bottom:2px solid #dcdcdc;border-radius:3px}.ok{animation:rdIn .4s}.er,.er *{color:#d6342b!important;text-decoration:underline dotted #d6342b 2px;text-underline-offset:7px}.cur{background:rgba(0,0,0,.13);border-radius:6px}.hp{box-shadow:inset 0 -3px 0 #d99a4e}@keyframes rdIn{0%{color:#1fa75a}100%{color:inherit}}';

  function css() {
    if ($('rdCss')) return;
    var s = document.createElement('style'); s.id = 'rdCss';
    s.textContent = '#hifzReadView{position:fixed;inset:0;z-index:100;background:#f7f6f6;color:#1b1b1b;display:flex;flex-direction:column;font-family:inherit}#hifzReadView[hidden]{display:none}' +
      '.rd-top{display:flex;align-items:center;gap:8px;padding:10px 12px;padding-top:calc(10px + env(safe-area-inset-top));background:#fff;border-bottom:1px solid #e2e2e2;flex:none}.rd-t{flex:1;text-align:center;border:1px solid #e2e2e2;border-radius:12px;padding:5px;background:#f1f1f1;line-height:1.5}.rd-t b{display:block;font-size:16px}.rd-t small{color:#666;font-size:12px}.rd-pagebm{border:0;border-radius:10px;background:#f1f1f1;font-size:21px;padding:5px 9px;color:#555}.rd-pagebm.on{color:#176b50;background:#e2f3eb}.rd-home{position:absolute;inset:0;z-index:30;background:#f7f6f6;overflow:auto;padding:calc(14px + env(safe-area-inset-top)) 14px calc(22px + env(safe-area-inset-bottom));}.rd-home h2{margin:8px 0 4px;font-size:21px}.rd-home p{color:#777;font-size:13px;margin:0 0 14px}.rd-homebar{display:flex;gap:8px;align-items:center}.rd-homebar button{border:0;border-radius:12px;background:#fff;padding:10px 14px;font:inherit}.rd-homebar input{min-width:0;flex:1;border:1px solid #ddd;border-radius:12px;padding:11px;font:inherit;background:#fff}.rd-surahs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.rd-surah{border:1px solid #e3e3e3;border-radius:13px;background:#fff;padding:12px;text-align:start;font:inherit;display:flex;justify-content:space-between;align-items:center;gap:8px}.rd-surah b{font-family:Amiri,serif;font-size:18px}.rd-surah small{color:#888;white-space:nowrap}.rd-marklist{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 18px}.rd-mark{border:1px solid #e3d39c;background:#fff8df;border-radius:10px;padding:8px 12px;font:inherit}' +
      '.rd-ib{border:0;background:transparent;font-size:24px;padding:4px 10px;color:#222}' +
      '.rd-body{flex:1;position:relative;overflow:hidden}.rd-frame{width:100%;height:100%;border:0;background:#f7f6f6}.rd-text{position:absolute;inset:0;overflow:auto;padding:14px 14px 20px;direction:rtl;display:none}' +
      '.rd-text{background:#f9f7f7}.rd-ay{padding:12px 4px 14px;border-bottom:1px solid #e4e1e1}.rd-ah{display:flex;justify-content:space-between;align-items:center;direction:ltr;margin-bottom:2px}.rd-bd{border:1.5px solid #8a8a8a;border-radius:7px;padding:3px 9px;font-size:14px;color:#444;background:#fff}.rd-dots{border:0;background:transparent;font-size:26px;line-height:1;color:#777;padding:2px 8px}' +
      '.rd-ban{margin:6px 0 14px;border:3px double #111;padding:6px;text-align:center;background:#fff}.rd-ban div{border:1.5px solid #111;border-radius:30px;padding:4px 10px;font-family:Amiri,"Noto Naskh Arabic",serif;font-size:26px;color:#111}' +
      '.rd-ws{font-family:Amiri,"Noto Naskh Arabic",serif;line-height:2.1;text-align:right;direction:rtl;color:#111}.rd-ws .w{padding:0 2px}.rd-n{display:inline-grid;place-items:center;min-width:36px;height:36px;border:2.5px double #222;border-radius:50%;font-size:16px;margin:0 6px;color:#111;font-family:inherit;vertical-align:middle}' +
      '.rd-tr{margin-top:10px;padding:0 2px;font-size:18px;line-height:2.1;color:#222}' +
      '.rd-foot{flex:none;padding:8px 12px calc(10px + env(safe-area-inset-bottom));background:#f7f6f6;display:flex;flex-direction:column;gap:8px;position:relative}' +
      '.rd-row{display:flex;gap:8px;align-items:center;direction:ltr;padding-right:90px}.rd-chip{border-radius:20px;padding:7px 12px;font-size:13px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15);display:flex;align-items:center;gap:5px;white-space:nowrap}.rd-chip.bad{background:#f0706c;color:#fff}.rd-chip.good{background:#9fd33a}.rd-chip.tm{background:#e9e9e9}.rd-dot{width:11px;height:11px;border-radius:50%;background:#f0606a}' +
      '.rd-b{width:48px;height:48px;border-radius:50%;border:0;background:#fff;box-shadow:0 1px 5px rgba(0,0,0,.2);font-size:20px;display:grid;place-items:center;color:#222;flex:none}.rd-b.on{background:#e4f6ea}' +
      '.rd-mic{position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));width:74px;height:74px;border-radius:50%;border:0;background:radial-gradient(circle,#8cf2a8,#4fd37d);box-shadow:0 0 22px rgba(79,211,125,.7);font-size:30px;color:#fff;display:grid;place-items:center}.rd-mic.on:after{content:"";width:28px;height:28px;background:#fff;border-radius:4px;display:block}.rd-mic.on span{display:none}' +
      '.rd-toast{position:absolute;left:50%;bottom:130px;transform:translateX(-50%);background:#111;color:#fff;padding:9px 16px;border-radius:12px;font-size:14px;z-index:5;display:none;white-space:nowrap}' +
      '.rd-said{font-size:12.5px;color:#777;text-align:center;direction:rtl;min-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-inline-end:84px}' +
      '.rd-sheet{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.45);display:flex;align-items:flex-end}.rd-sheet[hidden]{display:none}.rd-sb{width:100%;max-height:78%;overflow:auto;background:#fff;border-radius:20px 20px 0 0;padding:16px}.rd-sb h3{margin:0 0 10px;font-size:15px}' +
      '.rd-opt{display:flex;align-items:center;gap:10px;width:100%;text-align:start;border:1.5px solid #e2e2e2;border-radius:14px;padding:13px;margin:8px 0;background:#fff;font:inherit;font-size:15px}.rd-opt.on{border-color:#222}.rd-opt i{margin-inline-start:auto;width:18px;height:18px;border-radius:50%;border:2px solid #aaa}.rd-opt.on i{border:5px solid #222}' +
      '.rd-oh{position:absolute;left:0;right:0;top:0;display:none;justify-content:space-between;padding:calc(8px + env(safe-area-inset-top)) 18px 0;font-size:15px;color:#333;pointer-events:none;direction:ltr}.rd-op{position:absolute;right:20px;bottom:calc(8px + env(safe-area-inset-bottom));display:none;font-size:16px;color:#333;pointer-events:none}.rd-full .rd-oh{display:flex}.rd-full .rd-op{display:block}.rd-full .rd-top,.rd-full .rd-foot{display:none!important}.rd-it{display:flex;align-items:center;gap:14px;width:100%;text-align:start;border:0;border-bottom:1px solid #e6e6e6;background:transparent;padding:15px 4px;font:inherit;font-size:16px;color:#222}.rd-it span:first-child{width:28px;text-align:center;font-size:20px;color:#666}.rd-exp{padding:10px 8px 14px;font-size:15px;line-height:1.95;color:#333;white-space:pre-wrap;background:#fafafa;border-radius:10px;margin:4px 0}.rd-hd{display:flex;align-items:center;gap:10px;margin-bottom:6px}.rd-hd b{flex:1}.rd-ref{border:1.5px solid #999;border-radius:8px;padding:4px 9px;font-size:14px}.rd-x{border:0;background:transparent;font-size:26px;color:#555}.sel{background:rgba(0,0,0,.09);border-radius:6px}.rd-in{width:100%;border:1px solid #ddd;border-radius:12px;padding:9px 12px;font:inherit;margin-bottom:8px}.rd-msg{text-align:center;padding:30px;color:#c0392b}';
    document.head.appendChild(s);
  }
  function view() {
    var v = $('hifzReadView'); if (v) return v;
    v = document.createElement('div'); v.id = 'hifzReadView'; v.hidden = true;
    v.setAttribute('data-no-translate', '1'); v.setAttribute('data-keep-ar', '1');
    document.body.appendChild(v); v.addEventListener('click', onClick); return v;
  }

  /* ---------- page + words ---------- */
  function tokensOf(s, a) {
    var t = D().TEXT[s] && D().TEXT[s][a - 1]; if (!t) return [];
    if (a === 1 && s !== 1 && s !== 9) t = D().stripBism(t);
    return t.split(/\s+/).filter(function (x) { return D().nw(x).length > 0; });
  }
  function load(pg) {
    pg = Math.max(1, Math.min(604, +pg || 1)); Q.page = pg; saveQ();
    var id = ++loadId; stopListen(true); recStop();
    R = { ui: true, page: pg, ready: false, words: [], ays: [], pos: 0, fails: {}, soft: {}, ok: 0, mist: 0, msg: '', said: '', listening: false, t0: 0, base: 0, cur: 0, err: '' };
    paint(); paintFoot();
    var fr = $('rdFrame'); fr.style.visibility = 'hidden'; fr.src = 'mushaf/view.html?m=' + (Q.taj ? 't' : 'q') + '&p=' + pg;
    R.id = id;
  }
  function onReady() {
    var doc, id = loadId; try { doc = frame.contentDocument; } catch (e) { doc = null; }
    if (!doc) { R.err = L().loadErr; return paintFoot(); }
    var st = doc.createElement('style');
    st.textContent = CSS_WORDS + '.cur{background:none!important}html,body{background:#f7f6f6!important;margin:0}.pg{display:flex;flex-direction:column;justify-content:space-evenly;min-height:100vh;box-sizing:border-box;padding:38px 0 34px}.pg .line:not(.hd){line-height:var(--lh,2.3)!important}.pg .line.hd{margin:6px 0!important}';
    doc.head.appendChild(st); doc.documentElement.style.setProperty('--lh', String(Q.gap)); installSwipe(doc);
    var groups = [], map = {};
    [].slice.call(doc.querySelectorAll('.line .ayah')).forEach(function (sp) {
      var key = sp.getAttribute('data-sura') + ':' + sp.getAttribute('data-ayah'), g = map[key];
      if (!g) { g = map[key] = { s: +sp.getAttribute('data-sura'), a: +sp.getAttribute('data-ayah'), spans: [] }; groups.push(g); }
      g.spans.push(sp);
    });
    var suras = [], seen = {}; groups.forEach(function (g) { if (!seen[g.s]) { seen[g.s] = 1; suras.push(g.s); } });
    Promise.all(suras.map(D().ensureSura)).then(function (oks) {
      if (id !== loadId) return;
      if (!groups.length && Q.taj) { R.err = L().loadErr; return paintFoot(); }
      if (!groups.length || oks.some(function (x) { return !x; })) { R.err = L().loadErr; return paintFoot(); }
      groups.forEach(function (g, gi) {
        var toks = tokensOf(g.s, g.a), nw = toks.length, nsp = g.spans.length, last = gi === groups.length - 1 && groups.length > 1, first = gi === 0 && groups.length > 1;
        var ay = { s: g.s, a: g.a, words: [] }; R.ays.push(ay);
        toks.forEach(function (tk, i) {
          var sp;
          if (nsp === nw + 1) sp = g.spans[i];
          else if (first && nsp < nw + 1) { var off = nw - (nsp - 1); sp = i >= off ? g.spans[i - off] : null; }
          else if (last && nsp <= nw) sp = i < nsp ? g.spans[i] : null;
          else sp = g.spans[Math.min(nsp - 1, Math.round(i * Math.max(1, nsp - 1) / nw))];
          var w = { els: sp ? [sp] : [], s: g.s, a: g.a, disp: tk, nw: D().nw(tk), ay: ay };
          ay.words.push(w); R.words.push(w);
        });
      });
      R.ready = true; fr_show(); buildText(); applyAll(); paintFoot();
      if (R.wantListen) { R.wantListen = false; startListen(); }
    });
  }
  function fr_show() { $('rdFrame').style.visibility = Q.mode === 'mushaf' ? 'visible' : 'hidden'; }
  function buildText() {
    var box = $('rdText'); if (!box) return;
    var h = '';
    R.ays.forEach(function (ay, ai) {
      if (ay.a === 1) h += '<div class="rd-ban"><div>' + esc(D().sname(ay.s)) + '</div></div>';
      h += '<div class="rd-ay"><div class="rd-ah"><span class="rd-bd">' + num(ay.s) + ':' + num(ay.a) + '</span><button type="button" class="rd-dots" data-ai="' + ai + '" aria-label="menu">⋮</button></div><div class="rd-ws" style="font-size:' + Q.font + 'px">' + ay.words.map(function (w, wi) { return '<span class="w" data-t="' + R.words.indexOf(w) + '">' + esc(w.disp) + '</span>'; }).join(' ') + '<span class="rd-n">' + num(ay.a) + '</span></div><div class="rd-tr" id="rdTr' + ai + '" style="display:none"></div></div>';
    });
    box.innerHTML = h;
    [].slice.call(box.querySelectorAll('.w')).forEach(function (sp) { R.words[+sp.getAttribute('data-t')].els.push(sp); });
    var lpT = null, lpF = false;
    box.ontouchstart = box.onmousedown = function (ev) { var el = ev.target.closest && ev.target.closest('.w'); clearTimeout(lpT); lpF = false; if (!el) return; lpT = setTimeout(function () { lpF = true; tapAyah(el); try { navigator.vibrate && navigator.vibrate(15); } catch (x) {} }, 450); };
    box.ontouchmove = box.onmouseup = box.ontouchend = function () { clearTimeout(lpT); };
    box.onclick = function (ev) { var dt = ev.target.closest && ev.target.closest('.rd-dots'); if (dt) { ayahSheet(R.ays[+dt.getAttribute('data-ai')]); return; } if (lpF) { lpF = false; return; } if ($('rdSheet').hidden) setUi(!R.ui); };
    box.style.display = Q.mode === 'mushaf' ? 'none' : 'block';
    if (!$('rdTextCss')) { var st = document.createElement('style'); st.id = 'rdTextCss'; st.textContent = CSS_WORDS + '.pa{background:rgba(255,213,79,.38);border-radius:4px}.pw{background:rgba(255,179,0,.75);border-radius:6px}'; document.head.appendChild(st); }
    paintTr(); paintTaj();
  }
  var HC = ['255,214,102', '120,205,140', '130,190,250', '248,150,185', '190,160,240'];
  function hcRgb() { return HC[Q.hc] || HC[0]; }
  var PL = null;
  var IC_PLAY = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var IC_STOP = '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>';
  var RECS = null;
  function loadRecs() {
    if (RECS) return Promise.resolve(RECS);
    return fetch('mushaf/reciters.json').then(function (r) { return r.json(); }).then(function (l) {
      RECS = l.filter(function (x) { return x.t === 'a' && !x.u; }); return RECS;
    }).catch(function () { RECS = [{ id: 'Alafasy_128kbps', e: 'Mishary Al-Afasy' }]; return RECS; });
  }
  function recName() { var n = Q.rec; (RECS || []).forEach(function (x) { if (x.id === Q.rec) n = x.n || x.e || x.id; }); return n.replace(/_/g, ' '); }
  function sheetRec() {
    var t = L(), sb = $('rdSb'); $('rdSheet').hidden = false; sb._ay = null;
    sb.innerHTML = '<h3>' + esc(t.recPick) + '</h3><div id="rdRl"></div>';
    loadRecs().then(function (l) {
      var box = $('rdRl'); if (!box) return;
      box.innerHTML = l.map(function (x) { return '<button type="button" class="rd-opt' + (x.id === Q.rec ? ' on' : '') + '" data-act="recSet" data-r="' + esc(x.id) + '"><span>🎙</span><span style="flex:1">' + esc(x.n || x.e || x.id) + '</span><i></i></button>'; }).join('');
    });
  }
  function jumpIdx(text) {
    if (!R || !R.words.length) return -1;
    var d = D(), tk = toks(text), W = R.words; if (tk.length < 2) return -1;
    var cw = W[R.pos] ? W[R.pos].nw : '';
    if (R.pos < W.length && (d.wmatch(tk[0], cw) || (W[R.pos + 1] && d.wmatch(tk[0], W[R.pos + 1].nw)))) return -1;
    var best = -1;
    R.ays.forEach(function (ay) {
      var st = W.indexOf(ay.words[0]); if (st < 0 || st >= R.pos) return;
      var n = Math.min(3, tk.length, ay.words.length), ok = 0, i;
      for (i = 0; i < n; i++) if (d.wmatch(tk[i], ay.words[i].nw)) ok++; else break;
      if (ok === n && n >= 2 && st > best) best = st;
    });
    return best;
  }
  function rewindTo(idx) {
    var i; for (i = idx; i < R.words.length; i++) {
      if (R.fails[i]) { R.mist = Math.max(0, R.mist - 1); }
      delete R.fails[i]; delete R.soft[i];
      setCls(i, Q.hide ? ['hz'] : [], ['ok', 'er', 'cur', 'hp']);
    }
    R.pos = R.base = R.cur = idx; R.asrBase = idx; cursor();
  }
  function allEls(ws) { var o = []; ws.forEach(function (w) { w.els.forEach(function (e) { o.push(e); }); }); return o; }
  function hlDraw(doc, id, els, bg) {
    var old = doc.getElementById(id); if (old) old.remove();
    if (!els.length) return;
    var wrap = doc.createElement('div'); wrap.id = id; wrap.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:0';
    var sx = doc.defaultView.pageXOffset || 0, sy = doc.defaultView.pageYOffset || 0, lines = [];
    els.forEach(function (e) {
      var r = e.getBoundingClientRect(); if (!r.width) return;
      var mid = r.top + r.height / 2, ln = null;
      lines.forEach(function (l) { if (!ln && mid >= l.t && mid <= l.b) ln = l; });
      if (!ln) { ln = { t: r.top, b: r.bottom, l: r.left, r: r.right }; lines.push(ln); } else { ln.l = Math.min(ln.l, r.left); ln.r = Math.max(ln.r, r.right); ln.t = Math.min(ln.t, r.top); ln.b = Math.max(ln.b, r.bottom); }
    });
    lines.forEach(function (l) {
      var d = doc.createElement('div');
      d.style.cssText = 'position:absolute;border-radius:10px;mix-blend-mode:multiply;background:' + bg + ';left:' + (l.l + sx - 4) + 'px;top:' + (l.t + sy - 2) + 'px;width:' + (l.r - l.l + 8) + 'px;height:' + (l.b - l.t + 4) + 'px';
      wrap.appendChild(d);
    });
    doc.body.appendChild(wrap);
  }
  function hlUpdate() {
    if (!R || !R.ready) return;
    var ay = null, wi = -1;
    if (PL) { ay = R.ays[PL.ai]; wi = PL.wi; }
    else if (R.listening && R.pos < R.words.length) { var w0 = R.words[R.pos]; ay = w0.ay; wi = ay ? ay.words.indexOf(w0) : -1; }
    var doc = null; try { doc = frame.contentDocument; } catch (e) {}
    [].slice.call(document.querySelectorAll('#rdText .pa,#rdText .pw')).forEach(function (e) { e.classList.remove('pa'); e.classList.remove('pw'); });
    if (doc && doc.body) { ['rdhA', 'rdhW'].forEach(function (i) { var o = doc.getElementById(i); if (o) o.remove(); }); }
    if (!ay) return;
    var ws = ay.words[wi];
    var hs = document.getElementById('rdHlCss'); if (!hs) { hs = document.createElement('style'); hs.id = 'rdHlCss'; document.head.appendChild(hs); }
    hs.textContent = '#rdText .pa{background:rgba(' + hcRgb() + ',.26)!important;border-radius:4px}#rdText .pw{background:rgba(' + hcRgb() + ',.45)!important;border-radius:6px}';
    if (Q.mode === 'mushaf') {
      if (!doc || !doc.body) return;
      hlDraw(doc, 'rdhA', allEls(ay.words), 'rgba(' + hcRgb() + ',.26)');
      if (ws) hlDraw(doc, 'rdhW', ws.els, 'rgba(' + hcRgb() + ',.42)');
    } else {
      allEls(ay.words).forEach(function (e) { e.classList.add('pa'); });
      if (ws) ws.els.forEach(function (e) { e.classList.add('pw'); });
      if (PL && ws && ws.els[0]) try { ws.els[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) {}
    }
  }
  function recStop() {
    try { if (AU) { AU.pause(); AU.onended = AU.ontimeupdate = AU.onerror = null; AU = null; } } catch (e) {}
    PL = null; hlUpdate(); if (R) paintFoot();
  }
  function recAyah() {
    var ay = R && R.ays[PL.ai]; if (!ay) return recStop();
    var u = 'https://everyayah.com/data/' + Q.rec + '/' + ('00' + ay.s).slice(-3) + ('00' + ay.a).slice(-3) + '.mp3';
    var lens = ay.words.map(function (w) { return Math.max(2, String(w.disp).replace(/[ً-ٰٟۖ-ۭ]/g, '').length); }), tot = lens.reduce(function (x, y) { return x + y; }, 0);
    try { if (AU) { AU.pause(); AU = null; } } catch (e) {}
    try {
      var au = AU = new Audio(u);
      au.ontimeupdate = function () {
        if (!PL || AU !== au || !au.duration || !isFinite(au.duration)) return;
        var t = Math.min(0.999, Math.max(0, (au.currentTime - 0.15) / Math.max(0.1, au.duration - 0.3))) * tot, i = 0, c = 0;
        while (i < lens.length - 1 && c + lens[i] <= t) { c += lens[i]; i++; }
        if (i !== PL.wi) { PL.wi = i; hlUpdate(); }
      };
      au.onended = function () { if (!PL || AU !== au) return; PL.ai++; PL.wi = 0; if (PL.ai < R.ays.length) recAyah(); else recStop(); };
      au.onerror = function () { if (AU === au) { R.err = L().recErr; recStop(); } };
      au.play().catch(function () { if (AU === au) { R.err = L().recErr; recStop(); } });
    } catch (e) { return recStop(); }
    hlUpdate(); paintFoot();
  }
  function recToggle() {
    if (PL) return recStop();
    if (R.listening) stopListen();
    R.err = ''; PL = { ai: Math.max(0, R.pos < R.words.length && R.words[R.pos].ay ? R.ays.indexOf(R.words[R.pos].ay) : 0), wi: 0 };
    if (PL.ai < 0) PL.ai = 0; recAyah();
  }
  function setCls(i, add, rem) { var w = R.words[i]; if (!w) return; w.els.forEach(function (e) { (rem || []).forEach(function (c) { e.classList.remove(c); }); (add || []).forEach(function (c) { e.classList.add(c); }); }); }
  function applyAll() {
    R.words.forEach(function (w, i) {
      var done = i < R.pos;
      setCls(i, done || !Q.hide ? [] : ['hz'], done || !Q.hide ? ['hz', 'cur'] : ['cur']);
      if (!(done || !Q.hide)) return;
    });
    R.words.forEach(function (w, i) { if (R.fails[i]) setCls(i, ['er'], []); });
    cursor();
  }
  function cursor() {
    R.words.forEach(function (w, i) { if (i !== R.pos) setCls(i, null, ['cur']); });
    hlUpdate();
    if (R.pos < R.words.length) { setCls(R.pos, ['cur'], []); var e = R.words[R.pos].els[0]; if (e) try { e.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) {} }
  }
  function tapWord(el) {
    if (!R.ready) return; if (R.listening) stopListen();
    var idx = -1; R.words.forEach(function (w, i) { if (idx < 0 && w.els.indexOf(el) >= 0) idx = i; });
    if (idx < 0) return; R.pos = R.base = R.cur = idx; applyAll(); paintFoot();
  }

  /* ---------- ayah actions sheet (tap an ayah): listen, translation, tafsir, bookmark, similar, copy, share ---------- */
  var SEL = null, AU = null;
  function ayahText(ay) { return ay.words.map(function (w) { return w.disp; }).join(' '); }
  function selAyah(ay, on) { ay.words.forEach(function (w) { w.els.forEach(function (e) { e.classList[on ? 'add' : 'remove']('sel'); }); }); }
  function setUi(on) {
    if (!R) return; R.ui = on; var v = $('hifzReadView'); if (v) v.classList.toggle('rd-full', !on);
  }
  function tapAyah(el) {
    if (!R || !R.ready) return;
    var w = null; R.words.forEach(function (x) { if (!w && x.els.indexOf(el) >= 0) w = x; });
    if (w) ayahSheet(w.ay);
  }
  function bmList() { try { var v = JSON.parse(localStorage.getItem('ayah_bookmarks') || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function bmIdx(l, s, a) { for (var i = 0; i < l.length; i++) { var q = String(l[i]).split(':'); if (+q[0] === s && +q[1] === a) return i; } return -1; }
  function playAyah(s, a, btn) {
    try { if (AU) { AU.pause(); AU = null; } } catch (e) {}
    var u = 'https://everyayah.com/data/Alafasy_128kbps/' + ('00' + s).slice(-3) + ('00' + a).slice(-3) + '.mp3';
    try { AU = new Audio(u); AU.play().catch(function () {}); } catch (e) {}
  }
  function simAyahs(ay) {
    var d = D(); return d.corpus().then(function () {
      var A = {}, an = 0; ay.words.forEach(function (w) { if (w.nw && !A[w.nw]) { A[w.nw] = 1; an++; } });
      var out = [], s, a, T = d.TEXT;
      for (s = 1; s <= 114; s++) { var arr = T[s]; if (!arr) continue; for (a = 1; a <= arr.length; a++) {
        if (s === ay.s && a === ay.a) continue;
        var ws = String(arr[a - 1] || '').split(/\s+/), B = {}, bn = 0, hit = 0;
        ws.forEach(function (x) { var k = d.nw(x); if (k && !B[k]) { B[k] = 1; bn++; if (A[k]) hit++; } });
        var sc = hit / Math.max(an, bn); if (bn >= 3 && an >= 3 && sc >= 0.6) out.push([sc, s, a, arr[a - 1]]);
      } }
      out.sort(function (x, y) { return y[0] - x[0]; }); return out.slice(0, 8);
    });
  }
  function tafsirOf(s, a) {
    var l = D().lang(), sel = null; try { sel = (JSON.parse(localStorage.getItem('tafsir_selected') || '[]') || [])[0]; } catch (e) {}
    var slug = sel || (l === 'ar' ? 'ar-tafsir-muyassar' : l === 'en' ? 'en-tafisr-ibn-kathir' : 'kurd-tafsir-rebar');
    var root = location.pathname.replace(/\/mushaf\/.*$/, '/').replace(/[^\/]*$/, '');
    var req = slug.indexOf('hq-') === 0 ? fetch(root + 'tafsir-ku/' + slug + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (m) { return m[s + ':' + a] || ''; })
      : fetch('https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/' + slug + '/' + s + '/' + a + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { return (j && j.text) || ''; });
    return req.then(function (h) { try { var dd = new DOMParser().parseFromString(String(h).replace(/<br\s*\/?>|<\/p>|<\/div>/gi, '\n'), 'text/html'); return (dd.body.textContent || '').trim(); } catch (e) { return String(h); } });
  }
  function ayahSheet(ay) {
    var d = D(), t = L(), sh = $('rdSheet'), sb = $('rdSb'), idx = R.ays.indexOf(ay);
    if (SEL) selAyah(SEL, false); SEL = ay; selAyah(ay, true);
    sh.hidden = false;
    var bm = bmIdx(bmList(), ay.s, ay.a) >= 0;
    function it(act, ic, nm) { return '<button type="button" class="rd-it" data-act="' + act + '"><span>' + ic + '</span><span class="nm">' + esc(nm) + '</span></button><div id="rdX_' + act + '"></div>'; }
    sb.innerHTML = '<div class="rd-hd"><span class="rd-ref">' + num(ay.s) + ':' + num(ay.a) + '</span><b>' + esc(t.aya) + ' ' + num(ay.a) + ' - ' + esc(d.sname(ay.s)) + '</b><button type="button" class="rd-x" data-act="closeSheet2">✕</button></div>' +
      it('aFrom', '⏵', t.aFrom) + it('aListen', '▶', t.aListen) + it('aTr', '🌐', t.aTr) + it('aTaf', '📖', t.aTaf) + it('aBm', '🔖', bm ? t.aBmOff : t.aBm) + it('aSim', '⧉', t.aSim) + it('aCopy', '📋', t.aCopy) + it('aShare', '↗', t.aShare);
    sb._ay = ay;
  }
  function ayahAct(a, b) {
    var sb = $('rdSb'), ay = sb && sb._ay; if (!ay) return false;
    var d = D(), t = L(), X = $('rdX_' + a);
    if (a === 'closeSheet2') { $('rdSheet').hidden = true; try { frame.contentWindow.selectAyah(0); } catch (x) {} if (SEL) selAyah(SEL, false); SEL = null; try { if (AU) AU.pause(); } catch (e) {} return true; }
    if (a === 'aFrom') { var i0 = R.words.indexOf(ay.words[0]); if (R.listening) stopListen(true); R.pos = R.base = R.cur = i0; applyAll(); paintFoot(); ayahAct('closeSheet2'); return true; }
    if (a === 'aListen') { playAyah(ay.s, ay.a); return true; }
    var full = ayahText(ay) + ' ﴿' + ay.a + '﴾ [' + d.sname(ay.s) + ' ' + ay.s + ':' + ay.a + ']';
    if (a === 'aCopy') { try { navigator.clipboard.writeText(full); } catch (e) {} toast(t.aCopied); return true; }
    if (a === 'aShare') { if (navigator.share) navigator.share({ text: full }).catch(function () {}); else { try { navigator.clipboard.writeText(full); } catch (e) {} toast(t.aCopied); } return true; }
    if (a === 'aBm') {
      var l = bmList(), k = bmIdx(l, ay.s, ay.a); if (k >= 0) l.splice(k, 1); else l.push(ay.s + ':' + ay.a + ':' + R.page);
      try { localStorage.setItem('ayah_bookmarks', JSON.stringify(l)); } catch (e) {}
      try { window.__bmChanged && window.__bmChanged(); } catch (e) {}
      b.querySelector('.nm').textContent = k >= 0 ? t.aBm : t.aBmOff; return true;
    }
    if (X && X.innerHTML) { X.innerHTML = ''; return true; }
    if (a === 'aTr') {
      X.innerHTML = '<div class="rd-exp">' + esc(t.aLoad) + '</div>';
      var ed = d.curEd(); d.loadEds().then(function () { return d.loadTr(ed, ay.s); }).then(function (arr) {
        var inf = d.edInfo(ed); X.innerHTML = '<div class="rd-exp" dir="' + (inf[3] === 'rtl' ? 'rtl' : 'ltr') + '">' + esc(arr[ay.a - 1] || '') + '<div style="color:#888;font-size:12px;margin-top:6px">' + esc(inf[1]) + '</div></div>';
      }).catch(function () { X.innerHTML = '<div class="rd-exp">' + esc(t.trNone) + '</div>'; });
    } else if (a === 'aTaf') {
      X.innerHTML = '<div class="rd-exp">' + esc(t.aLoad) + '</div>';
      tafsirOf(ay.s, ay.a).then(function (x) { X.innerHTML = '<div class="rd-exp">' + esc(x || t.aTafNo) + '</div>'; }).catch(function () { X.innerHTML = '<div class="rd-exp">' + esc(t.aTafNo) + '</div>'; });
    } else if (a === 'aSim') {
      X.innerHTML = '<div class="rd-exp">' + esc(t.aLoad) + '</div>';
      simAyahs(ay).then(function (l) {
        X.innerHTML = l.length ? l.map(function (r) { return '<div class="rd-exp" dir="rtl"><b>' + esc(d.sname(r[1])) + ' ﴿' + num(r[2]) + '﴾</b><br>' + esc(r[3]) + '</div>'; }).join('') : '<div class="rd-exp">' + esc(t.aNoSim) + '</div>';
      });
    }
    return true;
  }

  /* ---------- recognition (word by word, forgiving) ---------- */
  function engine() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }
  function startListen() {
    if (PL) recStop();
    if (!engine()) { R.err = L().nomic; return paintFoot(); }
    if (!R.ready) { R.wantListen = true; R.listening = true; return paintFoot(); }
    R.err = ''; R.listening = true; if (!R.t0) R.t0 = Date.now(); paintFoot();
    if (window.hifzLive && navigator.onLine && Q.live !== 0) {
      /* online: stream to Gemini Live (real-time, like Tarteel). Any failure falls back to the on-device engines below. */
      R.base = R.pos; R.cur = R.pos;
      var rr = R;
      window.hifzLive.start(function (text, fin) { if (R === rr) onSpeech([text], fin); }, function () { if (R === rr && R.listening && R.live) { R.live = false; localStart(); } })
        .then(function () { if (R === rr && R.listening) { R.live = true; paintFoot(); } else window.hifzLive.stop(); })
        .catch(function () { if (R === rr && R.listening) { R.live = false; localStart(); } });
      return;
    }
    localStart();
  }
  function localStart() {
    if (!R || !R.listening) return; paintFoot();
    if (Q.asr && window.hifzASR && window.hifzASR.ready()) {
      /* hybrid: the browser engine gives instant word-by-word progress; the Quran model re-checks every phrase and repairs it */
      R.asrBase = R.pos;
      window.hifzASR.start(function (text, fin) { onAsr(text, fin); }).catch(function () { /* keep the browser engine */ });
    }
    openRec();
  }
  function stopListen(silent) {
    if (R) R.listening = false; clearTimeout(restartT);
    try { if (rec) { var r = rec; rec = null; r.abort(); } } catch (e) {}
    try { if (window.hifzASR) window.hifzASR.stop(); } catch (e) {}
    try { if (window.hifzLive) window.hifzLive.stop(); } catch (e) {}
    if (R) R.live = false;
    if (!silent) paintFoot();
  }
  function openRec() {
    var Rg = engine(), r; if (!Rg || !R.listening) return;
    R.base = R.pos; R.cur = R.pos;
    try { r = new Rg(); } catch (e) { R.listening = false; R.err = L().nomic; return paintFoot(); }
    rec = r; r.lang = 'ar-SA'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 3;
    r.onresult = function (e) {
      if (rec !== r) return;
      var alts = [], j, i, fin = false;
      for (j = 0; j < 3; j++) { var tx = ''; for (i = 0; i < e.results.length; i++) { var it = e.results[i]; if (j === 0 && i === e.results.length - 1) fin = !!it.isFinal; tx += ' ' + ((it[j] || it[0]).transcript || ''); } alts.push(tx); }
      onSpeech(alts, fin);
    };
    r.onerror = function (e) {
      if (rec !== r) return; var c = e && e.error;
      if (c === 'not-allowed' || c === 'service-not-allowed') { stopListen(true); R.err = L().denied; paintFoot(); }
      else if (c === 'audio-capture') { stopListen(true); R.err = L().nomic; paintFoot(); }
      else if (c === 'network') { stopListen(true); R.err = L().net; paintFoot(); }
    };
    r.onend = function () { if (rec !== r) return; clearTimeout(restartT); restartT = setTimeout(function () { if (R && R.listening && R.ready) openRec(); }, 0); };
    try { r.start(); } catch (e2) { R.listening = false; R.err = L().nomic; paintFoot(); }
  }
  function align(tokens, base, fin) {
    var d = D(), W = R.words, N = W.length, p = base, i = 0, wrong = -1, soft = [], errs = [], len = d.P.level < 2;
    function nwAt(k) { return k < N ? W[k].nw : ''; }
    while (i < tokens.length && p < N) {
      var t = tokens[i], e = nwAt(p), k;
      if (d.wmatch(t, e)) { p++; i++; continue; }
      if (i + 1 < tokens.length && d.wmatch(t + tokens[i + 1], e)) { p++; i += 2; continue; }
      if (p + 1 < N && d.wmatch(t, e + nwAt(p + 1))) { p += 2; i++; continue; }
      if (!fin && i === tokens.length - 1) {
        /* still being spoken: a clear prefix of the expected word already counts (one word faster) */
        var pt = d.pf(t), pe = d.pf(e);
        if (t.length >= 3 && pe.length > pt.length && pe.indexOf(pt.slice(0, Math.max(2, pt.length - 1))) === 0 && d.sim(pt, pe.slice(0, pt.length)) >= 0.75) { p++; i++; continue; }
        break;
      }
      /* a spurious extra token: the next token is the word we expect */
      if (len && i + 1 < tokens.length && d.wmatch(tokens[i + 1], e)) { i++; continue; }
      /* the reciter jumped ahead (took a breath, skipped words): resync, the skipped words are mistakes */
      var sk = 0;
      for (k = 1; k <= 4 && p + k < N && !sk; k++) {
        if (d.wmatch(t, nwAt(p + k)) && (i + 1 < tokens.length ? d.wmatch(tokens[i + 1], nwAt(p + k + 1)) : (fin && t.length >= 4))) sk = k;
      }
      if (sk) { for (k = 0; k < sk; k++) errs.push(p + k); p += sk; continue; }
      /* a different word was said but the recitation went on: keep moving, the word is marked (never get stuck) */
      var nextOk = i + 1 < tokens.length && p + 1 < N && d.wmatch(tokens[i + 1], nwAt(p + 1));
      if (nextOk || (i === tokens.length - 1 && fin && t.length >= 3)) {
        if (len && d.sim(d.pf(t), d.pf(e)) >= 0.4) soft.push(p); else errs.push(p);
        p++; i++; continue;
      }
      wrong = p; break;
    }
    return { p: p, wrong: wrong, soft: soft, errs: errs };
  }
  function toks(s) { return D().nw ? String(s).split(/\s+/).map(function (w) { return D().nw(w).replace(/[اء]/g, ''); }).filter(Boolean) : []; }
  function onSpeech(alts, fin) {
    if (!R || !R.listening || !R.ready) return;
    var jx = jumpIdx(alts[0]); if (jx >= 0) rewindTo(jx);
    var best = null, ba = '', k;
    for (k = 0; k < alts.length; k++) { var r = align(toks(alts[k]), R.base, fin); if (!best || r.p > best.p || (r.p === best.p && r.wrong < 0 && best.wrong >= 0)) { best = r; ba = alts[k]; } }
    R.said = String(ba).trim().split(/\s+/).slice(-6).join(' ');
    best.soft.forEach(function (x) { R.soft[x] = 1; });
    if (best.p > R.cur) { R.cur = best.p; advance(best.p); }
    if (fin) {
      best.errs.forEach(function (x) { if (!R.fails[x]) mistake(x); });
      if (best.wrong >= 0 && best.wrong === R.pos && !R.fails[best.wrong]) mistake(best.wrong);
      R.base = R.pos;
    }
    paintFoot();
  }
  function onAsr(text, fin) {
    if (!R || !R.listening || !R.ready) return;
    var jx = jumpIdx(text); if (jx >= 0) rewindTo(jx);
    var a = align(toks(text), R.asrBase, true), i;
    var es = {}; a.errs.forEach(function (x) { es[x] = 1; });
    for (i = R.asrBase; i < a.p; i++) {
      if (R.fails[i] && !es[i]) { delete R.fails[i]; R.mist = Math.max(0, R.mist - 1); setCls(i, null, ['er']); }
    }
    if (a.p > R.pos) { R.cur = Math.max(R.cur, a.p); advance(a.p); R.base = R.pos; }
    if (fin) R.asrBase = Math.max(R.pos, a.p);
    paintFoot();
  }
  function advance(p) {
    var i; for (i = R.pos; i < p && i < R.words.length; i++) { setCls(i, ['ok'], ['hz', 'cur']); R.ok++; }
    R.pos = p;
    if (p >= R.words.length) return pageDone();
    cursor();
  }
  function mistake(i) {
    R.fails[i] = (R.fails[i] || 0) + 1; R.mist++; setCls(i, ['er'], []);
    try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) {}
  }
  function pageDone() {
    toast(L().done);
    if (R.page >= 604) return stopListen();
    var wasL = R.listening; setTimeout(function () { if (!R || R.page !== Q.page) return; load(R.page + 1); R.wantListen = wasL; R.listening = wasL; }, 900);
    stopListen(true);
  }
  function hintWord(all) {
    if (!R.ready || R.pos >= R.words.length) return;
    var a = R.words[R.pos].ay, end = all ? R.words.indexOf(a.words[a.words.length - 1]) + 1 : R.pos + 1, i;
    for (i = R.pos; i < end; i++) { setCls(i, ['hp'], ['hz', 'cur']); R.mist += 0; }
    R.pos = R.base = R.cur = end;
    if (R.pos >= R.words.length) pageDone(); else cursor();
    paintFoot();
  }

  /* ---------- translation inside text/tr mode ---------- */
  var TJC = { h: '#9a9a9a', l: '#9a9a9a', s: '#9a9a9a', n: '#e08a00', p: '#e08a00', m: '#d6342b', o: '#d6342b', q: '#2a6fdb', g: '#2e9e4f', c: '#d6338a', f: '#d6338a', w: '#1b9bd7', i: '#1fa05a', a: '#1fa05a', u: '#1fa05a', d: '#1fa05a', b: '#1fa05a' };
  function tjLoad(sura) {
    var key = 'rd_tj_' + sura;
    try { var c = localStorage.getItem(key); if (c) return Promise.resolve(JSON.parse(c)); } catch (e) {}
    return fetch('https://api.alquran.cloud/v1/surah/' + sura + '/quran-tajweed').then(function (r) { return r.json(); }).then(function (j) {
      var arr = j.data.ayahs.map(function (x) { return x.text; }); try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {} return arr; });
  }
  function tjHtml(t) {
    return t.replace(/\[([a-z])(?::\d+)?\[([^\]]*)\]/g, function (m, c, x) { return TJC[c] ? '<span style="color:' + TJC[c] + '">' + esc(x) + '</span>' : esc(x); }).replace(/\[[^\]]*$/g, '');
  }
  function paintTaj() {
    if (!R || !Q.tjt || Q.mode === 'mushaf') return;
    var ss = {}; R.ays.forEach(function (a) { ss[a.s] = 1; });
    Promise.all(Object.keys(ss).map(function (s) { return tjLoad(+s).then(function (arr) { return [s, arr]; }).catch(function () { return [s, null]; }); })).then(function (all) {
      var m = {}; all.forEach(function (x) { m[x[0]] = x[1]; });
      R.ays.forEach(function (ay) {
        var arr = m[ay.s]; if (!arr || !arr[ay.a - 1]) return;
        var ws = arr[ay.a - 1].replace(/\s+/g, ' ').trim().split(' ');
        if (ws.length === ay.words.length + 4 && ay.a === 1) ws = ws.slice(4);
        if (ws.length !== ay.words.length) return;
        ay.words.forEach(function (w, i) { w.els.forEach(function (el) { el.innerHTML = tjHtml(ws[i]); }); });
      });
    });
  }
  function tlLoad(sura) {
    var key = 'rd_tl_' + sura;
    try { var c = localStorage.getItem(key); if (c) return Promise.resolve(JSON.parse(c)); } catch (e) {}
    return fetch('https://api.alquran.cloud/v1/surah/' + sura + '/en.transliteration').then(function (r) { return r.json(); }).then(function (j) {
      var arr = j.data.ayahs.map(function (x) { return x.text; }); try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {} return arr; });
  }
  function paintTr() {
    var d = D(), ed = d.curEd();
    var on = Q.mode === 'tr'; if (!R) return;
    var showTr = on && Q.trOn, showTl = on && Q.tl;
    R.ays.forEach(function (ay, ai) { var el = $('rdTr' + ai); if (el) { el.style.display = on && (showTr || showTl) ? 'block' : 'none'; el.style.fontSize = Q.tfont + 'px'; if (on) el.textContent = L().trLoad; } });
    if (!on || !(showTr || showTl)) return;
    var ss = {}; R.ays.forEach(function (a) { ss[a.s] = 1; });
    var keys = Object.keys(ss);
    var pTr = showTr ? d.loadEds().then(function () { var info = d.edInfo(ed); return Promise.all(keys.map(function (s) { return d.loadTr(ed, +s).then(function (arr) { return [s, arr]; }); })).then(function (all) { return [info, all]; }); }) : Promise.resolve(null);
    var pTl = showTl ? Promise.all(keys.map(function (s) { return tlLoad(+s).then(function (arr) { return [s, arr]; }).catch(function () { return [s, []]; }); })) : Promise.resolve(null);
    Promise.all([pTr, pTl]).then(function (res) {
      var info = res[0] && res[0][0], m = {}, tl = {};
      if (res[0]) res[0][1].forEach(function (x) { m[x[0]] = x[1]; });
      if (res[1]) res[1].forEach(function (x) { tl[x[0]] = x[1]; });
      R.ays.forEach(function (ay, ai) {
        var el = $('rdTr' + ai); if (!el) return;
        var h = '';
        if (showTl) h += '<div dir="ltr" style="text-align:left;color:#555;font-style:italic;margin-bottom:' + (showTr ? 6 : 0) + 'px">' + esc((tl[ay.s] && tl[ay.s][ay.a - 1]) || '') + '</div>';
        if (showTr) { var rt = info && info[3] === 'rtl'; h += '<div dir="' + (rt ? 'rtl' : 'ltr') + '" style="text-align:' + (rt ? 'right' : 'left') + '">' + esc((m[ay.s] && m[ay.s][ay.a - 1]) || '') + '</div>'; }
        el.innerHTML = h;
      });
    }).catch(function () { R.ays.forEach(function (ay, ai) { var el = $('rdTr' + ai); if (el) { el.innerHTML = '<button type="button" class="rd-opt" data-act="trRetry" style="margin:0"><span>⟳</span><span style="flex:1">' + esc(L().trNone) + '</span></button>'; } }); });
  }

  /* ---------- UI ---------- */
  function shell() {
    var v = view(), t = L();
    v.dir = D().rtl() ? 'rtl' : 'ltr'; v.hidden = false; loadRecs();
    if (!v._lp) { v._lp = 1; var lpt = null; var lps = function (ev) { var bt = ev.target.closest && ev.target.closest('[data-act=rec]'); clearTimeout(lpt); if (!bt) return; lpt = setTimeout(function () { if (R) R._lp = 1; sheetRec(); try { navigator.vibrate && navigator.vibrate(15); } catch (x) {} }, 500); }; var lpe = function () { clearTimeout(lpt); }; v.addEventListener('touchstart', lps, { passive: true }); v.addEventListener('mousedown', lps); v.addEventListener('touchend', lpe); v.addEventListener('mouseup', lpe); v.addEventListener('touchmove', lpe, { passive: true }); }
    v.innerHTML = '<div class="rd-top"><button type="button" class="rd-ib" data-act="exit" aria-label="' + esc(t.back) + '">✕</button><button type="button" class="rd-ib" data-act="next" aria-label="next">›</button>' +
      '<div class="rd-t"><b id="rdSura"></b><small id="rdPg"></small></div><button type="button" class="rd-ib" data-act="showMarks" aria-label="bookmarked pages" title="bookmarked pages">▤</button><button type="button" class="rd-pagebm" id="rdPageBm" data-act="pageBm" aria-label="bookmark page">🔖</button><button type="button" class="rd-ib" data-act="prev" aria-label="prev">‹</button></div>' +
      '<div class="rd-body"><iframe id="rdFrame" class="rd-frame" title="mushaf" style="visibility:hidden"></iframe><div class="rd-text" id="rdText"></div><div class="rd-toast" id="rdToast"></div><div class="rd-oh" id="rdOh"><span id="rdOhL"></span><span id="rdOhR"></span></div><div class="rd-op" id="rdOp"></div></div>' +
      '<div class="rd-foot"><div class="rd-said" id="rdSaid"></div><div class="rd-row" id="rdChips"></div><div class="rd-row" id="rdBtns"></div><button type="button" class="rd-mic" id="rdMic" data-act="mic"><span>🎙</span></button></div>' +
      '<div class="rd-sheet" id="rdSheet" hidden data-act="closeSheet"><div class="rd-sb" data-stop="1" id="rdSb"></div></div>' + '<div class="rd-home" id="rdHome" hidden></div>';
    frame = $('rdFrame');
    frame.addEventListener('load', function () { /* view.html posts ready itself */ });
    installSwipe($('rdText'));
  }
  function paint() {
    var s = $('rdSura'), p = $('rdPg'); if (!R) return;
    if (p) p.textContent = L().page + ' ' + num(R.page);
    var JP = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582], j = 1, q;
    for (q = 0; q < JP.length; q++) if (JP[q] <= R.page) j = q + 1;
    var oL = $('rdOhL'), oR = $('rdOhR'), oP = $('rdOp');
    if (oL) oL.textContent = R.ays.length ? D().sname(R.ays[0].s) : '';
    if (oR) oR.textContent = (D().lang() === 'en' ? 'Juz ' : 'جزء ') + num(j);
    if (oP) oP.textContent = num(R.page);
    if (s) s.textContent = R.ays.length ? D().sname(R.ays[0].s) : L().title;
  }
  function paintPageMark() { var b = $('rdPageBm'); if (b && R) { b.classList.toggle('on', pageMarked(R.page)); b.textContent = '🔖'; } }
  function showHome() {
    var h = $('rdHome'); if (!h) return; h.hidden = false;
    h.innerHTML = '<div class="rd-homebar"><button type="button" data-act="exitHome">✕</button><button type="button" data-act="showMarks" aria-label="bookmarked pages" title="bookmarked pages">🔖</button><input id="rdHomeQ" type="search" placeholder="گەڕان بە ناوی سوڕەت…" value="' + esc(homeQuery) + '"></div><h2>هەڵبژاردنی سوڕەت</h2><p>یەکێک لە ١١٤ سوڕەت هەڵبژێرە؛ لە لاپەڕەی دەستپێکی ئەو سوڕەتەوە دەست پێدەکەیت.</p><h3>هەموو سوڕەتەکان</h3><div class="rd-surahs" id="rdSurahs"><div style="padding:20px;color:#888">بارکردن…</div></div>';
    var inp = $('rdHomeQ'); if (inp) inp.oninput = function(){homeQuery=this.value; paintSurahList();};
    loadStarts().then(paintSurahList);
  }
  function paintSurahList() { var g=$('rdSurahs'); if(!g)return; var q=(homeQuery||'').toLowerCase(), a=[]; for(var n=1;n<=114;n++){var nm=D().sname(n); if(q && (String(n).indexOf(q)<0 && String(nm).toLowerCase().indexOf(q)<0))continue; a.push('<button type="button" class="rd-surah" data-act="openSurah" data-s="'+n+'"><span><b>'+esc(nm)+'</b><small style="display:block">'+num(n)+' · '+num(D().cnt(n))+' ئایەت</small></span><small>لاپەڕە '+num(startPages && startPages[n-1] || 1)+'</small></button>');} g.innerHTML=a.join('') || '<div style="padding:20px;color:#888">هیچ سوڕەتێک نەدۆزرایەوە.</div>'; }
  function installSwipe(el) { if(!el || el.__rdSwipe)return; el.__rdSwipe=true; var x=0,y=0; el.addEventListener('touchstart',function(e){if(!e.touches||e.touches.length!==1)return;x=e.touches[0].clientX;y=e.touches[0].clientY;},{passive:true}); el.addEventListener('touchend',function(e){if(!R || !R.ready || Q.mode!=='mushaf' || !e.changedTouches || !e.changedTouches.length)return;var dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.25){if(dx>0 && R.page<604)load(R.page+1);else if(dx<0 && R.page>1)load(R.page-1);}},{passive:true}); }
  function paintFoot() {
    if (!R) return; paint(); paintPageMark();
    var t = L(), tot = R.ok + R.mist, acc = tot ? Math.round(R.ok / tot * 1000) / 10 : 100;
    var sec = R.t0 ? Math.round((Date.now() - R.t0) / 1000) : 0, mm = ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + sec % 60).slice(-2);
    var c = $('rdChips'); if (c) c.innerHTML = '<div class="rd-chip ' + (R.mist ? 'bad' : '') + '">🧠 ' + num(R.mist) + '</div><div class="rd-chip good">' + num(acc) + '%</div><div class="rd-chip tm">' + (R.live ? 'LIVE · ' : '') + (R.listening ? '<span class="rd-dot"></span>' : '') + mm + '</div>';
    var b = $('rdBtns'); if (b) b.innerHTML = '<button type="button" class="rd-b" data-act="view" aria-label="' + esc(t.view) + '">📖</button><button type="button" class="rd-b' + (Q.hide ? ' on' : '') + '" data-act="hide" aria-label="hidden">' + (Q.hide ? '🙈' : '👁') + '</button><button type="button" class="rd-b" data-act="hw" title="' + esc(t.hintW) + '">›</button><button type="button" class="rd-b" data-act="ha" title="' + esc(t.hintA) + '">»</button><button type="button" class="rd-b' + (PL ? ' on' : '') + '" data-act="rec" title="' + esc(t.rec) + '">' + (PL ? IC_STOP : IC_PLAY) + '</button>';
    var m = $('rdMic'); if (m) m.classList.toggle('on', !!R.listening);
    var sd = $('rdSaid'); if (sd) sd.textContent = R.err || R.said || (R.listening ? '' : t.tap);
    if (R.err && sd) sd.style.color = '#c0392b'; else if (sd) sd.style.color = '';
  }
  function toast(m) { var e = $('rdToast'); if (!e) return; e.textContent = m; e.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(function () { e.style.display = 'none'; }, 1600); }
  function sheetView(sub) {
    var t = L(), sh = $('rdSheet'), sb = $('rdSb'); sh.hidden = false; sb._ay = null;
    function opt(m, ic, nm, sd) { return '<button type="button" class="rd-opt' + (Q.mode === m ? ' on' : '') + '" data-act="mode" data-m="' + m + '"><span>' + ic + '</span><span style="flex:1">' + esc(nm) + (sd ? '<small style="display:block;color:#888;font-size:12px">' + esc(sd) + '</small>' : '') + '</span><i></i></button>'; }
    function sw(act, on, nm, id) { return '<button type="button" class="rd-opt' + (on ? ' on' : '') + '" data-act="' + act + '"' + (id ? ' id="' + id + '"' : '') + '><span style="flex:1">' + esc(nm) + '</span><i></i></button>'; }
    function sl(id, nm, mn, mx, v) { return '<div style="margin:10px 0"><div>' + esc(nm) + '</div><input type="range" min="' + mn + '" max="' + mx + '" value="' + v + '" id="' + id + '" style="width:100%"></div>'; }
    if (sub === 'mtype') {
      sb.innerHTML = '<h3><button type="button" class="rd-ib" data-act="fmtBack" style="color:#222">‹</button> ' + esc(t.mtype) + '</h3>' + '<button type="button" class="rd-opt' + (!Q.taj ? ' on' : '') + '" data-act="taj" data-taj="0"><span>📖</span><span style="flex:1">' + esc(t.madinah) + '</span><i></i></button>' + '<button type="button" class="rd-opt' + (Q.taj ? ' on' : '') + '" data-act="taj" data-taj="1"><span>🎨</span><span style="flex:1">' + esc(t.taj) + '</span><i></i></button>' + sl('rdGap', t.gap, 18, 34, Math.round(Q.gap * 10));
      var g = $('rdGap'); if (g) g.oninput = function () { Q.gap = +this.value / 10; saveQ(); try { frame.contentDocument.documentElement.style.setProperty('--lh', String(Q.gap)); } catch (e) {} };
      return;
    }
    sb.innerHTML = '<h3>' + esc(t.fmt) + '</h3><div style="color:#888;margin:4px 0">' + esc(t.rmode) + '</div>' +
      opt('mushaf', '📖', t.mushaf, t.mushafSub) + opt('text', '📄', t.text, t.textSub) + opt('tr', '🌐', t.tr, t.trSub) +
      '<button type="button" class="rd-opt" data-act="mtype"><span>🕌</span><span style="flex:1">' + esc(t.mtype) + '</span><span>›</span></button>' +
      (Q.mode !== 'mushaf' ? sl('rdFont', t.fontAr, 22, 48, Q.font) + sw('tjt', Q.tjt, t.taj) : '') +
      (Q.mode === 'tr' ? sw('tl', Q.tl, t.tlOn) + sw('trOn', Q.trOn, t.trOn) +
        '<button type="button" class="rd-opt" data-act="trPick"><span>⚙</span><span style="flex:1">' + esc(t.trOf) + ': ' + esc(D().edInfo(D().curEd())[1]) + '</span><span>›</span></button>' + sl('rdTf', t.fontTr, 12, 30, Q.tfont) : '') +
      '<div style="margin:12px 0 4px">' + esc(t.hcol) + '</div><div style="display:flex;gap:12px;margin-bottom:6px">' + HC.map(function (c, i) { return '<button type="button" data-act="hc" data-i="' + i + '" aria-label="' + i + '" style="width:38px;height:38px;border-radius:50%;border:3px solid ' + (Q.hc === i ? '#222' : 'transparent') + ';background:rgba(' + c + ',.75);box-shadow:0 0 0 1px #ddd"></button>'; }).join('') + '</div>' +
      '<button type="button" class="rd-opt" data-act="recPick"><span>🎙</span><span style="flex:1">' + esc(t.recPick) + ': ' + esc(recName()) + '</span><span>›</span></button>' +
      '<button type="button" class="rd-opt' + (Q.asr ? ' on' : '') + '" data-act="asr" id="rdAsr"><span>🎯</span><span style="flex:1">' + esc(asrLabel()) + '</span><i></i></button><div style="color:#888;font-size:12px">' + esc(t.asrHint) + '</div>';
    var f = $('rdFont'); if (f) f.oninput = function () { Q.font = +this.value; saveQ(); [].slice.call(document.querySelectorAll('#rdText .rd-ws')).forEach(function (e) { e.style.fontSize = Q.font + 'px'; }); };
    var tf = $('rdTf'); if (tf) tf.oninput = function () { Q.tfont = +this.value; saveQ(); [].slice.call(document.querySelectorAll('#rdText .rd-tr')).forEach(function (e) { e.style.fontSize = Q.tfont + 'px'; }); };
  }
  function asrLabel() {
    var t = L(), A = window.hifzASR; if (!A) return t.asr;
    var s = A.state();
    if (s.state === 'loading') return t.asrLoad + ' ' + num(s.pct) + '%';
    if (s.state === 'error') return t.asrErr;
    return A.ready() ? (Q.asr ? t.asrOn : t.asrOff) : t.asr;
  }
  function toggleAsr() {
    var A = window.hifzASR; if (!A) return;
    var upd = function () { var b = $('rdAsr'); if (b) { b.className = 'rd-opt' + (Q.asr ? ' on' : ''); b.children[1].textContent = asrLabel(); } };
    if (A.ready()) { Q.asr = Q.asr ? 0 : 1; saveQ(); if (R && R.listening) { stopListen(true); startListen(); } return upd(); }
    A.onState(upd);
    A.load().then(function () { Q.asr = 1; saveQ(); upd(); }).catch(function () { upd(); });
    upd();
  }
  var marksTab = 'p';
  function surahOfPage(p) { var n = 1; if (startPages) for (var i = 0; i < startPages.length; i++) if (startPages[i] <= p) n = i + 1; return n; }
  function sheetMarks() {
    var t = L(), sb = $('rdSb'), sh = $('rdSheet'), d = D(); sh.hidden = false; sb._ay = null;
    var al = bmList().map(function (k) { var x = String(k).split(':'); return { k: k, s: +x[0], a: +x[1], p: +x[2] || 0 }; }).filter(function (x) { return x.s > 0 && x.a > 0; });
    function card(inner) { return '<div style="display:flex;align-items:center;gap:12px;border:1.5px solid #e6e2e2;border-radius:16px;padding:12px;margin:9px 0;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.05)">' + inner + '</div>'; }
    function badge(txt) { return '<div style="min-width:46px;height:46px;border-radius:13px;background:#eaf5ee;color:#1f7a4a;display:grid;place-items:center;font-weight:700;font-size:15px">' + txt + '</div>'; }
    function del(attr) { return '<button type="button" ' + attr + ' aria-label="x" style="border:0;background:#f3eeee;color:#a33;width:34px;height:34px;border-radius:50%;font-size:18px;line-height:1">×</button>'; }
    function tab(k, nm, n) { return '<button type="button" data-act="mkTab" data-t="' + k + '" style="flex:1;border:0;border-radius:11px;padding:9px;font:inherit;font-weight:700;background:' + (marksTab === k ? '#1f7a4a' : 'transparent') + ';color:' + (marksTab === k ? '#fff' : '#555') + '">' + nm + ' (' + num(n) + ')</button>'; }
    var h = '<h3>🔖 ' + esc(t.marks) + '</h3><div style="display:flex;gap:4px;background:#f1eeee;padding:4px;border-radius:14px;margin:6px 0 10px">' + tab('p', esc(t.mkPages), pageMarks.length) + tab('a', esc(t.mkAyahs), al.length) + '</div>';
    if (marksTab === 'p') {
      h += pageMarks.length ? pageMarks.map(function (p) { var sn = surahOfPage(p); return card('<button type="button" data-act="openMark" data-p="' + p + '" style="display:flex;align-items:center;gap:12px;flex:1;border:0;background:none;font:inherit;text-align:start;padding:0">' + badge(num(p)) + '<span style="flex:1"><b>' + esc(d.sname(sn)) + '</b><small style="display:block;color:#888">' + esc(t.mkPage) + ' ' + num(p) + '</small></span></button>' + del('data-act="mkDelP" data-p="' + p + '"')); }).join('') : '<div style="padding:28px 10px;color:#888;text-align:center">' + esc(t.mkNoP) + '</div>';
    } else {
      h += al.length ? al.map(function (x) { return card('<button type="button" data-act="openMark" data-p="' + (x.p || 1) + '" style="display:flex;align-items:center;gap:12px;flex:1;border:0;background:none;font:inherit;text-align:start;padding:0">' + badge(num(x.s) + ':' + num(x.a)) + '<span style="flex:1;min-width:0"><b>' + esc(d.sname(x.s)) + '</b><small style="display:block;color:#888">' + esc(t.mkAyah) + ' ' + num(x.a) + (x.p ? ' · ' + esc(t.mkPage) + ' ' + num(x.p) : '') + '</small><span class="rd-mt" data-s="' + x.s + '" data-a="' + x.a + '" dir="rtl" style="display:block;color:#333;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:Amiri,serif"></span></span></button>' + del('data-act="mkDelA" data-k="' + esc(x.k) + '"')); }).join('') : '<div style="padding:28px 10px;color:#888;text-align:center">' + esc(t.mkNoA) + '</div>';
    }
    sb.innerHTML = h;
    if (marksTab === 'a') [].slice.call(sb.querySelectorAll('.rd-mt')).forEach(function (el) { var s0 = +el.getAttribute('data-s'), a0 = +el.getAttribute('data-a'); Promise.resolve(d.ensureSura(s0)).then(function () { var tx = d.TEXT[s0] && d.TEXT[s0][a0 - 1]; if (tx) el.textContent = tx; }).catch(function () {}); });
  }
  function sheetTr() {
    var d = D(), t = L(), sb = $('rdSb'); sb._ay = null;
    sb.innerHTML = '<h3>' + esc(t.trPick) + '</h3><input class="rd-in" id="rdTq" type="search" placeholder="' + esc(t.search) + '"><div id="rdTl"></div>';
    function list(q) {
      d.loadEds().then(function (l) {
        var cur = d.curEd(), g = {}, ql = (q || '').toLowerCase(), pref = { Kurdish: 0, Arabic: 1, English: 2 };
        l.forEach(function (e) { if (ql && (e[1] + ' ' + e[2]).toLowerCase().indexOf(ql) < 0) return; (g[e[2] || '—'] = g[e[2] || '—'] || []).push(e); });
        var ns = Object.keys(g).sort(function (a, b) { return (pref[a] != null ? pref[a] : 9) - (pref[b] != null ? pref[b] : 9) || a.localeCompare(b); });
        $('rdTl').innerHTML = ns.map(function (n) { return '<div style="color:#888;margin:10px 0 2px;font-size:13px">' + esc(n) + '</div>' + g[n].map(function (e) { return '<button type="button" class="rd-opt' + (e[0] === cur ? ' on' : '') + '" data-act="trSet" data-e="' + esc(e[0]) + '"><span>' + esc(e[1]) + '</span><i></i></button>'; }).join(''); }).join('');
      });
    }
    list(''); $('rdTq').oninput = function () { list(this.value); };
  }
  function onClick(e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
    if (a === 'closeSheet') { if (e.target.closest('[data-stop]')) return; var was = !!($('rdSb') && $('rdSb')._ay); ayahAct('closeSheet2'); $('rdSheet').hidden = true; if (was) setUi(false); if (marksFromHome) { marksFromHome=false; showHome(); } return; }
    if (/^(aFrom|aListen|aTr|aTaf|aBm|aSim|aCopy|aShare|closeSheet2)$/.test(a)) { ayahAct(a, b); return; }
    if (a === 'exit' || a === 'exitHome') return leave();
    if (a === 'pageBm') { if (R) { togglePageMark(R.page); toast(pageMarked(R.page) ? 'لاپەڕەکە نیشان کرا ✓' : 'نیشانەی لاپەڕە لابرا'); } return; }
    if (a === 'showMarks') { var rh=$('rdHome'); marksFromHome=!!(rh && !rh.hidden); if(rh)rh.hidden=true; return sheetMarks(); }
    if (a === 'openMark') { var mp=+b.getAttribute('data-p'); marksFromHome=false; var hm=$('rdHome'); if(hm)hm.hidden=true; $('rdSheet').hidden=true; return load(mp); }
    if (a === 'openSurah') { var sn=+b.getAttribute('data-s'), sp=(startPages && startPages[sn-1]) || 1; var hm2=$('rdHome'); if(hm2)hm2.hidden=true; return load(sp); }
    if (a === 'mic') { if (!R) return; return R.listening ? stopListen() : startListen(); }
    if (a === 'next') return load(R.page + 1);
    if (a === 'prev') return load(R.page - 1);
    if (a === 'hide') { Q.hide = Q.hide ? 0 : 1; saveQ(); applyAll(); paintFoot(); toast(Q.hide ? L().hidOn : L().hidOff); return; }
    if (a === 'rec') { if (R._lp) { R._lp = 0; return; } return recToggle(); }
    if (a === 'recSet') { Q.rec = b.getAttribute('data-r'); saveQ(); var was = !!PL; if (was) recStop(); $('rdSheet').hidden = true; toast(recName()); if (was) recToggle(); return; }
    if (a === 'recPick') return sheetRec();
    if (a === 'hc') { Q.hc = +b.getAttribute('data-i'); saveQ(); hlUpdate(); return sheetView(); }
    if (a === 'mkTab') { marksTab = b.getAttribute('data-t'); return sheetMarks(); }
    if (a === 'mkDelP') { var dp = +b.getAttribute('data-p'), di = pageMarks.indexOf(dp); if (di >= 0) pageMarks.splice(di, 1); savePageMarks(); paintPageMark(); return sheetMarks(); }
    if (a === 'mkDelA') { var l2 = bmList(), k2 = b.getAttribute('data-k'); l2 = l2.filter(function (x) { return x !== k2; }); try { localStorage.setItem('ayah_bookmarks', JSON.stringify(l2)); } catch (e) {} return sheetMarks(); }
    if (a === 'hw') return hintWord(false);
    if (a === 'ha') return hintWord(true);
    if (a === 'view') return sheetView();
    if (a === 'mode') { Q.mode = b.getAttribute('data-m'); saveQ(); fr_show(); var tx = $('rdText'); if (tx) tx.style.display = Q.mode === 'mushaf' ? 'none' : 'block'; paintTr(); sheetView(); return; }
    if (a === 'tl') { Q.tl = Q.tl ? 0 : 1; saveQ(); paintTr(); return sheetView(); }
    if (a === 'trOn') { Q.trOn = Q.trOn ? 0 : 1; saveQ(); paintTr(); return sheetView(); }
    if (a === 'tjt') { Q.tjt = Q.tjt ? 0 : 1; saveQ(); $('rdSheet').hidden = true; return load(R.page); }
    if (a === 'trRetry') return paintTr();
    if (a === 'mtype') return sheetView('mtype');
    if (a === 'fmtBack') return sheetView();
    if (a === 'taj') { Q.taj = b.getAttribute('data-taj') === '1' ? 1 : 0; saveQ(); return sheetView('mtype'); }
    if (a === 'asr') return toggleAsr();
    if (a === 'trPick') return sheetTr();
    if (a === 'trSet') { D().P.tr = b.getAttribute('data-e'); D().save(); $('rdSheet').hidden = true; paintTr(); return; }
  }
  window.addEventListener('message', function (e) {
    if (!frame || e.source !== frame.contentWindow || !e.data || !R) return;
    if (e.data.ready && !R.ready) return onReady();
    if (e.data.tap) { if ($('rdSheet').hidden) setUi(!R.ui); else ayahAct('closeSheet2'); return; }
    if (e.data.hold && R.ready) { var h = e.data.hold, ay = null; R.ays.forEach(function (a) { if (a.s === h[0] && a.a === h[1]) ay = a; }); if (ay) ayahSheet(ay); }
  });
  function leave() {
    stopListen(true); recStop(); clearInterval(tick); loadId++;
    var v = $('hifzReadView'); if (v) { v.hidden = true; v.innerHTML = ''; }
    R = null; frame = null;
    if (typeof window.enterHifz === 'function') window.enterHifz();
  }
  window.enterHifzRead = function (pg) {
    css(); shell();
    clearInterval(tick); tick = setInterval(function () { if (R && R.listening) paintFoot(); }, 1000);
    if (pg) load(pg); else { R = null; showHome(); }
  };
  if (window.__HIFZ_TEST) window.__HIFZ_READ = { R: function () { return R; }, onSpeech: onSpeech, align: align };
})();
