import { createContext, useContext } from "react";

interface SocketContextType {
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: any) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
