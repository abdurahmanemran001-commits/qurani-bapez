/* sira-library.js v3 — full text of Ibn Hisham's al-Sira al-Nabawiyya (1598 pages) with table of contents,
 * Arabic search, page reader, and on-demand translation via the Worker.
 * Part 1 of this file is the shared module window.__siL used by sira-story.js and sira-ai.js too:
 * UI texts in every app language + an on-demand translation engine (chunked, cached) for the long Kurdish/Arabic texts. */
(function () {
  if (window.__siL) return;
  var UI = {};
  UI.ckb = {
    back: `‹ سیرە`, backs: `‹ گەڕانەوە`, tr: `وەرگێڕان`, tring: `… وەرگێڕان`, trfail: `وەرگێڕان سەرنەکەوت: `, nosvc: `خزمەتگوزاریی وەرگێڕان ئامادە نییە`, tmo: `کات تەواو بوو`,
    ainote: `وەرگێڕانەکە بە AI ە و لەوانەیە هەڵەی تێدا بێت؛ بۆ دڵنیابوون سەرچاوە ڕەسەنەکە بخوێنەوە.`, cp: `کۆپی`, retry: `دووبارە هەوڵ بدەرەوە`, tprog: `… وەرگێڕان ({i}/{n})`,
    sl_t: `📜 سیرەی ئیبن هیشام — تەواو`, sl_sub: `{n} لاپەڕە · دەقی تەواوی عەرەبی + وەرگێڕان`, sl_ld: `… بارکردن`, sl_toc: `فەهرەست`, sl_srch: `گەڕان`, sl_read: `خوێندنەوە`,
    sl_ldbook: `… بارکردنی کتێبەکە (یەکەم جار نزیکەی ٢ MB)`, sl_tocph: `گەڕان لە فەهرەست (عەرەبی یان کوردی)...`, sl_cont: `↩ بەردەوامبوون لە خوێندنەوە`, sl_page: `لاپەڕەی {n}`,
    sl_start: `دەستپێکی کتێب`, sl_none: `هیچ نەدۆزرایەوە.`, sl_sph: `وشە یان ناو بنووسە بە عەرەبی (مثلاً: بيعة العقبة)`, sl_do: `بگەڕێ`, sl_res: `{n} ئەنجام`,
    sl_sinfo: `گەڕان لەناو هەموو {n} لاپەڕەی کتێبەکە دەکرێت. بۆ گەڕانی کوردی/English لە «گەڕانی زیرەکی حەدیس» یان ئەی ئای شەرعی بەکاربهێنە.`,
    sl_pg: `لاپەڕە {i} / {n} · بەرگی {v}`, sl_prev: `‹ پێشوو`, sl_next: `دواتر ›`, sl_goto: `بڕۆ بۆ لاپەڕە…`, sl_gotop: `ژمارەی لاپەڕە (١ تا {n})`,
    sl_fail: `بارنەبوو. ئینتەرنێتەکەت بپشکنە و دووبارە بکەرەوە.`, sl_tt: `سیرەی ئیبن هیشام`,
    ss_t: `ژیاننامەی تەواوی پێغەمبەر ﷺ`, ss_sub: `{c} بابەت · نزیکەی {w} وشە · {p} لە {n} بەش`, ss_cont: `↩ بەردەوامبوون لە خوێندنەوە`, ss_info: `{c} بابەت · {w} وشە`, ss_soon: `بەزوویی زیاد دەکرێت`,
    ss_note: `ئەم ژیاننامەیە لە سەرچاوە کلاسیکییەکانی سیرە (سیرەی ئیبن هیشام، ئیبن ئیسحاق، ئیبن سەعد، بوخاری و موسلیم...) کۆکراوەتەوە و بە کوردی نووسراوە. بۆ دەقی عەرەبیی تەواو، «سیرەی تەواو (ئیبن هیشام)» ببینە.`,
    ss_nextch: `بابەتی دواتر ›`, ss_topart: `گەڕانەوە بۆ بەشەکە`, ss_words: `{w} وشە`, ss_tt: `ژیاننامەی پێغەمبەر`,
    ai_t: `🤖 پرسیار لە سیرە`, ai_clear: `پاککردنەوە`,
    ai_hi: `لێرە هەر پرسیارێک دەربارەی <b>سیرە و ژیاننامەی پێغەمبەر ﷺ</b> بپرسە: لەدایکبوون، وەحی، کۆچ، غەزاکان، خێزان، هاوەڵان و ئەخلاقی. وەڵامەکان لە ژیاننامەی ئەپەکە، قورئان، فەرمودە و مێژوو دەهێنرێن، و سەرچاوە و ئاستی متمانەیان نیشان دەدرێت. پرسی شەرعی لێرە نییە.`,
    ai_src: `سەرچاوەکان`, ai_ph: `پرسیارەکەت بنووسە…`, ai_send: `ناردن`,
    ai_net: `سێرڤەری AI وەڵامی نەدا (کات تەواو بوو یان ئینتەرنێت). دووبارە هەوڵ بدەرەوە.`,
    ai_off: `ئەم بەشە تەنها لەسەر سیرە و ژیاننامەی پێغەمبەر ﷺ وەڵام دەداتەوە. پرسیارێک بنووسە دەربارەی ژیان، غەزاکان، خێزان، هاوەڵان یان ڕووداوەکانی سەردەمی پێغەمبەر ﷺ. بۆ پرسی شەرعی بەشی «ئەی ئای شەرعی» بەکاربهێنە.`,
    ai_notf: `لە سەرچاوەکانی ئەپەکەدا وەڵامێکی متمانەپێکراو بۆ ئەم پرسیارە نەدۆزرایەوە. پرسیارەکە جۆرێکی تر بنووسەوە، یان لە زانایەک بپرسە.`,
    ai_gen: `بەشێک لەم وەڵامە لە زانیاریی گشتیی سیرەیە و ڕاستەوخۆ لە دەقە دیاریکراوەکانی ئەپەکە نییە.`,
    ai_st1: `… شیکردنەوەی پرسیار`, ai_st2: `… گەڕان لە ژیاننامەکە و سەرچاوەکان`, ai_st3: `… نووسینی وەڵام`, ai_st4: `… وەرگێڕانی وەڵام`, ai_story: `ژیاننامە`, ai_tt: `پرسیار لە سیرە`,
    ai_c: [`بەدر چۆن ڕوویدا؟`, `خەدیجە کەی مرد؟`, `کۆچ بۆ مەدینە چۆن بوو؟`, `لە ئوحود چی ڕوویدا؟`, `پەیمانی حودەیبیە چی بوو؟`, `ئەخلاقی پێغەمبەر ﷺ چۆن بوو؟`]
  };
  UI.bad = UI.ckb;
  UI.en = {
    back: `‹ Seerah`, backs: `‹ Back`, tr: `Translate`, tring: `… Translating`, trfail: `Translation failed: `, nosvc: `Translation service is not available`, tmo: `Timed out`,
    ainote: `AI translation — it may contain mistakes. Check the original text to be sure.`, cp: `Copy`, retry: `Try again`, tprog: `… Translating ({i}/{n})`,
    sl_t: `📜 Sirah of Ibn Hisham — Full Text`, sl_sub: `{n} pages · full Arabic text + translation`, sl_ld: `… Loading`, sl_toc: `Contents`, sl_srch: `Search`, sl_read: `Read`,
    sl_ldbook: `… Loading the book (about 2 MB the first time)`, sl_tocph: `Search the contents (Arabic or your language)...`, sl_cont: `↩ Continue reading`, sl_page: `Page {n}`,
    sl_start: `Start of the book`, sl_none: `Nothing found.`, sl_sph: `Type a word or name in Arabic (e.g. بيعة العقبة)`, sl_do: `Search`, sl_res: `{n} results`,
    sl_sinfo: `Searches all {n} pages of the book. For search in your own language use “Smart Hadith Search” or the Shari'i AI.`,
    sl_pg: `Page {i} / {n} · Volume {v}`, sl_prev: `‹ Previous`, sl_next: `Next ›`, sl_goto: `Go to page…`, sl_gotop: `Page number (1 to {n})`,
    sl_fail: `Could not load. Check your internet and try again.`, sl_tt: `Sirah of Ibn Hisham`,
    ss_t: `The Complete Life of the Prophet ﷺ`, ss_sub: `{c} topics · about {w} words · {p} of {n} parts`, ss_cont: `↩ Continue reading`, ss_info: `{c} topics · {w} words`, ss_soon: `Coming soon`,
    ss_note: `This biography is compiled from the classical sources of the Seerah (Ibn Hisham, Ibn Ishaq, Ibn Sa'd, Bukhari, Muslim...). It is written in Kurdish and translated into your language by AI as you read. For the full Arabic text see “Sirah of Ibn Hisham”.`,
    ss_nextch: `Next topic ›`, ss_topart: `Back to the part`, ss_words: `{w} words`, ss_tt: `Life of the Prophet`,
    ai_t: `🤖 Ask about the Seerah`, ai_clear: `Clear`,
    ai_hi: `Ask anything about <b>the Seerah and life of the Prophet ﷺ</b>: birth, revelation, the Hijra, the battles, family, companions and character. Answers come from the app's biography, the Quran, hadith and history, with the sources and their reliability shown. Fatwa questions are not answered here.`,
    ai_src: `Sources`, ai_ph: `Type your question…`, ai_send: `Send`,
    ai_net: `The AI server did not respond (timeout or no internet). Please try again.`,
    ai_off: `This section only answers questions about the Seerah and life of the Prophet ﷺ: his life, battles, family, companions and the events of his era. For religious rulings use the “Shari'i AI” section.`,
    ai_notf: `No reliable answer to this question was found in the app's sources. Rephrase the question or ask a scholar.`,
    ai_gen: `Part of this answer comes from general knowledge of the Seerah and not directly from the app's specific texts.`,
    ai_st1: `… Analysing the question`, ai_st2: `… Searching the biography and sources`, ai_st3: `… Writing the answer`, ai_st4: `… Translating the answer`, ai_story: `Biography`, ai_tt: `Ask about the Seerah`,
    ai_c: [`How did the Battle of Badr happen?`, `When did Khadija die?`, `How was the Hijra to Madinah?`, `What happened at Uhud?`, `What was the Treaty of Hudaybiyah?`, `What was the Prophet's ﷺ character like?`]
  };
  UI.ar = {
    back: `‹ السيرة`, backs: `‹ رجوع`, tr: `ترجمة`, tring: `… جارٍ الترجمة`, trfail: `فشلت الترجمة: `, nosvc: `خدمة الترجمة غير متاحة`, tmo: `انتهت المهلة`,
    ainote: `ترجمة بالذكاء الاصطناعي وقد تحتوي على أخطاء؛ راجع النص الأصلي للتأكد.`, cp: `نسخ`, retry: `حاول مرة أخرى`, tprog: `… جارٍ الترجمة ({i}/{n})`,
    sl_t: `📜 سيرة ابن هشام — النص الكامل`, sl_sub: `{n} صفحة · النص العربي الكامل + ترجمة`, sl_ld: `… جارٍ التحميل`, sl_toc: `الفهرس`, sl_srch: `بحث`, sl_read: `قراءة`,
    sl_ldbook: `… جارٍ تحميل الكتاب (حوالي 2 ميغابايت في المرة الأولى)`, sl_tocph: `ابحث في الفهرس...`, sl_cont: `↩ متابعة القراءة`, sl_page: `صفحة {n}`,
    sl_start: `بداية الكتاب`, sl_none: `لا توجد نتائج.`, sl_sph: `اكتب كلمة أو اسمًا بالعربية (مثلًا: بيعة العقبة)`, sl_do: `بحث`, sl_res: `{n} نتيجة`,
    sl_sinfo: `يبحث في جميع صفحات الكتاب ({n} صفحة).`,
    sl_pg: `صفحة {i} / {n} · المجلد {v}`, sl_prev: `السابق ›`, sl_next: `‹ التالي`, sl_goto: `اذهب إلى صفحة…`, sl_gotop: `رقم الصفحة (من 1 إلى {n})`,
    sl_fail: `تعذّر التحميل. تحقق من الإنترنت وحاول مرة أخرى.`, sl_tt: `سيرة ابن هشام`,
    ss_t: `السيرة النبوية المفصلة ﷺ`, ss_sub: `{c} موضوعًا · نحو {w} كلمة · {p} من {n} أقسام`, ss_cont: `↩ متابعة القراءة`, ss_info: `{c} موضوعًا · {w} كلمة`, ss_soon: `قريبًا`,
    ss_note: `جُمعت هذه السيرة من المصادر الكلاسيكية (سيرة ابن هشام، ابن إسحاق، ابن سعد، البخاري، مسلم...). كُتبت بالكردية وتُترجم إلى العربية بالذكاء الاصطناعي أثناء القراءة. للنص العربي الكامل راجع «سيرة ابن هشام».`,
    ss_nextch: `الموضوع التالي ‹`, ss_topart: `العودة إلى القسم`, ss_words: `{w} كلمة`, ss_tt: `السيرة المفصلة`,
    ai_t: `🤖 اسأل عن السيرة`, ai_clear: `مسح`,
    ai_hi: `اسأل أي سؤال عن <b>السيرة النبوية وحياة النبي ﷺ</b>: المولد، الوحي، الهجرة، الغزوات، الأسرة، الصحابة والأخلاق. تأتي الإجابات من سيرة التطبيق والقرآن والحديث والتاريخ، مع بيان المصادر ودرجة الوثوق. الفتاوى ليست هنا.`,
    ai_src: `المصادر`, ai_ph: `اكتب سؤالك…`, ai_send: `إرسال`,
    ai_net: `لم يستجب خادم الذكاء الاصطناعي (انتهت المهلة أو لا يوجد إنترنت). حاول مرة أخرى.`,
    ai_off: `هذا القسم يجيب فقط عن السيرة وحياة النبي ﷺ: حياته وغزواته وأسرته وصحابته وأحداث عصره. للأحكام الشرعية استخدم قسم «الذكاء الاصطناعي الشرعي».`,
    ai_notf: `لم يُعثر على إجابة موثوقة لهذا السؤال في مصادر التطبيق. أعد صياغة السؤال أو اسأل عالمًا.`,
    ai_gen: `جزء من هذه الإجابة من المعرفة العامة بالسيرة وليس مباشرة من نصوص التطبيق المحددة.`,
    ai_st1: `… تحليل السؤال`, ai_st2: `… البحث في السيرة والمصادر`, ai_st3: `… كتابة الإجابة`, ai_st4: `… ترجمة الإجابة`, ai_story: `السيرة`, ai_tt: `اسأل عن السيرة`,
    ai_c: [`كيف وقعت غزوة بدر؟`, `متى توفيت خديجة؟`, `كيف كانت الهجرة إلى المدينة؟`, `ماذا حدث في أحد؟`, `ما هو صلح الحديبية؟`, `كيف كان خُلق النبي ﷺ؟`]
  };
  UI.tr = {
    back: `‹ Siyer`, backs: `‹ Geri`, tr: `Çevir`, tring: `… Çevriliyor`, trfail: `Çeviri başarısız: `, nosvc: `Çeviri hizmeti kullanılamıyor`, tmo: `Zaman aşımı`,
    ainote: `Yapay zekâ çevirisidir, hata içerebilir; emin olmak için asıl metne bakın.`, cp: `Kopyala`, retry: `Tekrar dene`, tprog: `… Çevriliyor ({i}/{n})`,
    sl_t: `📜 İbn Hişam Siyeri — Tam Metin`, sl_sub: `{n} sayfa · tam Arapça metin + çeviri`, sl_ld: `… Yükleniyor`, sl_toc: `İçindekiler`, sl_srch: `Ara`, sl_read: `Oku`,
    sl_ldbook: `… Kitap yükleniyor (ilk seferde yaklaşık 2 MB)`, sl_tocph: `İçindekilerde ara (Arapça veya kendi dilinizde)...`, sl_cont: `↩ Okumaya devam et`, sl_page: `Sayfa {n}`,
    sl_start: `Kitabın başı`, sl_none: `Sonuç bulunamadı.`, sl_sph: `Arapça bir kelime veya isim yazın (örn. بيعة العقبة)`, sl_do: `Ara`, sl_res: `{n} sonuç`,
    sl_sinfo: `Kitabın tüm {n} sayfasında arar. Kendi dilinizde arama için “Akıllı Hadis Arama” veya Şer'î YZ'yi kullanın.`,
    sl_pg: `Sayfa {i} / {n} · Cilt {v}`, sl_prev: `‹ Önceki`, sl_next: `Sonraki ›`, sl_goto: `Sayfaya git…`, sl_gotop: `Sayfa numarası (1 – {n})`,
    sl_fail: `Yüklenemedi. İnternetinizi kontrol edip tekrar deneyin.`, sl_tt: `İbn Hişam Siyeri`,
    ss_t: `Peygamberimizin ﷺ Tam Hayatı`, ss_sub: `{c} konu · yaklaşık {w} kelime · {n} bölümden {p}`, ss_cont: `↩ Okumaya devam et`, ss_info: `{c} konu · {w} kelime`, ss_soon: `Yakında eklenecek`,
    ss_note: `Bu hayat hikâyesi siyerin klasik kaynaklarından (İbn Hişam, İbn İshak, İbn Sa'd, Buhârî, Müslim...) derlenmiştir. Kürtçe yazılmıştır ve okurken yapay zekâ ile dilinize çevrilir. Tam Arapça metin için “İbn Hişam Siyeri”ne bakın.`,
    ss_nextch: `Sonraki konu ›`, ss_topart: `Bölüme dön`, ss_words: `{w} kelime`, ss_tt: `Peygamberin Hayatı`,
    ai_t: `🤖 Siyer Hakkında Sor`, ai_clear: `Temizle`,
    ai_hi: `<b>Siyer ve Peygamberimizin ﷺ hayatı</b> hakkında her şeyi sorun: doğum, vahiy, hicret, savaşlar, aile, sahabeler ve ahlâk. Cevaplar uygulamadaki hayat hikâyesinden, Kur'an'dan, hadislerden ve tarihten gelir; kaynaklar ve güvenilirlikleri gösterilir. Fetva soruları burada cevaplanmaz.`,
    ai_src: `Kaynaklar`, ai_ph: `Sorunuzu yazın…`, ai_send: `Gönder`,
    ai_net: `YZ sunucusu yanıt vermedi (zaman aşımı veya internet yok). Tekrar deneyin.`,
    ai_off: `Bu bölüm yalnızca siyer ve Peygamberimizin ﷺ hayatı hakkındaki soruları yanıtlar: hayatı, savaşları, ailesi, sahabeleri ve dönemindeki olaylar. Dinî hükümler için “Şer'î YZ” bölümünü kullanın.`,
    ai_notf: `Uygulamanın kaynaklarında bu soruya güvenilir bir cevap bulunamadı. Soruyu başka şekilde yazın veya bir âlime danışın.`,
    ai_gen: `Bu cevabın bir kısmı siyer hakkındaki genel bilgiden gelir; uygulamanın belirli metinlerinden doğrudan alınmamıştır.`,
    ai_st1: `… Soru inceleniyor`, ai_st2: `… Hayat hikâyesi ve kaynaklar aranıyor`, ai_st3: `… Cevap yazılıyor`, ai_st4: `… Cevap çevriliyor`, ai_story: `Hayat Hikâyesi`, ai_tt: `Siyer Hakkında Sor`,
    ai_c: [`Bedir Savaşı nasıl oldu?`, `Hatice ne zaman vefat etti?`, `Medine'ye hicret nasıl oldu?`, `Uhud'da ne oldu?`, `Hudeybiye Antlaşması nedir?`, `Peygamberimizin ﷺ ahlâkı nasıldı?`]
  };
  UI.fa = {
    back: `سیره ›`, backs: `بازگشت ›`, tr: `ترجمه`, tring: `… در حال ترجمه`, trfail: `ترجمه ناموفق بود: `, nosvc: `سرویس ترجمه در دسترس نیست`, tmo: `زمان به پایان رسید`,
    ainote: `ترجمه با هوش مصنوعی است و ممکن است اشتباه داشته باشد؛ برای اطمینان متن اصلی را بخوانید.`, cp: `کپی`, retry: `دوباره تلاش کنید`, tprog: `… در حال ترجمه ({i}/{n})`,
    sl_t: `📜 سیره ابن هشام — متن کامل`, sl_sub: `{n} صفحه · متن کامل عربی + ترجمه`, sl_ld: `… در حال بارگذاری`, sl_toc: `فهرست`, sl_srch: `جستجو`, sl_read: `مطالعه`,
    sl_ldbook: `… در حال بارگذاری کتاب (بار اول حدود ۲ مگابایت)`, sl_tocph: `جستجو در فهرست (عربی یا زبان خودتان)...`, sl_cont: `↩ ادامه مطالعه`, sl_page: `صفحه {n}`,
    sl_start: `ابتدای کتاب`, sl_none: `چیزی پیدا نشد.`, sl_sph: `کلمه یا نامی را به عربی بنویسید (مثلاً: بيعة العقبة)`, sl_do: `جستجو`, sl_res: `{n} نتیجه`,
    sl_sinfo: `در همه {n} صفحه کتاب جستجو می‌کند. برای جستجو به زبان خودتان از «جستجوی هوشمند حدیث» یا هوش مصنوعی شرعی استفاده کنید.`,
    sl_pg: `صفحه {i} / {n} · جلد {v}`, sl_prev: `قبلی ›`, sl_next: `‹ بعدی`, sl_goto: `رفتن به صفحه…`, sl_gotop: `شماره صفحه (۱ تا {n})`,
    sl_fail: `بارگذاری نشد. اینترنت خود را بررسی کنید و دوباره تلاش کنید.`, sl_tt: `سیره ابن هشام`,
    ss_t: `زندگی کامل پیامبر ﷺ`, ss_sub: `{c} موضوع · حدود {w} کلمه · {p} از {n} بخش`, ss_cont: `↩ ادامه مطالعه`, ss_info: `{c} موضوع · {w} کلمه`, ss_soon: `به‌زودی`,
    ss_note: `این زندگی‌نامه از منابع کلاسیک سیره (ابن هشام، ابن اسحاق، ابن سعد، بخاری، مسلم...) گردآوری شده است. به کردی نوشته شده و هنگام مطالعه با هوش مصنوعی به زبان شما ترجمه می‌شود. برای متن کامل عربی «سیره ابن هشام» را ببینید.`,
    ss_nextch: `‹ موضوع بعدی`, ss_topart: `بازگشت به بخش`, ss_words: `{w} کلمه`, ss_tt: `زندگی پیامبر`,
    ai_t: `🤖 پرسش درباره سیره`, ai_clear: `پاک کردن`,
    ai_hi: `هر پرسشی درباره <b>سیره و زندگی پیامبر ﷺ</b> بپرسید: تولد، وحی، هجرت، غزوات، خانواده، صحابه و اخلاق. پاسخ‌ها از زندگی‌نامه برنامه، قرآن، حدیث و تاریخ می‌آیند و منابع و میزان اعتبارشان نشان داده می‌شود. پرسش‌های فتوا اینجا پاسخ داده نمی‌شود.`,
    ai_src: `منابع`, ai_ph: `پرسش خود را بنویسید…`, ai_send: `ارسال`,
    ai_net: `سرور هوش مصنوعی پاسخ نداد (زمان تمام شد یا اینترنت قطع است). دوباره تلاش کنید.`,
    ai_off: `این بخش فقط به پرسش‌های مربوط به سیره و زندگی پیامبر ﷺ پاسخ می‌دهد: زندگی، غزوات، خانواده، صحابه و رویدادهای عصر ایشان. برای احکام شرعی از بخش «هوش مصنوعی شرعی» استفاده کنید.`,
    ai_notf: `در منابع برنامه پاسخ قابل‌اعتمادی برای این پرسش یافت نشد. پرسش را به شکل دیگری بنویسید یا از عالمی بپرسید.`,
    ai_gen: `بخشی از این پاسخ از دانش عمومی درباره سیره است و مستقیماً از متن‌های مشخص برنامه نیست.`,
    ai_st1: `… بررسی پرسش`, ai_st2: `… جستجو در زندگی‌نامه و منابع`, ai_st3: `… نوشتن پاسخ`, ai_st4: `… ترجمه پاسخ`, ai_story: `زندگی‌نامه`, ai_tt: `پرسش درباره سیره`,
    ai_c: [`جنگ بدر چگونه رخ داد؟`, `خدیجه چه زمانی درگذشت؟`, `هجرت به مدینه چگونه بود؟`, `در احد چه شد؟`, `صلح حدیبیه چه بود؟`, `اخلاق پیامبر ﷺ چگونه بود؟`]
  };
  UI.ur = {
    back: `سیرت ›`, backs: `واپس ›`, tr: `ترجمہ`, tring: `… ترجمہ ہو رہا ہے`, trfail: `ترجمہ ناکام: `, nosvc: `ترجمے کی سروس دستیاب نہیں`, tmo: `وقت ختم`,
    ainote: `یہ مصنوعی ذہانت کا ترجمہ ہے اور اس میں غلطیاں ہو سکتی ہیں؛ تسلی کے لیے اصل متن دیکھیں۔`, cp: `کاپی`, retry: `دوبارہ کوشش کریں`, tprog: `… ترجمہ ہو رہا ہے ({i}/{n})`,
    sl_t: `📜 سیرتِ ابن ہشام — مکمل متن`, sl_sub: `{n} صفحات · مکمل عربی متن + ترجمہ`, sl_ld: `… لوڈ ہو رہا ہے`, sl_toc: `فہرست`, sl_srch: `تلاش`, sl_read: `مطالعہ`,
    sl_ldbook: `… کتاب لوڈ ہو رہی ہے (پہلی بار تقریباً 2 MB)`, sl_tocph: `فہرست میں تلاش (عربی یا اپنی زبان)...`, sl_cont: `↩ مطالعہ جاری رکھیں`, sl_page: `صفحہ {n}`,
    sl_start: `کتاب کی ابتدا`, sl_none: `کچھ نہیں ملا۔`, sl_sph: `عربی میں لفظ یا نام لکھیں (مثلاً: بيعة العقبة)`, sl_do: `تلاش`, sl_res: `{n} نتائج`,
    sl_sinfo: `کتاب کے تمام {n} صفحات میں تلاش کرتا ہے۔ اپنی زبان میں تلاش کے لیے «ذہین حدیث تلاش» یا شرعی AI استعمال کریں۔`,
    sl_pg: `صفحہ {i} / {n} · جلد {v}`, sl_prev: `پچھلا ›`, sl_next: `‹ اگلا`, sl_goto: `صفحے پر جائیں…`, sl_gotop: `صفحہ نمبر (1 سے {n})`,
    sl_fail: `لوڈ نہیں ہو سکا۔ انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔`, sl_tt: `سیرتِ ابن ہشام`,
    ss_t: `نبی ﷺ کی مکمل سیرت`, ss_sub: `{c} موضوعات · تقریباً {w} الفاظ · {n} میں سے {p} حصے`, ss_cont: `↩ مطالعہ جاری رکھیں`, ss_info: `{c} موضوعات · {w} الفاظ`, ss_soon: `جلد آ رہا ہے`,
    ss_note: `یہ سیرت کے کلاسیکی ماخذ (ابن ہشام، ابن اسحاق، ابن سعد، بخاری، مسلم...) سے مرتب کی گئی ہے۔ یہ کردی میں لکھی گئی ہے اور پڑھتے وقت مصنوعی ذہانت سے آپ کی زبان میں ترجمہ ہوتی ہے۔ مکمل عربی متن کے لیے «سیرتِ ابن ہشام» دیکھیں۔`,
    ss_nextch: `‹ اگلا موضوع`, ss_topart: `حصے پر واپس`, ss_words: `{w} الفاظ`, ss_tt: `سیرتِ نبی`,
    ai_t: `🤖 سیرت کے بارے میں پوچھیں`, ai_clear: `صاف کریں`,
    ai_hi: `<b>سیرت اور نبی ﷺ کی زندگی</b> کے بارے میں کوئی بھی سوال پوچھیں: ولادت، وحی، ہجرت، غزوات، خاندان، صحابہ اور اخلاق۔ جوابات ایپ کی سیرت، قرآن، حدیث اور تاریخ سے لیے جاتے ہیں اور ماخذ و اعتبار دکھایا جاتا ہے۔ فتویٰ کے سوالات یہاں نہیں۔`,
    ai_src: `ماخذ`, ai_ph: `اپنا سوال لکھیں…`, ai_send: `بھیجیں`,
    ai_net: `AI سرور نے جواب نہیں دیا (وقت ختم یا انٹرنیٹ نہیں)۔ دوبارہ کوشش کریں۔`,
    ai_off: `یہ حصہ صرف سیرت اور نبی ﷺ کی زندگی سے متعلق سوالوں کا جواب دیتا ہے: زندگی، غزوات، خاندان، صحابہ اور اس دور کے واقعات۔ شرعی مسائل کے لیے «شرعی AI» استعمال کریں۔`,
    ai_notf: `ایپ کے ماخذ میں اس سوال کا قابلِ اعتماد جواب نہیں ملا۔ سوال دوسرے انداز میں لکھیں یا کسی عالم سے پوچھیں۔`,
    ai_gen: `اس جواب کا کچھ حصہ سیرت کی عمومی معلومات سے ہے اور ایپ کے مخصوص متن سے براہِ راست نہیں۔`,
    ai_st1: `… سوال کا تجزیہ`, ai_st2: `… سیرت اور ماخذ میں تلاش`, ai_st3: `… جواب لکھا جا رہا ہے`, ai_st4: `… جواب کا ترجمہ`, ai_story: `سیرت`, ai_tt: `سیرت کے بارے میں پوچھیں`,
    ai_c: [`غزوۂ بدر کیسے ہوا؟`, `خدیجہ کی وفات کب ہوئی؟`, `مدینہ ہجرت کیسے ہوئی؟`, `احد میں کیا ہوا؟`, `صلحِ حدیبیہ کیا تھا؟`, `نبی ﷺ کے اخلاق کیسے تھے؟`]
  };
  UI.fr = {
    back: `‹ Sîra`, backs: `‹ Retour`, tr: `Traduire`, tring: `… Traduction`, trfail: `Échec de la traduction : `, nosvc: `Service de traduction indisponible`, tmo: `Délai dépassé`,
    ainote: `Traduction par IA, pouvant contenir des erreurs ; consultez le texte original pour en être sûr.`, cp: `Copier`, retry: `Réessayer`, tprog: `… Traduction ({i}/{n})`,
    sl_t: `📜 Sîra d'Ibn Hichâm — Texte intégral`, sl_sub: `{n} pages · texte arabe intégral + traduction`, sl_ld: `… Chargement`, sl_toc: `Sommaire`, sl_srch: `Rechercher`, sl_read: `Lire`,
    sl_ldbook: `… Chargement du livre (environ 2 Mo la première fois)`, sl_tocph: `Rechercher dans le sommaire (arabe ou votre langue)...`, sl_cont: `↩ Reprendre la lecture`, sl_page: `Page {n}`,
    sl_start: `Début du livre`, sl_none: `Rien trouvé.`, sl_sph: `Saisissez un mot ou un nom en arabe (ex. : بيعة العقبة)`, sl_do: `Rechercher`, sl_res: `{n} résultats`,
    sl_sinfo: `Recherche dans les {n} pages du livre. Pour chercher dans votre langue, utilisez « Recherche intelligente de hadiths » ou l'IA chariatique.`,
    sl_pg: `Page {i} / {n} · Volume {v}`, sl_prev: `‹ Précédent`, sl_next: `Suivant ›`, sl_goto: `Aller à la page…`, sl_gotop: `Numéro de page (1 à {n})`,
    sl_fail: `Chargement impossible. Vérifiez votre connexion et réessayez.`, sl_tt: `Sîra d'Ibn Hichâm`,
    ss_t: `La vie complète du Prophète ﷺ`, ss_sub: `{c} sujets · environ {w} mots · {p} parties sur {n}`, ss_cont: `↩ Reprendre la lecture`, ss_info: `{c} sujets · {w} mots`, ss_soon: `Bientôt disponible`,
    ss_note: `Cette biographie est compilée à partir des sources classiques de la Sîra (Ibn Hichâm, Ibn Ishâq, Ibn Sa'd, Bukhârî, Muslim...). Elle est rédigée en kurde et traduite dans votre langue par IA pendant la lecture. Pour le texte arabe complet, voir « Sîra d'Ibn Hichâm ».`,
    ss_nextch: `Sujet suivant ›`, ss_topart: `Retour à la partie`, ss_words: `{w} mots`, ss_tt: `Vie du Prophète`,
    ai_t: `🤖 Poser une question sur la Sîra`, ai_clear: `Effacer`,
    ai_hi: `Posez toute question sur <b>la Sîra et la vie du Prophète ﷺ</b> : naissance, révélation, hégire, batailles, famille, compagnons et caractère. Les réponses proviennent de la biographie de l'application, du Coran, des hadiths et de l'histoire, avec les sources et leur fiabilité. Les questions de fatwa ne sont pas traitées ici.`,
    ai_src: `Sources`, ai_ph: `Écrivez votre question…`, ai_send: `Envoyer`,
    ai_net: `Le serveur IA n'a pas répondu (délai dépassé ou pas de connexion). Réessayez.`,
    ai_off: `Cette section répond uniquement aux questions sur la Sîra et la vie du Prophète ﷺ : sa vie, ses batailles, sa famille, ses compagnons et les événements de son époque. Pour les avis juridiques, utilisez la section « IA chariatique ».`,
    ai_notf: `Aucune réponse fiable à cette question n'a été trouvée dans les sources de l'application. Reformulez la question ou interrogez un savant.`,
    ai_gen: `Une partie de cette réponse provient de connaissances générales sur la Sîra et non directement des textes précis de l'application.`,
    ai_st1: `… Analyse de la question`, ai_st2: `… Recherche dans la biographie et les sources`, ai_st3: `… Rédaction de la réponse`, ai_st4: `… Traduction de la réponse`, ai_story: `Biographie`, ai_tt: `Question sur la Sîra`,
    ai_c: [`Comment s'est déroulée la bataille de Badr ?`, `Quand Khadîja est-elle décédée ?`, `Comment s'est passée l'hégire à Médine ?`, `Que s'est-il passé à Uhud ?`, `Qu'était le traité de Hudaybiya ?`, `Comment était le caractère du Prophète ﷺ ?`]
  };
  UI.ru = {
    back: `‹ Сира`, backs: `‹ Назад`, tr: `Перевести`, tring: `… Перевод`, trfail: `Не удалось перевести: `, nosvc: `Служба перевода недоступна`, tmo: `Время истекло`,
    ainote: `Перевод выполнен ИИ и может содержать ошибки; для уверенности обратитесь к оригиналу.`, cp: `Копировать`, retry: `Повторить`, tprog: `… Перевод ({i}/{n})`,
    sl_t: `📜 Сира Ибн Хишама — полный текст`, sl_sub: `{n} стр. · полный арабский текст + перевод`, sl_ld: `… Загрузка`, sl_toc: `Содержание`, sl_srch: `Поиск`, sl_read: `Чтение`,
    sl_ldbook: `… Загрузка книги (около 2 МБ при первом запуске)`, sl_tocph: `Поиск по содержанию (арабский или ваш язык)...`, sl_cont: `↩ Продолжить чтение`, sl_page: `Стр. {n}`,
    sl_start: `Начало книги`, sl_none: `Ничего не найдено.`, sl_sph: `Введите слово или имя по-арабски (например: بيعة العقبة)`, sl_do: `Искать`, sl_res: `Результатов: {n}`,
    sl_sinfo: `Поиск по всем {n} страницам книги. Для поиска на вашем языке используйте «Умный поиск хадисов» или шариатский ИИ.`,
    sl_pg: `Стр. {i} / {n} · Том {v}`, sl_prev: `‹ Назад`, sl_next: `Вперёд ›`, sl_goto: `Перейти на страницу…`, sl_gotop: `Номер страницы (от 1 до {n})`,
    sl_fail: `Не удалось загрузить. Проверьте интернет и повторите.`, sl_tt: `Сира Ибн Хишама`,
    ss_t: `Полная жизнь Пророка ﷺ`, ss_sub: `Тем: {c} · около {w} слов · частей: {p} из {n}`, ss_cont: `↩ Продолжить чтение`, ss_info: `Тем: {c} · слов: {w}`, ss_soon: `Скоро будет добавлено`,
    ss_note: `Это жизнеописание составлено по классическим источникам сиры (Ибн Хишам, Ибн Исхак, Ибн Саад, аль-Бухари, Муслим...). Оно написано на курдском и переводится на ваш язык с помощью ИИ во время чтения. Полный арабский текст — в разделе «Сира Ибн Хишама».`,
    ss_nextch: `Следующая тема ›`, ss_topart: `Назад к части`, ss_words: `слов: {w}`, ss_tt: `Жизнь Пророка`,
    ai_t: `🤖 Вопрос о Сире`, ai_clear: `Очистить`,
    ai_hi: `Задавайте любые вопросы о <b>Сире и жизни Пророка ﷺ</b>: рождение, откровение, хиджра, сражения, семья, сподвижники и нрав. Ответы берутся из жизнеописания в приложении, Корана, хадисов и истории, с указанием источников и их достоверности. Вопросы о фетвах здесь не рассматриваются.`,
    ai_src: `Источники`, ai_ph: `Напишите вопрос…`, ai_send: `Отправить`,
    ai_net: `Сервер ИИ не ответил (время истекло или нет интернета). Повторите попытку.`,
    ai_off: `Этот раздел отвечает только на вопросы о Сире и жизни Пророка ﷺ: его жизнь, сражения, семья, сподвижники и события эпохи. Для религиозных вопросов используйте раздел «Шариатский ИИ».`,
    ai_notf: `В источниках приложения не найден надёжный ответ на этот вопрос. Переформулируйте вопрос или спросите учёного.`,
    ai_gen: `Часть этого ответа основана на общих знаниях о Сире, а не напрямую на конкретных текстах приложения.`,
    ai_st1: `… Анализ вопроса`, ai_st2: `… Поиск в жизнеописании и источниках`, ai_st3: `… Составление ответа`, ai_st4: `… Перевод ответа`, ai_story: `Жизнеописание`, ai_tt: `Вопрос о Сире`,
    ai_c: [`Как произошла битва при Бадре?`, `Когда умерла Хадижа?`, `Как проходила хиджра в Медину?`, `Что произошло при Ухуде?`, `Что такое Худайбийский договор?`, `Каким был нрав Пророка ﷺ?`]
  };
  UI.id = {
    back: `‹ Sirah`, backs: `‹ Kembali`, tr: `Terjemahkan`, tring: `… Menerjemahkan`, trfail: `Gagal menerjemahkan: `, nosvc: `Layanan terjemahan tidak tersedia`, tmo: `Waktu habis`,
    ainote: `Terjemahan AI dan mungkin mengandung kesalahan; periksa teks aslinya untuk memastikan.`, cp: `Salin`, retry: `Coba lagi`, tprog: `… Menerjemahkan ({i}/{n})`,
    sl_t: `📜 Sirah Ibnu Hisyam — Teks Lengkap`, sl_sub: `{n} halaman · teks Arab lengkap + terjemahan`, sl_ld: `… Memuat`, sl_toc: `Daftar Isi`, sl_srch: `Cari`, sl_read: `Baca`,
    sl_ldbook: `… Memuat buku (sekitar 2 MB pertama kali)`, sl_tocph: `Cari di daftar isi (Arab atau bahasa Anda)...`, sl_cont: `↩ Lanjutkan membaca`, sl_page: `Halaman {n}`,
    sl_start: `Awal buku`, sl_none: `Tidak ditemukan.`, sl_sph: `Ketik kata atau nama dalam bahasa Arab (mis.: بيعة العقبة)`, sl_do: `Cari`, sl_res: `{n} hasil`,
    sl_sinfo: `Mencari di seluruh {n} halaman buku. Untuk mencari dalam bahasa Anda gunakan “Pencarian Hadis Cerdas” atau AI Syar'i.`,
    sl_pg: `Halaman {i} / {n} · Jilid {v}`, sl_prev: `‹ Sebelumnya`, sl_next: `Berikutnya ›`, sl_goto: `Ke halaman…`, sl_gotop: `Nomor halaman (1 sampai {n})`,
    sl_fail: `Gagal memuat. Periksa internet Anda dan coba lagi.`, sl_tt: `Sirah Ibnu Hisyam`,
    ss_t: `Kehidupan Lengkap Nabi ﷺ`, ss_sub: `{c} topik · sekitar {w} kata · {p} dari {n} bagian`, ss_cont: `↩ Lanjutkan membaca`, ss_info: `{c} topik · {w} kata`, ss_soon: `Segera hadir`,
    ss_note: `Biografi ini disusun dari sumber-sumber klasik sirah (Ibnu Hisyam, Ibnu Ishaq, Ibnu Sa'd, Bukhari, Muslim...). Ditulis dalam bahasa Kurdi dan diterjemahkan ke bahasa Anda oleh AI saat Anda membaca. Untuk teks Arab lengkap lihat “Sirah Ibnu Hisyam”.`,
    ss_nextch: `Topik berikutnya ›`, ss_topart: `Kembali ke bagian`, ss_words: `{w} kata`, ss_tt: `Kehidupan Nabi`,
    ai_t: `🤖 Tanya tentang Sirah`, ai_clear: `Hapus`,
    ai_hi: `Tanyakan apa saja tentang <b>sirah dan kehidupan Nabi ﷺ</b>: kelahiran, wahyu, hijrah, peperangan, keluarga, sahabat, dan akhlak. Jawaban berasal dari biografi di aplikasi, Al-Qur'an, hadis, dan sejarah, lengkap dengan sumber dan tingkat keandalannya. Pertanyaan fatwa tidak dijawab di sini.`,
    ai_src: `Sumber`, ai_ph: `Tulis pertanyaan Anda…`, ai_send: `Kirim`,
    ai_net: `Server AI tidak merespons (waktu habis atau tidak ada internet). Coba lagi.`,
    ai_off: `Bagian ini hanya menjawab pertanyaan tentang sirah dan kehidupan Nabi ﷺ: kehidupannya, peperangan, keluarga, sahabat, dan peristiwa pada masanya. Untuk hukum agama gunakan bagian “AI Syar'i”.`,
    ai_notf: `Tidak ditemukan jawaban yang andal untuk pertanyaan ini di sumber aplikasi. Ubah pertanyaan Anda atau tanyakan kepada ulama.`,
    ai_gen: `Sebagian jawaban ini berasal dari pengetahuan umum tentang sirah dan tidak langsung dari teks khusus di aplikasi.`,
    ai_st1: `… Menganalisis pertanyaan`, ai_st2: `… Mencari di biografi dan sumber`, ai_st3: `… Menulis jawaban`, ai_st4: `… Menerjemahkan jawaban`, ai_story: `Biografi`, ai_tt: `Tanya tentang Sirah`,
    ai_c: [`Bagaimana Perang Badar terjadi?`, `Kapan Khadijah wafat?`, `Bagaimana hijrah ke Madinah?`, `Apa yang terjadi di Uhud?`, `Apa itu Perjanjian Hudaibiyah?`, `Bagaimana akhlak Nabi ﷺ?`]
  };

  var RTL = { ckb: 1, bad: 1, ar: 1, fa: 1, ur: 1 };
  function lang() {
    var l = window.appLang || '';
    try { if (!l) l = localStorage.getItem('app_language') || ''; } catch (e) {}
    l = l || document.documentElement.lang || 'ckb';
    if (l === 'ku') l = 'ckb';
    return UI[l] ? l : 'en';
  }
  function isKu(l) { l = l || lang(); return l === 'ckb' || l === 'bad'; }
  function U(k, o) {
    var L = lang(), t = UI[L], v;
    if (t && t[k] != null) v = t[k];
    else if (!isKu(L) && UI.en[k] != null) v = UI.en[k];
    else v = UI.ckb[k];
    if (v == null) return '';
    if (typeof v === 'string' && o) v = v.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; });
    return v;
  }
  function ep() { try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; } }

  /* ---------- translation cache (localStorage, oldest entries dropped first) ---------- */
  var CK = 'sira_tr_cache_v2', mem = null, saveT = null;
  function load() { if (!mem) { try { mem = JSON.parse(localStorage.getItem(CK) || '{}') || {}; } catch (e) { mem = {}; } } return mem; }
  function flush() {
    var m = load(), s;
    try { s = JSON.stringify(m); } catch (e) { return; }
    var guard = 0;
    while (s.length > 2400000 && guard++ < 6) {
      var ks = Object.keys(m); ks.slice(0, Math.ceil(ks.length / 5)).forEach(function (k) { delete m[k]; });
      s = JSON.stringify(m);
    }
    try { localStorage.setItem(CK, s); } catch (e) {
      var ks2 = Object.keys(m); ks2.slice(0, Math.ceil(ks2.length / 2)).forEach(function (k) { delete m[k]; });
      try { localStorage.setItem(CK, JSON.stringify(m)); } catch (e2) {}
    }
  }
  function cget(k) { return load()[k]; }
  function cset(k, v) { var m = load(); delete m[k]; m[k] = v; clearTimeout(saveT); saveT = setTimeout(flush, 400); }

  function postTr(text, lang) {
    var e = ep();
    if (!e) return Promise.reject(new Error(U('nosvc')));
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 70000);
    var body = { ar: text, kind: 'sira' };
    if (lang && !isKu(lang)) body.lang = lang;
    return fetch(e + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        return r.json().then(function (d) {
          clearTimeout(t);
          var x = d && (d.text || d.ku);
          if (!r.ok || !x) throw new Error((d && d.message) || ('HTTP ' + r.status));
          return x;
        });
      })
      .catch(function (err) { clearTimeout(t); throw new Error(err && err.name === 'AbortError' ? U('tmo') : (err.message || 'error')); });
  }

  /* split a long text on paragraph (then sentence) boundaries into pieces the Worker accepts (<= 3500 characters) */
  function chunks(text, max) {
    max = max || 3000;
    var out = [], cur = '';
    String(text).split(/\n\s*\n/).forEach(function (p) {
      p = p.trim(); if (!p) return;
      if (p.length > max) {
        if (cur) { out.push(cur); cur = ''; }
        var parts = p.match(/[^.!؟?۔]+[.!؟?۔]*\s*/g) || [p], c2 = '';
        parts.forEach(function (s) { if ((c2 + s).length > max && c2) { out.push(c2.trim()); c2 = ''; } c2 += s; });
        if (c2.trim()) out.push(c2.trim());
        return;
      }
      if (cur && (cur + '\n\n' + p).length > max) { out.push(cur); cur = p; } else cur = cur ? cur + '\n\n' + p : p;
    });
    if (cur) out.push(cur);
    return out;
  }

  /* translate a long text into the app language piece by piece; every piece is cached */
  function trText(text, id, o) {
    o = o || {};
    var L = o.lang || lang(), cs = chunks(text), out = [], i = 0;
    return new Promise(function (res, rej) {
      (function next() {
        if (o.cancelled && o.cancelled()) return rej(new Error('cancelled'));
        if (i >= cs.length) return res(out.join('\n\n'));
        var ck = 'c|' + L + '|' + id + '|' + i, c = cget(ck);
        (c ? Promise.resolve(c) : postTr(cs[i], L).then(function (x) { cset(ck, x); return x; })).then(function (x) {
          out.push(x); i++;
          if (o.progress) o.progress(out.join('\n\n'), i, cs.length);
          next();
        }, rej);
      })();
    });
  }

  /* translate a list of short titles (cached per title); returns a promise<boolean> = something new was translated */
  var flight = {};
  function tl(s) { var L = lang(); if (isKu(L)) return s; return cget('t|' + L + '|' + s) || ''; }
  function trLines(lines, L) {
    L = L || lang();
    if (isKu(L)) return Promise.resolve(false);
    var need = [], seen = {};
    lines.forEach(function (s) { s = String(s || '').trim(); if (s && !seen[s] && !cget('t|' + L + '|' + s)) { seen[s] = 1; need.push(s); } });
    if (!need.length || flight[L]) return Promise.resolve(false);
    flight[L] = 1;
    var batches = [], changed = false;
    for (var i = 0; i < need.length; i += 25) batches.push(need.slice(i, i + 25));
    return batches.reduce(function (pr, b) {
      return pr.then(function () {
        return postTr(b.map(function (s, k) { return (k + 1) + '. ' + s; }).join('\n'), L).then(function (txt) {
          var ls = String(txt).split(/\n+/).map(function (x) { return x.replace(/^\s*\d+\s*[\.\)\-:]\s*/, '').trim(); }).filter(Boolean);
          if (ls.length === b.length) { b.forEach(function (s, k) { cset('t|' + L + '|' + s, ls[k]); }); changed = true; }
        });
      });
    }, Promise.resolve()).then(function () { flight[L] = 0; return changed; }, function () { flight[L] = 0; return changed; });
  }

  window.__siL = { U: U, lang: lang, isKu: isKu, rtl: function () { return !!RTL[lang()]; }, ep: ep, trText: trText, trLines: trLines, tl: tl, chunks: chunks, hash: function (s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); } };
})();

