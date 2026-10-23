(function(root){
 const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
 const fullPass=a=>!!a&&a.unaided===true&&Number(a.total)>0&&Number(a.earned)===Number(a.total)&&Number(a.guesses||0)===0;
 const days=(a,b)=>validDate(a)&&validDate(b)?(Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000:-1;
 function assess(c,attempts,today){
  const original=attempts.find(a=>a.id===c?.originalId);
  if(!original)return {stage:'missing-source',label:'Original attempt is unavailable',next:'Restore the source attempt before trusting this chain.'};
  if(!c.skill?.trim()||!c.diagnosis?.trim())return {stage:'diagnose',label:'Diagnosis needed',next:'Name the chosen weakness and why the mark was lost.'};
  if(!c.repair?.trim()||!c.markingSource?.trim())return {stage:'repair',label:'Targeted repair needed',next:'Record the smallest repair and the verified marking source.'};
  if(c.keyHold)return {stage:'hold',label:'Marking key on verification hold',next:'Verify the source key before counting any repair as retained.'};
  const re=attempts.find(a=>a.id===c.reattemptId),tr=attempts.find(a=>a.id===c.transferId),de=attempts.find(a=>a.id===c.delayedId);
  const good=a=>fullPass(a)&&validDate(a.date)&&a.date<=today&&a.subject===original.subject&&a.id!==original.id;
  if(!good(re)||days(original.date,re?.date)<0)return {stage:'reattempt',label:'Independent reattempt needed',next:'Log a correctly marked unaided check of the chosen skill, with no guessed items.'};
  if(!good(tr)||tr.id===re.id||tr.novelQuestion!==true||days(re.date,tr.date)<0)return {stage:'transfer',label:'Fresh transfer needed',next:'Log a different unseen check and identify why it tests the same chosen weakness.'};
  if(!good(de)||[re.id,tr.id].includes(de.id)||de.novelQuestion!==true||days(tr.date,de.date)<7)return {stage:'delayed',label:'Delayed check needed',next:'Return at least seven days after transfer for a different independent unseen check.'};
  if(!c.confirmSkill)return {stage:'scope',label:'Check the evidence scope',next:'Confirm that each selected check actually assessed this chosen weakness.'};
  return {stage:'retained',label:'Chosen weakness retained — self-reported',next:'This is evidence for the chosen weakness, not proof of whole-topic mastery. Reopen if a later check fails.'};
 }
 function validate(c,attempts,today){
  if(!c||typeof c!=='object'||Array.isArray(c))throw Error('Invalid chain.');
  const clean={};for(const k of ['originalId','skill','diagnosis','repair','markingSource','reattemptId','transferId','delayedId']){if(c[k]!==undefined&&typeof c[k]!=='string')throw Error('Invalid field.');clean[k]=String(c[k]||'').slice(0,k.endsWith('Id')?100:1500);}
  clean.confirmSkill=c.confirmSkill===true;clean.keyHold=c.keyHold===true;
  if(!attempts.some(a=>a.id===clean.originalId))throw Error('Choose an existing original attempt.');
  for(const k of ['reattemptId','transferId','delayedId'])if(clean[k]&&!attempts.some(a=>a.id===clean[k]))throw Error('A selected check is not in the current attempt ledger.');
  return clean;
 }
 root.PowerhouseVerification=Object.freeze({assess,validate,fullPass,validDate,days});
})(globalThis);
