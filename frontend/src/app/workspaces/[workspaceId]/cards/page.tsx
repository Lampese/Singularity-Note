export default async function CardsPage({
  params: _params,
}: {
  params: Promise<{ workspaceId?: string }>;
}) {
  await _params;
  return null;
}
