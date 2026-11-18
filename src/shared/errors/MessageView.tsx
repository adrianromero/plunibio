/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { Show, type JSX } from "solid-js";
import styles from "./MessageView.module.css";
import { Dynamic } from "solid-js/web";
import { messagesinfo, type MessageInfoKind, type MessageInfo } from "./messagesinfo";
import { useI18N } from "@/i18n/Localization";

type MessageViewProps = {
    children: JSX.Element;
    info?: MessageInfoKind;
    testId?: string;
    action?: {
        label: string;
        run: () => void | Promise<void>;
        disabled?: boolean;
        testId?: string;
    };
};

export function MessageView(props: MessageViewProps): JSX.Element {
    const { t } = useI18N();

    const kind = (): MessageInfoKind => props.info ?? "error";
    const info = (): MessageInfo => messagesinfo[kind()];

    return (
        <section
            class={`${styles.messageView} ${styles[info().class]}`}
            data-testid={props.testId ?? "message-view"}
            data-message-kind={kind()}
        >
            <div class={styles.messageContent}>
                <div class={styles.messageSummary}>
                    <Dynamic component={info().icon} class={styles.icon} aria-hidden="true" />
                    <div class={styles.title}>{t(info().literal)}</div>
                    <div>{props.children}</div>
                </div>
                <Show when={props.action}>{(action) => (
                    <button
                        type="button"
                        class="stdButton"
                        data-testid={action().testId}
                        disabled={action().disabled}
                        onClick={() => void action().run()}
                    >
                        {action().label}
                    </button>
                )}</Show>
            </div>
        </section>
    );
}

export default MessageView;

