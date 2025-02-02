import { NextResponse } from "next/server";
import { sendMessage, subscribeToMessages } from "@/lib/firebase/service";

export async function POST(request: Request) {
  try {
    const { chatId, userId, content } = await request.json();

    if (!chatId || !userId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendMessage(chatId, userId, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();

    const unsubscribe = subscribeToMessages(userId, (messages) => {
      const data = `data: ${JSON.stringify(messages)}\n\n`;
      writer.write(new TextEncoder().encode(data));
    });

    writer.closed.finally(() => {
      unsubscribe();
    });

    return new Response(responseStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in message subscription:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to messages" },
      { status: 500 }
    );
  }
}
