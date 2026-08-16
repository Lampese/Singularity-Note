use axum::http::StatusCode;
use axum::Json;
use common::ids::TraceId;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ApiErrorBody<'a> {
    pub code: &'a str,
    pub message: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trace_id: Option<TraceId>,
}

#[derive(Debug, Serialize)]
pub struct ApiErrorEnvelope<'a> {
    pub error: ApiErrorBody<'a>,
}

pub fn api_error(
    status: StatusCode,
    code: &'static str,
    message: &'static str,
    trace_id: TraceId,
) -> (StatusCode, Json<ApiErrorEnvelope<'static>>) {
    (
        status,
        Json(ApiErrorEnvelope {
            error: ApiErrorBody {
                code,
                message,
                trace_id: Some(trace_id),
            },
        }),
    )
}
