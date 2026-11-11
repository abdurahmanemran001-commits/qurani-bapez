/* English / Arabic strings for the mushaf shell, repeat, download and reciter picker (used with lang-extra.js: whole text nodes, numbers -> {0}). */
(function () {
  var T = window.LANG_TT = window.LANG_TT || { en: {}, ar: {} };
  T.en = T.en || {}; T.ar = T.ar || {};
  var L = [
    ['دووبارەکردنەوە', 'Repeat', 'التكرار'],
    ['ئایەتی ئێستا: {0} : {1}', 'Current ayah: {0} : {1}', 'الآية الحالية: {0} : {1}'],
    ['کوژاوە', 'Off', 'إيقاف'],
    ['هەر ئایەتێک چەند جار', 'Repeat each ayah', 'تكرار كل آية'],
    ['دووبارەکردنەوەی چەند ئایەت', 'Repeat a range of ayahs', 'تكرار مقطع من الآيات'],
    ['لە ئایەتی', 'From ayah', 'من الآية'],
    ['تا ئایەتی', 'to ayah', 'إلى الآية'],
    ['(لە {0})', '(of {0})', '(من {0})'],
    ['ژمارەی دووبارەکردنەوە', 'Number of repeats', 'عدد التكرارات'],
    ['∞ بێکۆتا', '∞ Endless', '∞ بلا نهاية'],
    ['وەستان لە نێوان دووبارەکان', 'Pause between repeats', 'التوقف بين التكرارات'],
    ['{0} چرکە', '{0} sec', '{0} ثانية'],
    ['بێ وەستان', 'No pause', 'بدون توقف'],
    ['باشە', 'OK', 'حسناً'],
    ['تەواو', 'Done', 'تم'],
    ['پەڕە', 'Page', 'الصفحة'],
    ['پەڕەی {0}', 'Page {0}', 'صفحة {0}'],
    ['سورەت', 'Surah', 'السورة'],
    ['سووڕەتەکان', 'Surahs', 'السور'],
    ['تەفسیر', 'Tafsir', 'التفسير'],
    ['⬇ دابەزاندنی سەوت', '⬇ Download audio', '⬇ تنزيل الصوت'],
    ['دابەزاندنی سەوت', 'Download audio', 'تنزيل الصوت'],
    ['کاتێک ئینتەرنێت هەبێت سەوتەکە خۆی لە ئینتەرنێتەوە دەخوێنرێتەوە و پێویست بە دابەزاندن ناکات؛ دابەزاندن تەنها بۆ کاتی بێ ئینتەرنێتە.', 'When you are online the audio streams from the internet, so no download is needed; downloading is only for offline use.', 'عند توفر الإنترنت يُشغَّل الصوت مباشرة دون تنزيل؛ التنزيل مخصص للاستخدام دون إنترنت فقط.'],
    ['سووڕەت:', 'Surah:', 'السورة:'],
    ['دابەزاندن… {0}/{1}', 'Downloading… {0}/{1}', 'جارٍ التنزيل… {0}/{1}'],
    ['دانەبەزێنراوە', 'Not downloaded', 'غير منزّل'],
    ['✅ دابەزێنراوە ({0})', '✅ Downloaded ({0})', '✅ تم التنزيل ({0})'],
    ['کۆی دابەزێنراو: {0}', 'Total downloaded: {0}', 'إجمالي المنزّل: {0}'],
    ['کۆی دابەزێنراو: {0} • بەکارهاتوو {1} لە {2}', 'Total downloaded: {0} • used {1} of {2}', 'إجمالي المنزّل: {0} • المستخدم {1} من {2}'],
    ['⬇ دابەزاندن', '⬇ Download', '⬇ تنزيل'],
    ['🗑 ڕەشکردنەوە', '🗑 Delete', '🗑 حذف'],
    ['ڕەشکردنەوەی هەموو ئەم قاریە', 'Delete all of this reciter', 'حذف كل تنزيلات هذا القارئ'],
    ['داخستن', 'Close', 'إغلاق'],
    ['ئینتەرنێت نییە', 'No internet', 'لا يوجد إنترنت'],
    ['❌ دابەزاندن سەرنەکەوت (ئەم سەرچاوەیە لە وێبسایت ڕێگە نادات)', '❌ Download failed (this source does not allow it from a website)', '❌ فشل التنزيل (هذا المصدر لا يسمح بذلك من الموقع)'],
    ['قورئانخوێن', 'Reciter', 'القارئ'],
    ['{0} قورئانخوێن', '{0} reciters', '{0} قرّاء'],
    ['ئێستا گوێ دەگریت لە', 'Now listening to', 'تستمع الآن إلى'],
    ['قورئانخوێنی کورد', 'Kurdish reciter', 'قارئ كردي'],
    ['قورئانخوێنی عەرەب', 'Arabic reciter', 'قارئ عربي'],
    ['🟢 قورئانخوێنە کوردەکان', '🟢 Kurdish reciters', '🟢 القرّاء الأكراد'],
    ['🟤 قورئانخوێنە عەرەبەکان', '🟤 Arabic reciters', '🟤 القرّاء العرب'],
    ['گەڕانەوە', 'Back', 'رجوع'],
    ['پێشوو', 'Previous', 'السابق'],
    ['ڕاگرتن', 'Pause', 'إيقاف مؤقت'],
    ['ئایەتی دواتر', 'Next ayah', 'الآية التالية'],
    ['ئایەتی پێشوو', 'Previous ayah', 'الآية السابقة'],
    ['سڕینەوە', 'Delete', 'حذف'],
    ['بەکاریبهێنە', 'Use', 'استخدام'],
    ['بینین بە ئینتەرنێت', 'View online', 'عرض عبر الإنترنت'],
    ['سەرچاوەکان', 'Sources', 'المصادر'],
    ['قیرائەتەکان', 'Qira\'at', 'القراءات'],
    ['قیرائەتەکان (داگرتن پێویستە)', 'Qira\'at (download required)', 'القراءات (يلزم التنزيل)'],
    ['موسحەفی قورئان', 'Quran Mushaf', 'مصحف القرآن'],
    ['موسحەف و قیرائەتەکان', 'Mushaf & Qira\'at', 'المصحف والقراءات'],
    ['ڕیوایەتەکانی تر (تەنها دەنگ)', 'Other narrations (audio only)', 'روايات أخرى (صوت فقط)'],
    ['تەجوید (دەق)', 'Tajweed (text)', 'التجويد (نص)'],
    ['مەدینە تەجوید', 'Madinah Tajweed', 'المدينة تجويد'],
    ['لەناو ئەپەکە', 'Inside the app', 'داخل التطبيق'],
    ['شوعبە', 'Shu\'ba', 'شعبة'],
    ['وەرش', 'Warsh', 'ورش'],
    ['بەزی', 'Bazzi', 'البزي'],
    ['عبدالڕەشید سوفی (دووری)', 'Abdurrashid Sufi (Duri)', 'عبد الرشيد صوفي (الدوري)'],
    ['عبدالڕەشید سوفی (سووسی)', 'Abdurrashid Sufi (Susi)', 'عبد الرشيد صوفي (السوسي)'],
    ['عبدالڕەشید سوفی (خەلەف عن حەمزە)', 'Abdurrashid Sufi (Khalaf from Hamza)', 'عبد الرشيد صوفي (خلف عن حمزة)'],
    ['عەلی حوزەیفی (شوعبە)', 'Ali Huzaifi (Shu\'ba)', 'علي الحذيفي (شعبة)'],
    ['دەق بە فۆنتی مجمع الملك فهد و دەنگ.', 'Text in the King Fahd Complex font, with audio.', 'نص بخط مجمع الملك فهد مع الصوت.'],
    ['دەقی ڕەنگاوڕەنگی تەجوید. لەناو ئەپەکەدایە.', 'Colour-coded tajweed text. Inside the app.', 'نص التجويد الملوّن. داخل التطبيق.'],
    ['وێنەی مصحف بە هایلایت و دەنگی حوزەیفی.', 'Mushaf image with highlight and Huzaifi audio.', 'صورة المصحف مع التظليل وصوت الحذيفي.'],
    ['وێنەی مصحف بە هایلایت و دەنگی دوکالی.', 'Mushaf image with highlight and Dukali audio.', 'صورة المصحف مع التظليل وصوت الدكالي.'],
    ['وێنەی ڕەسمی مصحف المدينة بە هایلایت.', 'Official Madinah Mushaf image with highlight.', 'صورة مصحف المدينة الرسمية مع التظليل.'],
    ['ڕەنگاوڕەنگ، هایلایتی ئایەت و دەنگ. لەناو ئەپەکەدایە.', 'Colour-coded, ayah highlight and audio. Inside the app.', 'ملوّن مع تظليل الآية والصوت. داخل التطبيق.'],
    ['· ✓ ئێستا', '· ✓ Current', '· ✓ الحالي'],
    ['خەتمە و ئامار', 'Khatma & Stats', 'الختمة والإحصائيات'],
    ['لەبەرکردن', 'Memorize', 'الحفظ'],
    ['تەسبیح', 'Tasbih', 'التسبيح'],
    ['سبحان الله، الحمد لله و زیاتر، لەگەڵ فەزڵی هەر یەکێک', 'Subhan Allah, Alhamdulillah and more, with the virtue of each', 'سبحان الله، الحمد لله وغيرها، مع فضل كل ذكر'],
    ['ئەی ئای شەرعی', 'AI Sharia assistant', 'مساعد الشريعة بالذكاء الاصطناعي'],
    ['ناوخۆیی یان Gemini خۆڕایی', 'Local or free Gemini', 'محلي أو Gemini المجاني'],
    ['پرسیار و زانیاری', 'Questions & knowledge', 'أسئلة ومعلومات'],
    ['هەر بەشێک لە هەمان ئەپدایە، بەڵام ڕووکاری تایبەتی خۆی هەیە.', 'Every section is in the same app, but each has its own interface.', 'كل قسم داخل التطبيق نفسه، ولكل قسم واجهته الخاصة.']
  ];
  L.forEach(function (r) { if (!T.en[r[0]]) T.en[r[0]] = r[1]; if (!T.ar[r[0]]) T.ar[r[0]] = r[2]; });


  /* exact entries for texts the word-by-word fallback of language.js only half translates */
  var X = window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} }; X.en = X.en || {}; X.ar = X.ar || {};
  [
    ['زیکری بەیانی و ئێوارە و پێش خەوتن', 'Morning, evening and bedtime adhkar', 'أذكار الصباح والمساء والنوم'],
    ['ئایەت و دوعای پێغەمبەر ﷺ بۆ شیفا و پاراستن', 'Ayahs and prophetic supplications for healing and protection', 'آيات وأدعية نبوية للشفاء والحماية'],
    ['سووڕەتەکان', 'Surahs', 'السور'],
    ['بەشەکان + کتێبخانە · داگرتن · ئۆفلاین', 'Sections + Library · download · offline', 'الأقسام + المكتبة · تنزيل · دون إنترنت'],
    ['سورەتەکان', 'Surahs', 'السور'],
    ['Viewer ـەکە ئامادەیە، بەڵام سێرڤەری وێنەی موسحەف وەڵامی نەدا.', 'The viewer is ready, but the mushaf image server did not respond.', 'العارض جاهز لكن خادم صور المصحف لم يستجب.'],
    ['سەرچاوەی وێنەکە لەم کاتەدا بەردەست نییە', 'The image source is unavailable right now', 'مصدر الصورة غير متاح حالياً'],
    ['ڕەمەزان شکوور کوردی', 'Ramadan Shukur (Kurdish)', 'رمضان شكور (كردي)'],
    ['بەشەکانی ئەذکار', 'Adhkar sections', 'أقسام الأذكار'],
    ['تەواو · پاشەکەوتکرا', 'Done · saved', 'تم · محفوظ'],
    ['ڕێکخستنەکان', 'Settings', 'الإعدادات'],
    ['گەڕان بە ناوی سورەت...', 'Search by surah name...', 'ابحث باسم السورة...']
  ].forEach(function (r) { X.en[r[0]] = r[1]; X.ar[r[0]] = r[2]; T.en[r[0]] = r[1]; T.ar[r[0]] = r[2]; });

  /* reciter names: show the English name when the app language is not Kurdish/Arabic */
  var map = null, busy = false;
  function lang() { try { return window.appLang || localStorage.getItem('app_language') || 'ckb'; } catch (e) { return 'ckb'; } }
  function load(cb) {
    if (map) return cb();
    function t(u, f) { fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { map = {}; d.forEach(function (x) { if (x.n && x.e) map[x.n] = x.e; }); cb(); }).catch(f); }
    t('mushaf/reciters.json', function () { t('reciters.json', function () { map = {}; }); });
  }
  function fix() {
    var l = lang(); if (busy) return;
    if (l === 'ckb' || l === 'bad' || l === 'ar') { Array.prototype.forEach.call(document.querySelectorAll('[data-kn]'), function (o) { o.textContent = o.getAttribute('data-kn'); o.removeAttribute('data-kn'); }); return; }
    load(function () {
      busy = true;
      try {
        Array.prototype.forEach.call(document.querySelectorAll('#madaniReciter option, #rc option, .rc-cur b, .rc-item b, .rc-item span, #rcBtn span'), function (o) {
          var t = o.textContent.trim(); if (map[t]) { o.setAttribute('data-kn', t); o.textContent = map[t]; }
        });
      } finally { busy = false; }
    });
  }
  setInterval(fix, 1500);
})();
