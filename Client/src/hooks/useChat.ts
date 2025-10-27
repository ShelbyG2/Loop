import { useState, useEffect, useCallback } from "react";
import { socketService } from "../services/socketService";
import { useSocket } from "../context/socketContext";

export const useChat = (conversationId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const { isConnected } = useSocket();

  useEffect(() => {
    if (isConnected && conversationId) {
      socketService.joinConversation(conversationId);

      socketService.onMessageReceive((message) => {
        setMessages((prev) => [...prev, message]);
      });

      socketService.onUserTyping(({ userId, isTyping: typing }) => {
        setIsTyping((prev) => ({ ...prev, [userId]: typing }));
      });

      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected]);

  const sendMessage = useCallback(
    (content: string) => {
      socketService.sendMessage({
        conversationId,
        content,
      });
    },
    [conversationId]
  );

  const setTyping = useCallback(
    (typing: boolean) => {
      socketService.setTypingStatus(conversationId, typing);
    },
    [conversationId]
  );

  return {
    messages,
    isTyping,
    sendMessage,
    setTyping,
  };
};
