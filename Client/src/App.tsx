import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/authPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/homePage";
import { Toaster } from "react-hot-toast";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { AuthProvider } from "./context/AuthContextProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ChatPage from "./pages/ChatPage";
const queryClient = new QueryClient();
function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className="w-full">
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/verification" element={<AuthCallbackPage />} />

            <Route
              path="/homepage"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:conversationId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
