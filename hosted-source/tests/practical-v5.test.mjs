import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../public/powerhouse/verification.js';
import '../public/practical-lab/clinic/v5-content.js';
import '../public/practical-lab/clinic/model.js';
const read=f=>JSON.parse(fs.readFileSync(new URL('../public/practical-lab/'+f,import.meta.url)));
const c=read('practical-lab-catalog-v3.json'),b31=read('clinic/practical-lab-question-bank-v3_1.json'),b32=read('clinic/practical-lab-graph-clinic-v3_2.json'),b33=read('clinic/practical-lab-evidence-integrity-v3_3.json'),b5=read('clinic/practical-lab-v5.json'),M=PowerhouseClinic;
const b4=read('clinic/practical-lab-coverage-completion-v4_0.json');
const all=M.bank(b32,b31,c,b33,b5,b4),old=M.bank(b32,b31,c);
const attempt=(q,id='pc-v5-test',score=0)=>({id,date:M.day(),answer:'A disposable calculation with reasoning.',question:q.question,source:'Independent model key; review pending',unaided:true,novelQuestion:false,criteria:Array.from({length:q.total},(_,i)=>i<score),earned:score,total:q.total,tags:score===q.total?[]:['units'],stage:'original',chainId:''});
test('V5 reaches exactly every stable activity, including the two lens activities, with unique tasks',()=>{
 assert.equal(all.length,247);assert.equal(new Set(all.map(q=>q.id)).size,247);
 const fresh=all.filter(q=>q.edition==='V5');assert.equal(fresh.length,126);assert.equal(new Set(fresh.map(q=>q.question)).size,126);
 assert.deepEqual(new Set(fresh.flatMap(q=>q.refs)),new Set(c.activities.map(a=>a.id)));
 for(const [s,n]of Object.entries({biology:38,chemistry:45,physics:43}))assert.equal(fresh.filter(q=>q.subject===s).length,n);
 for(const id of ['phy-21-1','phy-21-2'])assert.equal(fresh.filter(q=>q.refs.includes(id)).length,1);
 assert.equal(all.reduce((n,q)=>n+q.total,0),1286);
});
test('reference corrections require an explicit ledger; page78 does not alter the original catalog page80',()=>{
 const original=c.activities.find(a=>a.id==='che-025'),q=all.find(q=>q.id==='PM5-C25');assert.equal(original.nie_print_page,80);assert.equal(q.nie_print_page,78);
 const bad=structuredClone(b5);bad.reference_corrections=[];assert.throws(()=>M.bank(b32,b31,c,b33,bad),/mapping/);
 bad.reference_corrections=structuredClone(b5.reference_corrections);bad.questions[0].activity_ids=['phy-001'];assert.throws(()=>M.bank(b32,b31,c,b33,bad));
});
test('effective errata fix rounding, resonance geometry and RQ without rewriting supplied banks',()=>{
 const q=all.find(q=>q.id==='PM-P03');assert.match(q.marks.join(' '),/9\.96/);assert.match(b31.questions.find(q=>q.id==='PM-P03').marks.join(' '),/9\.95/);
 const resonance=all.find(q=>q.id==='PM-P04');assert.equal(resonance.data[1][1],'0.17');assert.equal(resonance.data[2][1],'0.52');assert.match(resonance.marks.join(' '),/\+0\.005/);
 const rq=all.find(q=>q.id==='PM33-B01');assert.match(rq.marks.join(' '),/protein or mixed/);assert.doesNotMatch(rq.error,/Infering/);
});
test('an existing V3.2 owner backup preserves its exact attempts when opened with all247 questions',()=>{
 let p=M.add(M.blank(),old,old[0].id,attempt(old[0],'pc-old',2));const bytes=JSON.stringify(p);
 assert.equal(JSON.stringify(M.validate(JSON.parse(bytes),all)),bytes);
 const q=all.find(q=>q.edition==='V5');p=M.add(p,all,q.id,attempt(q,'pc-new',0));assert.deepEqual(p.records[old[0].id],JSON.parse(bytes).records[old[0].id]);assert.equal(p.records[q.id].attempts[0].earned,0);
});
test('V5 validates records for every question; viewing and saved drafts do not create marked attempts',()=>{
 const p=M.blank();p.drafts={};for(const q of all)p.drafts[q.id]={answer:'Unfinished reasoning',question:q.question,source:'',stage:'original',chainId:'',unaided:false,novelQuestion:false};
 M.validate(p,all);assert.equal(Object.keys(p.records).length,0);assert.equal(Object.keys(p.drafts).length,247);
 const bad=structuredClone(p);bad.drafts['unknown']={...bad.drafts[all[0].id]};assert.throws(()=>M.validate(bad,all));
 const q=all.find(q=>q.edition==='V5');const marked=M.add(p,all,q.id,attempt(q));assert.equal(marked.drafts[q.id],undefined);assert.equal(marked.records[q.id].attempts.length,1);
});
test('malformed V5 content cannot load partial coverage or impersonate teacher review',()=>{
 for(const mutate of [b=>b.questions.pop(),b=>b.questions[1].id=b.questions[0].id,b=>b.teacher_reviewed=true,b=>b.questions[0].data[1].pop(),b=>b.questions[0].marks.pop(),b=>b.questions[0].data_status='actual_observation']){
  const bad=structuredClone(b5);mutate(bad);assert.throws(()=>M.bank(b32,b31,c,b33,bad));
 }
});
test('all new shell/data references exist and books are linked without adding them to precache',()=>{
 const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');const html=fs.readFileSync(new URL('../public/practical-lab/clinic/index.html',import.meta.url),'utf8');
 assert.match(sw,/practical-v5-r1/);assert.match(sw,/v5-content\.js/);assert.match(sw,/practical-lab-v5\.json/);assert.doesNotMatch(sw,/downloads\/Practical_Mastery_V5_Complete\.pdf/);
 for(const file of ['Practical_Mastery_V5_Complete.pdf','Practical_Mastery_V5_Student_Workbook.pdf','Practical_Mastery_V5_Model_Answers.pdf'])assert.match(html,new RegExp(file.replaceAll('.','\\.')));
 assert.match(html,/V4 originals/);
});

test('all70 original V4 IDs survive normalization, including concave-lens21.2, without source mutation',()=>{
 const rows=all.filter(q=>q.edition==='V4.0');assert.equal(rows.length,70);assert.deepEqual(new Set(rows.map(q=>q.id)),new Set(b4.items.map(q=>q.id)));
 const q=rows.find(q=>q.id==='PM40-P21-2');assert.match(q.scenario,/single thin concave lens/);assert.match(q.marks.join(' '),/-26.7/);assert.match(b4.items.find(original=>original.id===q.id).scenario,/convex/);
 assert.match(rows.find(q=>q.id==='PM40-B18').marks.join(' '),/parenchyma can remain alive/);
 assert.match(rows.find(q=>q.id==='PM40-C41').marks.join(' '),/not.*common.ion|not simply/i);
});
test('V4 records round-trip in the same namespace; invalid marks, labels and data cannot load',()=>{
 const q=all.find(q=>q.edition==='V4.0');const p=M.add(M.blank(),all,q.id,attempt(q,'pc-v4-zero',0));assert.equal(M.validate(JSON.parse(JSON.stringify(p)),all).records[q.id].attempts[0].earned,0);
 for(const change of [b=>b.items.pop(),b=>b.items[0].labels=[],b=>b.items[0].marks.pop(),b=>b.items[0].table.rows[0].pop()]){const b=structuredClone(b4);change(b);assert.throws(()=>M.bank(b32,b31,c,b33,b5,b));}
});
