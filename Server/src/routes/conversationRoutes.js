import express from "express";
import { errorHandler } from "../middleware/errorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createConvo,
  deleteConvo,
  getConvo,
  updateConvo,
} from "../controller/conversationController.js";
const router = express.Router();

router.post("/createConvo", errorHandler, authMiddleware, createConvo);
router.get("/getConvo", errorHandler, authMiddleware, getConvo);
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

export default router;
