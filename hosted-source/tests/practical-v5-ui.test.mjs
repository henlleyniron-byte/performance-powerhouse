import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const dir=new URL('../public/practical-lab/clinic/',import.meta.url),read=n=>fs.readFileSync(new URL(n,dir),'utf8');
async function fixture({share=false,stored=null}={}){
 const elements=new Map(),writes=[],reads=[];let current=stored;
 class Element{
  constructor(tag='div',attrs=''){this.tagName=tag;this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.dataset={};this.listeners={};this.attrs={};this.classList={toggle(){}};for(const m of attrs.matchAll(/([\w-]+)="([^"]*)"/g)){if(m[1]==='id')this.id=m[2];else if(m[1]==='value')this.value=m[2];else if(m[1].startsWith('data-'))this.dataset[m[1].slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=m[2];this.attrs[m[1]]=m[2];}this._html='';this.textContent='';this.queryCache={};this.disabled=/\bdisabled(?:\s|$)/.test(attrs);}
  set innerHTML(s){this._html=s;this.queryCache={};for(const m of s.matchAll(/<([\w-]+)\b([^>]*\bid="[^"]+"[^>]*)>/g)){const e=new Element(m[1],m[2]);elements.set(e.id,e);const closing=s.indexOf('</'+m[1]+'>',m.index);if(closing>=0)e._html=s.slice(m.index+m[0].length,closing);}}
  get innerHTML(){return this._html;}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){this.listeners[k]=f;}focus(){}scrollIntoView(){}close(){this.open=false;}showModal(){this.open=true;}
  querySelectorAll(selector){if(this.queryCache[selector])return this.queryCache[selector];let result=[];if(selector==='[name=point]')result=[...this._html.matchAll(/<input\b([^>]*name="point"[^>]*)>/g)].map(m=>new Element('input',m[1]));else if(selector==='[name=tag]:checked')result=[];else if(selector.startsWith('[data-')){const key=selector.slice(1,-1);result=[...this._html.matchAll(/<(button|form)\b([^>]*?)>/g)].filter(m=>m[2].includes(key+'=')).map(m=>new Element(m[1],m[2]));}if(selector==='[name=point]'){this.points??=result;return this.points;}this.queryCache[selector]=result;return result;}
 }
 const source=read('index.html');for(const m of source.matchAll(/<([\w-]+)\b([^>]*\bid="[^"]+"[^>]*)>/g)){const e=new Element(m[1],m[2]);elements.set(e.id,e);}
 for(const [id,value]of Object.entries({subject:'all',edition:'V5','activity-filter':'all','progress-filter':'all'}))elements.get(id).value=value;
 const location={get search(){return new URL(this.href).search;},href:'https://example.test/practical-lab/clinic/'+(share?'?share=1':'')};
 const document={getElementById:id=>elements.get(id),body:{classList:{toggle(){}}}};
 const c=vm.createContext({document,location,history:{replaceState(_s,_t,url){location.href='https://example.test'+url;}},URL,URLSearchParams,Date,Intl,crypto,navigator:{},console,localStorage:{getItem(k){reads.push(k);return current;},setItem(k,v){writes.push({key:k,value:v});if(!k.endsWith('_recovery'))current=v;}},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(new URL(url,dir),'utf8'))})});
 for(const path of ['../../powerhouse/verification.js','v5-content.js','model.js','app.js'])vm.runInContext(read(path),c);
 await new Promise(setImmediate);await new Promise(setImmediate);
 return {elements,c,writes,reads,get stored(){return current;},set stored(v){current=v;},open(){elements.get('results').querySelectorAll('[data-open]')[0].onclick();}};
}
test('V5 UI loads full coverage and opens a real dataset without exposing the model key',async()=>{
 const f=await fixture();assert.match(f.elements.get('notice').textContent,/V5 ready/);assert.match(f.elements.get('result-count').textContent,/126/);assert.equal(f.writes.length,0);f.open();
 const html=f.elements.get('workspace').innerHTML;assert.match(html,/fictional|Fictional/);assert.match(html,/Structured|Your attempt/);assert.doesNotMatch(html,/One mark per demonstrated point/);assert.equal(f.writes.length,0);
});
test('answer-first marking records an honest zero and uses the same private clinic namespace',async()=>{
 const f=await fixture();f.open();f.elements.get('answer').value='My own incomplete answer.';f.elements.get('answer-form').onsubmit({preventDefault(){}});
 assert.match(f.elements.get('marking').innerHTML,/five|0–5|0-5/);const form=f.elements.get('mark-form');form.querySelectorAll=selector=>selector==='[name=point]'?Array.from({length:5},()=>({checked:false})):selector==='[name=tag]:checked'?[{value:'evidence'}]:[];
 form.onsubmit({preventDefault(){},target:form});assert.match(f.elements.get('notice').textContent,/0\/5 saved privately/);
 const p=JSON.parse(f.stored);assert.equal(p.records['PM5-B01'].attempts[0].earned,0);assert.ok(f.writes.some(w=>w.key==='performance_powerhouse_practical_clinic_v32'));
});
test('saved unfinished answers create no attempts and survive a reload',async()=>{
 const f=await fixture();f.open();f.elements.get('answer').value='An unfinished private calculation.';f.elements.get('save-draft').onclick();
 const p=JSON.parse(f.stored);assert.equal(Object.keys(p.records).length,0);assert.equal(p.drafts['PM5-B01'].answer,'An unfinished private calculation.');
 const again=await fixture({stored:f.stored});again.open();assert.equal(again.elements.get('answer').value,'An unfinished private calculation.');assert.equal(again.writes.length,0);
});
test('share entry does not read browser records; toggling clears the answer and private controls',async()=>{
 const shared=await fixture({share:true});assert.equal(shared.reads.length,0);shared.open();assert.doesNotMatch(shared.elements.get('workspace').innerHTML,/id="answer-form"/);assert.equal(shared.elements.get('owner').hidden,true);
 const f=await fixture();f.open();f.elements.get('answer').value='Private answer';f.elements.get('share').onclick();assert.doesNotMatch(f.elements.get('workspace').innerHTML,/Private answer|id="answer-form"|Private marked history/);assert.equal(f.writes.length,0);
});
test('a stale tab and unreadable original records cannot be silently overwritten',async()=>{
 const f=await fixture();f.open();f.elements.get('answer').value='Unfinished';f.stored='{"newer":"other tab"}';f.elements.get('save-draft').onclick();assert.match(f.elements.get('notice').textContent,/Another tab/);assert.equal(f.writes.length,0);
 const broken=await fixture({stored:'{broken'});assert.match(broken.elements.get('notice').textContent,/preserved/);broken.open();assert.equal(broken.elements.get('save-draft').disabled,true);
 assert.match(broken.elements.get('workspace').innerHTML,/id="save-draft" disabled/);broken.elements.get('backup').onclick();assert.equal(broken.elements.get('backup-json').value,'{broken');assert.equal(broken.writes.length,0);
});
