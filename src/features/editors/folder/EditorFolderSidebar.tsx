/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import File from "lucide-solid/icons/file";
import FilePen from "lucide-solid/icons/file-pen";
import FileText from "lucide-solid/icons/file-text";
import Folder from "lucide-solid/icons/folder";
import type { JSX } from "solid-js";
import AppSidebar from "@/app/sidebar/AppSidebar";
import { useI18N } from "@/i18n/Localization";
import SidebarTab from "@/shared/ui/sidebar/SidebarTab";
import SidebarTabSection from "@/shared/ui/sidebar/SidebarTabSection";
import type { CreateEntryKind } from "./CreateEntryDialog";

type EditorFolderSidebarProps = {
    disabled: boolean;
    onCreate: (kind: CreateEntryKind) => void;
};

export function EditorFolderSidebar(props: EditorFolderSidebarProps): JSX.Element {
    const { t } = useI18N();

    return (
        <AppSidebar disabled={props.disabled}>
            <SidebarTab defaultKey="new">
                <SidebarTabSection key="new" label={t("folder.new")}>
                    <section class="sidebarSection">
                        <button
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="directory"
                            title={`${t("folder.newFolder")} (CTRL+SHIFT+N)`}
                            disabled={props.disabled}
                            onClick={() => props.onCreate("directory")}
                        >
                            <Folder aria-hidden="true" />
                            {t("folder.newFolder")}
                        </button>
                    </section>
                    <section class="sidebarSection">
                        <button
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="markdown"
                            title={`${t("folder.newMarkdown")} (CTRL+SHIFT+M)`}
                            disabled={props.disabled}
                            onClick={() => props.onCreate("markdown")}
                        >
                            <FilePen aria-hidden="true" />
                            {t("folder.newMarkdown")}
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
                            {t("folder.newText")}
                        </button>
                        <button
                            class="stdButton toolbar"
                            type="button"
                            data-create-kind="other"
                            disabled={props.disabled}
                            onClick={() => props.onCreate("other")}
                        >
                            <File aria-hidden="true" />
                            {t("folder.newOther")}
                        </button>
                    </section>
                </SidebarTabSection>
            </SidebarTab>
        </AppSidebar>
    );
}

export default EditorFolderSidebar;
