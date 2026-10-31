/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { execFile } from "node:child_process";
import { readdir, rename, rm, stat } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const docsImagesRoot = resolve(projectRoot, "website/assets/images/docs");

async function findPngFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) return findPngFiles(path);
            return entry.isFile() && extname(entry.name).toLowerCase() === ".png" ? [path] : [];
        })
    );
    return nested.flat().sort();
}

async function assertPixelIdentical(source, optimized) {
    const { stderr } = await execFileAsync("compare", [
        "-metric",
        "AE",
        source,
        optimized,
        "null:",
    ]);
    const differentPixels = Number.parseFloat(stderr.trim());
    if (!Number.isFinite(differentPixels) || differentPixels !== 0) {
        throw new Error(
            `Lossless verification failed for ${source}: ${stderr.trim()} different pixels.`
        );
    }
}

async function optimize(source) {
    const stem = basename(source, extname(source));
    const destination = join(dirname(source), `${stem}.webp`);
    const temporary = join(dirname(source), `.${stem}.tmp.webp`);
    await rm(temporary, { force: true });

    try {
        await execFileAsync("convert", [
            source,
            "-strip",
            "-define",
            "webp:lossless=true",
            "-define",
            "webp:method=6",
            "-quality",
            "100",
            temporary,
        ]);
        await assertPixelIdentical(source, temporary);

        const [{ size: sourceBytes }, { size: optimizedBytes }] = await Promise.all([
            stat(source),
            stat(temporary),
        ]);
        await rename(temporary, destination);
        await rm(source);
        return { sourceBytes, optimizedBytes };
    } catch (error) {
        await rm(temporary, { force: true });
        throw error;
    }
}

const pngFiles = await findPngFiles(docsImagesRoot);
if (pngFiles.length === 0) {
    console.log("No PNG documentation captures require optimization.");
    process.exit(0);
}

let sourceBytes = 0;
let optimizedBytes = 0;
for (const file of pngFiles) {
    const result = await optimize(file);
    sourceBytes += result.sourceBytes;
    optimizedBytes += result.optimizedBytes;
}

const savedPercent = ((sourceBytes - optimizedBytes) / sourceBytes) * 100;
const mib = (bytes) => (bytes / 1024 / 1024).toFixed(2);
console.log(
    `Optimized ${pngFiles.length} captures: ${mib(sourceBytes)} MiB → ${mib(optimizedBytes)} MiB ` +
        `(${savedPercent.toFixed(1)}% smaller, pixel-identical).`
);
