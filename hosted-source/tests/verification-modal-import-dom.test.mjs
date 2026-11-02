import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const domPath=process.env.DOM_QA_PACKAGE,domTest=(name,fn)=>test(name,{skip:!domPath},fn),KEY='alpp_verification_chains_v7',CP=KEY+'__trinity_checkpoint_v1',ORIGINALS=KEY+'__trinity_originals_v1';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function mount(){
 const {parseHTML}=await import(pathToFileURL(domPath).href),{window,document}=parseHTML('<html><body><section id="panel-repairs"></section></body></html>');
 window.HTMLElement.prototype.scrollIntoView=()=>{};window.HTMLElement.prototype.focus=()=>{};
 // LinkeDOM leaves escaped RCDATA entities in textarea.value after innerHTML.
 // Preserve literal typed values separately and decode the five renderer escapes.
 const typed=new WeakMap(),entities={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"};Object.defineProperty(window.HTMLTextAreaElement.prototype,'value',{configurable:true,get(){return typed.get(this)??this.textContent.replace(/&(?:amp|lt|gt|quot|#39);/g,text=>entities[text]);},set(value){typed.set(this,String(value));}});
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||'';},set(value){for(const o of this.querySelectorAll('option'))if(o.value===String(value))o.setAttribute('selected','');else o.removeAttribute('selected');}});
 const original=' {"a":{"originalId":"a","skill":"Saved skill","diagnosis":"Saved diagnosis","keyHold":true}}\r\n',data=new Map([[KEY,original]]),turns=[],blobs=[];let frozen=null,writes=0,reads=0,confirmAction=()=>true,confirms=0;
 // Native Storage enumerates saved keys, not its prototype methods. The actual
 // module's Object.keys(localStorage) must therefore see every pending claim.
 const methods={getItem(key){reads++;return (frozen||data).get(key)??null;},setItem(key,value){writes++;data.set(key,value);frozen?.set(key,value);},removeItem(key){data.delete(key);frozen?.delete(key);},keys:()=>[...(frozen||data).keys()]},storage=new Proxy(methods,{ownKeys:()=>[...(frozen||data).keys()],getOwnPropertyDescriptor(target,key){return (frozen||data).has(key)?{configurable:true,enumerable:true,writable:true,value:(frozen||data).get(key)}:Reflect.getOwnPropertyDescriptor(target,key);}});
 class FormDataFixture{constructor(form){return new Map([...form.querySelectorAll('[name]')].filter(n=>n.type!=='checkbox'||n.checked||n.hasAttribute('checked')).map(n=>[n.name||n.getAttribute('name'),n.value||'']));}}
 const c=vm.createContext({window,document,location:{search:''},URLSearchParams,FormData:FormDataFixture,Blob,Event:window.Event,localStorage:storage,URL:{createObjectURL(blob){blobs.push(blob);return 'blob:private-verification';},revokeObjectURL(){}},setTimeout(fn,ms){if(ms===0)turns.push(fn);return 1;},confirm(){confirms++;return confirmAction();},shareSafeMode:false,PowerhouseUpgrade:{},state:{attempts:[{id:'a',question:'Synthetic exact question reference',date:'2026-10-01',subject:'physics',earned:1,total:2,unaided:true}]},todayISO:()=> '2026-10-29',navigate(){}});window.PowerhouseUpgrade=c.PowerhouseUpgrade;
 for(const file of ['public/data-safety/safe-store.js','public/powerhouse/verification.js','public/powerhouse/verification-ui.js'])vm.runInContext(readFileSync(file,'utf8'),c,{filename:file});
 window.PowerhouseVerificationDesk.open('a');
 const packet=skill=>JSON.stringify({schema:'powerhouse-verification-v7',records:{a:{originalId:'a',skill,diagnosis:'Incoming diagnosis',keyHold:true}}},null,2);
 const q={window,document,c,data,turns,blobs,original,packet,get writes(){return writes;},get reads(){return reads;},get confirms(){return confirms;},set confirmAction(fn){confirmAction=fn;},freeze(){frozen=new Map(data);},unfreeze(){frozen=null;},edit(name,value,event=true){const n=document.querySelector('[name="'+name+'"]');n.value=value;if(event)n.dispatchEvent(new window.Event('input',{bubbles:true}));},async start(raw=packet('Incoming')){const input=document.getElementById('v7-file'),file=new File([raw],'synthetic-verification.json',{type:'application/json'});Object.defineProperty(input,'files',{configurable:true,value:[file]});const task=input.onchange({target:input});await tick();return {input,file,task,cleanup(){delete input.files;assert.equal(Object.hasOwn(input,'files'),false);}};},async finish(read){frozen=null;while(turns.length)turns.shift()();await tick();await read.task;},exportSelected(){document.getElementById('v7-import-original').onclick();return blobs.at(-1);}};
 return q;
}

