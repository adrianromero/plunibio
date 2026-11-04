import assert from "node:assert/strict";
import { access, lstat, mkdir, mkdtemp, readFile, rm, symlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadFlow } from "../flow";
import { prepareFlowWorkspace } from "../workspace";
import type { AutomationFlow } from "../types";

const timestamp = "2026-10-01T12:00:00Z";

test("fixed dates apply only to the disposable copy, without following symlinks", async () => {
    const root = await mkdtemp(join(tmpdir(), "plunibio-workspace-test-"));
    const source = join(root, "source");
    const outside = join(root, "outside.txt");
    let prepared: Awaited<ReturnType<typeof prepareFlowWorkspace>> | undefined;
    try {
        await mkdir(join(source, "nested"), { recursive: true });
        await writeFile(join(source, "nested", "note.md"), "Original fixture\n");
        await writeFile(outside, "External target\n");
        await symlink(outside, join(source, "outside-link"));
        const originalDate = new Date("2024-01-02T03:04:05Z");
        await utimes(join(source, "nested", "note.md"), originalDate, originalDate);
        await utimes(outside, originalDate, originalDate);
        const flow: AutomationFlow = {
            name: "workspace test", app: { basePath: source, workspaceMode: "temporary-copy", fixtureTimestamp: timestamp },
            steps: [{ action: "pause", milliseconds: 0 }],
        };
        prepared = await prepareFlowWorkspace(flow, root);
        assert.notEqual(prepared.basePath, source);
        for (const path of [prepared.basePath, join(prepared.basePath, "nested"), join(prepared.basePath, "nested", "note.md")]) {
            assert.equal((await lstat(path)).mtimeMs, Date.parse(timestamp));
        }
        assert.equal((await lstat(join(source, "nested", "note.md"))).mtimeMs, originalDate.getTime());
        assert.equal((await lstat(outside)).mtimeMs, originalDate.getTime());
        await writeFile(join(prepared.basePath, "nested", "note.md"), "Changed copy\n");
        assert.equal(await readFile(join(source, "nested", "note.md"), "utf8"), "Original fixture\n");
        await prepared.cleanup();
        await assert.rejects(access(prepared.basePath));
    } finally {
        await prepared?.cleanup();
        await rm(root, { recursive: true, force: true });
    }
});

test("flow loader validates deterministic dates and folder sorting", async () => {
    const root = await mkdtemp(join(tmpdir(), "plunibio-flow-test-"));
    const filename = join(root, "flow.json");
    const flow = {
        name: "flow test",
        app: { basePath: root, workspaceMode: "temporary-copy", fixtureTimestamp: timestamp,
            preferences: { folderSort: { attribute: "modified", direction: "desc" } } },
        steps: [{ action: "pause", milliseconds: 0 }],
    };
    try {
        await writeFile(filename, JSON.stringify(flow));
        assert.deepEqual((await loadFlow(filename)).app.preferences?.folderSort, { attribute: "modified", direction: "desc" });
        flow.app.workspaceMode = "read-only";
        await writeFile(filename, JSON.stringify(flow));
        await assert.rejects(loadFlow(filename), /fixtureTimestamp/);
        flow.app.workspaceMode = "temporary-copy";
        flow.app.fixtureTimestamp = "invalid";
        await writeFile(filename, JSON.stringify(flow));
        await assert.rejects(loadFlow(filename), /fixtureTimestamp/);
        flow.app.fixtureTimestamp = timestamp;
        flow.app.preferences.folderSort.direction = "sideways";
        await writeFile(filename, JSON.stringify(flow));
        await assert.rejects(loadFlow(filename), /folderSort/);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
