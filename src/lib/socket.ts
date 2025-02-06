import { io as createSocketIOClient, type Socket } from "socket.io-client";

let socket: Socket;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = createSocketIOClient(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      {
        path: "/api/socket",
      }
    );
  }
  return socket;
};
export { Socket };
