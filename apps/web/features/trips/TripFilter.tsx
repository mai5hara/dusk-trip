"use client";

import { Button, Select } from "@mood-trip/ui";
import { ListFilterIcon } from "lucide-react";
import { TRIP_SORT_OPTIONS, type TripSort } from "./trip-sort";
import { useTripListContext } from "./trip-list-context";

const TripFilter = () => {
  const { sort, setSort } = useTripListContext();

  return (
    <div className="flex justify-between">
      <div className="max-w-[150px] w-full">
        <Select 
          variant="border" 
          options={TRIP_SORT_OPTIONS.map((option) => ({ label: option.label, value: option.value }))} placeholder="Sort by" 
          rounded="lg" 
          value={sort}
          onValueChange={(value: TripSort) => setSort(value)}
        />
      </div>
      <Button variant="outline" rounded="full">
        <ListFilterIcon className="size-4" />
        Filter
      </Button>
    </div>
  );
};

export default TripFilter;