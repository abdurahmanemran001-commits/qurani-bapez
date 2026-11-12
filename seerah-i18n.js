/* seerah-i18n.js v1 — سیرەی پێغەمبەر بەپێی زمان (en/ar + زمانەکانی تر بە ئینگلیزی؛ دەقە درێژەکان بە وەرگێڕانی ئۆنلاین) */
(function () {
  if (window.__srI18n) return; window.__srI18n = true;
  var EN_T = { nasab: 'Lineage and Family', fil: 'The Year of the Elephant and Abraha\'s Campaign', wilada: 'Birth, Nursing and the Opening of the Chest', shabab: 'Youth and the Title "al-Amin"', khadija: 'Marriage to Khadija', wahy: 'The Beginning of Revelation at Hira', secret: 'The Secret Call and the First Believers', public: 'The Public Call and the Persecution', habasha: 'Migration to Abyssinia', hamza_umar: 'The Conversion of Hamza and Umar', boycott: 'The Boycott of Banu Hashim', huzn: 'The Year of Sorrow and the Journey to Ta\'if', isra: 'Al-Isra and al-Mi\'raj', aqaba: 'The Pledges of Aqaba', hijra: 'The Hijra to Madinah and the Cave of Thawr', madina_build: 'The Mosque, the Brotherhood and the Charter of Madinah', badr: 'The Battle of Badr (Detailed)', uhud: 'The Battle of Uhud', khandaq: 'The Battle of the Trench (al-Ahzab)', banu_qurayza: 'Banu Qurayza', hudaybiya: 'The Treaty of Hudaybiyah and the Clear Conquest', fath: 'The Conquest of Makkah', wada: 'The Farewell Pilgrimage and the Sermon of Arafah', wafat: 'Illness and Death', akhlaq: 'General Character', ibada: 'Worship and Asceticism', abd_muttalib: 'Abd al-Muttalib, Zamzam and the Vow of Sacrifice', amina: 'Amina bint Wahb and the Journey to Yathrib', bahira: 'The Journey to Sham and the Monk Bahira', hilf_fudul: 'The Pact of al-Fudul', rebuild_kabah: 'Rebuilding the Kaaba and the Black Stone', first_believers_detail: 'The First Believers in Detail', bilal: 'Bilal al-Habashi and His Torture', yasir_sumayya: 'Yasir and Sumayya — the First Martyrs', quran_early: 'The First Surahs Revealed', migration_habasha_detail: 'Migration to Abyssinia — Details', badr_prep: 'Preparing for Badr', badr_duel: 'The Duels of Badr', uhud_archers: 'The Archers of Uhud', khandaq_salman: 'Salman and the Trench', letters_kings: 'The Prophet\'s Letters to the Kings', wives: 'The Wives of the Prophet ﷺ', children: 'The Children of the Prophet ﷺ', miracles: 'The Miracles of the Prophet ﷺ', daily_life: 'The Daily Life of the Prophet ﷺ' };
  var EN_P = { pre: 'Before Prophethood', mecca: 'The Makkan Period', hijra: 'Hijra and Building Madinah', battles: 'Battles and Events', late: 'The Final Years', character: 'Character and Attributes', books: 'Classical Books' };
  var EN_B = { ibn_hisham: ['Sirah of Ibn Hisham', 'Ibn Hisham', 'The most important and oldest complete source of the Seerah.'], rahiq: ['Ar-Raheeq al-Makhtum', 'al-Mubarakpuri', 'The best organised modern biography. Prize winner, 1976.'], shamail: ['Shama\'il of al-Tirmidhi', 'al-Tirmidhi', 'The attributes and conduct of the Prophet ﷺ.'], ibn_kathir: ['Al-Bidaya wa al-Nihaya (Seerah)', 'Ibn Kathir', 'A long and detailed biography.'], zad: ['Zad al-Ma\'ad', 'Ibn al-Qayyim', 'The guidance and Sunnah of the Prophet.'], fiqh_sira: ['Fiqh al-Seerah', 'al-Ghazali', 'The Seerah from a jurisprudential angle.'], nur_yaqin: ['Nur al-Yaqin', 'al-Khudari', 'A short, organised biography.'], mukhtasar_rahiq: ['Abridged ar-Raheeq', 'al-Mubarakpuri', 'The abridged edition.'] };
  var EN = {
    'سیرەی پێغەمبەر ﷺ': 'Seerah of the Prophet ﷺ', 'سیرەی پێغەمبەر': 'Seerah of the Prophet', 'نیشانەکراوەکان': 'Bookmarks', 'کتێبە کلاسیکییەکان': 'Classical Books', 'کتێب': 'Book',
    '‹ گەڕانەوە': '‹ Back', 'بەشەکان': 'Sections', 'هەموو': 'All', 'گەڕان': 'Search', 'کوردی': 'Kurdish',
    '★ لابردنی نیشانە': '★ Remove bookmark', '☆ نیشانەکردن': '☆ Bookmark', 'هیچ نیشانەیەک نییە': 'No bookmarks', 'هیچ بەشێک نەدۆزرایەوە': 'No sections found', 'کتێب نەدۆزرایەوە': 'Book not found',
    'نووسەر': 'Author', 'قەبارە': 'Size', 'وەسف': 'Description', 'هێشتا داونەگیراوە': 'Not downloaded yet', '✓ نیشانەکراو وەک داگیراو': '✓ Marked as downloaded',
    '⬇ داگرتن (archive.org)': '⬇ Download (archive.org)', '⬇ وەشانی تر': '⬇ Other edition', 'سڕینەوەی نیشانە': 'Remove mark', '✓ نیشانەی داگیراو': '✓ Mark as downloaded',
    'دوای داگرتن PDF لە مۆبایل هەڵبگرە. نیشانەکە یادگارییە لەناو ئەپ.': 'After downloading, keep the PDF on your phone. The mark is only a reminder inside the app.',
    'کرتە لە «داگرتن» → archive.org → PDF داگرە. پاشان «نیشانەی داگیراو». دەتوانیت نیشانە بسڕیتەوە.': 'Tap “Download” → archive.org → download the PDF. Then “Mark as downloaded”. You can remove the mark any time.',
    'سیرەی ئیبن هیشام': 'Sirah of Ibn Hisham', 'ژیاننامەی پێغەمبەر ﷺ': 'Life of the Prophet ﷺ', 'پرسیار لە سیرە': 'Ask about the Seerah', 'ژیاننامەی پێغەمبەر': 'Life of the Prophet'
  };
  var AR = {
    'سیرەی پێغەمبەر ﷺ': 'سيرة النبي ﷺ', 'سیرەی پێغەمبەر': 'سيرة النبي', 'نیشانەکراوەکان': 'المفضلة', 'کتێبە کلاسیکییەکان': 'الكتب الكلاسيكية', 'کتێب': 'كتاب',
    '‹ گەڕانەوە': '‹ رجوع', 'بەشەکان': 'الأقسام', 'هەموو': 'الكل', 'گەڕان': 'بحث', 'کوردی': 'الكردية',
    '★ لابردنی نیشانە': '★ إزالة من المفضلة', '☆ نیشانەکردن': '☆ إضافة للمفضلة', 'هیچ نیشانەیەک نییە': 'لا توجد مفضلات', 'هیچ بەشێک نەدۆزرایەوە': 'لم يتم العثور على أقسام', 'کتێب نەدۆزرایەوە': 'الكتاب غير موجود',
    'نووسەر': 'المؤلف', 'قەبارە': 'الحجم', 'وەسف': 'الوصف', 'هێشتا داونەگیراوە': 'لم يُحمَّل بعد', '✓ نیشانەکراو وەک داگیراو': '✓ معلَّم كمُحمَّل',
    '⬇ داگرتن (archive.org)': '⬇ تحميل (archive.org)', '⬇ وەشانی تر': '⬇ طبعة أخرى', 'سڕینەوەی نیشانە': 'إزالة العلامة', '✓ نیشانەی داگیراو': '✓ تعليم كمُحمَّل',
    'دوای داگرتن PDF لە مۆبایل هەڵبگرە. نیشانەکە یادگارییە لەناو ئەپ.': 'بعد التحميل احتفظ بملف PDF في هاتفك. العلامة مجرد تذكير داخل التطبيق.',
    'کرتە لە «داگرتن» → archive.org → PDF داگرە. پاشان «نیشانەی داگیراو». دەتوانیت نیشانە بسڕیتەوە.': 'اضغط «تحميل» ← archive.org ← حمّل ملف PDF. ثم «تعليم كمُحمَّل». يمكنك إزالة العلامة في أي وقت.',
    'سیرەی ئیبن هیشام': 'سيرة ابن هشام', 'ژیاننامەی پێغەمبەر ﷺ': 'السيرة المفصلة للنبي ﷺ', 'پرسیار لە سیرە': 'اسأل عن السيرة', 'ژیاننامەی پێغەمبەر': 'السيرة المفصلة للنبي'
  };
  var AU = { ibn_hisham: 'ابن هشام', rahiq: 'المباركفوري', shamail: 'الترمذي', ibn_kathir: 'ابن كثير', zad: 'ابن القيم', fiqh_sira: 'الغزالي', nur_yaqin: 'الخضري', mukhtasar_rahiq: 'المباركفوري' };
  function bdesc(id) { var a = window.__SEERAH_BOOKS || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i].descAr || ''; return ''; }
  var K = function (s) { return String(s).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; }); };
  function lang() { var l = window.appLang || 'ckb'; return l; }
  function isKu(l) { return l === 'ckb' || l === 'bad' || !l; }
  function chapters() {
    var d = window.__SEERAH_DATA || {}, a = (d.chapters || []).slice();
    [window.__SEERAH_DATA_P2, window.__SEERAH_DATA_P3].forEach(function (x) { if (x && x.chapters) a = a.concat(x.chapters); });
    return a;
  }
  function find(ku) { var l = chapters(); for (var i = 0; i < l.length; i++) if (l[i].ku === ku) return l[i]; return null; }
  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ep() { try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
  var MSG = {
    en: { tr: 'Translating…', fail: 'Translation is unavailable right now. The Arabic text is shown instead.', note: 'AI translation from the Arabic text; it may contain mistakes.', ph: 'Search sections…', sub: function (n) { return 'Biography · ' + n + ' sections · Arabic & English'; }, lib: function (n) { return n + ' books · offline download'; }, books: function (n) { return n + ' books'; }, sec: function (n) { return n + ' sections'; }, saved: function (n, m) { return n + ' books · ' + m + ' marked as downloaded'; } },
    ar: { tr: '', fail: '', note: '', ph: 'ابحث في الأقسام...', sub: function (n) { return 'السيرة · ' + n + ' قسمًا · عربي'; }, lib: function (n) { return n + ' كتبًا · تحميل دون اتصال'; }, books: function (n) { return n + ' كتب'; }, sec: function (n) { return n + ' قسمًا'; }, saved: function (n, m) { return n + ' كتب · ' + m + ' معلَّمة كمُحمَّلة'; } }
  };
  function trKey(id, l) { return 'sr_tr_' + l + '_' + id; }
  function getTr(id, l) { try { return localStorage.getItem(trKey(id, l)) || ''; } catch (e) { return ''; } }
  function setTr(id, l, t) { try { localStorage.setItem(trKey(id, l), t); } catch (e) { try { for (var k in localStorage) if (k.indexOf('sr_tr_') === 0) { localStorage.removeItem(k); break; } localStorage.setItem(trKey(id, l), t); } catch (x) {} } }
  var busy = {};
  function fetchTr(c, l, done) {
    var k = c.id + '|' + l; if (busy[k]) return; busy[k] = 1;
    if (!ep()) { busy[k] = 0; done(false); return; }
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: c.ar_body, lang: l, kind: 'sira' }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !(d.text || d.ku)) throw new Error('x'); return d.text || d.ku; }); })
      .then(function (t) { clearTimeout(to); busy[k] = 0; setTr(c.id, l, t); done(true); })
      .catch(function () { clearTimeout(to); busy[k] = 0; done(false); });
  }
  var inL = false, failed = {}, obs0;
  function localize() {
    var v = document.getElementById('seerahView'); if (!v || inL) return;
    var l = lang(); if (isKu(l)) { return; }
    inL = true; if (obs) obs.disconnect();
    try {
      var ar = l === 'ar', D = ar ? AR : EN, M = ar ? MSG.ar : MSG.en;
      v.setAttribute('data-no-translate', '1'); v.dir = ar ? 'rtl' : 'ltr';
      var w = document.createTreeWalker(v, 4), n, nodes = [];
      while (n = w.nextNode()) nodes.push(n);
      // chapter cards + detail
      var cards = v.querySelectorAll('.sr-card');
      cards.forEach(function (card) {
        var b = card.querySelector('b'); if (!b || card.getAttribute('data-sr-done') === l) return;
        var ch = null, cid = card.getAttribute('data-ch'); if (cid) { var al = chapters(); for (var j = 0; j < al.length; j++) if (al[j].id === cid) ch = al[j]; } else if (card.querySelector('.sr-ar') && window.__SEERAH_STATE && window.__SEERAH_STATE.chapter) ch = window.__SEERAH_STATE.chapter;
        if (ch) {
          card.setAttribute('data-sr-done', l);
          var sm = card.querySelector('small');
          var isDetail = !!card.querySelector('.sr-ar');
          if (ar) { b.textContent = ch.ar; if (sm) sm.style.display = 'none'; }
          else { b.textContent = EN_T[ch.id] || ch.ar; if (sm) sm.textContent = ch.ar; }
          if (!isDetail) { var pv = card.querySelector('div'); if (pv) pv.textContent = ar ? (ch.ar_body || '').slice(0, 90) + '…' : ''; if (pv && !ar) pv.style.display = 'none'; }
          else {
            var ku = card.querySelector('.sr-ku'); var arBox = card.querySelector('.sr-ar');
            if (ar) { if (ku && ku.parentNode) ku.parentNode.style.display = 'none'; }
            else if (ku) {
              var lbl = ku.parentNode.querySelector('.sr-label'); if (lbl) lbl.textContent = ({ en: 'English', tr: 'Türkçe', fa: 'فارسی', ur: 'اردو', fr: 'Français', de: 'Deutsch', id: 'Indonesia', ru: 'Русский', es: 'Español' })[l] || 'English';
              ku.style.direction = (l === 'fa' || l === 'ur') ? 'rtl' : 'ltr'; ku.style.textAlign = ku.style.direction === 'rtl' ? 'right' : 'left';
              var t = getTr(ch.id, l);
              if (t) { ku.textContent = t; var nt = document.createElement('div'); nt.className = 'sr-note'; nt.style.marginTop = '8px'; nt.textContent = M.note; ku.parentNode.appendChild(nt); }
              else if (failed[ch.id + l]) { ku.textContent = M.fail; }
              else {
                ku.textContent = M.tr;
                fetchTr(ch, l, function (ok) { if (!ok) failed[ch.id + l] = 1; card.removeAttribute('data-sr-done'); localize(); });
              }
            }
          }
          return;
        }
        // books
        var bk = null, list = Object.keys(EN_B);
        for (var i = 0; i < list.length; i++) { if (card.getAttribute('data-book') === list[i]) bk = list[i]; }
        if (bk) {
          card.setAttribute('data-sr-done', l);
          var sm2 = card.querySelector('small'); var ar0 = sm2 ? sm2.textContent : '';
          if (ar) { b.textContent = ar0; if (sm2) sm2.style.display = 'none'; }
          else { b.textContent = EN_B[bk][0]; }
          var kus = card.querySelectorAll('.sr-ku');
          if (kus.length) { // detail
            if (kus[0]) kus[0].textContent = ar ? AU[bk] : EN_B[bk][1];
            if (!ar && kus[2]) kus[2].textContent = EN_B[bk][2];
            if (ar) { var dr = card.querySelector('.sr-ar'); if (kus[2]) kus[2].textContent = bdesc(bk); if (dr) dr.style.display = 'none'; }
            if (kus[1]) kus[1].textContent = K(kus[1].textContent).replace('~', '~').replace(/\s*مێگابایت/, ar ? ' م.ب' : ' MB');
          } else {
            var ds = card.querySelectorAll('div');
            if (ds[0]) { ds[0].textContent = (ar ? AU[bk] : EN_B[bk][1]) + ' · ' + K(ds[0].textContent.split(' · ').pop()).replace(/\s*مێگابایت/, ar ? ' م.ب' : ' MB'); }
            if (ds[1]) ds[1].textContent = ar ? bdesc(bk) : EN_B[bk][2];
          }
        }
      });
      // periods chips
      v.querySelectorAll('.sr-chip').forEach(function (c) {
        var p = c.getAttribute('data-period'); if (!p || p === 'all') return;
        var pk = null; var pd = (window.__SEERAH_DATA && window.__SEERAH_DATA.periods) || [];
        pd.forEach(function (x) { if (x.id === p) pk = x; });
        c.textContent = ar ? (pk ? pk.ar : c.textContent) : (EN_P[p] || (pk && pk.ar) || c.textContent);
      });
      var S = window.__SEERAH_STATE || {}, h2 = v.querySelector('.sr-head h2');
      if (h2) {
        var base = null;
        if (S.view === 'detail' && S.chapter) base = ar ? S.chapter.ar : (EN_T[S.chapter.id] || S.chapter.ar);
        else if (S.view === 'book' && S.bookId && EN_B[S.bookId]) base = ar ? (function () { var a = window.__SEERAH_BOOKS || []; for (var i = 0; i < a.length; i++) if (a[i].id === S.bookId) return a[i].ar; return ''; })() : EN_B[S.bookId][0];
        if (base) h2.textContent = '☪ ' + base;
      }
      if (S.view === 'book' && S.bookId && EN_B[S.bookId]) {
        var bc = v.querySelector('.sr-card:not([data-book])'), bid = S.bookId;
        if (bc && bc.getAttribute('data-sr-done') !== l) {
          bc.setAttribute('data-sr-done', l);
          var bb = bc.querySelector('b'), sm3 = bc.querySelector('small');
          if (bb) bb.textContent = ar ? (sm3 ? sm3.textContent : '') : EN_B[bid][0];
          if (ar && sm3) sm3.style.display = 'none';
          var kk = bc.querySelectorAll('.sr-ku');
          if (kk[0]) kk[0].textContent = ar ? AU[bid] : EN_B[bid][1];
          if (kk[1]) kk[1].textContent = K(kk[1].textContent).replace(/\s*مێگابایت/, ar ? ' م.ب' : ' MB');
          if (kk[2]) kk[2].textContent = ar ? bdesc(bid) : EN_B[bid][2];
          var dr2 = bc.querySelector('.sr-ar'); if (ar && dr2) dr2.style.display = 'none';
        }
      }
      var gl = v.querySelector('[data-act=gotoLib] small'); if (gl) { var bn = (window.__SEERAH_BOOKS || []).length; gl.textContent = M.books(bn); }
      // plain nodes
      nodes.forEach(function (t) {
        var s = t.nodeValue, tr = s.trim(); if (!tr || !/[ء-ۿ]/.test(tr)) return;
        if (D[tr] != null) { t.nodeValue = s.replace(tr, D[tr]); return; }
        var pre = (tr.match(/^[^\u0600-\u06ff]+/) || [''])[0], core = tr.slice(pre.length);
        if (pre && D[core] != null) { t.nodeValue = s.replace(tr, pre + D[core]); return; }
        var m;
        if ((m = tr.match(/^([٠-٩0-9]+) کتێب · ([٠-٩0-9]+) نیشانەکراو وەک داگیراو$/))) { t.nodeValue = M.saved(K(m[1]), K(m[2])); return; }
        if ((m = tr.match(/^ژیاننامە · ([٠-٩0-9]+) بەش · کوردی و عەرەبی$/))) { t.nodeValue = M.sub(K(m[1])); return; }
        if ((m = tr.match(/^([٠-٩0-9]+) کتێب · داگرتنی ئۆفلاین$/))) { t.nodeValue = M.lib(K(m[1])); return; }
        if ((m = tr.match(/^([٠-٩0-9]+) کتێب$/))) { t.nodeValue = M.books(K(m[1])); return; }
        if ((m = tr.match(/^([٠-٩0-9]+) بەش$/))) { t.nodeValue = M.sec(K(m[1])); return; }
        if ((m = tr.match(/^([٠-٩0-9]+) بەش · بە درێژی$/))) { t.nodeValue = ar ? K(m[1]) + ' قسمًا · مفصّلة' : K(m[1]) + ' parts · in detail'; return; }
        if ((m = tr.match(/^([٠-٩0-9]+) لاپەڕە$/))) { t.nodeValue = ar ? K(m[1]) + ' صفحة' : K(m[1]) + ' pages'; return; }
      });
      var q = v.querySelector('#srQ'); if (q) q.placeholder = M.ph;
      v.querySelectorAll('.sr-sub').forEach(function () {});
    } catch (e) { try { console.warn('seerah-i18n', e); } catch (x) {} }
    inL = false; if (obs) obs.observe(v, { childList: true, subtree: true });
  }
  var obs = null;
  function watch() {
    var v = document.getElementById('seerahView'); if (!v) return false;
    if (obs) obs.disconnect();
    obs = new MutationObserver(function () { if (inL) return; localize(); });
    obs.observe(v, { childList: true, subtree: true });
    localize(); return true;
  }
  window.__srLocalize = localize;
  var tries = 0, iv = setInterval(function () { if (watch() || ++tries > 80) clearInterval(iv); }, 250);
  document.addEventListener('click', function () { setTimeout(function () { if (!obs) watch(); }, 100); }, true);
  var ws = window.setAppLanguage;
  if (typeof ws === 'function' && !ws.__sr) {
    var nw = function (c) { var r = ws.apply(this, arguments); setTimeout(function () { var v = document.getElementById('seerahView'); if (v && v.classList.contains('active') && typeof window.enterSeerah === 'function') { failed = {}; window.enterSeerah(); } }, 50); return r; };
    nw.__sr = 1; window.setAppLanguage = nw;
  }
})();
