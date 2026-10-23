import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=n=>readFileSync(new URL('../public/'+n,import.meta.url),'utf8');
const c=vm.createContext({Date,Intl,URL,Set,Map});vm.runInContext(read('science-intelligence/model.js'),c);vm.runInContext(read('powerhouse/launchpad-model.js'),c);
const M=c.ScienceIntelligence,L=c.PowerhouseLaunchpad,copy=x=>JSON.parse(JSON.stringify(x));
const baseline=()=>({id:'b1',subject:'biology',reference_id:'biology:2024:I:1:',session_id:'s1',date:'2026-10-01',earned:0,total:1,guesses:0,minutes:2,marking_source:'Scheme p1',error:'Concept error',repair:'One precise rule',role:'baseline',unaided:true,fresh:false,core_attempt_id:'',retest_dates:['2026-10-04','2026-10-11']});
const progress=()=>({...copy(M.initialProgress()),sessions:[{id:'s1',subject:'biology',set:'A',date:'2026-10-01',phase:2,closed:false}],records:[baseline()]});
test('a clock pauses against elapsed time, clamps at zero and never edits evidence',()=>{
 const clock={remainingMs:300000,running:true,startedAt:1000};assert.equal(M.clockRemaining(clock,61000),240000);assert.equal(M.clockRemaining(clock,400000),0);
 assert.equal(M.clockRemaining({remainingMs:120000,running:false},999999),120000);assert.throws(()=>M.clockRemaining({remainingMs:-1,running:false}));assert.equal(M.PHASE_MINUTES.reduce((a,b)=>a+b,0),90);
});
test('scheduled checks clear only from explicitly linked clean retests, one record per planned stage',()=>{
 const p=progress();assert.deepEqual(copy(M.followups(p,'2026-10-05')).map(r=>r.state),['due','scheduled']);
 p.records.push({...baseline(),id:'d1',source_record_id:'b1',role:'delayed-retest',earned:1,error:'',date:'2026-10-11',retest_dates:['2026-10-14','2026-10-21']});
 assert.deepEqual(copy(M.followups(p,'2026-10-14')).map(r=>r.state),['recorded','due']);
 p.records.push({...p.records[1],id:'d2',date:'2026-10-12',retest_dates:['2026-10-15','2026-10-22']});assert.deepEqual(copy(M.followups(p,'2026-10-14')).map(r=>r.state),['recorded','recorded']);
});
test('unlinked, guessed and failed retests cannot clear a scheduled error check',()=>{
 for(const extra of [{source_record_id:''},{guesses:1},{earned:0,error:'Still confused'}]){
  const p=progress();p.records.push({...baseline(),id:'d1',source_record_id:'b1',role:'delayed-retest',earned:1,error:'',date:'2026-10-05',retest_dates:['2026-10-08','2026-10-15'],...extra});assert.notEqual(M.followups(p,'2026-10-14')[0].state,'recorded');
 }
});
test('future evidence and links to another subject or missing baseline are rejected',()=>{
 for(const extra of [{date:'2099-01-01'},{source_record_id:'missing'},{source_record_id:'b1'}]){const p=progress();p.records.push({...baseline(),id:'d1',subject:'chemistry',session_id:'s2',...extra});p.sessions.push({id:'s2',subject:'chemistry',set:'A',date:'2026-10-01',phase:2,closed:false});assert.throws(()=>M.validateProgress(p));}
});
test('clean baselines do not invent errors or a compulsory retest backlog',()=>{
 const p=progress();p.records[0].earned=1;p.records[0].error='';assert.equal(M.followups(p).length,0);
});
test('next actions prioritize actual overdue core checks and preserve upcoming dates',()=>{
 const store=new Map([[L.KEYS.core,JSON.stringify({attempts:[],retests:[{id:'a',topicKey:'biology|4|2',due:'2026-10-02'},{id:'b',topicKey:'physics|1|2',due:'2026-10-20'},{id:'c',topicKey:'biology|2|1',due:'2026-10-01',completedAt:'2026-10-03'}]})]]);
 const v=L.read({getItem:k=>store.get(k)??null}),q=L.queue(v,'2026-10-14');assert.equal(q.length,2);assert.equal(q[0].priority,0);assert.equal(q[1].priority,3);assert.equal(q[0].href,'#repairs');
});
test('recovery exports exact damaged bytes and reports unreadable/denied modules without replacing them',()=>{
 let writes=0;const view=L.read({getItem:k=>k===L.KEYS.science?'{broken':null,setItem(){writes++;}}),b=L.bundle(view);assert.equal(b.entries.find(e=>e.module==='science').raw,'{broken');assert.equal(b.entries.find(e=>e.module==='science').readable,false);assert.equal(writes,0);
 const denied=L.read({getItem(){throw Error('denied');}});assert.equal(denied.errors.length,Object.keys(L.KEYS).length);assert.equal(L.bundle(denied).entries.length,Object.keys(L.KEYS).length);
});
test('existing stores are read only, new launchpad and clocks are included in the candidate',()=>{
 const ui=read('powerhouse/launchpad-ui.js');assert.doesNotMatch(ui,/localStorage\.setItem/);assert.match(ui,/if\(shareSafeMode\)/);assert.match(ui,/openAttemptDialog/);
 assert.match(read('science-intelligence/index.html'),/id="resumeSession"/);assert.match(read('science-intelligence/index.html'),/id="clockReadout"/);assert.match(read('sw.js'),/launchpad-model\.js/);
});
