use axum::http::HeaderValue;
use thiserror::Error;
use tower_http::cors::AllowOrigin;

const DEFAULT_ORIGINS_ENV: &str = "API_CORS_ALLOWED_ORIGINS";

#[derive(Debug, Error)]
pub enum CorsConfigError {
    #[error("required env `API_CORS_ALLOWED_ORIGINS` is missing or empty")]
    MissingEnv { var: &'static str },
    #[error("invalid CORS origin value: {0}")]
    InvalidOrigin(String),
}

pub fn allowed_origins_from_env() -> Result<AllowOrigin, CorsConfigError> {
    let raw = std::env::var(DEFAULT_ORIGINS_ENV).map_err(|_| CorsConfigError::MissingEnv {
        var: DEFAULT_ORIGINS_ENV,
    })?;
    parse_origins(Some(raw.as_str()))
}

fn parse_origins(raw: Option<&str>) -> Result<AllowOrigin, CorsConfigError> {
    let raw = raw.map(str::trim).filter(|value| !value.is_empty()).ok_or(
        CorsConfigError::MissingEnv {
            var: DEFAULT_ORIGINS_ENV,
        },
    )?;

    let mut parsed = Vec::new();
    for origin in raw.split(',') {
        let trimmed = origin.trim();
        if trimmed.is_empty() {
            continue;
        }
        let value = HeaderValue::from_str(trimmed)
            .map_err(|_| CorsConfigError::InvalidOrigin(trimmed.to_string()))?;
        parsed.push(value);
    }

    if parsed.is_empty() {
        return Err(CorsConfigError::MissingEnv {
            var: DEFAULT_ORIGINS_ENV,
        });
    }

    Ok(AllowOrigin::list(parsed))
}
