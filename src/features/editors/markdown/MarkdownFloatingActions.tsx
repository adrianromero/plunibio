/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createEffect, createSignal, onCleanup, Show, type JSX } from "solid-js";
import Check from "lucide-solid/icons/check";
import Clipboard from "lucide-solid/icons/clipboard";
import ImageIcon from "lucide-solid/icons/image";
import LinkIcon from "lucide-solid/icons/link";
import Pencil from "lucide-solid/icons/pencil";
import X from "lucide-solid/icons/x";
import { useI18N } from "@/i18n/Localization";
import styles from "./MarkdownFloatingActions.module.css";

export type MarkdownFloatingAction = {
    label: string;
    icon: () => JSX.Element;
    onClick: () => void;
    pressed?: boolean;
};

export interface MarkdownFloatingActionsProps {
    kind: "link" | "image";
    href: string;
    editing: boolean;
    onNavigate: () => void;
    onSaveHref: (href: string) => boolean | Promise<boolean>;
    actions?: readonly MarkdownFloatingAction[];
    onEditingChange: (editing: boolean) => void;
    onPointerEnter?: JSX.EventHandlerUnion<HTMLFormElement, PointerEvent>;
    onPointerLeave?: JSX.EventHandlerUnion<HTMLFormElement, PointerEvent>;
    registerCancelEditing?: (cancel: (() => void) | null) => void;
    ref?: (element: HTMLFormElement) => void;
}

export function MarkdownFloatingActions(
    props: MarkdownFloatingActionsProps
): JSX.Element {
    let inputRef!: HTMLInputElement;
    const [draftHref, setDraftHref] = createSignal(props.href);
    const [saving, setSaving] = createSignal(false);
    const { t } = useI18N();
    let wasEditing = false;

    const setEditMode = (value: boolean): void => {
        props.onEditingChange(value);
    };

    const startEditing = (): void => {
        setDraftHref(props.href);
        setEditMode(true);
        requestAnimationFrame(() => {
            inputRef.focus();
            inputRef.select();
        });
    };

    const cancelEditing = (): void => {
        setDraftHref(props.href);
        setEditMode(false);
    };

    props.registerCancelEditing?.(cancelEditing);
    onCleanup(() => props.registerCancelEditing?.(null));

    createEffect(() => {
        const isEditing = props.editing;
        if (isEditing && !wasEditing) {
            setDraftHref(props.href);
            requestAnimationFrame(() => {
                inputRef?.focus();
                inputRef?.select();
            });
        }
        wasEditing = isEditing;
    });

    const saveHref = async (): Promise<void> => {
        if (saving()) return;
        setSaving(true);
        try {
            if (await props.onSaveHref(draftHref())) {
                setEditMode(false);
            }
        } finally {
            setSaving(false);
        }
    };

    const copyHref = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(props.href);
        } catch (err: unknown) {
            console.error("Unable to copy Markdown link:", err);
        }
    };

    const stopPointerDown: JSX.EventHandler<HTMLFormElement, PointerEvent> = (event) => {
        event.stopPropagation();
    };

    const ElementIcon = (): JSX.Element =>
        props.kind === "image" ? (
            <ImageIcon aria-hidden="true" />
        ) : (
            <LinkIcon aria-hidden="true" />
        );

    return (
        <form
            ref={props.ref}
            class={styles.actions}
            aria-label={t(
                props.kind === "image"
                    ? "markdownToolbar.imageActions"
                    : "markdownToolbar.linkActions"
            )}
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void saveHref();
            }}
            onPointerDown={stopPointerDown}
            onPointerEnter={props.onPointerEnter}
            onPointerLeave={props.onPointerLeave}
        >
            <span class={styles.elementIcon}>
                <ElementIcon />
            </span>
            <Show
                when={!props.editing}
                fallback={
                    <>
                        <input
                            ref={inputRef}
                            class={styles.input}
                            aria-label={t("markdownToolbar.linkAddress")}
                            value={draftHref()}
                            disabled={saving()}
                            onInput={(event) => setDraftHref(event.currentTarget.value)}
                            onKeyDown={(event) => {
                                event.stopPropagation();
                                if (event.key === "Escape") {
                                    event.preventDefault();
                                    cancelEditing();
                                }
                            }}
                        />
                        <button
                            class={styles.iconButton}
                            type="submit"
                            disabled={saving()}
                            aria-label={t("dialog.confirm")}
                            title={t("dialog.confirm")}
                        >
                            <Check aria-hidden="true" />
                        </button>
                        <button
                            class={styles.iconButton}
                            type="button"
                            disabled={saving()}
                            aria-label={t("dialog.cancel")}
                            title={t("dialog.cancel")}
                            onClick={cancelEditing}
                        >
                            <X aria-hidden="true" />
                        </button>
                    </>
                }
            >
                <button
                    class={styles.address}
                    type="button"
                    title={props.href}
                    onClick={props.onNavigate}
                >
                    {props.href}
                </button>
                <button
                    class={styles.iconButton}
                    type="button"
                    aria-label={t("markdownToolbar.editLink")}
                    title={t("markdownToolbar.editLink")}
                    onClick={startEditing}
                >
                    <Pencil aria-hidden="true" />
                </button>
                <button
                    class={styles.iconButton}
                    type="button"
                    aria-label={t("markdownToolbar.copyLink")}
                    title={t("markdownToolbar.copyLink")}
                    onClick={() => void copyHref()}
                >
                    <Clipboard aria-hidden="true" />
                </button>
                {props.actions?.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            class={styles.iconButton}
                            type="button"
                            aria-label={action.label}
                            title={action.label}
                            aria-pressed={action.pressed}
                            onClick={action.onClick}
                        >
                            <Icon />
                        </button>
                    );
                })}
            </Show>
        </form>
    );
}

export default MarkdownFloatingActions;
