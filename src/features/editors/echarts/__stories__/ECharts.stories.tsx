/* Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT */

import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, onCleanup, onMount } from "solid-js";
import { mockIPC, clearMocks } from "@tauri-apps/api/mocks";
import { Crepe } from "@milkdown/crepe";
import { useAppContext } from "@/app/AppContext";
import { StoryAppProvider } from "@/app/__stories__/support/StoryAppProvider";
import { useI18N } from "@/i18n/Localization";
import { configureCodeLanguages } from "../../text/CodeLanguages";
import { configureCodeBlockLayout } from "../../markdown/MarkdownCodeBlockLayout";
import EditorECharts from "../EditorECharts";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import "@/app/App.module.css";
import "@/styles/milkdowntheme.css";

const meta = { title: "Application/ECharts", parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;
type Story = StoryObj;

const source = JSON.stringify({
    title: { text: "Ventas por trimestre" },
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    xAxis: { type: "category", data: ["T1", "T2", "T3", "T4"] },
    yAxis: { type: "value" },
    series: [{ name: "Ventas", type: "bar", data: [120, 200, 150, 240] }],
}, null, 2) + "\n";

function EditorFixture(props: { initial: string }) {
    const [disk, setDisk] = createSignal(props.initial);
    mockIPC((command, args) => {
        if (command === "read_file") return { content: disk(), isNew: false };
        if (command === "write_file" && args && "content" in args && typeof args.content === "string") setDisk(args.content);
    });
    onCleanup(clearMocks);
    function Controls() {
        const { editor } = useAppContext();
        return <>
            <nav style={{ display: "flex", gap: "1rem", padding: "1rem", "flex-wrap": "wrap" }}>
                <button onClick={() => { void editor.toggleSourceMode()?.(); }}>Fuente / gráfico</button>
                <button onClick={editor.toggleTheme}>Cambiar tema</button>
                <button onClick={() => { void editor.saveFile()?.(); }}>Guardar</button>
                <button onClick={() => { setDisk('{"series":'); void editor.reloadFile()?.(); }}>JSON no válido</button>
                <button onClick={() => { setDisk('{"series":[{"type":"bar","data":[1,2]}]}'); void editor.reloadFile()?.(); }}>Error ECharts</button>
                <button onClick={() => { setDisk(source); void editor.reloadFile()?.(); }}>Restaurar ejemplo</button>
                <output>{editor.fileModified() ? "Modificado" : "Sin cambios"}</output>
            </nav>
            <div style={{ display: "flex", height: "600px" }}><EditorECharts /></div>
        </>;
    }
    return <StoryAppProvider filename="ventas.echarts.json"><Controls /></StoryAppProvider>;
}

export const Editor: Story = { render: () => <EditorFixture initial={source} /> };
export const InvalidJSON: Story = { render: () => <EditorFixture initial={'{"series":'} /> };
export const RenderError: Story = { render: () => <EditorFixture initial={'{"series":[{"type":"bar","data":[1,2]}]}'} /> };

function MarkdownFixture() {
    const { t } = useI18N();
    let root!: HTMLDivElement;
    let crepe: Crepe;
    const [status, setStatus] = createSignal("Cargando…");
    let disposed = false;
    onMount(() => {
        const markdown = `# Gráficos ECharts\n\n\`\`\`echarts\n${source}\`\`\`\n\n## JSON no válido\n\n\`\`\`echarts\n{"series":\n\`\`\`\n\n## Error al renderizar\n\n\`\`\`echarts\n{"series":[{"type":"bar","data":[1,2]}]}\n\`\`\``;
        crepe = new Crepe({ root, defaultValue: markdown,
            featureConfigs: { [Crepe.Feature.CodeMirror]: { previewOnlyByDefault: true } },
        });
        crepe.editor.config(configureCodeBlockLayout);
        crepe.editor.config(configureCodeLanguages(t("markdownToolbar.codePreviewMermaidError"), {
            errorText: t("markdownToolbar.codePreviewEChartsError"),
            objectError: t("markdownToolbar.codePreviewEChartsObjectError"),
            label: t("markdownToolbar.echartsBlock"),
        }));
        void crepe.create().then(async () => {
            if (disposed) { await crepe.destroy(); return; }
            setStatus(crepe.getMarkdown().includes(source.trim()) ? "JSON conservado" : "Editor listo");
        });
    });
    onCleanup(() => { disposed = true; if (crepe?.editor.status === "Created") void crepe.destroy(); });
    return <div style={{ height: "100vh", overflow: "auto" }}>
        <nav style={{ padding: "1rem" }}>
            <button onClick={() => {
                document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            }}>Cambiar tema</button> <output>{status()}</output>
        </nav>
        <div ref={root} style={{ "max-width": "900px", margin: "auto" }} />
    </div>;
}

export const Markdown: Story = { render: () => <MarkdownFixture /> };
