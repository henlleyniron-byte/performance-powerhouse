/* Read-only review, opening the existing verification editor by exact source ID. */
(()=>{
  'use strict';
  const M=PowerhouseRepairBoard,esc=escapeHTML,host=document.createElement('section');
  host.id='repair-command';host.className='panel repair-command';host.setAttribute('aria-labelledby','repair-command-title');
  document.getElementById('v12-review-summary').after(host);
  const nextMove=document.createElement('section');nextMove.className='panel rc-next-move';nextMove.id='repair-next-move';nextMove.setAttribute('aria-label','Next useful evidence action');document.querySelector('.v12-home').after(nextMove);
  let query='',subject='all',group='active',visible=12,rows=[],failure='';
  const dialog=document.createElement('dialog');dialog.className='rc-brief-dialog';dialog.setAttribute('aria-labelledby','rc-brief-title');
  dialog.innerHTML='<div class="rc-brief-heading"><div><p class="eyebrow">PRIVATE REVIEW / INSPECT BEFORE EXPORT</p><h2 id="rc-brief-title">Your next repair actions.</h2></div><button class="secondary-btn" type="button" id="rc-brief-close" aria-label="Close repair brief">×</button></div><p>This contains your filtered core review records, including question references and personal diagnoses. Keep it private.</p><label>Complete repair brief<textarea id="rc-brief-text" readonly rows="12"></textarea></label><div class="rc-brief-actions"><a class="primary-btn" id="rc-brief-download">Download Markdown file</a><button class="secondary-btn" type="button" id="rc-brief-copy">Copy complete brief</button><button class="secondary-btn" type="button" id="rc-brief-back">Back to review</button></div><p id="rc-brief-status" role="status">If downloading is unavailable, copy the complete text above.</p>';
  document.body.append(dialog);let briefUrl=null;
  const inspector=document.createElement('dialog');inspector.className='rc-inspector';inspector.setAttribute('aria-labelledby','rc-inspector-title');document.body.append(inspector);
  inspector.addEventListener('close',()=>inspector.replaceChildren());
  function inspect(id){
    if(shareSafeMode)return;
    try{
      const snapshot=window.PowerhouseVerificationDesk.snapshot();if(!snapshot.readable)throw Error('Restore the original verification ledger before inspecting its evidence.');
      const trail=PowerhouseRepairInspector.inspect(snapshot.records[id]||{originalId:id},state.attempts,todayISO());
      inspector.innerHTML='<div class="rc-brief-heading"><div><p class="eyebrow">V15 / EVIDENCE TRAIL</p><h2 id="rc-inspector-title">'+esc(trail.skill)+'</h2></div><button type="button" class="secondary-btn" id="rc-inspector-close" aria-label="Close evidence trail">×</button></div><p class="rc-inspector-verdict"><strong>'+esc(trail.assessment.label)+'</strong><br>'+esc(trail.assessment.next)+'</p><p>Read-only inspection of your linked records. The existing verifier owns the overall stage. Matching references alone do not prove that a question is materially new.</p><ol class="rc-trail">'+trail.steps.map(step=>'<li data-passed="'+step.passed+'"><div class="rc-trail-heading"><h3>'+esc(step.title)+'</h3><span>'+(step.passed?'Recorded checks met':'Needs inspection')+'</span></div>'+(step.record?'<p class="rc-trail-reference">'+esc(step.record.question)+' · '+esc(step.record.subject)+' · '+esc(step.record.date)+' · '+esc(step.record.earned)+' / '+esc(step.record.total)+'</p>':'')+(step.detail?'<p>'+esc(step.detail)+'</p>':'')+(step.problems.length?'<ul>'+step.problems.map(reason=>'<li>'+esc(reason)+'</li>').join('')+'</ul>':'<p class="rc-trail-pass">This row meets its recorded checks. Overall retention still requires the complete chain.</p>')+'</li>').join('')+'</ol><div class="rc-brief-actions"><button type="button" class="primary-btn" id="rc-inspector-open">Open existing verification desk →</button><button type="button" class="secondary-btn" id="rc-inspector-back">Back to review</button></div>';
      inspector.querySelector('#rc-inspector-close').onclick=inspector.querySelector('#rc-inspector-back').onclick=()=>inspector.close();
      inspector.querySelector('#rc-inspector-open').onclick=()=>{inspector.close();if(!window.PowerhouseVerificationDesk.open(id))document.getElementById('data-btn').click();};
      inspector.showModal();
    }catch(error){toast(error.message);}
  }
  const dget=id=>dialog.querySelector('#'+id);
  function clearBrief(){dget('rc-brief-text').value='';dget('rc-brief-download').removeAttribute('href');if(briefUrl)URL.revokeObjectURL(briefUrl);briefUrl=null;}
  dialog.addEventListener('close',clearBrief);dget('rc-brief-close').onclick=dget('rc-brief-back').onclick=()=>dialog.close();
  dget('rc-brief-copy').onclick=async()=>{if(shareSafeMode)return;try{await navigator.clipboard.writeText(dget('rc-brief-text').value);dget('rc-brief-status').textContent='Repair brief copied. Keep this private.';}catch{dget('rc-brief-text').focus();dget('rc-brief-text').select();dget('rc-brief-status').textContent='Clipboard access is unavailable. The complete brief is selected; copy it manually.';}};
  function refresh(){
    rows=[];failure='';
    if(shareSafeMode){dialog.close();clearBrief();inspector.close();inspector.replaceChildren();}
    if(!shareSafeMode)try{
      PowerhouseReview.normalize(state,todayISO());
      const snapshot=window.PowerhouseVerificationDesk?.snapshot();
      if(!snapshot?.readable)throw Error('The verification ledger could not be read safely. Open Repairs to export its original bytes and use the existing recovery controls.');
      rows=M.build(state.attempts,snapshot.records,todayISO(),PowerhouseVerification.assess);
    }catch(error){failure=error.message;}
    render();renderNextMove();
  }
  function renderNextMove(){
    if(shareSafeMode){nextMove.innerHTML='<h3>Next useful evidence action</h3><p>Private next actions are hidden in Share-safe mode.</p>';return;}
    const next=rows.find(r=>!['waiting','retained'].includes(r.group));
    nextMove.innerHTML=failure?'<p role="status">'+esc(failure)+'</p>':next?'<div><p class="eyebrow">V15 / YOUR NEXT USEFUL CHECK</p><h3>'+esc(next.title)+'</h3><p>'+esc(next.label)+' · '+esc(titleCase(next.subject))+'</p><p>'+esc(next.next)+'</p></div><div class="rc-next-actions"><button type="button" class="primary-btn" id="rc-next-inspect">Inspect this evidence trail →</button><button type="button" class="secondary-btn" id="rc-next-all">Review all repair records</button></div>':'<div><p class="eyebrow">V15 / ONE USEFUL NEXT STEP</p><h3>'+(rows.some(r=>r.group==='waiting')?'Let the delayed check wait.':'Start with one small, honestly marked question.')+'</h3><p>'+(rows.some(r=>r.group==='waiting')?'Your linked delayed checks are scheduled for later. Keep their delay intact; choose another bounded question.':'No open core chain requires action here. This does not establish mastery; a new marked attempt can expose the next useful repair.')+'</p></div><div class="rc-next-actions"><button type="button" class="primary-btn" id="rc-next-log">Log completed marked work</button><button type="button" class="secondary-btn" id="rc-next-all">Inspect review board</button></div>';
    nextMove.querySelector('#rc-next-inspect')?.addEventListener('click',()=>inspect(next.id));nextMove.querySelector('#rc-next-all')?.addEventListener('click',()=>{navigate('review');host.scrollIntoView({block:'start'});});nextMove.querySelector('#rc-next-log')?.addEventListener('click',()=>openAttemptDialog());
  }
  function render(){
    if(shareSafeMode){host.innerHTML='<h2 id="repair-command-title">Repair Command</h2><p>Private repair details and exports are hidden in Share-safe mode.</p>';return;}
    host.innerHTML='<div class="repair-command-heading"><div><p class="eyebrow">V15 / REPAIR COMMAND</p><h2 id="repair-command-title">Close the loop on a lost mark.</h2><p>Every core verification chain, plus marked attempts without a linked chain. Open the original evidence before choosing the next check.</p></div><button class="secondary-btn" id="rc-export" type="button">Export private review brief</button></div><div class="rc-summary" id="rc-summary"></div><div class="rc-filters"><label>Find a repair<input type="search" id="rc-query" placeholder="Question reference, weakness or next step"></label><label>Subject<select id="rc-subject"><option value="all">All subjects</option>'+M.subjects.map(s=>'<option value="'+s+'">'+titleCase(s)+'</option>').join('')+'</select></label><label>Evidence stage<select id="rc-group"><option value="active">Needs action or inspection</option><option value="due">Delayed checks due</option><option value="hold">Marking key on hold</option><option value="repair">Repair / transfer needed</option><option value="unlinked">No linked chain</option><option value="waiting">Waiting for delayed check</option><option value="retained">Retained chosen weakness</option><option value="all">All records</option></select></label></div><p id="rc-count" role="status" aria-live="polite"></p><div id="rc-results" class="rc-results"></div><button class="secondary-btn" type="button" id="rc-more" hidden>Show next 12 records</button><p class="v6-note">Core ledger only: separate subject, practical and workflow logs keep their own records. Scheduled checks do not become due early. “Retained” applies to the linked chosen weakness, not a whole topic or predicted grade.</p>';
    const get=id=>host.querySelector('#'+id);
    get('rc-query').value=query;get('rc-subject').value=subject;get('rc-group').value=group;
    get('rc-summary').innerHTML=[['due','Delayed checks due'],['repair','Repair / transfer'],['waiting','Waiting'],['unlinked','Unlinked attempts']].map(([key,label])=>'<div><strong>'+rows.filter(r=>r.group===key).length+'</strong><span>'+label+'</span></div>').join('');
    if(failure)get('rc-summary').replaceChildren();
    const update=()=>{
      const selected=M.filter(rows,{query,subject,group}),shown=selected.slice(0,visible);
      get('rc-count').textContent=failure||`${selected.length} of ${rows.length} core review records match · showing ${shown.length}.`;
      get('rc-results').innerHTML=failure?'':shown.length?shown.map(r=>'<article><div class="rc-row-top"><span class="rc-stage" data-group="'+r.group+'">'+esc(r.label)+'</span><span>'+esc(titleCase(r.subject))+' · '+esc(r.score)+'</span></div><h3>'+esc(r.title)+'</h3><p class="rc-reference">'+esc(r.reference)+' · '+esc(r.date)+'</p><p>'+esc(r.next)+'</p>'+(r.due?'<p class="rc-due">Earliest delayed check: <time>'+esc(r.due)+'</time></p>':'')+'<button type="button" class="secondary-btn" '+(r.stage==='missing-source'?'data-rc-recover':('data-rc-open="'+esc(r.id)+'"'))+'>'+(r.stage==='missing-source'?'Restore original evidence':r.linked?'Open exact verification chain':'Inspect original & start a chain')+' →</button><button type="button" class="secondary-btn rc-inspect-btn" data-rc-inspect="'+esc(r.id)+'">Why this stage? Inspect trail</button></article>').join(''):'<div class="rc-empty"><h3>'+(!rows.length?'Begin with one honest marked attempt.':'No records match these filters.')+'</h3><p>'+(!rows.length?'An empty board does not establish mastery. Log a real question and mark it against the scheme.':'Try All records or a shorter reference. Waiting and retained chains have their own views.')+'</p><button type="button" class="secondary-btn" id="rc-reset">'+(!rows.length?'Log marked work':'Show all records')+'</button></div>';
      get('rc-more').hidden=Boolean(failure)||selected.length<=visible;get('rc-export').disabled=Boolean(failure)||!selected.length;
      get('rc-results').querySelectorAll('[data-rc-open]').forEach(b=>b.onclick=()=>{if(!shareSafeMode)window.PowerhouseVerificationDesk.open(b.dataset.rcOpen);});
      get('rc-results').querySelectorAll('[data-rc-inspect]').forEach(b=>b.onclick=()=>inspect(b.dataset.rcInspect));
      get('rc-results').querySelectorAll('[data-rc-recover]').forEach(b=>b.onclick=()=>{if(!shareSafeMode)document.getElementById('data-btn').click();});
      get('rc-reset')?.addEventListener('click',()=>{if(!rows.length)openAttemptDialog();else{query='';subject='all';group='all';visible=12;render();}});
    };
    get('rc-query').oninput=e=>{query=e.target.value;visible=12;update();};
    get('rc-subject').onchange=e=>{subject=e.target.value;visible=12;update();};get('rc-group').onchange=e=>{group=e.target.value;visible=12;update();};
    get('rc-more').onclick=()=>{visible+=12;update();};
    get('rc-export').onclick=()=>{if(shareSafeMode||failure)return;const selected=M.filter(rows,{query,subject,group});if(!selected.length)return;clearBrief();const text=M.brief(selected,todayISO());dget('rc-brief-text').value=text;briefUrl=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const link=dget('rc-brief-download');link.href=briefUrl;link.download='powerhouse-private-repair-brief-'+todayISO()+'.md';dget('rc-brief-status').textContent='If downloading is unavailable, copy the complete text above.';dialog.showModal();};
    update();
  }
  for(const hook of ['onRender','onSave']){const previous=PowerhouseUpgrade[hook];PowerhouseUpgrade[hook]=function(){previous?.apply(this,arguments);refresh();};}
  document.getElementById('share-safe-btn').addEventListener('click',refresh);
  window.addEventListener('powerhouse-verification-changed',refresh);
  window.addEventListener('storage',event=>{if(event.key==='alpp_verification_chains_v7'||event.key==='al_performance_powerhouse_v4')setTimeout(refresh,0);});
  refresh();
})();
