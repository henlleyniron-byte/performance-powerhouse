const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});for(const file of ['review-model.js','verification.js','repair-board-model.js','repair-session-model.js'])vm.runInContext(fs.readFileSync('public/powerhouse/'+file,'utf8'),ctx);
const M=ctx.PowerhouseRepairSession,B=ctx.PowerhouseRepairBoard,E=ctx.PowerhouseVerification;
const attempt=(id,date,earned=5)=>({id,date,earned,total:5,question:'2025 Synthetic '+id,subject:'biology',unaided:true,novelQuestion:true,guesses:0,error:''});
const attempts=[attempt('original','2026-10-01',2),attempt('repeat','2026-10-02'),attempt('transfer','2026-10-17')];
const chain={originalId:'original',skill:'One chosen weakness',diagnosis:'Secret diagnosis answer',repair:'Secret repair answer',markingSource:'Actual scheme Q4',reattemptId:'repeat',transferId:'transfer',confirmSkill:true};
test('a work brief keeps the exact source and respects seven full days without changing evidence',()=>{
 const before=JSON.stringify({attempts,chain}),waiting=M.plan('original',attempts,{original:chain},'2026-10-23');assert.equal(waiting.waiting,true);assert.equal(waiting.type,null);assert.equal(waiting.due,'2026-10-24');
 const due=M.plan('original',attempts,{original:chain},'2026-10-24');assert.equal(due.type,'delayed-retest');assert.equal(due.field,'delayedId');assert.equal(due.id,'original');assert.equal(JSON.stringify({attempts,chain}),before);
});
test('work briefs distinguish diagnosis, repair, source hold, reattempt, transfer and scope',()=>{
 const p=c=>M.plan('original',attempts,{original:c},'2026-10-24');assert.equal(p({originalId:'original'}).field,'diagnosis');assert.equal(p({...chain,repair:''}).field,'repair');assert.equal(p({...chain,keyHold:true}).type,null);assert.equal(p({...chain,keyHold:true}).field,'markingSource');
 assert.equal(p({...chain,reattemptId:''}).type,'reattempt');assert.equal(p({...chain,transferId:''}).type,'fresh-transfer');
 const delayed=attempt('delayed','2026-10-24');const scope=M.plan('original',[...attempts,delayed],{original:{...chain,delayedId:'delayed',confirmSkill:false}},'2026-10-24');assert.equal(scope.field,'confirmSkill');assert.equal(scope.type,null);
});
test('a focused subject cannot borrow another subject action or call a waiting check due',()=>{
 const rows=B.build([...attempts,{...attempt('physics','2026-10-02',1),subject:'physics'}],{original:chain},'2026-10-23',E.assess),bio=M.focus(rows,'biology');assert.equal(bio.next,null);assert.equal(bio.waiting.length,1);assert.equal(bio.elsewhere,true);assert.equal(M.focus(rows,'physics').next.id,'physics');assert.equal(M.focus(rows,'chemistry').rows.length,0);
});
test('private briefs include exact linked references and real marks but exclude repair answers and fake credit',()=>{
 const plan=M.plan('original',attempts,{original:chain},'2026-10-24'),brief=M.brief(plan,'2026-10-24');assert.match(brief,/Source attempt ID: original/);assert.match(brief,/2025 Synthetic transfer.*5 \/ 5.*ID transfer/);assert.match(brief,/does not save marks/);assert.match(brief,/not evidence of completion/);assert.doesNotMatch(brief,/Secret diagnosis answer|Secret repair answer/);
});
test('missing source gets recovery guidance and later failures keep the original exact chain',()=>{
 const missing=M.plan('original',[],{original:chain},'2026-10-24');assert.equal(missing.stage,'missing-source');assert.equal(missing.type,null);
 const delayed=attempt('delayed','2026-10-24'),failure={...attempt('failed','2026-10-25',1),sourceAttemptId:'original'};const reopened=M.plan('original',[...attempts,delayed,failure],{original:{...chain,delayedId:'delayed'}},'2026-10-25');assert.equal(reopened.reopenedBy,'failed');assert.equal(reopened.type,'reattempt');assert.equal(reopened.id,'original');
});
