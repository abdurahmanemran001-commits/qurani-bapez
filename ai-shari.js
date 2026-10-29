/* ai-shari.js v8 — offline + direct Gemini (AIza) + optional Groq + RAG with timeout */
(function () {
  if (window.__aiShariV8) return;
  window.__aiShariV8 = true;

  var KEY = 'ai_shari_v1';
  var CFG_KEY = 'ai_shari_cfg_v1';
  var history = [];
  try {
    history = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) { history = []; }

  function loadCfg() {
    try {
      var c = JSON.parse(localStorage.getItem(CFG_KEY) || '{}');
      return {
        provider: c.provider || 'offline',
        apiKey: c.apiKey || '',
        model: c.model || 'gemini-2.0-flash'
      };
    } catch (e) {
      return { provider: 'offline', apiKey: '', model: 'gemini-2.0-flash' };
    }
  }
  function saveCfg(c) {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch (e) {}
  }

  var SYSTEM_PROMPT =
    'تۆ یاریدەدەرێکی شەرعیت بۆ ئەپی قورئان. تەنها بە کوردی سۆرانی وەڵام بدەرەوە. ' +
    'تەنها لەسەر بابەتی ئیسلام (قورئان، سوننەت، فیقھ، عەقیدە، ئەخلاق، نوێژ، ڕۆژوو…). ' +
    'ئەگەر پرسیارەکە شەرعی نییە، بە ڕێزییەوە بڵێ تەنها وەڵامی شەرعی دەدەیتەوە. ' +
    'جێگەی موفتی مەگرەوە؛ بۆ فەتوای قورس بڵێ بۆ زانای متمانەپێکراو بڕۆ. ' +
    'وەڵامەکان کورت و ڕوون و سودبەخش بن.';

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
    if (!KB.length) return 'زانیاری ناوخۆیی بار نەبووە.';
    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var item = KB[i], score = 0;
      var keys = item.keys || [];
      for (var j = 0; j < keys.length; j++) {
        var k = norm(keys[j]);
        if (!k || k.length < 2) continue;
        if (nq.indexOf(k) >= 0) { score += 50 + k.length * 3; continue; }
        var parts = k.split(' ').filter(function (p) { return p.length > 1; });
        if (!parts.length) continue;
        var hit = 0;
        for (var p = 0; p < parts.length; p++) {
          if (nq.indexOf(parts[p]) >= 0) hit++;
        }
        if (hit === parts.length && parts.length > 1) score += 40 + hit * 8;
        else if (hit >= Math.ceil(parts.length * 0.7) && parts.length > 1) score += 15 + hit * 5;
        else if (hit === 1 && parts.length === 1 && parts[0].length >= 4) score += 10 + parts[0].length;
      }
      if (score > bestScore) { bestScore = score; best = item; }
    }
    if (best && bestScore >= 20) {
      return best.a + '\n\n—\n📚 ناوخۆیی (بێ پارە). بۆ فەتوای ورد بۆ زانا بڕۆ.';
    }
    return 'لە زانیاری ناوخۆییدا وەڵام نەدۆزرایەوە.\n\nلە ⚙ کلیلی Gemini (AIza...) دابنێ بۆ وەڵامی زیرەک.';
  }

  function withTimeout(promise, ms, label) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () {
        reject(new Error((label || 'AI') + ': کات تەواو بوو (' + (ms / 1000) + ' چرکە)'));
      }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  function geminiAnswer(q, cfg) {
    var model = cfg.model || 'gemini-2.0-flash';
    if (model.indexOf('llama') >= 0 || model.indexOf('gpt-oss') >= 0) model = 'gemini-2.0-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(cfg.apiKey);
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: q }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error && data.error.message) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        var parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
        var t = parts && parts.map(function (p) { return p.text || ''; }).join('');
        if (!t) throw new Error('وەڵام بەتاڵ بوو');
        return t.trim() + '\n\n—\n⚡ Gemini (خۆڕایی)';
      });
    });
  }

  function groqAnswer(q, cfg) {
    return fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.apiKey
      },
      body: JSON.stringify({
        model: cfg.model || 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: q }
        ]
      })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error && data.error.message) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        var t = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!t) throw new Error('وەڵام بەتاڵ بوو');
        return t.trim() + '\n\n—\n⚡ Groq (خۆڕایی)';
      });
    });
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
    s.textContent = 'body:has(#aiShari.active) .top{display:none!important}.phone:has(#aiShari.active) .status,.phone:has(#aiShari.active) .appbar,.phone:has(#aiShari.active) .bottom{display:none!important}.phone:has(#aiShari.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}#aiShari{display:flex;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}#aiShari .ai-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;flex-shrink:0}#aiShari .ai-head h2{margin:0;font-size:17px;font-weight:800}#aiShari .ai-head .ai-sub{font-size:11px;opacity:.9;margin-top:2px}#aiShari .ai-back,#aiShari .ai-clear,#aiShari .ai-set{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}#aiShari .ai-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}#aiShari .ai-bubble{max-width:92%;padding:11px 13px;border-radius:14px;font-size:14px;line-height:1.75;white-space:pre-wrap;word-break:break-word}#aiShari .ai-bubble.user{align-self:flex-start;background:#176b4b;color:#fff;border-bottom-right-radius:4px}#aiShari .ai-bubble.bot{align-self:flex-end;background:#fff;color:#1a2e24;border:1px solid #d5e3db;border-bottom-left-radius:4px}#aiShari .ai-bubble.sys{align-self:center;background:#eef4f0;color:#3d5a4c;font-size:12px;text-align:center;max-width:100%}#aiShari .ai-foot{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce8e1;display:flex;gap:8px;align-items:flex-end}#aiShari .ai-input{flex:1;min-height:44px;max-height:120px;resize:none;border:1px solid #c5d5cc;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;line-height:1.5;background:#f8fbf9}#aiShari .ai-send{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:12px 16px;font-weight:800;font-size:14px;cursor:pointer}#aiShari .ai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 8px}#aiShari .ai-chip{border:1px solid #c5d5cc;background:#fff;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1a3d2e}#aiShari .ai-panel{padding:14px;background:#fff;border-bottom:1px solid #dce8e1;display:none}#aiShari .ai-panel.open{display:block}#aiShari .ai-panel label{display:block;font-size:12px;font-weight:700;margin:8px 0 4px;color:#1a3d2e}#aiShari .ai-panel input,#aiShari .ai-panel select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #c5d5cc;border-radius:10px;font-size:14px;font-family:inherit}#aiShari .ai-panel .hint{font-size:11px;color:#5a7a6a;margin-top:6px;line-height:1.5}#aiShari .ai-panel .save{margin-top:12px;border:0;background:#176b4b;color:#fff;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer}.section-choice.ai-shari-choice{border-color:#b8d4c8;background:linear-gradient(135deg,#fff,#eef7f2)}.section-choice.ai-shari-choice .choice-icon{background:#d8eee4;color:#176b4b}';
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

  function modeLabel(cfg) {
    if (cfg.provider === 'gemini' && cfg.apiKey) return 'Gemini خۆڕایی';
    if (cfg.provider === 'groq' && cfg.apiKey) return 'Groq خۆڕایی';
    if (window.AiShariRag && window.AiShariRag.enabled()) return 'سێرڤەر (لەوانەیە درەنگ بێت)';
    return 'ناوخۆیی · بێ پارە';
  }

  function renderMsgs() {
    var box = $('aiMsgs');
    if (!box) return;
    var n = getKB().length;
    var cfg = loadCfg();
    if (!history.length) {
      box.innerHTML =
        '<div class="ai-bubble sys">سڵاو! یاریدەدەری شەرعی.\n\n' +
        'ئێستا: <b>' + modeLabel(cfg) + '</b>\n' +
        (cfg.provider === 'gemini' && cfg.apiKey
          ? 'وەڵامی زیرەک بە Gemini.'
          : 'بۆ AIی زیرەک: ⚙ → کلیلی Gemini (AIza...) لە aistudio.google.com') +
        '\n\n⚠️ جێگەی موفتی ناگرێتەوە.</div>';
      return;
    }
    box.innerHTML = history.map(function (m) {
      var cls = m.role === 'user' ? 'user' : (m.role === 'sys' ? 'sys' : 'bot');
      return '<div class="ai-bubble ' + cls + '">' + esc(m.text) +
        (m.sources && window.AiShariRag ? window.AiShariRag.srcHtml(m.sources) : '') + '</div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function build() {
    injectCss();
    var v = ensureView();
    if (!v) return;
    var cfg = loadCfg();
    var n = getKB().length;
    v.innerHTML =
      '<div class="ai-head"><div><h2>☪ ئەی ئای شەرعی</h2><div class="ai-sub">' + modeLabel(cfg) + ' · ' + n + ' بابەت ناوخۆ</div></div>' +
      '<div style="display:flex;gap:6px">' +
      '<button type="button" class="ai-set" data-act="settings">⚙</button>' +
      '<button type="button" class="ai-clear" data-act="clear">پاککردنەوە</button>' +
      '<button type="button" class="ai-back" data-act="back">‹ بەشەکان</button></div></div>' +
      '<div class="ai-panel" id="aiPanel">' +
      '<label>شێواز</label>' +
      '<select id="aiProv">' +
      '<option value="offline">ناوخۆیی — وەڵامی ئامادە</option>' +
      '<option value="gemini">Gemini خۆڕایی (کلیلی AIza...)</option>' +
      '<option value="groq">Groq (کلیلی gsk_ — ئەگەر کار بکات)</option>' +
      '</select>' +
      '<label>کلیلی API</label>' +
      '<input id="aiKey" type="password" placeholder="AIza... یان gsk_..." autocomplete="off">' +
      '<label>مۆدێل</label>' +
      '<select id="aiModel">' +
      '<option value="gemini-2.0-flash">gemini-2.0-flash (پێشنیار)</option>' +
      '<option value="gemini-1.5-flash">gemini-1.5-flash</option>' +
      '<option value="gemini-2.5-flash">gemini-2.5-flash</option>' +
      '<option value="llama-3.1-8b-instant">llama-3.1-8b (Groq)</option>' +
      '</select>' +
      '<div class="hint">Gemini: aistudio.google.com → Create API key → کۆپی AIza...<br>دوای پاشەکەوت سەرەوە دەبێت بنووسێت: Gemini خۆڕایی</div>' +
      '<button type="button" class="save" data-act="saveCfg">پاشەکەوت</button>' +
      '</div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<div class="ai-chips">' +
      '<button type="button" class="ai-chip" data-q="نوێژی جەنازە چۆنە؟">جەنازە</button>' +
      '<button type="button" class="ai-chip" data-q="ووزو چۆن دەکرێت؟">ووزو</button>' +
      '<button type="button" class="ai-chip" data-q="چۆن تەوبە دەکرێت؟">تەوبە</button>' +
      '<button type="button" class="ai-chip" data-q="پێنج پایەی ئیسلام چین؟">پایەکانی ئیسلام</button>' +
      '</div>' +
      '<div class="ai-foot">' +
      '<textarea class="ai-input" id="aiInput" rows="1" placeholder="پرسیاری شەرعی بنووسە..."></textarea>' +
      '<button type="button" class="ai-send" data-act="send">ناردن</button></div>';

    $('aiProv').value = cfg.provider || 'offline';
    $('aiKey').value = cfg.apiKey || '';
    if (cfg.model) try { $('aiModel').value = cfg.model; } catch (e) {}
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
    if (act === 'settings') {
      var p = $('aiPanel');
      if (p) p.classList.toggle('open');
      return;
    }
    if (act === 'saveCfg') {
      var key = ($('aiKey').value || '').trim();
      var prov = $('aiProv').value;
      if (key.indexOf('AIza') === 0) prov = 'gemini';
      if (key.indexOf('gsk_') === 0) prov = 'groq';
      if ((prov === 'gemini' || prov === 'groq') && !key) {
        history.push({ role: 'sys', text: '⚠️ کلیلی API دانەنرا.' });
        saveHist();
        renderMsgs();
        return;
      }
      var model = $('aiModel').value;
      if (prov === 'gemini' && model.indexOf('llama') >= 0) model = 'gemini-2.0-flash';
      var cfg = { provider: prov, apiKey: key, model: model };
      saveCfg(cfg);
      $('aiPanel').classList.remove('open');
      history.push({ role: 'sys', text: 'پاشەکەوت کرا: ' + modeLabel(cfg) + (prov === 'gemini' ? '\nئێستا پرسیار بکە — وەڵام لە Gemini دێت.' : '') });
      saveHist();
      build();
      return;
    }
    if (act === 'send') send();
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

    var cfg = loadCfg();

    if (cfg.provider === 'gemini' && cfg.apiKey) {
      history.push({ role: 'bot', text: '… چاوەڕێ بە (Gemini)' });
      renderMsgs();
      withTimeout(geminiAnswer(text, cfg), 25000, 'Gemini').then(function (ans) {
        history.pop();
        history.push({ role: 'bot', text: ans });
        saveHist();
        renderMsgs();
      }).catch(function (err) {
        history.pop();
        history.push({ role: 'bot', text: '⚠️ Gemini: ' + (err.message || err) + '\n\n—— ناوخۆیی ——\n' + offlineAnswer(text) });
        saveHist();
        renderMsgs();
      });
      return;
    }

    if (cfg.provider === 'groq' && cfg.apiKey) {
      history.push({ role: 'bot', text: '… چاوەڕێ بە (Groq)' });
      renderMsgs();
      withTimeout(groqAnswer(text, cfg), 25000, 'Groq').then(function (ans) {
        history.pop();
        history.push({ role: 'bot', text: ans });
        saveHist();
        renderMsgs();
      }).catch(function (err) {
        history.pop();
        history.push({ role: 'bot', text: '⚠️ Groq: ' + (err.message || err) + '\n\n—— ناوخۆیی ——\n' + offlineAnswer(text) });
        saveHist();
        renderMsgs();
      });
      return;
    }

    if (window.AiShariRag && window.AiShariRag.enabled()) {
      history.push({ role: 'bot', text: '… چاوەڕێ بە' });
      renderMsgs();
      withTimeout(window.AiShariRag.ask(text, function (s) {
        var last = history[history.length - 1];
        if (last && last.role === 'bot') { last.text = s; renderMsgs(); }
      }), 30000, 'سێرڤەر').then(function (r) {
        history.pop();
        if (r && r.kind === 'error') {
          history.push({ role: 'bot', text: (r.text || 'هەڵە') + '\n\n—— ناوخۆیی ——\n' + offlineAnswer(text) });
        } else {
          history.push({ role: 'bot', text: (r && r.text) || offlineAnswer(text), sources: (r && r.sources) || [] });
        }
        saveHist();
        renderMsgs();
      }).catch(function (err) {
        history.pop();
        history.push({ role: 'bot', text: '⚠️ ' + (err.message || err) + '\n\n—— ناوخۆیی ——\n' + offlineAnswer(text) });
        saveHist();
        renderMsgs();
      });
      return;
    }

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
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'section-choice ai-shari-choice';
    b.innerHTML = '<span class="choice-icon">☪</span><span class="choice-copy"><b>ئەی ئای شەرعی</b><small>ناوخۆیی یان Gemini خۆڕایی</small></span><span class="choice-arrow">‹</span>';
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
