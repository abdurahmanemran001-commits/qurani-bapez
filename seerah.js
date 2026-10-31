/* seerah.js v7 — سیرە + کتێبخانەی کلاسیکی (داگرتن / نیشانە / سڕینەوە) */
(function () {
  if (window.__seerahV7) return;
  window.__seerahV7 = true;

  var BM_KEY = 'seerah_bm_v2';
  var LIB_KEY = 'seerah_lib_saved_v1';
  var state = { view: 'home', chapter: null, period: 'all', query: '', bookId: null };

  var BOOKS = [
    { id: 'ibn_hisham', ku: 'سیرەتی ئیبن هشام', ar: 'السيرة النبوية لابن هشام', author: 'ئیبن هشام', size: '~٣٠–١٨٠ مێگابایت', desc: 'گرنگترین و کۆنترین سەرچاوەی تەواوی سیرەت.', descAr: 'أهم وأقدم مصدر كامل للسيرة.', url: 'https://archive.org/details/asseirah', url2: 'https://archive.org/details/nasai_yopmail_02_201802' },
    { id: 'rahiq', ku: 'الڕەحیقولمەختوم', ar: 'الرحيق المختوم', author: 'موبارکپوری', size: '~٨–١٥ مێگابایت', desc: 'باشترین سیرەتی نوێی ڕێکخراو. خوڵاتی ١٩٧٦.', descAr: 'من أفضل السير المعاصرة.', url: 'https://archive.org/details/rahiq_makhtoum', url2: 'https://archive.org/details/sealed_nectar' },
    { id: 'shamail', ku: 'شەمائلی ترمذی', ar: 'الشمائل المحمدية', author: 'ترمذی', size: '~٢–٥ مێگابایت', desc: 'سیفات و ڕەفتاری پێغەمبەر ﷺ.', descAr: 'شمائل النبي ﷺ.', url: 'https://archive.org/search?query=%D8%A7%D9%84%D8%B4%D9%85%D8%A7%D8%A6%D9%84%20%D8%A7%D9%84%D9%85%D8%AD%D9%85%D8%AF%D9%8A%D8%A9%20pdf' },
    { id: 'ibn_kathir', ku: 'البدایة والنهایة (سیرەت)', ar: 'البداية والنهاية', author: 'ئیبن کەسیر', size: '~٥٠+ مێگابایت', desc: 'سیرەتی درێژ و ورد.', descAr: 'سيرة مفصلة.', url: 'https://archive.org/search?query=%D8%A7%D9%84%D8%A8%D8%AF%D8%A7%D9%8A%D8%A9%20%D9%88%D8%A7%D9%84%D9%86%D9%87%D8%A7%D9%8A%D8%A9%20pdf' },
    { id: 'zad', ku: 'زاد المعاد', ar: 'زاد المعاد', author: 'ئیبن قەییم', size: '~٢٠–٤٠ مێگابایت', desc: 'هیدایەت و سوننەتی پێغەمبەر.', descAr: 'هدي النبي وسنته.', url: 'https://archive.org/search?query=%D8%B2%D8%A7%D8%AF%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%AF%20pdf' },
    { id: 'fiqh_sira', ku: 'فقهی سیرەت', ar: 'فقه السيرة', author: 'غەزالی', size: '~٥–١٠ مێگابایت', desc: 'سیرەت بە شێوازی فیقھی.', descAr: 'سيرة فقهية تربوية.', url: 'https://archive.org/search?query=%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9%20%D8%A7%D9%84%D8%BA%D8%B2%D8%A7%D9%84%D9%8A%20pdf' },
    { id: 'nur_yaqin', ku: 'نوورول یەقین', ar: 'نور اليقين', author: 'خەزرەجی', size: '~٥–٨ مێگابایت', desc: 'سیرەتی کورت و ڕێکخراو.', descAr: 'سيرة مختصرة منظمة.', url: 'https://archive.org/search?query=%D9%86%D9%88%D8%B1%20%D8%A7%D9%84%D9%8A%D9%82%D9%8A%D9%86%20pdf' },
    { id: 'mukhtasar_rahiq', ku: 'کورتکراوەی الرحیق', ar: 'مختصر الرحيق', author: 'موبارکپوری', size: '~١–٣ مێگابایت', desc: 'وەشانی کورتکراوە.', descAr: 'مختصر للرحيق.', url: 'https://archive.org/details/20221011_20221011_1915' }
  ];

  function data() {
    var d = window.__SEERAH_DATA || { periods: [], chapters: [] };
    if (window.__SEERAH_DATA_P2 && window.__SEERAH_DATA_P2.chapters) {
      d.chapters = (d.chapters || []).concat(window.__SEERAH_DATA_P2.chapters);
    }
    if (window.__SEERAH_DATA_P3 && window.__SEERAH_DATA_P3.chapters) {
      d.chapters = (d.chapters || []).concat(window.__SEERAH_DATA_P3.chapters);
    }
    return d;
  }
  function bookmarks() {
    try { var a = JSON.parse(localStorage.getItem(BM_KEY) || '[]'); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function saveBm(arr) { try { localStorage.setItem(BM_KEY, JSON.stringify(arr.slice(0, 80))); } catch (e) {} }
  function isBm(id) { return bookmarks().indexOf(id) >= 0; }
  function toggleBm(id) {
    var a = bookmarks(); var i = a.indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.unshift(id);
    saveBm(a);
  }
  function libSaved() {
    try { var o = JSON.parse(localStorage.getItem(LIB_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; }
    catch (e) { return {}; }
  }
  function setLibSaved(id, on) {
    var o = libSaved();
    if (on) o[id] = { at: Date.now() }; else delete o[id];
    try { localStorage.setItem(LIB_KEY, JSON.stringify(o)); } catch (e) {}
  }
  function isLibSaved(id) { return !!libSaved()[id]; }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

  function injectCss() {
    if ($('seerahCss')) return;
    var s = document.createElement('style');
    s.id = 'seerahCss';
    s.textContent = [
      'body:has(#seerahView.active) .top{display:none!important}',
      '.phone:has(#seerahView.active) .status,.phone:has(#seerahView.active) .appbar,.phone:has(#seerahView.active) .bottom{display:none!important}',
      '.phone:has(#seerahView.active) .main{height:100%!important;padding:0!important;background:#f5f7fa}',
      '#seerahView{display:none!important}',
      '#seerahView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#seerahView .sr-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a2744,#2c4a7c);color:#fff;flex-shrink:0}',
      '#seerahView .sr-head h2{margin:0;font-size:17px;font-weight:800}',
      '#seerahView .sr-head .sr-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#seerahView .sr-btn{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#seerahView .sr-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#seerahView .sr-card{background:#fff;border:1px solid #d0d8e8;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-align:right}',
      '#seerahView .sr-card:active{background:#eef2f8}',
      '#seerahView .sr-card b{display:block;font-size:15px;color:#1a2744;margin-bottom:4px}',
      '#seerahView .sr-card small{color:#5a6a8a;font-size:12px}',
      '#seerahView .sr-ar{font-family:serif;font-size:17px;line-height:2;text-align:right;color:#1a2e24;direction:rtl;margin-top:12px;padding-top:12px;border-top:1px dashed #d0d8e8;white-space:pre-wrap}',
      '#seerahView .sr-ku{font-size:15px;line-height:2;color:#1a2e24;text-align:right;direction:rtl;white-space:pre-wrap}',
      '#seerahView .sr-label{font-size:11px;color:#5a6a8a;font-weight:700;margin-bottom:6px}',
      '#seerahView .sr-search{display:flex;gap:8px;margin-bottom:10px}',
      '#seerahView .sr-search input{flex:1;border:1px solid #d0d8e8;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;background:#fff}',
      '#seerahView .sr-search button{border:0;background:#2c4a7c;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}',
      '#seerahView .sr-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}',
      '#seerahView .sr-chip{border:1px solid #d0d8e8;background:#fff;border-radius:20px;padding:6px 12px;font-size:12px;cursor:pointer;color:#1a2744}',
      '#seerahView .sr-chip.on{background:#2c4a7c;color:#fff;border-color:#2c4a7c}',
      '#seerahView .sr-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
      '#seerahView .sr-actions button{border:1px solid #d0d8e8;background:#fff;border-radius:10px;padding:8px 12px;font-size:13px;cursor:pointer;color:#1a2744}',
      '#seerahView .sr-actions button.primary{background:#2c4a7c;color:#fff;border-color:#2c4a7c}',
      '#seerahView .sr-actions button.danger{border-color:#c45;color:#c45}',
      '#seerahView .sr-empty{text-align:center;color:#5a6a8a;padding:30px 10px;font-size:14px}',
      '#seerahView .sr-note{font-size:12px;color:#5a6a8a;text-align:center;margin-top:12px;line-height:1.6}',
      '#seerahView .sr-stat{font-size:12px;color:#5a6a8a;margin-bottom:8px}',
      '#seerahView .sr-badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:10px;background:#e8f0e8;color:#2a5a2a;margin-top:6px}',
      '#seerahView .sr-badge.off{background:#f0e8e8;color:#8a4a4a}',
      '#seerahView .sr-home-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}',
      '#seerahView .sr-home-tile{background:#fff;border:1px solid #d0d8e8;border-radius:14px;padding:16px 12px;text-align:center;cursor:pointer}',
      '#seerahView .sr-home-tile b{display:block;font-size:14px;color:#1a2744;margin-top:6px}',
      '#seerahView .sr-home-tile span{font-size:22px}',
      '#seerahView .sr-home-tile small{display:block;font-size:11px;color:#5a6a8a;margin-top:4px}',
      '.section-choice.seerah-choice{border-color:#d0d8e8;background:linear-gradient(135deg,#fff,#eef2f8)}',
      '.section-choice.seerah-choice .choice-icon{background:#d8e2f0;color:#2c4a7c}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('seerahView');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'seerahView';
    v.className = 'view';
    main.appendChild(v);
    return v;
  }

  function filtered() {
    var d = data();
    var list = (d.chapters || []).filter(function (c) { return c.period !== 'books'; });
    if (state.period && state.period !== 'all') list = list.filter(function (c) { return c.period === state.period; });
    var q = (state.query || '').trim().toLowerCase();
    if (q) {
      list = list.filter(function (c) {
        var hay = ((c.ku||'') + ' ' + (c.ar||'') + ' ' + (c.ku_body||'') + ' ' + (c.ar_body||'')).toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    }
    return list;
  }

  function periodsNoBooks() {
    return (data().periods || []).filter(function (p) { return p.id !== 'books'; });
  }

  function title() {
    if (state.view === 'detail' && state.chapter) return state.chapter.ku;
    if (state.view === 'bookmarks') return 'نیشانەکراوەکان';
    if (state.view === 'lib') return 'کتێبە کلاسیکییەکان';
    if (state.view === 'book' && state.bookId) {
      var b = BOOKS.find(function (x) { return x.id === state.bookId; });
      return b ? b.ku : 'کتێب';
    }
    return 'سیرەی پێغەمبەر ﷺ';
  }

  function renderLib() {
    var nSaved = Object.keys(libSaved()).length;
    var html = '<div class="sr-stat">' + BOOKS.length + ' کتێب · ' + nSaved + ' نیشانەکراو وەک داگیراو</div>';
    html += '<div class="sr-note" style="margin-bottom:12px">کرتە لە «داگرتن» → archive.org → PDF داگرە. پاشان «نیشانەی داگیراو». دەتوانیت نیشانە بسڕیتەوە.</div>';
    BOOKS.forEach(function (b) {
      var on = isLibSaved(b.id);
      html += '<div class="sr-card" data-book="' + esc(b.id) + '"><b>' + esc(b.ku) + '</b><small>' + esc(b.ar) + '</small>';
      html += '<div style="font-size:12px;color:#5a6a8a;margin-top:6px">' + esc(b.author) + ' · ' + esc(b.size) + '</div>';
      html += '<div style="font-size:12px;color:#3a4a6a;margin-top:6px;line-height:1.5">' + esc(b.desc) + '</div>';
      html += '<span class="sr-badge' + (on ? '' : ' off') + '">' + (on ? '✓ نیشانەکراو وەک داگیراو' : 'هێشتا داونەگیراوە') + '</span></div>';
    });
    return html;
  }

  function renderBookDetail() {
    var b = BOOKS.find(function (x) { return x.id === state.bookId; });
    if (!b) return '<div class="sr-empty">کتێب نەدۆزرایەوە</div>';
    var on = isLibSaved(b.id);
    var html = '<div class="sr-card" style="cursor:default"><b>' + esc(b.ku) + '</b><small>' + esc(b.ar) + '</small>';
    html += '<div class="sr-label" style="margin-top:10px">نووسەر</div><div class="sr-ku">' + esc(b.author) + '</div>';
    html += '<div class="sr-label">قەبارە</div><div class="sr-ku">' + esc(b.size) + '</div>';
    html += '<div class="sr-label">وەسف</div><div class="sr-ku">' + esc(b.desc) + '</div>';
    html += '<div class="sr-ar"><div class="sr-label">العربية</div>' + esc(b.descAr) + '</div>';
    html += '<span class="sr-badge' + (on ? '' : ' off') + '">' + (on ? '✓ نیشانەکراو وەک داگیراو' : 'هێشتا داونەگیراوە') + '</span>';
    html += '<div class="sr-actions">';
    html += '<button type="button" class="primary" data-act="dlBook" data-book="' + esc(b.id) + '">⬇ داگرتن (archive.org)</button>';
    if (b.url2) html += '<button type="button" data-act="dlBook2" data-book="' + esc(b.id) + '">⬇ وەشانی تر</button>';
    if (on) html += '<button type="button" class="danger" data-act="unmarkBook" data-book="' + esc(b.id) + '">سڕینەوەی نیشانە</button>';
    else html += '<button type="button" data-act="markBook" data-book="' + esc(b.id) + '">✓ نیشانەی داگیراو</button>';
    html += '</div></div>';
    html += '<div class="sr-note">دوای داگرتن PDF لە مۆبایل هەڵبگرە. نیشانەکە یادگارییە لەناو ئەپ.</div>';
    return html;
  }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var d = data();
    var chCount = (d.chapters || []).filter(function (c) { return c.period !== 'books'; }).length;
    var head = '<div class="sr-head"><div><h2>☪ ' + esc(title()) + '</h2><div class="sr-sub">' +
      (state.view === 'lib' || state.view === 'book' ? (BOOKS.length + ' کتێب · داگرتنی ئۆفلاین') : ('ژیاننامە · ' + chCount + ' بەش · کوردی و عەرەبی')) +
      '</div></div><div style="display:flex;gap:6px">' +
      (state.view !== 'home' ? '<button type="button" class="sr-btn" data-act="back">‹ گەڕانەوە</button>' : '') +
      '<button type="button" class="sr-btn" data-act="bm">★</button>' +
      '<button type="button" class="sr-btn" data-act="home">بەشەکان</button></div></div>';

    var body = '<div class="sr-body">';
    if (state.view === 'detail' && state.chapter) {
      var c = state.chapter;
      body += '<div class="sr-card" style="cursor:default"><b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small>';
      body += '<div style="margin-top:12px"><div class="sr-label">کوردی</div><div class="sr-ku">' + esc(c.ku_body) + '</div></div>';
      body += '<div class="sr-ar"><div class="sr-label">العربية</div>' + esc(c.ar_body) + '</div>';
      body += '<div class="sr-actions"><button type="button" data-act="toggleBm">' + (isBm(c.id) ? '★ لابردنی نیشانە' : '☆ نیشانەکردن') + '</button></div></div>';
    } else if (state.view === 'bookmarks') {
      var bms = bookmarks();
      var chs = (d.chapters || []).filter(function (c) { return bms.indexOf(c.id) >= 0; });
      if (!chs.length) body += '<div class="sr-empty">هیچ نیشانەیەک نییە</div>';
      else chs.forEach(function (c) {
        body += '<div class="sr-card" data-ch="' + esc(c.id) + '"><b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small></div>';
      });
    } else if (state.view === 'lib') {
      body += renderLib();
    } else if (state.view === 'book') {
      body += renderBookDetail();
    } else {
      body += '<div class="sr-home-grid">';
      body += '<div class="sr-home-tile" data-act="gotoChapters"><span>📖</span><b>بەشەکان</b><small>' + chCount + ' بەشی ورد</small></div>';
      body += '<div class="sr-home-tile" data-act="gotoLib"><span>📚</span><b>کتێبە کلاسیکییەکان</b><small>' + BOOKS.length + ' کتێب · داگرتن</small></div>';
      body += '</div>';
      body += '<div class="sr-search"><input id="srQ" type="search" placeholder="گەڕان لە بەشەکان..." value="' + esc(state.query) + '"><button type="button" data-act="searchGo">گەڕان</button></div>';
      body += '<div class="sr-chips"><button type="button" class="sr-chip' + (state.period === 'all' ? ' on' : '') + '" data-period="all">هەموو</button>';
      periodsNoBooks().forEach(function (p) {
        body += '<button type="button" class="sr-chip' + (state.period === p.id ? ' on' : '') + '" data-period="' + esc(p.id) + '">' + esc(p.ku) + '</button>';
      });
      body += '</div>';
      var list = filtered();
      body += '<div class="sr-stat">' + list.length + ' بەش</div>';
      if (!list.length) body += '<div class="sr-empty">هیچ بەشێک نەدۆزرایەوە</div>';
      list.forEach(function (c) {
        var preview = (c.ku_body || '').slice(0, 90);
        body += '<div class="sr-card" data-ch="' + esc(c.id) + '"><b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small>';
        if (preview) body += '<div style="font-size:12px;color:#5a6a8a;margin-top:6px;line-height:1.5">' + esc(preview) + '…</div>';
        body += '</div>';
      });
    }
    body += '</div>';
    v.innerHTML = head + body;
  }

  function openBookUrl(book, secondary) {
    var url = secondary && book.url2 ? book.url2 : book.url;
    if (!url) return;
    try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) { location.href = url; }
  }

  function onClick(e) {
    var el = e.target.closest('[data-act],[data-ch],[data-period],[data-book]');
    if (!el || !$('seerahView') || !$('seerahView').contains(el)) return;
    var act = el.getAttribute('data-act');
    if (act === 'home') {
      var sv = $('seerahView');
      if (sv) sv.classList.remove('active');
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
      return;
    }
    if (act === 'back') {
      if (state.view === 'book') { state.view = 'lib'; state.bookId = null; }
      else { state.view = 'home'; state.chapter = null; state.bookId = null; }
      render(); return;
    }
    if (act === 'bm') { state.view = 'bookmarks'; render(); return; }
    if (act === 'gotoLib') { state.view = 'lib'; render(); return; }
    if (act === 'gotoChapters') { state.view = 'home'; state.period = 'all'; render(); return; }
    if (act === 'searchGo') {
      var inp = $('srQ');
      state.query = inp ? inp.value.trim() : '';
      render(); return;
    }
    if (act === 'toggleBm' && state.chapter) { toggleBm(state.chapter.id); render(); return; }
    if (act === 'dlBook' || act === 'dlBook2') {
      var bid = el.getAttribute('data-book') || state.bookId;
      var book = BOOKS.find(function (x) { return x.id === bid; });
      if (book) openBookUrl(book, act === 'dlBook2');
      return;
    }
    if (act === 'markBook') { setLibSaved(el.getAttribute('data-book') || state.bookId, true); render(); return; }
    if (act === 'unmarkBook') { setLibSaved(el.getAttribute('data-book') || state.bookId, false); render(); return; }
    var per = el.getAttribute('data-period');
    if (per) { state.period = per; render(); return; }
    var bookAttr = el.getAttribute('data-book');
    if (bookAttr && !act) { state.bookId = bookAttr; state.view = 'book'; render(); return; }
    var cid = el.getAttribute('data-ch');
    if (cid) {
      var ch = (data().chapters || []).find(function (x) { return x.id === cid; });
      if (ch) { state.chapter = ch; state.view = 'detail'; render(); }
    }
  }

  window.enterSeerah = function () {
    injectCss();
    if (!ensureView()) return;
    state.view = 'home';
    if (typeof showView === 'function') showView('seerahView', 'سیرەی پێغەمبەر');
    render();
  };

  function dedupeCards(box) {
    var all = box.querySelectorAll('.seerah-choice');
    for (var i = 1; i < all.length; i++) { try { all[i].parentNode.removeChild(all[i]); } catch (e) {} }
    return all.length > 0;
  }
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (dedupeCards(box)) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice seerah-choice';
    b.innerHTML = '<span class="choice-icon">☪</span><span class="choice-copy"><b>سیرەی پێغەمبەر ﷺ</b><small>بەشەکان + کتێبخانە · داگرتن · ئۆفلاین</small></span><span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterSeerah(); };
    var hadith = box.querySelector('.hadith-choice');
    if (hadith && hadith.nextSibling) box.insertBefore(b, hadith.nextSibling);
    else box.appendChild(b);
    dedupeCards(box);
    return true;
  }
  function start() {
    injectCss();
    if (!window.__seerahClickBound) {
      window.__seerahClickBound = true;
      document.addEventListener('click', onClick);
    }
    var n = 0;
    var iv = setInterval(function () { addCard(); if (++n > 25) clearInterval(iv); }, 300);
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
