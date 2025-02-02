import { NextResponse } from "next/server";
import { subscribeToMessages } from "@/lib/firebase/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  try {
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Kirim heartbeat awal untuk memastikan koneksi terbuka
    writer.write(encoder.encode(`: ${new Date().toISOString()}\n\n`));

    const unsubscribe = subscribeToMessages(chatId, async (messages) => {
      try {
        // Kirim data pesan
        const data = `data: ${JSON.stringify(messages)}\n\n`;
        await writer.write(encoder.encode(data));

        // Kirim heartbeat setelah setiap pesan
        await writer.write(encoder.encode(`: ${new Date().toISOString()}\n\n`));
      } catch (writeError) {
        console.error("Error writing to stream:", writeError);
      }
    });

    // Handle ketika koneksi ditutup
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
    console.error("Error in SSE setup:", error);
    return NextResponse.json(
      { error: "Failed to setup message subscription" },
      { status: 500 }
    );
  }
}
