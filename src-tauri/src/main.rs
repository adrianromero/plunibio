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
        "Starting Plunibio with base path {:?}, filename {:?}, width {:?}, and height {:?}",
        configuration.basepath, configuration.filename, configuration.width, configuration.height
    );
    plunibio_lib::run_with_options(
        configuration.basepath,
        configuration.filename,
        configuration.width,
        configuration.height,
    )
}
