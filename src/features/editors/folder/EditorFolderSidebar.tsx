/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import File from "lucide-solid/icons/file";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import Folder from "lucide-solid/icons/folder";
import ArrowUp from "lucide-solid/icons/arrow-up";
import ArrowDown from "lucide-solid/icons/arrow-down";
import ALargeSmall from "lucide-solid/icons/a-large-small";
import Ruler from "lucide-solid/icons/ruler";
import CalendarClock from "lucide-solid/icons/calendar-clock";
import { Dynamic } from "solid-js/web";
import { For, Show, type JSX } from "solid-js";
import AppSidebar from "@/app/sidebar/AppSidebar";
import { useI18N } from "@/i18n/Localization";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import type { FolderSort, FolderSortAttribute } from "@/preferences/FolderSortPreferences";
import styles from "./EditorFolder.module.css";
import type { CreateEntryKind } from "./CreateEntryDialog";

type EditorFolderSidebarProps = {
    disabled: boolean;
    sort: FolderSort;
    onSort: (attribute: FolderSortAttribute) => void;
    onCreate: (kind: CreateEntryKind) => void;
};

export function EditorFolderSidebar(props: EditorFolderSidebarProps): JSX.Element {
    const { t } = useI18N();

    const attributes = ["name", "size", "modified"] as const;
    const icons = { name: ALargeSmall, size: Ruler, modified: CalendarClock };
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
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="directory"
                            title={`${t("folder.newFolder")} (CTRL+SHIFT+N)`}
                            disabled={props.disabled}
                            onClick={() => props.onCreate("directory")}
                        >
                            <Folder aria-hidden="true" />
                            <span class={styles.actionLabel}>{t("folder.newFolder")}</span>
                            <span class={styles.shortcut}>Ctrl+Shift+N</span>
                        </button>
                    </section>
                    <section class="sidebarSection">
                        <h2 class="sidebarSectionTitle">{t("folder.createFile")}</h2>
                        <button
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="markdown"
                            title={`${t("folder.newMarkdown")} (CTRL+SHIFT+M)`}
                            disabled={props.disabled}
                            onClick={() => props.onCreate("markdown")}
                        >
                            <FilePen aria-hidden="true" />
                            <span class={styles.actionLabel}>{t("folder.newMarkdown")}</span>
                            <span class={styles.shortcut}>Ctrl+Shift+M</span>
                        </button>
                        <button
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="text"
                            title={`${t("folder.newText")} (CTRL+SHIFT+T)`}
                            disabled={props.disabled}
                            onClick={() => props.onCreate("text")}
                        >
                            <FileText aria-hidden="true" />
                            <span class={styles.actionLabel}>{t("folder.newText")}</span>
                            <span class={styles.shortcut}>Ctrl+Shift+T</span>
                        </button>
                        <button
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="other"
                            disabled={props.disabled}
                            onClick={() => props.onCreate("other")}
                        >
                            <File aria-hidden="true" />
                            <span class={styles.actionLabel}>{t("folder.newOther")}</span>
                        </button>
                    </section>
                    <section class="sidebarSection">
                        <h2 class="sidebarSectionTitle">{t("folder.sortBy")}</h2>
                        <For each={attributes}>
                            {(attribute) => (
                                <button
                                    class="stdButton toolbar"
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
                                    <span class={styles.actionLabel}>{t(labels[attribute])}</span>
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
