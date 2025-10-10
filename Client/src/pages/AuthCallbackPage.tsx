import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../configs/supabaseConfig";
import api from "../configs/axiosConfig";
import StateCard from "../components/StateCard";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/useAuth";

type Status = "loading" | "error" | "success";

const AuthCallbackPage = () => {
  const [status, setStatus] = useState<Status>("loading");
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const emailToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (type === "signup" && emailToken) {
          const response = await api.post("api/auth/verify-email", {
            token: emailToken,
          });

          if (response.status === 200) {
            toast.success("Email verified successfully!");
            setStatus("success");
            setTimeout(() => navigate("/homepage"), 2000);
          } else {
            throw new Error("Email verification failed");
          }
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.access_token) {
          const response = await api.post("api/auth/oauth", {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            provider: session.user.app_metadata.provider,
          });

          if (response.status === 200) {
            toast.success("Signed in successfully!");
            setStatus("success");
            setAuth(response.data.user);
            setTimeout(() => navigate("/homepage"), 2000);
          } else {
            throw new Error("OAuth verification failed");
          }
        } else {
          throw new Error("No session found");
        }
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Authentication failed");
        setStatus("error");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <StateCard state={status} />
    </div>
  );
};

export default AuthCallbackPage;
