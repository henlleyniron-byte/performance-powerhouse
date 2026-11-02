(function(root){'use strict';
 function status(attempt,attempts,retests,chains,today,assess){
  const source=attempt.sourceAttemptId||attempt.id,chain=chains?.[source];
  if(chain&&assess){const result=assess(chain,attempts,today);const map={retained:'retained',transfer:'transfer',delayed:'waiting',reattempt:'reattempt',repair:'repair',diagnose:'repair',hold:'repair',scope:'repair'};return {kind:map[result.stage]||'repair',label:result.label,next:result.next,source};}
  const checks=retests.filter(row=>row.sourceAttemptId===source),open=checks.filter(row=>!row.completedAt),due=open.find(row=>row.due<=today&&(row.stage===1||checks.some(prior=>prior.stage===1&&prior.completedAt&&prior.completedAt<=today)));
  if(due)return {kind:'ready',label:due.stage===1?'Fresh transfer ready':'Delayed retest ready',next:'Inspect the source and perform an independent marked check; scheduling is not completion.',source};
  if(open.length)return {kind:'waiting',label:'Retest scheduled · eligibility pending',next:'Check the due date and preceding transfer evidence before claiming a result.',source};
  if(checks.some(row=>row.completedAt&&row.completedAt<=today))return {kind:'recorded',label:'Retest completion recorded',next:'Inspect its actual linked attempt. A completion date alone does not establish mastery.',source};
  if(attempt.error||Number(attempt.earned)<Number(attempt.total)||Number(attempt.guesses)>0)return {kind:'repair',label:'Diagnosis / repair evidence needed',next:'Review the scheme, name one weakness and link the independent follow-up.',source};
  return {kind:'recorded',label:'Marked attempt recorded',next:'This result describes this question, not whole-topic mastery.',source};
 }
 root.PowerhouseRecordReview={status};if(typeof module!=='undefined')module.exports=root.PowerhouseRecordReview;
})(globalThis);
