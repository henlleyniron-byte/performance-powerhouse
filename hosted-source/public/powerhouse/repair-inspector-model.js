/* Explain linked evidence without changing the authoritative verification rules. */
(function(root){
  'use strict';
  function inspect(chain,attempts,today){
    const E=root.PowerhouseVerification,byId=new Map(attempts.map(a=>[a.id,a]));
    const source=byId.get(chain.originalId),repeat=byId.get(chain.reattemptId),transfer=byId.get(chain.transferId),delayed=byId.get(chain.delayedId);
    const row=(id,title,record,problems,detail='')=>({id,title,record:record?{id:record.id,question:record.question||'',date:record.date||'',subject:record.subject||'',earned:record.earned,total:record.total}:null,passed:!problems.length,problems,detail});
    const sourceProblems=[];
    if(!source)sourceProblems.push('No original marked attempt is present in this ledger.');
    else{if(!E.validDate(source.date)||source.date>today)sourceProblems.push('The original needs a valid completion date no later than today.');if(!E.reference(source.question))sourceProblems.push('The original needs its actual question reference.');}
    function evidence(a,previous,earlier,fresh,minDays){
      const problems=[];
      if(!a)return ['No marked check is linked.'];
      if(!source)problems.push('Restore the original attempt before trusting this check.');
      if(a.id===source?.id||earlier.some(b=>b?.id===a.id))problems.push('This check reuses an earlier attempt ID.');
      if(!E.validDate(a.date)||a.date>today)problems.push('Use a real completion date no later than today.');
      if(!E.reference(a.question))problems.push('An actual question reference is missing.');
      if(a.subject!==source?.subject)problems.push('The subject differs from the original.');
      if(!Number.isFinite(a.total)||a.total<=0||!Number.isFinite(a.earned)||a.earned!==a.total)problems.push('Full honestly marked credit is not recorded for this check.');
      if(a.unaided!==true)problems.push('Closed-book, unaided completion is not confirmed.');
      if(a.guesses!=null&&a.guesses!==0)problems.push('Guessed or unsupported items remain.');
      if(a.error)problems.push('A dominant error remains recorded.');
      if(a.tags!=null&&(!Array.isArray(a.tags)||a.tags.length))problems.push('Unresolved error tags remain.');
      if(a.trustedEarned!=null&&a.trustedEarned!==a.total)problems.push('Audited marks expose unsupported or lost credit.');
      if(!previous||E.days(previous.date,a.date)<minDays)problems.push(minDays===7?'The delayed check must be at least seven full days after the linked transfer.':'The check cannot precede its prerequisite attempt.');
      if(fresh){if(a.novelQuestion!==true)problems.push('A genuinely different question is not confirmed.');if([source,...earlier].some(b=>b&&E.reference(b.question)===E.reference(a.question)))problems.push('The normalized question reference repeats an earlier reference.');}
      return problems;
    }
    const due=transfer&&E.validDate(transfer.date)?new Date(Date.parse(transfer.date+'T00:00:00Z')+7*86400000).toISOString().slice(0,10):null;
    const diagnosis=[];if(!chain.skill?.trim())diagnosis.push('Name the chosen weakness.');if(!chain.diagnosis?.trim())diagnosis.push('Explain the first cause of the mark loss.');
    const repair=[];if(!chain.repair?.trim())repair.push('Describe the smallest targeted repair.');if(!chain.markingSource?.trim())repair.push('Identify the verified scheme or marking source.');if(chain.keyHold)repair.push('The marking key is explicitly on hold. Resolve the source dispute first.');
    const steps=[row('source','Original marked attempt',source,sourceProblems),row('diagnosis','Chosen weakness and diagnosis',null,diagnosis,chain.diagnosis||''),row('repair','Targeted repair and source',null,repair,[chain.repair,chain.markingSource].filter(Boolean).join(' · ')),row('reattempt','Closed-book reattempt',repeat,evidence(repeat,source,[],false,0)),row('transfer','Fresh transfer',transfer,evidence(transfer,repeat,[repeat],true,0)),row('delayed','Delayed independent check',delayed,evidence(delayed,transfer,[repeat,transfer],true,7),due?`Earliest delayed check: ${due}${due>today?' · still waiting':''}`:''),row('scope','Human check of the evidence scope',null,chain.confirmSkill?[]:['Confirm that every linked check assessed this chosen weakness.'])];
    const assessment=E.assess(chain,attempts,today);
    if(assessment.reopenedBy)steps.push(row('reopened','Later linked failure that reopened this weakness',byId.get(assessment.reopenedBy),['This later independent linked result failed a recorded check. Repair it before replacing the earlier links.']));
    return {assessment,steps,due,skill:chain.skill||source?.question||'Chosen weakness'};
  }
  root.PowerhouseRepairInspector=Object.freeze({inspect});
})(globalThis);
