/* tasbih.js v1 — standalone Tasbih section (own card on the start screen, own full-screen view).
 * Offline: no network needed. State in localStorage "tasbih_v1". */
(function () {
  if (window.__tasbihV1) return;
  window.__tasbihV1 = true;

  var KEY = 'tasbih_v1';
  var TARGETS = [33, 99, 100, 300, 1000, 0];

  /* ---------- hadith ---------- */
  var H = {
    h1: { ar: 'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', ku: 'دوو وشە هەن سووکن لەسەر زمان، قورسن لە تەرازووی کردارەکان، خۆشەویستن لای خوای میهرەبان: «سبحان الله وبحمده، سبحان الله العظيم».', src: 'صحیحی بوخاری و موسلیم' },
    h2: { ar: 'مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ', ku: 'هەر کەسێک لە ڕۆژێکدا سەد جار بڵێت «سبحان الله وبحمده»، گوناهەکانی دەسڕدرێنەوە، ئەگەر وەک کەفی دەریاش بن.', src: 'صحیحی بوخاری و موسلیم' },
    h3: { ar: 'وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلَآنِ مَا بَيْنَ السَّمَاوَاتِ وَالْأَرْضِ', ku: '«الحمد لله» تەرازووی کردارەکان پڕ دەکات، و «سبحان الله والحمد لله» ئەوەی نێوان ئاسمانەکان و زەوی پڕ دەکەن.', src: 'صحیحی موسلیم' },
    h4: { ar: 'لَأَنْ أَقُولَ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ أَحَبُّ إِلَيَّ مِمَّا طَلَعَتْ عَلَيْهِ الشَّمْسُ', ku: 'ئەوەی بڵێم «سبحان الله والحمد لله ولا إله إلا الله والله أكبر» لام خۆشترە لەو هەموو شتەی ڕۆژی بەسەردا هەڵدێت.', src: 'صحیحی موسلیم' },
    h5: { ar: 'أَحَبُّ الْكَلَامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، لَا يَضُرُّكَ بِأَيِّهِنَّ بَدَأْتَ', ku: 'خۆشەویستترین قسە لای خوا چوارە: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر؛ هیچ زیانی نییە بە هەر کامیان دەست پێ بکەیت.', src: 'صحیحی موسلیم' },
    h6: { ar: 'أَلَا أَدُلُّكَ عَلَى كَنْزٍ مِنْ كُنُوزِ الْجَنَّةِ؟ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', ku: 'ئایا ڕێنماییت نەکەم بۆ گەنجینەیەک لە گەنجینەکانی بەهەشت؟ «لا حول ولا قوة إلا بالله».', src: 'صحیحی بوخاری و موسلیم' },
    h7: { ar: 'مَنْ قَالَ سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ غُرِسَتْ لَهُ نَخْلَةٌ فِي الْجَنَّةِ', ku: 'هەر کەسێک بڵێت «سبحان الله العظيم وبحمده»، دارخورمایەکی بۆ دەچێنرێت لە بەهەشت.', src: 'جامعی تیرمیذی' },
    h8: { ar: 'وَاللَّهِ إِنِّي لَأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً', ku: 'سوێند بە خوا، من ڕۆژانە زیاتر لە حەفتا جار داوای لێخۆشبوون لە خوا دەکەم و تەوبەی بۆ دەکەم.', src: 'صحیحی بوخاری' },
    h9: { ar: 'مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا', ku: 'هەر کەسێک یەک جار صەلاوات بدات لەسەرم، خوا بەهۆیەوە دە جار صەلاوات دەدات لەسەری.', src: 'صحیحی موسلیم' },
    h10: { ar: 'مَنْ سَبَّحَ اللَّهَ دُبُرَ كُلِّ صَلَاةٍ ثَلَاثًا وَثَلَاثِينَ، وَحَمِدَ اللَّهَ ثَلَاثًا وَثَلَاثِينَ، وَكَبَّرَ اللَّهَ ثَلَاثًا وَثَلَاثِينَ، فَتِلْكَ تِسْعَةٌ وَتِسْعُونَ، وَقَالَ تَمَامَ الْمِائَةِ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ', ku: 'هەر کەسێک دوای هەموو نوێژێک ٣٣ جار «سبحان الله» و ٣٣ جار «الحمد لله» و ٣٣ جار «الله أكبر» بڵێت (ئەوە نەوەد و نۆ دەکات)، و بۆ تەواوکردنی سەد بڵێت «لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»، گوناهەکانی دەبەخشرێن، ئەگەر وەک کەفی دەریاش بن.', src: 'صحیحی موسلیم' },
    h11: { ar: 'مَنْ قَالَ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ فِي يَوْمٍ مِائَةَ مَرَّةٍ كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ', ku: 'هەر کەسێک لە ڕۆژێکدا سەد جار بڵێت «لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»، وەک ئازادکردنی دە کۆیلەی بۆ دەبێت، سەد چاکەی بۆ دەنووسرێت و سەد خراپەی لێ دەسڕدرێتەوە، و ئەو ڕۆژە تا ئێوارە پارێزراو دەبێت لە شەیتان.', src: 'صحیحی بوخاری و موسلیم' },
    h12: { ar: 'إِنْ كُنَّا لَنَعُدُّ لِرَسُولِ اللَّهِ ﷺ فِي الْمَجْلِسِ الْوَاحِدِ مِائَةَ مَرَّةٍ: رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', ku: 'ئێمە لە یەک کۆڕدا سەد جارمان بۆ پێغەمبەری خوا ﷺ دەژمارد کە دەیفەرموو: «رب اغفر لي وتب علي إنك أنت التواب الرحيم».', src: 'سونەنی ئەبو داود و تیرمیذی' },
    h13: { ar: 'دَعْوَةُ ذِي النُّونِ إِذْ دَعَا وَهُوَ فِي بَطْنِ الْحُوتِ: لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ، فَإِنَّهُ لَمْ يَدْعُ بِهَا رَجُلٌ مُسْلِمٌ فِي شَيْءٍ قَطُّ إِلَّا اسْتَجَابَ اللَّهُ لَهُ', ku: 'دوعای یونس (ذو النون) کاتێک لە سکی نەهەنگەکە بوو: «لا إله إلا أنت سبحانك إني كنت من الظالمين»؛ هیچ پیاوێکی موسڵمان بەم دوعایە داوای هیچ شتێک ناکات، مەگەر خوا وەڵامی بداتەوە.', src: 'جامعی تیرمیذی' },
    h14: { ar: 'أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ، وَأَفْضَلُ الدُّعَاءِ الْحَمْدُ لِلَّهِ', ku: 'باشترین زیکر «لا إله إلا الله»ـە، و باشترین دوعا «الحمد لله»ـە.', src: 'جامعی تیرمیذی' },
    q9: { ar: 'فَإِن تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', ku: 'ئەگەر ڕووی لێ وەرگێڕان، بڵێ: خوا بەسمە، هیچ پەرستراوێک نییە جگە لەو، پشتم پێ بەستووە و ئەو پەروەردگاری عەرشی گەورەیە.', src: 'سورەتی التوبة، ئایەتی ١٢٩' }
  };

  /* ---------- tasbih list ---------- */
  var ITEMS = [
    { id: 'seq', ar: 'تسبيح ما بعد الصلاة', ku: 'تەسبیحاتی دوای نوێژ', sub: '٣٣ + ٣٣ + ٣٣ + ١', seq: [
      { ar: 'سُبْحَانَ اللَّهِ', ku: 'پاک و بێگەردە خوا', n: 33 },
      { ar: 'الْحَمْدُ لِلَّهِ', ku: 'سوپاس و ستایش بۆ خوا', n: 33 },
      { ar: 'اللَّهُ أَكْبَرُ', ku: 'خوا گەورەترە', n: 33 },
      { ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', ku: 'هیچ پەرستراوێک نییە جگە لە خوای تاک و بێ هاوبەش؛ شانشینی هی ئەوە و ستایش هی ئەوە و بەسەر هەموو شتێکدا بەدەسەڵاتە', n: 1 }
    ], h: ['h10'] },
    { id: 'sub', ar: 'سُبْحَانَ اللَّهِ', ku: 'پاک و بێگەردە خوا', t: 33, h: ['h5', 'h3', 'h4'] },
    { id: 'hamd', ar: 'الْحَمْدُ لِلَّهِ', ku: 'سوپاس و ستایش بۆ خوا', t: 33, h: ['h3', 'h5', 'h14'] },
    { id: 'akbar', ar: 'اللَّهُ أَكْبَرُ', ku: 'خوا گەورەترە', t: 33, h: ['h5', 'h4', 'h10'] },
    { id: 'tahlil', ar: 'لَا إِلَهَ إِلَّا اللَّهُ', ku: 'هیچ پەرستراوێک نییە جگە لە خوا', t: 100, h: ['h14', 'h5', 'h4'] },
    { id: 'subh', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', ku: 'پاک و بێگەردە خوا و بە ستایشەوە', t: 100, h: ['h2', 'h1'] },
    { id: 'subazim', ar: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ', ku: 'پاک و بێگەردە خوای گەورە و بە ستایشەوە', t: 100, h: ['h1', 'h7'] },
    { id: 'four', ar: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ', ku: 'پاک و بێگەردە خوا، سوپاس بۆ خوا، هیچ پەرستراوێک نییە جگە لە خوا، و خوا گەورەترە', t: 100, h: ['h4', 'h5'] },
    { id: 'istig', ar: 'أَسْتَغْفِرُ اللَّهَ', ku: 'لە خوا لێخۆشبوون دەخوازم', t: 100, h: ['h8', 'h12'] },
    { id: 'rabb', ar: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', ku: 'پەروەردگارا لێم ببورە و تەوبەم لێ وەربگرە، تۆ تەوبەوەرگر و میهرەبانیت', t: 100, h: ['h12', 'h8'] },
    { id: 'salawat', ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', ku: 'خوایە صەلاوات و سەلام بنێرە بۆ پێغەمبەرمان محمد ﷺ', t: 100, h: ['h9'] },
    { id: 'hawqala', ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', ku: 'هیچ هێز و توانایەک نییە مەگەر بە خوا', t: 100, h: ['h6'] },
    { id: 'wahdah', ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', ku: 'هیچ پەرستراوێک نییە جگە لە خوای تاک و بێ هاوبەش؛ شانشینی هی ئەوە و ستایش هی ئەوە و بەسەر هەموو شتێکدا بەدەسەڵاتە', t: 100, h: ['h11'] },
    { id: 'yunus', ar: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', ku: 'هیچ پەرستراوێک نییە جگە تۆ، پاک و بێگەردیت، بێگومان من لە ستەمکاران بووم', t: 100, h: ['h13'] },
    { id: 'hasbi', ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', ku: 'خوا بەسمە، هیچ پەرستراوێک نییە جگە لەو، پشتم پێ بەستووە و ئەو پەروەردگاری عەرشی گەورەیە', t: 7, h: ['q9'] },
    { id: 'free', ar: 'تَسْبِيحٌ حُرٌّ', ku: 'تەسبیحی ئازاد', sub: 'بێ ئامانج، هەر ئەوەی دەتەوێت', t: 0, h: [] }
  ];
  var byId = {};
  ITEMS.forEach(function (i) { byId[i.id] = i; });

  /* ---------- state ---------- */
  function load() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o && typeof o === 'object') return o; } catch (e) {}
    return {};
  }
  var S = load();
  S.counts = S.counts || {}; S.targets = S.targets || {}; S.totals = S.totals || {}; S.days = S.days || {};
  if (!byId[S.sel]) S.sel = 'sub';
  if (S.vib === undefined) S.vib = true;
  if (!(S.size >= 1 && S.size <= 5)) S.size = 3;
  if (['ring', 'beads', 'digital', 'minimal'].indexOf(S.style) < 0) S.style = 'ring';
  if (S.theme !== 'dark') S.theme = 'light';
  var BGS = [['plain', 'ساده'], ['pattern', 'نەخش'], ['green', 'سەوز'], ['night', 'شەو'], ['sand', 'لم']];
  if (!BGS.some(function (b) { return b[0] === S.bg; })) S.bg = 'plain';
  var panelOpen = false, wakeLock = null;
  function save() {
    try {
      var ks = Object.keys(S.days).sort();
      while (ks.length > 120) delete S.days[ks.shift()];
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  }
  function dayKey() {
    var d = new Date(), m = d.getMonth() + 1, x = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (x < 10 ? '0' : '') + x;
  }

  /* ---------- helpers ---------- */
  var DIG = '٠١٢٣٤٥٦٧٨٩';
  function nu(n) { return String(n).replace(/\d/g, function (d) { return DIG[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function cur() { return byId[S.sel]; }
  function targetOf(it) {
    if (it.seq) return it.seq.reduce(function (a, s) { return a + s.n; }, 0);
    return S.targets[it.id] !== undefined ? S.targets[it.id] : it.t;
  }
  function stepOf(it, count) {
    // for sequences: which step, count within step, step target
    var acc = 0;
    for (var i = 0; i < it.seq.length; i++) {
      var s = it.seq[i];
      if (count <= acc + s.n) return { s: s, i: i, c: count - acc, n: s.n };
      acc += s.n;
    }
    var l = it.seq[it.seq.length - 1];
    return { s: l, i: it.seq.length - 1, c: l.n, n: l.n };
  }
  function vibrate(p) { if (S.vib && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }
  function toast(msg) {
    var t = $('tsToast');
    if (!t) { t = document.createElement('div'); t.id = 'tsToast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.style.display = 'none'; }, 2400);
  }

  /* ---------- backgrounds ---------- */
  var PAT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='none' stroke='%23176b4b' stroke-opacity='.14' stroke-width='1'%3E%3Crect x='15' y='15' width='30' height='30'/%3E%3Crect x='15' y='15' width='30' height='30' transform='rotate(45 30 30)'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E\")";
  var BGCSS = {
    plain: ['#f4f7f5', '#111815'],
    pattern: [PAT + ' #eef5f1', PAT + ' #0f1a15'],
    green: ['linear-gradient(160deg,#e3f3ea,#b9dcc9)', 'linear-gradient(160deg,#0f3d2c,#0a2219)'],
    night: ['linear-gradient(180deg,#e6eefb,#c8d8f2)', 'linear-gradient(180deg,#1a2a4a,#0b1426)'],
    sand: ['linear-gradient(160deg,#f8efd9,#e8d5a8)', 'linear-gradient(160deg,#3a2f1a,#1f180c)']
  };
  function bgCss() {
    var out = [];
    Object.keys(BGCSS).forEach(function (k) {
      ['light', 'dark'].forEach(function (th, i) {
        out.push('.phone:has(#tasbih.active[data-bg="' + k + '"][data-theme="' + th + '"]) .main{background:' + BGCSS[k][i] + '!important}');
      });
    });
    return out;
  }
  var SIZES = [[20, 15, 13], [24, 17, 14], [28, 19, 15], [34, 22, 17], [40, 26, 19]];
  function applyTheme() {
    var v = $('tasbih'); if (!v) return;
    v.setAttribute('data-bg', S.bg); v.setAttribute('data-theme', S.theme);
    v.classList.toggle('tb-dark', S.theme === 'dark');
    var z = SIZES[S.size - 1];
    v.style.setProperty('--tb-ar', z[0] + 'px'); v.style.setProperty('--tb-ha', z[1] + 'px'); v.style.setProperty('--tb-hk', z[2] + 'px');
  }
  function setWake(on) {
    try {
      if (on && navigator.wakeLock && !wakeLock) {
        navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; l.addEventListener('release', function () { wakeLock = null; }); }, function () {});
      } else if (!on && wakeLock) { wakeLock.release(); wakeLock = null; }
    } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () {
    var v = $('tasbih'); if (document.visibilityState === 'visible' && S.wake && v && v.classList.contains('active')) setWake(true);
  });

  /* ---------- css ---------- */
  function css() {
    if ($('tasbihCss')) return;
    var s = document.createElement('style');
    s.id = 'tasbihCss';
    s.textContent = [
      'body:has(#tasbih.active) .top{display:none!important}',
      '.phone:has(#tasbih.active) .status,.phone:has(#tasbih.active) .appbar,.phone:has(#tasbih.active) .bottom{display:none!important}',
      '.phone:has(#tasbih.active) .main{height:100%!important;padding-top:calc(10px + env(safe-area-inset-top))!important}',
      '#tasbih{padding-bottom:30px}',
      '#tasbih .tb-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}',
      '#tasbih .tb-head h2{margin:0;font-size:20px}',
      '#tasbih .tb-back{border:1px solid #dce5e1;background:#fff;border-radius:18px;padding:8px 14px;font-size:14px;cursor:pointer;color:#18231f}',
      '#tasbih .tb-card{background:#fff;border:1px solid #dce5e1;border-radius:18px;padding:16px;text-align:center}',
      '#tasbih .tb-ar{font-family:serif;font-size:26px;line-height:2;color:#18231f}',
      '#tasbih .tb-ar.long{font-size:20px}',
      '#tasbih .tb-ku{color:#6d7975;font-size:14px;margin-top:4px;line-height:1.7}',
      '#tasbih .tb-step{display:inline-block;margin-top:8px;padding:4px 12px;border-radius:14px;background:#fbf5e7;color:#8a6a24;font-size:12px}',
      '#tasbih .tb-targets{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0}',
      '#tasbih .tb-chip{border:1px solid #dce5e1;background:#fff;border-radius:16px;padding:7px 14px;font-size:14px;cursor:pointer;color:#18231f}',
      '#tasbih .tb-chip.on{background:#176b4b;border-color:#176b4b;color:#fff}',
      '#tasbih .tb-ring{position:relative;width:230px;height:230px;margin:6px auto}',
      '#tasbih .tb-ring svg{position:absolute;inset:0;transform:rotate(-90deg)}',
      '#tasbih .tb-tap{position:absolute;inset:14px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#2a8d65,#176b4b 70%);color:#fff;box-shadow:0 8px 22px #176b4b55;cursor:pointer;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:transform .06s}',
      '#tasbih .tb-tap:active{transform:scale(.96)}',
      '#tasbih .tb-tap.done{background:radial-gradient(circle at 35% 30%,#d2a54b,#b48a3c 70%);box-shadow:0 8px 22px #b48a3c55}',
      '#tasbih .tb-num{font-size:54px;font-weight:bold;line-height:1}',
      '#tasbih .tb-of{font-size:15px;opacity:.85;margin-top:6px}',
      '#tasbih .tb-tools{display:flex;justify-content:center;gap:14px;margin:8px 0}',
      '#tasbih .tb-tool{width:50px;height:50px;border-radius:50%;border:1px solid #dce5e1;background:#fff;font-size:21px;cursor:pointer;color:#364452}',
      '#tasbih .tb-tool.off{opacity:.45}',
      '#tasbih .tb-stats{display:flex;gap:8px;margin:8px 0 14px}',
      '#tasbih .tb-stat{flex:1;background:#e8f3ee;border-radius:14px;padding:10px 6px;text-align:center;font-size:12px;color:#176b4b}',
      '#tasbih .tb-stat b{display:block;font-size:20px;margin-bottom:2px}',
      '#tasbih .tb-h{margin:0 0 10px;background:#fbf5e7;border:1px solid #e4d5ad;border-radius:16px;padding:14px;text-align:right}',
      '#tasbih .tb-h .a{font-family:serif;font-size:19px;line-height:2;color:#18231f}',
      '#tasbih .tb-h .k{margin-top:6px;font-size:14px;line-height:1.8;color:#18231f}',
      '#tasbih .tb-h .s{margin-top:6px;font-size:12px;color:#8a6a24}',
      '#tasbih h3{margin:16px 2px 8px;font-size:15px}',
      '#tasbih .tb-item{width:100%;display:block;text-align:right;background:#fff;border:1px solid #dce5e1;border-radius:14px;padding:12px 14px;margin-bottom:8px;cursor:pointer;color:#18231f}',
      '#tasbih .tb-item.on{border-color:#176b4b;background:#e8f3ee}',
      '#tasbih .tb-item .a{font-family:serif;font-size:17px;line-height:1.9}',
      '#tasbih .tb-item .m{display:flex;justify-content:space-between;color:#6d7975;font-size:12px;margin-top:2px}',
      '#tsToast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#173f35;color:#fff;padding:10px 16px;border-radius:20px;font-size:13px;z-index:99999;max-width:85%;text-align:center;display:none}',
      '.tasbih-choice .choice-icon{font-size:26px}',
      '#tasbih{color:var(--tb-ink,#18231f)}',
      '#tasbih .tb-ar{font-size:var(--tb-ar,26px)}',
      '#tasbih .tb-ar.long{font-size:calc(var(--tb-ar,26px)*.78)}',
      '#tasbih .tb-h .a{font-size:var(--tb-ha,19px)}',
      '#tasbih .tb-h .k{font-size:var(--tb-hk,14px)}',
      '#tasbih .tb-item .a{font-size:calc(var(--tb-hk,14px) + 3px)}',
      '#tasbih .tb-gear{border:1px solid #dce5e1;background:#fff;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;color:#364452}',
      '#tasbih .tb-head .l{display:flex;align-items:center;gap:8px}',
      '#tasbih .tb-set{background:#fff;border:1px solid #dce5e1;border-radius:18px;padding:14px;margin-bottom:12px;text-align:right}',
      '#tasbih .tb-set b{display:block;font-size:13px;margin:10px 0 6px;color:#6d7975}',
      '#tasbih .tb-set b:first-child{margin-top:0}',
      '#tasbih .tb-set .row{display:flex;gap:8px;flex-wrap:wrap}',
      '#tasbih .tb-set input[type=range]{width:100%;accent-color:#176b4b}',
      '#tasbih .tb-sw{display:inline-block;width:14px;height:14px;border-radius:50%;margin-left:6px;vertical-align:middle;border:1px solid #0003}',
      '#tasbih .tb-bar{height:8px;border-radius:4px;background:#ffffff40;overflow:hidden;margin-top:12px;width:100%}',
      '#tasbih .tb-bar i{display:block;height:100%;width:0;background:#e9c46a;border-radius:4px;transition:width .12s}',
      '#tasbih .tb-dig{background:#2c3330;border-radius:30px;padding:18px;margin:8px auto;max-width:300px;box-shadow:0 10px 24px #0004,inset 0 2px 0 #ffffff1f}',
      '#tasbih .tb-lcd{background:#b9cba3;color:#1d2b16;border-radius:12px;padding:12px 14px;text-align:left;direction:ltr;box-shadow:inset 0 3px 8px #0005;font-family:"Courier New",monospace}',
      '#tasbih .tb-lcd .n{display:block;font-size:64px;font-weight:bold;line-height:1.1;letter-spacing:3px}',
      '#tasbih .tb-lcd .o{display:block;font-size:13px;opacity:.75;direction:rtl;text-align:right}',
      '#tasbih .tb-lcd .tb-bar{background:#1d2b1633}',
      '#tasbih .tb-lcd .tb-bar i{background:#1d2b16}',
      '#tasbih .tb-dtap{display:block;width:130px;height:130px;margin:16px auto 4px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#3aa77a,#176b4b 70%);box-shadow:0 6px 0 #0d3d2b,0 10px 18px #0006;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
      '#tasbih .tb-dtap:active{transform:translateY(4px);box-shadow:0 2px 0 #0d3d2b}',
      '#tasbih .tb-dtap.done{background:radial-gradient(circle at 35% 30%,#d2a54b,#b48a3c 70%);box-shadow:0 6px 0 #6e5217,0 10px 18px #0006}',
      '#tasbih .tb-mtap{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;min-height:190px;border:0;border-radius:28px;background:linear-gradient(145deg,#2a8d65,#176b4b);color:#fff;box-shadow:0 8px 22px #176b4b44;cursor:pointer;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;padding:18px}',
      '#tasbih .tb-mtap:active{transform:scale(.985)}',
      '#tasbih .tb-mtap.done{background:linear-gradient(145deg,#d2a54b,#b48a3c)}',
      '#tasbih .tb-mtap .tb-num{font-size:70px}',
      '#tasbih .tb-mtap .tb-bar{max-width:220px}',
      '#tasbih.tb-dark{--tb-ink:#eaf2ee}',
      '#tasbih.tb-dark .tb-card,#tasbih.tb-dark .tb-set,#tasbih.tb-dark .tb-item{background:#1b2621;border-color:#2f3f38;color:#eaf2ee}',
      '#tasbih.tb-dark .tb-item.on{background:#173d2f;border-color:#2a8d65}',
      '#tasbih.tb-dark .tb-ar{color:#f4f8f6}',
      '#tasbih.tb-dark .tb-ku,#tasbih.tb-dark .tb-item .m,#tasbih.tb-dark .tb-set b{color:#9db0a7}',
      '#tasbih.tb-dark .tb-chip,#tasbih.tb-dark .tb-back,#tasbih.tb-dark .tb-gear,#tasbih.tb-dark .tb-tool{background:#1b2621;border-color:#2f3f38;color:#eaf2ee}',
      '#tasbih.tb-dark .tb-chip.on{background:#2a8d65;border-color:#2a8d65;color:#fff}',
      '#tasbih.tb-dark .tb-h{background:#2a2412;border-color:#5a4a1d}',
      '#tasbih.tb-dark .tb-h .a,#tasbih.tb-dark .tb-h .k{color:#f2ead2}',
      '#tasbih.tb-dark .tb-h .s{color:#d8b45a}',
      '#tasbih.tb-dark .tb-stat{background:#173d2f;color:#8fe0b9}',
      '#tasbih.tb-dark .tb-item .a{color:#f4f8f6}',
      '#tasbih.tb-dark .tb-step{background:#2a2412;color:#d8b45a}',
      '#tasbih.tb-dark svg circle:first-child{stroke:#2f3f38}'
    ].concat(bgCss()).join('');
    document.head.appendChild(s);
  }

  /* ---------- view ---------- */
  var R = 98, CIRC = 2 * Math.PI * R;

  function ensureView() {
    if ($('tasbih')) return $('tasbih');
    var z = $('zikr');
    if (!z || !z.parentNode) return null;
    var v = document.createElement('section');
    v.id = 'tasbih'; v.className = 'view';
    z.parentNode.appendChild(v);
    v.addEventListener('click', onClick);
    v.addEventListener('input', function (e) {
      if (e.target && e.target.getAttribute && e.target.getAttribute('data-range') === 'size') { S.size = Number(e.target.value) || 3; save(); applyTheme(); }
    });
    return v;
  }

  function tapHtml() {
    if (S.style === 'digital') {
      return '<div class="tb-dig"><div class="tb-lcd"><span class="n" id="tbNum">0</span><span class="o" id="tbOf"></span><div class="tb-bar"><i id="tbBar"></i></div></div><button type="button" class="tb-dtap" id="tbTap" data-act="tap" aria-label="tap"></button></div>';
    }
    if (S.style === 'minimal') {
      return '<button type="button" class="tb-mtap" id="tbTap" data-act="tap"><span class="tb-num" id="tbNum">٠</span><span class="tb-of" id="tbOf"></span><div class="tb-bar"><i id="tbBar"></i></div></button>';
    }
    if (S.style === 'beads') {
      return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230" id="tbBeads"></svg><button type="button" class="tb-tap" id="tbTap" data-act="tap" style="inset:46px"><span class="tb-num" id="tbNum">٠</span><span class="tb-of" id="tbOf"></span></button></div>';
    }
    return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230"><circle cx="115" cy="115" r="' + R + '" fill="none" stroke="#dce5e1" stroke-width="9"/><circle id="tbArc" cx="115" cy="115" r="' + R + '" fill="none" stroke="#b48a3c" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>' +
      '<button type="button" class="tb-tap" id="tbTap" data-act="tap"><span class="tb-num" id="tbNum">٠</span><span class="tb-of" id="tbOf"></span></button></div>';
  }

  function chip(attr, val, label, on, extra) {
    return '<button type="button" class="tb-chip' + (on ? ' on' : '') + '" ' + attr + '="' + val + '">' + (extra || '') + label + '</button>';
  }
  function settingsHtml() {
    if (!panelOpen) return '';
    var styles = [['ring', 'بازنە'], ['beads', 'مسبحە'], ['digital', 'دیجیتاڵ'], ['minimal', 'سادە']];
    var swatch = { plain: '#f4f7f5', pattern: '#cfe6da', green: '#b9dcc9', night: '#1a2a4a', sand: '#e8d5a8' };
    return '<div class="tb-set">' +
      '<b>قەبارەی نووسین</b><input type="range" min="1" max="5" step="1" value="' + S.size + '" data-range="size">' +
      '<b>شێوازی تەسبیح</b><div class="row">' + styles.map(function (s) { return chip('data-style', s[0], s[1], S.style === s[0]); }).join('') + '</div>' +
      '<b>ڕووکار</b><div class="row">' + chip('data-theme', 'light', '☀ ڕوون', S.theme === 'light') + chip('data-theme', 'dark', '🌙 تاریک', S.theme === 'dark') + '</div>' +
      '<b>باگراوند</b><div class="row">' + BGS.map(function (b) { return chip('data-bgset', b[0], b[1], S.bg === b[0], '<span class="tb-sw" style="background:' + swatch[b[0]] + '"></span>'); }).join('') + '</div>' +
      '<b>تر</b><div class="row">' + chip('data-flag', 'vib', '📳 لەرزین', !!S.vib) + chip('data-flag', 'wake', '💡 شاشە نەکوژێتەوە', !!S.wake) + '</div>' +
      '</div>';
  }

  function build() {
    var v = ensureView(); if (!v) return;
    var it = cur(), t = targetOf(it);
    var chips = '';
    if (!it.seq) {
      chips = '<div class="tb-targets">' + TARGETS.map(function (n) {
        return '<button type="button" class="tb-chip' + (n === t ? ' on' : '') + '" data-t="' + n + '">' + (n ? nu(n) : '∞') + '</button>';
      }).join('') + '</div>';
    }
    var hs = it.h.map(function (k) {
      var h = H[k];
      return '<div class="tb-h"><div class="a">' + esc(h.ar) + '</div><div class="k">' + esc(h.ku) + '</div><div class="s">— ' + esc(h.src) + '</div></div>';
    }).join('');
    var list = ITEMS.map(function (x) {
      var c = S.totals[x.id] || 0;
      return '<button type="button" class="tb-item' + (x.id === S.sel ? ' on' : '') + '" data-id="' + x.id + '"><div class="a">' + esc(x.ar) + '</div><div class="m"><span>' + esc(x.ku) + (x.sub ? ' · ' + esc(x.sub) : '') + '</span><span>' + (c ? nu(c) : '') + '</span></div></button>';
    }).join('');
    v.innerHTML =
      '<div class="tb-head"><div class="l"><button type="button" class="tb-gear" data-act="panel" title="ڕێکخستن">⚙</button><h2>📿 تەسبیح</h2></div><button type="button" class="tb-back" data-act="back">‹ بەشەکان</button></div>' +
      settingsHtml() +
      '<div class="tb-card"><div class="tb-ar" id="tbAr"></div><div class="tb-ku" id="tbKu"></div><div id="tbStep"></div></div>' +
      chips + tapHtml() +
      '<div class="tb-tools"><button type="button" class="tb-tool" data-act="reset" title="سفرکردنەوە">↺</button></div>' +
      '<div class="tb-stats"><div class="tb-stat"><b id="tbToday">٠</b>ئەمڕۆ (هەموو تەسبیحەکان)</div><div class="tb-stat"><b id="tbTotal">٠</b>کۆی ئەم تەسبیحە</div></div>' +
      (hs ? '<h3>فەزڵی ئەم تەسبیحە</h3>' + hs : '') +
      '<h3>هەڵبژاردنی تەسبیح</h3>' + list;
    applyTheme();
    paint();
  }

  function paintBeads(c, t, total) {
    var svg = $('tbBeads'); if (!svg) return;
    var n = (t > 0 && t <= 100) ? t : 33;
    var filled = (t > 0 && c >= t) ? n : (c % n);
    var r = n > 60 ? 2.6 : (n > 40 ? 3.6 : 5.2), h = '';
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 2 * Math.PI - Math.PI / 2;
      var x = 115 + 100 * Math.cos(a), y = 115 + 100 * Math.sin(a);
      var on = i < filled;
      h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + (on ? '#b48a3c' : (S.theme === 'dark' ? '#3a4a43' : '#cfd9d4')) + '"' + (on ? ' stroke="#8a6a24" stroke-width=".8"' : '') + '/>';
    }
    svg.innerHTML = h;
  }

  function paint() {
    var it = cur(), t = targetOf(it), c = S.counts[it.id] || 0;
    var ar = $('tbAr'), ku = $('tbKu'), stp = $('tbStep');
    if (!ar) return;
    var shown = it, prog, label;
    if (it.seq) {
      var st = stepOf(it, Math.max(c, 1));
      shown = st.s;
      stp.innerHTML = '<span class="tb-step">هەنگاوی ' + nu(st.i + 1) + ' لە ' + nu(it.seq.length) + '</span>';
      label = nu(c ? st.c : 0) + ' / ' + nu(st.n);
      prog = c / t;
    } else {
      stp.innerHTML = '';
      label = t ? nu(c) + ' / ' + nu(t) : nu(c);
      prog = t ? c / t : 0;
    }
    ar.className = 'tb-ar' + (shown.ar.length > 40 ? ' long' : '');
    ar.textContent = shown.ar; ku.textContent = shown.ku;
    $('tbNum').textContent = S.style === 'digital' ? String(c) : nu(c);
    $('tbOf').textContent = it.seq ? label + ' · کۆ ' + nu(t) : (t ? 'لە ' + nu(t) : 'بێ ئامانج');
    var arc = $('tbArc'); if (arc) arc.setAttribute('stroke-dashoffset', String(CIRC * (1 - Math.min(1, prog))));
    var bar = $('tbBar'); if (bar) bar.style.width = (Math.min(1, prog) * 100) + '%';
    paintBeads(c, t, t);
    var tp = $('tbTap'); if (tp) tp.classList.toggle('done', !!t && c >= t);
    $('tbToday').textContent = nu(S.days[dayKey()] || 0);
    $('tbTotal').textContent = nu(S.totals[it.id] || 0);
  }

  function tap() {
    var it = cur(), t = targetOf(it), c = S.counts[it.id] || 0;
    if (t && c >= t) c = 0; // new round
    var prevStep = it.seq && c ? stepOf(it, c).i : -1;
    c++;
    S.counts[it.id] = c;
    S.totals[it.id] = (S.totals[it.id] || 0) + 1;
    var k = dayKey(); S.days[k] = (S.days[k] || 0) + 1;
    save();
    if (t && c >= t) { vibrate([60, 40, 60, 40, 160]); toast('✓ ماشاءالله، ' + nu(t) + ' تەواو بوو'); }
    else if (it.seq && stepOf(it, c).i !== prevStep && c > 1) { vibrate([40, 30, 40]); }
    else vibrate(12);
    paint();
  }

  function onClick(e) {
    var el = e.target.closest ? e.target.closest('[data-act],[data-t],[data-id],[data-style],[data-theme],[data-bgset],[data-flag]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'tap') return tap();
    if (act === 'back') { setWake(false); if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); return; }
    if (act === 'reset') {
      var it = cur();
      if ((S.counts[it.id] || 0) > 0 && !confirm('ژمارەکە سفر بکرێتەوە؟')) return;
      S.counts[it.id] = 0; save(); paint(); return;
    }
    if (act === 'panel') { panelOpen = !panelOpen; build(); return; }
    if (el.hasAttribute('data-style')) { S.style = el.getAttribute('data-style'); save(); build(); return; }
    if (el.hasAttribute('data-theme')) { S.theme = el.getAttribute('data-theme'); save(); build(); return; }
    if (el.hasAttribute('data-bgset')) { S.bg = el.getAttribute('data-bgset'); save(); build(); return; }
    if (el.hasAttribute('data-flag')) {
      var f = el.getAttribute('data-flag'); S[f] = !S[f]; save();
      if (f === 'wake') setWake(!!S.wake); else if (S.vib) vibrate(30);
      build(); return;
    }
    if (el.hasAttribute('data-t')) {
      S.targets[S.sel] = Number(el.getAttribute('data-t')); S.counts[S.sel] = 0; save(); build(); return;
    }
    if (el.hasAttribute('data-id')) {
      S.sel = el.getAttribute('data-id'); save(); build();
      var v = $('tasbih'); if (v && v.scrollIntoView) { var m = v.closest('.main'); if (m) m.scrollTop = 0; }
    }
  }

  window.enterTasbih = function () {
    css();
    if (!ensureView()) return;
    if (typeof showView === 'function') showView('tasbih', 'تەسبیح');
    var b = document.querySelector('.bottom'); if (b) b.classList.add('hidden');
    build();
    if (S.wake) setWake(true);
    var m = $('tasbih').closest('.main'); if (m) m.scrollTop = 0;
  };

  /* ---------- start-screen card ---------- */
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box || box.querySelector('.tasbih-choice')) return !!box;
    var b = document.createElement('button');
    b.className = 'section-choice tasbih-choice';
    b.type = 'button';
    b.onclick = function () { window.enterTasbih(); };
    b.innerHTML = '<span class="choice-icon">📿</span><span class="choice-copy"><b>تەسبیح</b><small>سبحان الله، الحمد لله و زیاتر، لەگەڵ فەزڵی هەر یەکێک</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b);
    var note = document.querySelector('#startScreen .welcome-note');
    if (note) note.textContent = 'هەر بەشێک لە هەمان ئەپدایە، بەڵام ڕووکاری تایبەتی خۆی هەیە.';
    return true;
  }

  function start() {
    css(); ensureView(); addCard();
    var n = 0, iv = setInterval(function () { addCard(); if (++n > 20) clearInterval(iv); }, 500);
    var box = document.querySelector('#startScreen .section-choices');
    if (box) new MutationObserver(function () { addCard(); }).observe(box, { childList: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
