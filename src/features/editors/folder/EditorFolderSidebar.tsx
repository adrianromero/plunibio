/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import File from "lucide-solid/icons/file";
import FileChartColumn from "lucide-solid/icons/file-chart-column";
import FileChartLine from "lucide-solid/icons/file-chart-line";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import Folder from "lucide-solid/icons/folder";
import ArrowUp from "lucide-solid/icons/arrow-up";
import ArrowDown from "lucide-solid/icons/arrow-down";
import ALargeSmall from "lucide-solid/icons/a-large-small";
import Weight from "lucide-solid/icons/weight";
import CalendarClock from "lucide-solid/icons/calendar-clock";
import { Dynamic } from "solid-js/web";
import { For, Show, type JSX } from "solid-js";
import AppSidebar from "@/app/sidebar/AppSidebar";
import { useI18N } from "@/i18n/Localization";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import type { FolderSort, FolderSortAttribute } from "@/preferences/FolderSortPreferences";
import type { CreateEntryKind } from "@/app/AppContext";

const fileActions = [
    { kind: "markdown", label: "folder.newMarkdown", icon: FilePen, shortcut: "Ctrl+Shift+M" },
    { kind: "text", label: "folder.newText", icon: FileText, shortcut: "Ctrl+Shift+T" },
    { kind: "diagram", label: "folder.newDiagram", icon: FileChartLine, shortcut: null },
    { kind: "chart", label: "folder.newChart", icon: FileChartColumn, shortcut: null },
    { kind: "other", label: "folder.newOther", icon: File, shortcut: null },
] as const;

type EditorFolderSidebarProps = {
    disabled: boolean;
    sort: FolderSort;
    onSort: (attribute: FolderSortAttribute) => void;
    onCreate: (kind: CreateEntryKind) => void;
};

export function EditorFolderSidebar(props: EditorFolderSidebarProps): JSX.Element {
    const { t } = useI18N();

    const attributes = ["name", "size", "modified"] as const;
    const icons = { name: ALargeSmall, size: Weight, modified: CalendarClock };
    const labels = {
        name: "folder.sortName",
        size: "folder.sortSize",
        modified: "folder.sortModified",
    } as const;
    const sortDescription = (attribute: FolderSortAttribute): string => {
        const active = props.sort.attribute === attribute;
        const state = active
            ? t(props.sort.direction === "asc" ? "folder.sortAscending" : "folder.sortDescending")
            : t("folder.sortInactive");
        const action = t(
            active && props.sort.direction === "asc"
                ? "folder.sortNextDescending"
                : "folder.sortNextAscending"
        );
        const help = attribute === "size" ? ` ${t("folder.sortSizeHelp")}` : "";
        return `${t(labels[attribute])}: ${state}. ${action}${help}`;
    };

    return (
        <AppSidebar disabled={props.disabled}>
            <SidebarTab defaultKey="actions">
                <SidebarTabSection key="actions" label={t("folder.actions")}>
                    <section class="sidebarSection">
                        <h2 class="sidebarSectionTitle">{t("folder.createFolder")}</h2>
                        <button
                            class="stdButton toolbar sidebarAction"
                            type="button"
                            data-create-kind="directory"
                            title={`${t("folder.newFolder")} (CTRL+SHIFT+N)`}
                            disabled={props.disabled}
                            onClick={() => props.onCreate("directory")}
                        >
                            <Folder aria-hidden="true" />
                            <span class="sidebarActionLabel">{t("folder.newFolder")}</span>
                            <span class="sidebarActionShortcut">Ctrl+Shift+N</span>
                        </button>
                    </section>
                    <section class="sidebarSection">
                        <h2 class="sidebarSectionTitle">{t("folder.createFile")}</h2>
                        <For each={fileActions}>
                            {(action) => (
                                <button
                                    class="stdButton toolbar sidebarAction"
                                    type="button"
                                    data-create-kind={action.kind}
                                    title={action.shortcut ? `${t(action.label)} (${action.shortcut.toUpperCase()})` : undefined}
                                    disabled={props.disabled}
                                    onClick={() => props.onCreate(action.kind)}
                                >
                                    <Dynamic component={action.icon} aria-hidden="true" />
                                    <span class="sidebarActionLabel">{t(action.label)}</span>
                                    <Show when={action.shortcut}>
                                        <span class="sidebarActionShortcut">{action.shortcut}</span>
                                    </Show>
                                </button>
                            )}
                        </For>
                    </section>
                    <section class="sidebarSection">
                        <h2 class="sidebarSectionTitle">{t("folder.sortBy")}</h2>
                        <For each={attributes}>
                            {(attribute) => (
                                <button
                                    class="stdButton toolbar sidebarAction"
                                    type="button"
                                    data-sort-attribute={attribute}
                                    data-sort-direction={
                                        props.sort.attribute === attribute
                                            ? props.sort.direction
                                            : "none"
                                    }
                                    aria-pressed={props.sort.attribute === attribute}
                                    aria-label={sortDescription(attribute)}
                                    title={sortDescription(attribute)}
                                    disabled={props.disabled}
                                    onClick={() => props.onSort(attribute)}
                                >
                                    <Dynamic component={icons[attribute]} aria-hidden="true" />
                                    <span class="sidebarActionLabel">{t(labels[attribute])}</span>
                                    <Show when={props.sort.attribute === attribute}>
                                        <Dynamic
                                            component={
                                                props.sort.direction === "asc" ? ArrowUp : ArrowDown
                                            }
                                            aria-hidden="true"
                                        />
                                    </Show>
                                </button>
                            )}
                        </For>
                    </section>
                </SidebarTabSection>
            </SidebarTab>
        </AppSidebar>
    );
}

export default EditorFolderSidebar;
