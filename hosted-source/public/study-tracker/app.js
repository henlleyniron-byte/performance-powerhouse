const STORAGE_KEY = 'al_performance_powerhouse_study_tracker_v1';
const CHANNEL_NAME = 'performance-powerhouse-study-tracker-v1';
const TIMEZONE = 'Asia/Colombo';
const SESSION_TYPES = [
  ['timed-paper','Timed paper'],['mcq-set','MCQ set'],['structured-questions','Structured questions'],
  ['essay','Essay'],['active-recall','Active recall'],['closed-book-reattempt','Closed-book reattempt'],
  ['repair','Repair'],['fresh-transfer','Fresh transfer'],['delayed-retest','Delayed retest'],
  ['targeted-theory-repair','Targeted theory repair'],['lecture-class','Lecture / class'],
  ['resource-admin','Resource / admin'],['legacy-output','Imported legacy output']
];
const TYPE_LABELS = Object.fromEntries(SESSION_TYPES);
const SUBJECT_LABELS = {physics:'Physics',chemistry:'Chemistry',biology:'Biology',other:'Other'};
const SUBJECT_COLORS = {physics:'#72c7ff',chemistry:'#f89cc0',biology:'#78e6b0',other:'#ffd166'};
const EVIDENCE_KINDS = new Set(['marked-attempt','repair','retest','fresh-transfer','closed-book-recall','theory-repair']);
const PASSIVE_TYPES = new Set(['lecture-class','resource-admin']);
const $ = id => document.getElementById(id);
const channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANNEL_NAME) : null;
let pendingCompletion = null;
let toastHandle = null;
let syncRunning = false;
let volatileState = null;
let storageFailed = false;

function defaultState(){
  return {version:1,sessions:[],goals:[],preferences:{timezone:TIMEZONE,defaultMinutes:90,shareSafe:false},active:null,sync:{queue:[],lastSyncedAt:null,status:'local'},migrations:[]};
}

