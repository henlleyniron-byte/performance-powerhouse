// Pure rules shared by the dashboard and its regression checks.
globalThis.PowerhouseEvidence = Object.freeze({
  eligibleRetest(attempt, retests, attempts) {
    const stage = attempt.type === 'fresh-transfer' ? 1 : attempt.type === 'delayed-retest' ? 2 : 0;
    if (!stage || !attempt.unaided || !attempt.novelQuestion || !(attempt.total > 0) || attempt.earned !== attempt.total || attempt.error || Number(attempt.guesses || 0) > 0 || (attempt.trustedEarned != null && attempt.trustedEarned !== attempt.total)) return null;
    const reference = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return retests.filter(retest => {
      const source = attempts.find(item => item.id === retest.sourceAttemptId);
      return !retest.completedAt && retest.stage === stage && retest.topicKey === attempt.topicKey && retest.due <= attempt.date && source && source.date < attempt.date && reference(source.question) !== reference(attempt.question);
    }).sort((a, b) => a.due.localeCompare(b.due))[0] || null;
  },
  normalizeCycle(value, subjects, count) {
    const valid = Array.isArray(value?.done) ? [...new Set(value.done)].filter(n => Number.isInteger(n) && n >= 0 && n < count) : [];
    const done = [];
    for (let n = 0; n < count && valid.includes(n); n++) done.push(n);
    return { subject: subjects.includes(value?.subject) ? value.subject : 'biology', step: Number.isInteger(value?.step) ? Math.max(0, Math.min(count - 1, value.step)) : 0, done };
  }
});
