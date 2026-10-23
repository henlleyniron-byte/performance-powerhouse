import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import '../public/powerhouse/verification.js';
import '../public/powerhouse/model.js';

const E = globalThis.PowerhouseVerification;
const original = {id:'original',subject:'physics',question:'2023 Q1',date:'2026-10-01',earned:1,total:2,guesses:0,unaided:true};
const reattempt = {...original,id:'re',date:'2026-10-02',earned:2};
const transfer = {...reattempt,id:'tr',question:'2024 Q2',date:'2026-10-03',novelQuestion:true};
const delayed = {...transfer,id:'de',question:'2025 Q3',date:'2026-10-10'};
const chain = {originalId:'original',skill:'directions',diagnosis:'sign error',repair:'draw and label forces',markingSource:'checked scheme',reattemptId:'re',transferId:'tr',delayedId:'de',confirmSkill:true};
const assess = rows => E.assess(chain, rows, '2026-10-16');

test('fresh and delayed checks need different actual question references, beyond new IDs and checkboxes', () => {
  assert.equal(assess([original,reattempt,transfer,delayed]).stage,'retained');
  for (const question of ['2023 Q1',' ２０２３—Ｑ１ ', '2023-q1']) {
    assert.equal(assess([original,reattempt,{...transfer,question},delayed]).stage,'transfer');
  }
  for (const question of [original.question, reattempt.question, transfer.question, '', '---']) {
    assert.equal(assess([original,reattempt,transfer,{...delayed,question}]).stage,'delayed');
  }
});

test('raw full marks do not override audited lost marks, recorded errors or malformed scores', () => {
  for (const patch of [{trustedEarned:1},{trustedEarned:'2'},{error:'K'},{tags:['units']},{total:Infinity,earned:Infinity},{total:'2',earned:'2'},{guesses:'0'},{guesses:1}]) {
    assert.equal(E.fullPass({...delayed,...patch}),false,JSON.stringify(patch));
    assert.notEqual(assess([original,reattempt,transfer,{...delayed,...patch}]).stage,'retained');
  }
  assert.equal(E.fullPass({...delayed,trustedEarned:2}),true);
});

test('a later explicitly linked independent failure reopens the chosen weakness without mutating evidence', () => {
  const failure = {...delayed,id:'failed',sourceAttemptId:original.id,date:'2026-10-12',earned:1};
  const rows = [original,reattempt,transfer,delayed,failure], before = JSON.stringify(rows);
  assert.equal(assess(rows).stage,'reattempt');
  assert.match(assess(rows).label,/reopened/);
  assert.equal(JSON.stringify(rows),before);
  for (const patch of [{sourceAttemptId:'another-error'},{date:'2026-10-17'},{date:'2026-10-10'},{unaided:false},{subject:'biology'}]) {
    assert.equal(assess([original,reattempt,transfer,delayed,{...failure,...patch}]).stage,'retained');
  }
});

test('impossible dates and invalid assessment dates cannot enter the completed attempt or closure path', () => {
  const input={question:'Q1',earned:1,total:1,trustedEarned:null,minutes:1,items:1,guesses:0};
  for (const date of ['2026-02-30','2026-02-29','2026-04-31','2026-13-01']) {
    assert.notEqual(PowerhouseModel.validateAttempt({...input,date},'2026-10-16'),'');
  }
  assert.equal(PowerhouseModel.validateAttempt({...input,date:'2024-02-29'},'2026-10-16'),'');
  assert.notEqual(PowerhouseModel.validateAttempt({...input,date:'2026-10-16'},'bad'),'');
  assert.equal(E.assess(chain,[original,reattempt,transfer,delayed],'bad').stage,'invalid-date');
  assert.notEqual(assess([{...original,date:'2026-02-30'},reattempt,transfer,delayed]).stage,'retained');
});

test('completing workflow navigation never announces assessed closure or writes assessment records', () => {
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  const source=html.slice(html.indexOf('function markCycleStepDone()'),html.indexOf('function runCycleAction()'));
  const messages=[],destinations=[],state={attempts:[]},evidenceCycle={step:0,done:[]};
  const context=vm.createContext({CYCLE_STEPS:Array(7).fill({}),evidenceCycle,state,saveCycle(){},renderCycle(){},navigate:value=>destinations.push(value),toast:value=>messages.push(value),document:{getElementById:()=>({scrollIntoView(){}})}});
  vm.runInContext(source,context);
  for(let index=0;index<7;index++)vm.runInContext('markCycleStepDone()',context);
  assert.equal(evidenceCycle.done.length,7);
  assert.equal(state.attempts.length,0);
  assert.deepEqual(destinations,['repairs']);
  assert.match(messages.at(-1),/does not close the error/);
  assert.doesNotMatch(messages.join(' '),/Full evidence loop closed/);
  assert.match(html,/aria-label="Self-recorded workflow steps"/);
});
