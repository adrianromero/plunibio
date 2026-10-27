/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { JSX, Match, Show, Switch } from "solid-js";
import type { ContentSelection } from "@/features/editors/ContentForPath";
import { useI18N } from "@/i18n/Localization";
import ErrorView from "@/shared/errors/ErrorView";
import { useAppContext } from "./AppContext";
import { Dynamic } from "solid-js/web";

type RootContentProps = {
    selection: ContentSelection | undefined;
    loading: boolean;
};

export function RootContent(props: RootContentProps): JSX.Element {
    const { t } = useI18N();
    const {
        main: { filename },
    } = useAppContext();
    const content = () => (props.selection?.kind === "content" ? props.selection : undefined);

    return (
        <Show when={!props.loading}>
            <Switch>
                <Match when={content()}>
                    {(selection) => (
                        <Dynamic
                            component={selection().component}
                            {...selection().props}
                        />
                    )}
                </Match>
                <Match when={props.selection?.kind === "unsupported"}>
                    <ErrorView info="status">
                        {t("errors.unsupportedPathType", { filename: filename() })}
                    </ErrorView>
                </Match>
                <Match when={props.selection?.kind === "error"}>
                    <ErrorView>
                        {props.selection?.kind === "error"
                            ? props.selection.error
                            : t("errors.unknown")}
                    </ErrorView>
                </Match>
            </Switch>
        </Show>
    );
}

export default RootContent;
