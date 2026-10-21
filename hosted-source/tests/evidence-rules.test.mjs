import assert from 'node:assert/strict';
import test from 'node:test';
import '../public/evidence-rules.js';
const rules = globalThis.PowerhouseEvidence;
const source = {id:'original', topicKey:'biology|0|0', question:'2023 Q1', date:'2026-10-01'};
const retests = [1,2].map(stage => ({id:String(stage),sourceAttemptId:source.id,topicKey:source.topicKey,stage,due:stage===1?'2026-10-04':'2026-10-08',completedAt:null}));
const proof = {id:'new',topicKey:source.topicKey,question:'2024 Q2',date:'2026-10-08',type:'fresh-transfer',earned:5,total:5,guesses:0,error:'',unaided:true,novelQuestion:true};
test('only a successful unaided fresh question closes the matching due retest stage', () => {
  assert.equal(rules.eligibleRetest(proof,retests,[source]).id,'1');
  assert.equal(rules.eligibleRetest({...proof,type:'delayed-retest'},retests,[source]).id,'2');
  for(const patch of [{type:'topic-question'},{type:'reattempt'},{earned:4},{error:'K'},{guesses:1},{unaided:false},{novelQuestion:false},{question:'  2023 Q1 '},{trustedEarned:4},{date:'2026-10-03'},{topicKey:'physics|0|0'}]) assert.equal(rules.eligibleRetest({...proof,...patch},retests,[source]),null,JSON.stringify(patch));
  assert.equal(rules.eligibleRetest({...proof,type:'delayed-retest',date:'2026-10-07'},retests,[source]),null);
  assert.equal(rules.eligibleRetest(proof,retests,[]),null);
});
test('restoring a cycle cannot invent progress from duplicate or skipped steps', () => {
  assert.deepEqual(rules.normalizeCycle({subject:'physics',step:2.5,done:[0,0,1,3,8]},['biology','chemistry','physics'],7),{subject:'physics',step:0,done:[0,1]});
});
