/* ruqyah-reciters.js v7 — settings + continuous sessions + calm themes */
(function () {
  if (window.__ruqyahRecitersV7) return;
  window.__ruqyahRecitersV7 = true;

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

  var BASE = 'https://archive.org/download/al-ruqyah/';
  var SESSIONS = [
    { id: 'afasy', name: 'میشاری عەفاسی — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Mishary%20Rashid%20Al%20Fasy.mp3', note: '~سەعاتێک' },
    { id: 'maher', name: 'ماهر موئەیقلی — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Maher%20Al%20Muaiqly.mp3', note: 'تەواو' },
    { id: 'ghamdi', name: 'سەعد غامدی — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saad%20Al%20Ghamdi.mp3', note: 'تەواو' },
    { id: 'sudais', name: 'سوودەیس — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Abdel%20Rahman%20Al-Sudais.mp3', note: 'تەواو' },
    { id: 'shuraim', name: 'شڕەیم — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saood%20As%20Shuraim.mp3', note: 'تەواو' },
    { id: 'idrees', name: 'ئیدریس ئەبکەر — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Idrees%20Abkar.mp3', note: 'تەواو' },
    { id: 'ajamy', name: 'ئەحمەد عەجمی — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Ahmed%20Bin%20Ali%20Al-Ajamy.mp3', note: 'تەواو' },
    { id: 'basit', name: 'عەبدولباسیت — تەواو', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Abdel%20Baset%20Abdel%20Samad.mp3', note: 'تەواو' },
    { id: 'full', name: 'ڕوقیەی تەواوی گشتی', file: BASE + 'Al%20Ruqyah%20Al%20Shariah%20Full.mp3', note: 'تەواو' },
    { id: 'manzil', name: 'مەنزیل — عەفاسی', file: BASE + 'Manzil%20By%20Mishaari%20Rasheed%20AlFasy.mp3', note: 'مەنزیل' },
    { id: 'qatami', name: 'ناصر قەتامی — تەواو', file: 'https://archive.org/download/AlRuqyahAlShariahFullBySheikhNasserAlQatami/Al_Ruqyah_Al_Shariah_Full_by_Sheikh_Nasser_Al-Qatami.mp3', note: 'تەواو' }
  ];

  var THEMES = [
    { id: 'soft_green', name: 'سەوزی ئارام', bg: 'linear-gradient(180deg,#f4f7f5 0%,#e8f0eb 100%)', paper: '#ffffff', text: '#1a2e24' },
    { id: 'sand', name: 'خۆڵەمێشی گەرم', bg: 'linear-gradient(180deg,#faf6f0 0%,#f0e6d8 100%)', paper: '#fffdf9', text: '#3d2e1f' },
    { id: 'sky', name: 'ئاسمانی سووک', bg: 'linear-gradient(180deg,#f0f6fb 0%,#dceaf5 100%)', paper: '#ffffff', text: '#1a2a3a' },
    { id: 'lavender', name: 'مۆری سووک', bg: 'linear-gradient(180deg,#f6f3f9 0%,#ebe4f2 100%)', paper: '#ffffff', text: '#2a1f35' },
    { id: 'night', name: 'شەوی ئارام', bg: 'linear-gradient(180deg,#1a2220 0%,#121816 100%)', paper: '#24302c', text: '#e8f0eb' },
    { id: 'deep_blue', name: 'شینی قووڵ', bg: 'linear-gradient(180deg,#0f1c2e 0%,#0a1420 100%)', paper: '#162436', text: '#dce8f5' },
    { id: 'olive', name: 'زەیتوونی', bg: 'linear-gradient(180deg,#f2f4ec 0%,#e4e9d8 100%)', paper: '#fbfcf7', text: '#2a3220' },
    { id: 'rose', name: 'گوڵاوی سووک', bg: 'linear-gradient(180deg,#fdf6f6 0%,#f5e4e4 100%)', paper: '#fffafa', text: '#3a2424' },
    { id: 'mint', name: 'نەعنا', bg: 'linear-gradient(180deg,#f0faf7 0%,#d8f0e8 100%)', paper: '#ffffff', text: '#1a332c' },
    { id: 'cream', name: 'کرێمی', bg: 'linear-gradient(180deg,#fbf8f1 0%,#f2ebdd 100%)', paper: '#fffef9', text: '#2e2a22' }
  ];

  var KEY = 'ruqyah_v1';
  var settings = {
    reciterId: 'alafasy',
    sessionId: 'afasy',
    fontSize: 18,
    themeId: 'soft_green',
    lineHeight: 1.8,
    loop: true,
    settingsOpen: false
  };
  try {
    var st = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.keys(settings).forEach(function (k) {
      if (st[k] !== undefined) settings[k] = st[k];
    });
  } catch (e) {}

  function saveSettings() {
    try {
      var st = JSON.parse(localStorage.getItem(KEY) || '{}');
      Object.keys(settings).forEach(function (k) { st[k] = settings[k]; });
      localStorage.setItem(KEY, JSON.stringify(st));
    } catch (e) {}
  }

  var sessAudio = null;
  var sessPlaying = false;

  function folderOf() {
    var r = RECITERS.find(function (x) { return x.id === settings.reciterId; }) || RECITERS[0];
    return r.folder;
  }

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
    st.textContent = [
      '#rqContPanel{background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;border-radius:16px;padding:14px;margin:0 0 12px;box-shadow:0 4px 16px rgba(0,0,0,.12)}',
      '#rqContPanel h3{margin:0 0 6px;font-size:16px}',
      '#rqContPanel .rq-cont-note{font-size:12px;opacity:.9;margin:0 0 10px;line-height:1.5}',
      '#rqContPanel select{width:100%;border:0;border-radius:10px;padding:10px;font-size:14px;margin:0 0 10px}',
      '#rqContPlay{width:100%;background:#fff;color:#1a3d2e;border:0;border-radius:12px;padding:12px 14px;font-weight:800;font-size:15px;cursor:pointer}',
      '#rqContPlay.on{background:#c0392b;color:#fff}',
      '#rqContProg{font-size:12px;opacity:.95;margin-top:8px;min-height:16px}',
      '#rqSettingsBtn{border:1px solid #c5d5cc;background:#fff;border-radius:10px;padding:8px 12px;font-size:13px;font-weight:700;cursor:pointer;margin:0 0 10px}',
      '#rqSettingsPanel{display:none;background:rgba(255,255,255,.92);border:1px solid #c5d5cc;border-radius:14px;padding:12px;margin:0 0 12px}',
      '#rqSettingsPanel.open{display:block}',
      '#rqSettingsPanel label{display:block;font-size:13px;font-weight:600;margin:8px 0 4px;color:#1a3d2e}',
      '#rqSettingsPanel select,#rqSettingsPanel input[type=range]{width:100%;margin-bottom:6px}',
      '#rqSettingsPanel .rq-theme-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}',
      '#rqSettingsPanel .rq-theme-btn{border:2px solid transparent;border-radius:10px;padding:10px 8px;font-size:12px;cursor:pointer;text-align:center}',
      '#rqSettingsPanel .rq-theme-btn.on{border-color:#176b4b;font-weight:700}',
      '#rqReciterBar{display:flex;align-items:center;gap:8px;margin:0 0 10px;flex-wrap:wrap;background:rgba(232,240,235,.9);padding:10px 12px;border-radius:12px;border:1px solid #c5d5cc}',
      '#rqReciterBar label{font-size:13px;font-weight:700}',
      '#rqReciterBar select{flex:1;min-width:140px;border:1px solid #c5d5cc;border-radius:10px;padding:8px;font-size:14px}',
      '#ruqyah .rq-btn[data-act="play"]{background:#176b4b!important;color:#fff!important;border:0!important;padding:10px 14px!important;border-radius:10px!important;font-weight:700!important}',
      '#ruqyah .rq-btn[data-act="play"].on{background:#c0392b!important}',
      '#ruqyah.rq-themed .rq-item,#ruqyah.rq-themed .rq-g{border-radius:12px;padding:12px;margin-bottom:10px}',
      '#ruqyah.rq-themed{transition:background .3s}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function applyTheme() {
    var view = document.getElementById('ruqyah');
    if (!view) return;
    var th = THEMES.find(function (t) { return t.id === settings.themeId; }) || THEMES[0];
    view.classList.add('rq-themed');
    view.style.background = th.bg;
    view.style.color = th.text;
    view.style.setProperty('--rq-paper', th.paper);
    view.style.setProperty('--rq-text', th.text);
    view.querySelectorAll('.rq-item, .rq-g, .rq-note').forEach(function (el) {
      el.style.background = th.paper;
      el.style.color = th.text;
      el.style.fontSize = settings.fontSize + 'px';
      el.style.lineHeight = String(settings.lineHeight);
    });
    var main = view.closest('.main');
    if (main) {
      main.style.background = th.bg;
    }
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) return '٠:٠٠';
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function stopSession() {
    if (sessAudio) {
      try { sessAudio.pause(); } catch (e) {}
      sessAudio = null;
    }
    sessPlaying = false;
    var btn = document.getElementById('rqContPlay');
    if (btn) {
      btn.classList.remove('on');
      btn.textContent = '▶ دەستپێکردن · گۆێگرتنی بەردەوام';
    }
  }

  function playSession() {
    var sess = SESSIONS.find(function (x) { return x.id === settings.sessionId; }) || SESSIONS[0];
    var btn = document.getElementById('rqContPlay');
    if (sessPlaying && sessAudio) {
      stopSession();
      return;
    }
    stopSession();
    sessAudio = new OrigAudio(sess.file);
    sessAudio.preload = 'metadata';
    sessPlaying = true;
    if (btn) {
      btn.classList.add('on');
      btn.textContent = '■ ڕاگرتن';
    }
    sessAudio.ontimeupdate = function () {
      var p = document.getElementById('rqContProg');
      if (!p || !sessAudio) return;
      p.textContent = fmtTime(sessAudio.currentTime) + ' / ' + fmtTime(sessAudio.duration) + ' — ' + sess.name;
    };
    sessAudio.onended = function () {
      if (settings.loop) {
        sessAudio.currentTime = 0;
        sessAudio.play().catch(function () { stopSession(); });
      } else stopSession();
    };
    sessAudio.onerror = function () {
      stopSession();
      var p = document.getElementById('rqContProg');
      if (p) p.textContent = 'نەتوانرا دەنگەکە باربکرێت — ئینتەرنێت بپشکنە';
    };
    var pr = sessAudio.play();
    if (pr && pr.catch) pr.catch(function () { stopSession(); });
  }

  function makeSettingsPanel() {
    var wrap = document.createElement('div');
    wrap.id = 'rqSettingsWrap';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'rqSettingsBtn';
    btn.textContent = '⚙ ڕێکخستنی ڕوقیە';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      settings.settingsOpen = !settings.settingsOpen;
      var p = document.getElementById('rqSettingsPanel');
      if (p) p.classList.toggle('open', settings.settingsOpen);
      saveSettings();
    };

    var panel = document.createElement('div');
    panel.id = 'rqSettingsPanel';
    if (settings.settingsOpen) panel.classList.add('open');

    panel.innerHTML =
      '<label>قەبارەی نووسین: <span id="rqFontVal">' + settings.fontSize + '</span>px</label>' +
      '<input type="range" id="rqFontRange" min="14" max="28" step="1" value="' + settings.fontSize + '">' +
      '<label>بۆشایی هێڵ: <span id="rqLhVal">' + settings.lineHeight + '</span></label>' +
      '<input type="range" id="rqLhRange" min="1.4" max="2.4" step="0.1" value="' + settings.lineHeight + '">' +
      '<label><input type="checkbox" id="rqLoopChk"' + (settings.loop ? ' checked' : '') + '> دووبارەکردنەوەی سەوتی تەواو (loop)</label>' +
      '<label>باکگراوندی ئارام</label>' +
      '<div class="rq-theme-grid" id="rqThemeGrid"></div>' +
      '<p style="font-size:12px;margin:10px 0 0;opacity:.8;line-height:1.5">تێبینی: دەقە کورتەکان (ئایەت/حەدیس) بۆ خوێندن و ژماردنن. بۆ گوێگرتنی درێژ وەک یوتیوب → «گۆێگرتنی بەردەوام» بەکاربهێنە.</p>';

    wrap.appendChild(btn);
    wrap.appendChild(panel);

    setTimeout(function () {
      var grid = document.getElementById('rqThemeGrid');
      if (grid && !grid.children.length) {
        THEMES.forEach(function (th) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'rq-theme-btn' + (th.id === settings.themeId ? ' on' : '');
          b.textContent = th.name;
          b.style.background = th.bg;
          b.style.color = th.text;
          b.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            settings.themeId = th.id;
            saveSettings();
            grid.querySelectorAll('.rq-theme-btn').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            applyTheme();
          };
          grid.appendChild(b);
        });
      }
      var fr = document.getElementById('rqFontRange');
      if (fr && !fr.__bound) {
        fr.__bound = true;
        fr.oninput = function () {
          settings.fontSize = +fr.value;
          var v = document.getElementById('rqFontVal');
          if (v) v.textContent = settings.fontSize;
          saveSettings();
          applyTheme();
        };
      }
      var lh = document.getElementById('rqLhRange');
      if (lh && !lh.__bound) {
        lh.__bound = true;
        lh.oninput = function () {
          settings.lineHeight = Math.round(+lh.value * 10) / 10;
          var v = document.getElementById('rqLhVal');
          if (v) v.textContent = settings.lineHeight;
          saveSettings();
          applyTheme();
        };
      }
      var lp = document.getElementById('rqLoopChk');
      if (lp && !lp.__bound) {
        lp.__bound = true;
        lp.onchange = function () {
          settings.loop = !!lp.checked;
          saveSettings();
        };
      }
    }, 0);

    return wrap;
  }

  function makeContPanel() {
    var panel = document.createElement('div');
    panel.id = 'rqContPanel';
    panel.innerHTML =
      '<h3>🎧 گۆێگرتنی بەردەوام (وەک یوتیوب)</h3>' +
      '<p class="rq-cont-note">سەوتی تەواوی ڕوقیە — دەستپێبکە و لێیگەڕێ. چەندین قارئ.</p>';
    var sel = document.createElement('select');
    sel.id = 'rqSessionSel';
    SESSIONS.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name + (s.note ? ' · ' + s.note : '');
      if (s.id === settings.sessionId) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = function () {
      settings.sessionId = sel.value;
      saveSettings();
      if (sessPlaying) playSession();
    };
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'rqContPlay';
    btn.textContent = '▶ دەستپێکردن · گۆێگرتنی بەردەوام';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      playSession();
    };
    var prog = document.createElement('div');
    prog.id = 'rqContProg';
    panel.appendChild(sel);
    panel.appendChild(btn);
    panel.appendChild(prog);
    return panel;
  }

  function injectUI() {
    injectCss();
    var view = document.getElementById('ruqyah');
    if (!view) return;

    if (!document.getElementById('rqContPanel')) {
      var note = view.querySelector('.rq-note');
      var panel = makeContPanel();
      if (note && note.parentNode) note.parentNode.insertBefore(panel, note.nextSibling);
      else view.insertBefore(panel, view.firstChild);
    }

    if (!document.getElementById('rqSettingsWrap')) {
      var cont = document.getElementById('rqContPanel');
      var sw = makeSettingsPanel();
      if (cont && cont.parentNode) cont.parentNode.insertBefore(sw, cont.nextSibling);
      else view.insertBefore(sw, view.firstChild);
    }

    if (!document.getElementById('rqReciterBar')) {
      var bar = document.createElement('div');
      bar.id = 'rqReciterBar';
      var lab = document.createElement('label');
      lab.textContent = 'قارئ بۆ ئایەتە کورتەکان:';
      var sel = document.createElement('select');
      sel.id = 'rqReciter';
      RECITERS.forEach(function (r) {
        var o = document.createElement('option');
        o.value = r.id;
        o.textContent = r.name;
        if (r.id === settings.reciterId) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = function () {
        settings.reciterId = sel.value;
        saveSettings();
      };
      bar.appendChild(lab);
      bar.appendChild(sel);
      var sw2 = document.getElementById('rqSettingsWrap');
      if (sw2 && sw2.parentNode) sw2.parentNode.insertBefore(bar, sw2.nextSibling);
      else view.appendChild(bar);
    }

    applyTheme();
  }

  function fixPlayLabels() {
    var view = document.getElementById('ruqyah');
    if (!view) return;
    view.querySelectorAll('button[data-act="play"]').forEach(function (b) {
      var t = b.textContent || '';
      if (t.indexOf('گوێگرتن') >= 0) b.textContent = t.replace(/گوێگرتن/g, 'گۆێگرتن');
    });
  }

  function enhanceOnce() {
    try {
      injectUI();
      fixPlayLabels();
      applyTheme();
    } catch (e) {
      console.warn('ruqyah enhance', e);
    }
  }

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

  document.addEventListener('click', function (e) {
    var view = document.getElementById('ruqyah');
    if (!view || !view.classList.contains('active')) return;
    if (!view.contains(e.target)) return;
    setTimeout(enhanceOnce, 50);
  }, true);

  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (hookEnter() || tries > 40) clearInterval(iv);
  }, 500);
})();
