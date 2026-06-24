use crate::assets::CVARS_JSON;
use rusqlite::{params, params_from_iter, types::Value, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvarCategorySummary {
    pub name: String,
    pub command_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvarSearchResult {
    pub name: String,
    pub friendly_name: Option<String>,
    pub short_description: Option<String>,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvarQueryResponse {
    pub items: Vec<CvarSearchResult>,
    pub total: i64,
    pub page: i32,
    pub page_size: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CvarAvailableSetting {
    pub value: String,
    pub description: String,
    #[serde(rename = "isDefault", alias = "is_default")]
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CvarDetail {
    pub name: String,
    pub friendly_name: Option<String>,
    pub data_type: Option<String>,
    pub short_description: Option<String>,
    pub description: Option<String>,
    pub pro_tip: Option<String>,
    pub performance_impact: Option<String>,
    pub default_value: Option<String>,
    pub category: String,
    pub category_url: Option<String>,
    pub url: Option<String>,
    pub available_settings: Vec<CvarAvailableSetting>,
}

#[derive(Debug, Deserialize)]
struct JsonCategory {
    name: String,
    url: Option<String>,
    #[serde(default)]
    command_count: i32,
    #[serde(default)]
    commands: Vec<JsonCommand>,
}

#[derive(Debug, Deserialize)]
struct JsonCommand {
    name: String,
    url: Option<String>,
    data_type: Option<String>,
    short_description: Option<String>,
    description: Option<String>,
    pro_tip: Option<String>,
    performance_impact: Option<String>,
    friendly_name: Option<String>,
    default_value: Option<String>,
    #[serde(default)]
    available_settings: Vec<CvarAvailableSetting>,
}

#[derive(Debug)]
pub struct CvarsDatabase {
    connection: Connection,
}

#[derive(Debug, Clone, Default)]
pub struct CvarsModule;

pub fn init() -> CvarsModule {
    CvarsModule
}

impl CvarsDatabase {
    pub fn new() -> Result<Self, String> {
        let database_path = cvars_database_path()?;
        if let Some(parent) = database_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|error| format!("Failed to create CVars database directory: {error}"))?;
        }

        let connection = Connection::open(&database_path)
            .map_err(|error| format!("Failed to open CVars database at {}: {error}", database_path.display()))?;

        eprintln!("CVars database path: {}", database_path.display());

        connection
            .execute_batch(
                "
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    url TEXT,
                    command_count INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS cvars (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category_id INTEGER NOT NULL,
                    url TEXT,
                    data_type TEXT,
                    short_description TEXT,
                    description TEXT,
                    pro_tip TEXT,
                    performance_impact TEXT,
                    friendly_name TEXT,
                    default_value TEXT,
                    available_settings_json TEXT NOT NULL,
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                );

                CREATE INDEX IF NOT EXISTS idx_cvars_name ON cvars(name COLLATE NOCASE);
                CREATE INDEX IF NOT EXISTS idx_cvars_category ON cvars(category_id);
            ",
            )
            .map_err(|error| format!("Failed to create CVars schema: {error}"))?;

        let existing_count: i64 = connection
            .query_row("SELECT COUNT(*) FROM cvars", [], |row| row.get(0))
            .map_err(|error| format!("Failed to check CVars row count: {error}"))?;

        if existing_count == 0 {
            let categories: Vec<JsonCategory> = serde_json::from_str(CVARS_JSON)
                .map_err(|error| format!("Failed to parse quake_cvars.json: {error}"))?;

            let mut insert_category = connection
                .prepare("INSERT INTO categories (name, url, command_count) VALUES (?1, ?2, ?3)")
                .map_err(|error| format!("Failed to prepare category insert: {error}"))?;

            let mut insert_command = connection
                .prepare(
                    "INSERT INTO cvars (
                        name, category_id, url, data_type, short_description, description, pro_tip,
                        performance_impact, friendly_name, default_value, available_settings_json
                    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                )
                .map_err(|error| format!("Failed to prepare cvar insert: {error}"))?;

            for category in categories {
                insert_category
                    .execute(params![category.name, category.url, category.command_count])
                    .map_err(|error| format!("Failed to insert category: {error}"))?;

                let category_id = connection.last_insert_rowid();

                for command in category.commands {
                    let settings_json = serde_json::to_string(&command.available_settings)
                        .map_err(|error| format!("Failed to serialize settings for {}: {error}", command.name))?;

                    insert_command
                        .execute(params![
                            command.name,
                            category_id,
                            command.url,
                            command.data_type,
                            command.short_description,
                            command.description,
                            command.pro_tip,
                            command.performance_impact,
                            command.friendly_name,
                            command.default_value,
                            settings_json,
                        ])
                        .map_err(|error| format!("Failed to insert cvar: {error}"))?;
                }
            }

            drop(insert_command);
            drop(insert_category);

            let loaded_count: i64 = connection
                .query_row("SELECT COUNT(*) FROM cvars", [], |row| row.get(0))
                .map_err(|error| format!("Failed to count loaded CVars rows: {error}"))?;
            eprintln!("CVars seeded into database: {} rows", loaded_count);
        } else {
            eprintln!("CVars already present in database: {} rows", existing_count);
        }

        Ok(Self { connection })
    }

    pub fn list_categories(&self) -> Result<Vec<CvarCategorySummary>, String> {
        let mut statement = self
            .connection
            .prepare("SELECT name, command_count FROM categories ORDER BY name")
            .map_err(|error| format!("Failed to prepare category query: {error}"))?;

        let rows = statement
            .query_map([], |row| {
                Ok(CvarCategorySummary {
                    name: row.get(0)?,
                    command_count: row.get(1)?,
                })
            })
            .map_err(|error| format!("Failed to query categories: {error}"))?;

        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|error| format!("Failed to collect categories: {error}"))
    }

    pub fn query_page(
        &self,
        query: Option<&str>,
        category: Option<&str>,
        page: i32,
        page_size: i32,
    ) -> Result<CvarQueryResponse, String> {
        let safe_page = page.max(1);
        let safe_page_size = page_size.clamp(1, 100);
        let offset = (safe_page - 1) * safe_page_size;

        let normalized_query = query.map(str::trim).filter(|value| !value.is_empty());
        let normalized_category = category.map(str::trim).filter(|value| !value.is_empty());
        let (where_sql, where_params) = build_where_clause(normalized_query, normalized_category);

        let count_sql = format!(
            "SELECT COUNT(*) FROM cvars c JOIN categories cat ON cat.id = c.category_id {}",
            where_sql
        );

        let total: i64 = self
            .connection
            .query_row(&count_sql, params_from_iter(where_params.clone()), |row| row.get(0))
            .map_err(|error| format!("Failed to count cvars: {error}"))?;

        let data_sql = format!(
            "SELECT c.name, c.friendly_name, c.short_description, cat.name
             FROM cvars c
             JOIN categories cat ON cat.id = c.category_id
             {}
             ORDER BY c.name
             LIMIT ? OFFSET ?",
            where_sql
        );

        let mut statement = self
            .connection
            .prepare(&data_sql)
            .map_err(|error| format!("Failed to prepare paged query: {error}"))?;

        let mut data_params = where_params;
        data_params.push(Value::Integer(i64::from(safe_page_size)));
        data_params.push(Value::Integer(i64::from(offset)));

        let rows = statement
            .query_map(params_from_iter(data_params), |row| {
                Ok(CvarSearchResult {
                    name: row.get(0)?,
                    friendly_name: row.get(1)?,
                    short_description: row.get(2)?,
                    category: row.get(3)?,
                })
            })
            .map_err(|error| format!("Failed to execute paged query: {error}"))?;

        let items = rows
            .collect::<Result<Vec<_>, _>>()
            .map_err(|error| format!("Failed to collect paged results: {error}"))?;

        Ok(CvarQueryResponse {
            items,
            total,
            page: safe_page,
            page_size: safe_page_size,
        })
    }

    pub fn detail_by_name(&self, name: &str) -> Result<Option<CvarDetail>, String> {
        let mut statement = self
            .connection
            .prepare(
                "SELECT
                    c.name,
                    c.friendly_name,
                    c.data_type,
                    c.short_description,
                    c.description,
                    c.pro_tip,
                    c.performance_impact,
                    c.default_value,
                    cat.name,
                    cat.url,
                    c.url,
                    c.available_settings_json
                FROM cvars c
                JOIN categories cat ON cat.id = c.category_id
                WHERE c.name = ?1 COLLATE NOCASE
                LIMIT 1",
            )
            .map_err(|error| format!("Failed to prepare details query: {error}"))?;

        let mut rows = statement
            .query(params![name])
            .map_err(|error| format!("Failed to execute details query: {error}"))?;

        let Some(row) = rows.next().map_err(|error| format!("Failed to read details row: {error}"))? else {
            return Ok(None);
        };

        let available_settings_json: String = row
            .get(11)
            .map_err(|error| format!("Failed to read settings JSON: {error}"))?;

        let available_settings: Vec<CvarAvailableSetting> = serde_json::from_str(&available_settings_json)
            .map_err(|error| format!("Failed to parse settings JSON: {error}"))?;

        Ok(Some(CvarDetail {
            name: row.get(0).map_err(|error| format!("Failed to read cvar name: {error}"))?,
            friendly_name: row.get(1).map_err(|error| format!("Failed to read friendly name: {error}"))?,
            data_type: row.get(2).map_err(|error| format!("Failed to read data type: {error}"))?,
            short_description: row
                .get(3)
                .map_err(|error| format!("Failed to read short description: {error}"))?,
            description: row.get(4).map_err(|error| format!("Failed to read description: {error}"))?,
            pro_tip: row.get(5).map_err(|error| format!("Failed to read pro tip: {error}"))?,
            performance_impact: row
                .get(6)
                .map_err(|error| format!("Failed to read performance impact: {error}"))?,
            default_value: row.get(7).map_err(|error| format!("Failed to read default value: {error}"))?,
            category: row.get(8).map_err(|error| format!("Failed to read category name: {error}"))?,
            category_url: row.get(9).map_err(|error| format!("Failed to read category URL: {error}"))?,
            url: row.get(10).map_err(|error| format!("Failed to read command URL: {error}"))?,
            available_settings,
        }))
    }
}

fn cvars_database_path() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or_else(|| "Unable to resolve home directory for CVars database".to_string())?;
    Ok(home.join(".quake-tools").join("cvars.db"))
}

fn build_where_clause(query: Option<&str>, category: Option<&str>) -> (String, Vec<Value>) {
    let mut parts: Vec<&str> = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    if let Some(search_term) = query {
        parts.push(
            "(c.name LIKE ? COLLATE NOCASE OR COALESCE(c.friendly_name, '') LIKE ? COLLATE NOCASE OR COALESCE(c.description, '') LIKE ? COLLATE NOCASE)",
        );
        let term = Value::Text(format!("%{}%", search_term));
        params.push(term.clone());
        params.push(term.clone());
        params.push(term);
    }

    if let Some(category_name) = category {
        parts.push("cat.name = ?");
        params.push(Value::Text(category_name.to_string()));
    }

    if parts.is_empty() {
        (String::new(), params)
    } else {
        (format!("WHERE {}", parts.join(" AND ")), params)
    }
}
