export interface WidgetTypes {
  className?: string;
}

export interface Message {
  id: string;
  user: string;
  text: string;
  translated?: string;
  datetime: string;
  status?: "processing" | "translating" | "success" | "error";
}

export interface Room {
  id: string;
  name: string;
}

export interface ChatHistory {
  id: string;
  prompt: string;
  response: string;
  datetime: string;
}
