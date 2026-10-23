(() => {
  'use strict';
  const M=ScienceIntelligence,$=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let shared=new URLSearchParams(location.search).get('share')==='1',dataset=null,progress=M.initialProgress(),storedRaw=null,unreadable=null,recovered=false,pending=null,page=0,activeId='',storageDenied=false,coreIDs=new Set(),coreAttempts=new Map(),hydrated=false;
  let clock={remainingMs:300000,running:false,startedAt:null},clockPhase='';
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const notice=s=>{$('status').textContent=s;};
  function download(name,data,type='application/json'){
    if(shared)return;
    const text=typeof data==='string'?data:JSON.stringify(data,null,2);
    const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');
    a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function hydrate(){
    if(shared)return;
    if(hydrated){preferences();readCore();return;}
    hydrated=true;
    try{storedRaw=localStorage.getItem(M.KEY);if(storedRaw)progress=M.validateProgress(M.parse(storedRaw,3_000_000));}
    catch{unreadable=storedRaw;if(!storedRaw)storageDenied=true;notice(storedRaw?'Saved session bytes are unreadable and preserved. Export them before replacing them.':'Browser storage is unavailable. New session work stays in memory; export before closing.');}
    activeId=progress.sessions.at(-1)?.id||'';preferences();readCore();
  }
  function readCore(){
    coreIDs=new Set();coreAttempts=new Map();
    if(shared)return;
    try{
      const core=JSON.parse(TrinityRead.raw(localStorage,'al_performance_powerhouse_v4')||'{}');
      if(Array.isArray(core.attempts))core.attempts.forEach(r=>{if(typeof r.id==='string'){coreIDs.add(r.id);coreAttempts.set(r.id,r);}});
      $('coreIDs').innerHTML=[...coreIDs].map(id=>'<option value="'+esc(id)+'"></option>').join('');
    }catch{$('coreIDs').innerHTML='';}
  }
  function save(next){
    if(shared)throw Error('Changes are disabled in share-safe view.');
    if(unreadable&&!recovered)throw Error('Export unreadable bytes and review a valid backup first.');
    M.validateProgress(next);next={...next,revision:progress.revision+1};
    try{
      if(!storageDenied&&localStorage.getItem(M.KEY)!==storedRaw)throw Error('Another tab changed session data. Export this page and reload before merging.');
      const text=JSON.stringify(next);
      localStorage.setItem(M.KEY,text);storedRaw=text;unreadable=null;progress=next;
      notice('Saved local session evidence. Canonical Notion records were not changed.');
    }catch(e){
      if(/Another tab/.test(e.message))throw e;
      progress=next;storageDenied=true;notice('Browser could not save. This page retains your changes in memory; export a backup before closing.');
    }
    preferences();renderSession();
  }
  function preferences(){
    $('group').checked=progress.groupEnabled;$('participants').disabled=!progress.groupEnabled;
    $('participants').value=progress.groupEnabled?String(progress.participants):'2';
    $('retest1').value=String(progress.intervals[0]);$('retest2').value=String(progress.intervals[1]);
  }
  function link(url,label){
    const u=M.safeUrl(url);return u?'<a href="'+esc(u)+'" target="_blank" rel="noreferrer">'+esc(label)+'</a>':'<span>Original locator unresolved</span>';
  }
  function filters(){return {subject:$('subject').value,unit:$('unit').value,year:$('year').value,status:$('evidence').value,search:$('search').value};}
  function choices(){
    if(!dataset)return;
    const s=$('subject').value;
    $('unit').innerHTML='<option value="all">All units</option>'+dataset.units[s].map(u=>'<option value="'+esc(u.code)+'">'+esc(u.code+' '+u.name)+'</option>').join('')+'<option value="UNCLASSIFIED">Unclassified</option>';
    $('year').innerHTML='<option value="all">All years</option>'+[...new Set(dataset.records.filter(r=>r.subject===s).map(r=>r.exam_year))].sort().map(y=>'<option>'+y+'</option>').join('');
    $('bioVersion').disabled=s!=='biology';page=0;
  }
  function renderSummary(){
    const p=dataset;$('limitations').textContent=p.limitations.join(' ');
    $('summary').innerHTML=M.SUBJECTS.map(s=>'<article class="science-card"><p class="eyebrow">'+esc(s)+'</p><h3>'+p.counts[s]+' indexed references</h3><p>'+p.units[s].length+' NIE units. '+(s==='chemistry'?'PROVISIONAL, SINGLE-PASS. 127 source-high; 20 boundary; 3 unclassified.':s==='biology'?'Four distributions preserved; chosen candidate includes independent scope checks.':'26-paper denominators retained; source unit validation does not validate answers.')+'</p><button class="button button-quiet" data-subject="'+s+'">Explore '+esc(s)+'</button></article>').join('');
  }
  function matrixRows(){
    const s=$('subject').value,years=s==='physics'?Array.from({length:26},(_,i)=>2000+i):Array.from({length:7},(_,i)=>2019+i);
    return {s,years,rows:M.matrix(dataset,s,years,$('bioVersion').value)};
  }
  function renderMatrix(){
    const {s,years,rows}=matrixRows();
    $('matrixWarning').textContent=s==='chemistry'?'PROVISIONAL, SINGLE-PASS — 150 candidates, three unclassified. Zero means no assigned items in this source corpus; it is not a verified zero.':s==='biology'?'Provisional editorial distribution. Earlier, Claude, audit-copy and current candidate remain selectable. Original-scan classification checks do not establish official answer keys.':'Source-attributed primary units. 60 MCQs through 2010; 50 from 2011. Family report 75/98 disagrees with the CSV recomputation 76/97; 2019 Q26/Q35 retain review flags.';
    $('matrixTable').innerHTML='<caption>'+esc(s)+' Paper I assignments; historical description, not prediction</caption><thead><tr><th scope="col">Unit / teaching periods</th>'+years.map(y=>'<th scope="col">'+y+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr><th scope="row">'+esc(r.code+' '+r.name)+(r.periods?' <small>'+r.periods+' periods</small>':'')+'</th>'+r.cells.map(c=>'<td data-count="'+(c.count===null?'unknown':c.count)+'">'+(c.count===null?'N/A<small>NOT AUDITED</small>':'<a href="#atlas" data-cell-unit="'+r.code+'" data-cell-year="'+c.year+'" aria-label="'+esc(r.name+', '+c.year+', '+c.count+' assigned, '+c.state)+'">'+c.count+'<small>'+((c.share||0)*100).toFixed(1)+'%</small></a><small>'+esc(c.state)+'</small>')+'</td>').join('')+'</tr>').join('')+'</tbody>';
  }
  function renderAtlas(){
    if(!dataset||shared)return;
    const all=M.filter(dataset,filters()),max=Math.max(0,Math.ceil(all.length/24)-1);page=Math.min(page,max);
    $('resultCount').textContent=all.length+' references. National answers are withheld.';
    $('items').innerHTML=all.slice(page*24,(page+1)*24).map(r=>'<article class="science-card"><span class="badge">'+esc(r.classification_status)+'</span><h3>'+esc(r.exam_year+' Q'+r.question_number+' · '+(r.principal_unit||'UNCLASSIFIED'))+'</h3><p>'+esc(r.concept_focus_paraphrase)+'</p><p>'+esc(r.subtopic||'')+(r.family_id?' · '+esc(r.family_id):'')+'</p><p>'+esc(r.review_flag)+'</p><details><summary>Source and verification scope</summary><p>'+esc(r.evidence_tier)+'</p><p>'+esc(r.paper_identity_status)+'</p><p>'+esc(r.source_version)+'</p><p>'+link(r.source_locator,'Open private original-paper locator')+'</p><p>Official answer: withheld. Sitting year: '+esc(r.sitting_year??'not checked')+'</p></details><button class="button button-quiet" data-target="'+esc(r.stable_id)+'">Use as session target</button></article>').join('');
    $('page').textContent='Page '+(page+1)+' / '+(max+1);$('previous').disabled=page===0;$('next').disabled=page===max;
  }
  function renderPaper2(){
    const s=$('subject').value;
    $('paper2Items').innerHTML=s!=='physics'?'<article class="science-card"><h3>NOT AUDITED</h3><p>No complete authenticated historical Paper II corpus has been loaded for this subject. Existing labs and NIE manuals remain available.</p></article>':dataset.paper2.filter(r=>[2024,2025].includes(r.exam_year)).map(r=>'<article class="science-card"><h3>'+r.exam_year+' Paper II A · Q'+r.question_number+'</h3><p>'+esc(r.focus)+'</p><p>Provisional concise source label; '+esc(r.marking_status)+'. MCQ denominator: excluded.</p></article>').join('');
  }
  function renderPractice(){
    const s=$('subject').value;
    $('practiceItems').innerHTML=dataset.original_practice.filter(r=>r.subject===s).map(r=>'<article class="science-card"><span class="badge">ORIGINAL PRACTICE · '+esc(r.unit)+'</span><h3>'+esc(r.question_form)+'</h3><p>'+esc(r.prompt)+'</p><button class="button button-quiet" data-cue="'+esc(r.id)+'">I attempted it — show model cue</button><div id="cue-'+esc(r.id)+'" hidden></div></article>').join('');
  }
  function renderQuality(){
    const s=$('subject').value,ds=dataset.merge_decisions.filter(d=>d.key.startsWith(s+':'));
    $('qualityCounts').textContent=ds.length+' review decisions for '+s+'. All remain undeployed. No official answer validation claimed.';
    $('qualityItems').innerHTML=ds.map(d=>'<article class="science-card"><h3>'+esc(d.key)+'</h3><p>'+esc(d.observed_conflict)+'</p><p>Decision: '+esc(d.decision)+'</p><p>'+esc(d.confidence)+'</p><details><summary>Evidence and reviewer</summary><p>'+esc(d.primary_evidence||'Original-paper evidence not yet checked')+'</p><p>'+esc(d.reviewer)+' · '+esc(d.date)+'</p></details></article>').join('');
    $('sources').innerHTML=dataset.source_register.map(r=>'<p><strong>'+esc(r.filename)+'</strong> · '+esc(r.access)+' · SHA-256 '+esc(r.sha256)+'</p>').join('');
  }
  function renderWorkspace(){
    $('workspace').hidden=!dataset||shared;if(!dataset||shared)return;
    renderSummary();renderMatrix();renderAtlas();renderPaper2();renderPractice();renderQuality();renderSession();
  }
  function selectedDiagnostics(){return dataset?dataset.diagnostics.filter(d=>d.subject===$('sessionSubject').value&&d.set===$('set').value):[];}
  function resetClock(minutes){clock={remainingMs:minutes*60000,running:false,startedAt:null};$('clockMinutes').value=String(minutes);$('clockNotice').textContent='Timer changes create no attempts, marks or completion evidence.';renderClock();}
  function renderClock(){
    if(shared)return;
    const ms=M.clockRemaining(clock),seconds=Math.ceil(ms/1000);$('clockReadout').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    $('clockToggle').textContent=clock.running?'Pause stage timer':'Start stage timer';
    if(clock.running&&ms===0){clock={remainingMs:0,running:false,startedAt:null};$('clockToggle').textContent='Timer finished';$('clockNotice').textContent='Stage budget reached. Choose the next action yourself; no marks or completion were recorded.';}
  }
  function renderSession(){
    if(shared)return;
    const targets=selectedDiagnostics();
    $('start').disabled=!dataset||!!unreadable&&!recovered;$('print').disabled=!dataset;
    $('weekly').innerHTML=(dataset?.weekly_plan||[]).map(w=>'<article class="science-card"><h3>Week '+w.week+'</h3><p>'+esc(w.task)+'</p></article>').join('');
    $('diagnosticItems').innerHTML=targets.map(d=>'<article class="science-card"><span class="badge">'+esc(d.confidence)+'</span><h3>Set '+d.set+' · '+esc(d.exam_year+' Q'+d.question_number+' · '+d.principal_unit)+'</h3><p>'+esc(d.concept_focus_paraphrase)+'</p><p>'+esc(d.authentication_status)+'</p><p>'+link(d.original_paper_locator,'Open private source')+'</p><p>'+esc(d.review_flag)+'</p></article>').join('');
    const previous=$('target').value;$('target').innerHTML='<option value="">Select actual question</option>'+targets.map(d=>'<option value="'+esc(d.stable_id)+'">'+esc(d.exam_year+' Q'+d.question_number+' · '+d.principal_unit)+'</option>').join('');if(targets.some(d=>d.stable_id===previous))$('target').value=previous;
    const session=progress.sessions.find(s=>s.id===activeId);
    $('resumeSession').innerHTML='<option value="">Choose a saved plan</option>'+progress.sessions.slice().reverse().map(s=>'<option value="'+esc(s.id)+'">'+esc(s.date+' · '+s.subject+' Set '+s.set+' · '+(s.closed?'closed':'phase '+(s.phase+1)))+'</option>').join('');$('resumeSession').value=activeId;
    const baseline=$('sourceRecord').value;$('sourceRecord').innerHTML='<option value="">No baseline linked</option>'+progress.records.filter(r=>r.role==='baseline'&&r.subject===(session?.subject||$('sessionSubject').value)).map(r=>'<option value="'+esc(r.id)+'">'+esc(r.date+' · '+r.reference_id+' · '+r.earned+'/'+r.total)+'</option>').join('');if(progress.records.some(r=>r.id===baseline))$('sourceRecord').value=baseline;
    const reviews=M.followups(progress,today());$('followups').innerHTML=reviews.length?reviews.map(r=>'<article class="science-card"><span class="badge">'+esc(r.state==='recorded'?'Retest recorded · self-reported':r.state==='repair'?'Retest failed · repair needed':r.state==='due'?'Scheduled check due':'Scheduled check ahead')+'</span><h3>'+esc(r.reference_id)+'</h3><p>Check '+r.stage+' · '+r.due+'</p>'+(r.state==='recorded'?'':'<button type="button" class="button button-quiet" data-review-source="'+esc(r.source_id)+'">Prepare this check</button>')+'</article>').join(''):'<p>No checks scheduled from an exposed baseline error. Mark a real attempt to start.</p>';
    $('sessionState').innerHTML=session?'<h3>'+esc(session.subject+' Set '+session.set)+'</h3><p>Session '+esc(session.id)+' · '+esc(session.date)+'</p><p>Phase '+(session.phase+1)+' / 7 · '+esc(M.STAGES[session.phase])+'</p><p>A phase change records workflow position only. It creates no marks or mastery.</p>':'<p>No active session plan. Create one after importing a private corpus.</p>';
    $('advance').disabled=!session||session.closed||session.phase===6||!!unreadable&&!recovered;$('submitEvidence').disabled=!session||session.closed||!dataset||!!unreadable&&!recovered;
    $('clockToggle').disabled=!session||session.closed;$('clockReset').disabled=!session||session.closed;$('finishSession').disabled=!session||session.closed;
    const phase=session?session.id+':'+session.phase:'';if(phase!==clockPhase){clockPhase=phase;resetClock(M.PHASE_MINUTES[session?.phase||0]);}renderClock();
    $('history').innerHTML='<h3>'+progress.records.length+' submitted local evidence records</h3>'+progress.records.slice().reverse().map(r=>'<article class="science-card"><h3>'+esc(r.reference_id)+' · '+esc(r.role)+'</h3><p>'+r.earned+'/'+r.total+' · '+r.minutes+' minutes · guesses '+r.guesses+' · '+esc(r.date)+'</p><p>'+esc(r.error)+'</p><p>'+esc(r.repair)+'</p><p>Retests '+r.retest_dates.map(esc).join(' / ')+'</p><p>Core attempt '+esc(r.core_attempt_id||'not linked')+' · no retention or mastery awarded</p></article>').join('');
  }
  function applyShare(){
    document.body.classList.toggle('share-safe',shared);$('share').setAttribute('aria-pressed',String(shared));$('shareNotice').hidden=!shared;
    document.querySelectorAll('.private-area input,.private-area button,.private-area select,.private-area textarea').forEach(e=>{e.disabled=shared;});
    document.querySelectorAll('nav a').forEach(a=>{const u=new URL(a.href,location.href);if(shared)u.searchParams.set('share','1');else u.searchParams.delete('share');a.href=u.href;});
    for(const n of ['home','verification']){const a=$(n),u=new URL(a.href,location.href);if(shared)u.searchParams.set('share','1');else u.searchParams.delete('share');a.href=u.href;}
    if(shared){clock={remainingMs:M.clockRemaining(clock),running:false,startedAt:null};for(const n of ['items','summary','matrixTable','qualityItems','sources','history','sessionState','diagnosticItems','practiceItems','paper2Items','weekly','printWorksheet','coreIDs','target','resumeSession','sourceRecord','followups'])$(n).innerHTML='';$('workspace').hidden=true;$('importPreview').hidden=true;pending=null;}
    else{hydrate();if(dataset)choices();renderWorkspace();renderSession();}
  }
  async function readFile(file,kind){
    if(shared||!file)return;
    if(file.size>12_000_000)throw Error('File is too large.');
    const value=M.parse(await file.text());
    let importedDataset=null,importedProgress=null;
    if(kind==='package'&&value.schema==='powerhouse-science-package')importedDataset=M.validatePackage(value);
    else if(value.schema==='powerhouse-science-backup'){if(value.dataset)importedDataset=M.validatePackage(value.dataset);importedProgress=M.validateProgress(value.progress);}
    else importedProgress=M.validateProgress(value);
    const merged=importedProgress?M.mergeProgress(progress,importedProgress):null;
    pending={dataset:importedDataset,progress:merged?.candidate||null,conflicts:merged?.conflicts||[]};
    $('previewText').textContent=(importedDataset?importedDataset.records.length+' references, 70 diagnostic positions. ':'')+(merged?merged.added+' new evidence records; '+merged.conflicts.length+' conflicting IDs. Existing records are preserved.':'No evidence records will be created.')+(unreadable&&!recovered?' Export unreadable bytes before applying.':'');
    $('confirmImport').disabled=!!pending.conflicts.length||!!unreadable&&!recovered;$('importPreview').hidden=false;
  }
  function useTarget(id){
    const r=dataset.records.find(r=>r.stable_id===id);if(!r)return;
    $('sessionSubject').value=r.subject;renderSession();
    const option=document.createElement('option');option.value=id;option.textContent=r.exam_year+' Q'+r.question_number+' · selected atlas target';$('target').appendChild(option);$('target').value=id;$('sessions').scrollIntoView({behavior:'smooth'});$('target').focus();
  }
  function guard(fn){return async e=>{try{await fn(e);}catch(error){notice(error.message||'Action failed; previous data preserved.');}};}
  $('packageFile').addEventListener('change',guard(e=>readFile(e.target.files?.[0],'package')));
  $('progressFile').addEventListener('change',guard(e=>readFile(e.target.files?.[0],'progress')));
  $('confirmImport').addEventListener('click',guard(()=>{
    if(shared||!pending||pending.conflicts.length||unreadable&&!recovered)throw Error('Resolve the import conflict or recovery gate first.');
    if(pending.progress)save(pending.progress);
    if(pending.dataset){dataset=pending.dataset;choices();}
    pending=null;$('importPreview').hidden=true;notice('Private corpus opened locally. Official answers remain withheld.');renderWorkspace();renderSession();
  }));
  $('cancelImport').addEventListener('click',()=>{pending=null;$('importPreview').hidden=true;});
  $('backup').addEventListener('click',()=>download('powerhouse-science-private-backup.json',{schema:'powerhouse-science-backup',version:1,dataset,progress}));
  $('bridge').addEventListener('click',guard(()=>download('notion-manual-review.json',M.bridge(progress))));
  $('recover').addEventListener('click',()=>{if(unreadable!==null){download('science-unreadable-recovery.txt',unreadable,'text/plain');recovered=true;notice('Original unreadable bytes exported. Import and review a valid backup before replacing them.');if(pending)$('confirmImport').disabled=!!pending.conflicts.length;}else notice('No unreadable stored payload was found.');});
  $('share').addEventListener('click',()=>{shared=!shared;const u=new URL(location.href);if(shared)u.searchParams.set('share','1');else u.searchParams.delete('share');history.replaceState(null,'',u);applyShare();});
  $('subject').addEventListener('change',()=>{choices();renderWorkspace();});
  $('bioVersion').addEventListener('change',renderMatrix);
  for(const n of ['unit','year','evidence','search'])$(n).addEventListener(n==='search'?'input':'change',()=>{page=0;renderAtlas();});
  $('previous').addEventListener('click',()=>{page=Math.max(0,page-1);renderAtlas();});$('next').addEventListener('click',()=>{page++;renderAtlas();});
  $('matrixCSV').addEventListener('click',()=>{if(!dataset||shared)return;const {s,rows}=matrixRows();download(s+'-matrix.csv',M.csv(rows.flatMap(r=>r.cells.map(c=>({unit:r.code,year:c.year,count:c.count,share:c.share,status:c.state,reference_ids:c.ids}))),['unit','year','count','share','status','reference_ids']),'text/csv');});
  $('atlasCSV').addEventListener('click',()=>{if(!dataset||shared)return;download('science-filtered-references.csv',M.csv(M.filter(dataset,filters()),['stable_id','subject','exam_year','sitting_year','question_number','principal_unit','classification_status','answer_status','concept_focus_paraphrase','review_flag']),'text/csv');});
  $('group').addEventListener('change',()=>{$('participants').disabled=!$('group').checked;});
  $('settings').addEventListener('click',guard(()=>save({...progress,groupEnabled:$('group').checked,participants:$('group').checked?Number($('participants').value):1,intervals:[Number($('retest1').value),Number($('retest2').value)]})));
  for(const n of ['sessionSubject','set'])$(n).addEventListener('change',renderSession);
  $('start').addEventListener('click',guard(()=>{
    if(!dataset)throw Error('Import the private corpus first.');
    const s={id:crypto.randomUUID(),subject:$('sessionSubject').value,set:$('set').value,date:today(),phase:0,closed:false};
    save({...progress,sessions:[...progress.sessions,s]});activeId=s.id;renderSession();
  }));
  $('advance').addEventListener('click',guard(()=>{const s=progress.sessions.find(s=>s.id===activeId);if(!s||s.phase>=6)return;save({...progress,sessions:progress.sessions.map(x=>x.id===s.id?{...x,phase:x.phase+1}:x)});}));
  $('resumeSession').addEventListener('change',()=>{const s=progress.sessions.find(s=>s.id===$('resumeSession').value);if(shared||!s)return;activeId=s.id;$('sessionSubject').value=s.subject;$('set').value=s.set;renderSession();});
  $('finishSession').addEventListener('click',guard(()=>{const s=progress.sessions.find(s=>s.id===activeId);if(!s||shared)return;clock={remainingMs:M.clockRemaining(clock),running:false,startedAt:null};save({...progress,sessions:progress.sessions.map(x=>x.id===s.id?{...x,closed:true}:x)});}));
  $('clockToggle').addEventListener('click',()=>{if(shared||$('clockToggle').disabled)return;const remaining=M.clockRemaining(clock);if(clock.running)clock={remainingMs:remaining,running:false,startedAt:null};else if(remaining>0)clock={remainingMs:remaining,running:true,startedAt:Date.now()};renderClock();});
  $('clockReset').addEventListener('click',guard(()=>{if(shared)return;const minutes=Number($('clockMinutes').value);if(!Number.isInteger(minutes)||minutes<1||minutes>180)throw Error('Choose a stage budget from 1 to 180 whole minutes.');resetClock(minutes);}));
  $('evidenceForm').addEventListener('submit',guard(e=>{
    e.preventDefault();if(!dataset)throw Error('Import the private corpus first.');
    const session=progress.sessions.find(s=>s.id===activeId),target=dataset.records.find(r=>r.stable_id===$('target').value);
    if(!session||session.closed||!target||target.subject!==session.subject)throw Error('Choose an actual question in an open session for that subject.');
    const core=$('coreAttempt').value.trim();if(core&&!coreIDs.has(core))throw Error('The linked core attempt ID was not found in this browser. Record it in Command first.');
    const record={id:crypto.randomUUID(),subject:target.subject,reference_id:target.stable_id,session_id:session.id,role:$('role').value,earned:Number($('earned').value),total:Number($('total').value),guesses:Number($('guesses').value),minutes:Number($('minutes').value),date:$('date').value,marking_source:$('markingSource').value.trim(),error:$('error').value.trim(),repair:$('repair').value.trim(),unaided:$('unaided').checked,fresh:$('fresh').checked,core_attempt_id:core,source_record_id:$('sourceRecord').value||'',retest_dates:M.retestDates($('date').value,progress.intervals)};
    if(core){const a=coreAttempts.get(core);if(a.subject!==record.subject||a.date!==record.date||Number(a.earned)!==record.earned||Number(a.total)!==record.total||Number(a.guesses||0)!==record.guesses)throw Error('The linked Command record does not match subject, date, marks and guesses. Keep separate records separate.');}
    if(record.role==='transfer'&&(!record.fresh||progress.records.some(r=>r.reference_id===record.reference_id)))throw Error('A fresh transfer needs a genuinely unseen reference.');
    save({...progress,records:[...progress.records,record]});
  }));
  $('print').addEventListener('click',()=>{
    if(shared||!dataset)return;const ds=selectedDiagnostics();
    $('printWorksheet').innerHTML='<h1>Private diagnostic worksheet</h1><p>'+esc($('sessionSubject').value)+' · Set '+esc($('set').value)+' · '+ds.length+' provisional references</p><p>Use the original papers. No keys are included. Mark guesses before consulting a scheme.</p><table><thead><tr><th>Year / Q</th><th>Unit</th><th>My response</th><th>Guessed?</th><th>Scheme mark</th></tr></thead><tbody>'+ds.map(d=>'<tr><td>'+d.exam_year+' Q'+d.question_number+'</td><td>'+esc(d.principal_unit)+'</td><td>____________</td><td>___</td><td>___</td></tr>').join('')+'</tbody></table><h2>Diagnose → minimum repair → reattempt → fresh transfer</h2><div class="writing-lines"></div><p>Retest intervals: '+progress.intervals.join(' and ')+' days. Record real evidence in Command and link it in the Verification Desk.</p>';window.print();
  });
  document.addEventListener('click',e=>{
    if(shared||!dataset)return;
    const b=e.target.closest?.('[data-subject],[data-cell-unit],[data-target],[data-cue],[data-review-source]');if(!b)return;
    if(b.dataset.reviewSource){const r=progress.records.find(r=>r.id===b.dataset.reviewSource);if(!r)return;const s=progress.sessions.find(s=>s.id===r.session_id);if(s&&!s.closed){activeId=s.id;$('sessionSubject').value=s.subject;$('set').value=s.set;renderSession();}$('sourceRecord').value=r.id;$('role').value='delayed-retest';$('date').value=today();notice('Baseline linked. Choose the actual check question and its scheme; a plan is not a completed retest.');$('evidenceForm').scrollIntoView({behavior:'smooth'});}
    if(b.dataset.subject){$('subject').value=b.dataset.subject;choices();renderWorkspace();$('heatmap').scrollIntoView();}
    if(b.dataset.cellUnit){$('unit').value=b.dataset.cellUnit;$('year').value=b.dataset.cellYear;page=0;renderAtlas();}
    if(b.dataset.target)useTarget(b.dataset.target);
    if(b.dataset.cue){const r=dataset.original_practice.find(r=>r.id===b.dataset.cue);const el=$('cue-'+r.id);el.textContent=r.answer_cue+' '+r.marking_insight+' Original model cue; not an official scheme.';el.hidden=false;}
  });
  window.addEventListener('storage',e=>{if(!shared&&['al_performance_powerhouse_v4','al_performance_powerhouse_v4__trinity_checkpoint_v1'].includes(e.key))readCore();if(!shared&&e.key===M.KEY&&e.newValue!==storedRaw)notice('Session data changed in another tab. Export this page, reload and review a merge before editing.');});
  $('date').value=today();applyShare();
  if(typeof setInterval==='function')setInterval(renderClock,500);
})();
