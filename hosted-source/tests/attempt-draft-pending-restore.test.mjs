import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
const KEY='alpp_attempt_draft_v14';
const savedFields={'attempt-subject':'physics','attempt-date':'2026-10-28','attempt-type':'fresh-transfer','attempt-topic':'physics|0|0','attempt-question':'Earlier saved question','marks-earned':'2','marks-total':'5','trusted-earned':'1.5','attempt-minutes':'10','attempt-items':'1','attempt-confidence':'medium','attempt-guesses':'0','attempt-error':'K','attempt-note':'Earlier correction','attempt-unaided':true,'attempt-novel':false,'v6-edit-id':'edit-original','v6-source-id':'source-original'};
const draft=(fields=savedFields,extra={})=>({schema:'powerhouse-attempt-draft-v1',savedAt:'2026-10-28T00:00:00Z',fields:{...fields},...extra});

async function mount({raw=JSON.stringify(draft()),paused=false}={}){
 const {parseHTML}=await import(pathToFileURL(packagePath).href);
 const index=readFileSync('public/index.html','utf8'),start=index.indexOf('<dialog id="attempt-dialog">'),end=index.indexOf('</dialog>',start)+9;
 assert.ok(start>=0&&end>start,'Actual attempt dialog must be available');
 const {window}=parseHTML('<html><body><button id="share-safe-btn">Share-safe</button><section id="panel-attempts"></section>'+index.slice(start,end)+'</body></html>');
 const document=window.document,form=document.getElementById('attempt-form'),dialog=document.getElementById('attempt-dialog'),selection=new WeakMap();
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){if(selection.has(this))return selection.get(this);return this.querySelector('option[selected]')?.value||this.querySelector('option')?.value||'';},set(value){selection.set(this,[...this.querySelectorAll('option')].some(option=>option.value===String(value))?String(value):'');}});
 for(const id of ['v6-edit-id','v6-source-id']){const input=document.createElement('input');input.id=id;input.type='hidden';form.append(input);}
 const defaults=new Map([...form.querySelectorAll('input,textarea,select')].map(input=>[input,input.type==='checkbox'?input.hasAttribute('checked'):input.tagName==='SELECT'?input.value:input.getAttribute('value')||'']));
 form.reset=()=>{for(const input of form.querySelectorAll('input,textarea,select'))if(input.type==='checkbox')input.checked=defaults.get(input)===true;else input.value=defaults.get(input)??'';};
 let opened=0,writes=0,attemptedWrites=0,denyWrites=false,blob=null,urls=0,serial=0;
 dialog.showModal=()=>{opened++;dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 window.HTMLElement.prototype.focus=()=>{};
 const values=new Map(raw===null?[]:[[KEY,raw]]),jobs=new Map();
 const localStorage={getItem:key=>values.get(key)??null,setItem(key,value){attemptedWrites++;if(denyWrites)throw Error('Synthetic quota refusal');writes++;values.set(key,value);},keys:()=>[...values.keys()],removeItem:key=>values.delete(key)};
 const location={href:'http://fixture.local/'};
 const context=vm.createContext({window,document,localStorage,location,URL:class extends URL{static createObjectURL(value){urls++;blob=value;return 'blob:private-draft';}static revokeObjectURL(){}},Blob,Event:window.Event,setTimeout(fn,delay){const id=++serial;jobs.set(id,{fn,delay});return id;},clearTimeout:id=>jobs.delete(id),shareSafeMode:false,PowerhouseCoreStore:{readOnly:paused},PowerhouseUpgrade:{showEvidence(){}},state:{attempts:[{id:'source-original',subject:'physics',topicKey:'physics|0|0'}],retests:[{id:'due-original',completedAt:null}]},allTopics:subject=>[{key:'physics|0|0',subject:'physics'},{key:'chemistry|0|0',subject:'chemistry'}].filter(topic=>!subject||topic.subject===subject),$:id=>document.getElementById(id),getTopic:()=>null,SUBJECTS:['physics','chemistry','biology'],activePanel:'command',todayISO:()=> '2026-10-28',SYL:{physics:{units:[{n:'Synthetic physics unit',t:['Synthetic topic']}]},chemistry:{units:[{n:'Synthetic chemistry unit',t:['Synthetic topic']}]},biology:{units:[{n:'Synthetic biology unit',t:['Synthetic topic']}]}},topicKey:(subject,unit,topic)=>[subject,unit,topic].join('|'),escapeHTML:value=>String(value),refreshDiagnosisHint(){},navigate(){},toast(){}});
 const opener=index.slice(index.indexOf('function fillTopicSelect('),index.indexOf('\nfunction completeEligibleRetests('));
 vm.runInContext(opener,context,{filename:'public/index.html source-extracted actual opener'});
 vm.runInContext(readFileSync('public/data-safety/safe-store.js','utf8'),context,{filename:'public/data-safety/safe-store.js'});
 vm.runInContext(readFileSync('public/data-safety/powerhouse-evidence-v14.js','utf8'),context,{filename:'public/data-safety/powerhouse-evidence-v14.js'});
 const collect=()=>Object.fromEntries([...form.querySelectorAll('input[id],textarea[id],select[id]')].map(input=>[input.id,input.type==='checkbox'?input.checked:input.value]));
 return {window,document,context,form,dialog,values,jobs,collect,restore:document.getElementById('v14-draft-restore'),exportButton:document.getElementById('v14-draft-export'),status:document.getElementById('v14-draft-status'),get opened(){return opened;},get writes(){return writes;},get attemptedWrites(){return attemptedWrites;},get urls(){return urls;},get blob(){return blob;},set denyWrites(value){denyWrites=value;},edit(id,value){const input=document.getElementById(id);if(input.type==='checkbox')input.checked=value;else input.value=value;input.dispatchEvent(new window.Event('input',{bubbles:true}));},flush(delay=250){for(const[id,job]of [...jobs])if(job.delay===delay){jobs.delete(id);job.fn();}}};
}

