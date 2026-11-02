(()=>{'use strict';
 const store=PowerhouseCoreStore,host=document.createElement('section');host.className='trinity-data-status';host.id='trinity-data-status';host.setAttribute('aria-labelledby','trinity-data-title');host.innerHTML='<div><p class="eyebrow">YOUR DATA / THIS BROWSER</p><h2 id="trinity-data-title">Academic records, kept recoverable.</h2><p id="trinity-data-message" role="status" aria-live="polite"></p></div><details><summary>Data protection & recovery</summary><p>The source repository cannot back up every visitor’s browser. Export your own records before changing devices. A recoverable checkpoint protects the last saved core copy; quota or conflicts pause saving.</p><div class="trinity-recovery-actions"><button type="button" id="trinity-export-original">Export exact stored original</button><button type="button" id="trinity-export-copies">Export both recovery copies</button><button type="button" id="trinity-export-pending-modules">Export module recovery copies</button><label>Review a valid core backup<input id="trinity-core-file" type="file" accept=".json,application/json"></label></div><p id="trinity-restore-message" role="status"></p></details>';
 document.querySelector('main').prepend(host);
 const el=id=>document.getElementById(id),download=(name,text)=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 let requestRevision=0,pageActive=true,activeRequest=null,pendingFile=null;
 const sharedView=()=>{try{return Boolean(typeof shareSafeMode!=='undefined'&&shareSafeMode)||document.body.classList.contains('share-safe')||new URLSearchParams(location.search).get('share')==='1';}catch{return true;}};
 const privateActive=()=>pageActive&&!sharedView()&&host.isConnected;
 const retire=()=>{requestRevision++;};
 const signature=()=>JSON.stringify({state,copies:store.copies()});
 const incoming=document.createElement('button');incoming.id='trinity-export-incoming';incoming.type='button';incoming.textContent='Export selected backup original';incoming.hidden=true;host.querySelector('.trinity-recovery-actions').append(incoming);
 function render(){const shared=sharedView();host.hidden=shared;host.querySelectorAll('button,input').forEach(control=>control.disabled=shared||!pageActive);incoming.hidden=shared||!pendingFile;document.querySelectorAll('#data-btn,#export-data,#weekly-report').forEach(control=>control.disabled=shared);const paused=store.readOnly;host.dataset.paused=String(paused);el('trinity-data-message').textContent=paused?store.problem:'This version keeps new core work separately from older versions. Export your current progress before a rollback; older versions show their own last save. Other modules have their own backups. Older tabs keep their existing code. Export unsaved work before refreshing them.';document.body.classList.toggle('trinity-core-paused',paused);if(paused){document.getElementById('welcome-dialog')?.close();document.querySelectorAll('[data-delete-attempt],#save-profile,#reset-data,#v6-use-cloud,#v6-use-local').forEach(button=>button.disabled=true);}}
 el('trinity-export-original').onclick=()=>{if(!privateActive())return;try{const copies=store.copies();download('powerhouse-core-original.json',copies.storedRaw??store.raw??'null');el('trinity-restore-message').textContent='Exact stored bytes exported. No record was rewritten.';}catch(error){el('trinity-restore-message').textContent=error.message;}};
 el('trinity-export-copies').onclick=()=>{if(!privateActive())return;try{download('powerhouse-core-recovery-copies.json',JSON.stringify(store.copies(),null,2));}catch(error){el('trinity-restore-message').textContent=error.message;}};
 el('trinity-export-pending-modules').onclick=()=>{if(!privateActive())return;try{const pending=Object.keys(localStorage).filter(key=>key.includes('__trinity_claim_v1:')).map(key=>({key,raw:localStorage.getItem(key)}));const stores=Object.keys(localStorage).filter(key=>key.endsWith('__trinity_checkpoint_v1')).map(checkpointKey=>{const key=checkpointKey.slice(0,-'__trinity_checkpoint_v1'.length);return {key,legacyRaw:localStorage.getItem(key),checkpointRaw:localStorage.getItem(checkpointKey),originalsRaw:localStorage.getItem(key+'__trinity_originals_v1')};});download('powerhouse-module-recovery-copies.json',JSON.stringify({schema:'powerhouse-module-recovery-v1',pending,stores},null,2));el('trinity-restore-message').textContent='Pending save proposals exported. Review against each module’s own backup; no records were replaced.';}catch(error){el('trinity-restore-message').textContent=error.message;}};
 incoming.onclick=()=>{if(!privateActive()||!pendingFile)return;download('powerhouse-selected-backup-original.json',pendingFile);el('trinity-restore-message').textContent='Selected file bytes exported. This is an uncommitted backup, not saved academic evidence.';};
 document.addEventListener('powerhouse-backup-review-file',event=>{if(!privateActive()||!(event.detail instanceof Blob))return;retire();activeRequest=null;pendingFile=event.detail;render();});
 document.addEventListener('powerhouse-backup-review-committed',event=>{if(!privateActive()||pendingFile!==event.detail)return;pendingFile=null;render();});
 const fileInput=el('trinity-core-file');
 fileInput.addEventListener('cancel',()=>{retire();activeRequest=null;});
 fileInput.onchange=async event=>{
  retire();const file=event.target.files?.[0];if(!privateActive()||event.target!==fileInput||!file){activeRequest=null;return;}
  const request={revision:requestRevision,file};activeRequest=request;pendingFile=file;
  const current=()=>activeRequest===request&&request.revision===requestRevision&&privateActive()&&fileInput.isConnected&&el('trinity-core-file')===fileInput;
  try{
   if(file.size>2000000)throw Error('Choose a core backup below 2 MB.');
   const before=signature(),text=await file.text();
   if(!current()||signature()!==before)throw Error('This recovery review changed while the file was read. Review again against the latest saved copy.');
   const value=JSON.parse(text);TrinityStore.core(value);
   if(!globalThis.PowerhouseEvidence)throw Error('Open the current Powerhouse entry page to validate a recovery file.');
   PowerhouseEvidence.validateBackup(value,allTopics().map(t=>t.key),SUBJECTS,Object.keys(ATTEMPT_TYPE_NAMES),Object.keys(ERROR_NAMES),todayISO(),SYLLABUS_PLAN.map(r=>r.id));
   if(!current()||signature()!==before)throw Error('This recovery review changed. Review the latest saved copy before importing.');
   if(!confirm('Reviewed backup: '+value.attempts.length+' attempts, '+value.retests.length+' retest records. Replace this core copy only? Original bytes will be retained; other stores remain unchanged.'))return;
   // Native dialogs can resume inside a browser storage task with an older
   // snapshot. Let the next task observe another tab's completed checkpoint.
   await new Promise(resolve=>setTimeout(resolve,0));
   if(!current()||signature()!==before)throw Error('Another edit or view change interrupted recovery. Review the latest saved copy before importing.');
   store.replace(value);pendingFile=null;location.reload();
  }catch(error){if(activeRequest===request&&privateActive())el('trinity-restore-message').textContent=error.message+' The current stored copy was kept. The selected backup remains available for private export.';}
  finally{if(activeRequest===request){fileInput.value='';if(host.isConnected)render();}}
 };
 document.addEventListener('input',retire);document.addEventListener('change',event=>{if(event.target!==fileInput)retire();});
 window.addEventListener('pagehide',()=>{pageActive=false;retire();});window.addEventListener('pageshow',()=>{pageActive=true;render();});
 window.addEventListener('popstate',()=>{retire();render();});window.addEventListener('hashchange',()=>{retire();render();});
 if(typeof MutationObserver==='function')new MutationObserver(records=>{if(records.some(record=>[...record.removedNodes].some(node=>node===host||typeof node.contains==='function'&&node.contains(host))))retire();}).observe(document,{childList:true,subtree:true});
 document.addEventListener('submit',event=>{if(store.readOnly){event.preventDefault();event.stopImmediatePropagation();el('trinity-data-message').textContent=store.problem;}},true);
 window.addEventListener('storage',event=>{if(event.key===null||event.key==='al_performance_powerhouse_v4'||event.key===store.checkpointKey||event.key===store.sourceKey||event.key===store.originalsKey||event.key?.startsWith('al_performance_powerhouse_v4__trinity_claim_v1:')){retire();if(event.key==='al_performance_powerhouse_v4'){try{store.save(state);}catch{}}render();}});
 if(window.PowerhouseUpgrade){const old=PowerhouseUpgrade.onRender;PowerhouseUpgrade.onRender=function(){old?.apply(this,arguments);render();};}
 el('share-safe-btn')?.addEventListener('click',()=>{retire();render();});const priorToggle=toggleShareSafe;toggleShareSafe=function(){priorToggle();retire();render();};document.addEventListener('trinity-core-problem',render);render();
})();
