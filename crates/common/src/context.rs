use serde::{Deserialize, Serialize};

use crate::ids::TraceId;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TraceContext {
    pub trace_id: TraceId,
    pub request_id: Option<String>,
}

impl TraceContext {
    pub fn new(trace_id: TraceId) -> Self {
        Self {
            trace_id,
            request_id: None,
        }
    }
}
