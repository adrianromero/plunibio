import { resolve } from "node:path";
import "@wdio/tauri-service";
import { loadFlow } from "./flow";

const projectRoot = resolve(import.meta.dirname, "..");
const flowFilename = process.env.PLUNIBIO_AUTOMATION_FLOW;
if (!flowFilename) {
    throw new Error("PLUNIBIO_AUTOMATION_FLOW is not set");
}
const flow = await loadFlow(flowFilename);
const basePath = process.env.PLUNIBIO_AUTOMATION_BASE_PATH
    ? resolve(process.env.PLUNIBIO_AUTOMATION_BASE_PATH)
    : resolve(projectRoot, flow.app.basePath);
const application = resolve(projectRoot, "src-tauri/target/debug/plunibio");
const appArgs = [
    "--base-path",
    basePath,
    "--width",
    String(flow.app.width ?? 1024),
    "--height",
    String(flow.app.height ?? 768),
    ...(flow.app.file ? [flow.app.file] : []),
];

export const config: WebdriverIO.Config = {
    runner: "local",
    specs: [resolve(import.meta.dirname, "run-flow.spec.ts")],
    maxInstances: 1,
    services: [
        [
            "@wdio/tauri-service",
            {
                appBinaryPath: application,
                appArgs,
                env: { GDK_BACKEND: "x11" },
                driverProvider: "embedded",
                captureBackendLogs: true,
                captureFrontendLogs: true,
            },
        ],
    ],
    capabilities: [
        {
            browserName: "tauri",
        },
    ],
    logLevel: "warn",
    waitforTimeout: flow.timeoutMs ?? 10_000,
    connectionRetryTimeout: 90_000,
    connectionRetryCount: 1,
    framework: "mocha",
    reporters: ["spec"],
    mochaOpts: {
        ui: "bdd",
        timeout: Math.max(120_000, flow.steps.length * (flow.timeoutMs ?? 10_000)),
    },
};
