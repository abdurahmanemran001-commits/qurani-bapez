/* salah-themes.js v1 — beautiful backgrounds for the Prayer section (all drawn with CSS + inline SVG: no images, work offline).
 * Pick one in Prayer ▸ Settings ▸ Backgrounds. The "Sky of the hour" background follows the current prayer
 * (dawn, sunrise, midday, afternoon, sunset, starry night). Stored in localStorage "salah_bg_v1"; empty = the classic themes. */
(function () {
  if (window.__salahThemes) return;
  window.__salahThemes = true;
  var KEY = 'salah_bg_v1';
  var NS = "xmlns='http://www.w3.org/2000/svg'";
  function svg(s) { return 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")'; }

  /* ---------- artwork ---------- */
  var A = {
    star8: function (op) {
      return svg("<svg " + NS + " width='90' height='90' viewBox='0 0 90 90'><g fill='none' stroke='#e6c76a' stroke-opacity='" + op + "' stroke-width='1.2'><rect x='22' y='22' width='46' height='46'/><rect x='22' y='22' width='46' height='46' transform='rotate(45 45 45)'/><circle cx='45' cy='45' r='10'/><path d='M0 45h22M68 45h22M45 0v22M45 68v22'/></g></svg>");
    },
    stars: function () {
      var p = [[20, 30, 1.2], [80, 12, .9], [140, 55, 1.5], [210, 20, 1], [280, 60, 1.3], [50, 110, .9], [120, 140, 1.2], [190, 100, .8], [255, 135, 1.4], [300, 190, 1], [30, 200, 1.3], [95, 235, .9], [160, 205, 1.1], [225, 250, 1.2], [280, 290, .9], [60, 290, 1.2], [140, 300, .8], [200, 170, .9]];
      return svg("<svg " + NS + " width='320' height='320'><g fill='#fff'>" + p.map(function (s) { return "<circle cx='" + s[0] + "' cy='" + s[1] + "' r='" + s[2] + "'/>"; }).join('') + "</g></svg>");
    },
    crescent: function () {
      return svg("<svg " + NS + " width='120' height='120' viewBox='0 0 120 120'><defs><radialGradient id='g' cx='.5' cy='.5' r='.5'><stop offset='.55' stop-color='#fff6c8' stop-opacity='.35'/><stop offset='1' stop-color='#fff6c8' stop-opacity='0'/></radialGradient></defs><circle cx='60' cy='60' r='58' fill='url(#g)'/><path d='M74 28A34 34 0 1 0 74 92A28 28 0 1 1 74 28z' fill='#fff3b0'/></svg>");
    },
    skyline: function (fill) {
      return svg("<svg " + NS + " viewBox='0 0 800 200' preserveAspectRatio='none'><g fill='" + fill + "'><rect y='172' width='800' height='28'/><path d='M320 172v-42a80 80 0 0 1 160 0v42z'/><rect x='398' y='28' width='4' height='24'/><circle cx='400' cy='26' r='5'/><path d='M230 172v-22a40 40 0 0 1 80 0v22z'/><rect x='269' y='98' width='2' height='14'/><path d='M490 172v-22a40 40 0 0 1 80 0v22z'/><rect x='529' y='98' width='2' height='14'/><rect x='146' y='62' width='10' height='110'/><path d='M143 62l8-26 8 26z'/><rect x='141' y='88' width='20' height='6'/><rect x='644' y='62' width='10' height='110'/><path d='M641 62l8-26 8 26z'/><rect x='639' y='88' width='20' height='6'/><rect x='56' y='104' width='8' height='68'/><path d='M54 104l6-18 6 18z'/><rect x='736' y='104' width='8' height='68'/><path d='M734 104l6-18 6 18z'/><rect x='190' y='152' width='420' height='22'/></g></svg>");
    },
    mountains: function (c1, c2, c3) {
      return svg("<svg " + NS + " viewBox='0 0 800 240' preserveAspectRatio='none'><path fill='" + c1 + "' fill-opacity='.65' d='M0 150L70 100 130 130 210 70 290 125 360 90 450 140 540 80 620 120 700 85 800 130V240H0z'/><path fill='" + c2 + "' d='M0 190L90 140 170 175 260 120 350 170 430 130 520 180 610 135 710 175 800 150V240H0z'/><path fill='" + c3 + "' d='M0 215L100 185 200 210 300 175 400 205 500 180 600 210 700 188 800 205V240H0z'/></svg>");
    },
    dunes: function (c1, c2, c3) {
      return svg("<svg " + NS + " viewBox='0 0 800 220' preserveAspectRatio='none'><path fill='" + c1 + "' d='M0 130C120 90 220 150 340 120S560 70 680 110 760 120 800 110V220H0z'/><path fill='" + c2 + "' d='M0 160C100 130 240 190 380 150S600 120 720 160 780 165 800 160V220H0z'/><path fill='" + c3 + "' d='M0 190C140 165 260 210 420 180S650 160 800 190V220H0z'/></svg>");
    },
    waves: function () {
      return svg("<svg " + NS + " viewBox='0 0 800 160' preserveAspectRatio='none'><path fill='#7dd3fc' fill-opacity='.18' d='M0 70C100 30 200 110 300 70S500 30 600 70 700 110 800 70V160H0z'/><path fill='#38bdf8' fill-opacity='.22' d='M0 95C120 60 240 130 360 95S560 60 680 95 760 110 800 95V160H0z'/><path fill='#0ea5e9' fill-opacity='.28' d='M0 125C140 100 260 150 400 125S640 100 800 125V160H0z'/></svg>");
    },
    lanterns: function () {
      return svg("<svg " + NS + " width='200' height='130' viewBox='0 0 200 130'><g stroke='#f5c04a' stroke-width='1.2' fill='none'><path d='M50 0V22M150 0V12'/></g><path d='M50 22l-7 6h14z' fill='#f5c04a'/><path d='M43 28h14l5 22-12 28-12-28z' fill='#f59e0b' fill-opacity='.88'/><circle cx='50' cy='52' r='9' fill='#fde68a' fill-opacity='.75'/><path d='M44 80h12l-6 8z' fill='#f5c04a'/><path d='M150 12l-9 8h18z' fill='#f5c04a'/><path d='M141 20h18l7 30-16 36-16-36z' fill='#ef6c3a' fill-opacity='.88'/><circle cx='150' cy='52' r='11' fill='#fde68a' fill-opacity='.8'/><path d='M143 88h14l-7 10z' fill='#f5c04a'/></svg>");
    },
    zellige: function () {
      return svg("<svg " + NS + " width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' fill='#0c4a6e'/><polygon points='32,6 38,22 54,16 44,30 58,40 42,40 40,58 32,46 24,58 22,40 6,40 20,30 10,16 26,22' fill='#38bdf8' fill-opacity='.3'/><circle cx='32' cy='32' r='7' fill='#fbbf24' fill-opacity='.6'/><g fill='#fbbf24' fill-opacity='.32'><circle cx='0' cy='0' r='9'/><circle cx='64' cy='0' r='9'/><circle cx='0' cy='64' r='9'/><circle cx='64' cy='64' r='9'/></g></svg>");
    },
    arch: function () {
      return svg("<svg " + NS + " width='70' height='90' viewBox='0 0 70 90'><g fill='none' stroke='#b88a3a' stroke-opacity='.55' stroke-width='1.6'><path d='M5 90V45C5 22 35 6 35 6s30 16 30 39v45'/><path d='M15 90V48C15 30 35 17 35 17s20 13 20 31v42'/></g><circle cx='35' cy='62' r='3' fill='#b88a3a' fill-opacity='.5'/></svg>");
    },
    veins: function (c, op) {
      return svg("<svg " + NS + " width='600' height='600' viewBox='0 0 600 600'><g fill='none' stroke='" + c + "' stroke-opacity='" + op + "' stroke-width='1'><path d='M0 120C120 100 160 200 280 180S420 80 600 140'/><path d='M0 360C100 330 220 420 330 380S500 300 600 360' stroke-opacity='" + (op * .7) + "'/><path d='M120 0C140 120 100 220 180 330S260 500 240 600' stroke-opacity='" + (op * .55) + "'/><path d='M0 220C90 200 180 280 300 250S480 170 600 230' stroke-opacity='" + (op * .6) + "'/><path d='M300 0C280 100 360 180 340 300S420 480 400 600' stroke-opacity='" + (op * .5) + "'/></g></svg>");
    }
  };

  /* ---------- theme definitions ---------- */
  var DARK = { dark: true, text: '#fff', hero: 'linear-gradient(145deg,rgba(255,255,255,.17),rgba(255,255,255,.06))', ring: 'rgba(255,255,255,.35)', accent: '#fff', glass: 'rgba(255,255,255,.10)', line: 'rgba(255,255,255,.16)', rowbg: 'rgba(0,0,0,.12)', cur: 'rgba(255,255,255,.18)', tabbg: 'rgba(8,12,24,.58)', tabtxt: 'rgba(255,255,255,.78)', tabon: 'rgba(255,255,255,.2)', tabontxt: '#fff', ok: '#9ae6b4', before: '', after: '', extra: '' };
  var LIGHT = { dark: false, text: '#25303a', hero: 'linear-gradient(145deg,#176b4b,#0f4d36)', ring: 'rgba(255,255,255,.4)', accent: '#fff', glass: 'rgba(255,255,255,.66)', line: 'rgba(70,55,25,.18)', rowbg: 'transparent', cur: 'rgba(23,107,75,.14)', tabbg: 'rgba(255,255,255,.85)', tabtxt: '#4b5f57', tabon: 'rgba(23,107,75,.14)', tabontxt: '#176b4b', ok: '#176b4b', before: '', after: '', extra: '' };
  function mk(base, o) { var r = {}, k; for (k in base) r[k] = base[k]; for (k in o) r[k] = o[k]; return r; }
  var STARS_BG = function (op) { return 'background:' + A.stars() + ';background-size:320px 320px;opacity:' + op + ';animation:sltw 5s ease-in-out infinite alternate;'; };
  var STARS_B = function (op) { return 'inset:0;background:' + A.stars() + ' 110px 70px/260px 260px;opacity:' + op + ';animation:sltw 7s ease-in-out 1.2s infinite alternate;'; };
  var TOPMASK = '-webkit-mask-image:linear-gradient(#000,transparent 45%);mask-image:linear-gradient(#000,transparent 45%);';

  var SKY = [
    { g: 'linear-gradient(#0b1b3a 0%,#27397a 38%,#a65d95 74%,#c8744f 100%)', stars: .55, sil: '#0a1030', sun: '' },
    { g: 'linear-gradient(#35599b 0%,#8f6fae 38%,#e0894a 78%,#d9772f 100%)', stars: 0, sil: '#3a2a52', sun: 'radial-gradient(circle at 50% 80%,rgba(255,236,170,.95) 0,rgba(255,200,110,.45) 9%,transparent 30%)' },
    { g: 'linear-gradient(#14459a 0%,#2a7cd0 55%,#5fa8e6 100%)', stars: 0, sil: '#1e4d7a', sun: 'radial-gradient(circle at 80% 13%,rgba(255,255,230,.95) 0,rgba(255,255,200,.5) 6%,transparent 20%)' },
    { g: 'linear-gradient(#2f5f9b 0%,#8d7a52 58%,#b98443 100%)', stars: 0, sil: '#4d3418', sun: 'radial-gradient(circle at 24% 28%,rgba(255,230,160,.9) 0,rgba(255,200,110,.4) 7%,transparent 24%)' },
    { g: 'linear-gradient(#2b1b4f 0%,#8a2f5b 38%,#d9572f 76%,#c9622b 100%)', stars: .3, sil: '#220f2c', sun: 'radial-gradient(circle at 50% 84%,rgba(255,214,120,.95) 0,rgba(255,150,70,.5) 10%,transparent 34%)' },
    { g: 'linear-gradient(#040814 0%,#0a1433 55%,#16224d 100%)', stars: .95, sil: '#03060f', sun: '', moon: true }
  ];
  function autoTheme(i) {
    var s = SKY[i < 0 || i > 5 ? 5 : i], L = [];
    if (s.moon) L.push(A.crescent() + ' right 7% top 66px/80px 80px no-repeat');
    L.push(A.skyline(s.sil) + ' bottom center/100% min(20%,190px) no-repeat');
    if (s.sun) L.push(s.sun);
    L.push(s.g);
    return mk(DARK, { idx: i, base: '#0b1b3a', layers: L, before: s.stars ? STARS_BG(s.stars) + TOPMASK : '', after: s.moon ? STARS_B(.55) : '' });
  }

  var THEMES = {
    night: function () {
      return mk(DARK, { base: '#030712', layers: [A.crescent() + ' right 7% top 66px/80px 80px no-repeat', A.skyline('#050a1c') + ' bottom center/100% min(20%,190px) no-repeat', 'linear-gradient(#030712,#0b1537 55%,#1b1f4d)'], before: STARS_BG(.95), after: STARS_B(.6) });
    },
    kurdistan: function () {
      return mk(DARK, { base: '#2b3a67', layers: [A.mountains('#8a7aa8', '#5a4f86', '#2e2852') + ' bottom center/100% min(30%,300px) no-repeat', 'radial-gradient(circle at 72% 68%,rgba(255,225,160,.9) 0,rgba(255,190,120,.4) 8%,transparent 30%)', 'linear-gradient(#2b3a67 0%,#8e5f8e 38%,#d9784a 74%,#c8683f 100%)'], before: STARS_BG(.5) + TOPMASK });
    },
    desert: function () {
      return mk(DARK, { base: '#1d2b53', layers: [A.dunes('#d98a3a', '#b46a2a', '#7d4520') + ' bottom center/100% min(28%,260px) no-repeat', 'radial-gradient(circle at 30% 66%,rgba(255,220,140,.9) 0,rgba(255,170,90,.4) 8%,transparent 30%)', 'linear-gradient(#1d2b53 0%,#7e3f6b 35%,#e5703a 70%,#c9772f 100%)'], before: STARS_BG(.45) + TOPMASK });
    },
    medina: function () {
      return mk(DARK, { base: '#052e1f', layers: [A.crescent() + ' right 8% top 60px/70px 70px no-repeat', A.skyline('#03150f') + ' bottom center/100% min(22%,210px) no-repeat', 'radial-gradient(circle at 50% 38%,rgba(120,255,190,.26),transparent 46%)', 'linear-gradient(#042a1c,#0b5b40 60%,#14805a)'], before: STARS_BG(.5) + TOPMASK });
    },
    geo: function () {
      return mk(DARK, { base: '#0b1f3f', layers: [A.star8(.32) + ' 0 0/90px 90px repeat', 'radial-gradient(circle at 50% 0,rgba(230,199,106,.2),transparent 52%)', 'linear-gradient(#0b1f3f,#16335f)'] });
    },
    zellige: function () {
      return mk(DARK, { base: '#0c4a6e', layers: ['linear-gradient(rgba(5,25,40,.6),rgba(5,25,40,.22) 60%,rgba(5,25,40,.6))', A.zellige() + ' 0 0/64px 64px repeat'] });
    },
    arch: function () {
      return mk(LIGHT, { text: '#3b2c14', hero: 'linear-gradient(145deg,#8a6a24,#5e4513)', base: '#efe3c6', layers: [A.arch() + ' 0 0/70px 90px repeat', 'linear-gradient(#f6ecd2,#ead9ad)'], ok: '#6b4f12', tabon: 'rgba(138,106,36,.2)', tabontxt: '#5e4513' });
    },
    emerald: function () {
      return mk(DARK, { base: '#063d2c', layers: [A.veins('#e6c76a', .4) + ' 0 0/600px 600px repeat', 'radial-gradient(circle at 20% 10%,rgba(120,255,190,.25),transparent 46%)', 'linear-gradient(145deg,#04301f,#0d6a4b 55%,#0a4f38)'] });
    },
    rose: function () {
      return mk(DARK, { base: '#3b1d3a', layers: ['radial-gradient(circle at 15% 8%,rgba(255,214,190,.35),transparent 40%)', 'radial-gradient(circle at 90% 90%,rgba(255,170,150,.28),transparent 46%)', 'linear-gradient(160deg,#3b1d3a,#8c3b5e 48%,#c97d68)'] });
    },
    aurora: function () {
      return mk(DARK, { base: '#06121f', layers: ['linear-gradient(#06121f,#0a1c33)'], before: 'background:radial-gradient(60% 40% at 20% 20%,rgba(52,211,153,.55),transparent),radial-gradient(50% 40% at 80% 30%,rgba(129,140,248,.5),transparent),radial-gradient(60% 40% at 50% 80%,rgba(45,212,191,.4),transparent);background-size:200% 200%;animation:slau 18s ease-in-out infinite alternate;opacity:.9;' });
    },
    ocean: function () {
      return mk(DARK, { base: '#022a4d', layers: [A.waves() + ' bottom center/100% min(26%,240px) no-repeat', 'radial-gradient(circle at 80% 10%,rgba(160,230,255,.35),transparent 40%)', 'linear-gradient(#022a4d,#065a82 55%,#0a7f96)'] });
    },
    royal: function () {
      return mk(DARK, { base: '#1b0f3a', layers: [A.star8(.24) + ' 0 0/90px 90px repeat', 'radial-gradient(circle at 50% 0,rgba(180,140,255,.3),transparent 56%)', 'linear-gradient(160deg,#1b0f3a,#3b2175 55%,#2a1458)'] });
    },
    ramadan: function () {
      return mk(DARK, { base: '#1a1040', layers: [A.crescent() + ' right 8% top 112px/74px 74px no-repeat', 'radial-gradient(circle at 50% 100%,rgba(255,200,90,.22),transparent 50%)', 'linear-gradient(#1a1040,#2d1b69 55%,#3f2a85)'], before: STARS_BG(.8), after: 'left:0;right:0;top:0;height:130px;background:' + A.lanterns() + ' repeat-x top left/200px 130px;transform-origin:top center;animation:slsw 5s ease-in-out infinite alternate;' });
    },
    marble: function () {
      return mk(LIGHT, { text: '#25303a', hero: 'linear-gradient(145deg,#1a365d,#0f2547)', base: '#f4f5f8', layers: [A.veins('#b9a36a', .5) + ' 0 0/600px 600px repeat', 'radial-gradient(circle at 80% 0,#fff,transparent 50%)', 'linear-gradient(#f8f9fc,#e8ebf2)'], ok: '#176b4b' });
    },
    sand: function () {
      return mk(LIGHT, { text: '#3b2c14', hero: 'linear-gradient(145deg,#7a5a1c,#4f3a10)', base: '#e8d6a8', layers: ['radial-gradient(ellipse at center,rgba(255,250,235,.7),transparent 70%)', 'linear-gradient(#f3e6c4,#e0c98f)'], extra: 'box-shadow:inset 0 0 90px rgba(120,80,20,.28);', ok: '#6b4f12', tabon: 'rgba(122,90,28,.2)', tabontxt: '#5a4010' });
    }
  };
  var IDS = ['auto', 'night', 'kurdistan', 'desert', 'medina', 'geo', 'zellige', 'arch', 'emerald', 'rose', 'aurora', 'ocean', 'royal', 'ramadan', 'marble', 'sand'];
  var EMOJI = { auto: '🌤', night: '🌌', kurdistan: '🏔', desert: '🏜', medina: '🕌', geo: '✦', zellige: '◈', arch: '🏛', emerald: '💚', rose: '🌹', aurora: '✨', ocean: '🌊', royal: '👑', ramadan: '🏮', marble: '🤍', sand: '📜' };
  var TN = {
    ckb: ['ئاسمانی کاتەکە', 'شەوی ئەستێرەدار', 'چیای کوردستان', 'گردی بیابان', 'گومبەدی سەوز', 'ئەستێرەی زێڕین', 'کاشیی زەلیج', 'کەوانەی ئەندەلوس', 'مەڕمەڕی زمرد', 'زێڕی گوڵاوی', 'ئۆرۆرا', 'قووڵایی دەریا', 'مۆری شاهانە', 'فانووسی ڕەمەزان', 'مەڕمەڕی سپی', 'پەڕۆی کۆن'],
    en: ['Sky of the hour', 'Starry night', 'Kurdistan mountains', 'Desert dunes', 'Green dome', 'Golden star', 'Zellige tiles', 'Andalusian arches', 'Emerald marble', 'Rose gold', 'Aurora', 'Deep sea', 'Royal purple', 'Ramadan lanterns', 'White marble', 'Parchment'],
    ar: ['سماء الوقت', 'ليل مرصّع بالنجوم', 'جبال كردستان', 'كثبان الصحراء', 'القبة الخضراء', 'النجمة الذهبية', 'زليج', 'أقواس الأندلس', 'رخام زمردي', 'ذهب وردي', 'شفق قطبي', 'أعماق البحر', 'بنفسجي ملكي', 'فوانيس رمضان', 'رخام أبيض', 'رقّ قديم'],
    tr: ['Vaktin Göğü', 'Yıldızlı Gece', 'Kürdistan Dağları', 'Çöl Kumulları', 'Yeşil Kubbe', 'Altın Yıldız', 'Zellij Çini', 'Endülüs Kemerleri', 'Zümrüt Mermer', 'Gül Altını', 'Aurora', 'Derin Deniz', 'Kraliyet Moru', 'Ramazan Fenerleri', 'Beyaz Mermer', 'Parşömen'],
    fa: ['آسمان وقت', 'شب پرستاره', 'کوه‌های کردستان', 'تپه‌های بیابان', 'گنبد سبز', 'ستاره زرین', 'زلیج', 'طاق‌های اندلس', 'مرمر زمرد', 'طلای صورتی', 'شفق قطبی', 'اعماق دریا', 'بنفش سلطنتی', 'فانوس‌های رمضان', 'مرمر سفید', 'پوست‌نوشته'],
    ur: ['وقت کا آسمان', 'ستاروں بھری رات', 'کردستان کے پہاڑ', 'صحرائی ٹیلے', 'سبز گنبد', 'سنہری ستارہ', 'زلیج ٹائلیں', 'اندلسی محرابیں', 'زمردی سنگ مرمر', 'گلابی سونا', 'قطبی روشنی', 'گہرا سمندر', 'شاہی بنفشی', 'رمضان کے فانوس', 'سفید سنگ مرمر', 'قدیم ورق'],
    fr: ["Ciel de l'heure", 'Nuit étoilée', 'Montagnes du Kurdistan', 'Dunes du désert', 'Dôme vert', 'Étoile dorée', 'Zellige', 'Arcs andalous', 'Marbre émeraude', 'Or rose', 'Aurore polaire', 'Mer profonde', 'Violet royal', 'Lanternes du Ramadan', 'Marbre blanc', 'Parchemin'],
    ru: ['Небо часа', 'Звёздная ночь', 'Горы Курдистана', 'Дюны пустыни', 'Зелёный купол', 'Золотая звезда', 'Зеллидж', 'Андалусские арки', 'Изумрудный мрамор', 'Розовое золото', 'Северное сияние', 'Морская глубина', 'Королевский пурпур', 'Фонари Рамадана', 'Белый мрамор', 'Пергамент'],
    id: ['Langit Waktu Salat', 'Malam Berbintang', 'Pegunungan Kurdistan', 'Bukit Pasir Gurun', 'Kubah Hijau', 'Bintang Emas', 'Zelij', 'Lengkung Andalusia', 'Marmer Zamrud', 'Emas Mawar', 'Aurora', 'Laut Dalam', 'Ungu Kerajaan', 'Lentera Ramadan', 'Marmer Putih', 'Perkamen']
  };
  var PH = { ckb: ['باکگراوندەکان', 'کلاسیک'], en: ['Backgrounds', 'Classic'], ar: ['الخلفيات', 'كلاسيكي'], tr: ['Arka planlar', 'Klasik'], fa: ['پس‌زمینه‌ها', 'کلاسیک'], ur: ['پس منظر', 'کلاسیکی'], fr: ['Arrière-plans', 'Classique'], ru: ['Фоны', 'Классика'], id: ['Latar', 'Klasik'] };
  var CLASSIC = { green: '#176b4b', navy: '#1a365d', gold: '#8a6d3b', dark: '#111827', teal: '#0f766e' };

  function lang() { var l = window.appLang || ''; try { if (!l) l = localStorage.getItem('app_language') || ''; } catch (e) {} if (l === 'bad' || l === 'ku' || !l) l = 'ckb'; return TN[l] ? l : 'en'; }
  function nameOf(id) { return (TN[lang()] || TN.en)[IDS.indexOf(id)]; }

  /* ---------- building the CSS ---------- */
  function bgOf(th) {
    var L = th.layers, last = L.length - 1;
    return L.slice(0, last).concat([L[last] + ' ' + th.base]).join(',');
  }
  function css(th) {
    var V = 'body #salahView', h = '';
    h += V + '{background:' + bgOf(th) + ' !important;color:' + th.text + ' !important;position:relative;isolation:isolate;' + (th.dark ? 'text-shadow:0 1px 3px rgba(0,0,0,.28);' : '') + th.extra + '}';
    if (th.before) h += V + '::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;' + th.before + '}';
    if (th.after) h += V + '::after{content:"";position:absolute;z-index:-1;pointer-events:none;' + th.after + '}';
    h += V + ' .salah-hero{background:' + th.hero + ' !important;color:#fff !important;border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 30px rgba(0,0,0,.22);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);text-shadow:0 1px 3px rgba(0,0,0,.3)}';
    h += V + ' .salah-ring{border-color:' + th.ring + ' !important;border-top-color:' + th.accent + ' !important}';
    h += V + ' .salah-row{border-bottom-color:' + th.line + ' !important;background:' + th.rowbg + '}';
    h += V + ' .salah-row.current{background:' + th.cur + ' !important}';
    h += V + ' .salah-card{background:' + th.glass + ' !important;border-color:' + th.line + ' !important;color:' + th.text + ' !important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}';
    h += V + ' .salah-head b{color:' + th.text + '}';
    h += V + ' .salah-head .tab{background:' + th.glass + ';color:' + th.text + ';border:1px solid ' + th.line + '}';
    h += V + ' .salah-tabs{background:' + th.tabbg + ' !important;border-top-color:' + th.line + ' !important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}';
    h += V + ' .salah-tabs button{color:' + th.tabtxt + ' !important;text-shadow:none}';
    h += V + ' .salah-tabs button.on{background:' + th.tabon + ' !important;color:' + th.tabontxt + ' !important}';
    h += V + ' #ssNtfStatus{color:' + th.ok + ' !important}';
    h += V + ' select,' + V + ' input{color:#1f2a24;text-shadow:none}';
    h += V + ' .salah-prov-list,' + V + ' .salah-prov-list *{color:#1f2a24 !important;text-shadow:none}';
    h += '@keyframes sltw{from{opacity:.35}to{opacity:1}}@keyframes slsw{0%{transform:rotate(-2.2deg)}100%{transform:rotate(2.2deg)}}@keyframes slau{0%{background-position:0% 0%}100%{background-position:100% 100%}}';
    h += '@media (prefers-reduced-motion:reduce){' + V + '::before,' + V + '::after{animation:none !important}}';
    return h;
  }

  var el = null, lastKey = '';
  function clock() { var d = new Date(), t = d.getHours() + d.getMinutes() / 60; return t < 4.3 ? 5 : t < 6.3 ? 0 : t < 7.6 ? 1 : t < 15.3 ? 2 : t < 17.8 ? 3 : t < 19.6 ? 4 : 5; }
  var lastIdx = -1;
  function curIdx() {
    var rows = document.querySelectorAll('#salahBody .salah-row');
    if (rows.length) {
      for (var i = 0; i < rows.length; i++) if (rows[i].classList.contains('current')) { lastIdx = i; return i; }
      lastIdx = 5; return 5;
    }
    return lastIdx >= 0 ? lastIdx : clock();
  }
  function themeFor(id) {
    if (id === 'auto') return autoTheme(curIdx());
    return THEMES[id] ? THEMES[id]() : null;
  }
  function apply() {
    var id = ''; try { id = localStorage.getItem(KEY) || ''; } catch (e) {}
    var v = document.getElementById('salahView');
    var th = id ? themeFor(id) : null;
    if (!th) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null; lastKey = '';
      if (v) v.removeAttribute('data-bg');
      return;
    }
    var key = id + (id === 'auto' ? ':' + th.idx : '');
    if (key === lastKey && el && el.parentNode) { if (v) v.setAttribute('data-bg', id); return; }
    lastKey = key;
    if (!el) { el = document.createElement('style'); el.id = 'salahBgCss'; }
    el.textContent = css(th);
    document.head.appendChild(el); /* keep it after the classic theme style */
    if (v) v.setAttribute('data-bg', id);
  }

  /* ---------- picker in Prayer ▸ Settings ---------- */
  function injectPickerCss() {
    if (document.getElementById('salahBgPickCss')) return;
    var s = document.createElement('style'); s.id = 'salahBgPickCss';
    s.textContent = '#bgPicker{margin:6px 0 4px}#bgPicker .bgp-h{font-weight:700;font-size:13px;margin:10px 0 6px}#bgPicker .bgp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#bgPicker .bgp-it{border:0;background:transparent;padding:0;display:flex;flex-direction:column;align-items:center;gap:4px;font:inherit;color:inherit;cursor:pointer;text-shadow:none}#bgPicker .bgp-sw{width:100%;height:62px;border-radius:12px;border:2px solid rgba(128,128,128,.35);display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden;box-sizing:border-box}#bgPicker .bgp-it.on .bgp-sw{border-color:#e6b422;box-shadow:0 0 0 2px rgba(230,180,34,.45)}#bgPicker .bgp-n{font-size:11px;line-height:1.25;text-align:center}#bgPicker .bgp-grid.cl{grid-template-columns:repeat(5,1fr)}#bgPicker .cl .bgp-sw{height:34px;border-radius:10px}';
    document.head.appendChild(s);
  }
  function currentChoice() {
    var id = ''; try { id = localStorage.getItem(KEY) || ''; } catch (e) {}
    if (id) return id;
    try { return 'c:' + (JSON.parse(localStorage.getItem('salah_settings_v1') || '{}').theme || 'green'); } catch (e) { return 'c:green'; }
  }
  function buildPicker() {
    var sel = document.getElementById('ssTheme');
    if (!sel || document.getElementById('bgPicker')) return;
    injectPickerCss();
    var L = PH[lang()] || PH.en, cur = currentChoice();
    var h = '<div id="bgPicker"><div class="bgp-h">🎨 ' + L[0] + '</div><div class="bgp-grid">';
    IDS.forEach(function (id) {
      var th = id === 'auto' ? autoTheme(curIdx()) : THEMES[id]();
      h += '<button type="button" class="bgp-it' + (cur === id ? ' on' : '') + '" data-bg="' + id + '"><span class="bgp-sw" style="background:' + bgOf(th).replace(/"/g, '&quot;') + '">' + EMOJI[id] + '</span><span class="bgp-n">' + nameOf(id) + '</span></button>';
    });
    h += '</div><div class="bgp-h">' + L[1] + '</div><div class="bgp-grid cl">';
    Object.keys(CLASSIC).forEach(function (k) {
      h += '<button type="button" class="bgp-it' + (cur === 'c:' + k ? ' on' : '') + '" data-classic="' + k + '"><span class="bgp-sw" style="background:' + CLASSIC[k] + '"></span></button>';
    });
    h += '</div></div>';
    var row = sel.parentNode;
    row.style.display = 'none';
    row.parentNode.insertBefore(htmlNode(h), row.nextSibling);
  }
  function htmlNode(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('#bgPicker [data-bg],#bgPicker [data-classic]') : null;
    if (!b) return;
    var id = b.getAttribute('data-bg'), cl = b.getAttribute('data-classic');
    if (id) {
      try { localStorage.setItem(KEY, id); } catch (x) {}
      apply();
      var p = document.getElementById('bgPicker'); if (p) { p.querySelectorAll('.bgp-it').forEach(function (n) { n.classList.remove('on'); }); b.classList.add('on'); }
    } else if (cl) {
      try { localStorage.setItem(KEY, ''); } catch (x) {}
      apply();
      var sel = document.getElementById('ssTheme');
      if (sel) { sel.value = cl; sel.dispatchEvent(new Event('change')); } /* the classic handler saves the choice and re-opens the panel */
    }
  });

  function tick() { apply(); buildPicker(); }
  function start() {
    apply();
    new MutationObserver(function () { buildPicker(); if (!el && localStorage.getItem(KEY)) apply(); }).observe(document.body, { childList: true, subtree: true });
    setInterval(tick, 15000);
    var n = 0, iv = setInterval(function () {
      var f = window.enterSalah;
      if (typeof f === 'function' && !f.__bg) {
        var g = function () { var r = f.apply(this, arguments); setTimeout(apply, 350); setTimeout(apply, 1200); return r; };
        g.__bg = 1; window.enterSalah = g; clearInterval(iv);
      }
      if (++n > 60) clearInterval(iv);
    }, 500);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
