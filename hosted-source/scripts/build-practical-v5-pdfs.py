#!/usr/bin/env python3
"""Produce question-first V5 PDFs; retain, and visibly correct, the available legacy collection."""
import datetime, html, json, pathlib, re, zipfile
import fitz
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Flowable
ROOT=pathlib.Path(__file__).resolve().parents[1]
WORK=ROOT.parent/'practical-v5';BASE=ROOT/'public/practical-lab/clinic';OUT=BASE/'downloads'
bank=json.loads((BASE/'practical-lab-v5.json').read_text());qs=bank['questions'];qa=json.loads((WORK/'build/qa_summary.json').read_text())
for name,path in [('Body','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),('Bold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),('Serif','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf')]:pdfmetrics.registerFont(TTFont(name,path))
W,H=A4;M=44;CW=W-2*M;NAVY=colors.HexColor('#142B40');TEAL=colors.HexColor('#006E6A');GOLD=colors.HexColor('#A66C00');INK=colors.HexColor('#182E40');MUTED=colors.HexColor('#4C6072');PALE=colors.HexColor('#EDF5F5')
ST={
 'body':ParagraphStyle('body',fontName='Body',fontSize=9.1,leading=13.7,textColor=INK,spaceAfter=7),
 'small':ParagraphStyle('small',fontName='Body',fontSize=7.7,leading=11.1,textColor=MUTED,spaceAfter=6),
 'h1':ParagraphStyle('h1',fontName='Serif',fontSize=25,leading=32,textColor=NAVY,spaceAfter=17),
 'h2':ParagraphStyle('h2',fontName='Bold',fontSize=14.5,leading=20,textColor=NAVY,spaceAfter=12),
 'h3':ParagraphStyle('h3',fontName='Bold',fontSize=10,leading=14,textColor=TEAL,spaceBefore=10,spaceAfter=7),
 'kicker':ParagraphStyle('kicker',fontName='Bold',fontSize=8.2,leading=12,textColor=TEAL,spaceAfter=11),
 'cell':ParagraphStyle('cell',fontName='Body',fontSize=8.2,leading=11.4,textColor=INK),
 'cellhead':ParagraphStyle('cellhead',fontName='Bold',fontSize=8.2,leading=11.4,textColor=colors.white),
}
def clean(s):return str(s).replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
def para(s,style='body'):return Paragraph(html.escape(clean(s)).replace('\n','<br/>'),ST[style])
def link(label,url):return Paragraph('<link href="'+html.escape(url,quote=True)+'" color="#006E6A">'+html.escape(label)+'</link>',ST['small'])
class Lines(Flowable):
 def __init__(self,n=4):super().__init__();self.width=CW;self.height=n*19+5;self.n=n
 def draw(self):
  self.canv.setStrokeColor(colors.HexColor('#CFDADD'));self.canv.setLineWidth(.45)
  for i in range(self.n):self.canv.line(0,self.height-18*(i+1),self.width,self.height-18*(i+1))
def footer(c,doc):
 c.saveState();c.setFillColor(TEAL);c.rect(M,H-31,CW,2,fill=1,stroke=0);c.setFont('Bold',7);c.setFillColor(MUTED);c.drawString(M,H-24,'PRACTICAL MASTERY V5');c.setFont('Body',6.8);c.drawString(M,24,'Independent practice | Fictional datasets | Teacher review pending');c.drawRightString(W-M,24,str(doc.page));c.restoreState()
def table(data):
 cols=len(data[0]);widths=([CW*.30,CW*.70] if cols==2 else [CW/cols]*cols)
 rows=[[para(v,'cellhead' if i==0 else 'cell') for v in row] for i,row in enumerate(data)]
 t=Table(rows,colWidths=widths,hAlign='LEFT',repeatRows=1)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('GRID',(0,1),(-1,-1),.35,colors.HexColor('#C3D1D5')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE])]))
 return t