domTest('verification import waits for a real next task before writes and valid replacement keeps original bytes and holds',async()=>{
 const q=await mount();q.edit('diagnosis','Latest unsaved A diagnosis');const read=await q.start();try{
  assert.equal(q.turns.length,1);assert.equal(q.writes,0,'Native approval must not write in the blocked task');assert.equal(q.confirms,1);
  await q.finish(read);assert.equal(q.data.get(KEY),q.original);assert.ok(JSON.parse(q.data.get(ORIGINALS)).some(r=>r.raw===q.original));const head=JSON.parse(JSON.parse(q.data.get(CP)).head);assert.equal(head.a.skill,'Incoming');assert.equal(head.a.keyHold,true);assert.equal(head.a.confirmSkill,false);
  q.document.getElementById('v7-draft-export').onclick();assert.equal(JSON.parse(await q.blobs.at(-1).text()).drafts.a.diagnosis,'Latest unsaved A diagnosis');
 }finally{read.cleanup();}
});

domTest('fresh task refuses changed checkpoint, originals or pending claims and retains exact visible A fields',async()=>{
 for(const field of ['checkpoint','originals','claim']){const q=await mount();q.edit('diagnosis','A exact diagnosis\nkeep <literal>');q.confirmAction=()=>{q.freeze();return true;};const read=await q.start();try{
   const winning=field==='checkpoint'?JSON.stringify({schema:'trinity-checkpoint-v1',head:JSON.stringify({a:{originalId:'a',skill:'Winning B',diagnosis:'Winning B diagnosis'}})}):field==='originals'?'[{"sourceKey":"preserve","raw":"exact B archive"}]':'{"schema":"trinity-write-claim-v1","head":"B proposal"}';const key=field==='checkpoint'?CP:field==='originals'?ORIGINALS:KEY+'__trinity_claim_v1:B';q.data.set(key,winning);
   await q.finish(read);assert.equal(q.writes,0,'No recovery archive may precede the fresh-task comparison');assert.equal(q.data.get(key),winning);assert.equal(q.data.get(KEY),q.original);assert.equal(q.document.querySelector('[name=diagnosis]').value,'A exact diagnosis\nkeep <literal>');assert.match(q.document.querySelector('.v7-notice').textContent,/Another tab/);
  }finally{read.cleanup();}}
});

domTest('post-confirm source-attempt and direct form changes refuse replacement while preserving latest unsubmitted fields',async()=>{
 for(const change of ['attempt','form']){const q=await mount();q.edit('diagnosis','Before review');const read=await q.start();try{if(change==='attempt')q.c.state.attempts[0].question='Changed actual reference';else q.edit('diagnosis','Direct latest DOM value',false);await q.finish(read);assert.equal(q.writes,0);assert.equal(q.document.querySelector('[name=diagnosis]').value,change==='form'?'Direct latest DOM value':'Before review');assert.equal(q.data.get(KEY),q.original);assert.match(q.document.querySelector('.v7-notice').textContent,/changed/);}finally{read.cleanup();}}
});

