// Read-only CLI checks: every case exits before the graphical application starts.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const binary = resolve(process.argv[2] ?? 'src-tauri/target/debug/plunibio');
const temporary = await mkdtemp(join(tmpdir(), 'plunibio-doc-cli-'));
try {
    const workspace = join(temporary, 'workspace with spaces');
    await mkdir(workspace);
    await writeFile(join(workspace, 'README.md'), '# CLI fixture\n');
    const cases = [
        ['help', ['--help'], 0, /--base-path[\s\S]*--width[\s\S]*--height/],
        ['short help', ['-h'], 0, /Usage:/],
        ['version', ['--version'], 0, /\d+\.\d+/],
        ['zero width', ['--width', '0'], 2],
        ['zero height', ['--height', '0'], 2],
        ['negative width', ['--width=-1'], 2],
        ['fractional width', ['--width', '1024.5'], 2],
        ['missing value', ['--width'], 2],
        ['unknown option', ['--not-a-plunibio-option'], 2],
        ['absolute filename', ['--base-path', workspace, join(workspace, 'README.md')], 2, /Filename must be relative/],
        ['parent filename', ['--base-path', workspace, '../README.md'], 2, /Filename must be relative/],
        ['internal parent segment', ['--base-path', workspace, 'notes/../README.md'], 2, /Filename must be relative/],
        ['missing workspace', ['--base-path', 'missing'], 2, /Failed to resolve base path/],
        ['workspace is a file', ['--base-path', join(workspace, 'README.md')], 2, /Base path is not a directory/],
        ['extra positional argument', ['first.md', 'second.md'], 2],
    ];
    for (const [name, args, expectedStatus, pattern] of cases) {
        const result = spawnSync(binary, args, { cwd: temporary, encoding: 'utf8', timeout: 5000 });
        assert.ifError(result.error);
        assert.equal(result.status, expectedStatus, `${name}: unexpected exit status`);
        if (pattern) assert.match(result.stdout + result.stderr, pattern, `${name}: unexpected diagnostic`);
        console.log(`PASS: ${name}`);
    }
    console.log(`${cases.length} CLI checks passed; no GUI launched and no user configuration changed.`);
} finally {
    await rm(temporary, { recursive: true, force: true });
}
