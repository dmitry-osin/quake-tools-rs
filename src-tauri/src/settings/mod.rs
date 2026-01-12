#[derive(Debug, Clone, Default)]
pub struct SettingsModule;

pub fn init() -> SettingsModule {
    SettingsModule::default()
}
