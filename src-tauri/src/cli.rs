// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

use clap::Parser;
use std::path::{Component, Path, PathBuf};

#[derive(Debug, Parser)]
#[command(version, about = "A lightweight Markdown editor")]
struct Cli {
    /// Relative file or directory to open
    #[arg(value_name = "FILENAME", value_hint = clap::ValueHint::AnyPath)]
    filename: Option<PathBuf>,

    /// Root directory containing the files that can be opened
    #[arg(long, value_name = "BASEPATH", value_hint = clap::ValueHint::DirPath)]
    base_path: Option<PathBuf>,

    /// Initial window width, overriding the saved value
    #[arg(long, value_name = "WIDTH", value_parser = clap::value_parser!(u32).range(1..))]
    width: Option<u32>,

    /// Initial window height, overriding the saved value
    #[arg(long, value_name = "HEIGHT", value_parser = clap::value_parser!(u32).range(1..))]
    height: Option<u32>,
}

pub(crate) struct Configuration {
    pub(crate) basepath: Option<PathBuf>,
    pub(crate) filename: Option<String>,
    pub(crate) width: Option<u32>,
    pub(crate) height: Option<u32>,
}

pub(crate) fn resolve() -> Result<Configuration, String> {
    let cli = Cli::parse();
    let (basepath, filename) = resolve_overrides(cli.filename, cli.base_path)?;
    Ok(Configuration {
        basepath,
        filename,
        width: cli.width,
        height: cli.height,
    })
}

fn resolve_overrides(
    filename: Option<PathBuf>,
    base_path: Option<PathBuf>,
) -> Result<(Option<PathBuf>, Option<String>), String> {
    let current_dir = std::env::current_dir()
        .map_err(|error| format!("Failed to get current directory: {}", error))?;
    resolve_overrides_from(filename, base_path, &current_dir)
}

fn resolve_overrides_from(
    filename: Option<PathBuf>,
    base_path: Option<PathBuf>,
    current_dir: &Path,
) -> Result<(Option<PathBuf>, Option<String>), String> {
    let basepath = match base_path {
        Some(requested_base) => {
            let requested_base = if requested_base.is_absolute() {
                requested_base
            } else {
                current_dir.join(requested_base)
            };
            let canonical_base = std::fs::canonicalize(&requested_base).map_err(|error| {
                format!(
                    "Failed to resolve base path '{}': {}",
                    requested_base.display(),
                    error
                )
            })?;

            if !canonical_base.is_dir() {
                return Err(format!(
                    "Base path is not a directory: '{}'",
                    canonical_base.display()
                ));
            }
            Some(canonical_base)
        }
        None => None,
    };

    let filename = match filename {
        Some(filename) => {
            if filename.is_absolute()
                || filename.components().any(|component| {
                    matches!(
                        component,
                        Component::ParentDir | Component::RootDir | Component::Prefix(_)
                    )
                })
            {
                return Err(format!(
                    "Filename must be relative to the base path: '{}'",
                    filename.display()
                ));
            }
            Some(filename.to_string_lossy().into_owned())
        }
        None => None,
    };

    Ok((basepath, filename))
}

#[cfg(test)]
mod tests;
