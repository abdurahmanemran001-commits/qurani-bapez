window.fitQ=function(){
  var b=document.body,W=b.clientWidth-8,H=window.innerHeight-6;
  var ls=[].slice.call(document.querySelectorAll('.line'));
  var normal=ls.filter(function(l){return !l.classList.contains('hd')&&!l.classList.contains('bs');});
  var best=1e9;
  ls.forEach(function(l){l.style.fontSize='100px';l.style.height='auto';});
  normal.forEach(function(l){
    l.style.justifyContent='flex-start';
    var sw=0;[].forEach.call(l.children,function(c){sw+=c.getBoundingClientRect().width;});
    if(sw>0){var fs=100*W/sw;if(fs<best)best=fs;}
    l.style.justifyContent='';
  });
  if(best>1e8)best=30;
  var n=Math.max(ls.length,15),lh=Math.min(H/n,best*2.2);
  ls.forEach(function(l){
    var hd=l.classList.contains('hd'),bs=l.classList.contains('bs');
    l.style.fontSize=(hd?best*1.0:best)+'px';
    l.style.height=lh+'px';
    l.style.lineHeight=lh+'px';
  });
  b.style.paddingTop=Math.max(2,(H-lh*ls.length)/2)+'px';
  b.style.visibility='visible';
};
