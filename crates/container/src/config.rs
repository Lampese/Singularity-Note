use std::time::Duration;

const MEBIBYTE: u64 = 1024 * 1024;
const DEFAULT_MEMORY_LIMIT_MB: u64 = 512;
const DEFAULT_DISK_LIMIT_MB: u64 = 512;
const DEFAULT_IDLE_REMOVE_SECS: u64 = 1200;
const DEFAULT_IDLE_SCAN_SECS: u64 = 60;
const DEFAULT_WORKSPACE_VOLUME_PREFIX: &str = "singularity-note-workspace-";

#[derive(Debug, Clone)]
pub struct ContainerConfig {
    pub image: String,
    pub pool_min_size: usize,
    pub pool_max_size: usize,
    pub cpu_limit: f64,
    pub memory_limit_bytes: u64,
    pub disk_limit_bytes: Option<u64>,
    pub default_timeout: Duration,
    pub network: Option<String>,
    pub idle_remove: Option<Duration>,
    pub idle_scan_interval: Duration,
    pub workspace_volume_prefix: String,
}

impl Default for ContainerConfig {
    fn default() -> Self {
        Self {
            image: "singularity-note-workspace:latest".to_string(),
            pool_min_size: 2,
            pool_max_size: 50,
            cpu_limit: 1.0,
            memory_limit_bytes: DEFAULT_MEMORY_LIMIT_MB * MEBIBYTE,
            disk_limit_bytes: Some(DEFAULT_DISK_LIMIT_MB * MEBIBYTE),
            default_timeout: Duration::from_secs(30),
            network: None,
            idle_remove: Some(Duration::from_secs(DEFAULT_IDLE_REMOVE_SECS)),
            idle_scan_interval: Duration::from_secs(DEFAULT_IDLE_SCAN_SECS),
            workspace_volume_prefix: DEFAULT_WORKSPACE_VOLUME_PREFIX.to_string(),
        }
    }
}

impl ContainerConfig {
    pub fn from_env() -> Self {
        let mut config = Self::default();
        if let Ok(image) = std::env::var("CONTAINER_IMAGE") {
            config.image = image;
        }
        if let Ok(min) = std::env::var("CONTAINER_POOL_MIN") {
            if let Ok(n) = min.parse() {
                config.pool_min_size = n;
            }
        }
        if let Ok(max) = std::env::var("CONTAINER_POOL_MAX") {
            if let Ok(n) = max.parse() {
                config.pool_max_size = n;
            }
        }
        if let Ok(mem) = std::env::var("CONTAINER_MEMORY_LIMIT_MB") {
            if let Ok(n) = mem.parse::<u64>() {
                config.memory_limit_bytes = n * MEBIBYTE;
            }
        }
        if let Ok(cpu) = std::env::var("CONTAINER_CPU_LIMIT") {
            if let Ok(n) = cpu.parse() {
                config.cpu_limit = n;
            }
        }
        if let Ok(net) = std::env::var("CONTAINER_NETWORK") {
            config.network = Some(net);
        }
        if let Ok(secs) = std::env::var("CONTAINER_IDLE_REMOVE_SECS") {
            if let Ok(n) = secs.parse::<u64>() {
                config.idle_remove = if n == 0 {
                    None
                } else {
                    Some(Duration::from_secs(n))
                };
            }
        }
        if let Ok(secs) = std::env::var("CONTAINER_IDLE_SCAN_SECS") {
            if let Ok(n) = secs.parse::<u64>() {
                config.idle_scan_interval = Duration::from_secs(n.max(1));
            }
        }
        if let Ok(prefix) = std::env::var("CONTAINER_WORKSPACE_VOLUME_PREFIX") {
            let trimmed = prefix.trim();
            if !trimmed.is_empty() {
                config.workspace_volume_prefix = trimmed.to_string();
            }
        }
        config
    }
}
