/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const flowsRoot = resolve(projectRoot, "automation/flows");
const imagesRoot = resolve(projectRoot, "website/assets/images/docs");
const runner = resolve(projectRoot, "node_modules/.bin/tsx");
const runScript = resolve(projectRoot, "automation/run.ts");

async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name);
            return entry.isDirectory() ? walk(path) : [path];
        })
    );
    return nested.flat().sort();
}

async function imageSnapshot() {
    const files = await walk(imagesRoot);
    const snapshot = {};
    for (const filename of files) {
        const content = await readFile(filename);
        const key = relative(imagesRoot, filename).split(sep).join("/");
        snapshot[key] = createHash("sha256").update(content).digest("hex");
    }
    return snapshot;
}

async function runFlow(filename) {
    let output = "";
    const exitCode = await new Promise((resolveExitCode, reject) => {
        const child = spawn(runner, [runScript, filename, "--verify-only"], {
            cwd: projectRoot,
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
        });
        const collect = (chunk) => {
            output = `${output}${chunk}`.slice(-100_000);
        };
        child.stdout.on("data", collect);
        child.stderr.on("data", collect);
        child.once("error", reject);
        child.once("exit", (code, signal) => resolveExitCode(code ?? (signal ? 1 : 0)));
    });
    if (exitCode !== 0) {
        process.stderr.write(output);
        throw new Error(`Capture regression failed for ${relative(projectRoot, filename)}.`);
    }
}

const flowFiles = [];
let captureCount = 0;
for (const name of (await readdir(flowsRoot)).filter(
    (entry) => entry.startsWith("docs-") && entry.endsWith(".json")
).sort()) {
    const filename = join(flowsRoot, name);
    const flow = JSON.parse(await readFile(filename, "utf8"));
    const captures = flow.steps.filter((step) => step.action === "capture").length;
    if (captures > 0) {
        flowFiles.push(filename);
        captureCount += captures;
    }
}

const before = await imageSnapshot();
if (Object.keys(before).some((filename) => extname(filename).toLowerCase() !== ".webp")) {
    throw new Error("The published capture tree must contain only optimized WebP files.");
}

for (const [index, filename] of flowFiles.entries()) {
    console.log(
        `\n[${index + 1}/${flowFiles.length}] Verifying ${relative(projectRoot, filename)} without captures`
    );
    await runFlow(filename);
}

const after = await imageSnapshot();
if (JSON.stringify(after) !== JSON.stringify(before)) {
    throw new Error("The capture regression changed the published image tree.");
}

console.log(
    `\nVerified ${captureCount} capture checkpoints across ${flowFiles.length} flows; ` +
        `${Object.keys(after).length} published images remained unchanged.`
);
