/* Madinah IMAGE + APK bounds + full reciters list. v5 */
(function () {
  if (window.__madaniAyahInstalled) return;
  window.__madaniAyahInstalled = true;

  var PAGE_W = 1260;
  var PAGE_H = 2038;
  var overlay = null;
  var playerBar = null;
  var audio = null;
  var current = null;
  var reciters = [];
  var reciterId = 'Alafasy_128kbps';
  var pageBounds = null;
  var pageAyahOrder = [];
  var lastPage = -1;
  var hlEls = [];

  function pad(n, w) {
    n = String(n);
    while (n.length < w) n = '0' + n;
    return n;
  }

  function recMeta() {
    for (var i = 0; i < reciters.length; i++) {
      if (reciters[i].id === reciterId) return reciters[i];
    }
    return null;
  }

  function isGapless() {
    var m = recMeta();
    return !!(m && m.t === 'g');
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
    grpG.label = 'سورەت بەسورەت (gapless)';
    list.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id;
      o.textContent = r.n || r.id;
      if (r.t === 'g') grpG.appendChild(o);
      else grpA.appendChild(o);
    });
    if (grpA.children.length) sel.appendChild(grpA);
    if (grpG.children.length) sel.appendChild(grpG);
    try {
      var saved = localStorage.getItem('madani_reciter');
      if (saved) sel.value = saved;
    } catch (e) {}
    if (!sel.value && list.length) sel.value = list[0].id;
    reciterId = sel.value;
  }

  function loadRecitersList(cb) {
    var urls = ['mushaf/reciters.json', 'web/mushaf/reciters.json'];
    function tryNext(i) {
      if (i >= urls.length) {
        reciters = [
          { id: 'Alafasy_128kbps', n: 'مەشاری عەفاسی', t: 'a' },
          { id: 'Abdul_Basit_Murattal_192kbps', n: 'عەبدولباست', t: 'a' },
          { id: 'Husary_128kbps', n: 'حوساری', t: 'a' },
          { id: 'Minshawy_Murattal_128kbps', n: 'مەنشاوی', t: 'a' },
          { id: 'Abdurrahmaan_As-Sudais_192kbps', n: 'سودەیس', t: 'a' },
          { id: 'Hudhaify_128kbps', n: 'حوزەیفی', t: 'a' },
          { id: 'Maher_AlMuaiqly_64kbps', n: 'موعەیقلی', t: 'a' },
          { id: 'Ghamadi_40kbps', n: 'غامدی', t: 'a' }
        ];
        cb();
        return;
      }
      fetch(urls[i])
        .then(function (r) {
          if (!r.ok) throw 0;
          return r.json();
        })
        .then(function (data) {
          if (Array.isArray(data) && data.length) {
            reciters = data;
            cb();
          } else throw 0;
        })
        .catch(function () {
          tryNext(i + 1);
        });
    }
    tryNext(0);
  }

  function ensureUI() {
    var mushaf = document.getElementById('mushaf');
    var img = document.getElementById('pageImg');
    if (!mushaf || !img) return false;

    img.style.display = 'block';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.pointerEvents = 'none';
    img.setAttribute('draggable', 'false');
    img.style.webkitUserSelect = 'none';
    img.style.userSelect = 'none';
    img.style.webkitTouchCallout = 'none';

    var oldFrame = document.getElementById('madaniFrame');
    if (oldFrame) oldFrame.remove();

    if (!img.parentElement || img.parentElement.id !== 'madaniWrap') {
      var wrap = document.createElement('div');
      wrap.id = 'madaniWrap';
      wrap.style.cssText = 'position:relative;width:100%;line-height:0;-webkit-user-select:none;user-select:none;';
      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
    }

    overlay = document.getElementById('madaniOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'madaniOverlay';
      document.getElementById('madaniWrap').appendChild(overlay);
    }
    overlay.style.cssText =
      'position:absolute;left:0;top:0;width:100%;height:100%;z-index:5;' +
      'pointer-events:auto;cursor:pointer;touch-action:manipulation;';

    function blockMenu(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    overlay.oncontextmenu = blockMenu;
    img.oncontextmenu = blockMenu;

    if (!overlay.__bound) {
      overlay.__bound = true;
      function onTap(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!pageBounds) return;
        var rect = overlay.getBoundingClientRect();
        var cx =
          (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : e.clientX) -
          rect.left;
        var cy =
          (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : e.clientY) -
          rect.top;
        var x = cx * (PAGE_W / rect.width);
        var y = cy * (PAGE_H / rect.height);
        var hit = null;
        for (var key in pageBounds) {
          var boxes = pageBounds[key];
          for (var i = 0; i < boxes.length; i++) {
            var b = boxes[i];
            if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) {
              hit = key;
              break;
            }
          }
          if (hit) break;
        }
        if (hit) {
          var p = hit.split(':');
          playAyah(+p[0], +p[1]);
        }
      }
      overlay.addEventListener('click', onTap, true);
      overlay.addEventListener(
        'touchend',
        function (e) {
          if (e.changedTouches && e.changedTouches.length) onTap(e);
        },
        { passive: false }
      );
    }

    playerBar = document.getElementById('madaniPlayer');
    if (!playerBar) {
      playerBar = document.createElement('div');
      playerBar.id = 'madaniPlayer';
      playerBar.style.cssText =
        'display:flex;margin-top:10px;padding:10px;background:#173f35;color:#fff;border-radius:12px;font-size:14px;gap:8px;align-items:center;flex-wrap:wrap;';
      playerBar.innerHTML =
        '<select id="madaniReciter" style="flex:1;min-width:160px;max-width:100%;padding:6px;border-radius:8px;border:0"></select>' +
        '<button id="madaniPlay" type="button" style="padding:8px 14px;border:0;border-radius:8px;background:#ffd54f;color:#173f35;font-weight:bold;cursor:pointer">▶</button>' +
        '<span id="madaniLabel" style="min-width:70px;text-align:center">—</span>';
      mushaf.parentNode.insertBefore(playerBar, mushaf.nextSibling);

      var sel = playerBar.querySelector('#madaniReciter');
      loadRecitersList(function () {
        fillReciters(sel);
      });
      sel.onchange = function () {
        reciterId = sel.value;
        try {
          localStorage.setItem('madani_reciter', reciterId);
        } catch (e) {}
        if (current) playAyah(current.sura, current.ayah);
      };
      playerBar.querySelector('#madaniPlay').onclick = function () {
        if (!current) return;
        if (audio && !audio.paused) {
          audio.pause();
          this.textContent = '▶';
        } else if (audio && audio.src) {
          audio.play();
          this.textContent = '⏸';
        } else playAyah(current.sura, current.ayah);
      };
    } else {
      var sel2 = playerBar.querySelector('#madaniReciter');
      if (sel2 && !sel2.options.length) {
        loadRecitersList(function () {
          fillReciters(sel2);
        });
      }
    }
    return true;
  }

  function audioUrl(sura, ayah) {
    var m = recMeta();
    if (m && m.t === 'g' && m.u) {
      return m.u + pad(sura, 3) + '.mp3';
    }
    return 'https://everyayah.com/data/' + reciterId + '/' + pad(sura, 3) + pad(ayah, 3) + '.mp3';
  }

  function clearHighlight() {
    hlEls.forEach(function (el) {
      try {
        el.remove();
      } catch (e) {}
    });
    hlEls = [];
  }

  function drawHighlight(sura, ayah) {
    clearHighlight();
    if (!overlay || !pageBounds) return;
    var boxes = pageBounds[sura + ':' + ayah];
    if (!boxes) return;
    boxes.forEach(function (b) {
      var el = document.createElement('div');
      el.className = 'ma-hl';
      el.style.cssText =
        'position:absolute;pointer-events:none;background:rgba(255,213,79,0.38);border-radius:3px;' +
        'left:' +
        (b[0] / PAGE_W) * 100 +
        '%;top:' +
        (b[1] / PAGE_H) * 100 +
        '%;width:' +
        ((b[2] - b[0]) / PAGE_W) * 100 +
        '%;height:' +
        ((b[3] - b[1]) / PAGE_H) * 100 +
        '%;';
      overlay.appendChild(el);
      hlEls.push(el);
    });
  }

  function playAyah(sura, ayah) {
    sura = +sura;
    ayah = +ayah;
    current = { sura: sura, ayah: ayah };
    drawHighlight(sura, ayah);

    if (playerBar) {
      playerBar.style.display = 'flex';
      var lab = playerBar.querySelector('#madaniLabel');
      if (lab) lab.textContent = sura + ' : ' + ayah;
      var btn = playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '⏸';
    }

    if (audio) {
      try {
        audio.onended = null;
        audio.pause();
      } catch (e) {}
    }

    var url = audioUrl(sura, ayah);
    audio = new Audio(url);
    audio.play().catch(function () {
      var btn = playerBar && playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '▶';
    });

    audio.onended = function () {
      var btn = playerBar && playerBar.querySelector('#madaniPlay');
      if (isGapless()) {
        if (btn) btn.textContent = '▶';
        clearHighlight();
        return;
      }
      var next = null;
      for (var i = 0; i < pageAyahOrder.length; i++) {
        if (
          pageAyahOrder[i].sura === sura &&
          pageAyahOrder[i].ayah === ayah &&
          i + 1 < pageAyahOrder.length
        ) {
          next = pageAyahOrder[i + 1];
          break;
        }
      }
      if (next) playAyah(next.sura, next.ayah);
      else {
        if (btn) btn.textContent = '▶';
        clearHighlight();
      }
    };
  }

  function loadBounds(page) {
    return fetch('madani-bounds/' + pad(page, 3) + '.json')
      .then(function (r) {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then(function (data) {
        pageBounds = data;
        pageAyahOrder = Object.keys(data)
          .map(function (k) {
            var p = k.split(':');
            return { sura: +p[0], ayah: +p[1] };
          })
          .sort(function (a, b) {
            return a.sura - b.sura || a.ayah - b.ayah;
          });
        var st = document.getElementById('pageStatus');
        if (st) st.textContent = 'پەنجە لەسەر ئایەت → هایلایت + دەنگ';
      })
      .catch(function () {
        pageBounds = null;
        var st = document.getElementById('pageStatus');
        if (st) st.textContent = 'پەڕە بارکرا';
      });
  }

  function showPage(page) {
    page = Math.max(1, Math.min(604, +page || 1));
    if (!ensureUI()) return;
    lastPage = page;
    var img = document.getElementById('pageImg');
    if (!img) return;
    function syncOverlaySize() {
      if (!overlay || !img) return;
      var h = img.offsetHeight || img.clientHeight;
      if (h) overlay.style.height = h + 'px';
    }
    function ready() {
      syncOverlaySize();
      loadBounds(page);
    }
    if (img.complete && img.naturalHeight) ready();
    else img.addEventListener('load', ready, { once: true });
    setTimeout(syncOverlaySize, 100);
    setTimeout(syncOverlaySize, 500);
  }

  function installHook() {
    var orig = window.openPage;
    if (typeof orig === 'function' && !orig.__madaniHooked) {
      window.openPage = function (p) {
        orig.apply(this, arguments);
        setTimeout(function () {
          showPage(p);
        }, 80);
        setTimeout(function () {
          showPage(p);
        }, 400);
      };
      window.openPage.__madaniHooked = true;
    }
    var img = document.getElementById('pageImg');
    if (img && !img.__madaniWatch) {
      img.__madaniWatch = true;
      new MutationObserver(function () {
        var m = (img.src || '').match(/page(\d{3})\.png/i);
        if (m) {
          var p = +m[1];
          if (p !== lastPage) showPage(p);
        }
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
      setTimeout(boot, 50);
      setTimeout(boot, 500);
      setTimeout(boot, 1500);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 500);
    setTimeout(boot, 1500);
  }
  var tries = 0;
  var t = setInterval(function () {
    installHook();
    if (++tries > 25) clearInterval(t);
  }, 250);
})();
