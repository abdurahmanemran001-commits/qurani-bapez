/* tafsir-dl.js v1 — download / delete tafsirs for offline use (IndexedDB). Shared by ayah-actions.js and shell-actions.js. */
(function () {
  if (window.__tafsirDL) return;
  var BASE = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/';
  var ROOT = location.pathname.replace(/\/mushaf\/.*$/, '/').replace(/[^\/]*$/, '');
  var LK = 'tafsir_dl_list', DB = 'qurani_tafsir', mem = {}, busy = {};
  var TX = {
    ckb: { dl: '⬇ دابەزاندن', del: '🗑 ڕەشکردنەوە', ing: 'دادەبەزێت', fail: 'دانەبەزی. ئینتەرنێت بپشکنە.', ask: 'ئەم تەفسیرە لەسەر مۆبایلەکەت دەسڕدرێتەوە؟', mb: 'م.ب' },
    en: { dl: '⬇ Download', del: '🗑 Remove', ing: 'Downloading', fail: 'Download failed. Check your internet.', ask: 'Remove this tafsir from your device?', mb: 'MB' },
    ar: { dl: '⬇ تحميل', del: '🗑 حذف', ing: 'جارٍ التحميل', fail: 'فشل التحميل. تحقق من الإنترنت.', ask: 'حذف هذا التفسير من جهازك؟', mb: 'م.ب' }
  };
  function t(k) { var l = window.appLang || 'ckb'; var d = TX[l] || (l === 'bad' ? TX.ckb : TX.en); return d[k]; }
  function list() { try { return JSON.parse(localStorage.getItem(LK) || '{}') || {}; } catch (e) { return {}; } }
  function setList(o) { try { localStorage.setItem(LK, JSON.stringify(o)); } catch (e) {} }
  function db() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('d'); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
  }
  function idb(mode, fn) {
    return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction('d', mode), st = tx.objectStore('d'), rq = fn(st); tx.oncomplete = function () { res(rq && rq.result); }; tx.onerror = function () { rej(tx.error); }; }); });
  }
  function has(slug) { return !!list()[slug]; }
  function get(slug) {
    if (mem[slug]) return Promise.resolve(mem[slug]);
    return idb('readonly', function (s) { return s.get(slug); }).then(function (v) { if (v) mem[slug] = v; return v || null; }).catch(function () { return null; });
  }
  function fetchJSON(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  async function build(slug, cb) {
    var map = {};
    if (slug.indexOf('hq-') === 0) {
      cb(0.1); map = await fetchJSON(ROOT + 'tafsir-ku/' + slug + '.json'); cb(1);
    } else {
      var done = 0, next = 1;
      async function w() {
        while (next <= 114) {
          var s = next++;
          var j = await fetchJSON(BASE + slug + '/' + s + '.json');
          (j.ayahs || []).forEach(function (x) { if (x && x.text) map[s + ':' + x.ayah] = x.text; });
          cb(++done / 114);
        }
      }
      await Promise.all([w(), w(), w(), w()]);
    }
    if (Object.keys(map).length < 100) throw new Error('empty');
    return map;
  }
  function download(slug, cb) {
    if (busy[slug]) return busy[slug];
    busy[slug] = build(slug, cb || function () {}).then(function (map) {
      return idb('readwrite', function (s) { return s.put(map, slug); }).then(function () {
        mem[slug] = map; var l = list(); l[slug] = Math.round(JSON.stringify(map).length / 1048576 * 10) / 10 || 0.1; setList(l); busy[slug] = null; return true;
      });
    }).catch(function (e) { busy[slug] = null; throw e; });
    return busy[slug];
  }
  function remove(slug) {
    return idb('readwrite', function (s) { return s.delete(slug); }).catch(function () {}).then(function () { delete mem[slug]; var l = list(); delete l[slug]; setList(l); });
  }
  /* button for one picker row (re-renders itself) */
  function button(slug) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tf-dl';
    b.style.cssText = 'margin-inline-start:auto;border:1px solid #cfe0d8;background:#f4faf7;color:#176b4b;border-radius:10px;padding:5px 10px;font-size:12px;white-space:nowrap';
    function paint() { var l = list()[slug]; b.disabled = false; b.style.background = l ? '#fff4f2' : '#f4faf7'; b.style.color = l ? '#b3261e' : '#176b4b'; b.style.borderColor = l ? '#f1c9c4' : '#cfe0d8'; b.textContent = l ? t('del') + ' · ' + l + ' ' + t('mb') : t('dl'); }
    b.onclick = function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      if (busy[slug]) return;
      if (has(slug)) { if (confirm(t('ask'))) remove(slug).then(paint); return; }
      b.disabled = true; b.textContent = t('ing') + ' 0%';
      download(slug, function (p) { b.textContent = t('ing') + ' ' + Math.round(p * 100) + '%'; }).then(paint).catch(function () { paint(); alert(t('fail')); });
    };
    paint(); return b;
  }
  window.__tafsirDL = { has: has, get: get, download: download, remove: remove, button: button };
})();
