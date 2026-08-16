use bytes::Bytes;
use futures_util::stream::BoxStream;
use futures_util::StreamExt;
use s3::bucket::Bucket;
use s3::creds::Credentials;
use s3::region::Region;
use std::error::Error as StdError;
use std::time::Duration;

pub const DEFAULT_PRESIGN_EXPIRY_SECS: u32 = 3600;
const S3_OP_TIMEOUT: Duration = Duration::from_secs(60);

pub type ObjectByteStream = BoxStream<'static, Result<Bytes, StorageError>>;

#[derive(Debug, thiserror::Error)]
pub enum StorageError {
    #[error("S3 put object failed: {0}")]
    PutObject(String),

    #[error("S3 get object failed: {0}")]
    GetObject(String),

    #[error("S3 delete object failed: {0}")]
    DeleteObject(String),

    #[error("S3 presign failed: {0}")]
    Presign(String),

    #[error("S3 head object failed: {0}")]
    HeadObject(String),

    #[error("S3 initialization failed: {0}")]
    Init(String),
}

#[derive(Clone, Debug)]
pub struct StorageConfig {
    pub endpoint: String,
    pub bucket: String,
    pub access_key: String,
    pub secret_key: String,
    pub region: String,
    pub path_style: bool,
}

impl StorageConfig {
    pub fn from_env() -> Result<Self, StorageError> {
        Ok(Self {
            endpoint: std::env::var("S3_ENDPOINT")
                .unwrap_or_else(|_| "http://127.0.0.1:9000".to_string()),
            bucket: read_required_env("S3_BUCKET")?,
            access_key: read_required_env("S3_ACCESS_KEY")?,
            secret_key: read_required_env("S3_SECRET_KEY")?,
            region: std::env::var("S3_REGION").unwrap_or_else(|_| "us-east-1".to_string()),
            path_style: std::env::var("S3_PATH_STYLE")
                .map(|v| v == "true" || v == "1")
                .unwrap_or(true),
        })
    }
}

fn read_required_env(key: &'static str) -> Result<String, StorageError> {
    match std::env::var(key) {
        Ok(value) => {
            let trimmed = value.trim();
            if trimmed.is_empty() {
                return Err(StorageError::Init(format!("{key} is required")));
            }
            Ok(trimmed.to_string())
        }
        Err(std::env::VarError::NotPresent) => {
            Err(StorageError::Init(format!("{key} is required")))
        }
        Err(err) => Err(StorageError::Init(format!("failed to read {key}: {err}"))),
    }
}

/// Thin wrapper around an S3-compatible object storage client.
/// Works with MinIO, AWS S3, Cloudflare R2, Aliyun OSS, etc.
#[derive(Clone, Debug)]
pub struct ObjectStorageClient {
    bucket: Box<Bucket>,
}

impl ObjectStorageClient {
    pub fn new(config: StorageConfig) -> Result<Self, StorageError> {
        let credentials = Credentials::new(
            Some(&config.access_key),
            Some(&config.secret_key),
            None,
            None,
            None,
        )
        .map_err(|e| StorageError::Init(e.to_string()))?;

        Self::from_bucket_config(config, credentials)
    }

    pub fn new_anonymous(config: StorageConfig) -> Result<Self, StorageError> {
        let credentials =
            Credentials::anonymous().map_err(|e| StorageError::Init(e.to_string()))?;

        Self::from_bucket_config(config, credentials)
    }

    fn from_bucket_config(
        config: StorageConfig,
        credentials: Credentials,
    ) -> Result<Self, StorageError> {
        let region = Region::Custom {
            region: config.region,
            endpoint: config.endpoint,
        };

        let mut bucket = Bucket::new(&config.bucket, region, credentials)
            .map_err(|e| StorageError::Init(e.to_string()))?;

        if config.path_style {
            bucket.set_path_style();
        }

        Ok(Self { bucket })
    }

    /// Upload bytes to the given object key.
    pub async fn put_bytes(
        &self,
        key: &str,
        content_type: &str,
        data: &[u8],
    ) -> Result<(), StorageError> {
        let response = tokio::time::timeout(
            S3_OP_TIMEOUT,
            self.bucket
                .put_object_with_content_type(key, data, content_type),
        )
        .await
        .map_err(|_| {
            StorageError::PutObject(format!(
                "S3 upload timed out after {}s: key={key}, content_type={content_type}, bytes={}",
                S3_OP_TIMEOUT.as_secs(),
                data.len()
            ))
        })?
        .map_err(|e| {
            StorageError::PutObject(format!(
                "key={key}, content_type={content_type}, bytes={}, error={}",
                data.len(),
                format_error_chain(&e)
            ))
        })?;

        let status = response.status_code();
        if (200..300).contains(&status) {
            tracing::debug!(key, status, "object uploaded");
            Ok(())
        } else {
            Err(StorageError::PutObject(format!(
                "unexpected status {status}"
            )))
        }
    }

    /// Download the full content of an object.
    pub async fn get_bytes(&self, key: &str) -> Result<Vec<u8>, StorageError> {
        let response = tokio::time::timeout(S3_OP_TIMEOUT, self.bucket.get_object(key))
            .await
            .map_err(|_| StorageError::GetObject("S3 download timed out".to_string()))?
            .map_err(|e| StorageError::GetObject(e.to_string()))?;

        let status = response.status_code();
        if (200..300).contains(&status) {
            Ok(response.to_vec())
        } else {
            Err(StorageError::GetObject(format!(
                "unexpected status {status}"
            )))
        }
    }

