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
test('date-only scheduling is exact at month, leap-year and year boundaries', () => {
  assert.equal(rules.addDays('2026-12-28',7),'2027-01-04');
  assert.equal(rules.addDays('2028-02-28',1),'2028-02-29');
  for(const date of ['2026-02-29','2026-02-31','2026-13-01','bad']) assert.equal(rules.validDate(date),false);
});
test('backup validation accepts a real round-trip shape and rejects corrupted evidence before mutation', () => {
  const valid = {profile:{name:'Student'},ratings:{'biology|0|0':2},syllabusProgress:{bio1:75},attempts:[{...proof,subject:'biology',type:'topic-question',unaided:false}],retests:[],dailyEntries:[]};
  const validate = data => rules.validateBackup(data,['biology|0|0'],['biology'],['topic-question'],['K'],'2026-10-08',['bio1']);
  assert.equal(validate(valid),valid);
  for(const patch of [{earned:6},{total:0},{date:'2026-02-31'},{date:'2026-10-09'},{topicKey:'biology|9|9'},{guesses:1.5},{id:'<img>'},{question:''},{trustedEarned:6}]) assert.throws(()=>validate({...valid,attempts:[{...valid.attempts[0],...patch}]}));
  assert.throws(()=>validate({...valid,attempts:[valid.attempts[0],valid.attempts[0]]}));
  assert.throws(()=>validate(JSON.parse('{"ratings":{},"attempts":[],"__proto__":{"bad":true}}')));
  assert.throws(()=>validate({...valid,retests:[{id:'check',sourceAttemptId:'missing',topicKey:'biology|0|0',stage:1,due:'2026-10-09'}]}));
  assert.equal(valid.attempts[0].earned,5);
});
