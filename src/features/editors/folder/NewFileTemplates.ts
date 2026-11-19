/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { Translator } from "@/i18n/Localization";
import type { CreateEntryKind } from "@/app/AppContext";

export const templateExtensions = {
    diagram: ".mmd",
    chart: ".echarts.json",
    table: ".csv",
} as const;

export function newFileContent(kind: CreateEntryKind, t: Translator): string | undefined {
    if (kind === "diagram") {
        return [
            "flowchart TD",
            `    start["${t("fileTemplates.diagramStart")}"] --> finish["${t("fileTemplates.diagramEnd")}"]`,
            "",
        ].join("\n");
    }
    if (kind === "chart") {
        const categories = ["A", "B"].map((letter) => t("fileTemplates.chartGroup", { letter }));
        return JSON.stringify({
            xAxis: { type: "category", data: categories },
            yAxis: { type: "value" },
            series: [{ type: "bar", data: [3, 5] }],
        }, null, 2) + "\n";
    }
    return undefined;
}
