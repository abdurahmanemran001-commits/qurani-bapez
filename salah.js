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
    st.textContent = '#salahView{padding:10px 12px calc(84px + env(safe-area-inset-bottom))}.salah-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}.salah-head b{flex:1;text-align:center}.salah-head .tab{padding:8px 11px;display:inline-flex;align-items:center;justify-content:center}.salah-head svg{width:20px;height:20px}.salah-tabs{position:fixed;left:0;right:0;bottom:0;z-index:40;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;margin:0;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce5e1;box-shadow:0 -4px 14px rgba(0,0,0,.06)}.salah-tabs button{border:0;background:transparent;border-radius:12px;padding:8px 2px;font-size:12.5px;display:flex;flex-direction:column;align-items:center;gap:3px;color:#4b5f57}.salah-tabs button svg{width:22px;height:22px}.salah-tabs button.on{background:#e3f2ea!important;color:#176b4b!important;font-weight:bold;border:0!important}.salah-tabs button span{display:block}#salahView:not(.loc-open) .salah-loc,#salahView:not(.loc-open) .salah-prov-list{display:none!important}#salahBody{display:flex;flex-direction:column;min-height:calc(100dvh - 190px)}.salah-list{flex:1;display:flex;flex-direction:column}.salah-list .salah-row{flex:1;min-height:50px;align-items:center}.salah-hero{padding:14px 12px!important;margin-bottom:8px!important}.salah-ring{width:132px!important;height:132px!important}.now-name{font-size:21px!important}.now-clock{font-size:26px!important}.salah-loc{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}.salah-loc input{flex:1;min-width:140px;border:1px solid #dce5e1;border-radius:11px;padding:10px}.salah-loc button{border:0;border-radius:11px;padding:10px 12px;background:#176b4b;color:#fff;display:inline-flex;align-items:center}.salah-loc button svg{width:22px;height:22px;stroke:#fff}.salah-prov-list{max-height:240px;overflow:auto;border:1px solid #dce5e1;border-radius:12px;background:#fff;display:none}.salah-prov-list.open{display:block}.salah-prov-item{padding:11px 12px;border-bottom:1px solid #eef2f1;cursor:pointer;display:flex;justify-content:space-between}.salah-hero{background:#176b4b;color:#fff;border-radius:22px;padding:22px 16px;margin-bottom:14px;text-align:center}.salah-ring{width:168px;height:168px;margin:0 auto 8px;border-radius:50%;border:6px solid rgba(255,255,255,.35);border-top-color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}.now-name{font-size:26px;font-weight:bold}.now-clock{font-size:32px;font-weight:bold;direction:ltr}.now-label{font-size:13px;opacity:.95}.now-loc{font-size:12px;opacity:.9;margin-top:10px}.now-since{font-size:13px;margin-top:6px}.salah-row{display:flex;justify-content:space-between;padding:14px 6px;border-bottom:1px solid #eef2f1;cursor:pointer}.salah-row.current{background:#e8f3ee;margin:0 -6px;padding:14px 12px;border-radius:12px}.salah-row .nm{font-weight:bold;font-size:16px}.salah-row .tm{font-weight:bold;direction:ltr}.salah-card{background:#fff;border:1px solid #dce5e1;border-radius:14px;padding:14px;margin-bottom:10px}.qibla-compass{width:220px;height:220px;margin:12px auto;border-radius:50%;border:6px solid #176b4b;position:relative;background:radial-gradient(circle,#f9fbfa,#e8f3ee)}.qibla-needle{position:absolute;left:50%;top:50%;width:4px;height:90px;margin-left:-2px;margin-top:-90px;background:linear-gradient(#c0392b,#e74c3c);transform-origin:bottom center;border-radius:2px}.qibla-kaaba{position:absolute;left:50%;top:12px;transform:translateX(-50%);font-size:22px}.qibla-deg{font-size:22px;font-weight:bold;direction:ltr;margin-top:8px}.salah-choice{border-color:#b8c9e0;background:linear-gradient(135deg,#fff,#eef3fb)}';
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
  /* offline prayer times (standard solar formulas, same parameters as the aladhan methods used here) */
  function localTimes(lat,lng,method,school){
    var R=Math.PI/180,pn=placeNow();
    var tzh=(Date.UTC(pn.getFullYear(),pn.getMonth(),pn.getDate(),pn.getHours(),pn.getMinutes(),pn.getSeconds())-Date.now())/3600000;tzh=Math.round(tzh*4)/4;
    var jd=Date.UTC(pn.getFullYear(),pn.getMonth(),pn.getDate(),12)/86400000+2440587.5,D=jd-2451545.0-lng/360;
    function fx(a,b){a=a-b*Math.floor(a/b);return a<0?a+b:a;}
    var g=fx(357.529+0.98560028*D,360),q=fx(280.459+0.98564736*D,360),L=fx(q+1.915*Math.sin(g*R)+0.020*Math.sin(2*g*R),360),e=23.439-0.00000036*D;
    var RA=fx(Math.atan2(Math.cos(e*R)*Math.sin(L*R),Math.cos(L*R))/R/15,24),eqt=q/15-RA;if(eqt>12)eqt-=24;if(eqt<-12)eqt+=24;
    var decl=Math.asin(Math.sin(e*R)*Math.sin(L*R))/R,noon=12+tzh-lng/15-eqt;
    function t(a){var c=(-Math.sin(a*R)-Math.sin(decl*R)*Math.sin(lat*R))/(Math.cos(decl*R)*Math.cos(lat*R));if(c>1||c<-1)return NaN;return Math.acos(c)/R/15;}
    var P={1:[18,18],2:[15,15],3:[18,17],4:[18.5,0],5:[19.5,17.5],99:[16.5,16]};var m=(method==99&&!inIraq(lat,lng))?3:method;var pr=P[m]||P[3];
    var f=(school==1?2:1),ac=Math.atan(1/(f+Math.tan(Math.abs(lat-decl)*R)))/R,asr=noon+ (function(){var c=(Math.sin(ac*R)-Math.sin(decl*R)*Math.sin(lat*R))/(Math.cos(decl*R)*Math.cos(lat*R));return Math.acos(c)/R/15;})();
    var sr=noon-t(0.833),ss=noon+t(0.833),fa=noon-t(pr[0]),is=pr[1]?noon+t(pr[1]):ss+1.5;
    function h(x){if(isNaN(x))return '--:--';x=fx(x+0.5/60,24);var H=Math.floor(x),M=Math.floor((x-H)*60);return (H<10?'0':'')+H+':'+(M<10?'0':'')+M;}
    return{Fajr:h(fa),Sunrise:h(sr),Dhuhr:h(noon),Asr:h(asr),Maghrib:h(ss),Sunset:h(ss),Isha:h(is),Imsak:h(fa-10/60),Midnight:h(ss+(fa+24-ss)/2)};
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
    var raw,j;
    try{
      var r=await fetch(url);if(!r.ok)throw new Error('net');
      j=await r.json();if(!j.data||!j.data.timings)throw new Error('empty');
      raw = j.data.timings;
      try { if (j.data.meta && j.data.meta.timezone) { S.tz = j.data.meta.timezone; try{localStorage.setItem('salah_tz_'+S.lat.toFixed(1)+'_'+S.lng.toFixed(1),S.tz);}catch(e){} } } catch (e) {}
    }catch(netErr){
      /* offline: restore the place's time zone if known, then calculate on the device */
      try{if(!S.tz)S.tz=localStorage.getItem('salah_tz_'+(+S.lat).toFixed(1)+'_'+(+S.lng).toFixed(1))||'';}catch(e){}
      raw=localTimes(+S.lat,+S.lng,+S.method||3,school);
    }
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
  /* ---------- Sunnah prayers of the day (+ daily log) ---------- */
  var SU_KEY='salah_sunnah_v1';
  var SU_T={
    ckb:{tab:'سوننەت',title:'نوێژە سوننەتەکانی ڕۆژ',rat:'ڕاتیبە — ١٢ ڕەکعەت',more:'سوننەتی زیاتر',today:'ئەمڕۆ',streak:'زنجیرە',days:'ڕۆژ',week:'ئەم حەفتەیە',rk:'ڕەکعەت',hint:'کاتێک نوێژێکت کرد دوگمەی ✓ بدە.',after:'دوای',before:'پێش',done:'ماشاءاللە! هەموو ڕاتیبەکانت کرد',rm:'ڕەکعەتی ڕاتیبە'},
    en:{tab:'Sunnah',title:'Sunnah prayers of the day',rat:'Rawatib — 12 rak\'ahs',more:'More sunnah prayers',today:'Today',streak:'Streak',days:'days',week:'This week',rk:'rak\'ah',hint:'Tap ✓ when you have prayed.',after:'After',before:'Before',done:'Mashallah! All rawatib done',rm:'rawatib rak\'ahs'},
    ar:{tab:'السنن',title:'السنن والنوافل اليومية',rat:'السنن الرواتب — ١٢ ركعة',more:'نوافل أخرى',today:'اليوم',streak:'التتابع',days:'يوم',week:'هذا الأسبوع',rk:'ركعة',hint:'اضغط ✓ عند أدائها.',after:'بعد',before:'قبل',done:'ما شاء الله! أتممت الرواتب',rm:'ركعات الرواتب'}
  };
  function suL(k){var l=window.appLang||'ckb';var t=SU_T[l]||(l==='bad'?SU_T.ckb:SU_T.en);return t[k]||SU_T.en[k]||'';}
  function suLang(){var l=window.appLang||'ckb';return l==='bad'?'ckb':(SU_T[l]?l:'en');}
  var SU_ITEMS=[
    {id:'fajr',g:'r',n:2,ar:'سنّة الفجر',ckb:'سوننەتی بەیانی',en:'Sunnah of Fajr',w:['Fajr','Sunrise'],h:{ckb:'دوو ڕەکعەتی بەیانی لە دونیا و هەرچی تێیدایە باشترە (موسلیم)',ar:'«ركعتا الفجر خير من الدنيا وما فيها» (مسلم)',en:'The two rak\'ahs of Fajr are better than the world and all it contains (Muslim)'}},
    {id:'dhb',g:'r',n:4,ar:'سنّة الظهر القبلية',ckb:'سوننەتی پێش نیوەڕۆ',en:'Before Dhuhr',w:['before','Dhuhr'],h:{ckb:'چوار ڕەکعەت پێش نیوەڕۆ',ar:'أربع ركعات قبل الظهر',en:'Four rak\'ahs before Dhuhr'}},
    {id:'dha',g:'r',n:2,ar:'سنّة الظهر البعدية',ckb:'سوننەتی دوای نیوەڕۆ',en:'After Dhuhr',w:['after','Dhuhr'],h:{ckb:'دوو ڕەکعەت دوای نیوەڕۆ',ar:'ركعتان بعد الظهر',en:'Two rak\'ahs after Dhuhr'}},
    {id:'mag',g:'r',n:2,ar:'سنّة المغرب',ckb:'سوننەتی دوای مەغریب',en:'After Maghrib',w:['after','Maghrib'],h:{ckb:'دوو ڕەکعەت دوای مەغریب',ar:'ركعتان بعد المغرب',en:'Two rak\'ahs after Maghrib'}},
    {id:'ish',g:'r',n:2,ar:'سنّة العشاء',ckb:'سوننەتی دوای عیشا',en:'After Isha',w:['after','Isha'],h:{ckb:'کێ ١٢ ڕەکعەت لە ڕۆژێکدا بکات خوا خانوویەکی لە بەهەشت بۆ دروست دەکات (موسلیم)',ar:'«من صلّى اثنتي عشرة ركعة في يوم وليلة بُني له بيت في الجنة» (مسلم)',en:'Whoever prays twelve rak\'ahs in a day, a house is built for him in Paradise (Muslim)'}},
    {id:'duha',g:'m',n:2,ar:'صلاة الضحى',ckb:'نوێژی زوحا',en:'Duha prayer',w:['duha'],h:{ckb:'دوو ڕەکعەتی زوحا بۆ هەموو جومگەکانی جەستە سەدەقەیە (موسلیم)',ar:'«ويجزئ من ذلك ركعتان يركعهما من الضحى» (مسلم)',en:'Two rak\'ahs of Duha suffice as charity for every joint of the body (Muslim)'}},
    {id:'asb',g:'m',n:4,ar:'سنّة العصر القبلية',ckb:'چوار ڕەکعەت پێش عەسر',en:'Before Asr',w:['before','Asr'],h:{ckb:'خوا ڕەحمەت لەو کەسە بکات کە پێش عەسر چوار ڕەکعەت دەکات (ئەبو داود)',ar:'«رحم الله امرأً صلّى قبل العصر أربعاً»',en:'May Allah have mercy on one who prays four rak\'ahs before Asr (Abu Dawud)'}},
    {id:'witr',g:'m',n:3,ar:'صلاة الوتر',ckb:'نوێژی وەتر',en:'Witr prayer',w:['night'],h:{ckb:'خوا وەترە و وەتر خۆشدەوێت، ئەی خەڵکی قورئان وەتر بکەن (ئەبو داود)',ar:'«إن الله وتر يحب الوتر فأوتروا يا أهل القرآن»',en:'Allah is Witr and loves Witr — so pray Witr, O people of the Quran (Abu Dawud)'}},
    {id:'tah',g:'m',n:2,ar:'قيام الليل (التهجد)',ckb:'نوێژی شەو (تەهەجود)',en:'Night prayer (Tahajjud)',w:['third'],h:{ckb:'باشترین نوێژ دوای نوێژە فەرزەکان نوێژی شەوە (موسلیم)',ar:'«أفضل الصلاة بعد الفريضة صلاة الليل» (مسلم)',en:'The best prayer after the obligatory ones is the night prayer (Muslim)'}},
    {id:'wud',g:'m',n:2,ar:'سنّة الوضوء',ckb:'دوو ڕەکعەت دوای دەستنوێژ',en:'After wudu',w:['any'],h:{ckb:'بیلاڵ دوو ڕەکعەتی دوای دەستنوێژی دەکرد و پێغەمبەر ﷺ مژدەی بەهەشتی پێدا (بوخاری)',ar:'«ركعتا الوضوء» — حديث بلال (البخاري)',en:'Two rak\'ahs after wudu — the hadith of Bilal (Bukhari)'}},
    {id:'mas',g:'m',n:2,ar:'تحية المسجد',ckb:'تەحییەتی مزگەوت',en:'Greeting the mosque',w:['any'],h:{ckb:'کاتێک یەکێکتان دەچێتە مزگەوت با دوو ڕەکعەت بکات پێش دانیشتن (بوخاری و موسلیم)',ar:'«إذا دخل أحدكم المسجد فلا يجلس حتى يصلي ركعتين»',en:'When one enters the mosque, he should not sit until he prays two rak\'ahs (Bukhari & Muslim)'}}
  ];
  function suAll(){try{return JSON.parse(localStorage.getItem(SU_KEY)||'{}')||{};}catch(e){return{};}}
  function suToggle(id){var a=suAll(),k=dkey(placeNow());a[k]=a[k]||{};if(a[k][id])delete a[k][id];else a[k][id]=1;var ks=Object.keys(a).sort();while(ks.length>150)delete a[ks.shift()];try{localStorage.setItem(SU_KEY,JSON.stringify(a));}catch(e){}}
  function suRak(a,k){var o=a[k]||{},n=0;SU_ITEMS.forEach(function(i){if(i.g==='r'&&o[i.id])n+=i.n;});return n;}
  function suWin(it,tl){
    if(!tl)return '';var m={};tl.list.forEach(function(x){m[x.id]=x.date;});var w=it.w,h=fmtHM;
    if(w[0]==='Fajr')return m.Fajr?h(m.Fajr)+' – '+h(m.Sunrise):'';
    if(w[0]==='duha')return m.Sunrise&&m.Dhuhr?h(new Date(m.Sunrise.getTime()+20*60000))+' – '+h(new Date(m.Dhuhr.getTime()-10*60000)):'';
    if(w[0]==='before'||w[0]==='after')return m[w[1]]?suL(w[0])+' '+(pn({id:w[1],ku:NAMES.filter(function(n){return n.id===w[1];})[0].ku,ar:NAMES.filter(function(n){return n.id===w[1];})[0].ar}))+' · '+h(m[w[1]]):'';
    if(w[0]==='night')return m.Isha&&m.Fajr?h(m.Isha)+' – '+h(m.Fajr):'';
    if(w[0]==='third'&&m.Maghrib&&m.Fajr){var nf=m.Fajr.getTime()+86400000;return h(new Date(m.Maghrib.getTime()+(nf-m.Maghrib.getTime())*2/3))+' – '+h(m.Fajr);}
    return '';
  }
  function renderSunnah(){
    var box=document.getElementById('salahBody');if(!box)return;box.setAttribute('data-no-translate','1');
    var l=suLang(),a=suAll(),d=placeNow(),k=dkey(d),tl=getTimeline(),o=a[k]||{};
    var rk=suRak(a,k),totalR=12,doneN=SU_ITEMS.filter(function(i){return o[i.id];}).length;
    var streak=0,x=new Date(d.getTime());if(rk<totalR)x.setDate(x.getDate()-1);while(suRak(a,dkey(x))===totalR&&streak<400){streak++;x.setDate(x.getDate()-1);}
    var w=0,dots='';for(var i=6;i>=0;i--){var y=new Date(d.getTime());y.setDate(y.getDate()-i);var c=suRak(a,dkey(y));w+=c;dots+='<span style="flex:1;height:'+(6+c*3)+'px;background:'+(c===totalR?'#176b4b':c?'#7fc3a3':'#dce5e1')+';border-radius:4px"></span>';}
    var C=2*Math.PI*44,off=C*(1-rk/totalR);
    function card(it){var on=!!o[it.id],win=suWin(it,tl);return '<div class="salah-card" style="display:flex;gap:12px;align-items:flex-start;'+(on?'border-color:#4ad489;':'')+'"><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><b style="font-size:16px">'+(l==='ar'?it.ar:(l==='ckb'?it.ckb:it.en))+'</b><span style="font-size:12px;background:rgba(23,107,75,.14);color:#176b4b;border-radius:20px;padding:2px 9px;font-weight:700">'+it.n+' '+suL('rk')+'</span></div>'+(l==='ckb'||l==='en'?'<div dir="rtl" style="font-family:Amiri,serif;font-size:17px;opacity:.85;margin-top:2px">'+it.ar+'</div>':'')+(win?'<div style="font-size:12.5px;opacity:.75;margin-top:4px">🕒 '+win+'</div>':'')+'<div style="font-size:12.5px;opacity:.8;margin-top:6px;line-height:1.7">'+(it.h[l]||it.h.en)+'</div></div><button type="button" data-su="'+it.id+'" aria-label="✓" style="flex:none;width:44px;height:44px;border-radius:50%;border:2px solid '+(on?'#176b4b':'#c9d6d0')+';background:'+(on?'#176b4b':'transparent')+';color:'+(on?'#fff':'#9db3aa')+';font-size:22px;cursor:pointer;transition:all .2s">✓</button></div>';}
    box.innerHTML='<div class="salah-card"><b>'+suL('title')+'</b><div style="display:flex;align-items:center;gap:14px;margin-top:10px"><div style="position:relative;width:96px;height:96px;flex:none"><svg viewBox="0 0 100 100" style="width:100%;height:100%;transform:rotate(-90deg)"><circle cx="50" cy="50" r="44" fill="none" stroke="#dce5e1" stroke-width="9"/><circle cx="50" cy="50" r="44" fill="none" stroke="'+(rk===totalR?'#b48a3c':'#176b4b')+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;font-size:22px">'+rk+'<small style="font-size:10.5px;font-weight:400;opacity:.7">/ '+totalR+'</small></div></div><div style="flex:1;display:flex;gap:8px;text-align:center"><div style="flex:1"><div style="font-size:20px;font-weight:700;color:#176b4b">'+doneN+'/'+SU_ITEMS.length+'</div><div style="font-size:11.5px;opacity:.75">'+suL('today')+'</div></div><div style="flex:1"><div style="font-size:20px;font-weight:700;color:#176b4b">'+streak+'</div><div style="font-size:11.5px;opacity:.75">'+suL('streak')+' ('+suL('days')+')</div></div><div style="flex:1"><div style="font-size:20px;font-weight:700;color:#176b4b">'+w+'</div><div style="font-size:11.5px;opacity:.75">'+suL('week')+'</div></div></div></div><div dir="ltr" style="display:flex;align-items:flex-end;gap:5px;height:40px;margin-top:12px">'+dots+'</div>'+(rk===totalR?'<div style="margin-top:10px;font-weight:700;color:#b48a3c">🌟 '+suL('done')+'</div>':'<div style="font-size:11.5px;opacity:.7;margin-top:8px">'+suL('hint')+'</div>')+'</div>'+
      '<div style="font-weight:700;margin:12px 4px 4px">'+suL('rat')+'</div>'+SU_ITEMS.filter(function(i){return i.g==='r';}).map(card).join('')+
      '<div style="font-weight:700;margin:14px 4px 4px">'+suL('more')+'</div>'+SU_ITEMS.filter(function(i){return i.g==='m';}).map(card).join('');
    box.onclick=function(e){var b=e.target.closest?e.target.closest('[data-su]'):null;if(!b)return;suToggle(b.getAttribute('data-su'));try{if(navigator.vibrate)navigator.vibrate(18);}catch(x){}var sc=box.closest('.main'),st=sc?sc.scrollTop:0;renderSunnah();if(sc)sc.scrollTop=st;};
  }
  function setTab(tab){
    S.tab=tab;
    document.querySelectorAll('.salah-tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===tab);});
    if(tab==='times')renderTimes();else if(tab==='virtues'){stopQibla();renderVirtues();}else if(tab==='qibla')renderQibla();else if(tab==='sunnah'){stopQibla();renderSunnah();}
  }
  function startTick(){if(tickTimer)clearInterval(tickTimer);tickTimer=setInterval(tickLive,1000);}
  function ensureView(){
    injectCss();var main=document.querySelector('.main');if(!main)return null;
    var v=document.getElementById('salahView');if(v)return v;
    v=document.createElement('section');v.id='salahView';v.className='view';
    v.innerHTML='<div class="salah-head"><button class="tab" type="button" id="salahBack">‹ '+tx('home')+'</button><b>'+tx('title')+'</b><button class="tab" type="button" id="salahLocBtn" aria-label="location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></button><button class="tab" type="button" id="salahRefresh" aria-label="refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.6"/><path d="M20 4v7h-7"/></svg></button></div><div class="salah-loc"><input id="salahCity" placeholder="'+tx('ph')+'" autocomplete="off" /><button type="button" id="salahGps" aria-label="gps"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></button></div><div id="salahProvList" class="salah-prov-list"></div><div class="salah-tabs"><button type="button" data-tab="times" class="on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>'+tx('t_times')+'</span></button><button type="button" data-tab="virtues"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/></svg><span>'+tx('t_virt')+'</span></button><button type="button" data-tab="sunnah"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.5 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z"/></svg><span>'+suL('tab')+'</span></button><button type="button" data-tab="qibla"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg><span>'+tx('t_qibla')+'</span></button></div><div id="salahBody"><div class="card muted">...</div></div>';
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
