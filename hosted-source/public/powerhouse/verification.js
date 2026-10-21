(function(root) {
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value + 'T00:00:00Z'))
    && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
  // Equivalent references are detected; semantic similarity still needs human review.
  const reference = value => typeof value === 'string'
    ? value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '') : '';
  const fullPass = attempt => !!attempt && attempt.unaided === true
    && typeof attempt.total === 'number' && Number.isFinite(attempt.total) && attempt.total > 0
    && typeof attempt.earned === 'number' && attempt.earned === attempt.total
    && (attempt.guesses == null || attempt.guesses === 0)
    && !attempt.error
    && (attempt.tags == null || Array.isArray(attempt.tags) && attempt.tags.length === 0)
    && (attempt.trustedEarned == null || attempt.trustedEarned === attempt.total);
  const days = (from, to) => validDate(from) && validDate(to)
    ? (Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000 : -1;

  function assess(chain, attempts, today) {
    if (!validDate(today)) return {stage:'invalid-date', label:'Assessment date is invalid', next:'Use a real completion date before assessing this chain.'};
    const original = attempts.find(attempt => attempt.id === chain?.originalId);
    if (!original || !validDate(original.date) || original.date > today || !reference(original.question)) {
      return {stage:'missing-source', label:'Original attempt is unavailable or incomplete', next:'Restore a dated source attempt with its actual question reference before trusting this chain.'};
    }
    if (!chain.skill?.trim() || !chain.diagnosis?.trim()) return {stage:'diagnose', label:'Diagnosis needed', next:'Name the chosen weakness and why the mark was lost.'};
    if (!chain.repair?.trim() || !chain.markingSource?.trim()) return {stage:'repair', label:'Targeted repair needed', next:'Record the smallest repair and the verified marking source.'};
    if (chain.keyHold) return {stage:'hold', label:'Marking key on verification hold', next:'Verify the source key before counting any repair as retained.'};
    const reattempt = attempts.find(attempt => attempt.id === chain.reattemptId);
    const transfer = attempts.find(attempt => attempt.id === chain.transferId);
    const delayed = attempts.find(attempt => attempt.id === chain.delayedId);
    const good = attempt => fullPass(attempt) && validDate(attempt.date) && attempt.date <= today
      && attempt.subject === original.subject && attempt.id !== original.id && reference(attempt.question);
    if (!good(reattempt) || days(original.date, reattempt?.date) < 0) {
      return {stage:'reattempt', label:'Independent reattempt needed', next:'Log a correctly marked unaided check with an actual question reference, no guesses and no unresolved lost marks.'};
    }
    if (!good(transfer) || transfer.id === reattempt.id || transfer.novelQuestion !== true
      || days(reattempt.date, transfer.date) < 0
      || [original, reattempt].some(attempt => reference(attempt.question) === reference(transfer.question))) {
      return {stage:'transfer', label:'Fresh transfer needed', next:'Use a different unseen question reference. A new attempt ID or an unseen checkbox does not prove transfer.'};
    }
    if (!good(delayed) || [reattempt.id, transfer.id].includes(delayed.id) || delayed.novelQuestion !== true
      || days(transfer.date, delayed.date) < 7
      || [original, reattempt, transfer].some(attempt => reference(attempt.question) === reference(delayed.question))) {
      return {stage:'delayed', label:'Delayed check needed', next:'Return at least seven days after transfer for a different independent unseen question with no unresolved lost marks.'};
    }
    // Reopen only for an explicitly linked later failure. Same-day order is not inferred.
    const laterFailure = attempts.find(attempt => (attempt.sourceAttemptId === original.id || attempt.chainId === original.id)
      && validDate(attempt.date) && attempt.date > delayed.date && attempt.date <= today
      && attempt.subject === original.subject && attempt.unaided === true
      && typeof attempt.total === 'number' && Number.isFinite(attempt.total) && attempt.total > 0
      && typeof attempt.earned === 'number' && Number.isFinite(attempt.earned)
      && (attempt.earned < attempt.total || attempt.error || Array.isArray(attempt.tags) && attempt.tags.length
        || attempt.trustedEarned != null && attempt.trustedEarned < attempt.total));
    if (laterFailure) return {stage:'reattempt', reopenedBy:laterFailure.id, label:'Chosen weakness reopened by a later failed check', next:'Repair the new failure and select a new independent reattempt, transfer and delayed check. Earlier evidence is preserved.'};
    if (!chain.confirmSkill) return {stage:'scope', label:'Check the evidence scope', next:'Confirm that each selected check actually assessed this chosen weakness.'};
    return {stage:'retained', label:'Chosen weakness retained — self-reported', next:'This is evidence for the chosen weakness, not proof of whole-topic mastery. Reopen if a later check fails.'};
  }

  function validate(chain, attempts, today) {
    if (!validDate(today)) throw Error('Invalid assessment date.');
    if (!chain || typeof chain !== 'object' || Array.isArray(chain)) throw Error('Invalid chain.');
    const clean = {};
    for (const key of ['originalId','skill','diagnosis','repair','markingSource','reattemptId','transferId','delayedId']) {
      if (chain[key] !== undefined && typeof chain[key] !== 'string') throw Error('Invalid field.');
      clean[key] = String(chain[key] || '').slice(0, key.endsWith('Id') ? 100 : 1500);
    }
    clean.confirmSkill = chain.confirmSkill === true;
    clean.keyHold = chain.keyHold === true;
    if (!attempts.some(attempt => attempt.id === clean.originalId)) throw Error('Choose an existing original attempt.');
    for (const key of ['reattemptId','transferId','delayedId']) if (clean[key] && !attempts.some(attempt => attempt.id === clean[key])) {
      throw Error('A selected check is not in the current attempt ledger.');
    }
    return clean;
  }
  root.PowerhouseVerification = Object.freeze({assess, validate, fullPass, validDate, days, reference});
})(globalThis);
