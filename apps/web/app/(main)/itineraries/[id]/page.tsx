import SavedItineraryView from '../_components/SavedItineraryView';

type SavedItineraryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SavedItineraryPage({
  params,
}: SavedItineraryPageProps) {
  const { id } = await params;
  return <SavedItineraryView id={id} />;
}
