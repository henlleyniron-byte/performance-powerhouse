// Validate every keyword used in the supplied lightweight V3.2 JSON Schema,
// then enforce the stricter counts, references and graph invariants in the model.
import fs from 'node:fs';import '../public/powerhouse/verification.js';import '../public/practical-lab/clinic/model.js';
const dir=new URL('../public/practical-lab/clinic/',import.meta.url),read=f=>JSON.parse(fs.readFileSync(new URL(f,dir)));
function validate(value,s,path='$'){
 const known=new Set(['$schema','title','type','required','properties','const','enum','minItems','maxItems','items','pattern']);for(const k of Object.keys(s))if(!known.has(k))throw Error('Unsupported schema keyword '+k);
 const bad=m=>{throw Error(path+': '+m)};
 if(s.type && !(s.type==='object'?value&&typeof value==='object'&&!Array.isArray(value):s.type==='array'?Array.isArray(value):typeof value===s.type))bad('type '+s.type);
 if(Object.hasOwn(s,'const')&&value!==s.const)bad('const mismatch');if(s.enum&&!s.enum.includes(value))bad('enum mismatch');if(s.pattern&&!new RegExp(s.pattern).test(value))bad('pattern mismatch');
 if(s.required)for(const k of s.required)if(!Object.hasOwn(value,k))bad('missing '+k);
 if(s.properties)for(const [k,rule]of Object.entries(s.properties))if(Object.hasOwn(value,k))validate(value[k],rule,path+'.'+k);
 if(s.minItems!==undefined&&value.length<s.minItems)bad('too few items');if(s.maxItems!==undefined&&value.length>s.maxItems)bad('too many items');if(s.items)value.forEach((v,i)=>validate(v,s.items,path+'['+i+']'));
}
validate(read('practical-lab-graph-clinic-v3_2.json'),read('practical-lab-graph-clinic-v3_2.schema.json'));
const catalog=JSON.parse(fs.readFileSync(new URL('../public/practical-lab/practical-lab-catalog-v3.json',import.meta.url)));
const rows=PowerhouseClinic.bank(read('practical-lab-graph-clinic-v3_2.json'),read('practical-lab-question-bank-v3_1.json'),catalog);
console.log('PASS: supplied V3.2 schema, 15 graph cases / 5 per subject, 24 V3.1 questions and all NIE/activity cross-references ('+rows.length+' questions).');