domTest('post-confirm cancel, edit, file change, privacy roundtrip, page exit and detached owner retire the pending commit',async()=>{
 for(const kind of ['cancel','edit','file','privacy','pagehide','detach']){const q=await mount();q.edit('diagnosis','A lifecycle draft');const read=await q.start();try{
   if(kind==='cancel')read.input.dispatchEvent(new q.window.Event('cancel'));
   if(kind==='edit')q.edit('diagnosis','A later edited draft');
   if(kind==='file')Object.defineProperty(read.input,'files',{configurable:true,value:[]});
   if(kind==='privacy'){q.c.location.search='?share=1';q.window.dispatchEvent(new q.window.Event('popstate'));q.c.location.search='';q.window.dispatchEvent(new q.window.Event('hashchange'));}
   if(kind==='pagehide'){q.window.dispatchEvent(new q.window.Event('pagehide'));q.window.dispatchEvent(new q.window.Event('pageshow'));}
   if(kind==='detach')q.document.getElementById('v7-verification').remove();
   await q.finish(read);assert.equal(q.writes,0,kind+' must not commit');assert.equal(q.data.get(KEY),q.original);if(kind!=='detach')assert.equal(q.document.querySelector('[name=diagnosis]').value,kind==='edit'?'A later edited draft':'A lifecycle draft');
  }finally{read.cleanup();}}
});

domTest('selected original export is literal and captured handlers make no Blob or storage read while shared or retired',async()=>{
 const q=await mount(),raw=q.packet('Exact Unicode µ Ω')+'\r\n',read=await q.start(raw);try{read.input.dispatchEvent(new q.window.Event('cancel'));await q.finish(read);assert.equal(await q.exportSelected().text(),raw);const selected=q.document.getElementById('v7-import-original').onclick,blobs=q.blobs.length,reads=q.reads;
  q.c.location.search='?share=%31';selected();assert.equal(q.blobs.length,blobs);assert.equal(q.reads,reads);q.window.dispatchEvent(new q.window.Event('popstate'));q.c.location.search='';q.window.dispatchEvent(new q.window.Event('popstate'));selected();assert.equal(q.blobs.length,blobs,'Old detached export must stay retired');assert.equal(await q.exportSelected().text(),raw);q.window.dispatchEvent(new q.window.Event('pagehide'));const current=q.document.getElementById('v7-import-original').onclick;current();assert.equal(q.blobs.length,blobs+1);
 }finally{read.cleanup();}
});

domTest('unsupported future fields are refused before confirmation while their exact selected file remains recoverable',async()=>{
 const q=await mount(),raw=JSON.stringify({schema:'powerhouse-verification-v7',records:{a:{originalId:'a',skill:'Future',futureProof:{literal:'retain'}}}}),read=await q.start(raw);try{await read.task;assert.equal(q.confirms,0);assert.equal(q.writes,0);assert.equal(q.data.get(KEY),q.original);assert.equal(await q.exportSelected().text(),raw);assert.match(q.document.querySelector('.v7-notice').textContent,/Unsupported verification fields/);}finally{read.cleanup();}
});

domTest('full recovery archive or failed checkpoint write cannot replace legacy or erase the current draft and selected file',async()=>{
 for(const failure of ['full','quota']){const q=await mount();q.edit('diagnosis','A exact recovery draft');if(failure==='full')q.data.set(ORIGINALS,JSON.stringify(Array.from({length:5},(_,i)=>({sourceKey:'old-'+i,raw:'old bytes '+i}))));else{const write=q.c.localStorage.setItem;q.c.localStorage.setItem=(key,value)=>{if(key===CP)throw Error('Synthetic quota');write(key,value);};}const oldArchive=q.data.get(ORIGINALS),raw=q.packet('Refused replacement'),read=await q.start(raw);try{await q.finish(read);assert.equal(q.data.get(KEY),q.original);assert.equal(q.data.get(CP),undefined);if(failure==='full')assert.equal(q.data.get(ORIGINALS),oldArchive);assert.equal(q.document.querySelector('[name=diagnosis]').value,'A exact recovery draft');assert.equal(await q.exportSelected().text(),raw);assert.ok([...q.data.keys()].some(key=>key.startsWith(KEY+'__trinity_claim_v1:')),'A failed proposal must remain recoverable');}finally{read.cleanup();}}
});
