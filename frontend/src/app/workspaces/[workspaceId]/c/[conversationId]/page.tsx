export default async function ConversationPage({
    params: _params,
}: {
    params: Promise<{ workspaceId?: string; conversationId?: string }>;
}) {
    await _params;
    return null;
}
