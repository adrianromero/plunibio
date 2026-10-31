import { access, cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveFlowPath } from "./flow";
import type { AutomationFlow } from "./types";

export type PreparedWorkspace = {
    basePath: string;
    temporary: boolean;
    cleanup: () => Promise<void>;
};

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
