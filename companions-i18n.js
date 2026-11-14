/* companions-i18n.js v1 — سیرەی هاوەڵان بەپێی زمان (en/ar + tr/fa/ur/fr/de/id/ru/es بە وەرگێڕانی کاشکراو) */
(function () {
  if (window.__cpI18n) return; window.__cpI18n = true;
  var NM = { abu_bakr: 'Abu Bakr al-Siddiq', umar: 'Umar ibn al-Khattab', uthman: 'Uthman ibn Affan', ali: 'Ali ibn Abi Talib', zubayr: 'al-Zubayr ibn al-Awwam', talha: 'Talha ibn Ubaydullah', abdulrahman: 'Abd al-Rahman ibn Awf', saad: 'Sa\'d ibn Abi Waqqas', said_zayd: 'Sa\'id ibn Zayd', abu_ubaida: 'Abu Ubayda ibn al-Jarrah', bilal_c: 'Bilal ibn Rabah', salman: 'Salman al-Farisi', abu_hurayra: 'Abu Hurayra', musab: 'Mus\'ab ibn Umayr', saad_muadh: 'Sa\'d ibn Mu\'adh', saad_ubada: 'Sa\'d ibn Ubada', aisha: 'Aisha bint Abi Bakr', fatima: 'Fatima bint Rasulullah', khadija_c: 'Khadija bint Khuwaylid', sumayya_c: 'Sumayya bint Khayyat', hamza: 'Hamza ibn Abd al-Muttalib', jafar: 'Ja\'far ibn Abi Talib', khalid: 'Khalid ibn al-Walid', ibn_masud: 'Abdullah ibn Mas\'ud', ammar: 'Ammar ibn Yasir', abu_dharr: 'Abu Dharr al-Ghifari', uthman_mazun: 'Uthman ibn Maz\'un', suhayb: 'Suhayb al-Rumi', khabbab: 'Khabbab ibn al-Aratt', miqdad: 'al-Miqdad ibn al-Aswad', zayd_haritha: 'Zayd ibn Haritha', usama: 'Usama ibn Zayd', ibn_umar: 'Abdullah ibn Umar', ibn_abbas: 'Abdullah ibn Abbas', abu_ayyub: 'Abu Ayyub al-Ansari', muadh: 'Mu\'adh ibn Jabal', ubayy: 'Ubayy ibn Ka\'b', zayd_thabit: 'Zayd ibn Thabit', anas: 'Anas ibn Malik', abu_talha: 'Abu Talha al-Ansari', hassan: 'Hassan ibn Thabit', abdullah_rawaha: 'Abdullah ibn Rawaha', usayd: 'Usayd ibn Hudayr', ubada: 'Ubada ibn al-Samit' };
  var PER = { khulafa: 'The Rightly-Guided Caliphs', ashara: 'The Ten Promised Paradise', muhajir: 'The Emigrants (Muhajirun)', ansar: 'The Helpers (Ansar)', women: 'Women Companions', other: 'Other Companions' };
  var U = { 'سیرەی هاوەڵان': 'Companions of the Prophet', 'نیشانەکراوەکان': 'Bookmarks', '‹ گەڕانەوە': '‹ Back', 'بەشەکان': 'Sections', 'هەموو': 'All', 'گەڕان': 'Search', 'کوردی': 'Kurdish', '★ لابردنی نیشانە': '★ Remove bookmark', '☆ نیشانەکردن': '☆ Bookmark', 'هیچ نیشانەیەک نییە': 'No bookmarks', 'هیچ کەسێک نەدۆزرایەوە': 'Nobody found', 'هاوەڵانی پێغەمبەر': 'Companions of the Prophet', 'پرسیار لە هاوەڵان (AI)': 'Ask about the Companions (AI)', 'ناوی هەر هاوەڵێک بنووسە، وەڵامی درێژ بە سەرچاوەوە': 'Type any Companion\'s name for a detailed answer with sources', 'پرسیار و وەڵام (پێشبڕکێ)': 'Quiz (competition)', 'هەڵبژاردن، خاڵ، زنجیرە و کاتژمێر': 'Multiple choice, points, streaks and a timer' };
  var MT = { tr: 'Translating…', fail: 'Translation is unavailable right now. The Arabic text is shown instead.', note: 'AI translation from the Arabic text; it may contain mistakes.', ph: 'Search companions…', sub: 'Companions of the Prophet · {0} people · Arabic & English', cnt: '{0} companions', rd: '(may Allah be pleased with him)', rdf: '(may Allah be pleased with her)' };
  var UA = { 'سیرەی هاوەڵان': 'سيرة الصحابة', 'نیشانەکراوەکان': 'المفضلة', '‹ گەڕانەوە': '‹ رجوع', 'بەشەکان': 'الأقسام', 'هەموو': 'الكل', 'گەڕان': 'بحث', 'کوردی': 'الكردية', '★ لابردنی نیشانە': '★ إزالة من المفضلة', '☆ نیشانەکردن': '☆ إضافة للمفضلة', 'هیچ نیشانەیەک نییە': 'لا توجد مفضلات', 'هیچ کەسێک نەدۆزرایەوە': 'لم يُعثر على أحد', 'هاوەڵانی پێغەمبەر': 'أصحاب النبي ﷺ', 'پرسیار لە هاوەڵان (AI)': 'اسأل عن الصحابة (ذكاء اصطناعي)', 'ناوی هەر هاوەڵێک بنووسە، وەڵامی درێژ بە سەرچاوەوە': 'اكتب اسم أي صحابي لإجابة مفصلة مع المصادر', 'پرسیار و وەڵام (پێشبڕکێ)': 'أسئلة وأجوبة (مسابقة)', 'هەڵبژاردن، خاڵ، زنجیرە و کاتژمێر': 'اختيار من متعدد ونقاط وسلسلة ومؤقّت' };
  var MA = { ph: 'ابحث في الصحابة...', sub: function (n) { return 'أصحاب النبي · ' + n + ' صحابيًا · عربي'; }, cnt: function (n) { return n + ' صحابيًا'; } };
  var O = { N: NM, P: PER, U: U, M: MT }, X = O, WL = { tr: 1, fa: 1, ur: 1, fr: 1, de: 1, id: 1, ru: 1, es: 1 }, busyUi = {}, failUi = {};
  function lang() { return window.appLang || 'ckb'; }
  function isKu(l) { return !l || l === 'ckb' || l === 'bad'; }
  function K(s) { return String(s).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 1632; }); }
  function ep() { try { return String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
  function walk(o, f) { if (typeof o === 'string') return f(o); var r = {}; for (var k in o) r[k] = walk(o[k], f); return r; }
  function useLang(l) {
    X = O;
    if (l !== 'ar' && WL[l]) {
      var arr = null; try { arr = JSON.parse(localStorage.getItem('cp_ui_' + l)); } catch (e) {}
      var n = 0; walk(O, function (s) { n++; return s; });
      if (arr && arr.length === n) { var i = 0; X = walk(O, function () { return arr[i++]; }); } else fetchUi(l);
    }
  }
  function fetchUi(l) {
    if (busyUi[l] || failUi[l] || !ep()) return; busyUi[l] = 1;
    var lines = []; walk(O, function (s) { lines.push(s); return s; });
    var bs = [], cur = [], len = 0; lines.forEach(function (s) { if (len + s.length > 2800) { bs.push(cur); cur = []; len = 0; } cur.push(s); len += s.length + 1; }); if (cur.length) bs.push(cur);
    var out = [], bi = 0;
    (function next() {
      if (bi >= bs.length) { busyUi[l] = 0; try { localStorage.setItem('cp_ui_' + l, JSON.stringify(out)); } catch (e) {} var v = document.getElementById('companionsView'); if (v && v.classList.contains('active') && lang() === l && window.enterCompanions) window.enterCompanions(); return; }
      var bt = bs[bi];
      fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: bt.join('\n'), lang: l, kind: 'lines' }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok || !(d.text || d.ku)) throw 1; return String(d.text || d.ku).split('\n'); }); })
        .then(function (ls) { if (ls.length !== bt.length) throw 1; out = out.concat(ls.map(function (x) { return x.trim(); })); bi++; next(); })
        .catch(function () { busyUi[l] = 0; failUi[l] = 1; });
    })();
  }
  function all() { return (window.__COMPANIONS_DATA || {}).chapters || []; }
  function byId(id) { var a = all(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function name(c, l) { if (l === 'ar') return c.ar; var n = X.N[c.id]; if (!n) return c.ar; var fem = /رضي الله عنها/.test(c.ar); return n + ' ' + (fem ? X.M.rdf : X.M.rd); }
  function tk(id, l) { return 'cp_tr_' + l + '_' + id; }
  function getTr(id, l) { try { var v = localStorage.getItem(tk(id, l)) || ''; if (v && /[ەڵێڕۆ]/.test(v)) { localStorage.removeItem(tk(id, l)); return ''; } return v; } catch (e) { return ''; } }
  var busy = {}, failed = {}, inL = false, obs = null;
  function fetchTr(c, l, done) {
    var k = c.id + l; if (busy[k] || !ep()) { if (!ep()) done(false); return; } busy[k] = 1;
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    fetch(ep() + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ar: c.ar_body, lang: l, kind: 'sira' }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !(d.text || d.ku)) throw 1; return d.text || d.ku; }); })
      .then(function (t) { clearTimeout(to); busy[k] = 0; if (/[ەڵێڕۆ]/.test(t)) return done(false); try { localStorage.setItem(tk(c.id, l), t); } catch (e) {} done(true); })
      .catch(function () { clearTimeout(to); busy[k] = 0; done(false); });
  }
  function localize() {
    var v = document.getElementById('companionsView'); if (!v || inL) return; var l = lang(); if (isKu(l)) return;
    inL = true; if (obs) obs.disconnect();
    try {
      useLang(l); var ar = l === 'ar', D = ar ? UA : X.U, S = window.__COMP_STATE || {}, rtl = ar || l === 'fa' || l === 'ur';
      v.dir = rtl ? 'rtl' : 'ltr';
      var n0 = all().length;
      v.querySelectorAll('.cp-card').forEach(function (card) {
        var b = card.querySelector('b'), sm = card.querySelector('small'); if (!b || card.getAttribute('data-cp') === l) return;
        var c = card.getAttribute('data-ch') ? byId(card.getAttribute('data-ch')) : (card.querySelector('.cp-ar') ? S.chapter : null); if (!c) return;
        card.setAttribute('data-cp', l); b.textContent = name(c, l); if (sm) { if (ar) sm.style.display = 'none'; else sm.textContent = c.ar; }
        var pv = card.querySelector(':scope > div[style*="font-size:12px"]'); if (pv) { if (ar) pv.textContent = (c.ar_body || '').slice(0, 90) + '…'; else pv.style.display = 'none'; }
        var ku = card.querySelector('.cp-ku');
        if (ku) {
          if (ar) { ku.parentNode.style.display = 'none'; var a0 = card.querySelector('.cp-ar'); if (a0) { var lb = a0.querySelector('.cp-label'); if (lb) lb.style.display = 'none'; } }
          else {
            var lb2 = ku.parentNode.querySelector('.cp-label'); if (lb2) lb2.textContent = ({ en: 'English', tr: 'Türkçe', fa: 'فارسی', ur: 'اردو', fr: 'Français', de: 'Deutsch', id: 'Indonesia', ru: 'Русский', es: 'Español' })[l] || 'English';
            ku.style.direction = rtl ? 'rtl' : 'ltr'; ku.style.textAlign = rtl ? 'right' : 'left';
            var t = getTr(c.id, l);
            if (t) { ku.textContent = t; var nt = document.createElement('div'); nt.style.cssText = 'font-size:11px;color:#5a7a6a;margin-top:8px'; nt.textContent = X.M.note; ku.parentNode.appendChild(nt); }
            else if (failed[c.id + l]) ku.textContent = X.M.fail;
            else { ku.textContent = X.M.tr; fetchTr(c, l, function (ok) { if (!ok) failed[c.id + l] = 1; card.removeAttribute('data-cp'); localize(); }); }
          }
        }
      });
      v.querySelectorAll('.cp-chip').forEach(function (c) {
        var p = c.getAttribute('data-period'); if (!p || p === 'all') return;
        var pd = (window.__COMPANIONS_DATA || {}).periods || [], pk = null; pd.forEach(function (x) { if (x.id === p) pk = x; });
        c.textContent = ar ? (pk ? pk.ar : c.textContent) : (X.P[p] || (pk && pk.ar) || c.textContent);
      });
      var h2 = v.querySelector('.cp-head h2');
      if (h2 && S.view === 'detail' && S.chapter) h2.textContent = '☪ ' + name(S.chapter, l);
      var ph = v.querySelector('#cpQ'); if (ph) ph.placeholder = ar ? MA.ph : X.M.ph;
      var w = document.createTreeWalker(v, 4), nd, nodes = []; while (nd = w.nextNode()) nodes.push(nd);
      nodes.forEach(function (t) {
        var s = t.nodeValue, tr = s.trim(); if (!tr || !/[ء-ۿ]/.test(tr)) return;
        var pre = (tr.match(/^[^؀-ۿ]+/) || [''])[0], core = tr.slice(pre.length), m;
        if (D[tr] != null) { t.nodeValue = s.replace(tr, D[tr]); return; }
        if (pre && D[core] != null) { t.nodeValue = s.replace(tr, pre + D[core]); return; }
        if ((m = tr.match(/^هاوەڵانی پێغەمبەر · ([٠-٩0-9]+) کەس · کوردی و عەرەبی$/))) { t.nodeValue = ar ? MA.sub(K(m[1])) : X.M.sub.replace('{0}', K(m[1])); return; }
        if ((m = tr.match(/^([٠-٩0-9]+) هاوەڵ$/))) { t.nodeValue = ar ? MA.cnt(K(m[1])) : X.M.cnt.replace('{0}', K(m[1])); return; }
      });
    } catch (e) { try { console.warn('cp-i18n', e); } catch (x) {} }
    inL = false; if (obs) obs.observe(document.getElementById('companionsView'), { childList: true, subtree: true });
  }
  function watch() { var v = document.getElementById('companionsView'); if (!v) return false; if (obs) obs.disconnect(); obs = new MutationObserver(function () { if (!inL) localize(); }); obs.observe(v, { childList: true, subtree: true }); localize(); return true; }
  var tries = 0, iv = setInterval(function () { if (watch() || ++tries > 80) clearInterval(iv); }, 250);
  document.addEventListener('click', function () { setTimeout(function () { if (!obs) watch(); }, 100); }, true);
  var ws = window.setAppLanguage;
  if (typeof ws === 'function' && !ws.__cp) { var nw = function () { var r = ws.apply(this, arguments); setTimeout(function () { var v = document.getElementById('companionsView'); failed = {}; if (v && v.classList.contains('active') && window.enterCompanions) window.enterCompanions(); }, 80); return r; }; nw.__cp = 1; window.setAppLanguage = nw; }
  // start-screen card
  function card() {
    var l = lang(); var b = document.querySelector('.companions-choice'); if (!b) return;
    if (isKu(l)) return; useLang(l); var ar = l === 'ar';
    var bb = b.querySelector('b'), sm = b.querySelector('small');
    if (bb) bb.textContent = ar ? UA['سیرەی هاوەڵان'] : X.U['سیرەی هاوەڵان'];
    if (sm) sm.textContent = ar ? 'الخلفاء · العشرة · الأنصار · الصحابيات' : (X.P.khulafa + ' · ' + X.P.ansar + ' · ' + X.P.women);
  }
  setInterval(card, 1500);
})();