def front(kind):
 s=[Spacer(1,43),para('G.C.E. ADVANCED LEVEL | ENGLISH MEDIUM','kicker'),para('Practical Mastery\nV5','h1'),para(kind,'h2'),para('Biology · Chemistry · Physics','h3'),Spacer(1,15),table([['Activity coverage','New practice'],['Biology','38 cases'],['Chemistry','45 cases'],['Physics','43 cases'],['Total','126 distinct cases · 630 formative marks']]),Spacer(1,18),para('Build a defensible answer from a specific dataset. Then identify and repair the error that actually cost a mark.'),Spacer(1,12),para('16 October 2026 | Independent student study companion','small'),para('All data are fictional. These questions are not official examination papers or marking schemes, and they do not certify laboratory work. Qualified teacher review remains pending.','small'),PageBreak()]
 s.extend([para('Use one case at a time','h1'),para('A 15-minute study block','h3'),para('1. Choose one activity you are studying. Read its data table and state the units.\n2. Attempt all five tasks without notes or the model answers.\n3. Compare with the corresponding answer page and award only earned marks.\n4. Diagnose the smallest specific error: concept, evidence, arithmetic, units or an unsupported conclusion.\n5. Correct it, close the guide and reattempt. Use the transfer question later; after seeing its answer it is no longer unseen.'),para('Evidence means what you actually did','h3'),para('Theory studied, teacher-provided data analysed and personally performed under qualified supervision are different records. These fictional practice cases never substitute for actual observations, dates, apparatus records or signatures.'),para('Keep the exam boundary clear','h3'),para('The five one-mark points are independent formative rubrics. Some official practicals are broad identification activities, so those cases use specimen-feature or observation tables rather than invented experimental measurements. Follow your teacher and the official NIE handbook for laboratory work.'),para('Keep a delayed check genuinely unseen','h3'),para('An app visit, a revealed answer, a download or elapsed study time earns no marks. In Powerhouse, a successful fresh transfer must be followed by at least seven days before a qualifying delayed unseen retest.'),PageBreak(),para('Sources, editions and corrections','h1'),para('V5 source basis','h3'),para('The original 126 activity IDs and all 121 supplied V3.1–V4 machine-readable cases are preserved. The attached V4 predecessor contains 403 pages and includes its 70-case coverage supplement. V5 adds 126 new cases. The complete edition includes a reconciliation appendix for corrected earlier cases; its corrections take precedence over historical wording.'),para('All 126 new cases were compared with their official handbook activity methods. These checks establish source alignment, not teacher approval of the independent answer keys.'),*[link(subject.title()+' - official NIE practical handbook',url) for subject,url in bank['source_handbooks'].items()],para('Reference differences','h3')])
 for ref in bank['reference_corrections']:s.append(para(ref['activity_id']+': original catalog/index p.'+str(ref['catalog_page'])+'; verified activity body p.'+str(ref['body_page'])+'. '+ref['reason'],'small'))
 s.append(para('Use the printed handbook page shown for each V5 case. Original catalog metadata is retained separately for backward compatibility. A PDF viewer page is not the printed page.','small'))
 s.append(PageBreak());return s

def index_pages():
 result=[]
 for subject in ['biology','chemistry','physics']:
  group=[q for q in qs if q['subject']==subject]
  for offset in range(0,len(group),21):
   result.extend([para(subject.title()+' case index','h1'),para('Find cases by stable ID and NIE activity number. Each new case is worth five formative marks.','small')])
   rows=[['Case / NIE','Practice focus']]+[[q['id']+' / '+q['nie_number'],q['title']] for q in group[offset:offset+21]]
   result.extend([table(rows),PageBreak()])
 return result

