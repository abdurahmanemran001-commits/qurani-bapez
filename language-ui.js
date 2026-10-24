/* Extra interface translations (Arabic + English). Sorani text is the key. */
window.LANG_EXTRA={
"ar": {"قرآن الکریم": "القرآن الكريم"},
"en": {"قرآن الکریم": "The Holy Quran"}
};

/* Load Madinah IMAGE mushaf + timing-synced audio (like APK). */
(function(){
  var s=document.createElement('script');
  s.src='madani-ayah.js?v=6';
  s.async=true;
  document.head.appendChild(s);
})();
