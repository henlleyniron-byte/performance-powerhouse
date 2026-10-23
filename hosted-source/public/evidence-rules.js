// Pure rules shared by the dashboard and its regression checks.
globalThis.PowerhouseEvidence = Object.freeze({
  validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  },
  addDays(date, days) {
    if (!this.validDate(date) || !Number.isInteger(days)) throw Error('Invalid calendar date');
    return new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
  },
  validateBackup(data, topics, subjects, types, errors, today, planIds = []) {
    const object = v => v && typeof v === 'object' && !Array.isArray(v);
    const fail = message => { throw Error(message); };
    let nodes = 0;
    const inspect = (v, depth = 0) => {
      if (++nodes > 250000 || depth > 20) fail('Backup is too complex');
      if (typeof v === 'string' && v.length > 20000) fail('Backup text is too long');
      if (v && typeof v === 'object') for (const [key, value] of Object.entries(v)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('Unsafe backup key');
        inspect(value, depth + 1);
      }
    };
    inspect(data);
    if (!object(data) || !object(data.ratings) || !Array.isArray(data.attempts) || data.attempts.length > 20000) fail('Invalid backup structure');
    const known = new Set(topics), ids = new Set();
    const maps = [['ratings', [1,2,3], known], ['syllabusProgress', [0,25,50,75,100], new Set(planIds)]];
    for (const [name, values, allowed] of maps) if (data[name] !== undefined) {
      if (!object(data[name])) fail('Invalid topic map');
      for (const [key, value] of Object.entries(data[name])) if (!allowed.has(key) || !values.includes(Number(value))) fail('Invalid topic rating');
    }
    for (const a of data.attempts) {
      if (!object(a) || typeof a.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(a.id) || ids.has(a.id)) fail('Invalid or duplicate attempt ID');
      ids.add(a.id);
      if (!this.validDate(a.date) || a.date > today || !subjects.includes(a.subject) || !known.has(a.topicKey) || !a.topicKey.startsWith(a.subject + '|')) fail('Invalid attempt date or topic');
      if (!types.includes(a.type || 'topic-question') || typeof a.question !== 'string' || !a.question.trim() || a.question.length > 1000 || (a.error && !errors.includes(a.error))) fail('Invalid question or error family');
      if (![a.earned,a.total].every(n => typeof n === 'number' && Number.isFinite(n)) || a.total <= 0 || a.earned < 0 || a.earned > a.total) fail('Invalid attempt marks');
      if (a.trustedEarned != null && (!Number.isFinite(a.trustedEarned) || a.trustedEarned < 0 || a.trustedEarned > a.earned)) fail('Invalid trusted marks');
      if (a.createdAt != null && (typeof a.createdAt !== 'string' || !Number.isFinite(Date.parse(a.createdAt)))) fail('Invalid creation time');
      for (const field of ['note','confidence']) if (a[field] != null && typeof a[field] !== 'string') fail('Invalid attempt text');
      if (a.items != null && (!Number.isInteger(a.items) || a.items < 1)) fail('Invalid item count');
      if (a.guesses != null && (!Number.isInteger(a.guesses) || a.guesses < 0 || a.guesses > (a.items || 1))) fail('Invalid guessed item count');
      if (a.minutes != null && (!Number.isFinite(a.minutes) || a.minutes < 0)) fail('Invalid duration');
      for (const flag of ['unaided','novelQuestion']) if (a[flag] != null && typeof a[flag] !== 'boolean') fail('Invalid evidence confirmation');
    }
    if (data.retests !== undefined) {
      if (!Array.isArray(data.retests) || data.retests.length > 40000) fail('Invalid retest list');
      const retestIds = new Set();
      for (const r of data.retests) {
        if (!object(r) || typeof r.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(r.id) || retestIds.has(r.id) || !ids.has(r.sourceAttemptId) || !known.has(r.topicKey) || ![1,2].includes(r.stage) || !this.validDate(r.due)) fail('Invalid retest reference');
        retestIds.add(r.id);
        const source = data.attempts.find(a => a.id === r.sourceAttemptId);
        if (source.topicKey !== r.topicKey || r.due < source.date) fail('Retest does not match its source');
        if (r.completedAt != null && (typeof r.completedAt !== 'string' || !Number.isFinite(Date.parse(r.completedAt)))) fail('Invalid retest completion');
      }
    }
    if (data.profile !== undefined && (!object(data.profile) || Object.values(data.profile).some(v => typeof v !== 'string'))) fail('Invalid profile');
    if (data.dailyEntries !== undefined && (!Array.isArray(data.dailyEntries) || data.dailyEntries.some(v => !object(v) || !this.validDate(v.date)))) fail('Invalid daily entries');
    if (data.courseCorrection !== undefined && !object(data.courseCorrection)) fail('Invalid course correction');
    return data;
  },
  eligibleRetest(attempt, retests, attempts) {
    const stage = attempt.type === 'fresh-transfer' ? 1 : attempt.type === 'delayed-retest' ? 2 : 0;
    if (!stage || !attempt.unaided || !attempt.novelQuestion || !(attempt.total > 0) || attempt.earned !== attempt.total || attempt.error || Number(attempt.guesses || 0) > 0 || (attempt.trustedEarned != null && attempt.trustedEarned !== attempt.total)) return null;
    const reference = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return retests.filter(retest => {
      const source = attempts.find(item => item.id === retest.sourceAttemptId);
      const transfer = retests.find(item => item.sourceAttemptId === retest.sourceAttemptId && item.stage === 1);
      const stageReady = stage === 1 || (transfer?.completedAt && transfer.completedAt < attempt.date && attempts.some(item => item.id === transfer.completedByAttemptId && reference(item.question) !== reference(attempt.question)));
      return stageReady && (!attempt.sourceAttemptId || attempt.sourceAttemptId === retest.sourceAttemptId) && !retest.completedAt && retest.stage === stage && retest.topicKey === attempt.topicKey && retest.due <= attempt.date && source && source.date < attempt.date && reference(source.question) !== reference(attempt.question);
    }).sort((a, b) => a.due.localeCompare(b.due))[0] || null;
  },
  normalizeCycle(value, subjects, count) {
    const valid = Array.isArray(value?.done) ? [...new Set(value.done)].filter(n => Number.isInteger(n) && n >= 0 && n < count) : [];
    const done = [];
    for (let n = 0; n < count && valid.includes(n); n++) done.push(n);
    return { subject: subjects.includes(value?.subject) ? value.subject : 'biology', step: Number.isInteger(value?.step) ? Math.max(0, Math.min(count - 1, value.step)) : 0, done };
  }
});
