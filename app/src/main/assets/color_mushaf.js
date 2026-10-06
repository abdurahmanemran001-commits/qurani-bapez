function (css) {
  var style = document.getElementById('quranColorStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'quranColorStyle';
    document.head.appendChild(style);
  }
  style.textContent = css;
  if (window._quranInstalled) {
    return;
  }
  window._quranInstalled = true;
  window.clearAudioHighlight = function () {
    document.querySelectorAll('.ayahPolygon.audioActive').forEach(function (e) {
      e.classList.remove('audioActive');
    });
  };
  window.highlightAyah = function (sura, ayah) {
    window.clearAudioHighlight();
    document.querySelectorAll('.ayahPolygon[surah="' + sura + '"][ayah="' + ayah + '"]')
        .forEach(function (e) {
          e.classList.add('audioActive');
        });
  };
  document.querySelectorAll('.ayahPolygon').forEach(function (el) {
    el.style.pointerEvents = 'auto';
    el.addEventListener('click', function () {
      QuranBridge.ayah(el.getAttribute('surah'), el.getAttribute('ayah'));
    });
  });
  if (window._quranActiveSura >= 0) {
    window.highlightAyah(window._quranActiveSura, window._quranActiveAyah);
  }
}
