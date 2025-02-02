import { NextResponse } from "next/server";
import { handleFriendRequests } from "@/lib/firebase/service";

export async function POST(request: Request) {
  try {
    const { currentUserId, userId, action } = await request.json();

    if (!currentUserId || !userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await handleFriendRequests(currentUserId, userId, action);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling friend request:", error);
    return NextResponse.json(
      { error: "Failed to handle friend request" },
      { status: 500 }
    );
  }
}
