// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

use super::{resolve_overrides_from, Cli};
use clap::Parser;
use std::path::PathBuf;

#[test]
fn no_arguments_produce_no_path_overrides() {
    let current_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let (basepath, filename) = resolve_overrides_from(None, None, &current_dir).unwrap();

    assert_eq!(basepath, None);
    assert_eq!(filename, None);
}

#[test]
fn filename_can_be_overridden_without_a_basepath() {
    let current_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let (basepath, filename) =
        resolve_overrides_from(Some(PathBuf::from("Cargo.toml")), None, &current_dir).unwrap();

    assert_eq!(basepath, None);
    assert_eq!(filename.as_deref(), Some("Cargo.toml"));
}

#[test]
fn absolute_base_path_can_be_used_without_a_filename() {
    let current_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let (basepath, filename) =
        resolve_overrides_from(None, Some(current_dir.clone()), &current_dir).unwrap();

    assert_eq!(basepath, Some(std::fs::canonicalize(current_dir).unwrap()));
    assert_eq!(filename, None);
}

#[test]
fn relative_base_path_can_be_used_without_a_filename() {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let current_dir = manifest_dir.parent().unwrap();
    let (basepath, filename) =
        resolve_overrides_from(None, Some(PathBuf::from("src-tauri")), current_dir).unwrap();

    assert_eq!(basepath, Some(std::fs::canonicalize(manifest_dir).unwrap()));
    assert_eq!(filename, None);
}

#[test]
fn relative_base_path_is_resolved_from_current_directory() {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let current_dir = manifest_dir.parent().unwrap();
    let (basepath, filename) = resolve_overrides_from(
        Some(PathBuf::from("Cargo.toml")),
        Some(PathBuf::from("src-tauri")),
        current_dir,
    )
    .unwrap();

    assert_eq!(basepath, Some(std::fs::canonicalize(manifest_dir).unwrap()));
    assert_eq!(filename.as_deref(), Some("Cargo.toml"));
}

#[test]
fn absolute_filename_is_rejected() {
    let current_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let error = resolve_overrides_from(Some(current_dir.join("Cargo.toml")), None, &current_dir)
        .unwrap_err();

    assert!(error.contains("Filename must be relative"));
}

#[test]
fn filename_cannot_escape_the_base_path() {
    let current_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let error = resolve_overrides_from(Some(PathBuf::from("../Cargo.toml")), None, &current_dir)
        .unwrap_err();

    assert!(error.contains("Filename must be relative"));
}

#[test]
fn window_dimensions_can_be_provided() {
    let cli = Cli::try_parse_from(["plunibio", "--width", "1280", "--height", "720"]).unwrap();

    assert_eq!(cli.width, Some(1280));
    assert_eq!(cli.height, Some(720));
}

#[test]
fn window_dimensions_are_optional_and_independent() {
    let cli = Cli::try_parse_from(["plunibio", "--width", "1024"]).unwrap();

    assert_eq!(cli.width, Some(1024));
    assert_eq!(cli.height, None);
}

#[test]
fn zero_window_dimensions_are_rejected() {
    assert!(Cli::try_parse_from(["plunibio", "--width", "0"]).is_err());
    assert!(Cli::try_parse_from(["plunibio", "--height", "0"]).is_err());
}
