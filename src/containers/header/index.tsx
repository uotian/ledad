"use client";

import Logo from "./logo";
import Actions from "./actions";
import Room from "./room";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Header({ sidebarOpen, toggleSidebar }: HeaderProps) {
  return (
    <header className="absolute top-0 left-4 right-4 z-50">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4">
          <Logo />
          <Room className="flex-1" />
          <Actions sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
      </div>
    </header>
  );
}
