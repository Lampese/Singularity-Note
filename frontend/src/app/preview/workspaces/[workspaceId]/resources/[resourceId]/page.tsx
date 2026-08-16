import { ResourcePreviewPageClient } from "./ResourcePreviewPageClient";

export default async function ResourcePreviewPage({
    params,
}: {
    params: Promise<{ workspaceId?: string; resourceId?: string }>;
}) {
    const { workspaceId: rawWorkspaceId, resourceId: rawResourceId } = await params;
    const workspaceId = rawWorkspaceId ?? "";
    const resourceId = rawResourceId ?? "";

    if (!workspaceId || !resourceId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center text-text-muted">
                无效的预览地址
            </div>
        );
    }

    return (
        <ResourcePreviewPageClient
            workspaceId={workspaceId}
            resourceId={resourceId}
        />
    );
}
