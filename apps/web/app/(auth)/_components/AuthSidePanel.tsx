// Brand panel beside the auth forms; hidden below md, where the form takes the full width.
export function AuthSidePanel() {
  return (
    <div className="hidden flex-1 items-center justify-center bg-accent px-12 text-white md:flex">
      <div className="flex max-w-sm flex-col gap-4">
        <p className="font-mono text-4xl font-medium">Dusk Trip</p>
        <p className="text-xl">Keep every trip, day by day.</p>
        <p className="text-sm opacity-80">
          Turn your travel photos into albums by day and time of day, and plan
          the next trip with an AI itinerary built around your mood.
        </p>
      </div>
    </div>
  );
}
