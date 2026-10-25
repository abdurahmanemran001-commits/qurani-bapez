window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };
(function(){
  var s=document.createElement('script');
  s.src='madani-ayah.js?v=9';
  s.async=true;
  document.head.appendChild(s);

  // Keep the mushaf reader focused on the Quran page itself.
  var readerStyle=document.createElement('style');
  readerStyle.textContent='#reader>.card{display:none}';
  document.head.appendChild(readerStyle);
})();
