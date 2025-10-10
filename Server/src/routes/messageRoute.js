import express from "express";
import {
  createMsg,
  deleteMsg,
  getMsg,
  updateMsg,
} from "../controller/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/createmsg", authMiddleware, createMsg);
router.delete("/deletemsg/:messageId", authMiddleware, deleteMsg);
router.get("/getmsg:messageId", authMiddleware, getMsg);
router.put("/updatemsg/:messageId", authMiddleware, updateMsg);
export default router;
