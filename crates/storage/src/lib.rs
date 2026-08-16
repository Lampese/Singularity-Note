#![forbid(unsafe_code)]
#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

mod client;

pub use client::{
    ObjectByteStream, ObjectStorageClient, StorageConfig, StorageError, DEFAULT_PRESIGN_EXPIRY_SECS,
};
