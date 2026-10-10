window.fitW=function(){
  var b=document.body,H=window.innerHeight-10;
  var hd=[].slice.call(document.querySelectorAll('.hd,.bs')),tx=[].slice.call(document.querySelectorAll('.wtxt'));
  function set(fs){hd.forEach(function(e){e.style.fontSize=(fs*1.15)+'px';});tx.forEach(function(e){e.style.fontSize=fs+'px';});}
  var lo=12,hi=40,best=12;
  while(hi-lo>0.5){var mid=(lo+hi)/2;set(mid);if(b.scrollHeight<=H){best=mid;lo=mid;}else{hi=mid;}}
  set(best);
  var extra=H-b.scrollHeight;
  if(extra>0&&tx.length){var lines=Math.max(1,Math.round(tx.reduce(function(a,e){return a+e.getBoundingClientRect().height;},0)/(best*2)));
    var lh=2+Math.min(0.5,extra/lines/best);tx.forEach(function(e){e.style.lineHeight=lh;});}
};
window.winit=function(){
  var done=false;
  function run(){if(done)return;done=true;try{fitW();}catch(e){}document.body.style.visibility='visible';}
  try{document.fonts.load('40px WARSH').then(run,run);}catch(e){run();}
  setTimeout(run,2500);
};
