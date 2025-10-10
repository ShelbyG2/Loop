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
  socket.on("authenticate", async (token) => {
    try {
      const user = await verifyToken(token);
      socket.userId = user._id;
      socket.join(user._id.toString());
    } catch (error) {
      socket.disconnect();
    }
  });

  // Handle new message
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content } = data;
      const newMessage = await Message.create({
        sender: socket.userId,
        conversation: conversationId,
        content,
      });
      console.log(newMessage);

      const conversation = await Conversation.findById(conversationId);
      conversation.participants.forEach((participantId) => {
        io.to(participantId.toString()).emit("new_message", {
          message: newMessage,
          conversationId,
        });
      });
    } catch (error) {
      console.error("Message send error:", error);
    }
  });
});

export { io };
