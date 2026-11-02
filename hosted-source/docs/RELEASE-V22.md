# Performance Powerhouse V22 — Latest Attempt Recovery

Isolated candidate based on published V21 source `ff85c30902e562bd250b05e390d7a5816c3c2e68` (saved Site version46). This bounded change corrects the existing attempt-draft restore path. It adds no persistent store, schema, namespace, dependency, tracker, cross-site connection or academic credit. The existing planner, academic records, verification desk, Paper Observatory and worksheets remain.

## Confirmed defect and resulting behavior

The input listener holds the newest attempt fields in memory for 250 ms before saving them. Restore previously ignored that pending copy and loaded the older saved draft after resetting the form. An isolated actual-module diagnostic reproduced a newer question and `4 / 5` marks reverting to an older question and `2 / 5`; a further edit could then supersede the newest pending fields. The old saved original remained recoverable, while the latest unsaved question was absent from all stored copies in that fixture. This is a synthetic defect reproduction, not an observed real-student incident.

Restore now takes an immutable field snapshot from the newest pending draft when available, otherwise the existing unsubmitted saved draft. The same choice determines Restore availability, including first-ever unsaved drafts and new work following a submitted draft. Restoration remains an in-memory field action: it neither forces the debounce save nor clears the pending copy. The next normal input/save continues from the restored latest fields. An already-open editor is refused before any reset.

Before resetting the form, recovery checks fields against its actual current controls, supported option values and existing subject/topic catalog. Unknown fields, incompatible types or unsupported subject/topic combinations receive an explicit review message; their raw and pending copies remain unchanged. Historically absent controls stay blank for manual completion instead of acquiring a default subject, topic, type, date or confidence. No unsupported data is silently remapped.

Existing read-only, unreadable, future-schema, interrupted-save and competing-copy protections remain. Quota or conflict failures retain the pending draft for private export; restoration does not force a write or bypass a paused store. The existing original/recovery formats and stored bytes are preserved by the same guarded writer. The draft export keeps its existing behavior: export the latest pending draft when present, otherwise the stored raw draft.

Recovery, draft export, pending writes and source-linked handoff recheck the current Share-safe flag, shared body state and live `?share=1` URL, plus the connected form/notice. A captured action cannot restore or export private fields while those checks report shared. Returning private retains the pending fields. This does not recall files already downloaded outside the page or create another privacy mechanism for unrelated modules.

## Verification and limits

Eleven new tests execute the actual draft module, actual attempt-dialog markup and source-extracted actual dialog opener with isolated synthetic storage and documented native DOM shims. The pre-fix run retained four passing controls and seven failures. The fixed run passes all eleven cases and the five existing source-linked repair handoff tests, with no skipped focused cases. These cover exact source/edit IDs, strings and checkboxes, latest pending work, first pending work, submitted-plus-pending work, subsequent edits, occupied editors, quota/conflict, unreadable/future/interrupted originals, unknown/incomplete historical fields, live privacy refusal, normal autosave and private exports. Academic attempts and retest completion remain unchanged by restoration.

The earlier diagnostic's initial archive search failed to decode JSON-escaped original copies. Its output remains preserved and classified; the corrected diagnostic confirms the older raw original is recoverable. The separate finding that the latest pending question can be lost was unchanged. No failed evidence or assertion was discarded.

Focused evidence is under `work/flagship-next/qa/powerhouse/`. No browser, real student profile, full build or deployment was run by this implementation pass. Root owns final type/lint/build/application checks, actual disposable-browser reproduction, historical compatibility gates, exact source freeze, edition/cache labels and any separately authorized publication. A local successful fixture is not proof of device durability or every visitor's browser data.

Browser storage remains subject to deletion, quota and competing tabs. Keep independent exports before device changes or deliberate recovery. Source rollback is not data rollback; already-open older tabs keep their loaded behavior until refreshed. No claim of complete accessibility, security certification, scientific correctness or official marking-key verification is made.
