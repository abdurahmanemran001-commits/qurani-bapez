window.fitQ=function(){
  var b=document.body,W=b.clientWidth-8,H=window.innerHeight-6;
  var ls=[].slice.call(document.querySelectorAll('.line'));
  var normal=ls.filter(function(l){return !l.classList.contains('hd')&&!l.classList.contains('bs');});
  var best=1e9;
  ls.forEach(function(l){l.style.fontSize='100px';l.style.height='auto';});
  var sws=[];
  normal.forEach(function(l){
    l.style.justifyContent='flex-start';
    var sw=0;[].forEach.call(l.children,function(c){sw+=c.getBoundingClientRect().width;});
    sws.push(sw);
    if(sw>0){var fs=100*W/sw;if(fs<best)best=fs;}
    l.style.justifyContent='';
  });
  if(best>1e8)best=30;
  normal.forEach(function(l,i){var short=sws[i]*best/100<0.86*W;l.style.justifyContent=short?'center':'';l.style.gap=short?(best*0.35)+'px':'0';});
  var n=Math.max(ls.length,15),lh=Math.min(H/n,best*2.2);
  ls.forEach(function(l){
    var hd=l.classList.contains('hd'),bs=l.classList.contains('bs');
    l.style.fontSize=(hd?best*1.7:(bs?best*1.1:best))+'px';
    l.style.height=lh+'px';
    l.style.lineHeight=lh+'px';
  });
  b.style.paddingTop=Math.max(2,(H-lh*ls.length)/2)+'px';
  b.style.visibility='visible';
};
window.qinit=function(){
  var done=false;
  function run(){if(done)return;done=true;try{fitQ();}catch(e){}document.body.style.visibility='visible';}
  try{Promise.all([document.fonts.load('40px PG'),document.fonts.load('40px QCF4_QBSML'),document.fonts.load('40px BSM')]).then(run,run);}catch(e){run();}
  setTimeout(run,2500);
};