function uid(prefix='session'){
  const core = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${core}`;
}

function safeJson(value,fallback){try{return JSON.parse(value)}catch{return fallback}}

function normalizeSession(raw){
  const now = new Date().toISOString();
  return {
    id:String(raw?.id||uid()),subject:['physics','chemistry','biology','other'].includes(raw?.subject)?raw.subject:'other',
    topic:String(raw?.topic||'').slice(0,240),sessionType:TYPE_LABELS[raw?.sessionType]?raw.sessionType:'targeted-theory-repair',
    status:raw?.status==='active'?'active':'completed',startedAt:validIso(raw?.startedAt)||now,endedAt:validIso(raw?.endedAt)||null,
    durationSeconds:boundedInt(raw?.durationSeconds,0,86400),plannedDurationSeconds:boundedInt(raw?.plannedDurationSeconds,0,86400),
    notes:String(raw?.notes||'').slice(0,4000),linkedAttemptId:String(raw?.linkedAttemptId||'').slice(0,100),
    evidenceKind:String(raw?.evidenceKind||'none').slice(0,60),outputCount:boundedInt(raw?.outputCount,0,100000),
    outputUnit:String(raw?.outputUnit||'').slice(0,40),source:String(raw?.source||'powerhouse-study-tracker').slice(0,80),
    metadata:raw?.metadata&&typeof raw.metadata==='object'?raw.metadata:{},clientUpdatedAt:validIso(raw?.clientUpdatedAt)||now,
    syncState:raw?.syncState==='synced'?'synced':'pending'
  };
}

function validIso(value){if(!value)return null;const d=new Date(value);return Number.isNaN(d.getTime())?null:d.toISOString()}
function boundedInt(value,min,max){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):min}

function loadState(){
  let raw;try{raw=safeJson(localStorage.getItem(STORAGE_KEY),null)}catch{storageFailed=true;raw=volatileState}const base=defaultState();
  if(!raw||typeof raw!=='object')return base;
  base.sessions=Array.isArray(raw.sessions)?raw.sessions.map(normalizeSession):[];
  base.goals=Array.isArray(raw.goals)?raw.goals:[];base.migrations=Array.isArray(raw.migrations)?raw.migrations:[];
  base.preferences={...base.preferences,...(raw.preferences||{})};base.active=raw.active&&typeof raw.active==='object'?raw.active:null;
  base.sync={...base.sync,...(raw.sync||{}),queue:Array.isArray(raw.sync?.queue)?raw.sync.queue:[]};return base;
}

let state=loadState();

function saveState(notify=true){
  volatileState=state;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageFailed=false}catch{storageFailed=true}
  const warning=$('storageWarning');if(warning){warning.hidden=!storageFailed;warning.textContent=storageFailed?'Browser storage is unavailable. This session remains open, but export a backup before closing. Cloud sync has a separate status below.':''}
  if(notify)channel?.postMessage({type:'state-updated',at:Date.now()});
}

function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove('show'),2600)}
function escapeAttribute(value){return escapeHTML(value).replaceAll('\"','&quot;')}
function escapeHTML(value){const d=document.createElement('div');d.textContent=String(value??'');return d.innerHTML}

function colomboDay(value=new Date()){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
  const get=t=>parts.find(p=>p.type===t)?.value;return `${get('year')}-${get('month')}-${get('day')}`;
}
function localDateLabel(value){return new Intl.DateTimeFormat('en-GB',{timeZone:TIMEZONE,day:'2-digit',month:'short',year:'numeric'}).format(new Date(value))}
function durationLabel(seconds){const mins=Math.round(Number(seconds||0)/60);if(mins<60)return `${mins}m`;const h=Math.floor(mins/60),m=mins%60;return `${h}h${m?` ${m}m`:''}`}
function recentSessions(days=7){const cut=Date.now()-days*86400000;return state.sessions.filter(s=>new Date(s.startedAt).getTime()>=cut)}
function isEvidence(session){return EVIDENCE_KINDS.has(session.evidenceKind)}

function populateSelects(){
  const options=SESSION_TYPES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  $('sessionType').innerHTML=options;$('editType').innerHTML=options;
  $('historyType').innerHTML='<option value="all">All session types</option>'+options;
}

function applyCommandBridge(){
  const q=new URLSearchParams(location.search);const subject=q.get('subject');const type=q.get('type');const minutes=Number(q.get('minutes'));const topic=q.get('topic')||q.get('task');
  if(subject&&SUBJECT_LABELS[subject])$('subject').value=subject;
  if(type&&TYPE_LABELS[type])$('sessionType').value=type;
  if(Number.isFinite(minutes)&&minutes>0&&minutes<=720)$('plannedMinutes').value=String(minutes);
  if(topic)$('topic').value=topic.slice(0,240);
  if(subject||type||minutes||topic){$('commandBridge').hidden=false;$('bridgeTitle').textContent=topic||`${SUBJECT_LABELS[subject]||'Recommended'} block ready`;$('bridgeCopy').textContent=`${SUBJECT_LABELS[subject]||'Powerhouse'} · ${TYPE_LABELS[type]||'focused session'} · ${minutes||$('plannedMinutes').value} minutes`;}
  if(q.get('share')==='1')toggleShareSafe(true);
}

function activeElapsed(active=state.active,now=Date.now()){
  if(!active)return 0;const prior=Number(active.elapsedBeforeRun||0);return Math.max(0,Math.floor(prior+(active.status==='running'&&active.runStartedAt?(now-active.runStartedAt)/1000:0)));
}

function renderTimer(){
  const active=state.active;const elapsed=activeElapsed(active);const h=Math.floor(elapsed/3600),m=Math.floor(elapsed%3600/60),s=elapsed%60;
  $('timerDisplay').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const planned=Number(active?.plannedDurationSeconds||Number($('plannedMinutes').value||90)*60);$('timerProgress').style.width=`${planned?Math.min(100,elapsed/planned*100):0}%`;
  const running=active?.status==='running',paused=active?.status==='paused';$('timerState').textContent=running?'Running':paused?'Paused':'Ready';
  $('startButton').disabled=!!active;$('pauseButton').disabled=!active;$('stopButton').disabled=!active;$('cancelButton').disabled=!active;
  $('pauseButton').textContent=paused?'Resume':'Pause';
  document.querySelectorAll('#sessionSetup input,#sessionSetup select').forEach(el=>el.disabled=!!active);
  if(active){$('subject').value=active.subject;$('sessionType').value=active.sessionType;$('topic').value=active.topic;$('plannedMinutes').value=String(Math.round(active.plannedDurationSeconds/60));}
}

function startSession(){
  const latest=loadState();if(latest.active){state=latest;renderAll();toast('Another tab already has an active block.');return}
  const now=Date.now();state.active={id:uid(),subject:$('subject').value,sessionType:$('sessionType').value,topic:$('topic').value.trim(),plannedDurationSeconds:boundedInt(Number($('plannedMinutes').value)*60,60,86400),outputIntent:$('outputIntent').value,startedAt:new Date(now).toISOString(),runStartedAt:now,elapsedBeforeRun:0,status:'running'};
  saveState();channel?.postMessage({type:'active-started',id:state.active.id});renderAll();toast('Focused block started.');
}

function pauseResume(){
  if(!state.active)return;const now=Date.now();
  if(state.active.status==='running'){state.active.elapsedBeforeRun=activeElapsed(state.active,now);state.active.runStartedAt=null;state.active.status='paused';toast('Timer paused.');}
  else{state.active.runStartedAt=now;state.active.status='running';toast('Timer resumed.');}
  saveState();renderTimer();
}

function finishSession(){
  if(!state.active)return;const endedAt=new Date().toISOString();const durationSeconds=activeElapsed(state.active);
  pendingCompletion=normalizeSession({...state.active,status:'completed',endedAt,durationSeconds,evidenceKind:state.active.outputIntent||'none',clientUpdatedAt:endedAt,syncState:'pending'});
  state.active=null;saveState();$('completionSummary').textContent=`${SUBJECT_LABELS[pendingCompletion.subject]} · ${TYPE_LABELS[pendingCompletion.sessionType]} · ${durationLabel(durationSeconds)}${pendingCompletion.topic?` · ${pendingCompletion.topic}`:''}`;
  $('evidenceKind').value=EVIDENCE_KINDS.has(pendingCompletion.evidenceKind)?pendingCompletion.evidenceKind:'none';$('outputCount').value='0';$('outputUnit').value='';$('linkedAttemptId').value='';$('sessionNotes').value='';updateEvidenceLink();$('completionDialog').showModal();renderAll();
}

function cancelActive(){
  if(!state.active)return;if(!confirm('Discard this active timer? No completed session will be created.'))return;
  state.active=null;saveState();renderAll();toast('Active block discarded.');
}

function completePending(forceNone=false){
  if(!pendingCompletion)return;const now=new Date().toISOString();
  pendingCompletion.evidenceKind=forceNone?'none':$('evidenceKind').value;pendingCompletion.outputCount=boundedInt($('outputCount').value,0,100000);pendingCompletion.outputUnit=$('outputUnit').value.trim().slice(0,40);pendingCompletion.linkedAttemptId=$('linkedAttemptId').value.trim().slice(0,100);pendingCompletion.notes=$('sessionNotes').value.trim().slice(0,4000);pendingCompletion.clientUpdatedAt=now;
  upsertLocalSession(pendingCompletion);const saved=pendingCompletion;pendingCompletion=null;$('completionDialog').close();renderAll();toast(saved.evidenceKind==='none'?'Session saved without exam evidence.':'Session and output evidence saved.');
}

function upsertLocalSession(session){
  const clean=normalizeSession(session);const index=state.sessions.findIndex(s=>s.id===clean.id);if(index>=0)state.sessions[index]=clean;else state.sessions.unshift(clean);
  queueSync({action:'upsert-session',session:clean});saveState();
}

function queueSync(item){
  if(item.action==='upsert-session')state.sync.queue=state.sync.queue.filter(q=>!(q.action==='upsert-session'&&q.session?.id===item.session.id));
  if(item.action==='delete-session')state.sync.queue=state.sync.queue.filter(q=>q.session?.id!==item.id&&q.id!==item.id);
  state.sync.queue.push(item);state.sync.status='pending';
}

function updateEvidenceLink(){
  if(!pendingCompletion)return;const map={'timed-paper':'full-paper','mcq-set':'mcq-set','structured-questions':'structured-essay','essay':'essay','closed-book-reattempt':'reattempt','fresh-transfer':'fresh-transfer','delayed-retest':'delayed-retest'};
  const q=new URLSearchParams({log:'1',subject:pendingCompletion.subject,attemptType:map[pendingCompletion.sessionType]||'topic-question',trackerSession:pendingCompletion.id});
  $('openEvidenceLogger').href=`../index.html?${q.toString()}#attempts`;
}

