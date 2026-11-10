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
    {id:'comfort', title:'ئایەت بەپێی هەست', sub:'خەم · ترس · سوپاس · تەنیایی', min:3},
    {id:'quranic', title:'زانستی قورئان', sub:'تەفسیر · محکم و متشابه · ئیعجاز', min:3},
    {id:'fiqh', title:'فقهی هاوچەرخ', sub:'مامەڵە · ڕۆژوو · پرسیارە نوێکان', min:3},
    {id:'aqeedah', title:'عەقیدە و گومانەکان', sub:'تەوحید · قەدەر · مانای ژیان', min:3},
    {id:'jihad', title:'جیهاد و ئەخلاقی شەڕ', sub:'سنوورە شەرعییەکان · ئاشتی', min:3},
    {id:'seerah', title:'سیرە و ستراتیژی پێغەمبەر', sub:'حودەیبیە · شورا · کۆچکردن', min:3}
  ];
  var STATES = [
    {id:'grief', t:'خەم'},
    {id:'fear', t:'ترس'},
    {id:'anxious', t:'دڵەڕاوکێ'},
    {id:'lost', t:'ونبوون و بێ ئارامی'},
    {id:'gratitude', t:'سوپاس'},
    {id:'anger', t:'تووڕەیی'},
    {id:'lonely', t:'تەنیایی'}
  ];
  var state = {view:'home', path:null, items:[], i:0, picked:null, aiTopic:'', aiQuiz:null, held:0, revisits:0, wrong:0, total:0, comfort:null, askQ:'', mode:'normal', deadline:0, timerId:null};

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
    return all;
  }
  function hash(s){var h=0;for(var i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i);return h;}
  function currentLang(){
    if(window.appLang) return window.appLang;
    try{return localStorage.getItem('app_language')||'ckb';}catch(e){return 'ckb';}
  }
  function questionCache(lang){
    try{return JSON.parse(localStorage.getItem('kn_i18n_v1_'+lang)||'{}');}catch(e){return {};}
  }
  function saveQuestionCache(lang,id,data){
    try{
      var c=questionCache(lang); c[id]=data;
      var keys=Object.keys(c); if(keys.length>250) keys.slice(0,keys.length-250).forEach(function(k){delete c[k];});
      localStorage.setItem('kn_i18n_v1_'+lang,JSON.stringify(c));
    }catch(e){}
  }
  function restoreQuestion(q){
    if(!q.__original) return;
    q.q=q.__original.q;
    q.choices=q.__original.choices.map(function(c){return Object.assign({},c);});
    q.why=q.__original.why; q.near=q.__original.near; q.src=q.__original.src;
    q.__localizedLang=null;
  }
  function applyQuestionTranslation(q,data,lang){
    if(!q.__original){
      q.__original={q:q.q,choices:(q.choices||[]).map(function(c){return Object.assign({},c);}),why:q.why||'',near:q.near||'',src:q.src||''};
    }
    q.q=data.q||q.__original.q;
    q.choices=Array.isArray(data.choices)&&data.choices.length===q.__original.choices.length?data.choices.map(function(c){return {id:c.id,t:c.t};}):q.__original.choices.map(function(c){return Object.assign({},c);});
    q.why=data.why||q.__original.why;
    q.near=data.near||q.__original.near;
    q.src=data.src||q.__original.src;
    q.__localizedLang=lang; q.__localizing=false; q.__localizeFailed=false;
  }
  function localizeQuestionForDisplay(q){
    var lang=currentLang();
    if(!q||lang==='ckb'||q.ai) return true;
    if(q.__localizedLang===lang) return true;
    if(q.__original && q.__localizedLang && q.__localizedLang!==lang) restoreQuestion(q);
    var cached=questionCache(lang)[q.id];
    if(cached){applyQuestionTranslation(q,cached,lang);return true;}
    if(q.__localizeFailed) return true;
    if(!window.AiShariRag||!window.AiShariRag.localizeQuestion){q.__localizeFailed=true;return true;}
    if(!q.__localizing){
      q.__localizing=true; qStopTimer();
      window.AiShariRag.localizeQuestion(q).then(function(data){
        if(state.view!=='session'||state.items[state.i]!==q||currentLang()!==lang){q.__localizing=false;return;}
        applyQuestionTranslation(q,data,lang); saveQuestionCache(lang,q.id,data); render();
      }).catch(function(){
        q.__localizing=false; q.__localizeFailed=true;
        if(state.view==='session'&&state.items[state.i]===q) render();
      });
    }
    return false;
  }

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
      +'#knowledgeView .kn-ringwrap{display:flex;justify-content:center;margin:2px 0 8px}#knowledgeView .kn-ring{position:relative;width:62px;height:62px}#knowledgeView .kn-ring svg{width:100%;height:100%;transform:rotate(-90deg)}#knowledgeView .kn-ring circle{fill:none;stroke-width:4}#knowledgeView .kn-ring .bg{stroke:#263b32}#knowledgeView .kn-ring .fg{stroke:#8FBF9F;stroke-linecap:round;transition:stroke-dashoffset .1s linear,stroke .3s}#knowledgeView .kn-ring.low .fg{stroke:#e0584d}#knowledgeView .kn-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;color:#F4EFE4}#knowledgeView .kn-ring.low b{color:#ff8a80;animation:knpulse .5s infinite alternate}@keyframes knpulse{to{transform:scale(1.18)}}'
      +'#knowledgeView .kn-aitm{display:flex;align-items:center;gap:10px;margin:0 0 12px}#knowledgeView .kn-aibar{flex:1;height:9px;background:#263b32;border-radius:8px;overflow:hidden}#knowledgeView .kn-aibar i{display:block;height:100%;width:100%;background:#8FBF9F;transition:width .1s linear}#knowledgeView .kn-aibar i.low{background:#d6574d}#knowledgeView .kn-aitm span{font-size:20px;font-weight:700;color:#C6A15B;min-width:26px;text-align:center}'
      +'#knowledgeView .kn-opt.dim{opacity:.5}#knowledgeView .kn-opt.ok{background:rgba(60,160,100,.28)}#knowledgeView .kn-opt.miss{background:rgba(214,87,77,.3);animation:knshake .35s}@keyframes knshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}'
      +'#knowledgeView .kn-aiok h3{color:#8FD6A8}#knowledgeView .kn-aino h3{color:#ef8a80}'
      +'#knowledgeView .kn-aiload{position:fixed;inset:0;background:rgba(10,24,19,.93);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#F4EFE4;z-index:20;text-align:center}#knowledgeView .kn-aiload small{opacity:.7}#knowledgeView .kn-spin{width:44px;height:44px;border:4px solid rgba(244,239,228,.2);border-top-color:#C6A15B;border-radius:50%;animation:knspin .8s linear infinite}@keyframes knspin{to{transform:rotate(360deg)}}'
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
      +'#knowledgeView .kn-modebar{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 16px}'
      +'#knowledgeView .kn-stat{border:1px solid rgba(198,161,91,.35);border-radius:8px;padding:10px;background:#10231c;color:#F4EFE4;text-align:center;font-size:13px}'
      +'#knowledgeView .kn-celebrate{position:fixed;inset:0;pointer-events:none;z-index:100000;overflow:hidden}'
      +'#knowledgeView .kn-confetti{position:absolute;top:-12px;width:8px;height:13px;animation:knfall 1.25s ease-in forwards;opacity:.95}'
      +'@keyframes knfall{to{transform:translate3d(var(--dx),105vh,0) rotate(760deg);opacity:0}}'
      +'#knowledgeView .kn-progress{height:5px;background:#263b32;border-radius:8px;overflow:hidden;margin:8px 0 14px}'
      +'#knowledgeView .kn-progress i{display:block;height:100%;background:#C6A15B}'
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
    if(state.view==='session'){
      var activeQuestion=state.items[state.i];
      if(activeQuestion&&!localizeQuestionForDisplay(activeQuestion)){
        v.innerHTML='<div class="kn-aiload"><div class="kn-spin"></div><b>وەرگێڕانی پرسیارەکە ئامادە دەکرێت…</b><small>تکایە چاوەڕێ بکە</small></div>';
        return;
      }
    }
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
      html+='<div class="kn-modebar"><button type="button" class="kn-btn" data-k="lightning">⚡ تاقیکردنەوەی ٣ خولەک</button><button type="button" class="kn-btn" data-k="review">📚 گەنجینەی پێداچوونەوە ('+((p.revisit||[]).length)+')</button></div>';
      html+='<div class="kn-spark"><div class="kn-kicker">پرسیاری نوێی زیرەک · AI</div><p style="font-size:13px;color:#9AAB9F;line-height:1.6">بابەتێک بنووسە یان بەتاڵی بهێڵە بۆ پرسیاری جۆراوجۆر. پرسیارەکە لەسەر سەرچاوەی قورئان و حەدیث دروست دەکرێت.</p><input id="knAiTopic" class="kn-ask" placeholder="بابەت: تەوحید، نوێژ، سیرە، ڕۆژوو..." value="'+esc(state.aiTopic||'')+'"><button type="button" class="kn-primary" data-k="aiGenerate">دروستکردنی پرسیاری نوێ</button></div>';
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
    } else if(state.view==='aiQuiz'){
      var aq=state.aiQuiz, tmo=aq.picked==='__timeout'; html+=head('پرسیاری زیرەکی','پرسیارێکی نوێ لەسەر بەڵگە'); html+='<div class="kn-body">';
      if(!aq.picked) html+='<div class="kn-ringwrap">'+ringHtml(Math.max(0,(aq.deadline-Date.now())/1000),'knAiRing')+'</div>';
      html+='<div class="kn-spark"><div class="kn-kicker">'+esc(aq.topic||'بابەتی جۆراوجۆر')+(typeof state.aiRem==='number'?' · ماوە: '+state.aiRem+' لە ٥٠ (هەر ٨ سەعات)':'')+'</div><div class="kn-q">'+esc(aq.question)+'</div>';
      aq.choices.forEach(function(c){var cls='kn-opt';if(aq.picked){if(c.id===aq.answer)cls+=' ok';else if(c.id===aq.picked)cls+=' miss';else cls+=' dim';}html+='<button type="button" class="'+cls+'" data-k="aiPick" data-id="'+esc(c.id)+'" '+(aq.picked?'disabled':'')+'>'+(aq.picked&&c.id===aq.answer?'✓ ':aq.picked&&c.id===aq.picked?'✗ ':'')+esc(c.text)+'</button>';});
      if(aq.picked){var okp=aq.picked===aq.answer;html+='<div class="kn-note kn-ai'+(okp?'ok':'no')+'"><h3>'+(tmo?'⏰ کاتەکە تەواو بوو — هەڵەیە':okp?'✅ وەڵامی دروستە! ئافەرین':'❌ هەڵەیە')+'</h3><p>'+esc(aq.explanation)+'</p><div class="kn-src">بەڵگە: '+esc(aq.evidence||'')+'</div></div><button type="button" class="kn-primary" data-k="aiAgain">پرسیارێکی نوێ ‹</button>'; } html+='</div></div>';
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
      html+=head(meta?meta.title:(state.endless?'♾️ پرسیاری بێ کۆتایی':'دانیشتن'), state.endless?('پرسیاری '+(state.i+1)):((state.i+1)+' لە '+state.items.length));
      var curQ=state.items[state.i]; if(curQ&&!state.picked&&(curQ.__dl==null||state.__dlFor!==curQ)){curQ.__dl=Date.now()+Q_T*1000;state.__dlFor=curQ;}
      html+='<div class="kn-body">'+(state.picked?'':'<div class="kn-ringwrap">'+ringHtml(Math.max(0,((curQ&&curQ.__dl)-Date.now())/1000),'knRing')+'</div>')+'<div class="kn-stat">'+(state.mode==='lightning'?'⏱️ '+Math.max(0,Math.ceil((state.deadline-Date.now())/1000))+' چرکە ماوە':(state.endless?'♾️ پرسیاری '+(state.i+1)+' · ڕاست: '+state.held:'پرسیاری '+(state.i+1)+' لە '+state.items.length))+'</div><div class="kn-progress"><i style="width:'+(state.endless?((state.i%10)+1)*10:Math.round((state.i/state.items.length)*100))+'%"></i></div><div class="kn-ar">'+esc(q.ar)+'</div><div class="kn-ref">'+esc(q.ref)+'</div>';
      if(state.aiLimitMsg) html+='<div class="kn-kicker" style="margin-bottom:8px">🤖 '+esc(state.aiLimitMsg)+'</div>';
      html+='<div class="kn-q">'+(q.ai?'🤖 ':'')+esc(q.q)+'</div>';
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
        html+='<div class="kn-note"><h3>'+(state.picked==='__timeout'?'⏰ کاتەکە تەواو بوو':good?'ئەمە خوێندنەوەکەیە':'کارتی دانایی · هەڵەکردن بەشێکە لە فێربوون')+'</h3>';
        html+='<p>'+esc(q.why)+'</p>';
        if(!good) html+='<p>بە ئارامی فێربە؛ وەڵامی هەڵە کۆتایی نییە. سەرچاوەکە بخوێنەوە و دووبارە هەوڵ بدە.</p>';
        if(!good && q.near) html+='<p>'+esc(q.near)+'</p>';
        html+='<div class="kn-src">'+esc(q.src)+'</div></div>';
        html+='<button type="button" class="kn-primary" data-k="next">'+(state.i+1>=state.items.length&&!state.endless?'کۆتایی':'دواتر')+'</button>'+(state.endless?'<button type="button" class="kn-btn" data-k="finish" style="margin-top:8px;width:100%">🏁 کۆتایی و بینینی ئەنجام</button>':'');
      }
      html+='</div>';
    } else if(state.view==='close'){
      var last=state.items[state.items.length-1]||state.items[0];
      var pct=state.total?Math.round(state.held/state.total*100):0;
      var badge=pct>=90?'زێڕینی زانست':pct>=70?'قوتابیی باش':pct>=50?'گەڕان بەدوای زانست': 'دەستپێکی فێربوون';
      html+=head('ئەنجامی تاقیکردنەوە','ڕاپۆرتی ئەم دانیشتنە');
      html+='<div class="kn-body kn-sheet"><div class="kn-spark"><div class="kn-kicker">ئەنجامی کۆتایی</div><div style="font-size:28px;font-weight:800;text-align:center;margin:14px 0">'+state.held+' / '+state.total+'</div><div style="text-align:center;font-size:16px">وەڵامی ڕاست: '+state.held+' لە '+state.total+' پرسیار</div><div class="kn-progress"><i style="width:'+pct+'%"></i></div><div style="text-align:center;color:#C6A15B;font-weight:700">'+badge+' · '+pct+'%</div><p style="text-align:center;color:#9AAB9F">«وَقُل رَّبِّ زِدْنِي عِلْمًا» — طه ١١٤</p></div><div class="kn-stat">هەڵەکان بۆ پێداچوونەوە پاشەکەوت کراون: '+state.revisits+'</div>';
      if(state.revisits) html+='<p style="color:#9AAB9F">'+state.revisits+' دانراون بۆ گەڕانەوە. هیچ شتێک ون نەبوو.</p>';
      if(last){
        html+='<div class="kn-ar">'+esc(last.ar)+'</div><div class="kn-ref">'+esc(last.ref)+'</div>';
      }
      html+='<button type="button" class="kn-primary" data-k="home">گەڕانەوە</button></div>';
    }
    if(state.aiBusy) html+='<div class="kn-aiload"><div class="kn-spin"></div><b>پرسیارەکە ئامادە دەکرێت…</b><small>لە سەرچاوەی قورئان و حەدیث</small></div>';
    v.innerHTML=html;
    if(state.view==='session'&&!state.picked) qStartTimer(); else qStopTimer();
  }
  function celebrate(){
    var root=$('knowledgeView'); if(!root)return;
    var layer=document.createElement('div');layer.className='kn-celebrate';
    for(var i=0;i<54;i++){var bit=document.createElement('i');bit.className='kn-confetti';bit.style.left=(Math.random()*100)+'%';bit.style.setProperty('--dx',((Math.random()-.5)*180)+'px');bit.style.animationDelay=(Math.random()*.25)+'s';bit.style.background=['#C6A15B','#8FBF9F','#F4EFE4','#7BA7A0'][i%4];layer.appendChild(bit);}
    root.appendChild(layer);setTimeout(function(){if(layer.parentNode)layer.parentNode.removeChild(layer);},1700);
    try{var C=window.AudioContext||window.webkitAudioContext;if(C){var ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=660;g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.18);setTimeout(function(){ctx.close();},300);}}catch(e){}
  }
  var AI_T=15, aiTimer=null, aiPre=null;
  function aiStopTimer(){ if(aiTimer){clearInterval(aiTimer);aiTimer=null;} }
  function aiFetch(topic){
    var p=loadP(), seen=(p.aiSeen||[]).slice();
    return window.AiShariRag.generateQuiz(topic||'',seen).then(function(q){
      if(!q||!q.question) throw new Error('پرسیار دروست نەبوو');
      if(seen.indexOf(q.fingerprint)>=0) throw new Error('پرسیارەکە پێشتر هاتووە');
      return q;
    });
  }
  function aiPrefetch(){
    if(aiPre||!window.AiShariRag||!window.AiShariRag.generateQuiz) return;
    var topic=state.aiTopic||''; aiPre={topic:topic,p:aiFetch(topic).catch(function(){return null;})};
  }
  function aiShow(q){
    state.aiBusy=false; state.aiQuiz=q; state.aiRem=(typeof q.remaining==='number')?q.remaining:state.aiRem; q.picked=null; q.deadline=Date.now()+AI_T*1000; state.view='aiQuiz'; render(); aiStartTimer(); aiPrefetch();
  }
  function aiStartTimer(){
    aiStopTimer();
    aiTimer=setInterval(function(){
      var q=state.aiQuiz; if(!q||q.picked||state.view!=='aiQuiz'){aiStopTimer();return;}
      var left=Math.max(0,(q.deadline-Date.now())/1000); ringSet('knAiRing',left);
      if(left<=0){ aiStopTimer(); aiPick('__timeout'); }
    },100);
  }
  function aiPick(id){
    var q=state.aiQuiz; if(!q||q.picked) return; aiStopTimer(); q.picked=id;
    var hp=loadP();hp.aiSeen=hp.aiSeen||[];if(q.fingerprint&&hp.aiSeen.indexOf(q.fingerprint)<0)hp.aiSeen.push(q.fingerprint);if(hp.aiSeen.length>1500)hp.aiSeen=hp.aiSeen.slice(-1500);saveP(hp);
    render(); if(id===q.answer) celebrate(); else { try{ if(navigator.vibrate) navigator.vibrate(120); }catch(e){} }
  }
  function generateAiQuiz(){
    if(!window.AiShariRag||!window.AiShariRag.generateQuiz){alert('خزمەتگوزاری AI ئامادە نییە؛ پەیوەندیی AI بپشکنە.');return;}
    var topic=state.aiTopic||'';
    if(aiPre&&aiPre.topic===topic){ var pre=aiPre; aiPre=null; state.aiBusy=true; render(); pre.p.then(function(q){ if(q&&(loadP().aiSeen||[]).indexOf(q.fingerprint)<0) aiShow(q); else return aiFetch(topic).then(aiShow); }).catch(aiFail); return; }
    aiPre=null; state.aiBusy=true; render();
    aiFetch(topic).then(aiShow).catch(aiFail);
  }
  function aiFail(e){ state.aiBusy=false; state.view='home'; render(); alert('پرسیاری AI: '+((e&&e.message)||e)); }
  function searchHits(query){
    var t=String(query||'').trim();
    if(t.length<2) return [];
    var n=t.toLowerCase();
    return bank().filter(function(q){
      return [q.q,q.why,q.ar,q.ref,q.src,(q.state||'')].join(' ').toLowerCase().indexOf(n)>=0;
    }).slice(0,4);
  }
  var PATH_TOPIC={spark:'ئایەتی ڕۆژانە و تێگەیشتن',tadabbur:'تەدەببوری قورئان',narrative:'چیرۆکەکانی قورئان و پێغەمبەران',signs:'نیشانەکانی خوا لە جیهان',comfort:'ئارامی و دڵنیایی',quranic:'زانستەکانی قورئان',fiqh:'فیقهی عیبادەت: نوێژ و ڕۆژوو و زەکات',aqeedah:'عەقیدە و تەوحید',jihad:'ئاشتی و ڕێسای جیهاد لە ئیسلام',seerah:'سیرەی پێغەمبەر'};
  function aiToItem(q,path){
    return {id:'ai:'+(q.fingerprint||Math.random().toString(36).slice(2)),path:path,diff:'steady',ar:'',ref:'',q:q.question,choices:q.choices.map(function(c){return {id:c.id,t:c.text};}),ok:q.answer,why:q.explanation,near:'',src:'🤖 بەڵگە: '+(q.evidence||''),ai:1,fp:q.fingerprint};
  }
  function pathPrefetch(){
    if(!state.endless||state.aiStop||state.aiFetching||!window.AiShariRag||!window.AiShariRag.generateQuiz) return;
    if((state.aiBuf||[]).length>=1) return;
    var path=state.path, topic=PATH_TOPIC[path]||''; if(path==='narrative'){ var PR=['ئادەم','نوح','هود','سالح','ئیبراهیم','لوط','ئیسماعیل','یەعقوب','یوسف','ئەیوب','شوعەیب','موسا','هارون','داود','سلێمان','زەکەریا','یەحیا','عیسا','یونس','ئیلیاس','ئیدریس','موحەممەد']; topic='چیرۆکی پێغەمبەر '+PR[Math.floor(Math.random()*PR.length)]; } state.aiFetching=true;
    aiFetch(topic).then(function(q){
      state.aiFetching=false; if(state.path!==path||!state.endless) return;
      (state.aiBuf=state.aiBuf||[]).push(aiToItem(q,path));
      if(typeof q.remaining==='number') state.aiRem=q.remaining;
    }).catch(function(e){ state.aiFetching=false; if(e&&e.rate){state.aiStop=true;state.aiLimitMsg=e.message;} });
  }
  function injectAi(){
    if(!state.aiBuf||!state.aiBuf.length||!state.endless) return;
    var it=state.aiBuf.shift(); state.items.splice(state.i+1,0,it); setTimeout(pathPrefetch,50);
  }
  function gSeen(){var p=loadP();var m={};(p.gseen||[]).forEach(function(i){m[i]=1;});return m;}
  function moreEndless(n,path){
    if(!window.KnEndless) return [];
    var seen=gSeen(); var arr=window.KnEndless.batch(n,seen,path);
    if(arr.length<n){ var p=loadP(); p.gseen=[]; saveP(p); arr=arr.concat(window.KnEndless.batch(n-arr.length,{},path)); }
    return arr;
  }
  function begin(path, comfort, mode){
    var progress=loadP(), seen=progress.seen||{};
    var items=itemsFor(path, comfort);
    if(mode==='lightning') items=bank().slice().sort(function(){return Math.random()-.5;});
    if(mode==='review'){
      var ids=(progress.revisit||[]); items=bank().filter(function(q){return ids.indexOf(q.id)>=0;});
      if(!items.length){ alert('هیچ پرسیارێکی هەڵەکراو بۆ پێداچوونەوە نییە.'); return; }
      return beginSession(path,items,mode,false);
    }
    if(mode!=='lightning'){ var fresh=items.filter(function(q){return !seen[q.id];}); items=(fresh.length?fresh:items.slice()).sort(function(){return Math.random()-.5;}); }
    var ep=window.KnEndless?window.KnEndless.ready():Promise.resolve(false);
    state.aiBusy=true; render();
    ep.then(function(ok){
      state.aiBusy=false;
      if(ok) items=items.concat(moreEndless(mode==='lightning'?60:10,path));
      if(!items.length){ render(); alert('پرسیار ئامادە نییە؛ پەیوەندیی ئینتەرنێت بپشکنە.'); return; }
      beginSession(path,items,mode,!!ok);
    });
  }
  function beginSession(path,items,mode,endless){
    state.path=path; state.items=items.map(function(q){var x=Object.assign({},q);if(q.choices)x.choices=q.choices.map(function(c){return Object.assign({},c);});return x;}); state.i=0; state.picked=null; state.held=0; state.revisits=0; state.wrong=0; state.endless=!!endless && mode!=='review'; state.aiBuf=[]; state.aiStop=false; state.aiFetching=false; state.aiLimitMsg=''; state.total=mode==='lightning'?999:(state.endless?0:items.length); state.mode=mode||'normal'; state.deadline=mode==='lightning'?Date.now()+180000:0; state.view='session';
    if(state.timerId) clearInterval(state.timerId);
    if(mode==='lightning') state.timerId=setInterval(function(){ if(Date.now()>=state.deadline){clearInterval(state.timerId);state.timerId=null;state.total=state.i+(state.picked?1:0);state.view='close';render();} else {var t=document.querySelector('#knowledgeView .kn-stat');if(t)t.textContent='⏱️ '+Math.max(0,Math.ceil((state.deadline-Date.now())/1000))+' چرکە ماوە';}},1000);
    render(); if(state.endless && mode!=='lightning') pathPrefetch();
  }
  function doPick(id){
      if(state.picked) return;
      var q=state.items[state.i]; if(!q) return;
      qStopTimer(); state.picked=id;
      var p=markDay(loadP());
      var gen=/^(g|ai):/.test(q.id);
      if(/^ai:/.test(q.id)&&q.fp){ var hp=loadP(); hp.aiSeen=hp.aiSeen||[]; if(hp.aiSeen.indexOf(q.fp)<0) hp.aiSeen.push(q.fp); saveP(hp); p=markDay(loadP()); }
      if(gen){ p.gseen=p.gseen||[]; p.gseen.push(q.id); if(p.gseen.length>9000) p.gseen=p.gseen.slice(-9000); }
      else p.seen[q.id]={choice:id, ok:id===q.ok, at:Date.now()};
      if(id===q.ok){ state.held++; if(!gen) p.revisit=(p.revisit||[]).filter(function(x){return x!==q.id;}); celebrate(); }
      else { state.revisits++; state.wrong++; if(!gen){ p.revisit=p.revisit||[]; if(p.revisit.indexOf(q.id)<0) p.revisit.push(q.id); } try{ if(navigator.vibrate) navigator.vibrate(120); }catch(e){} }
      state.total=state.mode==='lightning'?Math.max(state.total,state.i+1):(state.endless?state.i+1:state.items.length);
      saveP(p); render();
  }
  var Q_T=15, qTimer=null;
  function ringHtml(left,id){
    var C=2*Math.PI*19, off=C*(1-Math.max(0,Math.min(1,left/Q_T)));
    return '<div class="kn-ring'+(left<=5?' low':'')+'" id="'+id+'"><svg viewBox="0 0 44 44"><circle class="bg" cx="22" cy="22" r="19"/><circle class="fg" cx="22" cy="22" r="19" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><b>'+Math.ceil(left)+'</b></div>';
  }
  function ringSet(id,left){
    var r=$(id); if(!r) return; var C=2*Math.PI*19, fg=r.querySelector('.fg'), b=r.querySelector('b');
    if(fg) fg.setAttribute('stroke-dashoffset',(C*(1-Math.max(0,Math.min(1,left/Q_T)))).toFixed(1)); if(b) b.textContent=Math.ceil(left); r.className='kn-ring'+(left<=5?' low':'');
  }
  function qStopTimer(){ if(qTimer){clearInterval(qTimer);qTimer=null;} }
  function qStartTimer(){
    qStopTimer(); var it=state.items[state.i]; if(!it||state.picked) return;
    if(it.__dl==null||state.__dlFor!==it) { it.__dl=Date.now()+Q_T*1000; state.__dlFor=it; }
    qTimer=setInterval(function(){
      var cur=state.items[state.i]; if(state.view!=='session'||!cur||state.picked||cur!==it){qStopTimer();return;}
      var left=Math.max(0,(it.__dl-Date.now())/1000); ringSet('knRing',left);
      if(left<=0){ qStopTimer(); doPick('__timeout'); }
    },100);
  }
  function onClick(e){
    var root=$('knowledgeView'); if(!root||!root.classList.contains('active')) return;
    var el=e.target.closest('[data-k]'); if(!el||!root.contains(el)) return;
    var k=el.getAttribute('data-k');
    if(k==='home'){ aiStopTimer(); if(state.timerId)clearInterval(state.timerId);state.timerId=null;root.classList.remove('active'); if(typeof showView==='function') showView('startScreen','بەشەکان'); return; }
    if(k==='back'){ aiStopTimer(); state.view='home'; state.picked=null; render(); return; }
    if(k==='start' || k==='path'){
      var path=el.getAttribute('data-path');
      if(path==='comfort'){ state.view='comfortPick'; render(); return; }
      begin(path, null); return;
    }
    if(k==='comfort'){ begin('comfort', el.getAttribute('data-state')); return; }
    if(k==='lightning'){ begin('all', null, 'lightning'); return; }
    if(k==='review'){ begin('review', null, 'review'); return; }
    if(k==='pick'){ doPick(el.getAttribute('data-id')); return; }
    if(k==='finish'){ if(state.timerId)clearInterval(state.timerId);state.timerId=null;state.total=state.i+(state.picked?1:0);state.view='close';render();return; }
    if(k==='next'){
      if(state.endless && state.mode!=='lightning' && (state.i+1)%3===0) injectAi();
      if(state.i+1>=state.items.length && state.endless){ state.items=state.items.concat(moreEndless(10,state.path)); }
      if(state.i+1>=state.items.length){ if(state.timerId)clearInterval(state.timerId);state.timerId=null;state.total=state.items.length;state.view='close'; render(); return; }
      state.i++; state.picked=null; if(state.mode==='lightning')state.total=state.i; render(); return;
    }
    if(k==='askGo'){
      var inp=$('knAsk'); state.askQ=inp?inp.value.trim():''; render();
    }
    if(k==='aiGenerate'){var topic=$('knAiTopic');state.aiTopic=topic?topic.value.trim():'';generateAiQuiz();}
    if(k==='aiPick'){aiPick(el.getAttribute('data-id'));}
    if(k==='aiAgain'){aiStopTimer();state.aiTopic=state.aiTopic||'';generateAiQuiz();}
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
  window.addEventListener('app-language-changed',function(){
    var lang=currentLang();
    if(state.view==='session'){
      var q=state.items[state.i];
      if(q&&!q.ai){restoreQuestion(q);q.__localizedLang=null;q.__localizing=false;q.__localizeFailed=false;}
      render();
    }else if(state.view==='home'||state.view==='comfortPick'||state.view==='close'){render();}
  });
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
