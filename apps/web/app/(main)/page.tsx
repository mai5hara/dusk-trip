import TripList from './_components/TripList';

export default async function Home() {
  return (
    <div className="bg-surface">
      <main>
        <TripList />
      </main>
    </div>
  );
}
