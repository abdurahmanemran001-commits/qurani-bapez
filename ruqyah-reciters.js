/* ruqyah-reciters.js v4 — multi voice + force گۆێگرتن buttons */
(function () {
  if (window.__ruqyahRecitersV4) return;
  window.__ruqyahRecitersV4 = true;

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

  var AUDIO_MAP = {
    'سورەتی الفاتحة': ['001001','001002','001003','001004','001005','001006','001007'],
    'ئایەتولکورسی': ['002255'],
    'دوو ئایەتی کۆتایی سورەتی البقرة': ['002285','002286'],
    'سورەتی الإخلاص': ['001001','112001','112002','112003','112004'],
    'سورەتی الفلق': ['001001','113001','113002','113003','113004','113005'],
    'سورەتی الناس': ['001001','114001','114002','114003','114004','114005','114006']
  };

  var KEY = 'ruqyah_v1';
  var reciterId = 'alafasy';
  try {
    var st = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (st.reciterId) reciterId = st.reciterId;
  } catch (e) {}

  var audio = null, playingBtn = null;

  function folderOf() {
    var r = RECITERS.find(function (x) { return x.id === reciterId; }) || RECITERS[0];
    return r.folder;
  }
  function urlFor(code) {
    return 'https://everyayah.com/data/' + folderOf() + '/' + code + '.mp3';
  }
  function mapUrl(u) {
    if (!u || typeof u !== 'string') return u;
    return u.replace(/https:\/\/everyayah\.com\/data\/[^/]+\//, 'https://everyayah.com/data/' + folderOf() + '/');
  }

  var OrigAudio = window.Audio;
  window.Audio = function (src) {
    if (typeof src === 'string' && src.indexOf('everyayah.com/data/') >= 0) src = mapUrl(src);
    return new OrigAudio(src);
  };
  try { window.Audio.prototype = OrigAudio.prototype; } catch (e) {}

  function toast(msg) {
    var t = document.getElementById('rqToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'rqToast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a3d2e;color:#fff;padding:10px 16px;border-radius:10px;z-index:9999;font-size:13px;display:none';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.style.display = 'none'; }, 2200);
  }

  function stopPlay() {
    if (audio) { try { audio.pause(); } catch (e) {} audio = null; }
    if (playingBtn) {
      playingBtn.classList.remove('on');
      playingBtn.textContent = '▶ گۆێگرتن';
      playingBtn = null;
    }
  }

  function playCodes(btn, codes) {
    if (playingBtn === btn) { stopPlay(); return; }
    stopPlay();
    if (!codes || !codes.length) { toast('سەوت بۆ ئەمە بەردەست نییە'); return; }
    var i = 0;
    playingBtn = btn;
    btn.classList.add('on');
    btn.textContent = '■ ڕاگرتن';
    function next() {
      if (playingBtn !== btn) return;
      if (i >= codes.length) { stopPlay(); return; }
      audio = new OrigAudio(urlFor(codes[i++]));
      audio.onended = next;
      audio.onerror = function () { stopPlay(); toast('دەنگەکە بار نەبوو'); };
      var p = audio.play();
      if (p && p.catch) p.catch(function () { stopPlay(); });
    }
    next();
  }

  function injectCss() {
    if (document.getElementById('rqReciterCss')) return;
    var st = document.createElement('style');
    st.id = 'rqReciterCss';
    st.textContent = [
      '#rqReciterBar{display:flex!important;align-items:center;gap:8px;margin:8px 0 12px;flex-wrap:wrap;background:#e8f0eb;padding:12px;border-radius:12px;border:1px solid #c5d5cc}',
      '#rqReciterBar label{font-size:13px;font-weight:700;color:#1a3d2e}',
      '#rqReciterBar select{flex:1;min-width:160px;border:1px solid #c5d5cc;border-radius:10px;padding:10px;background:#fff;font-size:14px}',
      '#ruqyah .rq-btn[data-act="play"],#ruqyah .rq-play-force{',
      '  background:#176b4b!important;color:#fff!important;border:0!important;',
      '  padding:10px 14px!important;border-radius:10px!important;font-weight:700!important;',
      '  font-size:14px!important;min-width:110px}',
      '#ruqyah .rq-btn[data-act="play"].on,#ruqyah .rq-play-force.on{background:#c0392b!important}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function makeBar() {
    var bar = document.createElement('div');
    bar.id = 'rqReciterBar';
    var lab = document.createElement('label');
    lab.textContent = 'قارئ / سەوت بۆ گۆێگرتن:';
    var sel = document.createElement('select');
    sel.id = 'rqReciter';
    RECITERS.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id; o.textContent = r.name;
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
      stopPlay();
      var name = (RECITERS.find(function (x) { return x.id === reciterId; }) || {}).name || '';
      toast('سەوت: ' + name);
    };
    bar.appendChild(lab);
    bar.appendChild(sel);
    return bar;
  }

  function injectBar() {
    injectCss();
    var view = document.getElementById('ruqyah');
    if (!view) return;
    var existing = document.getElementById('rqReciterBar');
    if (existing && view.contains(existing)) return;
    if (existing) existing.remove();
    var bar = makeBar();
    var note = view.querySelector('.rq-note');
    var tabs = view.querySelector('.rq-tabs');
    if (note && note.parentNode) note.parentNode.insertBefore(bar, note.nextSibling);
    else if (tabs && tabs.parentNode) tabs.parentNode.insertBefore(bar, tabs);
    else view.insertBefore(bar, view.firstChild);
  }

  function ensurePlayButtons() {
    var view = document.getElementById('ruqyah');
    if (!view) return;
    view.querySelectorAll('.rq-ctl, .rq-item, [class*="item"]').forEach(function (el) {
      var root = el.closest('.rq-item') || el;
      var titleEl = root.querySelector('b, .rq-title, h3, strong');
      var title = titleEl ? titleEl.textContent.trim() : '';
      var codes = AUDIO_MAP[title];
      if (!codes) {
        Object.keys(AUDIO_MAP).forEach(function (k) {
          if (!codes && title.indexOf(k) >= 0) codes = AUDIO_MAP[k];
          if (!codes && k.indexOf(title) >= 0 && title.length > 5) codes = AUDIO_MAP[k];
        });
      }

      var ctl = root.querySelector('.rq-ctl') || root;
      var play = ctl.querySelector('[data-act="play"], .rq-play-force');
      if (!play && codes) {
        play = document.createElement('button');
        play.type = 'button';
        play.className = 'rq-btn rq-play-force';
        play.setAttribute('data-act', 'play');
        play.textContent = '▶ گۆێگرتن';
        ctl.appendChild(play);
      }
      if (play) {
        if (!play.classList.contains('on')) play.textContent = '▶ گۆێگرتن';
        if (!play.__boundPlay) {
          play.__boundPlay = true;
          play.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var t = title;
            var c = codes || AUDIO_MAP[t];
            if (!c) {
              Object.keys(AUDIO_MAP).forEach(function (k) {
                if (!c && t && t.indexOf(k) >= 0) c = AUDIO_MAP[k];
              });
            }
            if (c) playCodes(play, c);
            else toast('سەوت بۆ ئەمە بەردەست نییە — بڕۆ بۆ بەشی ئایەتەکان');
          }, true);
        }
      }
    });

    view.querySelectorAll('button').forEach(function (b) {
      var t = b.textContent || '';
      if (t.indexOf('گوێگرتن') >= 0) b.textContent = t.replace(/گوێگرتن/g, 'گۆێگرتن');
    });
  }

  function hookEnter() {
    if (typeof window.enterRuqyah !== 'function') return;
    if (window.enterRuqyah.__recitersHooked) return;
    var orig = window.enterRuqyah;
    window.enterRuqyah = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(function () { injectBar(); ensurePlayButtons(); }, 80);
      setTimeout(function () { injectBar(); ensurePlayButtons(); }, 300);
      setTimeout(ensurePlayButtons, 800);
      return ret;
    };
    window.enterRuqyah.__recitersHooked = true;
  }

  function observe() {
    var view = document.getElementById('ruqyah');
    if (!view || view.__recitersObs) return;
    view.__recitersObs = true;
    new MutationObserver(function () {
      injectBar();
      ensurePlayButtons();
    }).observe(view, { childList: true, subtree: true });
  }

  setInterval(function () {
    hookEnter();
    observe();
    injectBar();
    ensurePlayButtons();
  }, 600);
})();
