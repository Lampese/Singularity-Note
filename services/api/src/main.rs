#![forbid(unsafe_code)]

use std::net::SocketAddr;

use observability::{init_metrics, init_tracing, service_span, TelemetryConfig};
use tracing::Instrument;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let telemetry = TelemetryConfig::from_env("svc-api");
    init_metrics(&telemetry)?;
    init_tracing(&telemetry)?;

    let addr = std::env::var("API_HTTP_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:8080".to_string())
        .parse::<SocketAddr>()?;

    svc_api::serve(addr)
        .instrument(service_span(&telemetry))
        .await?;
    Ok(())
}
