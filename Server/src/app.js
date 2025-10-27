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
import redis from "./config/redisConfig.js";
import chalk from "chalk";
import { updateLastSeen } from "./middleware/updateLastSeenMiddleware.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { refreshTokenMiddleware } from "./middleware/refreshTokenMiddleWare.js";
import socketService from "./services/Socket/index.socket.service.js";

dotenv.config();
connectDB();

const port = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
const httpServer = createServer(app);
socketService.initialize(httpServer);

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
