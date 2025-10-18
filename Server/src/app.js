import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import conversatRoutes from "./routes/conversationRoutes.js";
import msgRoutes from "./routes/messageRoute.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import chalk from "chalk";
import { updateLastSeen } from "./middleware/updateLastSeenMiddleware.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { refreshTokenMiddleware } from "./middleware/refreshTokenMiddleWare.js";
import { Message } from "./models/Message.model.js";
import { Conversation } from "./models/Conversation.model.js";
import supabase from "./config/supabaseConfig.js";
import { User } from "./models/User.model.js";

dotenv.config();
connectDB();
const port = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

httpServer.listen(port, () => {
  console.log(`
    ${chalk.bold("╔════════════════════════════════════════╗")}
    ${chalk.bold.green("║       Welcome to Loop Server!          ║")}
    ${chalk.bold("╚════════════════════════════════════════╝")}
    ${chalk.italic.hex("#FFA500")("       Server is up and running!")}
    `);
});

app.use("/api/auth", authRoutes);
app.use(refreshTokenMiddleware);
app.use(authMiddleware);
app.use(updateLastSeen);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversatRoutes);
app.use("/api/messages", msgRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", async (messageData) => {
    try {
      // Save message to database
      const newMessage = new Message({
        sender: messageData.sender,
        receiver: messageData.receiver,
        content: messageData.content,
        conversation: messageData.conversationId,
      });

      const savedMessage = await newMessage.save();

      // Update conversation last message
      await Conversation.findByIdAndUpdate(messageData.conversationId, {
        lastMessage: savedMessage._id,
        updatedAt: new Date(),
      });

      // Emit message to both sender and receiver
      io.emit("messageReceived", savedMessage);

      // Emit conversation update
      io.emit("conversationUpdated", {
        conversationId: messageData.conversationId,
        lastMessage: savedMessage,
      });
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("messageError", { error: "Failed to save message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
