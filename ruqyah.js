/* ruqyah.js — bootstrap original + label گۆێگرتن */
(function () {
  if (window.__ruqyahBoot) return;
  window.__ruqyahBoot = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/abdurahmanemran001-commits/qurani-bapez@6fadf0921fdb/ruqyah.js';
  s.onload = function () {
    setInterval(function () {
      document.querySelectorAll('#ruqyah .rq-btn').forEach(function (b) {
        if ((b.textContent || '').indexOf('گوێگرتن') >= 0) {
          b.textContent = b.textContent.replace(/گوێگرتن/g, 'گۆێگرتن');
        }
      });
    }, 1000);
  };
  s.onerror = function () {
    var s2 = document.createElement('script');
    s2.src = 'https://raw.githubusercontent.com/abdurahmanemran001-commits/qurani-bapez/6fadf0921fdb/ruqyah.js';
    document.head.appendChild(s2);
  };
  document.head.appendChild(s);
})();
