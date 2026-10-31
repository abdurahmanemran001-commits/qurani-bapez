/* ai-shari-rag.js v2 — timeout so UI never hangs forever */
(function () {
  if (window.__AiShariRagV2) return;
  window.__AiShariRagV2 = true;

  function endpoint() {
    var e = '';
    try { e = localStorage.getItem('ai_endpoint') || ''; } catch (x) {}
    e = (e || window.AI_SHARI_ENDPOINT || '').trim().replace(/\/+$/, '');
    return /^https:\/\//.test(e) ? e : '';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function post(path, body, ms) {
    ms = ms || 20000;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, ms) : null;
    return fetch(endpoint() + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        j._status = r.status;
        return j;
      });
    }).finally(function () { if (t) clearTimeout(t); });
  }
  var NOT_FOUND = 'نەتوانرا سەرچاوەیەکی متمانەپێکراو بدۆزرێتەوە بۆ ئەم پرسیارە. بۆ دڵنیایی، پرسیار لە زانایەکی متمانەپێکراو بکە.';
  var NET = 'سێرڤەری AI وەڵامی نەدا (کات تەواو بوو یان ئینتەرنێت). دووبارە هەوڵ بدەرەوە.';

  function passageText(d) {
    if (d.kind === 'quran') return d.ar + ' — تفسير الجلالين: ' + String(d.tafsir || '').slice(0, 600);
    return '[' + window.AiRag.label(d) + '] ' + String(d.ar).slice(0, 1000);
  }

  function ask(q, status, opts) {
    var full = !!(opts && opts.full);
    status = status || function () {};
    if (!endpoint()) return Promise.reject(new Error('no endpoint'));
    status('… شیکردنەوەی پرسیار');
    return post('/expand', { q: q }, 20000).then(function (ex) {
      if (ex.error) return { text: (ex.message || NET) + (ex.detail ? '\n\n[' + ex.detail + ']' : ''), sources: [], kind: 'error' };
      if (ex.refusal) return { text: ex.refusal, sources: [], kind: 'refusal' };
      var kws = ex.keywords || [];
      if (!window.AiRag) return { text: NET, sources: [], kind: 'error' };
      status('… بارکردنی سەرچاوەکان');
      return window.AiRag.load(function (p) {
        status('… بارکردنی سەرچاوەکان ' + Math.round(p * 100) + '٪');
      }).then(function () {
        var hits = kws.length ? window.AiRag.search(kws, { kQ: 6, kH: 11 }) : { quran: [], hadith: [] };
        var all = hits.quran.concat(hits.hadith);
        status('… نووسینی وەڵام');
        return post('/answer', {
          q: q,
          token: ex.token,
          detail: full ? 'full' : 'short',
          personal: !!ex.personal,
          passages: all.map(function (d) { return { id: d.id, text: passageText(d) }; })
        }, 70000).then(function (an) {
          if (an.error) return { text: (an.message || NET) + (an.detail ? '\n\n[' + an.detail + ']' : ''), sources: [], kind: 'error' };
          if (!an.answerable || ((!an.cites || !an.cites.length) && !an.general)) {
            return { text: NOT_FOUND, sources: [], kind: 'notfound' };
          }
          var srcs = (an.cites || []).map(function (id) { return window.AiRag.get(id); }).filter(Boolean);
          return Promise.all(srcs.map(function (d) {
            return d.kind === 'quran' ? window.AiRag.kurdish(d.id) : Promise.resolve('');
          })).then(function (kus) {
            var text = '⚠️ ئەم وەڵامە تەنها بەڵگە و ڕای زانایانە و فەتوا نییە؛ پێویستە پرس بە زانایەکی ئاینی بکەیت.\n\n' + (an.general ? 'بەشێک لەم وەڵامە ڕوونکردنەوەی گشتییە و دەقی ڕاستەوخۆی نییە لەناو سەرچاوەکان.\n\n' : '') + an.answer + '\n\n⚠️ بۆ بڕیاری کۆتایی و دۆخی تایبەتی خۆت، پرس بە زانایەکی ئاینی متمانەپێکراو بکە.';
            return {
              text: text,
              kind: 'answer',
              more: !full,
              sources: srcs.map(function (d, i) {
                return { id: d.id, label: window.AiRag.label(d), ar: d.ar, ku: kus[i] || '' };
              })
            };
          });
        });
      });
    }).catch(function () {
      return { text: NET, sources: [], kind: 'error' };
    });
  }

  function srcHtml(list) {
    if (!list || !list.length) return '';
    return '<div class="ai-srcs"><div class="ai-srcs-t">سەرچاوەکان</div>' + list.map(function (s) {
      return '<div class="ai-src"><div class="ai-src-l">' + esc(s.label) + '</div><div class="ai-src-ar">' + esc(s.ar) + '</div>' +
        (s.ku ? '<div class="ai-src-ku">' + esc(s.ku) + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  }

  if (!document.getElementById('aiSrcCss')) {
    var st = document.createElement('style');
    st.id = 'aiSrcCss';
    st.textContent = '.ai-srcs{margin-top:10px;border-top:1px dashed #cfd9d4;padding-top:8px}.ai-srcs-t{font-size:12px;color:#8a6a24;margin-bottom:6px;font-weight:bold}' +
      '.ai-src{background:#fbf5e7;border:1px solid #e4d5ad;border-radius:12px;padding:8px 10px;margin-bottom:8px;color:#18231f}.ai-src-l{font-size:12px;color:#8a6a24;margin-bottom:4px}' +
      '.ai-src-ar{font-family:serif;font-size:17px;line-height:2;text-align:right}.ai-src-ku{font-size:13px;line-height:1.8;margin-top:4px;color:#32413a;max-height:7.5em;overflow:auto}';
    document.head.appendChild(st);
  }

  window.AiShariRag = {
    enabled: function () { return !!endpoint() && !!window.AiRag; },
    ask: ask,
    srcHtml: srcHtml,
    endpoint: endpoint
  };
})();
