import { getTrips } from "@/features/trips/api";
import TripList from "@/features/trips/TripList";

export default async function Home() {
  const trips = await getTrips('cf36d455-0f95-4075-81e9-8d1b38262b22');

  return (
    <div className="bg-surface">
      <main className="">
        <TripList initialTrips={trips} />
      </main>
    </div>
  );
}
