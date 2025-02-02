import { Timestamp } from "firebase/firestore";

export const parseFirebaseTimestamp = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
};
