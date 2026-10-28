/* salah.js v6 — loads places from window.__SALAH_PLACES */
(function () {
  if (window.__salahV6) return;
  window.__salahV6 = true;
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
    st.textContent = '#salahView{padding:10px 12px 24px}.salah-head{display:flex;justify-content:space-between;margin-bottom:10px}.salah-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.salah-tabs button{border:1px solid #dce5e1;background:#fff;border-radius:11px;padding:10px 6px}.salah-tabs button.on{background:#176b4b;color:#fff;font-weight:bold}.salah-loc{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}.salah-loc input{flex:1;min-width:140px;border:1px solid #dce5e1;border-radius:11px;padding:10px}.salah-loc button{border:0;border-radius:11px;padding:10px 12px;background:#176b4b;color:#fff}.salah-prov-list{max-height:240px;overflow:auto;border:1px solid #dce5e1;border-radius:12px;background:#fff;display:none}.salah-prov-list.open{display:block}.salah-prov-item{padding:11px 12px;border-bottom:1px solid #eef2f1;cursor:pointer;display:flex;justify-content:space-between}.salah-hero{background:#176b4b;color:#fff;border-radius:22px;padding:22px 16px;margin-bottom:14px;text-align:center}.salah-ring{width:168px;height:168px;margin:0 auto 8px;border-radius:50%;border:6px solid rgba(255,255,255,.35);border-top-color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}.now-name{font-size:26px;font-weight:bold}.now-clock{font-size:32px;font-weight:bold;direction:ltr}.now-label{font-size:13px;opacity:.95}.now-loc{font-size:12px;opacity:.9;margin-top:10px}.now-since{font-size:13px;margin-top:6px}.salah-row{display:flex;justify-content:space-between;padding:14px 6px;border-bottom:1px solid #eef2f1;cursor:pointer}.salah-row.current{background:#e8f3ee;margin:0 -6px;padding:14px 12px;border-radius:12px}.salah-row .nm{font-weight:bold;font-size:16px}.salah-row .tm{font-weight:bold;direction:ltr}.salah-card{background:#fff;border:1px solid #dce5e1;border-radius:14px;padding:14px;margin-bottom:10px}.qibla-compass{width:220px;height:220px;margin:12px auto;border-radius:50%;border:6px solid #176b4b;position:relative;background:radial-gradient(circle,#f9fbfa,#e8f3ee)}.qibla-needle{position:absolute;left:50%;top:50%;width:4px;height:90px;margin-left:-2px;margin-top:-90px;background:linear-gradient(#c0392b,#e74c3c);transform-origin:bottom center;border-radius:2px}.qibla-kaaba{position:absolute;left:50%;top:12px;transform:translateX(-50%);font-size:22px}.qibla-deg{font-size:22px;font-weight:bold;direction:ltr;margin-top:8px}.salah-choice{border-color:#b8c9e0;background:linear-gradient(135deg,#fff,#eef3fb)}';
    document.head.appendChild(st);
  }
  function parseHM(s){var m=String(s||'').match(/(\d{1,2}):(\d{2})/);return m?{h:+m[1],m:+m[2]}:null;}
  function toDate(hm){if(!hm)return null;var d=new Date();d.setHours(hm.h,hm.m,0,0);return d;}
  function fmtHM(d){if(!d)return'--:--';var h=d.getHours(),m=d.getMinutes();return(h<10?'0':'')+h+':'+(m<10?'0':'')+m;}
  function fmtClock(ms){if(ms<0)ms=0;var t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;function p(n){return(n<10?'0':'')+n;}return p(h)+':'+p(m)+':'+p(s);}
  function fmtDurWords(ms){if(ms<0)ms=0;var t=Math.floor(ms/60000),h=Math.floor(t/60),m=t%60;return h>0?(h+' کاتژمێر و '+m+' خولەک'):(m+' خولەک');}
  function getTimeline(){
    if(!times)return null;var now=new Date();
    var list=NAMES.map(function(n){var d=toDate(parseHM(times[n.id]));return{id:n.id,ku:n.ku,ar:n.ar,date:d};}).filter(function(x){return x.date;});
    var current=null,next=null;
    for(var i=0;i<list.length;i++){if(list[i].date<=now)current=list[i];if(list[i].date>now&&!next)next=list[i];}
    if(!next&&list.length){var fajr=list.find(function(x){return x.id==='Fajr';});if(fajr){next=Object.assign({},fajr);next.date=new Date(fajr.date.getTime()+86400000);}}
    if(!current&&list.length){var isha=list.find(function(x){return x.id==='Isha';});if(isha){current=Object.assign({},isha);current.date=new Date(isha.date.getTime()-86400000);current.yesterday=true;}}
    return{list:list,current:current,next:next,now:now};
  }
  async function fetchTimes(){
    var url='https://api.aladhan.com/v1/timings?latitude='+encodeURIComponent(S.lat)+'&longitude='+encodeURIComponent(S.lng)+'&method='+encodeURIComponent(S.method||3)+'&_='+Date.now();
    var r=await fetch(url);if(!r.ok)throw new Error('net');
    var j=await r.json();if(!j.data||!j.data.timings)throw new Error('empty');
    times=j.data.timings;return times;
  }
  async function applyPlace(p){
    S.lat=+p.lat;S.lng=+p.lng;S.city=p.ku;S.country='Iraq';times=null;save();await fetchTimes();
  }
  function filterPlaces(q){
    q=(q||'').trim().toLowerCase();var all=window.__SALAH_PLACES||[];
    if(!q)return all.slice();
    return all.filter(function(p){return (p.ku||'').toLowerCase().indexOf(q)>=0||(p.ar||'').toLowerCase().indexOf(q)>=0||(p.en||'').toLowerCase().indexOf(q)>=0;});
  }
  function renderProvList(q){
    var list=document.getElementById('salahProvList');if(!list)return;
    loadPlaces(function(){
      var items=filterPlaces(q);var all=window.__SALAH_PLACES||[];
      if(!items.length){list.innerHTML='<div class="salah-prov-item"><span>هیچ شوێنێک نەدۆزرایەوە</span></div>';list.classList.add('open');return;}
      list.innerHTML=items.map(function(p){var idx=all.indexOf(p);return '<div class="salah-prov-item" data-i="'+idx+'"><b>'+p.ku+'</b><span>'+p.ar+' · '+p.en+'</span></div>';}).join('');
      list.classList.add('open');
      list.querySelectorAll('.salah-prov-item').forEach(function(el){
        el.onclick=async function(){
          var p=all[+el.getAttribute('data-i')];if(!p)return;list.classList.remove('open');
          var input=document.getElementById('salahCity');if(input)input.value=p.ku;
          try{await applyPlace(p);setTab('times');startTick();}catch(e){alert('نەتوانرا کاتەکان بهێنرێن.');}
        };
      });
    });
  }
  async function useGPSAndLoad(){
    if(!navigator.geolocation)throw new Error('no-geo');
    var pos=await new Promise(function(res,rej){navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:15000});});
    S.lat=pos.coords.latitude;S.lng=pos.coords.longitude;S.city='شوێنی ئێستا';S.country='';times=null;save();await fetchTimes();
  }
  function qiblaBearing(lat,lng){
    var kLat=21.4225*Math.PI/180,kLng=39.8262*Math.PI/180;
    var φ1=lat*Math.PI/180,φ2=kLat,Δλ=kLng-lng*Math.PI/180;
    var y=Math.sin(Δλ)*Math.cos(φ2);
    var x=Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    return ((Math.atan2(y,x)*180)/Math.PI+360)%360;
  }
  function renderTimes(){
    var box=document.getElementById('salahBody');if(!box)return;
    var tl=getTimeline();
    if(!tl){box.innerHTML='<div class="salah-card">کاتەکان بارنەبوون.</div>';return;}
    var cur=tl.current,next=tl.next;
    var since=cur?tl.now-cur.date:0,until=next?next.date-tl.now:0;
    var clock=next?fmtClock(until):fmtClock(since);
    var focus=next||cur;
    var hero='<div class="salah-hero"><div class="salah-ring"><div class="now-name">'+(focus?focus.ku:'—')+'</div><div class="now-clock" id="salahLiveClock">'+clock+'</div><div class="now-label">'+(next?'کاتی ماوە':'لە کاتی بانگەوە')+'</div></div>'+
      (cur?'<div class="now-since" id="salahSinceLine">⏱ '+fmtDurWords(since)+' بانگی <b>'+cur.ku+'</b> دراوە</div>':'')+
      (next&&cur?'<div class="now-since" id="salahUntilLine">⏳ '+fmtClock(until)+' ماوە بۆ <b>'+next.ku+'</b></div>':'')+
      '<div class="now-loc">📍 '+(S.city||'')+(S.country?' · '+S.country:'')+'<br dir="ltr">'+S.lat.toFixed(4)+', '+S.lng.toFixed(4)+'</div></div>';
    var rows=tl.list.map(function(x){
      var isCur=cur&&x.id===cur.id&&!cur.yesterday;var past=x.date<tl.now&&!isCur;
      return '<div class="salah-row'+(isCur?' current':'')+(past?' past':'')+'"><div><div class="nm">'+x.ku+(isCur?' · ئێستا':'')+'</div><div class="ar">'+x.ar+'</div></div><div class="tm">'+fmtHM(x.date)+'</div></div>';
    }).join('');
    box.innerHTML=hero+'<div class="salah-list">'+rows+'</div>';
  }
  function tickLive(){
    if(S.tab!=='times')return;var view=document.getElementById('salahView');
    if(!view||!view.classList.contains('active'))return;
    var tl=getTimeline();if(!tl)return;
    var cur=tl.current,next=tl.next,since=cur?tl.now-cur.date:0,until=next?next.date-tl.now:0;
    var clockEl=document.getElementById('salahLiveClock');
    if(clockEl){if(next)clockEl.textContent=fmtClock(until);else if(cur)clockEl.textContent=fmtClock(since);}
    if(next&&until<=0)renderTimes();
  }
  function renderVirtues(){
    var box=document.getElementById('salahBody');if(!box)return;
    box.innerHTML='<div class="salah-card"><h3>نوێژ لە کاتی خۆیدا</h3><div class="ar">إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا</div><div class="ku">بەڕاستی نوێژ لەسەر باوەڕداران فەرزێکی کاتدارە.</div></div>';
  }
  function stopQibla(){if(qiblaWatch){window.removeEventListener('deviceorientation',qiblaWatch,true);qiblaWatch=null;}}
  function renderQibla(){
    var box=document.getElementById('salahBody');if(!box)return;stopQibla();
    var bearing=qiblaBearing(S.lat,S.lng);
    box.innerHTML='<div class="salah-card" style="text-align:center"><b>قیبلەنما</b><div>📍 '+(S.city||'')+' · <b dir="ltr">'+bearing.toFixed(1)+'°</b></div><div class="qibla-compass"><div class="qibla-kaaba">🕋</div><div class="qibla-needle" id="qiblaNeedle"></div></div><div class="qibla-deg" id="qiblaDeg">'+bearing.toFixed(0)+'°</div><button type="button" id="qiblaCalib" style="margin-top:12px;padding:10px 16px;border:0;border-radius:10px;background:#176b4b;color:#fff">چالاککردن</button></div>';
    var needle=document.getElementById('qiblaNeedle'),degEl=document.getElementById('qiblaDeg');
    function onOrient(e){
      var heading=null;
      if(typeof e.webkitCompassHeading==='number')heading=e.webkitCompassHeading;
      else if(typeof e.alpha==='number')heading=(360-e.alpha)%360;
      if(heading==null)return;
      if(needle)needle.style.transform='rotate('+(bearing-heading)+'deg)';
      if(degEl)degEl.textContent=heading.toFixed(0)+'° · قیبلە '+bearing.toFixed(0)+'°';
    }
    document.getElementById('qiblaCalib').onclick=async function(){
      try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){var p=await DeviceOrientationEvent.requestPermission();if(p!=='granted'){alert('ڕێگە نەدرا.');return;}}}catch(e){}
      stopQibla();qiblaWatch=onOrient;window.addEventListener('deviceorientation',onOrient,true);
    };
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
    v.innerHTML='<div class="salah-head"><button class="tab" type="button" id="salahBack">‹ سەرەتا</button><b>نویژەکانم</b><button class="tab" type="button" id="salahRefresh">↻</button></div><div class="salah-loc"><input id="salahCity" placeholder="گەڕان: شار، ناحیە..." autocomplete="off" /><button type="button" id="salahGps">📍</button></div><div id="salahProvList" class="salah-prov-list"></div><div class="salah-tabs"><button type="button" data-tab="times" class="on">کاتەکان</button><button type="button" data-tab="virtues">فەزڵ</button><button type="button" data-tab="qibla">قیبلە</button></div><div id="salahBody"><div class="card muted">بارکردن...</div></div>';
    main.appendChild(v);
    document.getElementById('salahBack').onclick=function(){stopQibla();if(tickTimer){clearInterval(tickTimer);tickTimer=null;}if(typeof showView==='function')showView('startScreen','بەشەکان');};
    document.getElementById('salahRefresh').onclick=async function(){times=null;await loadAndShow();};
    var cityInput=document.getElementById('salahCity');
    cityInput.addEventListener('focus',function(){renderProvList(cityInput.value);});
    cityInput.addEventListener('input',function(){renderProvList(cityInput.value);});
    document.getElementById('salahGps').onclick=async function(){
      try{await useGPSAndLoad();cityInput.value=S.city;setTab('times');startTick();}catch(e){alert('ڕێگە بە شوێن بدە.');}
    };
    document.querySelectorAll('.salah-tabs button').forEach(function(b){b.onclick=function(){setTab(b.getAttribute('data-tab'));};});
    return v;
  }
  async function loadAndShow(){
    ensureView();if(typeof showView==='function')showView('salahView','نویژەکانم');
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
    b.innerHTML='<span class="choice-icon">🕌</span><span class="choice-copy"><b>نویژەکانم</b><small>کاتی نوێژ · قیبلە</small></span><span class="choice-arrow">‹</span>';
    box.appendChild(b);
  }
  function boot(){injectCss();injectStartCard();}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,40);setTimeout(boot,400);});}
  else{setTimeout(boot,40);setTimeout(boot,400);}
  var tries=0;var t=setInterval(function(){boot();if(++tries>40)clearInterval(t);},300);
})();
