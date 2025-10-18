import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 20,
    },
    profilePic: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    supabaseId: {
      required: true,
      type: String,
    },
    isVerified: {
      required: true,
      type: Boolean,
    },
    lastSeen: {
      type: Date,

      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 });
userSchema.index({ supabaseId: 1 });
userSchema.index({ isVerified: 1 });

export const User = mongoose.model("User", userSchema);
