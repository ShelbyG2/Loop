import { User } from "../models/User.model.js";
import supabase from "../config/supabaseConfig.js";
import { createError } from "../utils/errorUtils.js";
import {
  setTokenCookie,
  setRefreshTokenCookie,
  clearCookies,
} from "../utils/cookieUtils.js";

// Validation helper
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

export const Signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password)
      return res.status(400).json({ message: "all fileds are required" });
    const existingUserName = await User.find({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    console.log(existingUserName);
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

export const SignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      throw createError(400, "Email and password are required");
    }

    if (!validateEmail(email)) {
      throw createError(400, "Invalid email format");
    }

    // Authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw createError(401, error.message);
    }

    // Find user in MongoDB
    const user = await User.findOne({ supabaseId: data.user.id })
      .select("-__v")
      .lean();

    if (!user) {
      throw createError(404, "User account not found");
    }

    // Set auth cookies
    setTokenCookie(res, data.session.access_token, data.session.expires_in);
    setRefreshTokenCookie(res, data.session.refresh_token);

    // Send response
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    next(error);
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

export const handleOAuth = async (req, res, next) => {
  try {
    const { access_token, refresh_token, provider } = req.body;

    if (!access_token || !provider) {
      throw createError(400, "Missing authentication details");
    }

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(access_token);

    if (authError) {
      throw createError(401, "Invalid authentication token");
    }

    // Find or create user
    let dbUser = await User.findOneAndUpdate(
      { supabaseId: user.id },
      {
        $setOnInsert: {
          username: user.user_metadata.full_name || user.email.split("@")[0],
          email: user.email,
          isVerified: true,
          profilePic: user.user_metadata.avatar_url || null,
        },
      },
      {
        new: true,
        upsert: true,
        lean: true,
      }
    );

    // Set cookies
    setTokenCookie(res, access_token, 3600);
    if (refresh_token) {
      setRefreshTokenCookie(res, refresh_token);
    }

    // Send response
    res.status(200).json({
      status: "success",
      message: "Authentication successful",
      user: {
        id: dbUser._id,
        email: dbUser.email,
        username: dbUser.username,
        isVerified: dbUser.isVerified,
        profilePic: dbUser.profilePic,
      },
    });
  } catch (error) {
    next(error);
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
