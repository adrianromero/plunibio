import { access, cp, lstat, mkdtemp, readdir, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveFlowPath } from "./flow";
import type { AutomationFlow } from "./types";

export type PreparedWorkspace = {
    basePath: string;
    temporary: boolean;
    cleanup: () => Promise<void>;
};

async function setFixtureTimestamp(path: string, timestamp: Date): Promise<void> {
    const metadata = await lstat(path);
    // Never follow a link to an original fixture or an external target.
    if (metadata.isSymbolicLink()) return;
    if (metadata.isDirectory()) {
        for (const name of await readdir(path)) {
            await setFixtureTimestamp(join(path, name), timestamp);
        }
    }
    await utimes(path, timestamp, timestamp);
}

export async function prepareFlowWorkspace(
    flow: AutomationFlow,
    projectRoot: string
): Promise<PreparedWorkspace> {
    const sourceBasePath = resolveFlowPath(flow.app.basePath, projectRoot);
    await access(sourceBasePath);

    if (flow.app.workspaceMode === "read-only") {
        return {
            basePath: sourceBasePath,
            temporary: false,
            cleanup: async () => undefined,
        };
    }

    const temporaryRoot = await mkdtemp(join(tmpdir(), "plunibio-automation-"));
    const temporaryBasePath = join(temporaryRoot, "workspace");
    try {
        await cp(sourceBasePath, temporaryBasePath, {
            recursive: true,
            errorOnExist: true,
            force: false,
        });
        if (flow.app.fixtureTimestamp) {
            const timestamp = new Date(flow.app.fixtureTimestamp);
            if (!Number.isFinite(timestamp.getTime())) throw new Error("Invalid fixture timestamp");
            await setFixtureTimestamp(temporaryBasePath, timestamp);
        }
    } catch (error) {
        await rm(temporaryRoot, { recursive: true, force: true });
        throw error;
    }

    return {
        basePath: temporaryBasePath,
        temporary: true,
        cleanup: async () => {
            await rm(temporaryRoot, { recursive: true, force: true });
        },
    };
}
