import { NextResponse } from "next/server";
import { createNewChat } from "@/lib/firebase/service";

export async function POST(request: Request) {
  try {
    const { userId, friendId } = await request.json();

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: "User ID and Friend ID are required" },
        { status: 400 }
      );
    }

    const chatId = await createNewChat(userId, friendId);
    return NextResponse.json({ chatId });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
