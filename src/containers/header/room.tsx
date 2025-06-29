"use client";

import { useEffect, useState } from "react";
import { getCurrentRoom } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import RoomDialog from "./room-dialog";

interface RoomProps {
  className?: string;
}

export default function Room({ className }: RoomProps) {
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);

  useEffect(() => {
    const updateRoomName = () => {
      const room = getCurrentRoom();
      if (room) {
        setCurrentRoom(room.name);
      }
    };

    updateRoomName();
    window.addEventListener("roomChange", updateRoomName);

    return () => {
      window.removeEventListener("roomChange", updateRoomName);
    };
  }, []);

  if (!currentRoom) return <div className={className}></div>;

  return (
    <>
      <div className={cn("flex items-center justify-center", className)}>
        <Badge
          variant="outline"
          className="px-6 text-xs font-medium bg-foreground/80 text-background cursor-pointer hover:bg-foreground/60"
          onClick={() => setRoomDialogOpen(true)}
        >
          {currentRoom}
        </Badge>
      </div>
      <RoomDialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen} />
    </>
  );
}
