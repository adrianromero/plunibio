// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

const CONFIG_DIRECTORY: &str = ".plunibio";
const PROPERTIES_FILENAME: &str = "properties.toml";

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
pub(crate) struct Properties {
    pub(crate) width: u32,
    pub(crate) height: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    basepath: Option<PathBuf>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    basepaths: BTreeMap<String, String>,
}

impl Properties {
    pub(crate) fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            basepath: None,
            basepaths: BTreeMap::new(),
        }
    }

    pub(crate) fn basepath(&self) -> Option<&Path> {
        self.basepath.as_deref()
    }

    pub(crate) fn set_basepath(&mut self, basepath: PathBuf) {
        self.basepath = Some(basepath);
    }

    pub(crate) fn resolved_basepath(&self) -> Result<Option<PathBuf>, String> {
        let Some(basepath) = self.basepath() else {
            return Ok(None);
        };
        if !basepath.is_absolute() {
            return Err(format!(
                "saved base path '{}' is not absolute",
                basepath.display()
            ));
        }
        let canonical = fs::canonicalize(basepath).map_err(|error| {
            format!(
                "unable to resolve saved base path '{}': {error}",
                basepath.display()
            )
        })?;
        if !canonical.is_dir() {
            return Err(format!(
                "saved base path '{}' is not a directory",
                canonical.display()
            ));
        }
        Ok(Some(canonical))
    }

    pub(crate) fn filename_for(&self, basepath: &Path) -> Option<&str> {
        self.basepaths
            .get(basepath.to_string_lossy().as_ref())
            .map(String::as_str)
    }

    pub(crate) fn set_filename(&mut self, basepath: &Path, filename: String) {
        self.basepaths
            .insert(basepath.to_string_lossy().into_owned(), filename);
    }

    fn validate(self) -> Result<Self, String> {
        if self.width == 0 || self.height == 0 {
            return Err("window dimensions must be greater than zero".to_owned());
        }
        Ok(self)
    }
}

impl Default for Properties {
    fn default() -> Self {
        Self::new(800, 600)
    }
}

pub(crate) fn properties_path(home: &Path) -> PathBuf {
    home.join(CONFIG_DIRECTORY).join(PROPERTIES_FILENAME)
}

pub(crate) fn load(path: &Path) -> Result<Option<Properties>, String> {
    let contents = match fs::read_to_string(path) {
        Ok(contents) => contents,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(format!("unable to read '{}': {error}", path.display())),
    };

    toml::from_str::<Properties>(&contents)
        .map_err(|error| format!("unable to parse '{}': {error}", path.display()))?
        .validate()
        .map(Some)
}

pub(crate) fn save(path: &Path, properties: &Properties) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| format!("properties path '{}' has no parent", path.display()))?;
    fs::create_dir_all(parent)
        .map_err(|error| format!("unable to create '{}': {error}", parent.display()))?;

    let contents = toml::to_string_pretty(&properties)
        .map_err(|error| format!("unable to serialize application properties: {error}"))?;
    fs::write(path, contents)
        .map_err(|error| format!("unable to write '{}': {error}", path.display()))
}

#[cfg(test)]
mod tests;
