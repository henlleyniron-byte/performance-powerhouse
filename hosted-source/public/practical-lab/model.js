/* Additive practical evidence; no writes to the core paper ledger. */
(function(root){
'use strict';
const KEY='performance_powerhouse_practical_lab_v3',SCHEMA='powerhouse-practical-progress-v1';
const COUNTS={biology:38,chemistry:45,physics:43},ERRORS={concept:'Scientific concepts',measurement:'Measurements and units',calculation:'Calculations or graphs',interpretation:'Evidence interpretation',recall:'Recall',source:'Unsupported conclusions or source discrepancies'};
const fail=m=>{throw Error(m)},object=v=>v&&typeof v==='object'&&!Array.isArray(v),text=(v,max=6000)=>typeof v==='string'&&v.length<=max;
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const date=v=>root.PowerhouseVerification.validDate(v)&&v<=day();
const stamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=Date.now()+60000;
function catalog(c){
 if(!object(c)||c.schema_version!=='1.0.0'||c.release!=='2026-10-15-v3'||c.official_publisher!==false||c.not_lab_completion_evidence!==true||!Array.isArray(c.activities)||c.activities.length!==126)fail('Invalid V3 catalog metadata. Reconnect or restore the verified catalog.');
 const ids=new Set(),counts={biology:0,chemistry:0,physics:0};
 for(const a of c.activities){
  if(!object(a)||!Object.hasOwn(COUNTS,a.subject)||!/^((bio|che|phy)-(\d{3}|\d{1,2}-\d))$/.test(a.id)||ids.has(a.id)||!text(a.nie_number,10)||!Number.isInteger(a.nie_print_page)||a.nie_print_page<1)fail('Invalid or duplicate activity reference.');
  if(!a.id.startsWith({biology:'bio-',chemistry:'che-',physics:'phy-'}[a.subject]))fail('Activity subject mismatch.');
  for(const k of ['title','principle','record_guidance','analysis_guidance','common_error','recall_question','recall_answer'])if(!text(a[k])||!a[k].trim())fail('Incomplete activity: '+a.id);
  const url=new URL(a.handbook_url);if(url.protocol!=='https:'||url.hostname!=='nie.lk'||a.handbook_url!==c.source_handbooks[a.subject])fail('Unverified handbook URL.');
  if(a.review_status!=='independently_prepared_not_teacher_verified'||a.lab_procedure_included!==false||!Array.isArray(a.observation_columns)||a.observation_columns.length!==4||a.observation_columns.some(x=>!text(x,300)||!x.trim()))fail('Invalid review/safety metadata.');
  counts[a.subject]++;ids.add(a.id);
 }
 for(const s of Object.keys(COUNTS)){
  if(counts[s]!==COUNTS[s]||c.counts[s]!==COUNTS[s])fail('Wrong subject count.');
  const expected=s==='physics'?[...Array.from({length:20},(_,i)=>String(i+1)),'21.1','21.2',...Array.from({length:21},(_,i)=>String(i+22))]:Array.from({length:COUNTS[s]},(_,i)=>String(i+1));
  const actual=c.activities.filter(a=>a.subject===s).map(a=>a.nie_number);
  if(JSON.stringify(actual)!==JSON.stringify(expected))fail('NIE numbering mismatch: '+s);
 }
 if(c.counts.total!==126)fail('Wrong total.');return c;
}
const blank=c=>({schema:SCHEMA,version:1,catalogRelease:c.release,records:{}});
const adapter=(a,subject)=>({...a,subject,earned:a.score,total:3,guesses:a.guessed?1:0});
function assess(r,c,today=day()){
 const attempts=r.attempts.map(a=>adapter(a,r.subject));
 return root.PowerhouseVerification.assess(c,attempts,today);
}
function validate(p,c){
 if(!object(p)||p.schema!==SCHEMA||p.version!==1||p.catalogRelease!==c.release||!object(p.records)||Object.keys(p.records).length>126)fail('Unsupported practical backup.');
 const allIds=new Set(),lookup=new Map(c.activities.map(a=>[a.id,a]));
 for(const [id,r] of Object.entries(p.records)){
  const a=lookup.get(id);if(!a||!object(r)||r.activityId!==id||r.subject!==a.subject||!['','T','D','P'].includes(r.mode)||!text(r.notes)||!Array.isArray(r.attempts)||r.attempts.length>200||!object(r.chains))fail('Invalid progress record: '+id);
  if(r.mode==='P'&&(!date(r.performedDate)||r.performanceConfirmed!==true))fail('Performed mode requires a real date and deliberate confirmation.');
  if(r.mode!=='P'&&(r.performedDate||r.performanceConfirmed))fail('Performance metadata conflicts with evidence mode.');
  if(r.mode==='D'&&(!text(r.dataSource,500)||!r.dataSource.trim()))fail('Identify the teacher-provided dataset.');
  if(!text(r.dataSource||'',500))fail('Invalid data source.');
  if(r.draft!==undefined&&(!object(r.draft)||!text(r.draft.answer)||!text(r.draft.question)||!['original','reattempt','transfer','delayed'].includes(r.draft.stage)||!text(r.draft.chainId,100)))fail('Invalid unfinished response.');
  for(const t of r.attempts){
   if(!object(t)||!text(t.id,100)||!/^pl-[\w-]+$/.test(t.id)||allIds.has(t.id)||t.activityId!==id||!date(t.date)||!stamp(t.at)||!text(t.answer)||!t.answer.trim()||!text(t.question)||!t.question.trim()||!['original','reattempt','transfer','delayed'].includes(t.stage)||!Array.isArray(t.criteria)||t.criteria.length!==3||t.criteria.some(x=>typeof x!=='boolean')||t.score!==t.criteria.filter(Boolean).length||typeof t.unaided!=='boolean'||typeof t.novelQuestion!=='boolean'||typeof t.guessed!=='boolean'||!['none',...Object.keys(ERRORS)].includes(t.errorFamily)||!text(t.chainId,100))fail('Invalid marked practical attempt.');
   if(t.markingSource!==undefined&&(!text(t.markingSource,1500)||!t.markingSource.trim()))fail('Invalid marking source.');
   if(t.score<3&&t.errorFamily==='none')fail('Diagnose the lost marks.');allIds.add(t.id);
  }
  if(Object.keys(r.chains).length>200)fail('Too many repair chains.');
  for(const [chainId,chain] of Object.entries(r.chains)){
   const original=r.attempts.find(t=>t.id===chainId);if(!original||original.stage!=='original'||chain.originalId!==chainId||original.chainId!==chainId)fail('Original error link mismatch.');
   const clean=root.PowerhouseVerification.validate(chain,r.attempts.map(t=>adapter(t,r.subject)),day());
   for(const k of ['originalId','skill','diagnosis','repair','markingSource','reattemptId','transferId','delayedId','confirmSkill','keyHold'])if(clean[k]!==chain[k])fail('Invalid repair field.');
   for(const [key,stage] of [['reattemptId','reattempt'],['transferId','transfer'],['delayedId','delayed']])if(chain[key]){
    const linked=r.attempts.find(t=>t.id===chain[key]);if(!linked||linked.activityId!==id||linked.chainId!==chainId||linked.stage!==stage)fail('Check belongs to another activity or error.');
   }
  }
  for(const t of r.attempts)if(t.chainId&&!r.chains[t.chainId])fail('Missing exact repair chain.');
 }
 if(JSON.stringify(p).length>3500000)fail('Practical history limit reached. Export before continuing.');return p;
}
function record(p,a){return p.records[a.id]||{activityId:a.id,subject:a.subject,mode:'',notes:'',dataSource:'',performedDate:'',performanceConfirmed:false,attempts:[],chains:{}};}
function queue(p,today=day()){
 const result=[];for(const r of Object.values(p.records))for(const c of Object.values(r.chains)){
  const assessment=assess(r,c,today);if(assessment.stage==='retained')continue;
  const transfer=r.attempts.find(t=>t.id===c.transferId);const due=transfer?new Date(Date.parse(transfer.date+'T00:00:00Z')+7*86400000).toISOString().slice(0,10):'';
  result.push({activityId:r.activityId,chainId:c.originalId,subject:r.subject,...assessment,due});
 }return result.sort((a,b)=>(a.stage==='delayed'&&a.due>today?1:0)-(b.stage==='delayed'&&b.due>today?1:0));
}
function addAttempt(p,c,id,input){
 validate(p,c);const next=JSON.parse(JSON.stringify(p)),a=c.activities.find(a=>a.id===id);if(!a)fail('Unknown activity.');
 const r=record(next,a),t={...input,activityId:id};
 if(t.stage==='original'){
  t.chainId=t.score<3||t.errorFamily!=='none'?t.id:'';
  if(t.chainId)r.chains[t.id]={originalId:t.id,skill:a.title,diagnosis:ERRORS[t.errorFamily]||'',repair:'',markingSource:'',reattemptId:'',transferId:'',delayedId:'',confirmSkill:false,keyHold:t.errorFamily==='source'};
 }else{
  const chain=r.chains[t.chainId];if(!chain)fail('Select the exact original error.');const current=assess(r,chain,t.date);
  if(current.stage!==t.stage)fail('Complete the current verification step first: '+current.label);
  if(!t.unaided||t.guessed)fail('A verification check must be unaided and have no guesses.');
  if(['transfer','delayed'].includes(t.stage)&&(!t.novelQuestion||r.attempts.some(x=>x.question.trim().toLowerCase()===t.question.trim().toLowerCase())))fail('Use a genuinely different unseen question for transfer/retest.');
  if(t.stage==='delayed'&&current.due>t.date)fail('The delayed check is not due.');
  if(t.stage==='delayed'){
   const tr=r.attempts.find(x=>x.id===chain.transferId);if(root.PowerhouseVerification.days(tr?.date,t.date)<7)fail('Wait at least seven days after transfer.');
  }
  // A failing check stays in history and cannot advance this exact chain.
  if(t.score===3)chain[{reattempt:'reattemptId',transfer:'transferId',delayed:'delayedId'}[t.stage]]=t.id;
 }
 r.attempts.push(t);delete r.draft;next.records[id]=r;return validate(next,c);
}
function store(storage,c){
 let raw=storage.getItem(KEY),value=raw===null?blank(c):validate(JSON.parse(raw),c);
 return {get:()=>JSON.parse(JSON.stringify(value)),raw:()=>raw,save(next){validate(next,c);if(storage.getItem(KEY)!==raw)fail('Another tab changed Practical Lab. Reload before saving.');const serial=JSON.stringify(next);if(raw!==null)storage.setItem(KEY+'_recovery',raw);storage.setItem(KEY,serial);raw=serial;value=JSON.parse(serial);return value;}};
}
function categories(a){const t=a.common_error.toLowerCase(),found=['concept'];for(const [k,re] of Object.entries({measurement:/unit|measur|zero|precision|reading|uncertain/,calculation:/calcul|graph|slope|proport|gradient|equation|formula/,interpretation:/evidence|observ|control|infer|indicat|interpret|correlat/,recall:/recall|remember|confus|identif|name/,source:/conclu|prove|assum|evidence|always|cannot|not necessarily/}))if(re.test(t))found.push(k);return found;}
const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function search(c,query,subject='all'){const q=normalize(query).trim();return c.activities.filter(a=>(subject==='all'||a.subject===subject)&&(!q||normalize([a.id,a.subject,a.nie_number,a.nie_print_page,a.title,a.principle,a.common_error,a.record_guidance,a.analysis_guidance,...categories(a).map(k=>ERRORS[k])].join(' ')).includes(q)));}
root.PowerhousePractical=Object.freeze({KEY,SCHEMA,COUNTS,ERRORS,day,catalog,blank,validate,record,assess,queue,addAttempt,store,search,categories});
})(globalThis);
