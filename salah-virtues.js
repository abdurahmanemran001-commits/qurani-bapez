/* salah-virtues.js v1 — فەزڵی نوێژ و جەماعەت: ئایەت و حەدیس بەپێی زمان (ckb/en ناوخۆیی، ar بنەڕەتی، زمانەکانی تر بە وەرگێڕانی کاشکراو) */
(function () {
  var SRC = { bm: ['متفق عليه', 'بوخاری و موسلیم', 'Bukhari & Muslim'], m: ['رواه مسلم', 'موسلیم', 'Muslim'], b: ['رواه البخاري', 'بوخاری', 'Bukhari'], t: ['رواه الترمذي', 'تیرمیزی', 'Tirmidhi'], d: ['رواه أبو داود', 'ئەبو داود', 'Abu Dawud'], n: ['رواه النسائي', 'نەسائی', 'Nasa\'i'], a: ['رواه أحمد', 'ئەحمەد', 'Ahmad'] };
  var CATS = [
    ['all', 'هەموو', 'All', 'الكل'], ['quran', 'ئایەتەکان', 'Quran', 'آيات'], ['fadl', 'فەزڵی نوێژ', 'Virtue of prayer', 'فضل الصلاة'], ['fajr', 'بەیانی و عیشا', 'Fajr & Isha', 'الفجر والعشاء'],
    ['jam', 'نوێژی جەماعەت', 'Congregation', 'صلاة الجماعة'], ['mosque', 'مزگەوت', 'The mosque', 'المسجد'], ['adab', 'ڕێزەکانی نوێژ', 'Etiquette', 'آداب الصلاة']
  ];
  /* ayat: [cat, 'sura:from-to', ckb, en] */
  var AYAT = [
    ['quran', '2:43', 'نوێژ بکەن و زەکات بدەن و لەگەڵ ڕکووعکەراندا ڕکووع ببەن.', 'Establish prayer, give zakat, and bow with those who bow.'],
    ['quran', '2:238', 'پارێزگاری لە نوێژەکان بکەن، بە تایبەتی نوێژی ناوەڕاست، و بۆ خوا ڕاوەستن بە ملکەچییەوە.', 'Guard strictly the prayers, especially the middle prayer, and stand before Allah in devout obedience.'],
    ['fadl', '4:103', 'بەڕاستی نوێژ لەسەر باوەڕداران فەرزێکی دیاریکراوی کاتدارە.', 'Indeed, prayer has been decreed upon the believers at specified times.'],
    ['quran', '20:14', 'بەڕاستی من خوام، هیچ پەرستراوێک جگە لە من نییە، کەواتە من بپەرستە و نوێژ بکە بۆ یادکردنەوەی من.', 'Indeed, I am Allah; there is no deity except Me. So worship Me and establish prayer for My remembrance.'],
    ['quran', '29:45', 'ئەوەی لە کتێب بۆت ڕاگەیەندراوە بیخوێنەوە و نوێژ بکە؛ بەڕاستی نوێژ لە داوێنپیسی و خراپە دەگەڕێنێتەوە، و یادی خوا گەورەترە.', 'Recite what has been revealed to you of the Book and establish prayer. Indeed, prayer prevents immorality and wrongdoing, and the remembrance of Allah is greater.'],
    ['fadl', '23:1-2', 'بەڕاستی باوەڕداران سەرکەوتوون؛ ئەوانەی لە نوێژەکانیاندا ملکەچن.', 'Certainly will the believers have succeeded: they who are humble in their prayers.'],
    ['fadl', '23:9-11', 'ئەوانەی پارێزگاری لە نوێژەکانیان دەکەن؛ ئەمانە میراتگرانن، ئەوانەی فیردەوس بە میرات دەبەن و تێیدا هەتاهەتایین.', 'And they who carefully maintain their prayers — it is those who are the inheritors, who will inherit al-Firdaws; they will abide therein eternally.'],
    ['fadl', '2:45-46', 'یارمەتی لە سەبر و نوێژ وەربگرن؛ نوێژ قورسە مەگەر لەسەر ملکەچان، ئەوانەی دڵنیان کە لەگەڵ پەروەردگاریان دەبینەوە.', 'And seek help through patience and prayer; and indeed it is difficult except for the humbly submissive — who are certain that they will meet their Lord.'],
    ['fadl', '2:153', 'ئەی باوەڕداران! بە سەبر و نوێژ یارمەتی وەربگرن، بەڕاستی خوا لەگەڵ سەبرکەراندایە.', 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.'],
    ['fajr', '17:78', 'نوێژ بکە لە لارببوونەوەی خۆر هەتا تاریکی شەو، و قورئانی بەیانی (بەیانی)؛ بەڕاستی قورئانی بەیانی ئامادەکراوە.', 'Establish prayer at the decline of the sun until the darkness of the night, and the Qur\'an of dawn. Indeed, the recitation of dawn is ever witnessed.'],
    ['fadl', '11:114', 'نوێژ بکە لە دوو لای ڕۆژدا و لە کاتەکانی نزیک شەو؛ بەڕاستی چاکەکان خراپەکان دەبەن.', 'Establish prayer at the two ends of the day and at the approach of night. Indeed, good deeds do away with misdeeds.'],
    ['jam', '4:102', 'کاتێک تۆ لەنێوانیاندا بوویت و نوێژت بۆیان کرد، با کۆمەڵێکیان لەگەڵت بوەستن... (نوێژی جەماعەت تەنانەت لە کاتی ترسدا).', 'And when you [O Prophet] are among them and lead them in prayer, let a group of them stand with you… (congregational prayer even in fear).'],
    ['mosque', '9:18', 'تەنها ئەو کەسە مزگەوتەکانی خوا ئاوەدان دەکاتەوە کە باوەڕی بە خوا و ڕۆژی دوایی هێناوە و نوێژی کردووە و زەکاتی داوە.', 'The mosques of Allah are only to be maintained by those who believe in Allah and the Last Day, establish prayer and give zakat.'],
    ['mosque', '24:36-37', 'لە ماڵانێکدا کە خوا ڕێگەی داوە بەرز بکرێنەوە و ناوی تێدا ببرێت؛ پیاوانێک تێیدا بەیانی و ئێواران پیرۆزبایی دەکەن، کە بازرگانی و کڕین و فرۆشتن لە یادی خوا و نوێژ ناگێڕێتەوە.', 'In houses which Allah has ordered to be raised and that His name be mentioned therein; exalting Him within them in the morning and the evenings are men whom neither commerce nor sale distracts from the remembrance of Allah and the establishment of prayer.'],
    ['adab', '107:4-5', 'کەواتە تاوان بۆ ئەو نوێژکەرانەی لە نوێژەکانیان بێئاگان.', 'So woe to those who pray, who are heedless of their prayer.'],
    ['adab', '19:59', 'دوای ئەوان نەوەیەک هاتن کە نوێژیان فەوتاند و شوێن ئارەزووەکان کەوتن، بەزوویی تووشی زیان دەبن.', 'Then there came after them successors who neglected prayer and pursued desires; so they are going to meet evil.'],
    ['adab', '62:9', 'ئەی باوەڕداران! کاتێک بانگ دەدرێت بۆ نوێژی ڕۆژی هەینی، بەرەو یادی خوا بچن و کڕین و فرۆشتن بەجێبهێڵن؛ ئەمە بۆتان باشترە ئەگەر بزانن.', 'O you who have believed, when the call is made for the prayer on Friday, hasten to the remembrance of Allah and leave trade. That is better for you, if you only knew.']
  ];
  /* hadith: [cat, src, arabic, ckb, en] */
  var HAD = [
    ['fadl', 'bm', 'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ', 'ئیسلام لەسەر پێنج بنەما دامەزراوە: شایەتی دان بە ئەوەی هیچ پەرستراوێک جگە لە خوا نییە و موحەمەد پێغەمبەری خوایە، ڕاگرتنی نوێژ، دانی زەکات، حەج، و ڕۆژووی ڕەمەزان.', 'Islam is built upon five: the testimony that there is no deity but Allah and that Muhammad is the Messenger of Allah, establishing prayer, giving zakat, Hajj, and fasting Ramadan.'],
    ['fadl', 'bm', 'أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ فِيهِ كُلَّ يَوْمٍ خَمْسًا، هَلْ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ؟ قَالُوا: لَا يَبْقَى مِنْ دَرَنِهِ شَيْءٌ. قَالَ: فَذَلِكَ مَثَلُ الصَّلَوَاتِ الْخَمْسِ، يَمْحُو اللَّهُ بِهِنَّ الْخَطَايَا', 'پێم بڵێن، ئەگەر چەمێک لە بەردەم دەرگای یەکێکتان بێت و ڕۆژانە پێنج جار تێیدا خۆی بشواتەوە، ئایا چڵکێکی لێ دەمێنێتەوە؟ وتیان: هیچ چڵکێکی لێ نامێنێتەوە. فەرموی: ئەوە نموونەی پێنج نوێژەکەیە، خوا بەهۆیانەوە گوناهەکان دەسڕێتەوە.', 'Do you think that if there were a river at the door of one of you in which he bathed five times a day, any dirt would remain on him? They said: No dirt would remain. He said: That is the likeness of the five prayers; by them Allah erases sins.'],
    ['fadl', 'm', 'الصَّلَوَاتُ الْخَمْسُ، وَالْجُمُعَةُ إِلَى الْجُمُعَةِ، وَرَمَضَانُ إِلَى رَمَضَانَ، مُكَفِّرَاتٌ مَا بَيْنَهُنَّ إِذَا اجْتَنَبَ الْكَبَائِرَ', 'پێنج نوێژەکە و هەینی تا هەینی و ڕەمەزان تا ڕەمەزان، کەفارەتی ئەوەن کە لەنێوانیاندایە ئەگەر گوناهە گەورەکان بەدوور بگیرێن.', 'The five prayers, Friday to Friday, and Ramadan to Ramadan are expiations for what is between them, so long as major sins are avoided.'],
    ['fadl', 't', 'إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ، فَإِنْ صَلَحَتْ فَقَدْ أَفْلَحَ وَأَنْجَحَ، وَإِنْ فَسَدَتْ فَقَدْ خَابَ وَخَسِرَ', 'یەکەم شت کە لە ڕۆژی دوایی بەندە لێی لێپرسینەوەی لەگەڵ دەکرێت لە کردەوەکانی نوێژەکەیەتی؛ ئەگەر چاک بوو ڕزگار و سەرکەوتوو دەبێت، و ئەگەر تێکچوو زیانبار و بێبەش دەبێت.', 'The first of his deeds for which a servant will be held to account on the Day of Resurrection is his prayer. If it is sound, he will have succeeded and prospered; if it is lacking, he will have failed and lost.'],
    ['fadl', 't', 'الْعَهْدُ الَّذِي بَيْنَنَا وَبَيْنَهُمُ الصَّلَاةُ، فَمَنْ تَرَكَهَا فَقَدْ كَفَرَ', 'ئەو پەیمانەی لەنێوان ئێمە و ئەواندایە نوێژە، هەرکەس بەجێی بهێڵێت ڕاستەوخۆ کافر بووە.', 'The covenant between us and them is prayer; whoever abandons it has disbelieved.'],
    ['fadl', 'bm', 'سَأَلْتُ النَّبِيَّ ﷺ: أَيُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ؟ قَالَ: الصَّلَاةُ عَلَى وَقْتِهَا', 'لە پێغەمبەرم ﷺ پرسی: کام کردەوە خۆشەویستترە لای خوا؟ فەرموی: نوێژ لە کاتی خۆیدا.', 'I asked the Prophet ﷺ: Which deed is most beloved to Allah? He said: Prayer at its proper time.'],
    ['fadl', 'm', 'وَالصَّلَاةُ نُورٌ', 'نوێژ ڕووناکییە.', 'Prayer is light.'],
    ['fadl', 'n', 'جُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلَاةِ', 'ڕووناکی چاوم لە نوێژدا دانراوە.', 'The coolness of my eyes has been placed in prayer.'],
    ['fadl', 'd', 'يَا بِلَالُ، أَقِمِ الصَّلَاةَ أَرِحْنَا بِهَا', 'ئەی بیلاڵ! قامەت بکە و بە نوێژ ئاسوودەمان بکە.', 'O Bilal, call the iqama for prayer; give us comfort through it.'],
    ['fadl', 'm', 'مَا مِنْ مُسْلِمٍ يَتَوَضَّأُ فَيُحْسِنُ وُضُوءَهُ، ثُمَّ يَقُومُ فَيُصَلِّي رَكْعَتَيْنِ، يُقْبِلُ عَلَيْهِمَا بِقَلْبِهِ وَوَجْهِهِ، إِلَّا وَجَبَتْ لَهُ الْجَنَّةُ', 'هیچ موسوڵمانێک نییە دەستنوێژی جوان بگرێت، پاشان هەستێت و دوو ڕکات نوێژ بکات و بە دڵ و ڕووخسارەوە ڕووی تێ بکات، مەگەر بەهەشتی بۆ پێویست دەبێت.', 'There is no Muslim who performs wudu well, then stands and prays two rak\'ahs, turning to them with his heart and face, except that Paradise becomes obligatory for him.'],
    ['fadl', 'bm', 'مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ', 'هەرکەس دوو نوێژی ساردەوەرەکە (بەیانی و عەسر) بکات، دەچێتە بەهەشت.', 'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.'],
    ['fajr', 'm', 'لَنْ يَلِجَ النَّارَ أَحَدٌ صَلَّى قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا', 'ئەو کەسە نایەتە ناو ئاگر کە پێش هەڵاتنی خۆر و پێش ئاوابوونی نوێژ دەکات (واتە بەیانی و عەسر).', 'None who prays before the sun rises and before it sets will enter the Fire — meaning Fajr and Asr.'],
    ['fajr', 'm', 'رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا', 'دوو ڕکاتی سوننەتی بەیانی لە دونیا و هەرچی تێیدایە باشترە.', 'The two rak\'ahs of Fajr are better than the world and all that is in it.'],
    ['fajr', 'm', 'مَنْ صَلَّى الصُّبْحَ فَهُوَ فِي ذِمَّةِ اللَّهِ', 'هەرکەس نوێژی بەیانی بکات، لە پارێزگاری خوادایە.', 'Whoever prays the morning prayer is under the protection of Allah.'],
    ['fajr', 'm', 'مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ، وَمَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَكَأَنَّمَا صَلَّى اللَّيْلَ كُلَّهُ', 'هەرکەس نوێژی عیشا بە جەماعەت بکات وەک ئەوەیە نیوەی شەو هەستابێت، و هەرکەس نوێژی بەیانی بە جەماعەت بکات وەک ئەوەیە هەموو شەو نوێژی کردبێت.', 'Whoever prays Isha in congregation, it is as if he stood half the night; and whoever prays Fajr in congregation, it is as if he prayed the whole night.'],
    ['fajr', 'bm', 'لَيْسَ صَلَاةٌ أَثْقَلَ عَلَى الْمُنَافِقِينَ مِنَ الْفَجْرِ وَالْعِشَاءِ، وَلَوْ يَعْلَمُونَ مَا فِيهِمَا لَأَتَوْهُمَا وَلَوْ حَبْوًا', 'هیچ نوێژێک لەسەر دووڕووەکان قورستر نییە لە نوێژی بەیانی و عیشا؛ ئەگەر بیانزانیایە چییان تێدایە، دەهاتن تەنانەت بە خشۆکیش.', 'No prayer is heavier upon the hypocrites than Fajr and Isha; if they knew what is in them, they would come even if crawling.'],
    ['jam', 'bm', 'صَلَاةُ الْجَمَاعَةِ تَفْضُلُ صَلَاةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً', 'نوێژی جەماعەت لە نوێژی تاک بە بیست و حەوت پلە باشترە.', 'Prayer in congregation is superior to prayer alone by twenty-seven degrees.'],
    ['jam', 'bm', 'صَلَاةُ الرَّجُلِ فِي جَمَاعَةٍ تُضَعَّفُ عَلَى صَلَاتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا', 'نوێژی پیاو بە جەماعەت بیست و پێنج ئەوەندە زیاد دەکرێت بەسەر نوێژەکەی لە ماڵ و لە بازاڕدا.', 'A man\'s prayer in congregation is multiplied twenty-five times over his prayer in his house or in his marketplace.'],
    ['jam', 'bm', 'وَلَقَدْ هَمَمْتُ أَنْ آمُرَ بِالصَّلَاةِ فَتُقَامَ، ثُمَّ آمُرَ رَجُلًا فَيُصَلِّيَ بِالنَّاسِ، ثُمَّ أَنْطَلِقَ مَعِي بِرِجَالٍ مَعَهُمْ حُزَمٌ مِنْ حَطَبٍ إِلَى قَوْمٍ لَا يَشْهَدُونَ الصَّلَاةَ فَأُحَرِّقَ عَلَيْهِمْ بُيُوتَهُمْ بِالنَّارِ', 'بەڕاستی بڕیارم دابوو فەرمان بکەم نوێژ بکرێت و کەسێک پێشنوێژی خەڵک بکات، پاشان لەگەڵ پیاوانێک کە گوریسی دار و پشکۆیان پێیە بچم بۆ لای ئەوانەی ناچنە نوێژی جەماعەت و ماڵەکانیان بسووتێنم (ئەمە ئاماژەیە بۆ گرنگی نوێژی جەماعەت).', 'I had intended to order the prayer to be established, then order a man to lead the people, then go with men carrying bundles of firewood to people who do not attend the prayer and burn their houses down upon them. (A stern warning about the importance of congregational prayer.)'],
    ['jam', 'bm', 'لَوْ يَعْلَمُ النَّاسُ مَا فِي النِّدَاءِ وَالصَّفِّ الْأَوَّلِ، ثُمَّ لَمْ يَجِدُوا إِلَّا أَنْ يَسْتَهِمُوا عَلَيْهِ لَاسْتَهَمُوا', 'ئەگەر خەڵک بیانزانیایە چی لە بانگدان و ڕیزی یەکەمدایە، و جگە لە قورعە کێشان ڕێگەیەکیان نەبوایە بۆی، قورعەیان دەکێشا.', 'If people knew what is in the call to prayer and the first row, and could not obtain it except by drawing lots, they would draw lots for it.'],
    ['jam', 'm', 'سَوُّوا صُفُوفَكُمْ، فَإِنَّ تَسْوِيَةَ الصَّفِّ مِنْ تَمَامِ الصَّلَاةِ', 'ڕیزەکانتان ڕێک بکەن، چونکە ڕێککردنی ڕیز لە تەواوی نوێژە.', 'Straighten your rows, for straightening the row is part of the perfection of prayer.'],
    ['mosque', 'm', 'مَنْ تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ، ثُمَّ مَشَى إِلَى صَلَاةٍ مَكْتُوبَةٍ فَصَلَّاهَا مَعَ النَّاسِ أَوْ مَعَ الْجَمَاعَةِ أَوْ فِي الْمَسْجِدِ غَفَرَ اللَّهُ لَهُ ذُنُوبَهُ', 'هەرکەس دەستنوێژی جوان بگرێت و بەرەو نوێژێکی فەرز بڕوات و لەگەڵ خەڵک یان لە جەماعەت یان لە مزگەوتدا بیکات، خوا گوناهەکانی دەبەخشێت.', 'Whoever performs wudu well, then walks to an obligatory prayer and prays it with the people, or with the congregation, or in the mosque, Allah will forgive his sins.'],
    ['mosque', 'bm', 'مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ أَعَدَّ اللَّهُ لَهُ فِي الْجَنَّةِ نُزُلًا كُلَّمَا غَدَا أَوْ رَاحَ', 'هەرکەس بەیانی یان ئێوارە بچێتە مزگەوت، خوا بۆی لە بەهەشت میوانداریی ئامادە دەکات هەر جارێک بچێت.', 'Whoever goes to the mosque morning or evening, Allah prepares for him a place of hospitality in Paradise each time he goes.'],
    ['mosque', 'd', 'بَشِّرِ الْمَشَّائِينَ فِي الظُّلَمِ إِلَى الْمَسَاجِدِ بِالنُّورِ التَّامِّ يَوْمَ الْقِيَامَةِ', 'مژدە بدە بەو کەسانەی لە تاریکیدا بەرەو مزگەوت دەڕۆن بە ڕووناکییەکی تەواو لە ڕۆژی دوایی.', 'Give glad tidings to those who walk to the mosques in the darkness of a perfect light on the Day of Resurrection.'],
    ['mosque', 'bm', 'وَرَجُلٌ قَلْبُهُ مُعَلَّقٌ فِي الْمَسَاجِدِ', '(یەکێک لە حەوت کەسەی خوا لە سێبەری خۆیدا دایاندەنێت:) پیاوێک دڵی بە مزگەوتەکانەوە بەستراوە.', '(Among the seven whom Allah will shade in His shade:) a man whose heart is attached to the mosques.'],
    ['mosque', 'bm', 'إِذَا أُقِيمَتِ الصَّلَاةُ فَلَا تَأْتُوهَا تَسْعَوْنَ، وَأْتُوهَا تَمْشُونَ وَعَلَيْكُمُ السَّكِينَةُ', 'کاتێک قامەت کرا، بە غار مەیەن بۆی، بە ڕۆیشتن و ئارامییەوە بێن.', 'When the iqama is called, do not come running; come walking, with calmness.'],
    ['adab', 'b', 'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي', 'نوێژ بکەن وەک چۆن من نوێژ دەکەم دەمبینن.', 'Pray as you have seen me pray.'],
    ['adab', 'm', 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ', 'نزیکترین کاتێک بەندە لە پەروەردگاری نزیک دەبێتەوە کاتێکە لە سوژدەدایە، کەواتە زۆر دوعا بکەن.', 'The closest a servant is to his Lord is when he is prostrating, so make abundant supplication.'],
    ['adab', 'bm', 'إِذَا قَالَ الْإِمَامُ: غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ، فَقُولُوا: آمِينَ، فَإِنَّهُ مَنْ وَافَقَ قَوْلُهُ قَوْلَ الْمَلَائِكَةِ غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ', 'کاتێک پێشنوێژ وتی «غیر المغضوب علیهم ولا الضالین»، بڵێن «ئامین»، چونکە ئەوەی قسەکەی لەگەڵ قسەی فریشتەکان بگونجێت گوناهە پێشووەکانی دەبەخشرێن.', 'When the imam says "ghayril-maghdubi alayhim wa lad-dallin", say "Amin"; for whoever\'s saying coincides with that of the angels, his previous sins will be forgiven.'],
    ['adab', 'd', 'مُرُوا أَوْلَادَكُمْ بِالصَّلَاةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ، وَاضْرِبُوهُمْ عَلَيْهَا وَهُمْ أَبْنَاءُ عَشْرٍ، وَفَرِّقُوا بَيْنَهُمْ فِي الْمَضَاجِعِ', 'فەرمان بە منداڵەکانتان بکەن بە نوێژ کاتێک حەوت ساڵن، و لەسەری سزایان بدەن کاتێک دە ساڵن، و جێگەیان لێک جیا بکەنەوە.', 'Command your children to pray when they are seven years old, and discipline them for it when they are ten, and separate them in their beds.']
  ];
  var LN = { en: 'English', tr: 'Türkçe', fa: 'فارسی', ur: 'اردو', fr: 'Français', de: 'Deutsch', id: 'Indonesia', ru: 'Русский', es: 'Español' };
  var WL = { tr: 1, fa: 1, ur: 1, fr: 1, de: 1, id: 1, ru: 1, es: 1 };
  var UI = {
    ckb: { title: 'فەزڵی نوێژ و جەماعەت', copy: 'کۆپی', done: 'کۆپی کرا', ayah: 'ئایەت', note: '' },
    en: { title: 'Virtues of prayer & congregation', copy: 'Copy', done: 'Copied', ayah: 'Ayah', note: 'Translations of the Qur\'an are interpretive; consult scholars for rulings.' },
    ar: { title: 'فضل الصلاة والجماعة', copy: 'نسخ', done: 'تم النسخ', ayah: 'آية', note: '' }
  };
  var corpus = null, cat = 'all', loading = false;
  function lang() { return window.appLang || 'ckb'; }
  function ui() { var l = lang(); return UI[l] || (l === 'bad' ? UI.ckb : UI.en); }
  function ep() { try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function loadCorpus(cb) {
    if (corpus) return cb(); if (loading) return; loading = true;
    fetch('ai/quran.json').then(function (r) { return r.json(); }).then(function (j) { var m = {}; ((j && j.v) || []).forEach(function (r) { m[r[0] + ':' + r[1]] = r[2]; }); corpus = m; loading = false; cb(); }).catch(function () { corpus = {}; loading = false; cb(); });
  }
  function ayahAr(ref) {
    var m = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/); if (!m) return ''; var out = [];
    for (var a = +m[2]; a <= +(m[3] || m[2]); a++) { var t = corpus && corpus[m[1] + ':' + a]; if (t) out.push(t + ' ﴿' + a + '﴾'); }
    return out.join(' ');
  }
  /* cached AI translation for the other languages (from Arabic + English hint) */
  var busy = {};
  function trKey(id, l) { return 'sv_tr_' + l + '_' + id; }
  function getTr(id, l) { try { var v = localStorage.getItem(trKey(id, l)) || ''; if (v && /[ەڵێڕۆ]/.test(v) && l !== 'ur' && l !== 'fa') { localStorage.removeItem(trKey(id, l)); return ''; } return v; } catch (e) { return ''; } }
  function fetchTr(id, ar, en, l, done) {
    var k = id + l; if (busy[k] || !ep()) return; busy[k] = 1;
    fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: ar.slice(0, 3000), en: en, lang: l, kind: 'sira' }) })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !(d.text || d.ku)) throw 1; return d.text || d.ku; }); })
      .then(function (t) { busy[k] = 0; if (/[ەڵێڕۆ]/.test(t) && l !== 'ur' && l !== 'fa') return; try { localStorage.setItem(trKey(id, l), t); } catch (e) {} done(); })
      .catch(function () { busy[k] = 0; });
  }
  function items() {
    var a = [];
    AYAT.forEach(function (x, i) { a.push({ id: 'a' + i, type: 'ayah', cat: x[0], ref: x[1], ckb: x[2], en: x[3] }); });
    HAD.forEach(function (x, i) { a.push({ id: 'h' + i, type: 'hadith', cat: x[0], src: x[1], ar: x[2], ckb: x[3], en: x[4] }); });
    return a;
  }
  function render(box) {
    var l = lang(), U = ui(), ar = l === 'ar', ku = l === 'ckb' || l === 'bad';
    var idx = ku ? 1 : (ar ? 3 : 2);
    var chips = CATS.map(function (c) { return '<button type="button" data-vc="' + c[0] + '" class="sv-chip' + (cat === c[0] ? ' on' : '') + '">' + esc(ar ? c[3] : (ku ? c[1] : c[2])) + '</button>'; }).join('');
    var list = items().filter(function (x) { return cat === 'all' || x.cat === cat; });
    var needTr = [];
    var cards = list.map(function (x) {
      var arab = x.type === 'ayah' ? ayahAr(x.ref) : x.ar;
      var src = x.type === 'ayah' ? (U.ayah + ' · ' + x.ref) : (ar ? SRC[x.src][0] : ku ? SRC[x.src][1] : SRC[x.src][2]);
      var tr = '';
      if (!ar) {
        if (ku) tr = x.ckb; else if (l === 'en') tr = x.en;
        else { tr = getTr(x.id, l); if (!tr) { tr = x.en; if (WL[l]) needTr.push(x); } }
      }
      var dir = (l === 'fa' || l === 'ur') ? 'rtl' : (ku ? 'rtl' : 'ltr');
      return '<div class="salah-card sv-card"><div class="sv-ar">' + esc(arab || '') + '</div>' + (tr ? '<div class="sv-tr" dir="' + dir + '">' + esc(tr) + '</div>' : '') + '<div class="sv-foot"><span>' + esc(src) + '</span><button type="button" class="sv-copy" data-id="' + x.id + '">' + esc(U.copy) + '</button></div></div>';
    }).join('');
    box.innerHTML = '<style>.sv-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}.sv-chip{flex:none;border:1px solid #dce5e1;background:#fff;border-radius:18px;padding:7px 13px;font-size:13px;color:#4b5f57}.sv-chip.on{background:#176b4b;color:#fff;border-color:#176b4b}.sv-ar{font-size:21px;line-height:2;direction:rtl;text-align:right;font-family:"Amiri","Scheherazade New","Noto Naskh Arabic",serif;color:#12372a}.sv-tr{margin-top:8px;font-size:14.5px;line-height:1.8;color:#2b3a34}.sv-foot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:12px;color:#6b7f76}.sv-copy{border:1px solid #dce5e1;background:#f4faf7;border-radius:9px;padding:5px 11px;font-size:12px;color:#176b4b}.sv-note{font-size:11.5px;color:#6b7f76;margin:8px 4px}</style><div class="sv-chips">' + chips + '</div>' + cards + (U.note ? '<div class="sv-note">' + esc(U.note) + '</div>' : '');
    box.querySelectorAll('.sv-chip').forEach(function (b) { b.onclick = function () { cat = b.getAttribute('data-vc'); render(box); }; });
    box.querySelectorAll('.sv-copy').forEach(function (b) {
      b.onclick = function () {
        var x = items().filter(function (y) { return y.id === b.getAttribute('data-id'); })[0], c = b.closest('.sv-card'); var t = c.querySelector('.sv-ar').textContent + '\n' + (c.querySelector('.sv-tr') ? c.querySelector('.sv-tr').textContent : '') + '\n' + c.querySelector('.sv-foot span').textContent;
        try { navigator.clipboard.writeText(t); b.textContent = U.done; setTimeout(function () { b.textContent = U.copy; }, 1500); } catch (e) {}
      };
    });
    needTr.slice(0, 6).forEach(function (x) { fetchTr(x.id, x.type === 'ayah' ? ayahAr(x.ref) : x.ar, x.en, l, function () { if (document.getElementById('salahBody') === box) render(box); }); });
  }
  window.__salahVirtues = function (box) { render(box); loadCorpus(function () { if (document.getElementById('salahBody') === box) render(box); }); };
})();
