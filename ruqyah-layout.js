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
 * Languages with a full pack: en, ar, tr, fa, ur, fr, ru, id.
 *   ar = Arabic notes/guidance (the Kurdish translation line is hidden, the Arabic text is already shown)
 * ckb = original Kurdish, bad = left to the Badini tables in ruqyah-i18n.js
 * Pack layout: k = verse/dua meanings (20), h = hadith/usage notes (20), g = guidance (7), n = top note, s = section buttons. */
(function () {
  if (window.__rqLang) return; window.__rqLang = 1;

  /* item index (0..23, order of ITEMS in ruqyah.js) -> text index inside the pack */
  var KUMAP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 6, 14, 15, 7, 8, 16, 17, 18, 19, 10];
  var HMAP = [0, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, -1, -1, 16, 17, 18, 19, -1];

  var PK = {};

  PK.en = {
    k: [
      `In the name of Allah, the Most Gracious, the Most Merciful. Praise be to Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path — the path of those You have blessed, not of those who earned Your anger, nor of those who went astray.`,
      `Allah — there is no god but Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is there that can intercede with Him except by His permission? He knows what is before them and what is behind them, and they encompass nothing of His knowledge except what He wills. His Throne extends over the heavens and the earth, and preserving them does not tire Him. He is the Most High, the Almighty.`,
      `The Messenger believes in what was sent down to him from his Lord, and so do the believers. All of them believe in Allah, His angels, His books and His messengers: “We make no distinction between any of His messengers.” And they say: “We hear and we obey. Your forgiveness, our Lord, and to You is the final return.” (285)\nAllah does not burden a soul beyond its capacity. It will have what it has earned, and it will bear what it has earned. “Our Lord, do not hold us accountable if we forget or make a mistake. Our Lord, do not place on us a burden like the one You placed on those before us. Our Lord, do not burden us with what we have no strength to bear. Pardon us, forgive us, and have mercy on us. You are our Protector, so help us against the disbelieving people.” (286)`,
      `Say: He is Allah, the One. Allah, the Self-Sufficient, upon whom all depend. He neither begets nor was begotten, and there is none comparable to Him.`,
      `Say: I seek refuge in the Lord of the daybreak, from the evil of what He has created, from the evil of the darkness when it settles, from the evil of those who blow on knots (practicing witchcraft), and from the evil of an envier when he envies.`,
      `Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the sneaking whisperer, who whispers into the hearts of mankind, from among jinn and mankind.`,
      `In the name of Allah I perform ruqyah for you, from everything that harms you, from the evil of every soul or envious eye. May Allah heal you. In the name of Allah I perform ruqyah for you.`,
      `O Allah, Lord of mankind, remove the harm and heal — You are the Healer. There is no healing except Your healing, a healing that leaves no illness behind.`,
      `In the name of Allah (three times), then seven times: I seek refuge in Allah and in His power from the evil of what I feel and fear.`,
      `In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.`,
      `I seek refuge in the perfect words of Allah from the evil of what He has created.`,
      `I seek protection for you both with the perfect words of Allah, from every devil and every harmful creature, and from every evil eye.`,
      `It is as Allah wills; there is no power except with Allah.`,
      `O Allah, bless him.`,
      `No harm — a purification, if Allah wills.`,
      `I ask Allah the Almighty, Lord of the Mighty Throne, to heal you.`,
      `There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Mighty Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the noble Throne.`,
      `I seek refuge in the perfect words of Allah from His anger and punishment, from the evil of His servants, from the whisperings of the devils, and from their presence near me.`,
      `I seek refuge in Allah from Satan, the accursed.`,
      `Allah is sufficient for us, and He is the best Disposer of affairs.`
    ],
    h: [
      `A companion recited Al-Fatihah over a man who had been bitten, and he recovered. The Prophet ﷺ asked: “How did you know it was a ruqyah?” (Bukhari and Muslim)`,
      `Recite it before sleeping: “A guardian from Allah will remain with you, and Satan will not come near you until morning.” (Bukhari)`,
      `“Whoever recites these two verses at night, they will suffice him.” (Bukhari and Muslim)`,
      `Every night before sleeping, the Prophet ﷺ would cup his hands together, blow into them, recite this surah, Al-Falaq and An-Nas, then wipe over his body with his hands, three times. (Bukhari)`,
      `Three times in the morning, evening, and before sleep.`,
      `Jibril recited this for the Prophet ﷺ when he was ill.`,
      `The Prophet ﷺ would pass his right hand over the sick person while saying this. For another man, say “اشْفِهِ” (heal him).`,
      `Place your hand on the place of pain, say “Bismillah” three times, then recite this supplication seven times.`,
      `Whoever says it three times in the morning and three times in the evening will not be harmed by anything.`,
      `Whoever stops at a place (while traveling or on a journey) and says this will not be harmed by anything until he leaves that place.`,
      `The Prophet ﷺ used these words to protect Al-Hasan and Al-Husayn.`,
      `Say it when you see something you like, or something in your own family and wealth.`,
      `If one of you sees something in his brother that impresses him, let him pray for blessing for him. (The evil eye is real, and this supplication protects against it.)`,
      `Also recite Al-Falaq, An-Nas, and Al-Fatihah.`,
      `When the Prophet ﷺ visited a sick person, he would say this.`,
      `Whoever visits a sick person whose time of death has not yet come and says this seven times, Allah will heal him.`,
      `The Prophet ﷺ would say this in times of distress.`,
      `Say it when you wake up startled or frightened in your sleep.`,
      `The Prophet ﷺ said: if an angry person says this, his anger will leave him.`,
      `Ibrahim (peace be upon him) said this when he was thrown into the fire, and the Prophet ﷺ said it in times of fear.`
    ],
    g: [
      `Reciting the Quran, the names of Allah and the Prophetic supplications to seek healing and protection from illness, the evil eye, envy and the evil of Satan — with the belief that the only Healer is Allah and that ruqyah is merely a means.`,
      `The Prophet ﷺ said: “Show me your ruqyahs; there is no harm in ruqyah as long as it contains no shirk.” (Sahih Muslim)\nSo: 1) It must be only with the Quran, the names of Allah and permissible supplications. 2) It must be in a language whose meaning is understood. 3) Believe that ruqyah itself has no power and that Allah is the One who heals.`,
      `Recite the verses and supplications, gently blow lightly (without excess saliva) into your hands or toward the sick person, and pass your hands over the body, starting from the head and face. (The Prophet ﷺ did this — Sahih al-Bukhari.) If there is a place of pain, put your hand on it.`,
      `Morning, evening and before sleep. The home is also protected by reciting Surah Al-Baqarah: “Satan flees from the house in which Surah Al-Baqarah is recited.” (Sahih Muslim)`,
      `Stay away from sorcerers, fortune-tellers and those who ask for unknown things, special names and pictures, or large sums of money. The Prophet ﷺ said: “Whoever goes to a fortune-teller and asks him about anything, his prayer will not be accepted for forty nights.” (Sahih Muslim)\nDo not hang unknown amulets or writings, and do not place them in the home for any purpose.`,
      `The Prophet ﷺ said: “O servants of Allah, seek treatment; for Allah has not created any disease without creating a cure for it.” (Sunan Abi Dawud and at-Tirmidhi)\nRuqyah does not replace the doctor. If symptoms persist (fear, depression, sleeplessness, pain), see a doctor; there is often a medical cause.`,
      `This section is for reminder and learning and does not replace qualified scholars. For specific cases, ask a trustworthy scholar. The Kurdish translations should be reviewed by qualified people.`
    ],
    n: `Ruqyah is only with the Quran and authentic supplications from the Sunnah; it does not replace a doctor. See “Guidance” for more.`,
    s: { cards: `📖 Verses & Duas`, cont: `🎧 Full recitation`, yt: `📺 YouTube` }
  };

  PK.ar = {
    k: [],
    h: [
      `قرأ أحد الصحابة الفاتحة على رجل لُدغ فشُفي، فقال النبي ﷺ: «وما أدراك أنها رقية؟» (البخاري ومسلم)`,
      `اقرأها قبل النوم: «لا يزال عليك من الله حافظ، ولا يقربك شيطان حتى تصبح». (البخاري)`,
      `«من قرأ هاتين الآيتين في ليلة كفتاه». (البخاري ومسلم)`,
      `كان النبي ﷺ إذا أوى إلى فراشه كل ليلة جمع كفيه، ونفث فيهما، وقرأ الإخلاص والفلق والناس، ثم مسح بهما ما استطاع من جسده، ثلاث مرات. (البخاري)`,
      `ثلاث مرات صباحًا ومساءً وقبل النوم.`,
      `قرأ جبريل هذا على النبي ﷺ حين مرض.`,
      `كان النبي ﷺ يمسح بيده اليمنى على المريض ويقول هذا الدعاء. وللرجل الآخر قل: «اشفه».`,
      `ضع يدك على موضع الألم، وقل «بسم الله» ثلاث مرات، ثم اقرأ هذا الدعاء سبع مرات.`,
      `من قالها ثلاث مرات صباحًا ومساءً لم يضره شيء.`,
      `من نزل منزلًا (في سفر أو رحلة) فقال هذا لم يضره شيء حتى يرتحل من منزله ذلك.`,
      `كان النبي ﷺ يعوّذ الحسن والحسين بهذه الكلمات.`,
      `تُقال عند رؤية شيء يعجبك، أو شيء من أهلك ومالك.`,
      `إذا رأى أحدكم من أخيه ما يعجبه فليدعُ له بالبركة. (العين حق، وبهذا الدعاء يُتقى ضررها.)`,
      `اقرأ معها سورتي الفلق والناس والفاتحة.`,
      `كان النبي ﷺ يقول هذا عندما يزور مريضًا.`,
      `من عاد مريضًا لم يحضر أجله فقال هذا سبع مرات عافاه الله.`,
      `كان النبي ﷺ يقول هذا عند الكرب.`,
      `تُقال إذا استيقظت فزعًا أو خائفًا في نومك.`,
      `قال النبي ﷺ إن الغضبان إذا قالها ذهب عنه غضبه.`,
      `قالها إبراهيم عليه السلام حين أُلقي في النار، وقالها النبي ﷺ عند الخوف.`
    ],
    g: [
      `قراءة القرآن وأسماء الله والأدعية النبوية لطلب الشفاء والحماية من المرض والعين والحسد وشر الشيطان، مع الاعتقاد بأن الشافي هو الله وحده وأن الرقية مجرد سبب.`,
      `قال النبي ﷺ: «اعرضوا عليّ رقاكم، لا بأس بالرقى ما لم يكن فيه شرك.» (مسلم)\nلذلك: ١) تكون بالقرآن وأسماء الله والأدعية المشروعة فقط. ٢) بلسان يُفهم معناه. ٣) اعتقد أن الرقية لا تنفع بذاتها وأن الله هو الشافي.`,
      `اقرأ الآيات والأدعية، وانفث نفثًا خفيفًا بهدوء (دون كثرة ريق) في كفيك أو على المريض، وامسح بيديك على الجسد مبتدئًا من الرأس والوجه. (كان النبي ﷺ يفعل ذلك — البخاري). وإذا كان هناك موضع ألم فضع يدك عليه.`,
      `صباحًا ومساءً وقبل النوم. ويُحفظ البيت كذلك بقراءة سورة البقرة: «إن الشيطان ينفر من البيت الذي تُقرأ فيه سورة البقرة.» (مسلم)`,
      `ابتعد عن السحرة والعرّافين ومن يطلبون أمورًا مجهولة أو أسماءً وصورًا خاصة أو مبالغ كبيرة. قال النبي ﷺ: «من أتى عرّافًا فسأله عن شيء لم تُقبل له صلاة أربعين ليلة.» (مسلم)\nولا تعلّق تمائم أو مكتوبات مجهولة، ولا تضعها في البيت لأي غرض.`,
      `قال النبي ﷺ: «تداووا عباد الله، فإن الله لم يضع داءً إلا وضع له دواءً.» (أبو داود والترمذي)\nالرقية لا تغني عن الطبيب. إذا استمرت الأعراض (خوف، اكتئاب، أرق، ألم) فراجع الطبيب؛ فكثيرًا ما يكون لها سبب طبي.`,
      `هذا القسم للتذكير والتعلم ولا يغني عن العلماء الشرعيين. للحالات الخاصة اسأل عالمًا موثوقًا. ويجب أن تُراجع الترجمات الكردية من قبل أهل الاختصاص.`
    ],
    n: `الرقية تكون بالقرآن والأدعية الصحيحة من السنة فقط، ولا تغني عن الطبيب. للمزيد راجع «الإرشادات».`,
    s: { cards: `📖 الآيات والأدعية`, cont: `🎧 التلاوة الكاملة`, yt: `📺 يوتيوب` }
  };

  PK.tr = {
    k: [
      `Rahman ve Rahim olan Allah'ın adıyla. Hamd, âlemlerin Rabbi Allah'a mahsustur. O Rahman'dır, Rahim'dir. Din gününün sahibidir. Yalnız sana kulluk eder ve yalnız senden yardım dileriz. Bizi doğru yola ilet; kendilerine nimet verdiklerinin yoluna, gazaba uğrayanların ve sapmışların yoluna değil.`,
      `Allah, kendisinden başka ilah yoktur; O, ezelî ve ebedî diridir, her şeyi ayakta tutandır. Kendisini ne uyuklama tutar ne de uyku. Göklerde ve yerde ne varsa O'nundur. İzni olmadan O'nun katında kim şefaatte bulunabilir? O, kulların önlerindekini ve arkalarındakini bilir. Onlar, O'nun dilediği kadarından başka ilminden hiçbir şeyi kavrayamazlar. O'nun kürsüsü gökleri ve yeri kaplamıştır; onları korumak O'na ağır gelmez. O, yücedir, büyüktür.`,
      `Peygamber, Rabbinden kendisine indirilene iman etti, müminler de. Hepsi Allah'a, meleklerine, kitaplarına ve peygamberlerine iman etti: “O'nun peygamberlerinden hiçbirini ayırt etmeyiz.” Dediler ki: “İşittik ve itaat ettik. Rabbimiz, bağışlamanı dileriz; dönüş sanadır.” (285)\nAllah hiç kimseye gücünün yeteceğinden fazlasını yüklemez. Kazandığı iyilik kendi lehine, yaptığı kötülük kendi aleyhinedir. “Rabbimiz, unutursak veya yanılırsak bizi sorumlu tutma. Rabbimiz, bizden öncekilere yüklediğin gibi ağır bir yük yükleme. Rabbimiz, gücümüzün yetmediği şeyi bize taşıtma. Bizi affet, bizi bağışla, bize merhamet et. Sen bizim Mevlamızsın; kâfirler topluluğuna karşı bize yardım et.” (286)`,
      `De ki: O, Allah'tır, tektir. Allah Samed'dir (her şey O'na muhtaçtır, O hiçbir şeye muhtaç değildir). Doğurmamış ve doğurulmamıştır. Hiçbir şey O'na denk değildir.`,
      `De ki: Yarattığı şeylerin şerrinden, karanlığı çöktüğünde gecenin şerrinden, düğümlere üfleyenlerin (büyücülerin) şerrinden ve haset ettiği zaman hasetçinin şerrinden, sabahın Rabbine sığınırım.`,
      `De ki: İnsanların Rabbine, insanların Melikine, insanların İlahına; cinlerden ve insanlardan olup insanların kalplerine vesvese veren sinsi vesvesecinin şerrinden sığınırım.`,
      `Allah'ın adıyla sana rukye yapıyorum; seni üzen her şeyden, her nefsin ve haset eden gözün şerrinden. Allah sana şifa versin. Allah'ın adıyla sana rukye yapıyorum.`,
      `Allah'ım, ey insanların Rabbi! Sıkıntıyı gider, şifa ver; şifa veren sensin. Senin şifandan başka şifa yoktur; hiçbir hastalık bırakmayan bir şifa ver.`,
      `Allah'ın adıyla (üç kez), sonra yedi kez: Hissettiğim ve korktuğum şeyin şerrinden Allah'a ve O'nun kudretine sığınırım.`,
      `Allah'ın adıyla ki O'nun adıyla birlikte yerde ve gökte hiçbir şey zarar veremez; O, işitendir, bilendir.`,
      `Allah'ın yarattığı şeylerin şerrinden, Allah'ın eksiksiz kelimelerine sığınırım.`,
      `İkinizi de Allah'ın eksiksiz kelimeleriyle her şeytandan, her zararlı canlıdan ve her kem gözden korumasına emanet ederim.`,
      `Allah'ın dilediği olur; güç ancak Allah'tandır.`,
      `Allah'ım, ona bereket ver.`,
      `Zararı yok, inşallah arındırıcıdır.`,
      `Büyük Allah'tan, büyük Arş'ın Rabbinden sana şifa vermesini dilerim.`,
      `Yüce ve halim olan Allah'tan başka ilah yoktur. Büyük Arş'ın Rabbi Allah'tan başka ilah yoktur. Göklerin Rabbi, yerin Rabbi ve kerim Arş'ın Rabbi Allah'tan başka ilah yoktur.`,
      `Allah'ın gazabından, azabından, kullarının şerrinden, şeytanların vesveselerinden ve yanımda bulunmalarından Allah'ın eksiksiz kelimelerine sığınırım.`,
      `Kovulmuş şeytandan Allah'a sığınırım.`,
      `Allah bize yeter, O ne güzel vekildir.`
    ],
    h: [
      `Bir sahabi, yılan veya akrep sokmuş bir adama Fâtiha'yı okudu ve adam iyileşti. Peygamber ﷺ: “Bunun bir rukye olduğunu nereden bildin?” buyurdu. (Buhârî ve Müslim)`,
      `Uyumadan önce oku: “Allah'tan senin üzerinde bir koruyucu olur ve sabaha kadar şeytan sana yaklaşamaz.” (Buhârî)`,
      `“Kim geceleyin bu iki ayeti okursa, ona yeterler.” (Buhârî ve Müslim)`,
      `Peygamber ﷺ her gece yatağına girdiğinde avuçlarını birleştirir, içlerine üfler, İhlâs, Felak ve Nâs surelerini okur, sonra ellerini vücudunda elinin ulaştığı yerlere sürerdi; bunu üç kez yapardı. (Buhârî)`,
      `Sabah, akşam ve yatmadan önce üç kez.`,
      `Cebrâil, Peygamber ﷺ hasta olduğunda bunu ona okudu.`,
      `Peygamber ﷺ sağ elini hastanın üzerinde gezdirerek bunu okurdu. Başka bir erkek için “اشْفِهِ” (ona şifa ver) de.`,
      `Elini ağrıyan yerin üzerine koy, üç kez “Bismillah” de, sonra bu duayı yedi kez oku.`,
      `Kim sabah ve akşam üç kez söylerse hiçbir şey ona zarar vermez.`,
      `Kim bir yerde konaklar (yolculukta veya seyahatte) ve bunu söylerse, oradan ayrılana kadar hiçbir şey ona zarar vermez.`,
      `Peygamber ﷺ Hasan ve Hüseyin'i bu sözlerle Allah'a emanet ederdi.`,
      `Hoşuna giden bir şey gördüğünde veya kendi ailende ve malında hoşuna giden bir şey olduğunda söyle.`,
      `Biriniz kardeşinde hoşuna giden bir şey görürse ona bereket duası etsin. (Nazar haktır; bu dua onun zararından korur.)`,
      `Bununla birlikte Felak, Nâs ve Fâtiha surelerini oku.`,
      `Peygamber ﷺ bir hastayı ziyaret ettiğinde bunu söylerdi.`,
      `Eceli gelmemiş bir hastayı ziyaret edip bunu yedi kez söyleyen kimseye Allah şifa verir.`,
      `Peygamber ﷺ sıkıntı anında bunu söylerdi.`,
      `Uykuda irkildiğinde veya korktuğunda söyle.`,
      `Peygamber ﷺ buyurdu: Öfkeli kimse bunu söylerse öfkesi geçer.`,
      `İbrahim (a.s.) ateşe atıldığında bunu söyledi; Peygamber ﷺ da korku anında söylerdi.`
    ],
    g: [
      `Allah'tan şifa dilemek ve hastalıktan, nazardan, hasetten ve şeytanın şerrinden korunmak için Kur'an, Allah'ın isimleri ve Peygamber'in dualarını okumaktır; şifa verenin yalnız Allah olduğuna ve rukyenin sadece bir sebep olduğuna inanılarak.`,
      `Peygamber ﷺ buyurdu: “Rukyelerinizi bana gösterin; içinde şirk olmadıkça rukyede sakınca yoktur.” (Müslim)\nBu yüzden: 1) Yalnız Kur'an, Allah'ın isimleri ve meşru dualarla olmalı. 2) Anlamı bilinen bir dille olmalı. 3) Rukyenin kendi başına etkili olmadığına, şifa verenin Allah olduğuna inanmalısın.`,
      `Ayetleri ve duaları oku, sakin bir şekilde hafifçe üfle (fazla tükürük olmadan) ellerine veya hastaya, sonra ellerini baştan ve yüzden başlayarak vücudun üzerinde gezdir. (Peygamber ﷺ böyle yapardı — Buhârî.) Ağrıyan bir yer varsa elini üzerine koy.`,
      `Sabah, akşam ve yatmadan önce. Ev de Bakara suresi okunarak korunur: “Şeytan, içinde Bakara suresi okunan evden kaçar.” (Müslim)`,
      `Büyücülerden, falcılardan ve bilinmeyen şeyler, özel isimler, resimler veya çok para isteyenlerden uzak dur. Peygamber ﷺ buyurdu: “Kim bir falcıya gidip ona bir şey sorarsa, kırk gece namazı kabul olmaz.” (Müslim)\nBilinmeyen tılsım ve yazıları asma, hiçbir amaçla eve koyma.`,
      `Peygamber ﷺ buyurdu: “Ey Allah'ın kulları, tedavi olun; çünkü Allah, devasını da yaratmadığı hiçbir hastalık yaratmamıştır.” (Ebû Dâvûd ve Tirmizî)\nRukye doktorun yerini tutmaz. Belirtiler sürerse (korku, depresyon, uykusuzluk, ağrı) doktora git; çoğu zaman tıbbi bir sebebi vardır.`,
      `Bu bölüm hatırlatma ve öğrenme içindir, yetkin âlimlerin yerini tutmaz. Özel durumlar için güvenilir bir âlime danış. Kürtçe çeviriler uzmanlarca gözden geçirilmelidir.`
    ],
    n: `Rukye, yalnızca Kur'an ve Sünnet'ten gelen sahih dualarla yapılır; doktorun yerini tutmaz. Daha fazlası için “Rehber” bölümüne bak.`,
    s: { cards: `📖 Ayetler ve Dualar`, cont: `🎧 Tam Tilavet`, yt: `📺 YouTube` }
  };

  PK.fa = {
    k: [
      `به نام خداوند بخشنده مهربان. ستایش مخصوص خداوند، پروردگار جهانیان است. بخشنده و مهربان. مالک روز جزا. تنها تو را می‌پرستیم و تنها از تو یاری می‌جوییم. ما را به راه راست هدایت کن؛ راه کسانی که بر آنان نعمت دادی، نه راه خشم‌گرفتگان و نه گمراهان.`,
      `خداوند، هیچ معبودی جز او نیست؛ زنده و پاینده است. نه خواب سبک او را فرا می‌گیرد و نه خواب سنگین. آنچه در آسمان‌ها و زمین است از آنِ اوست. کیست که جز به اجازه او نزدش شفاعت کند؟ آنچه پیش روی آنان و آنچه پشت سرشان است می‌داند، و به چیزی از علم او احاطه نمی‌یابند مگر به آنچه خود بخواهد. کرسی او آسمان‌ها و زمین را فرا گرفته و نگهداری آن دو او را خسته نمی‌کند، و او بلندمرتبه و بزرگ است.`,
      `پیامبر به آنچه از جانب پروردگارش بر او نازل شده ایمان آورده است و مؤمنان نیز؛ همه به خدا و فرشتگان و کتاب‌ها و پیامبرانش ایمان آورده‌اند: «میان هیچ‌یک از پیامبران او فرقی نمی‌گذاریم.» و گفتند: «شنیدیم و اطاعت کردیم. پروردگارا، آمرزش تو را می‌خواهیم و بازگشت به سوی توست.» (۲۸۵)\nخداوند هیچ‌کس را جز به اندازه توانش تکلیف نمی‌کند. آنچه (از نیکی) به دست آورده به سود اوست و آنچه (از بدی) به دست آورده به زیان اوست. «پروردگارا، اگر فراموش کردیم یا خطا کردیم ما را مؤاخذه مکن. پروردگارا، بار سنگینی بر ما مگذار چنان که بر کسانی که پیش از ما بودند نهادی. پروردگارا، آنچه طاقتش را نداریم بر ما تحمیل مکن. ما را ببخش و بیامرز و به ما رحم کن. تو مولای ما هستی، پس ما را بر قوم کافران پیروز گردان.» (۲۸۶)`,
      `بگو: او خدای یکتاست. خدایی که بی‌نیاز است و همه به او نیازمندند. نزاده و زاده نشده است، و هیچ‌کس همتای او نیست.`,
      `بگو: پناه می‌برم به پروردگار سپیده‌دم، از شر آنچه آفریده، و از شر تاریکی شب هنگامی که فرا رسد، و از شر دمندگان در گره‌ها (جادوگران)، و از شر حسود هنگامی که حسد ورزد.`,
      `بگو: پناه می‌برم به پروردگار مردم، پادشاه مردم، معبود مردم، از شر وسوسه‌گر پنهان‌شونده، آن که در سینه‌های مردم وسوسه می‌افکند، از جن و انس.`,
      `به نام خدا برای تو رقیه می‌کنم، از هر چیزی که تو را آزار می‌دهد، از شر هر نفس و چشم حسودی. خدا تو را شفا دهد. به نام خدا برای تو رقیه می‌کنم.`,
      `خدایا، ای پروردگار مردم، رنج را ببر و شفا بده؛ تو شفادهنده‌ای. شفایی جز شفای تو نیست؛ شفایی که هیچ بیماری‌ای باقی نگذارد.`,
      `به نام خدا (سه بار)، سپس هفت بار: به خدا و قدرت او پناه می‌برم از شر آنچه احساس می‌کنم و از آن می‌ترسم.`,
      `به نام خدایی که با نام او هیچ چیز در زمین و آسمان زیان نمی‌رساند، و او شنوای داناست.`,
      `به کلمات کامل خدا پناه می‌برم از شر آنچه آفریده است.`,
      `شما دو نفر را به کلمات کامل خدا پناه می‌دهم، از هر شیطان و جانور زیان‌رسان و از هر چشم بدی.`,
      `آنچه خدا بخواهد همان می‌شود؛ هیچ نیرویی جز به یاری خدا نیست.`,
      `خدایا، به او برکت بده.`,
      `ضرری ندارد، پاک‌کننده است، اگر خدا بخواهد.`,
      `از خدای بزرگ، پروردگار عرش بزرگ، می‌خواهم که تو را شفا دهد.`,
      `هیچ معبودی جز خدای بزرگ و بردبار نیست. هیچ معبودی جز خدا، پروردگار عرش بزرگ، نیست. هیچ معبودی جز خدا، پروردگار آسمان‌ها و پروردگار زمین و پروردگار عرش کریم، نیست.`,
      `به کلمات کامل خدا پناه می‌برم از خشم و عذاب او، از شر بندگانش، از وسوسه‌های شیاطین و از اینکه نزد من حاضر شوند.`,
      `به خدا پناه می‌برم از شیطان رانده‌شده.`,
      `خدا ما را کافی است و او نیکو کارسازی است.`
    ],
    h: [
      `یکی از صحابه سوره فاتحه را بر مردی که گزیده شده بود خواند و او شفا یافت. پیامبر ﷺ فرمود: «از کجا دانستی که این رقیه است؟» (بخاری و مسلم)`,
      `پیش از خواب بخوان: «از جانب خدا نگهبانی همواره با توست و شیطان تا صبح به تو نزدیک نمی‌شود.» (بخاری)`,
      `«هر که این دو آیه را در شب بخواند، او را کافی است.» (بخاری و مسلم)`,
      `پیامبر ﷺ هر شب هنگام خواب دو کف دستش را به هم می‌آورد، در آن می‌دمید، سوره‌های اخلاص و فلق و ناس را می‌خواند، سپس تا جایی که می‌توانست دست‌ها را بر بدنش می‌کشید؛ سه بار. (بخاری)`,
      `سه بار در صبح و شام و پیش از خواب.`,
      `جبرئیل این را هنگامی که پیامبر ﷺ بیمار بود برای او خواند.`,
      `پیامبر ﷺ دست راستش را بر بیمار می‌کشید و این را می‌خواند. برای مردی دیگر بگو «اشْفِهِ» (او را شفا بده).`,
      `دستت را بر جای درد بگذار، سه بار «بسم الله» بگو، سپس این دعا را هفت بار بخوان.`,
      `هر که صبح و شام سه بار بگوید، هیچ چیز به او زیان نمی‌رساند.`,
      `هر که در جایی (در سفر یا گردش) توقف کند و این را بگوید، تا آن‌جا را ترک کند هیچ چیز به او زیان نمی‌رساند.`,
      `پیامبر ﷺ حسن و حسین را با این کلمات در پناه خدا می‌گذاشت.`,
      `هنگامی که چیزی را می‌بینی که دوستش داری، یا چیزی در خانواده و دارایی خودت، بگو.`,
      `اگر یکی از شما در برادرش چیزی ببیند که او را به شگفتی آورد، برایش دعای برکت کند. (چشم‌زخم حق است و با این دعا از آن در امان می‌مانی.)`,
      `همراه با آن سوره‌های فلق، ناس و فاتحه را بخوان.`,
      `پیامبر ﷺ هنگام عیادت بیمار این را می‌گفت.`,
      `هر که بیماری را که اجلش نرسیده عیادت کند و هفت بار این را بگوید، خدا او را شفا می‌دهد.`,
      `پیامبر ﷺ هنگام اندوه و گرفتاری این را می‌گفت.`,
      `هنگامی که در خواب هراسان شدی یا ترسیدی بگو.`,
      `پیامبر ﷺ فرمود: اگر فرد خشمگین این را بگوید، خشمش فرو می‌نشیند.`,
      `ابراهیم (علیه السلام) هنگامی که در آتش افکنده شد این را گفت و پیامبر ﷺ نیز هنگام ترس.`
    ],
    g: [
      `خواندن قرآن، نام‌های خدا و دعاهای نبوی برای طلب شفا و محافظت از بیماری، چشم‌زخم، حسد و شر شیطان، با این باور که شفادهنده تنها خداست و رقیه فقط یک وسیله است.`,
      `پیامبر ﷺ فرمود: «رقیه‌های خود را بر من عرضه کنید؛ تا زمانی که شرک در آن نباشد، رقیه اشکالی ندارد.» (مسلم)\nپس: ۱) فقط با قرآن، نام‌های خدا و دعاهای مشروع باشد. ۲) به زبانی باشد که معنایش فهمیده شود. ۳) باور داشته باش که رقیه به‌خودی‌خود اثری ندارد و خداست که شفا می‌دهد.`,
      `آیات و دعاها را بخوان، آرام و سبک (بدون آب دهان زیاد) در دو دستت یا بر بیمار بدم، و دست‌هایت را بر بدن بکش و از سر و صورت آغاز کن. (پیامبر ﷺ چنین می‌کرد — بخاری.) اگر جای درد مشخصی هست، دستت را بر آن بگذار.`,
      `صبح و شام و پیش از خواب. خانه نیز با خواندن سوره بقره محافظت می‌شود: «شیطان از خانه‌ای که در آن سوره بقره خوانده شود می‌گریزد.» (مسلم)`,
      `از جادوگران، فالگیران و کسانی که چیزهای نامعلوم، نام‌ها و تصاویر خاص یا پول زیاد می‌خواهند دوری کن. پیامبر ﷺ فرمود: «هر که نزد فالگیری برود و از او چیزی بپرسد، چهل شب نمازش پذیرفته نمی‌شود.» (مسلم)\nتعویذ و نوشته‌های نامعلوم را نیاویز و برای هیچ هدفی در خانه نگذار.`,
      `پیامبر ﷺ فرمود: «ای بندگان خدا، درمان کنید؛ زیرا خدا هیچ دردی نیافریده مگر آنکه برایش درمانی نیز نهاده است.» (ابوداود و ترمذی)\nرقیه جای پزشک را نمی‌گیرد. اگر نشانه‌ها ادامه یافت (ترس، افسردگی، بی‌خوابی، درد) به پزشک مراجعه کن؛ بسیار پیش می‌آید که علتی پزشکی دارد.`,
      `این بخش برای یادآوری و آموزش است و جای عالمان شرعی را نمی‌گیرد. برای موارد خاص از عالمی مورد اعتماد بپرس. ترجمه‌های کردی باید توسط اهل تخصص بازبینی شوند.`
    ],
    n: `رقیه تنها با قرآن و دعاهای صحیح از سنت انجام می‌شود و جای پزشک را نمی‌گیرد. برای اطلاعات بیشتر به «راهنما» برو.`,
    s: { cards: `📖 آیات و دعاها`, cont: `🎧 تلاوت کامل`, yt: `📺 یوتیوب` }
  };

  PK.ur = {
    k: [
      `اللہ کے نام سے جو نہایت مہربان، بہت رحم کرنے والا ہے۔ سب تعریف اللہ کے لیے ہے جو تمام جہانوں کا رب ہے۔ نہایت مہربان، بہت رحم کرنے والا۔ روزِ جزا کا مالک۔ ہم تیری ہی عبادت کرتے ہیں اور تجھی سے مدد مانگتے ہیں۔ ہمیں سیدھا راستہ دکھا؛ ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا۔`,
      `اللہ، اس کے سوا کوئی معبود نہیں، وہ زندہ ہے، سب کو قائم رکھنے والا ہے۔ نہ اسے اونگھ آتی ہے اور نہ نیند۔ جو کچھ آسمانوں میں ہے اور جو کچھ زمین میں ہے سب اسی کا ہے۔ کون ہے جو اس کی اجازت کے بغیر اس کے سامنے سفارش کرے؟ وہ جانتا ہے جو ان کے سامنے ہے اور جو ان کے پیچھے ہے، اور وہ اس کے علم میں سے کسی چیز کا احاطہ نہیں کر سکتے مگر جتنا وہ چاہے۔ اس کی کرسی آسمانوں اور زمین پر محیط ہے اور ان کی حفاظت اسے تھکاتی نہیں، اور وہ بلند و عظیم ہے۔`,
      `رسول اس پر ایمان لایا جو اس کے رب کی طرف سے اس پر نازل ہوا، اور مومن بھی۔ سب اللہ، اس کے فرشتوں، اس کی کتابوں اور اس کے رسولوں پر ایمان لائے: «ہم اس کے رسولوں میں سے کسی میں فرق نہیں کرتے۔» اور انہوں نے کہا: «ہم نے سنا اور اطاعت کی۔ اے ہمارے رب، تیری بخشش چاہتے ہیں اور تیری ہی طرف لوٹنا ہے۔» (۲۸۵)\nاللہ کسی جان پر اس کی طاقت سے زیادہ بوجھ نہیں ڈالتا۔ جو (نیکی) اس نے کمائی وہ اسی کے لیے ہے اور جو (برائی) کمائی وہ اسی پر ہے۔ «اے ہمارے رب، اگر ہم بھول جائیں یا خطا کریں تو ہمیں نہ پکڑ۔ اے ہمارے رب، ہم پر ایسا بوجھ نہ ڈال جیسا تو نے ہم سے پہلوں پر ڈالا۔ اے ہمارے رب، ہم پر وہ بوجھ نہ ڈال جس کی ہم میں طاقت نہیں۔ ہمیں معاف کر، ہمیں بخش دے اور ہم پر رحم فرما۔ تو ہمارا مولیٰ ہے، پس کافر قوم پر ہماری مدد فرما۔» (۲۸۶)`,
      `کہو: وہ اللہ ایک ہے۔ اللہ بے نیاز ہے (سب اس کے محتاج ہیں)۔ نہ اس نے کسی کو جنا اور نہ وہ جنا گیا، اور کوئی اس کا ہمسر نہیں۔`,
      `کہو: میں صبح کے رب کی پناہ مانگتا ہوں، اس کی مخلوق کے شر سے، اور اندھیری رات کے شر سے جب وہ چھا جائے، اور گرہوں میں پھونکنے والیوں (جادوگروں) کے شر سے، اور حسد کرنے والے کے شر سے جب وہ حسد کرے۔`,
      `کہو: میں لوگوں کے رب، لوگوں کے بادشاہ، لوگوں کے معبود کی پناہ مانگتا ہوں، اس چھپ کر وسوسہ ڈالنے والے کے شر سے جو لوگوں کے دلوں میں وسوسہ ڈالتا ہے، جنوں میں سے ہو یا انسانوں میں سے۔`,
      `اللہ کے نام سے میں تم پر دم کرتا ہوں، ہر اس چیز سے جو تمہیں تکلیف دے، ہر نفس اور حسد کرنے والی آنکھ کے شر سے۔ اللہ تمہیں شفا دے۔ اللہ کے نام سے میں تم پر دم کرتا ہوں۔`,
      `اے اللہ، لوگوں کے رب! تکلیف دور فرما اور شفا عطا فرما، تو ہی شفا دینے والا ہے۔ تیری شفا کے سوا کوئی شفا نہیں، ایسی شفا جو کوئی بیماری باقی نہ چھوڑے۔`,
      `اللہ کے نام سے (تین بار)، پھر سات بار: میں اللہ اور اس کی قدرت کی پناہ مانگتا ہوں اس چیز کے شر سے جو میں محسوس کرتا ہوں اور جس سے ڈرتا ہوں۔`,
      `اللہ کے نام سے جس کے نام کے ساتھ زمین و آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی، اور وہ سننے والا، جاننے والا ہے۔`,
      `میں اللہ کے کامل کلمات کی پناہ مانگتا ہوں اس کی مخلوق کے شر سے۔`,
      `میں تم دونوں کو اللہ کے کامل کلمات کی پناہ میں دیتا ہوں، ہر شیطان اور ہر نقصان دہ جانور سے اور ہر بُری نظر سے۔`,
      `جو اللہ چاہے وہی ہوتا ہے؛ اللہ کے بغیر کوئی قوت نہیں۔`,
      `اے اللہ، اس میں برکت دے۔`,
      `کوئی حرج نہیں، یہ پاک کرنے والی ہے، ان شاء اللہ۔`,
      `میں عظیم اللہ، عرشِ عظیم کے رب سے سوال کرتا ہوں کہ وہ تمہیں شفا دے۔`,
      `عظیم اور بردبار اللہ کے سوا کوئی معبود نہیں۔ عرشِ عظیم کے رب اللہ کے سوا کوئی معبود نہیں۔ آسمانوں کے رب، زمین کے رب اور عرشِ کریم کے رب اللہ کے سوا کوئی معبود نہیں۔`,
      `میں اللہ کے کامل کلمات کی پناہ مانگتا ہوں اس کے غضب اور عذاب سے، اس کے بندوں کے شر سے، شیطانوں کے وسوسوں سے اور اس سے کہ وہ میرے پاس آئیں۔`,
      `میں اللہ کی پناہ مانگتا ہوں شیطان مردود سے۔`,
      `ہمیں اللہ کافی ہے اور وہ بہترین کارساز ہے۔`
    ],
    h: [
      `ایک صحابی نے ایک ڈسے ہوئے آدمی پر سورۃ الفاتحہ پڑھی تو وہ شفایاب ہو گیا۔ نبی ﷺ نے فرمایا: «تمہیں کیسے معلوم ہوا کہ یہ رقیہ ہے؟» (بخاری و مسلم)`,
      `سونے سے پہلے پڑھیں: «اللہ کی طرف سے ایک نگہبان تمہارے ساتھ رہے گا اور صبح تک شیطان تمہارے قریب نہیں آئے گا۔» (بخاری)`,
      `«جو شخص رات کو یہ دو آیات پڑھ لے، وہ اسے کافی ہیں۔» (بخاری و مسلم)`,
      `نبی ﷺ ہر رات سونے سے پہلے اپنی ہتھیلیاں جوڑتے، ان میں پھونکتے، اخلاص، فلق اور ناس پڑھتے، پھر جہاں تک ہاتھ پہنچتا جسم پر پھیرتے؛ تین بار۔ (بخاری)`,
      `صبح، شام اور سونے سے پہلے تین بار۔`,
      `جبریل نے یہ نبی ﷺ پر اس وقت پڑھا جب آپ بیمار تھے۔`,
      `نبی ﷺ اپنا دایاں ہاتھ مریض پر پھیرتے اور یہ پڑھتے۔ کسی دوسرے مرد کے لیے «اشْفِهِ» (اسے شفا دے) کہیں۔`,
      `اپنا ہاتھ درد کی جگہ پر رکھیں، تین بار «بسم اللہ» کہیں، پھر یہ دعا سات بار پڑھیں۔`,
      `جو شخص صبح اور شام تین بار یہ کہے، اسے کوئی چیز نقصان نہیں پہنچائے گی۔`,
      `جو شخص کسی جگہ ٹھہرے (سفر یا سیر میں) اور یہ کہے تو وہاں سے روانہ ہونے تک کوئی چیز اسے نقصان نہیں دے گی۔`,
      `نبی ﷺ حسن اور حسین کو ان کلمات کے ساتھ اللہ کی پناہ میں دیتے تھے۔`,
      `جب کوئی ایسی چیز دیکھیں جو آپ کو پسند آئے، یا اپنے اہل و مال میں کوئی چیز پسند آئے تو یہ کہیں۔`,
      `اگر تم میں سے کوئی اپنے بھائی میں کوئی ایسی چیز دیکھے جو اسے پسند آئے تو اس کے لیے برکت کی دعا کرے۔ (نظر حق ہے، اور اس دعا سے اس کے نقصان سے حفاظت ہوتی ہے۔)`,
      `اس کے ساتھ سورۃ الفلق، الناس اور الفاتحہ بھی پڑھیں۔`,
      `نبی ﷺ جب کسی مریض کی عیادت کرتے تو یہ فرماتے۔`,
      `جو شخص ایسے مریض کی عیادت کرے جس کی موت کا وقت نہ آیا ہو اور یہ سات بار کہے تو اللہ اسے شفا دیتا ہے۔`,
      `نبی ﷺ غم اور پریشانی کے وقت یہ فرماتے تھے۔`,
      `جب نیند میں گھبرا کر اٹھیں یا ڈر جائیں تو یہ کہیں۔`,
      `نبی ﷺ نے فرمایا: غصے والا شخص اگر یہ کہے تو اس کا غصہ چلا جاتا ہے۔`,
      `ابراہیم علیہ السلام نے جب انہیں آگ میں ڈالا گیا تو یہ کہا، اور نبی ﷺ نے خوف کے وقت کہا۔`
    ],
    g: [
      `قرآن، اللہ کے ناموں اور نبوی دعاؤں کا پڑھنا تاکہ بیماری، نظرِ بد، حسد اور شیطان کے شر سے شفا اور حفاظت مانگی جائے، اس یقین کے ساتھ کہ شفا دینے والا صرف اللہ ہے اور رقیہ محض ایک ذریعہ ہے۔`,
      `نبی ﷺ نے فرمایا: «اپنے رقیے مجھے دکھاؤ؛ رقیے میں کوئی حرج نہیں جب تک اس میں شرک نہ ہو۔» (مسلم)\nلہٰذا: ۱) صرف قرآن، اللہ کے ناموں اور جائز دعاؤں سے ہو۔ ۲) ایسی زبان میں ہو جس کا مطلب سمجھا جائے۔ ۳) یقین رکھیں کہ رقیہ بذاتِ خود اثر نہیں رکھتا اور شفا اللہ دیتا ہے۔`,
      `آیات اور دعائیں پڑھیں، آرام سے ہلکا پھونکیں (زیادہ تھوک کے بغیر) اپنے ہاتھوں میں یا مریض پر، اور ہاتھ جسم پر پھیریں، سر اور چہرے سے شروع کریں۔ (نبی ﷺ ایسا کرتے تھے — بخاری۔) اگر درد کی کوئی جگہ ہو تو اس پر ہاتھ رکھیں۔`,
      `صبح، شام اور سونے سے پہلے۔ گھر کی حفاظت بھی سورۃ البقرہ پڑھنے سے ہوتی ہے: «شیطان اس گھر سے بھاگتا ہے جس میں سورۃ البقرہ پڑھی جاتی ہے۔» (مسلم)`,
      `جادوگروں، کاہنوں اور ان لوگوں سے دور رہیں جو نامعلوم چیزیں، خاص نام اور تصاویر یا بہت سا پیسہ مانگتے ہیں۔ نبی ﷺ نے فرمایا: «جو شخص کسی کاہن کے پاس جائے اور اس سے کچھ پوچھے، اس کی چالیس راتوں کی نماز قبول نہیں ہوتی۔» (مسلم)\nنامعلوم تعویذ اور تحریریں نہ لٹکائیں اور کسی مقصد کے لیے گھر میں نہ رکھیں۔`,
      `نبی ﷺ نے فرمایا: «اے اللہ کے بندو! علاج کرو؛ کیونکہ اللہ نے کوئی بیماری ایسی نہیں اتاری جس کی دوا بھی نہ اتاری ہو۔» (ابو داؤد اور ترمذی)\nرقیہ ڈاکٹر کی جگہ نہیں لیتا۔ اگر علامات جاری رہیں (خوف، افسردگی، بے خوابی، درد) تو ڈاکٹر کے پاس جائیں؛ اکثر اس کی طبی وجہ ہوتی ہے۔`,
      `یہ حصہ یاد دہانی اور سیکھنے کے لیے ہے اور مستند علماء کی جگہ نہیں لیتا۔ خاص معاملات میں کسی قابلِ اعتماد عالم سے پوچھیں۔ کردی تراجم کا ماہرین سے جائزہ لیا جانا چاہیے۔`
    ],
    n: `رقیہ صرف قرآن اور سنت کی صحیح دعاؤں سے ہوتا ہے اور ڈاکٹر کی جگہ نہیں لیتا۔ مزید کے لیے «رہنمائی» دیکھیں۔`,
    s: { cards: `📖 آیات اور دعائیں`, cont: `🎧 مکمل تلاوت`, yt: `📺 یوٹیوب` }
  };

  PK.fr = {
    k: [
      `Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux. Louange à Allah, Seigneur des mondes. Le Tout Miséricordieux, le Très Miséricordieux. Maître du Jour de la rétribution. C'est Toi seul que nous adorons, et c'est Toi seul dont nous implorons le secours. Guide-nous dans le droit chemin : le chemin de ceux que Tu as comblés de bienfaits, non pas de ceux qui ont encouru Ta colère, ni des égarés.`,
      `Allah — il n'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent. À Lui appartient ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission ? Il connaît ce qui est devant eux et ce qui est derrière eux, et ils n'embrassent de Sa science que ce qu'Il veut. Son Trône s'étend sur les cieux et la terre, et leur garde ne Lui coûte aucune peine. Il est le Très Haut, le Très Grand.`,
      `Le Messager a cru en ce qui lui a été révélé de la part de son Seigneur, ainsi que les croyants. Tous ont cru en Allah, en Ses anges, en Ses livres et en Ses messagers : « Nous ne faisons aucune distinction entre Ses messagers. » Et ils ont dit : « Nous avons entendu et nous avons obéi. Pardon, notre Seigneur ! C'est vers Toi que sera le retour. » (285)\nAllah n'impose à aucune âme une charge supérieure à sa capacité. Elle aura ce qu'elle a gagné et subira ce qu'elle a mérité. « Notre Seigneur, ne nous châtie pas si nous oublions ou si nous commettons une erreur. Notre Seigneur, ne nous charge pas d'un fardeau comme celui dont Tu as chargé ceux qui nous ont précédés. Notre Seigneur, ne nous impose pas ce que nous ne pouvons supporter. Efface nos fautes, pardonne-nous et fais-nous miséricorde. Tu es notre Maître, donne-nous donc la victoire sur les gens mécréants. » (286)`,
      `Dis : Il est Allah, Unique. Allah, le Seul à être imploré pour ce que nous désirons. Il n'a jamais engendré, n'a pas été engendré non plus, et nul n'est égal à Lui.`,
      `Dis : Je cherche refuge auprès du Seigneur de l'aube, contre le mal de ce qu'Il a créé, contre le mal de l'obscurité quand elle s'approfondit, contre le mal de celles qui soufflent sur les nœuds (la sorcellerie), et contre le mal de l'envieux quand il envie.`,
      `Dis : Je cherche refuge auprès du Seigneur des hommes, le Souverain des hommes, le Dieu des hommes, contre le mal du mauvais conseiller furtif, qui souffle le mal dans les poitrines des hommes, qu'il soit parmi les djinns ou parmi les hommes.`,
      `Au nom d'Allah, je fais la ruqya pour toi, contre tout ce qui te nuit, contre le mal de toute âme et de tout œil envieux. Qu'Allah te guérisse. Au nom d'Allah, je fais la ruqya pour toi.`,
      `Ô Allah, Seigneur des hommes, ôte le mal et guéris — Tu es le Guérisseur. Il n'y a de guérison que Ta guérison, une guérison qui ne laisse aucune maladie.`,
      `Au nom d'Allah (trois fois), puis sept fois : Je cherche refuge auprès d'Allah et de Sa puissance contre le mal de ce que je ressens et que je redoute.`,
      `Au nom d'Allah, avec le nom duquel rien sur terre ni dans le ciel ne peut nuire, et Il est l'Audient, l'Omniscient.`,
      `Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.`,
      `Je vous place tous deux sous la protection des paroles parfaites d'Allah, contre tout démon, toute créature nuisible et tout mauvais œil.`,
      `Ce qu'Allah veut arrive ; il n'y a de force qu'en Allah.`,
      `Ô Allah, bénis-le.`,
      `Pas de mal, c'est une purification, si Allah le veut.`,
      `Je demande à Allah le Magnifique, Seigneur du Trône immense, de te guérir.`,
      `Il n'y a de divinité qu'Allah, le Magnifique, le Longanime. Il n'y a de divinité qu'Allah, Seigneur du Trône immense. Il n'y a de divinité qu'Allah, Seigneur des cieux, Seigneur de la terre et Seigneur du Trône noble.`,
      `Je cherche refuge dans les paroles parfaites d'Allah contre Sa colère et Son châtiment, contre le mal de Ses serviteurs, contre les suggestions des démons et contre leur présence auprès de moi.`,
      `Je cherche refuge auprès d'Allah contre Satan le maudit.`,
      `Allah nous suffit, et quel excellent garant !`
    ],
    h: [
      `Un compagnon récita Al-Fatiha sur un homme qui avait été piqué, et il guérit. Le Prophète ﷺ dit : « Comment as-tu su que c'était une ruqya ? » (Bukhari et Muslim)`,
      `Récite-le avant de dormir : « Un gardien d'Allah restera avec toi et Satan ne s'approchera pas de toi jusqu'au matin. » (Bukhari)`,
      `« Quiconque récite ces deux versets la nuit, ils lui suffiront. » (Bukhari et Muslim)`,
      `Chaque nuit avant de dormir, le Prophète ﷺ joignait ses paumes, soufflait dedans, récitait Al-Ikhlas, Al-Falaq et An-Nas, puis les passait sur son corps autant qu'il le pouvait, trois fois. (Bukhari)`,
      `Trois fois le matin, le soir et avant de dormir.`,
      `Jibril récita ceci pour le Prophète ﷺ lorsqu'il était malade.`,
      `Le Prophète ﷺ passait sa main droite sur le malade en disant cela. Pour un autre homme, dis « اشْفِهِ » (guéris-le).`,
      `Pose ta main sur l'endroit douloureux, dis « Bismillah » trois fois, puis récite cette invocation sept fois.`,
      `Quiconque le dit trois fois le matin et le soir, rien ne lui nuira.`,
      `Quiconque s'arrête dans un lieu (en voyage ou en déplacement) et dit cela, rien ne lui nuira jusqu'à son départ de ce lieu.`,
      `Le Prophète ﷺ protégeait Al-Hasan et Al-Husayn avec ces paroles.`,
      `À dire lorsque tu vois quelque chose qui te plaît, ou quelque chose dans ta famille et tes biens.`,
      `Si l'un de vous voit chez son frère quelque chose qui lui plaît, qu'il invoque la bénédiction pour lui. (Le mauvais œil est réel, et cette invocation en protège.)`,
      `Récite aussi Al-Falaq, An-Nas et Al-Fatiha.`,
      `Lorsqu'il rendait visite à un malade, le Prophète ﷺ disait cela.`,
      `Quiconque rend visite à un malade dont le terme n'est pas arrivé et dit cela sept fois, Allah le guérira.`,
      `Le Prophète ﷺ disait cela dans l'angoisse.`,
      `À dire lorsque tu te réveilles en sursaut ou effrayé pendant ton sommeil.`,
      `Le Prophète ﷺ a dit : si une personne en colère dit cela, sa colère s'apaise.`,
      `Ibrahim (paix sur lui) dit cela lorsqu'il fut jeté dans le feu, et le Prophète ﷺ le disait en temps de peur.`
    ],
    g: [
      `Réciter le Coran, les noms d'Allah et les invocations prophétiques pour demander la guérison et la protection contre la maladie, le mauvais œil, l'envie et le mal de Satan, avec la conviction que le seul Guérisseur est Allah et que la ruqya n'est qu'un moyen.`,
      `Le Prophète ﷺ a dit : « Présentez-moi vos ruqyas ; il n'y a aucun mal dans la ruqya tant qu'elle ne contient pas de chirk. » (Muslim)\nDonc : 1) Uniquement avec le Coran, les noms d'Allah et des invocations permises. 2) Dans une langue dont le sens est compris. 3) Crois que la ruqya n'a pas de pouvoir en elle-même et qu'Allah est Celui qui guérit.`,
      `Récite les versets et les invocations, souffle doucement et légèrement (sans excès de salive) dans tes mains ou vers le malade, puis passe les mains sur le corps en commençant par la tête et le visage. (Le Prophète ﷺ faisait ainsi — Bukhari.) S'il y a un endroit douloureux, pose ta main dessus.`,
      `Le matin, le soir et avant de dormir. La maison est aussi protégée par la récitation de la sourate Al-Baqara : « Satan fuit la maison dans laquelle la sourate Al-Baqara est récitée. » (Muslim)`,
      `Éloigne-toi des sorciers, des devins et de ceux qui demandent des choses inconnues, des noms et images particuliers ou de grosses sommes d'argent. Le Prophète ﷺ a dit : « Quiconque va chez un devin et l'interroge sur quoi que ce soit, sa prière ne sera pas acceptée pendant quarante nuits. » (Muslim)\nN'accroche pas d'amulettes ni d'écrits inconnus et n'en place pas dans la maison, pour quelque but que ce soit.`,
      `Le Prophète ﷺ a dit : « Ô serviteurs d'Allah, soignez-vous ; car Allah n'a créé aucune maladie sans créer aussi son remède. » (Abu Dawud et At-Tirmidhi)\nLa ruqya ne remplace pas le médecin. Si les symptômes persistent (peur, dépression, insomnie, douleur), consulte un médecin ; il y a souvent une cause médicale.`,
      `Cette section sert de rappel et d'apprentissage et ne remplace pas les savants qualifiés. Pour les cas particuliers, demande à un savant de confiance. Les traductions kurdes doivent être relues par des personnes compétentes.`
    ],
    n: `La ruqya se pratique uniquement avec le Coran et les invocations authentiques de la Sunna ; elle ne remplace pas un médecin. Voir « Guide » pour en savoir plus.`,
    s: { cards: `📖 Versets et invocations`, cont: `🎧 Récitation complète`, yt: `📺 YouTube` }
  };

  PK.ru = {
    k: [
      `Во имя Аллаха, Милостивого, Милосердного. Хвала Аллаху, Господу миров, Милостивому, Милосердному, Властелину Дня воздаяния. Тебе одному мы поклоняемся и Тебя одного молим о помощи. Веди нас прямым путём — путём тех, кого Ты облагодетельствовал, не тех, на кого пал гнев, и не заблудших.`,
      `Аллах — нет божества, кроме Него, Живого, Вечносущего. Ни дремота, ни сон не овладевают Им. Ему принадлежит всё, что на небесах и на земле. Кто заступится перед Ним без Его дозволения? Он знает, что было перед ними и что будет после них, а они постигают из Его знания лишь то, что Он пожелает. Престол Его объемлет небеса и землю, и не тяготит Его их охрана. Он — Возвышенный, Великий.`,
      `Посланник уверовал в то, что было ниспослано ему от его Господа, и верующие также. Каждый уверовал в Аллаха, Его ангелов, Его писания и Его посланников: «Мы не делаем различия между Его посланниками». И сказали они: «Мы услышали и повинуемся. Прощения Твоего, Господи наш! К Тебе — возвращение». (285)\nАллах не возлагает на душу сверх её возможностей. В её пользу то, что она приобрела, и против неё то, что она приобрела. «Господи наш, не взыскивай с нас, если мы забудем или ошибёмся. Господи наш, не возлагай на нас бремя, подобное тому, что Ты возложил на живших до нас. Господи наш, не возлагай на нас то, что нам не под силу. Избавь нас, прости нас и помилуй. Ты — наш Покровитель, так помоги нам против неверующего народа». (286)`,
      `Скажи: «Он — Аллах, Единый, Аллах Самодостаточный. Не родил и не был рождён, и нет никого, равного Ему».`,
      `Скажи: «Прибегаю к защите Господа рассвета от зла того, что Он сотворил, от зла мглы, когда она наступает, от зла дующих на узлы (колдуний) и от зла завистника, когда он завидует».`,
      `Скажи: «Прибегаю к защите Господа людей, Царя людей, Бога людей от зла искусителя-шайтана, неприметного, который нашёптывает в груди людей, — из джиннов и из людей».`,
      `Во имя Аллаха я читаю над тобой рукъю от всего, что причиняет тебе вред, от зла всякой души и завистливого глаза. Да исцелит тебя Аллах. Во имя Аллаха я читаю над тобой рукъю.`,
      `О Аллах, Господь людей, устрани беду и исцели — Ты Целитель. Нет исцеления, кроме Твоего исцеления, исцеления, не оставляющего никакой болезни.`,
      `Во имя Аллаха (трижды), затем семь раз: Прибегаю к Аллаху и к Его могуществу от зла того, что я ощущаю и чего опасаюсь.`,
      `Во имя Аллаха, с именем Которого ничто на земле и на небе не причинит вреда, и Он — Всеслышащий, Всезнающий.`,
      `Прибегаю к совершенным словам Аллаха от зла того, что Он сотворил.`,
      `Вверяю вас обоих защите совершенных слов Аллаха от всякого шайтана и ядовитой твари и от всякого дурного глаза.`,
      `Так пожелал Аллах; нет мощи, кроме как у Аллаха.`,
      `О Аллах, ниспошли ему благодать.`,
      `Ничего страшного, это очищение, если пожелает Аллах.`,
      `Прошу великого Аллаха, Господа великого Трона, исцелить тебя.`,
      `Нет божества, кроме Аллаха, Великого, Кроткого. Нет божества, кроме Аллаха, Господа великого Трона. Нет божества, кроме Аллаха, Господа небес, Господа земли и Господа благородного Трона.`,
      `Прибегаю к совершенным словам Аллаха от Его гнева и наказания, от зла Его рабов, от наущений шайтанов и от того, чтобы они были подле меня.`,
      `Прибегаю к защите Аллаха от шайтана, побиваемого камнями.`,
      `Достаточно нам Аллаха, и какой же Он прекрасный Покровитель!`
    ],
    h: [
      `Один из сподвижников прочитал суру аль-Фатиха над человеком, которого ужалили, и тот исцелился. Пророк ﷺ спросил: «Откуда ты знал, что это рукъя?» (аль-Бухари и Муслим)`,
      `Читай перед сном: «Над тобой будет хранитель от Аллаха, и шайтан не приблизится к тебе до утра». (аль-Бухари)`,
      `«Кто прочтёт эти два аята ночью, тому их будет достаточно». (аль-Бухари и Муслим)`,
      `Каждую ночь, ложась в постель, Пророк ﷺ складывал ладони, дул в них, читал суры аль-Ихляс, аль-Фаляк и ан-Нас, затем проводил ими по телу, насколько мог; трижды. (аль-Бухари)`,
      `Трижды утром, вечером и перед сном.`,
      `Джибриль прочитал это Пророку ﷺ, когда тот был болен.`,
      `Пророк ﷺ проводил правой рукой по больному, произнося это. Для другого мужчины скажи «اشْفِهِ» (исцели его).`,
      `Положи руку на место боли, трижды скажи «Бисмиллях», затем прочти это дуа семь раз.`,
      `Кто скажет это трижды утром и вечером, тому ничто не причинит вреда.`,
      `Кто остановится в каком-либо месте (в пути или в поездке) и скажет это, тому ничто не причинит вреда, пока он не покинет это место.`,
      `Пророк ﷺ вверял Аллаху аль-Хасана и аль-Хусейна этими словами.`,
      `Говори это, когда видишь то, что тебе нравится, или что-то в твоей семье и имуществе.`,
      `Если кто-либо из вас увидит в своём брате то, что ему понравится, пусть призовёт для него благодать. (Сглаз реален, и это дуа защищает от него.)`,
      `Вместе с этим читай суры аль-Фаляк, ан-Нас и аль-Фатиха.`,
      `Навещая больного, Пророк ﷺ говорил это.`,
      `Кто навестит больного, срок которого ещё не настал, и скажет это семь раз, того Аллах исцелит.`,
      `Пророк ﷺ говорил это в трудную минуту.`,
      `Говори это, когда проснёшься в испуге или от страха во сне.`,
      `Пророк ﷺ сказал: если разгневанный человек скажет это, его гнев уйдёт.`,
      `Ибрахим (мир ему) сказал это, когда его бросили в огонь, и Пророк ﷺ говорил это в момент страха.`
    ],
    g: [
      `Чтение Корана, имён Аллаха и пророческих дуа с просьбой об исцелении и защите от болезни, сглаза, зависти и зла шайтана — с убеждением, что единственный Целитель — Аллах, а рукъя лишь причина.`,
      `Пророк ﷺ сказал: «Покажите мне ваши рукъи; нет вреда в рукъе, если в ней нет ширка». (Муслим)\nПоэтому: 1) Только с Кораном, именами Аллаха и дозволенными дуа. 2) На языке, смысл которого понятен. 3) Верь, что сама по себе рукъя не действует, а исцеляет Аллах.`,
      `Читай аяты и дуа, спокойно слегка подуй (без лишней слюны) в ладони или на больного и проведи руками по телу, начиная с головы и лица. (Так поступал Пророк ﷺ — аль-Бухари.) Если есть место боли, положи на него руку.`,
      `Утром, вечером и перед сном. Дом также защищается чтением суры аль-Бакара: «Шайтан бежит из дома, в котором читается сура аль-Бакара». (Муслим)`,
      `Держись подальше от колдунов, гадалок и тех, кто просит неизвестные вещи, особые имена и изображения или большие деньги. Пророк ﷺ сказал: «Кто придёт к гадалке и спросит её о чём-либо, тому не будет принята молитва в течение сорока ночей». (Муслим)\nНе вешай неизвестные амулеты и записи и не держи их в доме ни для каких целей.`,
      `Пророк ﷺ сказал: «О рабы Аллаха, лечитесь, ибо Аллах не создал болезни, не создав от неё лекарства». (Абу Дауд и ат-Тирмизи)\nРукъя не заменяет врача. Если симптомы не проходят (страх, подавленность, бессонница, боль), обратись к врачу; часто есть медицинская причина.`,
      `Этот раздел служит напоминанием и обучением и не заменяет знающих учёных. В особых случаях спроси надёжного учёного. Курдские переводы должны быть проверены специалистами.`
    ],
    n: `Рукъя совершается только Кораном и достоверными дуа из Сунны; она не заменяет врача. Подробнее — в разделе «Руководство».`,
    s: { cards: `📖 Аяты и дуа`, cont: `🎧 Полное чтение`, yt: `📺 YouTube` }
  };

  PK.id = {
    k: [
      `Dengan nama Allah Yang Maha Pengasih, Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat, bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.`,
      `Allah, tidak ada tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus (makhluk-Nya). Dia tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi. Siapa yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya? Dia mengetahui apa yang di hadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu pun dari ilmu-Nya kecuali apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat memelihara keduanya. Dia Maha Tinggi, Maha Besar.`,
      `Rasul telah beriman kepada apa yang diturunkan kepadanya dari Tuhannya, demikian pula orang-orang beriman. Semuanya beriman kepada Allah, malaikat-Nya, kitab-kitab-Nya, dan rasul-rasul-Nya: “Kami tidak membeda-bedakan seorang pun dari rasul-rasul-Nya.” Dan mereka berkata: “Kami dengar dan kami taat. Ampunilah kami, wahai Tuhan kami, dan kepada-Mu tempat kembali.” (285)\nAllah tidak membebani seseorang melainkan sesuai kesanggupannya. Dia mendapat pahala dari (kebajikan) yang diusahakannya dan mendapat siksa dari (kejahatan) yang dikerjakannya. “Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau kami salah. Ya Tuhan kami, janganlah Engkau bebani kami dengan beban berat sebagaimana Engkau bebankan kepada orang-orang sebelum kami. Ya Tuhan kami, janganlah Engkau pikulkan kepada kami apa yang tidak sanggup kami memikulnya. Maafkanlah kami, ampunilah kami, dan rahmatilah kami. Engkaulah pelindung kami, maka tolonglah kami menghadapi kaum yang kafir.” (286)`,
      `Katakanlah: Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan, dan tidak ada sesuatu pun yang setara dengan Dia.`,
      `Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk-Nya, dari kejahatan malam apabila telah gelap gulita, dari kejahatan perempuan-perempuan penyihir yang meniup pada buhul-buhul, dan dari kejahatan orang yang dengki apabila dia dengki.`,
      `Katakanlah: Aku berlindung kepada Tuhan manusia, Raja manusia, Sembahan manusia, dari kejahatan (bisikan) setan yang bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia.`,
      `Dengan nama Allah aku meruqyahmu, dari segala sesuatu yang menyakitimu, dari kejahatan setiap jiwa dan mata yang dengki. Semoga Allah menyembuhkanmu. Dengan nama Allah aku meruqyahmu.`,
      `Ya Allah, Tuhan manusia, hilangkanlah penyakit dan sembuhkanlah, Engkaulah Yang Maha Menyembuhkan. Tidak ada kesembuhan kecuali kesembuhan dari-Mu, kesembuhan yang tidak meninggalkan penyakit.`,
      `Dengan nama Allah (tiga kali), kemudian tujuh kali: Aku berlindung kepada Allah dan kekuasaan-Nya dari kejahatan apa yang aku rasakan dan aku khawatirkan.`,
      `Dengan nama Allah yang bersama nama-Nya tidak ada sesuatu pun di bumi dan di langit yang dapat membahayakan, dan Dia Maha Mendengar, Maha Mengetahui.`,
      `Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang Dia ciptakan.`,
      `Aku memohonkan perlindungan bagi kalian berdua dengan kalimat-kalimat Allah yang sempurna, dari setiap setan dan binatang berbisa, dan dari setiap mata yang jahat.`,
      `Apa yang Allah kehendaki (pasti terjadi); tidak ada kekuatan kecuali dengan pertolongan Allah.`,
      `Ya Allah, berkahilah dia.`,
      `Tidak mengapa, semoga menjadi penyuci, insya Allah.`,
      `Aku memohon kepada Allah Yang Maha Agung, Tuhan Arsy yang agung, agar menyembuhkanmu.`,
      `Tidak ada tuhan selain Allah Yang Maha Agung lagi Maha Penyantun. Tidak ada tuhan selain Allah, Tuhan Arsy yang agung. Tidak ada tuhan selain Allah, Tuhan langit, Tuhan bumi, dan Tuhan Arsy yang mulia.`,
      `Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari murka dan siksa-Nya, dari kejahatan hamba-hamba-Nya, dari bisikan para setan, dan dari kehadiran mereka di dekatku.`,
      `Aku berlindung kepada Allah dari setan yang terkutuk.`,
      `Cukuplah Allah bagi kami, dan Dia sebaik-baik pelindung.`
    ],
    h: [
      `Seorang sahabat membacakan Al-Fatihah kepada seorang laki-laki yang tersengat, lalu ia sembuh. Nabi ﷺ bersabda: “Dari mana engkau tahu bahwa itu ruqyah?” (Bukhari dan Muslim)`,
      `Bacalah sebelum tidur: “Akan selalu ada penjaga dari Allah bersamamu, dan setan tidak akan mendekatimu hingga pagi.” (Bukhari)`,
      `“Barang siapa membaca dua ayat ini pada malam hari, keduanya sudah mencukupinya.” (Bukhari dan Muslim)`,
      `Setiap malam menjelang tidur, Nabi ﷺ menyatukan kedua telapak tangannya, meniup padanya, membaca Al-Ikhlas, Al-Falaq, dan An-Nas, lalu mengusapkannya ke tubuhnya sejauh yang dapat dijangkau; tiga kali. (Bukhari)`,
      `Tiga kali pada pagi, petang, dan sebelum tidur.`,
      `Jibril membacakan ini kepada Nabi ﷺ ketika beliau sakit.`,
      `Nabi ﷺ mengusap orang sakit dengan tangan kanannya sambil membaca ini. Untuk laki-laki lain, ucapkan “اشْفِهِ” (sembuhkanlah dia).`,
      `Letakkan tanganmu pada bagian yang sakit, ucapkan “Bismillah” tiga kali, lalu bacalah doa ini tujuh kali.`,
      `Barang siapa membacanya tiga kali pada pagi dan petang, tidak ada sesuatu pun yang membahayakannya.`,
      `Barang siapa singgah di suatu tempat (saat bepergian) lalu membaca ini, tidak ada sesuatu pun yang membahayakannya hingga ia meninggalkan tempat itu.`,
      `Nabi ﷺ memohonkan perlindungan bagi Hasan dan Husain dengan kalimat-kalimat ini.`,
      `Ucapkan ketika engkau melihat sesuatu yang kau sukai, atau sesuatu pada keluarga dan hartamu sendiri.`,
      `Jika salah seorang dari kalian melihat pada saudaranya sesuatu yang mengagumkannya, hendaklah ia mendoakan keberkahan baginya. (Pengaruh ‘ain itu nyata, dan doa ini melindungi darinya.)`,
      `Bacalah bersamanya surah Al-Falaq, An-Nas, dan Al-Fatihah.`,
      `Ketika menjenguk orang sakit, Nabi ﷺ mengucapkan ini.`,
      `Barang siapa menjenguk orang sakit yang belum tiba ajalnya lalu membaca ini tujuh kali, Allah akan menyembuhkannya.`,
      `Nabi ﷺ mengucapkan ini ketika dilanda kesusahan.`,
      `Ucapkan ketika engkau terbangun terkejut atau ketakutan dalam tidurmu.`,
      `Nabi ﷺ bersabda: jika orang yang marah mengucapkan ini, hilanglah marahnya.`,
      `Ibrahim (‘alaihis salam) mengucapkan ini ketika dilemparkan ke dalam api, dan Nabi ﷺ mengucapkannya saat ketakutan.`
    ],
    g: [
      `Membaca Al-Qur'an, nama-nama Allah, dan doa-doa Nabi untuk memohon kesembuhan dan perlindungan dari penyakit, ‘ain, dengki, dan kejahatan setan, dengan keyakinan bahwa Yang Menyembuhkan hanyalah Allah dan ruqyah sekadar sebab.`,
      `Nabi ﷺ bersabda: “Tunjukkan ruqyah kalian kepadaku; tidak mengapa ruqyah selama tidak mengandung syirik.” (Muslim)\nKarena itu: 1) Hanya dengan Al-Qur'an, nama-nama Allah, dan doa yang diperbolehkan. 2) Dengan bahasa yang dipahami maknanya. 3) Yakinlah bahwa ruqyah tidak berpengaruh dengan sendirinya dan Allah-lah yang menyembuhkan.`,
      `Bacalah ayat-ayat dan doa-doa, tiup ringan dengan tenang (tanpa banyak air liur) pada kedua tanganmu atau kepada orang sakit, lalu usapkan tangan ke tubuh, dimulai dari kepala dan wajah. (Nabi ﷺ melakukannya demikian — Bukhari.) Jika ada bagian yang sakit, letakkan tanganmu di sana.`,
      `Pagi, petang, dan sebelum tidur. Rumah juga terlindungi dengan membaca surah Al-Baqarah: “Setan lari dari rumah yang di dalamnya dibacakan surah Al-Baqarah.” (Muslim)`,
      `Jauhilah para penyihir, dukun, dan orang yang meminta hal-hal yang tidak jelas, nama dan gambar khusus, atau uang yang banyak. Nabi ﷺ bersabda: “Barang siapa mendatangi dukun lalu menanyakan sesuatu kepadanya, salatnya tidak diterima selama empat puluh malam.” (Muslim)\nJangan menggantungkan jimat atau tulisan yang tidak jelas, dan jangan menaruhnya di rumah untuk tujuan apa pun.`,
      `Nabi ﷺ bersabda: “Wahai hamba-hamba Allah, berobatlah; sebab Allah tidak menciptakan penyakit melainkan menciptakan obatnya.” (Abu Dawud dan At-Tirmidzi)\nRuqyah tidak menggantikan dokter. Jika gejala berlanjut (rasa takut, depresi, sulit tidur, nyeri), temuilah dokter; sering kali ada penyebab medis.`,
      `Bagian ini untuk pengingat dan pembelajaran dan tidak menggantikan ulama yang berkompeten. Untuk kasus khusus, tanyakan kepada ulama yang tepercaya. Terjemahan Kurdi perlu ditinjau oleh ahlinya.`
    ],
    n: `Ruqyah hanya dengan Al-Qur'an dan doa-doa sahih dari Sunnah; tidak menggantikan dokter. Lihat “Panduan” untuk keterangan lebih lanjut.`,
    s: { cards: `📖 Ayat & Doa`, cont: `🎧 Bacaan Penuh`, yt: `📺 YouTube` }
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
    var P = kurdish ? null : (PK[l] || PK.en);
    var i;

    var cards = v.querySelectorAll('.rq-card');
    for (i = 0; i < cards.length; i++) {
      var c = cards[i], idx = Number(c.getAttribute('data-i'));
      var ku = c.querySelector('.rq-ku'), how = c.querySelector('.rq-how');
      if (!P) { restore(ku); restore(how); if (ku) ku.style.display = ''; continue; }
      if (ku) {
        if (l === 'ar') ku.style.display = 'none';
        else { ku.style.display = ''; var kt = P.k[KUMAP[idx]]; if (kt) setText(ku, kt); }
      }
      var hi = HMAP[idx];
      if (how && hi >= 0 && P.h[hi]) setText(how, P.h[hi]);
    }

    var gs = v.querySelectorAll('.rq-g');
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].querySelector('p');
      if (!P) restore(p); else if (P.g[i]) setText(p, P.g[i]);
    }

    var note = v.querySelector('.rq-note');
    if (note) { if (!P) restore(note); else setText(note, P.n); }

    var bs = v.querySelectorAll('#rqSecBar button[data-rs]');
    for (i = 0; i < bs.length; i++) {
      var k = bs[i].getAttribute('data-rs');
      if (!P) restore(bs[i]); else if (P.s[k]) setText(bs[i], P.s[k]);
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
