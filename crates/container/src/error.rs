#[derive(Debug, thiserror::Error)]
pub enum ContainerError {
    #[error("docker API error: {0}")]
    Docker(#[from] bollard::errors::Error),

    #[error("no containers available in pool")]
    PoolExhausted,

    #[error("container not found: {0}")]
    NotFound(String),

    #[error("command timed out after {0}ms")]
    Timeout(u64),

    #[error("container crashed: {0}")]
    Crashed(String),

    #[error("container is busy (agent run in progress)")]
    Busy,

    #[error("internal error: {0}")]
    Internal(String),
}

impl ContainerError {
    pub fn is_not_found(&self) -> bool {
        matches!(self, Self::NotFound(_))
            || matches!(
                self,
                Self::Docker(bollard::errors::Error::DockerResponseServerError {
                    status_code,
                    ..
                }) if *status_code == 404
            )
    }
}
