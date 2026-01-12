mod audio;
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
        hotkey::init(),
        settings::init(),
        timer::init(),
        trainer::init(),
    );

    tauri::Builder::default()
        .manage(state::shared_state())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
