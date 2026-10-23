import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function cloudHarness(fetch){
 const source=readFileSync(new URL('../public/powerhouse/app.js',import.meta.url),'utf8');
 const helper=source.slice(source.indexOf('  async function cloudRequest('),source.indexOf('  async function fetchCloud('));
 let timeout,cleared=0;
 const context=vm.createContext({fetch,AbortController,Error,setTimeout:callback=>{timeout=callback;return 1},clearTimeout:()=>cleared++});
 vm.runInContext(helper,context);
 return {request:()=>vm.runInContext('cloudRequest()',context),expire:()=>timeout(),cleared:()=>cleared};
}
test('cloud timeout covers a stalled response body and releases the timer',async()=>{
 let bodyReady;const ready=new Promise(resolve=>bodyReady=resolve);
 const h=cloudHarness(async(url,options)=>({status:200,json:()=>new Promise((resolve,reject)=>{options.signal.addEventListener('abort',()=>reject(Error('aborted')));bodyReady()})}));
 const request=h.request();await ready;h.expire();await assert.rejects(request,/Connection timed out.*browser evidence is intact/);assert.equal(h.cleared(),1);
});
test('cloud sign-in responses do not require a JSON body',async()=>{
 const h=cloudHarness(async()=>({status:401,json:()=>{throw Error('HTML sign-in body')}}));
 assert.equal((await h.request()).response.status,401);assert.equal(h.cleared(),1);
});
test('cloud success preserves revision data and releases the timeout',async()=>{
 const h=cloudHarness(async()=>({status:200,json:async()=>({revision:7})}));
 assert.equal((await h.request()).data.revision,7);assert.equal(h.cleared(),1);
});

function tracker(at,blocked=false){
 const nodes=new Map(),records=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',hidden:true});return nodes.get(id)};
 const RealDate=Date;
 class Clock extends RealDate{constructor(...args){super(...(args.length?args:[at]))}static now(){return new RealDate(at).getTime()}}
 const context=vm.createContext({Date:Clock,Intl,URLSearchParams,crypto:{randomUUID:()=> 'test-id'},window:{},document:{getElementById:node},localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return records.get(key)||null},setItem:(key,value)=>{if(blocked)throw Error('blocked');records.set(key,value)}}});
 const source=readFileSync(new URL('../public/study-tracker/app.js',import.meta.url),'utf8').split('populateSelects();applyCommandBridge();')[0];
 vm.runInContext(readFileSync(new URL('../public/data-safety/safe-store.js',import.meta.url),'utf8'),context);vm.runInContext(source,context);return {context,node,records};
}

test('weekly goal switches at Monday midnight in Colombo, even while UTC is still Sunday',()=>{
 const {context}=tracker('2026-10-11T19:00:00Z');
 assert.equal(vm.runInContext('weekBounds().start',context),'2026-10-12');
 assert.equal(vm.runInContext('weekBounds().end',context),'2026-10-18');
 const sunday=tracker('2026-10-11T18:29:59Z');
 assert.equal(vm.runInContext('weekBounds().start',sunday.context),'2026-10-05');
});

test('blocked storage preserves the open session in memory and displays an export warning',()=>{
 const {context,node}=tracker('2026-10-07T15:00:00Z',true);
 assert.doesNotThrow(()=>vm.runInContext("state.active={id:'keep-me'};saveState();",context));
 assert.equal(vm.runInContext('loadState().active.id',context),'keep-me');
 assert.equal(node('storageWarning').hidden,false);
 assert.match(node('storageWarning').textContent,/export a backup/);
});

test('Physics backup validation accepts a real family and rejects damaged or injected evidence',()=>{
 const source=readFileSync(new URL('../public/physics-intelligence/app.js',import.meta.url),'utf8').split('async function init()')[0];
 const context=vm.createContext({URLSearchParams,location:{search:''},Date});
 vm.runInContext(source,context);
 vm.runInContext("state.data={currentFamilies:[{familyId:'F1'}]}",context);
 const attempt={familyId:'F1',outcome:'wrong',timeSeconds:90,confidence:4,recordedAt:'2026-10-07T15:00:00Z'};
 context.rows=[attempt];assert.equal(vm.runInContext('normalizeAttempts(rows,true).length',context),1);
 for(const patch of [{outcome:'<img onerror=alert(1)>'},{familyId:'unknown'},{timeSeconds:-1},{timeSeconds:Infinity},{confidence:6},{recordedAt:'not-a-date'}]){
   context.rows=[{...attempt,...patch}];assert.throws(()=>vm.runInContext('normalizeAttempts(rows,true)',context));
 }
});
