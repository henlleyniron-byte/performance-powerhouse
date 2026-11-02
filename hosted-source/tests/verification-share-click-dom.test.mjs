import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
const KEY='alpp_verification_chains_v7';
async function mount(){
 const {parseHTML}=await import(pathToFileURL(packagePath).href);
 const {window}=parseHTML('<html><body><button id="share-safe-btn"><span id="share-icon">Share-safe</span></button><button id="outside">Background update</button><section id="panel-repairs"></section></body></html>');
 const document=window.document;
 window.HTMLElement.prototype.scrollIntoView=()=>{};
 window.HTMLElement.prototype.focus=()=>{};
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(value){for(const option of this.querySelectorAll('option'))if(option.value===String(value))option.setAttribute('selected','');else option.removeAttribute('selected');}});
 const legacy=' {"a":{"originalId":"a","skill":"Saved skill","diagnosis":"Saved diagnosis","repair":"Saved repair","markingSource":"Synthetic source"}} ';
 const extra=new Map(),jobs=[];let writes=0,urls=0,blob=null,confirms=0,confirmAction=()=>true;
 const localStorage={getItem:key=>key===KEY?legacy:extra.get(key)??null,setItem(key,value){writes++;extra.set(key,value);},keys:()=>[KEY,...extra.keys()],removeItem:key=>extra.delete(key)};
 class FormDataFixture{constructor(form){return new Map([...form.querySelectorAll('[name]')].filter(control=>control.type!=='checkbox'||control.checked||control.hasAttribute('checked')).map(control=>[control.name||control.getAttribute('name'),control.value||'']));}}
 const context=vm.createContext({window,document,location:{search:''},URLSearchParams,localStorage,FormData:FormDataFixture,Event:window.Event,Blob,URL:{createObjectURL(value){urls++;blob=value;return 'blob:private-fixture';},revokeObjectURL(){}},setTimeout(fn,delay){if(delay===0)return setTimeout(fn,0);jobs.push({fn,delay});return jobs.length;},confirm:message=>{confirms++;return confirmAction(message);},shareSafeMode:false,PowerhouseUpgrade:{},state:{attempts:[{id:'a',question:'Synthetic exact source',date:'2026-10-01',subject:'physics',earned:2,total:5,guesses:0,unaided:true}]},todayISO:()=> '2026-10-19',navigate(){}});
 // The real page registers its button toggle before verification-ui's document listener.
 document.getElementById('share-safe-btn').addEventListener('click',()=>{context.shareSafeMode=!context.shareSafeMode;});
 window.PowerhouseUpgrade=context.PowerhouseUpgrade;
 for(const file of ['public/data-safety/safe-store.js','public/powerhouse/verification.js','public/powerhouse/verification-ui.js'])vm.runInContext(readFileSync(file,'utf8'),context,{filename:file});
 context.window.PowerhouseVerificationDesk.open('a');
 return {window,document,context,jobs,legacy,extra,get writes(){return writes;},get urls(){return urls;},get blob(){return blob;},get confirms(){return confirms;},set confirmAction(value){confirmAction=value;},edit(name,value){const control=document.querySelector('[name="'+name+'"]');control.value=value;control.dispatchEvent(new window.Event('input',{bubbles:true}));},flush(){for(let remaining=20;jobs.length;remaining--){assert.ok(remaining>0,'Fixture timer queue unexpectedly rescheduled itself');jobs.shift().fn();}}};
}

domTest('actual nested Share-safe click removes private verification DOM synchronously and restores latest draft without committing',async()=>{
 const q=await mount(),draft='Latest unsubmitted skill <keep>\tline\nnext';q.edit('skill',draft);q.edit('diagnosis','Latest exact diagnosis');
 q.document.getElementById('share-icon').click();
 assert.equal(q.context.shareSafeMode,true);
 assert.equal(q.document.querySelectorAll('#v7-form').length,0,'Private form must be removed before queued timers run');
 assert.equal(q.document.querySelectorAll('#v7-export,#v7-draft-export,#v7-file').length,0);
 assert.doesNotMatch(q.document.querySelector('#v7-verification').textContent,/Latest unsubmitted|Latest exact diagnosis/);
 q.document.getElementById('share-icon').click();
 assert.equal(q.document.querySelector('[name=skill]').value,draft);
 assert.equal(q.document.querySelector('[name=diagnosis]').value,'Latest exact diagnosis');
 assert.equal(q.writes,0);assert.equal(q.extra.size,0);
});

domTest('ordinary background clicks remain delayed and an older queued render cannot revive private fields while shared',async()=>{
 const q=await mount();q.edit('skill','Retain across queued render');
 const form=q.document.querySelector('#v7-form');q.document.getElementById('outside').click();
 assert.equal(q.jobs.length,1);assert.equal(q.jobs[0].delay,50);assert.equal(q.document.querySelector('#v7-form'),form);
 q.document.getElementById('share-safe-btn').click();
 assert.equal(q.document.querySelectorAll('#v7-form').length,0);
 q.flush();assert.equal(q.document.querySelectorAll('#v7-form').length,0);
 q.document.getElementById('share-safe-btn').click();
 assert.equal(q.document.querySelector('[name=skill]').value,'Retain across queued render');
 assert.equal(q.writes,0);assert.equal(q.extra.size,0);
});

