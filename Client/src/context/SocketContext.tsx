import { ReactNode, useEffect, useState } from "react";
import { socketService } from "../services/socketService";
import { useAuth } from "./useAuth";
import { SocketContext } from "./socketContext";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = socketService.connect();

      socket?.on("connect", () => {
        setIsConnected(true);
      });

      socket?.on("disconnect", () => {
        setIsConnected(false);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const value = {
    isConnected,
    joinConversation: socketService.joinConversation.bind(socketService),
    leaveConversation: socketService.leaveConversation.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    setTypingStatus: socketService.setTypingStatus.bind(socketService),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