/* ===================== the library itself ===================== */
(function () {
  if (window.__siraLibV3) return;
  window.__siraLibV3 = true;
  var S = window.__siL;
  var $ = function (id) { return document.getElementById(id); };
  var POS = 'sira_pos_v1', TRK = 'sira_tr_v1', SZ = 'sira_size_v1';
  var LANGS = [['ku', 'کوردی'], ['en', 'English'], ['tr', 'Türkçe'], ['fa', 'فارسی'], ['ur', 'اردو'], ['fr', 'Français'], ['de', 'Deutsch'], ['id', 'Indonesia'], ['ru', 'Русский'], ['es', 'Español'], ['ar', 'العربية']];
  var PAGES = { en: 'pages', ar: 'صفحة', tr: 'sayfa', fa: 'صفحه', ur: 'صفحات', fr: 'pages', ru: 'стр.', id: 'halaman' };
  var KEY = { 233: 'ژنهێنانی پێغەمبەر بە خەدیجە', 305: 'ئیسلامبوونی خەدیجە و یەکەم باوەڕهێنەران', 324: 'ئاشکراکردنی بانگەواز', 413: 'ئیسلامبوونی عومەر', 469: 'ئیسراء و میعراج', 506: 'بەیعەتی عەقەبەی یەکەم', 556: 'کۆچی پێغەمبەر بۆ مەدینە', 880: 'غەزای ئوحود', 1045: 'غەزای خەندەق', 1150: 'ڕێککەوتنی حودەیبیە و بەیعەتی ڕیزوان', 1224: 'غەزای موئتە', 1397: 'غەزای تەبووک', 1589: 'کۆچی دوایی پێغەمبەر ﷺ' };
  var data = null, loading = null, toc = null, norm = null;
  var st = { tab: 'toc', page: 0, tr: null, lang: 'ku', q: '', hits: [], size: 18 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ep() { return S.ep(); }
  function nz(s) { return String(s).replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي'); }
  function keyName(i) { return S.isKu() ? KEY[i] : (S.tl(KEY[i]) || ''); }

  function load() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch('sira/ibn-hisham.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (d) {
      data = d.pages; buildToc(); return data;
    }).catch(function (e) { loading = null; throw e; });
    return loading;
  }

  var HEAD = /^(غزوة|ذكر|إسلام|اسلام|بيعة|هجرة|سرية|أمر|حديث|بعث|وفاة|فتح|مباداة|يوم|خبر|قصة|بناء|صلح|حصار|أول|مقتل|إسلام|وفد|وفود|مرض|سبب|تأليف|خروج|استعداد|عمرة|حجة|سقيفة)\s/;
  function buildToc() {
    toc = [];
    data.forEach(function (p, i) {
      if (KEY[i]) { toc.push({ i: i, ku: KEY[i], ar: p[2].split(' ').slice(0, 8).join(' '), key: true }); return; }
      var t = p[2];
      if (HEAD.test(t) && t.length > 60) toc.push({ i: i, ar: t.split(' ').slice(0, 7).join(' ') });
    });
    norm = null;
  }

  function css() {
    if ($('siraCss')) return;
    var s = document.createElement('style'); s.id = 'siraCss';
    s.textContent = [
      'body:has(#siraLib.active) .top{display:none!important}',
      '.phone:has(#siraLib.active) .status,.phone:has(#siraLib.active) .appbar,.phone:has(#siraLib.active) .bottom{display:none!important}',
      '.phone:has(#siraLib.active) .main{height:100%!important;padding:0!important;background:#f7f4ef}',
      '#siraLib{display:none!important}',
      '#siraLib.active{display:flex!important;flex-direction:column;height:100%;box-sizing:border-box}',
      '#siraLib .sl-head{padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#6b3f1d,#4a2a12);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px}',
      '#siraLib .sl-head h2{margin:0;font-size:17px}#siraLib .sl-head small{display:block;font-size:11px;opacity:.9;margin-top:2px}',
      '#siraLib .sl-b{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#siraLib .sl-tabs{display:flex;background:#fff;border-bottom:1px solid #e4d5ad}',
      '#siraLib .sl-tabs button{flex:1;border:0;background:none;padding:11px 4px;font:inherit;font-size:13px;color:#7a6a3a;cursor:pointer;border-bottom:3px solid transparent}',
      '#siraLib .sl-tabs button.on{color:#4a2a12;font-weight:800;border-bottom-color:#b48a3c}',
      '#siraLib .sl-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#siraLib input[type=search],#siraLib input[type=number]{width:100%;box-sizing:border-box;padding:10px;border:1px solid #e4d5ad;border-radius:12px;font:inherit;font-size:14px;margin-bottom:10px}',
      '#siraLib .sl-item{background:#fff;border:1px solid #e4d5ad;border-radius:12px;padding:10px 12px;margin-bottom:8px;cursor:pointer;text-align:start}',
      '#siraLib .sl-item b{display:block;font-size:14px;color:#3d2a14}',
      '#siraLib .sl-item small{color:#8a6a24;font-size:11px}',
      '#siraLib .sl-item.key{border-color:#b48a3c;background:#fbf5e7}',
      '#siraLib .sl-ar{direction:rtl;text-align:right;line-height:2.1;color:#2b2415;font-family:"Amiri","Scheherazade New","Traditional Arabic",serif;background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:14px}',
      '#siraLib .sl-tr{margin-top:10px;padding:12px;background:#f1f8f3;border-radius:12px;line-height:2;color:#173f35;font-size:15px;white-space:pre-wrap;text-align:start}',
      '#siraLib .sl-nav{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}',
      '#siraLib .sl-nav button,#siraLib .sl-nav select{border:1px solid #d8c68f;background:#fbf5e7;color:#5a4a1c;border-radius:10px;padding:8px 11px;font:inherit;font-size:13px;cursor:pointer}',
      '#siraLib .sl-nav .pri{background:#176b4b;color:#fff;border-color:#176b4b}',
      '#siraLib .sl-msg{padding:16px;text-align:center;color:#6b5a2a;font-size:13px;line-height:1.9}',
      '#siraLib mark{background:#ffe9a8;padding:0 1px}',
      '#siraEntry{background:linear-gradient(135deg,#6b3f1d,#4a2a12)!important;color:#fff!important;border:0!important}#siraEntry b,#siraEntry small{color:#fff!important}'
    ].join('');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main'); if (!main) return null;
    var v = $('siraLib'); if (v) return v;
    v = document.createElement('div'); v.id = 'siraLib'; v.className = 'view'; main.appendChild(v); return v;
  }

  function chrome(sub) {
    return '<div class="sl-head"><div><h2>' + esc(S.U('sl_t')) + '</h2><small>' + esc(sub) + '</small></div>' +
      '<button type="button" class="sl-b" data-a="back">' + esc(S.U('back')) + '</button></div>' +
      '<div class="sl-tabs"><button data-a="tab" data-t="toc"' + (st.tab === 'toc' ? ' class="on"' : '') + '>' + esc(S.U('sl_toc')) + '</button>' +
      '<button data-a="tab" data-t="search"' + (st.tab === 'search' ? ' class="on"' : '') + '>' + esc(S.U('sl_srch')) + '</button>' +
      '<button data-a="tab" data-t="read"' + (st.tab === 'read' ? ' class="on"' : '') + '>' + esc(S.U('sl_read')) + '</button></div>';
  }

  function render() {
    var v = ensureView(); if (!v) return;
    v.setAttribute('dir', S.rtl() ? 'rtl' : 'ltr');
    var sub = data ? S.U('sl_sub', { n: data.length }) : S.U('sl_ld');
    var body = '';
    if (!data) body = '<div class="sl-msg">' + esc(S.U('sl_ldbook')) + '</div>';
    else if (st.tab === 'toc') body = renderToc();
    else if (st.tab === 'search') body = renderSearch();
    else body = renderRead();
    var keep = v.querySelector('.sl-body'), top = keep ? keep.scrollTop : 0, qv = $('slQ') ? $('slQ').value : null, hadFocus = document.activeElement && document.activeElement.id === 'slQ';
    v.innerHTML = chrome(sub) + '<div class="sl-body" id="slBody">' + body + '</div>';
    if ($('slQ') && qv != null) { $('slQ').value = qv; if (hadFocus) $('slQ').focus(); }
    if (st.keepScroll) { $('slBody').scrollTop = top; }
  }

  function renderToc() {
    var last = jget(POS, 0);
    var f = $('slQ') ? $('slQ').value.trim() : (st.tf || '');
    var list = toc;
    if (f) { var nf = nz(f); list = toc.filter(function (t) { return nz((t.ku || '') + ' ' + keyName(t.i) + ' ' + t.ar).indexOf(nf) >= 0; }); }
    var h = '<input type="search" id="slQ" data-a="tocf" placeholder="' + esc(S.U('sl_tocph')) + '" value="' + esc(f) + '">';
    if (!f && last > 0) h += '<div class="sl-item key" data-a="open" data-i="' + last + '"><b>' + esc(S.U('sl_cont')) + '</b><small>' + esc(S.U('sl_page', { n: last + 1 })) + '</small></div>';
    h += '<div class="sl-item" data-a="open" data-i="0"><b>' + esc(S.U('sl_start')) + '</b><small>' + esc(S.U('sl_page', { n: 1 })) + '</small></div>';
    list.forEach(function (t) {
      var nm = t.key ? keyName(t.i) : '';
      var title = nm || t.ar, small = (nm ? t.ar + ' · ' : '') + S.U('sl_page', { n: t.i + 1 });
      h += '<div class="sl-item' + (t.key ? ' key' : '') + '" data-a="open" data-i="' + t.i + '"><b>' + esc(title) + '</b><small>' + esc(small) + '</small></div>';
    });
    if (!list.length) h += '<div class="sl-msg">' + esc(S.U('sl_none')) + '</div>';
    return h;
  }

  function renderSearch() {
    var h = '<input type="search" id="slQ" data-a="sq" placeholder="' + esc(S.U('sl_sph')) + '" value="' + esc(st.q) + '">' +
      '<div class="sl-nav"><button class="pri" data-a="dosearch">' + esc(S.U('sl_do')) + '</button></div>';
    if (st.searched) {
      h += '<div class="sl-msg" style="padding:6px">' + esc(S.U('sl_res', { n: st.hits.length + (st.hits.length >= 60 ? '+' : '') })) + '</div>';
      st.hits.forEach(function (x) {
        h += '<div class="sl-item" data-a="open" data-i="' + x.i + '"><small>' + esc(S.U('sl_page', { n: x.i + 1 })) + '</small><div style="direction:rtl;text-align:right;font-size:14px;line-height:1.9">' + x.snip + '</div></div>';
      });
    } else h += '<div class="sl-msg">' + esc(S.U('sl_sinfo', { n: data.length })) + '</div>';
    return h;
  }

  function doSearch() {
    var q = ($('slQ').value || '').trim(); st.q = q; st.searched = true; st.hits = [];
    if (!q) { render(); return; }
    if (!norm) norm = data.map(function (p) { return nz(p[2]); });
    var parts = nz(q).split(/\s+/).filter(Boolean);
    for (var i = 0; i < norm.length && st.hits.length < 60; i++) {
      var ok = true; for (var k = 0; k < parts.length; k++) if (norm[i].indexOf(parts[k]) < 0) { ok = false; break; }
      if (!ok) continue;
      var raw = data[i][2], j = norm[i].indexOf(parts[0]);
      var a = Math.max(0, j - 60), snip = esc(raw.slice(a, j + 140));
      st.hits.push({ i: i, snip: (a > 0 ? '… ' : '') + snip + ' …' });
    }
    render();
  }

  function trKey(i, lang) { return i + '|' + lang; }
  function renderRead() {
    var i = st.page, p = data[i];
    var tr = st.trShow || (jget(TRK, {})[trKey(i, st.lang)]);
    var opts = LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === st.lang ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('');
    var nm = KEY[i] ? (keyName(i) || p[2].split(' ').slice(0, 8).join(' ')) : '';
    var title = nm ? '<div style="font-weight:800;color:#4a2a12;margin-bottom:8px;text-align:start">' + esc(nm) + '</div>' : '';
    var trDir = (st.lang === 'ku' || st.lang === 'ar' || st.lang === 'fa' || st.lang === 'ur') ? 'rtl' : 'ltr';
    return title + '<div class="sl-nav"><button data-a="prev"' + (i <= 0 ? ' disabled' : '') + '>' + esc(S.U('sl_prev')) + '</button>' +
      '<span style="font-size:12px;color:#7a6a3a">' + esc(S.U('sl_pg', { i: i + 1, n: data.length, v: p[0] })) + '</span>' +
      '<button data-a="next"' + (i >= data.length - 1 ? ' disabled' : '') + '>' + esc(S.U('sl_next')) + '</button>' +
      '<button data-a="fs" data-d="2">A+</button><button data-a="fs" data-d="-2">A−</button></div>' +
      '<div class="sl-ar" style="font-size:' + st.size + 'px">' + esc(p[2]) + '</div>' +
      '<div class="sl-nav"><select data-a="lang">' + opts + '</select><button class="pri" data-a="tr">' + esc(S.U('tr')) + '</button>' +
      '<button data-a="cp">' + esc(S.U('cp')) + '</button><button data-a="goto">' + esc(S.U('sl_goto')) + '</button></div>' +
      (st.trBusy ? '<div class="sl-tr">' + esc(S.U('tring')) + '</div>' : (tr ? '<div class="sl-tr" dir="' + trDir + '">' + esc(tr) + '</div>' : '')) +
      '<div class="sl-msg" style="font-size:11px">' + esc(S.U('ainote')) + '</div>';
  }

  function open(i) {
    st.page = Math.max(0, Math.min(data.length - 1, i)); st.tab = 'read'; st.trShow = null; st.trBusy = false;
    jset(POS, st.page); render(); var b = $('slBody'); if (b) b.scrollTop = 0;
  }

  function translate() {
    var i = st.page, lang = st.lang, c = jget(TRK, {}), k = trKey(i, lang);
    if (c[k]) { st.trShow = c[k]; render(); return; }
    if (!ep()) { alert(S.U('nosvc')); return; }
    st.trBusy = true; render();
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: data[i][2], lang: lang, kind: 'sira' }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !(d.text || d.ku)) throw new Error(d.message || 'HTTP ' + r.status); return d.text || d.ku; }); })
      .then(function (txt) {
        clearTimeout(t); var cc = jget(TRK, {}), ks = Object.keys(cc); if (ks.length > 150) delete cc[ks[0]]; cc[k] = txt; jset(TRK, cc);
        if (st.page === i && st.lang === lang) st.trShow = txt; st.trBusy = false; render();
      }).catch(function (e) { clearTimeout(t); st.trBusy = false; render(); alert(S.U('trfail') + (e && e.name === 'AbortError' ? S.U('tmo') : (e.message || e))); });
  }

  function onClick(e) {
    var v = $('siraLib'); if (!v || !v.contains(e.target)) return;
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a');
    if (a === 'back') { if (typeof window.enterSeerah === 'function') window.enterSeerah(); return; }
    if (a === 'tab') { st.tab = t.getAttribute('data-t'); st.trShow = null; render(); return; }
    if (a === 'open') return open(Number(t.getAttribute('data-i')));
    if (a === 'prev') return open(st.page - 1);
    if (a === 'next') return open(st.page + 1);
    if (a === 'fs') { st.size = Math.max(14, Math.min(32, st.size + Number(t.getAttribute('data-d')))); jset(SZ, st.size); st.keepScroll = true; render(); st.keepScroll = false; return; }
    if (a === 'tr') return translate();
    if (a === 'cp') { var tx = data[st.page][2] + (st.trShow ? '\n\n' + st.trShow : ''); if (navigator.clipboard) navigator.clipboard.writeText(tx).then(function () { t.textContent = '✓'; }); return; }
    if (a === 'goto') { var n = parseInt(prompt(S.U('sl_gotop', { n: data.length })), 10); if (n >= 1 && n <= data.length) open(n - 1); return; }
    if (a === 'dosearch') return doSearch();
  }
  function onChange(e) {
    var t = e.target; if (!$('siraLib') || !$('siraLib').contains(t)) return;
    if (t.getAttribute('data-a') === 'lang') { st.lang = t.value; st.trShow = null; render(); }
  }
  function onInput(e) {
    var t = e.target; if (!$('siraLib') || !$('siraLib').contains(t)) return;
    if (t.getAttribute('data-a') === 'tocf') { st.tf = t.value; var pos = t.selectionStart; render(); var q = $('slQ'); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (x) {} } }
  }
  function onKey(e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'slQ' && e.target.getAttribute('data-a') === 'sq') { e.preventDefault(); doSearch(); }
  }

  function enter() {
    css(); if (!ensureView()) return; st.size = jget(SZ, 18);
    st.lang = S.isKu() ? 'ku' : (LANGS.some(function (x) { return x[0] === S.lang(); }) ? S.lang() : 'en');
    st.trShow = null;
    var last = jget(POS, 0);
    if (typeof window.showView === 'function') window.showView('siraLib', S.U('sl_tt')); else if (typeof showView === 'function') showView('siraLib', S.U('sl_tt'));
    render();
    load().then(function () { st.tab = last > 0 ? 'toc' : 'toc'; render(); }).catch(function () {
      var b = $('slBody'); if (b) b.innerHTML = '<div class="sl-msg">' + esc(S.U('sl_fail')) + '</div>';
    });
    if (!S.isKu()) S.trLines(Object.keys(KEY).map(function (k) { return KEY[k]; })).then(function (ch) { if (ch && $('siraLib') && $('siraLib').classList.contains('active')) { st.keepScroll = true; render(); st.keepScroll = false; } });
  }
  window.enterSiraLibrary = enter;

  /* tile on the Seerah home grid; its text follows the app language */
  function inject() {
    var g = document.querySelector('#seerahView .sr-home-grid');
    if (!g) return;
    var d = g.querySelector('#siraEntry');
    if (!d) {
      d = document.createElement('div'); d.className = 'sr-home-tile'; d.id = 'siraEntry';
      d.onclick = enter; g.insertBefore(d, g.firstChild);
    }
    var L = S.lang();
    if (d.getAttribute('data-l') !== L) {
      d.setAttribute('data-l', L);
      d.innerHTML = '<span>📜</span><b>' + esc(S.U('sl_tt')) + '</b><small>' + (S.isKu() ? '١٥٩٨ لاپەڕە' : '1598 ' + esc(PAGES[L] || 'pages')) + '</small>';
    }
  }
  document.addEventListener('click', onClick);
  document.addEventListener('change', onChange);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKey);
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