domTest('saved-only recovery restores exact fields and source IDs without storage writes or academic credit',async()=>{
 const raw=' \n'+JSON.stringify(draft())+'\n',q=await mount({raw}),before=JSON.stringify(q.context.state);q.restore.click();
 for(const[id,value]of Object.entries(savedFields))assert.equal(q.collect()[id],value,id);
 assert.equal(q.writes,0);assert.equal(q.values.get(KEY),raw);assert.equal(JSON.stringify(q.context.state),before);
});

domTest('Restore prefers the latest pending snapshot and a subsequent edit cannot save the older question or marks',async()=>{
 const q=await mount();q.restore.click();q.edit('attempt-question','Latest exact question <keep>\tnew line\nreason');q.edit('marks-earned','4');q.edit('trusted-earned','3.5');q.edit('attempt-note','Latest diagnosis');q.edit('attempt-unaided',false);q.edit('attempt-novel',true);q.edit('v6-edit-id','new-edit-id');q.edit('v6-source-id','new-source-id');
 const latest=q.collect(),raw=q.values.get(KEY),before=JSON.stringify(q.context.state);q.dialog.close();q.restore.click();
 assert.deepEqual(q.collect(),latest);assert.equal(q.writes,0,'Restore must not force the pending save');assert.equal(q.values.get(KEY),raw);
 q.edit('attempt-note','One further correction');q.flush();const stored=JSON.parse(q.values.get(KEY));
 assert.equal(stored.fields['attempt-question'],latest['attempt-question']);assert.equal(stored.fields['marks-earned'],'4');assert.equal(stored.fields['v6-source-id'],'new-source-id');assert.equal(stored.fields['attempt-note'],'One further correction');assert.equal(JSON.stringify(q.context.state),before);
});

domTest('a first-ever pending draft is restorable before any storage flush',async()=>{
 const q=await mount({raw:null});q.context.openAttemptDialog();q.edit('attempt-question','First unsaved question');q.edit('marks-earned','4');const latest=q.collect();q.dialog.close();
 assert.equal(q.restore.disabled,false);q.restore.click();assert.deepEqual(q.collect(),latest);assert.equal(q.writes,0);assert.equal(q.values.has(KEY),false);
});

domTest('new pending work takes priority over a previously submitted saved draft',async()=>{
 const raw=JSON.stringify(draft(savedFields,{status:'submitted'})),q=await mount({raw});q.context.openAttemptDialog();q.edit('attempt-question','New attempt after submitted draft');q.edit('marks-earned','1');const latest=q.collect();q.dialog.close();
 assert.equal(q.restore.disabled,false);q.restore.click();assert.deepEqual(q.collect(),latest);assert.equal(q.values.get(KEY),raw);assert.equal(q.writes,0);
});

domTest('a captured Restore cannot reset an occupied editor or mutate its latest pending fields',async()=>{
 const q=await mount();q.restore.click();q.edit('attempt-question','Occupied editor latest');const before=q.collect(),opened=q.opened;q.restore.onclick();
 assert.deepEqual(q.collect(),before);assert.equal(q.opened,opened);assert.equal(q.writes,0);assert.match(q.status.textContent,/already open|current fields|kept/i);
});

domTest('quota failure and competing saved changes preserve both raw originals and latest pending export without forced restoration writes',async()=>{
 for(const mode of ['quota','conflict']){const q=await mount(),original=q.values.get(KEY);q.restore.click();q.edit('attempt-question','Latest pending through '+mode);q.dialog.close();
  if(mode==='quota'){q.denyWrites=true;q.flush();}else q.values.set(KEY,' {"newer":"Competing saved draft must remain"} ');
  const raw=q.values.get(KEY),before=q.collect(),attempted=q.attemptedWrites,opened=q.opened;q.restore.onclick();
  assert.equal(q.opened,opened);assert.deepEqual(q.collect(),before);assert.equal(q.attemptedWrites,attempted);assert.equal(q.values.get(KEY),raw);
  q.exportButton.onclick();const exported=JSON.parse(await q.blob.text());assert.equal(exported.fields['attempt-question'],'Latest pending through '+mode);assert.notEqual(original,null);
 }
});

