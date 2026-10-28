/* ruqyah-reciters.js v6 — multi voice + continuous full ruqyah sessions */
(function () {
  if (window.__ruqyahRecitersV6) return;
  window.__ruqyahRecitersV6 = true;

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

  /* Full-length ruqyah sessions (Internet Archive — free, ~1 hour) */
  var BASE = 'https://archive.org/download/al-ruqyah/';
  var SESSIONS = [
    { id: 'afasy', name: 'میشاری ڕاشید عەفاسی', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Mishary%20Rashid%20Al%20Fasy.mp3', note: 'ڕوقیەی تەواو · نزیکەی سەعاتێک' },
    { id: 'maher', name: 'ماهر موئەیقلی', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Maher%20Al%20Muaiqly.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'ghamdi', name: 'سەعد غامدی', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saad%20Al%20Ghamdi.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'sudais', name: 'عەبدولڕەحمان سوودەیس', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Abdel%20Rahman%20Al-Sudais.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'shuraim', name: 'سەعوود شڕەیم', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saood%20As%20Shuraim.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'idrees', name: 'ئیدریس ئەبکەر', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Idrees%20Abkar.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'ajamy', name: 'ئەحمەد عەجمی', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Ahmed%20Bin%20Ali%20Al-Ajamy.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'basit', name: 'عەبدولباسیت عەبدولسەمەد', file: 'Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Abdel%20Baset%20Abdel%20Samad.mp3', note: 'ڕوقیەی تەواو' },
    { id: 'manzil', name: 'مەنزیل — میشاری عەفاسی', file: 'Manzil%20By%20Mishaari%20Rasheed%20AlFasy.mp3', note: 'مەنزیل (ئایەتە گرنگەکان)' }
  ];

  var KEY = 'ruqyah_v1';
  var reciterId = 'alafasy';
  var sessionId = 'afasy';
  try {
    var st = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (st.reciterId) reciterId = st.reciterId;
    if (st.sessionId) sessionId = st.sessionId;
  } catch (e) {}

  var sessAudio = null;
  var sessPlaying = false;

  function folderOf() {
    var r = RECITERS.find(function (x) { return x.id === reciterId; }) || RECITERS[0];
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
    st.textContent =
      '#rqReciterBar{display:flex;align-items:center;gap:8px;margin:8px 0 10px;flex-wrap:wrap;background:#e8f0eb;padding:12px;border-radius:12px;border:1px solid #c5d5cc}' +
      '#rqReciterBar label{font-size:13px;font-weight:700;color:#1a3d2e}' +
      '#rqReciterBar select{flex:1;min-width:140px;border:1px solid #c5d5cc;border-radius:10px;padding:10px;background:#fff;font-size:14px}' +
      '#rqContPanel{background:linear-gradient(145deg,#1a3d2e,#176b4b);color:#fff;border-radius:16px;padding:14px;margin:0 0 14px;box-shadow:0 4px 16px rgba(0,0,0,.12)}' +
      '#rqContPanel h3{margin:0 0 6px;font-size:16px}' +
      '#rqContPanel .rq-cont-note{font-size:12px;opacity:.9;margin:0 0 10px;line-height:1.5}' +
      '#rqContPanel select{width:100%;border:0;border-radius:10px;padding:10px;font-size:14px;margin:0 0 10px}' +
      '#rqContPanel .rq-cont-row{display:flex;gap:8px;align-items:center}' +
      '#rqContPlay{flex:1;background:#fff;color:#1a3d2e;border:0;border-radius:12px;padding:12px 14px;font-weight:800;font-size:15px;cursor:pointer}' +
      '#rqContPlay.on{background:#c0392b;color:#fff}' +
      '#rqContProg{font-size:12px;opacity:.95;margin-top:8px;min-height:16px}' +
      '#ruqyah .rq-btn[data-act="play"]{background:#176b4b!important;color:#fff!important;border:0!important;padding:10px 14px!important;border-radius:10px!important;font-weight:700!important}' +
      '#ruqyah .rq-btn[data-act="play"].on{background:#c0392b!important}';
    document.head.appendChild(st);
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
    var p = document.getElementById('rqContProg');
    if (p) p.textContent = '';
  }

  function playSession() {
    var sess = SESSIONS.find(function (x) { return x.id === sessionId; }) || SESSIONS[0];
    var btn = document.getElementById('rqContPlay');
    if (sessPlaying && sessAudio) {
      stopSession();
      return;
    }
    stopSession();
    sessAudio = new OrigAudio(BASE + sess.file);
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
    sessAudio.onended = function () { stopSession(); };
    sessAudio.onerror = function () {
      stopSession();
      var p = document.getElementById('rqContProg');
      if (p) p.textContent = 'نەتوانرا دەنگەکە باربکرێت — ئینتەرنێت بپشکنە';
    };
    var pr = sessAudio.play();
    if (pr && pr.catch) pr.catch(function () { stopSession(); });
  }

  function makeContPanel() {
    var panel = document.createElement('div');
    panel.id = 'rqContPanel';
    panel.innerHTML =
      '<h3>🎧 گۆێگرتنی بەردەوام</h3>' +
      '<p class="rq-cont-note">ڕوقیەی تەواو (نزیکەی سەعاتێک). قارئ هەڵبژێرە، دەستپێبکە و لێیگەڕێ.</p>';
    var sel = document.createElement('select');
    sel.id = 'rqSessionSel';
    SESSIONS.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name + (s.note ? ' — ' + s.note : '');
      if (s.id === sessionId) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = function () {
      sessionId = sel.value;
      try {
        var st = JSON.parse(localStorage.getItem(KEY) || '{}');
        st.sessionId = sessionId;
        localStorage.setItem(KEY, JSON.stringify(st));
      } catch (e) {}
      if (sessPlaying) playSession();
    };
    var row = document.createElement('div');
    row.className = 'rq-cont-row';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'rqContPlay';
    btn.textContent = '▶ دەستپێکردن · گۆێگرتنی بەردەوام';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      playSession();
    };
    row.appendChild(btn);
    var prog = document.createElement('div');
    prog.id = 'rqContProg';
    panel.appendChild(sel);
    panel.appendChild(row);
    panel.appendChild(prog);
    return panel;
  }

  function injectBar() {
    injectCss();
    var view = document.getElementById('ruqyah');
    if (!view) return;

    if (!document.getElementById('rqContPanel')) {
      var panel = makeContPanel();
      var note = view.querySelector('.rq-note');
      if (note && note.parentNode) note.parentNode.insertBefore(panel, note.nextSibling);
      else view.insertBefore(panel, view.firstChild);
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
      var cont = document.getElementById('rqContPanel');
      if (cont && cont.parentNode) cont.parentNode.insertBefore(bar, cont.nextSibling);
      else {
        var tabs = view.querySelector('.rq-tabs');
        if (tabs && tabs.parentNode) tabs.parentNode.insertBefore(bar, tabs);
        else view.appendChild(bar);
      }
    }
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
      injectBar();
      fixPlayLabels();
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
