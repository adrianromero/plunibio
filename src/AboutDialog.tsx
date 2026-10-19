/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { getName, getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import ExternalLink from "lucide-solid/icons/external-link";
import { createEffect, createSignal, JSX } from "solid-js";
import appIcon from "../src-tauri/icons/128x128.png";
import dialogStyles from "./Dialog.module.css";
import styles from "./AboutDialog.module.css";
import { useI18N } from "./Localization";

const HOMEPAGE_URL = "https://github.com/adrianromero/plunibio";
const LICENSE_URL = `${HOMEPAGE_URL}/blob/main/LICENSE`;

type AboutDialogProps = {
    open: boolean;
    onClose: () => void;
};

export function AboutDialog(props: AboutDialogProps): JSX.Element {
    const { t } = useI18N();
    const [appName, setAppName] = createSignal("Plunibio");
    const [appVersion, setAppVersion] = createSignal("…");
    let dialogRef!: HTMLDialogElement;
    let closeButtonRef!: HTMLButtonElement;
    let previouslyFocusedElement: HTMLElement | null = null;
    let metadataRequested = false;

    const openExternalUrl = (url: string): void => {
        void openUrl(url).catch((error: unknown) => {
            console.error("Unable to open external URL:", error);
        });
    };

    createEffect(() => {
        if (props.open && !dialogRef.open) {
            previouslyFocusedElement = document.activeElement as HTMLElement | null;
            dialogRef.showModal();
            queueMicrotask(() => closeButtonRef.focus());
        } else if (!props.open && dialogRef.open) {
            dialogRef.close();
            queueMicrotask(() => {
                if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
            });
        }

        if (props.open && !metadataRequested) {
            metadataRequested = true;
            void Promise.all([getName(), getVersion()])
                .then(([name, version]) => {
                    setAppName(name);
                    setAppVersion(version);
                })
                .catch((error: unknown) => {
                    console.error("Unable to read application metadata:", error);
                });
        }
    });

    return (
        <dialog
            ref={dialogRef}
            class={`${dialogStyles.dialog} ${styles.aboutDialog}`}
            aria-labelledby="about-dialog-title"
            aria-describedby="about-dialog-details"
            tabIndex={-1}
            onCancel={(event) => {
                event.preventDefault();
                props.onClose();
            }}
        >
            <div class={styles.identity}>
                <img class={styles.appIcon} src={appIcon} alt="" aria-hidden="true" />
                <h2 id="about-dialog-title" class={styles.title}>
                    {appName()}
                </h2>
                <p class={styles.version}>{t("about.version", { version: appVersion() })}</p>
            </div>
            <div id="about-dialog-details" class={styles.details}>
                <p class={styles.copyright}>Copyright © 2026 Adrián Romero Corchado</p>
                <div class={styles.links}>
                    <a
                        href={HOMEPAGE_URL}
                        onClick={(event) => {
                            event.preventDefault();
                            openExternalUrl(HOMEPAGE_URL);
                        }}
                    >
                        {t("about.homepage")}
                        <ExternalLink aria-hidden="true" />
                    </a>
                    <a
                        href={LICENSE_URL}
                        onClick={(event) => {
                            event.preventDefault();
                            openExternalUrl(LICENSE_URL);
                        }}
                    >
                        {t("about.license")}
                        <ExternalLink aria-hidden="true" />
                    </a>
                </div>
            </div>
            <div class={dialogStyles.actions}>
                <button
                    ref={closeButtonRef}
                    class="stdButton"
                    type="button"
                    onClick={props.onClose}
                >
                    {t("dialog.close")}
                </button>
            </div>
        </dialog>
    );
}

export default AboutDialog;
