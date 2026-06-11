"use client";

import { Button, Select } from "@mood-trip/ui";
import { ListFilterIcon } from "lucide-react";

const TripFilter = () => {
  return (
    <div className="flex justify-between">
      <div className="max-w-[150px] w-full">
        <Select variant="border" options={[]} placeholder="Sort by" rounded="lg" />
      </div>
      <Button variant="ghost">
        <ListFilterIcon className="size-4" />
        Filter
      </Button>
    </div>
  );
};

export default TripFilter;