import { Timestamp } from "firebase/firestore";

export const parseFirebaseTimestamp = (timestamp?: Timestamp | Date): Date => {
  if (!timestamp) return new Date(); // Default ke waktu sekarang jika undefined
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }
  throw new Error("Invalid timestamp format"); // Menangani kasus tipe yang tidak valid
};
