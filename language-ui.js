/* Extra interface translations (Arabic + English). Sorani text is the key. */
window.LANG_EXTRA={
"ar": {
"قرآن الکریم(قورئانی پیرۆز)": "القرآن الكريم",
"قرآن الکریم": "القرآن الكريم"
},
"en": {
"قرآن الکریم(قورئانی پیرۆز)": "The Holy Quran",
"قرآن الکریم": "The Holy Quran"
}
};

/* Open Quran pages in the interactive mushaf (tap ayah to play audio). */
(function(){
  function go(p){
    p=Math.max(1,Math.min(604,Number(p)||1));
    try{localStorage.setItem('preview_page',String(p))}catch(e){}
    location.href='mushaf/?p='+p;
  }
  function install(){ window.openPage=go; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
  setTimeout(install,0);
  setTimeout(install,500);
})();
