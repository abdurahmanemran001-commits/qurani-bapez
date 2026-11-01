/* companions.js v1 — سیرەی هاوەڵان */
(function () {
  if (window.__companionsV1) return;
  window.__companionsV1 = true;

  var BM_KEY = 'companions_bm_v1';
  var state = { view: 'home', chapter: null, period: 'all', query: '' };

  function data() {
    return window.__COMPANIONS_DATA || { periods: [], chapters: [] };
  }
  function bookmarks() {
    try { var a = JSON.parse(localStorage.getItem(BM_KEY) || '[]'); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function saveBm(arr) {
    try { localStorage.setItem(BM_KEY, JSON.stringify(arr.slice(0, 80))); } catch (e) {}
  }
  function isBm(id) { return bookmarks().indexOf(id) >= 0; }
  function toggleBm(id) {
    var a = bookmarks(); var i = a.indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.unshift(id);
    saveBm(a);
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

  function injectCss() {
    if ($('companionsCss')) return;
    var s = document.createElement('style');
    s.id = 'companionsCss';
    s.textContent = [
      'body:has(#companionsView.active) .top{display:none!important}',
      '.phone:has(#companionsView.active) .status,.phone:has(#companionsView.active) .appbar,.phone:has(#companionsView.active) .bottom{display:none!important}',
      '.phone:has(#companionsView.active) .main{height:100%!important;padding:0!important;background:#f7f5f0}',
      '#companionsView{display:none!important}',
      '#companionsView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#companionsView .cp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#2a4a3a,#3d6b52);color:#fff;flex-shrink:0}',
      '#companionsView .cp-head h2{margin:0;font-size:17px;font-weight:800}',
      '#companionsView .cp-head .cp-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#companionsView .cp-btn{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#companionsView .cp-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#companionsView .cp-card{background:#fff;border:1px solid #d0ddd4;border-radius:14px;padding:12px 14px;margin-bottom:10px;cursor:pointer;text-align:right}',
      '#companionsView .cp-card:active{background:#eef5f0}',
      '#companionsView .cp-card b{display:block;font-size:15px;color:#1a3a2a;margin-bottom:4px}',
      '#companionsView .cp-card small{color:#5a7a6a;font-size:12px}',
      '#companionsView .cp-ar{font-family:serif;font-size:17px;line-height:2;text-align:right;color:#1a2e24;direction:rtl;margin-top:12px;padding-top:12px;border-top:1px dashed #d0ddd4;white-space:pre-wrap}',
      '#companionsView .cp-ku{font-size:15px;line-height:2;color:#1a2e24;text-align:right;direction:rtl;white-space:pre-wrap}',
      '#companionsView .cp-label{font-size:11px;color:#5a7a6a;font-weight:700;margin-bottom:6px}',
      '#companionsView .cp-search{display:flex;gap:8px;margin-bottom:10px}',
      '#companionsView .cp-search input{flex:1;border:1px solid #d0ddd4;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;background:#fff}',
      '#companionsView .cp-search button{border:0;background:#3d6b52;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer}',
      '#companionsView .cp-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}',
      '#companionsView .cp-chip{border:1px solid #d0ddd4;background:#fff;border-radius:20px;padding:6px 12px;font-size:12px;cursor:pointer;color:#1a3a2a}',
      '#companionsView .cp-chip.on{background:#3d6b52;color:#fff;border-color:#3d6b52}',
      '#companionsView .cp-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
      '#companionsView .cp-actions button{border:1px solid #d0ddd4;background:#fff;border-radius:10px;padding:8px 12px;font-size:13px;cursor:pointer;color:#1a3a2a}',
      '#companionsView .cp-empty{text-align:center;color:#5a7a6a;padding:30px 10px;font-size:14px}',
      '#companionsView .cp-stat{font-size:12px;color:#5a7a6a;margin-bottom:8px}',
      '.section-choice.companions-choice{border-color:#d0ddd4;background:linear-gradient(135deg,#fff,#eef5f0)}',
      '.section-choice.companions-choice .choice-icon{background:#d8e8dc;color:#3d6b52}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('companionsView');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'companionsView';
    v.className = 'view';
    main.appendChild(v);
    return v;
  }

  function filtered() {
    var d = data();
    var list = d.chapters || [];
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

  function title() {
    if (state.view === 'detail' && state.chapter) return state.chapter.ku;
    if (state.view === 'bookmarks') return 'نیشانەکراوەکان';
    return 'سیرەی هاوەڵان';
  }

  function render() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var d = data();
    var head =
      '<div class="cp-head"><div><h2>☪ ' + esc(title()) + '</h2><div class="cp-sub">هاوەڵانی پێغەمبەر · ' + (d.chapters || []).length + ' کەس · کوردی و عەرەبی</div></div>' +
      '<div style="display:flex;gap:6px">' +
      (state.view !== 'home' ? '<button type="button" class="cp-btn" data-act="back">‹ گەڕانەوە</button>' : '') +
      '<button type="button" class="cp-btn" data-act="bm">★</button>' +
      '<button type="button" class="cp-btn" data-act="home">بەشەکان</button></div></div>';

    var body = '<div class="cp-body">';
    if (state.view === 'detail' && state.chapter) {
      var c = state.chapter;
      body += '<div class="cp-card" style="cursor:default">';
      body += '<b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small>';
      body += '<div style="margin-top:12px"><div class="cp-label">کوردی</div><div class="cp-ku">' + esc(c.ku_body) + '</div></div>';
      body += '<div class="cp-ar"><div class="cp-label">العربية</div>' + esc(c.ar_body) + '</div>';
      body += '<div class="cp-actions"><button type="button" data-act="toggleBm">' + (isBm(c.id) ? '★ لابردنی نیشانە' : '☆ نیشانەکردن') + '</button></div></div>';
    } else if (state.view === 'bookmarks') {
      var bms = bookmarks();
      var chs = (d.chapters || []).filter(function (c) { return bms.indexOf(c.id) >= 0; });
      if (!chs.length) body += '<div class="cp-empty">هیچ نیشانەیەک نییە</div>';
      else chs.forEach(function (c) {
        body += '<div class="cp-card" data-ch="' + esc(c.id) + '"><b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small></div>';
      });
    } else {
      body += '<div class="cp-search"><input id="cpQ" type="search" placeholder="گەڕان لە هاوەڵان..." value="' + esc(state.query) + '"><button type="button" data-act="searchGo">گەڕان</button></div>';
      body += '<div class="cp-chips">';
      body += '<button type="button" class="cp-chip' + (state.period === 'all' ? ' on' : '') + '" data-period="all">هەموو</button>';
      (d.periods || []).forEach(function (p) {
        body += '<button type="button" class="cp-chip' + (state.period === p.id ? ' on' : '') + '" data-period="' + esc(p.id) + '">' + esc(p.ku) + '</button>';
      });
      body += '</div>';
      var list = filtered();
      body += '<div class="cp-stat">' + list.length + ' هاوەڵ</div>';
      if (!list.length) body += '<div class="cp-empty">هیچ کەسێک نەدۆزرایەوە</div>';
      list.forEach(function (c) {
        var preview = (c.ku_body || '').slice(0, 90);
        body += '<div class="cp-card" data-ch="' + esc(c.id) + '"><b>' + esc(c.ku) + '</b><small>' + esc(c.ar) + '</small>';
        if (preview) body += '<div style="font-size:12px;color:#5a7a6a;margin-top:6px;line-height:1.5">' + esc(preview) + '…</div>';
        body += '</div>';
      });
    }
    body += '</div>';
    v.innerHTML = head + body;
  }

  function onClick(e) {
    var el = e.target.closest('[data-act],[data-ch],[data-period]');
    if (!el || !$('companionsView') || !$('companionsView').contains(el)) return;
    var act = el.getAttribute('data-act');
    if (act === 'home') {
      var sv = $('companionsView');
      if (sv) sv.classList.remove('active');
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
      return;
    }
    if (act === 'back') { state.view = 'home'; state.chapter = null; render(); return; }
    if (act === 'bm') { state.view = 'bookmarks'; render(); return; }
    if (act === 'searchGo') {
      var inp = $('cpQ');
      state.query = inp ? inp.value.trim() : '';
      render(); return;
    }
    if (act === 'toggleBm' && state.chapter) { toggleBm(state.chapter.id); render(); return; }
    var per = el.getAttribute('data-period');
    if (per) { state.period = per; render(); return; }
    var cid = el.getAttribute('data-ch');
    if (cid) {
      var ch = (data().chapters || []).find(function (x) { return x.id === cid; });
      if (ch) { state.chapter = ch; state.view = 'detail'; render(); }
    }
  }

  window.enterCompanions = function () {
    injectCss();
    if (!ensureView()) return;
    state.view = 'home';
    if (typeof showView === 'function') showView('companionsView', 'سیرەی هاوەڵان');
    render();
  };

  function dedupeCards(box) {
    var all = box.querySelectorAll('.companions-choice');
    for (var i = 1; i < all.length; i++) { try { all[i].parentNode.removeChild(all[i]); } catch (e) {} }
    return all.length > 0;
  }
  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return false;
    if (dedupeCards(box)) return true;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice companions-choice';
    b.innerHTML = '<span class="choice-icon">👥</span><span class="choice-copy"><b>سیرەی هاوەڵان</b><small>خولەفا · ئەسحاب · ئەنسار · ژنە هاوەڵەکان · کوردی و عەرەبی</small></span><span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterCompanions(); };
    var seerah = box.querySelector('.seerah-choice');
    if (seerah && seerah.nextSibling) box.insertBefore(b, seerah.nextSibling);
    else if (seerah) box.appendChild(b);
    else box.appendChild(b);
    dedupeCards(box);
    return true;
  }
  function start() {
    injectCss();
    if (!window.__companionsClickBound) {
      window.__companionsClickBound = true;
      document.addEventListener('click', onClick);
    }
    var n = 0;
    var iv = setInterval(function () { addCard(); if (++n > 25) clearInterval(iv); }, 300);
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
