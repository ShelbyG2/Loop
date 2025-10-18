import { useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/useAuth";
import { useConversations } from "../hooks/ConversationsQuery";

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
  const socket = io(import.meta.env.VITE_API_URL as string);
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { participant } = location.state as LocationState;
  const { invalidateConversations } = useConversations();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for messages from other users
    socket.on("message", (serverMessage) => {
      // Only add the message if it's from the other user
      if (serverMessage.sender !== user?.id) {
        setMessages((prevMessages) => [...prevMessages, serverMessage]);
      }
    });

    // Listen for messages from server
    socket.on("messageReceived", (serverMessage) => {
      if (serverMessage.conversation === conversationId) {
        setMessages((prevMessages) => [...prevMessages, serverMessage]);
      }
    });

    // Listen for message errors
    socket.on("messageError", (error) => {
      console.error("Message error:", error);
      // You could add toast notification here
    });

    // Listen for conversation updates
    socket.on("conversationUpdated", (data) => {
      if (data.conversationId === conversationId) {
        invalidateConversations(); // Refresh conversations list
      }
    });

    return () => {
      socket.off("message");
      socket.off("messageReceived");
      socket.off("messageError");
      socket.off("conversationUpdated");
    };
  }, [socket, user?.id, conversationId, invalidateConversations]);

  const handleBack = () => {
    navigate("/homepage");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      const messageData = {
        sender: user?.id,
        receiver: participant.id,
        content: message.trim(),
        conversationId,
      };

      // Update local messages immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...messageData,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ]);

      // Emit message to socket
      socket.emit("message", messageData);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen w-full flex flex-col">
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
            </div>
            <div>
              <h2 className="font-semibold">{participant.username}</h2>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          <div className="chat chat-end">
            <div className="chat-bubble chat-bubble-primary">
              Hi there! How are you?
            </div>
          </div>
          <div className="chat chat-start">
            <div className="chat-bubble">I'm doing great, thanks!</div>
          </div>
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
          <div ref={messageEndRef} />
        </div>
      </main>

      <footer className="p-4 bg-base-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-primary outline-none flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-circle btn-soft btn-primary text-white"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
