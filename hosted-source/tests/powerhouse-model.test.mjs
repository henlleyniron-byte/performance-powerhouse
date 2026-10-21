import assert from 'node:assert/strict';
import test from 'node:test';
import '../public/powerhouse/model.js';
const m=globalThis.PowerhouseModel;
test('Sri Lankan date boundaries work on any device timezone',()=>{
  assert.equal(m.day('2026-10-07T18:29:59Z'),'2026-10-07');
  assert.equal(m.day('2026-10-07T18:30:00Z'),'2026-10-08');
  assert.equal(m.shift('2026-12-30',4),'2027-01-03');
});
test('summary weights marks and keeps unaudited marks out of trusted accuracy',()=>{
  const rows=[{date:'2026-10-07',earned:2,total:2,minutes:10,unaided:true,guesses:0},{date:'2026-10-07',earned:3,total:8,trustedEarned:2,error:'K',minutes:20},{date:'2026-10-01',earned:100,total:100}];
  const s=m.summary(rows,'2026-10-07','2026-10-07');
  assert.equal(s.accuracy,50);assert.equal(s.trusted,25);assert.equal(s.audited,1);assert.equal(s.days,1);assert.equal(s.clean,1);assert.equal(s.errors.K,5);assert.equal(s.minutes,30);
  assert.equal(m.summary([],'2026-01-01','2026-12-31').accuracy,null);
});
test('invalid evidence cannot silently enter the ledger',()=>{
  const a={question:'2023 Q1',date:'2026-10-07',earned:5,total:10,trustedEarned:null,minutes:15,items:10,guesses:0,error:'K'};
  assert.equal(m.validateAttempt(a,'2026-10-07'),'');
  for(const patch of [{earned:11},{trustedEarned:6},{minutes:0},{minutes:NaN},{guesses:11},{items:1.5},{question:' '},{date:'2026-10-08'},{error:''}])assert.ok(m.validateAttempt({...a,...patch},'2026-10-07'));
});
