"use client";

import Logo from "./logo";
import Actions from "./actions";
import Room from "./room";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4">
          <Logo />
          <Room className="flex-1" />
          <Actions />
        </div>
      </div>
    </header>
  );
}
