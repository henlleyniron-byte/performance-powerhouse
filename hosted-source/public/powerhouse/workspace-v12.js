/* V12 organizes the existing workspaces. Evidence remains in the original ledgers. */
(()=>{
 const get=id=>document.getElementById(id),esc=escapeHTML,M=PowerhouseReview,command=get('panel-command'),review=get('v12-review-existing');
 const weekly=document.querySelector('.v6-review');if(weekly){const details=document.createElement('details');details.className='v12-disclosure';const summary=document.createElement('summary');summary.textContent='Weekly report & four-week trend';details.append(summary,weekly);review.append(details);}
 const next=get('next-study-block');if(next)review.append(next);
 const legacy=document.createElement('details');legacy.className='v12-disclosure v12-legacy';const label=document.createElement('summary');label.textContent='Detailed dashboard · subject summaries, diagnostics & execution guard';legacy.append(label);
 const execution=get('execution-desk'),cycle=get('cycle-title')?.closest('section'),sync=document.querySelector('.v6-sync');
 for(const node of [...command.children])if(![execution,cycle,sync].includes(node))legacy.append(node);
 const lead=document.createElement('section');lead.className='v12-home';lead.innerHTML='<div><p class="eyebrow">V16 / FLAGSHIP EVIDENCE & RECOVERY</p><h2>Clear direction.<br><em>Follow every repair through.</em></h2><p>Choose a concrete output, inspect your marked evidence and open the exact repair chain. Every check has a clear next step.</p><div class="v12-actions"><button class="primary-btn" id="v12-log">Log a marked attempt</button><button class="secondary-btn" id="v12-review">Review my evidence</button><button class="secondary-btn" id="v12-backup">Data & backup</button></div></div><aside class="v12-private"><span class="eyebrow">YOUR CORE LEDGER</span><div id="v12-home-state" role="status"></div><p>Recorded evidence only. A due date does not prove completion.</p></aside>';
 command.prepend(lead);if(execution)command.append(execution);if(cycle)command.append(cycle);if(sync)command.append(sync);command.append(legacy);
 const ledger=get('panel-attempts').querySelector('.panel');ledger.querySelector('.panel-head h3').textContent='Your marked evidence';
 const clear=document.createElement('button');clear.className='secondary-btn';clear.type='button';clear.id='v12-clear-ledger';clear.textContent='Clear evidence filters';document.querySelector('.v6-filters').append(clear);
 clear.onclick=()=>PowerhouseUpgrade.showEvidence({search:'',subject:'all',type:'all',error:'all',range:'all'});
 get('v12-log').onclick=()=>openAttemptDialog();get('v12-review').onclick=()=>navigate('review');get('v12-backup').onclick=()=>get('data-btn').click();
 const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);let exportSummary=null;
 function render(){
  if(shareSafeMode){get('v12-home-state').textContent='Personal evidence is hidden.';get('v12-review-data').innerHTML='<p>Turn off Share-safe to review your private records.</p>';get('v12-summary-export').disabled=true;return;}
  try{
   const normalized=M.normalize(state,todayISO()),days=Number(get('v12-review-range').value),subject=get('v12-review-subject').value,s=M.summarize(normalized,todayISO(),days,subject),home=M.summarize(normalized,todayISO(),7);
   get('v12-home-state').innerHTML='<strong>'+home.count+'</strong><span>marked attempts / last 7 days</span><strong>'+home.due+'</strong><span>linked transfer or retest checks due</span>';
   const rows=M.subjects.filter(x=>subject==='all'||x===subject).map(sub=>{const r=s.bySubject[sub];return '<article class="v12-subject"><div><b>'+titleCase(sub)+'</b><span>'+r.count+' attempts</span></div><strong>'+fmt(r.earned)+' / '+fmt(r.total)+'</strong><p>'+(!r.count?'No marked evidence in this window.':r.audited?fmt(r.trusted)+' / '+fmt(r.auditedTotal)+' audited marks · '+r.audited+' audited attempts':'Audited marks not recorded.')+'</p><button type="button" class="secondary-btn" data-v12-subject="'+sub+'">Inspect '+titleCase(sub)+' evidence</button></article>';}).join('');
   const top=s.errors[0];get('v12-review-data').innerHTML='<div class="v12-review-caption">'+s.start+' → '+s.end+' · Asia/Colombo · '+s.daysWithEvidence+' dates with marked evidence</div><div class="v12-review-cards">'+rows+'</div><div class="v12-review-conclusion"><div><b>Largest recorded mark loss</b><p>'+(top?esc(ERROR_NAMES[top[0]]||top[0])+' · '+fmt(top[1])+' lost marks. Review the exact questions before choosing a repair.':'No lost-mark family recorded in this window. Absence of an error record is not proof of mastery.')+'</p></div><div><b>'+s.due+' linked checks due</b><p>Open the repair queue, then inspect the actual source and linked check.</p><button class="secondary-btn" type="button" id="v12-open-repairs">Open repair & verification desk</button></div></div>';
   get('v12-open-repairs').onclick=()=>navigate('repairs');get('v12-review-data').querySelectorAll('[data-v12-subject]').forEach(b=>b.onclick=()=>PowerhouseUpgrade.showEvidence({subject:b.dataset.v12Subject,range:String(days),search:'',type:'all',error:'all'}));
   exportSummary=M.compact({...state,lastExportedAt:new Date().toISOString()},todayISO());get('v12-summary-export').disabled=false;
  }catch(error){get('v12-home-state').textContent='Core evidence needs review.';get('v12-review-data').textContent=error.message+' Use Data & backup to preserve the original records.';get('v12-summary-export').disabled=true;exportSummary=null;}
 }
 for(const id of ['v12-review-range','v12-review-subject'])get(id).onchange=render;
 get('v12-summary-export').onclick=()=>{if(!exportSummary||shareSafeMode)return;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(exportSummary,null,2)],{type:'application/json'}));a.href=url;a.download='powerhouse-command-summary-'+todayISO()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 for(const hook of ['onRender','onSave']){const earlier=PowerhouseUpgrade[hook];PowerhouseUpgrade[hook]=function(){earlier?.apply(this,arguments);render();};}
 get('share-safe-btn').addEventListener('click',render);
 document.querySelectorAll('#app-tabs [data-panel]').forEach(button=>{button.setAttribute('aria-controls','panel-'+button.dataset.panel);if(button.dataset.panel===activePanel)button.setAttribute('aria-current','page');});
 document.addEventListener('keydown',event=>{const typing=event.target.matches('input,textarea,select')||event.target.isContentEditable;if(!typing&&event.key==='/'&&!document.querySelector('dialog[open]')){event.preventDefault();navigate('attempts');get('v6-ledger-search').focus();}});
 window.addEventListener('hashchange',()=>{const panel=location.hash.slice(1);if(get('panel-'+panel))navigate(panel);});
 render();if(location.hash==='#review')navigate('review');
})();
