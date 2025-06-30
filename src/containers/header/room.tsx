"use client";

import { useEffect, useState } from "react";
import { getCurrentRoom } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import RoomDialog from "./room-dialog";
import NoteDialog from "./note-dialog";
import { Notebook } from "lucide-react";
import { WidgetTypes } from "@/lib/types";

export default function Room({ className }: WidgetTypes) {
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  useEffect(() => {
    const updateRoomName = () => {
      const room = getCurrentRoom();
      if (room) {
        setCurrentRoom(room.name);
      } else {
        alert("ルームが存在しません。");
        setRoomDialogOpen(true);
      }
    };

    updateRoomName();
    window.addEventListener("roomChange", updateRoomName);

    return () => {
      window.removeEventListener("roomChange", updateRoomName);
    };
  }, []);

  return (
    <div className={className}>
      {currentRoom ? (
        <div className={cn("flex items-center justify-center gap-1")}>
          <Badge
            variant="outline"
            className="px-2 text-xs font-medium bg-foreground/80 text-background cursor-pointer hover:bg-foreground/60 max-w-16 sm:max-w-64 truncate"
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
      ) : (
        <div className={className}></div>
      )}
      <RoomDialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen} />
      <NoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} />
    </div>
  );
}
