/* A read-only projection of the original attempt and verification ledgers. */
(function(root){
  'use strict';
  const subjects=['biology','chemistry','physics'];
  function build(attempts,records,today,assess){
    if(!Array.isArray(attempts)||!records||typeof records!=='object'||Array.isArray(records)||Object.keys(records).length>20000)throw Error('The verification ledger needs recovery before this board can be trusted.');
    const byId=new Map(attempts.map(a=>[a.id,a]));
    const rows=[];
    for(const [id,chain] of Object.entries(records)){
      if(!chain||chain.originalId!==id||['skill','diagnosis','repair','markingSource','reattemptId','transferId','delayedId'].some(k=>chain[k]!==undefined&&typeof chain[k]!=='string'))throw Error('The verification ledger contains an unreadable chain. Use its recovery controls.');
      const source=byId.get(id),assessment=assess(chain,attempts,today);
      const transfer=byId.get(chain.transferId);
      const due=assessment.stage==='delayed'&&transfer?root.PowerhouseReview.shift(transfer.date,7):null;
      const waiting=Boolean(due&&due>today);
      const group=assessment.stage==='retained'?'retained':waiting?'waiting':assessment.stage==='delayed'?'due':assessment.stage==='hold'?'hold':'repair';
      rows.push({id,subject:source?.subject||'unknown',title:chain.skill?.trim()||source?.question||'Source attempt unavailable',reference:source?.question||'Restore the original marked attempt',date:source?.date||'',score:source?`${source.earned} / ${source.total}`:'Unavailable',stage:assessment.stage,group,due,label:waiting?'Delayed check scheduled':assessment.label,next:waiting?`Return on or after ${due}. Keep the earlier answers closed and choose a fresh question.`:assessment.next,linked:true});
    }
    for(const a of attempts){
      if(Object.hasOwn(records,a.id)||!(a.earned<a.total||Number(a.guesses)>0||a.error))continue;
      rows.push({id:a.id,subject:a.subject,title:a.question,reference:a.question,date:a.date,score:`${a.earned} / ${a.total}`,stage:'unlinked',group:'unlinked',due:null,label:'No verification chain linked',next:'Inspect this marked attempt, name one weakness and link its actual repair checks. A missing chain does not prove the work is unrepaired.',linked:false});
    }
    const order={due:0,hold:1,repair:2,unlinked:3,waiting:4,retained:5};
    return rows.sort((a,b)=>order[a.group]-order[b.group]||(a.due||a.date).localeCompare(b.due||b.date)||a.id.localeCompare(b.id));
  }
  function filter(rows,{query='',subject='all',group='active'}={}){
    const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return rows.filter(r=>(subject==='all'||r.subject===subject)&&(group==='all'||(group==='active'?!['waiting','retained'].includes(r.group):r.group===group))&&words.every(w=>`${r.title} ${r.reference} ${r.label} ${r.next}`.toLowerCase().includes(w)));
  }
  function brief(rows,today){return ['# Powerhouse private repair brief',`As of ${today} · browser-local core evidence only`,'Self-reported records; no external reminders or mastery certification.','Keep this file private. It may contain question references and personal diagnoses.','',...rows.flatMap((r,i)=>[`${i+1}. ${r.title}`,`Subject: ${r.subject} · Original marks: ${r.score} · ${r.date}`,`Source: ${r.reference}`,`Status: ${r.label}${r.due?' · earliest delayed check '+r.due:''}`,`Next: ${r.next}`,''])].join('\n');}
  root.PowerhouseRepairBoard=Object.freeze({subjects,build,filter,brief});
})(globalThis);
