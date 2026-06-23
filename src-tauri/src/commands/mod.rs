use crate::game_data;
use crate::state::{AppSettings, Game, ItemConfig, ItemType};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

fn default_hotkeys_by_item() -> HashMap<ItemType, String> {
    HashMap::from([
        (ItemType::MegaHealth, "F1".to_string()),
        (ItemType::RedArmor, "F2".to_string()),
        (ItemType::YellowArmor, "F3".to_string()),
        (ItemType::GreenArmor, "".to_string()),
        (ItemType::Health, "".to_string()),
    ])
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedState {
    pub game: Game,
    pub preset_id: String,
    pub custom_item_types: Vec<ItemType>,
    #[serde(default = "default_hotkeys_by_item")]
    pub hotkeys_by_item: HashMap<ItemType, String>,
    pub items: Vec<ItemConfig>,
    pub settings: AppSettings,
}

fn settings_file_path() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or_else(|| "Unable to resolve home directory".to_string())?;
    Ok(home.join(".quake-tools").join("settings.json"))
}

fn validate_persisted_state(state: &PersistedState) -> bool {
    let valid_preset = if state.preset_id == "custom" {
        true
    } else {
        let presets = match state.game {
            Game::QuakeLive => game_data::quake_live_presets(),
            Game::QuakeChampions => game_data::quake_champions_presets(),
        };

        presets.iter().any(|preset| preset.id == state.preset_id)
    };

    let has_all_item_alerts = state.settings.item_alerts.len() == 5;

    let thresholds_valid = state
        .settings
        .item_alerts
        .values()
        .all(|alert| alert.stage1_threshold_seconds > alert.stage2_threshold_seconds && alert.stage2_threshold_seconds > 0);

    valid_preset && has_all_item_alerts && thresholds_valid
}

fn default_persisted_state() -> PersistedState {
    let default_item_types = vec![ItemType::MegaHealth, ItemType::RedArmor, ItemType::YellowArmor];
    let hotkeys_by_item = default_hotkeys_by_item();
    let default_items = default_item_types
        .iter()
        .map(|item_type| ItemConfig {
            id: format!("{item_type:?}"),
            item_type: *item_type,
            spawn_seconds: game_data::get_spawn_seconds(Game::QuakeLive, *item_type),
            hotkey: hotkeys_by_item
                .get(item_type)
                .cloned()
                .unwrap_or_else(|| "F5".to_string()),
        })
        .collect::<Vec<_>>();

    PersistedState {
        game: Game::QuakeLive,
        preset_id: "aerowalk".to_string(),
        custom_item_types: Vec::new(),
        hotkeys_by_item,
        items: default_items,
        settings: AppSettings::default(),
    }
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {name}! {} backend is ready.", crate::game_data::APP_NAME)
}

#[tauri::command]
pub fn set_always_on_top(window: tauri::Window, value: bool) -> Result<(), String> {
    window
        .set_always_on_top(value)
        .map_err(|error| format!("Failed to set always on top: {error}"))
}

#[tauri::command]
pub fn save_persisted_state(payload: PersistedState) -> Result<(), String> {
    let path = settings_file_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("Failed to create settings directory: {error}"))?;
    }

    let content = serde_json::to_string_pretty(&payload).map_err(|error| format!("Failed to serialize settings: {error}"))?;
    fs::write(path, content).map_err(|error| format!("Failed to write settings file: {error}"))
}

#[tauri::command]
pub fn load_persisted_state() -> PersistedState {
    let path = match settings_file_path() {
        Ok(path) => path,
        Err(error) => {
            eprintln!("{error}");
            return default_persisted_state();
        }
    };

    let content = match fs::read_to_string(path) {
        Ok(content) => content,
        Err(error) => {
            eprintln!("Unable to read settings, using defaults: {error}");
            return default_persisted_state();
        }
    };

    let parsed = match serde_json::from_str::<PersistedState>(&content) {
        Ok(state) => state,
        Err(error) => {
            eprintln!("Unable to parse settings, using defaults: {error}");
            return default_persisted_state();
        }
    };

    if !validate_persisted_state(&parsed) {
        eprintln!("Invalid settings payload, using defaults");
        return default_persisted_state();
    }

    parsed
}
