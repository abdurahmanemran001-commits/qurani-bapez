/* ruqyah-reciters.js v5 — multi voice, NO infinite DOM loop */
(function () {
  if (window.__ruqyahRecitersV5) return;
  window.__ruqyahRecitersV5 = true;

  var RECITERS = [
    { id: 'alafasy', name: 'میشاری عەفاسی', folder: 'Alafasy_128kbps' },
    { id: 'sudais', name: 'عەبدولڕەحمان سوودەیس', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
    { id: 'maher', name: 'ماهر موئەیقلی', folder: 'Maher_AlMuaiqly_64kbps' },
    { id: 'husary', name: 'مەحموود خەلیلی حوسەری', folder: 'Husary_128kbps' },
    { id: 'minshawi', name: 'مەنشاوی (مورتەل)', folder: 'Minshawy_Murattal_128kbps' },
    { id: 'ghamadi', name: 'سەعد غامدی', folder: 'Ghamadi_40kbps' },
    { id: 'yasser', name: 'یاسەر دووسەری', folder: 'Yasser_Ad-Dussary_128kbps' },
    { id: 'ajm', name: 'ئەحمەد عەجمی', folder: 'Ahmed_ibn_Ali_al-Ajamy_64kbps_QuranExplorer.Com' },
    { id: 'basit', name: 'عەبدولباسیت (مورتەل)', folder: 'Abdul_Basit_Murattal_192kbps' },
    { id: 'shatri', name: 'ئەبووبەکر شاتری', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' }
  ];

  var KEY = 'ruqyah_v1';
  var reciterId = 'alafasy';
  try {
    var st = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (st.reciterId) reciterId = st.reciterId;
  } catch (e) {}

  function folderOf() {
    var r = RECITERS.find(function (x) { return x.id === reciterId; }) || RECITERS[0];
    return r.folder;
  }

  /* Rewrite everyayah URLs to selected reciter — only when Audio is created */
  var OrigAudio = window.Audio;
  window.Audio = function (src) {
    if (typeof src === 'string' && src.indexOf('everyayah.com/data/') >= 0) {
      src = src.replace(/https:\/\/everyayah\.com\/data\/[^/]+\//, 'https://everyayah.com/data/' + folderOf() + '/');
    }
    return new OrigAudio(src);
  };
  try { window.Audio.prototype = OrigAudio.prototype; } catch (e) {}

  function injectCss() {
    if (document.getElementById('rqReciterCss')) return;
    var st = document.createElement('style');
    st.id = 'rqReciterCss';
    st.textContent =
      '#rqReciterBar{display:flex;align-items:center;gap:8px;margin:8px 0 12px;flex-wrap:wrap;background:#e8f0eb;padding:12px;border-radius:12px;border:1px solid #c5d5cc}' +
      '#rqReciterBar label{font-size:13px;font-weight:700;color:#1a3d2e}' +
      '#rqReciterBar select{flex:1;min-width:160px;border:1px solid #c5d5cc;border-radius:10px;padding:10px;background:#fff;font-size:14px}' +
      '#ruqyah .rq-btn[data-act="play"]{background:#176b4b!important;color:#fff!important;border:0!important;padding:10px 14px!important;border-radius:10px!important;font-weight:700!important}' +
      '#ruqyah .rq-btn[data-act="play"].on{background:#c0392b!important}';
    document.head.appendChild(st);
  }

  function injectBar() {
    injectCss();
    var view = document.getElementById('ruqyah');
    if (!view) return;
    if (document.getElementById('rqReciterBar')) return;

    var bar = document.createElement('div');
    bar.id = 'rqReciterBar';
    var lab = document.createElement('label');
    lab.textContent = 'قارئ / سەوت بۆ گۆێگرتن:';
    var sel = document.createElement('select');
    sel.id = 'rqReciter';
    RECITERS.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id;
      o.textContent = r.name;
      if (r.id === reciterId) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = function () {
      reciterId = sel.value;
      try {
        var st = JSON.parse(localStorage.getItem(KEY) || '{}');
        st.reciterId = reciterId;
        localStorage.setItem(KEY, JSON.stringify(st));
      } catch (e) {}
    };
    bar.appendChild(lab);
    bar.appendChild(sel);

    var note = view.querySelector('.rq-note');
    var tabs = view.querySelector('.rq-tabs');
    if (note && note.parentNode) note.parentNode.insertBefore(bar, note.nextSibling);
    else if (tabs && tabs.parentNode) tabs.parentNode.insertBefore(bar, tabs);
    else view.insertBefore(bar, view.firstChild);
  }

  function fixPlayLabels() {
    var view = document.getElementById('ruqyah');
    if (!view) return;
    view.querySelectorAll('button[data-act="play"]').forEach(function (b) {
      var t = b.textContent || '';
      if (t.indexOf('گوێگرتن') >= 0) b.textContent = t.replace(/گوێگرتن/g, 'گۆێگرتن');
      if (t.indexOf('گۆێگرتن') < 0 && t.indexOf('ڕاگرتن') < 0 && t.indexOf('▶') >= 0) {
        b.textContent = '▶ گۆێگرتن';
      }
    });
  }

  function enhanceOnce() {
    try {
      injectBar();
      fixPlayLabels();
    } catch (e) {
      console.warn('ruqyah enhance', e);
    }
  }

  /* Hook enterRuqyah — run once after UI builds */
  function hookEnter() {
    if (typeof window.enterRuqyah !== 'function') return false;
    if (window.enterRuqyah.__safeHooked) return true;
    var orig = window.enterRuqyah;
    window.enterRuqyah = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(enhanceOnce, 100);
      setTimeout(enhanceOnce, 400);
      return ret;
    };
    window.enterRuqyah.__safeHooked = true;
    return true;
  }

  /* When tabs rebuild the list, bar may be removed — re-add on click inside view */
  document.addEventListener('click', function (e) {
    var view = document.getElementById('ruqyah');
    if (!view || !view.classList.contains('active')) return;
    if (!view.contains(e.target)) return;
    /* defer so core can finish rebuild first */
    setTimeout(enhanceOnce, 50);
  }, true);

  /* Light poll only until hook is ready — no DOM spam after that */
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (hookEnter() || tries > 40) clearInterval(iv);
  }, 500);
})();
