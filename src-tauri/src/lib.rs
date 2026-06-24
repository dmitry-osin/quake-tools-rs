mod audio;
mod assets;
mod cvars;
mod commands;
mod game_data;
mod hotkey;
mod settings;
mod state;
mod timer;
mod trainer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _modules = (
        audio::init(),
        cvars::init(),
        hotkey::init(),
        settings::init(),
        timer::init(),
        trainer::init(),
    );

    tauri::Builder::default()
        .manage(state::shared_state())
        .manage(std::sync::Mutex::new(
            cvars::CvarsDatabase::new().expect("failed to initialize cvars database"),
        ))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::set_always_on_top,
            commands::save_persisted_state,
            commands::load_persisted_state,
            commands::list_cvar_categories,
            commands::query_cvars,
            commands::get_cvar_detail
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
