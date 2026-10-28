/* ruqyah-reciters.js — multi voice for ruqyah listening */
(function () {
  if (window.__ruqyahReciters) return;
  window.__ruqyahReciters = true;

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

  function folder() {
    var r = RECITERS.find(function (x) { return x.id === reciterId; }) || RECITERS[0];
    return r.folder;
  }

  function mapUrl(u) {
    if (!u || typeof u !== 'string') return u;
    return u.replace(/https:\/\/everyayah\.com\/data\/[^/]+\//, 'https://everyayah.com/data/' + folder() + '/');
  }

  var OrigAudio = window.Audio;
  window.Audio = function (src) {
    if (typeof src === 'string' && src.indexOf('everyayah.com/data/') >= 0) {
      src = mapUrl(src);
    }
    return new OrigAudio(src);
  };
  window.Audio.prototype = OrigAudio.prototype;

  function injectBar() {
    var view = document.getElementById('ruqyah');
    if (!view || !view.classList.contains('active')) return;
    if (document.getElementById('rqReciterBar')) return;
    var note = view.querySelector('.rq-note');
    var bar = document.createElement('div');
    bar.id = 'rqReciterBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;margin:0 0 10px;flex-wrap:wrap';
    bar.innerHTML = '<label style="font-size:13px;font-weight:600;color:#3d5a4c">قارئ / سەوت:</label>';
    var sel = document.createElement('select');
    sel.id = 'rqReciter';
    sel.style.cssText = 'flex:1;min-width:160px;border:1px solid #c5d5cc;border-radius:10px;padding:8px 10px;background:#fff;font-size:13px';
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
      var name = (RECITERS.find(function (x) { return x.id === reciterId; }) || {}).name || '';
      var t = document.getElementById('rqToast');
      if (!t) { t = document.createElement('div'); t.id = 'rqToast'; document.body.appendChild(t); }
      t.textContent = 'سەوت: ' + name;
      t.style.display = 'block';
      setTimeout(function () { t.style.display = 'none'; }, 2000);
    };
    bar.appendChild(sel);
    if (note && note.parentNode) note.parentNode.insertBefore(bar, note.nextSibling);
    else view.insertBefore(bar, view.firstChild);
  }

  function fixLabels() {
    document.querySelectorAll('#ruqyah .rq-btn').forEach(function (b) {
      if ((b.textContent || '').indexOf('گوێگرتن') >= 0) {
        b.textContent = b.textContent.replace(/گوێگرتن/g, 'گۆێگرتن');
      }
    });
  }

  setInterval(function () {
    injectBar();
    fixLabels();
  }, 800);
})();
