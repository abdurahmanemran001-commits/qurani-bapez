/* ruqyah.js v1 — "ڕوقیەی شەرعی": Quran + authentic Prophetic ruqyah, with guidance.
 * Standalone view (#ruqyah) + start-screen card. Audio: everyayah (Alafasy). State: localStorage "ruqyah_v1". */
(function () {
  if (window.__ruqyahV1) return;
  window.__ruqyahV1 = true;

  var KEY = 'ruqyah_v1';
  var EA = 'https://everyayah.com/data/Alafasy_128kbps/';
  function ea() { return Array.prototype.slice.call(arguments).map(function (x) { return EA + x + '.mp3'; }); }
  var BASM = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

  var CATS = [
    ['quran', 'ئایەتەکان'],
    ['sunnah', 'ڕوقیەی پێغەمبەر ﷺ'],
    ['eye', 'چاو و حەسوودی'],
    ['sick', 'نەخۆشی و ئازار'],
    ['fear', 'ترس و خەم'],
    ['guide', 'ڕێنمایی']
  ];

  /* t = repeat target, a = audio urls, how = when/how note */
  var ITEMS = [
    /* ---- Quran ---- */
    { c: 'quran', title: 'سورەتی الفاتحة', t: 1, a: ea('001001', '001002', '001003', '001004', '001005', '001006', '001007'),
      ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
      ku: 'بە ناوی خوای بەخشندەی میهرەبان. ستایش بۆ خوا پەروەردگاری جیهانیان. بەخشندەی میهرەبان. خاوەنی ڕۆژی پاداشت. تەنها تۆ دەپەرستین و تەنها لە تۆ یارمەتی دەخوازین. ڕێنماییمان بکە بۆ ڕێگای ڕاست. ڕێگای ئەوانەی نیعمەتت پێ بەخشیون، نەک ڕێگای ئەوانەی تووڕەیی لێیان کراوە و نەک ئەوانەی گومڕا بوون.',
      src: 'سورەتی الفاتحة',
      how: 'کاتێک هاوەڵێک فاتیحەی خوێندە سەر پیاوێکی مارلێدراو و چاک بووەوە، پێغەمبەر ﷺ فەرمووی: «تۆ لە کوێ زانیت کە ئەو ڕوقیەیە؟» (صحیحی بوخاری و موسلیم)' },
    { c: 'quran', title: 'ئایەتولکورسی', t: 1, a: ea('002255'),
      ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      ku: 'خوا، هیچ پەرستراوێک نییە جگە لەو، هەمیشە زیندوو و سەرپەرشتیاری هەموو بوونەوەرە. نە وەنەوز دەیگرێت و نە خەو. هەرچی لە ئاسمانەکان و هەرچی لە زەویدایە هی ئەوە. کێیە ئەوەی بەبێ ئیزنی ئەو لەلای شەفاعەت بکات؟ ئەو دەزانێت ئەوەی لەبەردەم خەڵکە و ئەوەی لە پشتیانە، و ئەوان هیچ لە زانیاری ئەو ناگرنە ئامێز مەگەر بەوەی خۆی بیەوێت. کورسییەکەی ئاسمانەکان و زەوی دەگرێتەوە، و پاراستنیان ماندووی ناکات، و ئەو بەرز و گەورەیە.',
      src: 'سورەتی البقرة، ئایەتی ٢٥٥',
      how: 'پێش خەوتن بیخوێنە: «پارێزەرێک لە لایەن خواوە لەگەڵتدایە و شەیتان لێت نزیک نابێتەوە تا بەیانی.» (صحیحی بوخاری)' },
    { c: 'quran', title: 'دوو ئایەتی کۆتایی سورەتی البقرة', t: 1, a: ea('002285', '002286'),
      ar: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾',
      ku: 'پێغەمبەر باوەڕی هێناوە بەو شتەی لە پەروەردگارییەوە بۆی دابەزێنراوە، ئیمانداریش (باوەڕیان هێناوە). هەموویان باوەڕیان هێناوە بە خوا و فریشتەکانی و کتێبەکانی و پێغەمبەرانی؛ جیاوازی ناکەین لە نێوان هیچ یەکێک لە پێغەمبەرانی. وتیان: بیستمان و فەرمانبەرداریمان کرد، لێبوردنی تۆمان دەوێت ئەی پەروەردگارمان، و گەڕانەوە هەر بۆ تۆیە. ٢٨٥\nخوا هیچ کەسێک ناخاتە سەر ئەرک مەگەر بە قەدەر توانای. ئەوەی بە دەستی هێناوە (لە چاکە) بۆ خۆیەتی و ئەوەی بە دەستی هێناوە (لە خراپە) لەسەر خۆیەتی. پەروەردگارمان، ئەگەر لەبیرمان چوو یان هەڵەمان کرد لێپرسینەوەمان لەگەڵ مەکە. پەروەردگارمان، بارێکی قورسمان مەخە سەر وەک ئەوەی خستتە سەر ئەوانەی پێش ئێمە بوون. پەروەردگارمان، ئەوەمان مەخەرە سەر کە توانای هەڵگرتنی نییە. لێمان خۆش ببە و بمان بەخشە و میهرەبانیمان لێ بکە، تۆ سەرپەرشتیارمانیت، بۆیە سەرمان بخە بەسەر گەلی بێباوەڕاندا. ٢٨٦',
      src: 'سورەتی البقرة، ئایەتی ٢٨٥ و ٢٨٦',
      how: '«هەر کەسێک ئەم دوو ئایەتە لە شەوێکدا بخوێنێتەوە، بەسیەتی.» (صحیحی بوخاری و موسلیم)' },
    { c: 'quran', title: 'سورەتی الإخلاص', t: 3, a: ea('001001', '112001', '112002', '112003', '112004'),
      ar: BASM + ' ﴿قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾',
      ku: 'بڵێ: ئەو خوایە تاک و تەنهایە. خوا پێویستی بە کەس نییە و هەموو پێویستییان بەوە. نە کەسی لێ بووە و نە لە کەس بووە. و هیچ کەسێک هاوشانی نییە.',
      src: 'سورەتی الإخلاص',
      how: 'پێغەمبەر ﷺ هەموو شەوێک پێش خەوتن دەستەکانی کۆ دەکردەوە، فووی تێدا دەکرد و ئەم سورەتە و فەلەق و ناسی دەخوێند، پاشان بە دەستەکانی لەشی دەمالی، سێ جار. (صحیحی بوخاری)' },
    { c: 'quran', title: 'سورەتی الفلق', t: 3, a: ea('001001', '113001', '113002', '113003', '113004', '113005'),
      ar: BASM + ' ﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾',
      ku: 'بڵێ: پەنا دەگرم بە پەروەردگاری بەرەبەیان، لە شەڕی هەرچی دروستی کردووە، و لە شەڕی شەو کاتێک تاریک دادێت، و لە شەڕی ئەوانەی لە گرێکاندا فووی دەکەن (جادووگەران)، و لە شەڕی حەسوود کاتێک حەسوودی دەبات.',
      src: 'سورەتی الفلق',
      how: 'بەیانی و ئێوارە و پێش خەوتن، سێ جار.' },
    { c: 'quran', title: 'سورەتی الناس', t: 3, a: ea('001001', '114001', '114002', '114003', '114004', '114005', '114006'),
      ar: BASM + ' ﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',
      ku: 'بڵێ: پەنا دەگرم بە پەروەردگاری خەڵک، پادشای خەڵک، خوای خەڵک، لە شەڕی وەسوەسەکەری خۆشارەوە، ئەوەی وەسوەسە دەخاتە دڵی خەڵکەوە، لە جنۆکە و لە مرۆڤ.',
      src: 'سورەتی الناس',
      how: 'بەیانی و ئێوارە و پێش خەوتن، سێ جار.' },

    /* ---- Prophetic ruqyah ---- */
    { c: 'sunnah', title: 'ڕوقیەی جبریل بۆ پێغەمبەر ﷺ', t: 3,
      ar: 'بِاسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِاسْمِ اللَّهِ أَرْقِيكَ',
      ku: 'بە ناوی خوا ڕوقیەت بۆ دەکەم، لە هەموو شتێک کە ئازارت دەدات، لە شەڕی هەموو کەسێک و چاوی حەسوودێک؛ خوا شیفات بدات، بە ناوی خوا ڕوقیەت بۆ دەکەم.',
      src: 'صحیحی موسلیم', how: 'جبریل ئەمەی بۆ پێغەمبەر ﷺ خوێند کاتێک نەخۆش بوو.' },
    { c: 'sunnah', title: 'دوعای شیفا', t: 3,
      ar: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
      ku: 'خوایە، ئەی پەروەردگاری خەڵک، ئازار لاببە و شیفا بدە، تۆ شیفادەریت، هیچ شیفایەک نییە جگە لە شیفای تۆ، شیفایەک کە هیچ نەخۆشییەک بەجێ نەهێڵێت.',
      src: 'صحیحی بوخاری و موسلیم', how: 'پێغەمبەر ﷺ بە دەستی ڕاستی دەستی بە نەخۆشەکەدا دەهێنا و ئەمەی دەخوێند. بۆ کەسێکی تر «اشْفِهِ» بڵێ.' },
    { c: 'sunnah', title: 'دانانی دەست لەسەر شوێنی ئازار', t: 7,
      ar: 'بِسْمِ اللَّهِ (×٣)  ثُمَّ:  أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (×٧)',
      ku: 'بە ناوی خوا (سێ جار)، پاشان حەوت جار: پەنا دەگرم بە خوا و بە توانای لە شەڕی ئەوەی هەستی پێ دەکەم و لێی دەترسم.',
      src: 'صحیحی موسلیم', how: 'دەستت لەسەر ئەو شوێنەی ئازارت هەیە دابنێ، سێ جار «بسم الله» بڵێ، پاشان ئەم دوعایە حەوت جار.' },
    { c: 'sunnah', title: 'پاراستنی بەیانی و ئێوارە', t: 3,
      ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      ku: 'بە ناوی ئەو خوایەی لەگەڵ ناوەکەیدا هیچ شتێک زیان ناگەیەنێت نە لە زەوی نە لە ئاسمان، و ئەو بیسەر و زانایە.',
      src: 'سونەنی ئەبو داود و جامعی تیرمیذی', how: 'هەر کەسێک بەیانی و ئێوارە سێ جار بیڵێت، هیچ شتێک زیانی پێناگەیەنێت.' },
    { c: 'sunnah', title: 'پەنابردن بە وشە تەواوەکانی خوا', t: 3,
      ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      ku: 'پەنا دەگرم بە وشە تەواوەکانی خوا لە شەڕی هەرچی دروستی کردووە.',
      src: 'صحیحی موسلیم', how: 'هەر کەسێک لە شوێنێک بوەستێت (سەفەر یان گەشت) و ئەمە بڵێت، هیچ شتێک زیانی پێناگەیەنێت تا لەوێ دەڕوات.' },

    /* ---- Evil eye ---- */
    { c: 'eye', title: 'پاراستنی منداڵ', t: 3,
      ar: 'أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
      ku: 'ئێوە دووان دەپارێزم بە وشە تەواوەکانی خوا لە هەموو شەیتانێک و گیانلەبەرێکی زیانبەخش، و لە هەموو چاوێکی ناخۆش.',
      src: 'صحیحی بوخاری', how: 'پێغەمبەر ﷺ بەم شێوەیە حەسەن و حوسەینی دەپاراست.' },
    { c: 'eye', title: 'کاتێک شتێکت بەلاوە سەرنج ڕاکێش بوو', t: 1,
      ar: 'مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ',
      ku: 'ئەوە ئەوەیە کە خوا بیەوێت؛ هیچ هێزێک نییە مەگەر بە خوا.',
      src: 'سورەتی الکهف، ئایەتی ٣٩', how: 'کاتێک شتێک دەبینیت کە حەزت لێیەتی یان لە ماڵ و سامانی خۆت.' },
    { c: 'eye', title: 'دوعا بۆ کەسێک کە بەلاتەوە سەرنج ڕاکێشە', t: 1,
      ar: 'اللَّهُمَّ بَارِكْ عَلَيْهِ',
      ku: 'خوایە بەرەکەتی بخە ناویەوە.',
      src: 'سونەنی ئیبن ماجە و موسنەدی ئەحمەد', how: 'ئەگەر یەکێکتان لە برای شتێک ببینێت کە بەلایەوە سەرنج ڕاکێشە، با دوعای بەرەکەتی بۆ بکات. (چاو ڕاستییە، و بەم دوعایە دەپارێزرێت.)' },
    { c: 'eye', title: 'ڕوقیەی چاو', t: 3,
      ar: 'بِاسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِاسْمِ اللَّهِ أَرْقِيكَ',
      ku: 'بە ناوی خوا ڕوقیەت بۆ دەکەم، لە هەموو شتێک کە ئازارت دەدات، لە شەڕی هەموو کەسێک و چاوی حەسوودێک؛ خوا شیفات بدات، بە ناوی خوا ڕوقیەت بۆ دەکەم.',
      src: 'صحیحی موسلیم', how: 'لەگەڵ ئەمەدا سورەتی الفلق و الناس و الفاتحة بخوێنە.' },

    /* ---- Sick / pain ---- */
    { c: 'sick', title: 'سەردانی نەخۆش', t: 1,
      ar: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ',
      ku: 'زیانی نییە، پاککەرەوەیە ئەگەر خوا بیەوێت.',
      src: 'صحیحی بوخاری', how: 'پێغەمبەر ﷺ کاتێک سەردانی نەخۆشێکی کرد، ئەمەی دەفەرموو.' },
    { c: 'sick', title: 'دوعا بۆ شیفای نەخۆش', t: 7,
      ar: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
      ku: 'لە خوای گەورە، پەروەردگاری عەرشی گەورە داوا دەکەم شیفات بدات.',
      src: 'سونەنی ئەبو داود و جامعی تیرمیذی', how: 'هەر کەسێک سەردانی نەخۆشێک بکات کە کاتی مردنی نەهاتبێت و حەوت جار ئەمە بڵێت، خوا شیفای دەدات.' },
    { c: 'sick', title: 'دوعای شیفا', t: 3,
      ar: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
      ku: 'خوایە، ئەی پەروەردگاری خەڵک، ئازار لاببە و شیفا بدە، تۆ شیفادەریت، هیچ شیفایەک نییە جگە لە شیفای تۆ، شیفایەک کە هیچ نەخۆشییەک بەجێ نەهێڵێت.',
      src: 'صحیحی بوخاری و موسلیم', how: '' },
    { c: 'sick', title: 'دانانی دەست لەسەر شوێنی ئازار', t: 7,
      ar: 'بِسْمِ اللَّهِ (×٣)  ثُمَّ:  أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (×٧)',
      ku: 'بە ناوی خوا (سێ جار)، پاشان حەوت جار: پەنا دەگرم بە خوا و بە توانای لە شەڕی ئەوەی هەستی پێ دەکەم و لێی دەترسم.',
      src: 'صحیحی موسلیم', how: '' },

    /* ---- Fear / worry ---- */
    { c: 'fear', title: 'دوعای خەم و ناڕەحەتی', t: 3,
      ar: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
      ku: 'هیچ پەرستراوێک نییە جگە لە خوای گەورەی لێبوردە، هیچ پەرستراوێک نییە جگە لە خوا پەروەردگاری عەرشی گەورە، هیچ پەرستراوێک نییە جگە لە خوا پەروەردگاری ئاسمانەکان و پەروەردگاری زەوی و پەروەردگاری عەرشی بەڕێز.',
      src: 'صحیحی بوخاری و موسلیم', how: 'پێغەمبەر ﷺ لە کاتی ناڕەحەتیدا ئەمەی دەفەرموو.' },
    { c: 'fear', title: 'ترس و ڕاچڵەکین لە خەودا', t: 3,
      ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ',
      ku: 'پەنا دەگرم بە وشە تەواوەکانی خوا لە تووڕەیی و سزا و شەڕی بەندەکانی، و لە وەسوەسەی شەیتانەکان و لەوەی ئامادە بن لام.',
      src: 'سونەنی ئەبو داود و جامعی تیرمیذی', how: 'کاتێک لە خەودا ڕاچڵەکای یان ترسایت.' },
    { c: 'fear', title: 'پەنابردن بە خوا لە شەیتان', t: 3,
      ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
      ku: 'پەنا دەگرم بە خوا لە شەیتانی ڕەجیم.',
      src: 'صحیحی بوخاری و موسلیم', how: 'پێغەمبەر ﷺ فەرمووی: ئەگەر کەسێکی تووڕە بیڵێت، تووڕەییەکەی لێ دەڕوات.' },
    { c: 'fear', title: 'پشت بەستن بە خوا', t: 7,
      ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      ku: 'خوا بەسمانە و باشترین پشتیوانە.',
      src: 'صحیحی بوخاری', how: 'ئیبراهیم (علیه السلام) کاتێک خرایە ناو ئاگرەوە ئەمەی وت، و پێغەمبەر ﷺ لە کاتی ترسدا.' },
    { c: 'fear', title: 'پەنابردن بە وشە تەواوەکانی خوا', t: 3,
      ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      ku: 'پەنا دەگرم بە وشە تەواوەکانی خوا لە شەڕی هەرچی دروستی کردووە.',
      src: 'صحیحی موسلیم', how: '' }
  ];

  var GUIDE = [
    ['ڕوقیەی شەرعی چییە؟', 'خوێندنی قورئان و ناوەکانی خوا و دوعا پێغەمبەرییەکان بۆ داوای شیفا و پاراستن لە نەخۆشی و چاو و حەسوودی و شەڕی شەیتان، بە باوەڕی ئەوەی کە شیفادەر تەنها خوایە و ڕوقیە تەنها هۆکارێکە.'],
    ['مەرجەکانی ڕوقیە', 'پێغەمبەر ﷺ فەرمووی: «ڕوقیەکانتان نیشانی من بدەن؛ هیچ زیانێک نییە لە ڕوقیە ئەگەر شیرکی تێدا نەبێت.» (صحیحی موسلیم)\nبۆیە: ١) تەنها بە قورئان و ناوەکانی خوا و دوعای ڕەوا بێت. ٢) بە زمانێک بێت کە مانای دەزانرێت. ٣) باوەڕت هەبێت کە ڕوقیە خۆی کاریگەر نییە و خوا شیفا دەدات.'],
    ['چۆن ڕوقیە دەکرێت', 'ئایەت و دوعاکان بخوێنەوە، بە ئارامی فووی سووک بکە (بێ ڕژانی تف زۆر) بۆ ناو دەستەکانت یان بۆ نەخۆشەکە، و دەست بە لەشدا بێنە، لە سەر و ڕووەوە دەست پێ بکە. (پێغەمبەر ﷺ ئاوای دەکرد - صحیحی بوخاری). ئەگەر شوێنی ئازار هەبوو، دەستت لەسەری دابنێ.'],
    ['کەی بخوێنرێتەوە', 'بەیانی و ئێوارە و پێش خەوتن. ماڵیش بە خوێندنی سورەتی البقرة دەپارێزرێت: «شەیتان لەو ماڵە هەڵدێت کە سورەتی البقرة تێیدا دەخوێنرێتەوە.» (صحیحی موسلیم)'],
    ['ئاگاداری', 'دوور بکەوە لە جادووگەر و فاڵگر و ئەوانەی داوای شتی نەزانراو یان ناو و وێنەی تایبەت یان پارەی زۆر دەکەن. پێغەمبەر ﷺ فەرمووی: «هەر کەسێک بچێتە لای فاڵگرێک و شتێکی لێ بپرسێت، چل شەو نوێژی لێ وەرناگیرێت.» (صحیحی موسلیم)\nتەوێز و نووسراوی نەزانراو هەڵمەواسە و بۆ هیچ مەبەستێک مەیخەرە ماڵەوە.'],
    ['دەرمان و پزیشک', 'پێغەمبەر ﷺ فەرمووی: «ئەی بەندەکانی خوا، دەرمان بکەن؛ چونکە خوا هیچ نەخۆشییەکی دانەناوە مەگەر دەرمانێکیشی بۆ داناوە.» (سونەنی ئەبو داود و تیرمیذی)\nڕوقیە جێگەی پزیشک ناگرێتەوە. ئەگەر نیشانەکان بەردەوام بوون (ترس، خەمۆکی، خەوی نەهاتن، ئازار)، بچۆ لای پزیشک؛ زۆر جار هۆکارێکی پزیشکی هەیە.'],
    ['تێبینی', 'ئەم بەشە بۆ یادکردنەوە و فێربوونە و جێگەی زانایانی شەرعی ناگرێتەوە. بۆ حاڵەتی تایبەت پرسیار لە زانایەکی متمانەپێکراو بکە. وەرگێڕانی کوردییەکان دەبێت لەلایەن کەسانی شارەزاوە پێداچوونەوەیان بۆ بکرێت.']
  ];

  /* ---------- state ---------- */
  function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  var S = load();
  if (!(S.size >= 1 && S.size <= 5)) S.size = 3;
  if (!CATS.some(function (c) { return c[0] === S.cat; })) S.cat = 'quran';
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var DIG = '٠١٢٣٤٥٦٧٨٩';
  function nu(n) { return String(n).replace(/\d/g, function (d) { return DIG[d]; }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  var SIZES = [[20, 14], [23, 15], [26, 16], [31, 18], [36, 20]];

  /* ---------- audio ---------- */
  var audio = null, playing = null;
  function stopAudio() {
    if (audio) { try { audio.pause(); } catch (e) {} audio = null; }
    if (playing) { playing.classList.remove('on'); playing.textContent = '▶ گوێگرتن'; playing = null; }
  }
  function playItem(btn, idx) {
    if (playing === btn) { stopAudio(); return; }
    stopAudio();
    var urls = ITEMS[idx].a || [], i = 0;
    playing = btn; btn.classList.add('on'); btn.textContent = '■ ڕاگرتن';
    function next() {
      if (playing !== btn) return;
      if (i >= urls.length) { stopAudio(); return; }
      audio = new Audio(urls[i++]);
      audio.onended = next;
      audio.onerror = function () { stopAudio(); toast('دەنگەکە بار نەبوو، ئینتەرنێتەکەت بپشکنە'); };
      var p = audio.play(); if (p && p.catch) p.catch(function () { stopAudio(); });
    }
    next();
  }

  /* ---------- share ---------- */
  function toast(msg) {
    var t = $('rqToast');
    if (!t) { t = document.createElement('div'); t.id = 'rqToast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.style.display = 'none'; }, 2400);
  }
  function shareItem(it) {
    var text = (it.title ? it.title + '\n\n' : '') + it.ar + '\n\n' + it.ku + '\n\n— ' + it.src;
    var url = '';
    try { url = location.origin + location.pathname.replace(/index\.html$/, ''); } catch (e) {}
    if (navigator.share) { navigator.share({ title: it.title, text: text, url: url }).catch(function () {}); return; }
    var full = text + (url ? '\n\n' + url : '');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(function () { toast('کۆپی کرا'); }, function () { prompt('کۆپی بکە:', full); });
    else prompt('کۆپی بکە:', full);
  }

  /* ---------- css ---------- */
  function css() {
    if ($('ruqyahCss')) return;
    var s = document.createElement('style');
    s.id = 'ruqyahCss';
    s.textContent = [
      'body:has(#ruqyah.active) .top{display:none!important}',
      '.phone:has(#ruqyah.active) .status,.phone:has(#ruqyah.active) .appbar,.phone:has(#ruqyah.active) .bottom{display:none!important}',
      '.phone:has(#ruqyah.active) .main{height:100%!important;padding-top:calc(10px + env(safe-area-inset-top))!important;background:#f4f7f5}',
      '#ruqyah{padding-bottom:30px}',
      '#ruqyah .rq-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}',
      '#ruqyah .rq-head h2{margin:0;font-size:20px}',
      '#ruqyah .rq-back{border:1px solid #dce5e1;background:#fff;border-radius:18px;padding:8px 14px;font-size:14px;cursor:pointer;color:#18231f}',
      '#ruqyah .rq-size{display:flex;gap:6px}',
      '#ruqyah .rq-size button{width:38px;height:38px;border-radius:50%;border:1px solid #dce5e1;background:#fff;font-size:15px;cursor:pointer;color:#364452}',
      '#ruqyah .rq-note{background:#e8f3ee;color:#176b4b;border-radius:14px;padding:10px 12px;font-size:12.5px;line-height:1.8;margin-bottom:10px}',
      '#ruqyah .rq-tabs{display:flex;gap:8px;overflow-x:auto;padding:2px 0 10px;margin:0 -2px;-webkit-overflow-scrolling:touch}',
      '#ruqyah .rq-tab{flex:0 0 auto;border:1px solid #dce5e1;background:#fff;border-radius:18px;padding:8px 14px;font-size:14px;cursor:pointer;color:#18231f;white-space:nowrap}',
      '#ruqyah .rq-tab.on{background:#176b4b;border-color:#176b4b;color:#fff}',
      '#ruqyah .rq-card{background:#fff;border:1px solid #dce5e1;border-radius:18px;padding:14px;margin-bottom:12px}',
      '#ruqyah .rq-title{font-weight:bold;font-size:15px;margin-bottom:8px;color:#176b4b}',
      '#ruqyah .rq-ar{font-family:serif;font-size:var(--rq-ar,26px);line-height:2.1;text-align:right;color:#18231f}',
      '#ruqyah .rq-ku{margin-top:8px;font-size:var(--rq-ku,16px);line-height:1.9;color:#32413a;white-space:pre-line}',
      '#ruqyah .rq-src{margin-top:8px;font-size:12px;color:#8a6a24}',
      '#ruqyah .rq-how{margin-top:8px;font-size:12.5px;line-height:1.8;background:#fbf5e7;border:1px solid #e4d5ad;border-radius:12px;padding:8px 10px;color:#5b4a1d}',
      '#ruqyah .rq-ctl{display:flex;gap:8px;align-items:center;margin-top:12px;flex-wrap:wrap}',
      '#ruqyah .rq-cnt{flex:1 1 140px;min-height:46px;border:0;border-radius:23px;background:#176b4b;color:#fff;font-size:16px;font-weight:bold;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
      '#ruqyah .rq-cnt.done{background:#b48a3c}',
      '#ruqyah .rq-btn{min-height:46px;padding:0 14px;border:1px solid #dce5e1;background:#e8f3ee;color:#176b4b;border-radius:23px;font-size:14px;cursor:pointer}',
      '#ruqyah .rq-btn.on{background:#b48a3c;color:#fff;border-color:#b48a3c}',
      '#ruqyah .rq-reset{width:46px;padding:0}',
      '#ruqyah .rq-g{background:#fff;border:1px solid #dce5e1;border-radius:18px;padding:14px;margin-bottom:12px}',
      '#ruqyah .rq-g b{display:block;color:#176b4b;font-size:15px;margin-bottom:6px}',
      '#ruqyah .rq-g p{margin:0;font-size:var(--rq-ku,16px);line-height:2;white-space:pre-line;color:#32413a}',
      '#rqToast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#173f35;color:#fff;padding:10px 16px;border-radius:20px;font-size:13px;z-index:99999;max-width:85%;text-align:center;display:none}',
      '.ruqyah-choice .choice-icon{font-size:26px}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ---------- view ---------- */
  function ensureView() {
    if ($('ruqyah')) return $('ruqyah');
    var z = $('zikr');
    if (!z || !z.parentNode) return null;
    var v = document.createElement('section');
    v.id = 'ruqyah'; v.className = 'view';
    z.parentNode.appendChild(v);
    v.addEventListener('click', onClick);
    return v;
  }

  function applySize() {
    var v = $('ruqyah'); if (!v) return;
    var z = SIZES[S.size - 1];
    v.style.setProperty('--rq-ar', z[0] + 'px'); v.style.setProperty('--rq-ku', z[1] + 'px');
  }

  function build() {
    var v = ensureView(); if (!v) return;
    stopAudio();
    var tabs = CATS.map(function (c) { return '<button type="button" class="rq-tab' + (S.cat === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '">' + c[1] + '</button>'; }).join('');
    var body = '';
    if (S.cat === 'guide') {
      body = GUIDE.map(function (g) { return '<div class="rq-g"><b>' + esc(g[0]) + '</b><p>' + esc(g[1]) + '</p></div>'; }).join('');
    } else {
      ITEMS.forEach(function (it, i) {
        if (it.c !== S.cat) return;
        body += '<div class="rq-card" data-i="' + i + '"><div class="rq-title">' + esc(it.title) + '</div><div class="rq-ar">' + esc(it.ar) + '</div><div class="rq-ku">' + esc(it.ku) + '</div><div class="rq-src">— ' + esc(it.src) + '</div>' +
          (it.how ? '<div class="rq-how">' + esc(it.how) + '</div>' : '') +
          '<div class="rq-ctl"><button type="button" class="rq-cnt" data-act="cnt" data-t="' + it.t + '" data-n="0">' + nu(0) + ' / ' + nu(it.t) + '</button>' +
          '<button type="button" class="rq-btn rq-reset" data-act="rst" title="سفرکردنەوە">↺</button>' +
          (it.a ? '<button type="button" class="rq-btn" data-act="play">▶ گوێگرتن</button>' : '') +
          '<button type="button" class="rq-btn" data-act="share">↗ شەیر</button></div></div>';
      });
    }
    v.innerHTML =
      '<div class="rq-head"><h2>🛡 ڕوقیەی شەرعی</h2><button type="button" class="rq-back" data-act="back">‹ بەشەکان</button></div>' +
      '<div class="rq-head" style="margin-bottom:8px"><div class="rq-size"><button type="button" data-act="smaller" aria-label="smaller">ئا-</button><button type="button" data-act="bigger" aria-label="bigger">ئا+</button></div></div>' +
      '<div class="rq-note">ڕوقیە تەنها بە قورئان و دوعای سەلەمێنراو لە سوننەتەوە؛ جێگەی پزیشک ناگرێتەوە. بۆ زانیاری زیاتر بڕۆ بۆ «ڕێنمایی».</div>' +
      '<div class="rq-tabs">' + tabs + '</div>' + body;
    applySize();
  }

  function onClick(e) {
    var el = e.target.closest ? e.target.closest('[data-act],[data-cat]') : null;
    if (!el) return;
    if (el.hasAttribute('data-cat')) { S.cat = el.getAttribute('data-cat'); save(); build(); var m = $('ruqyah').closest('.main'); if (m) m.scrollTop = 0; return; }
    var act = el.getAttribute('data-act');
    if (act === 'back') { stopAudio(); if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); return; }
    if (act === 'bigger' || act === 'smaller') { S.size = Math.max(1, Math.min(5, S.size + (act === 'bigger' ? 1 : -1))); save(); applySize(); return; }
    var card = el.closest('.rq-card'); if (!card) return;
    var i = Number(card.getAttribute('data-i')), it = ITEMS[i];
    if (act === 'cnt') {
      var t = Number(el.getAttribute('data-t')), n = Number(el.getAttribute('data-n'));
      n = n >= t ? 1 : n + 1;
      el.setAttribute('data-n', String(n));
      el.textContent = n >= t ? '✓ ' + nu(n) + ' / ' + nu(t) : nu(n) + ' / ' + nu(t);
      el.classList.toggle('done', n >= t);
      if (navigator.vibrate) { try { navigator.vibrate(n >= t ? [40, 30, 80] : 10); } catch (x) {} }
    } else if (act === 'rst') {
      var c = card.querySelector('.rq-cnt'); c.setAttribute('data-n', '0'); c.classList.remove('done');
      c.textContent = nu(0) + ' / ' + nu(it.t);
    } else if (act === 'play') playItem(el, i);
    else if (act === 'share') shareItem(it);
  }

  window.enterRuqyah = function () {
    css();
    if (!ensureView()) return;
    if (typeof showView === 'function') showView('ruqyah', 'ڕوقیەی شەرعی');
    var b = document.querySelector('.bottom'); if (b) b.classList.add('hidden');
    build();
    var m = $('ruqyah').closest('.main'); if (m) m.scrollTop = 0;
  };

  /* ---------- start-screen card ---------- */
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box || box.querySelector('.ruqyah-choice')) return !!box;
    var b = document.createElement('button');
    b.className = 'section-choice ruqyah-choice';
    b.type = 'button';
    b.onclick = function () { window.enterRuqyah(); };
    b.innerHTML = '<span class="choice-icon">🛡</span><span class="choice-copy"><b>ڕوقیەی شەرعی</b><small>ئایەت و دوعای پێغەمبەر ﷺ بۆ شیفا و پاراستن</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b);
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
