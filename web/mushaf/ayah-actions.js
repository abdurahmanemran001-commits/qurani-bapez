/* Ayah menu for the reader. Loaded from language-ui.js (served as mushaf/ayah-actions.js).
   Tap an ayah  -> menu for that ayah (play & continue ... more actions are added part by part).
   Tap elsewhere -> show / hide the reciter player; if the menu is open it just closes the menu. */
(function () {
  if (window.__ayahActionsInstalled) return;
  window.__ayahActionsInstalled = true;

  var T = {
    ckb: { play: 'خوێندنەوە و بەردەوامبوون', close: 'داخستن' },
    bad: { play: 'خواندن و بەردەوامبوون', close: 'داخستن' },
    ar: { play: 'قراءة ومتابعة', close: 'إغلاق' },
    en: { play: 'Play & continue', close: 'Close' },
    tr: { play: 'Oku ve devam et', close: 'Kapat' },
    fa: { play: 'خواندن و ادامه', close: 'بستن' },
    ur: { play: 'پڑھیں اور جاری رکھیں', close: 'بند کریں' },
    fr: { play: 'Lire et continuer', close: 'Fermer' },
    ru: { play: 'Читать и продолжить', close: 'Закрыть' },
    id: { play: 'Baca & lanjutkan', close: 'Tutup' }
  };

  function lang() {
    var l = window.appLang;
    if (!l) { try { l = localStorage.getItem('app_language'); } catch (e) {} }
    return T[l] ? l : 'ckb';
  }
  function tr(k) { return T[lang()][k]; }

  var st = document.createElement('style');
  st.textContent = [
    '#madaniPlayer{position:fixed!important;top:calc(8px + env(safe-area-inset-top));left:8px;right:8px;z-index:35;margin:0!important;box-shadow:0 8px 24px #0005}',
    '#ayahSheet{position:fixed;left:8px;right:8px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:40;background:#fff;border:1px solid #dce5e1;border-radius:18px;box-shadow:0 10px 30px #0004;padding:12px;display:none;max-width:520px;margin:0 auto}',
    '#ayahSheet.on{display:block}',
    '#ayahSheet .as-title{font-weight:bold;color:#174f3b;text-align:center;margin-bottom:10px;font-size:16px}',
    '#ayahSheet .as-btns{display:grid;gap:8px}',
    '#ayahSheet .as-btns button{border:0;border-radius:12px;padding:13px;font:inherit;font-size:16px;background:#e8f3ee;color:#173f35;cursor:pointer}',
    '#ayahSheet .as-btns button.pri{background:#176b4b;color:#fff}'
  ].join('\n');
  document.head.appendChild(st);

  var sheet = null, sel = null;

  function surahName(s) {
    try { if (typeof surahs !== 'undefined' && surahs[s - 1]) return surahs[s - 1][0]; } catch (e) {}
    return String(s);
  }

  function buildSheet() {
    if (sheet) return sheet;
    sheet = document.createElement('div');
    sheet.id = 'ayahSheet';
    sheet.innerHTML = '<div class="as-title" id="asTitle"></div><div class="as-btns" id="asBtns"></div>';
    document.body.appendChild(sheet);
    return sheet;
  }

  function addBtn(box, label, cls, fn) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (cls) b.className = cls;
    b.onclick = fn;
    box.appendChild(b);
  }

  function closeSheet() {
    if (sheet) sheet.classList.remove('on');
    sel = null;
    try { window.__madani.clearMark(); } catch (e) {}
  }

  function openFor(s, a) {
    buildSheet();
    sel = { sura: s, ayah: a };
    try { window.__madani.mark(s, a); } catch (e) {}
    document.getElementById('asTitle').textContent = surahName(s) + ' : ' + a;
    var box = document.getElementById('asBtns');
    box.innerHTML = '';
    addBtn(box, '▶ ' + tr('play'), 'pri', function () {
      var x = sel;
      if (!x) return;
      window.__madaniContinue = true;
      sheet.classList.remove('on');
      sel = null;
      window.__madani.play(x.sura, x.ayah);
      window.__madani.togglePlayer(true);
    });
    addBtn(box, tr('close'), '', closeSheet);
    sheet.classList.add('on');
  }

  window.__onAyahTap = function (s, a) { openFor(s, a); };

  function blankTap() {
    if (sheet && sheet.classList.contains('on')) { closeSheet(); return; }
    try { window.__madani.togglePlayer(); } catch (e) {}
  }
  window.__onBlankTap = blankTap;

  /* taps on the page area outside the ayah overlay (margins) behave like a blank tap */
  var m = document.getElementById('mushaf');
  if (m) {
    m.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('#madaniOverlay')) return;
      blankTap();
    });
  }
})();
