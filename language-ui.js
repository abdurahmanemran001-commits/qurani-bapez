/* Extra interface translations kept in language.js; this file loads Madinah player. */
window.LANG_EXTRA = window.LANG_EXTRA || { ar: {}, en: {} };

(function(){
  var s=document.createElement('script');
  s.src='madani-ayah.js?v=7';
  s.async=true;
  document.head.appendChild(s);
})();
