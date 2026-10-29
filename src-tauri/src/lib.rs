// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

mod app_error;
mod commands;
mod paths;
mod properties;

use commands::AppState;
use properties::Properties;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::{LogicalSize, Manager, WindowEvent};
use tracing::{error, info};

#[derive(Debug, Default)]
pub(crate) struct PropertiesState {
    path: Option<PathBuf>,
    properties: Properties,
}

fn apply_override<T>(configured: T, cli_override: Option<T>) -> T {
    cli_override.unwrap_or(configured)
}

fn initial_window_dimensions(
    properties: &Properties,
    width: Option<u32>,
    height: Option<u32>,
) -> (u32, u32) {
    (
        apply_override(properties.width, width),
        apply_override(properties.height, height),
    )
}

fn run_with_configuration(
    basepath: Option<PathBuf>,
    filename: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
) {
    let default_basepath = std::env::current_dir()
        .and_then(std::fs::canonicalize)
        .expect("failed to resolve the current directory");
    let application_properties = Arc::new(Mutex::new(PropertiesState::default()));
    let setup_properties = Arc::clone(&application_properties);
    let event_properties = Arc::clone(&application_properties);
    let managed_properties = Arc::clone(&application_properties);

    let builder = tauri::Builder::default()
        .manage(AppState::new(default_basepath.clone(), String::new()))
        .manage(managed_properties);

    #[cfg(feature = "automation")]
    let builder = builder
        .plugin(tauri_plugin_wdio::init())
        .plugin(tauri_plugin_wdio_webdriver::init());

    builder
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let (properties_path, application_properties) = match app.path().home_dir() {
                Ok(home) => {
                    let path = properties::properties_path(&home);
                    let application_properties = match properties::load(&path) {
                        Ok(Some(properties)) => properties,
                        Ok(None) => Properties::default(),
                        Err(message) => {
                            error!("Failed to load application properties: {message}");
                            Properties::default()
                        }
                    };
                    (Some(path), application_properties)
                }
                Err(error) => {
                    error!("Failed to resolve the home directory: {error}");
                    (None, Properties::default())
                }
            };

            let saved_basepath = if basepath.is_none() {
                match application_properties.resolved_basepath() {
                    Ok(Some(canonical)) => {
                        info!(
                            basepath = %canonical.display(),
                            "Restored the saved base path"
                        );
                        Some(canonical)
                    }
                    Ok(None) => None,
                    Err(message) => {
                        error!(
                            error = message,
                            "Ignored an invalid saved base path"
                        );
                        None
                    }
                }
            } else {
                None
            };
            let configured_basepath = saved_basepath.unwrap_or_else(|| default_basepath.clone());
            let initial_basepath = apply_override(configured_basepath, basepath.clone());
            let saved_filename = if filename.is_none() {
                application_properties
                    .filename_for(&initial_basepath)
                    .and_then(|saved_filename| {
                        if paths::validate_relative_filename(saved_filename).is_ok() {
                            Some(saved_filename.to_owned())
                        } else {
                            error!(
                                filename = saved_filename,
                                "Ignored an invalid saved filename"
                            );
                            None
                        }
                    })
            } else {
                None
            };
            let configured_filename = saved_filename.unwrap_or_default();
            let initial_filename = apply_override(configured_filename, filename.clone());

            let app_state = app.state::<AppState>();
            if let Err(message) = app_state.set_location(initial_basepath, initial_filename) {
                error!("Failed to apply the initial application location: {message}");
            }

            let (width, height) =
                initial_window_dimensions(&application_properties, width, height);
            match setup_properties.lock() {
                Ok(mut state) => {
                    state.path = properties_path;
                    state.properties = application_properties;
                }
                Err(error) => error!("Failed to initialize application properties state: {error}"),
            }

            if let Some(window) = app.get_webview_window("main") {
                if let Err(error) = window.set_size(LogicalSize::new(
                    f64::from(width),
                    f64::from(height),
                )) {
                    error!("Failed to set the initial window size: {error}");
                }

                if let Some(icon) = app.default_window_icon() {
                    window.set_icon(icon.clone())?;
                }
            }
            Ok(())
        })
        .on_window_event(move |window, event| {
            if window.label() != "main" {
                return;
            }

            match event {
                WindowEvent::CloseRequested { .. } => {
                    let dimensions = window
                        .app_handle()
                        .get_webview_window(window.label())
                        .and_then(|webview_window| {
                            let scale_factor = match webview_window.scale_factor() {
                                Ok(scale_factor) => scale_factor,
                                Err(error) => {
                                    error!("Failed to read the window scale factor: {error}");
                                    return None;
                                }
                            };
                            let size = match webview_window.as_ref().size() {
                                Ok(size) => size,
                                Err(error) => {
                                    error!("Failed to read the webview size before closing: {error}");
                                    return None;
                                }
                            };
                            let logical_size = size.to_logical::<f64>(scale_factor);
                            Some((
                                logical_size.width.round().max(1.0) as u32,
                                logical_size.height.round().max(1.0) as u32,
                            ))
                        });

                    if dimensions.is_none() {
                        error!("Failed to read the main window dimensions before closing");
                    }

                    let app_state = window.app_handle().state::<AppState>();
                    let location = match app_state.location() {
                        Ok(location) => Some(location),
                        Err(message) => {
                            error!("Failed to read the current location before closing: {message}");
                            None
                        }
                    };

                    match event_properties.lock() {
                        Ok(mut state) => {
                            if let Some((width, height)) = dimensions {
                                state.properties.width = width;
                                state.properties.height = height;
                            }
                            if let Some(location) = location {
                                state.properties.set_basepath(location.basepath.clone());
                                state
                                    .properties
                                    .set_filename(&location.basepath, location.filename);
                            }
                        }
                        Err(error) => {
                            error!("Failed to update application properties state: {error}")
                        }
                    }
                }
                WindowEvent::Destroyed => {
                    let (path, application_properties) = match event_properties.lock() {
                        Ok(state) => (state.path.clone(), state.properties.clone()),
                        Err(error) => {
                            error!("Failed to read application properties state: {error}");
                            return;
                        }
                    };

                    let Some(path) = path else {
                        return;
                    };
                    match properties::save(&path, &application_properties) {
                        Ok(()) => info!(
                            "Saved application properties, including window dimensions {}x{}, to {}",
                            application_properties.width,
                            application_properties.height,
                            path.display()
                        ),
                        Err(message) => error!("Failed to save application properties: {message}"),
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::initial_config,
            commands::set_window_title,
            commands::set_current_filename,
            commands::set_current_basepath,
            commands::browse_directories,
            commands::filesystem_roots,
            commands::path_kind,
            commands::resolve_link,
            commands::list_directory,
            commands::read_file,
            commands::read_binary_file,
            commands::read_linked_binary_file,
            commands::resolve_linked_file_uri,
            commands::import_linked_image_uri,
            commands::save_linked_image,
            commands::save_linked_image_resource,
            commands::write_binary_file,
            commands::open_file,
            commands::write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn run_with_options(
    basepath: Option<PathBuf>,
    filename: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
) {
    run_with_configuration(basepath, filename, width, height);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    run_with_options(None, None, None, None);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cli_dimensions_override_saved_properties() {
        let properties = Properties::new(800, 600);

        assert_eq!(
            initial_window_dimensions(&properties, Some(1280), Some(720)),
            (1280, 720)
        );
    }

    #[test]
    fn each_cli_dimension_overrides_its_saved_property_independently() {
        let properties = Properties::new(800, 600);

        assert_eq!(
            initial_window_dimensions(&properties, Some(1024), None),
            (1024, 600)
        );
        assert_eq!(
            initial_window_dimensions(&properties, None, Some(768)),
            (800, 768)
        );
    }
}
