/* Madinah IMAGE + APK bounds + gapless + custom ayah URL. v14 */
(function () {
  if (window.__madaniAyahInstalled) return;
  window.__madaniAyahInstalled = true;

  var PAGE_W = 1260, PAGE_H = 2038;
  var overlay = null, playerBar = null, audio = null, current = null;
  var reciters = [], reciterId = 'Alafasy_128kbps';
  var pageBounds = null, pageAyahOrder = [], lastPage = -1, hlEls = [];
  var timingCache = {};
  var watchTimer = null;

  var AYAH_COUNT = [0,7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

  function pad(n, w) {
    n = String(n);
    while (n.length < w) n = '0' + n;
    return n;
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

  function loadTimings(m, sura, cb) {
    var key = (m.id || '') + ':' + sura;
    if (timingCache[key]) return cb(timingCache[key]);
    var url = 'madani-timing/' + encodeURIComponent(m.id) + '.json';
    fetch(url)
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (all) {
        var suraMap = all[String(sura)] || all[sura] || {};
        var map = {};
        Object.keys(suraMap).forEach(function (a) { map[+a] = +suraMap[a]; });
        if (Object.keys(map).length) {
          timingCache[key] = map;
          cb(map);
        } else cb(null);
      })
      .catch(function () { cb(null); });
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
    var grpA = document.createElement('optgroup');
    grpA.label = 'ئایەت بە ئایەت';
    var grpG = document.createElement('optgroup');
    grpG.label = 'سورەت تەواو (gapless)';
    list.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id;
      o.textContent = r.n || r.e || r.id;
      if (r.t === 'g') grpG.appendChild(o);
      else grpA.appendChild(o);
    });
    if (grpA.children.length) sel.appendChild(grpA);
    if (grpG.children.length) sel.appendChild(grpG);
    sel.value = reciterId;
  }

  function ensureUI() {
    var img = document.getElementById('pageImg');
    var mushaf = document.getElementById('mushaf');
    if (!img || !mushaf) return false;

    if (!img.parentElement || img.parentElement.id !== 'madaniWrap') {
      var wrap = document.createElement('div');
      wrap.id = 'madaniWrap';
      wrap.style.cssText = 'position:relative;width:100%;margin:0 auto;';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    }

    var wrap = document.getElementById('madaniWrap');
    if (!document.getElementById('madaniOverlay')) {
      overlay = document.createElement('div');
      overlay.id = 'madaniOverlay';
      overlay.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:5;';
      wrap.appendChild(overlay);
      overlay.addEventListener('click', onTap);
      overlay.addEventListener('touchend', function (e) {
        e.preventDefault();
        onTap(e.changedTouches ? e.changedTouches[0] : e);
      }, { passive: false });
      overlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    } else {
      overlay = document.getElementById('madaniOverlay');
    }

    if (!document.getElementById('madaniPlayer')) {
      playerBar = document.createElement('div');
      playerBar.id = 'madaniPlayer';
      playerBar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:#173f35;color:#fff;border-radius:12px;margin-top:8px;flex-wrap:wrap;';
      playerBar.innerHTML =
        '<span id="madaniPos" style="min-width:48px;font-size:13px">—</span>' +
        '<button id="madaniPlayBtn" style="border:0;background:#ffd54f;color:#173f35;border-radius:10px;width:42px;height:36px;font-size:16px;cursor:pointer">▶</button>' +
        '<select id="madaniReciter" style="flex:1;min-width:120px;border:0;border-radius:10px;padding:6px 8px;font:inherit"></select>';
      var reader = document.getElementById('reader');
      var bar = reader && reader.querySelector('.readerbar');
      if (bar && bar.parentNode) bar.parentNode.insertBefore(playerBar, bar);
      else if (mushaf && mushaf.parentNode) mushaf.parentNode.appendChild(playerBar);

      document.getElementById('madaniPlayBtn').onclick = function () {
        if (!audio) return;
        if (audio.paused) audio.play();
        else audio.pause();
      };
      document.getElementById('madaniReciter').onchange = function () {
        reciterId = this.value;
        try { localStorage.setItem('madani_reciter', reciterId); } catch (e) {}
        if (current) playAyah(current.sura, current.ayah);
      };
    } else {
      playerBar = document.getElementById('madaniPlayer');
    }

    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('play', function () {
        var b = document.getElementById('madaniPlayBtn');
        if (b) b.textContent = '⏸';
      });
      audio.addEventListener('pause', function () {
        var b = document.getElementById('madaniPlayBtn');
        if (b) b.textContent = '▶';
      });
      audio.addEventListener('ended', function () {
        if (!current || !pageAyahOrder.length) return;
        var idx = -1;
        for (var i = 0; i < pageAyahOrder.length; i++) {
          if (pageAyahOrder[i].sura === current.sura && pageAyahOrder[i].ayah === current.ayah) {
            idx = i; break;
          }
        }
        if (idx >= 0 && idx + 1 < pageAyahOrder.length) {
          var n = pageAyahOrder[idx + 1];
          playAyah(n.sura, n.ayah);
        }
      });
    }

    if (!reciters.length) {
      fetch('mushaf/reciters.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .catch(function () { return fetch('web/mushaf/reciters.json').then(function (r) { return r.json(); }); })
        .then(function (j) {
          reciters = j || [];
          try {
            var saved = localStorage.getItem('madani_reciter');
            if (saved) reciterId = saved;
          } catch (e) {}
          fillReciters(document.getElementById('madaniReciter'));
        })
        .catch(function () {});
    } else {
      fillReciters(document.getElementById('madaniReciter'));
    }
    return true;
  }

  function clearHl() {
    hlEls.forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });
    hlEls = [];
  }

  function highlight(sura, ayah) {
    clearHl();
    if (!pageBounds || !overlay) return;
    var key = sura + ':' + ayah;
    var boxes = pageBounds[key];
    if (!boxes || !boxes.length) return;
    boxes.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'ma-hl';
      el.style.cssText =
        'position:absolute;pointer-events:none;background:rgba(255,213,79,0.45);border-radius:4px;' +
        'left:' + ((b[0] / PAGE_W) * 100) + '%;' +
        'top:' + ((b[1] / PAGE_H) * 100) + '%;' +
        'width:' + ((b[2] / PAGE_W) * 100) + '%;' +
        'height:' + ((b[3] / PAGE_H) * 100) + '%;';
      overlay.appendChild(el);
      hlEls.push(el);
    });
  }

  function hitTest(clientX, clientY) {
    if (!pageBounds || !overlay) return null;
    var rect = overlay.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var x = ((clientX - rect.left) / rect.width) * PAGE_W;
    var y = ((clientY - rect.top) / rect.height) * PAGE_H;
    var keys = Object.keys(pageBounds);
    for (var i = 0; i < keys.length; i++) {
      var boxes = pageBounds[keys[i]];
      for (var j = 0; j < boxes.length; j++) {
        var b = boxes[j];
        if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3]) {
          var p = keys[i].split(':');
          return { sura: +p[0], ayah: +p[1] };
        }
      }
    }
    return null;
  }

  function onTap(e) {
    var cx = e.clientX, cy = e.clientY;
    if (e.touches && e.touches[0]) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    }
    var hit = hitTest(cx, cy);
    if (hit) playAyah(hit.sura, hit.ayah);
  }

  function audioUrlAyah(m, sura, ayah) {
    var ss = pad(sura, 3), aa = pad(ayah, 3);
    if (m && m.u) {
      var base = m.u.replace(/\/?$/, '/');
      return base + ss + aa + '.mp3';
    }
    return 'https://everyayah.com/data/' + (m && m.id ? m.id : reciterId) + '/' + ss + aa + '.mp3';
  }

  function audioUrlGapless(m, sura) {
    var base = (m.u || '').replace(/\/?$/, '/');
    return base + pad(sura, 3) + '.mp3';
  }

  function playAyah(sura, ayah) {
    sura = +sura; ayah = +ayah;
    current = { sura: sura, ayah: ayah };
    highlight(sura, ayah);
    var pos = document.getElementById('madaniPos');
    if (pos) pos.textContent = sura + ':' + ayah;

    var m = recMeta();
    if (!audio) return;

    if (isGapless()) {
      var url = audioUrlGapless(m, sura);
      var needLoad = !audio.src || audio.src.indexOf(pad(sura, 3) + '.mp3') < 0;
      function seekAndPlay(map) {
        var t = map && map[ayah] != null ? map[ayah] / 1000 : 0;
        var go = function () {
          try { audio.currentTime = t; } catch (e) {}
          audio.play().catch(function () {});
        };
        if (audio.readyState >= 1) go();
        else audio.addEventListener('loadedmetadata', go, { once: true });
      }
      if (needLoad) {
        audio.src = url;
        audio.load();
      }
      loadTimings(m, sura, function (map) {
        if (!map) {
          var onMeta = function () {
            map = estimateTimings(sura, (audio.duration || 60) * 1000);
            seekAndPlay(map);
          };
          if (audio.duration && isFinite(audio.duration)) onMeta();
          else audio.addEventListener('loadedmetadata', onMeta, { once: true });
        } else seekAndPlay(map);
      });
      if (watchTimer) clearInterval(watchTimer);
      watchTimer = setInterval(function () {
        if (!isGapless() || !current || audio.paused) return;
        loadTimings(m, current.sura, function (map) {
          if (!map) return;
          var ms = audio.currentTime * 1000;
          var keys = Object.keys(map).map(Number).filter(function (k) { return k < 900; }).sort(function (a, b) { return a - b; });
          var cur = current.ayah;
          for (var i = 0; i < keys.length; i++) {
            var a = keys[i];
            var start = map[a];
            var end = map[keys[i + 1]] != null ? map[keys[i + 1]] : (map[999] || 1e12);
            if (ms >= start && ms < end && a !== cur) {
              current.ayah = a;
              highlight(current.sura, a);
              var p = document.getElementById('madaniPos');
              if (p) p.textContent = current.sura + ':' + a;
              break;
            }
          }
        });
      }, 200);
    } else {
      if (watchTimer) { clearInterval(watchTimer); watchTimer = null; }
      var url2 = audioUrlAyah(m, sura, ayah);
      audio.src = url2;
      audio.load();
      var tryPlay = function () { audio.play().catch(function () {}); };
      if (audio.readyState >= 2) tryPlay();
      else audio.addEventListener('canplay', tryPlay, { once: true });
    }
  }

  function loadBounds(page) {
    pageBounds = null;
    pageAyahOrder = [];
    fetch('madani-bounds/' + pad(page, 3) + '.json')
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (data) {
        pageBounds = data;
        pageAyahOrder = Object.keys(data)
          .map(function (k) {
            var p = k.split(':');
            return { sura: +p[0], ayah: +p[1] };
          })
          .sort(function (a, b) { return a.sura - b.sura || a.ayah - b.ayah; });
        setStatus('پەنجە لەسەر ئایەت → هایلایت + دەنگ');
      })
      .catch(function () { pageBounds = null; });
  }

  function showPage(page) {
    page = Math.max(1, Math.min(604, +page || 1));
    if (!ensureUI()) return;
    lastPage = page;
    var img = document.getElementById('pageImg');
    if (!img) return;
    function sync() {
      if (overlay && img) {
        var h = img.offsetHeight || img.clientHeight;
        if (h) overlay.style.height = h + 'px';
      }
    }
    function ready() { sync(); loadBounds(page); }
    if (img.complete && img.naturalHeight) ready();
    else img.addEventListener('load', ready, { once: true });
    setTimeout(sync, 100);
    setTimeout(sync, 500);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50); setTimeout(boot, 500); setTimeout(boot, 1500);
    });
  } else {
    setTimeout(boot, 50); setTimeout(boot, 500); setTimeout(boot, 1500);
  }
  var tries = 0;
  var t = setInterval(function () {
    installHook();
    if (++tries > 25) clearInterval(t);
  }, 250);
})();
