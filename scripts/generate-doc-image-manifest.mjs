/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { execFile } from "node:child_process";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const flowsRoot = resolve(projectRoot, "automation/flows");
const imagesRoot = resolve(projectRoot, "website/assets/images/docs");
const altFilename = resolve(projectRoot, "automation/docs-image-alts.json");
const manifestFilename = resolve(projectRoot, "website/_data/docs_images.json");

async function walk(directory, extension) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) return walk(path, extension);
            return entry.isFile() && extname(entry.name).toLowerCase() === extension
                ? [path]
                : [];
        })
    );
    return nested.flat().sort();
}

function repoPath(filename) {
    return relative(projectRoot, filename).split(sep).join("/");
}

async function dimensions(filename) {
    const { stdout } = await execFileAsync("identify", ["-format", "%w %h", filename]);
    const [width, height] = stdout.trim().split(/\s+/).map(Number);
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
        throw new Error(`Unable to read dimensions for ${repoPath(filename)}.`);
    }
    return { width, height };
}

const altDefinitions = JSON.parse(await readFile(altFilename, "utf8"));
const flowFiles = (await readdir(flowsRoot))
    .filter((name) => name.startsWith("docs-") && name.endsWith(".json"))
    .sort();
const records = [];
const targets = new Set();
const usedAltKeys = new Set();

for (const flowFile of flowFiles) {
    const flowPath = join(flowsRoot, flowFile);
    const flow = JSON.parse(await readFile(flowPath, "utf8"));
    if (!flow.outputDir) continue;

    const outputDirectory = resolve(projectRoot, flow.outputDir);
    const outputRelative = relative(imagesRoot, outputDirectory).split(sep);
    if (outputRelative.length !== 2 || outputRelative[0].startsWith("..")) {
        throw new Error(`${flowFile} has a capture directory outside the bilingual docs tree.`);
    }
    const [language, chapter] = outputRelative;

    for (const [index, step] of flow.steps.entries()) {
        if (step.action !== "capture") continue;
        const capture = step.name.replace(/\.png$/i, "");
        const filename = join(outputDirectory, `${capture}.webp`);
        const target = repoPath(filename);
        if (targets.has(target)) throw new Error(`Duplicate capture target: ${target}.`);
        targets.add(target);

        const altKey = `${chapter}/${capture}`;
        const alt = altDefinitions[altKey]?.[language];
        if (typeof alt !== "string" || alt.trim().length === 0) {
            throw new Error(`Missing ${language} alternative text for ${altKey}.`);
        }
        usedAltKeys.add(altKey);

        const [{ size: bytes }, imageDimensions] = await Promise.all([
            stat(filename),
            dimensions(filename),
        ]);
        records.push({
            id: `${language}-${chapter}-${capture}`,
            language,
            chapter,
            capture,
            path: `/${relative(resolve(projectRoot, "website"), filename).split(sep).join("/")}`,
            flow: repoPath(flowPath),
            step: index + 1,
            scope: step.scope ?? "viewport",
            ...imageDimensions,
            bytes,
            alt,
        });
    }
}

const pngFiles = await walk(imagesRoot, ".png");
if (pngFiles.length > 0) {
    throw new Error(`Optimize captures before generating the manifest; found ${pngFiles.length} PNG.`);
}
const webpFiles = await walk(imagesRoot, ".webp");
const unowned = webpFiles.map(repoPath).filter((filename) => !targets.has(filename));
if (unowned.length > 0) throw new Error(`WebP files without a capture step: ${unowned.join(", ")}.`);
const missing = [...targets].filter(
    (filename) => !webpFiles.map(repoPath).includes(filename)
);
if (missing.length > 0) throw new Error(`Capture steps without a WebP file: ${missing.join(", ")}.`);

const unusedAltKeys = Object.keys(altDefinitions).filter((key) => !usedAltKeys.has(key));
if (unusedAltKeys.length > 0) {
    throw new Error(`Unused alternative-text entries: ${unusedAltKeys.join(", ")}.`);
}
for (const key of usedAltKeys) {
    const languages = new Set(
        records.filter((record) => `${record.chapter}/${record.capture}` === key).map((record) => record.language)
    );
    if (languages.size !== 2 || !languages.has("en") || !languages.has("es")) {
        throw new Error(`Capture ${key} does not have matching English and Spanish files.`);
    }
}

records.sort((left, right) => left.path.localeCompare(right.path));
const manifest = {
    schema_version: 1,
    generated_by: "npm run docs:images:manifest",
    images: records,
};
await writeFile(manifestFilename, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
    `Generated ${repoPath(manifestFilename)} with ${records.length} images ` +
        `(${records.length / 2} bilingual pairs).`
);
