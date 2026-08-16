use std::time::Duration;

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ContainerState {
    Starting,
    Ready,
    Busy,
    Stopped,
    Failed,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct ExecRequest {
    pub command: Vec<String>,
    pub working_directory: Option<String>,
    pub timeout: Option<Duration>,
}

impl ExecRequest {
    pub fn new(command: impl IntoIterator<Item = impl Into<String>>) -> Self {
        Self {
            command: command.into_iter().map(Into::into).collect(),
            working_directory: None,
            timeout: None,
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct ExecResult {
    pub exit_code: Option<i64>,
    pub stdout: String,
    pub stderr: String,
    pub elapsed: Duration,
}

impl ExecResult {
    pub fn succeeded(&self) -> bool {
        self.exit_code == Some(0)
    }
}

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, Serialize, Deserialize)]
pub struct PoolStats {
    pub ready: usize,
    pub busy: usize,
    pub starting: usize,
    pub failed: usize,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct RuntimeDescriptor {
    pub image: String,
    pub state: ContainerState,
    pub created_for: String,
}
