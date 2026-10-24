/* Madinah image mushaf: invisible ayah hit-areas + highlight + qari audio (like the APK). */
(function () {
  if (window.__madaniAyahInstalled) return;
  window.__madaniAyahInstalled = true;

  var LINES = 15;
  var TOP = 0.12;
  var BOTTOM = 0.08;
  var SIDE = 0.06;

  var overlay = null;
  var playerBar = null;
  var audio = null;
  var current = null;
  var reciter = 'Alafasy_128kbps';
  var pageVerses = [];

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
      wrap.style.cssText = 'position:relative;width:100%;line-height:0;';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    }

    overlay = document.getElementById('madaniOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'madaniOverlay';
      overlay.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;';
      document.getElementById('madaniWrap').appendChild(overlay);
    }

    playerBar = document.getElementById('madaniPlayer');
    if (!playerBar) {
      playerBar = document.createElement('div');
      playerBar.id = 'madaniPlayer';
      playerBar.style.cssText = 'display:none;margin-top:10px;padding:10px;background:#173f35;color:#fff;border-radius:12px;font-size:14px;';
      playerBar.innerHTML =
        '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
        '<select id="madaniReciter" style="flex:1;min-width:140px;padding:6px;border-radius:8px;border:0"></select>' +
        '<button id="madaniPlay" type="button" style="padding:8px 14px;border:0;border-radius:8px;background:#ffd54f;color:#173f35;font-weight:bold;cursor:pointer">▶</button>' +
        '<span id="madaniLabel" style="flex:1;min-width:100px;text-align:center"></span>' +
        '</div>';
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
      if (lab) lab.textContent = sura + ':' + ayah;
      var btn = playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '⏸';
    }
    highlight(sura, ayah);
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
      var next = null;
      for (var i = 0; i < pageVerses.length; i++) {
        if (pageVerses[i].sura === sura && pageVerses[i].ayah === ayah && i + 1 < pageVerses.length) {
          next = pageVerses[i + 1];
          break;
        }
      }
      if (next) playAyah(next.sura, next.ayah);
    };
  }

  function highlight(sura, ayah) {
    if (!overlay) return;
    var nodes = overlay.querySelectorAll('.ma');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (+el.dataset.s === sura && +el.dataset.a === ayah) {
        el.style.background = 'rgba(255,213,79,0.35)';
      } else {
        el.style.background = 'transparent';
      }
    }
  }

  function buildOverlays(verses) {
    if (!overlay) return;
    overlay.innerHTML = '';
    pageVerses = verses;
    var map = {};
    verses.forEach(function (v) {
      var key = v.sura + ':' + v.ayah;
      if (!map[key]) map[key] = { sura: v.sura, ayah: v.ayah, lines: {} };
      (v.lines || []).forEach(function (ln) {
        map[key].lines[ln] = true;
      });
    });

    Object.keys(map).forEach(function (key) {
      var v = map[key];
      var lines = Object.keys(v.lines).map(Number).sort(function (a, b) { return a - b; });
      if (!lines.length) return;
      var start = lines[0], prev = lines[0];
      function addBand(from, to) {
        var topPct = (TOP + ((from - 1) / LINES) * (1 - TOP - BOTTOM)) * 100;
        var hPct = ((to - from + 1) / LINES) * (1 - TOP - BOTTOM) * 100;
        var el = document.createElement('div');
        el.className = 'ma';
        el.dataset.s = v.sura;
        el.dataset.a = v.ayah;
        el.style.cssText =
          'position:absolute;left:' + (SIDE * 100) + '%;width:' + ((1 - 2 * SIDE) * 100) + '%;' +
          'top:' + topPct + '%;height:' + hPct + '%;pointer-events:auto;cursor:pointer;border-radius:4px;';
        el.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          playAyah(v.sura, v.ayah);
        });
        overlay.appendChild(el);
      }
      for (var i = 1; i <= lines.length; i++) {
        if (i === lines.length || lines[i] !== prev + 1) {
          addBand(start, prev);
          if (i < lines.length) {
            start = lines[i];
            prev = lines[i];
          }
        } else {
          prev = lines[i];
        }
      }
    });
  }

  function loadPage(page) {
    if (!ensureUI()) return;
    var img = document.getElementById('pageImg');
    if (!img) return;

    function onReady() {
      overlay.style.height = img.offsetHeight + 'px';
      var url = 'https://api.quran.com/api/v4/verses/by_page/' + page + '?words=true&per_page=50';
      fetch(url)
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
          buildOverlays(verses);
          var st = document.getElementById('pageStatus');
          if (st) st.textContent = 'پەنجە لەسەر ئایەت دابنێ بۆ گوێگرتن';
        })
        .catch(function () {
          var st = document.getElementById('pageStatus');
          if (st) st.textContent = 'پەڕە بارکرا';
        });
    }

    if (img.complete && img.naturalHeight) onReady();
    else img.addEventListener('load', onReady, { once: true });
  }

  function installHook() {
    var orig = window.openPage;
    if (typeof orig !== 'function') return;
    if (orig.__madaniHooked) return;
    window.openPage = function (p) {
      orig.apply(this, arguments);
      var page = Math.max(1, Math.min(604, Number(p) || 1));
      setTimeout(function () { loadPage(page); }, 50);
    };
    window.openPage.__madaniHooked = true;
    try {
      var cur = +localStorage.getItem('preview_page') || 1;
      var reader = document.getElementById('reader');
      if (reader && reader.classList.contains('active')) loadPage(cur);
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(installHook, 100);
      setTimeout(installHook, 800);
    });
  } else {
    setTimeout(installHook, 100);
    setTimeout(installHook, 800);
  }
})();
