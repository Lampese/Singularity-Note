#![forbid(unsafe_code)]

use std::sync::OnceLock;
use std::time::Instant;

use axum::extract::Request;
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use prometheus_client::encoding::text::encode;
use prometheus_client::metrics::counter::Counter;
use prometheus_client::registry::Registry;
use tracing::Span;
use tracing_subscriber::EnvFilter;

#[derive(Clone, Debug)]
pub struct TelemetryConfig {
    pub service_name: String,
    pub log_filter: String,
    pub json_logs: bool,
}

impl TelemetryConfig {
    pub fn from_env(default_service_name: &str) -> Self {
        Self {
            service_name: std::env::var("SERVICE_NAME")
                .unwrap_or_else(|_| default_service_name.to_string()),
            log_filter: std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
            json_logs: read_bool_env("LOG_JSON").unwrap_or(false),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum TelemetryError {
    #[error("invalid log filter: {0}")]
    InvalidFilter(String),
    #[error("telemetry initialization failed: {0}")]
    Initialization(String),
    #[error("metrics registry already initialized")]
    MetricsAlreadyInitialized,
}

pub fn init_tracing(config: &TelemetryConfig) -> Result<(), TelemetryError> {
    let filter = EnvFilter::try_new(&config.log_filter)
        .map_err(|error| TelemetryError::InvalidFilter(error.to_string()))?;

    let result = if config.json_logs {
        tracing_subscriber::fmt()
            .with_env_filter(filter)
            .json()
            .try_init()
    } else {
        tracing_subscriber::fmt()
            .with_env_filter(filter)
            .compact()
            .try_init()
    };

    result.map_err(|error| TelemetryError::Initialization(error.to_string()))
}

pub fn service_span(config: &TelemetryConfig) -> Span {
    tracing::info_span!("service", service.name = %config.service_name)
}

pub fn openapi_docs_enabled() -> bool {
    read_bool_env("OPENAPI_DOCS_ENABLED").unwrap_or(false)
}

#[derive(Clone, Debug)]
pub struct MetricsHandle {
    requests: Counter,
    failures: Counter,
}

impl MetricsHandle {
    pub fn record_request(&self, status: StatusCode) {
        self.requests.inc();
        if status.is_server_error() {
            self.failures.inc();
        }
    }
}

struct MetricsState {
    registry: Registry,
    handle: MetricsHandle,
}

static METRICS: OnceLock<MetricsState> = OnceLock::new();

pub fn init_metrics(config: &TelemetryConfig) -> Result<MetricsHandle, TelemetryError> {
    let mut registry = Registry::with_prefix(config.service_name.replace('-', "_"));
    let requests = Counter::default();
    let failures = Counter::default();

    registry.register(
        "http_requests_total",
        "Total number of HTTP requests.",
        requests.clone(),
    );
    registry.register(
        "http_failures_total",
        "Total number of HTTP requests ending with a server error.",
        failures.clone(),
    );

    let handle = MetricsHandle { requests, failures };
    METRICS
        .set(MetricsState {
            registry,
            handle: handle.clone(),
        })
        .map_err(|_| TelemetryError::MetricsAlreadyInitialized)?;

    Ok(handle)
}

pub fn metrics() -> Option<&'static MetricsHandle> {
    METRICS.get().map(|state| &state.handle)
}

pub async fn metrics_handler() -> Response {
    let Some(state) = METRICS.get() else {
        return (StatusCode::SERVICE_UNAVAILABLE, "metrics unavailable").into_response();
    };

    let mut body = String::new();
    match encode(&mut body, &state.registry) {
        Ok(()) => (StatusCode::OK, body).into_response(),
        Err(error) => {
            tracing::error!(error = %error, "failed to encode metrics");
            (StatusCode::INTERNAL_SERVER_ERROR, "metrics encoding failed").into_response()
        }
    }
}

pub async fn http_request_metrics(request: Request, next: Next) -> Response {
    let method = request.method().clone();
    let path = request.uri().path().to_string();
    let started = Instant::now();
    let response = next.run(request).await;
    let status = response.status();

    if let Some(handle) = metrics() {
        handle.record_request(status);
    }

    tracing::info!(
        http.method = %method,
        http.path = %path,
        http.status_code = status.as_u16(),
        elapsed_ms = started.elapsed().as_millis(),
        "request completed"
    );

    response
}

fn read_bool_env(key: &str) -> Option<bool> {
    let value = std::env::var(key).ok()?;
    match value.trim().to_ascii_lowercase().as_str() {
        "1" | "true" | "yes" | "on" => Some(true),
        "0" | "false" | "no" | "off" => Some(false),
        _ => None,
    }
}
