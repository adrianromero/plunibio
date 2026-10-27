// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

use super::*;
use std::sync::atomic::{AtomicU64, Ordering};

static NEXT_TEST_DIRECTORY: AtomicU64 = AtomicU64::new(0);

fn test_home() -> PathBuf {
    let sequence = NEXT_TEST_DIRECTORY.fetch_add(1, Ordering::Relaxed);
    std::env::temp_dir().join(format!(
        "plunibio-properties-{}-{sequence}",
        std::process::id()
    ))
}

#[test]
fn missing_properties_use_the_default_dimensions() {
    let home = test_home();
    let path = properties_path(&home);

    assert_eq!(
        load(&path).unwrap().unwrap_or_default(),
        Properties::default()
    );
}

#[test]
fn properties_are_created_and_loaded() {
    let home = test_home();
    let path = properties_path(&home);
    let mut expected = Properties::new(1280, 720);
    expected.set_filename(
        Path::new("/home/user/documents"),
        "notes/today.md".to_owned(),
    );
    expected.set_basepath(PathBuf::from("/home/user/documents"));

    save(&path, &expected).unwrap();

    assert_eq!(load(&path).unwrap(), Some(expected));
    assert!(path.is_file());
    fs::remove_dir_all(home).unwrap();
}

#[test]
fn invalid_dimensions_are_rejected() {
    let home = test_home();
    let path = properties_path(&home);
    fs::create_dir_all(path.parent().unwrap()).unwrap();
    fs::write(&path, "width = 0\nheight = 600\n").unwrap();

    assert!(load(&path).is_err());
    fs::remove_dir_all(home).unwrap();
}

#[test]
fn legacy_dimension_only_properties_are_supported() {
    let home = test_home();
    let path = properties_path(&home);
    fs::create_dir_all(path.parent().unwrap()).unwrap();
    fs::write(&path, "width = 1024\nheight = 768\n").unwrap();

    let properties = load(&path).unwrap().unwrap();

    assert_eq!(properties.width, 1024);
    assert_eq!(properties.height, 768);
    assert_eq!(properties.filename_for(Path::new("/missing")), None);
    fs::remove_dir_all(home).unwrap();
}

#[test]
fn filenames_are_stored_per_basepath() {
    let mut properties = Properties::default();

    properties.set_filename(Path::new("/documents/one"), "first.md".to_owned());
    properties.set_filename(Path::new("/documents/two"), "folder/second.md".to_owned());

    assert_eq!(
        properties.filename_for(Path::new("/documents/one")),
        Some("first.md")
    );
    assert_eq!(
        properties.filename_for(Path::new("/documents/two")),
        Some("folder/second.md")
    );
}

#[test]
fn current_basepath_is_stored() {
    let mut properties = Properties::default();
    assert_eq!(properties.basepath(), None);

    properties.set_basepath(PathBuf::from("/documents/two"));

    assert_eq!(properties.basepath(), Some(Path::new("/documents/two")));
}

#[test]
fn saved_basepath_is_canonicalized_when_available() {
    let home = test_home();
    let directory = home.join("workspace");
    fs::create_dir_all(&directory).unwrap();
    let mut properties = Properties::default();
    properties.set_basepath(directory.clone());

    assert_eq!(
        properties.resolved_basepath().unwrap(),
        Some(fs::canonicalize(&directory).unwrap())
    );
    fs::remove_dir_all(home).unwrap();
}

#[test]
fn unavailable_saved_basepath_is_rejected() {
    let home = test_home();
    let mut properties = Properties::default();
    properties.set_basepath(home.join("missing"));

    assert!(properties.resolved_basepath().is_err());
}

#[test]
fn relative_saved_basepath_is_rejected() {
    let mut properties = Properties::default();
    properties.set_basepath(PathBuf::from("relative/workspace"));

    assert!(properties.resolved_basepath().is_err());
}

#[test]
fn legacy_sidebar_visibility_is_ignored() {
    let home = test_home();
    let path = properties_path(&home);
    fs::create_dir_all(path.parent().unwrap()).unwrap();
    fs::write(
        &path,
        "width = 1024\nheight = 768\nsidebar_visible = false\n",
    )
    .unwrap();

    assert_eq!(load(&path).unwrap(), Some(Properties::new(1024, 768)));
    fs::remove_dir_all(home).unwrap();
}
