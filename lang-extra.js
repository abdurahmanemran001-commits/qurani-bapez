/* Extra UI translations for the newer features. Loaded synchronously before language.js.
   Works on whole text nodes: digits become {0},{1}.. so "ڕۆژی 3 لە 30" matches the template "ڕۆژی {0} لە {1}". */
(function () {
  if (window.T) return;
  window.T = function (k) { var a = [].slice.call(arguments, 1); return String(k).replace(/\{(\d+)\}/g, function (m, i) { return a[i] === undefined ? m : a[i]; }); };
  var TT = window.LANG_TT = window.LANG_TT || { en: {}, ar: {} };
  var recs = new WeakMap();
  function lang() { return window.appLang || (function () { try { return localStorage.getItem('app_language') || 'ckb'; } catch (e) { return 'ckb'; } })(); }
  function table(l) { if (l === 'ckb' || l === 'bad') return null; return Object.assign({}, TT.en, l === 'en' ? null : TT[l]); }
  function conv(s, tab) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2]; if (!core) return s;
    var nums = [], key = core.replace(/[0-9\u0660-\u0669]+(?:[.,][0-9]+)?(?:\s?(?:KB|MB))?/g, function (x) { nums.push(x); return '{' + (nums.length - 1) + '}'; });
    var v = tab[key]; if (v === undefined) return s;
    return m[1] + v.replace(/\{(\d+)\}/g, function (q, i) { return nums[i] === undefined ? q : nums[i]; }) + m[3];
  }
  function node(n, tab) {
    var p = n.parentElement; if (!p || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(p.tagName) || (p.closest && p.closest('#languageChoices'))) return;
    var r = recs.get(n), orig = (r && n.nodeValue === r.t) ? r.o : n.nodeValue;
    if (!/[؀-ۿ]/.test(orig)) return;
    var t = tab ? conv(orig, tab) : orig;
    if (t !== n.nodeValue) n.nodeValue = t;
    recs.set(n, { o: orig, t: t });
  }
  var attrs = ['placeholder', 'title'];
  function elAttrs(e, tab) {
    attrs.forEach(function (a) {
      if (!e.getAttribute) return; var v = e.getAttribute(a); if (v == null) return;
      var k = 'data-x-' + a, o = e.getAttribute(k); if (o == null || (e.__xt && e.__xt[a] !== v)) { o = v; e.setAttribute(k, v); }
      var t = tab ? conv(o, tab) : o; if (t !== v) e.setAttribute(a, t); (e.__xt = e.__xt || {})[a] = t;
    });
  }
  function run(root) {
    var tab = table(lang()); root = root || document.body; if (!root) return;
    if (root.nodeType === 3) { node(root, tab); return; }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n; while ((n = w.nextNode())) node(n, tab);
    if (root.querySelectorAll) { elAttrs(root, tab); root.querySelectorAll('[placeholder],[title]').forEach(function (e) { elAttrs(e, tab); }); }
  }
  window.__langExtraRun = run;
  var busy = false, lastL = '';
  function start() {
    if (!document.body) return setTimeout(start, 50);
    new MutationObserver(function (ms) {
      if (busy) return; busy = true;
      try {
        if (lang() !== lastL) { lastL = lang(); run(document.body); }
        else ms.forEach(function (m) { if (m.type === 'characterData') run(m.target); else m.addedNodes.forEach(function (n) { run(n); }); });
      } finally { setTimeout(function () { busy = false; }, 0); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(function () { if (lang() !== lastL) { lastL = lang(); run(document.body); } }, 700);
    lastL = lang(); run(document.body);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
