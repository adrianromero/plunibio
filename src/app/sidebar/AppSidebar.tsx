/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import { createEffect, onCleanup, Show, type JSX } from "solid-js";
import { useAppContext } from "@/app/AppContext";
import Sidebar from "@/shared/ui/sidebar/Sidebar";

export type AppSidebarProps = {
    children: JSX.Element;
    disabled?: boolean;
    active?: boolean;
};

export function AppSidebar(props: AppSidebarProps): JSX.Element {
    const {
        editor: {
            sidebarVisible,
            setSidebarVisible,
            toggleSidebar: registeredToggleSidebar,
            setToggleSidebar,
        },
    } = useAppContext();
    const toggleSidebar = (): void => {
        setSidebarVisible((visible) => !visible);
    };

    createEffect(() => {
        if (props.active === false) return;
        setToggleSidebar(toggleSidebar);
        onCleanup(() => {
            if (registeredToggleSidebar() === toggleSidebar) setToggleSidebar(null);
        });
    });

    return (
        <Show when={props.active !== false}>
            <Sidebar visible={sidebarVisible()} disabled={props.disabled}>
                {props.children}
            </Sidebar>
        </Show>
    );
}

export default AppSidebar;
