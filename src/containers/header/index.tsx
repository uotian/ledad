"use client";

import Logo from "./logo";
import Actions from "./actions";
import Info from "./info";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center">
          <Logo />
          <Info className="flex-1 flex justify-center" />
          <Actions />
        </div>
      </div>
    </header>
  );
}
