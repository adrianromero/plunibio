/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal, type JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import ExternalLink from "lucide-solid/icons/external-link";
import { useAppContext } from "@/app/AppContext";
import { translateAppError } from "@/shared/errors/AppError";
import { useI18N } from "@/i18n/Localization";
import styles from "./EditorExternalFile.module.css";

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
        <section class="scrollingView" data-testid="external-file-view">
            <div class={`contentView ${styles.externalFile}`}>
                <button
                    class="stdButton"
                    data-testid="open-external-file"
                    type="button"
                    disabled={opening()}
                    onClick={() => void openFile()}
                >
                    <ExternalLink class="actionIcon" aria-hidden="true" />
                    <span>{t(opening() ? "externalFile.opening" : "externalFile.open")}</span>
                </button>
            </div>
        </section>
    );
}

export default EditorExternalFile;
