/* ai-shari.js v2 — UI + OpenAI-compatible API (Islam-only system prompt) */
(function () {
  if (window.__aiShariV2) return;
  window.__aiShariV2 = true;

  var KEY = 'ai_shari_v1';
  var CFG_KEY = 'ai_shari_cfg';

  var history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) { history = []; }

  var cfg = {
    enabled: true,
    provider: 'xai', /* xai | openai | openrouter | custom */
    apiKey: '',
    model: 'grok-2-latest',
    baseUrl: 'https://api.x.ai/v1',
    settingsOpen: false
  };
  try {
    var c = JSON.parse(localStorage.getItem(CFG_KEY) || '{}');
    Object.keys(cfg).forEach(function (k) {
      if (c[k] !== undefined) cfg[k] = c[k];
    });
  } catch (e) {}

  var PROVIDERS = {
    xai: { name: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1', model: 'grok-2-latest' },
    openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    openrouter: { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
    custom: { name: 'Custom', baseUrl: '', model: '' }
  };

  var SYSTEM_PROMPT =
    'تۆ یاریدەدەرێکی شەرعیت بۆ بەرنامەیەکی ئیسلامی. تەنها و تەنها پرسیاری پەیوەندیدار بە دینی ئیسلام وەڵام بدەرەوە (قورئان، سوننەت، فیقھ، عەقیدە، ئەخلاق، نوێژ، ڕۆژوو، زەکات، حەج، زیکر، ڕوقیەی شەرعی، خێزان، موعامەلات).\n\n' +
    'ڕێساکان:\n' +
    '1) وەڵام بە کوردی سۆرانی بدەرەوە، ڕوون و ئارام.\n' +
    '2) ئەگەر پرسیارەکە پەیوەندی بە ئیسلامەوە نەبوو، بە نەرمی بڵێ: تەنها پرسیاری شەرعی وەڵام دەدەمەوە.\n' +
    '3) بۆ فەتوای قورس (تەلاق، میرات، خوێن، بازرگانی ئاڵۆز) بڵێ: بۆ وردەکاری بۆ زانای متمانەپێکراو بڕۆ؛ من جێگەی موفتی ناگرمەوە.\n' +
    '4) درۆ مەکە؛ ئەگەر دڵنیا نیت بڵێ نازانم.\n' +
    '5) ئایەت و حەدیس بە کورت و دروست بهێنەرەوە کاتێک گونجاو بێت.\n' +
    '6) وەڵام درێژ مەکەرەوە بێ پێویست؛ ٣–١٢ ڕستە زۆرجار بەسە.';

  function saveHist() {
    try { localStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {}
  }
  function saveCfg() {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
  }
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function injectCss() {
    if ($('aiShariCss')) return;
    var s = document.createElement('style');
    s.id = 'aiShariCss';
    s.textContent = [
      'body:has(#aiShari.active) .top{display:none!important}',
      '.phone:has(#aiShari.active) .status,.phone:has(#aiShari.active) .appbar,.phone:has(#aiShari.active) .bottom{display:none!important}',
      '.phone:has(#aiShari.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}',
      '#aiShari{display:flex;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}',
      '#aiShari .ai-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;flex-shrink:0}',
      '#aiShari .ai-head h2{margin:0;font-size:17px;font-weight:800}',
      '#aiShari .ai-head .ai-sub{font-size:11px;opacity:.9;margin-top:2px}',
      '#aiShari .ai-back,#aiShari .ai-clear,#aiShari .ai-cfg-btn{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}',
      '#aiShari .ai-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}',
      '#aiShari .ai-bubble{max-width:92%;padding:11px 13px;border-radius:14px;font-size:14px;line-height:1.75;white-space:pre-wrap;word-break:break-word}',
      '#aiShari .ai-bubble.user{align-self:flex-start;background:#176b4b;color:#fff;border-bottom-right-radius:4px}',
      '#aiShari .ai-bubble.bot{align-self:flex-end;background:#fff;color:#1a2e24;border:1px solid #d5e3db;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.04)}',
      '#aiShari .ai-bubble.sys{align-self:center;background:#eef4f0;color:#3d5a4c;font-size:12px;text-align:center;max-width:100%}',
      '#aiShari .ai-bubble.loading{opacity:.7}',
      '#aiShari .ai-foot{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce8e1;display:flex;gap:8px;align-items:flex-end}',
      '#aiShari .ai-input{flex:1;min-height:44px;max-height:120px;resize:none;border:1px solid #c5d5cc;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;line-height:1.5;background:#f8fbf9}',
      '#aiShari .ai-send{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:12px 16px;font-weight:800;font-size:14px;cursor:pointer;flex-shrink:0}',
      '#aiShari .ai-send:disabled{opacity:.5}',
      '#aiShari .ai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 8px;flex-shrink:0}',
      '#aiShari .ai-chip{border:1px solid #c5d5cc;background:#fff;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1a3d2e}',
      '#aiShari .ai-cfg{display:none;padding:12px 14px;background:#fff;border-bottom:1px solid #dce8e1;flex-shrink:0}',
      '#aiShari .ai-cfg.open{display:block}',
      '#aiShari .ai-cfg label{display:block;font-size:12px;font-weight:700;margin:8px 0 4px;color:#1a3d2e}',
      '#aiShari .ai-cfg input,#aiShari .ai-cfg select{width:100%;box-sizing:border-box;border:1px solid #c5d5cc;border-radius:10px;padding:9px 10px;font-size:13px;margin-bottom:4px}',
      '#aiShari .ai-cfg .ai-save{width:100%;margin-top:8px;border:0;background:#176b4b;color:#fff;border-radius:10px;padding:10px;font-weight:700;cursor:pointer}',
      '#aiShari .ai-cfg .ai-hint{font-size:11px;color:#5a6f66;line-height:1.6;margin-top:8px}',
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
      var keyHint = cfg.apiKey
        ? 'API بەستراوەتەوە — پرسیار بکە.'
        : 'بۆ وەڵامی ڕاستەقینە: ⚙ ڕێکخستن → کلیلی API دابنێ.';
      box.innerHTML =
        '<div class="ai-bubble sys">سڵاو. من یاریدەدەری شەرعیم — تەنها پرسیاری پەیوەندیدار بە ئیسلام وەڵام دەدەمەوە.\n\n' +
        keyHint +
        '\n\n⚠️ جێگەی موفتی ناگرێتەوە. بۆ فەتوای گەورە بۆ زانای متمانەپێکراو بڕۆ.</div>';
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
    v.innerHTML =
      '<div class="ai-head">' +
      '<div><h2>☪ ئەی ئای شەرعی</h2><div class="ai-sub">تەنها وەڵامی دینی ئیسلام</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">' +
      '<button type="button" class="ai-cfg-btn" data-act="cfg">⚙</button>' +
      '<button type="button" class="ai-clear" data-act="clear">پاککردنەوە</button>' +
      '<button type="button" class="ai-back" data-act="back">‹ بەشەکان</button>' +
      '</div></div>' +
      '<div class="ai-cfg' + (cfg.settingsOpen ? ' open' : '') + '" id="aiCfg">' +
      '<label>دابینکەر (Provider)</label>' +
      '<select id="aiProvider">' +
      Object.keys(PROVIDERS).map(function (k) {
        return '<option value="' + k + '"' + (cfg.provider === k ? ' selected' : '') + '>' + PROVIDERS[k].name + '</option>';
      }).join('') +
      '</select>' +
      '<label>Base URL</label>' +
      '<input type="text" id="aiBaseUrl" value="' + esc(cfg.baseUrl || '') + '" placeholder="https://api.x.ai/v1">' +
      '<label>مۆدێل</label>' +
      '<input type="text" id="aiModel" value="' + esc(cfg.model || '') + '" placeholder="grok-2-latest">' +
      '<label>کلیلی API</label>' +
      '<input type="password" id="aiKey" value="' + esc(cfg.apiKey || '') + '" placeholder="xai-... یان sk-..." autocomplete="off">' +
      '<button type="button" class="ai-save" data-act="saveCfg">پاشەکەوتکردنی ڕێکخستن</button>' +
      '<p class="ai-hint">کلیلەکە تەنها لە مۆبایل/وێبگەڕی تۆ پاشەکەوت دەبێت (localStorage). بۆ xAI: console.x.ai → API keys. بۆ OpenAI: platform.openai.com</p>' +
      '</div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<div class="ai-chips">' +
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
    var prov = $('aiProvider');
    if (prov) {
      prov.onchange = function () {
        var p = PROVIDERS[prov.value];
        if (!p) return;
        if (prov.value !== 'custom') {
          $('aiBaseUrl').value = p.baseUrl;
          $('aiModel').value = p.model;
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
    if (act === 'cfg') {
      cfg.settingsOpen = !cfg.settingsOpen;
      var p = $('aiCfg');
      if (p) p.classList.toggle('open', cfg.settingsOpen);
      saveCfg();
      return;
    }
    if (act === 'saveCfg') {
      cfg.provider = ($('aiProvider') && $('aiProvider').value) || cfg.provider;
      cfg.baseUrl = ($('aiBaseUrl') && $('aiBaseUrl').value.trim()) || cfg.baseUrl;
      cfg.model = ($('aiModel') && $('aiModel').value.trim()) || cfg.model;
      cfg.apiKey = ($('aiKey') && $('aiKey').value.trim()) || '';
      cfg.enabled = !!cfg.apiKey;
      saveCfg();
      cfg.settingsOpen = false;
      var panel = $('aiCfg');
      if (panel) panel.classList.remove('open');
      history.push({ role: 'sys', text: cfg.apiKey ? '✅ ڕێکخستن پاشەکەوت کرا. ئێستا دەتوانیت پرسیار بکەیت.' : '⚠️ کلیلی API دانەنرا — وەڵامی ڕاستەقینە نایەت.' });
      saveHist();
      renderMsgs();
      return;
    }
    if (act === 'send') send();
  }

  async function askApi(question) {
    if (!cfg.apiKey || !cfg.baseUrl) {
      return (
        'بۆ وەڵامی ڕاستەقینە کلیلی API پێویستە.\n\n' +
        '۱) دوگمەی ⚙ لە سەرەوە دابگرە\n' +
        '۲) دابینکەر هەڵبژێرە (xAI / OpenAI / OpenRouter)\n' +
        '۳) کلیلی API دابنێ و پاشەکەوتی بکە\n\n' +
        'پرسیارەکەت: «' + question + '»'
      );
    }

    var messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    history.slice(-12).forEach(function (m) {
      if (m.role === 'user') messages.push({ role: 'user', content: m.text });
      else if (m.role === 'bot') messages.push({ role: 'assistant', content: m.text });
    });
    /* last user already in history before call — avoid duplicate if already pushed */
    if (!messages.length || messages[messages.length - 1].content !== question) {
      messages.push({ role: 'user', content: question });
    }

    var url = cfg.baseUrl.replace(/\/$/, '') + '/chat/completions';
    var headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + cfg.apiKey
    };
    if (cfg.provider === 'openrouter') {
      headers['HTTP-Referer'] = location.origin || 'https://abdurahmanemran001-commits.github.io';
      headers['X-Title'] = 'AI Shari Quran App';
    }

    var res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: cfg.model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 900
      })
    });

    if (!res.ok) {
      var errText = '';
      try { errText = await res.text(); } catch (e) {}
      if (res.status === 401) throw new Error('کلیلی API هەڵەیە یان بەسەرچووە (401)');
      if (res.status === 429) throw new Error('زۆر داواکاری — کەمێک چاوەڕێ بکە (429)');
      throw new Error('هەڵەی API: ' + res.status + (errText ? ' — ' + errText.slice(0, 120) : ''));
    }

    var data = await res.json();
    var reply =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
      data.reply ||
      data.message ||
      '';
    if (!reply) throw new Error('وەڵام بەتاڵ بوو');
    return String(reply).trim();
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
      .catch(function (err) {
        history.push({ role: 'bot', text: '⚠️ ' + (err && err.message ? err.message : 'هەڵە ڕوویدا. دووبارە هەوڵ بدەرەوە.') });
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

  /* External config override (optional) */
  window.AI_SHARI_CONFIG = window.AI_SHARI_CONFIG || {};
  if (window.AI_SHARI_CONFIG.apiKey) cfg.apiKey = window.AI_SHARI_CONFIG.apiKey;
  if (window.AI_SHARI_CONFIG.baseUrl) cfg.baseUrl = window.AI_SHARI_CONFIG.baseUrl;
  if (window.AI_SHARI_CONFIG.model) cfg.model = window.AI_SHARI_CONFIG.model;
  if (window.AI_SHARI_CONFIG.provider) cfg.provider = window.AI_SHARI_CONFIG.provider;

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
