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
      if (Object.keys(map).length) { timingCache[key] = map; cb(map); } else cb(null);
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
      playerBar.innerHTML = '<select id="madaniReciter" style="flex:1;min-width:160px;padding:6px;border-radius:8px;border:0"></select><button id="madaniPlay" type="button" style="padding:8px 14px;border:0;border-radius:8px;background:#ffd54f;color:#173f35;font-weight:bold;cursor:pointer">▶</button><span id="madaniLabel" style="min-width:70px;text-align:center">—</span>';
      mushaf.parentNode.insertBefore(playerBar, mushaf.nextSibling);
      var sel = playerBar.querySelector('#madaniReciter');
      loadRecitersList(function () { fillReciters(sel); });
      sel.onchange = function () {
        reciterId = sel.value;
        try { localStorage.setItem('madani_reciter', reciterId); } catch (e) {}
        if (current) playAyah(current.sura, current.ayah);
      };
      playerBar.querySelector('#madaniPlay').onclick = onPlayerButton;
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

  function stopWatch() { if (watchTimer) { clearInterval(watchTimer); watchTimer = null; } }
  function startWatch(timingMap, sura) {
    stopWatch();
    if (!timingMap || !audio) return;
    watchTimer = setInterval(function () {
      if (!audio || audio.paused) return;
      var ms = (audio.currentTime || 0) * 1000;
      var ayahs = Object.keys(timingMap).map(Number).filter(function (a) { return a > 0 && a < 900; }).sort(function (a, b) { return a - b; });
      var curA = ayahs[0] || 1;
      for (var i = 0; i < ayahs.length; i++) { if (timingMap[ayahs[i]] <= ms) curA = ayahs[i]; else break; }
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
    }, 150);
  }

  function playGapless(m, sura, ayah, map) {
    var url = audioUrlSurah(m, sura);
    setStatus('بارکردنی دەنگ…');
    audio = new Audio(); audio.preload = 'auto'; audio.src = url;
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
    audio.onended = function () { finishPlayback(); };
  }

  function playAyah(sura, ayah) {
    sura = +sura; ayah = +ayah;
    current = { sura: sura, ayah: ayah };
    pendingNext = null;
    resumable = false;
    drawHighlight(sura, ayah); stopWatch();
    if (playerBar) {
      var lab = playerBar.querySelector('#madaniLabel'); if (lab) lab.textContent = sura + ' : ' + ayah;
      var btn = playerBar.querySelector('#madaniPlay'); if (btn) btn.textContent = '⏸';
    }
    if (audio) { try { audio.onended = null; audio.onerror = null; audio.pause(); } catch (e) {} }
    var m = recMeta();
    if (m && m.t === 'g' && m.u) { loadTimings(m, sura, function (map) { playGapless(m, sura, ayah, map); }); return; }
    audio = getAudio();
    audio.onended = null; audio.onerror = null;
    audio.src = audioUrlAyah(sura, ayah);
    audio.onerror = function () {
      setStatus('دەنگ بار نەبوو');
      var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
    };
    audio.play().then(function () { setStatus('پەنجە لەسەر ئایەت → هایلایت + دەنگ'); }).catch(function () {
      var b = playerBar && playerBar.querySelector('#madaniPlay'); if (b) b.textContent = '▶';
    });
    audio.onended = function () {
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

  function boot() {
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
