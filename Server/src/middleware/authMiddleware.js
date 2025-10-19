import supabase from "../config/supabaseConfig.js";

export const verifyToken = async (token) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};
