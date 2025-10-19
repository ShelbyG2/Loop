import { useQuery } from "@tanstack/react-query";
import api from "../configs/axiosConfig";

interface Participant {
  _id: string;
  username: string;
  profilePic?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

export const useConversations = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<
    ConversationsResponse,
    Error
  >({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get("/api/conversations/userConversations");
      return response.data;
    },
  });

  return {
    conversations: data?.conversations ?? [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
};
