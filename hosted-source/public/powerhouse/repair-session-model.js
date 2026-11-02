/* Read-only work briefs. The verifier remains the sole authority for evidence stages. */
(function(root){
  'use strict';
  const guidance={
    'missing-source':{title:'Recover the original evidence',field:'',steps:['Open Data & backup and inspect the recoverable original.','Restore a valid dated source with its actual question reference before assessing this chain.']},
    diagnose:{title:'Name the first cause of this lost mark',field:'diagnosis',steps:['Compare the actual response with the verified marking source.','Name one chosen weakness and explain the first incorrect or missing step.','Save the diagnosis in the existing verification desk.']},
    repair:{title:'Make one targeted repair',field:'repair',steps:['Use the actual marking scheme or verified source to resolve the named weakness.','Record the smallest useful repair and the exact source reference.','Close these notes before a separate unaided reattempt.']},
    hold:{title:'Resolve the marking-source hold',field:'markingSource',steps:['Compare the disputed point against a reliable marking source.','Keep the key on hold until the discrepancy is resolved.','Update the source and hold in the existing verification desk. No retention credit is given while held.']},
    reattempt:{title:'Complete a closed-book reattempt',field:'reattemptId',type:'reattempt',steps:['Put the repair notes, model answers and AI away.','Attempt the relevant question or honestly bounded subset without help.','Mark strictly; log the real result, guesses and unaided conditions.','Return to this exact chain and select the completed reattempt.']},
    transfer:{title:'Test the repair on a fresh question',field:'transferId',type:'fresh-transfer',steps:['Choose a materially different question testing this chosen weakness. A changed label alone is insufficient.','Attempt without notes, model answers or AI.','Mark strictly and log the actual result. Confirm freshness only if it was genuinely unseen.','Return to this exact chain and select the completed transfer.']},
    delayed:{title:'Check the weakness after the delay',field:'delayedId',type:'delayed-retest',steps:['Wait until at least seven full days after the linked transfer.','Choose another materially different unseen question; keep earlier answers closed.','Attempt unaided, mark strictly and record the actual result.','Return to this exact chain and select the delayed check. A failed check stays open.']},
    scope:{title:'Inspect what the linked checks actually tested',field:'confirmSkill',steps:['Inspect each linked marked response against the chosen weakness.','Do not infer scope from a similar question reference or a full-paper score.','Confirm the evidence scope in the existing desk only if every selected check assessed this weakness.']},
    retained:{title:'Keep the evidence available',field:'',steps:['This chain supports only the chosen weakness and remains self-reported.','A later explicitly linked independent failure can reopen it. Use Reopen for other failures; keep earlier evidence.']}
  };
  function focus(rows,subject='all'){
    const scoped=rows.filter(row=>subject==='all'||row.subject===subject);
    return {rows:scoped,next:scoped.find(row=>!['waiting','retained'].includes(row.group))||null,waiting:scoped.filter(row=>row.group==='waiting'),elsewhere:rows.some(row=>(subject!=='all'&&row.subject!==subject)&&!['waiting','retained'].includes(row.group))};
  }
  function plan(id,attempts,records,today){
    const E=root.PowerhouseVerification;
    if(!E.validDate(today))throw Error('A valid review date is required.');
    const source=attempts.find(attempt=>attempt.id===id),chain=records[id]||{originalId:id};
    const assessment=E.assess(chain,attempts,today),guide=guidance[assessment.stage]||guidance['missing-source'];
    const transfer=attempts.find(attempt=>attempt.id===chain.transferId);
    const due=assessment.stage==='delayed'&&E.validDate(transfer?.date)?new Date(Date.parse(transfer.date+'T00:00:00Z')+7*86400000).toISOString().slice(0,10):null;
    const waiting=Boolean(due&&due>today);
    const checks=['reattemptId','transferId','delayedId'].flatMap(field=>{const a=attempts.find(attempt=>attempt.id===chain[field]);return a?[{field,id:a.id,reference:a.question,date:a.date,earned:a.earned,total:a.total}]:[];});
    return {id,stage:assessment.stage,label:assessment.label,title:waiting?'Keep the delayed check scheduled':guide.title,next:assessment.next,subject:source?.subject||'unknown',reference:source?.question||'Original attempt unavailable',sourceDate:source?.date||'',score:source?`${source.earned} / ${source.total}`:'Unavailable',skill:chain.skill||source?.question||'Chosen weakness',due,waiting,field:guide.field,type:waiting?null:guide.type||null,steps:waiting?[`Return on or after ${due}. The scheduled delay cannot be shortened.`,`Keep the earlier answers closed. Choose another bounded question while this check waits.`]:guide.steps.slice(),checks,reopenedBy:assessment.reopenedBy||null};
  }
  function brief(plan,today){
    return ['# Powerhouse private work brief',`Prepared ${today} · a suggestion, not evidence of completion`,'Keep this file private. Browser-local core evidence only.','',`Chosen weakness: ${plan.skill}`,`Subject: ${plan.subject}`,`Original: ${plan.reference} · ${plan.sourceDate} · ${plan.score}`,`Source attempt ID: ${plan.id}`,`Current recorded stage: ${plan.label}`,plan.due?`Earliest delayed check: ${plan.due}`:'',plan.reopenedBy?`Reopened by later failed check: ${plan.reopenedBy}`:'','',`## ${plan.title}`,...plan.steps.map((step,index)=>`${index+1}. ${step}`),'','## Existing linked checks',...(plan.checks.length?plan.checks.map(check=>`${check.field}: ${check.reference} · ${check.date} · ${check.earned} / ${check.total} · ID ${check.id}`):['No subsequent marked checks linked.']),'','The brief does not save marks, start a timer, complete a retest, award mastery or send anything to another site.','Mark the actual completed work, then return to the same verification chain to select its evidence.','Repair notes and answers are deliberately excluded from this work brief.'].filter(line=>line!==undefined).join('\n');
  }
  root.PowerhouseRepairSession=Object.freeze({focus,plan,brief});
})(globalThis);