function renderMetrics(){
  const recent=recentSessions(7),evidence=recent.filter(isEvidence),completed=recent.length,passive=recent.filter(s=>PASSIVE_TYPES.has(s.sessionType));
  const seconds=recent.reduce((a,s)=>a+s.durationSeconds,0),passiveSeconds=passive.reduce((a,s)=>a+s.durationSeconds,0);
  $('metricEvidence').textContent=String(evidence.length);$('metricConversion').textContent=completed?`${Math.round(evidence.length/completed*100)}%`:'—';$('metricTime').textContent=durationLabel(seconds);$('metricPassive').textContent=durationLabel(passiveSeconds);$('metricStreak').textContent=`${evidenceStreak()}d`;
}

function evidenceStreak(){
  const days=new Set(state.sessions.filter(isEvidence).map(s=>colomboDay(s.startedAt)));let streak=0,cursor=new Date();
  if(!days.has(colomboDay(cursor)))cursor=new Date(cursor.getTime()-86400000);
  while(days.has(colomboDay(cursor))){streak++;cursor=new Date(cursor.getTime()-86400000)}return streak;
}

function renderSubjectBars(){
  const recent=recentSessions(30);const stats=Object.fromEntries(Object.keys(SUBJECT_LABELS).map(k=>[k,{seconds:0,evidence:0}]));
  recent.forEach(s=>{stats[s.subject].seconds+=s.durationSeconds;if(isEvidence(s))stats[s.subject].evidence++});const max=Math.max(1,...Object.values(stats).map(v=>v.seconds));
  $('subjectBars').innerHTML=Object.entries(stats).map(([subject,v])=>`<div class="subject-row"><b>${SUBJECT_LABELS[subject]}</b><div class="subject-track"><span style="width:${v.seconds/max*100}%;background:${SUBJECT_COLORS[subject]}"></span></div><small>${durationLabel(v.seconds)} · ${v.evidence} evidence</small></div>`).join('');
}

