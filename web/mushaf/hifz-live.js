/* hifz-live.js — real-time Quran transcription with Gemini Live (server-side streaming, like Tarteel's mic).
   The worker mints a one-use token (/live-token); the browser streams 16 kHz PCM straight to Gemini and receives interim words. */
(function () {
  if (window.hifzLive) return;
  var WS = ['wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=',
            'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token='];
  var ws = null, ctx = null, stream = null, node = null, src = null, active = false, ready = false;

  function endpoint() {
    var e = ''; try { e = localStorage.getItem('ai_endpoint') || ''; } catch (x) {}
    e = (e || window.AI_SHARI_ENDPOINT || 'https://qurani-ai-shari.abdurahmanemran03.workers.dev').trim().replace(/\/+$/, '');
    return /^https:\/\//.test(e) ? e : '';
  }
  function b64(i16) { var b = new Uint8Array(i16.buffer), s = '', k; for (k = 0; k < b.length; k += 0x8000) s += String.fromCharCode.apply(null, b.subarray(k, k + 0x8000)); return btoa(s); }
  function txt(x) { return typeof x === 'string' ? x : (x && x.text) || ''; }
  function connect(tok, model, urlIdx, cb, onFail, done) {
    var sock; try { sock = new WebSocket(WS[urlIdx] + encodeURIComponent(tok)); } catch (e) { return onFail(); }
    ws = sock; var opened = false;
    sock.onopen = function () {
      opened = true;
      sock.send(JSON.stringify({ setup: { model: 'models/' + model, generationConfig: { responseModalities: ['TEXT'] }, inputAudioTranscription: { languageCodes: ['ar'] } } }));
    };
    sock.onmessage = function (ev) {
      var go = function (raw) {
        var m; try { m = JSON.parse(raw); } catch (e) { return; }
        if (m.setupComplete && !ready) { ready = true; done(); return; }
        var sc = m.serverContent; if (!sc || !active) return;
        var i = txt(sc.interimInputTranscription), f = txt(sc.inputTranscription);
        if (i) cb(i, false);
        if (f) cb(f, true);
      };
      if (typeof ev.data === 'string') go(ev.data); else if (ev.data && ev.data.text) ev.data.text().then(go);
    };
    sock.onerror = function () { };
    sock.onclose = function () {
      if (sock !== ws) return;
      if (!ready) { if (urlIdx + 1 < WS.length && active) return connect(tok, model, urlIdx + 1, cb, onFail, done); return onFail(); }
      if (active) onFail();
    };
  }
  function start(cb, onFail) {
    active = true; ready = false;
    var ep = endpoint(); if (!ep || !navigator.onLine) return Promise.reject(new Error('offline'));
    return fetch(ep + '/live-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok || !d.token) throw new Error('token'); return d; }); })
      .then(function (d) {
        return navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }).then(function (s) {
          if (!active) { s.getTracks().forEach(function (t) { t.stop(); }); throw new Error('stopped'); }
          stream = s; return d;
        });
      })
      .then(function (d) {
        return new Promise(function (resolve, reject) {
          var fail = function () { if (!ready) reject(new Error('ws')); else { try { onFail && onFail(); } catch (e) {} } };
          connect(d.token, d.model, 0, cb, fail, function () { pipe(); resolve(); });
          setTimeout(function () { if (!ready) reject(new Error('timeout')); }, 8000);
        });
      })
      .catch(function (e) { stop(); throw e; });
  }
  function pipe() {
    var AC = window.AudioContext || window.webkitAudioContext;
    try { ctx = new AC({ sampleRate: 16000 }); } catch (e) { ctx = new AC(); }
    src = ctx.createMediaStreamSource(stream); node = ctx.createScriptProcessor(2048, 1, 1);
    var rate = ctx.sampleRate;
    node.onaudioprocess = function (e) {
      if (!active || !ws || ws.readyState !== 1) return;
      var d = e.inputBuffer.getChannelData(0), n = rate === 16000 ? d.length : Math.floor(d.length * 16000 / rate), o = new Int16Array(n), i, v;
      for (i = 0; i < n; i++) { v = d[rate === 16000 ? i : Math.floor(i * rate / 16000)]; v = Math.max(-1, Math.min(1, v)); o[i] = v < 0 ? v * 0x8000 : v * 0x7fff; }
      try { ws.send(JSON.stringify({ realtimeInput: { audio: { data: b64(o), mimeType: 'audio/pcm;rate=16000' } } })); } catch (x) {}
    };
    src.connect(node); node.connect(ctx.destination);
  }
  function stop() {
    active = false; ready = false;
    try { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } })); } catch (e) {}
    try { if (ws) { var w = ws; ws = null; w.close(); } } catch (e) {}
    try { if (node) { node.disconnect(); node.onaudioprocess = null; } if (src) src.disconnect(); } catch (e) {}
    try { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    try { if (ctx && ctx.close) ctx.close(); } catch (e) {}
    node = src = stream = ctx = null;
  }
  window.hifzLive = { start: start, stop: stop };
})();
