/* Like the APK ColorMushaf: real ayah DOM + audioActive highlight + qari audio. v3 */
(function () {
  if (window.__madaniAyahInstalled) return;
  window.__madaniAyahInstalled = true;

  var frame = null;
  var playerBar = null;
  var audio = null;
  var current = null; // {sura, ayah}
  var reciter = 'Alafasy_128kbps';
  var lastPage = -1;
  var pageAyahs = []; // ordered list on current page

  function pad(n, w) {
    n = String(n);
    while (n.length < w) n = '0' + n;
    return n;
  }

  function ensureUI() {
    var mushaf = document.getElementById('mushaf');
    if (!mushaf) return false;

    // Hide the static PNG (image mode) — use interactive page like the APK WebView
    var img = document.getElementById('pageImg');
    if (img) {
      img.style.display = 'none';
      img.style.pointerEvents = 'none';
    }

    frame = document.getElementById('madaniFrame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'madaniFrame';
      frame.setAttribute('title', 'موسحەف');
      frame.style.cssText =
        'width:100%;min-height:520px;height:70vh;border:0;border-radius:10px;background:#fffdf5;display:block;';
      mushaf.appendChild(frame);
    }

    playerBar = document.getElementById('madaniPlayer');
    if (!playerBar) {
      playerBar = document.createElement('div');
      playerBar.id = 'madaniPlayer';
      playerBar.style.cssText =
        'display:flex;margin-top:10px;padding:10px;background:#173f35;color:#fff;border-radius:12px;font-size:14px;gap:8px;align-items:center;flex-wrap:wrap;';
      playerBar.innerHTML =
        '<select id="madaniReciter" style="flex:1;min-width:140px;padding:6px;border-radius:8px;border:0"></select>' +
        '<button id="madaniPlay" type="button" style="padding:8px 14px;border:0;border-radius:8px;background:#ffd54f;color:#173f35;font-weight:bold;cursor:pointer">▶</button>' +
        '<span id="madaniLabel" style="min-width:70px;text-align:center">—</span>';
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
        if (current) playAyah(current.sura, current.ayah, false);
      };
      playerBar.querySelector('#madaniPlay').onclick = function () {
        if (!current) return;
        if (audio && !audio.paused) {
          audio.pause();
          this.textContent = '▶';
        } else if (audio && audio.src) {
          audio.play();
          this.textContent = '⏸';
        } else if (current) {
          playAyah(current.sura, current.ayah, false);
        }
      };
    }
    return true;
  }

  function audioUrl(sura, ayah) {
    return 'https://everyayah.com/data/' + reciter + '/' + pad(sura, 3) + pad(ayah, 3) + '.mp3';
  }

  function setHighlight(sura, ayah) {
    // Same as APK: class audioActive on the exact ayah element
    try {
      if (frame && frame.contentWindow && typeof frame.contentWindow.hl === 'function') {
        frame.contentWindow.hl(sura, ayah);
      }
    } catch (e) {}
  }

  function clearHighlight() {
    try {
      if (frame && frame.contentWindow && typeof frame.contentWindow.hl === 'function') {
        frame.contentWindow.hl(0, 0);
      }
    } catch (e) {}
  }

  function playAyah(sura, ayah, fromTap) {
    sura = +sura;
    ayah = +ayah;
    current = { sura: sura, ayah: ayah };

    // 1) Highlight FIRST (like APK audioActive) — then play the same ayah
    setHighlight(sura, ayah);

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
    audio = new Audio(audioUrl(sura, ayah));
    audio.play().catch(function () {
      var btn = playerBar && playerBar.querySelector('#madaniPlay');
      if (btn) btn.textContent = '▶';
    });

    audio.onended = function () {
      var btn = playerBar && playerBar.querySelector('#madaniPlay');
      // Advance to next ayah on this page (same as APK continuous play)
      var next = null;
      for (var i = 0; i < pageAyahs.length; i++) {
        if (pageAyahs[i].sura === sura && pageAyahs[i].ayah === ayah && i + 1 < pageAyahs.length) {
          next = pageAyahs[i + 1];
          break;
        }
      }
      if (next) {
        playAyah(next.sura, next.ayah, false);
      } else {
        if (btn) btn.textContent = '▶';
        clearHighlight();
      }
    };
  }

  function loadPageAyahList(page) {
    pageAyahs = [];
    fetch('https://api.quran.com/api/v4/verses/by_page/' + page + '?per_page=50')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        (data.verses || []).forEach(function (v) {
          var parts = String(v.verse_key || '').split(':');
          pageAyahs.push({ sura: +parts[0], ayah: +parts[1] });
        });
      })
      .catch(function () {});
  }

  function showPage(page) {
    page = Math.max(1, Math.min(604, +page || 1));
    if (!ensureUI()) return;
    lastPage = page;

    // QCF page layout = same idea as APK ColorMushaf WebView (real .ayah nodes)
    var src = 'mushaf/view.html?m=q&p=' + page + '&b=' + encodeURIComponent(
      (location.origin + location.pathname).replace(/\/[^/]*$/, '/') + 'mushaf/'
    );
    // relative path is fine on same origin
    src = 'mushaf/view.html?m=q&p=' + page;

    if (!frame.src || frame.src.indexOf('p=' + page) === -1 || frame.src.indexOf('m=q') === -1) {
      frame.src = src;
    }
    loadPageAyahList(page);

    var st = document.getElementById('pageStatus');
    if (st) st.textContent = 'پەنجە لەسەر ئایەت → هایلایت + دەنگ (وەک ئەپ)';
  }

  // Messages from view.html: {ayah:[sura,ayah]} or {ready:true}
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.ayah && d.ayah.length >= 2) {
      playAyah(d.ayah[0], d.ayah[1], true);
    }
    if (d.ready && current) {
      setHighlight(current.sura, current.ayah);
    }
  });

  function installHook() {
    var orig = window.openPage;
    if (typeof orig === 'function' && !orig.__madaniHooked) {
      window.openPage = function (p) {
        orig.apply(this, arguments);
        setTimeout(function () { showPage(p); }, 60);
        setTimeout(function () { showPage(p); }, 300);
      };
      window.openPage.__madaniHooked = true;
    }

    // pageInput / changePage also
    var input = document.getElementById('pageInput');
    if (input && !input.__madaniBound) {
      input.__madaniBound = true;
      input.addEventListener('change', function () {
        showPage(input.value);
      });
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
      setTimeout(boot, 400);
      setTimeout(boot, 1200);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 400);
    setTimeout(boot, 1200);
  }
  var tries = 0;
  var t = setInterval(function () {
    installHook();
    if (++tries > 25) clearInterval(t);
  }, 250);
})();
