/* zikr-enhance.js — Badini fill + bookmarks + reset + reliable audio */
(function () {
  if (window.__zikrEnhance) return;
  window.__zikrEnhance = true;

  /* ---------- Badini (approximate) from Sorani when missing ---------- */
  var WORD_MAP = [
    [/\bخوایە\b/g, 'يا خودێ'],
    [/\bخوا\b/g, 'خودێ'],
    [/\bپەروەردگارمان\b/g, 'خودايێ مە'],
    [/\bپەروەردگار\b/g, 'خودايێ'],
    [/\bمن\b/g, 'ئەز'],
    [/\bئێمە\b/g, 'ئەم'],
    [/\bئەو\b/g, 'ئەو'],
    [/\bبۆ ئەوەی\b/g, 'داكو'],
    [/\bبۆ\b/g, 'بۆ'],
    [/\bلەگەڵ\b/g, 'دگەل'],
    [/\bلە\b/g, 'ژ'],
    [/\bداوای\b/g, 'داخوازا'],
    [/\bدەکەم\b/g, 'دکەم'],
    [/\bدەکات\b/g, 'دکەت'],
    [/\bدەگرم\b/g, 'دگرم'],
    [/\bپەنا دەگرم بە تۆ\b/g, 'ئەز خۆ ب تە دپارێزم'],
    [/\bبەهەشت\b/g, 'بەحەشتێ'],
    [/\bئاگر\b/g, 'ئاگری'],
    [/\bستایش\b/g, 'سوپاس'],
    [/\bستایشێکی\b/g, 'سوپاسیەکا'],
    [/\bپاک و بێگەردی\b/g, 'پاکی و پاقژی'],
    [/\bهیچ پەرستراوێک نییە\b/g, 'چو خودا و پەرستیێت راست نینن'],
    [/\bیارمەتیم بدە\b/g, 'هاریکاریا من بکە'],
    [/\bڕێنماییم بکە\b/g, 'من ڕاستەڕێ بکە'],
    [/\bساغم بکە\b/g, 'من سلامەت بکە'],
    [/\bدووبارە\b/g, 'جارهک دی'],
    [/\bجار\b/g, 'جار'],
    [/\bبەڕاستی\b/g, 'ب ڕاستی'],
    [/\bهی\b/g, 'یێت'],
    [/\bدەگەڕێینەوە\b/g, 'دێ ب بال ڤە زڤرین'],
    [/\bهەیە\b/g, 'هەیە'],
    [/\bنییە\b/g, 'نینە'],
    [/\bئەمە\b/g, 'ئەڤە'],
    [/\bئەوە\b/g, 'ئەو'],
    [/\bکە\b/g, 'کو'],
    [/\bوە\b/g, 'و'],
    [/\bپاشان\b/g, 'پاشی'],
    [/\bپێش\b/g, 'بەرێ'],
    [/\bدوای\b/g, 'پشتی'],
    [/\bزۆر\b/g, 'زێدە'],
    [/\bباشترین\b/g, 'باشترین'],
    [/\bپەرستن\b/g, 'پەرستن'],
    [/\bسوپاست بکەم\b/g, 'شوکرا تە بکەم'],
    [/\bیادت بکەم\b/g, 'زکرێ تە بکەم']
  ];

  function toBadini(ckb) {
    if (!ckb) return '';
    var s = String(ckb);
    WORD_MAP.forEach(function (pair) {
      s = s.replace(pair[0], pair[1]);
    });
    // light orthography toward Badini/Kurmanji-Arabic script habits
    s = s.replace(/ە/g, 'ە').replace(/ڵ/g, 'ل');
    return s;
  }

  function fillBadini(data) {
    if (!Array.isArray(data)) return;
    data.forEach(function (cat) {
      if (!(cat.bad && String(cat.bad).trim()) && cat.ckb) cat.bad = toBadini(cat.ckb);
      (cat.chapters || []).forEach(function (ch) {
        if (!(ch.bad && String(ch.bad).trim()) && ch.ckb) ch.bad = toBadini(ch.ckb);
        (ch.items || []).forEach(function (it) {
          if (!(it.bad && String(it.bad).trim()) && it.ckb) it.bad = toBadini(it.ckb);
        });
      });
    });
  }

  /* ---------- Bookmarks ---------- */
  function loadMarks() {
    try {
      return JSON.parse(localStorage.getItem('zikr_bookmarks') || '[]');
    } catch (e) {
      return [];
    }
  }
  function saveMarks(a) {
    try {
      localStorage.setItem('zikr_bookmarks', JSON.stringify(a));
    } catch (e) {}
  }
  function markKey(c, h, k) {
    return c + ':' + h + ':' + k;
  }
  function isMarked(c, h, k) {
    var key = markKey(c, h, k);
    return loadMarks().some(function (m) {
      return m.key === key;
    });
  }
  function toggleMark(c, h, k, ar, title) {
    var key = markKey(c, h, k);
    var all = loadMarks();
    var i = all.findIndex(function (m) {
      return m.key === key;
    });
    if (i >= 0) all.splice(i, 1);
    else all.unshift({ key: key, c: c, h: h, k: k, ar: ar || '', title: title || '', t: Date.now() });
    saveMarks(all);
    return i < 0;
  }
  window.zikrToggleMark = function (btn, c, h, k) {
    var card = btn.closest('.card');
    var ar = card ? (card.querySelector('.zikr-text') || {}).textContent || '' : '';
    var on = toggleMark(c, h, k, ar, '');
    btn.textContent = on ? '★' : '☆';
    btn.style.color = on ? '#b48a3c' : '';
    btn.title = on ? 'لابردنی نیشانە' : 'نیشانەکردن';
  };
  window.zikrShowMarks = async function () {
    var data = typeof ensureAzkar === 'function' ? await ensureAzkar() : null;
    if (!data) return;
    var marks = loadMarks();
    showView('detail', 'زیکرەکانم');
    var titleEl = document.getElementById('detailTitle');
    var countEl = document.getElementById('zikrCount');
    if (titleEl) titleEl.textContent = 'نیشانکراوەکان';
    if (countEl) countEl.textContent = marks.length + ' دانە';
    var list = document.getElementById('detailList');
    if (!list) return;
    if (!marks.length) {
      list.innerHTML = '<div class="card muted">هیچ زیکرێک نیشان نەکراوە. لەسەر هەر زیکرێک دوگمەی ☆ دابگرە.</div>';
      return;
    }
    list.innerHTML = marks
      .map(function (m, idx) {
        var it = null;
        try {
          it = data[m.c].chapters[m.h].items[m.k];
        } catch (e) {}
        var ar = (it && it.ar) || m.ar || '';
        var tr = '';
        try {
          if (typeof ztr === 'function' && it) tr = ztr(it);
        } catch (e2) {}
        return (
          '<div class="card" id="zm' +
          idx +
          '">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
          '<b>نیشانە · ' +
          (idx + 1) +
          '</b>' +
          '<button type="button" onclick="zikrToggleMark(this,' +
          m.c +
          ',' +
          m.h +
          ',' +
          m.k +
          ');setTimeout(zikrShowMarks,50)" style="border:0;background:transparent;font-size:22px;color:#b48a3c;cursor:pointer">★</button>' +
          '</div>' +
          '<div class="zikr-text">' +
          (typeof esc === 'function' ? esc(ar) : ar) +
          '</div>' +
          (tr ? '<p class="zikr-tr">' + (typeof esc === 'function' ? esc(tr) : tr) + '</p>' : '') +
          '<div class="counter">' +
          '<button type="button" class="zplay" onclick="(async()=>{var d=await ensureAzkar();var it=d[' +
          m.c +
          '].chapters[' +
          m.h +
          '].items[' +
          m.k +
          '];var b=this;if(window.zBtn===b){zstop();return}zstop();window.zBtn=b;b.textContent=\'■\';var seq=window.zSeq;var urls=it.ayah&&it.ayah.length?it.ayah:(it.audio?[it.audio]:null);if(urls){let n=0;const next=()=>{if(seq!==zSeq)return;if(n>=urls.length){zstop();return}const a=new Audio(urls[n++]);zAudio=a;a.onended=next;a.onerror=()=>zstop();a.play().catch(()=>zstop())};next()}else{try{const u=new SpeechSynthesisUtterance(it.ar.replace(/[﴿﴾*]/g,\' \'));u.lang=\'ar\';u.onend=()=>zstop();speechSynthesis.speak(u)}catch{zstop()}}})()">▶ گوێگرتن</button>' +
          '<button type="button" class="tab" onclick="openChapter(' +
          m.c +
          ',' +
          m.h +
          ')">کردنەوە</button>' +
          '</div></div>'
        );
      })
      .join('');
  };

  /* ---------- Counter reset ---------- */
  window.zikrReset = function (btn) {
    var counter = btn.previousElementSibling;
    if (!counter || !counter.dataset) return;
    var target = Math.max(1, Number(counter.dataset.target) || 1);
    counter.dataset.current = '0';
    counter.style.background = '';
    var label =
      typeof znum === 'function' ? znum(0) + ' / ' + znum(target) : '0 / ' + target;
    counter.textContent = label;
  };

  /* ---------- Patch openChapter: inject star + reset ---------- */
  function enhanceCards(i, j) {
    var list = document.getElementById('detailList');
    if (!list) return;
    var cards = list.querySelectorAll('.card[id^="zc"]');
    cards.forEach(function (card, k) {
      // bookmark button on title row
      if (!card.querySelector('.zmark')) {
        var head = card.querySelector('b');
        if (head) {
          var wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px';
          head.parentNode.insertBefore(wrap, head);
          wrap.appendChild(head);
          var star = document.createElement('button');
          star.type = 'button';
          star.className = 'zmark';
          star.style.cssText =
            'border:0;background:transparent;font-size:22px;cursor:pointer;line-height:1;padding:0 4px';
          var on = isMarked(i, j, k);
          star.textContent = on ? '★' : '☆';
          star.style.color = on ? '#b48a3c' : '#71857a';
          star.title = on ? 'لابردنی نیشانە' : 'نیشانەکردن';
          star.onclick = function (e) {
            e.stopPropagation();
            var now = toggleMark(i, j, k, (card.querySelector('.zikr-text') || {}).textContent || '', '');
            star.textContent = now ? '★' : '☆';
            star.style.color = now ? '#b48a3c' : '#71857a';
          };
          wrap.appendChild(star);
        }
      }
      // reset next to counter
      var counter = card.querySelector('.counter');
      if (counter && !counter.querySelector('.zreset')) {
        var tickBtn = counter.querySelector('button[data-target]');
        if (tickBtn) {
          var reset = document.createElement('button');
          reset.type = 'button';
          reset.className = 'zreset';
          reset.title = 'ڕیستاری ژماردن';
          reset.textContent = '↺';
          reset.style.cssText =
            'width:52px;height:52px;border:0;border-radius:50%;background:#6b7c74;color:#fff;font-size:22px;cursor:pointer';
          reset.onclick = function (e) {
            e.stopPropagation();
            tickBtn.dataset.current = '0';
            tickBtn.style.background = '';
            var target = Math.max(1, Number(tickBtn.dataset.target) || 1);
            tickBtn.textContent =
              typeof znum === 'function' ? znum(0) + ' / ' + znum(target) : '0 / ' + target;
          };
          // insert right after count button
          if (tickBtn.nextSibling) counter.insertBefore(reset, tickBtn.nextSibling);
          else counter.appendChild(reset);
        }
      }
    });
  }

  function patchOpenChapter() {
    if (typeof window.openChapter !== 'function' || window.openChapter.__enhanced) return;
    var orig = window.openChapter;
    window.openChapter = async function (i, j) {
      var ret = await orig.apply(this, arguments);
      setTimeout(function () {
        enhanceCards(i, j);
      }, 0);
      setTimeout(function () {
        enhanceCards(i, j);
      }, 80);
      return ret;
    };
    window.openChapter.__enhanced = true;
  }

  function patchShowCategories() {
    if (typeof window.showCategories !== 'function' || window.showCategories.__enhanced) return;
    var orig = window.showCategories;
    window.showCategories = async function () {
      var ret = await orig.apply(this, arguments);
      setTimeout(function () {
        var box = document.getElementById('zikrList');
        if (!box) return;
        if (box.querySelector('.zmarks-entry')) return;
        var marks = loadMarks();
        var el = document.createElement('div');
        el.className = 'zikr-item zmarks-entry';
        el.style.cssText = 'border-color:#e4d5ad;background:linear-gradient(135deg,#fff,#fbf5e7)';
        el.onclick = function () {
          zikrShowMarks();
        };
        el.innerHTML =
          '<b>★ نیشانکراوەکان</b><div class="muted">' +
          marks.length +
          ' زیکری نیشانکراو</div>';
        box.insertBefore(el, box.firstChild);
      }, 50);
      return ret;
    };
    window.showCategories.__enhanced = true;
  }

  function patchEnsureAzkar() {
    if (typeof window.ensureAzkar !== 'function' || window.ensureAzkar.__enhanced) return;
    var orig = window.ensureAzkar;
    window.ensureAzkar = async function () {
      var data = await orig.apply(this, arguments);
      fillBadini(data);
      return data;
    };
    window.ensureAzkar.__enhanced = true;
  }

  function boot() {
    patchEnsureAzkar();
    patchOpenChapter();
    patchShowCategories();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50);
      setTimeout(boot, 400);
      setTimeout(boot, 1200);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 400);
    setTimeout(boot, 1200);
  }
  var tries = 0;
  var t = setInterval(function () {
    boot();
    if (++tries > 40) clearInterval(t);
  }, 250);
})();
