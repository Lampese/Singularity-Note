#![forbid(unsafe_code)]

use migration::{connect, MigrationConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    let config = MigrationConfig::from_env()?;
    let pool = connect(&config).await?;
    pool.close().await;
    tracing::info!("database connection verified");
    Ok(())
}
