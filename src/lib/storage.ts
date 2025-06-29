// ------------------------------------------------------------
// langA
// ------------------------------------------------------------

export const langAMap: Record<string, string> = {
  en: "English",
  ja: "日本語",
};

export function getLangA(): string {
  if (typeof window !== "undefined") return localStorage.getItem("langA") || Object.keys(langAMap)[0];
  return Object.keys(langAMap)[0];
}

export function setLangA(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("langA", value);
}

// ------------------------------------------------------------
// langB
// ------------------------------------------------------------

export const langBMap: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

export function getLangB(): string {
  if (typeof window !== "undefined") return localStorage.getItem("langB") || Object.keys(langBMap)[0];
  return Object.keys(langBMap)[0];
}

export function setLangB(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("langB", value);
}

// ------------------------------------------------------------
// lang common
// ------------------------------------------------------------

export const langMap: Record<string, string> = { ...langAMap, ...langBMap };

// ------------------------------------------------------------
// mainUser
// ------------------------------------------------------------

export const mainUserMap: Record<string, string> = {
  A: "A",
  B: "B",
};

export function getMainUser(): string {
  if (typeof window !== "undefined") return localStorage.getItem("mainUser") || "?";
  return Object.keys(mainUserMap)[0];
}

export function setMainUser(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("mainUser", value);
}

// ------------------------------------------------------------
// voice
// ------------------------------------------------------------

export const voiceMap: Record<string, string> = {
  alloy: "Alloy (中性的)",
  echo: "Echo (男性的)",
  fable: "Fable (物語的)",
  onyx: "Onyx (深い声)",
  nova: "Nova (女性的)",
  shimmer: "Shimmer (明るい声)",
};

export function getVoice(): string {
  if (typeof window !== "undefined") return localStorage.getItem("voice") || "alloy";
  return Object.keys(voiceMap)[0];
}

export function setVoice(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("voice", value);
}

// ------------------------------------------------------------
// intervalSec
// ------------------------------------------------------------

export const intervalSecMap: Record<string, string> = {
  "10": "10秒",
  "30": "30秒",
  "60": "60秒",
};

export function getIntervalSec(): number {
  if (typeof window !== "undefined") return parseInt(localStorage.getItem("intervalSec") || "60");
  return 60;
}

export function setIntervalSec(value: string): void {
  if (typeof window !== "undefined") localStorage.setItem("intervalSec", value);
}

// ------------------------------------------------------------
// room
// ------------------------------------------------------------

export interface Room {
  id: string;
  name: string;
}

export function getRooms(): Room[] {
  if (typeof window !== "undefined") {
    const rooms = localStorage.getItem("rooms");
    return rooms ? JSON.parse(rooms) : [];
  }
  return [];
}

export function setRooms(rooms: Room[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }
}

export function getCurrentRoomId(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("currentRoomId");
  return null;
}

export function setCurrentRoomId(roomId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("currentRoomId", roomId);
    window.dispatchEvent(new Event("roomChange"));
  }
}

export function getCurrentRoom(): Room | null {
  const rooms = getRooms();
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return null;
  return rooms.find((room) => room.id === currentRoomId) || null;
}

export function createRoom(name: string): Room {
  const rooms = getRooms();
  const newRoom: Room = {
    id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
  };

  rooms.push(newRoom);
  setRooms(rooms);
  return newRoom;
}

export function deleteRoom(roomId: string): boolean {
  const rooms = getRooms();
  const filteredRooms = rooms.filter((room) => room.id !== roomId);

  if (filteredRooms.length !== rooms.length) {
    setRooms(filteredRooms);

    // 現在のルームが削除された場合、nullにセット
    if (getCurrentRoomId() === roomId) {
      setCurrentRoomId("");
    }

    // ルームのメッセージも削除
    if (typeof window !== "undefined") {
      localStorage.removeItem(`messages_${roomId}`);
    }

    return true;
  }

  return false;
}

export function updateRoom(roomId: string, updates: Partial<Room>): boolean {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex((room) => room.id === roomId);

  if (roomIndex !== -1) {
    rooms[roomIndex] = { ...rooms[roomIndex], ...updates };
    setRooms(rooms);
    return true;
  }

  return false;
}

// ------------------------------------------------------------
// messages
// ------------------------------------------------------------

export interface Message {
  id: string;
  user: string;
  text: string;
  translated?: string;
  datetime: string;
  status?: "processing" | "success" | "error";
}

export function getMessages(): Record<string, Message> {
  if (typeof window !== "undefined") {
    const currentRoomId = getCurrentRoomId();
    if (!currentRoomId) return {};
    return JSON.parse(localStorage.getItem(`messages_${currentRoomId}`) || "{}");
  }
  return {};
}

export function setMessages(messages: Record<string, Message>): void {
  if (typeof window !== "undefined") {
    const currentRoomId = getCurrentRoomId();
    if (!currentRoomId) return;
    localStorage.setItem(`messages_${currentRoomId}`, JSON.stringify(messages));
  }
}

export function clearMessages(): void {
  if (typeof window !== "undefined") {
    const currentRoomId = getCurrentRoomId();
    if (!currentRoomId) return;
    localStorage.setItem(`messages_${currentRoomId}`, "{}");
    window.dispatchEvent(new Event("messages"));
  }
}

export function addMessage(message: Omit<Message, "id" | "datetime">): string {
  if (typeof window !== "undefined") {
    const currentRoomId = getCurrentRoomId();
    if (!currentRoomId) return "";
    const messages = getMessages();
    const datetime = new Date().toISOString();
    const id = `${message.user}_${datetime}:${Math.random().toString(36).substr(2, 9)}`;
    const status = message.status || "processing";
    messages[id] = { ...message, id, datetime, status };
    setMessages(messages);
    window.dispatchEvent(new Event("messages"));
    return id;
  }
  return "";
}

export function updateMessage(id: string, updates: Partial<Message>): void {
  if (typeof window !== "undefined") {
    const messages = getMessages();
    if (messages[id]) {
      messages[id] = { ...messages[id], ...updates };
      setMessages(messages);
      window.dispatchEvent(new Event("messages"));
    }
  }
}

export function deleteMessage(id: string): boolean {
  if (typeof window !== "undefined") {
    const messages = getMessages();
    if (messages[id]) {
      delete messages[id];
      setMessages(messages);
      window.dispatchEvent(new Event("messages"));
      return true;
    }
  }
  return false;
}
