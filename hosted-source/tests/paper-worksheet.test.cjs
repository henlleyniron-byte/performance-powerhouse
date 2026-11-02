const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/paper-analysis/model.js'),'utf8'),context);const M=context.module.exports;
const filters={subject:'physics',medium:'English',from:2020,to:2022,syllabus:'all',reviewedOnly:false},settings={unit:null,review:'any',count:20,minutes:20};
function paper(id='paper-a',year=2020,count=2){return {id,subject:'physics',examYear:year,sitting:'Exact sitting '+id,medium:'English',syllabus:'Variant '+id,expectedQuestions:count,unitRegister:['SECRET_UNIT_CUE'],source:{label:'Original source '+id,locator:'Original PDF '+id+' p1',sha256:(id==='paper-a'?'a':'b').repeat(64),review:'provisional',basis:'question-records'},questions:Array.from({length:count},(_,i)=>({number:i+1,unit:'SECRET_UNIT_CUE',topic:'SECRET_TOPIC_CUE',review:'provisional',locator:'Original '+id+' PDF p'+(i+1)+' Q'+(i+1),rationale:'SECRET_ANSWER_LIKE_RATIONALE'})),unitCounts:{}};}
const data=papers=>({schema:M.SCHEMA,title:'Private source inventory',notes:'Synthetic sources only',papers:papers||[paper()]});
const packet=(papers,controls={})=>M.practicePacket(data(papers),filters,{...settings,...controls});
const clone=v=>JSON.parse(JSON.stringify(v));
function freeze(v){if(v&&typeof v==='object'){Object.freeze(v);Object.values(v).forEach(freeze);}return v;}

