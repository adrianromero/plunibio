/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx } from "@milkdown/kit/core";
import { NodeSelection } from "@milkdown/kit/prose/state";
import I18NProvider from "@/i18n/Localization";
import MarkdownFloatingActionsHost, {
    createMarkdownFloatingActionsController,
} from "../MarkdownFloatingActionsHost";
import MarkdownMathActions, {
    disableNativeInlineMathTooltip,
} from "../MarkdownMathActions";

describe("MarkdownMathActions", () => {
    let dispose: (() => void) | undefined;
    let crepe: Crepe | undefined;
    let root: HTMLDivElement | undefined;

    afterEach(async () => {
        dispose?.();
        await crepe?.destroy();
        root?.remove();
        dispose = undefined;
        crepe = undefined;
        root = undefined;
    });

    it("shows on hover, replaces Crepe's tooltip and updates the expression", async () => {
        root = document.createElement("div");
        document.body.append(root);
        const controller = createMarkdownFloatingActionsController();
        const [activeCrepe, setActiveCrepe] = createSignal<Crepe | null>(null);
        let editorRoot!: HTMLDivElement;
        let createMath = (): void => undefined;

        dispose = render(
            () => (
                <I18NProvider>
                    <div>
                        <div ref={editorRoot} />
                        <MarkdownMathActions
                            editorRoot={() => editorRoot}
                            crepe={activeCrepe}
                            controller={controller}
                            registerCreateMath={(handler) => {
                                if (handler) createMath = handler;
                            }}
                        />
                        <MarkdownFloatingActionsHost
                            editorRoot={() => editorRoot}
                            controller={controller}
                        />
                    </div>
                </I18NProvider>
            ),
            root
        );

        crepe = new Crepe({
            root: editorRoot,
            defaultValue: "Before $a^2$ after",
            features: { [Crepe.Feature.Toolbar]: false },
        });
        crepe.editor.config(disableNativeInlineMathTooltip);
        await crepe.create();
        setActiveCrepe(crepe);

        const math = editorRoot.querySelector<HTMLElement>('span[data-type="math_inline"]')!;
        expect(math).not.toBeNull();
        math.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));

        const actions = await vi.waitFor(() => {
            const form = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Inline math actions"]'
            );
            expect(form).not.toBeNull();
            return form!;
        });
        expect(root.querySelector(".milkdown-latex-inline-edit")).toBeNull();
        const displayedExpression = actions.querySelector<HTMLElement>(
            'span[class*="staticValue"]'
        );
        expect(displayedExpression?.tagName).toBe("SPAN");
        expect(displayedExpression?.textContent).toBe("a^2");
        expect(displayedExpression?.hasAttribute("title")).toBe(false);
        expect(displayedExpression?.classList.toString()).toContain("staticValue");
        expect(
            actions
                .querySelector('button[aria-label="Edit expression"]')
                ?.getAttribute("title")
        ).toBe("Edit expression");
        expect(actions.querySelector('input[aria-label="LaTeX expression"]')).toBeNull();
        actions.querySelector<HTMLButtonElement>('button[aria-label="Edit expression"]')!.click();
        const input = await vi.waitFor(() => {
            const element = actions.querySelector<HTMLInputElement>(
                'input[aria-label="LaTeX expression"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        expect(input.value).toBe("a^2");
        input.value = "b^2 + c^2";
        input.dispatchEvent(new InputEvent("input", { bubbles: true }));
        actions.querySelector<HTMLButtonElement>('button[aria-label="OK"]')!.click();

        await vi.waitFor(() => {
            expect(crepe?.getMarkdown().trim()).toBe("Before $b^2 + c^2$ after");
            expect(root?.querySelector('form[aria-label="Inline math actions"]')).toBeNull();
        });

        const updatedMath = editorRoot.querySelector<HTMLElement>(
            'span[data-type="math_inline"]'
        )!;
        updatedMath.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
        const reopenedActions = await vi.waitFor(() => {
            const form = root?.querySelector<HTMLFormElement>(
                'form[aria-label="Inline math actions"]'
            );
            expect(form).not.toBeNull();
            return form!;
        });
        reopenedActions
            .querySelector<HTMLButtonElement>('button[aria-label="Edit expression"]')!
            .click();
        const reopenedInput = await vi.waitFor(() => {
            const element = reopenedActions.querySelector<HTMLInputElement>(
                'input[aria-label="LaTeX expression"]'
            );
            expect(element).not.toBeNull();
            return element!;
        });
        reopenedInput.value = "discarded";
        reopenedInput.dispatchEvent(new InputEvent("input", { bubbles: true }));
        reopenedActions.querySelector<HTMLButtonElement>('button[aria-label="Cancel"]')!.click();

        await vi.waitFor(() => {
            expect(crepe?.getMarkdown().trim()).toBe("Before $b^2 + c^2$ after");
            expect(
                root?.querySelector(
                    'form[aria-label="Inline math actions"] input[aria-label="LaTeX expression"]'
                )
            ).toBeNull();
        });
        updatedMath.dispatchEvent(
            new PointerEvent("pointerout", {
                bubbles: true,
                relatedTarget: document.body,
            })
        );
        await vi.waitFor(() => {
            expect(root?.querySelector('form[aria-label="Inline math actions"]')).toBeNull();
        });

        crepe.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            let mathPosition = -1;
            view.state.doc.descendants((node, position) => {
                if (node.type.name === "math_inline") mathPosition = position;
            });
            view.dispatch(
                view.state.tr.setSelection(NodeSelection.create(view.state.doc, mathPosition))
            );
        });
        createMath();

        await vi.waitFor(() => {
            const explicitInput = root?.querySelector<HTMLInputElement>(
                'form[aria-label="Inline math actions"] input[aria-label="LaTeX expression"]'
            );
            expect(explicitInput?.value).toBe("b^2 + c^2");
        });
    });
});
