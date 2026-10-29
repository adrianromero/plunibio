/*
 * Copyright (c) 2026 Adrián Romero
 * SPDX-License-Identifier: MIT
 */

import type { JSX } from "solid-js";
import styles from "./Control.module.css";

export type ControlProps = {
    label: JSX.Element;
    value: JSX.Element;
    children: JSX.Element;
    controlId?: string;
};

export function Control(props: ControlProps): JSX.Element {
    return (
        <label
            class={styles.control}
            data-testid={props.controlId ? "control" : undefined}
            data-control-id={props.controlId}
        >
            <span>
                <strong>{props.label}</strong>
                <output>{props.value}</output>
            </span>
            {props.children}
        </label>
    );
}

export default Control;
