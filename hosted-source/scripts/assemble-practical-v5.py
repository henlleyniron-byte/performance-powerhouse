#!/usr/bin/env python3
"""Assemble original subject cases, explicit errata and auditable numeric checks."""
import ast, csv, hashlib, json, math, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
WORK=ROOT.parent/'practical-v5'
DEST=ROOT/'public/practical-lab/clinic'
OUT=DEST/'downloads'
CAT=json.loads((ROOT/'public/practical-lab/practical-lab-catalog-v3.json').read_text())
SUBJECTS={'biology':38,'chemistry':45,'physics':43}
ALLOWED=(ast.Expression,ast.BinOp,ast.UnaryOp,ast.Constant,ast.Add,ast.Sub,ast.Mult,ast.Div,ast.Pow,ast.Mod,ast.USub,ast.UAdd,ast.Call,ast.Attribute,ast.Name,ast.Load,ast.Tuple,ast.List)
def calculate(expression):
    tree=ast.parse(expression,mode='eval')
    for node in ast.walk(tree):
        if not isinstance(node,ALLOWED):raise ValueError('Disallowed arithmetic syntax: '+expression)
        if isinstance(node,ast.Name) and node.id not in {'math','abs','round','sum','min','max'}:raise ValueError('Disallowed arithmetic name')
        if isinstance(node,ast.Attribute) and (not isinstance(node.value,ast.Name) or node.value.id!='math' or node.attr not in {'pi','sqrt','sin','cos','tan','asin','acos','atan','log','log10','exp','radians','degrees'}):raise ValueError('Disallowed arithmetic attribute')
    result=eval(compile(tree,'<arithmetic-check>','eval'),{'__builtins__':{},'math':math,'abs':abs,'round':round,'sum':sum,'min':min,'max':max},{})
    if not isinstance(result,(int,float)) or not math.isfinite(result):raise ValueError('Non-finite arithmetic')
    return result
questions=[]
for subject,count in SUBJECTS.items():
    path=ROOT/'data/practical-v5'/subject/(subject+'_cases.json')
    cases=json.loads(path.read_text())
    assert len(cases)==count,(subject,len(cases))
    questions.extend(cases)
lookup={a['id']:a for a in CAT['activities']}
refs=[]
for q in questions:
    a=lookup[q['activity_ids'][0]]
    if q['nie_print_page']!=a['nie_print_page']:
        refs.append({'activity_id':a['id'],'catalog_page':a['nie_print_page'],'body_page':q['nie_print_page'],'reason':q['source_verification']['note']})
