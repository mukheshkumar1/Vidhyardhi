import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust to specific domain in production
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Admin connected via socket:", socket.id);
  });
};

export const getIO = () => io;
