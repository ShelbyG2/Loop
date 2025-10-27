import express from "express";
import { errorHandler } from "../middleware/errorHandler.js";

import {
  createConvo,
  deleteConvo,
  getUserConvos,
  getConvoById,
} from "../controller/conversationController.js";
const router = express.Router();

router.post("/createConvo", errorHandler, createConvo);

router.get("/userConversations", errorHandler, getUserConvos);

router.delete("/conversations/deleteConvo", errorHandler, deleteConvo);

router.get("/:conversationId", errorHandler, getConvoById);
export default router;
