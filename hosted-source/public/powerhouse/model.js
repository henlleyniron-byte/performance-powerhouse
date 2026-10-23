(function(root){
  const day = value => { const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value || Date.now())); const get=t=>parts.find(p=>p.type===t).value; return `${get('year')}-${get('month')}-${get('day')}`; };
  const shift = (date,n) => new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
  function summary(attempts,start,end) {
    const rows=attempts.filter(a=>a.date>=start&&a.date<=end);
    const total=rows.reduce((n,a)=>n+Number(a.total||0),0), earned=rows.reduce((n,a)=>n+Number(a.earned||0),0);
    const audited=rows.filter(a=>a.trustedEarned!=null&&a.trustedEarned!==''), trustedTotal=audited.reduce((n,a)=>n+Number(a.total||0),0);
    const errors={}; rows.forEach(a=>{if(a.error)errors[a.error]=(errors[a.error]||0)+Math.max(0,Number(a.total)-Number(a.earned))});
    return {rows,total,earned,accuracy:total?earned/total*100:null,trusted:trustedTotal?audited.reduce((n,a)=>n+Number(a.trustedEarned),0)/trustedTotal*100:null,audited:audited.length,days:new Set(rows.map(a=>a.date)).size,minutes:rows.reduce((n,a)=>n+Number(a.minutes||0),0),errors,clean:rows.filter(a=>a.unaided&&Number(a.earned)===Number(a.total)&&!a.error&&!Number(a.guesses||0)).length};
  }
  function validateAttempt(a,today) {
    const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
    if(!a.question?.trim())return 'Add a question or paper reference.';
    if(!validDate(today)||!validDate(a.date)||a.date>today)return 'Use a real calendar date for a completed attempt.';
    if(!Number.isFinite(a.earned)||!Number.isFinite(a.total)||a.total<=0||a.earned<0||a.earned>a.total)return 'Marks earned must be between zero and the marks available.';
    if(a.trustedEarned!==null&&(!Number.isFinite(a.trustedEarned)||a.trustedEarned<0||a.trustedEarned>a.earned))return 'Trusted marks must be between zero and raw marks.';
    if(!Number.isFinite(a.minutes)||a.minutes<=0||a.minutes>360)return 'Enter a duration between 1 and 360 minutes.';
    if(!Number.isInteger(a.items)||a.items<1||a.items>500||!Number.isInteger(a.guesses)||a.guesses<0||a.guesses>a.items)return 'Guessed items cannot exceed completed items.';
    if(a.earned<a.total&&!a.error)return 'Choose the dominant error family for the lost marks.';
    return '';
  }
  root.PowerhouseModel=Object.freeze({day,shift,summary,validateAttempt});
})(globalThis);
