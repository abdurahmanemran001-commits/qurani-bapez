/* ruqyah.js — load core only (reciters loaded separately by language-ui) */
(function () {
  if (window.__ruqyahBoot) return;
  window.__ruqyahBoot = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@6fadf0921fdb/ruqyah.js';
  s.onerror = function () {
    var s2 = document.createElement('script');
    s2.src = 'https://raw.githubusercontent.com/abdurahmanemran001-commits/qurani-bapez/6fadf0921fdb/ruqyah.js';
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();
