import EditAlbum from './_components/EditAlbum';

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditAlbum tripId={id} />;
}
