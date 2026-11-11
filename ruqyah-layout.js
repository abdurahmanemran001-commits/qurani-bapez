/* Ruqyah layout: separate sections (verses & duas / long audio / YouTube) and a settings gear in the header. */
(function () {
  if (window.__rqLayout) return; window.__rqLayout = 1;
  var SECS = [['cards', '📖 ئایەت و دوعاکان'], ['cont', '🎧 سەوتی تەواو'], ['yt', '📺 یوتیوب']];
  var cur = 'cards', busy = false, inited = false;
  var css = document.createElement('style');
  css.textContent = [
    '#rqSecBar{display:flex;gap:6px;margin:0 0 12px}',
    '#rqSecBar button{flex:1;border:1px solid #dce5e1;background:#fff;border-radius:12px;padding:10px 4px;font-size:13px;cursor:pointer;color:#18231f}',
    '#rqSecBar button.on{background:#e8f3ee;border-color:#b8d6c9;color:#176b4b;font-weight:bold}',
    '#rqGear{border:1px solid #dce5e1;background:#fff;border-radius:18px;padding:7px 11px;font-size:16px;cursor:pointer;margin-inline-end:6px}',
    '#rqSettingsBtn{display:none!important}',
    '#ruqyah[data-sec="cards"] #rqContPanel,#ruqyah[data-sec="cards"] #rqYtPanel{display:none!important}',
    '#ruqyah[data-sec="cont"] .rq-note,#ruqyah[data-sec="cont"] .rq-tabs,#ruqyah[data-sec="cont"] .rq-card,#ruqyah[data-sec="cont"] #rqReciterBar,#ruqyah[data-sec="cont"] #rqYtPanel,#ruqyah[data-sec="cont"] .rq-sizerow{display:none!important}',
    '#ruqyah[data-sec="yt"] .rq-note,#ruqyah[data-sec="yt"] .rq-tabs,#ruqyah[data-sec="yt"] .rq-card,#ruqyah[data-sec="yt"] #rqReciterBar,#ruqyah[data-sec="yt"] #rqContPanel,#ruqyah[data-sec="yt"] .rq-sizerow{display:none!important}'
  ].join('\n');
  document.head.appendChild(css);

  function apply() {
    var v = document.getElementById('ruqyah'); if (!v || busy) return;
    var head = v.querySelector('.rq-head'); if (!head) return;
    busy = true;
    try {
      v.setAttribute('data-sec', cur);
      var hs = v.querySelectorAll('.rq-head'); if (hs[1]) hs[1].classList.add('rq-sizerow');
      var bar = document.getElementById('rqSecBar');
      if (!bar) {
        bar = document.createElement('div'); bar.id = 'rqSecBar';
        bar.innerHTML = SECS.map(function (s) { return '<button type="button" data-rs="' + s[0] + '">' + s[1] + '</button>'; }).join('');
        bar.addEventListener('click', function (e) {
          var b = e.target.closest('[data-rs]'); if (!b) return;
          cur = b.getAttribute('data-rs'); apply();
          var m = v.closest('.main'); if (m) m.scrollTop = 0;
        });
        head.parentNode.insertBefore(bar, head.nextSibling);
      }
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-rs') === cur); });
      if (!document.getElementById('rqGear')) {
        var g = document.createElement('button'); g.type = 'button'; g.id = 'rqGear'; g.textContent = '⚙'; g.title = 'ڕێکخستن';
        g.onclick = function (e) { e.stopPropagation(); var b = document.getElementById('rqSettingsBtn'); if (b) b.click(); };
        var back = head.querySelector('.rq-back'); var box = document.createElement('div'); box.style.cssText = 'display:flex;align-items:center';
        if (back) { head.replaceChild(box, back); box.appendChild(g); box.appendChild(back); } else head.appendChild(g);
      }
      var sw = document.getElementById('rqSettingsWrap');
      if (sw && sw.previousSibling !== bar) bar.parentNode.insertBefore(sw, bar.nextSibling);
      if (!inited && sw) { inited = true; var p = document.getElementById('rqSettingsPanel'); if (p && p.classList.contains('open')) { var sb = document.getElementById('rqSettingsBtn'); if (sb) sb.click(); } }
    } finally { setTimeout(function () { busy = false; }, 0); }
  }
  var t = null;
  function sched() { clearTimeout(t); t = setTimeout(apply, 120); }
  function boot() {
    var v = document.getElementById('ruqyah');
    if (!v) return false;
    new MutationObserver(sched).observe(v, { childList: true });
    sched(); return true;
  }
  var n = 0, iv = setInterval(function () {
    var v = document.getElementById('ruqyah');
    if (v && !v.__rqL) { v.__rqL = 1; boot(); }
    if (++n > 120) clearInterval(iv);
  }, 500);
  document.addEventListener('click', function () { if (document.getElementById('ruqyah')) { inited = inited; sched(); } }, true);
})();

