import { Server as NetServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { NextResponse } from "next/server";
import type { Message } from "@/types/Message";

// Deklarasi type untuk global.io
declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined;
}

const ioHandler = () => {
  if (!globalThis.io) {
    const httpServer = new NetServer();
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-chat", (chatId: string) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
      });

      socket.on("leave-chat", (chatId: string) => {
        socket.leave(chatId);
        console.log(`User left chat: ${chatId}`);
      });

      socket.on("send-message", (data: Message) => {
        io.to(data.id).emit("new-message", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    globalThis.io = io;
  }

  return new NextResponse(null, { status: 200 });
};

export const GET = ioHandler;
export const POST = ioHandler;