domTest('captured ledger and draft exports refuse a shared click and work privately without changing exact saved bytes or awarding credit',async()=>{
 const q=await mount();q.edit('repair','Unsubmitted repair only');
 const ledger=q.document.querySelector('#v7-export').onclick,drafts=q.document.querySelector('#v7-draft-export').onclick;
 q.document.getElementById('share-safe-btn').click();ledger();drafts();
 assert.equal(q.urls,0);assert.equal(q.writes,0);
 q.flush();q.document.getElementById('share-safe-btn').click();q.flush();
 ledger();drafts();assert.equal(q.urls,0,'Retired export handlers must remain inert after returning private');
 q.document.querySelector('#v7-draft-export').click();
 const exported=JSON.parse(await q.blob.text());assert.equal(exported.schema,'powerhouse-verification-drafts-v1');
 assert.equal(exported.drafts.a.repair,'Unsubmitted repair only');assert.match(exported.notice,/not assessed or saved evidence/);
 q.document.querySelector('#v7-export').click();const saved=JSON.parse(await q.blob.text());
 assert.equal(saved.records.a.repair,'Saved repair');assert.equal(saved.records.a.skill,'Saved skill');
 assert.equal(q.context.localStorage.getItem(KEY),q.legacy);assert.equal(q.writes,0);assert.equal(q.extra.size,0);
});

domTest('captured submit and reopen callbacks cannot commit or confirm after their form becomes private-hidden or detached',async()=>{
 for(const action of ['submit','reopen']){const q=await mount();q.edit('skill','Keep unsubmitted exact skill');const form=q.document.querySelector('#v7-form'),callback=action==='submit'?form.onsubmit:q.document.querySelector('#v7-reopen').onclick;
  q.document.getElementById('share-safe-btn').click();q.flush();
  callback({preventDefault(){}});assert.equal(q.writes,0,action+' must not write from a shared detached form');assert.equal(q.confirms,0,action+' must not prompt from a shared detached form');
  q.document.getElementById('share-safe-btn').click();q.flush();callback({preventDefault(){}});
  assert.equal(q.writes,0);assert.equal(q.confirms,0);assert.equal(q.document.querySelector('[name=skill]').value,'Keep unsubmitted exact skill');
 }
});

domTest('old form input and submit handlers cannot move an earlier source draft onto the newly selected source',async()=>{
 const q=await mount();q.edit('skill','Source A exact draft');const old=q.document.querySelector('#v7-form'),input=old.oninput,submit=old.onsubmit;
 q.context.state.attempts.push({...q.context.state.attempts[0],id:'b',question:'Different synthetic source'});
 q.context.window.PowerhouseVerificationDesk.open('b');q.edit('skill','Source B exact draft');q.edit('diagnosis','Source B latest diagnosis');
 input();submit({preventDefault(){}});assert.equal(q.writes,0);
 q.context.window.PowerhouseVerificationDesk.open('a');assert.equal(q.document.querySelector('[name=skill]').value,'Source A exact draft');
 q.context.window.PowerhouseVerificationDesk.open('b');assert.equal(q.document.querySelector('[name=skill]').value,'Source B exact draft');assert.equal(q.document.querySelector('[name=diagnosis]').value,'Source B latest diagnosis');
});

domTest('reopen rechecks privacy after confirmation and keeps exact fields if the view changed during that confirmation',async()=>{
 const q=await mount();q.edit('skill','Keep through rejected reopen');q.confirmAction=()=>{q.document.getElementById('share-safe-btn').click();return true;};
 q.document.querySelector('#v7-reopen').click();q.flush();assert.equal(q.confirms,1);assert.equal(q.writes,0);
 q.document.getElementById('share-safe-btn').click();q.flush();assert.equal(q.document.querySelector('[name=skill]').value,'Keep through rejected reopen');
});

function beginRead(q,content){const input=q.document.querySelector('#v7-file');let resolve,started=false;const reading=new Promise(done=>{resolve=done;});Object.defineProperty(input,'files',{configurable:true,value:[{size:content.length,text:()=>{started=true;return reading;}}]});return {input,get started(){return started;},pending:input.onchange({target:input}),finish:()=>resolve(content),cleanup:()=>delete input.files};}
const backup=skill=>JSON.stringify({schema:'powerhouse-verification-v7',records:{a:{originalId:'a',skill,diagnosis:'Reviewed synthetic diagnosis',repair:'Reviewed synthetic repair',markingSource:'Synthetic source'}}});

