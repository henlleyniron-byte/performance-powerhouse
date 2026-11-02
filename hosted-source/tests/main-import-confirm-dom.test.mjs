import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const packagePath=process.env.DOM_QA_PACKAGE;
const domTest=(name,fn)=>test(name,{skip:!packagePath},fn);
const KEY='al_performance_powerhouse_v4',CYCLE='alpp_evidence_cycle_v1';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const source=readFileSync('public/index.html','utf8');
const actualImport=source.slice(source.indexOf('let backupImportRevision ='),source.indexOf('\nfunction showWelcome()'));
const backup=name=>' \n'+JSON.stringify({version:8,profile:{name},attempts:[],retests:[],ratings:{},futureRoot:{literal:'retain unknown source'},evidenceCycle:{subject:'physics',step:0,done:[]}})+'\n ';

async function mount(){
 const {parseHTML}=await import(pathToFileURL(packagePath).href);
 const {window}=parseHTML('<html><body><button id="share-safe-btn">Share</button><button id="data-btn">Data</button><button id="export-data">Export</button><button id="weekly-report">Review</button><input id="profile-name"><input id="import-file" type="file"><dialog id="data-dialog"></dialog><dialog id="welcome-dialog"></dialog><main></main></body></html>');
 const initial={version:8,profile:{name:'Original',year:'2027'},attempts:[],retests:[],ratings:{},dailyTargets:{physics:1},dailyEntries:[],courseCorrection:{dailyAudits:{},rabbitHoleEvents:[],planningOverrides:[],rescueRuns:[]}};
 const legacy=' '+JSON.stringify(initial)+' ',memory=new Map([[KEY,legacy]]),jobs=[],blobs=[],readers=[],messages=[];
 let writes=0,snapshots=0,confirms=0,confirmAction=()=>true;
 const api={getItem:key=>memory.get(key)??null,setItem(key,value){writes++;memory.set(key,String(value));},removeItem(key){writes++;memory.delete(key);},keys:()=>[...memory.keys()]};
 const localStorage=new Proxy({}, {get:(_target,key)=>api[key],ownKeys:()=>[...memory.keys()],getOwnPropertyDescriptor:()=>({configurable:true,enumerable:true})});
 const location={search:'',reload(){throw Error('Main import must not reload');}};
 const context=vm.createContext({window,document:window.document,localStorage,location,URLSearchParams,Blob,Event:window.Event,CustomEvent:window.CustomEvent,MutationObserver:window.MutationObserver,crypto:{randomUUID:()=> 'fixture-'+writes+'-'+jobs.length},APP_KEY:KEY,CYCLE_KEY:CYCLE,shareSafeMode:false,state:JSON.parse(legacy),evidenceCycle:{subject:'physics',step:0,done:[]},CYCLE_STEPS:[{},{}],OLD_V6_DAILY_TARGETS:{legacy:true},DEFAULT_DAILY_TARGETS:{physics:1},setTimeout(fn,delay){jobs.push({fn,delay});return jobs.length;},URL:{createObjectURL(blob){blobs.push(blob);return 'blob:main-fixture';},revokeObjectURL(){}},confirm(){confirms++;return confirmAction();},toggleShareSafe(){context.shareSafeMode=!context.shareSafeMode;},PowerhouseEvidence:{validateBackup(){},normalizeCycle:value=>value},allTopics:()=>[],SUBJECTS:[],ATTEMPT_TYPE_NAMES:{},ERROR_NAMES:{},todayISO:()=> '2026-10-29',SYLLABUS_PLAN:[],toast:message=>messages.push(message),defaultState:()=>structuredClone(initial),normalizeDailyTargets:value=>value,snapshotState(){snapshots++;},refreshAll(){},saveCycle(){localStorage.setItem(CYCLE,JSON.stringify(context.evidenceCycle));},renderCycle(){},mapDonatedTrackerToDaily(){throw Error('This fixture does not reimplement the legacy mapper');},FileReader:class{constructor(){readers.push(this);}readAsText(file){this.file=file;}},$:id=>window.document.getElementById(id)});
 vm.runInContext(readFileSync('public/data-safety/safe-store.js','utf8'),context);
 context.PowerhouseCoreStore=context.TrinityStore.open(localStorage,KEY,{isolated:true,validate:context.TrinityStore.core});
 context.saveState=()=>{try{context.PowerhouseCoreStore.save(context.state);return true;}catch{return false;}};
 vm.runInContext(readFileSync('public/data-safety/powerhouse-core-ui.js','utf8'),context);
 vm.runInContext(actualImport,context);
 for(const id of ['data-dialog','welcome-dialog'])window.document.getElementById(id).close=()=>{};
 class FileFixture extends Blob{constructor(raw){super([raw]);this.raw=raw;}}
 return {window,document:window.document,context,memory,legacy,jobs,blobs,messages,location,get writes(){return writes;},get snapshots(){return snapshots;},get confirms(){return confirms;},set confirmAction(fn){confirmAction=fn;},choose(raw){const file=new FileFixture(raw);context.importData(file);const reader=readers.at(-1);return {file,reader,complete:()=>{reader.result=raw;return reader.onload();}};},flush(){for(const job of jobs.splice(0).filter(job=>job.delay===0))job.fn();},head(){const raw=memory.get(KEY+'__trinity_checkpoint_v1');return raw?JSON.parse(JSON.parse(raw).head):null;},otherSave(name){const other=context.TrinityStore.open(localStorage,KEY,{isolated:true,validate:context.TrinityStore.core});other.save({...structuredClone(initial),profile:{name}});},snapshot:()=>[...memory.entries()]};
}

