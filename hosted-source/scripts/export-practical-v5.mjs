import fs from 'node:fs';
import '../public/powerhouse/verification.js';
import '../public/practical-lab/clinic/v5-content.js';
import '../public/practical-lab/clinic/model.js';
const base=new URL('../public/practical-lab/',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,base)));
const questions=PowerhouseClinic.bank(read('clinic/practical-lab-graph-clinic-v3_2.json'),read('clinic/practical-lab-question-bank-v3_1.json'),read('practical-lab-catalog-v3.json'),read('clinic/practical-lab-evidence-integrity-v3_3.json'),read('clinic/practical-lab-v5.json'),read('clinic/practical-lab-coverage-completion-v4_0.json'));
for(const note of read('clinic/practical-lab-v5.json').alignment_notes){const q=questions.find(q=>q.id===note.question_id);q.alignment_note=note.note;}
const result={release:'2026-10-16-v5.0',teacher_reviewed:false,fictional_practice_data:true,question_count:questions.length,questions};
fs.writeFileSync(new URL('clinic/downloads/practical-lab-combined-v5.json',base),JSON.stringify(result,null,2)+'\n');
console.log('Validated and exported '+questions.length+' effective practice questions.');
