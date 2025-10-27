import { useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { useConversations } from "../hooks/ConversationsQuery";
import { useChat } from "../hooks/useChat";
import { useSocket } from "../context/socketContext";

interface ParticipantType {
  id: string;
  username: string;
  profilePic: string;
}

interface LocationState {
  participant: ParticipantType;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

const ChatPage = () => {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { participant } = location.state as LocationState;
  const { refetch: invalidateConversations } = useConversations();
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Socket and Chat hooks
  const { isConnected } = useSocket();
  const {
    messages,
    isTyping,
    sendMessage: sendChatMessage,
    setTyping,
  } = useChat(conversationId as string);

  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBack = () => {
    navigate("/homepage");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    try {
      setIsSending(true);

      await sendChatMessage(messageInput.trim());

      setMessageInput("");
      invalidateConversations(); // Refresh conversations list
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (!isConnected) return;
    setTyping(typing);
  };

  // Render typing indicators
  const renderTypingIndicators = () => {
    return Object.entries(isTyping).map(([userId, isTyping]) => {
      if (userId !== user?.id && isTyping) {
        return (
          <div key={userId} className="text-sm text-gray-500 italic px-4">
            {participant.username} is typing...
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="bg-base-200 min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-md px-4">
        <div className="flex items-center space-x-4">
          <button onClick={handleBack} className="btn btn-ghost btn-circle">
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={
                  participant.profilePic ||
                  `https://ui-avatars.com/api/?name=${participant.username}`
                }
                alt={`${participant.username}'s profile`}
                className="w-10 h-10 rounded-full"
              />
              {isConnected && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h2 className="font-semibold">{participant.username}</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat ${
                msg.sender === user?.id ? "chat-end" : "chat-start"
              }`}
            >
              <div
                className={`chat-bubble ${
                  msg.sender === user?.id ? "chat-bubble-primary" : ""
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {renderTypingIndicators()}
          <div ref={messageEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="p-4 bg-base-100">
        {!isConnected && (
          <div className="text-red-500 text-sm text-center mb-2">
            Disconnected from server. Reconnecting...
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-primary outline-none flex-1"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="btn btn-circle btn-soft btn-primary text-white"
            disabled={!messageInput.trim() || !isConnected || isSending}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