domTest('actual main import commits only after its task boundary and preserves normalization, unknown fields and legacy bytes',async()=>{
 const q=await mount(),run=q.choose(backup('Reviewed import')),promise=run.complete();await tick();
 assert.equal(q.confirms,1);assert.equal(q.writes,0);assert.equal(q.snapshots,0);
 q.flush();await promise;
 assert.equal(q.head().profile.name,'Reviewed import');assert.equal(q.head().profile.year,'2027');assert.deepEqual(q.head().futureRoot,{literal:'retain unknown source'});
 assert.equal(q.head().version,8);assert.equal(q.head().productVersion,'V6');assert.equal(q.memory.get(KEY),q.legacy);assert.equal(q.snapshots,1);
 assert.equal(q.document.getElementById('trinity-export-incoming').hidden,true);assert.equal(q.blobs.length,0);
});

domTest('actual main import refuses a newer checkpoint committed inside native confirm before any snapshot or normalization',async()=>{
 const q=await mount(),raw=backup('Uncommitted A');let winner;
 q.confirmAction=()=>{q.otherSave('Winner B');winner=q.snapshot();return true;};
 const run=q.choose(raw),promise=run.complete();await tick();q.flush();await promise;
 assert.deepEqual(q.snapshot(),winner);assert.equal(q.head().profile.name,'Winner B');assert.equal(q.context.state.profile.name,'Original');assert.equal(q.snapshots,0);
 assert.match(q.messages.at(-1),/interrupted.*private export/);
 q.document.getElementById('trinity-export-incoming').onclick();assert.equal(Buffer.from(await q.blobs[0].arrayBuffer()).toString(),raw);
});

domTest('actual main import rejects independent evidence-cycle edits while confirming without replacing either store',async()=>{
 for(const target of ['memory','raw']){
  const q=await mount();let winner;
  q.confirmAction=()=>{if(target==='memory')q.context.evidenceCycle={subject:'biology',step:1,done:[0]};else q.memory.set(CYCLE,' {"subject":"biology","step":1,"done":[0]} ');winner=q.snapshot();return true;};
  const run=q.choose(backup('Must remain private')),promise=run.complete();await tick();q.flush();await promise;
  assert.deepEqual(q.snapshot(),winner,target);assert.equal(q.snapshots,0,target);assert.equal(q.context.state.profile.name,'Original',target);
 }
});

domTest('main delayed reads retire on cancel, form edit, detached input, private/shared roundtrip and page lifetime',async()=>{
 for(const action of ['cancel','input','detach','url','roundtrip','pagehide']){
  const q=await mount(),before=q.snapshot(),run=q.choose(backup('Late private payload'));
  if(action==='cancel')q.document.getElementById('import-file').dispatchEvent(new q.window.Event('cancel'));
  if(action==='input')q.document.getElementById('profile-name').dispatchEvent(new q.window.Event('input',{bubbles:true}));
  if(action==='detach')q.document.getElementById('import-file').remove();
  if(action==='url')q.location.search='?share=1';
  if(action==='roundtrip'){q.location.search='?share=1';q.window.dispatchEvent(new q.window.Event('popstate'));q.location.search='';q.window.dispatchEvent(new q.window.Event('popstate'));}
  if(action==='pagehide')q.window.dispatchEvent(new q.window.Event('pagehide'));
  await run.complete();assert.deepEqual(q.snapshot(),before,action);assert.equal(q.snapshots,0,action);assert.equal(q.confirms,0,action);
 }
});

domTest('main requests are selection-bound; an old file cannot commit, replace the newer original or revive stale status',async()=>{
 const q=await mount(),old=q.choose(backup('Old read')),latest=q.choose(backup('Latest read')),promise=latest.complete();await tick();q.flush();await promise;
 const saved=q.snapshot(),message=q.messages.at(-1);await old.complete();
 assert.deepEqual(q.snapshot(),saved);assert.equal(q.head().profile.name,'Latest read');assert.equal(q.messages.at(-1),message);assert.equal(q.confirms,1);
});

domTest('main native Cancel retains exact selected original privately and captured recovery exports refuse a bare shared URL',async()=>{
 const q=await mount(),raw=backup('Cancelled original'),before=q.snapshot();q.confirmAction=()=>false;
 await q.choose(raw).complete();assert.deepEqual(q.snapshot(),before);assert.equal(q.snapshots,0);
 const ids=['trinity-export-original','trinity-export-copies','trinity-export-pending-modules','trinity-export-incoming'],callbacks=ids.map(id=>q.document.getElementById(id).onclick);
 q.location.search='?share=1';callbacks.forEach(fn=>fn());assert.equal(q.blobs.length,0);
 q.window.dispatchEvent(new q.window.Event('popstate'));assert.equal(q.document.getElementById('trinity-data-status').hidden,true);
 q.location.search='';q.window.dispatchEvent(new q.window.Event('popstate'));
 q.document.getElementById('trinity-export-incoming').onclick();assert.equal(Buffer.from(await q.blobs[0].arrayBuffer()).toString(),raw);
});

domTest('the existing legacy ratings branch still imports only its ratings and delayed legacy files cannot erase newer work',async()=>{
 const raw=' {"physics|1|1":2} ',q=await mount(),original=structuredClone(q.context.state);
 await q.choose(raw).complete();assert.equal(q.confirms,0);assert.equal(q.snapshots,0);
 assert.deepEqual(q.head(),{...original,ratings:{'physics|1|1':2}});assert.equal(q.memory.get(KEY),q.legacy);
 const later=q.choose(' {"physics|1|1":3} ');q.otherSave('Newer legacy review');const winner=q.snapshot();
 await later.complete();assert.deepEqual(q.snapshot(),winner);assert.equal(q.head().profile.name,'Newer legacy review');
});
