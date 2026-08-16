import WorkspaceClient from "./WorkspaceClient";

export default async function WorkspaceLayout({
  params,
}: {
  params: Promise<{ workspaceId?: string }>;
}) {
  // Await params to satisfy Next.js
  const { workspaceId } = await params;

  if (!workspaceId) {
    return (
      <div className="p-8 text-center">
        <p>无效的工作区 ID</p>
      </div>
    );
  }

  return <WorkspaceClient workspaceId={workspaceId} />;
}
