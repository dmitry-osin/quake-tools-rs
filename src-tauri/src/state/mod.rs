use std::sync::Mutex;

#[derive(Debug, Clone, Default)]
pub struct AppState;

pub fn shared_state() -> Mutex<AppState> {
    Mutex::new(AppState::default())
}
