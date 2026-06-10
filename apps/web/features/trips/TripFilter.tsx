"use client";

import { ButtonLink, Button, Select } from "@mood-trip/ui";
import { ListFilterIcon } from "lucide-react";

const TripFilter = () => {
  return (
    <div className="flex justify-between">
      <ButtonLink href="#" variant="accent">Add Trip</ButtonLink>
      <Button variant="ghost">
        <ListFilterIcon className="size-4" />
        Filter
      </Button>
    </div>
  );
};

export default TripFilter;