test('both worksheet phases retain exact original sitting/Q/source identities without classification or answer cues',()=>{
 const p=packet([paper('paper-a'),paper('paper-b',2021)]);freeze(p);
 for(const phase of ['attempt','review']){const html=M.packetWorksheetHTML(p,phase),md=M.packetWorksheetMarkdown(p,phase);for(const text of ['paper-a','paper-b','Exact sitting paper-a','Variant paper-b','English','2021','Original paper-a PDF p1 Q1','Original paper-b PDF p1 Q1','a'.repeat(64),'b'.repeat(64)]){assert(html.includes(text));assert(md.includes(text));}assert.equal((html.match(/<strong>Original Q1<\/strong>/g)||[]).length,2);assert.equal((md.match(/^### Original Q1$/gm)||[]).length,2);for(const cue of ['SECRET_UNIT_CUE','SECRET_TOPIC_CUE','SECRET_ANSWER_LIKE_RATIONALE']){assert(!html.includes(cue));assert(!md.includes(cue));}assert(html.includes('provisional / provisional'));assert(md.includes('provisional / provisional'));}
});

test('worksheets use the selected one/twenty/short packet exactly and never pad or invent question numbers',()=>{
 for(const count of [1,20]){const p=packet([paper('paper-a',2020,20)],{count,minutes:count===1?5:120});for(const phase of ['attempt','review']){const html=M.packetWorksheetHTML(p,phase),md=M.packetWorksheetMarkdown(p,phase);assert.equal((html.match(/<strong>Original Q\d+<\/strong>/g)||[]).length,count);assert.equal((md.match(/^### Original Q\d+$/gm)||[]).length,count);assert(md.includes('    '+p.selection.minutes+' minutes'));assert(!html.includes('Original Q21'));}}
 const short=packet();assert.equal((M.packetWorksheetHTML(short,'attempt').match(/<strong>Original Q/g)||[]).length,2);assert.equal(short.scope.selectedQuestions,2);
});

test('review remains explicitly Unverified and all response/marking cells start blank with no active form or credit',()=>{
 for(const phase of ['attempt','review']){const html=M.packetWorksheetHTML(packet(),phase),cells=[...html.matchAll(/<td>(.*?)<\/td>/g)].map(m=>m[1]);assert.equal(cells.length,6);assert(cells.every(s=>/^_+(?: \/ _+)?$/.test(s)));assert(html.includes('Unverified blank worksheet'));assert(!/<(?:script|input|button|select|textarea|form|iframe|object|embed|a|link|img|audio|video)\b/i.test(html));assert(!/\son\w+\s*=/i.test(html));assert(html.includes("default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"));assert(!html.includes('checked='));assert(!html.includes('value='));}
 const review=M.packetWorksheetMarkdown(packet(),'review');for(const text of ['Independently checked marking scheme identity','Actual earned / available marks','Correction source and exact page','Closed-book reattempt','Different transfer question','Delayed check','no completed retest'])assert(review.includes(text));assert(!/\b(?:score|mastery|retained|completed)\s*:\s*(?:true|100|verified)\b/i.test(review));
});

test('standalone HTML escapes hostile literals while preserving tabs/CR/Unicode separators as text entities',()=>{
 const d=data();d.title='</title><script>bad()</script>';d.papers[0].source.label='" & <b>literal</b>\r\n\t[link](javascript:bad)';d.papers[0].source.locator='</style><img src=x onerror=bad>\rA\nB\tC\u2028D\u2029E';d.papers[0].questions[0].locator='```\n# heading\n<form action="https://invalid.example">';const p=M.practicePacket(d,filters,settings),before=JSON.stringify(p),html=M.packetWorksheetHTML(p,'attempt');
 assert(html.includes('&lt;/title&gt;&lt;script&gt;bad()&lt;/script&gt;'));assert(html.includes('&quot; &amp; &lt;b&gt;literal&lt;/b&gt;&#13;&#10;&#9;[link](javascript:bad)'));assert(html.includes('&lt;/style&gt;&lt;img src=x onerror=bad&gt;&#13;A&#10;B&#9;C&#8232;D&#8233;E'));assert(html.includes('&lt;form action=&quot;https://invalid.example&quot;&gt;'));assert(!/<script\b|<img\b|<form\b/i.test(html));assert.equal(JSON.stringify(p),before);
});

test('worksheet Markdown separates trusted labels and inert values with an explicit normalization notice',()=>{
 const d=data();d.papers[0].source.locator='[link](javascript:bad)\r\n```\r# supplied heading\u2028<svg onload=bad>\u2029\tend';const p=M.practicePacket(d,filters,settings),before=JSON.stringify(p),md=M.packetWorksheetMarkdown(p,'review');assert(md.includes('normalizes CR, CRLF and Unicode line separators'));assert(md.includes('**Exact source locator**\n\n    [link](javascript:bad)\n    ```\n    # supplied heading\n    <svg onload=bad>\n    \tend\n'));assert(!md.includes('\n# supplied heading'));assert(!md.includes('\n<svg'));assert.equal(JSON.stringify(p),before);
});

test('UTF-8 worksheet downloads visibly represent lone surrogates without replacing original packet strings',async()=>{
 const d=data();d.title='Literal high \uD800; low \uDC00; real emoji \uD83D\uDE00';d.papers[0].source.locator='Original \uD800 source \uDC00';const p=M.practicePacket(d,filters,settings),json=JSON.stringify(p);
 for(const phase of ['attempt','review'])for(const format of [M.packetWorksheetHTML,M.packetWorksheetMarkdown]){const downloaded=await new Blob([format(p,phase)]).text();assert(downloaded.includes('\\uD800'));assert(downloaded.includes('\\uDC00'));assert(downloaded.includes('😀'));assert(!downloaded.includes('\uFFFD'));assert(downloaded.includes('Unpaired UTF-16 code units'));}
 assert.equal(JSON.stringify(p),json);assert.equal(JSON.parse(json).datasetTitle,d.title);assert.equal(p.questions[0].source.locator,d.papers[0].source.locator);
});

test('unsupported phases, malformed packet boundaries and mismatched exact selections fail closed',()=>{
 const original=packet();for(const phase of ['',null,'answers','future'])for(const format of [M.packetWorksheetHTML,M.packetWorksheetMarkdown])assert.throws(()=>format(original,phase),/attempt or review/);
 for(const change of [p=>p.schema='future',p=>p.questions=[],p=>p.questions.push(...Array(20).fill(p.questions[0])),p=>p.selection.count=1,p=>p.selection.minutes=4,p=>p.scope.selectedQuestions=99,p=>p.questions[0].source.basis='aggregate',p=>p.questions[0].source.sha256='bad',p=>p.questions[0].subject='biology',p=>p.questions[0].medium='Tamil',p=>p.questions[0].examYear=2019,p=>p.questions[0].effectiveReview='reviewed',p=>p.questions[0].unit='Boundary-review: unresolved',p=>p.questions[1].number=1,p=>p.selection.unit='Absent unit',p=>p.selection.review='reviewed']){const p=clone(original);change(p);const before=JSON.stringify(p);for(const format of [M.packetWorksheetHTML,M.packetWorksheetMarkdown])assert.throws(()=>format(p,'attempt'));assert.equal(JSON.stringify(p),before);}
});

test('new worksheets preserve original dataset, v1 packet JSON and legacy Markdown bytes',()=>{
 const d=data(),raw=JSON.stringify(d),p=M.practicePacket(M.parse(raw),filters,settings),json=JSON.stringify(p),md=M.packetMarkdown(p);freeze(p);for(const phase of ['attempt','review']){M.packetWorksheetHTML(p,phase);M.packetWorksheetMarkdown(p,phase);}assert.equal(JSON.stringify(d),raw);assert.equal(JSON.stringify(p),json);assert.equal(M.packetMarkdown(p),md);assert.equal(p.schema,'al-paper-practice-packet-v1');assert(!Object.hasOwn(p,'worksheet'));assert(!Object.hasOwn(p,'answers'));assert(!Object.hasOwn(p,'marks'));
});
