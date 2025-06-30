"use client";

import { useEffect, useState } from "react";
import { getCurrentRoom } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import RoomDialog from "./room-dialog";
import NoteDialog from "./note-dialog";
import { Notebook } from "lucide-react";

interface RoomProps {
  className?: string;
}

export default function Room({ className }: RoomProps) {
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

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
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <Badge
          variant="outline"
          className="px-6 text-xs font-medium bg-foreground/80 text-background cursor-pointer hover:bg-foreground/60"
          onClick={() => setRoomDialogOpen(true)}
        >
          {currentRoom}
        </Badge>
        <div
          className="bg-foreground/80 text-background p-1 px-2 rounded-md cursor-pointer hover:bg-foreground/60"
          onClick={() => setNoteDialogOpen(true)}
        >
          <Notebook className="w-3 h-3" />
        </div>
      </div>
      <RoomDialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen} />
      <NoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} />
    </>
  );
}
