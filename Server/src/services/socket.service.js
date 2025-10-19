import { Server } from "socket.io";
import { verifyToken } from "../middleware/authMiddleware.js";

class SocketService {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map();
  }
  initialize(server) {
    this.io = new Server(server, {
      cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
    });
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await verifyToken(token);
        socket.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.setupEventHandlers();
  }
  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
      this.handleUserStatus(socket);
      this.handleMessages(socket);
      this.handleConversations(socket);
      this.handleDisconnection(socket);
    });
  }
  handleConnection(socket) {
    const userId = socket.user._id;
    this.onlineUsers.set(userId, socket.id);
    this.broadcastUserStatus(userId, true);
  }

  handleUserStatus(socket) {
    socket.on("user:typing", ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit("emit:typing", {
        userId: socket.user._id,
        isTyping,
      });
    });
  }
  handleMessages(socket) {
    socket.on("message:send", async (message) => {
      const receiverId = message.receiver;
      const receiverSocketId = this.onlineUsers.get(receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit("message:receive", message);
      }
      this.io.to(message.conversationId).emit("conversation:update", {
        conversationId: message.conversationId,
        lastMessage: message,
      });
    });
    socket.on("message:read", async ({ messageId, conversationId }) => {
      socket.to(conversationId).emit("message:read:update", { messageId });
    });
  }
  handleConversations(socket) {
    socket.on("conversation:join", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(conversationId);
    });
  }

  handleDisconnection(socket) {
    socket.on("disconnect", () => {
      const userId = socket.user._id;
      this.onlineUsers.delete(userId);
      this.broadcastUserStatus(userId, false);
    });
  }
  broadcastUserStatus(userId, isOnline) {
    this.io.emit("user:status", { userId, isOnline });
  }
  emitNotification(userId, notification) {
    const socketId = this.onlineUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("notification:new", notification);
    }
  }

  emitConversationUpdate(conversationId, update) {
    this.io.to(conversationId).emit("conversation:update", update);
  }
}

const socketService = new SocketService();
export default socketService;
