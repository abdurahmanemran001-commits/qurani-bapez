/* hadith.js v6 — Arabic text + translation in the language the person chose in the app.
 * Human translations (fawazahmed0/hadith-api) are used where an edition exists (en, tr, ur, fr, id, ru);
 * otherwise the English edition is shown and the Worker (/translate with lang) can translate on demand (all languages).
 * ckb / bad keep the old behaviour: English + AI Kurdish translation. ar shows the Arabic text only. */
(function () {
  if (window.__hadithV6) return;
  window.__hadithV6 = true;
  window.__hadithV5 = true;

  var BM_KEY = 'hadith_bm_v1';
  var KU_KEY = 'hadith_ku_tr_v2';
  var RTL = { ckb: 1, bad: 1, ar: 1, fa: 1, ur: 1 };

  /* ---------- texts ---------- */
  var UI = {};
  UI.ckb = {
    t_home: `حەدیسی پەیامبەر ﷺ`, t_det: `حەدیس`, t_bm: `نیشانەکراوەکان`, sub: `عەرەبی · ئینگلیزی · وەرگێڕانی کوردی`,
    back: `‹ گەڕانەوە`, secs: `بەشەکان`, ph: `گەڕان...`, go: `گەڕان`, topics: `بابەتەکان`, books: `کتێبەکان`, sm: `بچووک`, lg: `گەورە`,
    pe: `+ئینگلیزی`, cnt: `حەدیس`, lar: `عەرەبی`, ld: `… بارکردن`, tg: `… وەرگێڕانی کوردی`, no: `ژمارە`, btr: `وەرگێڕان بۆ کوردی`,
    unbm: `★ لابردنی نیشانە`, bm1: `☆ نیشانەکردن`, sh: `هاوبەشکردن`, wr: `⚠️ وەرگێڕانی AI جێگەی وەرگێڕانی زانایان ناگرێتەوە.`,
    nobm: `هیچ نیشانەیەک نییە`, nores: `هیچ ئەنجامێک نەدۆزرایەوە`, only: `تەنها {n}ی یەکەم — گەڕان بەکاربهێنە`,
    el: `بارکردن سەرنەکەوت: `, et: `وەرگێڕان سەرنەکەوت: `, nosvc: `خزمەتگوزاریی وەرگێڕان ئامادە نییە`, tmo: `کات تەواو بوو، دووبارە هەوڵ بدەرەوە`,
    nt: `دەق نییە`, err: `هەڵە`, cardS: `بخاری · مسلم · وەرگێڕانی کوردی`, fb: ``, ln: `کوردی`,
    ai_t: `🔎 گەڕانی زیرەکی حەدیس (AI)`, ai_s: `بە هەر زمانێک بپرسە، حەدیسەکان بدۆزەرەوە و وەریبگێڕە`, ai_h: `🔎 گەڕانی زیرەکی حەدیس`,
    ai_hs: `بە هەر زمانێک بنووسە · عەرەبی + وەرگێڕان`, ai_back: `‹ حەدیس`, ai_ph: `بابەت یان پرسیار بنووسە...`, ai_go: `بگەڕێ`,
    ai_empty: `پرسیار یان بابەتێک بنووسە بە هەر زمانێک (کوردی، عەرەبی، English، Türkçe، فارسی...) و حەدیسە پەیوەندیدارەکان دەدۆزمەوە.\n\nنموونە: «فەزڵی ڕاستگۆیی»، «حدیث عن بر الوالدین»، «hadith about patience»`,
    ai_srch: `… گەڕان بەدوای حەدیسەکاندا`, ai_ld: `… بارکردنی حەدیسەکان {p}٪`, ai_found: `{n} حەدیس دۆزرایەوە`,
    ai_none: `هیچ حەدیسێکی پەیوەندیدار نەدۆزرایەوە. بە وشەی جیاواز یان بە عەرەبی تاقی بکەرەوە.`,
    ai_err: `هەڵەیەک ڕوویدا. ئینتەرنێتەکەت بپشکنە و دووبارە هەوڵ بدەرەوە.`, ai_tr: `وەرگێڕان`, ai_cp: `کۆپی`, ai_sh: `شەیر`, ai_tt: `گەڕانی حەدیس`
  };
  UI.bad = UI.ckb;
  UI.en = {
    t_home: `Hadith of the Prophet ﷺ`, t_det: `Hadith`, t_bm: `Bookmarks`, sub: `Arabic · English`,
    back: `‹ Back`, secs: `Sections`, ph: `Search...`, go: `Search`, topics: `Topics`, books: `Books`, sm: `Small`, lg: `Large`,
    pe: `+English`, cnt: `hadiths`, lar: `Arabic`, ld: `… Loading`, tg: `… Translating`, no: `No.`, btr: `Translate to English`,
    unbm: `★ Remove bookmark`, bm1: `☆ Bookmark`, sh: `Share`, wr: `⚠️ AI translation does not replace the translation of scholars.`,
    nobm: `No bookmarks yet`, nores: `No results found`, only: `Only the first {n} shown — use search`,
    el: `Loading failed: `, et: `Translation failed: `, nosvc: `Translation service is not available`, tmo: `Timed out, please try again`,
    nt: `No text`, err: `Error`, cardS: `Bukhari · Muslim · Translation`,
    fb: `There is no English edition of this hadith. Tap “Translate to English” for an AI translation.`, ln: `English`,
    ai_t: `🔎 Smart Hadith Search (AI)`, ai_s: `Ask in any language, find hadiths and translate them`, ai_h: `🔎 Smart Hadith Search`,
    ai_hs: `Write in any language · Arabic + translation`, ai_back: `‹ Hadith`, ai_ph: `Type a topic or question...`, ai_go: `Search`,
    ai_empty: `Type a topic or question in any language (Kurdish, Arabic, English, Türkçe, فارسی...) and I will find the related hadiths.\n\nExamples: “virtue of honesty”, “hadith about parents”, “hadith about patience”`,
    ai_srch: `… Searching hadiths`, ai_ld: `… Loading hadiths {p}%`, ai_found: `{n} hadiths found`,
    ai_none: `No related hadith found. Try different words or Arabic.`,
    ai_err: `Something went wrong. Check your internet and try again.`, ai_tr: `Translate`, ai_cp: `Copy`, ai_sh: `Share`, ai_tt: `Hadith search`
  };
  UI.ar = {
    t_home: `حديث النبي ﷺ`, t_det: `حديث`, t_bm: `المحفوظات`, sub: `النص العربي`,
    back: `رجوع ›`, secs: `الأقسام`, ph: `بحث...`, go: `بحث`, topics: `المواضيع`, books: `الكتب`, sm: `صغير`, lg: `كبير`,
    pe: ``, cnt: `حديث`, lar: `العربية`, ld: `… جارٍ التحميل`, tg: `… جارٍ الترجمة`, no: `رقم`, btr: ``,
    unbm: `★ إزالة العلامة`, bm1: `☆ حفظ`, sh: `مشاركة`, wr: ``,
    nobm: `لا توجد أحاديث محفوظة`, nores: `لم يتم العثور على نتائج`, only: `عرض أول {n} فقط — استخدم البحث`,
    el: `فشل التحميل: `, et: `فشلت الترجمة: `, nosvc: `خدمة الترجمة غير متاحة`, tmo: `انتهت المهلة، حاول مرة أخرى`,
    nt: `لا يوجد نص`, err: `خطأ`, cardS: `البخاري · مسلم`, fb: ``, ln: `العربية`,
    ai_t: `🔎 البحث الذكي في الحديث (AI)`, ai_s: `اسأل بأي لغة، واعثر على الأحاديث وترجمها`, ai_h: `🔎 البحث الذكي في الحديث`,
    ai_hs: `اكتب بأي لغة · النص العربي + الترجمة`, ai_back: `حديث ›`, ai_ph: `اكتب موضوعًا أو سؤالًا...`, ai_go: `بحث`,
    ai_empty: `اكتب موضوعًا أو سؤالًا بأي لغة (الكردية، العربية، English، Türkçe، فارسی...) وسأجد الأحاديث ذات الصلة.\n\nأمثلة: «فضل الصدق»، «حديث عن بر الوالدين»، «hadith about patience»`,
    ai_srch: `… جارٍ البحث عن الأحاديث`, ai_ld: `… جارٍ تحميل الأحاديث {p}٪`, ai_found: `تم العثور على {n} حديث`,
    ai_none: `لم يتم العثور على حديث ذي صلة. جرّب كلمات مختلفة.`,
    ai_err: `حدث خطأ. تحقق من الإنترنت وحاول مرة أخرى.`, ai_tr: `ترجمة`, ai_cp: `نسخ`, ai_sh: `مشاركة`, ai_tt: `البحث في الحديث`
  };
  UI.tr = {
    t_home: `Peygamber ﷺ Hadisleri`, t_det: `Hadis`, t_bm: `Yer İmleri`, sub: `Arapça · Türkçe`,
    back: `‹ Geri`, secs: `Bölümler`, ph: `Ara...`, go: `Ara`, topics: `Konular`, books: `Kitaplar`, sm: `Küçük`, lg: `Büyük`,
    pe: `+Türkçe`, cnt: `hadis`, lar: `Arapça`, ld: `… Yükleniyor`, tg: `… Çevriliyor`, no: `No`, btr: `Türkçeye çevir`,
    unbm: `★ Yer imini kaldır`, bm1: `☆ Yer imi ekle`, sh: `Paylaş`, wr: `⚠️ Yapay zekâ çevirisi âlimlerin çevirisinin yerini tutmaz.`,
    nobm: `Henüz yer imi yok`, nores: `Sonuç bulunamadı`, only: `Yalnızca ilk {n} gösteriliyor — aramayı kullanın`,
    el: `Yükleme başarısız: `, et: `Çeviri başarısız: `, nosvc: `Çeviri hizmeti kullanılamıyor`, tmo: `Zaman aşımı, tekrar deneyin`,
    nt: `Metin yok`, err: `Hata`, cardS: `Buhârî · Müslim · Türkçe`,
    fb: `Bu hadisin Türkçe çevirisi yok; İngilizcesi gösteriliyor. Yapay zekâ çevirisi için “Türkçeye çevir”e dokunun.`, ln: `Türkçe`,
    ai_t: `🔎 Akıllı Hadis Arama (YZ)`, ai_s: `Her dilde sor, hadisleri bul ve çevir`, ai_h: `🔎 Akıllı Hadis Arama`,
    ai_hs: `Her dilde yaz · Arapça + çeviri`, ai_back: `‹ Hadis`, ai_ph: `Bir konu veya soru yazın...`, ai_go: `Ara`,
    ai_empty: `Herhangi bir dilde (Kürtçe, Arapça, English, Türkçe, فارسی...) bir konu veya soru yazın; ilgili hadisleri bulayım.\n\nÖrnekler: “doğruluğun fazileti”, “anne baba hakkında hadis”, “sabır hakkında hadis”`,
    ai_srch: `… Hadisler aranıyor`, ai_ld: `… Hadisler yükleniyor %{p}`, ai_found: `{n} hadis bulundu`,
    ai_none: `İlgili hadis bulunamadı. Farklı kelimeler veya Arapça deneyin.`,
    ai_err: `Bir hata oluştu. İnternetinizi kontrol edip tekrar deneyin.`, ai_tr: `Çevir`, ai_cp: `Kopyala`, ai_sh: `Paylaş`, ai_tt: `Hadis arama`
  };
  UI.fa = {
    t_home: `احادیث پیامبر ﷺ`, t_det: `حدیث`, t_bm: `نشان‌شده‌ها`, sub: `عربی · ترجمه فارسی`,
    back: `بازگشت ›`, secs: `بخش‌ها`, ph: `جستجو...`, go: `جستجو`, topics: `موضوعات`, books: `کتاب‌ها`, sm: `کوچک`, lg: `بزرگ`,
    pe: `+English`, cnt: `حدیث`, lar: `عربی`, ld: `… در حال بارگذاری`, tg: `… در حال ترجمه`, no: `شماره`, btr: `ترجمه به فارسی`,
    unbm: `★ حذف نشان`, bm1: `☆ نشان‌کردن`, sh: `اشتراک‌گذاری`, wr: `⚠️ ترجمه هوش مصنوعی جای ترجمه عالمان را نمی‌گیرد.`,
    nobm: `هنوز نشانی ندارید`, nores: `نتیجه‌ای یافت نشد`, only: `فقط {n} مورد اول نمایش داده می‌شود — از جستجو استفاده کنید`,
    el: `بارگذاری ناموفق بود: `, et: `ترجمه ناموفق بود: `, nosvc: `سرویس ترجمه در دسترس نیست`, tmo: `زمان به پایان رسید، دوباره تلاش کنید`,
    nt: `متنی نیست`, err: `خطا`, cardS: `بخاری · مسلم · ترجمه فارسی`,
    fb: `ترجمه فارسی این حدیث موجود نیست؛ متن انگلیسی نمایش داده می‌شود. برای ترجمه هوش مصنوعی «ترجمه به فارسی» را بزنید.`, ln: `فارسی`,
    ai_t: `🔎 جستجوی هوشمند حدیث (AI)`, ai_s: `به هر زبانی بپرس، حدیث‌ها را پیدا و ترجمه کن`, ai_h: `🔎 جستجوی هوشمند حدیث`,
    ai_hs: `به هر زبانی بنویس · عربی + ترجمه`, ai_back: `حدیث ›`, ai_ph: `موضوع یا پرسشی بنویسید...`, ai_go: `جستجو`,
    ai_empty: `موضوع یا پرسشی را به هر زبانی (کردی، عربی، English، Türkçe، فارسی...) بنویسید تا حدیث‌های مرتبط را پیدا کنم.\n\nمثال: «فضیلت راستگویی»، «حدیث درباره نیکی به پدر و مادر»، «hadith about patience»`,
    ai_srch: `… در حال جستجوی حدیث‌ها`, ai_ld: `… بارگذاری حدیث‌ها {p}٪`, ai_found: `{n} حدیث یافت شد`,
    ai_none: `حدیث مرتبطی یافت نشد. با کلمات دیگر یا به عربی امتحان کنید.`,
    ai_err: `خطایی رخ داد. اینترنت خود را بررسی کنید و دوباره تلاش کنید.`, ai_tr: `ترجمه`, ai_cp: `کپی`, ai_sh: `اشتراک`, ai_tt: `جستجوی حدیث`
  };
  UI.ur = {
    t_home: `احادیثِ نبی ﷺ`, t_det: `حدیث`, t_bm: `نشان زدہ`, sub: `عربی · اردو`,
    back: `واپس ›`, secs: `حصے`, ph: `تلاش...`, go: `تلاش`, topics: `موضوعات`, books: `کتابیں`, sm: `چھوٹی`, lg: `بڑی`,
    pe: `+اردو`, cnt: `احادیث`, lar: `عربی`, ld: `… لوڈ ہو رہا ہے`, tg: `… ترجمہ ہو رہا ہے`, no: `نمبر`, btr: `اردو میں ترجمہ کریں`,
    unbm: `★ نشان ہٹائیں`, bm1: `☆ نشان لگائیں`, sh: `شیئر کریں`, wr: `⚠️ مصنوعی ذہانت کا ترجمہ علماء کے ترجمے کا متبادل نہیں۔`,
    nobm: `ابھی کوئی نشان نہیں`, nores: `کوئی نتیجہ نہیں ملا`, only: `صرف پہلی {n} دکھائی گئی ہیں — تلاش استعمال کریں`,
    el: `لوڈ ناکام: `, et: `ترجمہ ناکام: `, nosvc: `ترجمے کی سروس دستیاب نہیں`, tmo: `وقت ختم، دوبارہ کوشش کریں`,
    nt: `متن نہیں`, err: `خرابی`, cardS: `بخاری · مسلم · اردو ترجمہ`,
    fb: `اس حدیث کا اردو ترجمہ دستیاب نہیں؛ انگریزی دکھائی جا رہی ہے۔ مصنوعی ذہانت کے ترجمے کے لیے «اردو میں ترجمہ کریں» دبائیں۔`, ln: `اردو`,
    ai_t: `🔎 ذہین حدیث تلاش (AI)`, ai_s: `کسی بھی زبان میں پوچھیں، احادیث تلاش کریں اور ترجمہ کریں`, ai_h: `🔎 ذہین حدیث تلاش`,
    ai_hs: `کسی بھی زبان میں لکھیں · عربی + ترجمہ`, ai_back: `حدیث ›`, ai_ph: `موضوع یا سوال لکھیں...`, ai_go: `تلاش`,
    ai_empty: `کسی بھی زبان میں (کردی، عربی، English، Türkçe، فارسی...) موضوع یا سوال لکھیں، میں متعلقہ احادیث تلاش کروں گا۔\n\nمثالیں: «سچائی کی فضیلت»، «والدین سے حسنِ سلوک کی حدیث»، «hadith about patience»`,
    ai_srch: `… احادیث تلاش کی جا رہی ہیں`, ai_ld: `… احادیث لوڈ ہو رہی ہیں {p}٪`, ai_found: `{n} احادیث ملیں`,
    ai_none: `کوئی متعلقہ حدیث نہیں ملی۔ مختلف الفاظ یا عربی میں آزمائیں۔`,
    ai_err: `کوئی خرابی پیش آئی۔ انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔`, ai_tr: `ترجمہ`, ai_cp: `کاپی`, ai_sh: `شیئر`, ai_tt: `حدیث تلاش`
  };
  UI.fr = {
    t_home: `Hadiths du Prophète ﷺ`, t_det: `Hadith`, t_bm: `Favoris`, sub: `Arabe · Français`,
    back: `‹ Retour`, secs: `Sections`, ph: `Rechercher...`, go: `Rechercher`, topics: `Thèmes`, books: `Livres`, sm: `Petit`, lg: `Grand`,
    pe: `+Français`, cnt: `hadiths`, lar: `Arabe`, ld: `… Chargement`, tg: `… Traduction`, no: `N°`, btr: `Traduire en français`,
    unbm: `★ Retirer des favoris`, bm1: `☆ Ajouter aux favoris`, sh: `Partager`, wr: `⚠️ La traduction par IA ne remplace pas la traduction des savants.`,
    nobm: `Aucun favori`, nores: `Aucun résultat`, only: `Seuls les {n} premiers sont affichés — utilisez la recherche`,
    el: `Échec du chargement : `, et: `Échec de la traduction : `, nosvc: `Service de traduction indisponible`, tmo: `Délai dépassé, réessayez`,
    nt: `Pas de texte`, err: `Erreur`, cardS: `Bukhari · Muslim · Français`,
    fb: `Pas de traduction française pour ce hadith ; l'anglais est affiché. Touchez « Traduire en français » pour une traduction par IA.`, ln: `Français`,
    ai_t: `🔎 Recherche intelligente de hadiths (IA)`, ai_s: `Posez votre question dans n'importe quelle langue, trouvez et traduisez les hadiths`, ai_h: `🔎 Recherche intelligente de hadiths`,
    ai_hs: `Écrivez dans n'importe quelle langue · Arabe + traduction`, ai_back: `‹ Hadith`, ai_ph: `Saisissez un thème ou une question...`, ai_go: `Chercher`,
    ai_empty: `Saisissez un thème ou une question dans n'importe quelle langue (kurde, arabe, English, Türkçe, فارسی...) et je trouverai les hadiths correspondants.\n\nExemples : « le mérite de la sincérité », « hadith sur les parents », « hadith sur la patience »`,
    ai_srch: `… Recherche des hadiths`, ai_ld: `… Chargement des hadiths {p} %`, ai_found: `{n} hadiths trouvés`,
    ai_none: `Aucun hadith correspondant. Essayez d'autres mots ou l'arabe.`,
    ai_err: `Une erreur est survenue. Vérifiez votre connexion et réessayez.`, ai_tr: `Traduire`, ai_cp: `Copier`, ai_sh: `Partager`, ai_tt: `Recherche de hadiths`
  };
  UI.ru = {
    t_home: `Хадисы Пророка ﷺ`, t_det: `Хадис`, t_bm: `Закладки`, sub: `Арабский · Русский`,
    back: `‹ Назад`, secs: `Разделы`, ph: `Поиск...`, go: `Поиск`, topics: `Темы`, books: `Книги`, sm: `Малая`, lg: `Большая`,
    pe: `+Русский`, cnt: `хадисов`, lar: `Арабский`, ld: `… Загрузка`, tg: `… Перевод`, no: `№`, btr: `Перевести на русский`,
    unbm: `★ Убрать закладку`, bm1: `☆ В закладки`, sh: `Поделиться`, wr: `⚠️ Перевод ИИ не заменяет перевод учёных.`,
    nobm: `Закладок пока нет`, nores: `Ничего не найдено`, only: `Показаны только первые {n} — используйте поиск`,
    el: `Не удалось загрузить: `, et: `Не удалось перевести: `, nosvc: `Служба перевода недоступна`, tmo: `Время истекло, попробуйте ещё раз`,
    nt: `Нет текста`, err: `Ошибка`, cardS: `Бухари · Муслим · Русский`,
    fb: `Русского перевода этого хадиса нет; показан английский. Нажмите «Перевести на русский» для перевода ИИ.`, ln: `Русский`,
    ai_t: `🔎 Умный поиск хадисов (ИИ)`, ai_s: `Спрашивайте на любом языке, находите хадисы и переводите их`, ai_h: `🔎 Умный поиск хадисов`,
    ai_hs: `Пишите на любом языке · Арабский + перевод`, ai_back: `‹ Хадисы`, ai_ph: `Введите тему или вопрос...`, ai_go: `Искать`,
    ai_empty: `Введите тему или вопрос на любом языке (курдский, арабский, English, Türkçe, فارسی...), и я найду подходящие хадисы.\n\nПримеры: «достоинство правдивости», «хадис о родителях», «хадис о терпении»`,
    ai_srch: `… Поиск хадисов`, ai_ld: `… Загрузка хадисов {p}%`, ai_found: `Найдено хадисов: {n}`,
    ai_none: `Подходящих хадисов не найдено. Попробуйте другие слова или арабский.`,
    ai_err: `Произошла ошибка. Проверьте интернет и повторите попытку.`, ai_tr: `Перевести`, ai_cp: `Копировать`, ai_sh: `Поделиться`, ai_tt: `Поиск хадисов`
  };
  UI.id = {
    t_home: `Hadis Nabi ﷺ`, t_det: `Hadis`, t_bm: `Penanda`, sub: `Arab · Indonesia`,
    back: `‹ Kembali`, secs: `Bagian`, ph: `Cari...`, go: `Cari`, topics: `Topik`, books: `Kitab`, sm: `Kecil`, lg: `Besar`,
    pe: `+Indonesia`, cnt: `hadis`, lar: `Arab`, ld: `… Memuat`, tg: `… Menerjemahkan`, no: `No.`, btr: `Terjemahkan ke Bahasa Indonesia`,
    unbm: `★ Hapus penanda`, bm1: `☆ Beri penanda`, sh: `Bagikan`, wr: `⚠️ Terjemahan AI tidak menggantikan terjemahan para ulama.`,
    nobm: `Belum ada penanda`, nores: `Tidak ada hasil`, only: `Hanya {n} pertama yang ditampilkan — gunakan pencarian`,
    el: `Gagal memuat: `, et: `Gagal menerjemahkan: `, nosvc: `Layanan terjemahan tidak tersedia`, tmo: `Waktu habis, coba lagi`,
    nt: `Tidak ada teks`, err: `Kesalahan`, cardS: `Bukhari · Muslim · Indonesia`,
    fb: `Terjemahan Indonesia untuk hadis ini belum tersedia; teks Inggris ditampilkan. Ketuk “Terjemahkan ke Bahasa Indonesia” untuk terjemahan AI.`, ln: `Indonesia`,
    ai_t: `🔎 Pencarian Hadis Cerdas (AI)`, ai_s: `Tanyakan dalam bahasa apa pun, temukan hadis dan terjemahkan`, ai_h: `🔎 Pencarian Hadis Cerdas`,
    ai_hs: `Tulis dalam bahasa apa pun · Arab + terjemahan`, ai_back: `‹ Hadis`, ai_ph: `Ketik topik atau pertanyaan...`, ai_go: `Cari`,
    ai_empty: `Ketik topik atau pertanyaan dalam bahasa apa pun (Kurdi, Arab, English, Türkçe, فارسی...) dan saya akan mencarikan hadis yang terkait.\n\nContoh: “keutamaan kejujuran”, “hadis tentang berbakti kepada orang tua”, “hadis tentang kesabaran”`,
    ai_srch: `… Mencari hadis`, ai_ld: `… Memuat hadis {p}%`, ai_found: `{n} hadis ditemukan`,
    ai_none: `Tidak ada hadis terkait. Coba kata lain atau bahasa Arab.`,
    ai_err: `Terjadi kesalahan. Periksa internet Anda dan coba lagi.`, ai_tr: `Terjemahkan`, ai_cp: `Salin`, ai_sh: `Bagikan`, ai_tt: `Pencarian hadis`
  };

  /* book names, same order as `books` below */
  var BN = {
    ckb: [`چل حەدیسی نەوەوی`, `حەدیسی قودسی`, `سەحیحی بوخاری`, `سەحیحی موسڵیم`, `سونەنی ئەبووداوود`, `جامعی تیرمیزی`, `سونەنی نەسائی`, `سونەنی ئیبن ماجە`],
    en: [`Forty Hadith of an-Nawawi`, `Hadith Qudsi`, `Sahih al-Bukhari`, `Sahih Muslim`, `Sunan Abi Dawud`, `Jami at-Tirmidhi`, `Sunan an-Nasa'i`, `Sunan Ibn Majah`],
    ar: [`الأربعون النووية`, `الأحاديث القدسية`, `صحيح البخاري`, `صحيح مسلم`, `سنن أبي داود`, `جامع الترمذي`, `سنن النسائي`, `سنن ابن ماجه`],
    tr: [`Kırk Hadis (Nevevî)`, `Hadis-i Kudsî`, `Sahih-i Buhârî`, `Sahih-i Müslim`, `Sünen-i Ebû Dâvûd`, `Câmi-i Tirmizî`, `Sünen-i Nesâî`, `Sünen-i İbn Mâce`],
    fa: [`چهل حدیث نووی`, `احادیث قدسی`, `صحیح بخاری`, `صحیح مسلم`, `سنن ابی‌داود`, `جامع ترمذی`, `سنن نسائی`, `سنن ابن ماجه`],
    ur: [`چالیس احادیثِ نووی`, `احادیثِ قدسی`, `صحیح بخاری`, `صحیح مسلم`, `سنن ابی داؤد`, `جامع ترمذی`, `سنن نسائی`, `سنن ابن ماجہ`],
    fr: [`Les Quarante Hadiths d'An-Nawawî`, `Hadiths Qudsî`, `Sahih al-Bukhârî`, `Sahih Muslim`, `Sunan Abî Dâwûd`, `Jâmi' at-Tirmidhî`, `Sunan an-Nasâ'î`, `Sunan Ibn Mâja`],
    ru: [`Сорок хадисов ан-Навави`, `Хадисы кудси`, `Сахих аль-Бухари`, `Сахих Муслим`, `Сунан Абу Дауда`, `Джами ат-Тирмизи`, `Сунан ан-Насаи`, `Сунан Ибн Маджа`],
    id: [`Hadis Arbain An-Nawawi`, `Hadis Qudsi`, `Sahih Al-Bukhari`, `Sahih Muslim`, `Sunan Abu Dawud`, `Jami' At-Tirmidzi`, `Sunan An-Nasa'i`, `Sunan Ibnu Majah`]
  };
  BN.bad = BN.ckb;

  /* topic names, same order as `topics` below */
  var TN = {
    ckb: [`نییەت`, `نوێژ`, `ووزو و پاکی`, `ڕۆژوو`, `زەکات و سەدەقە`, `حەج و عومرە`, `ئەخلاق`, `دایک و باوک`, `دراوسێ`, `ڕاستگۆیی`, `تووڕەیی`, `سەبر`, `زیکر و دوعا`, `قورئان`, `ئیمان`, `مردن و قیامەت`],
    en: [`Intention`, `Prayer`, `Purification (Wudu)`, `Fasting`, `Zakat & Charity`, `Hajj & Umrah`, `Good Character`, `Parents`, `Neighbors`, `Truthfulness`, `Anger`, `Patience`, `Remembrance & Du'a`, `The Quran`, `Faith (Iman)`, `Death & the Hereafter`],
    ar: [`النية`, `الصلاة`, `الوضوء والطهارة`, `الصيام`, `الزكاة والصدقة`, `الحج والعمرة`, `الأخلاق`, `الوالدان`, `الجار`, `الصدق`, `الغضب`, `الصبر`, `الذكر والدعاء`, `القرآن`, `الإيمان`, `الموت والآخرة`],
    tr: [`Niyet`, `Namaz`, `Abdest ve Temizlik`, `Oruç`, `Zekât ve Sadaka`, `Hac ve Umre`, `Ahlak`, `Anne-Baba`, `Komşu`, `Doğruluk`, `Öfke`, `Sabır`, `Zikir ve Dua`, `Kur'an`, `İman`, `Ölüm ve Ahiret`],
    fa: [`نیت`, `نماز`, `وضو و پاکی`, `روزه`, `زکات و صدقه`, `حج و عمره`, `اخلاق`, `پدر و مادر`, `همسایه`, `راستگویی`, `خشم`, `صبر`, `ذکر و دعا`, `قرآن`, `ایمان`, `مرگ و قیامت`],
    ur: [`نیت`, `نماز`, `وضو اور طہارت`, `روزہ`, `زکوٰۃ اور صدقہ`, `حج اور عمرہ`, `اخلاق`, `والدین`, `پڑوسی`, `سچائی`, `غصہ`, `صبر`, `ذکر اور دعا`, `قرآن`, `ایمان`, `موت اور قیامت`],
    fr: [`Intention`, `Prière`, `Ablutions et pureté`, `Jeûne`, `Zakat et aumône`, `Hajj et Omra`, `Bon caractère`, `Parents`, `Voisin`, `Sincérité`, `Colère`, `Patience`, `Invocation et Dou'a`, `Coran`, `Foi`, `Mort et au-delà`],
    ru: [`Намерение`, `Молитва`, `Омовение и чистота`, `Пост`, `Закят и милостыня`, `Хадж и умра`, `Нравственность`, `Родители`, `Сосед`, `Правдивость`, `Гнев`, `Терпение`, `Поминание и дуа`, `Коран`, `Вера`, `Смерть и Судный день`],
    id: [`Niat`, `Salat`, `Wudu dan Kesucian`, `Puasa`, `Zakat dan Sedekah`, `Haji dan Umrah`, `Akhlak`, `Orang Tua`, `Tetangga`, `Kejujuran`, `Amarah`, `Kesabaran`, `Zikir dan Doa`, `Al-Qur'an`, `Iman`, `Kematian dan Hari Kiamat`]
  };
  TN.bad = TN.ckb;

  function curLang() {
    var l = '';
    try { l = localStorage.getItem('app_language') || ''; } catch (e) {}
    l = l || window.appLang || document.documentElement.lang || 'ckb';
    if (l === 'ku') l = 'ckb';
    return UI[l] ? l : 'en';
  }
  function isKu(l) { return l === 'ckb' || l === 'bad'; }
  function U(k) {
    var L = curLang(), t = UI[L];
    if (t && t[k] != null) return t[k];
    if (!isKu(L) && UI.en[k] != null) return UI.en[k];
    return UI.ckb[k] != null ? UI.ckb[k] : '';
  }
  window.__hdL = {
    U: U, lang: curLang, isKu: isKu,
    rtl: function () { return !!RTL[curLang()]; }
  };

  var books = [
    { id: 'nawawi', name: 'الأربعون النووية', size: 's', eng: 'eng-nawawi' },
    { id: 'qudsi', name: 'الأحاديث القدسية', size: 's', eng: null },
    { id: 'bukhari', name: 'صحيح البخاري', size: 'l', eng: 'eng-bukhari' },
    { id: 'muslim', name: 'صحيح مسلم', size: 'l', eng: 'eng-muslim' },
    { id: 'abudawud', name: 'سنن أبي داود', size: 'l', eng: 'eng-abudawud' },
    { id: 'tirmidhi', name: 'جامع الترمذي', size: 'l', eng: 'eng-tirmidhi' },
    { id: 'nasai', name: 'سنن النسائي', size: 'l', eng: 'eng-nasai' },
    { id: 'ibnmajah', name: 'سنن ابن ماجه', size: 'l', eng: 'eng-ibnmajah' }
  ];
  var topics = [
    { id: 'niyyah', ar: ['نية', 'النيات', 'إنما الأعمال'] },
    { id: 'salah', ar: ['صلاة', 'الصلاة', 'ركعة', 'سجود'] },
    { id: 'wudu', ar: ['وضوء', 'طهارة', 'غسل'] },
    { id: 'sawm', ar: ['صوم', 'الصيام', 'رمضان'] },
    { id: 'zakat', ar: ['زكاة', 'صدقة'] },
    { id: 'hajj', ar: ['حج', 'عمرة'] },
    { id: 'akhlaq', ar: ['خلق', 'حسن الخلق', 'أدب'] },
    { id: 'parents', ar: ['والدين', 'الوالدين', 'بر'] },
    { id: 'neighbor', ar: ['جار', 'الجار'] },
    { id: 'truth', ar: ['صدق', 'الكذب'] },
    { id: 'anger', ar: ['غضب'] },
    { id: 'patience', ar: ['صبر'] },
    { id: 'dhikr', ar: ['ذكر', 'دعاء', 'استغفار'] },
    { id: 'quran', ar: ['قرآن', 'القرآن'] },
    { id: 'iman', ar: ['إيمان', 'الإيمان'] },
    { id: 'death', ar: ['موت', 'القبر', 'القيامة'] }
  ];
  topics.forEach(function (t, i) { t.idx = i; });
  books.forEach(function (b, i) { b.idx = i; });
  function bookName(b) { return (BN[curLang()] || BN.en)[b.idx]; }
  function topicName(t) { return (TN[curLang()] || TN.en)[t.idx]; }

  /* human translation editions that exist in hadith-api for each language prefix */
  var ED = { tr: 'tur', ur: 'urd', fr: 'fra', id: 'ind', ru: 'rus' };
  var EDB = {
    tur: 'abudawud,bukhari,ibnmajah,malik,muslim,nasai,nawawi,tirmidhi',
    urd: 'abudawud,bukhari,ibnmajah,malik,muslim,nasai,tirmidhi',
    fra: 'abudawud,bukhari,dehlawi,ibnmajah,malik,muslim,nasai,nawawi,qudsi',
    ind: 'abudawud,bukhari,ibnmajah,malik,muslim,nasai,tirmidhi',
    rus: 'abudawud,bukhari,muslim'
  };

  var state = {
    view: 'home', book: null, topic: null, list: [], query: '',
    detail: null, cache: {}, cacheLang: {}, maps: {}, loading: false, translating: false
  };

  function bookmarks() {
    try { var a = JSON.parse(localStorage.getItem(BM_KEY) || '[]'); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function saveBm(arr) {
    try { localStorage.setItem(BM_KEY, JSON.stringify(arr.slice(0, 200))); } catch (e) {}
  }
  function isBm(id) { return bookmarks().some(function (x) { return x.id === id; }); }
  function toggleBm(item) {
    var arr = bookmarks();
    var i = arr.findIndex(function (x) { return x.id === item.id; });
    if (i >= 0) arr.splice(i, 1);
    else arr.unshift({
      id: item.id, book: item.book, n: item.n, ar: (item.ar || '').slice(0, 400), grade: item.grade || '', label: item.label,
      en: item.en || '', ku: item.ku || '', loc: item.loc || '', ll: item.loc ? curLang() : '', ai: item.locAI ? 1 : 0
    });
    saveBm(arr);
  }

  function trKey(L) { return isKu(L) ? KU_KEY : 'hadith_tr_' + L + '_v1'; }
  function trCache(L) {
    try { return JSON.parse(localStorage.getItem(trKey(L)) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveTr(L, id, txt) {
    var c = trCache(L); c[id] = txt;
    try { localStorage.setItem(trKey(L), JSON.stringify(c)); } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }

  function injectCss() {
    if ($('hadithCss')) return;
    var s = document.createElement('style');
    s.id = 'hadithCss';
    s.textContent = [
      'body:has(#hadithView.active) .top{display:none!important}',
      '.phone:has(#hadithView.active) .status,.phone:has(#hadithView.active) .appbar,.phone:has(#hadithView.active) .bottom{display:none!important}',
      '.phone:has(#hadithView.active) .main{height:100%!important;padding:0!important;background:#f7f4ef}',
      '#hadithView{display:none!important}',
      '#hadithView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#hadithView .hd-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#3d2a14,#8a6a24);color:#fff;flex-shrink:0}',
      '#hadithView .hd-head h2{margin:0;font-size:17px;font-weight:800}',
      '#hadithView .hd-head .hd-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#hadithView .hd-btn{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#hadithView .hd-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#hadithView .hd-card{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-align:start}',
      '#hadithView .hd-card:active{background:#fbf5e7}',
      '#hadithView .hd-card b{display:block;font-size:15px;color:#3d2a14;margin-bottom:4px}',
      '#hadithView .hd-card small{color:#8a6a24;font-size:12px}',
      '#hadithView .hd-ar{font-family:serif;font-size:18px;line-height:2;text-align:right;color:#1a2e24;direction:rtl}',
      '#hadithView .hd-en{font-size:14px;line-height:1.7;color:#3d4a42;margin-top:10px;padding-top:10px;border-top:1px dashed #e4d5ad;text-align:left;direction:ltr}',
      '#hadithView .hd-ku,#hadithView .hd-loc{font-size:15px;line-height:1.9;color:#1a2e24;margin-top:10px;padding-top:10px;border-top:1px dashed #e4d5ad;text-align:start;background:#fbf8f0;border-radius:10px;padding:10px}',
      '#hadithView .hd-fb{font-size:12px;color:#8a6a24;margin-top:8px;line-height:1.7;text-align:start}',
      '#hadithView .hd-label{font-size:11px;color:#8a6a24;font-weight:700;margin-bottom:4px}',
      '#hadithView .hd-meta{font-size:12px;color:#8a6a24;margin-top:8px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}',
      '#hadithView .hd-search{display:flex;gap:8px;margin-bottom:12px}',
      '#hadithView .hd-search input{flex:1;border:1px solid #e4d5ad;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;background:#fff}',
      '#hadithView .hd-search button{border:0;background:#8a6a24;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}',
      '#hadithView .hd-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}',
      '#hadithView .hd-chip{border:1px solid #e4d5ad;background:#fff;border-radius:20px;padding:6px 12px;font-size:12px;cursor:pointer;color:#3d2a14}',
      '#hadithView .hd-empty{text-align:center;color:#8a6a24;padding:30px 10px;font-size:14px}',
      '#hadithView .hd-loading{text-align:center;padding:24px;color:#8a6a24}',
      '#hadithView .hd-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
      '#hadithView .hd-actions button{border:1px solid #e4d5ad;background:#fff;border-radius:10px;padding:8px 12px;font-size:13px;cursor:pointer;color:#3d2a14}',
      '#hadithView .hd-actions button.primary{background:#8a6a24;color:#fff;border-color:#8a6a24}',
      '.section-choice.hadith-choice{border-color:#e4d5ad;background:linear-gradient(135deg,#fff,#fbf5e7)}',
      '.section-choice.hadith-choice .choice-icon{background:#f0e6c8;color:#8a6a24}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('hadithView');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'hadithView';
    v.className = 'view';
    main.appendChild(v);
    return v;
  }

  /* ---------- data ---------- */
  function getMap(ed) {
    if (state.maps[ed]) return Promise.resolve(state.maps[ed]);
    var url = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/' + ed + '.json';
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.hadiths) return null;
      var map = {};
      d.hadiths.forEach(function (h) {
        var n = h.hadithnumber || h.arabicnumber;
        if (n != null) map[String(n)] = h.text || '';
      });
      state.maps[ed] = map;
      return map;
    }).catch(function () { return null; });
  }

  /* English edition + (when it exists) the edition in the chosen language + cached AI translations */
  function applyTr(bookId, list) {
    var L = curLang();
    var meta = books.find(function (b) { return b.id === bookId; });
    var jobs = [];
    list.forEach(function (i) { i.loc = ''; i.locAI = false; });
    if (meta && meta.eng) {
      jobs.push(getMap(meta.eng).then(function (m) {
        if (m) list.forEach(function (i) { var t = m[String(i.n)]; if (t) i.en = t; });
      }));
    }
    var p = ED[L];
    if (p && meta && meta.eng && EDB[p].split(',').indexOf(bookId) >= 0) {
      jobs.push(getMap(p + '-' + bookId).then(function (m) {
        if (m) list.forEach(function (i) { var t = m[String(i.n)]; if (t) i.loc = t; });
      }));
    }
    return Promise.all(jobs).then(function () {
      var kc = trCache('ckb');
      var lc = (isKu(L) || L === 'ar') ? {} : trCache(L);
      list.forEach(function (i) {
        if (kc[i.id]) i.ku = kc[i.id];
        if (!i.loc && lc[i.id]) { i.loc = lc[i.id]; i.locAI = true; }
      });
    });
  }

  function loadBook(id) {
    var L = curLang();
    if (state.cache[id]) {
      if (state.cacheLang[id] === L) return Promise.resolve(state.cache[id]);
      state.loading = true; render();
      return applyTr(id, state.cache[id]).then(function () {
        state.cacheLang[id] = L; state.loading = false; return state.cache[id];
      });
    }
    state.loading = true;
    render();
    return fetch('ai/' + id + '.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      var label = d.n || id;
      var list = (d.h || []).map(function (row) {
        return {
          id: 'h:' + id + ':' + row[0],
          book: id, label: label, n: row[0],
          ar: row[1] || '', grade: row[2] || '', en: '', ku: '', loc: '', locAI: false
        };
      });
      state.cache[id] = list;
      return applyTr(id, list).then(function () {
        state.cacheLang[id] = L;
        state.loading = false;
        return state.cache[id];
      });
    }).catch(function (e) {
      state.loading = false;
      alert(U('el') + (e.message || e));
      return [];
    });
  }

  function tEndpoint() {
    try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; }
  }

  /* text in the chosen language ('' when there is none) */
  function locText(i) {
    var L = curLang();
    if (isKu(L)) return i.ku || '';
    if (L === 'ar') return '';
    if (L === 'en') return i.en || i.loc || '';
    return i.loc || '';
  }

  /* AI translation through the Worker, in the chosen language */
  function translateItem(item) {
    var L = curLang(), ku = isKu(L);
    if (!item || !item.ar) return Promise.reject(new Error(U('nt')));
    var cached = trCache(ku ? 'ckb' : L)[item.id];
    if (cached) {
      if (ku) item.ku = cached; else { item.loc = cached; item.locAI = true; }
      return Promise.resolve(cached);
    }
    var ep = tEndpoint();
    if (!ep) return Promise.reject(new Error(U('nosvc')));
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 40000);
    var payload = { ar: item.ar, en: item.en || '' };
    if (!ku) payload.lang = L;
    return fetch(ep + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctl ? ctl.signal : undefined
    }).then(function (res) {
      return res.json().then(function (data) {
        var txt = data && (data.ku || data.text);
        if (!res.ok || !txt) throw new Error((data && data.message) || ('HTTP ' + res.status));
        if (ku) item.ku = txt; else { item.loc = txt; item.locAI = true; }
        saveTr(ku ? 'ckb' : L, item.id, txt);
        return txt;
      });
    }).catch(function (e) {
      throw new Error(e && e.name === 'AbortError' ? U('tmo') : (e.message || U('err')));
    }).then(function (v) { clearTimeout(timer); return v; }, function (e) { clearTimeout(timer); throw e; });
  }

  function filterTopic(list, topic) {
    if (!topic) return list;
    var keys = topic.ar || [];
    return list.filter(function (h) {
      var t = h.ar;
      for (var i = 0; i < keys.length; i++) if (t.indexOf(keys[i]) >= 0) return true;
      return false;
    });
  }
  function filterSearch(list, q) {
    q = String(q || '').trim();
    if (!q) return list;
    var parts = q.split(/\s+/);
    return list.filter(function (h) {
      var t = h.ar + ' ' + (h.en || '') + ' ' + (h.ku || '') + ' ' + (h.loc || '') + ' ' + (h.n || '');
      for (var i = 0; i < parts.length; i++) if (t.indexOf(parts[i]) < 0) return false;
      return true;
    });
  }

  function title() {
    if (state.view === 'detail') return U('t_det');
    if (state.view === 'bookmarks') return U('t_bm');
    if (state.view === 'book' && state.book) {
      var b = books.find(function (x) { return x.id === state.book; });
      return b ? bookName(b) : state.book;
    }
    if (state.view === 'topic' && state.topic) return topicName(state.topic);
    return U('t_home');
  }

  /* preview line under the Arabic text in lists: [text, dir] */
  function previewOf(h, L, rtl) {
    if (isKu(L)) return [h.en || '', 'ltr'];
    if (L === 'ar') return ['', 'ltr'];
    var lt = locText(h);
    if (lt) return [lt, L === 'en' ? 'ltr' : (rtl ? 'rtl' : 'ltr')];
    return [h.en || '', 'ltr'];
  }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var L = curLang(), rtl = !!RTL[L], ku = isKu(L);
    v.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    var head =
      '<div class="hd-head"><div><h2>📖 ' + esc(title()) + '</h2><div class="hd-sub">' + esc(U('sub')) + '</div></div>' +
      '<div style="display:flex;gap:6px">' +
      (state.view !== 'home' ? '<button type="button" class="hd-btn" data-act="back">' + esc(U('back')) + '</button>' : '') +
      '<button type="button" class="hd-btn" data-act="bm">★</button>' +
      '<button type="button" class="hd-btn" data-act="home">' + esc(U('secs')) + '</button></div></div>';

    var body = '<div class="hd-body">';

    if (state.loading) {
      body += '<div class="hd-loading">' + esc(U('ld')) + '</div></div>';
      v.innerHTML = head + body;
      return;
    }

    if (state.view === 'home') {
      body += '<div class="hd-search"><input id="hdQ" placeholder="' + esc(U('ph')) + '" value="' + esc(state.query) + '"><button type="button" data-act="searchGo">' + esc(U('go')) + '</button></div>';
      body += '<div style="font-size:13px;color:#8a6a24;margin-bottom:8px;font-weight:700">' + esc(U('topics')) + '</div><div class="hd-chips">';
      topics.forEach(function (t) {
        body += '<button type="button" class="hd-chip" data-topic="' + t.id + '">' + esc(topicName(t)) + '</button>';
      });
      body += '</div>';
      body += '<div style="font-size:13px;color:#8a6a24;margin:12px 0 8px;font-weight:700">' + esc(U('books')) + '</div>';
      books.forEach(function (b) {
        var tag = b.eng && U('pe') ? ' · ' + esc(U('pe')) : '';
        body += '<div class="hd-card" data-book="' + b.id + '"><b>' + esc(bookName(b)) + '</b><small>' + esc(b.name) + tag + ' · ' + esc(b.size === 's' ? U('sm') : U('lg')) + '</small></div>';
      });
      body += '<div class="hd-card" data-act="bm" style="border-style:dashed"><b>★ ' + esc(U('t_bm')) + '</b><small>' + bookmarks().length + ' ' + esc(U('cnt')) + '</small></div>';
    } else if (state.view === 'detail' && state.detail) {
      var d = state.detail, lt = locText(d);
      body += '<div class="hd-card" style="cursor:default">';
      body += '<div class="hd-label">' + esc(U('lar')) + '</div><div class="hd-ar">' + esc(d.ar) + '</div>';
      var needTr = false;
      if (ku) {
        if (d.en) body += '<div class="hd-en"><div class="hd-label">English</div>' + esc(d.en) + '</div>';
        if (d.ku) body += '<div class="hd-loc"><div class="hd-label">' + esc(U('ln')) + '</div>' + esc(d.ku) + '</div>';
        else if (state.translating) body += '<div class="hd-loc"><div class="hd-label">' + esc(U('ln')) + '</div>' + esc(U('tg')) + '</div>';
        needTr = !d.ku;
      } else if (L !== 'ar') {
        if (lt) {
          body += '<div class="hd-loc" dir="' + (L === 'en' ? 'ltr' : (rtl ? 'rtl' : 'ltr')) + '"><div class="hd-label">' + esc(U('ln')) + '</div>' + esc(lt) + '</div>';
        } else {
          if (d.en) body += '<div class="hd-en"><div class="hd-label">English</div>' + esc(d.en) + '</div>';
          if (state.translating) body += '<div class="hd-loc"><div class="hd-label">' + esc(U('ln')) + '</div>' + esc(U('tg')) + '</div>';
          else if (U('fb')) body += '<div class="hd-fb">' + esc(U('fb')) + '</div>';
          needTr = true;
        }
      }
      body += '<div class="hd-meta"><span>' + esc(d.label) + ' · ' + esc(U('no')) + ' ' + esc(String(d.n)) + '</span>';
      if (d.grade) body += '<span>' + esc(d.grade) + '</span>';
      body += '</div>';
      body += '<div class="hd-actions">';
      if (needTr && !state.translating && U('btr')) body += '<button type="button" class="primary" data-act="translateKu">' + esc(U('btr')) + '</button>';
      body += '<button type="button" data-act="toggleBm">' + esc(isBm(d.id) ? U('unbm') : U('bm1')) + '</button>';
      body += '<button type="button" data-act="share">' + esc(U('sh')) + '</button>';
      body += '</div></div>';
      if (U('wr') && ((ku && d.ku) || (!ku && L !== 'ar' && d.locAI))) body += '<div class="hd-empty" style="font-size:12px">' + esc(U('wr')) + '</div>';
    } else if (state.view === 'bookmarks') {
      var bm = bookmarks();
      var ac = (ku || L === 'ar') ? {} : trCache(L);
      if (!bm.length) body += '<div class="hd-empty">' + esc(U('nobm')) + '</div>';
      bm.forEach(function (h) {
        var pv = '';
        if (ku) pv = h.ku || '';
        else if (L === 'ar') pv = '';
        else pv = (h.ll === L && h.loc) || ac[h.id] || h.en || '';
        body += '<div class="hd-card" data-detail-id="' + esc(h.id) + '"><div class="hd-ar" style="font-size:16px">' + esc(h.ar) + (h.ar && h.ar.length >= 200 ? '…' : '') + '</div>';
        if (pv) body += '<div class="hd-loc" style="font-size:13px;margin-top:6px">' + esc(pv.slice(0, 120)) + (pv.length > 120 ? '…' : '') + '</div>';
        body += '<div class="hd-meta"><span>' + esc(h.label || h.book) + ' · ' + esc(String(h.n)) + '</span></div></div>';
      });
    } else {
      body += '<div class="hd-search"><input id="hdQ" placeholder="' + esc(U('ph')) + '" value="' + esc(state.query) + '"><button type="button" data-act="searchGo">' + esc(U('go')) + '</button></div>';
      var list = state.list || [];
      if (state.query) list = filterSearch(list, state.query);
      body += '<div style="font-size:12px;color:#8a6a24;margin-bottom:8px">' + list.length + ' ' + esc(U('cnt')) + '</div>';
      if (!list.length) body += '<div class="hd-empty">' + esc(U('nores')) + '</div>';
      var max = Math.min(list.length, 80);
      for (var i = 0; i < max; i++) {
        var h = list[i];
        var preview = h.ar.length > 140 ? h.ar.slice(0, 140) + '…' : h.ar;
        var pr = previewOf(h, L, rtl);
        body += '<div class="hd-card" data-idx="' + i + '"><div class="hd-ar" style="font-size:16px">' + esc(preview) + '</div>';
        if (pr[0]) body += '<div class="hd-en" dir="' + pr[1] + '" style="font-size:12px;border:0;padding-top:4px;margin-top:4px;text-align:start;direction:' + pr[1] + '">' + esc(pr[0].length > 100 ? pr[0].slice(0, 100) + '…' : pr[0]) + '</div>';
        body += '<div class="hd-meta"><span>' + esc(U('no')) + ' ' + esc(String(h.n)) + (h.grade ? ' · ' + esc(h.grade) : '') + '</span>' + (isBm(h.id) ? '<span>★</span>' : '') + '</div></div>';
      }
      if (list.length > max) body += '<div class="hd-empty">' + esc(fmt(U('only'), { n: max })) + '</div>';
    }

    body += '</div>';
    v.innerHTML = head + body;
  }

  function openBook(id) {
    state.book = id; state.topic = null; state.query = ''; state.view = 'book';
    loadBook(id).then(function (list) { state.list = list; render(); });
  }

  function openTopic(tid) {
    var topic = topics.find(function (t) { return t.id === tid; });
    if (!topic) return;
    state.topic = topic; state.query = ''; state.view = 'topic'; state.book = null;
    var prefer = ['nawawi', 'qudsi', 'bukhari'];
    state.loading = true; render();
    var acc = []; var i = 0;
    function next() {
      if (i >= prefer.length) {
        state.list = filterTopic(acc, topic); state.loading = false; render(); return;
      }
      var id = prefer[i++];
      loadBook(id).then(function (list) {
        acc = acc.concat(list);
        var hits = filterTopic(acc, topic);
        if (hits.length >= 40 || i >= prefer.length) {
          state.list = hits; state.loading = false; render();
        } else next();
      });
    }
    next();
  }

  function onClick(e) {
    var el = e.target.closest('[data-act],[data-book],[data-topic],[data-idx],[data-detail-id]');
    if (!el || !$('hadithView') || !$('hadithView').contains(el)) return;

    var act = el.getAttribute('data-act');
    if (act === 'home') {
      var hv = $('hadithView');
      if (hv) hv.classList.remove('active');
      if (typeof showView === 'function') showView('startScreen', U('secs'));
      else if (typeof goSections === 'function') goSections();
      return;
    }
    if (act === 'back') {
      if (state.view === 'detail') {
        state.view = state.book ? 'book' : (state.topic ? 'topic' : 'home');
        state.detail = null; render(); return;
      }
      state.view = 'home'; state.book = null; state.topic = null; state.list = []; render(); return;
    }
    if (act === 'bm') { state.view = 'bookmarks'; render(); return; }
    if (act === 'searchGo') {
      var inp = $('hdQ');
      state.query = inp ? inp.value.trim() : '';
      if (state.view === 'home' && state.query) {
        var q0 = state.query;
        openBook('nawawi');
        setTimeout(function () { state.query = q0; render(); }, 200);
        return;
      }
      render(); return;
    }
    if (act === 'toggleBm' && state.detail) { toggleBm(state.detail); render(); return; }
    if (act === 'translateKu' && state.detail) {
      state.translating = true; render();
      translateItem(state.detail).then(function () {
        state.translating = false; render();
      }).catch(function (err) {
        state.translating = false;
        alert(U('et') + (err.message || err));
        render();
      });
      return;
    }
    if (act === 'share' && state.detail && navigator.share) {
      var t = state.detail.ar;
      var x = locText(state.detail) || state.detail.en;
      if (x) t += '\n\n' + x;
      t += '\n— ' + state.detail.label + ' ' + state.detail.n;
      navigator.share({ text: t }).catch(function () {});
      return;
    }

    var book = el.getAttribute('data-book');
    if (book) { openBook(book); return; }
    var topic = el.getAttribute('data-topic');
    if (topic) { openTopic(topic); return; }

    var idx = el.getAttribute('data-idx');
    if (idx != null) {
      var list = state.list || [];
      if (state.query) list = filterSearch(list, state.query);
      var item = list[parseInt(idx, 10)];
      if (item) { state.detail = item; state.view = 'detail'; render(); }
      return;
    }
    var did = el.getAttribute('data-detail-id');
    if (did) {
      var bmk = bookmarks().find(function (x) { return x.id === did; });
      if (bmk) {
        var Lc = curLang();
        var k2 = trCache('ckb')[bmk.id];
        if (k2) bmk.ku = k2;
        if (bmk.ll === Lc && bmk.loc) bmk.locAI = !!bmk.ai;
        else {
          bmk.loc = ''; bmk.locAI = false;
          var c2 = (isKu(Lc) || Lc === 'ar') ? {} : trCache(Lc);
          if (c2[bmk.id]) { bmk.loc = c2[bmk.id]; bmk.locAI = true; }
        }
        state.detail = bmk; state.view = 'detail'; render();
      }
    }
  }

  window.enterHadith = function () {
    injectCss();
    if (!ensureView()) return;
    state.view = 'home';
    if (typeof showView === 'function') showView('hadithView', U('t_home'));
    render();
    refreshCard();
  };

  /* ---------- card on the sections screen ---------- */
  function dedupeCards(box) {
    var all = box.querySelectorAll('.hadith-choice');
    for (var i = 1; i < all.length; i++) {
      try { all[i].parentNode.removeChild(all[i]); } catch (e) {}
    }
    return all.length > 0;
  }

  function refreshCard() {
    var b = document.querySelector('#startScreen [data-hadith-card]');
    if (!b) return;
    var bt = b.querySelector('.choice-copy b'), sm = b.querySelector('.choice-copy small');
    if (bt && bt.textContent !== U('t_home')) bt.textContent = U('t_home');
    if (sm && sm.textContent !== U('cardS')) sm.textContent = U('cardS');
  }

  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (dedupeCards(box)) { refreshCard(); return true; }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice hadith-choice';
    b.setAttribute('data-hadith-card', '1');
    b.innerHTML = '<span class="choice-icon">📖</span><span class="choice-copy"><b>' + esc(U('t_home')) + '</b><small>' + esc(U('cardS')) + '</small></span><span class="choice-arrow">›</span>';
    b.onclick = function () { window.enterHadith(); };
    var ai = box.querySelector('.ai-shari-choice');
    if (ai && ai.nextSibling) box.insertBefore(b, ai.nextSibling);
    else box.appendChild(b);
    dedupeCards(box);
    return true;
  }

  function start() {
    injectCss();
    if (!window.__hadithClickBound) {
      window.__hadithClickBound = true;
      document.addEventListener('click', onClick);
    }
    var n = 0;
    var iv = setInterval(function () { addCard(); if (++n > 20) clearInterval(iv); }, 300);
    if (!window.__hadithDedupeBound) {
      window.__hadithDedupeBound = true;
      document.addEventListener('click', function () {
        setTimeout(function () {
          var box = document.querySelector('#startScreen .section-choices');
          if (box) dedupeCards(box);
          refreshCard();
        }, 80);
        setTimeout(refreshCard, 600);
      }, true);
    }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
