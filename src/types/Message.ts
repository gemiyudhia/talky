import { Timestamp } from "firebase/firestore";

export type Message = {
  id: string;
  name: string;
  content?: string;
  senderId: string;
  timestamp: Timestamp | Date; // Menerima kedua jenis timestamp
  read: boolean;
  online?: boolean;
  lastMessage?: string;
  isTemp?: boolean; // Tambahan field untuk identifikasi message temporary
};
