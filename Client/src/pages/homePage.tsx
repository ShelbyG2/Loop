import { useContext, useState } from "react";
import LoopIcon from "../assets/loop-icon.png";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { Plus, X } from "lucide-react";
import api from "../configs/axiosConfig";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../hooks/ConversationsQuery";

interface User {
  _id: string;
  username: string;
  profilePic: string;
  lastSeen: string;
}

const HomePage = () => {
  const { logout } = useContext(AuthContext);
  const [isopen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  // Use the conversations query hook
  const {
    conversations,
    isLoading: conversationsLoading,
    isError,
    error,
  } = useConversations();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/users");
      setUsers(data.users);
      setIsOpen(true);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickedUser = async (selectedUser: User) => {
    try {
      const response = await api.post("/api/conversations/createConvo", {
        participant: selectedUser._id,
      });
      const conversationId = response.data.conversationId;

      navigate(`/chat/${conversationId}`, {
        state: {
          participant: {
            id: selectedUser._id,
            username: selectedUser.username,
            profilePic: selectedUser.profilePic,
          },
        },
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };
  return (
    <div className="bg-base-200 min-h-screen w-full">
      <header className="navbar bg-base-100 shadow-md px-4">
        <div className="flex items-center w-full justify-center">
          <img
            src={LoopIcon}
            alt="Loop Icon"
            className="w-12 h-12 rounded-lg mr-4"
          />
          <h1 className="text-2xl font-bold">Conversations</h1>
        </div>
        <button className="btn btn-soft btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="container mx-auto p-4">
        {conversationsLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="alert alert-error">
            <p>{error?.message || "Failed to load conversations"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations?.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                (p) => p._id !== conversation.participants[0]._id
              );

              return (
                <div
                  key={conversation._id}
                  className="flex items-center bg-base-100 p-4 rounded-lg shadow-md hover:bg-base-200 cursor-pointer transition-colors"
                  onClick={() => {
                    navigate(`/chat/${conversation._id}`, {
                      state: {
                        participant: {
                          id: otherParticipant?._id,
                          username: otherParticipant?.username,
                          profilePic: otherParticipant?.profilePic,
                        },
                      },
                    });
                  }}
                >
                  <div className="relative">
                    <img
                      src={
                        otherParticipant?.profilePic ||
                        `https://ui-avatars.com/api/?name=${otherParticipant?.username}`
                      }
                      alt={otherParticipant?.username}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">
                        {otherParticipant?.username}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <button
        className="fixed bottom-6 right-6 btn btn-primary btn-circle shadow-lg"
        onClick={fetchUsers}
      >
        {isLoading ? <LoadingSpinner /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Users Modal */}
      {isopen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Start a Conversation</h3>
              <button
                className="btn btn-ghost btn-circle"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-gray-500">No users found</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center p-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        handleClickedUser(user);
                      }}
                    >
                      <div className="relative">
                        <img
                          src={
                            user.profilePic ||
                            `https://ui-avatars.com/api/?name=${user.username}`
                          }
                          alt={user.username}
                          className="w-12 h-12 rounded-full"
                        />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold">{user.username}</h4>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs text-gray-500">
                          {user.lastSeen}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
