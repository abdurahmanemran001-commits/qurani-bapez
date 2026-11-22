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
  if (S.snd === undefined) S.snd = true;
  if (!(S.size >= 1 && S.size <= 5)) S.size = 3;
  var STYLES = [['sins', '🌅 بارگرانی گوناه (دەنگ + ئەنیمەیشن)'], ['bead3d', '📿 مسبحەی دار (وەک ڤیدیۆ)'], ['ring', '⭕ بازنە'], ['beads', '📿 مسبحە'], ['rosary', '🧿 مسبحەی هەڵواسراو'], ['digital', '🔢 دیجیتاڵ'], ['mechanical', '⚙ میکانیکی'], ['minimal', '▭ سادە'], ['wave', '🌊 ئاو'], ['star', '✴ ئەستێرە'], ['flower', '🌸 گوڵ'], ['heart', '❤ دڵ'], ['neon', '✨ نیۆن'], ['ripple', '💧 شەپۆل'], ['grid', '▦ ڕیزی دەنک'], ['moon', '🌙 مانگ'], ['full', '⬛ تەواوی شاشە']];
  if (!S.style) S.style = 'bead3d';
  if (!STYLES.some(function (s) { return s[0] === S.style; })) S.style = 'ring';
  if (S.theme !== 'dark') S.theme = 'light';
  var BGS = [['ivory', 'عاج'], ['plain', 'ساده'], ['pattern', 'نەخش'], ['green', 'سەوز'], ['night', 'شەو'], ['sand', 'لم']];
  if (!S.bg) S.bg = 'ivory';
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
    ivory: ['linear-gradient(180deg,#fefdfb,#f4f0e9)', 'linear-gradient(180deg,#1b1f1c,#101411)'],
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
      '#tasbih .tb-tap{position:absolute;inset:25px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#2a8d65,#176b4b 70%);color:#fff;box-shadow:0 8px 22px #176b4b55;cursor:pointer;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:transform .06s}',
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

      '#tasbih .tb-sm .tb-num{font-size:34px}',
      '#tasbih .tb-sm .tb-of{font-size:11px;margin-top:2px}',
      '#tasbih .tb-sc{position:relative;display:block;width:100%;max-width:340px;margin:6px auto;border:0;padding:0;border-radius:22px;overflow:hidden;background:#9aa6b8;box-shadow:0 10px 26px rgba(60,50,30,.22);touch-action:manipulation;-webkit-user-select:none;user-select:none;cursor:pointer}',
      '#tasbih .tb-sc svg{display:block;width:100%;height:auto;transform:none}',
      '#tasbih .tb-sc .tb-scn{position:absolute;left:12px;top:12px;width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#14231c;box-shadow:0 2px 8px rgba(0,0,0,.18)}',
      '#tasbih .tb-sc .tb-num{font-size:24px;font-weight:800;line-height:1}',
      '#tasbih .tb-sc .tb-of{font-size:10px;opacity:.7}',
      '#tasbih .tb-b3{width:290px;height:310px}',
      '#tasbih .tb-ring,#tasbih .tb-dig,#tasbih .tb-mech{zoom:var(--tbz,1)}',
      '#tasbih .tb-mtap{min-height:42vh!important}',
      '#tasbih .tb-sc{max-width:none;width:calc(100% + 0px);height:60vh;min-height:330px;border-radius:26px}',
      '#tasbih .tb-sc svg{width:100%;height:100%}',
      '#tasbih .tb-b3 svg{transform:none;filter:drop-shadow(0 8px 14px rgba(120,100,60,.18))}',
      '#tasbih .tb-b3 .tb-tap{inset:62px 62px 82px 62px;background:transparent;box-shadow:none;color:#14231c;font-family:Georgia,"Playfair Display",serif;display:flex;flex-direction:column;align-items:center;justify-content:center}',
      '#tasbih .tb-b3 .tb-tap .tb-num{font-size:60px;font-weight:800}',
      '#tasbih .tb-b3 .tb-tap.done{background:transparent;box-shadow:none}',
      '#tasbih.tb-dark .tb-b3 .tb-tap{color:#eaf3ee}',
      '#tasbih .tb-rosary{width:260px;height:300px}',
      '#tasbih .tb-rosary .tb-tap{inset:auto;left:75px;top:60px;width:110px;height:110px}',
      '#tasbih .tb-tap.tb-clear{background:transparent!important;box-shadow:none!important}',
      '#tasbih .tb-tap.tb-ov{color:#5a0f2a}',
      '#tasbih .tb-tap.tb-ov .tb-num,#tasbih .tb-tap.tb-ov .tb-of{text-shadow:0 0 6px #fff,0 0 3px #fff}',
      '#tasbih .tb-tap.tb-ink{color:var(--tb-ink,#18231f)}',
      '#tasbih .tb-tap.tb-wave{background:#16465f;overflow:hidden}',
      '#tasbih .tb-tap.tb-wave.done{background:#16465f}',
      '#tasbih .tb-wf{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#5cc0e6,#1f7aa8);transition:height .25s}',
      '#tasbih .tb-wf:before{content:"";position:absolute;top:-12px;left:-25%;width:150%;height:26px;border-radius:50%;background:#5cc0e6;animation:tbw 3s ease-in-out infinite alternate}',
      '#tasbih .tb-tap.tb-wave.done .tb-wf,#tasbih .tb-tap.tb-wave.done .tb-wf:before{background:#e9c46a}',
      '#tasbih .tb-wave .tb-num,#tasbih .tb-wave .tb-of{position:relative;z-index:1;text-shadow:0 1px 5px #0008}',
      '@keyframes tbw{from{transform:translateX(-8%)}to{transform:translateX(8%)}}',
      '#tasbih .tb-neonbox{background:#050d0a;border-radius:28px;padding:16px 0;margin:6px 0}',
      '#tasbih .tb-neonbox .tb-tap{background:#07140f!important;box-shadow:0 0 18px #39ffb0,inset 0 0 14px #39ffb055!important;border:3px solid #39ffb0;color:#b9ffe3}',
      '#tasbih .tb-neonbox .tb-tap.done{border-color:#ffd166;box-shadow:0 0 18px #ffd166,inset 0 0 14px #ffd16655!important}',
      '#tasbih .tb-neonbox .tb-num{text-shadow:0 0 10px #39ffb0}',
      '#tasbih .tb-neonbox #tbArc{stroke:#ff4fd8;filter:drop-shadow(0 0 6px #ff4fd8)}',
      '#tasbih .tb-neonbox svg circle:first-child{stroke:#12332a}',
      '#tasbih .tb-mtap.tb-full{min-height:58vh}',
      '#tasbih .tb-mtap.tb-full .tb-num{font-size:120px}',
      '#tasbih .tb-mtap.tb-rip{position:relative;overflow:hidden;background:linear-gradient(145deg,#1f8a9c,#14586b)}',
      '#tasbih .tb-mtap.tb-rip.done{background:linear-gradient(145deg,#d2a54b,#b48a3c)}',
      '#tasbih .tb-rip>*{position:relative;pointer-events:none}',
      '#tasbih .tb-rip .rp{position:absolute;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;background:#ffffff59;transform:scale(0);animation:tbrp .6s ease-out forwards}',
      '@keyframes tbrp{to{transform:scale(4.5);opacity:0}}',
      '#tasbih .tb-mtap.tb-grid .tb-num{font-size:46px;margin-top:8px}',
      '#tasbih .tb-dots{display:flex;flex-wrap:wrap;justify-content:center;max-width:250px}',
      '#tasbih .tb-dots i{display:inline-block;width:12px;height:12px;margin:3px;border-radius:50%;background:#ffffff40}',
      '#tasbih .tb-dots i.on{background:#e9c46a}',
      '#tasbih .tb-mech{max-width:300px;margin:8px auto;padding:18px 16px 20px;border-radius:26px;background:linear-gradient(145deg,#a8884a,#6b5427 60%,#8a6f3a);box-shadow:0 10px 24px #0004,inset 0 2px 0 #ffffff55}',
      '#tasbih .tb-mwin{direction:ltr;text-align:center;background:#0b0b0b;border-radius:10px;padding:8px;box-shadow:inset 0 3px 8px #000}',
      '#tasbih .tb-mwin i{display:inline-block;width:48px;height:66px;line-height:66px;margin:0 2px;border-radius:6px;background:linear-gradient(#2a2a2a,#050505 50%,#2a2a2a);color:#f5f5f5;font:normal bold 42px "Courier New",monospace;text-align:center}',
      '#tasbih .tb-mof{text-align:center;color:#2a1f0a;font-size:12px;margin-top:8px}',
      '#tasbih .tb-mbtn{display:block;width:120px;height:120px;margin:12px auto 0;border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#fff,#c9c9c9 55%,#7d7d7d);box-shadow:0 6px 0 #4b4b4b,0 10px 16px #0006;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
      '#tasbih .tb-mbtn:active{transform:translateY(4px);box-shadow:0 2px 0 #4b4b4b}',
      '#tasbih .tb-mbtn.done{background:radial-gradient(circle at 35% 30%,#fff3c4,#e0b24a 55%,#8a6a24)}',
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

  function starD() {
    var pts = [], i, a, r;
    for (i = 0; i < 16; i++) { a = i * Math.PI / 8 - Math.PI / 2; r = i % 2 ? 78 : 108; pts.push((115 + r * Math.cos(a)).toFixed(1) + ' ' + (115 + r * Math.sin(a)).toFixed(1)); }
    return 'M' + pts.join('L') + 'Z';
  }
  var NUM = '<span class="tb-num" id="tbNum">٠</span><span class="tb-of" id="tbOf"></span>';
  var BARH = '<div class="tb-bar"><i id="tbBar"></i></div>';
  function ringHtml() {
    return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230"><circle cx="115" cy="115" r="' + R + '" fill="none" stroke="#dce5e1" stroke-width="9"/><circle id="tbArc" cx="115" cy="115" r="' + R + '" fill="none" stroke="#b48a3c" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>' +
      '<button type="button" class="tb-tap" id="tbTap" data-act="tap">' + NUM + '</button></div>';
  }
  function tapHtml() {
    var st = S.style, nt = 'style="transform:none"';
    if (st === 'digital') return '<div class="tb-dig"><div class="tb-lcd"><span class="n" id="tbNum">0</span><span class="o" id="tbOf"></span>' + BARH + '</div><button type="button" class="tb-dtap" id="tbTap" data-act="tap" aria-label="tap"></button></div>';
    if (st === 'minimal') return '<button type="button" class="tb-mtap" id="tbTap" data-act="tap">' + NUM + BARH + '</button>';
    if (st === 'full') return '<button type="button" class="tb-mtap tb-full" id="tbTap" data-act="tap">' + NUM + BARH + '</button>';
    if (st === 'ripple') return '<button type="button" class="tb-mtap tb-rip" id="tbTap" data-act="tap">' + NUM + BARH + '</button>';
    if (st === 'grid') return '<button type="button" class="tb-mtap tb-grid" id="tbTap" data-act="tap"><div class="tb-dots" id="tbDots"></div>' + NUM + '</button>';
    if (st === 'mechanical') return '<div class="tb-mech"><div class="tb-mwin" id="tbNum"></div><div class="tb-mof" id="tbOf"></div><button type="button" class="tb-mbtn" id="tbTap" data-act="tap" aria-label="tap"></button></div>';
    if (st === 'sins') return '<button type="button" class="tb-sc" id="tbTap" data-act="tap">' + sinsSvg() + '<span class="tb-scn">' + NUM + '</span></button>';
    if (st === 'bead3d') return '<div class="tb-ring tb-b3"><svg width="290" height="310" viewBox="0 0 290 310" id="tbB3">' +
      '<defs><radialGradient id="b3w" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f6e8cd"/><stop offset=".6" stop-color="#d8bd8e"/><stop offset="1" stop-color="#b89562"/></radialGradient>' +
      '<radialGradient id="b3g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#4f9b7a"/><stop offset=".55" stop-color="#1a5c43"/><stop offset="1" stop-color="#0b2e21"/></radialGradient>' +
      '<radialGradient id="b3d" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9f1ed"/></radialGradient></defs>' +
      '<circle cx="145" cy="145" r="128" fill="#efe4cd" opacity=".55"/><circle cx="145" cy="145" r="106" fill="url(#b3d)" stroke="#e4dcc9" stroke-width="2"/>' +
      '<g id="tbB3g"></g>' +
      '<path d="M54 232 C50 244 49 250 49 256" stroke="#14452f" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="49" cy="262" rx="6.5" ry="9" fill="url(#b3g)"/>' +
      '<path d="M49 271 C38 280 30 292 28 308 L70 308 C68 292 60 280 49 271Z" fill="#0f3d2a"/><path d="M49 273 L40 308 M49 273 L49 308 M49 273 L58 308" stroke="#2c6d51" stroke-width="1.2" fill="none" opacity=".7"/>' +
      '</svg><button type="button" class="tb-tap" id="tbTap" data-act="tap">' + NUM + '</button></div>';
    if (st === 'beads') return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230" id="tbBeads"></svg><button type="button" class="tb-tap" id="tbTap" data-act="tap" style="inset:46px">' + NUM + '</button></div>';
    if (st === 'rosary') return '<div class="tb-ring tb-rosary"><svg width="260" height="300" viewBox="0 0 260 300" id="tbRos" ' + nt + '></svg><button type="button" class="tb-tap tb-sm" id="tbTap" data-act="tap">' + NUM + '</button></div>';
    if (st === 'wave') return '<div class="tb-ring"><button type="button" class="tb-tap tb-wave" id="tbTap" data-act="tap" style="inset:0"><i class="tb-wf" id="tbWf"></i>' + NUM + '</button></div>';
    if (st === 'star') return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230" ' + nt + '><path id="tbStarF" d="' + starD() + '" fill="#176b4b"/><path id="tbArc2" d="' + starD() + '" fill="none" stroke="#e9c46a" stroke-width="7" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><button type="button" class="tb-tap tb-sm tb-clear" id="tbTap" data-act="tap" style="inset:0">' + NUM + '</button></div>';
    if (st === 'flower') {
      var pe = ''; for (var i = 0; i < 12; i++) pe += '<ellipse class="tbp" cx="115" cy="48" rx="17" ry="40" transform="rotate(' + (i * 30) + ' 115 115)"/>';
      return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230" ' + nt + '>' + pe + '</svg><button type="button" class="tb-tap tb-sm" id="tbTap" data-act="tap" style="inset:68px">' + NUM + '</button></div>';
    }
    if (st === 'heart') return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 24 24" ' + nt + '><defs><linearGradient id="tbHg" x1="0" y1="0" x2="0" y2="1"><stop id="tbH1" offset="1" stop-color="#f3d9de"/><stop id="tbH2" offset="1" stop-color="#e0245e"/></linearGradient></defs><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#tbHg)" stroke="#e0245e" stroke-width=".3"/></svg><button type="button" class="tb-tap tb-sm tb-clear tb-ov" id="tbTap" data-act="tap" style="inset:0">' + NUM + '</button></div>';
    if (st === 'moon') return '<div class="tb-ring"><svg width="230" height="230" viewBox="0 0 230 230" ' + nt + '><path id="tbMoon" d="M150 22A96 96 0 1 0 150 208A74 74 0 1 1 150 22Z" fill="#b48a3c" fill-opacity=".2" stroke="#b48a3c" stroke-width="3"/><text x="170" y="70" font-size="22" fill="#b48a3c">✦</text><text x="195" y="120" font-size="14" fill="#b48a3c">✦</text><text x="168" y="168" font-size="18" fill="#b48a3c">✦</text></svg><button type="button" class="tb-tap tb-sm tb-clear tb-ink" id="tbTap" data-act="tap" style="inset:0">' + NUM + '</button></div>';
    if (st === 'neon') return '<div class="tb-neonbox">' + ringHtml() + '</div>';
    return ringHtml();
  }

  function chip(attr, val, label, on, extra) {
    return '<button type="button" class="tb-chip' + (on ? ' on' : '') + '" ' + attr + '="' + val + '">' + (extra || '') + label + '</button>';
  }
  function settingsHtml() {
    if (!panelOpen) return '';
    var styles = STYLES;
    var swatch = { plain: '#f4f7f5', pattern: '#cfe6da', green: '#b9dcc9', night: '#1a2a4a', sand: '#e8d5a8' };
    return '<div class="tb-set">' +
      '<b>قەبارەی نووسین</b><input type="range" min="1" max="5" step="1" value="' + S.size + '" data-range="size">' +
      '<b>شێوازی تەسبیح</b><div class="row">' + styles.map(function (s) { return chip('data-style', s[0], s[1], S.style === s[0]); }).join('') + '</div>' +
      '<b>ڕووکار</b><div class="row">' + chip('data-theme', 'light', '☀ ڕوون', S.theme === 'light') + chip('data-theme', 'dark', '🌙 تاریک', S.theme === 'dark') + '</div>' +
      '<b>باگراوند</b><div class="row">' + BGS.map(function (b) { return chip('data-bgset', b[0], b[1], S.bg === b[0], '<span class="tb-sw" style="background:' + swatch[b[0]] + '"></span>'); }).join('') + '</div>' +
      '<b>تر</b><div class="row">' + chip('data-flag', 'vib', '📳 لەرزین', !!S.vib) + chip('data-flag', 'snd', '🔊 دەنگ', !!S.snd) + chip('data-flag', 'wake', '💡 شاشە نەکوژێتەوە', !!S.wake) + '</div>' +
      '</div>';
  }

  function build() {
    var v = ensureView(); if (!v) return;
    var it = cur(), t = targetOf(it);
    (function () { var bw = S.style === 'bead3d' ? 290 : (S.style === 'rosary' ? 260 : (S.style === 'digital' || S.style === 'mechanical' ? 300 : 230)), bh = S.style === 'bead3d' ? 310 : (S.style === 'rosary' ? 300 : (S.style === 'digital' || S.style === 'mechanical' ? 260 : 230)), vw = Math.min(window.innerWidth || 390, 560), vh = window.innerHeight || 780; var z = Math.max(1, Math.min(2, (vw - 28) / bw, vh * 0.52 / bh)); v.style.setProperty('--tbz', z.toFixed(2)); })();
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

  function nDots(t) { return (t > 0 && t <= 100) ? t : 33; }
  function filledOf(c, t, n) { return (t > 0 && c >= t) ? n : (c % n); }
  function unlit() { return S.theme === 'dark' ? '#3a4a43' : '#cfd9d4'; }
  /* ---------- sins scene (animated + sound) ---------- */
  function sinsSvg() {
    var beads = '';
    for (var i = 0; i < 11; i++) beads += '<circle cx="' + (10 + i * 12) + '" cy="' + (62 + i * 2.6) + '" r="4.2" fill="url(#snG)" stroke="#b07d1c" stroke-width=".5"/>';
    return '<svg viewBox="0 0 300 330" id="tbSc" preserveAspectRatio="xMidYMax slice"><defs>' +
      '<linearGradient id="snSky" x1="0" y1="0" x2="0" y2="1"><stop id="snS1" offset="0" stop-color="#b8c4d6"/><stop id="snS2" offset="1" stop-color="#8d98ad"/></linearGradient>' +
      '<radialGradient id="snG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe9a6"/><stop offset="1" stop-color="#d9a22b"/></radialGradient>' +
      '<radialGradient id="snSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe8"/><stop offset=".55" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="300" height="330" fill="url(#snSky)"/>' +
      '<circle id="snSun" cx="238" cy="236" r="26" fill="#fff4cc" opacity=".92"/><circle id="snGlow" cx="238" cy="236" r="60" fill="url(#snSun)" opacity="0"/>' +
      '<path id="snD1" d="M0 262 Q70 238 140 258 T300 250 V330 H0Z" fill="#8f97a8"/><rect id="snGr" y="288" width="300" height="42" fill="#7c7f8c"/>' +
      '<g id="snStr">' + beads + '</g><circle id="snDrop" cx="0" cy="0" r="5.5" fill="url(#snG)" opacity="0"/>' +
      '<g id="snFig"></g><g id="snBowlFall" opacity="0"></g>' +
      '<g id="snEnd" opacity="0"><text x="160" y="104" text-anchor="middle" font-size="23" fill="#3b2a08" font-family="Amiri,serif">تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ</text></g></svg>';
  }
  function mix(a, b, p) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * p); }); }
  function rgb(a) { return 'rgb(' + a.join(',') + ')'; }
  var SKY = [[[184, 196, 214], [141, 152, 173]], [[246, 222, 170], [214, 190, 150]], [[255, 226, 140], [247, 188, 96]]];
  function sinsFig(p, done) {
    var b = done ? 0 : 1 - p, hipx = 118, hipy = 262, ang = 52 * b * Math.PI / 180, tl = 38;
    var shx = hipx + tl * Math.sin(ang), shy = hipy - tl * Math.cos(ang), hx = shx + 12 * Math.sin(ang), hy = shy - 12 * Math.cos(ang) - 3;
    var kx = hipx + 14 * b + 8, ky = hipy + 14, bowlY = hy - 20 - (done ? 0 : 2), g = '';
    var col = '#16233f';
    g += '<g stroke="' + col + '" stroke-width="5" stroke-linecap="round" fill="none">';
    g += '<path d="M' + hipx + ' ' + hipy + ' L' + (kx - 12 * b - 8) + ' ' + (hipy + 16) + ' L' + (hipx - 18 * b - 6) + ' 288"/>';
    g += '<path d="M' + hipx + ' ' + hipy + ' L' + (kx + 4) + ' ' + (hipy + 16) + ' L' + (hipx + 10 + 8 * b) + ' 288"/>';
    g += '<path d="M' + hipx + ' ' + hipy + ' L' + shx.toFixed(1) + ' ' + shy.toFixed(1) + '"/>';
    if (!done) g += '<path d="M' + shx.toFixed(1) + ' ' + shy.toFixed(1) + ' L' + (hx - 14).toFixed(1) + ' ' + (bowlY + 6).toFixed(1) + ' M' + shx.toFixed(1) + ' ' + shy.toFixed(1) + ' L' + (hx + 14).toFixed(1) + ' ' + (bowlY + 6).toFixed(1) + '"/>';
    else g += '<path d="M' + shx.toFixed(1) + ' ' + shy.toFixed(1) + ' L' + (shx - 14) + ' ' + (shy + 18) + ' M' + shx.toFixed(1) + ' ' + shy.toFixed(1) + ' L' + (shx + 14) + ' ' + (shy + 18) + '"/>';
    g += '</g><circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="9" fill="' + col + '"/>';
    if (!done) {
      var bx = hx, n = Math.ceil(30 * (1 - p)), balls = '';
      for (var i = 0; i < n; i++) { var row = Math.floor(i / 9), col2 = i % 9, x = bx - 20 + col2 * 5 + (row % 2) * 2.5, y = bowlY - 3 - row * 4.4; balls += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="#0c0e14"/>'; }
      g += balls + '<path d="M' + (bx - 30) + ' ' + (bowlY - 2) + ' H' + (bx + 30) + ' C' + (bx + 28) + ' ' + (bowlY + 18) + ' ' + (bx - 28) + ' ' + (bowlY + 18) + ' ' + (bx - 30) + ' ' + (bowlY - 2) + 'Z" fill="#8a5a36"/><text x="' + bx + '" y="' + (bowlY + 12) + '" text-anchor="middle" font-size="11" fill="#fff" font-family="Amiri,serif">ذُنُوب</text>';
      R_bowl = { x: bx, y: bowlY };
    }
    return g;
  }
  var R_bowl = { x: 118, y: 200 };
  PXsins = function (c, t, p) {
    var sc = $('tbSc'); if (!sc) return;
    var done = !!t && c >= t, pp = t ? Math.min(1, p) : Math.min(1, (c % 100) / 100);
    var k = pp < .5 ? pp / .5 : (pp - .5) / .5, A = pp < .5 ? SKY[0] : SKY[1], B = pp < .5 ? SKY[1] : SKY[2];
    if (done) { A = SKY[1]; B = SKY[2]; k = 1; }
    $('snS1').setAttribute('stop-color', rgb(mix(A[0], B[0], k))); $('snS2').setAttribute('stop-color', rgb(mix(A[1], B[1], k)));
    var sun = $('snSun'), gl = $('snGlow'), sy = 236 - 70 * (done ? 1 : pp);
    sun.setAttribute('cy', sy); sun.setAttribute('r', 26 + 12 * pp); gl.setAttribute('cy', sy); gl.setAttribute('opacity', done ? .9 : pp * .5);
    $('snD1').setAttribute('fill', rgb(mix([143, 151, 168], [214, 168, 110], pp))); $('snGr').setAttribute('fill', rgb(mix([124, 127, 140], [190, 140, 86], pp)));
    $('snFig').innerHTML = sinsFig(pp, done);
    var bf = $('snBowlFall'); bf.setAttribute('opacity', done ? 1 : 0);
    if (done) bf.innerHTML = '<path d="M20 286 H80 C78 300 24 300 20 286Z" fill="#8a5a36" transform="rotate(-14 50 290)"/>';
    $('snEnd').setAttribute('opacity', done ? 1 : 0);
    $('snStr').setAttribute('opacity', done ? .25 : 1);
  };
  function sinsDrop() {
    var d = $('snDrop'); if (!d) return;
    var x0 = 130, y0 = 66, bx = R_bowl.x, by = R_bowl.y - 6, t0 = null;
    d.setAttribute('opacity', 1);
    function step(ts) {
      if (!t0) t0 = ts; var u = Math.min(1, (ts - t0) / 420), e = u * u;
      d.setAttribute('cx', (x0 + (bx - x0) * e).toFixed(1)); d.setAttribute('cy', (y0 + (by - y0) * e).toFixed(1));
      if (u < 1) requestAnimationFrame(step); else d.setAttribute('opacity', 0);
    }
    requestAnimationFrame(step);
  }
  /* sound: soft ambient pad that swells with progress + bell on each count */
  var SND = { ctx: null, pad: null, p: 0 };
  SND.ensure = function () {
    if (!S.snd) return false;
    try {
      if (!SND.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
        var x = SND.ctx = new AC(), g = x.createGain(); g.gain.value = 0; g.connect(x.destination); SND.pad = g;
        [110, 164.8, 220.5, 330].forEach(function (f, i) { var o = x.createOscillator(), og = x.createGain(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; og.gain.value = [.5, .3, .25, .12][i]; o.connect(og); og.connect(g); o.start(); var l = x.createOscillator(), lg = x.createGain(); l.frequency.value = .08 + i * .05; lg.gain.value = 1.2; l.connect(lg); lg.connect(o.detune); l.start(); });
        var nb = x.createBuffer(1, x.sampleRate * 2, x.sampleRate), d = nb.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        var ns = x.createBufferSource(); ns.buffer = nb; ns.loop = true; var lp = x.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; var ng = x.createGain(); ng.gain.value = .35; ns.connect(lp); lp.connect(ng); ng.connect(g); ns.start();
      }
      if (SND.ctx.state === 'suspended') SND.ctx.resume();
      return true;
    } catch (e) { return false; }
  };
  SND.amb = false;
  SND.level = function (p) { SND.amb = true; if (!SND.ctx || !SND.pad) return; SND.p = p; try { SND.pad.gain.setTargetAtTime(S.snd ? .02 + .07 * p : 0, SND.ctx.currentTime, .6); } catch (e) {} };
  SND.bell = function (p, big) {
    if (!SND.ensure()) return;
    var x = SND.ctx, now = x.currentTime, base = (big ? [523.25, 659.25, 783.99, 1046.5] : [660 + 220 * p]);
    base.forEach(function (f, i) { var o = x.createOscillator(), g = x.createGain(), o2 = x.createOscillator(); o.type = 'sine'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2.01; g.gain.setValueAtTime(0, now + i * .18); g.gain.linearRampToValueAtTime(big ? .16 : .12, now + i * .18 + .01); g.gain.exponentialRampToValueAtTime(.0008, now + i * .18 + (big ? 1.6 : .7)); o.connect(g); o2.connect(g); g.connect(x.destination); o.start(now + i * .18); o2.start(now + i * .18); o.stop(now + i * .18 + 1.8); o2.stop(now + i * .18 + 1.8); });
  };
  SND.tick = function (style, p, done) {
    if (!SND.ensure()) return;
    var x = SND.ctx, now = x.currentTime;
    function tone(type, f0, f1, dur, gain, delay, dest) {
      var o = x.createOscillator(), g = x.createGain(), d = now + (delay || 0);
      o.type = type; o.frequency.setValueAtTime(f0, d); if (f1) o.frequency.exponentialRampToValueAtTime(f1, d + dur);
      g.gain.setValueAtTime(0, d); g.gain.linearRampToValueAtTime(gain, d + .005); g.gain.exponentialRampToValueAtTime(.0008, d + dur);
      o.connect(g); g.connect(dest || x.destination); o.start(d); o.stop(d + dur + .05);
    }
    function noise(dur, gain, hp, delay) {
      var n = x.createBuffer(1, Math.max(1, Math.floor(x.sampleRate * dur)), x.sampleRate), ch = n.getChannelData(0); for (var i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
      var sr = x.createBufferSource(), f = x.createBiquadFilter(), g = x.createGain(); sr.buffer = n; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = gain; sr.connect(f); f.connect(g); g.connect(x.destination); sr.start(now + (delay || 0));
    }
    if (done) return SND.bell(p, true);
    switch (style) {
      case 'ring': tone('sine', 360, 180, .12, .22); break;
      case 'beads': case 'bead3d': case 'rosary': tone('sine', 1900, 1500, .05, .12); tone('triangle', 620, 380, .09, .2, .02); break;
      case 'digital': tone('square', 1250, 0, .07, .05); break;
      case 'mechanical': noise(.05, .5, 1500); tone('sine', 120, 60, .1, .3); break;
      case 'minimal': case 'full': tone('sine', 520, 430, .08, .18); break;
      case 'wave': tone('sine', 900, 380, .16, .2); tone('sine', 1300, 600, .1, .08, .05); break;
      case 'star': tone('sine', 1568, 0, .6, .12); tone('sine', 2093, 0, .5, .07, .03); break;
      case 'flower': tone('triangle', 440 + 120 * p, 0, .4, .2); break;
      case 'heart': tone('sine', 70, 45, .18, .5); tone('sine', 62, 40, .2, .4, .17); break;
      case 'neon': tone('sawtooth', 380, 900, .12, .07); break;
      case 'ripple': tone('sine', 280, 720, .1, .2); break;
      case 'grid': tone('sine', 1000, 0, .05, .14); break;
      case 'moon': tone('sine', 392, 0, 1, .16); tone('sine', 588, 0, .8, .06, .02); break;
      default: tone('sine', 660, 0, .3, .14);
    }
  };
  SND.stop = function () { SND.amb = false; try { if (SND.ctx) { SND.pad.gain.setTargetAtTime(0, SND.ctx.currentTime, .15); setTimeout(function () { try { SND.ctx.suspend(); } catch (e) {} }, 700); } } catch (e) {} };
  document.addEventListener('visibilitychange', function () { if (document.hidden) SND.stop(); });

  var PXsins;
  var PX = {
    bead3d: function (c, t) {
      var g = $('tbB3g'); if (!g) return;
      var n = nDots(t), filled = filledOf(c, t, n), r = n > 70 ? 6.2 : (n > 40 ? 7.4 : 9.4), h = '', R0 = 118;
      for (var i = 0; i < n; i++) {
        var a = (135 + (i / n) * 360) * Math.PI / 180, x = 145 + R0 * Math.cos(a), y = 145 + R0 * Math.sin(a), on = i < filled;
        h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="url(#' + (on ? 'b3g' : 'b3w') + ')" stroke="' + (on ? '#0b2e21' : '#b99a68') + '" stroke-width=".7"/>';
      }
      g.innerHTML = h;
    },
    rosary: function (c, t) {
      var svg = $('tbRos'); if (!svg) return;
      var n = nDots(t), f = filledOf(c, t, n), r = n > 60 ? 3.2 : (n > 40 ? 4.5 : 6), h = '', i;
      for (i = 0; i < n; i++) {
        var a = (i / n) * 2 * Math.PI - Math.PI / 2, x = 130 + 88 * Math.cos(a), y = 115 + 100 * Math.sin(a), on = i < f;
        h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + (on ? '#b48a3c' : unlit()) + '"' + (on ? ' stroke="#8a6a24" stroke-width=".8"' : '') + '/>';
      }
      h += '<circle cx="130" cy="226" r="8" fill="#176b4b"/><path d="M130 234L116 290H144Z" fill="#176b4b"/><path d="M122 262H138M119 276H141" stroke="#e9c46a" stroke-width="2"/>';
      svg.innerHTML = h;
    },
    star: function (c, t, p) {
      var a = $('tbArc2'), f = $('tbStarF');
      if (a) a.setAttribute('stroke-dashoffset', String(1 - p));
      if (f) f.setAttribute('fill', (t > 0 && c >= t) ? '#b48a3c' : '#176b4b');
    },
    flower: function (c, t, p) {
      var ps = document.querySelectorAll('#tasbih .tbp'), lit = p * 12, i, f;
      for (i = 0; i < ps.length; i++) {
        f = Math.max(0, Math.min(1, lit - i));
        ps[i].setAttribute('fill', f >= 1 ? '#e58fb0' : unlit());
        ps[i].setAttribute('fill-opacity', f > 0 && f < 1 ? String(.35 + f * .65) : '1');
        if (f > 0 && f < 1) ps[i].setAttribute('fill', '#e58fb0');
      }
    },
    wave: function (c, t, p) { var w = $('tbWf'); if (w) w.style.height = (p * 100) + '%'; },
    heart: function (c, t, p) {
      var a = $('tbH1'), b = $('tbH2'); if (!a) return;
      a.setAttribute('offset', String(1 - p)); b.setAttribute('offset', String(1 - p));
    },
    moon: function (c, t, p) { var m = $('tbMoon'); if (m) m.setAttribute('fill-opacity', String(.2 + .8 * p)); },
    grid: function (c, t) {
      var d = $('tbDots'); if (!d) return;
      var n = nDots(t), f = filledOf(c, t, n), h = '', i;
      for (i = 0; i < n; i++) h += '<i' + (i < f ? ' class="on"' : '') + '></i>';
      d.innerHTML = h;
    }
  };

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
    if (S.style === 'sins') PX.sins = PXsins; else if (SND.amb) SND.stop();
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
    if (S.style === 'mechanical') {
      var ds = String(c); while (ds.length < 4) ds = '0' + ds;
      $('tbNum').innerHTML = ds.split('').map(function (d) { return '<i>' + d + '</i>'; }).join('');
    } else $('tbNum').textContent = (S.style === 'digital') ? String(c) : nu(c);
    $('tbOf').textContent = it.seq ? label + ' · کۆ ' + nu(t) : (t ? 'لە ' + nu(t) : 'بێ ئامانج');
    var arc = $('tbArc'); if (arc) arc.setAttribute('stroke-dashoffset', String(CIRC * (1 - Math.min(1, prog))));
    var bar = $('tbBar'); if (bar) bar.style.width = (Math.min(1, prog) * 100) + '%';
    paintBeads(c, t, t);
    var fx = PX[S.style]; if (fx) fx(c, t, Math.min(1, prog));
    var tp = $('tbTap'); if (tp) tp.classList.toggle('done', !!t && c >= t);
    $('tbToday').textContent = nu(S.days[dayKey()] || 0);
    $('tbTotal').textContent = nu(S.totals[it.id] || 0);
  }

  function tap(e) {
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
    if (S.style !== 'sins') { SND.tick(S.style, t ? c / t : 0, !!t && c >= t); }
    if (S.style === 'sins') { var dn = !!t && c >= t; if (SND.ensure()) { SND.level(dn ? .2 : (t ? c / t : (c % 100) / 100)); SND.bell(t ? c / t : 0, dn); } if (!dn) sinsDrop(); if (dn) setTimeout(SND.stop, 6000); }
    if (S.style === 'ripple' && e && e.clientX !== undefined) {
      var tp = $('tbTap'); if (tp) {
        var rc = tp.getBoundingClientRect(), s = document.createElement('span');
        s.className = 'rp'; s.style.left = (e.clientX - rc.left) + 'px'; s.style.top = (e.clientY - rc.top) + 'px';
        tp.appendChild(s); setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 650);
      }
    }
  }

  function onClick(e) {
    var el = e.target.closest ? e.target.closest('[data-act],[data-t],[data-id],[data-style],[data-theme],[data-bgset],[data-flag]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'tap') return tap(e);
    if (act === 'back') { setWake(false); SND.stop(); if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); return; }
    if (act === 'reset') {
      var it = cur();
      if ((S.counts[it.id] || 0) > 0 && !confirm('ژمارەکە سفر بکرێتەوە؟')) return;
      S.counts[it.id] = 0; save(); paint(); return;
    }
    if (act === 'panel') { panelOpen = !panelOpen; build(); return; }
    if (el.hasAttribute('data-style')) { S.style = el.getAttribute('data-style'); if (S.style === 'bead3d' && S.bg === 'plain') S.bg = 'ivory'; save(); build(); return; }
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
