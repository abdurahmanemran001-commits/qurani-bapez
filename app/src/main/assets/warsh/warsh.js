// Fits the Warsh page text to the whole WebView height.
// Fix: the old version measured before the WebView had a real size (innerHeight ~0),
// so no font size "fitted" and it stayed at the 12px minimum, filling only the top.
window.fitW=function(){
  var b=document.body,H=window.innerHeight-10;
  if(H<200)return false;                       // WebView not laid out yet -> try again later
  var hd=[].slice.call(document.querySelectorAll('.hd,.bs')),
      tx=[].slice.call(document.querySelectorAll('.wtxt'));
  function set(fs,lh){
    hd.forEach(function(e){e.style.fontSize=(fs*1.15)+'px';});
    tx.forEach(function(e){e.style.fontSize=fs+'px';e.style.lineHeight=lh;});
  }
  function used(){return b.getBoundingClientRect().height;}
  var lo=8,hi=34,best=8;
  while(hi-lo>0.25){
    var mid=(lo+hi)/2;set(mid,2);
    if(used()<=H){best=mid;lo=mid;}else{hi=mid;}
  }
  set(best,2);
  var extra=H-used();
  if(extra>0&&tx.length){
    var h=0;tx.forEach(function(e){h+=e.getBoundingClientRect().height;});
    var lines=Math.max(1,Math.round(h/(best*2)));
    set(best,2+Math.min(0.7,extra/lines/best)); // spread leftover height between lines
  }
  return true;
};
window.winit=function(){
  var shown=false,started=false,tries=0,rt=null;
  function show(){shown=true;document.body.style.visibility='visible';}
  function wait(){
    var ok=false;
    try{ok=fitW();}catch(e){ok=true;}
    if(ok){show();return;}
    if(++tries<100){setTimeout(wait,100);}else{show();}
  }
  function start(){if(started)return;started=true;wait();}
  window.addEventListener('resize',function(){          // rotation / bars / late layout
    clearTimeout(rt);rt=setTimeout(function(){try{fitW();}catch(e){}if(!shown)show();},80);
  });
  try{document.fonts.load('40px WARSH').then(start,start);}catch(e){start();}
  setTimeout(start,2500);
};
