/* Madinah image mushaf: ayah tap -> highlight + qari (like APK). v2 */
(function () {
  if (window.__madaniAyahInstalled) return;
  window.__madaniAyahInstalled = true;

  var LINES = 15;
  var TOP = 0.11;
  var BOTTOM = 0.07;
  var SIDE = 0.05;

  var overlay = null;
  var playerBar = null;
  var audio = null;
  var current = null;
  var reciter = 'Alafasy_128kbps';
  var pageVerses = [];
  var lineMap = {}; // lineNumber -> {sura,ayah}
  var lastPage = -1;

  function pad(n, w) {
    n = String(n);
    while (n.length < w) n = '0' + n;
    return n;
  }

  function ensureUI() {
    var mushaf = document.getElementById('mushaf');
    var img = document.getElementById('pageImg');
    if (!mushaf || !img) return false;

    if (!img.parentElement || img.parentElement.id !== 'madaniWrap') {
      var wrap = document.createElement('div');
      wrap.id = 'madaniWrap';
      wrap.style.cssText = 'position:relative;width:100%;line-height:0;-webkit-user-select:none;user-select:none;';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
    }

    img.style.cssText = 'width:100%;height:auto;display:block;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;pointer-events:none;';
    img.setAttribute('draggable', 'false');

    overlay = document.getElementById('madaniOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'madaniOverlay';
      document.getElementById('madaniWrap').appendChild(overlay);
    }
    overlay.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;width:100%;height:100%;' +
      'z-index:5;pointer-events:auto;cursor:pointer;touch-action:manipulation;' +
      '-webkit-user-select:none;user-select:none;';

    // Block browser image menu
    function blockMenu(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    overlay.oncontextmenu = blockMenu;
    img.oncontextmenu = blockMenu;
    document.getElementById('madaniWrap').oncontextmenu = blockMenu;

    if (!overlay.__madaniBound) {
      overlay.__madaniBound = true;
      function onTap(e) {
        e.preventDefault();
        e.stopPropagation();
        var rect = overlay.getBoundingClientRect();
        var clientY = (e.changedTouches && e.changedTouches[0])
          ? e.changedTouches[0].clientY
          : e.clientY;
        var clientX = (e.changedTouches && e.changedTouches[0])
          ? e.changedTouches[0].clientX
          : e.clientX;
        var y = (clientY - rect.top) / rect.height;
        var x = (clientX - rect.left) / rect.width;
        if (x < SIDE || x > 1 - SIDE || y < TOP || y > 1 - BOTTOM) return;
        var rel = (y - TOP) / (1 - TOP - BOTTOM);
        var line = Math.max(1, Math.min(LINES, Math.floor(rel * LINES) + 1));
        var hit = lineMap[line];
        if (hit) playAyah(hit.sura, hit.ayah);
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
      playerBar.style.cssText =
        'display:none;margin-top:10px;padding:10px;background:#173f35;color:#fff;border-radius:12px;font-size:14px;position:relative;z-index:6;';
      playerBar.innerHTML =
        '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
        '<select id="madaniReciter" style="flex:1;min-width:140px;padding:6px;border-radius:8px;border:0"></select>' +
        '<button id="madaniPlay" type="button" style="padding:8px 14px;border:0;border-radius:8px;background:#ffd54f;color:#173f35;font-weight:bold;cursor:pointer">▶</button>' +
        '<span id="madaniLabel" style="flex:1;min-width:100px;text-align:center"></span></div>';
      mushaf.parentNode.insertBefore(playerBar, mushaf.nextSibling);

      var sel = playerBar.querySelector('#madaniReciter');
      [
        ['Alafasy_128kbps', 'مەشاری عەفاسی'],
        ['Abdul_Basit_Murattal_192kbps', 'عەبدولباست'],
        ['Husary_128kbps', 'حوساری'],
        ['Minshawy_Murattal_128kbps', 'مەنشاوی'],
        ['Abdurrahmaan_As-Sudais_192kbps', 'سودەیس'],
        ['Hudhaify_128kbps', 'حوزەیفی'],
        ['Maher_AlMuaiqly_64kbps', 'موعەیقلی'],
        ['Ghamadi_40kbps', 'غامدی']
      ].forEach(function (r) {
        var o = document.createElement('option');
        o.value = r[0];
        o.textContent = r[1];
        sel.appendChild(o);
      });
      try {
        var saved = localStorage.getItem('madani_reciter');
        if (saved) sel.value = saved;
      } catch (e) {}
      reciter = sel.value;
      sel.onchange = function () {
        reciter = sel.value;
        try { localStorage.setItem('madani_reciter', reciter); } catch (e) {}
        if (current) playAyah(current.sura, current.ayah);
      };
      playerBar.querySelector('#madaniPlay').onclick = function () {
        if (!current) return;
        if (audio && !audio.paused) {
          audio.pause();
          this.textContent = '▶';
        } else if (audio) {
          audio.play();
          this.textContent = '⏸';
        } else playAyah(current.sura, current.ayah);
      };
    }
    return true;
  }

  function audioUrl(sura, ayah) {
    return 'https://everyayah.com/data/' + reciter + '/' + pad(sura, 3) + pad(ayah, 3) + '.mp3';
  }

  function playAyah(sura, ayah) {
    current = { sura: sura, ayah: ayah };
    if (playerBar) {
      playerBar.style.display = 'block';
      var lab = playerBar.querySelector('#madaniLabel');
      if (lab) lab.textContent = sura + ' : ' + ayah;
      var btn = playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '⏸';
    }
    highlightLine(sura, ayah);
    if (audio) {
      try { audio.pause(); } catch (e) {}
    }
    audio = new Audio(audioUrl(sura, ayah));
    audio.play().catch(function () {
      var btn = playerBar && playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '▶';
    });
    audio.onended = function () {
      var btn = playerBar && playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '▶';
      for (var i = 0; i < pageVerses.length; i++) {
        if (pageVerses[i].sura === sura && pageVerses[i].ayah === ayah && i + 1 < pageVerses.length) {
          playAyah(pageVerses[i + 1].sura, pageVerses[i + 1].ayah);
          return;
        }
      }
    };
  }

  function highlightLine(sura, ayah) {
    if (!overlay) return;
    var old = overlay.querySelector('.ma-hl');
    if (old) old.remove();
    var lines = [];
    for (var ln in lineMap) {
      if (lineMap[ln].sura === sura && lineMap[ln].ayah === ayah) lines.push(+ln);
    }
    if (!lines.length) return;
    lines.sort(function (a, b) { return a - b; });
    var from = lines[0], to = lines[lines.length - 1];
    var topPct = (TOP + ((from - 1) / LINES) * (1 - TOP - BOTTOM)) * 100;
    var hPct = ((to - from + 1) / LINES) * (1 - TOP - BOTTOM) * 100;
    var el = document.createElement('div');
    el.className = 'ma-hl';
    el.style.cssText =
      'position:absolute;left:' + SIDE * 100 + '%;width:' + (1 - 2 * SIDE) * 100 + '%;' +
      'top:' + topPct + '%;height:' + hPct + '%;background:rgba(255,213,79,0.32);' +
      'border-radius:4px;pointer-events:none;';
    overlay.appendChild(el);
  }

  function buildLineMap(verses) {
    pageVerses = verses;
    lineMap = {};
    verses.forEach(function (v) {
      (v.lines || []).forEach(function (ln) {
        lineMap[ln] = { sura: v.sura, ayah: v.ayah };
      });
    });
  }

  function loadPage(page) {
    page = Math.max(1, Math.min(604, +page || 1));
    if (!ensureUI()) return;
    var img = document.getElementById('pageImg');
    if (!img) return;

    function fetchData() {
      var h = img.offsetHeight || img.clientHeight;
      if (h) overlay.style.height = h + 'px';
      fetch('https://api.quran.com/api/v4/verses/by_page/' + page + '?words=true&per_page=50')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var verses = [];
          (data.verses || []).forEach(function (v) {
            var parts = String(v.verse_key || '').split(':');
            var sura = +parts[0], ayah = +parts[1];
            var lines = {};
            (v.words || []).forEach(function (w) {
              if (w.line_number) lines[w.line_number] = true;
            });
            verses.push({ sura: sura, ayah: ayah, lines: Object.keys(lines).map(Number) });
          });
          buildLineMap(verses);
          lastPage = page;
          var st = document.getElementById('pageStatus');
          if (st) st.textContent = 'پەنجە لەسەر ئایەت دابنێ بۆ گوێگرتن (' + verses.length + ' ئایەت)';
        })
        .catch(function () {
          var st = document.getElementById('pageStatus');
          if (st) st.textContent = 'پەڕە بارکرا';
        });
    }

    if (img.complete && img.naturalHeight) fetchData();
    else img.addEventListener('load', fetchData, { once: true });
  }

  function installHook() {
    var orig = window.openPage;
    if (typeof orig === 'function' && !orig.__madaniHooked) {
      window.openPage = function (p) {
        orig.apply(this, arguments);
        setTimeout(function () { loadPage(p); }, 80);
        setTimeout(function () { loadPage(p); }, 400);
      };
      window.openPage.__madaniHooked = true;
    }
    // Also watch pageInput / img src changes
    var img = document.getElementById('pageImg');
    if (img && !img.__madaniWatch) {
      img.__madaniWatch = true;
      var mo = new MutationObserver(function () {
        var m = (img.src || '').match(/page(\d{3})\.png/i);
        if (m) {
          var p = +m[1];
          if (p !== lastPage) loadPage(p);
        }
      });
      mo.observe(img, { attributes: true, attributeFilter: ['src'] });
    }
  }

  function boot() {
    installHook();
    try {
      var reader = document.getElementById('reader');
      var img = document.getElementById('pageImg');
      if (reader && reader.classList.contains('active') && img && img.src) {
        var m = img.src.match(/page(\d{3})\.png/i);
        loadPage(m ? +m[1] : (+localStorage.getItem('preview_page') || 1));
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(boot, 50);
      setTimeout(boot, 500);
      setTimeout(boot, 1500);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 500);
    setTimeout(boot, 1500);
  }
  // Keep trying to hook openPage if scripts load late
  var tries = 0;
  var t = setInterval(function () {
    installHook();
    if (++tries > 20) clearInterval(t);
  }, 300);
})();
