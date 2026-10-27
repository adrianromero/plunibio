/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import {
    type Accessor,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
    Show,
    type JSX,
    untrack,
} from "solid-js";
import MarkdownFloatingActions, {
    type MarkdownFloatingAction,
} from "./MarkdownFloatingActions";
import styles from "./MarkdownFloatingActionsHost.module.css";

export interface MarkdownFloatingTarget {
    key: object;
    kind: "link" | "image";
    activation: "selection" | "hover" | "explicit";
    href: () => string;
    getAnchorRect: () => DOMRect | null;
    isConnected?: () => boolean;
    onNavigate: () => void | Promise<void>;
    onSaveHref: (href: string) => boolean | Promise<boolean>;
    actions?: () => readonly MarkdownFloatingAction[];
    dismissAfterEditing?: boolean;
    onEditingEnd?: () => void;
    onPointerEnter?: () => void;
    onPointerLeave?: (event: PointerEvent) => void;
}

export interface MarkdownFloatingActionsController {
    target: Accessor<MarkdownFloatingTarget | null>;
    editing: Accessor<boolean>;
    revision: Accessor<number>;
    activate: (target: MarkdownFloatingTarget) => void;
    deactivate: (key: object) => void;
    startEditing: () => void;
    setEditing: (editing: boolean) => void;
    dismiss: () => void;
    refresh: () => void;
    containsActions: (target: EventTarget | null) => boolean;
    setActionsElement: (element: HTMLFormElement | null) => void;
}

export function createMarkdownFloatingActionsController(): MarkdownFloatingActionsController {
    const [target, setTarget] = createSignal<MarkdownFloatingTarget | null>(null);
    const [editing, setEditingSignal] = createSignal(false);
    const [revision, setRevision] = createSignal(0);
    const candidates = new Map<object, { target: MarkdownFloatingTarget; sequence: number }>();
    let activationSequence = 0;
    let actionsElement: HTMLFormElement | null = null;
    const activationPriority = {
        selection: 1,
        hover: 2,
        explicit: 3,
    } as const;

    const selectBestCandidate = (): void => {
        let best: { target: MarkdownFloatingTarget; sequence: number } | null = null;
        for (const candidate of candidates.values()) {
            const candidatePriority = activationPriority[candidate.target.activation];
            const bestPriority = best ? activationPriority[best.target.activation] : -1;
            if (
                !best ||
                candidatePriority > bestPriority ||
                (candidatePriority === bestPriority && candidate.sequence > best.sequence)
            ) {
                best = candidate;
            }
        }
        setTarget(best?.target ?? null);
        setRevision((value) => value + 1);
    };

    const activate = (nextTarget: MarkdownFloatingTarget): void => {
        candidates.set(nextTarget.key, {
            target: nextTarget,
            sequence: ++activationSequence,
        });
        if (!untrack(editing)) selectBestCandidate();
    };

    const deactivate = (key: object): void => {
        candidates.delete(key);
        if (!untrack(editing)) selectBestCandidate();
    };

    const setEditing = (value: boolean): void => {
        const current = untrack(target);
        if (value) {
            if (current) {
                setEditingSignal(true);
            }
            return;
        }

        setEditingSignal(false);
        current?.onEditingEnd?.();
        if (current?.dismissAfterEditing) candidates.delete(current.key);
        selectBestCandidate();
    };

    return {
        target,
        editing,
        revision,
        activate,
        deactivate,
        startEditing: () => setEditing(true),
        setEditing,
        dismiss: () => {
            const current = untrack(target);
            setEditingSignal(false);
            candidates.clear();
            setTarget(null);
            current?.onEditingEnd?.();
        },
        refresh: () => setRevision((value) => value + 1),
        containsActions: (eventTarget) =>
            eventTarget instanceof Node && Boolean(actionsElement?.contains(eventTarget)),
        setActionsElement: (element) => {
            actionsElement = element;
        },
    };
}

interface MarkdownFloatingActionsHostProps {
    editorRoot: () => HTMLDivElement;
    controller: MarkdownFloatingActionsController;
}

