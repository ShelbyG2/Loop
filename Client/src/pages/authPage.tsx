import React, { useState } from "react";

import googleIcon from "@src/assets/google-icon.png";
import { Lock, Mail, Eye, User } from "lucide-react";
import toast from "react-hot-toast";

import { LoadingSpinner } from "../components/LoadingSpinner";
import LoopIcon from "../assets/loop-icon.png";
import api from "../configs/axiosConfig";
import { supabase } from "../configs/supabaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AuthPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (!email || !password || !username) {
        toast.error("all fields are required");
        setLoading(false);
        return;
      }
      if (confirmPassword !== password) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      const res = await api.post("/api/auth/register", {
        password,
        email,
        username,
      });

      if (!res) {
        toast.error("please check you connection ");
      }
      toast.success("Success. Please check your email for verification ");
      setSignUpMode(true);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Internal server errror");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast.error("All fields are required");
        return;
      }

      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      if (res.data && res.data.user) {
        setAuth(res.data.user);
        toast.success("Signed in successfully");

        navigate("/homepage");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred during sign in please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/verification`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 w-full">
      <header className="navbar bg-base-100 shadow-md px-4">
        <div className="flex items-center w-full justify-center">
          <img
            src={LoopIcon}
            alt="Loop Icon"
            className="w-12 h-12 rounded-lg mr-4"
          />
          <h1 className="text-2xl font-bold">Loop</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {!signUpMode ? (
            <form
              className="bg-base-100 rounded-box p-8 shadow-lg space-y-6"
              onSubmit={handleEmailSignIn}
            >
              <h2 className="text-2xl font-bold text-center">Welcome Back</h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full pl-10 focus:outline-primary focus-within:ring-2 focus-within:ring-primary focus:border-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pl-10 focus:outline-primary focus-within:ring-2 focus-within:ring-primary focus:border-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Eye className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="label cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text ml-2">Remember me</span>
                </label>
                <a href="#" className="link link-primary text-sm">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <div className="divider">OR</div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn btn-outline w-full gap-2"
                disabled={loading}
              >
                <img src={googleIcon} alt="Google logo" className="h-5 w-5" />
                Continue with Google
              </button>

              <p className="text-center text-sm">
                Don't have an account?{" "}
                <a
                  onClick={() => setSignUpMode(true)}
                  className="link link-primary"
                >
                  Sign up
                </a>
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleEmailSignUp}
              className="bg-base-100 rounded-box p-8 shadow-lg space-y-6"
            >
              <h2 className="text-2xl font-bold text-center">Welcome </h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full pl-10 focus:outline-primary focus-within:ring-2 focus-within:ring-primary focus:border-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="input input-bordered w-full pl-10 focus:outline-primary focus-within:ring-2 focus-within:ring-primary focus:border-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pl-10 focus:outline-primary focus-within:ring-2 focus-within:ring-primary focus:border-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Eye className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="input input-bordered w-full pl-10 focus:outline-primary focus-within:ring-2 focus-within:ring-primary focus:border-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    <Eye className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="label cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text ml-2">Remember me</span>
                </label>
                <a href="#" className="link link-primary text-sm">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>

              <div className="divider">OR</div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn btn-outline w-full gap-2"
                disabled={loading}
              >
                <img src={googleIcon} alt="Google logo" className="h-5 w-5" />
                Continue with Google
              </button>

              <p className="text-center text-sm">
                Already have an account?{" "}
                <a
                  onClick={() => setSignUpMode(false)}
                  className="link link-primary"
                >
                  Sign in
                </a>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
