import { Timestamp } from "firebase/firestore";

export type Message = {
  id: string;
  name: string;
  content?: string;
  senderId: string;
  timestamp: Timestamp;
  read: number | boolean;
  online?: boolean;
  lastMessage?: string;
};
