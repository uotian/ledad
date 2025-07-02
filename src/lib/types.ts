export interface WidgetTypes {
  className?: string;
}

export interface Message {
  user: string;
  timestamp: number;
  text?: string;
  translated?: string;
  status?:
    | "recording"
    | "converting"
    | "translating"
    | "success"
    | "recording error"
    | "converting error"
    | "translating error"
    | "completing error"
    | "error"
    | "completed";
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
