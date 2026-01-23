#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Game {
    QuakeLive,
    QuakeChampions,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ItemType {
    RedArmor,
    YellowArmor,
    GreenArmor,
    MegaHealth,
    Health,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum DisplayMode {
    TimeRemaining,
    SpawnTime,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Theme {
    Light,
    Dark,
    Neon,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Page {
    Main,
    Trainer,
    Settings,
    About,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum TimerStatus {
    Idle,
    Running,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemConfig {
    pub id: String,
    pub item_type: ItemType,
    pub spawn_seconds: i32,
    pub hotkey: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerEntry {
    pub status: TimerStatus,
    pub remaining_ms: i64,
    pub started_at_wall_ms: Option<i64>,
    pub started_at_game_ms: Option<i64>,
    pub spawn_at_game_ms: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertStageSettings {
    pub threshold_seconds: i32,
    pub color: String,
    pub sound_enabled: bool,
    pub volume: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: Theme,
    pub idle_color: String,
    pub stage1: AlertStageSettings,
    pub stage2: AlertStageSettings,
    pub stage3: AlertStageSettings,
    pub sound_enabled: bool,
    pub display_mode: DisplayMode,
    pub always_on_top: bool,
    pub global_hook_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapPreset {
    pub id: String,
    pub name: String,
    pub items: Vec<ItemType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyConflict {
    pub item_id: String,
    pub conflicts_with: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub page: Page,
    pub nav_open: bool,
    pub game: Game,
    pub preset_id: String,
    pub custom_item_types: Vec<ItemType>,
    pub items: Vec<ItemConfig>,
    pub timers: HashMap<String, TimerEntry>,
    pub settings: AppSettings,
    pub game_clock_offset_ms: i64,
    pub game_clock_running: bool,
    pub game_clock_start_at: Option<i64>,
    pub hotkey_conflict: Option<HotkeyConflict>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: Theme::Dark,
            idle_color: "#4b5563".to_string(),
            stage1: AlertStageSettings {
                threshold_seconds: 15,
                color: "#f59e0b".to_string(),
                sound_enabled: true,
                volume: 0.8,
            },
            stage2: AlertStageSettings {
                threshold_seconds: 10,
                color: "#ef4444".to_string(),
                sound_enabled: true,
                volume: 0.9,
            },
            stage3: AlertStageSettings {
                threshold_seconds: 7,
                color: "#ef4444".to_string(),
                sound_enabled: true,
                volume: 1.0,
            },
            sound_enabled: true,
            display_mode: DisplayMode::SpawnTime,
            always_on_top: false,
            global_hook_active: false,
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            page: Page::Main,
            nav_open: false,
            game: Game::QuakeLive,
            preset_id: "aerowalk".to_string(),
            custom_item_types: Vec::new(),
            items: Vec::new(),
            timers: HashMap::new(),
            settings: AppSettings::default(),
            game_clock_offset_ms: 0,
            game_clock_running: false,
            game_clock_start_at: None,
            hotkey_conflict: None,
        }
    }
}

pub fn shared_state() -> Mutex<AppState> {
    Mutex::new(AppState::default())
}
