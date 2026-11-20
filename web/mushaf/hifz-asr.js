/* hifz-asr.js — optional high-accuracy Quran microphone.
   Runs the open model tarteel-ai/whisper-base-ar-quran (int8 ONNX, ~40MB, built by tools/build_quran_asr.sh) inside the browser
   with transformers.js. Downloaded once on request, then works offline. Audio never leaves the device. */
(function () {
  if (window.hifzASR) return;
  var TJS = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
  var ROOT = location.pathname.replace(/\/mushaf\/.*$/, '/').replace(/[^\/]*$/, '');
  var pipe = null, loading = null, st = { state: 'idle', pct: 0 }, onState = null;
  var ctx = null, stream = null, node = null, src = null, buf = [], speechAt = 0, lastVoice = 0, busy = false, loop = null, cb = null, active = false;

  function setState(s, p) { st.state = s; if (p != null) st.pct = p; if (onState) try { onState(st); } catch (e) {} }
  function load() {
    if (pipe) return Promise.resolve(pipe);
    if (loading) return loading;
    setState('loading', 0);
    var files = {};
    loading = import(TJS + 'transformers.min.js').then(function (T) {
      T.env.allowLocalModels = true; T.env.allowRemoteModels = false; T.env.localModelPath = location.origin + ROOT;
      T.env.useBrowserCache = true;
      try { T.env.backends.onnx.wasm.wasmPaths = TJS; T.env.backends.onnx.wasm.proxy = true; } catch (e) {}
      return T.pipeline('automatic-speech-recognition', 'quran-asr-tiny', {
        quantized: true,
        progress_callback: function (p) {
          if (!p || !p.file) return;
          if (p.status === 'progress') { files[p.file] = [p.loaded || 0, p.total || 0]; }
          var l = 0, t = 0, k; for (k in files) { l += files[k][0]; t += files[k][1]; }
          if (t) setState('loading', Math.min(99, Math.round(l / t * 100)));
        }
      });
    }).then(function (p) { pipe = p; setState('ready', 100); return p; })
      .catch(function (e) { loading = null; setState('error', 0); throw e; });
    return loading;
  }

  /* ---- microphone → 16 kHz mono chunks ---- */
  function rms(a) { var s = 0, i; for (i = 0; i < a.length; i += 4) s += a[i] * a[i]; return Math.sqrt(s / (a.length / 4)); }
  function concat(chunks) { var n = 0, i; chunks.forEach(function (c) { n += c.length; }); var o = new Float32Array(n), p = 0; chunks.forEach(function (c) { o.set(c, p); p += c.length; }); return o; }
  function start(onText) {
    cb = onText; active = true; buf = []; speechAt = 0; lastVoice = 0;
    return load().then(function () {
      return navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    }).then(function (s) {
      if (!active) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s;
      var AC = window.AudioContext || window.webkitAudioContext;
      try { ctx = new AC({ sampleRate: 16000 }); } catch (e) { ctx = new AC(); }
      src = ctx.createMediaStreamSource(stream);
      node = ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = function (e) {
        var d = new Float32Array(e.inputBuffer.getChannelData(0)); if (!active) return;
        var now = Date.now(), loud = rms(d) > 0.012;
        if (loud) { if (!speechAt) speechAt = now; lastVoice = now; }
        if (speechAt) buf.push(resample(d, ctx.sampleRate));
      };
      src.connect(node); node.connect(ctx.destination);
      loop = setInterval(tickLoop, 700);
    });
  }
  function resample(d, rate) {
    if (rate === 16000) return d;
    var r = rate / 16000, n = Math.floor(d.length / r), o = new Float32Array(n), i;
    for (i = 0; i < n; i++) o[i] = d[Math.floor(i * r)];
    return o;
  }
  function run(final) {
    if (busy || !buf.length) return Promise.resolve();
    busy = true;
    var audio = concat(buf), max = 16000 * 25;
    if (audio.length > max) audio = audio.slice(audio.length - max);
    return pipe(audio, { language: 'arabic', task: 'transcribe', chunk_length_s: 30 }).then(function (o) {
      busy = false; if (active && cb) cb(String((o && o.text) || ''), final);
    }).catch(function () { busy = false; });
  }
  function tickLoop() {
    if (!active || !speechAt) return;
    var now = Date.now(), silent = now - lastVoice > 900;
    if (silent) { if (busy) return; run(true).then(function () { buf = []; speechAt = 0; }); }
    else if (now - speechAt > 600) run(false);
  }
  function stop() {
    active = false; clearInterval(loop); loop = null;
    try { if (node) { node.disconnect(); node.onaudioprocess = null; } if (src) src.disconnect(); } catch (e) {}
    try { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    try { if (ctx && ctx.close) ctx.close(); } catch (e) {}
    node = src = stream = ctx = null; buf = []; speechAt = 0;
  }
  window.hifzASR = {
    load: load, start: start, stop: stop, state: function () { return st; },
    ready: function () { return !!pipe; }, onState: function (f) { onState = f; }
  };
})();
