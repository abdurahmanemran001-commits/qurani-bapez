/* ruqyah-reciters.js v3 — visible multi-reciter bar + audio rewrite */
(function () {
  if (window.__ruqyahRecitersV3) return;
  window.__ruqyahRecitersV3 = true;

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

  function makeBar() {
    var bar = document.createElement('div');
    bar.id = 'rqReciterBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0 12px;flex-wrap:wrap;background:#e8f0eb;padding:12px;border-radius:12px;border:1px solid #c5d5cc';
    var lab = document.createElement('label');
    lab.style.cssText = 'font-size:13px;font-weight:700;color:#1a3d2e';
    lab.textContent = 'قارئ / سەوت بۆ گۆێگرتن:';
    var sel = document.createElement('select');
    sel.id = 'rqReciter';
    sel.style.cssText = 'flex:1;min-width:160px;border:1px solid #c5d5cc;border-radius:10px;padding:10px;background:#fff;font-size:14px';
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
      var name = (RECITERS.find(function (x) { return x.id === reciterId; }) || {}).name || '';
      toast('سەوت: ' + name);
    };
    bar.appendChild(lab);
    bar.appendChild(sel);
    return bar;
  }

  function injectBar() {
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

  function fixLabels() {
    document.querySelectorAll('#ruqyah button, #ruqyah .rq-btn').forEach(function (b) {
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
      setTimeout(injectBar, 50);
      setTimeout(injectBar, 200);
      setTimeout(injectBar, 600);
      setTimeout(fixLabels, 100);
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
      fixLabels();
    }).observe(view, { childList: true, subtree: true });
  }

  setInterval(function () {
    hookEnter();
    observe();
    injectBar();
    fixLabels();
  }, 500);
})();
