/* Group Quran reciters: Kurds first, then Arabs, with an avatar */
(function () {
  if (window.__rcGroups) return;
  window.__rcGroups = true;
  var KURD = {
    g_ubeda_kurdi_mutasil: 1, g_sherzad: 1, g_shekh_reza: 1, g_rzgar_kurdi_mutasil: 1,
    g_Raad: 1, g_peshawa_kurdi_mutasil: 1, g_hamza: 1, g_ghamdi_handren_kurdi: 1,
    g_farman: 1, g_dlshad: 1, g_abdulhadi_kurdi_mutasil: 1, g_peshawa: 1, g_rzgar: 1,
    g_m_ramazan_shkur: 1, g_ra3d: 1
  };
  function isKurd(r) {
    if (!r) return false;
    if (KURD[r.id]) return true;
    return /کورد/.test(r.n || '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return '&#' + c.charCodeAt(0) + ';';
    });
  }
  function color(name) {
    var cols = ['#176b4b', '#0e4d3a', '#8a6232', '#1e4d78', '#6d3b45', '#3d5a3a'];
    var n = 0, s = name || '';
    for (var i = 0; i < s.length; i++) n = (n + s.charCodeAt(i)) % cols.length;
    return cols[n];
  }
  function initial(name) {
    var t = (name || '?').replace(/^\s+/, '');
    return t ? t.charAt(0) : '?';
  }
  var PERSONS = [
    [/alafasy|mishari/i, 'alafasy'], [/sudais/i, 'sudais'], [/shuraym|shuraim/i, 'shuraym'], [/ghamadi|ghamdi|غامدی/i, 'ghamdi'],
    [/husary/i, 'husary'], [/minshaw|menshaw/i, 'minshawi'], [/abdul.?bas[ie]t|abdulbaset/i, 'abdulbasit'], [/hudhaify/i, 'hudhaify'],
    [/hani.?rifai|hani_rifai/i, 'rifai'], [/muaiqly|maher/i, 'muaiqly'], [/qatami/i, 'qatami'], [/dussary|dosary/i, 'dussary'],
    [/basfar/i, 'basfar'], [/shaatree/i, 'shaatree'], [/ajamy/i, 'ajamy'], [/tablaway/i, 'tablaway'], [/ayyoub/i, 'ayyoub'],
    [/jibreel/i, 'jibreel'], [/mustafa_ismail/i, 'mustafa_ismail'], [/bandar/i, 'bandar_baleela'], [/yaser_salamah/i, 'yaser_salamah'],
    [/sahl_yassin/i, 'sahl_yassin'], [/bukhatir/i, 'bukhatir'], [/fares_abbad/i, 'fares_abbad'], [/mansoori/i, 'karim_mansoori'],
    [/matroud/i, 'abdullah_matroud'], [/ayman_sowaid/i, 'ayman_sowaid'], [/tunaiji/i, 'khalefa_tunaiji'], [/banna/i, 'mahmoud_banna'],
    [/alaqimy/i, 'akram_alaqimy'], [/suesy/i, 'ali_hajjaj'], [/neana/i, 'ahmed_neana'], [/aziz_alili/i, 'aziz_alili'], [/abdulkareem/i, 'muhammad_abdulkareem']
  ];
  function personKey(r) {
    var id = (r && r.id) || '';
    if (!isKurd(r)) for (var i = 0; i < PERSONS.length; i++) if (PERSONS[i][0].test(id) || PERSONS[i][0].test(r.e || '')) return PERSONS[i][1];
    return id.replace(/^g_/, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/_(\d+kbps|gapless|kurdi_mutasil)$/i, '').toLowerCase();
  }
  var PH = { ok: {}, bad: {} };   // remembered photo outcome per person key
  function avatar(r, size, cls) {
    var k = personKey(r), init = '<span class="rc-av ' + (cls || '') + '" style="background:' + color(r.n) + ';width:' + size + 'px;height:' + size + 'px;flex-basis:' + size + 'px;font-size:' + Math.round(size * .42) + 'px">' + esc(initial(r.n)) + '</span>';
    if (PH.bad[k]) return init;
    return '<span class="rc-ph" style="width:' + size + 'px;height:' + size + 'px;flex-basis:' + size + 'px"><img src="reciters/' + esc(k) + '.jpg" alt="" loading="lazy" onerror="window.__rcBad(this,\'' + esc(k) + '\')">' + init.replace('class="rc-av ', 'class="rc-av rc-fb ') + '</span>';
  }
  window.__rcBad = function (img, k) { PH.bad[k] = 1; if (img && img.parentNode) img.parentNode.removeChild(img); };
  function css() {
    if (document.getElementById('rcGroupCss')) return;
    var s = document.createElement('style');
    s.id = 'rcGroupCss';
    s.textContent = ''
      + '#rcBtn{max-width:46vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;padding:6px 8px;border:1px solid #b99a4b;border-radius:8px;background:#fff;color:#173f35}'
      + '#rcPanel{position:fixed;left:8px;right:8px;bottom:64px;max-height:62vh;overflow:auto;background:#fffdf8;border:1px solid #b99a4b;border-radius:12px;z-index:80;box-shadow:0 12px 40px #0004;padding:8px 8px 14px}'
      + '#rcPanel .rc-sec{font-weight:700;color:#176b4b;padding:10px 8px 4px;font-size:14px}'
      + '#rcPanel .rc-line{height:1px;background:#b99a4b;margin:0 8px 6px}'
      + '#rcPanel button.rc-item{display:flex;align-items:center;gap:10px;width:100%;text-align:right;border:0;background:transparent;padding:8px;border-radius:8px;font-size:15px;color:#173f35}'
      + '#rcPanel button.rc-item.on{background:#e7f3ec}'
      + '#rcPanel .rc-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex:0 0 36px;font-size:16px}'
      + '.rc-ph{position:relative;display:inline-flex;border-radius:50%;overflow:hidden;flex:0 0 auto;background:#e8e1cf}.rc-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2;border-radius:50%}.rc-ph .rc-fb{position:absolute;inset:0;width:100%!important;height:100%!important}'
      + '#rcPanel .rc-cur{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#176b4b,#0e4d3a);color:#fff;border-radius:12px;padding:10px 12px;margin-bottom:6px}#rcPanel .rc-cur b{display:block;font-size:16px}#rcPanel .rc-cur small{opacity:.85;font-size:12px}'
      + '#rcPanel .rc-sec{display:flex;align-items:center;justify-content:space-between;position:sticky;top:-8px;background:#fffdf8;z-index:3;margin-top:8px;padding:10px 10px 8px;font-size:15px;border-radius:8px}#rcPanel .rc-sec i{font-style:normal;font-weight:400;font-size:12px;background:#e7f3ec;color:#176b4b;border-radius:10px;padding:2px 9px}'
      + '#rcPanel .rc-sec.ar{color:#8a6232}#rcPanel .rc-sec.ar i{background:#f3ead6;color:#8a6232}'
      + '#rcPanel .rc-line{height:3px;border-radius:3px;background:#176b4b;margin:0 8px 8px}#rcPanel .rc-line.ar{background:#b99a4b}'
      + '#rcBtn{display:inline-flex;align-items:center;gap:6px}#rcBtn .rc-ph,#rcBtn .rc-av{width:24px!important;height:24px!important;flex-basis:24px!important}'
      + '#pl select#rc{display:none!important}';
    document.head.appendChild(s);
  }
  function list() {
    if (window.R && window.R.length) return window.R.slice();
    var rc = document.getElementById('rc');
    if (!rc) return [];
    return [].map.call(rc.options, function (o) { return { id: o.value, n: o.textContent }; });
  }
  function paint() {
    var rc = document.getElementById('rc');
    var panel = document.getElementById('rcPanel');
    var btn = document.getElementById('rcBtn');
    if (!rc || !panel || !btn) return;
    var all = list();
    if (!all.length) return;
    var kurd = all.filter(isKurd);
    var arab = all.filter(function (r) { return !isKurd(r); });
    var cur = rc.value;
    function block(title, arr, cls) {
      var html = '<div class="rc-sec ' + cls + '"><span>' + esc(title) + '</span><i>' + arr.length + ' قورئانخوێن</i></div><div class="rc-line ' + cls + '"></div>';
      arr.forEach(function (r) {
        html += '<button type="button" class="rc-item' + (r.id === cur ? ' on' : '') + '" data-id="' + esc(r.id) + '">'
          + avatar(r, 40) + '<span>' + esc(r.n) + '</span></button>';
      });
      return html;
    }
    var found = all.filter(function (r) { return r.id === cur; })[0];
    var curHtml = found ? '<div class="rc-cur">' + avatar(found, 54) + '<div><small>ئێستا گوێ دەگریت لە</small><b>' + esc(found.n) + '</b><small>' + (isKurd(found) ? 'قورئانخوێنی کورد' : 'قورئانخوێنی عەرەب') + '</small></div></div>' : '';
    panel.innerHTML = curHtml + block('🟢 قورئانخوێنە کوردەکان', kurd, 'ku') + block('🟤 قورئانخوێنە عەرەبەکان', arab, 'ar');
    btn.innerHTML = found ? avatar(found, 24) + '<span>' + esc(found.n) + '</span>' : 'قورئانخوێن';
  }
  function boot() {
    var rc = document.getElementById('rc');
    if (!rc || !rc.options || !rc.options.length) return setTimeout(boot, 250);
    css();
    if (!document.getElementById('rcBtn')) {
      var btn = document.createElement('button');
      btn.id = 'rcBtn';
      btn.type = 'button';
      btn.textContent = 'قورئانخوێن';
      rc.parentNode.insertBefore(btn, rc);
      var panel = document.createElement('div');
      panel.id = 'rcPanel';
      panel.hidden = true;
      document.body.appendChild(panel);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.hidden = !panel.hidden;
        if (!panel.hidden) paint();
      });
      panel.addEventListener('click', function (e) {
        var b = e.target.closest('.rc-item');
        if (!b) return;
        rc.value = b.getAttribute('data-id');
        try { rc.dispatchEvent(new Event('change', { bubbles: true })); } catch (err) {}
        panel.hidden = true;
        paint();
      });
      document.addEventListener('click', function (e) {
        if (panel.hidden) return;
        if (e.target.closest('#rcPanel') || e.target.closest('#rcBtn')) return;
        panel.hidden = true;
      });
      rc.addEventListener('change', paint);
    }
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 900); });
  else setTimeout(boot, 900);
})();
