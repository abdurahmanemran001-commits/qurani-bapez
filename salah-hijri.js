/* salah-hijri.js v1 — ڕێکەوتی هیجری + بۆنە ئایینییەکانی داهاتوو (بەپێی زمان) */
(function () {
  var OK = 'salah_hj_off';
  var MN = {
    ckb: ['موحەڕەم', 'سەفەر', 'ڕەبیعولئەووەل', 'ڕەبیعولئاخر', 'جومادەلئەووەل', 'جومادەلئاخر', 'ڕەجەب', 'شەعبان', 'ڕەمەزان', 'شەووال', 'زیلقەعدە', 'زیلحیجە'],
    en: ['Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'],
    ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة']
  };
  /* [month, day, ckb, en, ar] */
  var EV = [
    [1, 1, 'سەری ساڵی هیجری', 'Islamic New Year', 'رأس السنة الهجرية'],
    [1, 10, 'ڕۆژی عاشوڕا', 'Day of Ashura', 'يوم عاشوراء'],
    [3, 12, 'مەولودی پێغەمبەر ﷺ', 'Mawlid (Prophet\'s birthday)', 'المولد النبوي'],
    [7, 27, 'ئیسرا و میعراج', 'Isra and Mi\'raj', 'الإسراء والمعراج'],
    [8, 15, 'نیوەی شەعبان', 'Mid-Sha\'ban', 'ليلة النصف من شعبان'],
    [9, 1, 'سەرەتای ڕەمەزان', 'First day of Ramadan', 'أول رمضان'],
    [9, 27, 'شەوی قەدر (٢٧)', 'Laylat al-Qadr (27th)', 'ليلة القدر (٢٧)'],
    [10, 1, 'جەژنی ڕەمەزان', 'Eid al-Fitr', 'عيد الفطر'],
    [12, 9, 'ڕۆژی عەرەفە', 'Day of Arafah', 'يوم عرفة'],
    [12, 10, 'جەژنی قوربان', 'Eid al-Adha', 'عيد الأضحى']
  ];
  var TX = {
    ckb: { t: 'ڕێکەوتی هیجری', up: 'بۆنەکانی داهاتوو', today: 'ئەمڕۆ', tom: 'سبەی', d: 'ڕۆژی ماوە', adj: 'ڕاستکردنەوەی ڕێکەوت (بەپێی بینینی مانگ)', y: 'ک', rt: 'ڕەمەزانی پیرۆز', rd: 'ڕۆژی {0} لە ڕەمەزان', sh: 'کۆتایی سەحەر', if: 'ئیفتار', hm: 'خۆر ئاوابوون' },
    en: { t: 'Hijri date', up: 'Upcoming occasions', today: 'Today', tom: 'Tomorrow', d: 'days left', adj: 'Adjust date (moon sighting)', y: 'AH', rt: 'Ramadan Mubarak', rd: 'Day {0} of Ramadan', sh: 'Suhoor ends', if: 'Iftar', hm: '' },
    ar: { t: 'التاريخ الهجري', up: 'المناسبات القادمة', today: 'اليوم', tom: 'غدًا', d: 'يومًا متبقيًا', adj: 'تعديل التاريخ (رؤية الهلال)', y: 'هـ', rt: 'رمضان مبارك', rd: 'اليوم {0} من رمضان', sh: 'نهاية السحور', if: 'الإفطار', hm: '' }
  };
  function lang() { return window.appLang || 'ckb'; }
  function L() { var l = lang(); return l === 'bad' ? 'ckb' : (MN[l] ? l : 'en'); }
  function off() { try { return Math.max(-2, Math.min(2, +localStorage.getItem(OK) || 0)); } catch (e) { return 0; } }
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }); } catch (e) {}
  function hij(d) {
    if (!fmt) return null;
    var x = new Date(d.getTime() + off() * 86400000), p = {};
    fmt.formatToParts(x).forEach(function (q) { p[q.type] = +q.value; });
    return p.month ? { y: p.year, m: p.month, d: p.day } : null;
  }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function upcoming(now) {
    var seen = {}, out = [], base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    for (var i = 0; i < 400 && out.length < EV.length; i++) {
      var d = new Date(base.getTime() + i * 86400000), h = hij(d); if (!h) break;
      EV.forEach(function (e, k) { if (!seen[k] && e[0] === h.m && e[1] === h.d) { seen[k] = 1; out.push({ i: i, e: e }); } });
    }
    return out.sort(function (a, b) { return a.i - b.i; }).slice(0, 5);
  }
  function ramadan(T, h) {
    if (h.m !== 9) return '';
    var C = window.__salahCore, tm = C && C.getTimes && C.getTimes(); if (!tm || !tm.Fajr || !tm.Maghrib) return '';
    return '<div class="salah-card" style="background:linear-gradient(135deg,#176b4b,#0f4a34);color:#fff"><b>🌙 ' + T.rt + '</b><div style="font-size:13px;opacity:.9;margin:4px 0 10px">' + T.rd.replace('{0}', h.d) + '</div><div style="display:flex;gap:10px;text-align:center"><div style="flex:1;background:rgba(255,255,255,.14);border-radius:12px;padding:10px"><div style="font-size:12px;opacity:.85">' + T.sh + '</div><div dir="ltr" style="font-size:22px;font-weight:700">' + tm.Fajr + '</div></div><div style="flex:1;background:rgba(255,255,255,.14);border-radius:12px;padding:10px"><div style="font-size:12px;opacity:.85">' + T.if + '</div><div dir="ltr" style="font-size:22px;font-weight:700">' + tm.Maghrib + '</div></div></div></div>';
  }
  function card() {
    var l = L(), T = TX[l], names = MN[l], now = new Date(), h = hij(now);
    if (!h) return '';
    var ci = l === 'ckb' ? 2 : l === 'ar' ? 4 : 3;
    var greg; if (l === 'ckb') { var KM = ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'], KD = ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە']; greg = KD[now.getDay()] + '، ' + now.getDate() + ' ' + KM[now.getMonth()] + ' ' + now.getFullYear(); } else try { greg = now.toLocaleDateString(l === 'ckb' ? 'ckb' : l, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { greg = now.toDateString(); }
    var rows = upcoming(now).map(function (u) {
      var when = u.i === 0 ? T.today : u.i === 1 ? T.tom : u.i + ' ' + T.d;
      return '<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-top:1px solid #e7efeb"><span>' + esc(u.e[ci]) + '</span><span style="color:#176b4b;white-space:nowrap;font-size:13px">' + when + '</span></div>';
    }).join('');
    var o = off();
    return ramadan(T, h) + '<div class="salah-card" id="salahHijri"><b>' + T.t + '</b><div style="font-size:22px;font-weight:700;color:#176b4b;margin:6px 0">' + h.d + ' ' + esc(names[h.m - 1]) + ' ' + h.y + ' ' + T.y + '</div><div style="font-size:12.5px;opacity:.75">' + esc(greg) + '</div><div style="margin-top:12px"><b style="font-size:13.5px">' + T.up + '</b>' + rows + '</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px;opacity:.8"><span>' + T.adj + '</span><span dir="ltr"><button type="button" data-hj="-1" style="width:28px;height:28px;border-radius:8px;border:1px solid #dce5e1;background:#fff">−</button> <b>' + (o > 0 ? '+' : '') + o + '</b> <button type="button" data-hj="1" style="width:28px;height:28px;border-radius:8px;border:1px solid #dce5e1;background:#fff">+</button></span></div></div>';
  }
  function bind(root, redraw) {
    root.querySelectorAll('[data-hj]').forEach(function (b) {
      b.onclick = function () { try { localStorage.setItem(OK, String(Math.max(-2, Math.min(2, off() + (+b.getAttribute('data-hj')))))); } catch (e) {} redraw(); };
    });
  }
  window.__salahHijri = { card: card, bind: bind };
})();
