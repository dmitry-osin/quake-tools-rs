#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {name}! {} backend is ready.", crate::game_data::APP_NAME)
}
