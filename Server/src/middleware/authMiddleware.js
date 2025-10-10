import supabase from "../config/supabaseConfig.js";

import { User } from "../models/User.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      return next();
    }

    const mongoUser = await User.findOne({ supabaseId: supabaseUser.id });
    req.user = mongoUser;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Auth error", error: error.message });
  }
};
