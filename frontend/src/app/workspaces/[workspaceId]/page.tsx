export default async function WorkspacePage({
    params: _params,
}: {
    params: Promise<{ workspaceId?: string }>;
}) {
    await _params;
    return null;
}
