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

export const useConversations = () => {
  const {
    data: conversations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Conversation[], Error>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get("/api/conversations/getConvo");
      return response.data;
    },
  });

  return {
    conversations,
    isLoading,
    isError,
    error,
    refetch,
  };
};
