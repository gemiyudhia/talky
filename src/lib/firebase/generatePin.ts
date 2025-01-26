import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { app } from "./init";

const firestore = getFirestore(app);

export const generateUniquePin = async (): Promise<string> => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pin = "";

  for (let i = 0; i < 6; i++) {
    pin += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const q = query(collection(firestore, "users"), where("pin", "==", pin));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return generateUniquePin();
  }

  return pin;
};
