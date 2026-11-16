/* salah.js v7 — local minute offsets — loads places from window.__SALAH_PLACES */
(function () {
  if (window.__salahV7) return;
  window.__salahV7 = true;
  var KEY = 'salah_v1';
  var NAMES = [
    { id: 'Fajr', ku: 'بەیانی', ar: 'الفجر' },
    { id: 'Sunrise', ku: 'ڕۆژهەڵاتن', ar: 'الشروق' },
    { id: 'Dhuhr', ku: 'نیوەڕۆ', ar: 'الظهر' },
    { id: 'Asr', ku: 'عەسر', ar: 'العصر' },
    { id: 'Maghrib', ku: 'مەغریب', ar: 'المغرب' },
    { id: 'Isha', ku: 'عیشا', ar: 'العشاء' }
  ];
  var PLACES = [];
  var PLACES_READY = false;
  function loadPlaces(cb) {
    if (PLACES_READY && PLACES.length) { if (cb) cb(); return; }
    if (window.__SALAH_PLACES && window.__SALAH_PLACES.length) {
      PLACES = window.__SALAH_PLACES;
      PLACES_READY = true;
      if (cb) cb();
      return;
    }
    fetch('salah-places.json?v=2').then(function (r) { return r.json(); }).then(function (arr) {
      if (arr && arr.length) PLACES = arr;
      PLACES_READY = true;
      if (cb) cb();
    }).catch(function () { PLACES_READY = true; if (cb) cb(); });
  }
  var S = { city: 'هەولێر', country: 'Iraq', lat: 36.1911, lng: 44.0094, method: 3, tab: 'times' };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  var times = null, tickTimer = null, qiblaWatch = null;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ city: S.city, country: S.country, lat: S.lat, lng: S.lng, method: S.method })); } catch (e) {}
  }
  function injectCss() {
    if (document.getElementById('salahCss')) return;
    var st = document.createElement('style');
    st.id = 'salahCss';
    st.textContent = '#salahView{padding:10px 12px calc(84px + env(safe-area-inset-bottom))}.salah-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.salah-head b{flex:1;text-align:center}.salah-head .tab{padding:8px 11px;display:inline-flex;align-items:center;justify-content:center}.salah-head svg{width:20px;height:20px}.salah-tabs{position:fixed;left:0;right:0;bottom:0;z-index:40;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:0;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce5e1;box-shadow:0 -4px 14px rgba(0,0,0,.06)}.salah-tabs button{border:0;background:transparent;border-radius:12px;padding:8px 2px;font-size:12.5px;display:flex;flex-direction:column;align-items:center;gap:3px;color:#4b5f57}.salah-tabs button svg{width:22px;height:22px}.salah-tabs button.on{background:#e3f2ea!important;color:#176b4b!important;font-weight:bold;border:0!important}.salah-tabs button span{display:block}#salahView:not(.loc-open) .salah-loc,#salahView:not(.loc-open) .salah-prov-list{display:none!important}#salahBody{display:flex;flex-direction:column;min-height:calc(100dvh - 190px)}.salah-list{flex:1;display:flex;flex-direction:column}.salah-list .salah-row{flex:1;min-height:50px;align-items:center}.salah-hero{padding:14px 12px!important;margin-bottom:8px!important}.salah-ring{width:132px!important;height:132px!important}.now-name{font-size:21px!important}.now-clock{font-size:26px!important}.salah-loc{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}.salah-loc input{flex:1;min-width:140px;border:1px solid #dce5e1;border-radius:11px;padding:10px}.salah-loc button{border:0;border-radius:11px;padding:10px 12px;background:#176b4b;color:#fff;display:inline-flex;align-items:center}.salah-loc button svg{width:22px;height:22px;stroke:#fff}.salah-prov-list{max-height:240px;overflow:auto;border:1px solid #dce5e1;border-radius:12px;background:#fff;display:none}.salah-prov-list.open{display:block}.salah-prov-item{padding:11px 12px;border-bottom:1px solid #eef2f1;cursor:pointer;display:flex;justify-content:space-between}.salah-hero{background:#176b4b;color:#fff;border-radius:22px;padding:22px 16px;margin-bottom:14px;text-align:center}.salah-ring{width:168px;height:168px;margin:0 auto 8px;border-radius:50%;border:6px solid rgba(255,255,255,.35);border-top-color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}.now-name{font-size:26px;font-weight:bold}.now-clock{font-size:32px;font-weight:bold;direction:ltr}.now-label{font-size:13px;opacity:.95}.now-loc{font-size:12px;opacity:.9;margin-top:10px}.now-since{font-size:13px;margin-top:6px}.salah-row{display:flex;justify-content:space-between;padding:14px 6px;border-bottom:1px solid #eef2f1;cursor:pointer}.salah-row.current{background:#e8f3ee;margin:0 -6px;padding:14px 12px;border-radius:12px}.salah-row .nm{font-weight:bold;font-size:16px}.salah-row .tm{font-weight:bold;direction:ltr}.salah-card{background:#fff;border:1px solid #dce5e1;border-radius:14px;padding:14px;margin-bottom:10px}.qibla-compass{width:220px;height:220px;margin:12px auto;border-radius:50%;border:6px solid #176b4b;position:relative;background:radial-gradient(circle,#f9fbfa,#e8f3ee)}.qibla-needle{position:absolute;left:50%;top:50%;width:4px;height:90px;margin-left:-2px;margin-top:-90px;background:linear-gradient(#c0392b,#e74c3c);transform-origin:bottom center;border-radius:2px}.qibla-kaaba{position:absolute;left:50%;top:12px;transform:translateX(-50%);font-size:22px}.qibla-deg{font-size:22px;font-weight:bold;direction:ltr;margin-top:8px}.salah-choice{border-color:#b8c9e0;background:linear-gradient(135deg,#fff,#eef3fb)}';
    document.head.appendChild(st);
  }
  function parseHM(s){var m=String(s||'').match(/(\d{1,2}):(\d{2})/);return m?{h:+m[1],m:+m[2]}:null;}
  function inIraq(lat,lng){return lat>=28.9&&lat<=37.5&&lng>=38.7&&lng<=48.8;}
  function tzOf(){return S.tz||(inIraq(S.lat,S.lng)?'Asia/Baghdad':'');}
  /* wall-clock "now" of the chosen place (a Date whose local fields equal the place's clock) */
  function placeNow(){
    var tz=tzOf();
    if(tz){try{return new Date(new Date().toLocaleString('en-US',{timeZone:tz}));}catch(e){}}
    return new Date();
  }
  function ymd(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
  function toDate(hm){if(!hm)return null;var d=placeNow();d.setHours(hm.h,hm.m,0,0);return d;}
  function fmtHM(d){if(!d)return'--:--';var h=d.getHours(),m=d.getMinutes();return(h<10?'0':'')+h+':'+(m<10?'0':'')+m;}
  function fmtClock(ms){if(ms<0)ms=0;var t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;function p(n){return(n<10?'0':'')+n;}return p(h)+':'+p(m)+':'+p(s);}
  function fmtDurWords(ms){if(ms<0)ms=0;var t=Math.floor(ms/60000),h=Math.floor(t/60),m=t%60;return h>0?(h+' کاتژمێر و '+m+' خولەک'):(m+' خولەک');}
  function getTimeline(){
    if(!times)return null;var now=placeNow();
    var list=NAMES.map(function(n){var d=toDate(parseHM(times[n.id]));return{id:n.id,ku:n.ku,ar:n.ar,date:d};}).filter(function(x){return x.date;});
    var current=null,next=null;
    for(var i=0;i<list.length;i++){if(list[i].date<=now)current=list[i];if(list[i].date>now&&!next)next=list[i];}
    if(!next&&list.length){var fajr=list.find(function(x){return x.id==='Fajr';});if(fajr){next=Object.assign({},fajr);next.date=new Date(fajr.date.getTime()+86400000);}}
    if(!current&&list.length){var isha=list.find(function(x){return x.id==='Isha';});if(isha){current=Object.assign({},isha);current.date=new Date(isha.date.getTime()-86400000);current.yesterday=true;}}
    return{list:list,current:current,next:next,now:now};
  }
  function getOffsets() {
    var o = { Fajr: 0, Sunrise: 0, Dhuhr: 10, Asr: 0, Maghrib: 3, Isha: 0 };
    try {
      var cfg = JSON.parse(localStorage.getItem('salah_settings_v1') || '{}');
      if (cfg.method != null) S.method = cfg.method;
      if (cfg.school != null) S.school = cfg.school;
      if (cfg.offsets) {
        ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].forEach(function (k) {
          if (typeof cfg.offsets[k] === 'number') o[k] = cfg.offsets[k];
        });
      }
    } catch (e) {}
    return o;
  }
  function addMinutes(hmStr, mins) {
    var m = String(hmStr || '').match(/(\d{1,2}):(\d{2})/);
    if (!m) return hmStr;
    var total = (+m[1]) * 60 + (+m[2]) + (mins || 0);
    if (total < 0) total += 24 * 60;
    total = total % (24 * 60);
    var h = Math.floor(total / 60), mi = total % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi;
  }
  async function fetchTimes(){
    var off = inIraq(S.lat, S.lng) ? getOffsets() : { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
    if (!inIraq(S.lat, S.lng)) getOffsets();
    var school = 0;
    try { var c = JSON.parse(localStorage.getItem('salah_settings_v1')||'{}'); if (c.school!=null) school=+c.school; } catch(e){}
    var pn = placeNow(), dd = ('0'+pn.getDate()).slice(-2)+'-'+('0'+(pn.getMonth()+1)).slice(-2)+'-'+pn.getFullYear();
    var url='https://api.aladhan.com/v1/timings/'+dd+'?latitude='+encodeURIComponent(S.lat)
      +'&longitude='+encodeURIComponent(S.lng)
      +'&method='+encodeURIComponent(S.method||3)
      +'&school='+encodeURIComponent(school)
      +'&_='+Date.now();
    var r=await fetch(url);if(!r.ok)throw new Error('net');
    var j=await r.json();if(!j.data||!j.data.timings)throw new Error('empty');
    var raw = j.data.timings;
    try { if (j.data.meta && j.data.meta.timezone) S.tz = j.data.meta.timezone; } catch (e) {}
    S.fetchedDay = ymd(placeNow());
    times = {};
    ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha','Sunset','Imsak','Midnight'].forEach(function(k){
      if (raw[k] != null) times[k] = addMinutes(raw[k], off[k] || 0);
    });
    return times;
  }
  async function applyPlace(p){
    S.lat=+p.lat;S.lng=+p.lng;S.city=p.ku;S.country=inIraq(S.lat,S.lng)?'Iraq':(p.en||'');S.tz='';times=null;save();await fetchTimes();
  }
  function norm(x){return String(x||'').toLowerCase().replace(/[\u064b-\u065f\u0670]/g,'').replace(/[كڪ]/g,'ک').replace(/[يىێ]/g,'ی').replace(/[ڵ]/g,'ل').replace(/[ڕ]/g,'ر').replace(/[ۆۊ]/g,'و').replace(/[ەهۀة]/g,'ه').replace(/[أإآ]/g,'ا').replace(/\s+/g,' ').trim();}
  var TXT={en:{tk_t:'My prayer log',tk_today:'Today',tk_streak:'Streak',tk_days:'days',tk_week:'This week',tk_hint:'Tap ✓ when you have prayed.',home:'Home',title:'Prayer times',ph:'Search: city, town…',t_times:'Times',t_virt:'Virtues',t_qibla:'Qibla',left:'Time left',since:'since the call to prayer',ago:'{0} since the adhan of {1}',until:'{0} left until {1}',now:'Now',h:'h',m:'min',srch:'Searching online…',nores:'No place found',net:'Search needs internet',gpsErr:'Could not get your location. Allow Location for this app/browser in the phone settings, or search for your town above.',cur:'Current location'},ar:{tk_t:'سجل صلواتي',tk_today:'اليوم',tk_streak:'التتابع',tk_days:'أيام',tk_week:'هذا الأسبوع',tk_hint:'اضغط ✓ عند أداء الصلاة.',home:'الرئيسية',title:'مواقيت الصلاة',ph:'ابحث: مدينة، بلدة…',t_times:'المواقيت',t_virt:'الفضائل',t_qibla:'القبلة',left:'الوقت المتبقي',since:'منذ الأذان',ago:'مضى {0} على أذان {1}',until:'متبقٍّ {0} حتى {1}',now:'الآن',h:'س',m:'د',srch:'جارٍ البحث عبر الإنترنت…',nores:'لم يتم العثور على مكان',net:'البحث يحتاج إلى اتصال بالإنترنت',gpsErr:'تعذّر تحديد موقعك. فعّل إذن الموقع للتطبيق/المتصفح من إعدادات الهاتف، أو ابحث عن مدينتك أعلاه.',cur:'الموقع الحالي'},ckb:{tk_t:'تۆماری نوێژەکانم',tk_today:'ئەمڕۆ',tk_streak:'زنجیرە',tk_days:'ڕۆژ',tk_week:'ئەم حەفتەیە',tk_hint:'دوگمەی ✓ بدە کاتێک نوێژەکەت کرد.',home:'سەرەتا',title:'نوێژەکانم',ph:'گەڕان: شار، ناحیە...',t_times:'کاتەکان',t_virt:'فەزڵ',t_qibla:'قیبلە',left:'کاتی ماوە',ago:'{0} بانگی {1} دراوە',until:'{0} ماوە بۆ {1}',now:'ئێستا',h:'کاتژمێر',m:'خولەک',srch:'گەڕان لە ئینتەرنێت…',nores:'هیچ شوێنێک نەدۆزرایەوە',net:'گەڕان پێویستی بە ئینتەرنێت هەیە',gpsErr:'نەتوانرا شوێنەکەت بدۆزرێتەوە. لە ڕێکخستنی مۆبایل/براوزەر ڕێگە بە شوێن (Location) بدە، یان لە سەرەوە ناوی شارۆچکەکەت بگەڕێ.',cur:'شوێنی ئێستا'}};
  var PN_EN={Fajr:'Fajr',Sunrise:'Sunrise',Dhuhr:'Dhuhr',Asr:'Asr',Maghrib:'Maghrib',Isha:'Isha'};
  function pn(x){var l=window.appLang||'ckb';if(l==='ar')return x.ar;if(l==='ckb'||l==='bad')return x.ku;return PN_EN[x.id]||x.ar;}
  function pn2(x){var l=window.appLang||'ckb';return l==='ar'?'':x.ar;}
  function durW(ms){if(ms<0)ms=0;var t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),sc=t%60,l=window.appLang||'ckb';
    if(l==='ckb'||l==='bad'){var a=[];if(h)a.push(h+' کاتژمێر');if(h||m)a.push(m+' خولەک');a.push(sc+' چرکە');return a.join(' و ');}
    if(l==='ar'){var b=[];if(h)b.push(h+' ساعة');if(h||m)b.push(m+' دقيقة');b.push(sc+' ثانية');return b.join(' و ');}
    return (h?h+'h ':'')+((h||m)?m+'m ':'')+sc+'s';}
  function tx(k){var l=window.appLang||'ckb';var t=TXT[l]||(l==='bad'?TXT.ckb:TXT.en);return t[k]||TXT.ckb[k];}
  function filterPlaces(q){
    q=norm(q);var all=window.__SALAH_PLACES||[];
    if(!q)return all.slice();
    return all.filter(function(p){return norm(p.ku).indexOf(q)>=0||norm(p.ar).indexOf(q)>=0||norm(p.en).indexOf(q)>=0;});
  }
  function gcache(){try{return JSON.parse(localStorage.getItem('salah_geo_v1')||'{}');}catch(e){return {};}}
  function gset(k,v){try{var c=gcache();c[k]=v;var ks=Object.keys(c);if(ks.length>80)delete c[ks[0]];localStorage.setItem('salah_geo_v1',JSON.stringify(c));}catch(e){}}
  function gl(){var l=window.appLang||'ckb';return l==='ckb'||l==='bad'?'ku,ar,en':(l==='ar'?'ar,en':l+',en');}
  async function searchOnline(q){
    var key='s:'+gl()+':'+norm(q),c=gcache();if(c[key])return c[key];
    var out=[];
    for(var pass=0;pass<2&&!out.length;pass++){
      var u='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&accept-language='+encodeURIComponent(gl())+(pass===0?'&countrycodes=iq':'')+'&q='+encodeURIComponent(q);
      var r=await fetch(u);if(!r.ok)throw new Error('geo');var d=await r.json();
      out=d.filter(function(x){return x.lat&&x.lon;}).map(function(x){var parts=String(x.display_name||'').split(',').map(function(t){return t.trim();});return {ku:x.name||parts[0],ar:parts.slice(1,3).join(' · '),en:'',lat:+x.lat,lng:+x.lon,online:1};});
    }
    gset(key,out);return out;
  }
  async function placeName(lat,lng){
    var key='r:'+gl()+':'+lat.toFixed(2)+','+lng.toFixed(2),c=gcache();if(c[key])return c[key];
    try{var r=await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=13&accept-language='+encodeURIComponent(gl())+'&lat='+lat+'&lon='+lng);if(!r.ok)return '';var d=await r.json();var a=d.address||{};var n=a.village||a.town||a.suburb||a.city_district||a.city||a.municipality||a.county||d.name||'';if(n)gset(key,n);return n;}catch(e){return '';}
  }
  var searchTimer=null,searchSeq=0;
  function renderProvList(q){
    var list=document.getElementById('salahProvList');if(!list)return;
    loadPlaces(function(){
      var items=filterPlaces(q);var all=window.__SALAH_PLACES||[];
      var qq=(q||'').trim();var seq=++searchSeq;clearTimeout(searchTimer);
      if(qq.length>=2&&items.length<4){
        searchTimer=setTimeout(async function(){
          if(seq!==searchSeq)return;
          var cur=document.getElementById('salahProvList');if(!cur)return;
          var hint=document.createElement('div');hint.className='salah-prov-item';hint.innerHTML='<span>'+tx('srch')+'</span>';cur.appendChild(hint);
          try{var on=await searchOnline(qq);if(seq!==searchSeq)return;hint.remove();
            if(on.length){var shown=items.map(function(p){return p;});on.forEach(function(p){shown.push(p);});draw(shown);}
            else if(!items.length){cur.innerHTML='<div class="salah-prov-item"><span>'+tx('nores')+'</span></div>';}
          }catch(e){hint.innerHTML='<span>'+tx('net')+'</span>';}
        },450);
      }
      draw(items);
      function draw(arr){
      if(!arr.length){list.innerHTML='<div class="salah-prov-item"><span>'+tx('nores')+'</span></div>';list.classList.add('open');return;}
      list.innerHTML=arr.map(function(p,i){var idx=all.indexOf(p);return '<div class="salah-prov-item" data-i="'+idx+'" data-o="'+i+'"><b>'+(p.online?'🌐 ':'')+p.ku+'</b><span>'+(p.ar||'')+(p.en?' · '+p.en:'')+'</span></div>';}).join('');
      list.classList.add('open');
      list.querySelectorAll('.salah-prov-item').forEach(function(el){
        el.onclick=async function(){
          var p=arr[+el.getAttribute('data-o')];if(!p)return;list.classList.remove('open');
          var input=document.getElementById('salahCity');if(input)input.value=p.ku;
          try{await applyPlace(p);var sv=document.getElementById('salahView');if(sv)sv.classList.remove('loc-open');setTab('times');startTick();}catch(e){alert('نەتوانرا کاتەکان بهێنرێن.');}
        };
      });
      }
    });
  }
  async function useGPSAndLoad(){
    if(!navigator.geolocation)throw new Error('no-geo');
    var pos=await new Promise(function(res,rej){navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:15000});});
    S.lat=pos.coords.latitude;S.lng=pos.coords.longitude;S.city=tx('cur');S.country=inIraq(S.lat,S.lng)?'Iraq':'';S.tz='';times=null;save();await fetchTimes();
    placeName(S.lat,S.lng).then(function(n){if(n&&S.city===tx('cur')){S.city=n;save();var ci=document.getElementById('salahCity');if(ci)ci.value=n;if(typeof renderTimes==='function'&&document.getElementById('salahBody')&&(S.tab||'times')==='times')try{renderTimes();}catch(e){}}});
  }
  function qiblaBearing(lat,lng){
    var kLat=21.4225*Math.PI/180,kLng=39.8262*Math.PI/180;
    var φ1=lat*Math.PI/180,φ2=kLat,Δλ=kLng-lng*Math.PI/180;
    var y=Math.sin(Δλ)*Math.cos(φ2);
    var x=Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    return ((Math.atan2(y,x)*180)/Math.PI+360)%360;
  }
  var TRK='salah_track_v1';
  function trkAll(){try{return JSON.parse(localStorage.getItem(TRK)||'{}')||{};}catch(e){return{};}}
  function dkey(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  function trkCount(a,k){var o=a[k]||{},n=0;['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(function(i){if(o[i])n++;});return n;}
  function trkToggle(id){var a=trkAll(),k=dkey(placeNow());a[k]=a[k]||{};if(a[k][id])delete a[k][id];else a[k][id]=1;var ks=Object.keys(a).sort();while(ks.length>120)delete a[ks.shift()];try{localStorage.setItem(TRK,JSON.stringify(a));}catch(e){}}
  function trkStats(){var a=trkAll(),d=placeNow(),today=trkCount(a,dkey(d)),streak=0,x=new Date(d.getTime());if(today<5)x.setDate(x.getDate()-1);while(trkCount(a,dkey(x))===5&&streak<400){streak++;x.setDate(x.getDate()-1);}var w=0,dots='';for(var i=6;i>=0;i--){var y=new Date(d.getTime());y.setDate(y.getDate()-i);var c=trkCount(a,dkey(y));w+=c;dots+='<span style="flex:1;height:'+(6+c*5)+'px;background:'+(c===5?'#176b4b':c?'#7fc3a3':'#dce5e1')+';border-radius:4px"></span>';}return{today:today,streak:streak,week:w,dots:dots};}
  function trkCard(){var st=trkStats();return '<div class="salah-card" id="salahTrk"><b>'+tx('tk_t')+'</b><div style="display:flex;gap:14px;margin:10px 0;text-align:center"><div style="flex:1"><div style="font-size:22px;font-weight:700;color:#176b4b">'+st.today+'/5</div><div style="font-size:12px;opacity:.75">'+tx('tk_today')+'</div></div><div style="flex:1"><div style="font-size:22px;font-weight:700;color:#176b4b">'+st.streak+'</div><div style="font-size:12px;opacity:.75">'+tx('tk_streak')+' ('+tx('tk_days')+')</div></div><div style="flex:1"><div style="font-size:22px;font-weight:700;color:#176b4b">'+st.week+'/35</div><div style="font-size:12px;opacity:.75">'+tx('tk_week')+'</div></div></div><div dir="ltr" style="display:flex;align-items:flex-end;gap:5px;height:42px">'+st.dots+'</div><div style="font-size:11.5px;opacity:.7;margin-top:8px">'+tx('tk_hint')+'</div></div>';}
  function renderTimes(){
    var box=document.getElementById('salahBody');if(!box)return;
    var tl=getTimeline();
    if(!tl){box.innerHTML='<div class="salah-card">کاتەکان بارنەبوون.</div>';return;}
    var cur=tl.current,next=tl.next;
    var since=cur?tl.now-cur.date:0,until=next?next.date-tl.now:0;
    var clock=next?fmtClock(until):fmtClock(since);
    var focus=next||cur;
    var hero='<div class="salah-hero"><div class="salah-ring"><div class="now-name">'+(focus?pn(focus):'—')+'</div><div class="now-clock" id="salahLiveClock">'+clock+'</div><div class="now-label">'+(next?tx('left'):tx('since'))+'</div></div>'+
      (cur?'<div class="now-since" id="salahSinceLine">'+tx('ago').replace('{0}',durW(since)).replace('{1}','<b>'+pn(cur)+'</b>')+'</div>':'')+
      (next&&cur?'<div class="now-since" id="salahUntilLine">'+tx('until').replace('{0}',durW(until)).replace('{1}','<b>'+pn(next)+'</b>')+'</div>':'')+
      '<div class="now-loc"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg> '+(S.city||'')+(S.country?' · '+S.country:'')+'<br dir="ltr">'+S.lat.toFixed(4)+', '+S.lng.toFixed(4)+'</div></div>';
    var rows=tl.list.map(function(x){
      var isCur=cur&&x.id===cur.id&&!cur.yesterday;var past=x.date<tl.now&&!isCur;
      return '<div class="salah-row'+(isCur?' current':'')+(past?' past':'')+'"><div><div class="nm">'+pn(x)+(isCur?' · '+tx('now'):'')+'</div><div class="ar">'+pn2(x)+'</div></div><div style="display:flex;align-items:center;gap:10px">'+(x.id!=='Sunrise'?'<button type="button" class="trk-b" data-trk="'+x.id+'" aria-label="✓" style="width:30px;height:30px;border-radius:50%;border:2px solid '+(trkAll()[dkey(placeNow())]&&trkAll()[dkey(placeNow())][x.id]?'#176b4b':'#b9c8c1')+';background:'+(trkAll()[dkey(placeNow())]&&trkAll()[dkey(placeNow())][x.id]?'#176b4b':'transparent')+';color:#fff;font-size:15px;line-height:1;padding:0">'+(trkAll()[dkey(placeNow())]&&trkAll()[dkey(placeNow())][x.id]?'✓':'')+'</button>':'')+'<div class="tm">'+fmtHM(x.date)+'</div></div></div>';
    }).join('');
    box.innerHTML=hero+'<div class="salah-list">'+rows+'</div>'+trkCard()+(window.__salahHijri?window.__salahHijri.card():'');
    if(window.__salahHijri)window.__salahHijri.bind(box,renderTimes);else if(!window.__hjLoading){window.__hjLoading=1;var hs=document.createElement('script');hs.src='salah-hijri.js?v=3';hs.onload=function(){if(document.getElementById('salahBody')===box&&S.tab==='times')renderTimes();};document.head.appendChild(hs);}
    box.querySelectorAll('.trk-b').forEach(function(b){b.onclick=function(){trkToggle(b.getAttribute('data-trk'));var y=box.scrollTop,w=window.scrollY;renderTimes();box.scrollTop=y;window.scrollTo(0,w);};});
  }
  function tickLive(){
    if(times&&S.fetchedDay&&S.fetchedDay!==ymd(placeNow())&&!S.__refetch){S.__refetch=1;fetchTimes().then(function(){S.__refetch=0;try{renderTimes();}catch(e){}}).catch(function(){S.__refetch=0;});}
    if(S.tab!=='times')return;var view=document.getElementById('salahView');
    if(!view||!view.classList.contains('active'))return;
    var tl=getTimeline();if(!tl)return;
    var cur=tl.current,next=tl.next,since=cur?tl.now-cur.date:0,until=next?next.date-tl.now:0;
    var clockEl=document.getElementById('salahLiveClock');
    if(clockEl){if(next)clockEl.textContent=fmtClock(until);else if(cur)clockEl.textContent=fmtClock(since);}
    var sl=document.getElementById('salahSinceLine');if(sl&&cur)sl.innerHTML=tx('ago').replace('{0}',durW(since)).replace('{1}','<b>'+pn(cur)+'</b>');
    var ul=document.getElementById('salahUntilLine');if(ul&&next&&cur)ul.innerHTML=tx('until').replace('{0}',durW(until)).replace('{1}','<b>'+pn(next)+'</b>');
    if(next&&until<=0)renderTimes();
  }
  function renderVirtues(){
    var box=document.getElementById('salahBody');if(!box)return;
    box.setAttribute('data-no-translate','1');
    if(window.__salahVirtues){window.__salahVirtues(box);return;}
    var sc=document.createElement('script');sc.src='salah-virtues.js?v=1';sc.onload=function(){if(window.__salahVirtues&&document.getElementById('salahBody')===box)window.__salahVirtues(box);};document.head.appendChild(sc);
  }
  function stopQibla(){if(qiblaWatch){window.removeEventListener('deviceorientation',qiblaWatch,true);window.removeEventListener('deviceorientationabsolute',qiblaWatch,true);qiblaWatch=null;}}
  var TQ={ckb:{qibla:'قیبلە',start:'چالاککردن',move:'مۆبایلەکە ڕاستەخۆ (تەخت) بگرە و بە شێوەی ٨ بیجوڵێنە بۆ ڕێکخستنی کۆمپاس. ئاسنی نزیک لێی دووربخەرەوە.',nosensor:'ئەم مۆبایل/براوزەرە کۆمپاسی نییە. دەتوانیت بە کۆمپاسێکی تر، ڕووت بکە لای {0}° لە باکوورەوە.',deny:'ڕێگە نەدرا.'},en:{qibla:'Qibla',start:'Activate',move:'Hold the phone flat and move it in a figure-8 to calibrate. Keep it away from metal.',nosensor:'This phone/browser has no compass. Use another compass and face {0}° from North.',deny:'Permission denied.'},ar:{qibla:'القبلة',start:'تفعيل',move:'أمسك الهاتف أفقيًا وحرّكه على شكل ٨ للمعايرة، وأبعده عن المعادن.',nosensor:'هذا الهاتف/المتصفح لا يملك بوصلة. استخدم بوصلة أخرى واتجه {0}° من الشمال.',deny:'تم رفض الإذن.'}};
  function tq(k){var l=window.appLang||'ckb';var t=TQ[l]||(l==='bad'?TQ.ckb:TQ.en);var v=t[k]||TQ.ckb[k]||'';return v.replace('{0}',qiblaBearing(S.lat,S.lng).toFixed(0));}
  function renderQibla(){
    var box=document.getElementById('salahBody');if(!box)return;stopQibla();
    var bearing=qiblaBearing(S.lat,S.lng);
    box.innerHTML='<div class="salah-card" style="text-align:center"><b>قیبلەنما</b><div>📍 '+(S.city||'')+' · <b dir="ltr">'+bearing.toFixed(1)+'°</b></div><div class="qibla-compass"><div class="qibla-kaaba">🕋</div><div class="qibla-needle" id="qiblaNeedle"></div></div><div class="qibla-deg" id="qiblaDeg">'+bearing.toFixed(0)+'°</div><div id="qiblaMsg" style="font-size:12px;opacity:.75;margin-top:6px"></div><button type="button" id="qiblaCalib" style="margin-top:12px;padding:10px 16px;border:0;border-radius:10px;background:#176b4b;color:#fff">'+tq('start')+'</button></div>';
    var needle=document.getElementById('qiblaNeedle'),degEl=document.getElementById('qiblaDeg');
    var sm=null,got=false,lastT=0;
    function decl(){return inIraq(S.lat,S.lng)?5:0;} /* magnetic declination: about +5° east in Iraq */
    function headingOf(e){
      if(typeof e.webkitCompassHeading==='number'&&!isNaN(e.webkitCompassHeading))return e.webkitCompassHeading;
      if(typeof e.alpha!=='number'||typeof e.beta!=='number'||typeof e.gamma!=='number')return null;
      var d=Math.PI/180,x=e.beta*d,y=e.gamma*d,z=e.alpha*d,h;
      if(Math.cos(x)*Math.cos(y)>0.6){h=Math.atan2(-Math.sin(z)*Math.cos(x),Math.cos(z)*Math.cos(x));} /* phone (mostly) flat: direction of the top edge */
      else{var cY=Math.cos(y),cZ=Math.cos(z),sX=Math.sin(x),sY=Math.sin(y),sZ=Math.sin(z);h=Math.atan2(-cZ*sY-sZ*sX*cY,-sZ*sY+cZ*sX*cY);} /* held upright: direction the back faces */
      if(h<0)h+=2*Math.PI;return h/d;
    }
    function onOrient(e){
      if(window.__qAbs&&e.type==='deviceorientation')return; /* Android: only use the absolute (north-referenced) stream */
      var h=headingOf(e);if(h==null)return;
      h=(h+decl()+360)%360;got=true;
      var r=h*Math.PI/180;
      if(!sm)sm={s:Math.sin(r),c:Math.cos(r)};else{sm.s+=(Math.sin(r)-sm.s)*0.2;sm.c+=(Math.cos(r)-sm.c)*0.2;}
      var now=Date.now();if(now-lastT<60)return;lastT=now;
      var hh=(Math.atan2(sm.s,sm.c)*180/Math.PI+360)%360,diff=((bearing-hh)+540)%360-180;
      if(needle){needle.style.transform='rotate('+(bearing-hh)+'deg)';needle.style.background=Math.abs(diff)<4?'#16a34a':'';}
      if(degEl)degEl.textContent=hh.toFixed(0)+'° · '+(Math.abs(diff)<4?'✅ ':'')+tq('qibla')+' '+bearing.toFixed(0)+'°';
    }
    function startCompass(){
      stopQibla();window.__qAbs=('ondeviceorientationabsolute' in window);
      qiblaWatch=onOrient;
      if(window.__qAbs)window.addEventListener('deviceorientationabsolute',onOrient,true);
      window.addEventListener('deviceorientation',onOrient,true);
      var msg=document.getElementById('qiblaMsg');if(msg)msg.textContent=tq('move');
      setTimeout(function(){if(!got&&msg)msg.textContent=tq('nosensor');},2500);
    }
    var cb=document.getElementById('qiblaCalib');
    cb.onclick=async function(){
      try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){var p=await DeviceOrientationEvent.requestPermission();if(p!=='granted'){alert(tq('deny'));return;}}}catch(e){}
      startCompass();
    };
    if(!(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function')){startCompass();cb.style.display='none';}
  }
  function setTab(tab){
    S.tab=tab;
    document.querySelectorAll('.salah-tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab);});
    if(tab==='times')renderTimes();else if(tab==='virtues'){stopQibla();renderVirtues();}else if(tab==='qibla')renderQibla();
  }
  function startTick(){if(tickTimer)clearInterval(tickTimer);tickTimer=setInterval(tickLive,1000);}
  function ensureView(){
    injectCss();var main=document.querySelector('.main');if(!main)return null;
    var v=document.getElementById('salahView');if(v)return v;
    v=document.createElement('section');v.id='salahView';v.className='view';
    v.innerHTML='<div class="salah-head"><button class="tab" type="button" id="salahBack">‹ '+tx('home')+'</button><b>'+tx('title')+'</b><button class="tab" type="button" id="salahLocBtn" aria-label="location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></button><button class="tab" type="button" id="salahRefresh" aria-label="refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.6"/><path d="M20 4v7h-7"/></svg></button></div><div class="salah-loc"><input id="salahCity" placeholder="'+tx('ph')+'" autocomplete="off" /><button type="button" id="salahGps" aria-label="gps"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></button></div><div id="salahProvList" class="salah-prov-list"></div><div class="salah-tabs"><button type="button" data-tab="times" class="on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>'+tx('t_times')+'</span></button><button type="button" data-tab="virtues"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/></svg><span>'+tx('t_virt')+'</span></button><button type="button" data-tab="qibla"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg><span>'+tx('t_qibla')+'</span></button></div><div id="salahBody"><div class="card muted">...</div></div>';
    main.appendChild(v);
    document.getElementById('salahBack').onclick=function(){stopQibla();if(tickTimer){clearInterval(tickTimer);tickTimer=null;}if(typeof showView==='function')showView('startScreen','بەشەکان');};
    document.getElementById('salahLocBtn').onclick=function(){v.classList.toggle('loc-open');if(v.classList.contains('loc-open')){var ci=document.getElementById('salahCity');if(ci){ci.value='';ci.focus();}}};
    document.getElementById('salahRefresh').onclick=async function(){times=null;await loadAndShow();};
    var cityInput=document.getElementById('salahCity');
    cityInput.addEventListener('focus',function(){renderProvList(cityInput.value);});
    cityInput.addEventListener('input',function(){renderProvList(cityInput.value);});
    document.getElementById('salahGps').onclick=async function(){
      try{await useGPSAndLoad();cityInput.value=S.city;v.classList.remove('loc-open');setTab('times');startTick();}catch(e){alert(tx('gpsErr'));}
    };
    document.querySelectorAll('.salah-tabs button').forEach(function(b){b.onclick=function(){setTab(b.getAttribute('data-tab'));};});
    return v;
  }
  async function loadAndShow(){
    ensureView();if(typeof showView==='function')showView('salahView','نوێژەکانم');
    try{var bottom=document.querySelector('.bottom');if(bottom)bottom.classList.add('hidden');}catch(e){}
    var cityInput=document.getElementById('salahCity');if(cityInput)cityInput.value=S.city||'';
    loadPlaces();
    try{await useGPSAndLoad();if(cityInput)cityInput.value=S.city;}catch(e){try{if(!times)await fetchTimes();}catch(e2){}}
    setTab(S.tab||'times');startTick();
  }
  window.enterSalah=function(){loadAndShow();};
  function injectStartCard(){
    var box=document.querySelector('#startScreen .section-choices');
    if(!box||box.querySelector('.salah-choice'))return;
    var b=document.createElement('button');b.className='section-choice salah-choice';b.type='button';
    b.onclick=function(){window.enterSalah();};
    b.innerHTML='<span class="choice-icon">🕌</span><span class="choice-copy"><b>نوێژەکانم</b><small>کاتی نوێژ · قیبلە</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b);
  }
  function boot(){injectCss();injectStartCard();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,40);setTimeout(boot,400);});}
  else{setTimeout(boot,40);setTimeout(boot,400);}
  var tries=0;var t=setInterval(function(){boot();if(++tries>40)clearInterval(t);},300);
  window.__salahCore={getTimes:function(){return times;}};
})();
