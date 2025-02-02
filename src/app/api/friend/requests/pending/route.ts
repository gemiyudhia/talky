import { NextResponse } from "next/server";
import { fetchPendingFriendRequests } from "@/lib/firebase/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const requests = await fetchPendingFriendRequests({ userId });
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 }
    );
  }
}
