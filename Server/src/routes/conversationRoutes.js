import express from "express";
import { errorHandler } from "../middleware/errorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createConvo,
  deleteConvo,
  getUserConvos,
  getConvoById,
  updateConvo,
} from "../controller/conversationController.js";
const router = express.Router();

router.post("/createConvo", errorHandler, authMiddleware, createConvo);

router.get("/userConversations", errorHandler, authMiddleware, getUserConvos);
router.put(
  "/conversations/updateConvo",
  errorHandler,
  authMiddleware,
  updateConvo
);
router.delete(
  "/conversations/deleteConvo",
  errorHandler,
  authMiddleware,
  deleteConvo
);

router.get("/:conversationId", errorHandler, authMiddleware, getConvoById);
export default router;
