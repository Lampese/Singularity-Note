#![forbid(unsafe_code)]

use std::net::SocketAddr;
use std::time::{SystemTime, UNIX_EPOCH};

use axum::routing::get;
use axum::{Json, Router};
use observability::{init_metrics, init_tracing, service_span, TelemetryConfig};
use serde::Serialize;
use tokio::net::TcpListener;
use tracing::Instrument;

#[derive(Debug, Serialize)]
struct HealthResponse {
    service: &'static str,
    status: &'static str,
    started_at_unix: u64,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        service: "svc-ingest",
        status: "ok",
        started_at_unix: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_secs())
            .unwrap_or_default(),
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let telemetry = TelemetryConfig::from_env("svc-ingest");
    init_metrics(&telemetry)?;
    init_tracing(&telemetry)?;

    async move {
        let addr = std::env::var("INGEST_HTTP_ADDR")
            .unwrap_or_else(|_| "127.0.0.1:8082".to_string())
            .parse::<SocketAddr>()?;
        let app = Router::new()
            .route("/health", get(health))
            .route("/metrics", get(observability::metrics_handler));
        let listener = TcpListener::bind(addr).await?;
        tracing::info!(%addr, "svc-ingest listening");
        axum::serve(listener, app).await?;
        Ok::<(), Box<dyn std::error::Error>>(())
    }
    .instrument(service_span(&telemetry))
    .await
}
