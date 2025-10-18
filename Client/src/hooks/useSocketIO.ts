import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL as string);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
