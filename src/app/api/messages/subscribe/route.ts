import { subscribeToMessages } from "@/lib/firebase/service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // Send an initial heartbeat
    writer.write(encoder.encode(": heartbeat\n\n"));

    const unsubscribe = subscribeToMessages(chatId, async (messages) => {
      try {
        // Send the actual message data
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(messages)}\n\n`)
        );

        // Send a heartbeat after each message
        await writer.write(encoder.encode(": heartbeat\n\n"));
      } catch (error) {
        console.error("Error writing to stream:", error);
      }
    });

    // Handle connection closure
    request.signal.addEventListener("abort", () => {
      unsubscribe();
      writer.close();
    });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Error subscribing to messages:", error);
    writer.close();
    return NextResponse.json(
      { error: "Failed to subscribe to messages" },
      { status: 500 }
    );
  }
}
