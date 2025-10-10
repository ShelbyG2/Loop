import { User } from "../models/User.model.js";
import supabase from "../config/supabaseConfig.js";
import jwt from "jsonwebtoken";
import {
  setTokenCookie,
  setRefreshTokenCookie,
  clearCookies,
} from "../utils/cookieUtils.js";

export const Signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password)
      return res.status(400).json({ message: "all fileds are required" });
    const existingUserName = await User.find({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    if (existingUserName)
      return res.status(400).json({ message: "Username already taken" });
    const { data: existingUser, error: searchError } =
      await supabase.auth.admin.listUsers({
        filter: `email eq '${email}'`,
      });

    if (searchError) {
      console.error("Supabase search error:", searchError);
      return res
        .status(500)
        .json({ message: "Error checking email existence" });
    }

    if (existingUser && existingUser.users.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      username,
      password,
    });
    if (authError) return res.status(400).json({ message: authError.message });
    const supabaseUser = authData.user;

    try {
      const user = await User.create({
        username: username,
        email: supabaseUser.email,
        supabaseId: supabaseUser.id,
        isVerified: false,
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      });
    } catch (dbError) {
      console.error("MongoDB error:", dbError);

      await supabase.auth.admin.deleteUser(supabaseUser.id);

      throw new Error("Failed to create user profile");
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error during signup" || error.message,
    });
  }
};

export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase auth error:", error);
      return res.status(401).json({ message: error.message });
    }

    console.log("Supabase auth successful");

    const user = await User.findOne({ supabaseId: data.user.id });

    if (!user) {
      console.error("User not found in MongoDB");
      return res.status(404).json({ message: "User not found" });
    }

    setTokenCookie(res, data.session.access_token, data.session.expires_in);
    setRefreshTokenCookie(res, data.session.refresh_token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const EmailVerification = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Missing access token",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

      if (!decoded) {
        return res.status(403).json({
          message: "Invalid token format",
        });
      }

      const isEmailVerified =
        decoded.user_metadata?.email_verified ||
        decoded.email_verified ||
        false;

      if (!isEmailVerified) {
        return res.status(403).json({
          message: "Email not verified yet",
        });
      }

      const supabaseUserId = decoded.sub;

      const updatedUser = await User.findOneAndUpdate(
        { supabaseId: supabaseUserId },
        { isVerified: true },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found in database",
        });
      }

      res.status(200).json({
        message: "Email verified successfully",
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          isVerified: updatedUser.isVerified,
        },
      });
      setTokenCookie(res, data.session.access_token, data.session.expires_in);
      setRefreshTokenCookie(res, data.session.refresh_token);
      return;
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return res.status(403).json({
        message: "Invalid token",
        error: tokenError.message,
      });
    }
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const handleOAuth = async (req, res) => {
  try {
    const { access_token, refresh_token, provider } = req.body;

    if (!access_token || !provider) {
      return res.status(400).json({
        message: "Missing authentication details",
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(access_token);

    if (authError) {
      console.error("Supabase OAuth error:", authError);
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    let dbUser = await User.findOne({ supabaseId: user.id });

    if (!dbUser) {
      dbUser = await User.create({
        username: user.user_metadata.full_name || user.email.split("@")[0],
        email: user.email,
        supabaseId: user.id,
        isVerified: true,
        profilePic: null,
      });
      await dbUser.save();
    }
    setTokenCookie(res, access_token, 3600);
    if (refresh_token) {
      setRefreshTokenCookie(res, refresh_token);
    }
    res.status(200).json({
      message: "Authentication successful",
      user: {
        id: dbUser._id,
        email: dbUser.email,
        username: dbUser.username,
        isVerified: dbUser.isVerified,
        profilePic: dbUser.profilePic,
      },
    });

    return;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

export const Logout = async (req, res) => {
  try {
    const authToken = req.cookies.auth_token;
    if (authToken) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase signout error:", error);
        throw new Error("Failed to signout from authentication service ");
      }
    }
    clearCookies(res);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    clearCookies(res);
    return res.status(500).json({
      message: "Error during logout, but cookies have been cleared",
      error: error.message,
      success: false,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};