function daySeries(count=56){const out=[];const today=new Date();for(let i=count-1;i>=0;i--)out.push(colomboDay(new Date(today.getTime()-i*86400000)));return out}

function renderHeatmap(){
  const mode=$('heatmapMode').value;const days=daySeries();const values=Object.fromEntries(days.map(d=>[d,0]));
  state.sessions.forEach(s=>{const d=colomboDay(s.startedAt);if(!(d in values))return;if(mode==='minutes')values[d]+=s.durationSeconds/60;else if(mode==='evidence'&&isEvidence(s))values[d]+=1;else if(mode==='repairs'&&s.evidenceKind==='repair')values[d]+=1;else if(mode==='retests'&&s.evidenceKind==='retest')values[d]+=1});
  const max=Math.max(1,...Object.values(values));$('heatmap').innerHTML=days.map(d=>{const value=values[d],level=value?Math.max(1,Math.ceil(value/max*4)):0;return `<span class="heat-cell l${level}" title="${d}: ${Math.round(value*10)/10}" aria-label="${d}: ${Math.round(value*10)/10}"></span>`}).join('');
  const total=Object.values(values).reduce((a,b)=>a+b,0);$('heatmapSummary').textContent=`Last 8 weeks · ${Math.round(total*10)/10} ${mode==='minutes'?'focused minutes':mode}. Darker squares are descriptive, not a mastery score.`;
}

