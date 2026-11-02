(()=>{'use strict';const el=id=>document.getElementById(id),form=el('attempt-form'),KEY='alpp_attempt_draft_v14';
 const validate=value=>{if(value.schema!=='powerhouse-attempt-draft-v1'||!value.fields||typeof value.fields!=='object'||Array.isArray(value.fields))throw Error('Unsupported attempt draft.');for(const v of Object.values(value.fields))if(!['string','boolean'].includes(typeof v))throw Error('Unreadable draft field.');};
 const draft=TrinityStore.open({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),keys:()=>Object.keys(localStorage),removeItem:key=>localStorage.removeItem(key)},KEY,{validate});let pending=null,timer=null;
 const notice=document.createElement('aside');notice.className='v14-draft-notice';notice.setAttribute('aria-label','Unsubmitted attempt recovery');notice.innerHTML='<p id="v14-draft-status" role="status"></p><button type="button" id="v14-draft-restore">Restore unsubmitted attempt fields</button><button type="button" id="v14-draft-export">Export draft original</button>';el('panel-attempts').prepend(notice);
 const sharedView=()=>{try{return shareSafeMode||document.body.classList.contains('share-safe')||new URL(location.href).searchParams.get('share')==='1';}catch{return true;}};
 const privateActive=()=>!sharedView()&&form.isConnected&&notice.isConnected;
 const latestDraft=()=>pending||(draft.value?.status==='submitted'?null:draft.value);
 function render(){const shared=sharedView();notice.hidden=shared||(!draft.raw&&!pending)||(!pending&&draft.value?.status==='submitted');if(shared){el('v14-draft-restore').disabled=true;return;}const paused=draft.readOnly;el('v14-draft-status').textContent=draft.problem||'An unsubmitted attempt draft is available. Restoring fields does not add marks or retest credit.';el('v14-draft-restore').disabled=paused||!latestDraft();}
 const collect=()=>({schema:'powerhouse-attempt-draft-v1',savedAt:new Date().toISOString(),fields:Object.fromEntries([...form.querySelectorAll('input[id],textarea[id],select[id]')].filter(input=>!['submit','button'].includes(input.type)).map(input=>[input.id,input.type==='checkbox'?input.checked:input.value]))});
 function flush(){clearTimeout(timer);timer=null;if(!pending||!privateActive())return;try{draft.save(pending);pending=null;}catch(error){el('v14-draft-status').textContent=error.message;}render();}
 form.addEventListener('input',()=>{if(!privateActive())return;pending=collect();clearTimeout(timer);timer=setTimeout(flush,250);render();});window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',flush);
 form.addEventListener('submit',()=>{setTimeout(()=>{if(!privateActive())return;if(!el('attempt-dialog').open&&!PowerhouseCoreStore.readOnly){flush();if(draft.value){try{draft.save({...draft.value,status:'submitted'});}catch{}render();}}},0);});
 function restoreSnapshot(value){
  validate(value);const fields=Object.freeze({...value.fields});
  for(const[id,value]of Object.entries(fields)){
   const input=el(id);if(!input||!form.contains(input)||!['INPUT','SELECT','TEXTAREA'].includes(input.tagName)||['button','submit','file'].includes(input.type))throw Error('Unsupported recovered field '+id+'. Review the original draft; no fields were changed.');
   if(input.type==='checkbox'){if(typeof value!=='boolean')throw Error('Unreadable recovered checkbox '+id+'. Review the original draft; no fields were changed.');continue;}
   if(typeof value!=='string')throw Error('Unreadable recovered field '+id+'. Review the original draft; no fields were changed.');
   if(id==='attempt-topic'){if(value&&(!fields['attempt-subject']||typeof allTopics!=='function'||!allTopics(fields['attempt-subject']).some(topic=>topic.key===value)))throw Error('The recovered topic needs review against its original subject. No fields were changed.');continue;}
   const probe=input.cloneNode(true);probe.value=value;if(probe.value!==value)throw Error('Unsupported recovered value for '+id+'. Review the original draft; no fields were changed.');
  }
  return fields;
 }
 el('v14-draft-restore').onclick=()=>{if(!privateActive())return;if(el('attempt-dialog').open){el('v14-draft-status').textContent='An attempt editor is already open. Its current fields were kept.';return;}const latest=latestDraft();if(!latest||draft.readOnly)return;let fields;try{fields=restoreSnapshot(latest);}catch(error){el('v14-draft-status').textContent=error.message;return;}openAttemptDialog();if(fields['attempt-subject']){el('attempt-subject').value=fields['attempt-subject'];fillTopicSelect(fields['attempt-subject'],fields['attempt-topic']||'');}for(const input of form.querySelectorAll('input[id],textarea[id],select[id]'))if(!Object.hasOwn(fields,input.id)){if(input.type==='checkbox')input.checked=false;else input.value='';}for(const[id,value]of Object.entries(fields)){const input=el(id);if(input.type==='checkbox')input.checked=value;else input.value=value;}el('v14-draft-status').textContent='Latest available draft fields restored without saving. Verify missing selections, date, question and marks before submitting.';};
 el('v14-draft-export').onclick=()=>{if(!privateActive())return;const a=document.createElement('a'),raw=pending?JSON.stringify(pending):draft.raw,url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));a.href=url;a.download='powerhouse-unsubmitted-attempt.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 // A work brief may prepare fields, but it must never reset another unsubmitted attempt.
 window.PowerhouseAttemptDraft=Object.freeze({openLinked(id,type){
  if(!privateActive())return {ok:false,message:'Return to the private view to log completed work.'};
  if(PowerhouseCoreStore.readOnly)return {ok:false,message:'Core saving is paused. Preserve the current copies before logging new work.'};
  if(!['reattempt','fresh-transfer','delayed-retest'].includes(type))return {ok:false,message:'Open the verification desk to inspect this stage.'};
  const source=state.attempts.find(attempt=>attempt.id===id);
  if(!source||!['biology','chemistry','physics'].includes(source.subject))return {ok:false,message:'The exact source attempt is unavailable. Recover it before logging a check.'};
  const topic=typeof allTopics==='function'?allTopics(source.subject).find(row=>row.key===source.topicKey):null;
  if(!topic)return {ok:false,message:'This source has no matching syllabus topic. Review the original and use the existing log to choose its actual topic. No fields were changed.'};
  if(el('attempt-dialog').open)return {ok:false,message:'An attempt editor is already open. Its current fields were kept.'};
  if(pending||draft.readOnly||draft.raw&&draft.value?.status!=='submitted'){
   navigate('attempts');render();notice.hidden=false;el('v14-draft-restore').focus();
   return {ok:false,message:'An unsubmitted attempt or unreadable draft already exists. Restore or export it before preparing a different check. Its fields were kept.'};
  }
  openAttemptDialog(source.topicKey||'',type);el('attempt-subject').value=source.subject;fillTopicSelect(source.subject,source.topicKey||'');
  if(el('v6-source-id'))el('v6-source-id').value=id;
  el('attempt-question').value='';el('attempt-unaided').checked=false;el('attempt-novel').checked=false;
  el('attempt-dialog').querySelector('h2').textContent='Log completed '+(type==='reattempt'?'closed-book reattempt':type==='fresh-transfer'?'fresh transfer':'delayed check');
  el('attempt-question').focus();return {ok:true,message:'Exact source and check type prepared. Enter only actual completed work; no marks or confirmations were filled.'};
 }});
 document.addEventListener('click',event=>{const button=event.target.closest('[data-v14-chain]');if(!button)return;navigate('repairs');const picker=el('v7-original');if(picker&&[...picker.options].some(option=>option.value===button.dataset.v14Chain)){picker.value=button.dataset.v14Chain;picker.dispatchEvent(new Event('change'));el('v7-verification').scrollIntoView({block:'start'});}else toast('The source attempt is unavailable. Inspect its original backup.');});
 const requested=new URL(location.href).searchParams.get('attempt');if(requested){PowerhouseUpgrade.showEvidence({record:requested,search:'',range:'all',subject:'all',type:'all',error:'all'});}
 el('share-safe-btn').addEventListener('click',render);render();
})();
