#!/usr/bin/env python3
"""Verify every indexed review snapshot using Git objects; no network or private fixtures."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]

def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])

def blob(sha):
    return git('cat-file', 'blob', sha)

def snapshot_tree(commit, folder):
    entries = {}
    for line in git('ls-tree', '-rz', commit + ':' + folder).split(b'\0'):
        if not line:
            continue
        info, path = line.split(b'\t', 1)
        mode, kind, sha = info.decode().split()
        assert kind == 'blob', 'Unsupported snapshot entry: ' + path.decode()
        entries[path.decode()] = (mode, sha)
    return entries

def verify():
    index = json.loads((ROOT / 'history/index.json').read_text())
    records = json.loads((ROOT / 'history/site-records-2026-10-23.json').read_text())
    saved = {x['version_number']: x['source']['commit_sha'] for x in records}
    assert sorted(saved) == list(range(1, 43)), 'Saved version inventory is incomplete'
    assert {x['version']: x['source_commit'] for x in index['versions']} == saved
    entries = [(e, 'hosted-source') for e in index['versions'] + index['intermediate_source_commits']]
    entries += [(e, 'related-source/legacy-v5.1') for e in index['secondary_source_commits']]
    cache = {}
    checked = 0
    for entry, folder in entries:
        manifest = json.loads((ROOT / entry['manifest']).read_text())
        assert manifest['source_commit'] == entry['source_commit']
        actual = snapshot_tree(entry['public_commit'], folder)
        expected = {f['path']: f for f in manifest['files']}
        assert len(expected) == len(manifest['files']), 'Duplicate manifest paths'
        assert set(actual) == set(expected), 'Snapshot paths differ: ' + entry['manifest'] + ' ' + repr(set(actual) ^ set(expected))
        for path, record in expected.items():
            assert not PurePosixPath(path).is_absolute() and '..' not in PurePosixPath(path).parts
            mode, sha = actual[path]
            assert mode == record['mode'], 'File mode mismatch: ' + path
            if sha not in cache:
                cache[sha] = blob(sha)
            data = cache[sha]
            assert hashlib.sha256(data).hexdigest() == record['public_sha256'], 'Content mismatch: ' + path
            if not record['redacted_link_count']:
                assert sha == record['source_blob'], 'Original blob differs: ' + path
            else:
                assert b'https://example.invalid/private-resource/' in data, 'Missing redaction placeholder'
            checked += 1
        for omission in manifest['omitted']:
            assert omission['path'] not in actual, 'Omitted path was published'
    assert len({e['source_commit'] for e, folder in entries if folder == 'hosted-source'}) == 48
    assert len(index['secondary_source_commits']) == 4
    return {'checked_head': git('rev-parse', 'HEAD').decode().strip(),
            'saved_versions': 42, 'intermediate_hosted_commits': 6,
            'secondary_commits': 4, 'snapshots_verified': len(entries),
            'file_hash_checks': checked, 'unique_public_blobs': len(cache),
            'result': 'pass',
            'limits': 'Proves indexed Git paths, modes, hashes and original unredacted blob associations. Does not prove hosted HTTP parity, deployment, academic accuracy, browser behavior, build reproducibility or recovery.'}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    result = verify()
    print(json.dumps(result, indent=2) if args.json else 'PASS: {snapshots_verified} snapshots; {file_hash_checks} file hashes; {unique_public_blobs} unique blobs'.format(**result))
