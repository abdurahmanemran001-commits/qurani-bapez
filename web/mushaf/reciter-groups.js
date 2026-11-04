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
    function block(title, arr) {
      var html = '<div class="rc-sec">' + esc(title) + '</div><div class="rc-line"></div>';
      arr.forEach(function (r) {
        html += '<button type="button" class="rc-item' + (r.id === cur ? ' on' : '') + '" data-id="' + esc(r.id) + '">'
          + '<span class="rc-av" style="background:' + color(r.n) + '">' + esc(initial(r.n)) + '</span>'
          + '<span>' + esc(r.n) + '</span></button>';
      });
      return html;
    }
    panel.innerHTML = block('کوردەکان', kurd) + block('عەرەبەکان', arab);
    var found = all.filter(function (r) { return r.id === cur; })[0];
    btn.textContent = found ? found.n : 'قورئانخوێن';
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
