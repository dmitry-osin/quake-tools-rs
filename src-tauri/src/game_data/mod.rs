#![allow(dead_code)]

use crate::state::{Game, ItemType, MapPreset};

pub const APP_NAME: &str = "Quake Timing";

pub const ALL_ITEM_TYPES: [ItemType; 5] = [
    ItemType::RedArmor,
    ItemType::YellowArmor,
    ItemType::GreenArmor,
    ItemType::MegaHealth,
    ItemType::Health,
];

pub fn get_spawn_seconds(game: Game, item_type: ItemType) -> i32 {
    match game {
        Game::QuakeChampions => 30,
        Game::QuakeLive => match item_type {
            ItemType::MegaHealth | ItemType::Health => 35,
            _ => 25,
        },
    }
}

pub fn quake_live_presets() -> Vec<MapPreset> {
    let map_items = vec![ItemType::MegaHealth, ItemType::RedArmor, ItemType::YellowArmor];

    vec![
        MapPreset {
            id: "aerowalk".to_string(),
            name: "Aerowalk".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "battleforged".to_string(),
            name: "Battleforged".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "blood-run".to_string(),
            name: "Blood Run".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "cure".to_string(),
            name: "Cure".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "furious-heights".to_string(),
            name: "Furious Heights".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "hektik".to_string(),
            name: "Hektik".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "lost-world".to_string(),
            name: "Lost World".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "sinister".to_string(),
            name: "Sinister".to_string(),
            items: map_items.clone(),
        },
        MapPreset {
            id: "toxicity".to_string(),
            name: "Toxicity".to_string(),
            items: map_items,
        },
    ]
}

pub fn quake_champions_presets() -> Vec<MapPreset> {
    let default_items = vec![ItemType::MegaHealth, ItemType::RedArmor, ItemType::YellowArmor];

    vec![
        MapPreset {
            id: "awoken".to_string(),
            name: "Awoken".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "blood-covenant".to_string(),
            name: "Blood Covenant".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "blood-run".to_string(),
            name: "Blood Run".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "burial-chamber".to_string(),
            name: "Burial Chamber".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "corrupted-keep".to_string(),
            name: "Corrupted Keep".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "deep-embrace".to_string(),
            name: "Deep Embrace".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "exile".to_string(),
            name: "Exile".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "insomnia".to_string(),
            name: "Insomnia".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "lockbox".to_string(),
            name: "Lockbox".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "molten-falls".to_string(),
            name: "Molten Falls".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "ruins-of-sarnath".to_string(),
            name: "Ruins of Sarnath".to_string(),
            items: default_items.clone(),
        },
        MapPreset {
            id: "the-longest-yard".to_string(),
            name: "The Longest Yard".to_string(),
            items: vec![ItemType::MegaHealth, ItemType::RedArmor],
        },
        MapPreset {
            id: "vale-of-pnath".to_string(),
            name: "Vale of Pnath".to_string(),
            items: default_items,
        },
    ]
}
