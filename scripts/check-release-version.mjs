/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const semverPattern =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function readJson(relativePath) {
    const path = resolve(root, relativePath);

    try {
        return JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
        throw new Error(`Cannot read ${relativePath}: ${error.message}`, { cause: error });
    }
}

function readCargoPackageVersion() {
    const relativePath = "src-tauri/Cargo.toml";
    const lines = readFileSync(resolve(root, relativePath), "utf8").split(/\r?\n/);
    let inPackageSection = false;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === "[package]") {
            inPackageSection = true;
            continue;
        }

        if (inPackageSection && trimmedLine.startsWith("[")) break;
        if (!inPackageSection) continue;

        const version = trimmedLine.match(/^version\s*=\s*"([^"]+)"(?:\s*#.*)?$/)?.[1];
        if (version) return version;
    }

    throw new Error(`Cannot find package.version in ${relativePath}`);
}

function requireVersion(value, source) {
    if (typeof value !== "string" || !semverPattern.test(value)) {
        throw new Error(`${source} must contain a valid semantic version, received: ${value}`);
    }

    return value;
}

function releaseVersion() {
    const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;

    if (!tag) {
        throw new Error(
            "Missing release tag. Pass it as an argument or set GITHUB_REF_NAME " +
                "(example: node scripts/check-release-version.mjs v0.2.0)."
        );
    }

    if (!tag.startsWith("v")) {
        throw new Error(`Release tag must start with "v", received: ${tag}`);
    }

    return requireVersion(tag.slice(1), "Release tag");
}

function main() {
    const expectedVersion = releaseVersion();
    const versions = new Map([
        ["package.json", requireVersion(readJson("package.json").version, "package.json version")],
        [
            "src-tauri/Cargo.toml",
            requireVersion(readCargoPackageVersion(), "src-tauri/Cargo.toml package version"),
        ],
        [
            "src-tauri/tauri.conf.json",
            requireVersion(
                readJson("src-tauri/tauri.conf.json").version,
                "src-tauri/tauri.conf.json version"
            ),
        ],
    ]);
    const mismatches = [...versions].filter(([, version]) => version !== expectedVersion);

    if (mismatches.length > 0) {
        const details = [...versions]
            .map(([source, version]) => `  - ${source}: ${version}`)
            .join("\n");
        throw new Error(
            `Release tag expects version ${expectedVersion}, but project versions do not match:\n${details}`
        );
    }

    console.log(`Release version ${expectedVersion} is consistent across all project files.`);
}

try {
    main();
} catch (error) {
    console.error(`Release version check failed: ${error.message}`);
    process.exitCode = 1;
}
