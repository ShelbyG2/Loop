import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/useAuth";

export const useSocket = () => {
  const socketRef = useRef<Socket>();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socketRef.current.emit("authenticate", user.token);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return socketRef.current;
};
