#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Game {
    QuakeLive,
    QuakeChampions,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
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
    #[serde(alias = "Main")]
    Timers,
    Trainer,
    CVars,
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
#[serde(rename_all = "camelCase")]
pub struct ItemConfig {
    pub id: String,
    pub item_type: ItemType,
    pub spawn_seconds: i32,
    pub hotkey: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimerEntry {
    pub status: TimerStatus,
    pub remaining_ms: i64,
    pub started_at_wall_ms: Option<i64>,
    pub started_at_game_ms: Option<i64>,
    pub spawn_at_game_ms: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ItemAlertSettings {
    pub stage1_threshold_seconds: i32,
    pub stage2_threshold_seconds: i32,
    pub stage1_color: String,
    pub stage2_color: String,
    pub volume: f32,
}

fn default_item_alerts() -> HashMap<ItemType, ItemAlertSettings> {
    HashMap::from([
        (
            ItemType::MegaHealth,
            ItemAlertSettings {
                stage1_threshold_seconds: 15,
                stage2_threshold_seconds: 10,
                stage1_color: "#f59e0b".to_string(),
                stage2_color: "#ef4444".to_string(),
                volume: 0.9,
            },
        ),
        (
            ItemType::RedArmor,
            ItemAlertSettings {
                stage1_threshold_seconds: 15,
                stage2_threshold_seconds: 10,
                stage1_color: "#f59e0b".to_string(),
                stage2_color: "#ef4444".to_string(),
                volume: 0.9,
            },
        ),
        (
            ItemType::GreenArmor,
            ItemAlertSettings {
                stage1_threshold_seconds: 15,
                stage2_threshold_seconds: 10,
                stage1_color: "#f59e0b".to_string(),
                stage2_color: "#ef4444".to_string(),
                volume: 0.9,
            },
        ),
        (
            ItemType::YellowArmor,
            ItemAlertSettings {
                stage1_threshold_seconds: 15,
                stage2_threshold_seconds: 10,
                stage1_color: "#f59e0b".to_string(),
                stage2_color: "#ef4444".to_string(),
                volume: 0.9,
            },
        ),
        (
            ItemType::Health,
            ItemAlertSettings {
                stage1_threshold_seconds: 15,
                stage2_threshold_seconds: 10,
                stage1_color: "#f59e0b".to_string(),
                stage2_color: "#ef4444".to_string(),
                volume: 0.9,
            },
        ),
    ])
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub theme: Theme,
    #[serde(default)]
    pub developer_mode: bool,
    #[serde(default)]
    pub guide_never_show_again: bool,
    pub idle_color: String,
    #[serde(default = "default_item_alerts")]
    pub item_alerts: HashMap<ItemType, ItemAlertSettings>,
    pub sound_enabled: bool,
    pub display_mode: DisplayMode,
    pub always_on_top: bool,
    pub global_hook_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MapPreset {
    pub id: String,
    pub name: String,
    pub items: Vec<ItemType>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HotkeyConflict {
    pub item_id: String,
    pub conflicts_with: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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
            theme: Theme::Neon,
            developer_mode: false,
            guide_never_show_again: false,
            idle_color: "#4b5563".to_string(),
            item_alerts: default_item_alerts(),
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
            page: Page::Timers,
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
