use observability::{init_metrics, init_tracing, service_span, TelemetryConfig};
use svc_agent::WorkerConfig;
use tracing::Instrument;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let telemetry = TelemetryConfig::from_env("svc-agent-worker");
    init_metrics(&telemetry)?;
    init_tracing(&telemetry)?;
    svc_agent::run_worker(WorkerConfig::from_env())
        .instrument(service_span(&telemetry))
        .await?;
    Ok(())
}
