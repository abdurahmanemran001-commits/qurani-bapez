/* Phase 1: gapless reciters + ayah-tap plays audio */
(function(){
  function waitR(cb){
    if (typeof R !== 'undefined' && R && R.length) return cb();
    setTimeout(function(){ waitR(cb); }, 50);
  }

  /* When user taps an ayah in the page iframe, always start playback */
  window.addEventListener('message', function(e){
    var d = e.data || {};
    if (!d.ayah || typeof setCur !== 'function') return;
    try {
      setCur(+d.ayah[0], +d.ayah[1], true);
    } catch (err) {}
  });

  waitR(function(){
    window.recMeta = function(){
      for (var i = 0; i < R.length; i++) if (R[i].id === rc.value) return R[i];
      return null;
    };
    window.isGaplessRec = function(){
      var m = recMeta();
      return !!(m && m.t === 'g');
    };
    var _start = window.start;
    window.url = function(){
      if (typeof isQ === 'function' && isQ())
        return 'https://files.quranpedia.net/recitations/' + QA[mode] + '/' + pad(cur[0],3) + pad(cur[1],3) + '.mp3';
      var m = recMeta();
      if (m && m.t === 'g') return m.u + pad(cur[0],3) + '.mp3';
      return 'https://everyayah.com/data/' + rc.value + '/' + pad(cur[0],3) + pad(cur[1],3) + '.mp3';
    };
    window.start = function(){
      if (typeof isG === 'function' && isG()) return _start.apply(this, arguments);
      if (isGaplessRec()) {
        var u = url();
        var go = function(){ au.currentTime = 0; au.play().then(ok, bad); };
        if (au.src === u && au.readyState > 0) go();
        else { au.src = u; au.addEventListener('loadedmetadata', go, { once: true }); }
        return;
      }
      return _start.apply(this, arguments);
    };
    var prevEnded = au.onended;
    au.onended = function(){
      if (typeof isG === 'function' && isG()) {
        if (cur[0] === 114) { bad(); return; }
        setCur(cur[0] + 1, 1, true);
        return;
      }
      if (isGaplessRec()) {
        if (cur[0] === 114) { bad(); return; }
        setCur(cur[0] + 1, 1, true);
        return;
      }
      if (typeof prevEnded === 'function') return prevEnded.apply(this, arguments);
      if (cur[0] === 114 && cur[1] === CC(114)) { bad(); return; }
      step(1);
    };
    pp.onclick = function(){
      if (!cur) return;
      if (playing) { au.pause(); bad(); }
      else if ((typeof isG === 'function' && isG()) || isGaplessRec()) start();
      else if (au.src && au.src === url()) { au.play(); ok(); }
      else start();
    };
  });
})();
