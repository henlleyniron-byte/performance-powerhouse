(function(root){'use strict';
 const M=CommandPlan,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 root.mountCommandPlan=function({prefix='',host,privateView=()=>false}){
  const el=name=>document.getElementById(prefix+name),download=(name,text)=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
  const store=M.open(storage);let saved=JSON.stringify(store.value),pending=null,conflict=false;
  const plan=()=>M.validate({version:1,...Object.fromEntries(M.fields.map(field=>[field,el(field).value]))});
  const show=value=>M.fields.forEach(field=>el(field).value=value[field]);
  const dirty=()=>JSON.stringify(plan())!==saved;
  function status(text){el('status').textContent=text;}
  function refresh(){
   const hidden=privateView();host.classList.toggle('command-hidden',hidden);for(const name of ['save','export','original','import'])if(el(name))el(name).disabled=hidden;
   el('next-action-title').textContent=hidden?'Personal plan hidden':el('action').value.trim()||'Choose one small action.';
   el('next-action-evidence').textContent=hidden?'Turn off Share-safe to open your plan.':el('evidence').value.trim()||'Name the marked output or correction you will retain.';
   el('plan-state').textContent=store.problem?'Stored plan needs recovery':conflict?'Saved copy changed in another tab':dirty()?'Unsaved draft · save before leaving':store.hasSaved?'Saved planning view · completion unverified':'Planning view · completion unverified';
   el('original').hidden=!store.problem&&!conflict;
  }
  show(store.value);if(store.problem)status(store.problem);
  host.addEventListener('submit',event=>event.preventDefault());host.addEventListener('input',refresh);
  el('save').onclick=()=>{if(privateView())return;try{const value=store.save(plan());saved=JSON.stringify(value);status('Direction saved in this browser. No score, attendance or completion was inferred.');}catch(error){status(error.message);}refresh();};
  el('export').onclick=()=>{if(privateView())return;try{download('command-centre-plan.json',JSON.stringify(plan(),null,2));status('Current draft exported. Use this file with the compatible local direction-plan import controls when needed.');}catch(error){status(error.message);}};
  el('original').onclick=()=>{if(privateView())return;try{download('command-centre-original-recovery.json',store.original()??'');status('Original stored bytes exported unchanged.');}catch(error){status(error.message);}};
  const dialog=document.createElement('dialog');dialog.id=prefix+'plan-import-dialog';dialog.className='command-import-dialog';dialog.setAttribute('aria-labelledby',prefix+'plan-import-title');dialog.innerHTML='<h2 id="'+prefix+'plan-import-title">Review the plan before importing</h2><p>Only the local direction plan will change. Marked attempts, repair chains and the source file stay untouched.</p><label>Import mode<select data-import-mode><option value="empty">Fill empty fields only</option><option value="replace">Replace all plan fields</option></select></label><div class="command-import-diff"></div><p role="status" class="command-import-status"></p><div class="command-import-actions"><button type="button" data-import-apply>Apply reviewed plan</button><button type="button" data-import-cancel>Cancel</button></div>';document.body.append(dialog);
  function preview(){if(!pending)return;const before=plan(),after=M.merge(before,pending,dialog.querySelector('select').value);dialog.querySelector('.command-import-diff').innerHTML=M.fields.map(field=>'<article><h3>'+field[0].toUpperCase()+field.slice(1)+'</h3><div><p><small>Current draft</small>'+esc(before[field]||'Empty')+'</p><p><small>After import</small>'+esc(after[field]||'Empty')+'</p></div></article>').join('');}
  dialog.querySelector('[data-import-cancel]').onclick=()=>{pending=null;dialog.close();};dialog.querySelector('select').onchange=preview;
  dialog.querySelector('[data-import-apply]').onclick=()=>{if(privateView())return;try{const draft=plan(),next=M.merge(draft,pending,dialog.querySelector('select').value);const imported=store.import(next,draft);show(imported);saved=JSON.stringify(imported);pending=null;dialog.close();status('Reviewed plan imported. Previous saved bytes and the prior draft are retained for recovery. Study evidence was not changed.');}catch(error){dialog.querySelector('.command-import-status').textContent=error.message;}refresh();};
  el('import').onchange=async event=>{const file=event.target.files[0];if(!file||privateView())return;try{if(file.size>16000)throw Error('Choose a plan JSON file below 16 KB.');pending=M.validate(JSON.parse(await file.text()));dialog.querySelector('select').value='empty';dialog.querySelector('.command-import-status').textContent=store.problem?'The unreadable original will be retained as a recovery copy.':'';preview();dialog.showModal();}catch(error){status(error.message+' Existing plan kept.');}finally{event.target.value='';}};
  window.addEventListener('storage',event=>{if(event.key===M.key){conflict=true;status('Another tab changed the saved plan. Export this draft and reload to compare.');refresh();}});
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'&&!dialog.open){event.preventDefault();el('save').click();}});
  const recovery=document.createElement('details');recovery.className='command-recovery';recovery.innerHTML='<summary>Export a recovery copy</summary><p>These files contain previous local plan bytes. Import a valid plan file to review it before restoring.</p><div></div>';el('original').parentElement.append(recovery);
  for(const [suffix,label] of [['_previous','Export previous saved plan'],['_draft_previous','Export previous draft']]){const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{if(privateView())return;try{const raw=storage.getItem(M.key+suffix);if(raw===null){status('No such recovery copy is stored in this browser.');return;}download('command-centre'+suffix+'.json',raw);}catch{status('The recovery copy could not be read.');}};recovery.querySelector('div').append(button);}
  refresh();return {refresh,plan};
 };
})(globalThis);
