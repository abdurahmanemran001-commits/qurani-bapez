/* ruqyah.js — load core then multi-reciter */
(function () {
  if (window.__ruqyahBoot) return;
  window.__ruqyahBoot = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@6fadf0921fdb/ruqyah.js';
  s.onload = function () {
    var r = document.createElement('script');
    r.src = 'ruqyah-reciters.js?v=3';
    document.head.appendChild(r);
  };
  s.onerror = function () {
    var s2 = document.createElement('script');
    s2.src = 'https://raw.githubusercontent.com/abdurahmanemran001-commits/qurani-bapez/6fadf0921fdb/ruqyah.js';
    s2.onload = function () {
      var r = document.createElement('script');
      r.src = 'ruqyah-reciters.js?v=3';
      document.head.appendChild(r);
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();
