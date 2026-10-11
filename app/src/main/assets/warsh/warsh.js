window.fitW=function(){
  var b=document.body,H=window.innerHeight-12;
  if(H<200)return false;                       // view not laid out yet; the resize event will call us again
  var wc=document.getElementById('wc');
  if(!wc){wc=document.createElement('div');wc.id='wc';
    [].slice.call(b.childNodes).forEach(function(n){if(n.nodeName!=='SCRIPT')wc.appendChild(n);});
    b.insertBefore(wc,b.firstChild);}
  var hd=[].slice.call(wc.querySelectorAll('.hd,.bs')),tx=[].slice.call(wc.querySelectorAll('.wtxt'));
  function set(fs,lh){hd.forEach(function(e){e.style.fontSize=(fs*1.15)+'px';});
    tx.forEach(function(e){e.style.fontSize=fs+'px';e.style.lineHeight=lh;});}
  var lo=12,hi=64,best=12;
  while(hi-lo>0.4){var mid=(lo+hi)/2;set(mid,2);if(wc.getBoundingClientRect().height<=H){best=mid;lo=mid;}else{hi=mid;}}
  set(best,2);
  var extra=H-wc.getBoundingClientRect().height;
  if(extra>0&&tx.length){
    var lines=Math.max(1,Math.round(tx.reduce(function(a,e){return a+e.getBoundingClientRect().height;},0)/(best*2)));
    var lh=2+Math.min(0.6,extra/lines/best);tx.forEach(function(e){e.style.lineHeight=lh;});}
  document.body.style.visibility='visible';
  return true;
};
window.winit=function(){
  var timer=null;
  function run(){try{fitW();}catch(e){}document.body.style.visibility='visible';}
  window.addEventListener('resize',function(){clearTimeout(timer);timer=setTimeout(run,60);});
  try{document.fonts.load('40px WARSH').then(run,run);}catch(e){run();}
  setTimeout(run,1200);setTimeout(run,3000);
};
