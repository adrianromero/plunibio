// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

use super::normalize_link_filename;

#[test]
fn link_is_resolved_relative_to_the_current_file() {
    let result = normalize_link_filename("samples/index.md", "./reference.md").unwrap();

    assert_eq!(result, std::path::Path::new("samples/reference.md"));
}

#[test]
fn link_can_move_to_a_parent_inside_the_base_path() {
    let result = normalize_link_filename("samples/guides/index.md", "../reference.md").unwrap();

    assert_eq!(result, std::path::Path::new("samples/reference.md"));
}

#[test]
fn percent_encoded_link_is_decoded_before_resolving_the_file() {
    let result =
        normalize_link_filename("private/readme.md", "./BUG%20webkit%20rendering.md").unwrap();

    assert_eq!(
        result,
        std::path::Path::new("private/BUG webkit rendering.md")
    );
}

#[test]
fn link_cannot_escape_the_base_path() {
    let result = normalize_link_filename("samples/index.md", "../../other.md");

    assert!(result.is_err());
}

#[test]
fn links_with_a_uri_scheme_are_not_resolved_as_files() {
    for href in ["mailto:address@example.com", "http://www.example.com"] {
        let error = normalize_link_filename("samples/index.md", href).unwrap_err();
        let value = serde_json::to_value(error).unwrap();

        assert_eq!(value["code"], "unsupported_link");
        assert_eq!(value["path"], href);
    }
}
