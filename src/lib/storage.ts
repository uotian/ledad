"use client";

import { Message, Room, ChatHistory } from "@/lib/types";

// ------------------------------------------------------------
// langA
// ------------------------------------------------------------

export const langAMap: Record<string, string> = {
  en: "English",
  ja: "日本語",
};

export function getLangA(): string {
  return localStorage.getItem("langA") || Object.keys(langAMap)[0];
}

export function setLangA(value: string): void {
  localStorage.setItem("langA", value);
}

// ------------------------------------------------------------
// langB
// ------------------------------------------------------------

export const langBMap: Record<string, string> = {
  ja: "日本語",
  en: "English",
};

export function getLangB(): string {
  return localStorage.getItem("langB") || Object.keys(langBMap)[0];
}

export function setLangB(value: string): void {
  localStorage.setItem("langB", value);
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
  return localStorage.getItem("mainUser") || "B";
}

export function setMainUser(value: string): void {
  localStorage.setItem("mainUser", value);
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
  return localStorage.getItem("voice") || "alloy";
}

export function setVoice(value: string): void {
  localStorage.setItem("voice", value);
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
  return parseInt(localStorage.getItem("intervalSec") || "60");
}

export function setIntervalSec(value: string): void {
  localStorage.setItem("intervalSec", value);
}

// ------------------------------------------------------------
// room
// ------------------------------------------------------------

export function getRooms(): Room[] {
  return JSON.parse(localStorage.getItem("rooms") || "[]");
}

export function setRooms(rooms: Room[]): void {
  localStorage.setItem("rooms", JSON.stringify(rooms));
}

export function getCurrentRoomId(): string | null {
  return localStorage.getItem("currentRoomId");
}

export function setCurrentRoomId(roomId: string): void {
  localStorage.setItem("currentRoomId", roomId);
  window.dispatchEvent(new Event("roomChange"));
}

export function getCurrentRoom(): Room | null {
  const rooms = getRooms();
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return null;
  return rooms.find((room) => room.id === currentRoomId) || null;
}

export function createRoom(name: string): Room {
  const rooms = getRooms();
  const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newRoom: Room = { id, name };
  rooms.push(newRoom);
  setRooms(rooms);
  return newRoom;
}

export function deleteRoom(roomId: string): boolean {
  const rooms = getRooms();
  const roomsNew = rooms.filter((room) => room.id !== roomId);
  if (roomsNew.length !== rooms.length) {
    setRooms(roomsNew);
    if (getCurrentRoomId() === roomId) setCurrentRoomId("");
    localStorage.removeItem(`messages_${roomId}`);
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

export function getMessageMap(): Record<string, Message> {
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return {};
  const messages = localStorage.getItem(`messages_${currentRoomId}`);
  return messages ? JSON.parse(messages) : {};
}

export function getMessages(): Message[] {
  const messages = getMessageMap();
  return Object.values(messages).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

export function setMessageMap(messages: Record<string, Message>): void {
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return;
  localStorage.setItem(`messages_${currentRoomId}`, JSON.stringify(messages));
}

export function addMessage(message: Omit<Message, "id" | "datetime">): string {
  const messageMap = getMessageMap();
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const datetime = new Date().toISOString();
  messageMap[id] = { ...message, id, datetime };
  setMessageMap(messageMap);
  window.dispatchEvent(new Event("messages"));
  return id;
}

export function updateMessage(id: string, updates: Partial<Message>): void {
  const messageMap = getMessageMap();
  if (messageMap[id]) {
    messageMap[id] = { ...messageMap[id], ...updates };
    setMessageMap(messageMap);
    window.dispatchEvent(new Event("messages"));
  }
}

export function deleteMessage(id: string): boolean {
  const messageMap = getMessageMap();
  if (messageMap[id]) {
    delete messageMap[id];
    setMessageMap(messageMap);
    window.dispatchEvent(new Event("messages"));
    return true;
  }
  return false;
}

// ------------------------------------------------------------
// chat history
// ------------------------------------------------------------

export function getChatHistory(): ChatHistory[] {
  const chatHistory = localStorage.getItem("chatHistory");
  return chatHistory ? JSON.parse(chatHistory) : [];
}

export function setChatHistory(chatHistory: ChatHistory[]): void {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

export function addChatHistory(prompt: string, response: string): void {
  const chatHistory = getChatHistory();
  const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const datetime = new Date().toISOString();
  const newChat: ChatHistory = { id, prompt, response, datetime };
  chatHistory.push(newChat);
  setChatHistory(chatHistory);
}

export function clearChatHistory(): void {
  localStorage.removeItem("chatHistory");
}

export function deleteChatHistory(id: string): boolean {
  const chatHistory = getChatHistory();
  const filteredChatHistory = chatHistory.filter((chat) => chat.id !== id);
  if (filteredChatHistory.length !== chatHistory.length) {
    setChatHistory(filteredChatHistory);
    return true;
  }
  return false;
}

export function deleteRoomChatHistory(roomId: string): void {
  localStorage.removeItem(`chatHistory_${roomId}`);
}
