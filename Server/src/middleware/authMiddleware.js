import supabase from "../config/supabaseConfig.js";
import { User } from "../models/User.model.js";
import { createError } from "../utils/errorUtils.js";
import { authCache } from "../utils/cacheUtils.js";

export const verifyToken = async (token) => {
  try {
    const cachedUser = authCache.get(token);
    if (cachedUser) {
      return cachedUser.data;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      throw error;
    }

    authCache.set(token, user);

    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw createError(401, "Authentication token missing");
    }

    const supabaseUser = await verifyToken(token);

    if (!supabaseUser) {
      throw createError(401, "Invalid or expired authentication token");
    }
    const user = await User.findOne(
      { supabaseId: supabaseUser.id },
      "-__v -createdAt -updatedAt"
    ).lean();
    if (!user) {
      throw createError(401, "User not found");
    }

    req.user = user;
    setAuthHeaders(res);
    next();
  } catch (error) {
    next(createError(401, error?.message || "Authentication failed"));
  }
};

const extractToken = (req) => {
  return req.cookies?.auth_token || req.headers?.authorization?.split(" ")[1];
};
const setAuthHeaders = (res) => {
  res.set({
    "Cache-Control": " private, no-cache, no-store, must-revalidate",
    Expires: " -1",
    Pragma: " no-cache",
  });
};
