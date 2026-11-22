/* donate.js v1 — "بەخشین" section: FIB number (copy), monthly figures from donate-data.json, monthly video links.
 * Edit donate-data.json each month: {"month":"2026-11","total":0,"spent":0,"goal":0,"note":"","videos":[{"m":"2026-10","url":"https://youtube.com/..."}]} */
(function () {
  if (window.__donateV1) return; window.__donateV1 = true;
  var FIB = '07507512704';
  var T = {
    ckb: { t: 'بەخشین', sub: 'سەدەقە · FIB', home: 'سەرەتا', send: 'بەخشین لە ڕێگەی FIB', how: 'لە ئەپی FIB بچۆ بەشی ناردنی پارە و ئەم ڕەقەمە بنووسە:', copy: 'کۆپی ڕەقەم', copied: 'کۆپی کرا ✓', stat: 'ئامارەکانی مانگ', month: 'مانگ', total: 'کۆی بەخشینەکان', spent: 'خەرجکراو', left: 'ماوە', goal: 'ئامانج', vid: 'ڤیدیۆی مانگانە', vidt: 'هەموو مانگێک بەخشینەکان و شوێنی خەرجکردنیان لە ڤیدیۆیەکدا بڵاو دەکرێنەوە.', watch: 'ڕووانین', none: 'هێشتا ڤیدیۆ نییە، یەکەم ڤیدیۆ بەم زووانە.', nodata: 'هێشتا بەخشینێک تۆمار نەکراوە.', dua: 'پێغەمبەر ﷺ فەرموویەتی: «سەدەقە مال کەم ناکاتەوە». ئەم بەخشینانە تەنها بۆ کاری چاکە و پەرەپێدانی ئەم پڕۆژەیە و هەموو مانگێک بە ڤیدیۆ ڕوون دەکرێتەوە.', iqd: 'دینار', upd: 'ڕێکەوتی نوێکردنەوە' },
    en: { t: 'Donate', sub: 'Sadaqah · FIB', home: 'Home', send: 'Donate via FIB', how: 'Open the FIB app, choose send money and enter this number:', copy: 'Copy number', copied: 'Copied ✓', stat: "This month's figures", month: 'Month', total: 'Total donations', spent: 'Spent', left: 'Remaining', goal: 'Goal', vid: 'Monthly video', vidt: 'Every month the donations and how they were spent are published in a video.', watch: 'Watch', none: 'No video yet — the first one is coming soon.', nodata: 'No donation recorded yet.', dua: 'The Prophet ﷺ said: "Charity does not decrease wealth." Donations are used only for good causes and the development of this project, and are explained every month in a video.', iqd: 'IQD', upd: 'Last updated' },
    ar: { t: 'تبرّع', sub: 'صدقة · FIB', home: 'الرئيسية', send: 'التبرع عبر FIB', how: 'افتح تطبيق FIB واختر إرسال الأموال وأدخل هذا الرقم:', copy: 'نسخ الرقم', copied: 'تم النسخ ✓', stat: 'أرقام هذا الشهر', month: 'الشهر', total: 'إجمالي التبرعات', spent: 'المصروف', left: 'المتبقي', goal: 'الهدف', vid: 'الفيديو الشهري', vidt: 'كل شهر تُنشر التبرعات وأوجه صرفها في فيديو.', watch: 'مشاهدة', none: 'لا يوجد فيديو بعد، سيصدر الأول قريباً.', nodata: 'لم تُسجَّل تبرعات بعد.', dua: 'قال النبي ﷺ: «ما نقصت صدقة من مال». تُصرف التبرعات في الخير وتطوير هذا المشروع فقط، ويُوضَّح ذلك كل شهر في فيديو.', iqd: 'دينار', upd: 'آخر تحديث' }
  };
  function lang() { var l = window.appLang || ''; try { if (!l) l = localStorage.getItem('app_language') || ''; } catch (e) {} if (!l || l === 'ku' || l === 'bad') l = 'ckb'; return l; }
  function L(k) { var t = T[lang()] || T.en; return t[k] != null ? t[k] : T.en[k]; }
  function fmt(n) { try { return Number(n).toLocaleString('en-US'); } catch (e) { return n; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css() {
    if (document.getElementById('dnCss')) return;
    var s = document.createElement('style'); s.id = 'dnCss';
    s.textContent = '#donateView{padding:10px 12px 90px}.dn-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}.dn-head b{flex:1;text-align:center}.dn-card{border:1px solid rgba(120,120,120,.25);background:rgba(120,120,120,.07);border-radius:16px;padding:14px;margin-bottom:12px}.dn-hero{background:linear-gradient(145deg,#176b4b,#0f4d36);color:#fff;border:0;text-align:center}.dn-num{direction:ltr;font-size:30px;font-weight:800;letter-spacing:2px;margin:10px 0;font-variant-numeric:tabular-nums}.dn-btn{border:0;border-radius:12px;padding:11px 18px;font:inherit;font-weight:700;background:#fff;color:#0f4d36;cursor:pointer}.dn-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.dn-g div{border-radius:12px;background:rgba(120,120,120,.1);padding:10px;text-align:center}.dn-g b{display:block;font-size:18px;margin-top:2px}.dn-bar{height:9px;border-radius:9px;background:rgba(120,120,120,.2);overflow:hidden;margin-top:10px}.dn-bar i{display:block;height:100%;background:#2fb67a}.dn-vid{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 0;border-top:1px solid rgba(120,120,120,.2)}.dn-vid:first-of-type{border-top:0}.dn-vid a{background:#c4302b;color:#fff;border-radius:10px;padding:7px 14px;text-decoration:none;font-weight:700}.dn-muted{opacity:.75;font-size:13px;line-height:1.9}';
    document.head.appendChild(s);
  }
  var data = null;
  function render() {
    var v = document.getElementById('donateView'); if (!v) return;
    var d = data || {}, fib = d.fib || FIB, tot = +d.total || 0, sp = +d.spent || 0, goal = +d.goal || 0;
    var stat = (tot || sp || goal) ? '<div class="dn-card"><b>' + L('stat') + (d.month ? ' · ' + esc(d.month) : '') + '</b><div class="dn-g"><div>' + L('total') + '<b>' + fmt(tot) + ' ' + L('iqd') + '</b></div><div>' + L('spent') + '<b>' + fmt(sp) + ' ' + L('iqd') + '</b></div><div>' + L('left') + '<b>' + fmt(Math.max(tot - sp, 0)) + ' ' + L('iqd') + '</b></div>' + (goal ? '<div>' + L('goal') + '<b>' + fmt(goal) + ' ' + L('iqd') + '</b></div>' : '') + '</div>' + (goal ? '<div class="dn-bar"><i style="width:' + Math.min(100, Math.round(tot / goal * 100)) + '%"></i></div>' : '') + (d.note ? '<p class="dn-muted" style="margin:10px 0 0">' + esc(d.note) + '</p>' : '') + '</div>' : '<div class="dn-card dn-muted">' + L('nodata') + '</div>';
    var vids = (d.videos || []).filter(function (x) { return x && /^https?:\/\//.test(x.url || ''); }).slice().reverse();
    var vh = vids.length ? vids.map(function (x) { return '<div class="dn-vid"><span>▶ ' + esc(x.m) + '</span><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + L('watch') + '</a></div>'; }).join('') : '<div class="dn-muted">' + L('none') + '</div>';
    v.innerHTML = '<div class="dn-head"><button class="tab" type="button" id="dnBack">‹ ' + L('home') + '</button><b>' + L('t') + '</b><span style="width:60px"></span></div>' +
      '<div class="dn-card dn-hero"><div style="font-size:34px">🤲</div><b>' + L('send') + '</b><p class="dn-muted" style="color:#fff;margin:6px 0 0">' + L('how') + '</p><div class="dn-num" id="dnNum">' + esc(fib) + '</div><button class="dn-btn" type="button" id="dnCopy">' + L('copy') + '</button></div>' + stat +
      '<div class="dn-card"><b>🎥 ' + L('vid') + '</b><p class="dn-muted" style="margin:6px 0 8px">' + L('vidt') + '</p>' + vh + '</div>' +
      '<div class="dn-card dn-muted">' + L('dua') + '</div>';
    v.setAttribute('data-no-translate', '1');
    document.getElementById('dnBack').onclick = function () { if (typeof showView === 'function') showView('startScreen', 'بەشەکان'); };
    document.getElementById('dnCopy').onclick = function () {
      var b = this, ok = function () { b.textContent = L('copied'); setTimeout(function () { b.textContent = L('copy'); }, 1800); };
      try { navigator.clipboard.writeText(fib).then(ok, function () { fb(); }); } catch (e) { fb(); }
      function fb() { try { var r = document.createRange(); r.selectNodeContents(document.getElementById('dnNum')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); ok(); } catch (e) {} }
    };
  }
  function load() {
    return fetch('donate-data.json?_=' + Date.now()).then(function (r) { return r.json(); }).then(function (j) { data = j; try { localStorage.setItem('donate_cache_v1', JSON.stringify(j)); } catch (e) {} }).catch(function () { try { data = JSON.parse(localStorage.getItem('donate_cache_v1') || 'null'); } catch (e) {} });
  }
  window.enterDonate = function () {
    css(); var main = document.querySelector('.main'); if (!main) return;
    var v = document.getElementById('donateView');
    if (!v) { v = document.createElement('section'); v.id = 'donateView'; v.className = 'view'; main.appendChild(v); }
    render();
    if (typeof showView === 'function') showView('donateView', L('t'));
    load().then(render);
  };
  function inject() {
    var box = document.querySelector('#startScreen .section-choices');
    if (!box) return;
    var ex = box.querySelector('.donate-choice');
    if (ex) { var bb = ex.querySelector('b'), sm = ex.querySelector('small'); if (bb) bb.textContent = L('t'); if (sm) sm.textContent = L('sub'); return; }
    var b = document.createElement('button'); b.className = 'section-choice donate-choice'; b.type = 'button';
    b.onclick = function () { window.enterDonate(); };
    b.innerHTML = '<span class="choice-icon">🤲</span><span class="choice-copy"><b>' + L('t') + '</b><small>' + L('sub') + '</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b);
  }
  var n = 0, iv = setInterval(function () { inject(); if (++n > 40) clearInterval(iv); }, 400);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(inject, 60); });
})();
