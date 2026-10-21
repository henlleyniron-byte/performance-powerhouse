import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const read=n=>readFileSync(new URL('../public/science-intelligence/'+n,import.meta.url),'utf8');
const context=vm.createContext({URL,Date,Set,Map,JSON});
vm.runInContext(read('model.js'),context);
const M=context.ScienceIntelligence, clone=x=>JSON.parse(JSON.stringify(x));
const real=process.env.SCIENCE_PACKAGE_PATH?JSON.parse(readFileSync(process.env.SCIENCE_PACKAGE_PATH,'utf8')):null;
const marked=()=>({id:'e1',subject:'biology',reference_id:'biology:2024:I:1:',session_id:'s1',date:'2026-10-14',earned:0,total:1,guesses:0,minutes:2,marking_source:'Original scheme, p1',error:'Concept confusion',repair:'Narrow repair',role:'baseline',unaided:true,fresh:false,core_attempt_id:'',retest_dates:['2026-10-17','2026-10-24']});
const progress=()=>({...clone(M.initialProgress()),sessions:[{id:'s1',subject:'biology',set:'A',date:'2026-10-14',phase:2,closed:false}],records:[marked()]});
test('unknown coverage, unclassified and an audited zero remain distinct in data and CSV',()=>{
  const p={units:{chemistry:[{code:'U1',name:'Atomic structure'}]},records:[{stable_id:'r1',subject:'chemistry',exam_year:2025,paper_part:'I',principal_unit:null,official_paper_verified:false,classification_status:'UNCLASSIFIED'}]};
  const m=M.matrix(p,'chemistry',[2022,2025]);
  assert.equal(m[0].cells[0].count,null);assert.equal(m[0].cells[0].state,'NOT AUDITED');
  assert.equal(m[0].cells[1].count,0);assert.equal(m[0].cells[1].state,'PROVISIONAL');
  assert.equal(m[1].cells[1].count,1);assert.equal(m[1].cells[1].state,'UNCLASSIFIED');
  p.records=Array.from({length:50},(_,i)=>({stable_id:'r'+i,subject:'chemistry',exam_year:2025,paper_part:'I',principal_unit:'U2',official_paper_verified:true,classification_status:'OFFICIAL-SOURCE CHECKED'}));
  assert.equal(M.matrix(p,'chemistry',[2025])[0].cells[0].state,'VERIFIED ZERO');
  const csv=M.csv([{count:null,state:'NOT AUDITED'},{count:0,state:'PROVISIONAL'}],['count','state']);
  assert.match(csv,/"","NOT AUDITED"/);assert.match(csv,/"0","PROVISIONAL"/);
});
test('format boundary normalizes six of sixty and five of fifty equally; Paper II excluded',()=>{
  assert.equal(M.denominator('physics',2010),60);assert.equal(M.denominator('physics',2011),50);
  assert.equal(6/M.denominator('physics',2010),5/M.denominator('physics',2011));
  const p={units:{physics:[{code:'U1',name:'Measurement'}]},records:[{subject:'physics',exam_year:2024,paper_part:'II',principal_unit:'U1'}]};
  assert.equal(M.matrix(p,'physics',[2024])[0].cells[0].state,'NOT AUDITED');
});
test('session import is idempotent and flags conflicting evidence instead of overwriting it',()=>{
  const p=progress(),first=M.mergeProgress(p,p),again=M.mergeProgress(first.candidate,p);
  assert.equal(first.added,0);assert.equal(again.candidate.records.length,1);
  const other=clone(p);other.records[0].earned=1;
  const m=M.mergeProgress(p,other);assert.equal(m.conflicts.length,1);assert.equal(m.candidate.records[0].earned,0);
});
test('corrupt, unsafe, impossible marks and dates are rejected before persistence',()=>{
  assert.throws(()=>M.parse('{broken'));
  assert.throws(()=>M.parse('{"__proto__":{"polluted":true}}'),/Unsafe/);
  const p=progress();p.records[0].earned=2;assert.throws(()=>M.validateProgress(p),/Invalid marked evidence/);
  const q=progress();q.records[0].date='2026-02-30';assert.throws(()=>M.validateProgress(q));
  const g=progress();g.groupEnabled=false;g.participants=2;assert.throws(()=>M.validateProgress(g));
});
test('solo defaults, configurable +3/+10 days and canonical bridge never fabricate results',()=>{
  const p=M.initialProgress();assert.equal(p.groupEnabled,false);assert.equal(p.records.length,0);assert.equal(M.bridge(p).rows.length,0);
  assert.deepEqual(clone(M.retestDates('2026-10-14')),['2026-10-17','2026-10-24']);
  assert.deepEqual(clone(M.retestDates('2026-12-29',[2,7])),['2026-12-31','2027-01-05']);
  assert.throws(()=>M.retestDates('2026-10-14',[10,3]));
  assert.equal(M.bridge(progress()).rows[0].properties['Raw Marks'],0);
  assert.match(M.bridge(progress()).mode,/no automatic writes/);
});
test('CSV injection, hostile links and output privacy boundaries are enforced',()=>{
  assert.match(M.csv([{text:'=SUM(A1:A2)'}],['text']),/'=SUM/);
  assert.equal(M.safeUrl('javascript:alert(1)'),null);
  assert.equal(M.safeUrl('https://drive.google.com.evil.test/paper'),null);
  assert.equal(M.safeUrl('https://drive.google.com/file/d/example/view'),'https://drive.google.com/file/d/example/view');
  const app=read('app.js');assert.doesNotMatch(app,/fetch\s*\(|XMLHttpRequest|sendBeacon/);
  assert.doesNotMatch(app,/localStorage\.setItem\(['"]al_performance_powerhouse_(v3|v4|physics|study)/);
});
test('real source reconciliation: 1910 references, 70 targets, three Biology distributions and family discrepancy',{skip:!real},()=>{
  M.validatePackage(real);
  assert.equal(real.records.length,1910);assert.equal(real.diagnostics.length,70);
  for(const totals of Object.values(real.biology_versions))assert.equal(Object.values(totals).reduce((a,b)=>a+b,0),350);
  for(const q of [32,33])assert.equal(real.records.find(r=>r.stable_id==='biology:2019:I:'+q+':').principal_unit,'U7');
  assert.equal(real.records.find(r=>r.stable_id==='biology:2019:I:40:').principal_unit,'U9');
  assert.equal(real.records.find(r=>r.stable_id==='biology:2019:I:50:').principal_unit,'U9');
  assert.match(real.records.find(r=>r.stable_id==='biology:2023:I:30:').review_flag,/Printed-option/);
  assert.equal(real.records.filter(r=>r.subject==='chemistry'&&r.principal_unit===null).length,3);
  assert.equal(real.physics.reported_recurrent,75);assert.equal(real.physics.recomputed_recurrent,76);assert.equal(real.physics.family_count_conflict,true);
  assert.ok(real.diagnostics.every(d=>d.atlas_match&&d.unit_agreement&&d.answer_status==='WITHHELD'&&!d.official_paper_verified));
  for(const s of ['biology','chemistry','physics'])for(const set of ['A','B'])assert.equal(real.diagnostics.filter(d=>d.subject===s&&d.set===set).length,real.units[s].length);
  assert.equal(real.records.filter(r=>r.subject==='physics'&&r.exam_year>=2019).length,350);
});
test('real import rejects duplicate questions, omitted unclassified items and altered diagnostic identities',{skip:!real},()=>{
  const p=clone(real);p.records[1]=p.records[0];assert.throws(()=>M.validatePackage(p),/duplicate/);
  const q=clone(real);q.records=q.records.filter(r=>r.classification_status!=='UNCLASSIFIED');assert.throws(()=>M.validatePackage(q),/denominator/);
  const d=clone(real);d.diagnostics[0].question_number=50;assert.throws(()=>M.validatePackage(d),/identity/);
});
async function fixture({share=false,raw=null,denied=false}={}) {
 const elements=new Map(),writes=[],reads=[],downloads=[],events={};
 const el=id=>{if(!elements.has(id))elements.set(id,{value:['subject','sessionSubject'].includes(id)?'biology':id==='set'?'A':id==='bioVersion'?'candidate':['unit','year','evidence'].includes(id)?'all':'',checked:false,hidden:false,disabled:false,textContent:'',innerHTML:'',href:'https://example.test/index.html',listeners:{},files:[],dataset:{},addEventListener(n,f){this.listeners[n]=f;},setAttribute(){},appendChild(o){this.value=o.value;},scrollIntoView(){},focus(){},click(){downloads.push(this.download);}});return elements.get(id);};
 const c=vm.createContext({URL,URLSearchParams,Intl,Date,Blob,Map,Set,JSON,setTimeout,crypto:webcrypto,
 location:{href:'https://example.test/science-intelligence/'+(share?'?share=1':''),search:share?'?share=1':''},
 history:{replaceState(){}},localStorage:{getItem(k){reads.push(k);if(denied)throw Error('denied');return k===M.KEY?raw:null;},setItem(k,v){if(denied)throw Error('quota');writes.push({k,v});raw=v;}},
 document:{body:{classList:{toggle(){}}},getElementById:el,querySelectorAll(){return [];},createElement(){return el('created-'+Math.random());},addEventListener(n,f){events[n]=f;}},
 window:{addEventListener(){},print(){}}});
 vm.runInContext(read('model.js'),c);vm.runInContext(read('app.js'),c);
 return {el,writes,reads,c,downloads};
}
test('share entry never reads private browser state or generates records',async()=>{
 const f=await fixture({share:true,denied:true});assert.equal(f.reads.length,0);assert.equal(f.writes.length,0);assert.equal(f.el('items').innerHTML,'');
});
test('unreadable session bytes block changes and remain exportable',async()=>{
 const f=await fixture({raw:'{broken'});assert.match(f.el('status').textContent,/preserved/);
 f.el('settings').listeners.click();await new Promise(r=>setImmediate(r));
 assert.equal(f.writes.length,0);assert.match(f.el('status').textContent,/Export unreadable/);
});
test('import preview creates no scores; real corpus initializes and an actual marked submit persists once',{skip:!real},async()=>{
 const f=await fixture();
 await f.el('packageFile').listeners.change({target:{files:[{size:1,text:async()=>JSON.stringify(real)}]}});
 assert.equal(f.writes.length,0);assert.match(f.el('previewText').textContent,/1910 references/);
 await f.el('confirmImport').listeners.click();assert.match(f.el('resultCount').textContent,/350 references/);
 await f.el('start').listeners.click();assert.equal(JSON.parse(f.writes.at(-1).v).records.length,0);
 for(const [k,v] of Object.entries({target:'biology:2024:I:1:',date:'2026-10-14',earned:'0',total:'1',minutes:'2',guesses:'0',role:'baseline',markingSource:'Original scheme p1'}))f.el(k).value=v;
 await f.el('evidenceForm').listeners.submit({preventDefault(){}});
 assert.equal(f.writes.length,2);assert.equal(JSON.parse(f.writes.at(-1).v).records[0].earned,0);
 f.el('share').listeners.click();assert.equal(f.el('history').innerHTML,'');assert.equal(f.el('target').innerHTML,'');
 f.el('share').listeners.click();assert.match(f.el('history').innerHTML,/submitted local evidence/);
});
test('resuming and closing a plan changes only planning state, and stage timers create no evidence',{skip:!real},async()=>{
 const f=await fixture();await f.el('packageFile').listeners.change({target:{files:[{size:1,text:async()=>JSON.stringify(real)}]}});await f.el('confirmImport').listeners.click();await f.el('start').listeners.click();
 const first=JSON.parse(f.writes.at(-1).v).sessions[0].id;await f.el('advance').listeners.click();f.el('clockToggle').listeners.click();assert.equal(JSON.parse(f.writes.at(-1).v).records.length,0);
 await f.el('start').listeners.click();f.el('resumeSession').value=first;f.el('resumeSession').listeners.change();assert.match(f.el('sessionState').innerHTML,/Phase 2/);
 await f.el('finishSession').listeners.click();const p=JSON.parse(f.writes.at(-1).v);assert.equal(p.sessions.find(s=>s.id===first).closed,true);assert.equal(p.records.length,0);assert.equal(f.el('submitEvidence').disabled,true);
});
