/* V10: task routing and capacity choice. Existing ledgers own all marked evidence. */
(() => {
 if(typeof navigate!=='function')return;
 const host=document.createElement('section');host.className='panel v10-execution';host.id='execution-desk';
 const hero=document.querySelector('.fs-hero');if(hero)hero.after(host);else document.getElementById('panel-command').prepend(host);
 let subject='biology',minutes='15',mode='restart';
 const modes={restart:['One bounded question','restart'],essay:['Biology paragraph','biology-essay'],calculation:['Chemistry calculation','chemistry-chain'],reasoning:['Physics reasoning','physics-model'],mcq:['MCQ misconception','mcq-audit'],practical:['Practical data or graph','practical-data'],repair:['Repair a recurring error','repair'],retest:['Delayed independent retest','delayed'],paper:['Timed paper review','paper-review'],weekly:['Weekly evidence review','weekly']};
 function render(){
  if(shareSafeMode){host.replaceChildren();const title=document.createElement('h3'),p=document.createElement('p');title.textContent='Study Execution Desk';p.textContent='Personal summaries and launch controls are hidden in Share-safe mode.';host.append(title,p);return;}
  host.innerHTML='<div class="panel-head"><div><div class="eyebrow">V11 · choose a task that fits</div><h3>Make the next block concrete.</h3><p>A short block can produce useful evidence. Choose its purpose and available time; the existing ledger remains the place for marks.</p></div></div><div class="v10-controls"><label>Subject<select id="v10-subject"><option value="biology">Biology</option><option value="chemistry">Chemistry</option><option value="physics">Physics</option></select></label><label>Available window<select id="v10-minutes"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option></select></label><label>Purpose<select id="v10-mode"></select></label></div><p id="v10-scope" class="v10-scope"></p><div class="v9-actions"><a class="primary-btn" id="v10-guide">Open this guided workflow →</a><button type="button" class="secondary-btn" id="v10-start">Open chosen focus timer</button><a class="secondary-btn" id="v10-track">Track this block</a><button class="secondary-btn" type="button" id="v10-due">Review due checks</button></div><p id="v10-summary" class="v6-note"></p><p class="v6-note">A plan, saved note or timer does not award marks. If this is a repair or retest, open its exact chain before recording the result. Atlas teaches AI workflows; paper attempts here remain independent.</p><a class="v10-companion" href="https://ai-mastery-atlas.phenlleyniron.chatgpt.site/workflow-studio/">Need help choosing a responsible AI workflow? Open AI Mastery Atlas ↗</a>';
  const get=id=>document.getElementById(id),sel=get('v10-mode');
  for(const [id,[label]]of Object.entries(modes)){const o=document.createElement('option');o.value=id;o.textContent=label;sel.append(o);}
  get('v10-subject').value=subject;get('v10-minutes').value=minutes;sel.value=mode;
  function update(){subject=get('v10-subject').value;minutes=get('v10-minutes').value;mode=sel.value;const n=Number(minutes);
   get('v10-scope').textContent=n===15?'15-minute scope: one small unaided attempt or one narrow correction. If marking cannot fit, write the exact next step. Continue the learning cycle in a later block.':n===30?'30-minute scope: one bounded attempt plus strict marking, or a focused repair check. Keep the first result and defer anything that does not fit.':'Longer scope: attempt and mark a bounded set, repair one important cause and prepare fresh transfer. A delayed retest still needs a later sitting.';
   get('v10-guide').href='/workflow-studio/?minutes='+minutes+'&subject='+subject+'&view=run#'+modes[mode][1];
   const type=({retest:'delayed-retest',repair:'repair',paper:'timed-paper',essay:'essay',calculation:'structured-questions',reasoning:'structured-questions',mcq:'mcq-set',practical:'structured-questions',weekly:'resource-admin'})[mode]||'active-recall';
   get('v10-track').href='/study-tracker/?'+new URLSearchParams({subject,type,minutes,topic:modes[mode][0]});
   const today=state.attempts.filter(a=>a.date===todayISO()&&a.subject===subject);
   const due=actionableRetests().filter(r=>r.due<=todayISO()).length;
   get('v10-summary').textContent=titleCase(subject)+': '+today.length+' ledger attempt'+(today.length===1?'':'s')+' recorded today. '+due+' actionable check'+(due===1?'':'s')+' due across the core ledger. These counts do not establish mastery.';
  }
  for(const id of ['v10-subject','v10-minutes','v10-mode'])get(id).onchange=()=>{if(id==='v10-mode'){if(sel.value==='essay')get('v10-subject').value='biology';if(sel.value==='calculation')get('v10-subject').value='chemistry';if(sel.value==='reasoning')get('v10-subject').value='physics';}update();};
  get('v10-start').onclick=()=>{if(!shareSafeMode)startFocus(Number(minutes),titleCase(subject)+' · '+modes[mode][0]);};get('v10-due').onclick=()=>navigate('repairs');update();
 }
 render();for(const hook of ['onRender','onSave']){const previous=window.PowerhouseUpgrade?.[hook];if(window.PowerhouseUpgrade)window.PowerhouseUpgrade[hook]=function(){previous?.apply(this,arguments);render();};}
 document.getElementById('share-safe-btn')?.addEventListener('click',render);
 // The React home is a same-origin frame. Carry incoming tool-directory deep links into it.
 if(window.parent!==window){try{const sync=()=>{const route=window.parent.location.hash.slice(1);if(route&&document.getElementById('panel-'+route))navigate(route);};sync();window.parent.addEventListener('hashchange',sync);}catch{/* A foreign embed cannot control navigation. */}}
})();
