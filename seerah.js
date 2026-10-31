/* seerah.js v1 — سیرەی پێغەمبەر ﷺ */
(function () {
  if (window.__seerahV1) return;
  window.__seerahV1 = true;

  var BM_KEY = 'seerah_bm_v1';
  var CHAPTERS = [
    {"id": "nasab", "ku": "ڕەچەڵەک و پێش لەدایکبوون", "ar": "النسب وما قبل الولادة", "ku_body": "پێغەمبەر محمد ﷺ لە خێڵی قورەیش و بنەماڵەی بەنوو هاشم بوو. باوکی عەبدوڵڵا کوڕی عەبدولموتەڵیب بوو، دایکی ئامینە کچی وەهب. باوکی پێش لەدایکبوونی کۆچی دوایی کرد. پێغەمبەر ﷺ لە ساڵی فیل (نزیکەی ٥٧٠ی زایینی) لە مەککە لەدایک بوو.", "ar_body": "هو محمد بن عبد الله بن عبد المطلب من بني هاشم من قريش. توفي أبوه قبل مولده، وأمه آمنة بنت وهب. ولد ﷺ بمكة عام الفيل نحو سنة ٥٧٠م."},
    {"id": "wilada", "ku": "لەدایکبوون و منداڵی", "ar": "الولادة والطفولة", "ku_body": "دوای لەدایکبوون، حەلیمەی سەعدییە شیرەی دا. دایکی لە تەمەنی شەش ساڵیدا کۆچی دوایی کرد، پاشان باپیرەی عەبدولموتەڵیب چاودێری کرد، دوای مردنی باپیرە، مامی ئەبوو تالیب سەرپەرشتی کرد. لە منداڵیدا بە ڕاستگۆیی و متمانەپێکراوی ناسرابوو.", "ar_body": "أرضعته حليمة السعدية. توفيت أمه وهو ابن ست سنين، فكفله جده عبد المطلب ثم عمه أبو طالب. عُرف في صباه بالصدق والأمانة."},
    {"id": "shabab", "ku": "گەنجی و هاوسەرگیری لەگەڵ خەدیجە", "ar": "الشباب والزواج من خديجة", "ku_body": "پێش پێغەمبەرایەتی بە «ئەلئەمین» (متمانەپێکراو) ناسرابوو. بۆ خەدیجە ڕەزا کە ساڵح و بازرگانی بوو کاری بازرگانی کرد. خەدیجە پێشنیاری هاوسەرگیری کرد؛ یەکەم ژنی بوو و تا مردنی خەدیجە ژنی تری نەهێنا. منداڵەکانیان: قاسم، عەبدوڵڵا، زەینەب، ڕوقەیە، ئوم کەلسوم، فاتیمە.", "ar_body": "عُرف قبل النبوة بالأمين. عمل في تجارة خديجة رضي الله عنها ثم تزوجها. لم يتزوج عليها حتى توفيت. من أولادهما: القاسم وعبد الله وزينب ورقية وأم كلثوم وفاطمة."},
    {"id": "wahy", "ku": "دەستپێکی وەحی", "ar": "بدء الوحي", "ku_body": "لە تەمەنی ٤٠ ساڵیدا، لە ئەشکەوتی حیرا جبریل ﷺ هات و یەکەم ئایەتەکانی سورەتی عەلەق هاتن: «بخوێنەوە بە ناوی پەروەردگارت…». پێغەمبەر ﷺ ترسا؛ خەدیجە دڵنیای کردەوە و وەرەقە کوڕی نەوفەڵ باسی پێغەمبەرایەتی کرد. بۆ ماوەیەک وەحی وەستا، پاشان بەردەوام بوو.", "ar_body": "نزل عليه الوحي وهو ابن أربعين في غار حراء بأول ما نزل من سورة العلق. فزع ﷺ فطمأنته خديجة وأخبرها ورقة بن نوفل بشأن النبوة. ثم فتر الوحي ثم تتابع."},
    {"id": "daawa", "ku": "بانگەوازی نهێنی و ئاشکرا", "ar": "الدعوة السرية والجهرية", "ku_body": "سێ ساڵ بانگەوازی نهێنی بوو؛ یەکەم موسڵمانان: خەدیجە، عەلی، زەید، ئەبووبەکر. پاشان بانگەوازی ئاشکرا دەستی پێکرد. قورەیش دوژمنایەتییان کرد. موسڵمانان ئازار دران؛ هەندێک کۆچیان کرد بۆ حەبەشە.", "ar_body": "كانت الدعوة سرية ثلاث سنين، وأول من أسلم خديجة وعلي وزيد وأبو بكر. ثم جهر بالدعوة، فآذته قريش واضطهد المسلمون، وهاجر بعضهم إلى الحبشة."},
    {"id": "habasha", "ku": "کۆچی حەبەشە", "ar": "الهجرة إلى الحبشة", "ku_body": "بۆ پاراستنی دین، گرووپێک لە موسڵمانان کۆچیان کرد بۆ حەبەشە لەژێر پاشای عەدل (نەجاشی). دووجار کۆچ ڕوویدا. نەجاشی ڕێزی لێگرتن و ڕەتی کردنەوەی داواکاری قورەیش بۆ گەڕاندنەوەیان.", "ar_body": "هاجر جماعة من الصحابة إلى الحبشة عند النجاشي مرتين. أحسن استقبالهم ورفض تسليمهم لقريش."},
    {"id": "huzn", "ku": "ساڵی خەم (عام الحزن)", "ar": "عام الحزن", "ku_body": "لە یەک ساڵدا خەدیجە ڕەزا و ئەبوو تالیب کۆچی دواییان کرد. پاراستنی مامی نەما و پشتگیری خەدیجە نەما. پێغەمبەر ﷺ ڕۆیشت بۆ تایف؛ خەڵکی تایف ڕەتیان کردەوە و ئازاریان دا. خوا فریشتەی چیاکانی بۆ نارد، بەڵام ئەو داوای تێکدانی خەڵکی نەکرد.", "ar_body": "توفيت خديجة وأبو طالب في عام واحد. خرج إلى الطائف فردوه وآذوه. عرض عليه ملك الجبال أن يطبق عليهم الأخشبين فأبى ﷺ."},
    {"id": "isra", "ku": "ئیسرا و میعراج", "ar": "الإسراء والمعراج", "ku_body": "شەوێک لە مەسجیدی حەرامەوە بۆ مەسجیدی ئەقسا بردرا (ئیسرا)، پاشان بۆ ئاسمانەکان (میعراج). نوێژی پێنج کاتی فەرز کرا. ئەم ڕووداوە تاقیکردنەوەی ئیمان بوو بۆ موسڵمانان.", "ar_body": "أسري به من المسجد الحرام إلى المسجد الأقصى ثم عرج به إلى السماء، وفرضت الصلوات الخمس. كان ذلك فتنة وتمحيصاً للإيمان."},
    {"id": "hijra", "ku": "کۆچی بۆ مەدینە", "ar": "الهجرة إلى المدينة", "ku_body": "دوای بەیعەتی عەقەبە، موسڵمانان کۆچیان کرد بۆ یەسریب (مەدینە). پێغەمبەر ﷺ لەگەڵ ئەبووبەکر کۆچی کرد؛ لە ئەشکەوتی سەور مانەوە. گەیشتنە قوبا، مەسجیدی قوبا دروست کرا، پاشان مەدینە. ساڵی کۆچ دەستپێکی مێژووی کۆچی بوو.", "ar_body": "بعد بيعة العقبة هاجر المسلمون إلى يثرب. هاجر النبي ﷺ مع أبي بكر ونزلا غار ثور ثم قباء فالمدينة. منها بدأ التأريخ الهجري."},
    {"id": "madina", "ku": "دامەزراندنی کۆمەڵگای مەدینە", "ar": "بناء مجتمع المدينة", "ku_body": "مەسجد دروست کرا، برایەتی نێوان موهاجیر و ئەنسار، پەیماننامەی مەدینە لەگەڵ جوولەکە و هۆزەکان. ژیانی کۆمەڵایەتی و سیاسی لەسەر بنەمای ئیسلام ڕێکخرا.", "ar_body": "بنى المسجد وآخى بين المهاجرين والأنصار وكتب الصحيفة مع يهود المدينة، فنظم المجتمع على أساس الإسلام."},
    {"id": "badr", "ku": "جەنگی بەدر", "ar": "غزوة بدر", "ku_body": "ساڵی ٢ی کۆچی، جەنگی بەدر: موسڵمانان کەمتر بوون بەڵام سەرکەوتن. یەکەم جەنگی گەورەی نێوان ئیسلام و قورەیش. زۆر لە سەرکردەکانی قورەیش کوژران یان دیل کران.", "ar_body": "في السنة الثانية غزوة بدر؛ انتصر المسلمون مع قلة عددهم، وقتل وأسر كثير من صناديد قريش."},
    {"id": "uhud", "ku": "جەنگی ئوحود", "ar": "غزوة أحد", "ku_body": "ساڵی ٣ی کۆچی، قورەیش بۆ تۆڵەگرتن هاتن. موسڵمانان لە سەرەتادا سەرکەوتن، بەڵام هەندێک تیرهاوێژ شوێنی خۆیان جێهێشت؛ خەسارەی گەورە؛ حەمزە ڕەزا شەهید بوو. پێغەمبەر ﷺ بریندار بوو.", "ar_body": "في السنة الثالثة؛ انتصر المسلمون أولاً ثم خالف الرماة أمر النبي فكانت الهزيمة، واستشهد حمزة رضي الله عنه، وجرح النبي ﷺ."},
    {"id": "khandaq", "ku": "جەنگی خەندەق (ئەحزاب)", "ar": "غزوة الخندق", "ku_body": "ساڵی ٥ی کۆچی، هۆزەکان کۆبوونەوە بۆ هێرش بۆ مەدینە. بە ئامۆژگاری سەلمانی فارسی خەندەق هەڵکەندرا. دوای گەمارۆ، خوا با و ترس نارد؛ دوژمن پاشەکشێی کرد.", "ar_body": "في السنة الخامسة تحزبت الأحزاب على المدينة، فحفر الخندق بمشورة سلمان، ثم صرفهم الله بالريح والرعب."},
    {"id": "hudaybiya", "ku": "پەیمانی حودەیبە", "ar": "صلح الحديبية", "ku_body": "ساڵی ٦ی کۆچی، پێغەمبەر ﷺ بۆ عومرە ڕۆیشت؛ قورەیش ڕێگەیان نەدا. پەیمانێک واژوو کرا کە لە سەرەتادا قورس دیار بوو، بەڵام خوا «سەرکەوتنی ئاشکرا»ی ناودێر کرد. دوای ئەوە بانگەوازی ئیسلام فراوان بوو.", "ar_body": "في السنة السادسة صدّته قريش عن العمرة، فوقع صلح الحديبية، وسماه الله فتحاً مبيناً، واتسعت الدعوة بعده."},
    {"id": "fath", "ku": "فەتحی مەککە", "ar": "فتح مكة", "ku_body": "ساڵی ٨ی کۆچی، دوای شکاندنی پەیمان لەلایەن قورەیش، پێغەمبەر ﷺ لەگەڵ سوپایەکی گەورە هاتە مەککە. فەتحێکی ئاشتیخوازانە؛ زۆر کەس ئیسلامیان هێنا. بتەکانی کەعبە تێکدران. گشتی لێخۆشبوون بۆ خەڵکی مەککە.", "ar_body": "في السنة الثامنة بعد نقض قريش العهد دخل النبي ﷺ مكة فاتحاً، وعفا عن أهلها، وكسرت الأصنام."},
    {"id": "wada", "ku": "حەجی ماڵئاوایی", "ar": "حجة الوداع", "ku_body": "ساڵی ١٠ی کۆچی، پێغەمبەر ﷺ حەجی کرد و وتارە بەناوبانگەکەی دا: مافەکان، ڕەگەزپەرستی نەهێشتن، مافی ژن، وەدیعەتی قورئان و سوننەت. فەرمووی: «ئەمڕۆ دینگەلەکەتان تەواو کردم…».", "ar_body": "في السنة العاشرة حج ﷺ وخطب خطبة الوداع في الحقوق وترك العنصرية وحقوق النساء والتمسك بالكتاب والسنة، ونزل: اليوم أكملت لكم دينكم."},
    {"id": "wafat", "ku": "نەخۆشی و وەفات", "ar": "المرض والوفاة", "ku_body": "ساڵی ١١ی کۆچی نەخۆش کەوت؛ لە ماڵی عائیشە ڕەزا وەفاتی کرد، لە تەمەنی ٦٣ ساڵیدا. لە ژوورەکەی عائیشە بەخاک سپێردرا. ئەبووبەکر ڕەزا خەڵکی ئارام کردەوە: «هەر کەس محمد بپەرستێت، محمد مردووە؛ هەر کەس خوا بپەرستێت، خوا زیندووە و نامرێت».", "ar_body": "في السنة الحادية عشرة مرض ﷺ وتوفي في بيت عائشة وهو ابن ثلاث وستين، ودفن في حجرتها. وخطب أبو بكر: من كان يعبد محمداً فإن محمداً قد مات، ومن كان يعبد الله فإن الله حي لا يموت."},
    {"id": "akhlaq", "ku": "ئەخلاق و سیفاتی پێغەمبەر", "ar": "أخلاقه وصفاته ﷺ", "ku_body": "قورئان دەفەرموێت: «تۆ لەسەر ئەخلاقێکی بەرزیت». ڕاستگۆ، متمانەپێکراو، میهرەبان لەگەڵ منداڵ و هەژاران، لەگەڵ دوژمنیش دادپەروەر. خواردن و جلوبەرگی سادە، زۆر نوێژ و ڕۆژوو، لێخۆشبوون و سەبر.", "ar_body": "قال تعالى: وإنك لعلى خلق عظيم. كان صادقاً أميناً رحيماً عادلاً، زاهداً في الدنيا، كثير العبادة، عفواً صبوراً."}
  ];

  var state = { view: 'home', chapter: null, query: '' };

  function bookmarks() {
    try {
      var a = JSON.parse(localStorage.getItem(BM_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function saveBm(arr) {
    try { localStorage.setItem(BM_KEY, JSON.stringify(arr.slice(0, 50))); } catch (e) {}
  }
  function isBm(id) { return bookmarks().indexOf(id) >= 0; }
  function toggleBm(id) {
    var a = bookmarks();
    var i = a.indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.unshift(id);
    saveBm(a);
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

  function injectCss() {
    if ($('seerahCss')) return;
    var s = document.createElement('style');
    s.id = 'seerahCss';
    s.textContent = [
      'body:has(#seerahView.active) .top{display:none!important}',
      '.phone:has(#seerahView.active) .status,.phone:has(#seerahView.active) .appbar,.phone:has(#seerahView.active) .bottom{display:none!important}',
      '.phone:has(#seerahView.active) .main{height:100%!important;padding:0!important;background:#f5f7fa}',
      '#seerahView{display:none!important}',
      '#seerahView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#seerahView .sr-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a2744,#2c4a7c);color:#fff;flex-shrink:0}',
      '#seerahView .sr-head h2{margin:0;font-size:17px;font-weight:800}',
      '#seerahView .sr-head .sr-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#seerahView .sr-btn{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#seerahView .sr-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#seerahView .sr-card{background:#fff;border:1px solid #d0d8e8;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-align:right}',
      '#seerahView .sr-card:active{background:#eef2f8}',
      '#seerahView .sr-card b{display:block;font-size:15px;color:#1a2744;margin-bottom:4px}',
      '#seerahView .sr-card small{color:#5a6a8a;font-size:12px}',
      '#seerahView .sr-ar{font-family:serif;font-size:17px;line-height:1.9;text-align:right;color:#1a2e24;direction:rtl;margin-top:10px;padding-top:10px;border-top:1px dashed #d0d8e8}',
      '#seerahView .sr-ku{font-size:15px;line-height:1.9;color:#1a2e24;text-align:right;direction:rtl}',
      '#seerahView .sr-label{font-size:11px;color:#5a6a8a;font-weight:700;margin-bottom:4px}',
      '#seerahView .sr-search{display:flex;gap:8px;margin-bottom:12px}',
      '#seerahView .sr-search input{flex:1;border:1px solid #d0d8e8;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;background:#fff}',
      '#seerahView .sr-search button{border:0;background:#2c4a7c;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}',
      '#seerahView .sr-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
      '#seerahView .sr-actions button{border:1px solid #d0d8e8;background:#fff;border-radius:10px;padding:8px 12px;font-size:13px;cursor:pointer;color:#1a2744}',
      '#seerahView .sr-empty{text-align:center;color:#5a6a8a;padding:30px 10px;font-size:14px}',
      '#seerahView .sr-note{font-size:12px;color:#5a6a8a;text-align:center;margin-top:12px;line-height:1.6}',
      '.section-choice.seerah-choice{border-color:#d0d8e8;background:linear-gradient(135deg,#fff,#eef2f8)}',
      '.section-choice.seerah-choice .choice-icon{background:#d8e2f0;color:#2c4a7c}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('seerahView');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'seerahView';
    v.className = 'view';
    main.appendChild(v);
    return v;
  }

  function filtered() {
    var q = (state.query || '').trim().toLowerCase();
    if (!q) return CHAPTERS.slice();
    return CHAPTERS.filter(function (c) {
      var hay = (c.ku + ' ' + c.ar + ' ' + c.ku_body + ' ' + c.ar_body).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function title() {
    if (state.view === 'detail' && state.chapter) return state.chapter.ku;
    if (state.view === 'bookmarks') return 'نیشانەکراوەکان';
    return 'سیرەی پێغەمبەر ﷺ';
  }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var head =
      '<div class="sr-head"><div><h2>☪ ' + esc(title()) + '</h2><div class="sr-sub">ژیاننامەی پێغەمبەر محمد ﷺ · کوردی و عەرەبی</div></div>' +
      '<div style="display:flex;gap:6px">' +
      (state.view !== 'home' ? '<button type="button" class="sr-btn" data-act="back">‹ گەڕانەوە</button>' : '') +
      '<button type="button" class="sr-btn" data-act="bm">★</button>' +
      '<button type="button" class="sr-btn" data-act="home">بەشەکان</button></div></div>';

    var body = '<div class="sr-body">';

    if (state.view === 'detail' && state.chapter) {
      var c = state.chapter;
      body += '<div class="sr-card" style="cursor:default">';
      body += '<b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small>';
      body += '<div style="margin-top:12px"><div class="sr-label">کوردی</div><div class="sr-ku">' + esc(c.ku_body) + '</div></div>';
      body += '<div class="sr-ar"><div class="sr-label">العربية</div>' + esc(c.ar_body) + '</div>';
      body += '<div class="sr-actions">';
      body += '<button type="button" data-act="toggleBm">' + (isBm(c.id) ? '★ لابردنی نیشانە' : '☆ نیشانەکردن') + '</button>';
      body += '</div></div>';
      body += '<div class="sr-note">⚠️ کورتەی فێرکارییە بۆ تێگەیشتن. بۆ وردەکاری زیاتر بڕوانە کتێبەکانی سیرەی متمانەپێکراو.</div>';
    } else if (state.view === 'bookmarks') {
      var ids = bookmarks();
      if (!ids.length) body += '<div class="sr-empty">هیچ نیشانەیەک نییە</div>';
      ids.forEach(function (id) {
        var ch = CHAPTERS.find(function (x) { return x.id === id; });
        if (!ch) return;
        body += '<div class="sr-card" data-ch="' + esc(ch.id) + '"><b>' + esc(ch.ku) + '</b><small>' + esc(ch.ar) + '</small></div>';
      });
    } else {
      body += '<div class="sr-search"><input id="srQ" placeholder="گەڕان لە سیرە..." value="' + esc(state.query) + '"><button type="button" data-act="searchGo">گەڕان</button></div>';
      body += '<div class="sr-note" style="margin:0 0 12px;text-align:right">قۆناغەکانی ژیانی پێغەمبەر ﷺ بە ڕیز</div>';
      var list = filtered();
      if (!list.length) body += '<div class="sr-empty">هیچ ئەنجامێک نەدۆزرایەوە</div>';
      list.forEach(function (ch, i) {
        body += '<div class="sr-card" data-ch="' + esc(ch.id) + '"><b>' + (i + 1) + '. ' + esc(ch.ku) + '</b><small>' + esc(ch.ar) + (isBm(ch.id) ? ' · ★' : '') + '</small></div>';
      });
    }

    body += '</div>';
    v.innerHTML = head + body;
  }

  function onClick(e) {
    var el = e.target.closest('[data-act],[data-ch]');
    if (!el || !$('seerahView') || !$('seerahView').contains(el)) return;

    var act = el.getAttribute('data-act');
    if (act === 'home') {
      var sv = $('seerahView');
      if (sv) sv.classList.remove('active');
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
      return;
    }
    if (act === 'back') {
      state.view = 'home';
      state.chapter = null;
      render();
      return;
    }
    if (act === 'bm') {
      state.view = 'bookmarks';
      render();
      return;
    }
    if (act === 'searchGo') {
      var inp = $('srQ');
      state.query = inp ? inp.value.trim() : '';
      render();
      return;
    }
    if (act === 'toggleBm' && state.chapter) {
      toggleBm(state.chapter.id);
      render();
      return;
    }

    var cid = el.getAttribute('data-ch');
    if (cid) {
      var ch = CHAPTERS.find(function (x) { return x.id === cid; });
      if (ch) {
        state.chapter = ch;
        state.view = 'detail';
        render();
      }
    }
  }

  window.enterSeerah = function () {
    injectCss();
    if (!ensureView()) return;
    state.view = 'home';
    if (typeof showView === 'function') showView('seerahView', 'سیرەی پێغەمبەر');
    render();
  };

  function dedupeCards(box) {
    var all = box.querySelectorAll('.seerah-choice');
    for (var i = 1; i < all.length; i++) {
      try { all[i].parentNode.removeChild(all[i]); } catch (e) {}
    }
    return all.length > 0;
  }

  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (dedupeCards(box)) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice seerah-choice';
    b.innerHTML = '<span class="choice-icon">☪</span><span class="choice-copy"><b>سیرەی پێغەمبەر ﷺ</b><small>ژیاننامە · کوردی و عەرەبی</small></span><span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterSeerah(); };
    var hadith = box.querySelector('.hadith-choice');
    if (hadith && hadith.nextSibling) box.insertBefore(b, hadith.nextSibling);
    else if (hadith) box.appendChild(b);
    else box.appendChild(b);
    dedupeCards(box);
    return true;
  }

  function start() {
    injectCss();
    if (!window.__seerahClickBound) {
      window.__seerahClickBound = true;
      document.addEventListener('click', onClick);
    }
    var n = 0;
    var iv = setInterval(function () { addCard(); if (++n > 25) clearInterval(iv); }, 300);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
