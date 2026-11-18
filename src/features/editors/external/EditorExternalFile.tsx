/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, type JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import MessageView from "@/shared/errors/MessageView";
import { useI18N } from "@/i18n/Localization";

export function EditorExternalFile(): JSX.Element {
    const { t } = useI18N();
    const {
        main: { basepath, filename, showAppMessage },
    } = useAppContext();
    const [opening, setOpening] = createSignal(false);

    const openFile = async (): Promise<void> => {
        if (opening()) {
            return;
        }

        setOpening(true);
        try {
            await invoke("open_file", {
                basepath: basepath(),
                filename: filename(),
            });
        } catch (error: unknown) {
            console.error("Unable to open file with the operating system:", error);
            await showAppMessage(translateAppError(error, t), "error");
        } finally {
            setOpening(false);
        }
    };

    return (
        <MessageView
            info="status"
            testId="external-file-view"
            action={{
                label: t(opening() ? "externalFile.opening" : "externalFile.open"),
                run: openFile,
                disabled: opening(),
                testId: "open-external-file",
            }}
        >
            {t("externalFile.description")}
        </MessageView>
    );
}

export default EditorExternalFile;
