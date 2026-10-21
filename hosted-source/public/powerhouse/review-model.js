(function(root){
  'use strict';
  const subjects=['biology','chemistry','physics'];
  const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
  const shift=(day,days)=>new Date(Date.parse(day+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
  function normalize(value,today){
    if(!validDate(today)||!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.attempts)||!Array.isArray(value.retests)||!value.ratings||typeof value.ratings!=='object')throw Error('Choose a core Powerhouse JSON backup, exported from Data & backup.');
    if(value.attempts.length>50000||value.retests.length>100000)throw Error('Backup is too large.');
    const ids=new Set();
    const attempts=value.attempts.map(a=>{
      if(!a||typeof a.id!=='string'||!a.id||ids.has(a.id)||!subjects.includes(a.subject)||!validDate(a.date)||a.date>today||typeof a.question!=='string'||!a.question.trim()||typeof a.earned!=='number'||!Number.isFinite(a.earned)||typeof a.total!=='number'||!Number.isFinite(a.total)||a.total<=0||a.earned<0||a.earned>a.total)throw Error('The backup contains an invalid, duplicate or future attempt. Existing data was kept.');
      if(a.trustedEarned!=null&&a.trustedEarned!==''&&(typeof a.trustedEarned!=='number'||!Number.isFinite(a.trustedEarned)||a.trustedEarned<0||a.trustedEarned>a.earned))throw Error('Invalid audited marks.');
      ids.add(a.id);return {id:a.id,subject:a.subject,date:a.date,earned:a.earned,total:a.total,trustedEarned:a.trustedEarned===''?null:a.trustedEarned??null,error:typeof a.error==='string'?a.error.slice(0,5):'',type:typeof a.type==='string'?a.type:'topic-question'};
    });
    const retests=value.retests.map(r=>{if(!r||!validDate(r.due)||![1,2].includes(r.stage))throw Error('Invalid scheduled check.');if(r.completedAt&&(typeof r.completedAt!=='string'||!validDate(r.completedAt.slice(0,10))||r.completedAt.slice(0,10)>today))throw Error('Invalid completion date on a scheduled check.');return {sourceAttemptId:typeof r.sourceAttemptId==='string'?r.sourceAttemptId:'',stage:r.stage,due:r.due,completed:Boolean(r.completedAt)};});
    const exportedAt=typeof value.lastExportedAt==='string'&&Number.isFinite(Date.parse(value.lastExportedAt))?value.lastExportedAt:null;
    return {attempts,retests,exportedAt};
  }
  function summarize(data,today,days=7,subject='all'){
    if(!validDate(today)||![7,30].includes(days)||!['all',...subjects].includes(subject))throw Error('Invalid review range.');
    const start=shift(today,1-days),rows=data.attempts.filter(a=>a.date>=start&&a.date<=today&&(subject==='all'||a.subject===subject));
    const aggregate=list=>({count:list.length,earned:list.reduce((n,a)=>n+a.earned,0),total:list.reduce((n,a)=>n+a.total,0),audited:list.filter(a=>a.trustedEarned!==null).length,trusted:list.filter(a=>a.trustedEarned!==null).reduce((n,a)=>n+a.trustedEarned,0),auditedTotal:list.filter(a=>a.trustedEarned!==null).reduce((n,a)=>n+a.total,0)});
    const byId=new Map(data.attempts.map(a=>[a.id,a]));
    const due=data.retests.filter(r=>!r.completed&&r.due<=today&&byId.has(r.sourceAttemptId)&&(subject==='all'||byId.get(r.sourceAttemptId).subject===subject)&&(r.stage===1||data.retests.some(other=>other.sourceAttemptId===r.sourceAttemptId&&other.stage===1&&other.completed)));
    const errors={};for(const a of rows)if(a.error)errors[a.error]=(errors[a.error]||0)+a.total-a.earned;
    return {start,end:today,days,subject,...aggregate(rows),daysWithEvidence:new Set(rows.map(a=>a.date)).size,due:due.length,bySubject:Object.fromEntries(subjects.map(s=>[s,aggregate(rows.filter(a=>a.subject===s))])),errors:Object.entries(errors).filter(([,lost])=>lost>0).sort((a,b)=>b[1]-a[1]),lastAttempt:data.attempts.map(a=>a.date).sort().at(-1)||null};
  }
  function compact(value,today){const data=normalize(value,today);return {schema:'command-evidence-summary-v1',asOf:today,exportedAt:data.exportedAt,seven:summarize(data,today,7),thirty:summarize(data,today,30)};}
  function validateCompact(value){
    if(!value||value.schema!=='command-evidence-summary-v1'||!validDate(value.asOf))throw Error('Unreadable summary.');
    const clean={schema:value.schema,asOf:value.asOf,exportedAt:typeof value.exportedAt==='string'&&Number.isFinite(Date.parse(value.exportedAt))?value.exportedAt:null};
    const stats=b=>{if(!b||!Number.isSafeInteger(b.count)||b.count<0||!Number.isFinite(b.earned)||!Number.isFinite(b.total)||b.earned<0||b.earned>b.total||!Number.isSafeInteger(b.audited)||b.audited<0||b.audited>b.count||!Number.isFinite(b.trusted)||b.trusted<0||!Number.isFinite(b.auditedTotal)||b.auditedTotal<0||b.trusted>b.auditedTotal||b.trusted>b.earned||b.auditedTotal>b.total||b.count===0&&b.total!==0||b.count>0&&b.total===0||b.audited===0&&b.auditedTotal!==0)throw Error('Invalid aggregate marks.');return {count:b.count,earned:b.earned,total:b.total,audited:b.audited,trusted:b.trusted,auditedTotal:b.auditedTotal};};
    for(const key of ['seven','thirty']){const s=value[key],days=key==='seven'?7:30;if(!s||s.days!==days||s.start!==shift(value.asOf,1-days)||s.end!==value.asOf||!Number.isSafeInteger(s.due)||s.due<0)throw Error('Invalid summary date range.');const bySubject=Object.fromEntries(subjects.map(sub=>[sub,stats(s.bySubject?.[sub])])),aggregate=stats(s);for(const field of ['count','earned','total','audited','trusted','auditedTotal']){const sum=subjects.reduce((n,sub)=>n+bySubject[sub][field],0);if(Math.abs(sum-aggregate[field])>0.000001)throw Error('Subject totals do not match the summary.');}clean[key]={start:s.start,end:s.end,days,subject:'all',...aggregate,due:s.due,bySubject};}
    return clean;
  }
  root.PowerhouseReview=Object.freeze({subjects,validDate,shift,normalize,summarize,compact,validateCompact});
})(globalThis);
