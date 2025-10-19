import { io, Socket } from "socket.io-client";
import { cookieService } from "./cookieService";

interface ServerToClientEvents {
  "user:status": (data: { userId: string; isOnline: boolean }) => void;
  "message:receive": (data: any) => void;
  "user:typing": (data: { userId: string; isTyping: boolean }) => void;
  "conversation:update": (data: any) => void;
  "notification:new": (data: any) => void;
}

interface ClientToServerEvents {
  "message:send": (data: any) => void;
  "typing:start": (data: { conversationId: string }) => void;
  "typing:stop": (data: { conversationId: string }) => void;
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private readonly SOCKET_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  connect() {
    if (this.socket?.connected) return;

    if (!cookieService.isAuthenticated()) {
      console.warn("Socket connection failed: User not authenticated");
      return;
    }

    this.socket = io(this.SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    this.socket.connect();

    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }

  joinConversation(conversationId: string) {
    this.socket?.emit("conversation:join", conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit("conversation:leave", conversationId);
  }

  sendMessage(data: any) {
    this.socket?.emit("message:send", data);
  }

  setTypingStatus(conversationId: string, isTyping: boolean) {
    this.socket?.emit(isTyping ? "typing:start" : "typing:stop", {
      conversationId,
    });
  }

  onMessageReceive(callback: (message: any) => void) {
    this.socket?.on("message:receive", callback);
  }

  onUserTyping(
    callback: (data: { userId: string; isTyping: boolean }) => void
  ) {
    this.socket?.on("user:typing", callback);
  }

  onUserStatus(
    callback: (data: { userId: string; isOnline: boolean }) => void
  ) {
    this.socket?.on("user:status", callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
