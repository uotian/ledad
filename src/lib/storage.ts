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

export function getLang(): string {
  const lang = localStorage.getItem("lang");
  if (lang) return lang;

  // SSR時はデフォルト値を返す
  if (typeof window === "undefined") return Object.keys(langMap)[0];

  const browserLang = navigator.language.slice(0, 2);
  if (browserLang in langMap) return browserLang;
  return Object.keys(langMap)[0];
}

export function setLang(value: string): void {
  localStorage.setItem("lang", value);
}

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
// intervalSec1
// ------------------------------------------------------------

export const intervalSecMap1: Record<string, string> = {
  "10": "10秒",
  "30": "30秒",
  "60": "60秒",
};

export function getIntervalSec1(): number {
  return parseInt(localStorage.getItem("intervalSec1") || "10");
}

export function setIntervalSec1(value: string): void {
  localStorage.setItem("intervalSec1", value);
}

// ------------------------------------------------------------
// intervalSec2
// ------------------------------------------------------------

export const intervalSecMap2: Record<string, string> = {
  "60": "60秒",
  "120": "120秒",
  "240": "240秒",
};

export function getIntervalSec2(): number {
  return parseInt(localStorage.getItem("intervalSec2") || "240");
}

export function setIntervalSec2(value: string): void {
  localStorage.setItem("intervalSec2", value);
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
    localStorage.removeItem(`chatHistory_${roomId}`);
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
  return Object.values(messages).sort((a, b) => a.timestamp - b.timestamp);
}

export function setMessageMap(messages: Record<string, Message>): void {
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return;
  localStorage.setItem(`messages_${currentRoomId}`, JSON.stringify(messages));
}

export function addMessage(message: Message): string {
  const messageMap = getMessageMap();
  const id = `${message.user}_${message.timestamp}`;
  messageMap[id] = message;
  setMessageMap(messageMap);
  window.dispatchEvent(new Event("messages"));
  return id;
}

function mergeText(text1: string | undefined, text2: string | undefined): string | undefined {
  if (text1 === undefined) return text2;
  if (text2 === undefined) return text1;
  return text1 + "\n" + text2;
}

export function updateMessage(id: string, message: Partial<Message>): void {
  // id: string, status: Message["status"], text2?: string, translated2?: string): void {
  const messageMap = getMessageMap();
  const message0 = messageMap[id];
  if (message0 && message0.status !== "completed") {
    message.text = mergeText(message0.text, message.text);
    message.translated = mergeText(message0.translated, message.translated);
    messageMap[id] = { ...message0, ...message };
    setMessageMap(messageMap);
    window.dispatchEvent(new Event("messages"));
  }
}

export function replaceMessage(id: string, message: Partial<Message>): void {
  const messageMap = getMessageMap();
  const message0 = messageMap[id];
  if (message0) {
    messageMap[id] = { ...message0, ...message };
    setMessageMap(messageMap);
    window.dispatchEvent(new Event("messages"));
  }
}

export function deleteMessage(id: string): void {
  const messageMap = getMessageMap();
  if (messageMap[id]) {
    delete messageMap[id];
    setMessageMap(messageMap);
    window.dispatchEvent(new Event("messages"));
  }
}

// ------------------------------------------------------------
// chat history
// ------------------------------------------------------------

export function getChatHistory(): ChatHistory[] {
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return [];
  const chatHistory = localStorage.getItem(`chatHistory_${currentRoomId}`);
  return chatHistory ? JSON.parse(chatHistory) : [];
}

export function setChatHistory(chatHistory: ChatHistory[]): void {
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return;
  localStorage.setItem(`chatHistory_${currentRoomId}`, JSON.stringify(chatHistory));
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
  const currentRoomId = getCurrentRoomId();
  if (!currentRoomId) return;
  localStorage.removeItem(`chatHistory_${currentRoomId}`);
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
