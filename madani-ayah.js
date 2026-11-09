/* Madinah IMAGE + APK bounds + gapless + custom ayah URL. v17 */
(function () {
  if (window.__madaniAyahInstalled) return;
  window.__madaniAyahInstalled = true;

  var PAGE_W = 1260, PAGE_H = 2038;
  var overlay = null, playerBar = null, audio = null, current = null;
  var reciters = [], reciterId = 'Alafasy_128kbps';
  var pageBounds = null, pageAyahOrder = [], lastPage = -1, hlEls = [];
  var timingCache = {};
  var watchTimer = null;
  var pendingNext = null, sharedAudio = null;
  var resumable = false;

  var AYAH_COUNT = [0,7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

  function pad(n, w) {
    n = String(n);
    while (n.length < w) n = '0' + n;
    return n;
  }

  /* One audio element is reused for ayah-by-ayah playback, so phones keep allowing it to play on its own */
  function getAudio() {
    if (!sharedAudio) sharedAudio = new Audio();
    return sharedAudio;
  }

  function recMeta() {
    for (var i = 0; i < reciters.length; i++) if (reciters[i].id === reciterId) return reciters[i];
    return null;
  }

  function isGapless() {
    var m = recMeta();
    return !!(m && m.t === 'g' && m.u);
  }

  function setStatus(msg) {
    var st = document.getElementById('pageStatus');
    if (st) st.textContent = msg;
  }

  /* surah list of the site: [name, id, ayahs, start page] */
  function listSurahs() {
    try { return (typeof surahs !== 'undefined' && surahs) || null; } catch (e) { return null; }
  }
  function surahOfPage(page) {
    var l = listSurahs(), s = 1;
    if (l) for (var i = 0; i < l.length; i++) { if (l[i][3] <= page) s = l[i][1]; else break; }
    return s;
  }
  function surahStartPage(s) {
    var l = listSurahs();
    if (l) for (var i = 0; i < l.length; i++) if (l[i][1] === s) return l[i][3];
    return 1;
  }

  function finishPlayback() {
    var b = playerBar && playerBar.querySelector('#madaniPlay');
    if (b) b.textContent = '▶';
    clearHighlight();
    stopWatch();
    window.__surahOnly = null;
    resumable = false;
  }

  function loadTimings(m, sura, cb) {
    var key = (m.id || '') + ':' + sura;
    if (timingCache[key]) return cb(timingCache[key]);
    var url = 'madani-timing/' + encodeURIComponent(m.id) + '.json';
    fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (all) {
      var suraMap = all[String(sura)] || all[sura] || {};
      var map = {};
      Object.keys(suraMap).forEach(function (a) { map[+a] = +suraMap[a]; });
      /* reject a broken table (missing / out-of-order ayahs) so the estimate is used instead */
      var n = AYAH_COUNT[sura] || 0, okT = Object.keys(map).length > 0, last = -1;
      for (var i = 1; i <= n && okT; i++) { if (map[i] == null || map[i] < last) okT = false; else last = map[i]; }
      if (okT) { timingCache[key] = map; cb(map); } else cb(null);
    }).catch(function () { cb(null); });
  }

  function estimateTimings(sura, durationMs) {
    var n = AYAH_COUNT[sura] || 1;
    var map = {};
    for (var i = 1; i <= n; i++) map[i] = Math.floor(((i - 1) / n) * durationMs);
    map[999] = Math.floor(durationMs);
    return map;
  }

  function fillReciters(sel) {
    if (!sel) return;
    sel.innerHTML = '';
    var list = reciters.slice().sort(function (a, b) {
      if (a.t === b.t) return (a.n || a.id).localeCompare(b.n || b.id, 'ku');
      return a.t === 'a' ? -1 : 1;
    });
    var grpA = document.createElement('optgroup'); grpA.label = 'ئایەت بە ئایەت';
    var grpG = document.createElement('optgroup'); grpG.label = 'کوردی / سورەت تەواو';
    list.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id; o.textContent = r.n || r.id;
      if (r.t === 'g') grpG.appendChild(o); else grpA.appendChild(o);
    });
    if (grpA.children.length) sel.appendChild(grpA);
    if (grpG.children.length) sel.appendChild(grpG);
    try { var saved = localStorage.getItem('madani_reciter'); if (saved) sel.value = saved; } catch (e) {}
    if (!sel.value && list.length) sel.value = list[0].id;
    reciterId = sel.value;
  }

  function loadRecitersList(cb) {
    fetch('mushaf/reciters.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (data) {
      if (Array.isArray(data) && data.length) { reciters = data; cb(); } else throw 0;
    }).catch(function () {
      reciters = [{ id: 'Alafasy_128kbps', n: 'مەشاری عەفاسی', t: 'a' }];
      cb();
    });
  }

  /* Play button of the player: resume if it was paused, otherwise read the whole surah of this page
     from its first ayah to its last. */
  function startSurah(s) {
    s = +s || 1;
    window.__surahOnly = s;
    var start = surahStartPage(s);
    if (lastPage !== start && typeof window.openPage === 'function') window.openPage(start);
    playAyah(s, 1);
  }

  var SPEEDS = [0.75, 1, 1.25, 1.5, 2], speed = 1;
  try { var sv = parseFloat(localStorage.getItem('madani_speed')); if (SPEEDS.indexOf(sv) >= 0) speed = sv; } catch (e) {}
  function applySpeed() {
    [audio, sharedAudio].forEach(function (a) { if (a) { try { a.defaultPlaybackRate = speed; a.playbackRate = speed; } catch (e) {} } });
    var b = playerBar && playerBar.querySelector('#madaniSpeed'); if (b) b.textContent = speed + '×';
  }
  function stopAll() {
    if (audio) { try { audio.pause(); audio.currentTime = 0; } catch (e) {} }
    stopWatch(); resumable = false; pendingNext = null; clearTimeout(repTimer);
    var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
    /* next ▶ starts again from the current ayah */
    if (current) { var c = current; audio = null; var pb = b; if (pb) pb.onclick = function () { pb.onclick = onPlayerButton; playAyah(c.sura, c.ayah); }; }
  }
  function stepAyah(d) {
    var c = current; if (!c) return;
    var s = c.sura, a = c.ayah + d;
    if (a < 1) { if (s <= 1) return; s--; a = AYAH_COUNT[s] || 1; }
    else if (AYAH_COUNT[s] && a > AYAH_COUNT[s]) { if (s >= 114) return; s++; a = 1; }
    var onPage = pageAyahOrder.some(function (x) { return x.sura === s && x.ayah === a; });
    if (onPage || typeof window.openPage !== 'function') { playAyah(s, a); return; }
    var np = lastPage + d; if (np < 1 || np > 604) return;
    window.openPage(np);
    setTimeout(function () { playAyah(s, a); }, 450);
  }

  function onPlayerButton() {
    var self = this;
    if (audio && !audio.paused) { audio.pause(); self.textContent = '▶'; stopWatch(); resumable = true; return; }
    if (resumable && audio && audio.src && current) {
      audio.play().then(function () {
        self.textContent = '⏸'; resumable = false;
        if (isGapless() && current) {
          var m = recMeta();
          var map = timingCache[(m && m.id) + ':' + current.sura];
          if (map) startWatch(map, current.sura);
        }
      }).catch(function () { self.textContent = '▶'; });
      return;
    }
    var pg = (lastPage > 0 ? lastPage : 0) || (typeof currentPage !== 'undefined' && currentPage) || 1;
    startSurah(surahOfPage(pg));
  }

  function ensureUI() {
    var mushaf = document.getElementById('mushaf');
    var img = document.getElementById('pageImg');
    if (!mushaf || !img) return false;
    img.style.display = 'block'; img.style.width = '100%'; img.style.height = 'auto';
    img.style.pointerEvents = 'none'; img.setAttribute('draggable', 'false');
    img.style.webkitTouchCallout = 'none';
    var oldFrame = document.getElementById('madaniFrame');
    if (oldFrame) oldFrame.remove();
    if (!img.parentElement || img.parentElement.id !== 'madaniWrap') {
      var wrap = document.createElement('div');
      wrap.id = 'madaniWrap';
      wrap.style.cssText = 'position:relative;width:100%;line-height:0;';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
    }
    overlay = document.getElementById('madaniOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'madaniOverlay';
      document.getElementById('madaniWrap').appendChild(overlay);
    }
    overlay.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:5;pointer-events:auto;cursor:pointer;touch-action:manipulation;';
    function blockMenu(e) { e.preventDefault(); return false; }
    overlay.oncontextmenu = blockMenu; img.oncontextmenu = blockMenu;
    if (!overlay.__bound) {
      overlay.__bound = true;
      function onTap(e) {
        e.preventDefault(); e.stopPropagation();
        if (!pageBounds) return;
        var rect = overlay.getBoundingClientRect();
        var cx = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : e.clientX) - rect.left;
        var cy = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : e.clientY) - rect.top;
        var x = cx * (PAGE_W / rect.width);
        var y = cy * (PAGE_H / rect.height);
        var hit = null;
        for (var key in pageBounds) {
          var boxes = pageBounds[key];
          for (var i = 0; i < boxes.length; i++) {
            var b = boxes[i];
            if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) { hit = key; break; }
          }
          if (hit) break;
        }
        if (hit) {
          var p = hit.split(':');
          /* ayah toolbar (ayah-actions.js) if present, otherwise play straight away */
          if (typeof window.__onAyahTap === 'function') window.__onAyahTap(+p[0], +p[1]);
          else { window.__surahOnly = null; playAyah(+p[0], +p[1]); }
        } else if (typeof window.__onBlankTap === 'function') {
          window.__onBlankTap();
        }
      }
      overlay.addEventListener('click', onTap, true);
      overlay.addEventListener('touchend', function (e) {
        if (e.changedTouches && e.changedTouches.length) onTap(e);
      }, { passive: false });
    }
    playerBar = document.getElementById('madaniPlayer');
    if (!playerBar) {
      playerBar = document.createElement('div');
      playerBar.id = 'madaniPlayer';
      /* hidden until the page is tapped (see __madani.togglePlayer) */
      playerBar.style.cssText = 'display:none;margin-top:10px;padding:10px;background:#173f35;color:#fff;border-radius:12px;font-size:14px;gap:8px;align-items:center;flex-wrap:wrap;';
      playerBar.innerHTML = '<select id="madaniReciter" style="flex:1;min-width:160px;padding:6px;border-radius:8px;border:0"></select><button id="madaniPlay" type="button" style="padding:8px 14px;border:0;border-radius:8px;background:#ffd54f;color:#173f35;font-weight:bold;cursor:pointer">▶</button><span id="madaniLabel" style="min-width:70px;text-align:center">—</span>'
        + '<span style="display:flex;gap:6px;width:100%;justify-content:center">'
        + ['madaniPrev|⏮','madaniStop|⏹','madaniNext|⏭','madaniSpeed|1×','madaniRep|🔁'].map(function (x) { x = x.split('|'); return '<button id="' + x[0] + '" type="button" style="flex:1;max-width:80px;padding:8px 0;border:0;border-radius:8px;background:#2a5a4d;color:#fff;font-weight:bold;cursor:pointer">' + x[1] + '</button>'; }).join('') + '</span>';
      mushaf.parentNode.insertBefore(playerBar, mushaf.nextSibling);
      var sel = playerBar.querySelector('#madaniReciter');
      loadRecitersList(function () { fillReciters(sel); });
      sel.onchange = function () {
        reciterId = sel.value;
        try { localStorage.setItem('madani_reciter', reciterId); } catch (e) {}
        if (current) playAyah(current.sura, current.ayah);
      };
      playerBar.querySelector('#madaniPlay').onclick = onPlayerButton;
      playerBar.querySelector('#madaniStop').onclick = stopAll;
      playerBar.querySelector('#madaniRep').onclick = openRepeat; repLabel();
      playerBar.querySelector('#madaniPrev').onclick = function () { stepAyah(-1); };
      playerBar.querySelector('#madaniNext').onclick = function () { stepAyah(1); };
      playerBar.querySelector('#madaniSpeed').onclick = function () {
        var i = SPEEDS.indexOf(speed); speed = SPEEDS[(i + 1) % SPEEDS.length];
        try { localStorage.setItem('madani_speed', String(speed)); } catch (e) {}
        applySpeed();
      };
      applySpeed();
    }
    return true;
  }

  function audioUrlAyah(sura, ayah) {
    var m = recMeta();
    if (m && m.u && m.t !== 'g') return m.u.replace(/\/?$/, '/') + pad(sura, 3) + pad(ayah, 3) + '.mp3';
    return 'https://everyayah.com/data/' + reciterId + '/' + pad(sura, 3) + pad(ayah, 3) + '.mp3';
  }
  function audioUrlSurah(m, sura) { return m.u.replace(/\/?$/, '/') + pad(sura, 3) + '.mp3'; }
  function clearHighlight() { hlEls.forEach(function (el) { try { el.remove(); } catch (e) {} }); hlEls = []; }

  function drawHighlight(sura, ayah) {
    clearHighlight();
    if (!overlay || !pageBounds) return;
    var boxes = pageBounds[sura + ':' + ayah];
    if (!boxes) return;
    boxes.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'ma-hl';
      el.style.cssText = 'position:absolute;pointer-events:none;background:rgba(255,213,79,0.38);border-radius:3px;left:' + (b[0] / PAGE_W) * 100 + '%;top:' + (b[1] / PAGE_H) * 100 + '%;width:' + ((b[2] - b[0]) / PAGE_W) * 100 + '%;height:' + ((b[3] - b[1]) / PAGE_H) * 100 + '%;';
      overlay.appendChild(el); hlEls.push(el);
    });
  }

  /* persistent marks: orange tint on bookmarked ayahs + red ribbon when the page itself is bookmarked */
  var bmEls = [];
  function bmList(k) { try { var v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function drawBookmarks() {
    bmEls.forEach(function (el) { try { el.remove(); } catch (e) {} }); bmEls = [];
    if (!overlay) return;
    if (pageBounds) bmList('ayah_bookmarks').forEach(function (x) {
      var q = String(x).split(':'), boxes = pageBounds[(+q[0]) + ':' + (+q[1])];
      (boxes || []).forEach(function (b) {
        var el = document.createElement('div'); el.className = 'ma-bm';
        el.style.cssText = 'position:absolute;pointer-events:none;background:rgba(255,152,0,0.30);box-shadow:0 0 0 1px rgba(230,126,0,.45);border-radius:3px;left:' + (b[0] / PAGE_W) * 100 + '%;top:' + (b[1] / PAGE_H) * 100 + '%;width:' + ((b[2] - b[0]) / PAGE_W) * 100 + '%;height:' + ((b[3] - b[1]) / PAGE_H) * 100 + '%';
        overlay.appendChild(el); bmEls.push(el);
      });
    });
    if (bmList('page_bookmarks').map(Number).indexOf(lastPage) >= 0) {
      var r = document.createElement('div'); r.className = 'ma-bm';
      r.style.cssText = 'position:absolute;pointer-events:none;top:0;right:4%;width:7%;max-width:30px;aspect-ratio:22/38;background:#c0392b;clip-path:polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)';
      overlay.appendChild(r); bmEls.push(r);
    }
  }
  window.__bmChanged = drawBookmarks;

  function stopWatch() { if (watchTimer) { clearInterval(watchTimer); watchTimer = null; } }
  /* ---------- repeat (ayah / range of ayahs) ---------- */
  var REP = { mode: 'off', count: 3, gap: 0, n: 0, from: null, to: null }, repTimer = 0, curMap = null, repKeep = false;
  try { var rc = JSON.parse(localStorage.getItem('rep_cfg') || '{}'); if (rc.count != null) REP.count = rc.count; if (rc.gap != null) REP.gap = rc.gap; } catch (e) {}
  function repSave() { try { localStorage.setItem('rep_cfg', JSON.stringify({ count: REP.count, gap: REP.gap })); } catch (e) {} }
  function repLabel() { var b = playerBar && playerBar.querySelector('#madaniRep'); if (b) b.textContent = REP.mode === 'off' ? '🔁' : '🔁' + (REP.count ? '×' + REP.count : '∞'); }
  /* called when ayah `ayah` of `sura` has just finished: returns an ayah number to play again, 'stop', or null to carry on normally */
  function repeatTarget(sura, ayah) {
    if (REP.mode === 'off') return null;
    var inf = REP.count === 0;
    if (REP.mode === 'ayah') {
      if (inf || REP.n < REP.count - 1) { REP.n++; return ayah; }
      REP.n = 0; return null;
    }
    if (REP.mode === 'range' && REP.from && REP.to && REP.from.s === sura && ayah === REP.to.a) {
      if (inf || REP.n < REP.count - 1) { REP.n++; return REP.from.a; }
      REP.n = 0; return 'stop';
    }
    return null;
  }
  function repSeek(t) {
    clearTimeout(repTimer);
    var ms = curMap ? (curMap[t] != null ? curMap[t] : (t === 1 && curMap[0] != null ? curMap[0] : 0)) : 0;
    var go = function () { if (!audio) return; try { audio.currentTime = ms / 1000; var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} };
    if (REP.gap > 0) { try { audio.pause(); } catch (e) {} repTimer = setTimeout(go, REP.gap * 1000); } else go();
  }
  function openRepeat() {
    var ov = document.getElementById('madaniRepSheet'); if (ov) ov.remove();
    ov = document.createElement('div'); ov.id = 'madaniRepSheet';
    ov.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:99990;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center';
    var cs = current || { sura: 1, ayah: 1 }, maxA = AYAH_COUNT[cs.sura] || 7;
    var toDef = REP.to && REP.to.s === cs.sura ? REP.to.a : Math.min(maxA, cs.ayah + 4);
    function chip(id, on, txt) { return '<span data-i="' + id + '" style="display:inline-block;padding:9px 13px;margin:3px;border-radius:12px;border:1px solid #cfe0d6;cursor:pointer;' + (on ? 'background:#1b6b4b;color:#fff' : 'background:#fff;color:#173f35') + '">' + txt + '</span>'; }
    var h = '<div style="width:100%;max-width:560px;background:#fff;color:#1b1b1b;border-radius:18px 18px 0 0;padding:14px 14px 22px;direction:rtl;max-height:85vh;overflow:auto">';
    h += '<b style="font-size:18px">دووبارەکردنەوە</b><div style="color:#666;font-size:13px;margin:4px 0 8px">ئایەتی ئێستا: ' + cs.sura + ' : ' + cs.ayah + '</div>';
    h += '<div>' + chip('m:off', REP.mode === 'off', 'کوژاوە') + chip('m:ayah', REP.mode === 'ayah', 'هەر ئایەتێک چەند جار') + chip('m:range', REP.mode === 'range', 'دووبارەکردنەوەی چەند ئایەت') + '</div>';
    h += '<div id="repRange" style="margin:8px 0;display:' + (REP.mode === 'range' ? 'block' : 'none') + '">لە ئایەتی <b>' + cs.ayah + '</b> تا ئایەتی <input id="repTo" type="number" min="' + cs.ayah + '" max="' + maxA + '" value="' + toDef + '" style="width:70px;padding:6px;border-radius:8px;border:1px solid #cfd8d3;font:inherit"> (لە ' + maxA + ')</div>';
    h += '<div style="margin-top:8px;font-weight:700">ژمارەی دووبارەکردنەوە</div><div>' + [2, 3, 5, 7, 10, 0].map(function (n) { return chip('c:' + n, REP.count === n, n ? n + '×' : '∞ بێکۆتا'); }).join('') + '</div>';
    h += '<div style="margin-top:8px;font-weight:700">وەستان لە نێوان دووبارەکان</div><div>' + [0, 1, 2, 3, 5].map(function (n) { return chip('g:' + n, REP.gap === n, n ? n + ' چرکە' : 'بێ وەستان'); }).join('') + '</div>';
    h += '<div style="margin-top:14px;text-align:center"><span id="repOk" style="display:inline-block;padding:11px 30px;border-radius:12px;background:#1b6b4b;color:#fff;font-weight:700;cursor:pointer">باشە</span></div></div>';
    ov.innerHTML = h; document.body.appendChild(ov);
    var mode = REP.mode, count = REP.count, gap = REP.gap;
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { ov.remove(); return; }
      var t = e.target.closest && e.target.closest('[data-i]');
      if (t) {
        var k = t.getAttribute('data-i').split(':');
        if (k[0] === 'm') mode = k[1]; else if (k[0] === 'c') count = +k[1]; else gap = +k[1];
        Array.prototype.forEach.call(ov.querySelectorAll('[data-i]'), function (x) {
          var q = x.getAttribute('data-i').split(':'), on = (q[0] === 'm' && q[1] === mode) || (q[0] === 'c' && +q[1] === count) || (q[0] === 'g' && +q[1] === gap);
          x.style.background = on ? '#1b6b4b' : '#fff'; x.style.color = on ? '#fff' : '#173f35';
        });
        ov.querySelector('#repRange').style.display = mode === 'range' ? 'block' : 'none';
        return;
      }
      if (e.target.id === 'repOk') {
        REP.mode = mode; REP.count = count; REP.gap = gap; REP.n = 0; repSave(); clearTimeout(repTimer);
        if (mode === 'ayah') { REP.from = { s: cs.sura, a: cs.ayah }; REP.to = null; }
        else if (mode === 'range') { var to = Math.max(cs.ayah, Math.min(maxA, +ov.querySelector('#repTo').value || cs.ayah)); REP.from = { s: cs.sura, a: cs.ayah }; REP.to = { s: cs.sura, a: to }; }
        repLabel(); ov.remove();
      }
    });
  }

  function startWatch(timingMap, sura) {
    stopWatch(); curMap = timingMap;
    if (!timingMap || !audio) return;
    watchTimer = setInterval(function () {
      if (!audio || audio.paused) return;
      var ms = (audio.currentTime || 0) * 1000;
      var ayahs = Object.keys(timingMap).map(Number).filter(function (a) { return a > 0 && a < 900; }).sort(function (a, b) { return a - b; });
      var curA = ayahs[0] || 1;
      for (var i = 0; i < ayahs.length; i++) { if (timingMap[ayahs[i]] <= ms) curA = ayahs[i]; else break; }
      if (REP.mode !== 'off' && current && current.sura === sura && curA > current.ayah) {
        var rt = repeatTarget(sura, current.ayah);
        if (rt === 'stop') { try { audio.pause(); } catch (e) {} finishPlayback(); return; }
        if (typeof rt === 'number') { repSeek(rt); return; }
      }
      if (!current || current.sura !== sura || current.ayah !== curA) {
        current = { sura: sura, ayah: curA };
        drawHighlight(sura, curA);
        var lab = playerBar && playerBar.querySelector('#madaniLabel');
        if (lab) lab.textContent = sura + ' : ' + curA;
        /* the recitation moved on to the next page: turn the page */
        if (pageBounds && !pageBounds[sura + ':' + curA] && lastPage > 0 && lastPage < 604 && typeof window.openPage === 'function') {
          window.openPage(lastPage + 1);
        }
      }
    }, 70);
  }

  function playGapless(m, sura, ayah, map) {
    var url = audioUrlSurah(m, sura);
    setStatus('بارکردنی دەنگ…');
    audio = new Audio(); audio.preload = 'auto'; audio.src = url; applySpeed();
    audio.onerror = function () {
      setStatus('دەنگ بار نەبوو — قارئێکی تر هەڵبژێرە');
      var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
    };
    function startWithMap(finalMap) {
      var startMs = 0;
      if (finalMap) {
        if (finalMap[ayah] != null) startMs = finalMap[ayah];
        else if (ayah === 1 && finalMap[0] != null) startMs = finalMap[0];
        timingCache[(m.id || '') + ':' + sura] = finalMap;
      }
      function doPlay() {
        try { if (startMs > 0 && isFinite(audio.duration) && startMs / 1000 < audio.duration) audio.currentTime = startMs / 1000; } catch (e) {}
        audio.play().then(function () {
          setStatus('پەنجە لەسەر ئایەت → هایلایت + دەنگ');
          var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '⏸';
          if (finalMap) startWatch(finalMap, sura);
        }).catch(function () {
          setStatus('دووبارە پەنجە بنێ');
          var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
        });
      }
      if (audio.readyState >= 1) doPlay(); else audio.addEventListener('loadedmetadata', doPlay, { once: true });
    }
    if (map && Object.keys(map).length) startWithMap(map);
    else {
      audio.addEventListener('loadedmetadata', function () {
        startWithMap(estimateTimings(sura, (audio.duration || 60) * 1000));
      }, { once: true });
      audio.load();
    }
    audio.onended = function () {
      var t = current ? repeatTarget(sura, current.ayah) : null;
      if (typeof t === 'number') { repSeek(t); return; }
      finishPlayback();
    };
  }

  function playAyah(sura, ayah) {
    sura = +sura; ayah = +ayah;
    current = { sura: sura, ayah: ayah };
    pendingNext = null;
    resumable = false;
    if (!repKeep) REP.n = 0; repKeep = false;
    drawHighlight(sura, ayah); stopWatch(); clearTimeout(repTimer);
    if (playerBar) {
      var lab = playerBar.querySelector('#madaniLabel'); if (lab) lab.textContent = sura + ' : ' + ayah;
      var btn = playerBar.querySelector('#madaniPlay'); if (btn) btn.textContent = '⏸';
    }
    if (audio) { try { audio.onended = null; audio.onerror = null; audio.pause(); } catch (e) {} }
    var m = recMeta();
    if (m && m.t === 'g' && m.u) { loadTimings(m, sura, function (map) { playGapless(m, sura, ayah, map); }); return; }
    audio = getAudio();
    audio.onended = null; audio.onerror = null;
    audio.src = audioUrlAyah(sura, ayah); applySpeed();
    audio.onerror = function () {
      setStatus('دەنگ بار نەبوو');
      var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
    };
    audio.play().then(function () { setStatus('پەنجە لەسەر ئایەت → هایلایت + دەنگ'); }).catch(function () {
      var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
    });
    audio.onended = function () {
      var rt = repeatTarget(sura, ayah);
      if (rt === 'stop') { finishPlayback(); return; }
      if (typeof rt === 'number') { clearTimeout(repTimer); repTimer = setTimeout(function () { repKeep = true; playAyah(sura, rt); }, REP.gap * 1000); return; }
      var so = window.__surahOnly;
      var next = null;
      for (var i = 0; i < pageAyahOrder.length; i++) {
        if (pageAyahOrder[i].sura === sura && pageAyahOrder[i].ayah === ayah && i + 1 < pageAyahOrder.length) { next = pageAyahOrder[i + 1]; break; }
      }
      /* "read the surah" stops at the last ayah of that surah */
      if (so && ((AYAH_COUNT[sura] && ayah >= AYAH_COUNT[sura]) || (next && next.sura !== so))) { finishPlayback(); return; }
      if (next) playAyah(next.sura, next.ayah);
      else if (window.__madaniContinue !== false && lastPage > 0 && lastPage < 604 && typeof window.openPage === 'function') {
        /* last ayah of the page: go to the next page and keep reading */
        pendingNext = { sura: sura, ayah: ayah };
        window.openPage(lastPage + 1);
      } else finishPlayback();
    };
  }

  function loadBounds(page) {
    return fetch('madani-bounds/' + pad(page, 3) + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (data) {
      pageBounds = data;
      pageAyahOrder = Object.keys(data).map(function (k) {
        var p = k.split(':'); return { sura: +p[0], ayah: +p[1] };
      }).sort(function (a, b) { return a.sura - b.sura || a.ayah - b.ayah; });
      setStatus('پەنجە لەسەر ئایەت → هایلایت + دەنگ');
      if (pendingNext) {
        var last = pendingNext, nx = null;
        pendingNext = null;
        for (var i = 0; i < pageAyahOrder.length; i++) {
          var o = pageAyahOrder[i];
          if (o.sura > last.sura || (o.sura === last.sura && o.ayah > last.ayah)) { nx = o; break; }
        }
        if (!nx && pageAyahOrder.length) nx = pageAyahOrder[0];
        if (nx && window.__surahOnly && nx.sura !== window.__surahOnly) nx = null;
        if (nx) playAyah(nx.sura, nx.ayah); else finishPlayback();
      } else if (current) {
        drawHighlight(current.sura, current.ayah);
      }
      drawBookmarks();
    }).catch(function () { pageBounds = null; pendingNext = null; });
  }

  function showPage(page) {
    page = Math.max(1, Math.min(604, +page || 1));
    if (!ensureUI()) return;
    lastPage = page;
    var img = document.getElementById('pageImg');
    if (!img) return;
    function sync() { if (overlay && img) { var h = img.offsetHeight || img.clientHeight; if (h) overlay.style.height = h + 'px'; } }
    function ready() { sync(); loadBounds(page); }
    if (img.complete && img.naturalHeight) ready();
    else img.addEventListener('load', ready, { once: true });
    setTimeout(sync, 100); setTimeout(sync, 500);
  }

  function installHook() {
    var orig = window.openPage;
    if (typeof orig === 'function' && !orig.__madaniHooked) {
      window.openPage = function (p) {
        orig.apply(this, arguments);
        setTimeout(function () { showPage(p); }, 80);
        setTimeout(function () { showPage(p); }, 400);
      };
      window.openPage.__madaniHooked = true;
    }
    var img = document.getElementById('pageImg');
    if (img && !img.__madaniWatch) {
      img.__madaniWatch = true;
      new MutationObserver(function () {
        var m = (img.src || '').match(/page(\d{3})\.png/i);
        if (m && +m[1] !== lastPage) showPage(+m[1]);
      }).observe(img, { attributes: true, attributeFilter: ['src'] });
    }
  }

  /* ---------- hold-to-auto-scroll (page reader): glides down the page, then continues on the next page ---------- */
  var ASP = [12, 25, 45, 70, 105, 150, 220], asLv = 2, asRun = false, asLatch = false, asT0 = 0, asLast = 0, asAcc = 0, asRaf = 0, asBox = null, asWait = 0;
  try { var q0 = parseInt(localStorage.getItem('as_speed'), 10); if (q0 >= 0 && q0 < ASP.length) asLv = q0; } catch (e) {}
  function asEl(i) { return document.getElementById(i); }
  function asLabel() { var l = asEl('asLv2'); if (l) l.textContent = (asLv + 1) + '/' + ASP.length; try { localStorage.setItem('as_speed', String(asLv)); } catch (e) {} }
  function asStop() { asRun = false; asLatch = false; cancelAnimationFrame(asRaf); var g = asEl('asGo2'); if (g) { g.classList.remove('on'); g.textContent = '⬇'; } }
  /* continuous mode: a scrolling stack of page images (pages are fit-to-screen, so there is nothing to scroll otherwise) */
  var cont = null, contLast = 0, asShow = true;
  function pageUrl(n) { return 'https://android.quran.com/data/width_1260/page' + String(n).padStart(3, '0') + '.png'; }
  function contAdd() { if (!cont || contLast >= 604) return false; contLast++; var im = document.createElement('img'); im.dataset.p = contLast; im.src = pageUrl(contLast); im.style.cssText = 'display:block;width:100%;height:auto;border-bottom:2px solid #e3d8b8;min-height:' + Math.round(window.innerWidth * 1.6) + 'px;background:#fffdf5'; cont.appendChild(im); return true; }
  function contScroll() {
    var mid = cont.scrollTop + cont.clientHeight / 2, ims = cont.children, cur2 = lastPage;
    for (var i = 0; i < ims.length; i++) { var t = ims[i].offsetTop; if (t <= mid && mid < t + ims[i].offsetHeight) { cur2 = +ims[i].dataset.p; break; } }
    if (cur2 !== lastPage) {
      lastPage = cur2; try { localStorage.setItem('preview_page', String(cur2)); if (typeof currentPage !== 'undefined') currentPage = cur2; } catch (e) {}
      var t2 = asEl('pageTitle'); if (t2) t2.textContent = 'پەڕەی ' + cur2; var inp = asEl('pageInput'); if (inp) inp.value = cur2;
      var pg = asEl('asPg'); if (pg) pg.textContent = cur2;
    }
    if (cont.scrollTop + cont.clientHeight * 2.2 > cont.scrollHeight) contAdd();
  }
  function contEnter() {
    if (cont) return;
    cont = document.createElement('div'); cont.id = 'madaniCont';
    var pb = asEl('madaniPlayer');
    cont.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:' + (pb && pb.offsetHeight ? pb.offsetHeight : 0) + 'px;z-index:9980;overflow-y:auto;overflow-x:hidden;background:#fffdf5;-webkit-overflow-scrolling:touch';
    document.body.appendChild(cont); contLast = lastPage - 1; for (var i = 0; i < 3; i++) contAdd();
    cont.addEventListener('scroll', contScroll, { passive: true });
    asShow = true; cont.addEventListener('click', function () { asShow = !asShow; asBox.classList.toggle('on', asShow); });
    asBox.classList.add('cs'); var pg = asEl('asPg'); if (pg) pg.textContent = lastPage;
  }
  function contExit() {
    asStop(); if (!cont) return; var p = lastPage; cont.remove(); cont = null; asBox.classList.remove('cs');
    if (typeof window.openPage === 'function') window.openPage(p);
  }
  function asTick(t) {
    if (!asRun || !cont) return;
    var dt = Math.min(0.05, (t - asLast) / 1000); asLast = t;
    asAcc += ASP[asLv] * dt; var step = Math.floor(asAcc);
    if (step > 0) { asAcc -= step; var before = cont.scrollTop; cont.scrollTop = before + step; if (cont.scrollTop === before && !contAdd()) { asStop(); return; } }
    asRaf = requestAnimationFrame(asTick);
  }
  function asStart() { if (asRun) return; contEnter(); asRun = true; asAcc = 0; asLast = performance.now(); asWait = 0; asEl('asGo2').classList.add('on'); asRaf = requestAnimationFrame(asTick); }
  function buildAuto() {
    if (asBox) return;
    var st = document.createElement('style');
    st.textContent = '#asBox2{position:fixed;right:8px;bottom:8px;z-index:9990;display:none;gap:5px;align-items:center;touch-action:none;background:rgba(0,0,0,.38);padding:4px 6px;border-radius:26px}#asBox2.on{display:flex}' +
      '#asBox2 button{width:34px;height:34px;border:0;border-radius:50%;background:rgba(27,107,75,.95);color:#fff;font-size:17px;font-weight:700;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none;padding:0}' +
      '#asGo2{width:44px!important;height:44px!important;font-size:22px!important;background:#ffd54f!important;color:#173f35!important}#asGo2.on{background:#e67e22!important;color:#fff!important}#asLv2{color:#fff;font-size:11px;min-width:26px;text-align:center}#asExit2{display:none;background:rgba(120,30,30,.9)!important}#asBox2.cs #asExit2{display:block}#asPg{color:#ffd54f;font-size:12px;font-weight:700;min-width:24px;text-align:center;display:none}#asBox2.cs #asPg{display:inline}';
    document.head.appendChild(st);
    asBox = document.createElement('div'); asBox.id = 'asBox2';
    asBox.innerHTML = '<button type="button" id="asExit2" aria-label="exit">✕</button><span id="asPg"></span><button type="button" id="asDn2">－</button><span id="asLv2"></span><button type="button" id="asUp2">＋</button><button type="button" id="asGo2" aria-label="auto scroll">⬇</button>';
    document.body.appendChild(asBox); asLabel();
    var g = asEl('asGo2');
    g.addEventListener('pointerdown', function (e) { e.preventDefault(); try { g.setPointerCapture(e.pointerId); } catch (x) {} if (asLatch) { asStop(); asT0 = -1; return; } asT0 = Date.now(); asStart(); });
    g.addEventListener('pointerup', function () { if (asT0 < 0) { asT0 = 0; return; } if (!asRun) return; if (Date.now() - asT0 < 250) { asLatch = true; g.textContent = '⏸'; } else if (!asLatch) asStop(); });
    g.addEventListener('pointercancel', function () { if (!asLatch) asStop(); });
    g.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    asEl('asExit2').onclick = contExit;
    asEl('asUp2').onclick = function () { asLv = Math.min(ASP.length - 1, asLv + 1); asLabel(); };
    asEl('asDn2').onclick = function () { asLv = Math.max(0, asLv - 1); asLabel(); };
    setInterval(function () {
      var rd = asEl('reader'), on = !!(rd && rd.classList.contains('active'));
      var pbv = asEl('madaniPlayer'), uiVis = !!(pbv && pbv.style.display !== 'none' && getComputedStyle(pbv).display !== 'none');
      if (!on) { if (cont) contExit(); else if (asRun) asStop(); }
      asBox.classList.toggle('on', on && (cont ? asShow : uiVis));
      var pb = asEl('madaniPlayer'); asBox.style.bottom = ((pb && pb.offsetHeight ? pb.offsetHeight : 0) + 8) + 'px';
    }, 400);
  }

  /* swipe left/right on the page to turn it (same as the other mushafs) */
  function installSwipe() {
    var m = asEl('mushaf'); if (!m || m.__swipe) return; m.__swipe = true;
    var sx = 0, sy = 0, multi = false;
    m.addEventListener('touchstart', function (e) { multi = e.touches.length !== 1; if (!multi) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { capture: true, passive: true });
    m.addEventListener('touchend', function (e) {
      if (multi || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) {
        e.stopPropagation(); e.preventDefault();
        var np = lastPage + (dx > 0 ? 1 : -1);
        if (np >= 1 && np <= 604 && typeof window.openPage === 'function') window.openPage(np);
      }
    }, { capture: true, passive: false });
  }

  function boot() {
    buildAuto(); installSwipe();
    installHook();
    try {
      var reader = document.getElementById('reader');
      if (reader && reader.classList.contains('active')) {
        var p = +localStorage.getItem('preview_page') || 1;
        var input = document.getElementById('pageInput');
        if (input && input.value) p = +input.value || p;
        showPage(p);
      }
    } catch (e) {}
  }

  /* Small API used by ayah-actions.js (toolbar: play / share / tafsir, show-hide player) */
  window.__madani = {
    /* play from this ayah and keep going (not limited to one surah) */
    play: function (s, a) { window.__surahOnly = null; playAyah(s, a); },
    startSurah: startSurah,
    surahOfPage: surahOfPage,
    mark: function (s, a) { current = { sura: +s, ayah: +a }; drawHighlight(+s, +a); var lab = playerBar && playerBar.querySelector('#madaniLabel'); if (lab) lab.textContent = s + ' : ' + a; },
    clearMark: function () { if (!audio || audio.paused) clearHighlight(); },
    pause: function () {
      if (audio && !audio.paused) { audio.pause(); stopWatch(); resumable = true; var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶'; }
    },
    current: function () { return current; },
    togglePlayer: function (show) {
      if (!playerBar) return false;
      var on = typeof show === 'boolean' ? show : playerBar.style.display === 'none';
      playerBar.style.display = on ? 'flex' : 'none';
      return on;
    },
    playerVisible: function () { return !!playerBar && playerBar.style.display !== 'none'; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50); setTimeout(boot, 500); setTimeout(boot, 1500);
    });
  } else {
    setTimeout(boot, 50); setTimeout(boot, 500); setTimeout(boot, 1500);
  }
  var tries = 0;
  var t = setInterval(function () { installHook(); if (++tries > 25) clearInterval(t); }, 250);
})();
