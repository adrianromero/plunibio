// Copyright (c) 2026 Adrián Romero
// SPDX-License-Identifier: MIT

/// WebKitGTK uses GtkPageSetup margins rather than CSS @page margins. Use the
/// same native operation for the interactive dialog and automation PDF output.
#[tauri::command]
pub async fn print_document(
    window: tauri::WebviewWindow,
    output_path: Option<String>,
) -> Result<(), String> {
    if output_path.is_some() && !cfg!(feature = "automation") {
        return Err("Silent printing is only available in automation builds".into());
    }
    #[cfg(target_os = "linux")]
    {
        use gtk::prelude::*;
        use std::sync::{Arc, Mutex};
        use webkit2gtk::PrintOperationExt;

        let output_uri = output_path
            .map(|path| url::Url::from_file_path(path).map(|url| url.to_string()))
            .transpose()
            .map_err(|_| "The PDF output path must be absolute")?;
        let (sender, receiver) = tokio::sync::oneshot::channel();
        window
            .with_webview(move |webview| {
                let view = webview.inner();
                let parent = view
                    .toplevel()
                    .and_then(|widget| widget.downcast::<gtk::Window>().ok());
                let operation = webkit2gtk::PrintOperation::new(&view);
                let setup = gtk::PageSetup::new();
                setup.set_paper_size(&gtk::PaperSize::new(Some(gtk::PAPER_NAME_A4)));
                setup.set_top_margin(15.0, gtk::Unit::Mm);
                setup.set_bottom_margin(15.0, gtk::Unit::Mm);
                setup.set_left_margin(15.0, gtk::Unit::Mm);
                setup.set_right_margin(15.0, gtk::Unit::Mm);
                operation.set_page_setup(&setup);
                let failure = Arc::new(Mutex::new(None::<String>));
                let failed = Arc::clone(&failure);
                operation.connect_failed(move |_, error| {
                    *failed.lock().expect("print error mutex") = Some(error.to_string());
                });
                let sender = Arc::new(Mutex::new(Some(sender)));
                let finished_sender = Arc::clone(&sender);
                operation.connect_finished(move |_| {
                    if let Some(sender) = finished_sender.lock().expect("print sender mutex").take()
                    {
                        let result = failure
                            .lock()
                            .expect("print error mutex")
                            .take()
                            .map_or(Ok(()), Err);
                        let _ = sender.send(result);
                    }
                });
                if let Some(uri) = output_uri {
                    let settings = gtk::PrintSettings::new();
                    settings.set_printer("Print to File");
                    settings.set(gtk::PRINT_SETTINGS_OUTPUT_URI, Some(&uri));
                    settings.set(gtk::PRINT_SETTINGS_OUTPUT_FILE_FORMAT, Some("pdf"));
                    operation.set_print_settings(&settings);
                    operation.print();
                } else if operation.run_dialog(parent.as_ref())
                    == webkit2gtk::PrintOperationResponse::Cancel
                {
                    if let Some(sender) = sender.lock().expect("print sender mutex").take() {
                        let _ = sender.send(Ok(()));
                    }
                }
            })
            .map_err(|error| error.to_string())?;
        receiver.await.map_err(|error| error.to_string())?
    }
    #[cfg(not(target_os = "linux"))]
    {
        let _ = window;
        Err("The native print command is only used on Linux".into())
    }
}

/// Keep printing permissions separate from the application's existing commands.
pub fn init() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    tauri::plugin::Builder::new("printing")
        .invoke_handler(tauri::generate_handler![print_document])
        .build()
}
