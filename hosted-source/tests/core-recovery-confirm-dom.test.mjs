import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
const KEY='al_performance_powerhouse_v4';
const tick=()=>new Promise(resolve=>setImmediate(resolve));

async function mount(){
 const {parseHTML}=await import(pathToFileURL(packagePath).href);
 const {window}=parseHTML('<html><body><button id="share-safe-btn">Share</button><button id="data-btn">Data</button><button id="export-data">Export</button><button id="weekly-report">Review</button><input id="profile-name"><main></main></body></html>');
 const legacy=' {"version":8,"profile":{"name":"Original"},"attempts":[],"retests":[],"ratings":{}} ';
 const memory=new Map([[KEY,legacy]]),jobs=[],blobs=[];let writes=0,reloads=0,confirms=0,confirmAction=()=>true;
 const api={getItem:key=>memory.get(key)??null,setItem(key,value){writes++;memory.set(key,String(value));},removeItem(key){writes++;memory.delete(key);},keys:()=>[...memory.keys()]};
 const localStorage=new Proxy({}, {get(_target,key){return api[key];},ownKeys:()=>[...memory.keys()],getOwnPropertyDescriptor:()=>({configurable:true,enumerable:true})});
 const location={search:'',reload(){reloads++;}};
 const context=vm.createContext({window,document:window.document,localStorage,location,URLSearchParams,Blob,Event:window.Event,MutationObserver:window.MutationObserver,crypto:{randomUUID:()=> 'fixture-'+writes+'-'+jobs.length},shareSafeMode:false,state:JSON.parse(legacy),setTimeout(fn,delay){jobs.push({fn,delay});return jobs.length;},URL:{createObjectURL(blob){blobs.push(blob);return 'blob:private-core-fixture';},revokeObjectURL(){}},confirm(){confirms++;return confirmAction();},toggleShareSafe(){context.shareSafeMode=!context.shareSafeMode;},PowerhouseEvidence:{validateBackup(){}},allTopics:()=>[],SUBJECTS:[],ATTEMPT_TYPE_NAMES:{},ERROR_NAMES:{},todayISO:()=> '2026-10-29',SYLLABUS_PLAN:[]});
 vm.runInContext(readFileSync('public/data-safety/safe-store.js','utf8'),context);
 context.PowerhouseCoreStore=context.TrinityStore.open(localStorage,KEY,{isolated:true,validate:context.TrinityStore.core});
 vm.runInContext(readFileSync('public/data-safety/powerhouse-core-ui.js','utf8'),context);
 const input=window.document.getElementById('trinity-core-file');let files=[];
 Object.defineProperty(input,'files',{configurable:true,get:()=>files});
 class FileFixture extends Blob{constructor(raw,reader){super([raw]);this.reader=reader;this.raw=raw;}text(){return this.reader?this.reader():Promise.resolve(this.raw);}}
 return {window,document:window.document,context,memory,legacy,jobs,blobs,location,input,get writes(){return writes;},get reloads(){return reloads;},get confirms(){return confirms;},set confirmAction(fn){confirmAction=fn;},choose(raw,reader){const file=new FileFixture(raw,reader);files=[file];return{file,promise:input.onchange({target:input})};},flush(){for(const job of jobs.splice(0).filter(job=>job.delay===0))job.fn();},head(){const raw=memory.get(KEY+'__trinity_checkpoint_v1');return raw?JSON.parse(JSON.parse(raw).head):null;},otherSave(name){const other=context.TrinityStore.open(localStorage,KEY,{isolated:true,validate:context.TrinityStore.core});other.save({...JSON.parse(legacy),profile:{name}});},snapshot:()=>[...memory.entries()]};
}
const incoming=name=>' \n'+JSON.stringify({version:8,profile:{name},attempts:[],retests:[],ratings:{},futureRoot:{retain:'literal original'}})+'\n ';

domTest('actual core recovery yields after native confirmation and normally commits with exact legacy original preserved',async()=>{
 const q=await mount(),raw=incoming('Reviewed import'),run=q.choose(raw);await tick();
 assert.equal(q.confirms,1);assert.equal(q.writes,0,'No commit before the queued task boundary');
 q.flush();await run.promise;
 assert.equal(q.head().profile.name,'Reviewed import');assert.deepEqual(q.head().futureRoot,{retain:'literal original'});
 assert.equal(q.memory.get(KEY),q.legacy);assert(q.memory.get(KEY+'__trinity_originals_v1').includes('Original'));assert.equal(q.reloads,1);assert.equal(q.blobs.length,0);
});

