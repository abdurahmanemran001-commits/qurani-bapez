/* ai-shari.js v1 — UI for «ئەی ئای شەرعی» (API hook later) */
(function () {
  if (window.__aiShariV1) return;
  window.__aiShariV1 = true;

  var KEY = 'ai_shari_v1';
  var history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) { history = []; }

  /* Placeholder: replace with real API later */
  window.AI_SHARI_CONFIG = window.AI_SHARI_CONFIG || {
    endpoint: '', /* e.g. 'https://your-api.example.com/shari' */
    enabled: false
  };

  function saveHist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(history.slice(-40)));
    } catch (e) {}
  }

  function $(id) { return document.getElementById(id); }

  function injectCss() {
    if ($('aiShariCss')) return;
    var s = document.createElement('style');
    s.id = 'aiShariCss';
    s.textContent = [
      'body:has(#aiShari.active) .top{display:none!important}',
      '.phone:has(#aiShari.active) .status,.phone:has(#aiShari.active) .appbar,.phone:has(#aiShari.active) .bottom{display:none!important}',
      '.phone:has(#aiShari.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}',
      '#aiShari{display:flex;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#aiShari .ai-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;flex-shrink:0}',
      '#aiShari .ai-head h2{margin:0;font-size:17px;font-weight:800}',
      '#aiShari .ai-head .ai-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#aiShari .ai-back{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 12px;font-size:14px;cursor:pointer}',
      '#aiShari .ai-clear{border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#aiShari .ai-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}',
      '#aiShari .ai-bubble{max-width:92%;padding:11px 13px;border-radius:14px;font-size:14px;line-height:1.75;white-space:pre-wrap;word-break:break-word}',
      '#aiShari .ai-bubble.user{align-self:flex-start;background:#176b4b;color:#fff;border-bottom-right-radius:4px}',
      '#aiShari .ai-bubble.bot{align-self:flex-end;background:#fff;color:#1a2e24;border:1px solid #d5e3db;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.04)}',
      '#aiShari .ai-bubble.sys{align-self:center;background:#eef4f0;color:#3d5a4c;font-size:12px;text-align:center;max-width:100%}',
      '#aiShari .ai-bubble.loading{opacity:.7}',
      '#aiShari .ai-foot{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce8e1;display:flex;gap:8px;align-items:flex-end}',
      '#aiShari .ai-input{flex:1;min-height:44px;max-height:120px;resize:none;border:1px solid #c5d5cc;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;line-height:1.5;background:#f8fbf9}',
      '#aiShari .ai-send{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:12px 16px;font-weight:800;font-size:14px;cursor:pointer;flex-shrink:0}',
      '#aiShari .ai-send:disabled{opacity:.5;cursor:not-allowed}',
      '#aiShari .ai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px;flex-shrink:0}',
      '#aiShari .ai-chip{border:1px solid #c5d5cc;background:#fff;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1a3d2e}',
      '.section-choice.ai-shari-choice{border-color:#b8d4c8;background:linear-gradient(135deg,#fff,#eef7f2)}',
      '.section-choice.ai-shari-choice .choice-icon{background:#d8eee4;color:#176b4b}'
    ].join('\n');
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
    if (!history.length) {
      box.innerHTML =
        '<div class="ai-bubble sys">سڵاو. من یاریدەدەری شەرعیم — تەنها پرسیاری پەیوەندیدار بە ئیسلام وەڵام دەدەمەوە.\n\n' +
        '⚠️ ئەمە جێگەی موفتی ناگرێتەوە. بۆ فەتوای گەورە بۆ زانای متمانەپێکراو بڕۆ.</div>';
      return;
    }
    box.innerHTML = history.map(function (m) {
      var cls = m.role === 'user' ? 'user' : (m.role === 'sys' ? 'sys' : 'bot');
      return '<div class="ai-bubble ' + cls + '">' + esc(m.text) + '</div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function build() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    v.innerHTML =
      '<div class="ai-head">' +
      '<div><h2>☪ ئەی ئای شەرعی</h2><div class="ai-sub">تەنها وەڵامی دینی ئیسلام</div></div>' +
      '<div style="display:flex;gap:6px">' +
      '<button type="button" class="ai-clear" data-act="clear">پاککردنەوە</button>' +
      '<button type="button" class="ai-back" data-act="back">‹ بەشەکان</button>' +
      '</div></div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<div class="ai-chips" id="aiChips">' +
      '<button type="button" class="ai-chip" data-q="نوێژی بەیانی چەند ڕکاتە؟">نوێژی بەیانی</button>' +
      '<button type="button" class="ai-chip" data-q="زیکری بەیانیان چین؟">زیکری بەیانیان</button>' +
      '<button type="button" class="ai-chip" data-q="حکمەی ڕوقیەی شەرعی چییە؟">ڕوقیە</button>' +
      '<button type="button" class="ai-chip" data-q="چۆن تەوبە دەکرێت؟">تەوبە</button>' +
      '</div>' +
      '<div class="ai-foot">' +
      '<textarea class="ai-input" id="aiInput" rows="1" placeholder="پرسیاری شەرعی بنووسە..."></textarea>' +
      '<button type="button" class="ai-send" id="aiSend" data-act="send">ناردن</button>' +
      '</div>';
    renderMsgs();
    var input = $('aiInput');
    if (input) {
      input.onkeydown = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      };
    }
  }

  function onClick(e) {
    var el = e.target.closest('[data-act], [data-q]');
    if (!el || !$('aiShari') || !$('aiShari').contains(el)) return;
    var act = el.getAttribute('data-act');
    var q = el.getAttribute('data-q');
    if (q) {
      $('aiInput').value = q;
      send();
      return;
    }
    if (act === 'back') {
      if (typeof showView === 'function') showView('startScreen', 'بەشەکان');
      return;
    }
    if (act === 'clear') {
      history = [];
      saveHist();
      renderMsgs();
      return;
    }
    if (act === 'send') send();
  }

  async function askApi(question) {
    var cfg = window.AI_SHARI_CONFIG || {};
    if (cfg.enabled && cfg.endpoint) {
      var res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history: history.slice(-10),
          lang: 'ku',
          scope: 'islam_only'
        })
      });
      if (!res.ok) throw new Error('api ' + res.status);
      var data = await res.json();
      return data.reply || data.message || data.text || 'وەڵام وەرنەگیرا.';
    }
    /* UI-only placeholder until API is connected */
    return (
      '✅ پرسیارەکەت وەرگیرا.\n\n' +
      'ئێستا تەنها ڕووکار (UI) ئامادەیە. دواتر APIی شەرعی پێوە دەبەسترێت تا وەڵامی تەواو بداتەوە.\n\n' +
      'پرسیارەکەت:\n«' + question + '»\n\n' +
      'کاتێک API کار بکات، وەڵام تەنها لە چوارچێوەی قورئان و سوننەت و فیقھی ئیسلامی دەبێت.'
    );
  }

  function send() {
    var input = $('aiInput');
    if (!input) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    history.push({ role: 'user', text: text });
    saveHist();
    renderMsgs();

    var box = $('aiMsgs');
    var loading = document.createElement('div');
    loading.className = 'ai-bubble bot loading';
    loading.id = 'aiLoading';
    loading.textContent = 'چاوەڕوان بە...';
    if (box) {
      box.appendChild(loading);
      box.scrollTop = box.scrollHeight;
    }
    var sendBtn = $('aiSend');
    if (sendBtn) sendBtn.disabled = true;

    askApi(text)
      .then(function (reply) {
        history.push({ role: 'bot', text: reply });
        saveHist();
        renderMsgs();
      })
      .catch(function () {
        history.push({ role: 'bot', text: 'هەڵە ڕوویدا. دووبارە هەوڵ بدەرەوە یان ئینتەرنێت بپشکنە.' });
        saveHist();
        renderMsgs();
      })
      .finally(function () {
        if (sendBtn) sendBtn.disabled = false;
        var ld = $('aiLoading');
        if (ld) ld.remove();
      });
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
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice ai-shari-choice';
    b.innerHTML =
      '<span class="choice-icon">☪</span>' +
      '<span class="choice-copy"><b>ئەی ئای شەرعی</b>' +
      '<small>پرسیاری دینی بپرسە — تەنها وەڵامی ئیسلامی</small></span>' +
      '<span class="choice-arrow">‹</span>';
    b.onclick = function () { window.enterAiShari(); };
    box.appendChild(b);
    return true;
  }

  function start() {
    injectCss();
    document.addEventListener('click', onClick);
    var n = 0;
    var iv = setInterval(function () {
      addCard();
      if (++n > 25) clearInterval(iv);
    }, 400);
    var box = document.querySelector('#startScreen .section-choices');
    if (box) {
      try {
        new MutationObserver(function () { addCard(); }).observe(box, { childList: true });
      } catch (e) {}
    }
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
