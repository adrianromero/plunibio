// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().plugin(
        "printing",
        tauri_build::InlinedPlugin::new().commands(&["print_document"]),
    ))
    .expect("failed to build application permissions")
}