def case(q,answers=False):
 out=[para(q['id']+' | '+q['subject'].upper()+' | NIE '+q['nie_number'],'kicker'),para(q['title'],'h2'),para('Printed handbook p.'+str(q['nie_print_page'])+' · '+('Model guide: five one-mark points' if answers else 'Five formative marks · fictional practice data'),'small')]
 if answers:
  out.append(para('Model marking guide','h3'))
  for i,m in enumerate(q['marks'],1):out.append(para(str(i)+'. '+m))
  out.extend([para('Worked reasoning','h3'),para(q['worked_explanation']),para('Common mistake','h3'),para(q['common_error']),para('Fresh transfer - attempt before reading the answer','h3'),para(q['transfer_question']),para('Transfer answer: '+q['transfer_answer']),para('One useful correction to remember','h3'),Lines(3)])
 else:
  out.extend([para(q['scenario']),table(q['data']),Spacer(1,10),para('Structured question','h3')])
  for i,t in enumerate(q['tasks']):out.append(para('('+chr(97+i)+') '+t+' [1]'))
  out.extend([para('Your calculation, diagram or explanation','h3'),Lines(4),para('Mark /5: ____  Specific error: __________________  Closed-book retry date: __________','small')])
 out.append(PageBreak());return out

def write_pdf(path,kind,answers=False):
 story=front(kind)+index_pages()
 for q in qs:story.extend(case(q,answers))
 if isinstance(story[-1],PageBreak):story.pop()
 doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=M,leftMargin=M,topMargin=45,bottomMargin=42,title='Practical Mastery V5 - '+kind,author='Independent educational study companion',pageCompression=1)
 doc.build(story,onFirstPage=footer,onLaterPages=footer)
 return len(fitz.open(path))

