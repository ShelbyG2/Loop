import { Server } from "socket.io";
import { SocketAuthMiddleware } from "./middleware/socketAuth.js";
import { MessageHandler } from "./handlers/messageHandler.js";

class SocketService {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map();
  }
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
      cookie: {
        name: "auth_token",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      },
    });
    this.messageHandler = new MessageHandler(this.io, this.onlineUsers);
    this.io.use(SocketAuthMiddleware);
    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      this.messageHandler.handle(socket);
    });
  }
}

const socketService = new SocketService();
export default socketService;
