"use client";

import { useState } from "react";
import { Button, Select } from "@mood-trip/ui";
import { ListFilterIcon } from "lucide-react";
import { TRIP_SORT_OPTIONS, type TripSort } from "./trip-sort";
import { useTripListContext } from "./trip-list-context";
import { DateRangePicker } from "@mood-trip/ui";

const TripFilter = () => {
  const { sort, setSort, dateRange, setDateRange } = useTripListContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex justify-between w-full">
        <div className="max-w-[150px] w-full">
          <Select 
            variant="border" 
            options={TRIP_SORT_OPTIONS.map((option) => ({ label: option.label, value: option.value }))} placeholder="Sort by" 
            rounded="lg" 
            value={sort}
            onValueChange={(value: TripSort) => setSort(value)}
          />
        </div>
        <Button 
          variant="outline" 
          rounded="full" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <ListFilterIcon className="size-4" />
          Filter
        </Button>
      </div>
      {isFilterOpen && (
        <div className="w-full max-w-[300px]">
          <DateRangePicker value={dateRange} onValueChange={setDateRange} />
        </div>
      )}
    </div>
  );
};

export default TripFilter;