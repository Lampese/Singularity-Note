#![forbid(unsafe_code)]

use std::net::SocketAddr;
use std::time::{SystemTime, UNIX_EPOCH};

use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;
use tokio::net::TcpListener;

#[derive(Clone, Debug)]
pub struct AgentServiceState {
    service_name: &'static str,
    started_at_unix: u64,
}

impl AgentServiceState {
    pub fn new() -> Self {
        Self {
            service_name: "svc-agent",
            started_at_unix: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|duration| duration.as_secs())
                .unwrap_or_default(),
        }
    }
}

impl Default for AgentServiceState {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    service: &'static str,
    status: &'static str,
    started_at_unix: u64,
}

async fn health(State(state): State<AgentServiceState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        service: state.service_name,
        status: "ok",
        started_at_unix: state.started_at_unix,
    })
}

pub fn router() -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/metrics", get(observability::metrics_handler))
        .with_state(AgentServiceState::new())
}

pub async fn serve(addr: SocketAddr) -> Result<(), std::io::Error> {
    let listener = TcpListener::bind(addr).await?;
    tracing::info!(%addr, "svc-agent listening");
    axum::serve(listener, router()).await
}

#[derive(Clone, Debug)]
pub struct WorkerConfig {
    pub worker_name: String,
    pub poll_interval: std::time::Duration,
}

impl WorkerConfig {
    pub fn from_env() -> Self {
        let poll_interval_ms = std::env::var("AGENT_WORKER_POLL_INTERVAL_MS")
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(1_000);
        Self {
            worker_name: std::env::var("AGENT_WORKER_NAME")
                .unwrap_or_else(|_| "agent-worker".to_string()),
            poll_interval: std::time::Duration::from_millis(poll_interval_ms),
        }
    }
}

pub async fn run_worker(config: WorkerConfig) -> Result<(), std::io::Error> {
    tracing::info!(worker = %config.worker_name, "agent worker started");
    let mut interval = tokio::time::interval(config.poll_interval);
    loop {
        tokio::select! {
            _ = interval.tick() => {
                tracing::trace!(worker = %config.worker_name, "worker heartbeat");
            }
            result = tokio::signal::ctrl_c() => {
                result?;
                tracing::info!(worker = %config.worker_name, "agent worker stopping");
                return Ok(());
            }
        }
    }
}
