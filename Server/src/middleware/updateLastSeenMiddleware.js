import { User } from "../models/User.model.js";

export const updateLastSeen = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        lastSeen: new Date(),
      });
    }

    next();
  } catch (error) {
    console.error("Update last seen error:", error);
    next();
  }
};
