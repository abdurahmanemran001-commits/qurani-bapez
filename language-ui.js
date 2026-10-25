window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function(){
  var s=document.createElement('script');
  s.src='madani-ayah.js?v=9';
  s.async=true;
  document.head.appendChild(s);
})();

/* ---- Web extras ported from the Android app (added one part at a time) ----
   Everything here is wrapped in try/catch so it can never break the page. */

/* Part 1: real Juz list. The home page used to guess page = 1 + 20*n,
   which is wrong. These are the Madani mushaf (604 pages) start pages. */
(function(){
  try{
    var JUZ_PAGE=[1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];
    var orig=window.renderSurahs;
    if(typeof orig!=='function')return;
    window.renderSurahs=function(){
      orig.apply(this,arguments);
      try{
        if(typeof homeTab==='undefined'||homeTab!=='juz')return;
        var list=document.getElementById('surahList');
        if(!list)return;
        var names=(typeof surahs!=='undefined'&&surahs)||[];
        list.innerHTML=JUZ_PAGE.map(function(p,i){
          var first='';
          for(var k=0;k<names.length;k++){ if(names[k][3]<=p)first=names[k][0]; else break; }
          return '<div class="surah" onclick="openPage('+p+')"><span class="num">'+(i+1)+'</span><div class="name"><b>\u062c\u0648\u0632\u06cc '+(i+1)+'</b><small>'+(first?esc(first)+' \u00b7 ':'')+'\u067e\u06d5\u0680\u06d5 '+p+'</small></div><span class="arrow">\u2039</span></div>';
        }).join('');
      }catch(e){}
    };
  }catch(e){}
})();
