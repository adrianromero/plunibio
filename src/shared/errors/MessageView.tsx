/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { JSX } from "solid-js";
import styles from "./MessageView.module.css";
import { Dynamic } from "solid-js/web";
import { messagesinfo, type MessageInfoKind, type MessageInfo } from "./messagesinfo";
import { useI18N } from "@/i18n/Localization";

type MessageViewProps = {
    children: JSX.Element;
    info?: MessageInfoKind;
};

export function MessageView(props: MessageViewProps): JSX.Element {
    const { t } = useI18N();

    const kind = (): MessageInfoKind => props.info ?? "error";
    const info = (): MessageInfo => messagesinfo[kind()];

    return (
        <section
            class={`${styles.messageView} ${styles[info().class]}`}
            data-testid="message-view"
            data-message-kind={kind()}
        >
            <div class={styles.messageContent}>
                <Dynamic component={info().icon} class={styles.icon} aria-hidden="true" />
                <div class={styles.title}>{t(info().literal)}</div>
                <div class={styles.message}>{props.children}</div>
            </div>
        </section>
    );
}

export default MessageView;

