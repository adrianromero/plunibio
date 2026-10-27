/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createMemo, createResource, type JSX } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import RootContent from "./RootContent";
import { translateAppError } from "@/shared/errors/AppError";
import type { PathKind } from "@/backend/rusttypes";
import { contentForPath, type PathResult } from "@/features/editors/ContentForPath";
import Toolbar from "@/features/toolbar/Toolbar";
import I18NProvider, { useI18N } from "@/i18n/Localization";
import styles from "./App.module.css";
import { AppProvider, useAppContext } from "./AppContext";

type AppProps = {
    initialBasepath: string;
    initialFilename: string;
};

function AppContent(): JSX.Element {
    const { t } = useI18N();
    const {
        main: { basepath, filename },
        spinner: { showSpinner, hideSpinner, setSpinnerParams },
    } = useAppContext();
    const [pathResult] = createResource(
        () => ({ basepath: basepath(), filename: filename() }),
        async (path): Promise<PathResult> => {
            setSpinnerParams("");
            showSpinner();
            try {
                const kind = await invoke<PathKind>("path_kind", path);
                return { kind };
            } catch (error: unknown) {
                console.error("Unable to inspect path:", error);
                return { kind: "error", error: translateAppError(error, t) };
            } finally {
                hideSpinner();
            }
        }
    );
    const selection = createMemo(() =>
        pathResult.loading ? undefined : contentForPath(filename(), pathResult())
    );

    return (
        <main class={styles.appMain}>
            <Toolbar contextualSections={selection()?.toolbarSections ?? []} />
            <RootContent selection={selection()} loading={pathResult.loading} />
        </main>
    );
}

function App(props: AppProps) {
    return (
        <I18NProvider>
            <AppProvider
                initialBasepath={props.initialBasepath}
                initialFilename={props.initialFilename}
            >
                <AppContent />
            </AppProvider>
        </I18NProvider>
    );
}

export default App;
