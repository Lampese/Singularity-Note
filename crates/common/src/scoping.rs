use serde::{Deserialize, Serialize};

use crate::ids::{ActorId, WorkspaceId};

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Role {
    Student,
    Instructor,
    Admin,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Actor {
    pub actor_id: ActorId,
    pub workspace_id: WorkspaceId,
    pub role: Role,
}

pub trait WorkspaceScoped {
    fn workspace_id(&self) -> WorkspaceId;
}

impl WorkspaceScoped for Actor {
    fn workspace_id(&self) -> WorkspaceId {
        self.workspace_id
    }
}
