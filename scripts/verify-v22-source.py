#!/usr/bin/env python3
"""Verify the public V22 snapshot against the committed provenance manifest."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'docs/V22_SOURCE_MANIFEST.json').read_text())
snapshot = root / 'hosted-source'
expected = {item['path'] for item in manifest['files']}
actual = {str(p.relative_to(snapshot)) for p in snapshot.rglob('*') if p.is_file()}
assert actual == expected, 'Snapshot file inventory mismatch'
for item in manifest['files']:
    path = snapshot / item['path']
    data = path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == item['public_sha256'], item['path']
    if item['redacted_link_count'] == 0:
        assert hashlib.sha256(data).hexdigest() == item['source_sha256'], item['path']
    assert bool(path.stat().st_mode & 0o111) == (item['mode'] == '100755'), item['path']
for item in manifest['omitted']:
    assert not (snapshot / item['path']).exists(), item['path']
print(f"PASS: {len(expected)} files; source {manifest['source_commit']}; "
      f"{len(manifest['omitted'])} disclosed omissions")
