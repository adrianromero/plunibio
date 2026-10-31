import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { loadFlow, resolveFlowPath } from "./flow";
import { prepareFlowWorkspace } from "./workspace";

const projectRoot = resolve(import.meta.dirname, "..");
const requestedFlow = process.argv[2];

if (!requestedFlow || requestedFlow === "--help" || requestedFlow === "-h") {
    console.log("Usage: npm run automation:run -- <flow.json>");
    process.exit(requestedFlow ? 0 : 2);
}

const flowFilename = resolveFlowPath(requestedFlow, projectRoot);
const flow = await loadFlow(flowFilename);

const binary = resolve(projectRoot, "src-tauri/target/debug/plunibio");
try {
    await access(binary);
} catch {
    throw new Error("Automation binary not found. Run 'npm run automation:build' first.");
}

const workspace = await prepareFlowWorkspace(flow, projectRoot);
try {
    if (workspace.temporary) {
        console.log(`Using temporary workspace: ${workspace.basePath}`);
    }

    process.env.PLUNIBIO_AUTOMATION_FLOW = flowFilename;
    process.env.PLUNIBIO_AUTOMATION_BASE_PATH = workspace.basePath;
    const child = spawn(
        resolve(projectRoot, "node_modules/.bin/wdio"),
        ["run", resolve(import.meta.dirname, "wdio.conf.ts")],
        {
            cwd: projectRoot,
            env: process.env,
            stdio: "inherit",
        }
    );
    process.exitCode = await new Promise<number>((resolveExitCode, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            resolveExitCode(code ?? (signal ? 1 : 0));
        });
    });
} finally {
    if (workspace.temporary) {
        await workspace.cleanup();
        console.log("Removed temporary workspace");
    }
}
