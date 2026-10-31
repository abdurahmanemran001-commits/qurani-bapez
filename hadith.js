/* hadith.js v5 — Arabic + English + Gemini Kurdish translation */
(function () {
  if (window.__hadithV5) return;
  window.__hadithV5 = true;

  var BM_KEY = 'hadith_bm_v1';
  var TR_KEY = 'hadith_ku_tr_v2';
  var books = [
    { id: 'nawawi', name: 'الأربعون النووية', nameKu: 'چل حەدیسی نەوەوی', size: 'بچووک', eng: 'eng-nawawi' },
    { id: 'qudsi', name: 'الأحاديث القدسية', nameKu: 'حەدیسی قودسی', size: 'بچووک', eng: null },
    { id: 'bukhari', name: 'صحيح البخاري', nameKu: 'سەحیحی بوخاری', size: 'گەورە', eng: 'eng-bukhari' },
    { id: 'muslim', name: 'صحيح مسلم', nameKu: 'سەحیحی موسڵیم', size: 'گەورە', eng: 'eng-muslim' },
    { id: 'abudawud', name: 'سنن أبي داود', nameKu: 'سونەنی ئەبووداوود', size: 'گەورە', eng: 'eng-abudawud' },
    { id: 'tirmidhi', name: 'جامع الترمذي', nameKu: 'جامعی تیرمیزی', size: 'گەورە', eng: 'eng-tirmidhi' },
    { id: 'nasai', name: 'سنن النسائي', nameKu: 'سونەنی نەسائی', size: 'گەورە', eng: 'eng-nasai' },
    { id: 'ibnmajah', name: 'سنن ابن ماجه', nameKu: 'سونەنی ئیبن ماجە', size: 'گەورە', eng: 'eng-ibnmajah' }
  ];

  var topics = [
    { id: 'niyyah', ku: 'نییەت', ar: ['نية', 'النيات', 'إنما الأعمال'] },
    { id: 'salah', ku: 'نوێژ', ar: ['صلاة', 'الصلاة', 'ركعة', 'سجود'] },
    { id: 'wudu', ku: 'ووزو و پاکی', ar: ['وضوء', 'طهارة', 'غسل'] },
    { id: 'sawm', ku: 'ڕۆژوو', ar: ['صوم', 'الصيام', 'رمضان'] },
    { id: 'zakat', ku: 'زەکات و سەدەقە', ar: ['زكاة', 'صدقة'] },
    { id: 'hajj', ku: 'حەج و عومرە', ar: ['حج', 'عمرة'] },
    { id: 'akhlaq', ku: 'ئەخلاق', ar: ['خلق', 'حسن الخلق', 'أدب'] },
    { id: 'parents', ku: 'دایک و باوک', ar: ['والدين', 'الوالدين', 'بر'] },
    { id: 'neighbor', ku: 'دراوسێ', ar: ['جار', 'الجار'] },
    { id: 'truth', ku: 'ڕاستگۆیی', ar: ['صدق', 'الكذب'] },
    { id: 'anger', ku: 'تووڕەیی', ar: ['غضب'] },
    { id: 'patience', ku: 'سەبر', ar: ['صبر'] },
    { id: 'dhikr', ku: 'زیکر و دوعا', ar: ['ذكر', 'دعاء', 'استغفار'] },
    { id: 'quran', ku: 'قورئان', ar: ['قرآن', 'القرآن'] },
    { id: 'iman', ku: 'ئیمان', ar: ['إيمان', 'الإيمان'] },
    { id: 'death', ku: 'مردن و قیامەت', ar: ['موت', 'القبر', 'القيامة'] }
  ];

  var state = {
    view: 'home', book: null, topic: null, list: [], query: '',
    detail: null, cache: {}, engCache: {}, loading: false, translating: false
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
    else arr.unshift({ id: item.id, book: item.book, n: item.n, ar: (item.ar || '').slice(0, 200), grade: item.grade || '', label: item.label, en: item.en || '', ku: item.ku || '' });
    saveBm(arr);
  }
  function trCache() {
    try { return JSON.parse(localStorage.getItem(TR_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveTr(id, ku) {
    var c = trCache(); c[id] = ku;
    try { localStorage.setItem(TR_KEY, JSON.stringify(c)); } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

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
      '#hadithView .hd-card{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-align:right}',
      '#hadithView .hd-card:active{background:#fbf5e7}',
      '#hadithView .hd-card b{display:block;font-size:15px;color:#3d2a14;margin-bottom:4px}',
      '#hadithView .hd-card small{color:#8a6a24;font-size:12px}',
      '#hadithView .hd-ar{font-family:serif;font-size:18px;line-height:2;text-align:right;color:#1a2e24;direction:rtl}',
      '#hadithView .hd-en{font-size:14px;line-height:1.7;color:#3d4a42;margin-top:10px;padding-top:10px;border-top:1px dashed #e4d5ad;text-align:left;direction:ltr}',
      '#hadithView .hd-ku{font-size:15px;line-height:1.9;color:#1a2e24;margin-top:10px;padding-top:10px;border-top:1px dashed #e4d5ad;text-align:right;direction:rtl;background:#fbf8f0;border-radius:10px;padding:10px}',
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

  function loadBook(id) {
    if (state.cache[id]) return Promise.resolve(state.cache[id]);
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
          ar: row[1] || '', grade: row[2] || '', en: '', ku: ''
        };
      });
      state.cache[id] = list;
      return loadEnglish(id, list).then(function () {
        state.loading = false;
        return state.cache[id];
      });
    }).catch(function (e) {
      state.loading = false;
      alert('بارکردن سەرنەکەوت: ' + (e.message || e));
      return [];
    });
  }

  function loadEnglish(bookId, list) {
    var meta = books.find(function (b) { return b.id === bookId; });
    if (!meta || !meta.eng) return Promise.resolve();
    if (state.engCache[bookId]) {
      applyEng(list, state.engCache[bookId]);
      return Promise.resolve();
    }
    var url = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/' + meta.eng + '.json';
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.hadiths) return;
      var map = {};
      d.hadiths.forEach(function (h) {
        var n = h.hadithnumber || h.arabicnumber;
        if (n != null) map[String(n)] = h.text || '';
      });
      state.engCache[bookId] = map;
      applyEng(list, map);
    }).catch(function () {});
  }

  function applyEng(list, map) {
    list.forEach(function (item) {
      var en = map[String(item.n)];
      if (en) item.en = en;
      var ku = trCache()[item.id];
      if (ku) item.ku = ku;
    });
  }

  function getGeminiKey() {
    try {
      var h = (localStorage.getItem('hadith_gemini_key') || '').trim();
      if (h.indexOf('AIza') === 0) return h;
      var c = JSON.parse(localStorage.getItem('ai_shari_cfg_v1') || '{}');
      if (c && c.apiKey && String(c.apiKey).indexOf('AIza') === 0) return String(c.apiKey).trim();
    } catch (e) {}
    return '';
  }

  function translateToKu(item) {
    if (!item || !item.ar) return Promise.reject(new Error('دەق نییە'));
    if (item.ku) return Promise.resolve(item.ku);
    var cached = trCache()[item.id];
    if (cached) { item.ku = cached; return Promise.resolve(cached); }

    var key = getGeminiKey();
    if (!key) {
      return Promise.reject(new Error('کلیلی Gemini پێویستە. لە سەرەوەی بەشی حەدیس کلیلی AIza... دابنێ'));
    }

    var model = 'gemini-2.0-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);

    var prompt =
      'ئەرکت: تەنها وەرگێڕانی کوردی سۆرانی بۆ ئەم حەدیسە عەرەبییە.\n' +
      'ڕێساکان:\n' +
      '1) تەنها وەرگێڕان بنووسە، هیچ ڕوونکردنەوە و پێشەکییەک مەنووسە.\n' +
      '2) مانای حەدیسەکە وەک خۆی بپارێزە؛ شتێکی تر مەهێنە.\n' +
      '3) ناوە پیرۆزەکان وەک «خوا» / «پێغەمبەر ﷺ» بەکاربهێنە.\n' +
      '4) ئەگەر زنجیرەی گێڕانەوە هەیە، کورت و ڕوونی بکەرەوە.\n\n' +
      'حەدیسی عەرەبی:\n' + item.ar +
      (item.en ? '\n\nEnglish (for clarity):\n' + item.en : '');

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
      })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error && data.error.message) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        var parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
        var t = parts && parts.map(function (p) { return p.text || ''; }).join('');
        if (!t || !t.trim()) throw new Error('وەرگێڕان بەتاڵ بوو');
        t = t.trim();
        item.ku = t;
        saveTr(item.id, t);
        return t;
      });
    });
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
      var t = h.ar + ' ' + (h.en || '') + ' ' + (h.ku || '') + ' ' + (h.n || '');
      for (var i = 0; i < parts.length; i++) if (t.indexOf(parts[i]) < 0) return false;
      return true;
    });
  }

  function title() {
    if (state.view === 'detail') return 'حەدیس';
    if (state.view === 'bookmarks') return 'نیشانەکراوەکان';
    if (state.view === 'book' && state.book) {
      var b = books.find(function (x) { return x.id === state.book; });
      return b ? b.nameKu : state.book;
    }
    if (state.view === 'topic' && state.topic) return state.topic.ku;
    return 'حەدیسی پەیامبەر ﷺ';
  }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var head =
      '<div class="hd-head"><div><h2>📖 ' + esc(title()) + '</h2><div class="hd-sub">عەرەبی · ئینگلیزی · وەرگێڕان بە Gemini</div></div>' +
      '<div style="display:flex;gap:6px">' +
      (state.view !== 'home' ? '<button type="button" class="hd-btn" data-act="back">‹ گەڕانەوە</button>' : '') +
      '<button type="button" class="hd-btn" data-act="bm">★</button>' +
      '<button type="button" class="hd-btn" data-act="home">بەشەکان</button></div></div>';

    var body = '<div class="hd-body">';

    if (state.loading) {
      body += '<div class="hd-loading">… بارکردن</div></div>';
      v.innerHTML = head + body;
      return;
    }

    if (state.view === 'home') {
      body += '<div class="hd-search"><input id="hdQ" placeholder="گەڕان..." value="' + esc(state.query) + '"><button type="button" data-act="searchGo">گەڕان</button></div>';
      body += '<div class="hd-card" style="cursor:default;margin-bottom:12px">' +
        '<div class="hd-label">وەرگێڕانی کوردی (Gemini)</div>' +
        (getGeminiKey()
          ? '<small style="color:#2a6b45">✓ کلیلی Gemini ئامادەیە — لەناو حەدیس دوگمەی وەرگێڕان بەکاربهێنە</small>'
          : '<small style="color:#8a6a24">کلیلی AIza... لە aistudio.google.com دابنێ</small>') +
        '<input id="hdGeminiKey" type="password" placeholder="AIza..." value="" style="width:100%;box-sizing:border-box;margin-top:8px;padding:10px;border:1px solid #e4d5ad;border-radius:10px;font-size:14px">' +
        '<div class="hd-actions" style="margin-top:8px"><button type="button" class="primary" data-act="saveKey">پاشەکەوتکردنی کلیلی</button></div></div>';
      body += '<div style="font-size:13px;color:#8a6a24;margin-bottom:8px;font-weight:700">بابەتەکان</div><div class="hd-chips">';
      topics.forEach(function (t) {
        body += '<button type="button" class="hd-chip" data-topic="' + t.id + '">' + esc(t.ku) + '</button>';
      });
      body += '</div>';
      body += '<div style="font-size:13px;color:#8a6a24;margin:12px 0 8px;font-weight:700">کتێبەکان</div>';
      books.forEach(function (b) {
        body += '<div class="hd-card" data-book="' + b.id + '"><b>' + esc(b.nameKu) + '</b><small>' + esc(b.name) + (b.eng ? ' · +ئینگلیزی' : '') + ' · ' + esc(b.size) + '</small></div>';
      });
      body += '<div class="hd-card" data-act="bm" style="border-style:dashed"><b>★ نیشانەکراوەکان</b><small>' + bookmarks().length + ' حەدیس</small></div>';
    } else if (state.view === 'detail' && state.detail) {
      var d = state.detail;
      body += '<div class="hd-card" style="cursor:default">';
      body += '<div class="hd-label">عەرەبی</div><div class="hd-ar">' + esc(d.ar) + '</div>';
      if (d.en) body += '<div class="hd-en"><div class="hd-label">English</div>' + esc(d.en) + '</div>';
      if (d.ku) body += '<div class="hd-ku"><div class="hd-label">کوردی (Gemini)</div>' + esc(d.ku) + '</div>';
      else if (state.translating) body += '<div class="hd-ku"><div class="hd-label">کوردی</div>… وەرگێڕان بە Gemini</div>';
      body += '<div class="hd-meta"><span>' + esc(d.label) + ' · ژمارە ' + esc(String(d.n)) + '</span>';
      if (d.grade) body += '<span>' + esc(d.grade) + '</span>';
      body += '</div>';
      body += '<div class="hd-actions">';
      if (!d.ku) body += '<button type="button" class="primary" data-act="translateKu">وەرگێڕان بۆ کوردی (Gemini)</button>';
      body += '<button type="button" data-act="toggleBm">' + (isBm(d.id) ? '★ لابردنی نیشانە' : '☆ نیشانەکردن') + '</button>';
      body += '<button type="button" data-act="share">هاوبەشکردن</button>';
      body += '</div></div>';
      body += '<div class="hd-empty" style="font-size:12px">⚠️ وەرگێڕانی AI جێگەی وەرگێڕانی زانایان ناگرێتەوە.</div>';
    } else if (state.view === 'bookmarks') {
      var bm = bookmarks();
      if (!bm.length) body += '<div class="hd-empty">هیچ نیشانەیەک نییە</div>';
      bm.forEach(function (h) {
        body += '<div class="hd-card" data-detail-id="' + esc(h.id) + '"><div class="hd-ar" style="font-size:16px">' + esc(h.ar) + (h.ar && h.ar.length >= 200 ? '…' : '') + '</div>';
        if (h.ku) body += '<div class="hd-ku" style="font-size:13px;margin-top:6px">' + esc(h.ku.slice(0, 120)) + (h.ku.length > 120 ? '…' : '') + '</div>';
        body += '<div class="hd-meta"><span>' + esc(h.label || h.book) + ' · ' + esc(String(h.n)) + '</span></div></div>';
      });
    } else {
      body += '<div class="hd-search"><input id="hdQ" placeholder="گەڕان..." value="' + esc(state.query) + '"><button type="button" data-act="searchGo">گەڕان</button></div>';
      var list = state.list || [];
      if (state.query) list = filterSearch(list, state.query);
      body += '<div style="font-size:12px;color:#8a6a24;margin-bottom:8px">' + list.length + ' حەدیس</div>';
      if (!list.length) body += '<div class="hd-empty">هیچ ئەنجامێک نەدۆزرایەوە</div>';
      var max = Math.min(list.length, 80);
      for (var i = 0; i < max; i++) {
        var h = list[i];
        var preview = h.ar.length > 140 ? h.ar.slice(0, 140) + '…' : h.ar;
        body += '<div class="hd-card" data-idx="' + i + '"><div class="hd-ar" style="font-size:16px">' + esc(preview) + '</div>';
        if (h.en) body += '<div class="hd-en" style="font-size:12px;border:0;padding-top:4px;margin-top:4px">' + esc(h.en.length > 100 ? h.en.slice(0, 100) + '…' : h.en) + '</div>';
        body += '<div class="hd-meta"><span>ژمارە ' + esc(String(h.n)) + (h.grade ? ' · ' + esc(h.grade) : '') + '</span>' + (isBm(h.id) ? '<span>★</span>' : '') + '</div></div>';
      }
      if (list.length > max) body += '<div class="hd-empty">تەنها ' + max + 'ی یەکەم — گەڕان بەکاربهێنە</div>';
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
    state.topic = topic; state.query = ''; state.view = 'topic';
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
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
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
        openBook('nawawi');
        setTimeout(function () { state.query = inp ? inp.value.trim() : state.query; render(); }, 200);
        return;
      }
      render(); return;
    }
    if (act === 'saveKey') {
      var inpK = $('hdGeminiKey');
      var k = inpK ? (inpK.value || '').trim() : '';
      if (k && k.indexOf('AIza') !== 0) { alert('کلیل دەبێت بە AIza دەست پێبکات'); return; }
      try { localStorage.setItem('hadith_gemini_key', k); } catch (err) {}
      alert(k ? 'کلیل پاشەکەوت کرا ✓' : 'کلیل سڕایەوە');
      render();
      return;
    }
    if (act === 'toggleBm' && state.detail) { toggleBm(state.detail); render(); return; }
    if (act === 'translateKu' && state.detail) {
      state.translating = true; render();
      translateToKu(state.detail).then(function () {
        state.translating = false; render();
      }).catch(function (err) {
        state.translating = false;
        alert('وەرگێڕان سەرنەکەوت: ' + (err.message || err));
        render();
      });
      return;
    }
    if (act === 'share' && state.detail && navigator.share) {
      var t = state.detail.ar;
      if (state.detail.ku) t += '\n\n' + state.detail.ku;
      else if (state.detail.en) t += '\n\n' + state.detail.en;
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
      if (item) {
        var ku = trCache()[item.id];
        if (ku) item.ku = ku;
        state.detail = item; state.view = 'detail'; render();
      }
      return;
    }
    var did = el.getAttribute('data-detail-id');
    if (did) {
      var bm = bookmarks().find(function (x) { return x.id === did; });
      if (bm) {
        var k2 = trCache()[bm.id];
        if (k2) bm.ku = k2;
        state.detail = bm; state.view = 'detail'; render();
      }
    }
  }

  window.enterHadith = function () {
    injectCss();
    if (!ensureView()) return;
    state.view = 'home';
    if (typeof showView === 'function') showView('hadithView', 'حەدیسی پەیامبەر');
    render();
  };

  function dedupeCards(box) {
    var all = box.querySelectorAll('.hadith-choice');
    for (var i = 1; i < all.length; i++) {
      try { all[i].parentNode.removeChild(all[i]); } catch (e) {}
    }
    return all.length > 0;
  }

  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (dedupeCards(box)) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice hadith-choice';
    b.setAttribute('data-hadith-card', '1');
    b.innerHTML = '<span class="choice-icon">📖</span><span class="choice-copy"><b>حەدیسی پەیامبەر ﷺ</b><small>بخاری · مسلم · وەرگێڕانی Gemini</small></span><span class="choice-arrow">‹</span>';
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
        }, 80);
      }, true);
    }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
