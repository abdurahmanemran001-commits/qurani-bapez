/* ruqyah-youtube.js — special long sessions (YouTube embeds) */
(function () {
  if (window.__ruqyahYT) return;
  window.__ruqyahYT = true;

  var VIDEOS = [
    {
      id: 'BbMepPgsPe8',
      title: 'ڕوقیەی تەواوی بەهێز — چارەسەری سیحر و مس و حەسەد و چاو',
      tag: 'عەرەبی · تەواو'
    },
    {
      id: 'VvJysFROyPE',
      title: 'ڕوقیەی شەرعی تەواو — پێشەوا کوردی',
      tag: 'کوردی · تەواو'
    },
    {
      id: 'tDnK9UzyRwo',
      title: 'ڕوقیەی شەرعی — د. محمد الجوراني (دەنگی ئارام)',
      tag: 'عەرەبی · ئارام'
    }
  ];

  function injectCss() {
    if (document.getElementById('rqYtCss')) return;
    var st = document.createElement('style');
    st.id = 'rqYtCss';
    st.textContent = [
      '#rqYtPanel{background:linear-gradient(145deg,#2c1810,#5c3317);color:#fff;border-radius:16px;padding:14px;margin:0 0 14px;box-shadow:0 4px 16px rgba(0,0,0,.15)}',
      '#rqYtPanel h3{margin:0 0 6px;font-size:16px}',
      '#rqYtPanel .rq-yt-note{font-size:12px;opacity:.9;margin:0 0 12px;line-height:1.5}',
      '#rqYtPanel .rq-yt-card{background:rgba(255,255,255,.1);border-radius:12px;padding:10px;margin-bottom:12px}',
      '#rqYtPanel .rq-yt-card:last-child{margin-bottom:0}',
      '#rqYtPanel .rq-yt-title{font-size:13px;font-weight:700;margin:0 0 4px;line-height:1.4}',
      '#rqYtPanel .rq-yt-tag{display:inline-block;font-size:11px;background:rgba(255,255,255,.2);padding:2px 8px;border-radius:8px;margin-bottom:8px}',
      '#rqYtPanel .rq-yt-frame{position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;background:#000}',
      '#rqYtPanel .rq-yt-frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}',
      '#rqYtPanel .rq-yt-open{display:inline-block;margin-top:8px;font-size:12px;color:#ffd7a8;text-decoration:underline}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function makePanel() {
    var panel = document.createElement('div');
    panel.id = 'rqYtPanel';
    var html = '<h3>📺 ڕوقیەی تایبەت (یوتیوب)</h3>' +
      '<p class="rq-yt-note">سەوتی درێژ وەک ئەوەی لە یوتیوب گوێت لێ دەبێت — لەناو ئەپەکەدا لێیبدە. یەکێکیان کوردییە.</p>';
    VIDEOS.forEach(function (v) {
      html += '<div class="rq-yt-card">' +
        '<div class="rq-yt-title">' + v.title + '</div>' +
        '<span class="rq-yt-tag">' + v.tag + '</span>' +
        '<div class="rq-yt-frame">' +
        '<iframe src="https://www.youtube-nocookie.com/embed/' + v.id + '?rel=0&playsinline=1" ' +
        'title="' + v.title.replace(/"/g, '') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen loading="lazy"></iframe></div>' +
        '<a class="rq-yt-open" href="https://youtu.be/' + v.id + '" target="_blank" rel="noopener">کردنەوە لە یوتیوب ↗</a>' +
        '</div>';
    });
    panel.innerHTML = html;
    return panel;
  }

  function inject() {
    injectCss();
    var view = document.getElementById('ruqyah');
    if (!view) return;
    if (document.getElementById('rqYtPanel')) return;
    var panel = makePanel();
    var cont = document.getElementById('rqContPanel');
    if (cont && cont.parentNode) cont.parentNode.insertBefore(panel, cont.nextSibling);
    else {
      var note = view.querySelector('.rq-note');
      if (note && note.parentNode) note.parentNode.insertBefore(panel, note.nextSibling);
      else view.insertBefore(panel, view.firstChild);
    }
  }

  function hook() {
    if (typeof window.enterRuqyah !== 'function') return false;
    if (window.enterRuqyah.__ytHooked) return true;
    var orig = window.enterRuqyah;
    window.enterRuqyah = function () {
      var ret = orig.apply(this, arguments);
      setTimeout(inject, 150);
      setTimeout(inject, 500);
      return ret;
    };
    window.enterRuqyah.__ytHooked = true;
    return true;
  }

  document.addEventListener('click', function (e) {
    var view = document.getElementById('ruqyah');
    if (!view || !view.classList.contains('active')) return;
    if (!view.contains(e.target)) return;
    setTimeout(inject, 60);
  }, true);

  var n = 0;
  var iv = setInterval(function () {
    n++;
    if (hook() || n > 40) clearInterval(iv);
  }, 500);
})();
