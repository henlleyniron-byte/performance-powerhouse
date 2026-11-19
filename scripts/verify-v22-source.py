#!/usr/bin/env python3
"""Check the original public V22 import or the explicitly recorded working changes."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / 'hosted-source'
MANIFEST = ROOT / 'docs/V22_SOURCE_MANIFEST.json'
CHANGES = ROOT / 'docs/V22_WORKING_CHANGES.json'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def archive_files(commit):
    def git(*args):
        return subprocess.check_output(['git', *args], cwd=ROOT)

    if git('show', f'{commit}:docs/V22_SOURCE_MANIFEST.json') != MANIFEST.read_bytes():
        raise ValueError('The original public manifest differs from its archived copy')
    data = git('archive', '--format=tar', f'{commit}:hosted-source')
    files = {}
    with tarfile.open(fileobj=io.BytesIO(data)) as archive:
        for entry in archive:
            if entry.isdir():
                continue
            if not entry.isfile():
                raise ValueError(f'Unexpected archive entry type at {entry.name}')
            files[entry.name] = (sha256(archive.extractfile(entry).read()), bool(entry.mode & 0o111))
    return files


def working_files():
    files = {}
    for path in SNAPSHOT.rglob('*'):
        if path.is_symlink():
            raise ValueError(f'Unexpected symbolic link at {path.relative_to(SNAPSHOT)}')
        if path.is_file():
            files[path.relative_to(SNAPSHOT).as_posix()] = (sha256(path.read_bytes()), bool(path.stat().st_mode & 0o111))
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', action='store_true', help='read the original V22 import from Git history')
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_bytes())
    changes = json.loads(CHANGES.read_bytes())
    expected = {}
    for item in manifest['files']:
        if item['redacted_link_count'] == 0 and item['source_sha256'] != item['public_sha256']:
            raise ValueError(f"Unredacted source hash mismatch at {item['path']}")
        expected[item['path']] = (item['public_sha256'], item['mode'] == '100755')
    if args.archive:
        actual = archive_files(changes['archive_commit'])
        label = 'original V22 import'
    else:
        for item in changes['files']:
            expected[item['path']] = (item['sha256'], item['mode'] == '100755')
        actual = working_files()
        label = 'working V22 source'
    omitted = {item['path'] for item in manifest['omitted']}
    if omitted & actual.keys():
        raise ValueError('An intentionally omitted file is present')
    problems = []
    for path in sorted(actual.keys() | expected.keys()):
        if path not in expected:
            problems.append(f'Unexpected file: {path}')
        elif path not in actual:
            problems.append(f'Missing file: {path}')
        elif actual[path] != expected[path]:
            problems.append(f'Content or executable mode differs: {path}')
    if problems:
        raise ValueError('\n'.join(problems))
    print(f'PASS: {label}, {len(actual)} files and {len(omitted)} verified omissions')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        sys.exit(str(error))
