#![forbid(unsafe_code)]

use std::net::SocketAddr;
use std::time::{SystemTime, UNIX_EPOCH};

use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use tokio::net::TcpListener;

#[derive(Clone, Debug)]
pub struct ServiceState {
    pub service_name: &'static str,
    pub started_at_unix: u64,
}

impl ServiceState {
    pub fn new(service_name: &'static str) -> Self {
        let started_at_unix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_secs())
            .unwrap_or_default();
        Self {
            service_name,
            started_at_unix,
        }
    }
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    service: &'static str,
    status: &'static str,
    started_at_unix: u64,
}

async fn health(State(state): State<ServiceState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        service: state.service_name,
        status: "ok",
        started_at_unix: state.started_at_unix,
    })
}

pub fn router(state: ServiceState) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/metrics", get(observability::metrics_handler))
        .with_state(state)
}

pub async fn serve(addr: SocketAddr) -> Result<(), std::io::Error> {
    let listener = TcpListener::bind(addr).await?;
    tracing::info!(%addr, "svc-api listening");
    axum::serve(listener, router(ServiceState::new("svc-api"))).await
}
