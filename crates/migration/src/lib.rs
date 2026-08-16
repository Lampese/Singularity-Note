#![forbid(unsafe_code)]

use sqlx::postgres::{PgPool, PgPoolOptions};

#[derive(Clone, Debug)]
pub struct MigrationConfig {
    pub database_url: String,
    pub max_connections: u32,
}

impl MigrationConfig {
    pub fn from_env() -> Result<Self, MigrationError> {
        let database_url = std::env::var("DATABASE_URL")
            .map_err(|_| MigrationError::MissingEnvironment("DATABASE_URL"))?;
        let max_connections = std::env::var("MIGRATION_MAX_CONNECTIONS")
            .ok()
            .and_then(|value| value.parse().ok())
            .unwrap_or(5);

        Ok(Self {
            database_url,
            max_connections,
        })
    }
}

#[derive(Debug, thiserror::Error)]
pub enum MigrationError {
    #[error("required environment variable is missing: {0}")]
    MissingEnvironment(&'static str),
    #[error("database connection failed: {0}")]
    Database(#[from] sqlx::Error),
}

pub async fn connect(config: &MigrationConfig) -> Result<PgPool, MigrationError> {
    PgPoolOptions::new()
        .max_connections(config.max_connections)
        .connect(&config.database_url)
        .await
        .map_err(MigrationError::from)
}