def correct_legacy(source,target):
 doc=fitz.open(source);changes=[]
 replacements=[('Infering','Inferring'),('Graph &amp; Evidence Clinic','Graph & Evidence Clinic'),('9.95','9.96')]
 for i,page in enumerate(doc):
  if i<57:continue  # V4 supplement retained; its revisions are clearly marked and reproduced in the appendix.
  text=page.get_text()
  # Clarify legacy substitutions and remove unsupported authorship claims.
  for block in list(page.get_text('blocks')):
   old=block[4];new=None
   if 'Including calorimeter, DeltaH = -1397/0.0250' in old:new='6. Including calorimeter: DeltaH = -1397 J / 0.0250 mol = -55880 J mol-1 = -55.9 kJ mol-1.'
   elif '2299/0.0500' in old:new='4. DeltaH = -2299 J / 0.0500 mol = -45980 J mol-1 = -45.98 kJ mol-1.'
   elif 'teacher-written' in old:new=old.replace('teacher-written','independently prepared').replace('a independently','an independently').replace('A independently','An independently')
   if new:
    rect=fitz.Rect(block[:4]);page.add_redact_annot(rect,fill=(1,1,1));page.apply_redactions();page.insert_font(fontname='V5Font',fontfile='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    result=page.insert_textbox(fitz.Rect(rect.x0,rect.y0-1,550,rect.y1+3),new,fontname='V5Font',fontsize=7.8,color=(.05,.2,.25))
    if result<0:raise ValueError('Legacy clarification overflows: '+old)
    changes.append({'legacy_pdf_page':i+1,'before':old.strip(),'after':new.strip()})
  for before,after in replacements:
   if before=='9.95' and 'PM-P03' not in text:continue
   for rect in page.search_for(before):
    page.add_redact_annot(rect,fill=(1,1,1));page.apply_redactions();page.insert_font(fontname='V5Font',fontfile='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    box=fitz.Rect(rect.x0,rect.y0-1,rect.x1+max(8,len(after)-len(before))*8,rect.y1+6)
    result=page.insert_textbox(box,after,fontname='V5Font',fontsize=min(10.2,max(8,rect.height*.7)),color=(.05,.2,.25))
    if result<0:raise ValueError('Correction text overflow: '+before)
    changes.append({'legacy_pdf_page':i+1,'before':before,'after':after})
  # Restrict resonance replacements to the original question or its marking page.
  text=page.get_text()
  if 'PM-P04' in text and ('Successive' in text or 'successive' in text):
   for before,after in [('0.18','0.17'),('0.53','0.52')]:
    for rect in page.search_for(before):
     page.add_redact_annot(rect,fill=(1,1,1));page.apply_redactions();page.insert_text((rect.x0,rect.y1-1.5),after,fontname='helv',fontsize=8.6,color=(.05,.2,.25));changes.append({'legacy_pdf_page':i+1,'before':before,'after':after})
  # Correct the over-specific RQ interpretation on the legacy marking page.
  text=page.get_text()
  if 'PM33-B01' in text and 'Model marking guide' in text:
   for block in page.get_text('blocks'):
    if 'An RQ below 1 is consistent' in block[4]:
     rect=fitz.Rect(block[:4]);replacement=block[4].replace('An RQ below 1 is consistent with relatively oxygen-demanding oxidation, for example fat-rich respiration.','RQ 0.800 is compatible with protein or mixed-substrate oxidation; it does not specifically identify fat.')
     # Text extraction may insert a line break inside this sentence.
     replacement=re.sub(r'An RQ below 1 is consistent.*?fat-rich respiration\.', 'RQ 0.800 is compatible with protein or mixed-substrate oxidation; it does not specifically identify fat.',block[4],flags=re.S)
     page.add_redact_annot(rect,fill=(1,1,1));page.apply_redactions();page.insert_font(fontname='V5Font',fontfile='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
     result=page.insert_textbox(fitz.Rect(rect.x0,rect.y0-1,rect.x1+5,rect.y1+7),replacement,fontname='V5Font',fontsize=8.3,color=(.05,.2,.25))
     if result<0:raise ValueError('RQ correction overflows')
     changes.append({'legacy_pdf_page':i+1,'before':'fat-specific RQ inference','after':'protein or mixed-substrate interpretation'})
 for page in doc:
  if 'PM-P04' in page.get_text() and ('Successive' in page.get_text() or 'successive' in page.get_text()):
   assert '0.17' in page.get_text() and '0.52' in page.get_text(), 'Resonance replacement text missing'
 if not any(c['before']=='fat-specific RQ inference' for c in changes):raise ValueError('RQ correction was not applied')
 doc.save(target,garbage=4,deflate=True);return changes

student=OUT/'Practical_Mastery_V5_Student_Workbook.pdf';answers=OUT/'Practical_Mastery_V5_Model_Answers.pdf'
student_pages=write_pdf(student,'Student workbook',False);answer_pages=write_pdf(answers,'Model answers and transfer questions',True)
effective=json.loads((OUT/'practical-lab-combined-v5.json').read_text())['questions']
byid={q['id']:q for q in effective};corrections=bank['corrections'];v4changes=[c for c in corrections if c['question_id'].startswith('PM40-')]
appendix=WORK/'build/v5_reconciliation_appendix.pdf'
story=[para('Earlier-case reconciliation','h1'),para('Read this before using the historical collection. V5 corrections below take precedence over the preserved earlier wording. IDs and saved private attempts remain unchanged.'),para('Correction register','h3')]
for c in corrections:story.append(para(c['question_id']+': '+c['reason'],'small'))
story.extend([para('V4 source audit','h3'),para('All 70 attached V4 cases were reviewed for numerical and conceptual issues. Corrected cases are reproduced on the following pages. Unchanged originals retain their fictional-dataset and independent-not-teacher-reviewed labels. The supplied V4 QA ledger is historical evidence of its earlier checks, not a guarantee of scientific correctness.'),PageBreak()])
for c in v4changes:
 q=byid[c['question_id']]
 story.extend([para(q['id']+' | V5-corrected V4 case','kicker'),para(q['title'],'h2'),para('Correction: '+c['reason'],'small'),para(q.get('alignment_note',''),'small'),para(q['scenario']),table(q['data']),para('Attempt before reading the model key','h3'),para(q['question']),Lines(3),PageBreak(),para(q['id']+' | corrected marking guide','kicker'),para(q['title'],'h2')])
 for i,m in enumerate(q['marks'],1):story.append(para(str(i)+'. '+m))
 story.extend([para('Common mistake','h3'),para(q['error']),para('Transfer question','h3'),para(q['transfer']),para('Transfer answer: '+q['transfer_answer']),PageBreak()])
if isinstance(story[-1],PageBreak):story.pop()
SimpleDocTemplate(str(appendix),pagesize=A4,rightMargin=M,leftMargin=M,topMargin=45,bottomMargin=42,title='V5 earlier-case reconciliation').build(story,onFirstPage=footer,onLaterPages=footer)
legacy_path=WORK/'build/legacy_v4_corrected.pdf';legacy_changes=correct_legacy(WORK/'input/v4_complete.pdf',legacy_path)
# Mark pages carrying revised historical V4 cases; the full corrected versions are in the appendix.
doc=fitz.open(legacy_path)
for i,page in enumerate(doc):
 ids=[c['question_id'] for c in v4changes if c['question_id'] in page.get_text()]
 if ids and i>6:
  page.draw_rect(fitz.Rect(40,14,555,32),color=None,fill=(1,.95,.72),overlay=True)
  page.insert_textbox(fitz.Rect(44,16,552,31),'V5 CORRECTION: '+', '.join(ids)+' - use the reconciliation appendix.',fontname='helv',fontsize=8,color=(.25,.16,0),overlay=True)
marked=WORK/'build/legacy_v4_marked.pdf';doc.save(marked,garbage=4,deflate=True);doc.close()
cover=WORK/'build/v5_complete_cover.pdf'
parts=[('V5 student workbook - 126 new cases',student),('V5 model answers and transfer questions',answers),('V5 correction register and revised earlier cases',appendix),('Historical V4 complete collection - read correction register first',marked)]
counts=[len(fitz.open(path)) for _,path in parts];total=1+sum(counts)
coverstory=[Spacer(1,50),para('G.C.E. ADVANCED LEVEL | ENGLISH MEDIUM','kicker'),para('Practical Mastery\nV5','h1'),para('Complete collection','h2'),para('Biology · Chemistry · Physics','h3'),table([['Component','Pages'],['New student workbook',str(student_pages)],['New model answers',str(answer_pages)],['Corrections and revised earlier cases',str(counts[2])],['Preserved V4 collection',str(counts[3])],['Complete edition, including this cover',str(total)]]),Spacer(1,18),para('126 new activity-specific cases. All 70 attached V4 cases preserved. 247 interactive questions across V3.1–V5; the earlier book also retains its original core reference material.'),para('Read the correction register before using older questions. The V5 model answers are independent formative guidance; qualified teacher review remains pending.'),para('Fictional datasets · Not official marking schemes · Not laboratory records','small')]
SimpleDocTemplate(str(cover),pagesize=A4,rightMargin=M,leftMargin=M,topMargin=45,bottomMargin=42,title='Practical Mastery V5 - Complete Collection').build(coverstory,onFirstPage=footer)
complete=fitz.open();complete.insert_pdf(fitz.open(cover));toc=[[1,'Complete edition overview',1]]
for title,path in parts:
 toc.append([1,title,len(complete)+1]);complete.insert_pdf(fitz.open(path))
complete.set_toc(toc);complete.set_metadata({'title':'Practical Mastery V5 - Complete Collection','author':'Independent educational study companion','subject':'126 new activity cases, corrected V4 cases and preserved 403-page collection; fictional data; teacher review pending'})
complete.save(OUT/'Practical_Mastery_V5_Complete.pdf',garbage=4,deflate=True)
result={'student_workbook_pages':student_pages,'model_answer_pages':answer_pages,'reconciliation_pages':counts[2],'legacy_collection_pages':counts[3],'complete_pages':len(complete),'legacy_pdf_corrections':legacy_changes,'v4_revised_cases':[c['question_id'] for c in v4changes]}
(WORK/'build/pdf_summary.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
