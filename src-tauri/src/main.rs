// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing::info;
use tracing_subscriber;

mod cli;

fn main() {
    tracing_subscriber::fmt::init();
    let configuration = cli::resolve().unwrap_or_else(|error| {
        eprintln!("Error: {}", error);
        std::process::exit(2);
    });

    info!(
        "Starting Plunibio with base path {} and filename {}",
        configuration.basepath.display(),
        configuration.filename
    );
    if configuration.use_saved_basepath {
        plunibio_lib::run_with_default_path(configuration.basepath, configuration.filename)
    } else {
        plunibio_lib::run_with_path(configuration.basepath, configuration.filename)
    }
}
