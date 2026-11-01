/* sira-story.js v1 — "ژیاننامەی تەواوی پێغەمبەر ﷺ": a continuous, long, chronological biography split into parts.
 * Content lives in sira-story-pN.js files that push {id,ku,intro,chapters:[{id,ku,body}]} onto window.__SIRA_STORY. */
(function () {
  if (window.__siraStoryV1) return;
  window.__siraStoryV1 = true;
  var $ = function (id) { return document.getElementById(id); };
  var POS = 'sira_story_pos_v1', SZ = 'sira_story_sz_v1';
  var PLAN = [
    ['p1', 'یەکەم: جەزیرەی عەرەب و مەککە پێش ئیسلام'],
    ['p2', 'دووەم: نەسەب، لەدایکبوون و منداڵی'],
    ['p3', 'سێیەم: گەنجی و ژنهێنان بە خەدیجە'],
    ['p4', 'چوارەم: وەحی و بانگەوازی نهێنی'],
    ['p5', 'پێنجەم: بانگەوازی ئاشکرا و ئازاردانی موسڵمانان'],
    ['p6', 'شەشەم: ساڵی خەم، تائیف، ئیسراء و عەقەبە'],
    ['p7', 'حەوتەم: کۆچ بۆ مەدینە'],
    ['p8', 'هەشتەم: دامەزراندنی کۆمەڵگای مەدینە'],
    ['p9', 'نۆیەم: بەدر، ئوحود و خەندەق'],
    ['p10', 'دەیەم: حودەیبیە تا فەتحی مەککە'],
    ['p11', 'یازدەیەم: حونەین، تەبووک و وەفدەکان'],
    ['p12', 'دوازدەیەم: حەججەتولوداع و کۆچی دوایی'],
    ['p13', 'سێزدەیەم: ئەخلاق و شەمائلی پێغەمبەر ﷺ']
  ];
  var st = { view: 'home', part: null, ch: 0, size: 19 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function parts() { var seen = {}; return (window.__SIRA_STORY || []).filter(function (p) { if (seen[p.id]) return false; seen[p.id] = 1; return true; }); }
  function getPart(id) { return parts().filter(function (p) { return p.id === id; })[0]; }
  function words(s) { return String(s || '').split(/\s+/).length; }

  function css() {
    if ($('siraStoryCss')) return;
    var s = document.createElement('style'); s.id = 'siraStoryCss';
    s.textContent = [
      'body:has(#siraStory.active) .top{display:none!important}',
      '.phone:has(#siraStory.active) .status,.phone:has(#siraStory.active) .appbar,.phone:has(#siraStory.active) .bottom{display:none!important}',
      '.phone:has(#siraStory.active) .main{height:100%!important;padding:0!important;background:#f7f4ef}',
      '#siraStory{display:none!important}',
      '#siraStory.active{display:flex!important;flex-direction:column;height:100%;box-sizing:border-box}',
      '#siraStory .ss-head{padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#176b4b,#0f4d36);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px}',
      '#siraStory .ss-head h2{margin:0;font-size:17px}#siraStory .ss-head small{display:block;font-size:11px;opacity:.9;margin-top:2px}',
      '#siraStory .ss-b{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#siraStory .ss-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}',
      '#siraStory .ss-item{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:12px 14px;margin-bottom:9px;cursor:pointer}',
      '#siraStory .ss-item b{display:block;font-size:15px;color:#173f35}',
      '#siraStory .ss-item small{color:#8a6a24;font-size:12px}',
      '#siraStory .ss-item.soon{opacity:.55;cursor:default}',
      '#siraStory .ss-text{background:#fff;border:1px solid #e4d5ad;border-radius:14px;padding:16px;line-height:2.2;color:#2b2415}',
      '#siraStory .ss-text p{margin:0 0 14px}',
      '#siraStory .ss-text h3{margin:18px 0 8px;color:#176b4b;font-size:1.05em}',
      '#siraStory .ss-nav{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:10px 0}',
      '#siraStory .ss-nav button{border:1px solid #d8c68f;background:#fbf5e7;color:#5a4a1c;border-radius:10px;padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}',
      '#siraStory .ss-nav .pri{background:#176b4b;color:#fff;border-color:#176b4b}',
      '#siraStory .ss-note{font-size:11px;color:#8a7a4a;text-align:center;line-height:1.8;margin-top:10px}',
      '#siraStoryEntry{grid-column:1/-1;background:linear-gradient(135deg,#176b4b,#0f4d36)!important;color:#fff!important;border:0!important}#siraStoryEntry b,#siraStoryEntry small{color:#fff!important}'
    ].join('');
    document.head.appendChild(s);
  }
  function ensureView() {
    var main = document.querySelector('.main'); if (!main) return null;
    var v = $('siraStory'); if (v) return v;
    v = document.createElement('div'); v.id = 'siraStory'; v.className = 'view'; main.appendChild(v); return v;
  }

  function body(txt) {
    return String(txt).split(/\n\s*\n/).map(function (p) {
      p = p.trim(); if (!p) return '';
      if (p.indexOf('## ') === 0) return '<h3>' + esc(p.slice(3)) + '</h3>';
      return '<p>' + esc(p) + '</p>';
    }).join('');
  }

  function render() {
    var v = ensureView(); if (!v) return;
    var title = 'ژیاننامەی تەواوی پێغەمبەر ﷺ', sub = '', b = '', back = 'back';
    if (st.view === 'home') {
      var total = 0, chs = 0;
      parts().forEach(function (p) { chs += p.chapters.length; p.chapters.forEach(function (c) { total += words(c.body); }); });
      sub = chs + ' بابەت · نزیکەی ' + total + ' وشە · ' + parts().length + ' لە ' + PLAN.length + ' بەش';
      var pos = jget(POS, null);
      if (pos && getPart(pos.p)) b += '<div class="ss-item" style="border-color:#176b4b" data-a="open" data-p="' + pos.p + '" data-c="' + pos.c + '"><b>↩ بەردەوامبوون لە خوێندنەوە</b><small>' + esc(getPart(pos.p).chapters[pos.c].ku) + '</small></div>';
      PLAN.forEach(function (pl) {
        var p = getPart(pl[0]);
        b += p ? '<div class="ss-item" data-a="part" data-p="' + pl[0] + '"><b>' + esc(pl[1]) + '</b><small>' + p.chapters.length + ' بابەت · ' + p.chapters.reduce(function (a, c) { return a + words(c.body); }, 0) + ' وشە</small></div>'
          : '<div class="ss-item soon"><b>' + esc(pl[1]) + '</b><small>بەزوویی زیاد دەکرێت</small></div>';
      });
      b += '<div class="ss-note">ئەم ژیاننامەیە لە سەرچاوە کلاسیکییەکانی سیرە (سیرەی ئیبن هیشام، ئیبن ئیسحاق، ئیبن سەعد، بوخاری و موسلیم...) کۆکراوەتەوە و بە کوردی نووسراوە. بۆ دەقی عەرەبیی تەواو، «سیرەی تەواو (ئیبن هیشام)» ببینە.</div>';
    } else if (st.view === 'part') {
      var pt = getPart(st.part); sub = pt.ku;
      b += (pt.intro ? '<div class="ss-text"><p>' + esc(pt.intro) + '</p></div><div style="height:10px"></div>' : '');
      pt.chapters.forEach(function (c, i) { b += '<div class="ss-item" data-a="open" data-p="' + pt.id + '" data-c="' + i + '"><b>' + (i + 1) + '. ' + esc(c.ku) + '</b><small>' + words(c.body) + ' وشە</small></div>'; });
    } else {
      var pr = getPart(st.part), c = pr.chapters[st.ch]; sub = pr.ku + ' · ' + (st.ch + 1) + '/' + pr.chapters.length;
      b += '<div class="ss-nav"><button data-a="prev"' + (st.ch <= 0 ? ' disabled' : '') + '>‹ پێشوو</button><button data-a="next"' + (st.ch >= pr.chapters.length - 1 ? ' disabled' : '') + '>دواتر ›</button><button data-a="fs" data-d="2">A+</button><button data-a="fs" data-d="-2">A−</button></div>' +
        '<div class="ss-text" style="font-size:' + st.size + 'px"><h3 style="margin-top:0;font-size:1.15em">' + esc(c.ku) + '</h3>' + body(c.body) + '</div>' +
        '<div class="ss-nav">' + (st.ch < pr.chapters.length - 1 ? '<button class="pri" data-a="next">بابەتی دواتر ›</button>' : '<button class="pri" data-a="part" data-p="' + pr.id + '">گەڕانەوە بۆ بەشەکە</button>') + '</div>';
    }
    v.innerHTML = '<div class="ss-head"><div><h2>📖 ' + esc(title) + '</h2><small>' + esc(sub) + '</small></div><button type="button" class="ss-b" data-a="back">‹ ' + (st.view === 'home' ? 'سیرە' : 'گەڕانەوە') + '</button></div><div class="ss-body" id="ssBody">' + b + '</div>';
  }

  function openCh(p, c) {
    var pt = getPart(p); if (!pt) return;
    st.view = 'read'; st.part = p; st.ch = Math.max(0, Math.min(pt.chapters.length - 1, c));
    jset(POS, { p: p, c: st.ch }); render(); var bd = $('ssBody'); if (bd) bd.scrollTop = 0;
  }
  function onClick(e) {
    var v = $('siraStory'); if (!v || !v.contains(e.target)) return;
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a');
    if (a === 'back') {
      if (st.view === 'read') { st.view = 'part'; render(); }
      else if (st.view === 'part') { st.view = 'home'; render(); }
      else if (typeof window.enterSeerah === 'function') window.enterSeerah();
      return;
    }
    if (a === 'part') { st.view = 'part'; st.part = t.getAttribute('data-p'); render(); return; }
    if (a === 'open') return openCh(t.getAttribute('data-p'), Number(t.getAttribute('data-c')));
    if (a === 'prev') return openCh(st.part, st.ch - 1);
    if (a === 'next') return openCh(st.part, st.ch + 1);
    if (a === 'fs') { st.size = Math.max(15, Math.min(32, st.size + Number(t.getAttribute('data-d')))); jset(SZ, st.size); var bd = $('ssBody'), top = bd ? bd.scrollTop : 0; render(); if ($('ssBody')) $('ssBody').scrollTop = top; }
  }
  function enter() {
    css(); if (!ensureView()) return; st.size = jget(SZ, 19); st.view = 'home';
    if (typeof window.showView === 'function') window.showView('siraStory', 'ژیاننامەی پێغەمبەر'); else if (typeof showView === 'function') showView('siraStory', 'ژیاننامەی پێغەمبەر');
    render();
  }
  window.enterSiraStory = enter;
  function inject() {
    var g = document.querySelector('#seerahView .sr-home-grid');
    if (!g || g.querySelector('#siraStoryEntry')) return;
    var d = document.createElement('div'); d.className = 'sr-home-tile'; d.id = 'siraStoryEntry';
    d.innerHTML = '<span>📖</span><b>ژیاننامەی تەواوی پێغەمبەر ﷺ</b><small>لە مەککە تا کۆتایی · بە درێژی و بەشبەش</small>';
    d.onclick = enter; g.insertBefore(d, g.firstChild);
  }
  document.addEventListener('click', onClick);
  function start() { css(); new MutationObserver(inject).observe(document.body, { childList: true, subtree: true }); inject(); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