corrections=[
 {'question_id':'PM-P03','reason':'Corrected spring constant rounding: using the mean T²/m gives 9.95735 N m⁻¹, hence 9.96 to three significant figures. Historical attempts retain their original text.','patch':{'marks':['For 0.10 kg: T²/m = 0.63²/0.10 = 3.969 s² kg⁻¹.','For 0.20 kg: T²/m = 0.89²/0.20 = 3.9605 s² kg⁻¹.','Near agreement supports T² proportional to m within the supplied precision.','Mean T²/m = 3.96475 s² kg⁻¹; k = 4π²/3.96475 = 9.95735 ≈ 9.96 N m⁻¹.','Effective spring mass and non-ideal oscillations limit a two-point model.']}},
 {'question_id':'PM-P04','reason':'The earlier 0.18 m and 0.53 m first/second lengths implied a negative end correction. V5 uses 0.17 m and 0.52 m: the same spacing and speed, with a physically valid +0.005 m end correction.','patch':{'data':[['Successive resonance position','Length/m'],['First','0.17'],['Second','0.52'],['Source frequency','480 Hz']],'scenario':'A fictional closed-tube model supplies first and second resonance lengths at the same frequency. Assume one open end, one closed end and the same positive end correction.','marks':['Successive resonances differ in tube length by λ/2.','Difference = 0.52 − 0.17 = 0.35 m.','Wavelength λ = 2 × 0.35 = 0.70 m.','Speed v = fλ = 480 × 0.70 = 336 m s⁻¹.','A constant end correction cancels in the difference; here e = λ/4 − 0.17 = +0.005 m.']}},
 {'question_id':'PM33-B01','reason':'RQ = 0.800 does not specifically identify fat. Protein or mixed-substrate oxidation can produce this value. Corrected the spelling of “Inferring”.','patch':{'marks':['RQ = CO₂ volume / O₂ volume over the same interval.','RQ = 36.0 / 45.0 = 0.800.','RQ is dimensionless for comparable gas volumes.','RQ 0.800 is compatible with protein or mixed-substrate oxidation; it is not specific evidence of fat alone.','It does not prove that only one substrate was respired.','Mixed substrates can produce intermediate quotients.','Gas dissolution and measurement limitations can bias the sampled RQ.','Compare gas volumes at equivalent temperature and pressure.'],'common_error':'Inferring a unique organic substrate solely from RQ.','error':'Inferring a unique organic substrate solely from RQ.'}}
]
old_b05=json.loads((DEST/'practical-lab-question-bank-v3_1.json').read_text())
b05marks=next(q['marks'] for q in old_b05['questions'] if q['id']=='PM-B05').copy()
b05marks[2]='Linear interpolation: c = 0.30 + [(50−48)/(75−48)] × 0.10 = 0.307407… ≈ 0.307 mol dm⁻³; this is a model estimate, not a directly measured concentration.'
corrections.append({'question_id':'PM-B05','reason':'Refined the earlier near-0.30 estimate by explicit linear interpolation to 0.307 mol dm⁻³; uncertainty and model limits remain.','patch':{'marks':b05marks}})
# Clarify two correct final calorimetry answers whose substitution lines omitted J-to-kJ conversion.
for filename,qid,index,text in [
 ('practical-lab-graph-clinic-v3_2.json','PM32-C04',3,'Under the exothermic model, ΔH = −2299 J / 0.0500 mol = −45980 J mol⁻¹ = −45.98 kJ mol⁻¹.'),
 ('practical-lab-evidence-integrity-v3_3.json','PM33-C02',5,'Including the calorimeter, ΔH = −1397 J / 0.0250 mol = −55880 J mol⁻¹ = −55.9 kJ mol⁻¹.')]:
    original=json.loads((DEST/filename).read_text())
    marks=next(q['marks'] for q in original['questions'] if q['id']==qid).copy();marks[index]=text
    corrections.append({'question_id':qid,'reason':'Made the joule-to-kilojoule conversion explicit; the earlier final numerical answer was correct.','patch':{'marks':marks}})
notes=[
 {'question_id':'PM-B08','note':'The earlier inhibition-zone exercise is associated microbiology practice, not the colony-count method in NIE Biology Practical38. PM5-B38 now provides method-aligned colony-count practice.'},
 {'question_id':'PM32-B05','note':'The earlier mass-change osmosis exercise is associated enrichment; the official Biology Practical21 uses curvature and potato LENGTH change. PM5-B21 follows the length method.'},
 {'question_id':'PM32-C03','note':'The earlier Boyle-law exercise is broader gas-law practice, not the specific molar-volume method of NIE Chemistry Practical5. PM5-C05 now addresses that method.'},
]
v4_audits={}
for subject in SUBJECTS:
    path=ROOT/'data/practical-v5'/subject/('v4_'+subject+'_audit.json')
    if path.exists():
        audit=json.loads(path.read_text());v4_audits[subject]=audit
        corrections.extend(audit.get('corrections',[]))
        for case in audit.get('cases',[]):
            scope=[i.get('detail','') for i in case.get('issues',[]) if i.get('kind')=='source_scope']
            if 'enrichment' in case.get('source_alignment',''):scope.append(case.get('audit_note','Associated enrichment, rather than an exact handbook-method exercise.'))
            if scope:notes.append({'question_id':case['id'],'note':' '.join(scope)})
bank={'schema_version':'1.0.0','release':'2026-10-16-v5.0','release_label':'Practical Mastery V5 — Complete Activity Practice','extends_catalog_release':CAT['release'],'teacher_reviewed':False,'actual_lab_observations':False,'question_count':126,'subject_counts':SUBJECTS,'marks_per_question':5,'total_marks':630,'source_handbooks':CAT['source_handbooks'],'provenance':{'available_base':'V4 complete collection, 403 pages, all 70 V4 cases, plus V3.1–V3.3 JSON','v4_original_files_available':True,'v4_handoff_used':'Original attached V4 JSON, 403-page complete PDF, 57-page supplement, QA ledger and incremental update','site_baseline_saved_version':33,'site_baseline_commit':'7aca80dba638226ed0a9c9f5a21f415877c7b0be'},'reference_corrections':refs,'corrections':corrections,'alignment_notes':notes,'questions':questions}
DEST.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
(DEST/'practical-lab-v5.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n')
checks=[]
for q in questions:
    for c in q.get('numeric_checks',[]):
        got=calculate(c['expression']);expected=c['expected'];tol=c.get('tolerance',1e-9)
        if abs(got-expected)>tol:raise AssertionError((q['id'],c,got))
        checks.append({'question_id':q['id'],'label':c['label'],'expression':c['expression'],'expected':expected,'computed':got,'tolerance':tol,'unit':c.get('unit',''),'result':'PASS'})
