import React, { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { supabase } from "../configs/supabaseConfig";
import api from "../configs/axiosConfig";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  const setAuth = useCallback((userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    setLoading(false); // Move this to after state updates
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check initial session first
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // If no session, stop loading and return early
          setLoading(false);
          return;
        }

        try {
          const { data } = await api.get("/api/auth/me");
          setAuth(data.user);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }

        // Set up auth state listener after initial check
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            try {
              const { data } = await api.get("/api/auth/me");
              setAuth(data.user);
            } catch (error) {
              console.error("Error fetching user data:", error);
              setUser(null);
              setIsAuthenticated(false);
            }
          }

          if (event === "SIGNED_OUT") {
            setUser(null);
            setIsAuthenticated(false);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false); // Ensure loading is set to false on error
      }
    };

    initializeAuth();
  }, [setAuth]);

  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/api/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/");
      setLoading(false);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout please try again");
      setLoading(false);
    }
  };

  // Only show loading spinner for initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, logout, loading, setAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
