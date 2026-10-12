import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const main=readFileSync(new URL("../index.html", import.meta.url),"utf8");
const guide=readFileSync(new URL("../first-real-attempt.html", import.meta.url),"utf8");
test("existing Guide panel links to first-attempt page without changing storage",()=>{
  assert.match(main,/id="panel-guide"/);
  assert.equal(main.split('href="./first-real-attempt.html"').length-1,1);
  assert.match(guide,/href="\.\/index\.html"/);
});
test("guide preserves independent evidence over task completion",()=>{
  for(const term of ["closed-book","verification hold","raw score","unseen","delayed","Notion","Notion Error Bank","Calendar"]){
    assert.match(guide,new RegExp(term,"i"));
  }
  assert.doesNotMatch(guide,/<script|localStorage|sessionStorage|fetch\(/i);
});
test("checklist is not collected, transmitted or persisted",()=>{
  assert.match(guide,/not saved/i);
  assert.match(guide,/type="checkbox"/);
  assert.doesNotMatch(guide,/type="submit"/);
});
