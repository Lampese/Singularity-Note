#![forbid(unsafe_code)]

use std::net::SocketAddr;

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
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        service: "svc-web-open",
        status: "ok",
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let telemetry = TelemetryConfig::from_env("svc-web-open");
    init_metrics(&telemetry)?;
    init_tracing(&telemetry)?;

    async move {
        let addr = std::env::var("WEB_OPEN_HTTP_ADDR")
            .unwrap_or_else(|_| "127.0.0.1:8084".to_string())
            .parse::<SocketAddr>()?;
        let app = Router::new()
            .route("/health", get(health))
            .route("/metrics", get(observability::metrics_handler));
        let listener = TcpListener::bind(addr).await?;
        tracing::info!(%addr, "svc-web-open listening");
        axum::serve(listener, app).await?;
        Ok::<(), Box<dyn std::error::Error>>(())
    }
    .instrument(service_span(&telemetry))
    .await
}
