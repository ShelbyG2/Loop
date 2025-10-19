import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { socketService } from "../services/socketService";
import { useAuth } from "./useAuth";

interface SocketContextType {
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: any) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

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

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
