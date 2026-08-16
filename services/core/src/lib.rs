#![forbid(unsafe_code)]

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct ServiceDescriptor {
    pub name: String,
    pub version: String,
    pub capabilities: Vec<String>,
}

impl ServiceDescriptor {
    pub fn current(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            capabilities: Vec::new(),
        }
    }

    pub fn with_capability(mut self, capability: impl Into<String>) -> Self {
        self.capabilities.push(capability.into());
        self
    }
}

#[derive(Clone, Debug)]
pub struct CoreConfig {
    pub environment: String,
}

impl CoreConfig {
    pub fn from_env() -> Self {
        Self {
            environment: std::env::var("APP_ENV").unwrap_or_else(|_| "development".to_string()),
        }
    }
}
