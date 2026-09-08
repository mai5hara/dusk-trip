import EditMemories from './_components/EditMemories';

export default async function EditMemoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditMemories tripId={id} />;
}
