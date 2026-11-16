// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
for (const name of ["markdown", "mermaid", "echarts", "markdown-echarts", "pagination", "text"]) {
    const child = spawn(process.execPath, ["--import", "tsx", "automation/run.ts", `automation/flows/print-${name}.json`], {
        cwd: projectRoot, env: process.env, stdio: "inherit",
    });
    const code = await new Promise<number>((resolveExit, reject) => {
        child.once("error", reject);
        child.once("exit", code => resolveExit(code ?? 1));
    });
    if (code !== 0) process.exit(code);
}
console.log("PDFs saved in automation/output/printing");
