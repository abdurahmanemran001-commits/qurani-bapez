/* sira-story-p-i18n.js v1 — makes the whole Seerah section follow the app language (window.appLang).
 * NOTE: the file name intentionally matches the `sira-story-p*.js` glob that .github/workflows/pages.yml already
 * copies into dist/, so no workflow change is needed. It is loaded from language-ui.js.
 *
 *  - UI text (titles, buttons, tabs, counters) is translated from a built-in table (instant, offline).
 *  - Long text (biography chapters, chapter titles, AI answers...) is translated through the existing Worker
 *    endpoint POST /translate {kind:'sira'} in small batches, and cached in localStorage.
 *  - Kurdish (Sorani) and Badini keep the original Sorani text (there is no Badini translator yet).
 * It never edits the other Seerah modules: it only rewrites text nodes inside their views. */
(function () {
  'use strict';
  if (window.__seerahI18nV1) return;
  window.__seerahI18nV1 = true;

  var SCOPE = '#seerahView,#siraStory,#siraLib,#siraAi,#startScreen .seerah-choice';
  var EXCL = '.sr-ar,.sl-ar,.sl-tr,.sa-m.u,.sa-src .ar,.sa-hi,[data-no-i18n]';
  var KU = { ckb: 1, bad: 1 };
  var WL = { ar: 1, en: 1, tr: 1, fa: 1, ur: 1, fr: 1, ru: 1, id: 1 };
  var IDX = { ar: 0, en: 1, tr: 2, fa: 3, ur: 4, fr: 5, ru: 6, id: 7 };
  var WESTERN = { en: 1, tr: 1, fr: 1, ru: 1, id: 1 };
  var KUL = /[ەێۆڕڵڤ]/;
  var PRE = /^[\s\u2190-\u27BF\u2B00-\u2BFF\u2300-\u23FF\u2022\u2039\u203A\u2026\u00B7\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F\u200D\-]+/;
  var POST = /[\s\u2026:.\u00B7\u2022\u2039\u203A]+$/;
  var SAL = /\s*\uFDFA$/;
  var SEP = ' \u00B7 ';

  function lang() { return window.appLang || 'ckb'; }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hash(s) { var h = 5381, i; for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + s.length.toString(36); }

  /* split " 🤖 text… " into decorations + core so table lookups ignore icons/ellipses */
  function norm(s) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(String(s)), core = m[2], pre = '', post = '', a, b, sal = false;
    a = PRE.exec(core); if (a) { pre = a[0]; core = core.slice(pre.length); }
    b = POST.exec(core); if (b) { post = b[0]; core = core.slice(0, core.length - post.length); }
    if (SAL.test(core)) { sal = true; core = core.replace(SAL, ''); }
    return { lead: m[1], pre: pre, core: core, sal: sal, post: post, trail: m[3] };
  }

  /* ---------- built-in UI table: key (Sorani) then [ar, en, tr, fa, ur, fr, ru, id] ---------- */
  var ROWS = [
    ['سیرەی پێغەمبەر', 'سيرة النبي', 'The Prophet’s Seerah', 'Peygamberimizin Hayatı', 'سیره پیامبر', 'سیرتِ نبوی', 'La Sira du Prophète', 'Жизнеописание Пророка', 'Sirah Nabi'],
    ['ژیاننامەی تەواوی پێغەمبەر', 'السيرة النبوية الكاملة', 'The Complete Biography of the Prophet', 'Peygamberimizin Tam Hayatı', 'زندگی‌نامه کامل پیامبر', 'پیغمبرِ اسلام کی مکمل سوانح', 'Biographie complète du Prophète', 'Полная биография Пророка', 'Biografi Lengkap Nabi'],
    ['ژیاننامەی پێغەمبەر', 'سيرة النبي', 'Prophet’s Biography', 'Peygamber’in Biyografisi', 'زندگی‌نامه پیامبر', 'نبی کی سوانح', 'Biographie du Prophète', 'Биография Пророка', 'Biografi Nabi'],
    ['نیشانەکراوەکان', 'المحفوظات', 'Bookmarks', 'Yer İmleri', 'نشان‌شده‌ها', 'بک مارکس', 'Favoris', 'Закладки', 'Penanda'],
    ['کتێبە کلاسیکییەکان', 'الكتب الكلاسيكية', 'Classic Books', 'Klasik Kitaplar', 'کتاب‌های کلاسیک', 'کلاسیکی کتب', 'Livres classiques', 'Классические книги', 'Kitab Klasik'],
    ['گەڕانەوە', 'رجوع', 'Back', 'Geri', 'بازگشت', 'واپس', 'Retour', 'Назад', 'Kembali'],
    ['بەشەکان', 'الأقسام', 'Sections', 'Bölümler', 'بخش‌ها', 'حصے', 'Sections', 'Разделы', 'Bagian'],
    ['گەڕان لە بەشەکان', 'ابحث في الأقسام', 'Search sections', 'Bölümlerde ara', 'جستجو در بخش‌ها', 'حصوں میں تلاش کریں', 'Rechercher dans les sections', 'Поиск по разделам', 'Cari bagian'],
    ['گەڕان', 'بحث', 'Search', 'Ara', 'جستجو', 'تلاش', 'Rechercher', 'Поиск', 'Cari'],
    ['هەموو', 'الكل', 'All', 'Tümü', 'همه', 'سب', 'Tout', 'Все', 'Semua'],
    ['هیچ بەشێک نەدۆزرایەوە', 'لم يتم العثور على أي قسم', 'No sections found', 'Bölüm bulunamadı', 'بخشی پیدا نشد', 'کوئی حصہ نہیں ملا', 'Aucune section trouvée', 'Разделы не найдены', 'Tidak ada bagian ditemukan'],
    ['هیچ نیشانەیەک نییە', 'لا توجد محفوظات', 'No bookmarks', 'Yer imi yok', 'نشانه‌ای وجود ندارد', 'کوئی بک مارک نہیں', 'Aucun favori', 'Закладок нет', 'Belum ada penanda'],
    ['کتێب نەدۆزرایەوە', 'لم يتم العثور على الكتاب', 'Book not found', 'Kitap bulunamadı', 'کتاب پیدا نشد', 'کتاب نہیں ملی', 'Livre introuvable', 'Книга не найдена', 'Buku tidak ditemukan'],
    ['کوردی', 'الكردية', 'English', 'Türkçe', 'فارسی', 'اردو', 'Français', 'Русский', 'Bahasa Indonesia'],
    ['نیشانەکردن', 'إضافة علامة', 'Bookmark', 'Yer imi ekle', 'نشان کردن', 'بک مارک کریں', 'Ajouter aux favoris', 'В закладки', 'Tandai'],
    ['لابردنی نیشانە', 'إزالة العلامة', 'Remove bookmark', 'Yer imini kaldır', 'حذف نشانه', 'بک مارک ہٹائیں', 'Retirer des favoris', 'Убрать закладку', 'Hapus penanda'],
    ['نیشانەکراو وەک داگیراو', 'معلَّم كمُحمَّل', 'Marked as downloaded', 'İndirildi olarak işaretlendi', 'به‌عنوان دانلودشده نشان شد', 'ڈاؤن لوڈ شدہ کے طور پر نشان زد', 'Marqué comme téléchargé', 'Отмечено как скачанное', 'Ditandai sudah diunduh'],
    ['هێشتا داونەگیراوە', 'لم يتم التحميل بعد', 'Not downloaded yet', 'Henüz indirilmedi', 'هنوز دانلود نشده', 'ابھی ڈاؤن لوڈ نہیں ہوئی', 'Pas encore téléchargé', 'Ещё не скачано', 'Belum diunduh'],
    ['نووسەر', 'المؤلف', 'Author', 'Yazar', 'نویسنده', 'مصنف', 'Auteur', 'Автор', 'Penulis'],
    ['قەبارە', 'الحجم', 'Size', 'Boyut', 'حجم', 'سائز', 'Taille', 'Размер', 'Ukuran'],
    ['وەسف', 'الوصف', 'Description', 'Açıklama', 'توضیح', 'تفصیل', 'Description', 'Описание', 'Deskripsi'],
    ['داگرتن (archive.org)', 'تحميل (archive.org)', 'Download (archive.org)', 'İndir (archive.org)', 'دانلود (archive.org)', 'ڈاؤن لوڈ (archive.org)', 'Télécharger (archive.org)', 'Скачать (archive.org)', 'Unduh (archive.org)'],
    ['وەشانی تر', 'نسخة أخرى', 'Other version', 'Diğer sürüm', 'نسخه دیگر', 'دوسرا ایڈیشن', 'Autre version', 'Другая версия', 'Versi lain'],
    ['سڕینەوەی نیشانە', 'حذف العلامة', 'Remove mark', 'İşareti sil', 'حذف نشانه', 'نشان مٹائیں', 'Supprimer la marque', 'Удалить отметку', 'Hapus tanda'],
    ['نیشانەی داگیراو', 'تحديد كمُحمَّل', 'Mark as downloaded', 'İndirildi olarak işaretle', 'نشان‌کردن به‌عنوان دانلودشده', 'ڈاؤن لوڈ شدہ نشان کریں', 'Marquer comme téléchargé', 'Отметить как скачанное', 'Tandai sudah diunduh'],
    ['کتێب', 'كتاب', 'Book', 'Kitap', 'کتاب', 'کتاب', 'Livre', 'Книга', 'Buku'],
    ['سیرە', 'السيرة', 'Seerah', 'Siyer', 'سیره', 'سیرت', 'Sira', 'Сира', 'Sirah'],
    ['بەردەوامبوون لە خوێندنەوە', 'متابعة القراءة', 'Continue reading', 'Okumaya devam et', 'ادامه مطالعه', 'پڑھنا جاری رکھیں', 'Continuer la lecture', 'Продолжить чтение', 'Lanjutkan membaca'],
    ['بەزوویی زیاد دەکرێت', 'قريبًا', 'Coming soon', 'Yakında eklenecek', 'به‌زودی افزوده می‌شود', 'جلد شامل کیا جائے گا', 'Bientôt disponible', 'Скоро появится', 'Segera hadir'],
    ['پێشوو', 'السابق', 'Previous', 'Önceki', 'قبلی', 'پچھلا', 'Précédent', 'Назад', 'Sebelumnya'],
    ['دواتر', 'التالي', 'Next', 'Sonraki', 'بعدی', 'اگلا', 'Suivant', 'Далее', 'Berikutnya'],
    ['بابەتی دواتر', 'الموضوع التالي', 'Next chapter', 'Sonraki bölüm', 'فصل بعدی', 'اگلا باب', 'Chapitre suivant', 'Следующая глава', 'Bab berikutnya'],
    ['گەڕانەوە بۆ بەشەکە', 'العودة إلى القسم', 'Back to the part', 'Bölüme dön', 'بازگشت به بخش', 'حصے پر واپس', 'Retour à la partie', 'Вернуться к части', 'Kembali ke bagian'],
    ['سیرەی ئیبن هیشام — تەواو', 'سيرة ابن هشام — كاملة', 'Ibn Hisham’s Sira — Complete', 'İbn Hişam Siyeri — Tam', 'سیره ابن هشام — کامل', 'سیرتِ ابن ہشام — مکمل', 'La Sira d’Ibn Hicham — complète', 'Сира Ибн Хишама — полная', 'Sirah Ibnu Hisyam — Lengkap'],
    ['سیرەی ئیبن هیشام', 'سيرة ابن هشام', 'Ibn Hisham’s Sira', 'İbn Hişam Siyeri', 'سیره ابن هشام', 'سیرتِ ابن ہشام', 'Sira d’Ibn Hicham', 'Сира Ибн Хишама', 'Sirah Ibnu Hisyam'],
    ['فەهرەست', 'الفهرس', 'Contents', 'İçindekiler', 'فهرست', 'فہرست', 'Sommaire', 'Оглавление', 'Daftar isi'],
    ['خوێندنەوە', 'القراءة', 'Read', 'Oku', 'مطالعه', 'پڑھیں', 'Lire', 'Чтение', 'Baca'],
    ['بارکردن', 'جارٍ التحميل', 'Loading', 'Yükleniyor', 'در حال بارگذاری', 'لوڈ ہو رہا ہے', 'Chargement', 'Загрузка', 'Memuat'],
    ['دەستپێکی کتێب', 'بداية الكتاب', 'Start of the book', 'Kitabın başı', 'آغاز کتاب', 'کتاب کا آغاز', 'Début du livre', 'Начало книги', 'Awal buku'],
    ['هیچ نەدۆزرایەوە', 'لم يتم العثور على شيء', 'Nothing found', 'Hiçbir şey bulunamadı', 'چیزی پیدا نشد', 'کچھ نہیں ملا', 'Aucun résultat', 'Ничего не найдено', 'Tidak ditemukan'],
    ['بگەڕێ', 'ابحث', 'Search', 'Ara', 'جستجو کن', 'تلاش کریں', 'Rechercher', 'Искать', 'Cari'],
    ['وەرگێڕان', 'ترجمة', 'Translate', 'Çevir', 'ترجمه', 'ترجمہ', 'Traduire', 'Перевести', 'Terjemahkan'],
    ['کۆپی', 'نسخ', 'Copy', 'Kopyala', 'کپی', 'کاپی', 'Copier', 'Копировать', 'Salin'],
    ['بڕۆ بۆ لاپەڕە', 'اذهب إلى الصفحة', 'Go to page', 'Sayfaya git', 'رفتن به صفحه', 'صفحے پر جائیں', 'Aller à la page', 'Перейти к странице', 'Buka halaman'],
    ['پرسیار لە سیرە', 'اسأل عن السيرة', 'Ask about the Seerah', 'Siyer hakkında sor', 'پرسش از سیره', 'سیرت سے سوال', 'Questions sur la Sira', 'Вопрос о Сире', 'Tanya tentang Sirah'],
    ['پاککردنەوە', 'مسح', 'Clear', 'Temizle', 'پاک کردن', 'صاف کریں', 'Effacer', 'Очистить', 'Hapus'],
    ['سەرچاوەکان', 'المصادر', 'Sources', 'Kaynaklar', 'منابع', 'ماخذ', 'Sources', 'Источники', 'Sumber'],
    ['پرسیارەکەت بنووسە', 'اكتب سؤالك', 'Type your question', 'Sorunuzu yazın', 'سؤال خود را بنویسید', 'اپنا سوال لکھیں', 'Écrivez votre question', 'Напишите вопрос', 'Tulis pertanyaan Anda'],
    ['ناردن', 'إرسال', 'Send', 'Gönder', 'ارسال', 'بھیجیں', 'Envoyer', 'Отправить', 'Kirim'],
    ['شیکردنەوەی پرسیار', 'تحليل السؤال', 'Analyzing the question', 'Soru analiz ediliyor', 'تحلیل پرسش', 'سوال کا تجزیہ', 'Analyse de la question', 'Анализ вопроса', 'Menganalisis pertanyaan'],
    ['گەڕان لە ژیاننامەکە و سەرچاوەکان', 'البحث في السيرة والمصادر', 'Searching the biography and sources', 'Biyografi ve kaynaklarda aranıyor', 'جستجو در زندگی‌نامه و منابع', 'سوانح اور ماخذ میں تلاش', 'Recherche dans la biographie et les sources', 'Поиск в биографии и источниках', 'Mencari di biografi dan sumber'],
    ['نووسینی وەڵام', 'كتابة الجواب', 'Writing the answer', 'Yanıt yazılıyor', 'نوشتن پاسخ', 'جواب لکھا جا رہا ہے', 'Rédaction de la réponse', 'Составление ответа', 'Menulis jawaban'],
    ['بەشەکان + کتێبخانە · داگرتن · ئۆفلاین', 'الأقسام + المكتبة · تحميل · دون إنترنت', 'Sections + library · download · offline', 'Bölümler + kütüphane · indirme · çevrimdışı', 'بخش‌ها + کتابخانه · دانلود · آفلاین', 'حصے + لائبریری · ڈاؤن لوڈ · آف لائن', 'Sections + bibliothèque · téléchargement · hors ligne', 'Разделы + библиотека · загрузка · офлайн', 'Bagian + perpustakaan · unduh · luring'],
    ['وەرگێڕان بە AI', 'جارٍ الترجمة بالذكاء الاصطناعي', 'Translating with AI', 'Yapay zekâ ile çevriliyor', 'در حال ترجمه با هوش مصنوعی', 'اے آئی سے ترجمہ ہو رہا ہے', 'Traduction par IA en cours', 'Перевод с помощью ИИ', 'Menerjemahkan dengan AI'],
    ['سنووری وەرگێڕانی ئەمڕۆ تەواو بوو. کوردییەکە نیشان دەدرێت', 'اكتمل حد الترجمة اليوم. يُعرض النص الكردي', 'Daily translation limit reached. Showing the Kurdish text', 'Günlük çeviri sınırına ulaşıldı. Kürtçe metin gösteriliyor', 'سقف ترجمه امروز تمام شد. متن کردی نمایش داده می‌شود', 'آج کی ترجمہ کی حد ختم ہو گئی۔ کردی متن دکھایا جا رہا ہے', 'Limite de traduction atteinte. Texte kurde affiché', 'Дневной лимит перевода исчерпан. Показан курдский текст', 'Batas terjemahan harian tercapai. Menampilkan teks Kurdi'],
    ['خزمەتگوزاریی وەرگێڕان ئامادە نییە', 'خدمة الترجمة غير متاحة', 'Translation service is not available', 'Çeviri hizmeti kullanılamıyor', 'سرویس ترجمه در دسترس نیست', 'ترجمے کی سروس دستیاب نہیں', 'Le service de traduction n’est pas disponible', 'Сервис перевода недоступен', 'Layanan terjemahan tidak tersedia']
  ];
  /* fragments for strings that carry numbers: "12 بەش · 3400 وشە" */
  var FROWS = [
    ['کوردی و عەرەبی', 'عربي', 'English + Arabic', 'Türkçe + Arapça', 'فارسی + عربی', 'اردو + عربی', 'Français + arabe', 'Русский + арабский', 'Indonesia + Arab'],
    ['دەقی تەواوی عەرەبی', 'النص العربي الكامل', 'full Arabic text', 'tam Arapça metin', 'متن کامل عربی', 'مکمل عربی متن', 'texte arabe intégral', 'полный арабский текст', 'teks Arab lengkap'],
    ['داگرتنی ئۆفلاین', 'تحميل دون إنترنت', 'offline download', 'çevrimdışı indirme', 'دانلود آفلاین', 'آف لائن ڈاؤن لوڈ', 'téléchargement hors ligne', 'офлайн-загрузка', 'unduhan luring'],
    ['نیشانەکراو وەک داگیراو', 'معلَّم كمُحمَّل', 'marked as downloaded', 'indirildi olarak işaretli', 'دانلودشده نشان شد', 'ڈاؤن لوڈ شدہ نشان زد', 'marqué téléchargé', 'отмечено скачанным', 'ditandai diunduh'],
    ['بە درێژی', 'بالتفصيل', 'in full', 'ayrıntılı', 'کامل', 'تفصیل سے', 'en détail', 'подробно', 'lengkap'],
    ['ژیاننامە', 'السيرة', 'Biography', 'Biyografi', 'زندگی‌نامه', 'سوانح', 'Biographie', 'Биография', 'Biografi'],
    ['لاپەڕەی', 'صفحة', 'Page', 'Sayfa', 'صفحه', 'صفحہ', 'Page', 'Страница', 'Halaman'],
    ['لاپەڕە', 'صفحة', 'Page', 'Sayfa', 'صفحه', 'صفحہ', 'Page', 'Страница', 'Halaman'],
    ['نزیکەی', 'نحو', 'about', 'yaklaşık', 'حدود', 'تقریباً', 'environ', 'около', 'sekitar'],
    ['بەرگی', 'المجلد', 'volume', 'cilt', 'جلد', 'جلد', 'volume', 'том', 'jilid'],
    ['وەرگێڕان', 'ترجمة', 'translation', 'çeviri', 'ترجمه', 'ترجمہ', 'traduction', 'перевод', 'terjemahan'],
    ['مێگابایت', 'ميغابايت', 'MB', 'MB', 'مگابایت', 'میگابائٹ', 'Mo', 'МБ', 'MB'],
    ['بابەت', 'موضوع', 'chapters', 'bölüm', 'فصل', 'ابواب', 'chapitres', 'глав', 'bab'],
    ['ئەنجام', 'نتيجة', 'results', 'sonuç', 'نتیجه', 'نتائج', 'résultats', 'результатов', 'hasil'],
    ['کتێب', 'كتاب', 'books', 'kitap', 'کتاب', 'کتابیں', 'livres', 'книг', 'buku'],
    ['وشە', 'كلمة', 'words', 'kelime', 'کلمه', 'الفاظ', 'mots', 'слов', 'kata'],
    ['بەش', 'أقسام', 'parts', 'bölüm', 'بخش', 'حصے', 'parties', 'частей', 'bagian'],
    ['لە', 'من', 'of', '/', 'از', 'از', 'sur', 'из', 'dari']
  ];
  var S = {}, FR = [];
  ROWS.forEach(function (r) { S[norm(r[0]).core] = r.slice(1); });
  FROWS.forEach(function (r) {
    FR.push({ k: r[0], a: r.slice(1), re: new RegExp('(^|[^\\u0600-\\u06FF])' + reEsc(r[0]) + '(?=$|[^\\u0600-\\u06FF])', 'g') });
  });
  FR.sort(function (a, b) { return b.k.length - a.k.length; });

  function frag(str, L) {
    var i = IDX[L], out = str, toks = [], k;
    if (i === undefined) return null;
    function sub(f) {
      out = out.replace(f.re, function (all, pre) { toks.push(f.a[i]); return pre + '\u0001' + (toks.length - 1) + '\u0002'; });
    }
    for (k = 0; k < FR.length; k++) { if (out.indexOf(FR[k].k) >= 0) sub(FR[k]); }
    if (!toks.length) return null;
    if (KUL.test(out.replace(/\u0001\d+\u0002/g, ''))) return null;
    out = out.replace(/\u0001(\d+)\u0002/g, function (a, j) { return toks[+j]; });
    if (WESTERN[L]) out = out.replace(/[\u0660-\u0669]/g, function (c) { return String(c.charCodeAt(0) - 0x660); });
    return out;
  }

  /* ---------- AI translation cache + queue ---------- */
  var CK = 'seerah_i18n_v1', mem = {}, pt = null, Q = [], inq = {}, retry = [], active = 0, blocked = 0, timer = null, rt = null;
  try { mem = JSON.parse(localStorage.getItem(CK) || '{}') || {}; } catch (e) { mem = {}; }

  function persist() {
    clearTimeout(pt);
    pt = setTimeout(function () {
      try {
        var ks = Object.keys(mem), tot = 0, i, j = 0;
        for (i = 0; i < ks.length; i++) tot += ks[i].length + mem[ks[i]].length;
        while (tot > 2600000 && j < ks.length) { tot -= ks[j].length + mem[ks[j]].length; delete mem[ks[j]]; j++; }
        localStorage.setItem(CK, JSON.stringify(mem));
      } catch (e) {
        try { var k2 = Object.keys(mem); k2.slice(0, Math.ceil(k2.length / 2)).forEach(function (x) { delete mem[x]; }); localStorage.setItem(CK, JSON.stringify(mem)); } catch (e2) {}
      }
    }, 700);
  }
  function put(k, v) { mem[k] = v; persist(); }
  function ep() {
    var e = '';
    try { e = window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || ''; } catch (x) {}
    e = String(e).trim().replace(/\/+$/, '');
    return /^https:\/\//.test(e) ? e : '';
  }

  /* split text into translatable chunks (<= 2800 chars, the Worker accepts 3500) and literal whitespace */
  function seg(t) {
    var toks = [], pieces = String(t).match(/[^\n]+|\n+/g) || [];
    pieces.forEach(function (p) {
      if (p.charAt(0) === '\n') { toks.push({ w: p }); return; }
      var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(p), core = m[2], chunks = [];
      if (m[1]) toks.push({ w: m[1] });
      if (core.length <= 2800) chunks.push(core);
      else {
        var ss = core.match(/[^.!?\u061F\u06D4]*[.!?\u061F\u06D4]*\s*/g) || [core], cur = '';
        ss.forEach(function (s) {
          if (!s) return;
          while (s.length > 2800) { if (cur) { chunks.push(cur); cur = ''; } chunks.push(s.slice(0, 2800)); s = s.slice(2800); }
          if (cur && cur.length + s.length > 2800) { chunks.push(cur); cur = ''; }
          cur += s;
        });
        if (cur) chunks.push(cur);
      }
      chunks.forEach(function (c) {
        var mm = /^([\s\S]*?)(\s*)$/.exec(c);
        if (mm[1]) {
          if (/[^\s\d\u0660-\u0669.,;:!?()\[\]\-\u2013\u2014\u00B7\u2022*"'\u00AB\u00BB]/.test(mm[1])) toks.push({ c: mm[1] });
          else toks.push({ w: mm[1] });
        }
        if (mm[2]) toks.push({ w: mm[2] });
      });
      if (m[3]) toks.push({ w: m[3] });
    });
    return toks;
  }
  function joinSeg(toks, L) {
    var o = '', i, v;
    for (i = 0; i < toks.length; i++) {
      if (toks[i].w !== undefined) o += toks[i].w;
      else { v = mem[L + '|' + hash(toks[i].c)]; if (v === undefined) return null; o += v; }
    }
    return o;
  }
  function enqueue(L, c) {
    var k = L + '|' + hash(c);
    if (!WL[L] || mem[k] !== undefined || inq[k]) return;
    inq[k] = 1; Q.push({ k: k, L: L, t: c });
    clearTimeout(timer); timer = setTimeout(run, 150);
  }
  function aiText(text, L) {
    var toks = seg(text), out = joinSeg(toks, L), i;
    if (out !== null) return out;
    for (i = 0; i < toks.length; i++) if (toks[i].c !== undefined) enqueue(L, toks[i].c);
    return null;
  }
  function parseOut(txt, n) {
    var res = {}, re = /\[(\d{1,3})\]\s*/g, m, marks = [];
    while ((m = re.exec(txt))) marks.push({ i: +m[1], s: m.index, e: re.lastIndex });
    if (!marks.length) { if (n === 1 && txt.trim()) res[1] = txt.trim(); return res; }
    marks.forEach(function (mk, j) {
      var end = j + 1 < marks.length ? marks[j + 1].s : txt.length, v = txt.slice(mk.e, end).trim();
      if (v && mk.i >= 1 && mk.i <= n && res[mk.i] === undefined) res[mk.i] = v;
    });
    return res;
  }
  function run() {
    var L = lang(), batch, size, it;
    Q = Q.filter(function (x) { if (x.L === L) return true; delete inq[x.k]; return false; });
    if (!Q.length || !ep() || Date.now() < blocked) { badge(); return; }
    while (active < 2 && Q.length) {
      batch = []; size = 0;
      if (Q[0].tries) batch.push(Q.shift());
      else {
        while (Q.length && batch.length < 20 && !Q[0].tries && (!batch.length || size + Q[0].t.length < 3000)) {
          it = Q.shift(); batch.push(it); size += it.t.length + 8;
        }
      }
      send(L, batch);
    }
    badge();
  }
  function send(L, batch) {
    var payload = batch.map(function (it, i) { return '[' + (i + 1) + '] ' + it.t; }).join('\n');
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var tm = setTimeout(function () { if (ctl) ctl.abort(); }, 70000);
    function fail(it) { if (!it.tries) { it.tries = 1; retry.push(it); } else delete inq[it.k]; }
    active++;
    fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: payload, lang: L, kind: 'sira' }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { s: r.status, d: d || {} }; }); })
      .then(function (x) {
        clearTimeout(tm);
        if (x.s === 429) { blocked = Date.now() + 30 * 60000; batch.forEach(function (it) { delete inq[it.k]; }); return; }
        var txt = x.d.text || x.d.ku, out = (x.s >= 200 && x.s < 300 && txt) ? parseOut(String(txt), batch.length) : {};
        batch.forEach(function (it, i) { var v = out[i + 1]; if (v) { put(it.k, v); delete inq[it.k]; } else fail(it); });
      })
      .catch(function () { clearTimeout(tm); batch.forEach(fail); })
      .then(function () {
        active--;
        if (retry.length) { var r2 = retry.splice(0); setTimeout(function () { r2.forEach(function (it) { Q.push(it); }); run(); }, 3000); }
        rescanSoon(); run(); badge();
      });
  }

  /* ---------- translate one string ---------- */
  function part(p, L, ai) {
    var pn = norm(p), c = pn.core, v, f, t, hasD, sal = pn.sal ? ' \uFDFA' : '';
    if (!c) return p;
    if (pn.pre.indexOf('\u2026') >= 0 && c === 'وەرگێڕان') c = 'وەرگێڕان بە AI';
    v = S[c];
    if (v) return pn.lead + pn.pre + v[IDX[L]] + sal + pn.post + pn.trail;
    hasD = /[0-9\u0660-\u0669]/.test(c);
    f = frag(c, L); if (f !== null) return pn.lead + pn.pre + f + sal + pn.post + pn.trail;
    if (!KUL.test(c)) return p;
    if (hasD && c.length < 60) return null;
    if (!ai) return null;
    t = aiText(c + sal, L);
    return t === null ? null : pn.lead + pn.pre + t + pn.post + pn.trail;
  }
  function xlate(orig, L, ai) {
    var n = norm(orig), core = n.core, v, ps, out = [], i, r, sal = n.sal ? ' \uFDFA' : '';
    if (!core || IDX[L] === undefined) return null;
    if (n.pre.indexOf('\u2026') >= 0 && core === 'وەرگێڕان') core = 'وەرگێڕان بە AI';
    v = S[core];
    if (v) return n.lead + n.pre + v[IDX[L]] + sal + n.post + n.trail;
    if (core.indexOf(SEP) >= 0) {
      ps = core.split(SEP);
      for (i = 0; i < ps.length; i++) { r = part(ps[i], L, ai); if (r === null) return null; out.push(r); }
      return n.lead + n.pre + out.join(SEP) + sal + n.post + n.trail;
    }
    r = part(core, L, ai);
    return r === null ? null : n.lead + n.pre + r + sal + n.post + n.trail;
  }
  function tt(k) {
    var L = lang(), n, v;
    if (KU[L] || IDX[L] === undefined) return k;
    n = norm(k); v = S[n.core];
    return v ? v[IDX[L]] : k;
  }

  /* ---------- DOM ---------- */
  var orig = new WeakMap(), aorig = new WeakMap(), libFor = null;
  function inScope(el) { return !!(el && el.closest && el.closest(SCOPE) && !el.closest(EXCL)); }

  function procText(n) {
    var p = n.parentElement, st, v = n.nodeValue, L, want;
    if (!p || /^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|SELECT)$/i.test(p.tagName) || !inScope(p)) return;
    st = orig.get(n);
    if (!st) { st = { o: v, out: null }; orig.set(n, st); }
    else if (st.out !== null && v !== st.out) st.o = v;
    L = lang();
    if (KU[L]) want = st.o;
    else { want = xlate(st.o, L, true); if (want == null) want = st.o; }
    if (v !== want) n.nodeValue = want;
    st.out = want;
  }
  function procAttr(el, name) {
    var st, s, cur, L, want;
    if (!el.getAttribute || !inScope(el)) return;
    cur = el.getAttribute(name); if (cur == null) return;
    st = aorig.get(el); if (!st) { st = {}; aorig.set(el, st); }
    s = st[name];
    if (!s) { s = st[name] = { o: cur, out: null }; }
    else if (s.out !== null && cur !== s.out) s.o = cur;
    L = lang();
    if (KU[L]) want = s.o;
    else { want = xlate(s.o, L, true); if (want == null) want = s.o; }
    if (cur !== want) el.setAttribute(name, want);
    s.out = want;
  }
  function procUnit(el) {
    var L = lang(), t;
    if (!el.closest || !el.closest('#siraAi')) return;
    if (el._o === undefined) { el._o = el.innerHTML; el._txt = el.textContent; }
    if (KU[L]) { if (el._done) { el.innerHTML = el._o; el._done = false; } return; }
    t = xlate(el._txt, L, true);
    if (t != null) { if (!el._done || el.textContent !== t) { el.textContent = t; el._done = true; } }
    else if (el._done) { el.innerHTML = el._o; el._done = false; }
  }
  function walk(root) {
    var w, n, list = [], i, q;
    if (root.nodeType === 3) { procText(root); return; }
    w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    while ((n = w.nextNode())) list.push(n);
    for (i = 0; i < list.length; i++) procText(list[i]);
    q = root.querySelectorAll ? root.querySelectorAll('[placeholder],[title]') : [];
    for (i = 0; i < q.length; i++) { procAttr(q[i], 'placeholder'); procAttr(q[i], 'title'); }
    if (root.matches && root.matches('[placeholder],[title]')) { procAttr(root, 'placeholder'); procAttr(root, 'title'); }
    q = root.querySelectorAll ? root.querySelectorAll('.sa-hi') : [];
    for (i = 0; i < q.length; i++) procUnit(q[i]);
    if (root.matches && root.matches('.sa-hi')) procUnit(root);
  }
  function walkIn(el) {
    var q, i;
    if (el.closest && el.closest(SCOPE)) { walk(el); return; }
    q = el.querySelectorAll ? el.querySelectorAll(SCOPE) : [];
    for (i = 0; i < q.length; i++) walk(q[i]);
  }
  function syncLib(L) {
    var sel = document.querySelector('#siraLib select[data-a="lang"]'), map = { ckb: 'ku', bad: 'ku' }, want;
    if (!sel || libFor === L) return;
    libFor = L; want = map[L] || L;
    if (sel.value !== want) { sel.value = want; if (sel.value === want) sel.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function tweaks() {
    var L = lang(), ks = document.querySelectorAll('#seerahView .sr-ku'), i;
    for (i = 0; i < ks.length; i++) if (ks[i].parentElement) ks[i].parentElement.style.display = (L === 'ar') ? 'none' : '';
    syncLib(L);
  }
  function badge() {
    var b = document.getElementById('srI18nBadge'), L = lang(), pending = Object.keys(inq).length, limit = Date.now() < blocked, msg;
    var open = document.querySelector('#seerahView.active,#siraStory.active,#siraLib.active,#siraAi.active');
    if (KU[L] || !open || (!pending && !limit)) { if (b) b.style.display = 'none'; return; }
    if (!b) {
      b = document.createElement('div'); b.id = 'srI18nBadge'; b.setAttribute('data-no-i18n', '1');
      b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom));z-index:9999;background:#173f35;color:#fff;border-radius:18px;padding:8px 14px;font-size:12px;box-shadow:0 4px 14px #0004;max-width:90%;text-align:center;pointer-events:none';
      document.body.appendChild(b);
    }
    msg = pending ? tt('وەرگێڕان بە AI') + '… (' + pending + ')' : tt('سنووری وەرگێڕانی ئەمڕۆ تەواو بوو. کوردییەکە نیشان دەدرێت');
    b.textContent = msg; b.style.display = 'block';
  }
  function rescan() {
    var q = document.querySelectorAll(SCOPE), i;
    for (i = 0; i < q.length; i++) walk(q[i]);
    tweaks(); badge();
  }
  function rescanSoon() { clearTimeout(rt); rt = setTimeout(rescan, 80); }

  function onMut(recs) {
    var roots = [], i, r, j, n;
    for (i = 0; i < recs.length; i++) {
      r = recs[i];
      if (r.type === 'characterData') { if (r.target.nodeType === 3) procText(r.target); }
      else if (r.type === 'attributes') procAttr(r.target, r.attributeName);
      else for (j = 0; j < r.addedNodes.length; j++) { n = r.addedNodes[j]; if (n.nodeType === 3) procText(n); else if (n.nodeType === 1) roots.push(n); }
    }
    for (i = 0; i < roots.length; i++) walkIn(roots[i]);
    tweaks(); badge();
  }

  function css() {
    var s = document.createElement('style');
    s.id = 'seerahI18nCss';
    s.textContent = [
      'html[dir=ltr] #seerahView .sr-card,html[dir=ltr] #seerahView .sr-ku,html[dir=ltr] #seerahView .sr-note,html[dir=ltr] #seerahView .sr-empty{direction:ltr;text-align:left}',
      'html[dir=ltr] #siraAi{direction:ltr}html[dir=ltr] #siraAi .sa-m,html[dir=ltr] #siraAi .sa-hi{text-align:left}',
      'html[dir=ltr] #siraStory .ss-item,html[dir=ltr] #siraStory .ss-text,html[dir=ltr] #siraLib .sl-item{text-align:left}',
      'html[dir=ltr] #siraLib .sl-tr{direction:ltr;text-align:left}'
    ].join('');
    document.head.appendChild(s);
  }
  function start() {
    css();
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(onMut).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title'] });
    }
    rescan();
  }

  var _alert = window.alert;
  window.alert = function (m) {
    try { var L = lang(); if (!KU[L] && typeof m === 'string') { var f = xlate(m, L, false); if (f != null) m = f; } } catch (e) {}
    return _alert.call(window, m);
  };
  window.addEventListener('app-language-changed', function () { libFor = null; rescan(); setTimeout(rescan, 250); });
  window.__seerahI18n = {
    xlate: xlate, tt: tt, seg: seg, parseOut: parseOut, joinSeg: joinSeg, rescan: rescan,
    cache: function () { return mem; },
    clear: function () { mem = {}; try { localStorage.removeItem(CK); } catch (e) {} }
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