domTest('unreadable, future and interrupted saved drafts remain exact and cannot reset fields',async()=>{
 const cases=[{raw:'{broken original'},{raw:JSON.stringify({schema:'future-attempt-draft-v99',fields:{'attempt-question':'Future record'}})},{raw:JSON.stringify(draft()),checkpoint:JSON.stringify({schema:'future-checkpoint-v99',head:'Keep interrupted bytes'})}];
 for(const fixture of cases){const q=await mount({raw:fixture.raw});if(fixture.checkpoint)q.values.set(KEY+'__trinity_checkpoint_v1',fixture.checkpoint);const before=q.collect(),opened=q.opened;q.restore.onclick();assert.equal(q.opened,opened);assert.deepEqual(q.collect(),before);assert.equal(q.writes,0);assert.equal(q.values.get(KEY),fixture.raw);q.exportButton.onclick();assert.equal(await q.blob.text(),fixture.raw);if(fixture.checkpoint)assert.equal(q.values.get(KEY+'__trinity_checkpoint_v1'),fixture.checkpoint);}
});

domTest('unsupported recovered field IDs, types, options and wrong-subject topics refuse before resetting the form',async()=>{
 const cases=[{...savedFields,'future-field':'Keep unknown original'},{...savedFields,'marks-earned':true},{...savedFields,'attempt-subject':'future-subject'},{...savedFields,'attempt-type':'future-attempt-kind'},{...savedFields,'attempt-topic':'chemistry|0|0'}];
 for(const fields of cases){const raw=JSON.stringify(draft(fields)),q=await mount({raw}),before=q.collect();q.restore.onclick();assert.equal(q.opened,0);assert.deepEqual(q.collect(),before);assert.equal(q.values.get(KEY),raw);assert.equal(q.writes,0);assert.match(q.status.textContent,/review|unsupported|unreadable/i);q.exportButton.onclick();assert.equal(await q.blob.text(),raw);}
});

domTest('historically incomplete draft restores its exact known text while absent required selections remain blank for manual review',async()=>{
 const raw=JSON.stringify(draft({'attempt-question':'Historical question without topic','marks-earned':'2'})),q=await mount({raw});q.restore.click();
 assert.equal(q.document.getElementById('attempt-question').value,'Historical question without topic');assert.equal(q.document.getElementById('marks-earned').value,'2');
 for(const id of ['attempt-subject','attempt-topic','attempt-type','attempt-confidence'])assert.equal(q.document.getElementById(id).value,'',id+' must not be silently defaulted');
 assert.equal(q.values.get(KEY),raw);assert.equal(q.writes,0);
});

domTest('live shared URL, shared body and global privacy flag refuse captured recovery/export and pending writes immediately',async()=>{
 for(const mode of ['url','body','flag']){const q=await mount(),restore=q.restore.onclick,exportDraft=q.exportButton.onclick;q.restore.click();q.edit('attempt-question','Pending private question');q.dialog.close();const before=q.collect(),opened=q.opened,raw=q.values.get(KEY);
  if(mode==='url')q.context.location.href='http://fixture.local/?share=%31';else if(mode==='body')q.document.body.classList.add('share-safe');else q.context.shareSafeMode=true;
  restore();exportDraft();q.flush();assert.equal(q.opened,opened);assert.deepEqual(q.collect(),before);assert.equal(q.urls,0);assert.equal(q.writes,0);assert.equal(q.values.get(KEY),raw);assert.equal(q.context.window.PowerhouseAttemptDraft.openLinked('source-original','reattempt').ok,false);
  q.context.location.href='http://fixture.local/';q.document.body.classList.remove('share-safe');q.context.shareSafeMode=false;restore();assert.equal(q.document.getElementById('attempt-question').value,'Pending private question');exportDraft();assert.equal(JSON.parse(await q.blob.text()).fields['attempt-question'],'Pending private question');
 }
});

domTest('normal private autosave and exact saved-original export still work independently of restoration',async()=>{
 const q=await mount(),raw=q.values.get(KEY);q.exportButton.click();assert.equal(await q.blob.text(),raw);q.context.openAttemptDialog();q.edit('attempt-question','Normally autosaved attempt');q.edit('marks-earned','3');q.flush();
 assert.equal(JSON.parse(q.values.get(KEY)).fields['attempt-question'],'Normally autosaved attempt');assert.ok(q.writes>0);assert.equal(JSON.parse(q.values.get(KEY+'__trinity_originals_v1')).some(copy=>copy.raw===raw),true);
 q.exportButton.click();assert.equal(await q.blob.text(),q.values.get(KEY));assert.equal(q.context.state.attempts.length,1);assert.equal(q.context.state.retests[0].completedAt,null);
});
