"use client";

import Link from "next/link";
import { Button } from "@mood-trip/ui";
import { SearchIcon, GlobeIcon, UserIcon } from "lucide-react";

const Header = () => {
  return (
    <header className="shrink-0 py-4 flex justify-between items-center">
      <Link href="/" className="flex-1">Map View</Link>
      <h1 className="flex-1 text-center">Mood-Trip</h1>
      <div className="flex-1 flex gap-6 justify-end">
        <Button variant="ghost" size="icon">
          <SearchIcon className="size-5"/>
        </Button>
        <Button variant="ghost" size="icon">
          <GlobeIcon className="size-5"/>
        </Button>
        <Button variant="accent" size="icon">
          <UserIcon className="size-5 text-white"/>
        </Button>
      </div>
    </header>
  );
};

export default Header;