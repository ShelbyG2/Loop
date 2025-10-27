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

interface SocketError {
  message: string;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private readonly SOCKET_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

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
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    this.socket.connect();

    return this.socket;
  }

  private async handleAuthError() {
    try {
      // Attempt to verify/refresh authentication
      const isValid = await cookieService.verifyAuth();
      if (isValid && !this.socket?.connected) {
        // Retry connection if auth is valid but socket is disconnected
        this.socket?.connect();
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      // Maybe trigger a logout or auth refresh
      window.dispatchEvent(new CustomEvent("auth:required"));
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.reconnectAttempts = 0;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        this.handleAuthError();
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("force_disconnect", (data: { reason: string }) => {
      console.log("Forced disconnection:", data.reason);
      this.disconnect();
    });

    this.socket.on("error", (error: SocketError) => {
      console.error("Socket error:", error.message);
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
