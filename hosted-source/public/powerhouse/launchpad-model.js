(function(root){
  'use strict';
  const KEYS={workflowRuns:'powerhouse-workflow-runs-v1',workflowRunsRecovery:'powerhouse-workflow-runs-v1-recovery',workflow:'powerhouse-workflow-drafts-v1',workflowRecovery:'powerhouse-workflow-drafts-v1-recovery',clinic:'performance_powerhouse_practical_clinic_v32',practical:'performance_powerhouse_practical_lab_v3',core:'al_performance_powerhouse_v4',physics:'al_performance_powerhouse_physics_intelligence_v1',chemistry:'al_performance_powerhouse_chemistry_intelligence_v1',biology:'al_performance_powerhouse_biology_intelligence_v1',science:'alpp_science_sessions_v1',verification:'alpp_verification_chains_v7',calendar:'alpp_calendar_projection_v1',tracker:'al_performance_powerhouse_study_tracker_v1'};
  const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
  function read(storage){const snapshots={},errors=[];for(const [name,key] of Object.entries(KEYS)){try{const raw=storage.getItem(key);snapshots[name]={key,raw,data:raw===null?null:JSON.parse(raw)};}catch(e){let raw=null;try{raw=storage.getItem(key);}catch{}snapshots[name]={key,raw,data:null};errors.push({name,key,unreadable:raw!==null});}}return {snapshots,errors};}
  const marks=r=>r&&typeof r.earned==='number'&&Number.isFinite(r.earned)&&typeof r.total==='number'&&Number.isFinite(r.total)&&r.total>0&&r.earned>=0&&r.earned<=r.total;
  function queue(view,today,assess=null){
    if(!date(today))throw Error('Invalid review date.');
    const out=[],core=view.snapshots.core?.data,attempts=Array.isArray(core?.attempts)?core.attempts:[];
    for(const r of Array.isArray(core?.retests)?core.retests:[]){if(r.completedAt||!date(r.due))continue;out.push({id:'core-retest:'+String(r.id||r.topicKey)+':'+r.due,subject:String(r.topicKey||'').split('|')[0],title:'Command retest · '+String(r.topicKey||'chosen topic'),due:r.due,priority:r.due<=today?0:3,action:'Open repair queue',href:'#repairs',note:r.due<=today?'Scheduled check due; completion is unverified.':'Upcoming scheduled check.'});}
    const chains=view.snapshots.verification?.data;
    const recent=attempts.filter(r=>marks(r)&&date(r.date)&&r.date<=today&&(r.earned<r.total||Number(r.guesses)>0||r.error)&&!(assess&&chains?.[r.id]&&assess(chains[r.id],attempts,today).stage==='retained'));
    for(const r of recent.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3)){out.push({id:'core-error:'+r.id,subject:r.subject,title:r.question||'Marked work needing review',due:r.date,priority:2,action:'Open Verification Desk',href:'#repairs',note:(r.total-r.earned)+' recorded marks lost · '+Number(r.guesses||0)+' guessed items. Check whether the existing chain has already been repaired.'});}
    for(const s of ['chemistry','biology']){
      const rows=view.snapshots[s]?.data?.records;if(!Array.isArray(rows))continue;
      const latest=new Map();for(const r of rows)if(marks(r)&&typeof r.itemId==='string'&&typeof r.at==='string'&&Number.isFinite(Date.parse(r.at))&&Date.parse(r.at)<=Date.parse(today+'T23:59:59+05:30')){if(!latest.has(r.itemId)||Date.parse(latest.get(r.itemId).at)<Date.parse(r.at))latest.set(r.itemId,r);}
      for(const r of [...latest.values()].filter(r=>r.earned<r.total||r.guesses>0||r.error!=='none').slice(0,3))out.push({id:s+':'+r.itemId,subject:s,title:r.reference||r.itemId,due:today,priority:2,action:'Continue subject repair',href:'./'+s+'-intelligence/?item='+encodeURIComponent(r.itemId),note:'Latest marked subject record exposes an error. Review the narrow repair, then prove fresh transfer.'});
    }
    const clinic=view.snapshots.clinic?.data;
    if(clinic?.schema==='powerhouse-practical-clinic-v1' && clinic.records && assess) for(const [questionId,record] of Object.entries(clinic.records)) {
      if(!/^PM(?:32)?-[BCP]\d{2}$/.test(questionId)||!Array.isArray(record?.attempts)||!record.chains)continue;
      for(const chain of Object.values(record.chains)) {const result=assess(chain,record.attempts,today);if(result.stage==='retained')continue;const source=record.attempts.find(a=>a.id===chain.originalId);if(!source)continue;
        out.push({id:'clinic:'+questionId+':'+chain.originalId,subject:source.subject,title:questionId+' · '+String(chain.skill||'Graph correction'),due:source.date||today,priority:1,action:'Continue graph correction',href:'./practical-lab/clinic/?question='+encodeURIComponent(questionId)+'&chain='+encodeURIComponent(chain.originalId),note:result.label+' · '+result.next});
      }
    }
    out.push(...(root.PracticalLabHost?.actions?.()||[]));
    return out.sort((a,b)=>a.priority-b.priority||a.due.localeCompare(b.due)).slice(0,8);
  }
  function bundle(view,now=new Date().toISOString()){
    return {schema:'powerhouse-browser-recovery-bundle',version:1,exportedAt:now,restore:'Original text bytes are preserved. Use each module’s existing validated import; this file never automatically writes over stored evidence.',entries:Object.entries(view.snapshots).map(([module,s])=>({module,key:s.key,raw:s.raw,readable:!view.errors.some(e=>e.name===module)})),readErrors:view.errors};
  }
  root.PowerhouseLaunchpad={KEYS,read,queue,bundle};
})(globalThis);
