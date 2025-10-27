import supabase from "../config/supabaseConfig.js";
import { User } from "../models/User.model.js";
import { createError } from "../utils/errorUtils.js";
import { authCache } from "../utils/cacheUtils.js";

export const verifyToken = async (token) => {
  try {
    const cacheKey = generateCacheKey(token);
    const cachedUser = authCache.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      throw error;
    }

    if (!user) {
      return null;
    }

    authCache.set(cacheKey, user);
    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    console.log("Auth Token:", token); // Debug log
    console.log("Cookies received:", req.cookies); // Debug log
    console.log("Headers:", req.headers); // Debug log

    if (!token) {
      throw createError(401, "Authentication token missing");
    }

    const supabaseUser = await verifyToken(token);

    if (!supabaseUser) {
      throw createError(401, "Invalid or expired authentication token");
    }

    const user = await User.findOne(
      { supabaseId: supabaseUser.id },
      { _id: 1, username: 1, email: 1, lastSeen: 1, avatar: 1 }
    )
      .lean()
      .exec();

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error); // Debug log
    next(createError(401, error?.message || "Authentication failed"));
  }
};

const extractToken = (req) => {
  const cookieToken = req.cookies?.auth_token;
  if (!cookieToken) {
    return null;
  }
  return cookieToken;
};
const setAuthHeaders = (res) => {
  res.set({
    "Cache-Control": " private, no-cache, no-store, must-revalidate",
    Expires: " -1",
    Pragma: " no-cache",
  });
};
const generateCacheKey = (token) => {
  return `auth:token:${token.slice(-12)}`;
};
