# Study Tracker Data Portability

## Export

- **Export JSON** creates a versioned tracker backup containing sessions, goals, preferences, active timer state, sync metadata and migration receipts.
- **Export CSV** creates a practical session ledger for spreadsheets.
- **Complete backup** bundles the existing V4 core, Study Tracker and Physics Intelligence browser data without changing their independent storage namespaces.

Keep exports private: session notes and linked attempt identifiers may contain personal information.

## Import and restore

Study Tracker accepts its own JSON backup and the inspected original tracker's Supabase `daily_progress` export. Existing record IDs are merged idempotently. The existing V4 core importer remains unchanged and old V4 backups remain compatible.

The CLI converter is `tools/convert-study-tracker-export.mjs`. It never connects to the original database and never deletes source data.

## Deletion and correction

- Individual sessions can be edited or deleted from history.
- **Delete tracker data** requires typing `DELETE`. When authenticated and online it deletes all cloud sessions, goals, preferences and migration receipts scoped to that user, then clears local tracker state.
- When signed out, it clears only local tracker data and explicitly warns that a cloud copy may remain.

Deleting tracker data does not delete the user's ChatGPT identity or the existing Powerhouse V4/Physics Intelligence data.

## Offline and sync

Writes save locally first and enter a retry queue. Stable IDs prevent duplicates after reconnect/retry. Cloud sync is optional; exporting JSON is recommended before large imports or destructive actions.
