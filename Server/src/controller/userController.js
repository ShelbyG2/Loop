import { User } from "../models/User.model.js";
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("username  profilePic lastSeen")
      .sort({ lastSeen: -1 });

    const formattedUsers = users.map((user) => ({
      ...user.toObject(),
      lastSeen: formatLastSeen(user.lastSeen),
    }));

    return res.status(200).json({
      users: formattedUsers,
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

const formatLastSeen = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Active";
  if (minutes < 5) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

export { getUsers };
