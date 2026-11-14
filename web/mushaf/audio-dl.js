/* Offline recitations: download / delete per reciter+surah. Online => streaming (sw.js only serves the saved copy when offline). */
(function () {
  if (window.__audioDl) return;
  var AC = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
  var CN = 'audio-dl', LS = 'audio_dl_idx', recs = null, busy = false;
  function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }
  function idx() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function saveIdx(x) { try { localStorage.setItem(LS, JSON.stringify(x)); } catch (e) {} }
  function loadRecs(cb) {
    if (recs) return cb();
    function t(u, f) { fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { recs = d; cb(); }).catch(f); }
    t('mushaf/reciters.json', function () { t('reciters.json', function () { recs = []; cb(); }); });
  }
  function meta(id) { for (var i = 0; i < recs.length; i++) if (recs[i].id === id) return recs[i]; return null; }
  function urls(id, s) {
    var m = meta(id), out = [], i;
    if (m && m.t === 'g') return [m.u.replace(/\/?$/, '/') + pad(s, 3) + '.mp3'];
    var base = m && m.u ? m.u.replace(/\/?$/, '/') : 'https://everyayah.com/data/' + id + '/';
    for (i = 1; i <= AC[s - 1]; i++) out.push(base + pad(s, 3) + pad(i, 3) + '.mp3');
    return out;
  }
  /* GitHub release assets (the Kurdish reciters) send no CORS headers: go through the Worker's /audio proxy */
  function viaProxy(u) {
    if (u.indexOf('https://github.com/Hiwaselah/') !== 0) return u;
    var ep = ''; try { ep = String(window.AI_SHARI_ENDPOINT || localStorage.getItem('ai_endpoint') || '').replace(/\/+$/, ''); } catch (e) {}
    ep = ep || 'https://qurani-ai-shari.abdurahmanemran03.workers.dev';
    return ep + '/audio?u=' + encodeURIComponent(u);
  }
  function curRec() { var e = document.getElementById('madaniReciter') || document.getElementById('rc'); return e ? e.value : ''; }
  function fmt(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'; }

  function open() {
    loadRecs(function () {
      var id = curRec(), m = meta(id);
      if (!m && !id) return;
      var old = document.getElementById('adlSheet'); if (old) old.remove();
      var d = document.createElement('div'); d.id = 'adlSheet';
      d.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;direction:rtl;font-family:inherit';
      var opts = ''; for (var i = 1; i <= 114; i++) opts += '<option value="' + i + '">' + i + '</option>';
      var bs = 'padding:10px;border:0;border-radius:10px;font-weight:bold;cursor:pointer;flex:1;';
      d.innerHTML = '<div style="background:#173f35;color:#fff;width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:16px;max-height:85vh;overflow:auto">'
        + '<div style="font-weight:bold;font-size:17px;margin-bottom:4px">⬇ دابەزاندنی سەوت</div>'
        + '<div style="opacity:.85;margin-bottom:10px">' + (m ? m.n : id) + '</div>'
        + '<div style="font-size:13px;opacity:.8;margin-bottom:10px">کاتێک ئینتەرنێت هەبێت سەوتەکە خۆی لە ئینتەرنێتەوە دەخوێنرێتەوە و پێویست بە دابەزاندن ناکات؛ دابەزاندن تەنها بۆ کاتی بێ ئینتەرنێتە.</div>'
        + '<label>سووڕەت: <select id="adlS" style="padding:6px;border-radius:8px">' + opts + '</select></label>'
        + '<div id="adlSt" style="margin:10px 0;font-size:14px"></div>'
        + '<div style="height:8px;background:#2a5a4d;border-radius:4px;overflow:hidden;margin-bottom:10px"><div id="adlBar" style="height:100%;width:0;background:#ffd54f"></div></div>'
        + '<div style="display:flex;gap:8px;margin-bottom:8px"><button id="adlGo" style="' + bs + 'background:#ffd54f;color:#173f35">⬇ دابەزاندن</button><button id="adlDel" style="' + bs + 'background:#a33;color:#fff">🗑 ڕەشکردنەوە</button></div>'
        + '<div style="display:flex;gap:8px"><button id="adlAll" style="' + bs + 'background:#2a5a4d;color:#fff">ڕەشکردنەوەی هەموو ئەم قاریە</button><button id="adlX" style="' + bs + 'background:#2a5a4d;color:#fff">داخستن</button></div>'
        + '<div id="adlTot" style="margin-top:10px;font-size:13px;opacity:.8"></div></div>';
      document.body.appendChild(d);
      var S = d.querySelector('#adlS'), st = d.querySelector('#adlSt'), bar = d.querySelector('#adlBar');
      try { var c = window.cur && window.cur[0]; if (c) S.value = c; } catch (e) {}
      function key(s) { return id + '|' + s; }
      function refresh() {
        var x = idx(), s = +S.value, e = x[key(s)];
        st.textContent = e ? '✅ دابەزێنراوە (' + fmt(e) + ')' : 'دانەبەزێنراوە';
        d.querySelector('#adlDel').style.opacity = e ? 1 : .4;
        var tot = 0, k; for (k in x) tot += x[k];
        var t = 'کۆی دابەزێنراو: ' + fmt(tot);
        d.querySelector('#adlTot').textContent = t;
        if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (q) { d.querySelector('#adlTot').textContent = t + ' • بەکارهاتوو ' + fmt(q.usage) + ' لە ' + fmt(q.quota); });
      }
      S.onchange = function () { bar.style.width = 0; refresh(); };
      d.querySelector('#adlX').onclick = function () { d.remove(); };
      d.onclick = function (e) { if (e.target === d) d.remove(); };
      d.querySelector('#adlDel').onclick = async function () {
        var s = +S.value, c = await caches.open(CN), x = idx(), l = urls(id, s);
        for (var i = 0; i < l.length; i++) await c.delete(l[i]);
        delete x[key(s)]; saveIdx(x); bar.style.width = 0; refresh();
      };
      d.querySelector('#adlAll').onclick = async function () {
        if (!confirm('هەموو سەوتە دابەزێنراوەکانی ئەم قاریە ڕەش بکرێتەوە؟')) return;
        var c = await caches.open(CN), x = idx();
        for (var k in x) if (k.indexOf(id + '|') === 0) { var l = urls(id, +k.split('|')[1]); for (var i = 0; i < l.length; i++) await c.delete(l[i]); delete x[k]; }
        saveIdx(x); refresh();
      };
      d.querySelector('#adlGo').onclick = async function () {
        if (busy) return;
        if (!navigator.onLine) { st.textContent = 'ئینتەرنێت نییە'; return; }
        var s = +S.value, l = urls(id, s), c = await caches.open(CN), tot = 0, i;
        busy = true; this.disabled = true;
        try {
          for (i = 0; i < l.length; i++) {
            st.textContent = 'دابەزاندن… ' + (i + 1) + '/' + l.length;
            var r = await fetch(viaProxy(l[i]), { mode: 'cors' });
            if (!r.ok) throw new Error('http ' + r.status);
            var b = await r.blob(); tot += b.size;
            await c.put(l[i], new Response(b, { headers: { 'Content-Type': 'audio/mpeg' } }));
            bar.style.width = ((i + 1) / l.length * 100) + '%';
          }
          var x = idx(); x[key(s)] = tot; saveIdx(x);
        } catch (e) {
          for (var j = 0; j < l.length; j++) await c.delete(l[j]);
          st.textContent = '❌ دابەزاندن سەرنەکەوت (ئەم سەرچاوەیە لە وێبسایت ڕێگە نادات)';
          busy = false; this.disabled = false; return;
        }
        busy = false; this.disabled = false; refresh();
      };
      refresh();
    });
  }
  window.__audioDl = { open: open };

  function addBtns() {
    var bars = [['madaniReciter', 'adlB1'], ['rc', 'adlB2']];
    bars.forEach(function (p) {
      var sel = document.getElementById(p[0]); if (!sel || document.getElementById(p[1])) return;
      var b = document.createElement('button'); b.id = p[1]; b.type = 'button'; b.textContent = '⬇';
      b.title = 'دابەزاندنی سەوت';
      b.style.cssText = 'padding:6px 10px;border:0;border-radius:8px;background:#2a5a4d;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px';
      b.onclick = open; sel.parentNode.insertBefore(b, sel.nextSibling);
    });
  }
  setInterval(addBtns, 1200); addBtns();
})();