export default function MarkdownFloatingActionsHost(
    props: MarkdownFloatingActionsHostProps
): JSX.Element {
    let layerRef!: HTMLDivElement;
    let cancelEditing: (() => void) | null = null;
    let positionFrame: number | undefined;
    let scrollContainer: HTMLElement | null = null;
    let observedElement: Element | null = null;
    const [position, setPosition] = createSignal({ left: 0, top: 0 });

    const positionActions = (): void => {
        const target = props.controller.target();
        if (!target) return;
        if (target.isConnected && !target.isConnected() && !props.controller.editing()) {
            props.controller.deactivate(target.key);
            return;
        }

        const anchorRect = target.getAnchorRect();
        if (!anchorRect) return;
        const layerRect = layerRef.getBoundingClientRect();
        setPosition({
            left: anchorRect.left - layerRect.left,
            top: anchorRect.bottom - layerRect.top + 6,
        });
    };

    const schedulePositionActions = (): void => {
        if (positionFrame !== undefined) return;
        positionFrame = requestAnimationFrame(() => {
            positionFrame = undefined;
            positionActions();
        });
    };

    const resizeObserver = new ResizeObserver(schedulePositionActions);

    createEffect(() => {
        const target = props.controller.target();
        props.controller.revision();
        if (observedElement) resizeObserver.unobserve(observedElement);
        observedElement = target?.key instanceof Element ? target.key : null;
        if (observedElement) resizeObserver.observe(observedElement);
        if (target) schedulePositionActions();
    });

    const handleOutsidePointerDown = (event: PointerEvent): void => {
        if (!props.controller.target() || props.controller.containsActions(event.target)) return;
        if (props.controller.editing()) cancelEditing?.();
        props.controller.dismiss();
    };

    onMount(() => {
        const root = props.editorRoot();
        scrollContainer = root.closest<HTMLElement>(".scrollingView");
        resizeObserver.observe(root);
        scrollContainer?.addEventListener("scroll", schedulePositionActions, { passive: true });
        window.addEventListener("resize", schedulePositionActions);
        document.addEventListener("pointerdown", handleOutsidePointerDown, { capture: true });
    });

    onCleanup(() => {
        props.controller.setActionsElement(null);
        scrollContainer?.removeEventListener("scroll", schedulePositionActions);
        window.removeEventListener("resize", schedulePositionActions);
        document.removeEventListener("pointerdown", handleOutsidePointerDown, { capture: true });
        if (positionFrame !== undefined) cancelAnimationFrame(positionFrame);
        resizeObserver.disconnect();
    });

    const href = (): string => {
        props.controller.revision();
        return props.controller.target()?.href() ?? "";
    };

    return (
        <div ref={layerRef} class={styles.layer}>
            <div
                class={styles.positioner}
                hidden={!props.controller.target()}
                style={{ left: `${position().left}px`, top: `${position().top}px` }}
            >
                <Show when={props.controller.target()}>
                    {(target) => (
                        <MarkdownFloatingActions
                            ref={(element) => {
                                props.controller.setActionsElement(element);
                            }}
                            kind={target().kind}
                            href={href()}
                            editing={props.controller.editing()}
                            onNavigate={() => void target().onNavigate()}
                            onSaveHref={(nextHref) => {
                                const saved = target().onSaveHref(nextHref);
                                if (typeof saved === "boolean") {
                                    if (saved) props.controller.refresh();
                                    return saved;
                                }
                                return saved.then((didSave) => {
                                    if (didSave) props.controller.refresh();
                                    return didSave;
                                });
                            }}
                            registerCancelEditing={(cancel) => {
                                cancelEditing = cancel;
                            }}
                            onEditingChange={props.controller.setEditing}
                            onPointerEnter={() => target().onPointerEnter?.()}
                            onPointerLeave={(event) => target().onPointerLeave?.(event)}
                            actions={target().actions?.()}
                        />
                    )}
                </Show>
            </div>
        </div>
    );
}
