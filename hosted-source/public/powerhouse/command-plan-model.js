(function(root){'use strict';
 const fields=['action','evidence','direction','biology','chemistry','physics'];
 const limits={action:300,evidence:1000,direction:600,biology:600,chemistry:600,physics:600};
 const key='al_command_centre_next_action_v1';
 function validate(value){
  if(!value||Array.isArray(value)||value.version!==1||typeof value.action!=='string'||typeof value.evidence!=='string')throw Error('Choose a valid version-1 Command Centre plan.');
  const plan={version:1};for(const field of fields){const text=value[field]??'';if(typeof text!=='string'||text.length>limits[field])throw Error('The '+field+' field is invalid or too long.');plan[field]=text;}return plan;
 }
 const empty=()=>validate({version:1,action:'',evidence:''});
 function merge(current,incoming,mode){const next=validate(incoming),prior=validate(current);if(!['replace','empty'].includes(mode))throw Error('Choose a valid import mode.');return mode==='replace'?next:validate({version:1,...Object.fromEntries(fields.map(field=>[field,prior[field].trim()?prior[field]:next[field]]))});}
 function open(storage){
  let baseline,problem='',value=empty();
  try{baseline=storage.getItem(key);if(baseline!==null)value=validate(JSON.parse(baseline));}catch{problem='The stored plan could not be read. Export its original bytes before replacing it.';}
  function assertCurrent(){if(baseline===undefined)throw Error('Browser storage is unavailable. Export your draft before leaving.');if(storage.getItem(key)!==baseline)throw Error('Another tab changed the saved plan. Your draft is kept here; export it and reload to compare copies.');}
  return {value,problem,get hasSaved(){return baseline!==null&&baseline!==undefined;},original:()=>{if(baseline===undefined)throw Error('Stored bytes are unavailable.');return baseline;},save(plan){if(problem)throw Error(problem);assertCurrent();const next=validate(plan),text=JSON.stringify(next);storage.setItem(key,text);baseline=text;value=next;return next;},import(plan,draft){assertCurrent();const next=validate(plan);if(draft)storage.setItem(key+'_draft_previous',JSON.stringify(validate(draft)));if(baseline!==null)storage.setItem(key+'_previous',baseline);const text=JSON.stringify(next);storage.setItem(key,text);baseline=text;value=next;problem='';this.problem='';return next;}};
 }
 root.CommandPlan={fields,limits,key,validate,empty,merge,open};
})(globalThis);