function filteredSessions(){
  const search=$('historySearch').value.trim().toLowerCase(),subject=$('historySubject').value,type=$('historyType').value,evidence=$('historyEvidence').value;
  return [...state.sessions].filter(s=>(subject==='all'||s.subject===subject)&&(type==='all'||s.sessionType===type)&&(evidence==='all'||(evidence==='linked'?isEvidence(s):!isEvidence(s)))&&(!search||`${s.topic} ${s.notes} ${s.outputUnit} ${TYPE_LABELS[s.sessionType]}`.toLowerCase().includes(search))).sort((a,b)=>b.startedAt.localeCompare(a.startedAt));
}

function renderHistory(){
  const rows=filteredSessions();$('historyBody').innerHTML=rows.length?rows.map(s=>`<tr><td class="private-value">${localDateLabel(s.startedAt)}<small>${new Intl.DateTimeFormat('en-GB',{timeZone:TIMEZONE,hour:'2-digit',minute:'2-digit'}).format(new Date(s.startedAt))}</small></td><td>${SUBJECT_LABELS[s.subject]}</td><td><strong>${TYPE_LABELS[s.sessionType]}</strong><small>${escapeHTML(s.topic||'No topic recorded')}</small></td><td>${durationLabel(s.durationSeconds)}</td><td><span class="tag ${isEvidence(s)?'good':'warn'}">${escapeHTML(s.evidenceKind==='none'?'No evidence':s.evidenceKind)}</span><small>${s.outputCount?`${s.outputCount} ${escapeHTML(s.outputUnit)}`:''}</small></td><td><span class="tag ${s.syncState==='synced'?'good':'warn'}">${s.syncState==='synced'?'Synced':'Pending'}</span></td><td><div class="row-actions"><button class="mini-button" data-edit="${escapeAttribute(s.id)}">Edit</button><button class="mini-button delete" data-delete="${escapeAttribute(s.id)}">Delete</button></div></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty">No sessions match these filters. Complete one focused block before optimizing the tracker.</div></td></tr>';
}

function weekBounds(){const today=new Date(colomboDay()+'T12:00:00Z'),day=(today.getUTCDay()+6)%7,start=new Date(today.getTime()-day*86400000),end=new Date(start.getTime()+6*86400000);return{start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)}}
function renderGoal(){
  const bounds=weekBounds(),goal=state.goals.find(g=>g.period==='weekly'&&g.metric==='evidence-sessions'&&g.startDate===bounds.start);const target=Number(goal?.target||5);$('goalTarget').value=String(target);
  const count=state.sessions.filter(s=>isEvidence(s)&&colomboDay(s.startedAt)>=bounds.start&&colomboDay(s.startedAt)<=bounds.end).length;$('goalBar').style.width=`${Math.min(100,count/target*100)}%`;$('goalSummary').textContent=`${count}/${target} evidence-producing sessions this week. The goal rewards useful output, not desk time.`;
}

function saveGoal(event){event.preventDefault();const bounds=weekBounds(),goal={id:`weekly-evidence-${bounds.start}`,period:'weekly',metric:'evidence-sessions',target:boundedInt($('goalTarget').value,1,50),startDate:bounds.start,endDate:bounds.end,updatedAt:new Date().toISOString()};const i=state.goals.findIndex(g=>g.id===goal.id);if(i>=0)state.goals[i]=goal;else state.goals.push(goal);queueSync({action:'save-goal',goal});saveState();renderGoal();toast('Realistic weekly evidence goal saved.');}

function editSession(id){const s=state.sessions.find(x=>x.id===id);if(!s)return;$('editId').value=s.id;$('editSubject').value=s.subject;$('editType').value=s.sessionType;$('editTopic').value=s.topic;$('editDuration').value=String(Math.round(s.durationSeconds/60));$('editEvidence').value=s.evidenceKind;$('editNotes').value=s.notes;$('editDialog').showModal()}
function saveEdit(event){event.preventDefault();const s=state.sessions.find(x=>x.id===$('editId').value);if(!s)return;s.subject=$('editSubject').value;s.sessionType=$('editType').value;s.topic=$('editTopic').value.trim().slice(0,240);s.durationSeconds=boundedInt(Number($('editDuration').value)*60,0,86400);s.evidenceKind=$('editEvidence').value;s.notes=$('editNotes').value.trim().slice(0,4000);s.clientUpdatedAt=new Date().toISOString();s.syncState='pending';upsertLocalSession(s);$('editDialog').close();renderAll();toast('Session corrected without losing its identity.');}

function deleteSession(id){const s=state.sessions.find(x=>x.id===id);if(!s||!confirm(`Delete “${s.topic||TYPE_LABELS[s.sessionType]}”? This removes the session from local and synced history.`))return;state.sessions=state.sessions.filter(x=>x.id!==id);queueSync({action:'delete-session',id});saveState();renderAll();toast('Session deleted.');}

function download(name,content,type='application/json'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportJson(){download(`powerhouse-study-tracker-${colomboDay()}.json`,JSON.stringify({kind:'performance-powerhouse-study-tracker-backup',version:1,exportedAt:new Date().toISOString(),studyTracker:state},null,2))}
function csvCell(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
function exportCsv(){const columns=['id','startedAt','endedAt','subject','sessionType','topic','durationSeconds','plannedDurationSeconds','evidenceKind','outputCount','outputUnit','linkedAttemptId','notes','source'];const lines=[columns.join(','),...state.sessions.map(s=>columns.map(c=>csvCell(s[c])).join(','))];download(`powerhouse-study-tracker-${colomboDay()}.csv`,lines.join('\n'),'text/csv')}

async function checksum(value){const bytes=new TextEncoder().encode(value),digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}

function originalRows(payload){if(Array.isArray(payload?.daily_progress))return payload.daily_progress;if(Array.isArray(payload?.dailyProgress))return payload.dailyProgress;if(Array.isArray(payload))return payload;return null}

async function migrateOriginalTracker(payload,rawText){
  const rows=originalRows(payload);if(!rows)return null;const imported=[];const metricLabels={mcqs:'MCQs',essays:'Essays',fullPapers:'Full papers',purePartA:'Pure Part A',purePartB:'Pure Part B',appliedPartA:'Applied Part A',appliedPartB:'Applied Part B'};
  for(const row of rows){const date=String(row.date||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))continue;const progress=row.progress_data||{physics:{mcqs:row.physics_mcqs,essays:row.physics_essays,fullPapers:row.physics_full_papers},ict:{mcqs:row.ict_mcqs,essays:row.ict_essays,fullPapers:row.ict_full_papers},math:{purePartA:row.math_pure_part_a,purePartB:row.math_pure_part_b,appliedPartA:row.math_applied_part_a,appliedPartB:row.math_applied_part_b,fullPapers:row.math_full_papers}};
    for(const [sourceSubject,metrics] of Object.entries(progress||{}))for(const [metric,countRaw] of Object.entries(metrics||{})){const count=boundedInt(countRaw,0,100000);if(!count)continue;const safeRow=String(row.id||row.entryId||date).replace(/[^a-zA-Z0-9._:-]/g,'-');const id=`legacy-${safeRow}-${sourceSubject}-${metric}`.slice(0,100);imported.push(normalizeSession({id,subject:sourceSubject==='physics'?'physics':'other',topic:`${sourceSubject==='math'?'Combined Maths':sourceSubject.toUpperCase()} · ${metricLabels[metric]||metric}`,sessionType:'legacy-output',startedAt:new Date(`${date}T12:00:00+05:30`).toISOString(),endedAt:new Date(`${date}T12:00:00+05:30`).toISOString(),durationSeconds:0,plannedDurationSeconds:0,notes:'Imported from the permitted original tracker. The source recorded output counts, not study duration.',evidenceKind:'marked-attempt',outputCount:count,outputUnit:metricLabels[metric]||metric,source:'study-tracker-gamma-supabase-export',metadata:{sourceRowId:row.id||null,sourceSubject,sourceMetric:metric},clientUpdatedAt:new Date().toISOString()}));}
  }
  const hash=await checksum(rawText),migration={id:`migration-study-tracker-gamma-${hash.slice(0,16)}`,source:'study-tracker-gamma-supabase-export',version:'1',recordsImported:imported.length,sourceChecksum:hash,integrityResult:'transformed-and-counted',migratedAt:new Date().toISOString()};
  return{sessions:imported,migration,sourceRows:rows.length};
}

async function importPayload(file){
  const text=await file.text(),payload=safeJson(text,null);if(!payload)throw new Error('Invalid JSON');let sessions=[],goals=[],migration=null,sourceRows=null;
  if(payload.kind==='performance-powerhouse-study-tracker-backup'||payload.studyTracker){const source=payload.studyTracker||payload;sessions=Array.isArray(source.sessions)?source.sessions.map(normalizeSession):[];goals=Array.isArray(source.goals)?source.goals:[];}
  else{const converted=await migrateOriginalTracker(payload,text);if(!converted)throw new Error('Unsupported tracker export');sessions=converted.sessions;migration=converted.migration;sourceRows=converted.sourceRows;}
  const map=new Map(state.sessions.map(s=>[s.id,s]));sessions.forEach(s=>{const old=map.get(s.id);if(!old||s.clientUpdatedAt>=old.clientUpdatedAt)map.set(s.id,s)});state.sessions=[...map.values()];
  const goalMap=new Map(state.goals.map(g=>[g.id,g]));goals.forEach(g=>goalMap.set(g.id,g));state.goals=[...goalMap.values()];sessions.forEach(s=>queueSync({action:'upsert-session',session:s}));
  if(migration){state.migrations=state.migrations.filter(m=>m.id!==migration.id);state.migrations.push(migration);queueSync({action:'record-migration',migration});}
  saveState();renderAll();$('migrationStatus').textContent=migration?`Source ${sourceRows} rows → ${sessions.length} output records transformed → ${sessions.length} imported locally. SHA-256 ${migration.sourceChecksum.slice(0,16)}… retained for verification.`:`${sessions.length} tracker sessions restored from backup.`;toast(`${sessions.length} tracker records imported safely.`);syncNow();
}

function completeBackup(){const core=safeJson(localStorage.getItem('al_performance_powerhouse_v4'),null),physics=safeJson(localStorage.getItem('al_performance_powerhouse_physics_intelligence_v1'),null);download(`performance-powerhouse-complete-backup-${colomboDay()}.json`,JSON.stringify({kind:'performance-powerhouse-complete-backup',version:1,exportedAt:new Date().toISOString(),powerhouseCore:core,studyTracker:state,physicsIntelligence:physics},null,2))}

async function deleteAllData(){
  if(prompt('This permanently deletes Study Tracker sessions, goals, settings and migration receipts. Type DELETE to continue.')!=='DELETE')return;
  try{const response=await apiPost({action:'delete-all'});if(response.status!==401&&!response.ok)throw new Error('Cloud deletion failed');const localOnly=response.status===401;state=defaultState();saveState();renderAll();toast(localOnly?'Local tracker data deleted. Sign in to remove any cloud copy.':'Local and cloud tracker data deleted.');}
  catch{toast('Deletion stopped because the cloud copy could not be confirmed. Try again online.');}
}

async function apiPost(body){return fetch('/api/study-tracker',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})}

function mergeCloud(data){
  const local=new Map(state.sessions.map(s=>[s.id,s]));for(const raw of data.sessions||[]){const remote=normalizeSession({...raw,syncState:'synced'}),existing=local.get(remote.id);if(!existing||remote.clientUpdatedAt>existing.clientUpdatedAt)local.set(remote.id,remote)}
  const deleted=new Set(state.sync.queue.filter(q=>q.action==='delete-session').map(q=>q.id));deleted.forEach(id=>local.delete(id));state.sessions=[...local.values()];
  const goals=new Map(state.goals.map(g=>[g.id,g]));(data.goals||[]).forEach(g=>{if(!goals.has(g.id))goals.set(g.id,g)});state.goals=[...goals.values()];
}

async function syncNow(){
  if(syncRunning||!navigator.onLine)return;syncRunning=true;state.sync.status='syncing';renderSync();
  try{const response=await fetch('/api/study-tracker',{headers:{accept:'application/json'}});if(response.status===401){state.sync.status='local';saveState(false);return renderSync()}if(!response.ok)throw new Error('sync unavailable');const data=await response.json();mergeCloud(data);
    const remaining=[];for(const item of state.sync.queue){try{const res=await apiPost(item);if(!res.ok)throw new Error('write failed');if(item.action==='upsert-session'){const s=state.sessions.find(x=>x.id===item.session.id);if(s)s.syncState='synced';}}catch{remaining.push(item)}}state.sync.queue=remaining;state.sync.lastSyncedAt=new Date().toISOString();state.sync.status=remaining.length?'pending':'synced';saveState(false);renderAll();
  }catch{state.sync.status=state.sync.queue.length?'pending':'local';saveState(false);renderSync()}finally{syncRunning=false}
}

function renderSync(){const el=$('syncStatus'),pending=state.sync.queue.length;el.className='sync-chip';if(state.sync.status==='synced'){el.classList.add('synced');el.textContent='Cloud synced';$('authButton').textContent='Signed in';$('authButton').href='/signout-with-chatgpt?return_to=%2Fstudy-tracker%2F'}else if(pending){el.classList.add('pending');el.textContent=`${pending} pending sync`;$('authButton').textContent='Sign in / retry sync'}else{el.textContent=navigator.onLine?'Local first':'Offline · saved locally'}$('syncButton').textContent=state.sync.status==='syncing'?'Syncing…':'Sync now';$('syncButton').disabled=state.sync.status==='syncing'}

function toggleShareSafe(force){const on=typeof force==='boolean'?force:!document.body.classList.contains('share-safe');document.body.classList.toggle('share-safe',on);$('shareToggle').setAttribute('aria-pressed',String(on));state.preferences.shareSafe=on;saveState(false)}

function renderAll(){renderTimer();renderMetrics();renderSubjectBars();renderHeatmap();renderHistory();renderGoal();renderSync();const passive=PASSIVE_TYPES.has($('sessionType').value);$('passiveWarning').hidden=!passive}

function initEvents(){
  $('startButton').addEventListener('click',startSession);$('pauseButton').addEventListener('click',pauseResume);$('stopButton').addEventListener('click',finishSession);$('cancelButton').addEventListener('click',cancelActive);
  $('sessionType').addEventListener('change',renderAll);$('completionForm').addEventListener('submit',e=>{e.preventDefault();completePending(false)});$('saveWithoutEvidence').addEventListener('click',()=>completePending(true));$('evidenceKind').addEventListener('change',updateEvidenceLink);
  $('completionDialog').addEventListener('close',()=>{if(pendingCompletion)completePending(true)});$('heatmapMode').addEventListener('change',renderHeatmap);
  ['historySearch','historySubject','historyType','historyEvidence'].forEach(id=>$(id).addEventListener(id==='historySearch'?'input':'change',renderHistory));
  $('historyBody').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)editSession(edit.dataset.edit);if(del)deleteSession(del.dataset.delete)});
  $('editForm').addEventListener('submit',saveEdit);$('goalForm').addEventListener('submit',saveGoal);$('exportJson').addEventListener('click',exportJson);$('exportCsv').addEventListener('click',exportCsv);$('completeBackup').addEventListener('click',completeBackup);$('deleteAllData').addEventListener('click',deleteAllData);
  $('importButton').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(file)try{await importPayload(file)}catch(error){toast(error.message||'Import failed safely.')}e.target.value=''});
  $('syncButton').addEventListener('click',syncNow);$('shareToggle').addEventListener('click',()=>toggleShareSafe());window.addEventListener('online',syncNow);window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){state=loadState();renderAll()}});channel?.addEventListener('message',()=>{state=loadState();renderAll()});
}

populateSelects();applyCommandBridge();initEvents();renderAll();if(storageFailed){$('storageWarning').hidden=false;$('storageWarning').textContent='Browser storage is unavailable. Export a backup before closing; work remains usable for this visit.';}setInterval(renderTimer,250);syncNow();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('../sw.js').catch(()=>{}));