/* Ruqyah language: the verse translations, hadith notes and guidance texts are written in Kurdish inside ruqyah.js.
 * When the app language is not Kurdish, swap them (by position) for the chosen language.
 * ar  = Arabic notes/guidance (the Kurdish translation line is hidden, the Arabic text is already shown)
 * en and every other language without its own text yet = English
 * ckb = original Kurdish, bad = left to the Badini tables in ruqyah-i18n.js */
(function () {
  if (window.__rqLang) return; window.__rqLang = 1;
  var FATIHA_EN = 'In the name of Allah, the Most Gracious, the Most Merciful. Praise be to Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not of those who earned Your anger, nor of those who went astray.';
  var SHIFA_EN = 'O Allah, Lord of mankind, remove the harm and heal — You are the Healer. There is no healing except Your healing, a healing that leaves no illness behind.';
  var HAND_EN = 'In the name of Allah (three times), then seven times: I seek refuge in Allah and in His power from the evil of what I feel and fear.';
  var WORDS_EN = 'I seek refuge in the perfect words of Allah from the evil of what He has created.';
  var JIBRIL_EN = 'In the name of Allah I perform ruqyah for you, from everything that harms you, from the evil of every soul or envious eye. May Allah heal you. In the name of Allah I perform ruqyah for you.';
  var EN = {
    ku: [
      FATIHA_EN,
      'Allah — there is no god but Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is there that can intercede with Him except by His permission? He knows what is before them and what is behind them, and they encompass nothing of His knowledge except what He wills. His Throne extends over the heavens and the earth, and preserving them does not tire Him. He is the Most High, the Almighty.',
      'The Messenger believes in what was sent down to him from his Lord, and so do the believers. All of them believe in Allah, His angels, His books and His messengers: “We make no distinction between any of His messengers.” And they say: “We hear and we obey. Your forgiveness, our Lord, and to You is the final return.” (285)\nAllah does not burden a soul beyond its capacity. It will have what it has earned, and it will bear what it has earned. “Our Lord, do not hold us accountable if we forget or make a mistake. Our Lord, do not place on us a burden like the one You placed on those before us. Our Lord, do not burden us with what we have no strength to bear. Pardon us, forgive us, and have mercy on us. You are our Protector, so help us against the disbelieving people.” (286)',
      'Say: He is Allah, the One. Allah, the Self-Sufficient, upon whom all depend. He neither begets nor was begotten, and there is none comparable to Him.',
      'Say: I seek refuge in the Lord of the daybreak, from the evil of what He has created, from the evil of the darkness when it settles, from the evil of those who blow on knots (practicing witchcraft), and from the evil of an envier when he envies.',
      'Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the sneaking whisperer, who whispers into the hearts of mankind, from among jinn and mankind.',
      JIBRIL_EN,
      SHIFA_EN,
      HAND_EN,
      'In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
      WORDS_EN,
      'I seek protection for you both with the perfect words of Allah, from every devil and every harmful creature, and from every evil eye.',
      'It is as Allah wills; there is no power except with Allah.',
      'O Allah, bless him.',
      JIBRIL_EN,
      'No harm — a purification, if Allah wills.',
      'I ask Allah the Almighty, Lord of the Mighty Throne, to heal you.',
      SHIFA_EN,
      HAND_EN,
      'There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Mighty Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the noble Throne.',
      'I seek refuge in the perfect words of Allah from His anger and punishment, from the evil of His servants, from the whisperings of the devils, and from their presence near me.',
      'I seek refuge in Allah from Satan, the accursed.',
      'Allah is sufficient for us, and He is the best Disposer of affairs.',
      WORDS_EN
    ],
    how: [
      'A companion recited Al-Fatihah over a man who had been bitten, and he recovered. The Prophet ﷺ asked: “How did you know it was a ruqyah?” (Bukhari and Muslim)',
      'Recite it before sleeping: “A guardian from Allah will remain with you, and Satan will not come near you until morning.” (Bukhari)',
      '“Whoever recites these two verses at night, they will suffice him.” (Bukhari and Muslim)',
      'Every night before sleeping, the Prophet ﷺ would cup his hands together, blow into them, recite this surah, Al-Falaq and An-Nas, then wipe over his body with his hands, three times. (Bukhari)',
      'Three times in the morning, evening, and before sleep.',
      'Three times in the morning, evening, and before sleep.',
      'Jibril recited this for the Prophet ﷺ when he was ill.',
      'The Prophet ﷺ would pass his right hand over the sick person while saying this. For another man, say “اشْفِهِ” (heal him).',
      'Place your hand on the place of pain, say “Bismillah” three times, then recite this supplication seven times.',
      'Whoever says it three times in the morning and three times in the evening will not be harmed by anything.',
      'Whoever stops at a place (while traveling or on a journey) and says this will not be harmed by anything until he leaves that place.',
      'The Prophet ﷺ used these words to protect Al-Hasan and Al-Husayn.',
      'Say it when you see something you like, or something in your own family and wealth.',
      'If one of you sees something in his brother that impresses him, let him pray for blessing for him. (The evil eye is real, and this supplication protects against it.)',
      'Also recite Al-Falaq, An-Nas, and Al-Fatihah.',
      'When the Prophet ﷺ visited a sick person, he would say this.',
      'Whoever visits a sick person whose time of death has not yet come and says this seven times, Allah will heal him.',
      '',
      '',
      'The Prophet ﷺ would say this in times of distress.',
      'Say it when you wake up startled or frightened in your sleep.',
      'The Prophet ﷺ said: if an angry person says this, his anger will leave him.',
      'Ibrahim (peace be upon him) said this when he was thrown into the fire, and the Prophet ﷺ said it in times of fear.',
      ''
    ],
    guide: [
      'Reciting the Quran, the names of Allah and the Prophetic supplications to seek healing and protection from illness, the evil eye, envy and the evil of Satan — with the belief that the only Healer is Allah and that ruqyah is merely a means.',
      'The Prophet ﷺ said: “Show me your ruqyahs; there is no harm in ruqyah as long as it contains no shirk.” (Sahih Muslim)\nSo: 1) It must be only with the Quran, the names of Allah and permissible supplications. 2) It must be in a language whose meaning is understood. 3) Believe that ruqyah itself has no power and that Allah is the One who heals.',
      'Recite the verses and supplications, gently blow lightly (without excess saliva) into your hands or toward the sick person, and pass your hands over the body, starting from the head and face. (The Prophet ﷺ did this — Sahih al-Bukhari.) If there is a place of pain, put your hand on it.',
      'Morning, evening and before sleep. The home is also protected by reciting Surah Al-Baqarah: “Satan flees from the house in which Surah Al-Baqarah is recited.” (Sahih Muslim)',
      'Stay away from sorcerers, fortune-tellers and those who ask for unknown things, special names and pictures, or large sums of money. The Prophet ﷺ said: “Whoever goes to a fortune-teller and asks him about anything, his prayer will not be accepted for forty nights.” (Sahih Muslim)\nDo not hang unknown amulets or writings, and do not place them in the home for any purpose.',
      'The Prophet ﷺ said: “O servants of Allah, seek treatment; for Allah has not created any disease without creating a cure for it.” (Sunan Abi Dawud and at-Tirmidhi)\nRuqyah does not replace the doctor. If symptoms persist (fear, depression, sleeplessness, pain), see a doctor; there is often a medical cause.',
      'This section is for reminder and learning and does not replace qualified scholars. For specific cases, ask a trustworthy scholar. The Kurdish translations should be reviewed by qualified people.'
    ],
    note: 'Ruqyah is only with the Quran and authentic supplications from the Sunnah; it does not replace a doctor. See “Guidance” for more.',
    secs: { cards: '📖 Verses & Duas', cont: '🎧 Full recitation', yt: '📺 YouTube' }
  };
  var AR = {
    how: [
      'قرأ أحد الصحابة الفاتحة على رجل لُدغ فشُفي، فقال النبي ﷺ: «وما أدراك أنها رقية؟» (البخاري ومسلم)',
      'اقرأها قبل النوم: «لا يزال عليك من الله حافظ، ولا يقربك شيطان حتى تصبح». (البخاري)',
      '«من قرأ هاتين الآيتين في ليلة كفتاه». (البخاري ومسلم)',
      'كان النبي ﷺ إذا أوى إلى فراشه كل ليلة جمع كفيه، ونفث فيهما، وقرأ الإخلاص والفلق والناس، ثم مسح بهما ما استطاع من جسده، ثلاث مرات. (البخاري)',
      'ثلاث مرات صباحًا ومساءً وقبل النوم.',
      'ثلاث مرات صباحًا ومساءً وقبل النوم.',
      'قرأ جبريل هذا على النبي ﷺ حين مرض.',
      'كان النبي ﷺ يمسح بيده اليمنى على المريض ويقول هذا الدعاء. وللرجل الآخر قل: «اشفه».',
      'ضع يدك على موضع الألم، وقل «بسم الله» ثلاث مرات، ثم اقرأ هذا الدعاء سبع مرات.',
      'من قالها ثلاث مرات صباحًا ومساءً لم يضره شيء.',
      'من نزل منزلًا (في سفر أو رحلة) فقال هذا لم يضره شيء حتى يرتحل من منزله ذلك.',
      'كان النبي ﷺ يعوّذ الحسن والحسين بهذه الكلمات.',
      'تُقال عند رؤية شيء يعجبك، أو شيء من أهلك ومالك.',
      'إذا رأى أحدكم من أخيه ما يعجبه فليدعُ له بالبركة. (العين حق، وبهذا الدعاء يُتقى ضررها.)',
      'اقرأ معها سورتي الفلق والناس والفاتحة.',
      'كان النبي ﷺ يقول هذا عندما يزور مريضًا.',
      'من عاد مريضًا لم يحضر أجله فقال هذا سبع مرات عافاه الله.',
      '',
      '',
      'كان النبي ﷺ يقول هذا عند الكرب.',
      'تُقال إذا استيقظت فزعًا أو خائفًا في نومك.',
      'قال النبي ﷺ إن الغضبان إذا قالها ذهب عنه غضبه.',
      'قالها إبراهيم عليه السلام حين أُلقي في النار، وقالها النبي ﷺ عند الخوف.',
      ''
    ],
    guide: [
      'قراءة القرآن وأسماء الله والأدعية النبوية لطلب الشفاء والحماية من المرض والعين والحسد وشر الشيطان، مع الاعتقاد بأن الشافي هو الله وحده وأن الرقية مجرد سبب.',
      'قال النبي ﷺ: «اعرضوا عليّ رقاكم، لا بأس بالرقى ما لم يكن فيه شرك.» (مسلم)\nلذلك: ١) تكون بالقرآن وأسماء الله والأدعية المشروعة فقط. ٢) بلسان يُفهم معناه. ٣) اعتقد أن الرقية لا تنفع بذاتها وأن الله هو الشافي.',
      'اقرأ الآيات والأدعية، وانفث نفثًا خفيفًا بهدوء (دون كثرة ريق) في كفيك أو على المريض، وامسح بيديك على الجسد مبتدئًا من الرأس والوجه. (كان النبي ﷺ يفعل ذلك — البخاري). وإذا كان هناك موضع ألم فضع يدك عليه.',
      'صباحًا ومساءً وقبل النوم. ويُحفظ البيت كذلك بقراءة سورة البقرة: «إن الشيطان ينفر من البيت الذي تُقرأ فيه سورة البقرة.» (مسلم)',
      'ابتعد عن السحرة والعرّافين ومن يطلبون أمورًا مجهولة أو أسماءً وصورًا خاصة أو مبالغ كبيرة. قال النبي ﷺ: «من أتى عرّافًا فسأله عن شيء لم تُقبل له صلاة أربعين ليلة.» (مسلم)\nولا تعلّق تمائم أو مكتوبات مجهولة، ولا تضعها في البيت لأي غرض.',
      'قال النبي ﷺ: «تداووا عباد الله، فإن الله لم يضع داءً إلا وضع له دواءً.» (أبو داود والترمذي)\nالرقية لا تغني عن الطبيب. إذا استمرت الأعراض (خوف، اكتئاب، أرق، ألم) فراجع الطبيب؛ فكثيرًا ما يكون لها سبب طبي.',
      'هذا القسم للتذكير والتعلم ولا يغني عن العلماء الشرعيين. للحالات الخاصة اسأل عالمًا موثوقًا. ويجب أن تُراجع الترجمات الكردية من قبل أهل الاختصاص.'
    ],
    note: 'الرقية تكون بالقرآن والأدعية الصحيحة من السنة فقط، ولا تغني عن الطبيب. للمزيد راجع «الإرشادات».',
    secs: { cards: '📖 الآيات والأدعية', cont: '🎧 التلاوة الكاملة', yt: '📺 يوتيوب' }
  };

  function getLang() {
    var l = '';
    try { l = localStorage.getItem('app_language') || ''; } catch (e) {}
    return l || window.appLang || document.documentElement.lang || 'ckb';
  }
  function setText(el, txt) {
    if (!el) return;
    if (el.__k0 === undefined) el.__k0 = el.textContent;
    el.__rq = 1;
    if (el.textContent !== txt) el.textContent = txt;
  }
  function restore(el) {
    if (el && el.__rq && el.__k0 !== undefined) { el.textContent = el.__k0; el.__rq = 0; }
  }

  function apply() {
    var v = document.getElementById('ruqyah'); if (!v) return;
    var l = getLang();
    var kurdish = (l === 'ckb' || l === 'bad' || l === 'ku');
    var P = kurdish ? null : (l === 'ar' ? AR : EN);
    var i;

    var cards = v.querySelectorAll('.rq-card');
    for (i = 0; i < cards.length; i++) {
      var c = cards[i], idx = Number(c.getAttribute('data-i'));
      var ku = c.querySelector('.rq-ku'), how = c.querySelector('.rq-how');
      if (!P) { restore(ku); restore(how); if (ku) ku.style.display = ''; continue; }
      if (ku) {
        if (l === 'ar') ku.style.display = 'none';
        else { ku.style.display = ''; if (EN.ku[idx]) setText(ku, EN.ku[idx]); }
      }
      if (how && P.how[idx]) setText(how, P.how[idx]);
    }

    var gs = v.querySelectorAll('.rq-g');
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].querySelector('p');
      if (!P) restore(p); else if (P.guide[i]) setText(p, P.guide[i]);
    }

    var note = v.querySelector('.rq-note');
    if (note) { if (!P) restore(note); else setText(note, P.note); }

    var bs = v.querySelectorAll('#rqSecBar button[data-rs]');
    for (i = 0; i < bs.length; i++) {
      var k = bs[i].getAttribute('data-rs');
      if (!P) restore(bs[i]); else if (P.secs[k]) setText(bs[i], P.secs[k]);
    }
  }

  var tm = null;
  function sched() { clearTimeout(tm); tm = setTimeout(apply, 150); }
  function boot() {
    var v = document.getElementById('ruqyah');
    if (!v || v.__rqLg) return;
    v.__rqLg = 1;
    new MutationObserver(sched).observe(v, { childList: true });
    sched();
  }
  var n = 0, iv = setInterval(function () { boot(); if (++n > 240) clearInterval(iv); }, 500);
  document.addEventListener('click', sched, true);
})();
