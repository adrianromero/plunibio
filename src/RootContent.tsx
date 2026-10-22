/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { JSX, Match, Show, Switch } from "solid-js";
import { useAppContext } from "./AppContext";
import ErrorView from "./viewers/ErrorView";
import { useI18N } from "./Localization";
import { Dynamic } from "solid-js/web";
import type { ContentSelection } from "./viewers/ContentForPath";

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
