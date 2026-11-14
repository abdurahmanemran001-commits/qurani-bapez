/* companions-ai-i18n.js v1 — UI ی «پرسیار لە هاوەڵان» بەپێی زمان (ستاتیک en/ar، زمانەکانی تر بە trLines ی هاوبەش) */
(function () {
  if (window.__cpAiLoc) return;
  var EN = { '🤖 پرسیار لە هاوەڵان': '🤖 Ask about the Companions', '‹ گەڕانەوە': '‹ Back', 'پاککردنەوە': 'Clear', 'ناردن': 'Send', 'سەرچاوەکان': 'Sources', 'ناوی هاوەڵ یان پرسیارەکەت بنووسە…': 'Type a Companion\'s name or your question…', 'ئەبوبەکر سدیق کێ بوو؟': 'Who was Abu Bakr al-Siddiq?', 'ژیانی عومەری کوڕی خەتتاب': 'The life of Umar ibn al-Khattab', 'خالیدی کوڕی وەلید': 'Khalid ibn al-Walid', 'عائیشەی دایکی ئیمانداران': 'Aisha, Mother of the Believers', 'بیلاڵی کوڕی ڕەباح': 'Bilal ibn Rabah', 'ئەبوهورەیرە': 'Abu Hurayra', 'سەلمانی فارسی': 'Salman al-Farisi', 'خەدیجەی کچی خوەیلید': 'Khadija bint Khuwaylid', '… شیکردنەوەی پرسیار': '… analysing the question', '… گەڕان لە سەرچاوەکان': '… searching the sources', '… نووسینی وەڵامی درێژ (ئەمە کەمێک کات دەبات)': '… writing a detailed answer (this takes a moment)' };
  var AR = { '🤖 پرسیار لە هاوەڵان': '🤖 اسأل عن الصحابة', '‹ گەڕانەوە': '‹ رجوع', 'پاککردنەوە': 'مسح', 'ناردن': 'إرسال', 'سەرچاوەکان': 'المصادر', 'ناوی هاوەڵ یان پرسیارەکەت بنووسە…': 'اكتب اسم صحابي أو سؤالك…', 'ئەبوبەکر سدیق کێ بوو؟': 'من هو أبو بكر الصديق؟', 'ژیانی عومەری کوڕی خەتتاب': 'حياة عمر بن الخطاب', 'خالیدی کوڕی وەلید': 'خالد بن الوليد', 'عائیشەی دایکی ئیمانداران': 'عائشة أم المؤمنين', 'بیلاڵی کوڕی ڕەباح': 'بلال بن رباح', 'ئەبوهورەیرە': 'أبو هريرة', 'سەلمانی فارسی': 'سلمان الفارسي', 'خەدیجەی کچی خوەیلید': 'خديجة بنت خويلد', '… شیکردنەوەی پرسیار': '… تحليل السؤال', '… گەڕان لە سەرچاوەکان': '… البحث في المصادر', '… نووسینی وەڵامی درێژ (ئەمە کەمێک کات دەبات)': '… كتابة إجابة مفصلة (يستغرق قليلًا)' };
  var HI_EN = 'Type the name of any <b>Companion of the Prophet ﷺ</b> (man or woman) and get a long, sourced answer: lineage, conversion to Islam, key deeds, virtues and death. Only the Companions are covered.';
  var HI_AR = 'اكتب اسم أي <b>صحابي أو صحابية</b> للنبي ﷺ لتحصل على إجابة مفصلة بالمصادر: النسب والإسلام وأهم الأعمال والفضائل والوفاة. هذا القسم يجيب عن الصحابة فقط.';
  function S() { return window.__siL; }
  function lang() { return window.appLang || 'ckb'; }
  var inL = false;
  window.__cpAiLoc = function (v) {
    var l = lang(); if (l === 'ckb' || l === 'bad' || !v || inL) return; inL = true;
    try {
      var ar = l === 'ar', D = ar ? AR : EN, s = S(), need = [];
      v.dir = (ar || (s && s.rtl && s.rtl())) ? 'rtl' : 'ltr'; v.style.direction = v.dir;
      var hi = v.querySelector('.ca-hi'); if (hi) { if (ar || l === 'en') hi.innerHTML = ar ? HI_AR : HI_EN; else need.push(hi); }
      var w = document.createTreeWalker(v, 4), n, nodes = []; while (n = w.nextNode()) nodes.push(n);
      nodes.forEach(function (t) {
        if (t.parentElement.closest('.ca-hi,.ca-m.u')) return; if (t.parentElement.closest('.ca-m') && t.nodeValue.trim() !== 'سەرچاوەکان') return;
        var tr = t.nodeValue.trim(); if (!tr || !/[ء-ۿ]/.test(tr)) return;
        var pre = (tr.match(/^[^؀-ۿ]+/) || [''])[0], core = tr.slice(pre.length);
        if (D[tr] != null) t.nodeValue = t.nodeValue.replace(tr, D[tr]);
        else if (pre && D['🤖 ' + core] != null && 0) {}
        else if (s) { var x = s.tl(tr); if (x) t.nodeValue = t.nodeValue.replace(tr, x); else need.push(tr); }
      });
      var q = v.querySelector('#caQ'); if (q) { var ph = 'ناوی هاوەڵ یان پرسیارەکەت بنووسە…'; q.placeholder = D[ph] || (s && s.tl(ph)) || D[ph] || ph; if (!D[ph] && s && !s.tl(ph)) need.push(ph); }
      var st = v.querySelector('#caStatus'); if (st) { var u = D[st.textContent.trim()]; if (u) st.textContent = u; }
      var texts = need.filter(function (x) { return typeof x === 'string'; });
      if (hi && !(ar || l === 'en') && s) { var hs = 'ناوی هەر هاوەڵێکی پێغەمبەر ﷺ (پیاو یان ژن) بنووسە و وەڵامێکی درێژ وەردەگریت'; var th = s.tl(hs); if (th) hi.textContent = th; else texts.push(hs); }
      if (texts.length && s) s.trLines(texts).then(function (ch) { if (ch !== false) { inL = false; var vv = document.getElementById('companionsAi'); if (vv && window.__cpAiRe) window.__cpAiRe(); } }, function () {});
    } catch (e) {}
    inL = false;
  };
  /* generic localizer for views built in Kurdish (quiz): every Kurdish text node goes through the shared cached translator */
  var tries = 0;
  window.__cpGenLoc = function (v, re) {
    var l = lang(), s = S(); if (l === 'ckb' || l === 'bad' || !v || !s) return;
    v.dir = (s.rtl && s.rtl()) ? 'rtl' : 'ltr'; v.style.direction = v.dir;
    var w = document.createTreeWalker(v, 4), n, need = [], KU = /[ء-ۿ]/;
    while (n = w.nextNode()) {
      if (n.parentElement.closest('.ar,script,style')) continue;
      var tr = n.nodeValue.trim(); if (!tr || !KU.test(tr)) continue;
      var x = s.tl(tr); if (x) n.nodeValue = n.nodeValue.replace(tr, x); else need.push(tr);
    }
    v.querySelectorAll('[placeholder],[title]').forEach(function (e) { ['placeholder', 'title'].forEach(function (a) { var p = e.getAttribute(a); if (p && KU.test(p)) { var x = s.tl(p); if (x) e.setAttribute(a, x); else need.push(p); } }); });
    if (need.length) s.trLines(need).then(function (ch) { if (ch !== false) { tries = 0; re && re(); } else if (tries++ < 4) setTimeout(function () { re && re(); }, 2500); }, function () {});
  };
  // status line updates come from companions-ai.js through textContent: localize them too
  new MutationObserver(function (ms) { var l = lang(); if (l !== 'ar' && l !== 'en') return; var D = l === 'ar' ? AR : EN; var e = document.getElementById('caStatus'); if (e && D[e.textContent.trim()]) e.textContent = D[e.textContent.trim()]; }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