legacy_checks=[('PM-B05','Interpolated plasmolysis concentration','0.30+(50-48)/(75-48)*0.10',0.3074074074074074,'mol dm^-3'),('PM-P03','Corrected spring constant','4*math.pi**2/((0.63**2/0.10+0.89**2/0.20)/2)',9.957353579508778,'N m^-1'),('PM-P04','Resonance spacing','0.52-0.17',0.35,'m'),('PM-P04','Speed of sound','480*2*(0.52-0.17)',336,'m s^-1'),('PM-P04','Positive end correction','2*(0.52-0.17)/4-0.17',0.005,'m'),('PM33-B01','Respiratory quotient','36/45',0.8,'dimensionless')]
for id,label,expr,expected,unit in legacy_checks:
    got=calculate(expr);assert abs(got-expected)<1e-9
    checks.append({'question_id':id,'label':label,'expression':expr,'expected':expected,'computed':got,'tolerance':1e-9,'unit':unit,'result':'PASS'})
legacy_audits={}
for subject in SUBJECTS:
    audit=json.loads((ROOT/'data/practical-v5'/subject/('legacy_'+subject+'_audit.json')).read_text())
    
    def public_paths(value):
        if isinstance(value,dict):return {k:(pathlib.Path(v).name if k in {'source_file','source_path'} and isinstance(v,str) else public_paths(v)) for k,v in value.items()}
        if isinstance(value,list):return [public_paths(v) for v in value]
        return value
    legacy_audits[subject]=public_paths(audit)
    for case in audit['cases']:
        for check in case.get('numeric_checks',case.get('checks',case.get('numeric_assertions',case.get('arithmetic_assertions',[])))):
            expr=check.get('expression');expected=check.get('expected')
            if expr is None or expected is None:continue
            got=calculate(expr);tol=check.get('tolerance',1e-8)
            if abs(got-expected)>tol:raise AssertionError((subject,case,check,got))
            checks.append({'question_id':case.get('id',case.get('question_id',case.get('case_id','legacy'))),'label':check.get('label','Legacy numerical assertion'),'expression':expr,'expected':expected,'computed':got,'tolerance':tol,'unit':check.get('unit',''),'result':'PASS'})
for subject,audit in v4_audits.items():
    for case in audit.get('cases',[]):
        for c in case.get('numeric_checks',[]):
            got=calculate(c['expression']);expected=c['expected'];tol=c.get('tolerance',1e-8)
            if abs(got-expected)>tol:raise AssertionError((subject,case['id'],c,got))
            checks.append({'question_id':case['id'],'label':c['label'],'expression':c['expression'],'expected':expected,'computed':got,'tolerance':tol,'unit':c.get('unit',''),'result':'PASS'})
(OUT/'V5_V4_reconciliation_audits.json').write_text(json.dumps(v4_audits,ensure_ascii=False,indent=2)+'\n')
(OUT/'V5_legacy_case_audits.json').write_text(json.dumps(legacy_audits,ensure_ascii=False,indent=2)+'\n')
with (OUT/'V5_numeric_checks.csv').open('w',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(checks[0]));w.writeheader();w.writerows(checks)
with (OUT/'V5_activity_coverage.csv').open('w',newline='') as f:
    fields=['activity_id','subject','nie_number','catalog_print_page','verified_body_page','question_id','title','source_check','teacher_reviewed']
    w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
    for q in questions:
        a=lookup[q['activity_ids'][0]];w.writerow(dict(zip(fields,[a['id'],q['subject'],q['nie_number'],a['nie_print_page'],q['nie_print_page'],q['id'],q['title'],q['source_verification']['status'],False])))
summary={'cases':126,'subject_counts':SUBJECTS,'unique_ids':len({q['id'] for q in questions}),'unique_activities':len({q['activity_ids'][0] for q in questions}),'numeric_checks':len(checks),'all_numeric_checks_passed':True,'source_status_counts':{s:sum(q['source_verification']['status']==s for q in questions) for s in {'method_checked','index_checked','pending'}},'reference_corrections':refs,'teacher_reviewed':False,'v4_cases_audited':sum(len(a.get('cases',[])) for a in v4_audits.values()),'v4_cases_corrected':sum(c['question_id'].startswith('PM40-') for c in corrections)}
(WORK/'build/qa_summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))
