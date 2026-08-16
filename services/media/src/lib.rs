#![forbid(unsafe_code)]

use std::time::Duration;

use observability::{init_metrics, init_tracing, service_span, TelemetryConfig};
use tracing::Instrument;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ServiceRole {
    Api,
    Worker,
}

impl ServiceRole {
    fn service_name(self) -> &'static str {
        match self {
            Self::Api => "svc-media-api",
            Self::Worker => "svc-media-worker",
        }
    }
}

#[derive(Clone, Debug)]
pub struct ServiceConfig {
    pub role: ServiceRole,
    pub heartbeat_interval: Duration,
}

impl ServiceConfig {
    pub fn from_env(role: ServiceRole) -> Self {
        let heartbeat_secs = std::env::var("MEDIA_HEARTBEAT_SECS")
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(30);
        Self {
            role,
            heartbeat_interval: Duration::from_secs(heartbeat_secs.max(1)),
        }
    }
}

pub async fn run(config: ServiceConfig) -> Result<(), Box<dyn std::error::Error>> {
    let telemetry = TelemetryConfig::from_env(config.role.service_name());
    init_metrics(&telemetry)?;
    init_tracing(&telemetry)?;

    async move {
        let mut heartbeat = tokio::time::interval(config.heartbeat_interval);
        tracing::info!(role = ?config.role, "media service started");
        loop {
            tokio::select! {
                _ = heartbeat.tick() => tracing::trace!(role = ?config.role, "media heartbeat"),
                result = tokio::signal::ctrl_c() => {
                    result?;
                    tracing::info!(role = ?config.role, "media service stopping");
                    return Ok::<(), Box<dyn std::error::Error>>(());
                }
            }
        }
    }
    .instrument(service_span(&telemetry))
    .await
}

pub async fn serve_api() -> Result<(), Box<dyn std::error::Error>> {
    run(ServiceConfig::from_env(ServiceRole::Api)).await
}

pub async fn serve_worker() -> Result<(), Box<dyn std::error::Error>> {
    run(ServiceConfig::from_env(ServiceRole::Worker)).await
}
