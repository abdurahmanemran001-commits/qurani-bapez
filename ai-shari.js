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
    return { provider: 'offline', apiKey: '', model: '' }; // direct keys removed: AI runs through the secure worker
  }
  function saveCfg(c) {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch (e) {}
  }

  var SYSTEM_PROMPT =
    'تۆ یاریدەدەری زانیاریی ئیسلامییت بە زمانی کوردیی سۆرانی، لە چوارچێوەی ئەهلی سوننە وەالجەماعە. ' +
    'ڕێنماییەکان: ١) قورئان و سوننەی سەحیح سەرچاوەی سەرەکین؛ هیچ ئایەت، فەرموودە، ژمارە، دەق، ئیجماع یان قسەی زانایەک مەدروستەوە. ' +
    '٢) بۆ ئایەت ناوی سورە و ژمارەی ئایەت بنووسە؛ بۆ فەرموودە کتێب و پلەی سەحیح/حەسەن بنووسە تەنها ئەگەر دڵنیایت. ' +
    '٣) ئەگەر سەرچاوە یان پلەی فەرموودە دڵنیا نییە، بە ڕوونی بڵێ ناتوانیت پشتڕاستی بکەیتەوە و وەک سەحیح مەیگێڕەوە. ' +
    '٤) لە بابەتی فقهی، جیاوازیی مەزهەبە سوننییەکان و جیاوازیی حاڵەتەکان ڕوون بکەوە؛ فەتوای تایبەتی بێ زانیاری تەواو مەدە و بۆ حوکمی ئاڵۆز ڕەوانەی موفتی متمانەپێکراو بکە. ' +
    '٥) لە عەقیدەدا بە ڕێز و بەڵگە وەڵامی گومان بدەرەوە؛ تکفیر، سووکایەتی و تۆمەتبارکردنی تاکەکان مەکە. ' +
    '٦) لە بابەتی جیهاد، جەنگ و سیاسەت، تەنها ڕوونکردنەوەی مێژوویی و فقهیی گشتی بدە؛ هەرگیز بانگەوازی توندوتیژی، ڕێنمایی هێرش، چۆنیەتی بەکارهێنانی چەک، هەڵبژاردنی ئامانج یان بەشداری لە گرووپی چەکدار مەکە. جیاوازی نێوان تاک و دەسەڵاتی یاسایی، پاراستنی مەدەنی و پابەندی بە پەیمان ڕوون بکەوە. ' +
    '٧) لە پزیشکی، دارایی و یاسا، وەڵامی گشتی بدە و مەترسی و پێویستی بە پسپۆڕ دیاری بکە؛ فەتوای کریپتۆ، چارەسەری پزیشکی یان ڕاوێژی یاساییی تایبەت مەدە. ' +
    '٨) ئەگەر بەڵگە بەس نییە یان زانایان جیاوازن، جیاوازییەکە بە ڕوونی باس بکە و بڵێ نازانیت؛ هەرگیز وەڵامێکی دڵنیای ساختە مەدە. ' +
    '٩) وەڵام بە کوردیی سۆرانی، ڕێکخراو و ڕوون بێت: کورتە وەڵام، بەڵگە، ڕوونکردنەوە، و ئاگادارکردنەوە ئەگەر پێویست بوو. ' +
    '١٠) تۆ جێگەی موفتی، پزیشک، پارێزەر یان مامۆستای تایبەتی ناگریتەوە. تەنها پرسیاری ئیسلامی وەڵام بدەرەوە؛ بۆ بابەتی دەرەوەی ئیسلام بە ڕێزییەوە سنوورەکەت ڕوون بکەوە.';

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

  function uiLang() { var l = window.appLang || ''; try { l = l || localStorage.getItem('app_language') || ''; } catch (e) {} return (!l || l === 'ckb' || l === 'bad') ? '' : l; }
  function trs(k) { var l = uiLang(); if (!l) return k; var T = window.LANG_TT || {}; return (T[l] && T[l][k]) || (T.en && T.en[k]) || k; }
  function offlineAnswer(q) {
    var nq = norm(q), lang = uiLang(), I = window.__AI_SHARI_KB_I18N, isAr = lang === 'ar';
    if (!nq) return trs('تکایە پرسیارێک بنووسە.');
    var KB = (lang && I) ? (I[isAr ? 'ar' : 'en'] || []) : getKB();
    if (!KB.length) return trs('زانیاری ناوخۆیی بار نەبووە.');
    var best = null, bestScore = 0;
    function has(text, k) {
      if (lang && !isAr) { try { return new RegExp('(^|[^a-z0-9])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es)?($|[^a-z0-9])').test(text); } catch (e) { return false; } }
      return text.indexOf(k) >= 0;
    }
    for (var i = 0; i < KB.length; i++) {
      var item = KB[i], score = 0;
      var keys = item.keys || [];
      for (var j = 0; j < keys.length; j++) {
        var k = norm(keys[j]);
        if (!k || k.length < 2) continue;
        if (has(nq, k)) { score += 50 + k.length * 3; continue; }
        var parts = k.split(' ').filter(function (p) { return p.length > 1; });
        if (!parts.length) continue;
        var hit = 0;
        for (var p = 0; p < parts.length; p++) {
          if (has(nq, parts[p])) hit++;
        }
        if (hit === parts.length && parts.length > 1) score += 40 + hit * 8;
        else if (hit >= Math.ceil(parts.length * 0.7) && parts.length > 1) score += 15 + hit * 5;
        else if (hit === 1 && parts.length === 1 && parts[0].length >= 4) score += 10 + parts[0].length;
      }
      if (score > bestScore) { bestScore = score; best = item; }
    }
    if (best && bestScore >= 20) {
      return best.a + '\n\n—\n' + trs('📚 ناوخۆیی (بێ پارە). بۆ فەتوای ورد بۆ زانا بڕۆ.');
    }
    return trs('لە زانیاری ناوخۆییدا وەڵام نەدۆزرایەوە.\n\nتکایە پرسیارەکە بە شێوەیەکی تر بنووسە، یان ئینتەرنێتەکەت بپشکنە بۆ وەڵامی زیرەک.');
  }

  window.__aiOffline = offlineAnswer;

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
    s.textContent = 'body:has(#aiShari.active) .top{display:none!important}.phone:has(#aiShari.active) .status,.phone:has(#aiShari.active) .appbar,.phone:has(#aiShari.active) .bottom{display:none!important}.phone:has(#aiShari.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}#aiShari.active{display:flex;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}#aiShari .ai-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;flex-shrink:0}#aiShari .ai-head h2{margin:0;font-size:17px;font-weight:800}#aiShari .ai-head .ai-sub{font-size:11px;opacity:.9;margin-top:2px}#aiShari .ai-back,#aiShari .ai-clear,#aiShari .ai-set{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}#aiShari .ai-msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px;display:flex;flex-direction:column;gap:10px}#aiShari .ai-bubble{max-width:92%;padding:11px 13px;border-radius:14px;font-size:14px;line-height:1.75;white-space:pre-wrap;word-break:break-word}#aiShari .ai-bubble.user{align-self:flex-start;background:#176b4b;color:#fff;border-bottom-right-radius:4px}#aiShari .ai-bubble.bot{align-self:flex-end;background:#fff;color:#1a2e24;border:1px solid #d5e3db;border-bottom-left-radius:4px}#aiShari .ai-bubble.sys{align-self:center;background:#eef4f0;color:#3d5a4c;font-size:12px;text-align:center;max-width:100%}#aiShari .ai-foot{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce8e1;display:flex;gap:8px;align-items:flex-end}#aiShari .ai-input{flex:1;min-height:44px;max-height:120px;resize:none;border:1px solid #c5d5cc;border-radius:12px;padding:10px 12px;font-size:15px;font-family:inherit;line-height:1.5;background:#f8fbf9}#aiShari .ai-send{border:0;background:#176b4b;color:#fff;border-radius:12px;padding:12px 16px;font-weight:800;font-size:14px;cursor:pointer}#aiShari .ai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 8px}#aiShari .ai-chip{border:1px solid #c5d5cc;background:#fff;border-radius:20px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1a3d2e}#aiShari .ai-panel{padding:14px;background:#fff;border-bottom:1px solid #dce8e1;display:none}#aiShari .ai-panel.open{display:block}#aiShari .ai-panel label{display:block;font-size:12px;font-weight:700;margin:8px 0 4px;color:#1a3d2e}#aiShari .ai-panel input,#aiShari .ai-panel select{width:100%;box-sizing:border-box;padding:10px;border:1px solid #c5d5cc;border-radius:10px;font-size:14px;font-family:inherit}#aiShari .ai-panel .hint{font-size:11px;color:#5a7a6a;margin-top:6px;line-height:1.5}#aiShari .ai-panel .save{margin-top:12px;border:0;background:#176b4b;color:#fff;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer}.section-choice.ai-shari-choice{border-color:#b8d4c8;background:linear-gradient(135deg,#fff,#eef7f2)}.section-choice.ai-shari-choice .choice-icon{background:#d8eee4;color:#176b4b}';
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
    if (window.AiShariRag && window.AiShariRag.enabled()) return 'Gemini + سەرچاوەی متمانەپێکراو';
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
        'هەر پرسیارێکی ئیسلامیت هەبێت بیپرسە — وەڵام بە قورئان و حەدیسی سەرچاوەدار دەدرێتەوە.' +
        '\n\n⚠️ جێگەی موفتی ناگرێتەوە.</div>';
      return;
    }
    box.innerHTML = history.map(function (m, i) {
      var cls = m.role === 'user' ? 'user' : (m.role === 'sys' ? 'sys' : 'bot');
      return '<div class="ai-bubble ' + cls + '">' + esc(m.text) +
        (m.sources && window.AiShariRag ? window.AiShariRag.srcHtml(m.sources) : '') +
        (m.more ? '<div><button type="button" class="ai-chip" data-act="more" data-i="' + i + '">＋ وەڵامی فراوانتر</button></div>' : '') + '</div>';
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
      '<button type="button" class="ai-clear" data-act="clear">پاککردنەوە</button>' +
      '<button type="button" class="ai-back" data-act="back">‹ بەشەکان</button></div></div>' +
      '<div class="ai-msgs" id="aiMsgs"></div>' +
      '<div class="ai-chips">' +
      '<button type="button" class="ai-chip" data-q="چۆن نوێژ دەکرێت و مەرجەکانی چین؟">نوێژ</button>' +
      '<button type="button" class="ai-chip" data-q="ڕۆژوو چ شتێک دەشکێنێت و حوکمەکانی چین؟">ڕۆژوو</button>' +
      '<button type="button" class="ai-chip" data-q="زەکات لەسەر کێ پێویستە و چۆن دەدرێت؟">زەکات</button>' +
      '<button type="button" class="ai-chip" data-q="میرات چۆن دابەش دەکرێت لە ئیسلامدا؟">میرات</button>' +
      '<button type="button" class="ai-chip" data-q="حەج و عومرە چۆن ئەنجام دەدرێت؟">حەج</button>' +
      '<button type="button" class="ai-chip" data-q="مافی دایک و باوک و ژن و میرد چییە لە ئیسلامدا؟">خێزان</button>' +
      '<button type="button" class="ai-chip" data-q="حوکمی کار و بازرگانی و سوود (ڕیبا) چییە؟">حەڵاڵ و حەرام</button>' +
      '<button type="button" class="ai-chip" data-q="چۆن تەوبە دەکرێت؟">تەوبە</button>' +
      '<button type="button" class="ai-chip" data-q="شەش پایەی ئیمان و پێنج پایەی ئیسلام چین؟">ئیمان</button>' +
      '</div>' +
      '<div class="ai-foot">' +
      '<textarea class="ai-input" id="aiInput" rows="1" placeholder="پرسیاری شەرعی بنووسە..."></textarea>' +
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
    if (q) { var tt = window.LANG_TT || {}, tb = tt[window.appLang] || tt.en || {}; q = tb[q] || (tt.en || {})[q] || q; if (window.appLang === 'ckb' || window.appLang === 'bad') q = el.getAttribute('data-q'); }
    if (q) { $('aiInput').value = q; send(); return; }
    if (act === 'back') { if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); return; }
    if (act === 'clear') { history = []; saveHist(); renderMsgs(); return; }
    if (act === 'more') {
      var mi = Number(el.getAttribute('data-i')), mm = history[mi];
      if (mm && mm.q) { mm.more = false; saveHist(); send(mm.q, true); }
      return;
    }
    if (act === 'send') send();
  }

  function send(forceText, full) {
    var input = $('aiInput');
    if (!input) return;
    var text = (forceText || input.value || '').trim();
    if (!text) return;
    input.value = '';
    history.push({ role: 'user', text: text });
    saveHist();
    renderMsgs();

    if (window.AiShariRag && window.AiShariRag.enabled()) {
      history.push({ role: 'bot', text: '… چاوەڕێ بە' });
      renderMsgs();
      withTimeout(window.AiShariRag.ask(text, function (s) {
        var last = history[history.length - 1];
        if (last && last.role === 'bot') { last.text = s; renderMsgs(); }
      }, { full: !!full }), 120000, 'سێرڤەر').then(function (r) {
        history.pop();
        if (r && r.kind === 'error') {
          history.push({ role: 'bot', text: (r.text || 'هەڵە') + '\n\n—— ناوخۆیی ——\n' + offlineAnswer(text) });
        } else {
          history.push({ role: 'bot', text: (r && r.text) || offlineAnswer(text), sources: (r && r.sources) || [], more: !!(r && r.more), q: text });
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

    history.push({ role: 'bot', text: offlineAnswer(text) });
    saveHist();
    renderMsgs();
  }

  window.enterAiShari = function () {
    injectCss();
    if (!ensureView()) return;
    if (typeof showView === 'function') showView('aiShari', 'ئەی ئای شەرعی');
    build();
    try { if (window.AiRag && window.AiShariRag && window.AiShariRag.enabled()) window.AiRag.load().catch(function () {}); } catch (e) {}
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
