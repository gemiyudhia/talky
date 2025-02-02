import { NextResponse } from "next/server";
import { subscribeToMessages } from "@/lib/firebase/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  try {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();

    const unsubscribe = subscribeToMessages(chatId, (messages) => {
      const data = `data: ${JSON.stringify(messages)}\n\n`;
      writer.write(new TextEncoder().encode(data));
    });

    // Handle closure to unsubscribe when the client disconnects
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
    console.error("Error subscribing to messages:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to messages" },
      { status: 500 }
    );
  }
}
