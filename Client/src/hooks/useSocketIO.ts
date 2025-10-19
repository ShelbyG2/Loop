import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/useAuth";

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

export const useSocketIO = () => {
  const socketRef =
    useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();
  const { user, getToken } = useAuth();

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getToken();

      if (!token || !user) return;

      socketRef.current = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Connection event handlers
      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    };

    connectSocket();
  }, [user, getToken]);

  return socketRef.current;
};
