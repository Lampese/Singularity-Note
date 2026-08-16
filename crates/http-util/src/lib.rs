#![forbid(unsafe_code)]

pub mod cors;
pub mod error;

pub use cors::{allowed_origins_from_env, CorsConfigError};
pub use error::{api_error, ApiErrorBody, ApiErrorEnvelope};