domTest('a delayed verification import stays retired across a share/private roundtrip and preserves the latest draft',async()=>{
 const q=await mount();q.edit('diagnosis','Latest unsubmitted diagnosis');const read=beginRead(q,backup('Stale private read'));
 try{q.document.getElementById('share-safe-btn').click();q.flush();q.document.getElementById('share-safe-btn').click();q.flush();read.finish();await read.pending;
  assert.equal(q.writes,0);assert.equal(q.confirms,0);assert.equal(q.document.querySelector('[name=diagnosis]').value,'Latest unsubmitted diagnosis');assert.equal(q.extra.size,0);
 }finally{read.cleanup();assert.equal(Object.hasOwn(read.input,'files'),false);}
});

domTest('a newer file selection retires an older verification read without undoing the successful reviewed import',async()=>{
 const q=await mount(),old=beginRead(q,backup('Older A')),newer=beginRead(q,backup('Newest B'));
 try{newer.finish();await newer.pending;assert.equal(q.context.window.PowerhouseVerificationDesk.snapshot().records.a.skill,'Newest B');const writes=q.writes,confirms=q.confirms;
  old.finish();await old.pending;assert.equal(q.context.window.PowerhouseVerificationDesk.snapshot().records.a.skill,'Newest B');assert.equal(q.writes,writes);assert.equal(q.confirms,confirms);assert.equal(q.context.localStorage.getItem(KEY),q.legacy);
 }finally{old.cleanup();newer.cleanup();assert.equal(Object.hasOwn(old.input,'files'),false);}
});

domTest('editing while a file reads and changing privacy during import confirmation both refuse stale replacement',async()=>{
 for(const transition of ['edit','confirm']){const q=await mount(),read=beginRead(q,backup('Refused stale import'));
  try{if(transition==='edit')q.edit('diagnosis','Latest typed while reading');else q.confirmAction=()=>{q.document.getElementById('share-safe-btn').click();return true;};read.finish();await read.pending;
   assert.equal(q.writes,0);assert.equal(q.extra.size,0);if(transition==='edit'){assert.equal(q.confirms,0);assert.equal(q.document.querySelector('[name=diagnosis]').value,'Latest typed while reading');}else{assert.equal(q.confirms,1);q.flush();q.document.getElementById('share-safe-btn').click();q.flush();assert.equal(q.document.querySelector('[name=skill]').value,'Saved skill');}
  }finally{read.cleanup();assert.equal(Object.hasOwn(read.input,'files'),false);}
 }
});

domTest('native file cancel and pagehide retire pending reads while a later normal private import still succeeds',async()=>{
 for(const transition of ['cancel','pagehide']){const q=await mount(),read=beginRead(q,backup('Retired read'));
  try{if(transition==='cancel')read.input.dispatchEvent(new q.window.Event('cancel'));else{q.window.dispatchEvent(new q.window.Event('pagehide'));q.window.dispatchEvent(new q.window.Event('pageshow'));}read.finish();await read.pending;assert.equal(q.writes,0);assert.equal(q.confirms,0);
  }finally{read.cleanup();assert.equal(Object.hasOwn(read.input,'files'),false);}
  const current=beginRead(q,backup('Current reviewed import'));try{current.finish();await current.pending;assert.equal(q.context.window.PowerhouseVerificationDesk.snapshot().records.a.skill,'Current reviewed import');assert.equal(q.confirms,1);assert.ok(q.writes>0);assert.equal(q.context.localStorage.getItem(KEY),q.legacy);}finally{current.cleanup();assert.equal(Object.hasOwn(current.input,'files'),false);}
 }
});

domTest('live shared URL blocks captured actions and pending reads before the global flag updates, with private saving restored',async()=>{
 const q=await mount();q.edit('skill','Exact visible draft before URL change');
 const form=q.document.querySelector('#v7-form'),submit=form.onsubmit,reopen=q.document.querySelector('#v7-reopen').onclick,exports=[q.document.querySelector('#v7-export').onclick,q.document.querySelector('#v7-draft-export').onclick];
 const read=beginRead(q,backup('Refused shared URL import'));assert.equal(read.started,true);
 try{
  q.context.location.search='?share=%31';assert.equal(q.context.shareSafeMode,false);
  submit({preventDefault(){}});reopen();for(const fn of exports)fn();
  assert.equal(q.context.window.PowerhouseVerificationDesk.open('a'),false);
  read.finish();await read.pending;assert.equal(q.writes,0);assert.equal(q.confirms,0);assert.equal(q.urls,0);
  q.context.PowerhouseUpgrade.onSave();assert.equal(q.document.querySelectorAll('#v7-form').length,0);
  q.context.location.search='';q.context.PowerhouseUpgrade.onSave();
  assert.equal(q.document.querySelector('[name=skill]').value,'Exact visible draft before URL change');
  submit({preventDefault(){}});reopen();for(const fn of exports)fn();assert.equal(q.writes,0);assert.equal(q.urls,0);
  q.document.querySelector('#v7-form').onsubmit({preventDefault(){}});
  assert.ok(q.writes>0);assert.equal(q.context.window.PowerhouseVerificationDesk.snapshot().records.a.skill,'Exact visible draft before URL change');assert.equal(q.context.localStorage.getItem(KEY),q.legacy);
 }finally{read.cleanup();assert.equal(Object.hasOwn(read.input,'files'),false);}
});
