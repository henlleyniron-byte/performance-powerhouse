/* V8 planning is a read-only projection. It never modifies attempt evidence or Calendar. */
(function(root){
 const realDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
 const instant=v=>typeof v==='string'&&realDay(v.slice(0,10))&&/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));
 function validateCalendar(v){
  if(!v||v.schema!=='powerhouse-calendar-v1'||v.timezone!=='Asia/Colombo'||!instant(v.fetchedAt)||!realDay(v.startDate)||!realDay(v.endDate)||v.endDate<=v.startDate||!Array.isArray(v.events)||v.events.length>2000)throw Error('Choose a valid Powerhouse calendar snapshot with Asia/Colombo dates.');
  const events=v.events.map(e=>{if(!e||typeof e.id!=='string'||e.id.length>200||typeof e.title!=='string'||!e.title.trim()||e.title.length>500||!instant(e.start)||!instant(e.end)||Date.parse(e.end)<=Date.parse(e.start)||!['study','fixed','sleep','recovery','movement'].includes(e.kind))throw Error('Invalid calendar event; existing timetable was kept.');return {id:e.id,title:e.title,start:e.start,end:e.end,kind:e.kind};});
  if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Duplicate calendar event IDs.');
  if(v.priorities!==undefined&&(!Array.isArray(v.priorities)||v.priorities.length>100))throw Error('Invalid canonical priority packet.');
  const priorities=(v.priorities||[]).map(p=>{if(!p||typeof p.id!=='string'||p.id.length>100||!['biology','chemistry','physics','mixed'].includes(p.subject)||typeof p.label!=='string'||p.label.length<5||p.label.length>500||typeof p.source!=='string'||p.source.length>500||!realDay(p.date)||!Number.isInteger(p.minutes)||p.minutes<15||p.minutes>120)throw Error('Invalid canonical priority; existing timetable was kept.');return {id:p.id,subject:p.subject,label:p.label,source:p.source,date:p.date,minutes:p.minutes};});
  return {schema:v.schema,timezone:v.timezone,fetchedAt:v.fetchedAt,startDate:v.startDate,endDate:v.endDate,events,priorities};
 }
 const merge=rows=>{const out=[];for(const r of rows.slice().sort((a,b)=>a[0]-b[0])){const last=out[out.length-1];if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else out.push([...r]);}return out;};
 function subtract(range,blocked){let rows=[range];for(const [a,b] of merge(blocked)){rows=rows.flatMap(([s,e])=>b<=s||a>=e?[[s,e]]:[[s,Math.min(a,e)],[Math.max(s,b),e]].filter(([x,y])=>y>x));}return rows;}
 function timetable(calendar,date){
  if(!realDay(date))throw Error('Choose a real date.');const start=Date.parse(date+'T00:00:00+05:30'),end=start+86400000;
  if(!calendar)return {events:[],windows:[],conflicts:[],sleepMinutes:0,covered:false};
  const events=calendar.events.filter(e=>Date.parse(e.start)<end&&Date.parse(e.end)>start).map(e=>({...e,from:Math.max(start,Date.parse(e.start)),to:Math.min(end,Date.parse(e.end))})).sort((a,b)=>a.from-b.from);
  const conflicts=[];for(let i=0;i<events.length;i++)for(let j=i+1;j<events.length;j++)if(events[j].from<events[i].to)conflicts.push([events[i].title,events[j].title]);
  const protectedRows=events.filter(e=>e.kind!=='study').map(e=>[e.from,e.to]);
  const study=merge(events.filter(e=>e.kind==='study').map(e=>[e.from,e.to]));
  const windows=study.flatMap(r=>subtract(r,protectedRows));
  const sleepMinutes=merge(events.filter(e=>e.kind==='sleep').map(e=>[e.from,e.to])).reduce((n,[a,b])=>n+(b-a)/60000,0);
  return {events,windows,conflicts,sleepMinutes,covered:date>=calendar.startDate&&date<calendar.endDate};
 }
 function candidates(attempts,retests,date,chains={}){
  const map=new Map(attempts.map(a=>[a.id,a])),seen=new Set(),tasks=[];
  for(const r of retests.filter(r=>!r.completedAt&&realDay(r.due)&&r.due<=date).sort((a,b)=>a.due.localeCompare(b.due))){const a=map.get(r.sourceAttemptId);if(!a||seen.has(a.id)||chains[a.id]?.keyHold)continue;if(r.stage===2&&!retests.some(t=>t.sourceAttemptId===a.id&&t.stage===1&&t.completedAt))continue;seen.add(a.id);tasks.push({id:r.id,source:a.id,subject:a.subject,label:'Due check · '+a.question,reason:'Due '+r.due+'; independent retrieval, then strict marking.',minutes:30,priority:1000+(a.confidence==='high'?50:0),type:'retest'});}
  const weak=attempts.filter(a=>realDay(a.date)&&a.date<=date&&(a.earned<a.total||a.guesses>0||a.error)&&!['reattempt','fresh-transfer','delayed-retest'].includes(a.type)).map(a=>({...a,risk:(a.confidence==='high'?100:0)+Math.max(0,a.total-a.earned)*5+Number(a.guesses||0)})).sort((a,b)=>b.risk-a.risk);
  for(const a of weak){if(seen.has(a.id)||chains[a.id]?.keyHold||retests.some(r=>r.sourceAttemptId===a.id&&r.stage===2&&r.completedAt)||['retained','delayed','scope'].includes(root.PowerhouseVerification?.assess(chains[a.id]||{},attempts,date).stage))continue;seen.add(a.id);tasks.push({id:'repair-'+a.id,source:a.id,subject:a.subject,label:'Repair / transfer · '+a.question,reason:'Recorded lost marks / uncertainty. Check existing repair evidence before adding work.',minutes:55,priority:a.risk,type:'repair'});}
  for(const subject of ['biology','chemistry','physics'])if(!tasks.some(t=>t.subject===subject))tasks.push({id:'baseline-'+subject,subject,label:subject[0].toUpperCase()+subject.slice(1)+' · one marked section',reason:'Choose from the canonical Error Bank. Existing unmarked work takes priority.',minutes:55,priority:0,type:'baseline'});
  return tasks.sort((a,b)=>b.priority-a.priority);
 }
 function fit(tasks,windows,maxMinutes,notBefore=-Infinity){
  if(!Number.isFinite(maxMinutes)||maxMinutes<0||maxMinutes>720)throw Error('Use a work budget from 0 to 720 minutes.');
  const ranges=merge(windows.map(([s,e])=>[Math.max(s,notBefore),e]).filter(([s,e])=>e>s)),available=ranges.reduce((n,[a,b])=>n+(b-a)/60000,0),capacity=Math.floor(Math.min(maxMinutes,available)*.8),placed=[],deferred=[];let used=0;
  for(const t of tasks){const duration=t.minutes*60000;if(used+t.minutes>capacity){deferred.push(t);continue;}
   const index=ranges.findIndex(([s,e])=>e-s>=duration);
   if(index<0){deferred.push(t);continue;}const start=ranges[index][0];placed.push({...t,start,end:start+duration});ranges[index][0]+=duration;used+=t.minutes;
  }
  return {placed,deferred,capacity,available,used,reserve:available-used};
 }
 root.PowerhousePlanning=Object.freeze({validateCalendar,timetable,candidates,fit,merge,subtract,realDay});
})(globalThis);