    /// Stream object bytes without buffering the whole object in memory.
    pub async fn get_byte_stream(&self, key: &str) -> Result<ObjectByteStream, StorageError> {
        let response = tokio::time::timeout(S3_OP_TIMEOUT, self.bucket.get_object_stream(key))
            .await
            .map_err(|_| StorageError::GetObject("S3 download stream timed out".to_string()))?
            .map_err(|e| StorageError::GetObject(e.to_string()))?;

        let status = response.status_code;
        if (200..300).contains(&status) {
            Ok(response
                .bytes
                .map(|chunk| chunk.map_err(|e| StorageError::GetObject(e.to_string())))
                .boxed())
        } else {
            Err(StorageError::GetObject(format!(
                "unexpected status {status}"
            )))
        }
    }

    /// Check if an object exists and return its size in bytes.
    pub async fn head_object(&self, key: &str) -> Result<Option<u64>, StorageError> {
        match self.bucket.head_object(key).await {
            Ok((head, status)) => {
                if (200..300).contains(&status) {
                    Ok(Some(head.content_length.unwrap_or(0) as u64))
                } else if status == 404 {
                    Ok(None)
                } else {
                    Err(StorageError::HeadObject(format!(
                        "unexpected status {status}"
                    )))
                }
            }
            Err(error) => Err(StorageError::HeadObject(error.to_string())),
        }
    }

    /// Delete an object from storage. Returns `Ok(true)` if the object was
    /// deleted and `Ok(false)` when the object did not exist.
    pub async fn delete_object(&self, key: &str) -> Result<bool, StorageError> {
        let response = tokio::time::timeout(S3_OP_TIMEOUT, self.bucket.delete_object(key))
            .await
            .map_err(|_| StorageError::DeleteObject("S3 delete timed out".to_string()))?
            .map_err(|e| StorageError::DeleteObject(e.to_string()))?;

        let status = response.status_code();
        if status == 204 || status == 200 {
            tracing::debug!(key, status, "object deleted");
            Ok(true)
        } else if status == 404 {
            tracing::debug!(key, status, "object not found, nothing to delete");
            Ok(false)
        } else {
            Err(StorageError::DeleteObject(format!(
                "unexpected status {status}"
            )))
        }
    }

    /// Generate a presigned GET URL for the given key.
    pub async fn presign_get(
        &self,
        key: &str,
        expires_in_secs: Option<u32>,
    ) -> Result<String, StorageError> {
        let expiry = expires_in_secs.unwrap_or(DEFAULT_PRESIGN_EXPIRY_SECS);

        let url = self
            .bucket
            .presign_get(key, expiry, None)
            .await
            .map_err(|e| StorageError::Presign(e.to_string()))?;

        Ok(url)
    }

    /// Generate a presigned PUT URL for uploading.
    pub async fn presign_put(
        &self,
        key: &str,
        expires_in_secs: Option<u32>,
        content_type: Option<&str>,
    ) -> Result<String, StorageError> {
        let expiry = expires_in_secs.unwrap_or(DEFAULT_PRESIGN_EXPIRY_SECS);

        let custom_headers = content_type.map(|ct| {
            let mut h = std::collections::HashMap::new();
            h.insert("Content-Type".to_string(), ct.to_string());
            h
        });

        let url = self
            .bucket
            .presign_put(key, expiry, None, custom_headers)
            .await
            .map_err(|e| StorageError::Presign(e.to_string()))?;

        Ok(url)
    }

    pub fn bucket_name(&self) -> &str {
        &self.bucket.name
    }

    /// List all object keys under a given prefix.
    pub async fn list_objects(&self, prefix: &str) -> Result<Vec<String>, StorageError> {
        let results = self
            .bucket
            .list(prefix.to_string(), None)
            .await
            .map_err(|e| StorageError::GetObject(format!("list objects failed: {e}")))?;

        let mut keys = Vec::new();
        for result in results {
            for object in result.contents {
                keys.push(object.key);
            }
        }
        Ok(keys)
    }

    /// Delete all objects under a given prefix.
    /// Deletes concurrently for better performance.
    pub async fn delete_prefix(&self, prefix: &str) -> Result<usize, StorageError> {
        let keys = self.list_objects(prefix).await?;
        if keys.is_empty() {
            return Ok(0);
        }
        let futs: Vec<_> = keys.iter().map(|key| self.delete_object(key)).collect();
        let results = futures_util::future::join_all(futs).await;
        let mut deleted = 0;
        let mut failed = 0;
        for result in &results {
            match result {
                Ok(_) => deleted += 1,
                Err(e) => {
                    failed += 1;
                    tracing::warn!(error = %e, prefix, "failed to delete object in prefix batch")
                }
            }
        }
        if failed > 0 {
            return Err(StorageError::DeleteObject(format!(
                "failed to delete {failed} object(s) under prefix {prefix}"
            )));
        }
        Ok(deleted)
    }
}

fn format_error_chain(error: &(dyn StdError + 'static)) -> String {
    let mut parts = vec![error.to_string()];
    let mut source = error.source();
    while let Some(error) = source {
        parts.push(format!("caused by: {error}"));
        source = error.source();
    }
    parts.join("; ")
}
