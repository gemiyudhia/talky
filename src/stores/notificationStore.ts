import { create } from "zustand";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/init";

type FriendRequest = {
  fromUserId: string;
  status: "pending" | "accepted" | "rejected";
};

type NotificationStore = {
  pendingFriendRequests: FriendRequest[];
  startListeningToFriendRequests: (userId: string) => () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  pendingFriendRequests: [],

  startListeningToFriendRequests: (userId) => {
    const userDocRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      const userData = doc.data();
      const pendingRequests = (userData?.friendRequests || []).filter(
        (req: FriendRequest) => req.status === "pending"
      );

      set({ pendingFriendRequests: pendingRequests });
    });

    return unsubscribe;
  },
}));
