import React, { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
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
    setLoading(false);
  }, []);

  useEffect(() => {
    const authRoutes = ["/", "/verification"];

    if (!authRoutes.includes(location.pathname)) {
      const fetchUser = async () => {
        try {
          const { data } = await api.get("/api/auth/me");
          setUser(data.user);
          setIsAuthenticated(true);
        } catch (error) {
          setUser(null);
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoadingSpinner size="lg" />
      </div>
    );
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, logout, loading, setAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
