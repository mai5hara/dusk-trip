import TripDetails from './_components/TripDetails';

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripDetails tripId={id} />;
}
