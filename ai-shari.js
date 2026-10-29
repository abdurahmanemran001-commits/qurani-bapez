/* ai-shari.js v3 — free offline shar'i Q&A (no API key, no payment) */
(function () {
  if (window.__aiShariV3) return;
  window.__aiShariV3 = true;

  var KEY = 'ai_shari_v1';
  var history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) { history = []; }

  /* ---- Offline knowledge (Kurdish) ---- */
  var KB = [
    {
      keys: ['نوێژی بەیانی', 'نوێژی سوبح', 'بەیانی چەند ڕکات', 'سوبح چەند'],
      a: 'نوێژی بەیانی (سوبح) ۲ ڕکاتی فەڕزە.\n\nپێش فەڕزەکە ۲ ڕکاتی سوننەتی موئەککەدە هەیە (زۆر گرنگە).\n\nکاتی: لە طلوعی فەجر تا طلوعی خۆر.'
    },
    {
      keys: ['نوێژی نیوەڕۆ', 'نوێژی ظھر', 'ظھر چەند', 'نیوەڕۆ چەند ڕکات'],
      a: 'نوێژی نیوەڕۆ (ظھر) ۴ ڕکاتی فەڕزە.\n\nپێش فەڕز: ۴ ڕکات سوننەت (یان ۲).\nدوای فەڕز: ۲ ڕکات سوننەت.\n\nکاتی: لە زوال تا ئەوەی سێبەر وەک خۆی ببێت (بەپێی مەزهەب جیاوازی هەیە).'
    },
    {
      keys: ['نوێژی عەسر', 'عصر چەند', 'عەسر'],
      a: 'نوێژی عەسر ۴ ڕکاتی فەڕزە.\n\nسوننەتی پێش/دوای عەسر وەک ظھر نییە بە هەمان شێوە؛ گرنگ فەڕزەکەیە لە کاتی خۆیدا.'
    },
    {
      keys: ['نوێژی مەغریب', 'مغرب چەند', 'مەغریب'],
      a: 'نوێژی مەغریب ۳ ڕکاتی فەڕزە.\n\nدوای فەڕز: ۲ ڕکات سوننەت.\n\nکاتی: لە ئاوابوونی خۆر تا غرووبی شەفەق.'
    },
    {
      keys: ['نوێژی عیشا', 'عشاء چەند', 'عیشا', 'عیشاء'],
      a: 'نوێژی عیشا ۴ ڕکاتی فەڕزە.\n\nدوای فەڕز: ۲ ڕکات سوننەت، پاشان ویتڕ (۱ یان ۳ ڕکات بەپێی مەزهەب).\n\nکاتی: لە غرووبی شەفەق تا نیوەی شەو (باشترین)، و تا فەجر درێژ دەبێتەوە بەڵام باشترە پێشتر بکرێت.'
    },
    {
      keys: ['ویتڕ', 'وتر', 'نوێژی وتر'],
      a: 'نوێژی ویتڕ سوننەتی موئەککەدەیە (یان واجیب لای حەنەفی).\n\nزۆرجار ۱ یان ۳ ڕکات دەکرێت. باشترە دوای عیشا و پێش خەوتن بکرێت.'
    },
    {
      keys: ['زیکری بەیانیان', 'أذکار الصباح', 'زیکری سەبەح', 'بەیانیان'],
      a: 'زیکری بەیانیان لە دوای نوێژی بەیانی تا طلوعی خۆر (یان تا پێش نیوەڕۆ) دەخوێنرێت.\n\nنموونە:\n• آیة الکرسی\n• سورەتی الإخلاص، الفلق، الناس (۳ جار)\n• سُبْحَانَ اللَّهِ وَبِحَمْدِهِ (۱۰۰ جار)\n• لا إله إلا الله وحده...\n\nلە بەشی «زیکرەکانم»ی ئەپەکەدا بەشی بەیانیان هەیە.'
    },
    {
      keys: ['زیکری ئێواران', 'أذکار المساء', 'ئێواران'],
      a: 'زیکری ئێواران لە دوای عەسر تا مەغریب (یان تا خەوتن) دەخوێنرێت.\n\nزۆر لە زیکرەکانی بەیانیان دووبارە دەبنەوە (آیة الکرسی، معوذتین، تەسبیح…).\n\nلە بەشی زیکرەکانم ببینە.'
    },
    {
      keys: ['زیکری خەوتن', 'پێش خەوتن', 'أذکار النوم'],
      a: 'پێش خەوتن:\n• آیة الکرسی\n• دووا دوو ئایەتی سورەتی البقرة\n• سورەتی الإخلاص، الفلق، الناس\n• «بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا»\n\nدەست لەسەر جەستە دەهێنرێت و دەخوێنرێت بەپێی سوننەت.'
    },
    {
      keys: ['ڕوقیە', 'رقیە', 'روقیە', 'ruqyah'],
      a: 'ڕوقیەی شەرعی: خوێندنەوەی قورئان و دوعای سەلەمێنراو بۆ پاراستن و شیفا.\n\nنموونە: الفاتحة، آیة الکرسی، کۆتایی البقرة، الإخلاص، الفلق، الناس.\n\n⚠️ تەنها بە قورئان و سوننەت؛ جێگەی پزیشک ناگرێتەوە.\n\nلە ئەپەکەدا بەشی «ڕوقیەی شەرعی» هەیە.'
    },
    {
      keys: ['تەوبە', 'توبه', 'استغفار', 'چۆن تەوبە'],
      a: 'تەوبەی ڕاست:\n۱) وازھێنان لە گوناه\n۲) پەشیمانی\n۳) بڕیاری دووبارە نەکردنەوە\n۴) ئەگەر مافی خەڵکی تێدابێت — گەڕاندنەوە یان داوای لێبوردن\n\nدوعا: «أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ»'
    },
    {
      keys: ['شەهادەت', 'کەلیمە', 'لا اله الا الله', 'ئیسلام چۆن'],
      a: 'کەلیمەی شەهادەت:\n«أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ»\n\nواتە: شایەتی دەدەم کە هیچ پەرستراوێک نییە جگە لە خوا، و محمد ﷺ پێغەمبەری خوایە.\n\nئەمە دەروازەی ئیسلامە.'
    },
    {
      keys: ['ڕۆژوو', 'صوم', 'رمضان', 'ڕەمەزان'],
      a: 'ڕۆژووی ڕەمەزان یەکێکە لە پایەکانی ئیسلام.\n\nلە فەجر تا مەغریب: خواردن، خواردنەوە و جماع نادرێت.\n\nنییەت پێویستە؛ خۆپاراستن لە درۆ و غەیبەتیش بەشێکە لە ڕۆژووی تەواو.'
    },
    {
      keys: ['زەکات', 'زکات'],
      a: 'زەکات پایەیەکی ئیسلامە: دەرکردنی ڕێژەیەک لە ماڵی دیاریکراو بۆ هەژاران کاتێک نصاب و ساڵ تێپەڕی.\n\nبۆ حیسابی ورد (زێڕ، پارە، بازرگانی) بۆ زانای متمانەپێکراو بڕۆ.'
    },
    {
      keys: ['حەج', 'عمرة', 'عومرە'],
      a: 'حەج پایەیەکی ئیسلامە بۆ کەسێک کە توانای جەستەیی و دارایی هەبێت یەک جار لە تەمەنیدا.\n\nعومرە سوننەتە و دەکرێت لە دەرەوەی وەعدەی حەج.\n\nبۆ مەناسیکە وردەکان کتێب/زانای متمانەپێکراو بپشکنە.'
    },
    {
      keys: ['وضو', 'ووزو', 'دەست نوێژ', 'وضوء'],
      a: 'ووزو (دەست نوێژ):\n۱) نییەت\n۲) شوشتنی دەم و لووت (سوننەت)\n۳) دەموچاو\n۴) دەستەکان تا ئانیشک\n۵) مسحی سەر\n۶) قاچەکان تا قولەپێ\n\nبە ڕیز و بێ پچڕانی درێژ.'
    },
    {
      keys: ['غوسڵ', 'غسل', 'حەمامی شەرعی'],
      a: 'غوسڵ: شوشتنی تەواوی جەستە بۆ جنابەت یان کۆتایی حەیض/نفاس.\n\nنییەت + شوشتنی دەم و لووت + ئاوی گەیاندن بە هەموو جەستە.'
    },
    {
      keys: ['قیبلە', 'قبلە', 'ئاڕاستەی نوێژ'],
      a: 'قیبلە: ئاڕاستەی کەعبەی پیرۆز لە مەککە.\n\nلە ئەپەکەدا لە بەشی «نوێژەکانم» قیبلەنما هەیە.'
    },
    {
      keys: ['چاو', 'حەسوودی', 'حسد', 'عین'],
      a: 'چاو و حەسوودی ڕاستن لە سوننەتدا.\n\nپاراستن: الفاتحة، آیة الکرسی، الفلق، الناس، و دوعای پاراستن.\n\nئەگەر شتێکی جوانت بینی: «اللَّهُمَّ بَارِكْ» بڵێ.'
    },
    {
      keys: ['دوعا', 'دعاء', 'چۆن دوعا'],
      a: 'دوعا عیبادەتە.\n\nباشتر: حەمد و سەڵاوات، پاشان داوا، لە کاتی وەڵامدانەوە (دوای نوێژ، سەحەر…).\n\nبە دڵسۆزی و بێ بێهیوایی.'
    },
    {
      keys: ['سەڵاوات', 'صلوات', 'سەڵاوات لەسەر پێغەمبەر'],
      a: 'سەڵاوات لەسەر پێغەمبەر ﷺ:\n«اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ…»\n\nلە ڕۆژی هەینی زۆرتر، و لە هەر کاتێک پاداشتی گەورەی هەیە.'
    },
    {
      keys: ['قورئان', 'خوێندنەوەی قورئان', 'فضڵی قورئان'],
      a: 'قورئان قسەی خوایە و شیفا و ڕێنماییە.\n\nهەر پیتێک پاداشتی هەیە. باشترە بە تەرتیل و تێگەیشتن بخوێنرێت.\n\nلە ئەپەکەدا موسحەفی مەدینە و قارئەکان هەن.'
    },
    {
      keys: ['حەرام', 'حلال', 'گوناه'],
      a: 'حەلال ئەوەیە شەریعەت ڕێگەی پێداوە؛ حەرام ئەوەیە قەدەغەی کردووە.\n\nبۆ بابەتی نوێ یان ئاڵۆز (بازرگانی، پزیشکی…) بۆ زانای متمانەپێکراو بڕۆ — من جێگەی موفتی ناگرمەوە.'
    },
    {
      keys: ['نیت', 'نیەت', 'نەوت'],
      a: 'نییەت لە دڵدایە — ویستنی کردنی عیبادەت بۆ خوا.\n\nبۆ نوێژ و ڕۆژوو پێویستە. بە زمان وتن لای زۆر مەزهەب مەرج نییە، بەڵکو دڵ.'
    },
    {
      keys: ['جەماعەت', 'نوێژی جەماعەت', 'مزگەوت'],
      a: 'نوێژی جەماعەت پاداشتی زۆر گەورەی هەیە (تا ۲۷ پلە زیاتر لە تاکەکەسی لە حەدیسدا هاتووە).\n\nبۆ پیاوان زۆر جەخت لێکراوە بڕۆن بۆ مزگەوت.'
    },
    {
      keys: ['سلاو', 'السلام علیکم', 'چۆن سلاو'],
      a: 'سلاو: «السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ»\n\nوەڵام: «وَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ»\n\nسلاو کردن سوننەتە و پاداشتی هەیە.'
    },
    {
      keys: ['بسم الله', 'بە ناوی خوا', 'بەسمەڵا'],
      a: 'بسم الله الرحمن الرحیم لە دەستپێکی کار و خواردن و هاتنەژوورەوە دەوترێت.\n\nپێغەمبەر ﷺ فێری کردووین کار بە ناوی خوا دەست پێبکەین.'
    },
    {
      keys: ['الحمد لله', 'شوکر', 'سوپاس'],
      a: 'الحَمْدُ لِلَّهِ — هەموو ستایش بۆ خوایە.\n\nلە خۆشی و ناخۆشیدا شوکر کردن نیشانەی ئیمانە.'
    },
    {
      keys: ['یارمەتی', 'چی دەزانیت', 'چیت پێدەکرێت', 'سڵاو', 'سلام', 'hello', 'hi'],
      a: 'سڵاو! من یاریدەدەری شەرعیم لەناو ئەپەکە — **بەبێ پارە و بەبێ ئینتەرنێتی API**.\n\nدەتوانیت بپرسیت دەربارەی: نوێژ، زیکر، ڕوقیە، تەوبە، ڕۆژوو، ووزو، قیبلە، و بابەتی تری سەرەتایی ئیسلامی.\n\n⚠️ جێگەی موفتی ناگرێتەوە. بۆ فەتوای قورس بۆ زانا بڕۆ.'
    }
  ];

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[ًٌٍَُِْـ]/g, '')
      .replace(/[؟?!.،,;:\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function offlineAnswer(q) {
    var nq = norm(q);
    if (!nq) return 'تکایە پرسیارێک بنووسە.';

    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var item = KB[i], score = 0;
      for (var j = 0; j < item.keys.length; j++) {
        var k = norm(item.keys[j]);
        if (!k) continue;
        if (nq.indexOf(k) >= 0) score += k.length + 5;
        else {
          var parts = k.split(' ');
          var hit = 0;
          for (var p = 0; p < parts.length; p++) {
            if (parts[p].length > 2 && nq.indexOf(parts[p]) >= 0) hit++;
          }
          if (hit && hit >= Math.ceil(parts.length * 0.6)) score += hit * 3;
        }
      }
      if (score > bestScore) { bestScore = score; best = item; }
    }

    if (best && bestScore >= 4) {
      return best.a + '\n\n—\n📚 سەرچاوە: زانیاری سەرەتایی ناو ئەپ (بێ API). بۆ وردەکاری زیاتر بۆ زانای متمانەپێکراو بڕۆ.';
    }

    return (
      'لە زانیارییە ناوخۆییەکانمدا وەڵامی تەواوم بۆ ئەم پرسیارە نەدۆزیەوە.\n\n' +
      'دەتوانیت بپرسیت دەربارەی: نوێژەکان، زیکر، ڕوقیە، تەوبە، ووزو، ڕۆژوو، زەکات، حەج، قیبلە، چاو و حەسوودی.\n\n' +
      '⚠️ من بەبێ پارە کار دەکەم (زانیاری ناو ئەپ). بۆ فەتوای ورد بۆ زانا بڕۆ.'
    );
  }

  function saveHist() {
    try { localStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {}
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function injectCss() {
    if ($('aiShariCss')) return;
    var s = document.createElement('style');
    s.id = 'aiShariCss';
    s.textContent = [
      'body:has(#aiShari.active) .top{display:none!important}',
      '.phone:has(#aiShari.active) .status,.phone:has(#aiShari.active) .appbar,.phone:has(#aiShari.active) .bottom{display:none!important}',
      '.phone:has(#aiShari.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}',
      '#aiShari{display:flex;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#aiShari .ai-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;flex-shrink:0}',
      '#aiShari .ai-head h2{margin:0;font-size:17px;font-weight:800}',
      '#aiShari .ai-head .ai-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#aiShari .ai-back,#aiShari .ai-clear{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#aiShari .ai-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}',
      '#aiShari .ai-bubble{max-width:92%;padding:11px 13px;border-radius:14px;font-size:14px;line-height:1.75;white-space:pre-wrap;word-break:break-word}',
      '#aiShari .ai-bubble.user{align-self:flex-start;background:#176b4b;color:#fff;border-bottom-right-radius:4px}',
      '#aiShari .ai-bubble.bot{align-self:flex-end;background:#fff;color:#1a2e24;border:1px solid #d5e3db;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.04)}',
      '#aiShari .ai-bubble.sys{align-self:center;background:#eef4f0;color:#3d5a4c;font-size:12px;text-align:center;max-width:100%}',
      '#aiShari .ai-foot{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce8e1;display:flex;gap:8px;align-items:flex-end}',
      '#aiShari .ai-input{flex:1;min-height:44px;max-height:120px;resize:none;border:1px solid #c5d5cc;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;line-height:1.5;background:#f8fbf9}',
      '#aiShari .ai-send{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:12px 16px;font-weight:800;font-size:14px;cursor:pointer;flex-shrink:0}',
      '#aiShari .ai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 8px;flex-shrink:0}',
      '#aiShari .ai-chip{border:1px solid #c5d5cc;background:#fff;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1a3d2e}',
      '.section-choice.ai-shari-choice{border-color:#b8d4c8;background:linear-gradient(135deg,#fff,#eef7f2)}',
      '.section-choice.ai-shari-choice .choice-icon{background:#d8eee4;color:#176b4b}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('aiShari');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'aiShari';
    v.className = 'view';
    main.appendChild(v);
    return v;
  }

  function renderMsgs() {
    var box = $('aiMsgs');
    if (!box) return;
    if (!history.length) {
      box.innerHTML =
        '<div class="ai-bubble sys">سڵاو! من یاریدەدەری شەرعیم — **بەبێ پارە**.\n\n' +
        'دەربارەی نوێژ، زیکر، ڕوقیە، تەوبە، ووزو… بپرسە.\n\n' +
        '⚠️ جێگەی موفتی ناگرێتەوە.</div>';
      return;
    }
    box.innerHTML = history.map(function (m) {
      var cls = m.role === 'user' ? 'user' : (m.role === 'sys' ? 'sys' : 'bot');
      return '<div class="ai-bubble ' + cls + '">' + esc(m.text) + '</div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function build() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    v.innerHTML =
      '<div class="ai-head">' +
      '<div><h2>☪ ئەی ئای شەرعی</h2><div class="ai-sub">بەبێ پارە · زانیاری ناو ئەپ</div></div>' +
      '<div style="display:flex;gap:6px">' +
      '<button type="button" class="ai-clear" data-act="clear">پاککردنەوە</button>' +
      '<button type="button" class="ai-back" data-act="back">‹ بەشەکان</button>' +
      '</div></div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<div class="ai-chips">' +
      '<button type="button" class="ai-chip" data-q="نوێژی بەیانی چەند ڕکاتە؟">نوێژی بەیانی</button>' +
      '<button type="button" class="ai-chip" data-q="زیکری بەیانیان چین؟">زیکری بەیانیان</button>' +
      '<button type="button" class="ai-chip" data-q="ڕوقیەی شەرعی چییە؟">ڕوقیە</button>' +
      '<button type="button" class="ai-chip" data-q="چۆن تەوبە دەکرێت؟">تەوبە</button>' +
      '<button type="button" class="ai-chip" data-q="ووزو چۆن دەکرێت؟">ووزو</button>' +
      '</div>' +
      '<div class="ai-foot">' +
      '<textarea class="ai-input" id="aiInput" rows="1" placeholder="پرسیاری شەرعی بنووسە..."></textarea>' +
      '<button type="button" class="ai-send" id="aiSend" data-act="send">ناردن</button>' +
      '</div>';
    renderMsgs();
    var input = $('aiInput');
    if (input) {
      input.onkeydown = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      };
    }
  }

  function onClick(e) {
    var el = e.target.closest('[data-act], [data-q]');
    if (!el || !$('aiShari') || !$('aiShari').contains(el)) return;
    var act = el.getAttribute('data-act');
    var q = el.getAttribute('data-q');
    if (q) {
      $('aiInput').value = q;
      send();
      return;
    }
    if (act === 'back') {
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
      return;
    }
    if (act === 'clear') {
      history = [];
      saveHist();
      renderMsgs();
      return;
    }
    if (act === 'send') send();
  }

  function send() {
    var input = $('aiInput');
    if (!input) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    history.push({ role: 'user', text: text });
    var reply = offlineAnswer(text);
    history.push({ role: 'bot', text: reply });
    saveHist();
    renderMsgs();
  }

  window.enterAiShari = function () {
    injectCss();
    if (!ensureView()) return;
    if (typeof showView === 'function') showView('aiShari', 'ئەی ئای شەرعی');
    build();
  };

  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box || box.querySelector('.ai-shari-choice')) return !!box;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice ai-shari-choice';
    b.innerHTML =
      '<span class="choice-icon">☪</span>' +
      '<span class="choice-copy"><b>ئەی ئای شەرعی</b>' +
      '<small>بەبێ پارە — پرسیاری دینی بپرسە</small></span>' +
      '<span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterAiShari(); };
    box.appendChild(b);
    return true;
  }

  function start() {
    injectCss();
    document.addEventListener('click', onClick);
    var n = 0;
    var iv = setInterval(function () {
      addCard();
      if (++n > 25) clearInterval(iv);
    }, 400);
    var box = document.querySelector('#startScreen .section-choices');
    if (box) {
      try {
        new MutationObserver(function () { addCard(); }).observe(box, { childList: true });
      } catch (e) {}
    }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
