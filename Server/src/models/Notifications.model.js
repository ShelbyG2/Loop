import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      typeof: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      typeof: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["NEW_MESSAGE", "FRIEND_REQUEST", "CONVERSATION_INVITE"],
      required: true,
    },
    messagePreview: {
      type: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
