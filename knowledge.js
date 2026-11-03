/* knowledge.js — ناوەندی زانیاریی قورئان */
(function () {
  if (window.__knowledgeV1) return;
  window.__knowledgeV1 = true;
  var STORE = 'quran_knowledge_v1';
  var PATHS = [
    {id:'spark', title:'پریشکەی ڕۆژ', sub:'سێ خولەک · یەک دانیشتن', min:3},
    {id:'tadabbur', title:'تەدەببور', sub:'وردبوونەوە لە ئایەت', min:6},
    {id:'narrative', title:'چیرۆکەکان', sub:'یوسف، بە ڕیز', min:5},
    {id:'signs', title:'نیشانەکان', sub:'ئەوەی دەقەکە دەیڵێت', min:4},
    {id:'comfort', title:'ئارامی', sub:'بەپێی دۆخ', min:3}
  ];
  var STATES = [
    {id:'grief', t:'خەم'},
    {id:'fear', t:'ترس'},
    {id:'gratitude', t:'سوپاس'},
    {id:'anger', t:'تووڕەیی'},
    {id:'lonely', t:'تەنیایی'}
  ];
  var state = {view:'home', path:null, items:[], i:0, picked:null, held:0, revisits:0, comfort:null, askQ:''};

  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';';});}
  function bank(){return (window.__KNOWLEDGE||[]).filter(function(q){return q&&q.id&&q.ok;});}
  function loadP(){try{return JSON.parse(localStorage.getItem(STORE)||'{}');}catch(e){return {};}}
  function saveP(p){try{localStorage.setItem(STORE, JSON.stringify(p));}catch(e){}}
  function todayKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function sparkCount(p){return (p.days||[]).length;}
  function rankName(n){
    if(n>=365) return 'پارێزەری خوو';
    if(n>=180) return 'خاوەنی وردبوونەوە';
    if(n>=90) return 'قوتابی ئایەت';
    if(n>=30) return 'هاوڕێی لاپەڕە';
    if(n>=7) return 'داواکار';
    if(n>=1) return 'گوێگر';
    return 'میوان';
  }
  function markDay(p){
    p.days = p.days||[];
    var k=todayKey();
    if(p.days.indexOf(k)<0) p.days.push(k);
    p.seen = p.seen||{};
    return p;
  }
  function itemsFor(path, comfort){
    var all=bank().filter(function(q){return q.path===path;});
    if(path==='comfort' && comfort) all=all.filter(function(q){return q.state===comfort;});
    if(path==='narrative') all.sort(function(a,b){return (a.ord||0)-(b.ord||0);});
    if(path==='spark'){
      var start=Math.abs(hash(todayKey()))%Math.max(1,all.length);
      var out=[];
      for(var i=0;i<Math.min(3,all.length);i++) out.push(all[(start+i)%all.length]);
      return out;
    }
    return all;
  }
  function hash(s){var h=0;for(var i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i);return h;}

  function injectCss(){
    if($('knowledgeCss')) return;
    var s=document.createElement('style'); s.id='knowledgeCss';
    s.textContent=''
      +'body:has(#knowledgeView.active) .top{display:none!important}'
      +'.phone:has(#knowledgeView.active) .status,.phone:has(#knowledgeView.active) .appbar,.phone:has(#knowledgeView.active) .bottom{display:none!important}'
      +'.phone:has(#knowledgeView.active) .main{height:100%!important;padding:0!important;background:#071410}'
      +'#knowledgeView{display:none!important}'
      +'#knowledgeView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box;background:#071410;color:#F4EFE4}'
      +'#knowledgeView .kn-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 16px;padding-top:calc(14px + env(safe-area-inset-top));flex-shrink:0}'
      +'#knowledgeView .kn-head h2{margin:0;font-size:16px;font-weight:700;letter-spacing:.02em}'
      +'#knowledgeView .kn-sub{font-size:11px;color:#C6A15B;margin-top:3px}'
      +'#knowledgeView .kn-btn{border:1px solid rgba(198,161,91,.45);background:transparent;color:#F4EFE4;border-radius:8px;padding:8px 10px;font-size:12px;cursor:pointer}'
      +'#knowledgeView .kn-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px 28px}'
      +'#knowledgeView .kn-spark{border:1px solid rgba(198,161,91,.4);background:rgba(16,35,28,.72);border-radius:8px;padding:18px;margin-bottom:16px}'
      +'#knowledgeView .kn-kicker{color:#9AAB9F;font-size:12px;letter-spacing:.08em}'
      +'#knowledgeView .kn-ar{font-size:22px;line-height:1.9;text-align:center;margin:12px 0 4px;direction:rtl}'
      +'#knowledgeView .kn-ref{text-align:center;color:#C6A15B;font-size:12px}'
      +'#knowledgeView .kn-primary{width:100%;border:0;background:#C6A15B;color:#071410;border-radius:8px;padding:12px;font-weight:700;font-size:15px;cursor:pointer;margin-top:14px}'
      +'#knowledgeView .kn-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
      +'#knowledgeView .kn-card{text-align:right;border:1px solid rgba(198,161,91,.28);background:rgba(16,35,28,.66);border-radius:8px;padding:14px;color:inherit;cursor:pointer;min-height:132px;display:flex;flex-direction:column}'
      +'#knowledgeView .kn-card b{font-size:16px;font-weight:650}#knowledgeView .kn-card small{color:#9AAB9F;font-size:12px;line-height:1.45;margin-top:6px}'
      +'#knowledgeView .kn-rule{width:18px;height:1px;background:#C6A15B;margin-bottom:auto}'
      +'#knowledgeView .kn-q{font-size:18px;line-height:1.5;margin:18px 0 12px}'
      +'#knowledgeView .kn-opt{width:100%;text-align:right;border:1px solid rgba(244,239,228,.16);background:rgba(16,35,28,.55);color:#F4EFE4;border-radius:8px;padding:14px;margin:0 0 8px;font-size:15px;line-height:1.45;cursor:pointer;transition:border-color .24s ease,background .24s ease}'
      +'#knowledgeView .kn-opt.ok{border-color:#8FBF9F}#knowledgeView .kn-opt.miss{border-color:#C4785A}'
      +'#knowledgeView .kn-note{border-right:2px solid #C6A15B;padding:10px 12px;margin-top:8px;background:rgba(16,35,28,.5);border-radius:0 8px 8px 0}'
      +'#knowledgeView .kn-note h3{margin:0 0 6px;font-size:14px;color:#C6A15B;font-weight:650}'
      +'#knowledgeView .kn-note p{margin:0 0 8px;font-size:14px;line-height:1.7;color:#F4EFE4}'
      +'#knowledgeView .kn-src{font-size:12px;color:#9AAB9F}'
      +'#knowledgeView .kn-chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 14px}'
      +'#knowledgeView .kn-chip{border:1px solid rgba(198,161,91,.4);background:transparent;color:#F4EFE4;border-radius:20px;padding:8px 12px;cursor:pointer;font-size:13px}'
      +'#knowledgeView .kn-chip.on{background:#C6A15B;color:#071410;border-color:#C6A15B}'
      +'#knowledgeView .kn-ask{width:100%;box-sizing:border-box;border:1px solid rgba(198,161,91,.35);background:#0c1c16;color:#F4EFE4;border-radius:8px;padding:12px;font-size:14px;font-family:inherit}'
      +'#knowledgeView .kn-sheet{border-top:1px solid rgba(198,161,91,.3);padding-top:8px}'
      +'.section-choice.knowledge-choice{border-color:#1e3a32;background:linear-gradient(135deg,#fff,#e7f2ec)}'
      +'.section-choice.knowledge-choice .choice-icon{background:#d5ebe3;color:#0f3d32}';
    document.head.appendChild(s);
  }
  function ensureView(){
    var main=document.querySelector('.main'); if(!main) return null;
    var v=$('knowledgeView'); if(v) return v;
    v=document.createElement('div'); v.id='knowledgeView'; v.className='view';
    main.appendChild(v); return v;
  }
  function head(title, sub){
    var back = state.view==='home' ? '' : '<button type="button" class="kn-btn" data-k="back">گەڕانەوە</button>';
    return '<div class="kn-head"><div><h2>'+esc(title)+'</h2><div class="kn-sub">'+esc(sub)+'</div></div><div style="display:flex;gap:6px">'+back+'<button type="button" class="kn-btn" data-k="home">بەشەکان</button></div></div>';
  }
  function render(){
    injectCss(); var v=ensureView(); if(!v) return;
    var p=loadP();
    var html='';
    if(state.view==='home'){
      var days=sparkCount(p);
      var sample=itemsFor('spark')[0];
      html+=head('ناوەندی زانیاری','تەنها خوێندن · '+rankName(days));
      html+='<div class="kn-body">';
      html+='<div class="kn-spark"><div class="kn-kicker">ئەمڕۆ · '+esc(String(days))+' ڕۆژی پریشکە</div>';
      if(sample){
        html+='<div class="kn-ar">'+esc(sample.ar)+'</div><div class="kn-ref">'+esc(sample.ref)+'</div>';
      }
      html+='<button type="button" class="kn-primary" data-k="start" data-path="spark">دەستپێکردن · ٣ خولەک</button></div>';
      html+='<div class="kn-grid">';
      PATHS.forEach(function(x){
        html+='<button type="button" class="kn-card" data-k="path" data-path="'+x.id+'"><span class="kn-rule"></span><b>'+esc(x.title)+'</b><small>'+esc(x.sub)+'</small></button>';
      });
      html+='</div>';
      html+='<div class="kn-spark" style="margin-top:16px"><div class="kn-kicker">لە قورئان بپرسە</div>';
      html+='<p style="font-size:13px;color:#9AAB9F;line-height:1.6">وەڵام تەنها لە ئایەتە پێداچوونەوەکراوەکانی ئەم بەشەدایە. حوکم و فەتوا نییە.</p>';
      html+='<input id="knAsk" class="kn-ask" placeholder="بۆ نموونە: نائومێدی، سوپاس، یوسف" value="'+esc(state.askQ)+'">';
      html+='<button type="button" class="kn-primary" data-k="askGo">گەڕان لە دەق</button>';
      var hits=searchHits(state.askQ);
      hits.forEach(function(q){
        html+='<div class="kn-note" style="margin-top:10px"><h3>'+esc(q.ref)+'</h3><div class="kn-ar" style="font-size:18px">'+esc(q.ar)+'</div><p>'+esc(q.why)+'</p><div class="kn-src">'+esc(q.src)+' · خوێندنەوەیە، فەتوا نییە</div></div>';
      });
      html+='</div></div>';
    } else if(state.view==='comfortPick'){
      html+=head('ئارامی','دۆخێک هەڵبژێرە');
      html+='<div class="kn-body"><p style="color:#9AAB9F;font-size:14px;line-height:1.6">ئایەتەکان بۆ ئارامین، نەک چارەسەری پزیشکی یان حوکم.</p><div class="kn-chips">';
      STATES.forEach(function(st){
        html+='<button type="button" class="kn-chip" data-k="comfort" data-state="'+st.id+'">'+esc(st.t)+'</button>';
      });
      html+='</div></div>';
    } else if(state.view==='session'){
      var q=state.items[state.i];
      if(!q){ state.view='close'; return render(); }
      var meta=PATHS.filter(function(x){return x.id===state.path;})[0];
      html+=head(meta?meta.title:'دانیشتن', (state.i+1)+' لە '+state.items.length);
      html+='<div class="kn-body"><div class="kn-ar">'+esc(q.ar)+'</div><div class="kn-ref">'+esc(q.ref)+'</div>';
      html+='<div class="kn-q">'+esc(q.q)+'</div>';
      q.choices.forEach(function(c){
        var cls='kn-opt';
        if(state.picked){
          if(c.id===q.ok) cls+=' ok';
          else if(c.id===state.picked) cls+=' miss';
        }
        html+='<button type="button" class="'+cls+'" data-k="pick" data-id="'+esc(c.id)+'">'+esc(c.t)+'</button>';
      });
      if(state.picked){
        var good=state.picked===q.ok;
        var choice=q.choices.filter(function(c){return c.id===state.picked;})[0];
        html+='<div class="kn-note"><h3>'+(good?'ئەمە خوێندنەوەکەیە':'دیسان سەیری ئایەتەکە بکە')+'</h3>';
        html+='<p>'+esc(q.why)+'</p>';
        if(!good && q.near) html+='<p>'+esc(q.near)+'</p>';
        html+='<div class="kn-src">'+esc(q.src)+'</div></div>';
        html+='<button type="button" class="kn-primary" data-k="next">'+(state.i+1>=state.items.length?'کۆتایی':'دواتر')+'</button>';
      }
      html+='</div>';
    } else if(state.view==='close'){
      var last=state.items[state.items.length-1]||state.items[0];
      html+=head('ئەم دانیشتنە','هیچ نمرەیەک نییە');
      html+='<div class="kn-body kn-sheet"><div class="kn-kicker">'+esc(String(state.held))+' لەگەڵ دەقەکە مانەوە</div>';
      if(state.revisits) html+='<p style="color:#9AAB9F">'+state.revisits+' دانراون بۆ گەڕانەوە. هیچ شتێک ون نەبوو.</p>';
      if(last){
        html+='<div class="kn-ar">'+esc(last.ar)+'</div><div class="kn-ref">'+esc(last.ref)+'</div>';
      }
      html+='<button type="button" class="kn-primary" data-k="home">گەڕانەوە</button></div>';
    }
    v.innerHTML=html;
  }
  function searchHits(query){
    var t=String(query||'').trim();
    if(t.length<2) return [];
    var n=t.toLowerCase();
    return bank().filter(function(q){
      return [q.q,q.why,q.ar,q.ref,q.src,(q.state||'')].join(' ').toLowerCase().indexOf(n)>=0;
    }).slice(0,4);
  }
  function begin(path, comfort){
    var items=itemsFor(path, comfort);
    if(!items.length){ alert('هێشتا پرسیار نییە بۆ ئەم ڕێگایە'); return; }
    state.path=path; state.items=items; state.i=0; state.picked=null; state.held=0; state.revisits=0; state.view='session';
    render();
  }
  function onClick(e){
    var root=$('knowledgeView'); if(!root||!root.classList.contains('active')) return;
    var el=e.target.closest('[data-k]'); if(!el||!root.contains(el)) return;
    var k=el.getAttribute('data-k');
    if(k==='home'){ root.classList.remove('active'); if(typeof showView==='function') showView('startScreen','بەشەکان'); return; }
    if(k==='back'){ state.view='home'; state.picked=null; render(); return; }
    if(k==='start' || k==='path'){
      var path=el.getAttribute('data-path');
      if(path==='comfort'){ state.view='comfortPick'; render(); return; }
      begin(path, null); return;
    }
    if(k==='comfort'){ begin('comfort', el.getAttribute('data-state')); return; }
    if(k==='pick'){
      if(state.picked) return;
      var id=el.getAttribute('data-id');
      var q=state.items[state.i]; if(!q) return;
      state.picked=id;
      var p=markDay(loadP());
      p.seen[q.id]={choice:id, ok:id===q.ok, at:Date.now()};
      if(id===q.ok) state.held++; else { state.revisits++; p.revisit=p.revisit||[]; if(p.revisit.indexOf(q.id)<0) p.revisit.push(q.id); }
      saveP(p); render(); return;
    }
    if(k==='next'){
      if(state.i+1>=state.items.length){ state.view='close'; render(); return; }
      state.i++; state.picked=null; render(); return;
    }
    if(k==='askGo'){
      var inp=$('knAsk'); state.askQ=inp?inp.value.trim():''; render();
    }
  }
  window.enterKnowledge=function(){
    injectCss(); if(!ensureView()) return;
    state.view='home'; state.picked=null;
    if(typeof showView==='function') showView('knowledgeView','ناوەندی زانیاری');
    render();
  };
  function addCard(){
    var box=document.querySelector('#startScreen .section-choices'); if(!box) return false;
    if(box.querySelector('.knowledge-choice')) return true;
    var b=document.createElement('button');
    b.type='button'; b.className='section-choice knowledge-choice';
    b.innerHTML='<span class="choice-icon">Q</span><span class="choice-copy"><b>پرسیار و زانیاری</b><small>پریشکەی ڕۆژ · تەدەببور · چیرۆک · ئارامی</small></span><span class="choice-arrow">‹</span>';
    b.onclick=function(){ window.enterKnowledge(); };
    var comp=box.querySelector('.companions-choice');
    if(comp&&comp.nextSibling) box.insertBefore(b, comp.nextSibling);
    else if(comp) box.appendChild(b);
    else box.appendChild(b);
    return true;
  }
  function start(){
    injectCss();
    if(!window.__knowledgeClick){ window.__knowledgeClick=true; document.addEventListener('click', onClick); }
    var n=0; var iv=setInterval(function(){ addCard(); if(++n>30) clearInterval(iv); }, 300);
  }
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