domTest('actual core recovery refuses newer real-store checkpoint after confirm and retains exact selected bytes for private export',async()=>{
 const q=await mount(),raw=incoming('Uncommitted incoming');let winner;
 q.confirmAction=()=>{q.otherSave('Winner B');winner=q.snapshot();return true;};
 const run=q.choose(raw);await tick();q.flush();await run.promise;
 assert.deepEqual(q.snapshot(),winner);assert.equal(q.head().profile.name,'Winner B');assert.equal(q.reloads,0);
 assert.match(q.document.getElementById('trinity-restore-message').textContent,/kept.*private export/);
 q.document.getElementById('trinity-export-incoming').onclick();assert.equal(q.blobs.length,1);
 assert.equal(Buffer.from(await q.blobs[0].arrayBuffer()).toString(),raw);
});

domTest('captured original/copies/modules/incoming exports refuse a bare shared URL before flags/events and resume privately',async()=>{
 const q=await mount(),raw=incoming('Private selected original');q.confirmAction=()=>false;
 await q.choose(raw).promise;
 const ids=['trinity-export-original','trinity-export-copies','trinity-export-pending-modules','trinity-export-incoming'];
 const callbacks=ids.map(id=>q.document.getElementById(id).onclick),before=q.snapshot();
 q.location.search='?share=1';callbacks.forEach(fn=>fn());
 assert.equal(q.blobs.length,0);assert.deepEqual(q.snapshot(),before);
 q.window.dispatchEvent(new q.window.Event('popstate'));
 assert.equal(q.document.getElementById('trinity-data-status').hidden,true);assert.equal(q.document.getElementById('trinity-export-incoming').hidden,true);
 q.location.search='';q.window.dispatchEvent(new q.window.Event('popstate'));
 assert.equal(q.document.getElementById('trinity-export-incoming').hidden,false);
 q.document.getElementById('trinity-export-incoming').onclick();assert.equal(Buffer.from(await q.blobs[0].arrayBuffer()).toString(),raw);
});

domTest('actual core recovery stops on direct shared URL, later typed edits and detached owner without any write',async()=>{
 for(const action of ['url','input','detach']){
  const q=await mount(),before=q.snapshot();
  q.confirmAction=()=>{if(action==='url')q.location.search='?share=1';if(action==='input')q.document.getElementById('profile-name').dispatchEvent(new q.window.Event('input',{bubbles:true}));if(action==='detach')q.document.getElementById('trinity-data-status').remove();return true;};
  const run=q.choose(incoming('Must remain uncommitted'));await tick();q.flush();await run.promise;
  assert.deepEqual(q.snapshot(),before,action);assert.equal(q.writes,0,action);assert.equal(q.reloads,0,action);
 }
});

domTest('superseded slow file cannot overwrite the latest reviewed import or clear its selected request',async()=>{
 const q=await mount();let resolveOld;
 const old=q.choose(incoming('Old request'),()=>new Promise(resolve=>{resolveOld=resolve;}));
 const current=q.choose(incoming('Latest request'));await tick();q.flush();await current.promise;
 const saved=q.snapshot();resolveOld(incoming('Old request'));await old.promise;
 assert.deepEqual(q.snapshot(),saved);assert.equal(q.head().profile.name,'Latest request');assert.equal(q.reloads,1);assert.equal(q.confirms,1);
});

domTest('cancel, pagehide and unsupported schemas preserve stored originals and never add academic credit',async()=>{
 for(const action of ['cancel','pagehide','future']){
  const q=await mount(),before=q.snapshot();let resolveRead;
  const raw=action==='future'?JSON.stringify({version:999,attempts:[],retests:[]}):incoming('Not committed');
  const run=q.choose(raw,action==='future'?undefined:()=>new Promise(resolve=>{resolveRead=resolve;}));
  if(action==='cancel')q.input.dispatchEvent(new q.window.Event('cancel'));
  if(action==='pagehide')q.window.dispatchEvent(new q.window.Event('pagehide'));
  if(resolveRead)resolveRead(raw);await run.promise;
  assert.deepEqual(q.snapshot(),before,action);assert.equal(q.writes,0,action);assert.equal(q.confirms,0,action);assert.equal(q.reloads,0,action);
 }
});
