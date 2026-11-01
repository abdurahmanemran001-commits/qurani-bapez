/* scholars.js v4 — پرسیار بۆ هەموو مامۆستایان + ئەدمین */
(function () {
  if (window.__scholarsV4) return;
  window.__scholarsV4 = true;

  var STORE_T = 'scholars_teachers_v2';
  var STORE_Q = 'scholars_questions_v4';
  var STORE_SESS = 'scholars_session_v2';
  var STORE_ADMIN = 'scholars_admin_v2';
  var ADMIN_PASS = 'QuraniAdmin2026';
  var ALL = 'all';

  var DEMO = [
    {id:'t1',name:'مامۆستا عەبدوڵڵا محەمەد',city:'هەولێر',area:'ناوەند',mosque:'مزگەوتی گەورەی هەولێر',bio:'مامۆستای فیقهـ و تەفسیر.',topics:'فیقهـ · تەفسیر · سیرەت',photo:'',approved:true,email:'demo1@scholars.local',pass:'demo1234',created:1},
    {id:'t2',name:'مامۆستا یاسین ئەحمەد',city:'سلێمانی',area:'بەختیاری',mosque:'مزگەوتی سلێمانی ناوەند',bio:'پسپۆڕی عەقیدە.',topics:'عەقیدە · فەرموودە',photo:'',approved:true,email:'demo2@scholars.local',pass:'demo1234',created:2},
    {id:'t3',name:'مامۆستا ئیبراهیم سەعید',city:'دهۆک',area:'نزارکە',mosque:'مزگەوتی ئیبن تەیمیە',bio:'مامۆستای قورئان و سیرەت.',topics:'قورئان · تەجوید',photo:'',approved:true,email:'demo3@scholars.local',pass:'demo1234',created:3}
  ];
  var CITIES = ['هەولێر','سلێمانی','دهۆک','کەرکووک','هەڵەبجە','زاخۆ','کۆیە','ڕانیە','سۆران','موسڵ','بەغدا','تر'];
  var state = {view:'home',teacher:null,questionId:null,query:'',city:'all',photoData:'',askTarget:ALL};

  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c];});}
  function uid(){return 'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);}
  function loadTeachers(){try{var a=JSON.parse(localStorage.getItem(STORE_T)||'null');if(Array.isArray(a)&&a.length)return a;}catch(e){}try{localStorage.setItem(STORE_T,JSON.stringify(DEMO));}catch(e){}return DEMO.slice();}
  function saveTeachers(list){try{localStorage.setItem(STORE_T,JSON.stringify(list));}catch(e){}}
  function loadQuestions(){try{var a=JSON.parse(localStorage.getItem(STORE_Q)||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
  function saveQuestions(list){try{localStorage.setItem(STORE_Q,JSON.stringify(list.slice(0,500)));}catch(e){}}
  function session(){try{return JSON.parse(localStorage.getItem(STORE_SESS)||'null');}catch(e){return null;}}
  function setSession(obj){try{if(obj)localStorage.setItem(STORE_SESS,JSON.stringify(obj));else localStorage.removeItem(STORE_SESS);}catch(e){}}
  function isAdmin(){try{return localStorage.getItem(STORE_ADMIN)==='1';}catch(e){return false;}}
  function setAdmin(on){try{if(on)localStorage.setItem(STORE_ADMIN,'1');else localStorage.removeItem(STORE_ADMIN);}catch(e){}}
  function pendingCount(){return loadTeachers().filter(function(t){return !t.approved;}).length;}
  function teacherById(id){return loadTeachers().find(function(t){return t.id===id;});}
  function isForAll(q){return !q.teacherId || q.teacherId===ALL;}
  function questionsForTeacher(tid){
    return loadQuestions().filter(function(q){ return isForAll(q) || q.teacherId===tid; }).sort(function(a,b){return (b.created||0)-(a.created||0);});
  }
  function publicAnswered(){
    return loadQuestions().filter(function(q){return !!q.answer;}).sort(function(a,b){return (b.answeredAt||b.created||0)-(a.answeredAt||a.created||0);});
  }

  function injectCss(){
    if($('scholarsCss'))return;
    var s=document.createElement('style');s.id='scholarsCss';
    s.textContent='body:has(#scholarsView.active) .top{display:none!important}'
      +'.phone:has(#scholarsView.active) .status,.phone:has(#scholarsView.active) .appbar,.phone:has(#scholarsView.active) .bottom{display:none!important}'
      +'.phone:has(#scholarsView.active) .main{height:100%!important;padding:0!important;background:#f4f7f5}'
      +'#scholarsView{display:none!important}#scholarsView.active{display:flex!important;flex-direction:column;height:100%;max-height:100%;padding:0;box-sizing:border-box}'
      +'#scholarsView .sc-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(145deg,#1e3a5f,#2d5a87);color:#fff;flex-shrink:0}'
      +'#scholarsView .sc-head h2{margin:0;font-size:16px;font-weight:800}#scholarsView .sc-head .sc-sub{font-size:11px;opacity:.9;margin-top:2px}'
      +'#scholarsView .sc-btn{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer}'
      +'#scholarsView .sc-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 14px}'
      +'#scholarsView .sc-card{background:#fff;border:1px solid #c8d6e5;border-radius:14px;padding:14px;margin-bottom:10px;text-align:right}'
      +'#scholarsView .sc-card.tclick{cursor:pointer}#scholarsView .sc-row{display:flex;gap:12px;align-items:flex-start}'
      +'#scholarsView .sc-av{width:56px;height:56px;border-radius:50%;background:linear-gradient(145deg,#2d5a87,#4a7ab0);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0;overflow:hidden}'
      +'#scholarsView .sc-av.lg{width:72px;height:72px;font-size:22px}#scholarsView .sc-av img{width:100%;height:100%;object-fit:cover}'
      +'#scholarsView .sc-name{font-size:15px;font-weight:800;color:#1a2e44}#scholarsView .sc-meta{font-size:12px;color:#5a6f85;line-height:1.5}'
      +'#scholarsView .sc-search{display:flex;gap:8px;margin-bottom:10px}'
      +'#scholarsView .sc-search input,#scholarsView .sc-form input,#scholarsView .sc-form textarea,#scholarsView .sc-form select{width:100%;border:1px solid #c8d6e5;border-radius:12px;padding:10px 12px;font-size:14px;font-family:inherit;background:#fff;box-sizing:border-box}'
      +'#scholarsView .sc-form textarea{min-height:100px;resize:vertical}#scholarsView .sc-form label{display:block;font-size:12px;font-weight:700;color:#3a5068;margin:10px 0 4px}'
      +'#scholarsView .sc-search button,#scholarsView .sc-primary{border:0;background:#2d5a87;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:14px}'
      +'#scholarsView .sc-secondary{border:1px solid #c8d6e5;background:#fff;color:#1a2e44;border-radius:12px;padding:10px 14px;font-weight:600;cursor:pointer;font-size:13px}'
      +'#scholarsView .sc-danger{border:0;background:#c62828;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:13px}'
      +'#scholarsView .sc-ok{border:0;background:#2e7d32;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:13px}'
      +'#scholarsView .sc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}'
      +'#scholarsView .sc-chip{border:1px solid #c8d6e5;background:#fff;border-radius:20px;padding:6px 12px;font-size:12px;cursor:pointer;color:#1a2e44}'
      +'#scholarsView .sc-chip.on{background:#2d5a87;color:#fff;border-color:#2d5a87}'
      +'#scholarsView .sc-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}'
      +'#scholarsView .sc-empty{text-align:center;color:#5a6f85;padding:28px 10px;font-size:14px}'
      +'#scholarsView .sc-note{background:#eef4fa;border:1px solid #c8d6e5;border-radius:12px;padding:10px 12px;font-size:12px;color:#3a5068;margin-bottom:12px;line-height:1.6}'
      +'#scholarsView .sc-warn{background:#fff8e1;border:1px solid #ffe082;border-radius:12px;padding:10px 12px;font-size:12px;color:#7a5a00;margin-bottom:12px;line-height:1.6}'
      +'#scholarsView .sc-q{background:#f8fafc;border-right:3px solid #2d5a87;padding:10px 12px;margin:8px 0;border-radius:0 10px 10px 0;font-size:14px;line-height:1.7}'
      +'#scholarsView .sc-a{background:#f0f7f2;border-right:3px solid #3d6b52;padding:10px 12px;margin:8px 0;border-radius:0 10px 10px 0;font-size:14px;line-height:1.7}'
      +'#scholarsView .sc-badge{display:inline-block;background:#e8f0f8;color:#2d5a87;border-radius:8px;padding:2px 8px;font-size:11px;margin-top:6px}'
      +'#scholarsView .sc-badge.wait{background:#fff3e0;color:#b86e00}#scholarsView .sc-badge.ok{background:#e8f5e9;color:#2e7d32}'
      +'#scholarsView .sc-badge.all{background:#e3f2fd;color:#1565c0}'
      +'#scholarsView .sc-photo-preview{width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #c8d6e5;margin-top:8px;display:block}'
      +'#scholarsView .sc-admin-dot{display:inline-block;min-width:18px;height:18px;line-height:18px;text-align:center;background:#ff5252;color:#fff;border-radius:9px;font-size:11px;font-weight:800;padding:0 5px}'
      +'.section-choice.scholars-choice{border-color:#c8d6e5;background:linear-gradient(135deg,#fff,#eef4fa)}'
      +'.section-choice.scholars-choice .choice-icon{background:#d6e4f0;color:#2d5a87}';
    document.head.appendChild(s);
  }
  function ensureView(){var main=document.querySelector('.main');if(!main)return null;var v=$('scholarsView');if(v)return v;v=document.createElement('div');v.id='scholarsView';v.className='view';main.appendChild(v);return v;}
  function initials(name){var p=String(name||'').trim().split(/\s+/).filter(Boolean);if(!p.length)return 'م';if(p.length===1)return p[0].slice(0,1);return p[0].slice(0,1)+p[p.length-1].slice(0,1);}
  function approvedTeachers(){return loadTeachers().filter(function(t){return t.approved;});}
  function cities(){var map={};approvedTeachers().forEach(function(t){if(t.city)map[t.city]=true;});return Object.keys(map);}
  function filteredTeachers(){var list=approvedTeachers();if(state.city&&state.city!=='all')list=list.filter(function(t){return t.city===state.city;});var q=(state.query||'').trim().toLowerCase();if(q)list=list.filter(function(t){return [t.name,t.city,t.area,t.mosque,t.bio,t.topics].join(' ').toLowerCase().indexOf(q)>=0;});return list;}
  function title(){
    if(state.view==='profile'&&state.teacher)return state.teacher.name;
    if(state.view==='ask')return 'پرسیاری نەناسراو';
    if(state.view==='board')return 'پرسیار و وەڵام';
    if(state.view==='login')return 'چوونەژوورەوەی مامۆستا';
    if(state.view==='register')return 'تۆماربوونی مامۆستا';
    if(state.view==='dash')return 'پانێڵی مامۆستا';
    if(state.view==='qdetail')return 'وردەکاری پرسیار';
    if(state.view==='admin')return 'پانێڵی ئەدمین';
    if(state.view==='adminLogin')return 'چوونەژوورەوەی ئەدمین';
    return 'مامۆستای ئایینی';
  }
  function avHtml(t,lg){var cls='sc-av'+(lg?' lg':'');if(t&&t.photo)return '<div class="'+cls+'"><img src="'+esc(t.photo)+'" alt=""></div>';return '<div class="'+cls+'">'+esc(initials(t&&t.name))+'</div>';}
  function cityOptions(sel){var h='<option value="">— شار هەڵبژێرە —</option>';CITIES.forEach(function(c){h+='<option value="'+esc(c)+'"'+(sel===c?' selected':'')+'>'+esc(c)+'</option>';});return h;}
  function answererName(q){
    if(q.answererName) return q.answererName;
    if(q.answererId){var t=teacherById(q.answererId);if(t)return t.name;}
    return 'مامۆستا';
  }

  function render(){
    injectCss();var v=ensureView();if(!v)return;
    var sess=session(),pend=pendingCount();
    var adminBtn=isAdmin()?'<button type="button" class="sc-btn" data-act="admin">ئەدمین'+(pend?' <span class="sc-admin-dot">'+pend+'</span>':'')+'</button>':'<button type="button" class="sc-btn" data-act="adminLogin">⚙</button>';
    var head='<div class="sc-head"><div><h2>☪ '+esc(title())+'</h2><div class="sc-sub">پرسیار بۆ هەموو مامۆستایان · وەڵامی پشتڕاستکراو</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">'
      +(state.view!=='home'?'<button type="button" class="sc-btn" data-act="back">‹ گەڕانەوە</button>':'')+adminBtn
      +(sess?'<button type="button" class="sc-btn" data-act="dash">پانێڵ</button><button type="button" class="sc-btn" data-act="logout">دەرچوون</button>':'<button type="button" class="sc-btn" data-act="login">مامۆستا؟</button>')
      +'<button type="button" class="sc-btn" data-act="home">بەشەکان</button></div></div>';
    var body='<div class="sc-body">';

    if(state.view==='adminLogin'){
      body+='<div class="sc-warn">تەنها خاوەنی ئەپەکە دەتوانێت مامۆستا پشتڕاست بکاتەوە.</div>';
      body+='<div class="sc-form"><label>وشەی نهێنی ئەدمین</label><input id="scAdminPass" type="password">';
      body+='<div class="sc-actions"><button type="button" class="sc-primary" data-act="doAdminLogin">چوونەژوورەوە</button></div></div>';
    } else if(state.view==='admin'){
      if(!isAdmin()) body+='<div class="sc-empty">دەسەڵات نییە</div>';
      else {
        var all=loadTeachers().slice().sort(function(a,b){return (b.created||0)-(a.created||0);});
        var pendList=all.filter(function(t){return !t.approved;});
        var okList=all.filter(function(t){return t.approved;});
        body+='<div class="sc-note">چاوەڕوان: <b>'+pendList.length+'</b> · پشتڕاستکراو: <b>'+okList.length+'</b></div>';
        body+='<div class="sc-actions" style="margin-bottom:12px"><button type="button" class="sc-secondary" data-act="adminLogout">دەرچوونی ئەدمین</button></div>';
        body+='<div style="font-weight:800;margin:8px 0;color:#b86e00">⏳ چاوەڕوان</div>';
        if(!pendList.length) body+='<div class="sc-empty">هیچ داواکارییەک نییە</div>';
        pendList.forEach(function(t){
          body+='<div class="sc-card"><div class="sc-row">'+avHtml(t)+'<div style="flex:1"><div class="sc-name">'+esc(t.name)+'</div>';
          body+='<div class="sc-meta">📧 '+esc(t.email)+'<br>📍 '+esc(t.city)+'<br>🕌 '+esc(t.mosque)+'</div>';
          body+='<div class="sc-actions"><button type="button" class="sc-ok" data-act="approve" data-tid="'+esc(t.id)+'">✓ ڕێپێدان</button>';
          body+='<button type="button" class="sc-danger" data-act="reject" data-tid="'+esc(t.id)+'">✕ سڕینەوە</button></div></div></div></div>';
        });
        body+='<div style="font-weight:800;margin:16px 0 8px;color:#2e7d32">✓ پشتڕاستکراو</div>';
        okList.forEach(function(t){
          body+='<div class="sc-card"><div class="sc-row">'+avHtml(t)+'<div style="flex:1"><div class="sc-name">'+esc(t.name)+'</div>';
          body+='<div class="sc-meta">📍 '+esc(t.city)+' · 🕌 '+esc(t.mosque)+'</div>';
          body+='<div class="sc-actions"><button type="button" class="sc-danger" data-act="reject" data-tid="'+esc(t.id)+'">سڕینەوە</button></div></div></div></div>';
        });
      }
    } else if(state.view==='profile'&&state.teacher){
      var t=state.teacher;
      body+='<div class="sc-card"><div class="sc-row">'+avHtml(t,true)+'<div style="flex:1"><div class="sc-name">'+esc(t.name)+'</div>';
      body+='<div class="sc-meta">📍 '+esc(t.city)+(t.area?' — '+esc(t.area):'')+'<br>🕌 '+esc(t.mosque)+'</div></div></div>';
      if(t.bio) body+='<p style="margin:12px 0 0;font-size:14px;line-height:1.7">'+esc(t.bio)+'</p>';
      body+='<div class="sc-actions"><button type="button" class="sc-primary" data-act="askOne">پرسیار تەنها بۆ ئەم مامۆستایە</button></div></div>';
    } else if(state.view==='ask'){
      var targetLabel = state.askTarget===ALL ? 'هەموو مامۆستایان' : ((state.teacher&&state.teacher.name)||'مامۆستا');
      body+='<div class="sc-note">پرسیار <b>بەبێ ناو</b> دەنێردرێت بۆ: <b>'+esc(targetLabel)+'</b>.<br>';
      if(state.askTarget===ALL) body+='هەر مامۆستایەکی پشتڕاستکراو دەتوانێت وەڵام بداتەوە.';
      body+='</div>';
      body+='<div class="sc-form"><label>پرسیار</label><textarea id="scAskText"></textarea>';
      body+='<div class="sc-actions"><button type="button" class="sc-primary" data-act="sendAsk">ناردن</button></div></div>';
    } else if(state.view==='board'){
      body+='<div class="sc-note">وەڵامە گشتییەکان — هەر مامۆستایەک وەڵامی داوەتەوە.</div>';
      body+='<div class="sc-actions" style="margin-bottom:12px"><button type="button" class="sc-primary" data-act="askAll">+ پرسیاری نوێ (بۆ هەمووان)</button></div>';
      var pub=publicAnswered();
      if(!pub.length) body+='<div class="sc-empty">هێشتا وەڵام نییە</div>';
      pub.slice(0,40).forEach(function(q){
        body+='<div class="sc-card"><div class="sc-q"><b>پرسیار</b><br>'+esc(q.text)+'</div>';
        body+='<div class="sc-a"><b>وەڵام</b> <span class="sc-badge ok">'+esc(answererName(q))+'</span><br>'+esc(q.answer)+'</div></div>';
      });
    } else if(state.view==='login'){
      body+='<div class="sc-note">تەنها مامۆستا ئەکاونتی هەیە.</div>';
      body+='<div class="sc-form"><label>ئیمەیل</label><input id="scLoginEmail" type="email"><label>وشەی نهێنی</label><input id="scLoginPass" type="password">';
      body+='<div class="sc-actions"><button type="button" class="sc-primary" data-act="doLogin">چوونەژوورەوە</button><button type="button" class="sc-secondary" data-act="register">تۆماربوون</button></div>';
      body+='<p style="font-size:12px;color:#5a6f85;margin-top:12px">نموونە: demo1@scholars.local / demo1234</p></div>';
    } else if(state.view==='register'){
      body+='<div class="sc-warn">دوای تۆماربوون چاوەڕوانی ڕێپێدانی ئەدمین دەبیت.</div>';
      body+='<div class="sc-form"><label>ناو *</label><input id="scRegName" type="text"><label>ئیمەیل *</label><input id="scRegEmail" type="email">';
      body+='<label>وشەی نهێنی *</label><input id="scRegPass" type="password"><label>شار *</label><select id="scRegCity">'+cityOptions('')+'</select>';
      body+='<label>گەڕەک</label><input id="scRegArea" type="text"><label>مزگەوت *</label><input id="scRegMosque" type="text">';
      body+='<label>بابەتەکان</label><input id="scRegTopics" type="text"><label>باس</label><textarea id="scRegBio"></textarea>';
      body+='<label>وێنە</label><input id="scRegPhotoFile" type="file" accept="image/*"><img id="scRegPhotoPrev" class="sc-photo-preview" style="display:none" alt="">';
      body+='<div class="sc-actions"><button type="button" class="sc-primary" data-act="doRegister">ناردنی داواکاری</button></div></div>';
    } else if(state.view==='dash'){
      if(!sess) body+='<div class="sc-empty">تکایە بچۆ ژوورەوە</div>';
      else {
        var me=loadTeachers().find(function(x){return x.id===sess.teacherId;});
        if(!me) body+='<div class="sc-empty">پرۆفایل نەدۆزرایەوە</div>';
        else {
          body+='<div class="sc-card"><div class="sc-row">'+avHtml(me)+'<div><div class="sc-name">'+esc(me.name)+'</div><div class="sc-meta">'+esc(me.city)+' · '+esc(me.mosque)+'</div>';
          body+=me.approved?'<span class="sc-badge ok">پشتڕاستکراو</span>':'<span class="sc-badge wait">چاوەڕوان</span></div></div></div>';
          if(!me.approved) body+='<div class="sc-warn">هێشتا ناتوانیت وەڵام بدەیتەوە تا ئەدمین ڕێت پێ نەدات.</div>';
          else {
            var qs=questionsForTeacher(me.id);
            var wait=qs.filter(function(q){return !q.answer;});
            body+='<div class="sc-note">پرسیارەکان بۆ <b>هەموو مامۆستایان</b> و تایبەت بە تۆ.<br>چاوەڕوان: <b>'+wait.length+'</b></div>';
            if(!qs.length) body+='<div class="sc-empty">هیچ پرسیارێک نییە</div>';
            qs.forEach(function(q){
              body+='<div class="sc-card tclick" data-qid="'+esc(q.id)+'"><div style="font-size:14px">'+esc(q.text.slice(0,160))+'</div>';
              if(isForAll(q)) body+='<span class="sc-badge all">بۆ هەمووان</span> ';
              body+=q.answer?'<span class="sc-badge ok">وەڵامدراوە</span>':'<span class="sc-badge wait">چاوەڕوان</span></div>';
            });
          }
        }
      }
    } else if(state.view==='qdetail'&&state.questionId){
      var q=loadQuestions().find(function(x){return x.id===state.questionId;});
      var sess2=session();
      var me2=sess2?loadTeachers().find(function(x){return x.id===sess2.teacherId;}):null;
      var canAns=me2&&me2.approved&&q&&!q.answer&&(isForAll(q)||q.teacherId===me2.id);
      if(!q) body+='<div class="sc-empty">پرسیار نەدۆزرایەوە</div>';
      else {
        body+='<div class="sc-card"><div class="sc-q"><b>پرسیار</b>';
        if(isForAll(q)) body+=' <span class="sc-badge all">بۆ هەموو مامۆستایان</span>';
        body+='<br>'+esc(q.text)+'</div>';
        if(q.answer) body+='<div class="sc-a"><b>وەڵام</b> · '+esc(answererName(q))+'<br>'+esc(q.answer)+'</div>';
        else if(canAns) body+='<div class="sc-form"><label>وەڵامی تۆ</label><textarea id="scAnsText"></textarea><div class="sc-actions"><button type="button" class="sc-primary" data-act="saveAns">پاشەکەوت</button></div></div>';
        else body+='<div class="sc-meta">چاوەڕوانی وەڵام...</div>';
        body+='</div>';
      }
    } else {
      if(isAdmin()&&pend>0) body+='<div class="sc-warn" style="cursor:pointer" data-act="admin">⚠ '+pend+' داواکاری چاوەڕوانە</div>';
      body+='<div class="sc-note"><b>پرسیار بۆ هەموو مامۆستایان</b> — هەر مامۆستایەکی پشتڕاستکراو دەتوانێت وەڵام بداتەوە. پرسیارکەر نەناسراوە.</div>';
      body+='<div class="sc-actions" style="margin-bottom:12px">';
      body+='<button type="button" class="sc-primary" data-act="askAll">پرسیار بکە (بۆ هەمووان)</button>';
      body+='<button type="button" class="sc-secondary" data-act="board">بینینی وەڵامەکان</button></div>';
      body+='<div style="font-weight:800;margin:8px 0">مامۆستایان</div>';
      body+='<div class="sc-search"><input id="scQ" type="search" value="'+esc(state.query)+'"><button type="button" data-act="searchGo">گەڕان</button></div>';
      body+='<div class="sc-chips"><button type="button" class="sc-chip'+(state.city==='all'?' on':'')+'" data-city="all">هەموو</button>';
      cities().forEach(function(c){body+='<button type="button" class="sc-chip'+(state.city===c?' on':'')+'" data-city="'+esc(c)+'">'+esc(c)+'</button>';});
      body+='</div>';
      var list=filteredTeachers();
      if(!list.length) body+='<div class="sc-empty">هیچ مامۆستایەک نییە</div>';
      list.forEach(function(t){
        body+='<div class="sc-card tclick" data-tid="'+esc(t.id)+'"><div class="sc-row">'+avHtml(t)+'<div style="flex:1"><div class="sc-name">'+esc(t.name)+'</div>';
        body+='<div class="sc-meta">📍 '+esc(t.city)+' · 🕌 '+esc(t.mosque)+'</div></div></div></div>';
      });
      var recent=publicAnswered().slice(0,3);
      if(recent.length){
        body+='<div style="font-weight:800;margin:16px 0 8px">دوایین وەڵامەکان</div>';
        recent.forEach(function(q){
          body+='<div class="sc-card"><div class="sc-q">'+esc(q.text.slice(0,100))+(q.text.length>100?'…':'')+'</div>';
          body+='<div class="sc-a"><b>'+esc(answererName(q))+'</b>: '+esc(q.answer.slice(0,120))+(q.answer.length>120?'…':'')+'</div></div>';
        });
      }
    }
    body+='</div>';
    v.innerHTML=head+body;
    var fileInp=$('scRegPhotoFile');
    if(fileInp) fileInp.addEventListener('change',function(){
      var f=fileInp.files&&fileInp.files[0];if(!f)return;
      if(f.size>900000){alert('وێنە < ١MB');return;}
      var reader=new FileReader();
      reader.onload=function(){state.photoData=String(reader.result||'');var prev=$('scRegPhotoPrev');if(prev){prev.src=state.photoData;prev.style.display='block';}};
      reader.readAsDataURL(f);
    });
  }

  function onClick(e){
    var root=$('scholarsView');if(!root||!root.classList.contains('active'))return;
    var el=e.target.closest('[data-act],[data-tid],[data-city],[data-qid]');if(!el||!root.contains(el))return;
    var act=el.getAttribute('data-act');

    if(act==='home'){root.classList.remove('active');if(typeof showView==='function')showView('startScreen','بەشەکان');return;}
    if(act==='back'){
      if(state.view==='ask'){state.view=state.askTarget===ALL?'home':(state.teacher?'profile':'home');}
      else if(state.view==='qdetail'){state.view='dash';state.questionId=null;}
      else if(state.view==='admin'||state.view==='adminLogin'||state.view==='board') state.view='home';
      else {state.view='home';state.teacher=null;}
      render();return;
    }
    if(act==='login'){state.view='login';render();return;}
    if(act==='register'){state.photoData='';state.view='register';render();return;}
    if(act==='dash'){state.view='dash';render();return;}
    if(act==='logout'){setSession(null);setAdmin(false);state.view='home';render();return;}
    if(act==='adminLogin'){state.view='adminLogin';render();return;}
    if(act==='admin'){if(!isAdmin()){state.view='adminLogin';render();return;}state.view='admin';render();return;}
    if(act==='adminLogout'){setAdmin(false);state.view='home';render();return;}
    if(act==='doAdminLogin'){var ap=($('scAdminPass')||{}).value||'';if(ap===ADMIN_PASS){setAdmin(true);state.view='admin';render();}else alert('وشەی نهێنی هەڵەیە.');return;}
    if(act==='approve'){if(!isAdmin())return;var tidA=el.getAttribute('data-tid');saveTeachers(loadTeachers().map(function(t){return t.id===tidA?Object.assign({},t,{approved:true}):t;}));render();return;}
    if(act==='reject'){if(!isAdmin())return;var tidR=el.getAttribute('data-tid');if(!confirm('سڕینەوە؟'))return;saveTeachers(loadTeachers().filter(function(t){return t.id!==tidR;}));render();return;}
    if(act==='searchGo'){var inp=$('scQ');state.query=inp?inp.value.trim():'';render();return;}
    if(act==='board'){state.view='board';render();return;}
    if(act==='askAll'){state.askTarget=ALL;state.teacher=null;state.view='ask';render();return;}
    if(act==='askOne'&&state.teacher){state.askTarget=state.teacher.id;state.view='ask';render();return;}

    if(act==='sendAsk'){
      var text=((($('scAskText')||{}).value)||'').trim();
      if(text.length<8){alert('پرسیار کورتە');return;}
      var qs=loadQuestions();
      qs.unshift({id:uid(),teacherId:state.askTarget||ALL,text:text,answer:'',answererId:'',answererName:'',created:Date.now(),answeredAt:0});
      saveQuestions(qs);
      alert('پرسیار نێردرا');
      state.view=state.askTarget===ALL?'home':(state.teacher?'profile':'home');
      render();return;
    }

    if(act==='doLogin'){
      var em=((($('scLoginEmail')||{}).value)||'').trim().toLowerCase();
      var pw=($('scLoginPass')||{}).value||'';
      var found=loadTeachers().find(function(t){return String(t.email||'').toLowerCase()===em&&String(t.pass||'')===pw;});
      if(!found){alert('هەڵەیە');return;}
      setSession({teacherId:found.id,name:found.name});state.view='dash';render();return;
    }

    if(act==='doRegister'){
      var name=((($('scRegName')||{}).value)||'').trim();
      var email=((($('scRegEmail')||{}).value)||'').trim().toLowerCase();
      var pass=($('scRegPass')||{}).value||'';
      var city=((($('scRegCity')||{}).value)||'').trim();
      var area=((($('scRegArea')||{}).value)||'').trim();
      var mosque=((($('scRegMosque')||{}).value)||'').trim();
      var topics=((($('scRegTopics')||{}).value)||'').trim();
      var bio=((($('scRegBio')||{}).value)||'').trim();
      var photo=state.photoData||'';
      if(name.length<3||!email||pass.length<6||!city||!mosque){alert('زانیاری پڕبکەرەوە');return;}
      var list=loadTeachers();
      if(list.some(function(t){return String(t.email||'').toLowerCase()===email;})){alert('ئیمەیل بەکارهاتووە');return;}
      var neu={id:uid(),name:name,email:email,pass:pass,city:city,area:area,mosque:mosque,topics:topics,bio:bio,photo:photo,approved:false,created:Date.now()};
      list.unshift(neu);saveTeachers(list);setSession({teacherId:neu.id,name:neu.name});
      alert('داواکاری نێردرا');state.view='dash';render();return;
    }

    if(act==='saveAns'){
      var ans=((($('scAnsText')||{}).value)||'').trim();
      if(ans.length<3){alert('وەڵام کورتە');return;}
      var sess3=session();
      var me3=sess3?loadTeachers().find(function(x){return x.id===sess3.teacherId;}):null;
      if(!me3||!me3.approved){alert('دەسەڵات نییە');return;}
      saveQuestions(loadQuestions().map(function(x){
        if(x.id!==state.questionId) return x;
        return Object.assign({},x,{answer:ans,answeredAt:Date.now(),answererId:me3.id,answererName:me3.name});
      }));
      state.view='dash';state.questionId=null;render();return;
    }

    var city=el.getAttribute('data-city');if(city){state.city=city;render();return;}
    var tid=el.getAttribute('data-tid');
    if(tid&&act!=='approve'&&act!=='reject'){
      var tt=loadTeachers().find(function(x){return x.id===tid&&x.approved;});
      if(tt){state.teacher=tt;state.view='profile';render();}
      return;
    }
    var qid=el.getAttribute('data-qid');
    if(qid){state.questionId=qid;state.view='qdetail';render();}
  }

  window.enterScholars=function(){
    injectCss();if(!ensureView())return;
    state.view='home';state.teacher=null;
    if(typeof showView==='function')showView('scholarsView','مامۆستای ئایینی');
    render();
  };

  function dedupeCards(box){var all=box.querySelectorAll('.scholars-choice');for(var i=1;i<all.length;i++){try{all[i].parentNode.removeChild(all[i]);}catch(e){}}return all.length>0;}
  function addCard(){var box=document.querySelector('#startScreen .section-choices');if(!box)return false;if(dedupeCards(box))return true;var b=document.createElement('button');b.type='button';b.className='section-choice scholars-choice';
    b.innerHTML='<span class="choice-icon">🎓</span><span class="choice-copy"><b>مامۆستای ئایینی</b><small>پرسیار بۆ هەمووان · وەڵام</small></span><span class="choice-arrow">‹</span>';
    b.onclick=function(){window.enterScholars();};box.appendChild(b);dedupeCards(box);return true;}
  function start(){
    injectCss();
    if(!window.__scholarsClickBound){window.__scholarsClickBound=true;document.addEventListener('click',onClick);}
    var n=0;var iv=setInterval(function(){addCard();if(++n>30)clearInterval(iv);},300);
  }
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
