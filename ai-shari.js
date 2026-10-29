/* ai-shari.js v5 — better matching + offline only */
(function () {
  if (window.__aiShariV5) return;
  window.__aiShariV5 = true;

  var KEY = 'ai_shari_v1';
  var history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) { history = []; }

  function getKB() {
    var base = window.__AI_SHARI_KB_BASE || [];
    var extra = window.__AI_SHARI_KB_EXTRA || [];
    return base.concat(extra);
  }

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[ًٌٍَُِْـ]/g, '')
      .replace(/ە/g, 'ه')
      .replace(/ێ/g, 'ي')
      .replace(/ۆ/g, 'و')
      .replace(/[؟?!.،,;:\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function offlineAnswer(q) {
    var nq = norm(q);
    if (!nq) return 'تکایە پرسیارێک بنووسە.';
    var KB = getKB();
    if (!KB.length) {
      return 'زانیارییەکان هێشتا بار نەبوون. تاب دابخە و دووبارە بیکەرەوە.';
    }

    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var item = KB[i], score = 0;
      var keys = item.keys || [];
      for (var j = 0; j < keys.length; j++) {
        var k = norm(keys[j]);
        if (!k || k.length < 2) continue;
        if (nq.indexOf(k) >= 0) {
          score += 50 + k.length * 3;
          continue;
        }
        var parts = k.split(' ').filter(function (p) { return p.length > 1; });
        if (!parts.length) continue;
        var hit = 0;
        for (var p = 0; p < parts.length; p++) {
          if (nq.indexOf(parts[p]) >= 0) hit++;
        }
        if (hit === parts.length && parts.length > 1) {
          score += 40 + hit * 8;
        } else if (hit >= Math.ceil(parts.length * 0.7) && parts.length > 1) {
          score += 15 + hit * 5;
        } else if (hit === 1 && parts.length === 1 && parts[0].length >= 4) {
          score += 10 + parts[0].length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    if (best && bestScore >= 20) {
      return best.a + '\n\n—\n📚 زانیاری ناو ئەپ (بێ پارە). بۆ فەتوای ورد بۆ زانا بڕۆ.';
    }

    return (
      'وەڵامی گونجاوم بۆ ئەم پرسیارە نەدۆزیەوە لە ' + KB.length + ' بابەتدا.\n\n' +
      'هەوڵبدە وشەی سەرەکی بنووسیت، بۆ نموونە:\n' +
      '• نوێژی جەنازە\n• ووزو\n• ڕۆژوو\n• سورەتی یوسف\n• تەوبە\n\n' +
      '⚠️ ئەمە مۆدێلی گەورەی AI نییە — کۆمەڵە وەڵامی ئامادەیە. بۆ فەتوا بۆ زانا بڕۆ.'
    );
  }

  function saveHist() {
    try { localStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {}
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' })[c];
    });
  }

  function injectCss() {
    if ($('aiShariCss')) return;
    var s = document.createElement('style');
    s.id = 'aiShariCss';
    s.textContent = 'body:has(#aiShari.active) .top{display:none!important}.phone:has(#aiShari.active) .status,.phone:has(#aiShari.active) .appbar,.phone:has(#aiShari.active) .bottom{display:none!important}.phone:has(#aiShari.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}#aiShari{display:flex;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}#aiShari .ai-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;flex-shrink:0}#aiShari .ai-head h2{margin:0;font-size:17px;font-weight:800}#aiShari .ai-head .ai-sub{font-size:11px;opacity:.9;margin-top:2px}#aiShari .ai-back,#aiShari .ai-clear{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}#aiShari .ai-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}#aiShari .ai-bubble{max-width:92%;padding:11px 13px;border-radius:14px;font-size:14px;line-height:1.75;white-space:pre-wrap;word-break:break-word}#aiShari .ai-bubble.user{align-self:flex-start;background:#176b4b;color:#fff;border-bottom-right-radius:4px}#aiShari .ai-bubble.bot{align-self:flex-end;background:#fff;color:#1a2e24;border:1px solid #d5e3db;border-bottom-left-radius:4px}#aiShari .ai-bubble.sys{align-self:center;background:#eef4f0;color:#3d5a4c;font-size:12px;text-align:center;max-width:100%}#aiShari .ai-foot{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce8e1;display:flex;gap:8px;align-items:flex-end}#aiShari .ai-input{flex:1;min-height:44px;max-height:120px;resize:none;border:1px solid #c5d5cc;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;line-height:1.5;background:#f8fbf9}#aiShari .ai-send{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:12px 16px;font-weight:800;font-size:14px;cursor:pointer}#aiShari .ai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 8px}#aiShari .ai-chip{border:1px solid #c5d5cc;background:#fff;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1a3d2e}.section-choice.ai-shari-choice{border-color:#b8d4c8;background:linear-gradient(135deg,#fff,#eef7f2)}.section-choice.ai-shari-choice .choice-icon{background:#d8eee4;color:#176b4b}';
    document.head.appendChild(s);
  }

  function ensureView() {
    var main = document.querySelector('.main');
    if (!main) return null;
    var v = $('aiShari');
    if (v) return v;
    v = document.createElement('div');
    v.id = 'aiShari';
    v.className = 'view';
    main.appendChild(v);
    return v;
  }

  function renderMsgs() {
    var box = $('aiMsgs');
    if (!box) return;
    var n = getKB().length;
    if (!history.length) {
      box.innerHTML = '<div class="ai-bubble sys">سڵاو! من یاریدەدەری شەرعیم — <b>بەبێ پارە</b>.\n\nئێستا ' + n + ' بابەتم تێدایە.\nوشەی سەرەکی بەکاربهێنە (وەک: جەنازە، ووزو، ڕۆژوو).\n\n⚠️ مۆدێلی گەورەی AI نییە — جێگەی موفتی ناگرێتەوە.</div>';
      return;
    }
    box.innerHTML = history.map(function (m) {
      var cls = m.role === 'user' ? 'user' : (m.role === 'sys' ? 'sys' : 'bot');
      return '<div class="ai-bubble ' + cls + '">' + esc(m.text) + '</div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function build() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var n = getKB().length;
    v.innerHTML =
      '<div class="ai-head"><div><h2>☪ ئەی ئای شەرعی</h2><div class="ai-sub">بەبێ پارە · ' + n + ' بابەت</div></div>' +
      '<div style="display:flex;gap:6px"><button type="button" class="ai-clear" data-act="clear">پاککردنەوە</button>' +
      '<button type="button" class="ai-back" data-act="back">‹ بەشەکان</button></div></div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<div class="ai-chips">' +
      '<button type="button" class="ai-chip" data-q="نوێژی جەنازە چۆنە؟">جەنازە</button>' +
      '<button type="button" class="ai-chip" data-q="ووزو چۆن دەکرێت؟">ووزو</button>' +
      '<button type="button" class="ai-chip" data-q="چۆن تەوبە دەکرێت؟">تەوبە</button>' +
      '<button type="button" class="ai-chip" data-q="پێنج پایەی ئیسلام چین؟">پایەکانی ئیسلام</button>' +
      '<button type="button" class="ai-chip" data-q="نوێژی بەیانی چەند ڕکاتە؟">نوێژی بەیانی</button>' +
      '</div>' +
      '<div class="ai-foot"><textarea class="ai-input" id="aiInput" rows="1" placeholder="پرسیاری شەرعی بنووسە..."></textarea>' +
      '<button type="button" class="ai-send" data-act="send">ناردن</button></div>';
    renderMsgs();
    var input = $('aiInput');
    if (input) input.onkeydown = function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    };
  }

  function onClick(e) {
    var el = e.target.closest('[data-act], [data-q]');
    if (!el || !$('aiShari') || !$('aiShari').contains(el)) return;
    var act = el.getAttribute('data-act'), q = el.getAttribute('data-q');
    if (q) { $('aiInput').value = q; send(); return; }
    if (act === 'back') { if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); return; }
    if (act === 'clear') { history = []; saveHist(); renderMsgs(); return; }
    if (act === 'send') send();
  }

  function send() {
    var input = $('aiInput');
    if (!input) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    history.push({ role: 'user', text: text });
    history.push({ role: 'bot', text: offlineAnswer(text) });
    saveHist();
    renderMsgs();
  }

  window.enterAiShari = function () {
    injectCss();
    if (!ensureView()) return;
    if (typeof showView === 'function') showView('aiShari', 'ئەی ئای شەرعی');
    build();
  };

  function addCard() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box || box.querySelector('.ai-shari-choice')) return !!box;
    var n = getKB().length;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice ai-shari-choice';
    b.innerHTML = '<span class="choice-icon">☪</span><span class="choice-copy"><b>ئەی ئای شەرعی</b><small>بەبێ پارە · ' + n + ' بابەت</small></span><span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterAiShari(); };
    box.appendChild(b);
    return true;
  }

  function start() {
    injectCss();
    document.addEventListener('click', onClick);
    var n = 0, iv = setInterval(function () { addCard(); if (++n > 25) clearInterval(iv); }, 400);
    var box = document.querySelector('#startScreen .section-choices');
    if (box) { try { new MutationObserver(function () { addCard(); }).observe(box, { childList: true }); } catch (e) {} }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
