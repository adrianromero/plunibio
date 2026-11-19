/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import {
    EMPTY_SEARCH_QUERY,
    type SearchController,
    type SearchQueryOptions,
    type SearchStatus,
} from "@/features/search/SearchController";

type Cell = { row: number; column: number };
type Match = Cell & { offset: number; length: number };
type Edit = Cell & { value: string };

function searchExpression(query: SearchQueryOptions): RegExp | null {
    if (!query.search) return null;
    const pattern = query.regexp ? query.search : query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const word = "[\\p{L}\\p{M}\\p{N}_]";
    const source = query.wholeWord ? `(?<!${word})(?:${pattern})(?!${word})` : pattern;
    try {
        return new RegExp(source, query.caseSensitive ? "gu" : "giu");
    } catch {
        return null;
    }
}

export class TableSearchController implements SearchController {
    private query = { ...EMPTY_SEARCH_QUERY };
    private expression: RegExp | null = null;
    private matches: Match[] = [];
    private cells = new Map<number, Set<number>>();
    private current = -1;
    private readonly listeners = new Set<(status: SearchStatus) => void>();

    constructor(
        private readonly getRows: () => readonly (readonly string[])[],
        private readonly applyEdits: (edits: Edit[]) => void,
        private readonly reveal: (cell: Cell) => void,
        readonly focusEditor: () => void,
        private readonly refreshHighlights: () => void
    ) {}

    getQuery(): SearchQueryOptions {
        return { ...this.query };
    }

    getStatus(): SearchStatus {
        return {
            total: this.matches.length,
            current: this.current < 0 ? null : this.current + 1,
            valid: this.expression !== null,
        };
    }

    subscribe(listener: (status: SearchStatus) => void): () => void {
        this.listeners.add(listener);
        listener(this.getStatus());
        return () => this.listeners.delete(listener);
    }

    updateQuery(query: SearchQueryOptions): void {
        const previousSearch = this.query;
        this.query = { ...query };
        if (previousSearch.search === query.search && previousSearch.caseSensitive === query.caseSensitive &&
            previousSearch.wholeWord === query.wholeWord && previousSearch.regexp === query.regexp) return;
        this.expression = searchExpression(query);
        this.contentChanged();
    }

    contentChanged(): void {
        this.matches = [];
        this.cells.clear();
        const expression = this.expression;
        if (expression) {
            this.getRows().forEach((values, row) => {
                values.forEach((value, column) => {
                    for (const match of value.matchAll(expression)) {
                        this.matches.push({ row, column, offset: match.index, length: match[0].length });
                        const columns = this.cells.get(row) ?? new Set<number>();
                        columns.add(column);
                        this.cells.set(row, columns);
                    }
                });
            });
        }
        this.current = -1;
        this.emit();
    }

    isMatch(row: number, column: number): boolean {
        return this.cells.get(row)?.has(column) ?? false;
    }

    isCurrent(row: number, column: number): boolean {
        const match = this.matches[this.current];
        return match?.row === row && match.column === column;
    }

    findNext(): boolean {
        return this.select(this.current + 1);
    }

    findPrevious(): boolean {
        return this.select(this.current < 0 ? this.matches.length - 1 : this.current - 1);
    }

    replaceCurrent(): boolean {
        const match = this.matches[this.current];
        const expression = this.expression;
        if (!match || !expression) return false;
        const original = this.getRows()[match.row][match.column];
        const atMatch = new RegExp(expression.source, expression.flags.replace("g", "y"));
        atMatch.lastIndex = match.offset;
        const value = this.replace(original, atMatch);
        const replacementLength = value.length - original.length + match.length;
        const after = match.offset + (match.length === 0 ? Math.max(1, replacementLength) : replacementLength);
        this.applyEdits([{ row: match.row, column: match.column, value }]);
        this.contentChanged();
        const next = this.matches.findIndex((candidate) => candidate.row > match.row ||
            (candidate.row === match.row && (candidate.column > match.column ||
                (candidate.column === match.column && candidate.offset >= after))));
        if (this.matches.length) this.select(next < 0 ? 0 : next);
        return true;
    }

    replaceAll(): number {
        const count = this.matches.length;
        const expression = this.expression;
        if (!count || !expression) return 0;
        const edits: Edit[] = [];
        const rows = this.getRows();
        this.cells.forEach((columns, row) => {
            columns.forEach((column) => {
                edits.push({ row, column, value: this.replace(rows[row][column], expression) });
            });
        });
        this.applyEdits(edits);
        this.contentChanged();
        return count;
    }

    clear(): void {
        this.updateQuery(EMPTY_SEARCH_QUERY);
    }

    destroy(): void {
        this.listeners.clear();
        this.matches = [];
        this.cells.clear();
        this.expression = null;
        this.current = -1;
    }

    private replace(value: string, expression: RegExp): string {
        return this.query.regexp ? value.replace(expression, this.query.replacement)
            : value.replace(expression, () => this.query.replacement);
    }

    private select(index: number): boolean {
        const count = this.matches.length;
        if (!count) return false;
        this.current = (index + count) % count;
        this.reveal(this.matches[this.current]);
        this.emit();
        return true;
    }

    private emit(): void {
        const status = this.getStatus();
        this.listeners.forEach((listener) => listener(status));
        this.refreshHighlights();
    }
}
