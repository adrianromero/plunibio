/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

/** Types serialized by commands in the Rust backend. */

export type InitialConfig = {
    basepath: string;
    filename: string;
};

export type PathKind = "file" | "directory" | "other";

type DirectoryEntryBase = {
    name: string;
    filename: string;
    modifiedAt: number | null;
};

export type DirectoryEntry =
    | (DirectoryEntryBase & {
          kind: "directory";
          sizeBytes: null;
          itemCount: number | null;
      })
    | (DirectoryEntryBase & {
          kind: "file";
          sizeBytes: number;
          itemCount: null;
      });

export type DirectoryBrowserEntry = {
    name: string;
    path: string;
};

export type DirectoryBrowserLocation = {
    path: string;
    parent: string | null;
    directories: DirectoryBrowserEntry[];
};

export type ReadFileResult = {
    content: string;
    isNew: boolean;
};

export type ReadBinaryFileResult = {
    content: number[];
    isNew: boolean;
};
