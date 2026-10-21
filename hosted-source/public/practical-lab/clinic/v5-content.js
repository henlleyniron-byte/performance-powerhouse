(function (root) {
  'use strict';
  const RELEASE = '2026-10-16-v5.0';
  const subjects = { biology: 38, chemistry: 45, physics: 43 };
  function validate(v5, catalog) {
    const fail = message => { throw Error(message); };
    if (!v5 || v5.release !== RELEASE || v5.teacher_reviewed !== false ||
        v5.actual_lab_observations !== false || !Array.isArray(v5.questions) || v5.questions.length !== 126) {
      fail('V5 content is incomplete or has incorrect review labels.');
    }
    const activities = new Map(catalog.activities.map(a => [a.id, a]));
    const ids = new Set(), covered = new Set(), counts = { biology: 0, chemistry: 0, physics: 0 };
    for (const q of v5.questions) {
      if (!/^PM5-[BCP]\d{2}$/.test(q.id) || ids.has(q.id) || !Object.hasOwn(subjects, q.subject) ||
          !Array.isArray(q.activity_ids) || q.activity_ids.length !== 1) fail('Invalid V5 question identity.');
      const activity = activities.get(q.activity_ids[0]);
      if (!activity || activity.subject !== q.subject || covered.has(activity.id) ||
          q.nie_number !== activity.nie_number || (q.nie_print_page !== activity.nie_print_page && !(v5.reference_corrections||[]).some(c=>c.activity_id===activity.id&&c.catalog_page===activity.nie_print_page&&c.body_page===q.nie_print_page&&c.reason))) {
        fail('V5 activity mapping is incomplete, duplicated or renumbered.');
      }
      for (const key of ['title', 'scenario', 'worked_explanation', 'common_error', 'transfer_question', 'transfer_answer']) {
        if (typeof q[key] !== 'string' || !q[key].trim() || q[key].length > 12000) fail('Incomplete V5 case: ' + q.id);
      }
      if (!Array.isArray(q.data) || q.data.length < 2 || !Array.isArray(q.data[0]) || q.data[0].length < 2 ||
          q.data.some(row => !Array.isArray(row) || row.length !== q.data[0].length ||
            row.some(cell => typeof cell !== 'string' || cell.length > 2000))) fail('Invalid V5 data table.');
      for (const key of ['tasks', 'marks']) {
        if (!Array.isArray(q[key]) || q[key].length !== 5 || q[key].some(s => typeof s !== 'string' || !s.trim())) {
          fail('Each V5 case requires five tasks and five marking points.');
        }
      }
      if (q.data_status !== 'fictional_practice_data' || q.laboratory_procedure_included !== false ||
          q.review_status !== 'independent_model_teacher_review_pending') fail('Invalid V5 evidence label.');
      ids.add(q.id); covered.add(activity.id); counts[q.subject]++;
    }
    for (const [subject, expected] of Object.entries(subjects)) if (counts[subject] !== expected) fail('V5 subject coverage mismatch.');
    return v5;
  }
  function applyCorrections(questions, corrections) {
    const seen = new Set();
    for (const c of corrections || []) {
      if (!c || typeof c.question_id !== 'string' || seen.has(c.question_id) || !c.reason || !c.patch) {
        throw Error('Invalid V5 correction ledger.');
      }
      const q = questions.find(q => q.id === c.question_id);
      if (!q) throw Error('Correction points to a missing question.');
      for (const key of Object.keys(c.patch)) {
        if (!['title', 'data', 'scenario', 'marks', 'worked_explanation', 'common_error', 'error', 'question', 'transfer', 'transfer_answer'].includes(key)) {
          throw Error('Correction cannot change question identity or private records.');
        }
      }
      Object.assign(q, JSON.parse(JSON.stringify(c.patch)));
      q.correction_note = c.reason;
      q.content_revision = RELEASE;
      seen.add(c.question_id);
    }
    return questions;
  }
  root.PowerhouseV5Content = Object.freeze({ RELEASE, validate, applyCorrections });
})(globalThis);
