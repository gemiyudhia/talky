import { NextResponse } from "next/server";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase/init";
export async function POST(request: Request) {
  try {
    const { currentUserId, fromUserId, action } = await request.json();

    if (!currentUserId || !fromUserId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const currentUserRef = doc(db, "users", currentUserId);
    const requestUserRef = doc(db, "users", fromUserId);

    if (action === "accept") {
      // Update current user's friends and remove friend request
      await updateDoc(currentUserRef, {
        friends: arrayUnion(fromUserId),
        friendRequests: arrayRemove({
          fromUserId: fromUserId,
          status: "pending",
        }),
      });

      // Update requester's friends
      await updateDoc(requestUserRef, {
        friends: arrayUnion(currentUserId),
      });
    } else if (action === "reject") {
      // For rejection, remove the friend request
      await updateDoc(currentUserRef, {
        friendRequests: arrayRemove({
          fromUserId: fromUserId,
          status: "pending",
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing friend request:", error);
    return NextResponse.json(
      { error: "Failed to process friend request" },
      { status: 500 }
    );
  }
}
