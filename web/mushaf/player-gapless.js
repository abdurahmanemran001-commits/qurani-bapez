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

  var LENS=null;
  function loadLens(cb){
    if(LENS) return cb();
    fetch('ayah-lens.json').then(function(r){return r.json()}).then(function(j){LENS=j;cb();}).catch(function(){cb();});
  }
  /* real per-ayah timings (same data the Android app uses): ../madani-timing/<reciter id>.json = {sura:{ayah:startMs}} */
  var TIMC={};
  function loadTim(cb){
    var m=window.recMeta&&recMeta(); if(!m||m.t!=='g'||TIMC[m.id]!==undefined) return cb();
    fetch('../madani-timing/'+encodeURIComponent(m.id)+'.json').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){TIMC[m.id]=j;cb();}).catch(function(){TIMC[m.id]=null;cb();});
  }
  function realSegs(sura, dur){
    var m=window.recMeta&&recMeta(), T=m&&TIMC[m.id]; if(!T||!T[sura]) return null;
    var n=C[sura-1], t=T[sura], st=[];
    for(var a=1;a<=n;a++){ var v=t[a]; if(v==null) return null; if(st.length&&v<st[st.length-1]) return null; st.push(v/1000); }
    var out=[];
    for(var i=0;i<n;i++) out.push([i+1, st[i], i+1<n?st[i+1]:(dur||st[i]+1)]);
    return out;
  }
  function segs(sura, dur){
    var rs=realSegs(sura,dur); if(rs) return rs;
    if(!LENS||!dur) return null;
    var w=LENS[sura-1]; if(!w||!w.length) return null;
    var sum=0; for(var i=0;i<w.length;i++) sum+=w[i];
    var out=[], t=0;
    for(var i=0;i<w.length;i++){
      var start=t, end=t+dur*(w[i]/sum);
      out.push([i+1, start, end]);
      t=end;
    }
    out[out.length-1][2]=dur;
    return out;
  }
  function ayahAt(list, sec){
    for(var i=0;i<list.length;i++) if(sec>=list[i][1] && sec<list[i][2]+0.05) return list[i][0];
    return list[list.length-1][0];
  }
  window.__aySegs = function(sura, dur){ return segs(sura, dur); };
  loadLens(function(){});
  au.addEventListener('timeupdate', function(){
    if(!isGaplessRec()||!playing||!cur) return;
    if(typeof isG==='function' && isG()) return;
    var list=segs(cur[0], au.duration);
    if(!list) return;
    var a=ayahAt(list, au.currentTime);
    if(a!==cur[1] && typeof mark==='function') mark(cur[0], a, 1);
  });
  var _start2=window.start;
  window.start=function(){
    if(!(typeof isGaplessRec==='function' && isGaplessRec()) || (typeof isG==='function' && isG()) || !cur) return _start2.apply(this, arguments);
    loadTim(function(){ loadLens(function(){
      var u=url();
      var go=function(){
        var list=segs(cur[0], au.duration);
        var sec=0;
        if(list){ for(var i=0;i<list.length;i++) if(list[i][0]===cur[1]){sec=list[i][1]; break;} }
        var play=function(){ au.play().then(ok, bad); };
        if(Math.abs(au.currentTime-sec)>0.4){
          var once=function(){ au.removeEventListener('seeked', once); play(); };
          au.addEventListener('seeked', once);
          try{ au.currentTime=sec; }catch(e){ play(); }
        } else play();
      };
      if(au.src===u && au.readyState>0) go();
      else { au.src=u; au.addEventListener('loadedmetadata', go, {once:true}); }
    }); });
  };

})();
